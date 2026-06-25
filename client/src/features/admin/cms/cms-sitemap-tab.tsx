import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Globe, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CmsPage, SeoSettings } from "@shared/schema";

export function CmsSitemapTab() {
  const { data: pages = [] } = useQuery<CmsPage[]>({ queryKey: ["/api/admin/cms/pages"] });
  const { data: seo } = useQuery<SeoSettings>({ queryKey: ["/api/admin/cms/seo"] });

  const entries = useMemo(() => {
    const base = seo?.siteUrl?.replace(/\/$/, "") || "";
    return pages
      .filter((page) => page.status === "published" && !page.noindex)
      .map((page) => ({
        loc: `${base}${page.slug === "home" ? "/" : `/${page.slug.replace(/^\//, "")}`}`,
        title: page.title,
        updatedAt: page.updatedAt,
      }));
  }, [pages, seo]);

  const excluded = pages.length - entries.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Sitemap Preview
          </CardTitle>
          <CardDescription>Published CMS pages that will appear in `/sitemap.xml`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{entries.length} included</Badge>
            <Badge variant="outline">{excluded} excluded</Badge>
          </div>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published, indexable CMS pages yet.</p>
          ) : (
            <div className="divide-y rounded-md border">
              {entries.map((entry) => (
                <div key={entry.loc} className="flex items-center justify-between gap-4 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{entry.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{entry.loc}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" asChild>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
              Open Sitemap
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
          <ShieldOff className="mt-0.5 h-4 w-4 shrink-0" />
          Draft pages and pages marked noindex are excluded automatically.
        </CardContent>
      </Card>
    </div>
  );
}
