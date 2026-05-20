import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
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

export async function seedDemoData(adminName: string) {
  const batch = writeBatch(db);
  const currentUser = auth.currentUser;
  const churchId = currentUser?.uid || "demo-church";

  // 1. Church settings
  batch.set(doc(db, "settings", "church"), {
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
  if (currentUser) {
    batch.set(doc(db, "users", currentUser.uid), {
      uid: currentUser.uid,
      churchId,
      email: currentUser.email,
      displayName: adminName || "Demo Admin",
      role: "super_admin",
      invitedBy: null,
      status: "active",
      createdAt: serverTimestamp(),
    });
  }

  // 3. Wallet
  batch.set(doc(db, "wallets", churchId), {
    churchId,
    balance: 50000,
    totalFunded: 50000,
    totalSpent: 0,
    updatedAt: new Date(),
  });

  // 4. Members (35)
  const memberNames: string[] = [];
  for (let i = 0; i < 35; i++) {
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

  // 5. Newcomers (12)
  for (let i = 0; i < 12; i++) {
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

  // 6. Attendance (12 weeks × 3 branches = 36 records)
  for (let w = 0; w < 12; w++) {
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

  // 7. Follow-ups (10)
  for (let i = 0; i < 10; i++) {
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

  // 8. Departments (8)
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

  // 9. Messages (6)
  const contents = [
    "Join us this Sunday for a powerful message on faith and perseverance. Come expecting a breakthrough!",
    "We are excited to announce our annual community outreach program. Volunteers needed!",
    "Please keep the Smith family in your prayers as they go through a difficult time.",
    "Youth camp registration is now open. Early bird discount ends next week.",
    "Midweek Bible study resumes this Wednesday at 7 PM. New series on the Book of Romans.",
  ];
  const titles = ["Sunday Service Reminder", "Community Outreach", "Prayer Request", "Youth Camp Registration", "Bible Study Announcement", "Leadership Meeting"];
  for (let i = 0; i < 6; i++) {
    batch.set(doc(collection(db, "messages")), {
      churchId,
      title: pick(titles),
      content: pick(contents),
      type: pick(MESSAGE_TYPES),
      audience: pick(["Everyone", "Members", "Workers"]),
      priority: pick(MESSAGE_PRIORITIES),
      status: "Sent",
      channels: pick([["email"], ["email", "sms"], ["whatsapp"]]),
      createdAt: pastDate(rand(1, 60)),
    });
  }

  // 10. Transactions (40)
  const incomeDescs = ["Sunday Tithes & Offerings", "Online Donation", "Building Fund Contribution", "Thanksgiving Offering", "Missionary Support", "Harvest Offering", "Weekly Tithe", "Special Donation", "Church pledge payment"];
  const expenseDescs = ["Electricity Bill", "Water Bill", "Pastor's Salary", "Security Guard Salary", "Building Maintenance", "Sound System Repair", "Community Outreach Supplies", "Youth Event Refreshments", "Cleaning Supplies", "Transport Allowance", "Internet & Phone Bills", "Music Equipment Maintenance"];
  for (let i = 0; i < 40; i++) {
    const isIncome = Math.random() > 0.45;
    const d = pastDate(rand(0, 90));
    batch.set(doc(collection(db, "transactions")), {
      churchId,
      date: dateStr(d),
      description: isIncome ? pick(incomeDescs) : pick(expenseDescs),
      category: isIncome ? pick(INCOME_CATEGORIES) : pick(EXPENSE_CATEGORIES),
      type: isIncome ? "Income" : "Expense",
      amount: isIncome ? rand(50, 5000) : rand(20, 2000),
      paymentMethod: pick(PAYMENT_METHODS),
      recordedBy: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      notes: "",
      createdAt: d,
    });
  }

  await batch.commit();
}
