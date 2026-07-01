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

  it("does not overwrite an existing seeded hero background image", () => {
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
            backgroundImageUrl: "/images/old-hero.webp",
          },
        },
      ],
    });
    expect(existing.blocks[0].props.backgroundImageUrl).toBe("/images/old-hero.webp");
  });

  it("does not overwrite an existing text-image image URL", () => {
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
            imageUrl: "/images/old.webp",
          },
        },
      ],
    });
  });

  it("fills blank or missing seeded media fields without touching edited fields", () => {
    const existing = {
      blocks: [
        {
          id: "hero",
          type: "hero",
          props: {
            heading: "Edited H1",
            backgroundImageUrl: "",
            imageUrl: null,
          },
        },
        {
          id: "text-image",
          type: "text-image",
          props: {
            heading: "Edited heading",
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
            backgroundImageUrl: "/images/seed-hero.webp",
            imageUrl: "/images/seed-inline.webp",
          },
        },
        {
          id: "text-image",
          type: "text-image",
          props: {
            heading: "Seed heading",
            imageUrl: "/images/seed-text.webp",
          },
        },
      ],
    };

    expect(syncSeedMediaReferences(existing, seeded)).toEqual({
      blocks: [
        {
          id: "hero",
          type: "hero",
          props: {
            heading: "Edited H1",
            backgroundImageUrl: "/images/seed-hero.webp",
            imageUrl: "/images/seed-inline.webp",
          },
        },
        {
          id: "text-image",
          type: "text-image",
          props: {
            heading: "Edited heading",
            imageUrl: "/images/seed-text.webp",
          },
        },
      ],
    });
  });

  it("does not match blocks by index and type alone after seed ownership is gone", () => {
    const existing = {
      blocks: [
        {
          type: "hero",
          props: {
            backgroundImageUrl: "",
          },
        },
      ],
    };
    const seeded = {
      blocks: [
        {
          type: "hero",
          props: {
            backgroundImageUrl: "/images/seed-hero.webp",
          },
        },
      ],
    };

    expect(syncSeedMediaReferences(existing, seeded)).toBe(existing);
  });

  it("preserves focal points, crop fields, alt text, captions, and mobile image fields", () => {
    const existing = {
      blocks: [
        {
          seedKey: "hero-seed",
          type: "hero",
          props: {
            backgroundImageUrl: "",
            focalPoint: { x: 42, y: 58 },
            cropPosition: "center center",
            imageAlt: "Edited alt",
            caption: "Edited caption",
            mobileImageUrl: "/images/mobile-edited.webp",
          },
        },
      ],
    };
    const seeded = {
      blocks: [
        {
          seedKey: "hero-seed",
          type: "hero",
          props: {
            backgroundImageUrl: "/images/seed-hero.webp",
            focalPoint: { x: 10, y: 10 },
            cropPosition: "top left",
            imageAlt: "Seed alt",
            caption: "Seed caption",
            mobileImageUrl: "/images/mobile-seed.webp",
          },
        },
      ],
    };

    expect(syncSeedMediaReferences(existing, seeded)).toEqual({
      blocks: [
        {
          seedKey: "hero-seed",
          type: "hero",
          props: {
            backgroundImageUrl: "/images/seed-hero.webp",
            focalPoint: { x: 42, y: 58 },
            cropPosition: "center center",
            imageAlt: "Edited alt",
            caption: "Edited caption",
            mobileImageUrl: "/images/mobile-edited.webp",
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
