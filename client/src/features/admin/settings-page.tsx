import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Cloud, Mail, Plus, Save, Trash2 } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type SettingsData = Record<string, Record<string, { value: string; isSecret: boolean }>>;

const COMMON_CATEGORIES = [
  "system",
  "branding",
  "mailgun",
  "cloudflare_r2",
  "google_analytics",
  "email",
];

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [category, setCategory] = useState("system");
  const [customCategory, setCustomCategory] = useState("");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [isSecret, setIsSecret] = useState(false);

  const { data: settings = {}, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/admin/settings"],
  });

  const categories = useMemo(
    () => Array.from(new Set([...COMMON_CATEGORIES, ...Object.keys(settings)])).sort(),
    [settings],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const resolvedCategory = category === "__custom" ? customCategory.trim() : category;
      if (!resolvedCategory || !key.trim()) {
        throw new Error("Category and key are required.");
      }
      const response = await apiRequest("PUT", "/api/admin/settings", {
        category: resolvedCategory,
        key: key.trim(),
        value,
        isSecret,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setKey("");
      setValue("");
      setIsSecret(false);
      toast({ title: "Setting saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Could not save setting", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (settingKey: string) => {
      await apiRequest("DELETE", `/api/admin/settings/${encodeURIComponent(settingKey)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Setting deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Could not delete setting", description: error.message, variant: "destructive" });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (integration: "mailgun" | "cloudflare_r2") => {
      const response = await apiRequest("POST", "/api/admin/settings/test-connection", { integration });
      return response.json() as Promise<{ success: boolean; message: string }>;
    },
    onSuccess: (result) => {
      toast({
        title: result.success ? "Connection successful" : "Connection failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
  });

  return (
    <AdminSidebar>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage reusable CMS configuration values and integrations.</p>
        </div>

        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add Setting</CardTitle>
                <CardDescription>Values are stored by category and key.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {category === "__custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-category">Custom Category</Label>
                    <Input id="custom-category" value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="setting-key">Key</Label>
                  <Input id="setting-key" value={key} onChange={(event) => setKey(event.target.value)} placeholder="site_name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-value">Value</Label>
                  <Input id="setting-value" value={value} onChange={(event) => setValue(event.target.value)} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={isSecret} onCheckedChange={(checked) => setIsSecret(Boolean(checked))} />
                  Store as secret
                </label>
                <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {key ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                  Save Setting
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">Loading settings...</CardContent>
                </Card>
              ) : Object.keys(settings).length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">No settings have been saved yet.</CardContent>
                </Card>
              ) : (
                Object.entries(settings).map(([group, values]) => (
                  <Card key={group}>
                    <CardHeader>
                      <CardTitle className="text-base capitalize">{group.replace(/_/g, " ")}</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                      {Object.entries(values).map(([settingKey, setting]) => (
                        <div key={settingKey} className="flex items-center justify-between gap-4 py-3">
                          <div className="min-w-0">
                            <p className="font-medium">{settingKey}</p>
                            <p className="truncate text-sm text-muted-foreground">{setting.value || "(empty)"}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(settingKey)}
                            aria-label={`Delete ${settingKey}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4" />
                  Mailgun
                </CardTitle>
                <CardDescription>Used for password resets and CMS email templates.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => testConnectionMutation.mutate("mailgun")}>
                  Test Connection
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cloud className="h-4 w-4" />
                  Object Storage
                </CardTitle>
                <CardDescription>Use Railway Buckets, Cloudflare R2, or another S3-compatible bucket for media uploads.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => testConnectionMutation.mutate("cloudflare_r2")}>
                  Test Connection
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminSidebar>
  );
}
