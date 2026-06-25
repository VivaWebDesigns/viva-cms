import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useBranding } from "@/components/shared/branding-provider";
import type { CmsMenu, MenuItem, PublicMenuLocation } from "@shared/schema";

const logoImg = "/favicon.svg";

const defaultFooterLinks = [
  { href: "/", label: "Home" },
  { href: "/auth/login", label: "Login" },
];

function flattenFooterItems(items: MenuItem[], depth = 0): { item: MenuItem; depth: number }[] {
  const result: { item: MenuItem; depth: number }[] = [];
  for (const item of items) {
    result.push({ item, depth });
    if (item.children?.length > 0) {
      result.push(...flattenFooterItems(item.children, depth + 1));
    }
  }
  return result;
}

function FooterColumn({ title, items }: { title: string; items: MenuItem[] }) {
  const links = flattenFooterItems(items);
  if (links.length === 0) return null;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm sm:space-y-3">
        {links.map(({ item, depth }) => (
          <li key={item.id} style={depth > 0 ? { paddingLeft: `${depth * 12}px` } : undefined}>
            {item.openInNewTab ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </a>
            ) : (
              <Link href={item.url} className="text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { frontendLogoUrl, companyName } = useBranding();
  const { data: publicMenus } = useQuery<Partial<Record<PublicMenuLocation, CmsMenu>>>({
    queryKey: ["/api/cms/menus"],
    queryFn: async () => {
      const res = await fetch("/api/cms/menus");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 60000,
  });

  const menus = useMemo(
    () =>
      [
        publicMenus?.footer_primary,
        publicMenus?.footer_secondary,
        publicMenus?.footer_tertiary,
        publicMenus?.footer_legal,
      ].filter((menu): menu is CmsMenu => Boolean(menu && Array.isArray(menu.items) && menu.items.length > 0)),
    [publicMenus],
  );

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src={frontendLogoUrl || logoImg} alt={companyName || "Viva CMS"} className="h-9 w-auto" />
              <span className="font-semibold">{companyName || "Viva CMS"}</span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              A reusable content management foundation for pages, design systems, media, forms, and site settings.
            </p>
          </div>

          {menus.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {menus.map((menu) => (
                <FooterColumn key={menu.id} title={menu.name} items={(menu.items as MenuItem[]) || []} />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-foreground">CMS</h4>
                <ul className="space-y-2.5 text-sm">
                  {defaultFooterLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {companyName || "Viva CMS"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
