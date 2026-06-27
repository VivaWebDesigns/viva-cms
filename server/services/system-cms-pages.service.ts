import { storage } from "../storage";
import { syncSeedMediaReferences } from "@shared/cms-content";

const defaultPages = [
  {
    title: "Home",
    slug: "home",
    pageType: "home",
    status: "published",
    template: "full-width",
    seoTitle: "Home",
    seoDescription: "",
    content: { blocks: [] },
  },
];

export async function ensureSystemCmsPages() {
  for (const page of defaultPages) {
    const existing = await storage.cmsPages.getPageBySlug(page.slug);
    if (existing) {
      const syncedContent = syncSeedMediaReferences(existing.content, page.content);
      if (syncedContent !== existing.content) {
        await storage.cmsPages.updatePage(existing.id, { content: syncedContent as Record<string, unknown> });
      }
      continue;
    }
    await storage.cmsPages.createPage(page);
  }
}
