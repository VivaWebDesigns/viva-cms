import type { Express } from "express";
import { logger } from "../utils/logger";
import { storage } from "../storage/index";
import { buildRobotsTxtPayload } from "../services/robots-txt.service";
import adminRoutes from "./admin/index";
import authRoutes from "./auth.routes";
import cmsPublicRoutes from "./cms-public.routes";
import docsRoutes from "./docs.routes";
import formsRoutes from "./forms.routes";
import r2PublicRoutes from "./r2-public.routes";
import settingsRoutes from "./settings.routes";
import setupRoutes from "./setup.routes";
import uploadRoutes from "./upload.routes";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function registerApiRoutes(app: Express) {
  app.use("/r2", r2PublicRoutes);
  app.use("/object-storage", r2PublicRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/setup", setupRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/admin", settingsRoutes);
  app.use("/api/admin/docs", docsRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api/forms", formsRoutes);
  app.use("/api/cms", cmsPublicRoutes);

  app.get("/api/branding", async (_req, res) => {
    try {
      const branding = await storage.settings.getDecryptedCategory("branding");
      res.json({
        frontendLogoUrl: branding.frontend_logo_url || null,
        faviconUrl: branding.favicon_url || null,
        companyName: branding.company_name || null,
        companyAddress: branding.company_address || null,
        companyPhoneNumbers: branding.company_phone_numbers || null,
        companyGoogleBusinessUrl: branding.company_google_business_url || null,
        bodyFont: branding.frontend_body_font || null,
        headingFont: branding.frontend_heading_font || null,
        primaryColor: branding.brand_primary_color || null,
        secondaryColor: branding.brand_secondary_color || null,
        tertiaryColor: branding.brand_tertiary_color || null,
        quaternaryColor: branding.brand_quaternary_color || "#A8623A",
        h1Color: branding.text_h1_color || null,
        h2Color: branding.text_h2_color || null,
        h3ToH6Color: branding.text_h3_h6_color || null,
        bodyTextColor: branding.text_body_color || null,
        headingSubtextColor:
          branding.text_heading_subtext_color || branding.text_muted_color || null,
        supportingCopyColor:
          branding.text_supporting_copy_color || branding.text_muted_color || null,
        helperTextColor: branding.text_helper_text_color || branding.text_muted_color || null,
        metaTextColor: branding.text_meta_color || null,
        linkColor: branding.text_link_color || null,
        linkHoverColor: branding.text_link_hover_color || null,
        inverseTextColor: branding.text_inverse_color || null,
        primaryTextColor: branding.text_primary_foreground_color || null,
        secondaryTextColor: branding.text_secondary_foreground_color || null,
        tertiaryTextColor: branding.text_tertiary_foreground_color || null,
      });
    } catch (err) {
      logger.app.warn("Failed to retrieve branding settings, returning defaults", {
        error: err instanceof Error ? err.message : String(err),
      });
      res.json({
        frontendLogoUrl: null,
        faviconUrl: null,
        companyName: null,
        companyAddress: null,
        companyPhoneNumbers: null,
        companyGoogleBusinessUrl: null,
        bodyFont: null,
        headingFont: null,
        primaryColor: null,
        secondaryColor: null,
        tertiaryColor: null,
        quaternaryColor: "#A8623A",
        h1Color: null,
        h2Color: null,
        h3ToH6Color: null,
        bodyTextColor: null,
        headingSubtextColor: null,
        supportingCopyColor: null,
        helperTextColor: null,
        metaTextColor: null,
        linkColor: null,
        linkHoverColor: null,
        inverseTextColor: null,
        primaryTextColor: null,
        secondaryTextColor: null,
        tertiaryTextColor: null,
      });
    }
  });

  app.get("/api/runtime-integrations", async (_req, res) => {
    res.json({ ga4MeasurementId: null });
  });

  app.get("/api/seo/global", async (_req, res) => {
    const settings = await storage.seoSettings.get();
    res.json(settings ?? {});
  });

  app.get("/robots.txt", async (_req, res) => {
    try {
      const seoSettings = await storage.seoSettings.get();
      const { effectiveContent } = buildRobotsTxtPayload(seoSettings);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(effectiveContent);
    } catch {
      res.status(500).send("Error generating robots.txt");
    }
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const [seoSettings, pages] = await Promise.all([
        storage.seoSettings.get(),
        storage.cmsPages.getAllPages(),
      ]);
      const base = seoSettings?.siteUrl?.replace(/\/$/, "") || "";
      const urls = pages
        .filter((page) => page.status === "published" && !page.noindex)
        .map((page) => {
          const path = page.slug === "home" ? "/" : `/${page.slug.replace(/^\//, "")}`;
          return {
            loc: `${base}${path}`,
            lastmod: page.updatedAt ? new Date(page.updatedAt).toISOString() : undefined,
            changefreq: page.slug === "home" ? "weekly" : "monthly",
            priority: page.slug === "home" ? "1.0" : "0.7",
          };
        });

      const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map(
          (url) =>
            `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>\n` : ""}    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`,
        )
        .join("\n")}\n</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(body);
    } catch (err) {
      logger.app.error("Failed to generate sitemap", err);
      res.status(500).send("Error generating sitemap");
    }
  });
}
