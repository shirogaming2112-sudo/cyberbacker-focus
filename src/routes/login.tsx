import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ROLE_DESCRIPTION, ROLE_LABEL, type AppRole } from "@/lib/permissions";
import logoWhite from "@/assets/cyberbacker-white.png.asset.json";
import logoFull from "@/assets/cyberbacker-full.png.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Cyberbacker" },
      { name: "description", content: "Sign in to your Cyberbacker workspace." },
    ],
  }),
  component: LoginPage,
});

const ROLES: AppRole[] = ["cyberbacker", "hb", "mb", "software"];

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selected, setSelected] = useState<AppRole>("cyberbacker");

  const handleLogin = () => {
    login(selected);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-32 top-1/4 size-96 rounded-full bg-accent/40 blur-3xl" />
          <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-accent/30 blur-3xl" />
        </div>
        <img src={logoWhite.url} alt="Cyberbacker" className="relative h-10 w-auto" />
        <div className="relative max-w-md space-y-4">
          <h1 className="font-display text-4xl font-semibold leading-tight">
            We've got your back.
          </h1>
          <p className="text-primary-foreground/80">
            Attendance, schedules, EOD reports, and referrals — one workspace
            for the entire Cyberbacker team.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Cyberbacker. All rights reserved.
        </p>
      </div>

      <div className="relative flex items-center justify-center bg-muted/40 p-6 sm:p-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/20 via-background to-background" />
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center lg:hidden">
            <img src={logoFull.url} alt="Cyberbacker" className="h-10 w-auto dark:hidden" />
            <img src={logoWhite.url} alt="Cyberbacker" className="hidden h-10 w-auto dark:block" />
          </div>
          <div className="rounded-2xl border bg-card/80 p-6 shadow-card backdrop-blur sm:p-8">
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground">
                Choose a role to preview the workspace. Google Sign-in is
                coming soon.
              </p>
            </div>

            <fieldset className="mt-5 space-y-2">
              <legend className="sr-only">Choose role</legend>
              {ROLES.map((r) => {
                const active = selected === r;
                return (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                      active ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={active}
                      onChange={() => setSelected(r)}
                      className="sr-only"
                    />
                    <span
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                        active ? "border-primary bg-primary text-primary-foreground" : "border-input"
                      }`}
                      aria-hidden
                    >
                      {active && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{ROLE_LABEL[r]}</span>
                      <span className="block text-xs text-muted-foreground">{ROLE_DESCRIPTION[r]}</span>
                    </span>
                  </label>
                );
              })}
            </fieldset>

            <Button size="lg" className="mt-5 w-full" onClick={handleLogin}>
              Login as {ROLE_LABEL[selected]}
            </Button>

            <Button size="lg" variant="outline" disabled className="mt-2 w-full justify-center gap-3">
              <GoogleIcon /> Continue with Google (coming soon)
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Need help? Contact your headbacker or IT support.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
