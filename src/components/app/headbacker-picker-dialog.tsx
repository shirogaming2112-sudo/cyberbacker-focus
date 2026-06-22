import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { users } from "@/mock/data";
import { Check } from "lucide-react";

export function HeadbackerPickerDialog({
  open,
  onOpenChange,
  current,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  current?: string;
  onSelect: (name: string) => void;
}) {
  // For mock purposes, treat every user as a potential headbacker.
  const candidates = users;
  const [value, setValue] = useState(current ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle>Assign Headbacker</DialogTitle>
          <DialogDescription>Search and select the new headbacker for this user.</DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Search by name or email…" />
          <CommandList>
            <CommandEmpty>No matching users.</CommandEmpty>
            <CommandGroup heading="Headbackers">
              {candidates.map((u) => (
                <CommandItem
                  key={u.id}
                  value={`${u.name} ${u.email}`}
                  onSelect={() => {
                    setValue(u.name);
                    onSelect(u.name);
                    onOpenChange(false);
                  }}
                >
                  <span className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">{u.name}</span>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </span>
                  {value === u.name && <Check className="size-4 text-primary" aria-hidden />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
