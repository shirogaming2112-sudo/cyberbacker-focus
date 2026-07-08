export type AppRole = "cyberbacker" | "hb" | "mb" | "software";

export const ROLE_LABEL: Record<AppRole, string> = {
  cyberbacker: "Cyberbacker",
  hb: "HB",
  mb: "MB",
  software: "Software",
};

export const ROLE_DESCRIPTION: Record<AppRole, string> = {
  cyberbacker: "Workspace access only.",
  hb: "Workspace + Admin (no Attendance Summary, no Impersonate/Password).",
  mb: "Workspace + Admin (no Impersonate/Password).",
  software: "Full access, including Impersonate & Password reset.",
};

export const can = {
  viewAdmin: (r: AppRole) => r !== "cyberbacker",
  viewAttendanceSummary: (r: AppRole) => r === "mb" || r === "software",
  viewChangeLogs: (r: AppRole) => r === "mb" || r === "software",
  approveEod: (r: AppRole) => r !== "cyberbacker",
  approveSchedules: (r: AppRole) => r !== "cyberbacker",
  impersonate: (r: AppRole) => r === "software",
  resetPassword: (r: AppRole) => r === "software",
  editUser: (r: AppRole) => r !== "cyberbacker",
};

export function visibleUserRoles(r: AppRole): AppRole[] {
  if (r === "software") return ["software", "mb", "hb", "cyberbacker"];
  if (r === "mb") return ["mb", "hb", "cyberbacker"];
  if (r === "hb") return ["cyberbacker"];
  return [];
}
