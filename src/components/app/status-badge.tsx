import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "destructive" | "info" | "muted" | "primary";

const tones: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/20",
  warning: "bg-warning/15 text-warning-foreground border-warning/30",
  destructive: "bg-destructive/12 text-destructive border-destructive/20",
  info: "bg-info/12 text-info border-info/20",
  muted: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
};

export function StatusBadge({
  tone = "muted",
  children,
  className,
  dot = true,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", `bg-current`)} />}
      {children}
    </span>
  );
}

export function statusToTone(status: string): Tone {
  switch (status) {
    case "present":
    case "active":
    case "approved":
    case "submitted":
    case "reviewed":
      return "success";
    case "late":
    case "pending":
    case "flagged":
      return "warning";
    case "absent":
    case "rejected":
      return "destructive";
    case "leave":
      return "info";
    default:
      return "muted";
  }
}
