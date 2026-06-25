import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  Database,
  FileCode,
  FileText,
  Globe,
  Image,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Palette,
  PanelRight,
  SearchIcon,
  Settings,
  SquarePen,
  Type,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserProfileDialog } from "@/components/shared/user-profile-dialog";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import logoIcon from "@assets/viva-favicon.svg";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  iconColor: string;
  permissions?: Array<"content" | "design">;
  adminOnly?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        iconColor: "text-teal-600",
      },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "CMS Overview", href: "/admin/cms", icon: Globe, iconColor: "text-violet-600", permissions: ["content"] },
      { title: "Pages", href: "/admin/cms/pages", icon: FileCode, iconColor: "text-violet-500", permissions: ["content"] },
      { title: "Forms", href: "/admin/forms", icon: SquarePen, iconColor: "text-violet-500", permissions: ["content"] },
      { title: "Media", href: "/admin/cms/media", icon: Image, iconColor: "text-violet-400", permissions: ["content"] },
      { title: "Sections", href: "/admin/cms/sections", icon: Blocks, iconColor: "text-violet-400", permissions: ["content", "design"] },
      { title: "SEO", href: "/admin/cms/seo", icon: SearchIcon, iconColor: "text-violet-400", permissions: ["content"] },
    ],
  },
  {
    label: "Design",
    items: [
      { title: "Branding", href: "/admin/design/branding", icon: Image, iconColor: "text-pink-500", permissions: ["design"] },
      { title: "Color Palette", href: "/admin/design/colors", icon: Palette, iconColor: "text-rose-500", permissions: ["design"] },
      { title: "Typography", href: "/admin/design/typography", icon: Type, iconColor: "text-sky-600", permissions: ["design"] },
      { title: "Menus", href: "/admin/cms/menus", icon: MenuIcon, iconColor: "text-violet-500", permissions: ["design"] },
      { title: "Sidebars & Widgets", href: "/admin/cms/sidebars", icon: PanelRight, iconColor: "text-emerald-500", permissions: ["design"] },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Documentation", href: "/admin/docs", icon: FileText, iconColor: "text-indigo-600", adminOnly: true },
      { title: "System Backups", href: "/admin/system/backups", icon: Database, iconColor: "text-cyan-600", adminOnly: true },
      { title: "System Users", href: "/admin/users", icon: Users, iconColor: "text-blue-600", adminOnly: true },
      { title: "Settings", href: "/admin/settings", icon: Settings, iconColor: "text-slate-500", adminOnly: true },
    ],
  },
];

interface AdminSidebarProps {
  children: React.ReactNode;
}

export function AdminSidebar({ children }: AdminSidebarProps) {
  const [location] = useLocation();
  const { user, logout, hasAdminPermission } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.adminOnly) return user?.role === "admin";
        if (!item.permissions?.length) return true;
        return item.permissions.some(hasAdminPermission);
      }),
    }))
    .filter((group) => group.items.length > 0);

  const exactOnlyRoutes = ["/admin", "/admin/cms"];
  const isRouteActive = (href: string) =>
    location === href || (!exactOnlyRoutes.includes(href) && location.startsWith(href));

  useEffect(() => {
    if (!user) setProfileOpen(false);
  }, [user]);

  const renderNavItem = (item: NavItem) => {
    const isActive = isRouteActive(item.href);
    const linkContent = (
      <Link key={item.href} href={item.href}>
        <span
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium cursor-pointer hover-elevate whitespace-nowrap overflow-hidden",
            isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
          data-testid={`link-admin-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "" : item.iconColor)} />
          <span className={cn("transition-opacity duration-200 flex-1", collapsed ? "opacity-0" : "opacity-100")}>
            {item.title}
          </span>
        </span>
      </Link>
    );

    if (!collapsed) return linkContent;

    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="admin-shell flex min-h-screen relative">
        <div className="relative flex-shrink-0">
          <aside
            className={cn(
              "border-r bg-muted/30 h-full flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden",
              collapsed ? "w-[68px]" : "w-64",
            )}
          >
            <div className="p-4">
              <div className="flex items-center gap-3" data-testid="text-admin-title">
                <img src={logoIcon} alt="Viva CMS" className="h-9 w-9 flex-shrink-0 object-contain" data-testid="img-admin-logo" />
                <h2
                  className={cn(
                    "font-heading text-lg font-semibold whitespace-nowrap transition-opacity duration-200",
                    collapsed ? "opacity-0 w-0" : "opacity-100",
                  )}
                >
                  Admin Dashboard
                </h2>
              </div>
            </div>

            <nav className="flex flex-col gap-1 px-2 flex-1 overflow-y-auto" data-testid="nav-admin-sidebar">
              {visibleGroups.map((group, groupIdx) => (
                <div key={group.label ?? `group-${groupIdx}`} className="flex flex-col gap-0.5">
                  {groupIdx > 0 && <Separator className="my-2" />}
                  {group.label && !collapsed && (
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                      {group.label}
                    </p>
                  )}
                  {group.items.map(renderNavItem)}
                </div>
              ))}
            </nav>

            {user && (
              <div className="px-2 pb-4">
                <Separator className="mb-3" />
                {!collapsed && (
                  <div className="px-3 mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden"
                        onClick={() => setProfileOpen(true)}
                        data-testid="button-sidebar-profile"
                      >
                        {user.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-semibold text-primary">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </span>
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" data-testid="text-sidebar-username">
                          {user.firstName} {user.lastName}
                        </p>
                        <Badge variant="outline" className="text-[10px] capitalize" data-testid="badge-sidebar-role">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {collapsed && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="mx-auto h-9 w-9" onClick={() => setProfileOpen(true)}>
                          <User className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        My Profile
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Button
                    variant="ghost"
                    size={collapsed ? "icon" : "sm"}
                    className={cn("justify-start text-muted-foreground", collapsed ? "mx-auto h-9 w-9" : "w-full")}
                    onClick={() => logout.mutate()}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span className="ml-2">Log out</span>}
                  </Button>
                </div>
              </div>
            )}
          </aside>
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full bg-background shadow-sm"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            data-testid="button-toggle-sidebar"
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>

        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
      <UserProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </TooltipProvider>
  );
}
