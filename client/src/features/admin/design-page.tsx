import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Check, Image, Loader2, Palette, Save, Type } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  BRANDING_FONT_OPTIONS,
  BRANDING_SANS_FONT_OPTIONS,
  BRANDING_SERIF_FONT_OPTIONS,
  fontFamilyForBrandingOption,
  normalizeHexColor,
  type BrandingFontOption,
} from "@/lib/branding";
import { cn } from "@/lib/utils";

export type BrandingSubview = "branding" | "colors" | "typography";

type SettingsData = Record<string, Record<string, { value: string; isSecret: boolean }>>;
type BrandingSettingKey = "company_name" | "frontend_logo_url" | "favicon_url";
type BrandingColorSettingKey =
  | "brand_primary_color"
  | "brand_secondary_color"
  | "brand_tertiary_color"
  | "brand_quaternary_color"
  | "text_h1_color"
  | "text_h2_color"
  | "text_h3_h6_color"
  | "text_body_color"
  | "text_heading_subtext_color"
  | "text_supporting_copy_color"
  | "text_helper_text_color"
  | "text_meta_color"
  | "text_link_color"
  | "text_link_hover_color"
  | "text_inverse_color";

const DEFAULT_FONT_VALUE = "__default__";

const DESIGN_COPY: Record<BrandingSubview, { title: string; description: string }> = {
  branding: {
    title: "Branding",
    description: "Manage public-facing identity assets for the website and keep brand controls grouped in one place.",
  },
  colors: {
    title: "Color Palette",
    description: "Control the public site color system, including semantic typography colors and branded UI surfaces.",
  },
  typography: {
    title: "Typography",
    description: "Choose the frontend heading and body fonts with inline previews for each Google Font option.",
  },
};

const DESIGN_TABS: Array<{ value: BrandingSubview; label: string; href: string }> = [
  { value: "branding", label: "Branding", href: "/admin/design/branding" },
  { value: "colors", label: "Color Palette", href: "/admin/design/colors" },
  { value: "typography", label: "Typography", href: "/admin/design/typography" },
];

const BRANDING_FIELDS: Array<{ key: BrandingSettingKey; label: string; placeholder: string }> = [
  { key: "company_name", label: "Site Name", placeholder: "Viva CMS" },
  { key: "frontend_logo_url", label: "Logo URL", placeholder: "/uploads/branding/logo.webp" },
  { key: "favicon_url", label: "Favicon URL", placeholder: "/uploads/branding/favicon.webp" },
];

const COLOR_FIELDS: Array<{ key: BrandingColorSettingKey; label: string; description: string }> = [
  { key: "brand_primary_color", label: "Primary Color", description: "Main brand and button color." },
  { key: "brand_secondary_color", label: "Secondary Color", description: "Support color for secondary UI states." },
  { key: "brand_tertiary_color", label: "Tertiary Color", description: "Accent color used across highlights and links." },
  { key: "brand_quaternary_color", label: "Quaternary Color", description: "Fourth core brand color for additional accents." },
  { key: "text_h1_color", label: "H1 Color", description: "Primary color for main page headings." },
  { key: "text_h2_color", label: "H2 Color", description: "Color for section-level headings and major titles." },
  { key: "text_h3_h6_color", label: "H3-H6 Color", description: "Color for smaller heading levels and card titles." },
  { key: "text_body_color", label: "Paragraph Text", description: "Default reading color for paragraphs and body copy." },
  { key: "text_heading_subtext_color", label: "Heading Sub-Text", description: "Color for subtitle lines beneath headings." },
  { key: "text_supporting_copy_color", label: "Supporting Copy", description: "Use for section introductions and lead-in copy." },
  { key: "text_helper_text_color", label: "Helper Messaging", description: "Use for empty states and guidance text." },
  { key: "text_meta_color", label: "Meta Text", description: "Use for dates, categories, labels, and metadata." },
  { key: "text_link_color", label: "Link Color", description: "Default color for editorial links." },
  { key: "text_link_hover_color", label: "Link Hover Color", description: "Hover color for links and text actions." },
  { key: "text_inverse_color", label: "Inverse Text", description: "Text shown on dark surfaces and image overlays." },
];

const GOOGLE_FONT_URL = `https://fonts.googleapis.com/css2?${BRANDING_FONT_OPTIONS.map((option) =>
  `family=${option.label.replace(/\s+/g, "+")}:wght@400;500;600;700`,
).join("&")}&display=swap`;

function readBrandingSetting(settings: SettingsData | undefined, key: string) {
  return settings?.branding?.[key]?.value ?? "";
}

function FontPreviewLoader() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.querySelector('link[data-viva-cms-font-previews="true"]')) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONT_URL;
    link.dataset.vivaCmsFontPreviews = "true";
    document.head.appendChild(link);
  }, []);

  return null;
}

function FontOptionCard({
  option,
  selectedValue,
  onSelect,
  sampleKind,
}: {
  option: BrandingFontOption;
  selectedValue: string;
  onSelect: (value: string) => void;
  sampleKind: "heading" | "body";
}) {
  const selected = selectedValue === option.value;

  return (
    <button
      key={option.value}
      type="button"
      onClick={() => onSelect(option.value)}
      className={cn(
        "w-full rounded-md border p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/70 bg-muted/20",
      )}
      data-testid={`button-branding-font-${sampleKind}-${option.value}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold" style={{ fontFamily: option.family }}>
            {option.label}
          </p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {option.category === "sans" ? "Sans Serif" : "Serif"}
          </p>
        </div>
        {selected && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p
        className={cn("mt-3 text-foreground", sampleKind === "heading" ? "text-xl font-semibold" : "text-sm leading-relaxed")}
        style={{ fontFamily: option.family }}
      >
        {sampleKind === "heading"
          ? "The right words should feel understood."
          : "Thoughtful typography helps editors preview the real feeling of the brand before publishing."}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{option.preview}</p>
    </button>
  );
}

function DesignTabs({ active }: { active: BrandingSubview }) {
  return (
    <Tabs value={active} className="space-y-6">
      <TabsList className="grid w-full max-w-lg grid-cols-3" data-testid="tabs-design-subtabs">
        {DESIGN_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild data-testid={`tab-design-${tab.value}`}>
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function BrandingPanel({ settings }: { settings: SettingsData | undefined }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<Record<BrandingSettingKey, string>>({
    company_name: "",
    frontend_logo_url: "",
    favicon_url: "",
  });

  useEffect(() => {
    setDraft({
      company_name: readBrandingSetting(settings, "company_name"),
      frontend_logo_url: readBrandingSetting(settings, "frontend_logo_url"),
      favicon_url: readBrandingSetting(settings, "favicon_url"),
    });
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        BRANDING_FIELDS.map((field) =>
          apiRequest("PUT", "/api/admin/settings", {
            category: "branding",
            key: field.key,
            value: draft[field.key].trim(),
            isSecret: false,
          }),
        ),
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/branding"] }),
      ]);
      toast({ title: "Branding settings saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Could not save branding settings", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Image className="h-4 w-4 text-primary" />
          Brand Identity
        </CardTitle>
        <CardDescription>Set the reusable public identity values for this CMS starter.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {BRANDING_FIELDS.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`design-${field.key}`}>{field.label}</Label>
            <Input
              id={`design-${field.key}`}
              value={draft[field.key]}
              placeholder={field.placeholder}
              onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
              data-testid={`input-design-${field.key}`}
            />
          </div>
        ))}
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Branding
        </Button>
      </CardContent>
    </Card>
  );
}

function ColorsPanel({ settings }: { settings: SettingsData | undefined }) {
  const { toast } = useToast();
  const [colors, setColors] = useState<Record<BrandingColorSettingKey, string>>(() =>
    Object.fromEntries(COLOR_FIELDS.map((field) => [field.key, ""])) as Record<BrandingColorSettingKey, string>,
  );

  useEffect(() => {
    setColors(
      Object.fromEntries(
        COLOR_FIELDS.map((field) => [
          field.key,
          readBrandingSetting(settings, field.key) || (field.key === "brand_quaternary_color" ? "#A8623A" : ""),
        ]),
      ) as Record<BrandingColorSettingKey, string>,
    );
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        COLOR_FIELDS.map((field) =>
          apiRequest("PUT", "/api/admin/settings", {
            category: "branding",
            key: field.key,
            value: normalizeHexColor(colors[field.key]) || "",
            isSecret: false,
          }),
        ),
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/branding"] }),
      ]);
      toast({ title: "Color palette saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Could not save color palette", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4 text-primary" />
          Color Palette
        </CardTitle>
        <CardDescription>Set the core frontend brand colors and typography colors.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {COLOR_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5 rounded-md border p-4">
              <Label>{field.label}</Label>
              <p className="text-xs text-muted-foreground">{field.description}</p>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="color"
                  value={normalizeHexColor(colors[field.key]) || "#000000"}
                  onChange={(event) => setColors((current) => ({ ...current, [field.key]: event.target.value.toUpperCase() }))}
                  className="h-10 w-12 cursor-pointer rounded-md border bg-background p-1"
                  data-testid={`input-color-${field.key}`}
                />
                <Input
                  value={colors[field.key]}
                  onChange={(event) => setColors((current) => ({ ...current, [field.key]: event.target.value }))}
                  placeholder="#000000"
                  data-testid={`input-hex-${field.key}`}
                />
              </div>
            </div>
          ))}
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Color Palette
        </Button>
      </CardContent>
    </Card>
  );
}

function TypographyPanel({ settings }: { settings: SettingsData | undefined }) {
  const { toast } = useToast();
  const brandingSettings = settings?.branding || {};
  const [bodyFont, setBodyFont] = useState(brandingSettings.frontend_body_font?.value || DEFAULT_FONT_VALUE);
  const [headingFont, setHeadingFont] = useState(brandingSettings.frontend_heading_font?.value || DEFAULT_FONT_VALUE);

  useEffect(() => {
    setBodyFont(brandingSettings.frontend_body_font?.value || DEFAULT_FONT_VALUE);
    setHeadingFont(brandingSettings.frontend_heading_font?.value || DEFAULT_FONT_VALUE);
  }, [brandingSettings.frontend_body_font?.value, brandingSettings.frontend_heading_font?.value]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        apiRequest("PUT", "/api/admin/settings", {
          category: "branding",
          key: "frontend_heading_font",
          value: headingFont === DEFAULT_FONT_VALUE ? "" : headingFont,
          isSecret: false,
        }),
        apiRequest("PUT", "/api/admin/settings", {
          category: "branding",
          key: "frontend_body_font",
          value: bodyFont === DEFAULT_FONT_VALUE ? "" : bodyFont,
          isSecret: false,
        }),
      ]);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/branding"] }),
      ]);
      toast({ title: "Typography saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Could not save typography", description: error.message, variant: "destructive" });
    },
  });

  const previewHeadingStyle = {
    fontFamily: fontFamilyForBrandingOption(headingFont === DEFAULT_FONT_VALUE ? null : headingFont) ?? undefined,
  };
  const previewBodyStyle = {
    fontFamily: fontFamilyForBrandingOption(bodyFont === DEFAULT_FONT_VALUE ? null : bodyFont) ?? undefined,
  };

  return (
    <Card>
      <FontPreviewLoader />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Type className="h-4 w-4 text-primary" />
          Frontend Typography
        </CardTitle>
        <CardDescription>
          Choose one font for headings and another for body copy on the public-facing website. Each option includes an inline sample so editors can compare type directly in the admin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Heading Font</Label>
            <Select value={headingFont} onValueChange={setHeadingFont}>
              <SelectTrigger data-testid="select-branding-heading-font">
                <SelectValue placeholder="Use current theme font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_FONT_VALUE}>Use current theme font</SelectItem>
                {BRANDING_FONT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Choose from the reusable Google font library.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Body Font</Label>
            <Select value={bodyFont} onValueChange={setBodyFont}>
              <SelectTrigger data-testid="select-branding-body-font">
                <SelectValue placeholder="Use current theme font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_FONT_VALUE}>Use current theme font</SelectItem>
                {BRANDING_FONT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Choose from the same balanced font library for paragraph copy.</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Heading Font Picker</CardTitle>
              <CardDescription>Preview how each font feels in large editorial headings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sans Serif Options</p>
              <div className="grid gap-3">
                {BRANDING_SANS_FONT_OPTIONS.map((option) => (
                  <FontOptionCard key={option.value} option={option} selectedValue={headingFont} onSelect={setHeadingFont} sampleKind="heading" />
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Serif Options</p>
              <div className="grid gap-3">
                {BRANDING_SERIF_FONT_OPTIONS.map((option) => (
                  <FontOptionCard key={option.value} option={option} selectedValue={headingFont} onSelect={setHeadingFont} sampleKind="heading" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Body Font Picker</CardTitle>
              <CardDescription>Preview how each font reads in paragraph-sized content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sans Serif Options</p>
              <div className="grid gap-3">
                {BRANDING_SANS_FONT_OPTIONS.map((option) => (
                  <FontOptionCard key={option.value} option={option} selectedValue={bodyFont} onSelect={setBodyFont} sampleKind="body" />
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Serif Options</p>
              <div className="grid gap-3">
                {BRANDING_SERIF_FONT_OPTIONS.map((option) => (
                  <FontOptionCard key={option.value} option={option} selectedValue={bodyFont} onSelect={setBodyFont} sampleKind="body" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border bg-muted/10 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview</p>
          <h4 className="mt-3 text-2xl font-semibold" style={previewHeadingStyle}>
            Your public site heading preview appears here.
          </h4>
          <p className="mt-3 text-sm text-muted-foreground" style={previewBodyStyle}>
            Use this preview to compare heading and body combinations before saving. These font selections only apply to the public-facing website, not the admin dashboard.
          </p>
        </div>

        <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="button-save-branding-fonts">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Typography
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminDesignPage({ initialSubview }: { initialSubview: BrandingSubview }) {
  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/admin/settings"],
  });
  const copy = DESIGN_COPY[initialSubview];

  return (
    <AdminSidebar>
      <div className="max-w-5xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-semibold" data-testid="text-design-title">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground" data-testid="text-design-description">
            {copy.description}
          </p>
        </div>

        <DesignTabs active={initialSubview} />

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Tabs value={initialSubview} className="mt-6">
            <TabsContent value="branding" forceMount={initialSubview === "branding" ? true : undefined}>
              {initialSubview === "branding" && <BrandingPanel settings={settings} />}
            </TabsContent>
            <TabsContent value="colors" forceMount={initialSubview === "colors" ? true : undefined}>
              {initialSubview === "colors" && <ColorsPanel settings={settings} />}
            </TabsContent>
            <TabsContent value="typography" forceMount={initialSubview === "typography" ? true : undefined}>
              {initialSubview === "typography" && <TypographyPanel settings={settings} />}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminSidebar>
  );
}
