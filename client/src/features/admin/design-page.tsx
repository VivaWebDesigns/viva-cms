import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export type BrandingSubview = "branding" | "colors" | "typography";

type SettingsData = Record<string, Record<string, { value: string; isSecret: boolean }>>;

const DESIGN_COPY: Record<BrandingSubview, { title: string; description: string }> = {
  branding: {
    title: "Branding",
    description: "Manage public-facing identity values and brand assets for this CMS.",
  },
  colors: {
    title: "Color Palette",
    description: "Set reusable color tokens consumed by the public site and editor previews.",
  },
  typography: {
    title: "Typography",
    description: "Choose frontend heading and body font families.",
  },
};

const DESIGN_FIELDS: Record<BrandingSubview, Array<{ key: string; label: string; placeholder: string }>> = {
  branding: [
    { key: "site_name", label: "Site Name", placeholder: "Reusable CMS" },
    { key: "frontend_logo_url", label: "Logo URL", placeholder: "/uploads/branding/logo.webp" },
    { key: "favicon_url", label: "Favicon URL", placeholder: "/uploads/branding/favicon.webp" },
  ],
  colors: [
    { key: "primary_color", label: "Primary Color", placeholder: "#1e3a5f" },
    { key: "accent_color", label: "Accent Color", placeholder: "#3b82f6" },
    { key: "background_color", label: "Background Color", placeholder: "#ffffff" },
  ],
  typography: [
    { key: "heading_font", label: "Heading Font", placeholder: "Inter" },
    { key: "body_font", label: "Body Font", placeholder: "Inter" },
  ],
};

function readSetting(settings: SettingsData | undefined, key: string) {
  return settings?.branding?.[key]?.value ?? settings?.design?.[key]?.value ?? "";
}

export default function AdminDesignPage({ initialSubview }: { initialSubview: BrandingSubview }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/admin/settings"],
  });

  const fields = DESIGN_FIELDS[initialSubview];
  const values = useMemo(() => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      next[field.key] = draft[field.key] ?? readSetting(settings, field.key);
    }
    return next;
  }, [draft, fields, settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const field of fields) {
        await apiRequest("PUT", "/api/admin/settings", {
          category: "branding",
          key: field.key,
          value: values[field.key] ?? "",
          isSecret: false,
        });
      }
    },
    onSuccess: () => {
      setDraft({});
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branding"] });
      toast({ title: "Design settings saved" });
    },
  });

  const copy = DESIGN_COPY[initialSubview];

  return (
    <AdminSidebar>
      <div className="max-w-4xl p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-semibold" data-testid="text-design-title">
              {copy.title}
            </h1>
            <p className="mt-1 text-muted-foreground" data-testid="text-design-description">
              {copy.description}
            </p>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isLoading}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.title} Settings</CardTitle>
            <CardDescription>These values are stored as reusable branding settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`design-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`design-${field.key}`}
                    value={values[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
}
