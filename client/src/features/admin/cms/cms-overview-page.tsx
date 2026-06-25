import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, Blocks, Clock, FileCode, Globe, Image, Plus, SearchIcon, SquarePen } from "lucide-react";
import { AdminSidebar } from "@/features/admin/admin-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CmsPage } from "@shared/schema";

export default function CmsOverviewPage() {
  const [, navigate] = useLocation();

  const { data: pages = [], isLoading: pagesLoading } = useQuery<CmsPage[]>({
    queryKey: ["/api/admin/cms/pages"],
  });

  const totalPages = pages.length;
  const publishedPages = pages.filter((page) => page.status === "published").length;
  const draftPages = pages.filter((page) => page.status === "draft").length;
  const recentPages = pages.slice(0, 5);

  const quickLinks = [
    {
      title: "Pages",
      description: "Create and manage public website pages with SEO settings.",
      icon: FileCode,
      href: "/admin/cms/pages",
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      title: "Forms",
      description: "Build reusable public forms and review submissions.",
      icon: SquarePen,
      href: "/admin/forms",
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
    },
    {
      title: "Media Library",
      description: "Upload and manage images and files.",
      icon: Image,
      href: "/admin/cms/media",
      color: "text-sky-600",
      bg: "bg-sky-50 dark:bg-sky-950/30",
    },
    {
      title: "Sections",
      description: "Save and reuse block groups across pages.",
      icon: Blocks,
      href: "/admin/cms/sections",
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      title: "SEO Settings",
      description: "Configure global SEO defaults, sitemap, and robots.txt.",
      icon: SearchIcon,
      href: "/admin/cms/seo",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
  ];

  return (
    <AdminSidebar>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold" data-testid="text-cms-title">
              Content Management System
            </h1>
            <p className="mt-1 text-muted-foreground">Manage reusable pages, forms, media, sections, and SEO.</p>
          </div>
          <Button onClick={() => navigate("/admin/cms/pages/new")} data-testid="button-create-page">
            <Plus className="mr-2 h-4 w-4" />
            Create Page
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Pages", value: totalPages, icon: Globe, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30" },
            { label: "Published Pages", value: publishedPages, icon: Globe, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
            { label: "Draft Pages", value: draftPages, icon: FileCode, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                  </div>
                  <div>
                    {pagesLoading ? <Skeleton className="h-6 w-10" /> : <p className="text-xl font-bold">{stat.value}</p>}
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickLinks.map((link) => (
            <Card
              key={link.href}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(link.href)}
              data-testid={`card-quicklink-${link.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <CardContent className="pb-4 pt-5">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${link.bg}`}>
                  <link.icon className={`h-4.5 w-4.5 ${link.color}`} />
                </div>
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{link.title}</h3>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-[11px] leading-snug text-muted-foreground">{link.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recently Updated Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pagesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : recentPages.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground" data-testid="text-no-recent-pages">
                <Globe className="mx-auto mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">No pages yet. Create your first CMS page to get started.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/admin/cms/pages/new")}>
                  <Plus className="mr-1 h-4 w-4" />
                  Create Page
                </Button>
              </div>
            ) : (
              <table className="w-full text-sm" data-testid="table-recent-pages">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Title</th>
                    <th className="py-2 text-left font-medium text-muted-foreground">Slug</th>
                    <th className="py-2 text-left font-medium text-muted-foreground">Status</th>
                    <th className="py-2 text-left font-medium text-muted-foreground">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPages.map((page) => (
                    <tr key={page.id} className="cursor-pointer border-b last:border-0 hover:bg-muted/30" onClick={() => navigate(`/admin/cms/pages/${page.id}`)}>
                      <td className="py-2 font-medium">{page.title}</td>
                      <td className="py-2 font-mono text-xs text-muted-foreground">{page.slug}</td>
                      <td className="py-2">
                        <Badge variant={page.status === "published" ? "default" : "outline"} className={`text-xs ${page.status === "published" ? "bg-emerald-600" : ""}`}>
                          {page.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {page.updatedAt ? format(new Date(page.updatedAt), "MMM d, yyyy") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
}
