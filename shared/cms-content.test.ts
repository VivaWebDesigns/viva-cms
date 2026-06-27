import { describe, expect, it } from "vitest";
import { stripSeedKeysFromCmsContent, syncSeedMediaReferences } from "./cms-content";

describe("CMS seed content helpers", () => {
  it("strips seedKey values from admin-saved content", () => {
    const content = {
      seedKey: "home",
      blocks: [
        {
          id: "hero",
          type: "hero",
          seedKey: "hero-seed",
          props: { heading: "Edited", seedKey: "hero-props" },
        },
      ],
    };

    expect(stripSeedKeysFromCmsContent(content)).toEqual({
      blocks: [
        {
          id: "hero",
          type: "hero",
          props: { heading: "Edited" },
        },
      ],
    });
  });

  it("syncs seeded hero media while preserving edited copy", () => {
    const existing = {
      blocks: [
        {
          id: "hero",
          type: "hero",
          props: {
            heading: "Edited H1",
            backgroundImageUrl: "/images/old-hero.webp",
          },
        },
      ],
    };
    const seeded = {
      blocks: [
        {
          id: "hero",
          type: "hero",
          props: {
            heading: "Seed H1",
            backgroundImageUrl: "/images/new-hero.webp",
          },
        },
      ],
    };

    const synced = syncSeedMediaReferences(existing, seeded);

    expect(synced).toEqual({
      blocks: [
        {
          id: "hero",
          type: "hero",
          props: {
            heading: "Edited H1",
            backgroundImageUrl: "/images/new-hero.webp",
          },
        },
      ],
    });
    expect(existing.blocks[0].props.backgroundImageUrl).toBe("/images/old-hero.webp");
  });

  it("syncs text-image media while preserving copy and button fields", () => {
    const existing = {
      blocks: [
        {
          id: "text-image",
          type: "text-image",
          props: {
            heading: "Edited heading",
            body: "Edited body",
            ctaText: "Edited CTA",
            imageUrl: "/images/old.webp",
          },
        },
      ],
    };
    const seeded = {
      blocks: [
        {
          id: "text-image",
          type: "text-image",
          props: {
            heading: "Seed heading",
            body: "Seed body",
            ctaText: "Seed CTA",
            imageUrl: "/images/new.webp",
          },
        },
      ],
    };

    expect(syncSeedMediaReferences(existing, seeded)).toEqual({
      blocks: [
        {
          id: "text-image",
          type: "text-image",
          props: {
            heading: "Edited heading",
            body: "Edited body",
            ctaText: "Edited CTA",
            imageUrl: "/images/new.webp",
          },
        },
      ],
    });
  });

  it("returns the original object when media already matches", () => {
    const existing = {
      blocks: [{ id: "hero", type: "hero", props: { backgroundImageUrl: "/images/hero.webp" } }],
    };
    const seeded = {
      blocks: [{ id: "hero", type: "hero", props: { backgroundImageUrl: "/images/hero.webp" } }],
    };

    expect(syncSeedMediaReferences(existing, seeded)).toBe(existing);
  });

  it("leaves unmatched blocks unchanged", () => {
    const existing = {
      blocks: [{ id: "custom", type: "custom-block", props: { imageUrl: "/images/manual.webp" } }],
    };
    const seeded = {
      blocks: [{ id: "hero", type: "hero", props: { imageUrl: "/images/seed.webp" } }],
    };

    expect(syncSeedMediaReferences(existing, seeded)).toBe(existing);
  });
});
