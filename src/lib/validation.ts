import { z } from "zod";

/* ─── Common Schemas ─── */

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const idSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

/* ─── Member Schemas ─── */

export const memberSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().min(5, "Valid phone number required").max(20),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  branch: z.string().optional().default(""),
  department: z.string().optional().default(""),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  dateOfBirth: z.string().optional(),
  preferredChannel: z.enum(["email", "sms", "whatsapp"]).optional(),
});

export const memberUpdateSchema = memberSchema.partial();

export const memberIdSchema = idSchema;

/* ─── Newcomer Schemas ─── */

export const newcomerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().min(5, "Valid phone number required").max(20),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  visitDate: z.string().min(1, "Visit date is required"),
  serviceAttended: z.string().optional().default(""),
  invitedBy: z.string().optional().default(""),
  bornAgain: z.boolean().default(false),
  wantsFollowUp: z.boolean().default(false),
  notes: z.string().optional().default(""),
  status: z.enum(["New", "Followed Up", "Member", "Lost Contact"]).default("New"),
});

export const newcomerUpdateSchema = newcomerSchema.partial();

/* ─── Attendance Schemas ─── */

export const attendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  service: z.string().min(1, "Service is required"),
  branch: z.string().optional().default(""),
  mode: z.enum(["headcount", "checkin", "qrcode"]).default("headcount"),
  maleCount: z.coerce.number().int().min(0).default(0),
  femaleCount: z.coerce.number().int().min(0).default(0),
  childrenCount: z.coerce.number().int().min(0).default(0),
  firstTimersCount: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional().default(""),
});

export const attendanceUpdateSchema = attendanceSchema.partial();

/* ─── Follow-up Schemas ─── */

export const followUpSchema = z.object({
  personName: z.string().min(2, "Person name is required").max(100),
  personPhone: z.string().min(5, "Valid phone number required").max(20),
  type: z.enum(["Newcomer Follow-Up", "Prayer Request", "Hospital Visit", "Discipleship", "General"]),
  assignedTo: z.string().min(1, "Assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["Pending", "In Progress", "Completed", "Overdue"]).default("Pending"),
  notes: z.string().optional().default(""),
});

export const followUpUpdateSchema = followUpSchema.partial();

/* ─── Department Schemas ─── */

export const departmentSchema = z.object({
  name: z.string().min(2, "Department name is required").max(100),
  head: z.string().optional().default(""),
  description: z.string().optional().default(""),
  memberCount: z.coerce.number().int().min(0).default(0),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export const departmentUpdateSchema = departmentSchema.partial();

/* ─── Transaction Schemas ─── */

export const transactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(2, "Description is required").max(200),
  category: z.enum([
    "Tithe", "Offering", "Donation", "Miscellaneous Income",
    "Utilities", "Maintenance", "Salary", "Outreach", "Miscellaneous Expense"
  ]),
  type: z.enum(["Income", "Expense"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "Mobile Money", "Cheque"]),
  notes: z.string().optional().default(""),
});

export const transactionUpdateSchema = transactionSchema.partial();

/* ─── Message Schemas ─── */

export const messageSchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  content: z.string().min(10, "Message content is required").max(5000),
  type: z.enum(["Announcement", "Event", "Prayer Request", "General"]),
  audience: z.enum(["Everyone", "Members", "Workers", "Newcomers", "Department"]),
  targetDepartment: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  channels: z.array(z.enum(["email", "sms", "whatsapp"])).min(1, "At least one channel is required"),
});

export const messageUpdateSchema = messageSchema.partial();

/* ─── AI Chat Schemas ─── */

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message content is required"),
});

export const aiChatSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(4000),
  messages: z.array(chatMessageSchema).optional().default([]),
});

/* ─── Settings Schemas ─── */

export const settingsSchema = z.object({
  churchName: z.string().min(2, "Church name is required").max(100),
  address: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  website: z.string().url("Valid URL required").optional().or(z.literal("")),
  branches: z.array(z.string()).default([]),
  serviceTimes: z.array(z.string()).default([]),
  country: z.string().optional().default(""),
  currency: z.string().optional().default("USD"),
  currencySymbol: z.string().optional().default("$"),
  locale: z.string().optional().default("en"),
  timezone: z.string().optional().default("UTC"),
  birthdayTemplate: z.string().optional(),
});

/* ─── User Schemas ─── */

export const inviteUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["super_admin", "admin", "editor", "finance", "viewer"]),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(["super_admin", "admin", "editor", "finance", "viewer"]).optional(),
  status: z.enum(["active", "invited", "disabled"]).optional(),
});

/* ─── Helper to validate and return errors ─── */

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { 
      success: false, 
      error: firstError ? `${firstError.path.join(".")}: ${firstError.message}` : "Invalid request data" 
    };
  }
  
  return { success: true, data: result.data };
}