import { storage } from "../storage";

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
    if (existing) continue;
    await storage.cmsPages.createPage(page);
  }
}
