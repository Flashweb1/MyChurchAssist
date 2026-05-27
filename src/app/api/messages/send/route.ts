import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { messageId, churchId, channels } = await req.json();
    const db = getAdminDb();

    // Get message
    const msgDoc = await db.collection("messages").doc(messageId).get();
    if (!msgDoc.exists) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    const message = msgDoc.data()!;

    // Get wallet
    const walletDoc = await db.collection("wallets").doc(churchId).get();
    const wallet = walletDoc.exists ? walletDoc.data()! : null;

    // Get members based on audience
    let membersQuery = db.collection("members").where("churchId", "==", churchId);
    const audience = message.audience || "Everyone";

    if (audience === "Members") {
      membersQuery = membersQuery.where("status", "==", "Active");
    } else if (audience === "Workers") {
      membersQuery = membersQuery.where("department", "!=", "None").where("status", "==", "Active");
    } else if (audience === "Department" && message.targetDepartment) {
      membersQuery = membersQuery.where("department", "==", message.targetDepartment);
    }

    const membersSnap = await membersQuery.limit(500).get();
    const members = membersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (members.length === 0) {
      return NextResponse.json({ error: "No recipients match the audience" }, { status: 400 });
    }

    // Estimate costs
    const channelCosts: Record<string, number> = {
      email: 0,        // Resend free tier
      sms: 2.5,        // ₦2.5 per SMS
      whatsapp: 5,     // ₦5 per WhatsApp
    };

    let totalCost = 0;
    for (const ch of channels) {
      totalCost += (channelCosts[ch] || 0) * members.length;
    }

    // Check wallet balance
    if (!wallet || wallet.balance < totalCost) {
      return NextResponse.json({
        error: "Insufficient wallet balance",
        required: totalCost,
        balance: wallet?.balance || 0,
      }, { status: 402 });
    }

    // Process deliveries
    const deliveries: { member: any; channel: string; success: boolean; error?: string }[] = [];
    let sentCount = 0;
    let failedCount = 0;

    let actualCost = 0;

    for (const member of members as any[]) {
      for (const channel of channels) {
        const result = await sendViaChannel(channel, member, message);
        deliveries.push({ member, channel, ...result });

        const cost = result.success ? (channelCosts[channel] || 0) : 0;
        if (result.success) {
          actualCost += cost;
          sentCount++;
        } else {
          failedCount++;
        }

        // Record delivery
        await db.collection("message_deliveries").add({
          churchId,
          messageId,
          channel,
          recipientId: member.id,
          recipientName: member.fullName,
          recipientContact: channel === "email" ? member.email : member.phone,
          status: result.success ? "sent" : "failed",
          cost: cost,
          error: result.error || null,
          sentAt: result.success ? new Date() : null,
          createdAt: new Date(),
        });
      }
    }

    // Deduct total actual cost from wallet in a single operation to avoid contention/throttling
    if (actualCost > 0) {
      await db.collection("wallets").doc(churchId).update({
        balance: adminFieldValue.increment(-actualCost),
        totalSpent: adminFieldValue.increment(actualCost),
        updatedAt: new Date(),
      });

      // Record transaction
      await db.collection("wallet_transactions").add({
        churchId,
        type: "debit",
        status: "success",
        amount: actualCost,
        description: `Campaign: ${sentCount} sent, ${failedCount} failed`,
        reference: `campaign_${messageId}_${Date.now()}`,
        createdAt: new Date(),
      });
    }

    // Update message status
    await db.collection("messages").doc(messageId).update({
      status: "Sent",
      sentAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      totalCost: actualCost,
    });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

async function sendViaChannel(channel: string, member: any, message: any) {
  switch (channel) {
    case "email": {
      if (!member.email) return { success: false, error: "No email" };
      const result = await sendEmail({
        to: member.email,
        subject: message.title,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2>${message.title}</h2>
          <p>${message.content}</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0" />
          <p style="color:#64748b;font-size:12px">Sent via Church Assist</p>
        </div>`,
      });
      return result;
    }
    case "sms": {
      if (!member.phone) return { success: false, error: "No phone" };
      return await sendSms({ to: member.phone, message: message.content });
    }
    case "whatsapp": {
      if (!member.phone) return { success: false, error: "No phone" };
      return await sendWhatsApp({ to: member.phone, message: message.content });
    }
    default:
      return { success: false, error: `Unknown channel: ${channel}` };
  }
}

import { FieldValue as adminFieldValue } from "firebase-admin/firestore";
