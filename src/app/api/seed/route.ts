import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const BRANCHES = ["Main Campus", "North Campus", "South Campus"];
const DEPARTMENTS = ["Choir", "Media & Tech", "Ushering", "Children's Ministry", "Youth", "Prayer Team", "Women's Fellowship", "Men's Fellowship"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

function pastDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function dateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Christopher", "Karen", "Daniel", "Lisa", "Matthew", "Nancy",
  "Anthony", "Betty", "Mark", "Margaret", "Donald", "Sandra", "Steven", "Ashley",
  "Paul", "Kimberly", "Andrew", "Emily", "Joshua", "Donna", "Kenneth", "Michelle",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
];

const SERVICES = ["Sunday Morning", "Sunday Evening", "Wednesday Bible Study", "Friday Prayer"];
const TASK_TYPES: ["Newcomer Follow-Up", "Prayer Request", "Hospital Visit", "Discipleship", "General"] = [
  "Newcomer Follow-Up", "Prayer Request", "Hospital Visit", "Discipleship", "General",
];
const TASK_STATUSES: ("Pending" | "In Progress" | "Completed" | "Overdue")[] = [
  "Pending", "In Progress", "Completed", "Overdue",
];
const NEWCOMER_STATUSES: ("New" | "Followed Up" | "Member" | "Lost Contact")[] = [
  "New", "Followed Up", "Member", "Lost Contact",
];
const MESSAGE_TYPES: ("Announcement" | "Event" | "Prayer Request" | "General")[] = [
  "Announcement", "Event", "Prayer Request", "General",
];
const MESSAGE_PRIORITIES: ("Low" | "Medium" | "High")[] = ["Low", "Medium", "High"];
const INCOME_CATEGORIES: ("Tithe" | "Offering" | "Donation" | "Miscellaneous Income")[] = [
  "Tithe", "Offering", "Donation", "Miscellaneous Income",
];
const EXPENSE_CATEGORIES: ("Utilities" | "Maintenance" | "Salary" | "Outreach" | "Miscellaneous Expense")[] = [
  "Utilities", "Maintenance", "Salary", "Outreach", "Miscellaneous Expense",
];
const PAYMENT_METHODS: ("Cash" | "Bank Transfer" | "Mobile Money" | "Cheque")[] = [
  "Cash", "Bank Transfer", "Mobile Money", "Cheque",
];

function generateMembers(count: number) {
  const members: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const created = pastDate(rand(1, 365));
    members.push({
      fullName: `${firstName} ${lastName}`,
      phone: `+233${rand(20, 55)}${rand(1000000, 9999999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rand(1, 99)}@email.com`,
      branch: pick(BRANCHES),
      department: Math.random() > 0.3 ? pick(DEPARTMENTS) : "None",
      status: Math.random() > 0.2 ? "Active" : "Inactive",
      createdAt: created,
    });
  }
  return members;
}

function generateNewcomers(count: number) {
  const newcomers: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const visit = pastDate(rand(1, 90));
    newcomers.push({
      fullName: `${firstName} ${lastName}`,
      phone: `+233${rand(20, 55)}${rand(1000000, 9999999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rand(1, 99)}@email.com`,
      visitDate: dateStr(visit),
      serviceAttended: pick(SERVICES),
      invitedBy: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      bornAgain: Math.random() > 0.3,
      wantsFollowUp: Math.random() > 0.2,
      notes: ["Welcomed warmly", "Sat near front", "Came with family", "Interested in youth group", ""][rand(0, 4)],
      status: pick(NEWCOMER_STATUSES),
      createdAt: visit,
    });
  }
  return newcomers;
}

function generateAttendance(weeks: number) {
  const records: Record<string, unknown>[] = [];
  for (let w = 0; w < weeks; w++) {
    for (const branch of BRANCHES) {
      const d = pastDate(w * 7 + rand(0, 2));
      const male = rand(20, 60);
      const female = rand(20, 55);
      const children = rand(5, 20);
      const firstTimers = rand(0, 5);
      records.push({
        date: dateStr(d),
        service: pick(SERVICES),
        branch,
        mode: "headcount",
        maleCount: male,
        femaleCount: female,
        childrenCount: children,
        firstTimersCount: firstTimers,
        checkedInMemberIds: [],
        total: male + female + children + firstTimers,
        notes: "",
        createdAt: d,
      });
    }
  }
  return records;
}

function generateFollowUps(count: number, memberNames: string[]) {
  const tasks: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const due = pastDate(rand(-10, 30));
    tasks.push({
      personName: pick(memberNames) || `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      personPhone: `+233${rand(20, 55)}${rand(1000000, 9999999)}`,
      type: pick(TASK_TYPES),
      assignedTo: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      dueDate: dateStr(due),
      status: pick(TASK_STATUSES),
      notes: ["Follow up call needed", "Visit in hospital", "Prayer request received", "Discipleship session", ""][rand(0, 4)],
      createdAt: pastDate(rand(1, 60)),
    });
  }
  return tasks;
}

function generateDepartments() {
  const deptData = [
    { name: "Choir", desc: "Leads worship through music and vocals during services and special events." },
    { name: "Media & Tech", desc: "Manages audio, visual, and livestream equipment for all services." },
    { name: "Ushering", desc: "Welcomes attendees, manages seating, and collects offerings." },
    { name: "Children's Ministry", desc: "Nurtures and teaches children aged 2-12 during Sunday services." },
    { name: "Youth", desc: "Engages teenagers (13-19) with Bible study, fellowship, and activities." },
    { name: "Prayer Team", desc: "Intercedes for the church, prays for requests, and holds prayer meetings." },
    { name: "Women's Fellowship", desc: "Disciples and supports women through fellowship and mentorship." },
    { name: "Men's Fellowship", desc: "Builds godly men through accountability groups and outreach." },
  ];
  return deptData.map((d) => ({
    name: d.name,
    head: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    description: d.desc,
    memberCount: rand(8, 35),
    status: "Active" as const,
    createdAt: pastDate(rand(30, 365)),
  }));
}

function generateMessages(count: number) {
  const msgs: Record<string, unknown>[] = [];
  const contents = [
    "Join us this Sunday for a powerful message on faith and perseverance. Come expecting a breakthrough!",
    "We are excited to announce our annual community outreach program. Volunteers needed!",
    "Please keep the Smith family in your prayers as they go through a difficult time.",
    "Youth camp registration is now open. Early bird discount ends next week.",
    "Midweek Bible study resumes this Wednesday at 7 PM. New series on the Book of Romans.",
  ];
  for (let i = 0; i < count; i++) {
    msgs.push({
      title: pick(["Sunday Service Reminder", "Community Outreach", "Prayer Request", "Youth Camp Registration", "Bible Study Announcement", "Leadership Meeting", "Thanksgiving Service"]),
      content: pick(contents),
      type: pick(MESSAGE_TYPES),
      audience: pick(["Everyone", "Members", "Workers"]),
      priority: pick(MESSAGE_PRIORITIES),
      status: "Sent",
      createdAt: pastDate(rand(1, 60)),
    });
  }
  return msgs;
}

function generateTransactions(count: number) {
  const txs: Record<string, unknown>[] = [];
  const incomeDescriptions = [
    "Sunday Tithes & Offerings", "Online Donation", "Building Fund Contribution",
    "Thanksgiving Offering", "Missionary Support", "Harvest Offering",
    "Weekly Tithe", "Special Donation", "Church pledge payment",
  ];
  const expenseDescriptions = [
    "Electricity Bill", "Water Bill", "Pastor's Salary", "Security Guard Salary",
    "Building Maintenance", "Sound System Repair", "Community Outreach Supplies",
    "Youth Event Refreshments", "Cleaning Supplies", "Transport Allowance",
    "Internet & Phone Bills", "Music Equipment Maintenance",
  ];
  for (let i = 0; i < count; i++) {
    const isIncome = Math.random() > 0.45;
    const d = pastDate(rand(0, 90));
    txs.push({
      date: dateStr(d),
      description: isIncome ? pick(incomeDescriptions) : pick(expenseDescriptions),
      category: isIncome ? pick(INCOME_CATEGORIES) : pick(EXPENSE_CATEGORIES),
      type: isIncome ? "Income" : "Expense",
      amount: isIncome ? rand(50, 5000) : rand(20, 2000),
      paymentMethod: pick(PAYMENT_METHODS),
      recordedBy: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      notes: "",
      createdAt: d,
    });
  }
  return txs;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    initAdmin();
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const db = getFirestore();

    // Fetch the user to check role and get churchId
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userData = userDoc.data()!;
    if (userData.role !== "super_admin") {
      return NextResponse.json({ error: "Only Super Admin can seed data" }, { status: 403 });
    }
    const churchId = userData.churchId || uid;

    const batch = db.batch();

    // Clear existing data only for this churchId
    const collections = ["members", "newcomers", "attendance", "followups", "departments", "messages", "transactions"];
    for (const col of collections) {
      const snap = await db.collection(col).where("churchId", "==", churchId).get();
      snap.forEach((doc) => batch.delete(doc.ref));
    }
    await batch.commit();

    // Seed with demo data scoped to churchId
    const seedBatch = db.batch();
    const memberNames: string[] = [];
    const members = generateMembers(35);
    for (const m of members) {
      const ref = db.collection("members").doc();
      seedBatch.set(ref, { ...m, churchId });
      memberNames.push(m.fullName as string);
    }

    const newcomers = generateNewcomers(12);
    for (const n of newcomers) {
      seedBatch.set(db.collection("newcomers").doc(), { ...n, churchId });
    }

    const attendance = generateAttendance(12);
    for (const a of attendance) {
      seedBatch.set(db.collection("attendance").doc(), { ...a, churchId });
    }

    const followUps = generateFollowUps(10, memberNames);
    for (const f of followUps) {
      seedBatch.set(db.collection("followups").doc(), { ...f, churchId });
    }

    const departments = generateDepartments();
    for (const d of departments) {
      seedBatch.set(db.collection("departments").doc(), { ...d, churchId });
    }

    const messages = generateMessages(6);
    for (const m of messages) {
      seedBatch.set(db.collection("messages").doc(), { ...m, churchId });
    }

    const transactions = generateTransactions(40);
    for (const t of transactions) {
      seedBatch.set(db.collection("transactions").doc(), { ...t, churchId });
    }

    await seedBatch.commit();

    return NextResponse.json({
      success: true,
      counts: {
        members: members.length,
        newcomers: newcomers.length,
        attendance: attendance.length,
        followUps: followUps.length,
        departments: departments.length,
        messages: messages.length,
        transactions: transactions.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
