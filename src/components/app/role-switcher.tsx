import { useAuth } from "@/lib/auth";
import { ROLE_LABEL, type AppRole } from "@/lib/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

const ROLES: AppRole[] = ["cyberbacker", "hb", "mb", "software"];

export function RoleSwitcher() {
  const { role, setRole } = useAuth();
  if (!role) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5" aria-label={`Current role ${ROLE_LABEL[role]}. Change role`}>
          <ShieldCheck className="size-3.5" />
          <span className="hidden sm:inline">{ROLE_LABEL[role]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Preview as role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as AppRole)}>
          {ROLES.map((r) => (
            <DropdownMenuRadioItem key={r} value={r}>{ROLE_LABEL[r]}</DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
          Dev role switcher
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
