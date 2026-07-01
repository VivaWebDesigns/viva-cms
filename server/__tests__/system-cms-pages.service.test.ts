import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPageBySlug: vi.fn(),
  updatePage: vi.fn(),
  createPage: vi.fn(),
}));

vi.mock("../storage", () => ({
  storage: {
    cmsPages: {
      getPageBySlug: mocks.getPageBySlug,
      updatePage: mocks.updatePage,
      createPage: mocks.createPage,
    },
  },
}));

describe("ensureSystemCmsPages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates the default home page when it is missing", async () => {
    mocks.getPageBySlug.mockResolvedValue(undefined);

    const { ensureSystemCmsPages } = await import("../services/system-cms-pages.service");

    await ensureSystemCmsPages();

    expect(mocks.createPage).toHaveBeenCalledWith({
      title: "Home",
      slug: "home",
      pageType: "home",
      status: "published",
      template: "full-width",
      seoTitle: "Home",
      seoDescription: "",
      content: { blocks: [] },
    });
    expect(mocks.updatePage).not.toHaveBeenCalled();
  });

  it("does not change existing page content during normal startup", async () => {
    const existingPage = {
      id: "page-home",
      slug: "home",
      content: {
        blocks: [
          {
            id: "hero",
            type: "hero",
            props: {
              heading: "Edited H1",
              backgroundImageUrl: "/images/admin-hero.webp",
              imageUrl: "/images/admin-inline.webp",
              focalPoint: { x: 36, y: 64 },
              cropPosition: "center center",
              imageAlt: "Admin alt",
              caption: "Admin caption",
              mobileImageUrl: "/images/admin-mobile.webp",
            },
          },
        ],
      },
    };
    mocks.getPageBySlug.mockResolvedValue(existingPage);

    const { ensureSystemCmsPages } = await import("../services/system-cms-pages.service");

    await ensureSystemCmsPages();

    expect(mocks.updatePage).not.toHaveBeenCalled();
    expect(mocks.createPage).not.toHaveBeenCalled();
    expect(existingPage.content.blocks[0].props).toEqual({
      heading: "Edited H1",
      backgroundImageUrl: "/images/admin-hero.webp",
      imageUrl: "/images/admin-inline.webp",
      focalPoint: { x: 36, y: 64 },
      cropPosition: "center center",
      imageAlt: "Admin alt",
      caption: "Admin caption",
      mobileImageUrl: "/images/admin-mobile.webp",
    });
  });
});
