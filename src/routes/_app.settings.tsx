import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { currentUser } from "@/mock/data";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Cyberbacker" }] }),
  component: Settings,
});

function Settings() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Manage your account preferences." />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="prefs">Preferences</TabsTrigger>
          <TabsTrigger value="notif">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Full Name" defaultValue={currentUser.name} />
              <Field label="Email" defaultValue={currentUser.email} />
              <Field label="Title" defaultValue={currentUser.title} />
              <Field label="Timezone" defaultValue={currentUser.timezone} />
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prefs" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="space-y-4 p-5">
              <Row label="Dark mode" desc="Use a dark color scheme across the app">
                <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
              </Row>
              <Row label="Compact density" desc="Show more rows per screen">
                <Switch />
              </Row>
              <Row label="Show seconds on clock" desc="Display seconds in the top-bar clock">
                <Switch defaultChecked />
              </Row>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notif" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="space-y-4 p-5">
              <Row label="Schedule approvals" desc="Notify when a schedule is approved or rejected"><Switch defaultChecked /></Row>
              <Row label="EOD reviews" desc="Notify when your headbacker reviews your EOD"><Switch defaultChecked /></Row>
              <Row label="Mentions" desc="Notify when someone @mentions you"><Switch defaultChecked /></Row>
              <Row label="Weekly digest" desc="A summary every Monday morning"><Switch /></Row>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="space-y-4 p-5">
              <Row label="Two-factor authentication" desc="Require a code in addition to your password"><Switch defaultChecked /></Row>
              <Row label="Session timeout" desc="Sign out after 30 minutes of inactivity"><Switch /></Row>
              <div className="flex justify-end"><Button variant="outline">Sign out all sessions</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} className="mt-1.5" />
    </div>
  );
}
function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
