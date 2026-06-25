import { storage } from "../storage";
import type { CmsPage, SeoSettings } from "@shared/schema";

interface PublicHtmlSnapshot {
  title?: string;
  description?: string | null;
  canonicalUrl?: string;
  ogImageUrl?: string | null;
  noindex?: boolean;
  bodyHtml?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function textFromContent(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const blocks = Array.isArray((content as { blocks?: unknown }).blocks)
    ? ((content as { blocks: unknown[] }).blocks)
    : [];
  const text: string[] = [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const props = (block as { props?: Record<string, unknown> }).props ?? {};
    for (const value of Object.values(props)) {
      if (typeof value === "string") text.push(stripHtml(value));
    }
  }
  return text.join(" ").replace(/\s+/g, " ").trim();
}

function buildCanonical(pathname: string, seo?: SeoSettings | null) {
  const base = seo?.siteUrl?.replace(/\/$/, "") || "";
  return `${base}${pathname === "/" ? "/" : pathname}`;
}

function pagePath(page: CmsPage) {
  return page.slug === "home" ? "/" : `/${page.slug.replace(/^\//, "")}`;
}

async function findPublishedPage(pathname: string): Promise<CmsPage | null> {
  const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "");
  const page = await storage.cmsPages.getPageBySlug(slug);
  if (!page || page.status !== "published") return null;
  return page;
}

export async function getPublicHeadAdditions(): Promise<string | null> {
  const seo = await storage.seoSettings.get();
  if (!seo) return null;
  const parts: string[] = [];
  if (seo.siteName) parts.push(`<meta property="og:site_name" content="${escapeHtml(seo.siteName)}">`);
  if (seo.defaultOgImageUrl) parts.push(`<meta property="og:image" content="${escapeHtml(seo.defaultOgImageUrl)}">`);
  return parts.length ? parts.join("\n") : null;
}

export async function getPublicHtmlSnapshot(pathname: string): Promise<PublicHtmlSnapshot | null> {
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/setup") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/api")
  ) {
    return null;
  }

  const [seo, page] = await Promise.all([storage.seoSettings.get(), findPublishedPage(pathname)]);
  if (!page) return null;

  const title = `${page.seoTitle || page.title}${seo?.titleSuffix ?? " | Viva CMS"}`;
  const description = page.seoDescription || seo?.defaultMetaDescription || textFromContent(page.content).slice(0, 155);
  const canonicalUrl = page.canonicalUrl || buildCanonical(pagePath(page), seo);
  const bodyText = textFromContent(page.content);

  return {
    title,
    description,
    canonicalUrl,
    ogImageUrl: page.ogImageUrl || seo?.defaultOgImageUrl || null,
    noindex: Boolean(page.noindex || seo?.defaultRobotsNoindex),
    bodyHtml: `<main class="seo-prerender-content"><h1>${escapeHtml(page.title)}</h1>${bodyText ? `<p>${escapeHtml(bodyText)}</p>` : ""}</main>`,
  };
}

export function injectPublicHtmlSnapshot(
  template: string,
  snapshot: PublicHtmlSnapshot | null,
  customHeadHtml?: string | null,
): string {
  const headParts: string[] = [];
  if (customHeadHtml) headParts.push(customHeadHtml);
  if (snapshot?.title) headParts.push(`<title>${escapeHtml(snapshot.title)}</title>`);
  if (snapshot?.description) headParts.push(`<meta name="description" content="${escapeHtml(snapshot.description)}">`);
  if (snapshot?.canonicalUrl) headParts.push(`<link rel="canonical" href="${escapeHtml(snapshot.canonicalUrl)}">`);
  if (snapshot?.ogImageUrl) headParts.push(`<meta property="og:image" content="${escapeHtml(snapshot.ogImageUrl)}">`);
  if (snapshot?.noindex) headParts.push(`<meta name="robots" content="noindex,nofollow">`);

  let html = template;
  if (headParts.length) {
    html = html.replace("</head>", `${headParts.join("\n")}\n</head>`);
  }
  if (snapshot?.bodyHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root"></div><div id="seo-prerender">${snapshot.bodyHtml}</div>`);
  }
  return html;
}
