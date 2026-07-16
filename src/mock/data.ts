import type {
  ActivityItem,
  AttendanceRecord,
  AttendanceSummary,
  ChangeLog,
  Client,
  EodReport,
  NotificationItem,
  Schedule,
  ScheduleApproval,
  User,
} from "./types";

export const currentUser: User = {
  id: "u_1",
  name: "Nemrod Baquiran",
  email: "nemrod.baquiran@cyberbacker.com",
  role: "admin",
  appRole: "software",
  title: "Senior Cyberbacker",
  timezone: "America/Denver",
  status: "Active",
};

export const users: User[] = [
  currentUser,
  { id: "u_2", name: "Justine Robles", email: "justine.robles@cyberbacker.com", role: "employee", appRole: "cyberbacker", title: "Cyberbacker", timezone: "Asia/Manila", headbacker: "Nemrod Baquiran", status: "Active" },
  { id: "u_3", name: "Jojo Constantino", email: "jojo.constantino@cyberbacker.com", role: "employee", appRole: "cyberbacker", title: "Cyberbacker", timezone: "Asia/Manila", headbacker: "Nemrod Baquiran", status: "Active" },
  { id: "u_4", name: "Lea Luisa Santiago", email: "lea.santiago@cyberbacker.com", role: "admin", appRole: "hb", title: "Headbacker", timezone: "Asia/Manila", headbacker: "Nemrod Baquiran", status: "Active" },
  { id: "u_5", name: "Leandre John Sabado", email: "leandre.sabado@cyberbacker.com", role: "admin", appRole: "mb", title: "Moneybacker", timezone: "Asia/Manila", headbacker: "Nemrod Baquiran", status: "Active" },
];

export const clients: Client[] = [
  { id: "c_1", name: "Northwind Realty", industry: "Real Estate", hoursThisMonth: 142, contact: "Sarah Liu", schedule: "Mon–Fri · 9a–5p MST", color: "oklch(0.65 0.13 255)" },
  { id: "c_2", name: "Moneybacker Capital", industry: "Finance", hoursThisMonth: 88, contact: "Marcus Vega", schedule: "Mon–Thu · 7a–4p MST", color: "oklch(0.62 0.14 155)" },
  { id: "c_3", name: "Bluepeak Health", industry: "Healthcare", hoursThisMonth: 64, contact: "Priya Nair", schedule: "Tue–Sat · 10a–6p MST", color: "oklch(0.74 0.15 70)" },
];

const day = (d: number) => {
  const today = new Date();
  today.setDate(today.getDate() - d);
  return today.toISOString().slice(0, 10);
};

const seedUserIds = ["u_1", "u_2", "u_3", "u_4"];
export const attendance: AttendanceRecord[] = seedUserIds.flatMap((uid) =>
  Array.from({ length: 20 }, (_, i) => {
    const status = i === 0 ? "pending" : i % 11 === 0 ? "late" : i % 13 === 0 ? "absent" : "present";
    const worked = status === "absent" ? 0 : 7.5 + (i % 3) * 0.5;
    const overtime = i % 5 === 0 ? 1.25 : i % 7 === 0 ? 0.75 : 0;
    const approvalStatus: "pending" | "approved" | "rejected" =
      i < 3 ? "pending" : i % 9 === 0 ? "rejected" : "approved";
    return {
      id: `a_${uid}_${i}`,
      userId: uid,
      date: day(i),
      clientId: clients[i % clients.length].id,
      clockIn: status === "absent" ? null : "09:0" + (i % 6) + " AM",
      clockOut: status === "absent" ? null : "05:1" + (i % 6) + " PM",
      lunchHours: status === "absent" ? 0 : 1,
      breakHours: status === "absent" ? 0 : 0.25,
      hoursWorked: worked,
      overtimeHours: overtime,
      earlyInHours: i % 5 === 0 ? 0.25 : 0,
      status,
      approvalStatus,
    };
  }),
);

export const schedules: Schedule[] = [
  {
    id: "s_1",
    userId: "u_1",
    name: "Northwind Realty · Primary",
    clientId: "c_1",
    status: "active",
    createdAt: day(40),
    updatedAt: day(2),
    timezone: "MST",
    days: [
      { day: "Mon", clockIn: "09:00", clockOut: "17:00", lunchMinutes: 60, breakMinutes: 15 },
      { day: "Tue", clockIn: "09:00", clockOut: "17:00", lunchMinutes: 60, breakMinutes: 15 },
      { day: "Wed", clockIn: "09:00", clockOut: "17:00", lunchMinutes: 60, breakMinutes: 15 },
      { day: "Thu", clockIn: "09:00", clockOut: "17:00", lunchMinutes: 60, breakMinutes: 15 },
      { day: "Fri", clockIn: "09:00", clockOut: "16:00", lunchMinutes: 45, breakMinutes: 15 },
      { day: "Sat", clockIn: null, clockOut: null, lunchMinutes: 0, breakMinutes: 0 },
      { day: "Sun", clockIn: null, clockOut: null, lunchMinutes: 0, breakMinutes: 0 },
    ],
  },
  {
    id: "s_2",
    userId: "u_1",
    name: "Moneybacker Capital · Secondary",
    clientId: "c_2",
    status: "pending",
    createdAt: day(3),
    updatedAt: day(1),
    timezone: "MST",
    days: [
      { day: "Mon", clockIn: "07:00", clockOut: "11:00", lunchMinutes: 0, breakMinutes: 0 },
      { day: "Tue", clockIn: "07:00", clockOut: "11:00", lunchMinutes: 0, breakMinutes: 0 },
      { day: "Wed", clockIn: "07:00", clockOut: "11:00", lunchMinutes: 0, breakMinutes: 0 },
      { day: "Thu", clockIn: "07:00", clockOut: "11:00", lunchMinutes: 0, breakMinutes: 0 },
      { day: "Fri", clockIn: null, clockOut: null, lunchMinutes: 0, breakMinutes: 0 },
      { day: "Sat", clockIn: null, clockOut: null, lunchMinutes: 0, breakMinutes: 0 },
      { day: "Sun", clockIn: null, clockOut: null, lunchMinutes: 0, breakMinutes: 0 },
    ],
  },
];

export const eodReports: EodReport[] = Array.from({ length: 8 }, (_, i) => ({
  id: `e_${i}`,
  userId: "u_1",
  clientId: clients[i % clients.length].id,
  date: day(i),
  summary:
    "Wrapped up the CRM cleanup, scheduled 12 buyer follow-ups, and pushed the weekly marketing report to the team channel.",
  highlights: ["Closed 4 lead intake forms", "Drafted next week's email sequence", "Resolved 2 client tickets"],
  blockers: i % 3 === 0 ? ["Waiting on copy approval"] : [],
  attachments: i % 2,
  attachmentUrls: i === 1
    ? [{ name: "weekly-report.pdf", url: "https://cbstorage.blob.core.windows.net/eod/weekly-report.pdf", type: "application/pdf", size: 245000 }]
    : undefined,
  status: i === 0 ? "submitted" : i % 4 === 0 ? "flagged" : "reviewed",
}));

export const notifications: NotificationItem[] = [
  { id: "n_1", type: "approval", title: "Schedule approved", body: "Your Northwind Realty primary schedule was approved.", createdAt: day(0), read: false },
  { id: "n_2", type: "mention", title: "Sarah mentioned you", body: "Need your eyes on the buyer pipeline before Friday.", createdAt: day(0), read: false },
  { id: "n_3", type: "system", title: "Pay period set", body: "Pay period 06/15 – 06/29 is now open.", createdAt: day(1), read: true },
  { id: "n_4", type: "report", title: "EOD reviewed", body: "Lea reviewed your EOD report from yesterday.", createdAt: day(1), read: true },
  { id: "n_5", type: "schedule", title: "Schedule change request", body: "Justine submitted a new schedule for review.", createdAt: day(2), read: true },
];

export const activity: ActivityItem[] = [
  { id: "ac_1", kind: "clock-in", text: "Clocked in for Northwind Realty", at: "08:58 AM" },
  { id: "ac_2", kind: "break-start", text: "Started a short break", at: "10:45 AM" },
  { id: "ac_3", kind: "eod-submitted", text: "Submitted yesterday's EOD report", at: "Yesterday · 5:22 PM" },
  { id: "ac_4", kind: "schedule-change", text: "Requested Moneybacker schedule", at: "Yesterday · 2:10 PM" },
  { id: "ac_5", kind: "approval", text: "Approved Justine's schedule", at: "Mon · 9:45 AM" },
];

export const announcements = [
  { id: "an_1", title: "Q3 OKRs are live", body: "Review the new company OKRs and align with your headbacker by Friday.", date: day(0), tag: "Company" },
  { id: "an_2", title: "New EOD template", body: "We're rolling out a refreshed EOD template with client tagging.", date: day(2), tag: "Product" },
  { id: "an_3", title: "Holiday schedule", body: "Independence Day · July 4 is observed company-wide.", date: day(4), tag: "HR" },
];

export const performance = {
  attendance: 96,
  consistency: 92,
  productivity: 88,
  weekly: Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    hours: 36 + ((i * 7) % 9),
    overtime: i % 3 === 0 ? 2 : 0.5,
  })),
};

export const scheduleApprovals: ScheduleApproval[] = [
  { id: "sa_1", userId: "u_2", userName: "Justine Robles", email: "justine.robles@cyberbacker.com", scheduleName: "Bluepeak Health · Primary", status: "pending", createdAt: day(1), updatedAt: day(0) },
  { id: "sa_2", userId: "u_3", userName: "Jojo Constantino", email: "jojo.constantino@cyberbacker.com", scheduleName: "Northwind Realty · Backup", status: "pending", createdAt: day(2), updatedAt: day(1) },
  { id: "sa_3", userId: "u_4", userName: "Lea Luisa Santiago", email: "lea.santiago@cyberbacker.com", scheduleName: "Moneybacker · Primary", status: "approved", createdAt: day(5), updatedAt: day(4) },
];

export const changeLogs: ChangeLog[] = Array.from({ length: 6 }, (_, i) => ({
  id: `cl_${i}`,
  userId: users[(i % users.length)].id,
  field: ["Clock In", "Schedule", "Client Assignment", "Status"][i % 4],
  from: ["09:00", "Inactive", "C1", "Pending"][i % 4],
  to: ["08:30", "Active", "Northwind Realty", "Approved"][i % 4],
  updatedBy: "Nemrod Baquiran",
  updatedAt: day(i),
}));

export const attendanceSummary: AttendanceSummary[] = [
  { id: "as_1", range: "Apr 01 – Apr 15, 2026", startDate: "2026-04-01", endDate: "2026-04-15", userName: "Nemrod Baquiran", client: "Northwind Realty", totalHours: 78.5, totalOvertime: 3.5, totalAbsences: 0, unpaidLeave: 0, paidLeave: 0, checked: true },
  { id: "as_2", range: "Apr 01 – Apr 15, 2026", startDate: "2026-04-01", endDate: "2026-04-15", userName: "Justine Robles", client: "Bluepeak Health", totalHours: 74, totalOvertime: 0, totalAbsences: 1, unpaidLeave: 1, paidLeave: 0, checked: true },
  { id: "as_3", range: "Apr 01 – Apr 15, 2026", startDate: "2026-04-01", endDate: "2026-04-15", userName: "Lea Luisa Santiago", client: "Moneybacker", totalHours: 80, totalOvertime: 4, totalAbsences: 0, unpaidLeave: 0, paidLeave: 0, checked: false },
];
