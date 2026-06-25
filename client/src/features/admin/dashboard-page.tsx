import { useQuery } from "@tanstack/react-query";
import { Activity, Blocks, FileCode, FileText, Image, Layers3, Mail, SquarePen } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { STALE_TIMES } from "@/lib/queryClient";

interface DashboardStats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  mediaAssets: number;
  sections: number;
  forms: number;
  submissions: number;
}

interface ActivityItem {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  userName: string;
}

function formatAction(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    staleTime: STALE_TIMES.OPERATIONAL,
    refetchOnWindowFocus: true,
  });

  const { data: recentActivity = [], isLoading: activityLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/admin/dashboard-activity"],
    staleTime: STALE_TIMES.OPERATIONAL,
    refetchOnWindowFocus: true,
  });

  const statCards = [
    { title: "Total Pages", value: stats?.totalPages ?? 0, icon: FileCode, color: "text-violet-600" },
    { title: "Published", value: stats?.publishedPages ?? 0, icon: FileText, color: "text-emerald-600" },
    { title: "Drafts", value: stats?.draftPages ?? 0, icon: Layers3, color: "text-amber-600" },
    { title: "Media Assets", value: stats?.mediaAssets ?? 0, icon: Image, color: "text-sky-600" },
    { title: "Sections", value: stats?.sections ?? 0, icon: Blocks, color: "text-indigo-600" },
    { title: "Forms", value: stats?.forms ?? 0, icon: SquarePen, color: "text-rose-600" },
    { title: "Submissions", value: stats?.submissions ?? 0, icon: Mail, color: "text-cyan-600" },
  ];

  return (
    <AdminSidebar>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold" data-testid="text-admin-dashboard-title">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">CMS content, design, and system activity at a glance.</p>
          </div>
        </div>

        {statsLoading ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {statCards.map((card) => (
              <Card key={card.title} data-testid={`card-stat-${card.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardContent className="px-4 pb-3 pt-4">
                  <card.icon className={`mb-2 h-4 w-4 ${card.color}`} />
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{card.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest CMS and account activity.</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <LoadingSpinner />
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity has been recorded yet.</p>
            ) : (
              <div className="divide-y">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium">{formatAction(item.action)}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.details || "No details"} by {item.userName}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
}
