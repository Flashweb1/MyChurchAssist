export interface Member {
  id: string;
  churchId: string;
  fullName: string;
  phone: string;
  email: string;
  branch: string;
  department: string;
  status: "Active" | "Inactive";
  dateOfBirth?: string;
  preferredChannel?: "email" | "sms" | "whatsapp";
  joinedAt?: string;
  tags?: string[];
  createdAt: Date;
  deletedAt?: Date | null;
}

export interface Newcomer {
  id: string;
  churchId: string;
  fullName: string;
  phone: string;
  email: string;
  visitDate: string;
  serviceAttended: string;
  invitedBy: string;
  bornAgain: boolean;
  wantsFollowUp: boolean;
  notes: string;
  status: "New" | "Followed Up" | "Member" | "Lost Contact";
  createdAt: Date;
  deletedAt?: Date | null;
}

export type AttendanceMode = "headcount" | "checkin" | "qrcode";

export interface AttendanceRecord {
  id: string;
  churchId: string;
  date: string;
  service: string;
  branch: string;
  mode: AttendanceMode;
  maleCount: number;
  femaleCount: number;
  childrenCount: number;
  firstTimersCount: number;
  checkedInMemberIds: string[];
  total: number;
  notes: string;
  createdAt: Date;
}

export interface FollowUpTask {
  id: string;
  churchId: string;
  personName: string;
  personPhone: string;
  type: "Newcomer Follow-Up" | "Prayer Request" | "Hospital Visit" | "Discipleship" | "General";
  assignedTo: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  notes: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  churchId: string;
  name: string;
  head: string;
  description: string;
  memberCount: number;
  status: "Active" | "Inactive";
  createdAt: Date;
  deletedAt?: Date | null;
}

export interface Message {
  id: string;
  churchId: string;
  title: string;
  content: string;
  type: "Announcement" | "Event" | "Prayer Request" | "General";
  audience: "Everyone" | "Members" | "Workers" | "Newcomers" | "Department";
  targetDepartment?: string;
  priority: "Low" | "Medium" | "High";
  status: "Draft" | "Sent";
  channels: ("email" | "sms" | "whatsapp")[];
  createdAt: Date;
}

export type TransactionCategory =
  | "Tithe" | "Offering" | "Donation" | "Miscellaneous Income"
  | "Utilities" | "Maintenance" | "Salary" | "Outreach" | "Miscellaneous Expense";

export type TransactionType = "Income" | "Expense";
export type PaymentMethod = "Cash" | "Bank Transfer" | "Mobile Money" | "Cheque";

export interface Transaction {
  id: string;
  churchId: string;
  date: string;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  amount: number;
  paymentMethod: PaymentMethod;
  recordedBy: string;
  notes: string;
  createdAt: Date;
  deletedAt?: Date | null;
}

export interface ChurchSettings {
  churchName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  branches: string[];
  serviceTimes: string[];
  country: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  timezone: string;
  birthdayTemplate?: string;
  preferredProviders?: {
    email?: "resend" | "smtp";
    sms?: "termii" | "twilio";
    whatsapp?: "twilio";
  };
}

export type UserRole = "super_admin" | "admin" | "editor" | "finance" | "viewer";

export interface UserProfile {
  uid: string;
  churchId: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  invitedBy: string | null;
  status: "active" | "invited" | "disabled";
  createdAt: Date;
}

/* ─── Wallet & Payments ─── */

export interface Wallet {
  churchId: string;
  balance: number;
  totalFunded: number;
  totalSpent: number;
  updatedAt: Date;
}

export type WalletTxType = "credit" | "debit" | "refund";
export type WalletTxStatus = "pending" | "success" | "failed";

export interface WalletTransaction {
  id: string;
  churchId: string;
  type: WalletTxType;
  status: WalletTxStatus;
  amount: number;
  description: string;
  reference: string;
  paystackRef?: string;
  createdAt: Date;
}

/* ─── Message Delivery ─── */

export type DeliveryChannel = "email" | "sms" | "whatsapp";
export type DeliveryStatus = "pending" | "sent" | "delivered" | "failed";

export interface MessageDelivery {
  id: string;
  churchId: string;
  messageId: string;
  channel: DeliveryChannel;
  recipientId: string;
  recipientName: string;
  recipientContact: string;
  status: DeliveryStatus;
  cost: number;
  error?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

/* ─── Birthday Automation ─── */

export interface BirthdayConfig {
  churchId: string;
  enabled: boolean;
  template: string;
  channel: DeliveryChannel;
  sendTime: string;
}
