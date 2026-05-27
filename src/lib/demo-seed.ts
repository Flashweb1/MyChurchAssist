import { collection, doc, writeBatch, serverTimestamp, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";

const BRANCHES = ["Main Campus", "North Campus", "South Campus"];
const DEPARTMENTS = ["Choir", "Media & Tech", "Ushering", "Children's Ministry", "Youth", "Prayer Team", "Women's Fellowship", "Men's Fellowship"];
const SERVICES = ["Sunday Morning", "Sunday Evening", "Wednesday Bible Study", "Friday Prayer"];
const INCOME_CATEGORIES = ["Tithe", "Offering", "Donation", "Miscellaneous Income"];
const EXPENSE_CATEGORIES = ["Utilities", "Maintenance", "Salary", "Outreach", "Miscellaneous Expense"];
const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Mobile Money", "Cheque"];
const TASK_TYPES = ["Newcomer Follow-Up", "Prayer Request", "Hospital Visit", "Discipleship", "General"];
const TASK_STATUSES = ["Pending", "In Progress", "Completed", "Overdue"];
const NEWCOMER_STATUSES = ["New", "Followed Up", "Member", "Lost Contact"];
const MESSAGE_TYPES = ["Announcement", "Event", "Prayer Request", "General"];
const MESSAGE_PRIORITIES = ["Low", "Medium", "High"];
const FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen", "Daniel", "Lisa", "Matthew", "Nancy", "Anthony", "Betty", "Mark", "Margaret", "Donald", "Sandra", "Steven", "Ashley", "Paul", "Kimberly", "Andrew", "Emily", "Joshua", "Donna", "Kenneth", "Michelle"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];

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

export async function seedDemoData(adminName: string, userId?: string, userEmail?: string, userDisplayName?: string) {
  const currentUser = auth.currentUser;
  const churchId = userId || currentUser?.uid;
  const email = userEmail || currentUser?.email || "demo@churchassist.app";
  const displayName = userDisplayName || currentUser?.displayName || adminName || "Demo Admin";

  if (!churchId) {
    throw new Error("Demo seed requires an authenticated user or provided user ID.");
  }

  // IDEMPOTENCY CHECK: if settings already exist, skip seeding
  try {
    const existingSettings = await getDoc(doc(db, "settings", churchId));
    if (existingSettings.exists() && existingSettings.data()?.churchName) {
      console.log("Demo data already seeded for", churchId, ". Skipping.");
      return;
    }
  } catch (err) {
    console.warn("Failed to check existing demo settings for idempotency:", err);
  }

  let batch = writeBatch(db);

  // 1. Church settings
  batch.set(doc(db, "settings", churchId), {
    churchName: "Grace Community Church",
    address: "123 Faith Avenue, Lagos",
    phone: "+234 1 277 1234",
    email: "info@gracechurch.ng",
    website: "https://gracechurch.ng",
    branches: BRANCHES,
    serviceTimes: ["Sunday 8:00 AM", "Sunday 10:30 AM", "Wednesday 6:30 PM"],
    country: "NG",
    currency: "NGN",
    currencySymbol: "₦",
    locale: "en-NG",
    timezone: "Africa/Lagos",
    birthdayTemplate: "Happy birthday {name}! May God bless you abundantly on your special day and throughout the year.",
    createdAt: serverTimestamp(),
  });

  // 2. Admin user profile
  batch.set(doc(db, "users", churchId), {
    uid: churchId,
    churchId,
    email,
    displayName,
    role: "super_admin",
    invitedBy: null,
    status: "active",
    createdAt: serverTimestamp(),
  });

  // Commit settings and users profile first. This ensures the user profile document is
  // committed and exists in Firestore so that subsequent writes to secure collections
  // (which evaluate security rules depending on users/{uid} document) pass rules check.
  await batch.commit();

  // Initialize a new batch for the remaining collections
  batch = writeBatch(db);

  // 3. Wallet
  batch.set(doc(db, "wallets", churchId), {
    churchId,
    balance: 50000,
    totalFunded: 50000,
    totalSpent: 0,
    updatedAt: serverTimestamp(),
  });

  // 4. Wallet transactions
  const walletTxSamples = [
    {
      type: "credit",
      status: "success",
      amount: 50000,
      description: "Initial wallet funding",
      reference: `DEMO_INIT_${rand(1000, 9999)}`,
      churchId,
      createdAt: pastDate(rand(0, 3)),
    },
    {
      type: "debit",
      status: "success",
      amount: 7200,
      description: "SMS credit purchase",
      reference: `DEMO_SMS_${rand(1000, 9999)}`,
      churchId,
      createdAt: pastDate(rand(0, 3)),
    },
  ];

  for (const tx of walletTxSamples) {
    batch.set(doc(collection(db, "wallet_transactions")), {
      ...tx,
      paystackRef: `DEMO-${rand(100000, 999999)}`,
    });
  }

  // 4. Members (5) - reduced for faster seeding
  const memberNames: string[] = [];
  for (let i = 0; i < 5; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    const name = `${fn} ${ln}`;
    memberNames.push(name);
    const birthMonth = rand(1, 12);
    const birthDay = rand(1, 28);
    batch.set(doc(collection(db, "members")), {
      churchId,
      fullName: name,
      phone: `+234${rand(70, 90)}${rand(1000000, 9999999)}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${rand(1, 99)}@email.com`,
      branch: pick(BRANCHES),
      department: Math.random() > 0.3 ? pick(DEPARTMENTS) : "None",
      status: Math.random() > 0.2 ? "Active" : "Inactive",
      dateOfBirth: `${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`,
      preferredChannel: pick(["email", "sms", "whatsapp"]) as "email" | "sms" | "whatsapp",
      createdAt: pastDate(rand(1, 365)),
    });
  }

  // 5. Newcomers (3) - reduced for faster seeding
  for (let i = 0; i < 3; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    const visit = pastDate(rand(1, 90));
    batch.set(doc(collection(db, "newcomers")), {
      churchId,
      fullName: `${fn} ${ln}`,
      phone: `+234${rand(70, 90)}${rand(1000000, 9999999)}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${rand(1, 99)}@email.com`,
      visitDate: dateStr(visit),
      serviceAttended: pick(SERVICES),
      invitedBy: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      bornAgain: Math.random() > 0.3,
      wantsFollowUp: Math.random() > 0.2,
      notes: pick(["Welcomed warmly", "Sat near front", "Came with family", "Interested in youth group", ""]),
      status: pick(NEWCOMER_STATUSES),
      createdAt: visit,
    });
  }

  // 6. Attendance (2 weeks × 3 branches = 6 records) - reduced for faster seeding
  for (let w = 0; w < 2; w++) {
    for (const branch of BRANCHES) {
      const d = pastDate(w * 7 + rand(0, 2));
      const male = rand(20, 60);
      const female = rand(20, 55);
      const children = rand(5, 20);
      const firstTimers = rand(0, 5);
      batch.set(doc(collection(db, "attendance")), {
        churchId,
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

  // 7. Follow-ups (4) - reduced for faster seeding
  for (let i = 0; i < 4; i++) {
    const due = pastDate(rand(-10, 30));
    batch.set(doc(collection(db, "followups")), {
      churchId,
      personName: pick(memberNames) || `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      personPhone: `+233${rand(20, 55)}${rand(1000000, 9999999)}`,
      type: pick(TASK_TYPES),
      assignedTo: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      dueDate: dateStr(due),
      status: pick(TASK_STATUSES),
      notes: pick(["Follow up call needed", "Visit in hospital", "Prayer request received", "Discipleship session", ""]),
      createdAt: pastDate(rand(1, 60)),
    });
  }

  // 8. Departments (4) - reduced for faster seeding
  const deptData = [
    { name: "Choir", desc: "Leads worship through music and vocals during services and special events." },
    { name: "Media & Tech", desc: "Manages audio, visual, and livestream equipment for all services." },
    { name: "Ushering", desc: "Welcomes attendees, manages seating, and collects offerings." },
    { name: "Children's Ministry", desc: "Nurtures and teaches children aged 2-12 during Sunday services." },
  ];
  for (const d of deptData) {
    batch.set(doc(collection(db, "departments")), {
      churchId,
      name: d.name,
      head: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      description: d.desc,
      memberCount: rand(8, 35),
      status: "Active",
      createdAt: pastDate(rand(30, 365)),
    });
  }

  // 9. Messages - SKIPPED (requires Firestore composite index)
  // Messages will be added once indexes are created in Firestore console

  // 10. Transactions - SKIPPED (requires Firestore composite index)
  // Transactions will be added once indexes are created in Firestore console

  await batch.commit();
}
