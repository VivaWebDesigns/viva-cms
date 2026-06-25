import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Shield, User, UserCog } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBranding } from "@/components/shared/branding-provider";
import { UserProfileDialog } from "@/components/shared/user-profile-dialog";
import { useAuth } from "@/hooks/use-auth";
import type { CmsMenu, MenuItem, PublicMenuLocation } from "@shared/schema";

const logoImg = "/favicon.svg";

const defaultNavLinks = [
  { label: "Home", href: "/" },
  { label: "Login", href: "/auth/login" },
];

function flattenItems(items: MenuItem[], depth = 0): { item: MenuItem; depth: number }[] {
  const result: { item: MenuItem; depth: number }[] = [];
  for (const item of items) {
    result.push({ item, depth });
    if (item.children?.length > 0) {
      result.push(...flattenItems(item.children, depth + 1));
    }
  }
  return result;
}

function isActiveRecursive(items: MenuItem[], currentPath: string): boolean {
  return items.some((item) => currentPath === item.url || (item.children?.length > 0 && isActiveRecursive(item.children, currentPath)));
}

function DynamicDropdown({ item, location }: { item: MenuItem; location: string }) {
  const flatChildren = flattenItems(item.children || []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={isActiveRecursive(item.children || [], location) ? "toggle-elevate toggle-elevated" : ""}>
          {item.label}
          <ChevronDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-[1000]">
        {flatChildren.map(({ item: child, depth }) => (
          <DropdownMenuItem key={child.id} asChild>
            {child.openInNewTab ? (
              <a href={child.url} target="_blank" rel="noopener noreferrer" style={depth > 0 ? { paddingLeft: `${12 + depth * 16}px` } : undefined}>
                {child.label}
              </a>
            ) : (
              <Link href={child.url} style={depth > 0 ? { paddingLeft: `${12 + depth * 16}px` } : undefined}>
                {child.label}
              </Link>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuLink({ item, location }: { item: MenuItem; location: string }) {
  if (item.children?.length) return <DynamicDropdown item={item} location={location} />;
  if (item.openInNewTab) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost">{item.label}</Button>
      </a>
    );
  }
  return (
    <Link href={item.url}>
      <Button variant="ghost" className={location === item.url ? "toggle-elevate toggle-elevated" : ""}>
        {item.label}
      </Button>
    </Link>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const { user, isLoading, logout, isAdmin, isEditor } = useAuth();
  const { frontendLogoUrl, companyName } = useBranding();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: publicMenus } = useQuery<Partial<Record<PublicMenuLocation, CmsMenu>>>({
    queryKey: ["/api/cms/menus"],
    queryFn: async () => {
      const res = await fetch("/api/cms/menus");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 60000,
  });

  const dynamicItems = useMemo(() => {
    const menu = publicMenus?.main_navigation;
    if (!menu?.items) return null;
    const items = menu.items as MenuItem[];
    return items.length > 0 ? items : null;
  }, [publicMenus]);

  const brandLogo = frontendLogoUrl || logoImg;
  const canAccessAdmin = isAdmin || isEditor;

  return (
    <nav className="sticky top-0 z-[999] border-b bg-background/95 backdrop-blur-sm" data-testid="navbar">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
        <Link href="/" data-testid="link-brand" className="flex items-center gap-2">
          <img src={brandLogo} alt={companyName || "Viva CMS"} className="h-8 w-auto sm:h-10" />
          <span className="hidden text-sm font-semibold sm:inline">{companyName || "Viva CMS"}</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {dynamicItems
            ? dynamicItems.map((item) => <MenuLink key={item.id} item={item} location={location} />)
            : defaultNavLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button variant="ghost" className={location === link.href ? "toggle-elevate toggle-elevated" : ""}>
                    {link.label}
                  </Button>
                </Link>
              ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-background transition-shadow hover:ring-2 hover:ring-ring hover:ring-offset-1"
                  data-testid="button-user-menu"
                >
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[1000]">
                {canAccessAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" data-testid="link-admin-dashboard">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)} data-testid="button-my-profile">
                  <UserCog className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout.mutate()} data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" data-testid="link-login">
                Login
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <img src={brandLogo} alt={companyName || "Viva CMS"} className="h-8 w-auto" />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {dynamicItems
                  ? flattenItems(dynamicItems).map(({ item, depth }) =>
                      item.children?.length ? (
                        <p key={item.id} className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.label}
                        </p>
                      ) : item.openInNewTab ? (
                        <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start" style={depth > 0 ? { paddingLeft: `${16 + depth * 16}px` } : undefined}>
                            {item.label}
                          </Button>
                        </a>
                      ) : (
                        <Link key={item.id} href={item.url} onClick={() => setMobileOpen(false)}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start ${location === item.url ? "toggle-elevate toggle-elevated" : ""}`}
                            style={depth > 0 ? { paddingLeft: `${16 + depth * 16}px` } : undefined}
                          >
                            {item.label}
                          </Button>
                        </Link>
                      ),
                    )
                  : defaultNavLinks.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" className={`w-full justify-start ${location === link.href ? "toggle-elevate toggle-elevated" : ""}`}>
                          {link.label}
                        </Button>
                      </Link>
                    ))}

                <div className="my-3 border-t" />
                {isLoading ? null : user ? (
                  <>
                    <p className="px-4 py-2 text-sm text-muted-foreground">
                      Signed in as {user.firstName} {user.lastName}
                    </p>
                    {canAccessAdmin && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setProfileOpen(true);
                        setMobileOpen(false);
                      }}
                    >
                      <UserCog className="mr-2 h-4 w-4" />
                      My Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        logout.mutate();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <UserProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </nav>
  );
}
