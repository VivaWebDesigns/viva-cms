import type { BuilderContent } from "./block-registry";

export const mixedBuilderFixture: BuilderContent = {
  blocks: [
    {
      id: "hero-block",
      type: "hero",
      props: {
        heading: "Build a Reusable CMS Page",
        subheading: "<p>Compose reusable sections for any project.</p>",
        layout: "stacked",
      },
    },
    {
      id: "cta-alias-block",
      type: "call-to-action",
      props: {
        heading: "Start With Viva CMS",
        body: "<p>Use pages, forms, media, and design controls as the baseline.</p>",
        ctaText: "Start Now",
      },
    },
    {
      id: "faq-block",
      type: "faq",
      props: {
        heading: "Common Questions",
        items: [
          { question: "How do I publish?", answer: "<p>Create a page, add blocks, then set it to published.</p>" },
        ],
      },
    },
  ],
};

export const fixtureWithBrokenPreview: BuilderContent = {
  blocks: [
    ...mixedBuilderFixture.blocks,
    {
      id: "broken-preview-block",
      type: "missing-preview",
      props: {
        heading: "Unknown Preview",
      },
    },
  ],
};
