export type Role = "employee" | "admin";

export type AttendanceStatus = "present" | "late" | "absent" | "leave" | "pending";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  title: string;
  timezone: string;
  headbacker?: string;
  status: "Active" | "Inactive";
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  hoursThisMonth: number;
  contact: string;
  schedule: string;
  color: string;
}

export interface ScheduleDay {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  clockIn: string | null;
  clockOut: string | null;
  lunchMinutes: number;
  breakMinutes: number;
}

export interface Schedule {
  id: string;
  userId: string;
  name: string;
  clientId: string;
  status: "active" | "pending" | "rejected" | "ended";
  createdAt: string;
  updatedAt: string;
  timezone: string;
  days: ScheduleDay[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // ISO yyyy-mm-dd
  clientId: string;
  clockIn: string | null;
  clockOut: string | null;
  lunchHours: number;
  breakHours: number;
  hoursWorked: number;
  overtimeHours: number;
  earlyInHours: number;
  status: AttendanceStatus;
}

export interface EodFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface EodReport {
  id: string;
  userId: string;
  clientId: string;
  scheduleId?: string;
  date: string;
  summary: string;
  highlights: string[];
  blockers: string[];
  attachments: number;
  files?: EodFile[];
  status: "submitted" | "reviewed" | "flagged";
}

export interface NotificationItem {
  id: string;
  type: "schedule" | "approval" | "system" | "mention" | "report";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface ActivityItem {
  id: string;
  kind: "clock-in" | "clock-out" | "break-start" | "break-end" | "schedule-change" | "eod-submitted" | "approval";
  text: string;
  at: string;
}

export interface ChangeLog {
  id: string;
  userId: string;
  field: string;
  from: string;
  to: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ScheduleApproval {
  id: string;
  userId: string;
  userName: string;
  email: string;
  scheduleName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface AttendanceSummary {
  id: string;
  range: string;
  userName: string;
  client: string;
  totalHours: number;
  totalOvertime: number;
  totalAbsences: number;
  unpaidLeave: number;
  paidLeave: number;
  checked: boolean;
  notes?: string;
  startDate?: string;
  endDate?: string;
}
