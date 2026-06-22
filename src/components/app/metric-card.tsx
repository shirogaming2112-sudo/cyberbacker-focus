import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  className?: string;
}) {
  return (
    <Card className={cn("shadow-soft", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {Icon && (
            <span className="grid size-8 place-items-center rounded-md bg-primary/8 text-primary">
              <Icon className="size-4" />
            </span>
          )}
        </div>
        <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{value}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : <span />}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                trend.direction === "up" && "bg-success/10 text-success",
                trend.direction === "down" && "bg-destructive/10 text-destructive",
                trend.direction === "flat" && "bg-muted text-muted-foreground",
              )}
            >
              {trend.direction === "up" && <ArrowUpRight className="size-3" />}
              {trend.direction === "down" && <ArrowDownRight className="size-3" />}
              {trend.value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
