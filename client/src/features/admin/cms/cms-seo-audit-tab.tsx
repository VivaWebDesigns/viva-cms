import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CmsPage } from "@shared/schema";

function issuesForPage(page: CmsPage) {
  const issues: string[] = [];
  if (!page.seoTitle) issues.push("Missing SEO title");
  if (!page.seoDescription) issues.push("Missing meta description");
  if (!page.ogImageUrl) issues.push("Missing social image");
  if (page.status !== "published") issues.push("Not published");
  if (page.noindex) issues.push("Noindex enabled");
  return issues;
}

export function CmsSeoAuditTab() {
  const { data: pages = [], isLoading } = useQuery<CmsPage[]>({
    queryKey: ["/api/admin/cms/pages"],
  });

  const rows = pages.map((page) => ({ page, issues: issuesForPage(page) }));
  const issueCount = rows.reduce((total, row) => total + row.issues.length, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCode className="h-4 w-4" />
            Page SEO Audit
          </CardTitle>
          <CardDescription>Checks retained CMS pages for common SEO gaps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{pages.length} pages</Badge>
            <Badge variant={issueCount > 0 ? "destructive" : "secondary"}>{issueCount} issues</Badge>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading audit...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No CMS pages found.</p>
          ) : (
            <div className="divide-y rounded-md border">
              {rows.map(({ page, issues }) => (
                <div key={page.id} className="flex items-start justify-between gap-4 p-3">
                  <div className="min-w-0">
                    <p className="font-medium">{page.title}</p>
                    <p className="text-xs text-muted-foreground">/{page.slug === "home" ? "" : page.slug}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {issues.length === 0 ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Looks good
                        </Badge>
                      ) : (
                        issues.map((issue) => (
                          <Badge key={issue} variant="outline" className="text-amber-700">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {issue}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/cms/pages/${page.id}`}>Edit</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
