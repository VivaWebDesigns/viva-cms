import { createBlock, type BlockInstance } from "./block-registry";

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "starter" | "marketing" | "content";
  blockCount: number;
  blocks: () => BlockInstance[];
}

export interface WizardBlockOption {
  id: string;
  type: string;
  label: string;
  description: string;
  recommended: boolean;
}

export const LANDING_PAGE_GOALS = [
  { id: "capture-leads", label: "Capture Leads", description: "Introduce an offer and route visitors into a form." },
  { id: "explain-service", label: "Explain a Service", description: "Walk visitors through a clear value proposition." },
  { id: "launch-page", label: "Launch Page", description: "Publish a focused page for a new project or campaign." },
] as const;

export const AUDIENCE_OPTIONS = [
  { id: "customers", label: "Customers" },
  { id: "partners", label: "Partners" },
  { id: "teams", label: "Internal Teams" },
  { id: "community", label: "Community" },
  { id: "stakeholders", label: "Stakeholders" },
] as const;

function block(type: string, overrides?: Record<string, unknown>): BlockInstance {
  const b = createBlock(type);
  if (overrides) {
    b.props = { ...b.props, ...overrides };
  }
  return b;
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "blank",
    name: "Blank Page",
    description: "Start from scratch with an empty canvas",
    icon: "FileText",
    category: "starter",
    blockCount: 0,
    blocks: () => [],
  },
  {
    id: "landing-v1",
    name: "Landing Page",
    description: "Reusable landing page with hero, proof points, features, and CTA",
    icon: "Sparkles",
    category: "marketing",
    blockCount: 6,
    blocks: () => [
      block("hero", {
        heading: "Launch a Clear, Flexible Website",
        subheading: "Use this CMS starter to publish pages, manage content, and adapt the design for any project.",
        ctaText: "Get Started",
        ctaLink: "/contact",
        ctaSecondaryText: "Learn More",
        ctaSecondaryLink: "#features",
        minHeight: "520",
      }),
      block("trust-bar", {
        items: [
          { label: "Reusable Pages" },
          { label: "Flexible Forms" },
          { label: "Design Controls" },
          { label: "SEO Ready" },
        ],
      }),
      block("section-header", {
        eyebrow: "Features",
        title: "Everything Needed for a Lean CMS",
        subtitle: "Start with practical content blocks and extend the system as each project requires.",
      }),
      block("feature-list", {
        title: "",
        columns: "3",
        features: [
          { icon: "FileText", title: "Page Builder", description: "Create reusable pages with structured content blocks." },
          { icon: "LayoutTemplate", title: "Forms", description: "Collect submissions with reusable public forms." },
          { icon: "Palette", title: "Design Settings", description: "Manage brand, color, menu, and typography settings." },
        ],
      }),
      block("social-proof-stats", {
        stats: [
          { value: "CMS", label: "Viva CMS" },
          { value: "SEO", label: "Metadata Tools" },
          { value: "Forms", label: "Submission Capture" },
        ],
      }),
      block("cta", {
        heading: "Ready to Customize This Starter?",
        subheading: "Swap in project-specific content, publish pages, and keep the admin surface focused.",
        primaryText: "Contact Us",
        primaryLink: "/contact",
        variant: "dark",
      }),
    ],
  },
  {
    id: "content-story-v1",
    name: "Content Story",
    description: "Long-form page with rich text, media, feature sections, and FAQ",
    icon: "BookOpen",
    category: "content",
    blockCount: 5,
    blocks: () => [
      block("section-header", {
        eyebrow: "Overview",
        title: "Tell the Story Clearly",
        subtitle: "Combine editorial sections, supporting media, and structured answers.",
        alignment: "center",
      }),
      block("text-image", {
        heading: "A Flexible Foundation",
        body: "This starter keeps the CMS essentials while leaving room for each new project to define its own domain.",
        imageAlt: "Project preview",
        imagePosition: "right",
      }),
      block("rich-text", {
        content: "<h2>Reusable by Design</h2><p>Use pages, sections, media, forms, menus, sidebars, redirects, and SEO settings as the baseline for a new project.</p>",
        alignment: "left",
      }),
      block("faq", {
        title: "Common Questions",
        items: [
          { question: "Can this starter be customized?", answer: "<p>Yes. Add project-specific routes and data models only when a new project needs them.</p>" },
          { question: "Does it include public rendering?", answer: "<p>Published CMS pages render at their slug, with draft previews for authenticated users.</p>" },
        ],
      }),
      block("cta", {
        heading: "Build With Viva CMS",
        subheading: "Keep the CMS reusable, then layer on project-specific features deliberately.",
        primaryText: "Start a Page",
        primaryLink: "/admin/cms/pages",
        variant: "accent",
      }),
    ],
  },
];

const WIZARD_BLOCKS: WizardBlockOption[] = [
  { id: "hero", type: "hero", label: "Hero", description: "Lead with a headline, supporting copy, and primary CTA.", recommended: true },
  { id: "trust-bar", type: "trust-bar", label: "Trust Bar", description: "Show a compact row of confidence-building points.", recommended: true },
  { id: "features", type: "feature-list", label: "Feature List", description: "Explain the most important benefits.", recommended: true },
  { id: "stats", type: "social-proof-stats", label: "Stats", description: "Highlight a few metrics or proof points.", recommended: false },
  { id: "faq", type: "faq", label: "FAQ", description: "Answer common questions before the CTA.", recommended: false },
  { id: "cta", type: "cta", label: "CTA", description: "Close with a strong next step.", recommended: true },
];

export function getRecommendedBlocks(_goalId: string): WizardBlockOption[] {
  return WIZARD_BLOCKS;
}

export function generateLandingPageBlocks(
  _goalId: string,
  headline: string,
  subheadline: string,
  audienceIds: string[],
  selectedBlockIds: string[],
  ctaText: string,
  ctaLink: string,
): BlockInstance[] {
  const audienceLabels = AUDIENCE_OPTIONS
    .filter((audience) => audienceIds.includes(audience.id))
    .map((audience) => audience.label);
  const audienceText = audienceLabels.length ? `Built for ${audienceLabels.join(", ")}.` : "";
  const selected = WIZARD_BLOCKS.filter((option) => selectedBlockIds.includes(option.id));

  return selected.map((option) => {
    if (option.type === "hero") {
      return block("hero", {
        heading: headline || "Launch a Clear, Flexible Website",
        subheading: subheadline || audienceText || "Publish pages, collect submissions, and adapt this CMS for any project.",
        ctaText: ctaText || "Get Started",
        ctaLink: ctaLink || "/contact",
      });
    }

    if (option.type === "trust-bar") {
      return block("trust-bar", {
        items: [
          { label: "Reusable CMS" },
          { label: "Content Blocks" },
          { label: "Forms" },
          { label: "SEO Tools" },
        ],
      });
    }

    if (option.type === "feature-list") {
      return block("feature-list", {
        title: "What This Page Can Do",
        subtitle: "Keep the message focused and the editing workflow simple.",
        columns: "3",
        features: [
          { icon: "FileText", title: "Structured Content", description: "Use reusable sections and page blocks." },
          { icon: "LayoutTemplate", title: "Flexible Forms", description: "Embed public forms wherever visitors need them." },
          { icon: "Palette", title: "Design Controls", description: "Adapt brand and presentation per project." },
        ],
      });
    }

    if (option.type === "social-proof-stats") {
      return block("social-proof-stats", {
        stats: [
          { value: "Pages", label: "CMS Publishing" },
          { value: "Forms", label: "Submission Capture" },
          { value: "SEO", label: "Metadata Controls" },
        ],
      });
    }

    if (option.type === "faq") {
      return block("faq", {
        title: "Questions",
        items: [
          { question: "Can this page be customized?", answer: "<p>Yes. Edit every block from the CMS page builder.</p>" },
          { question: "Can I collect submissions?", answer: "<p>Yes. Add a form embed block or route visitors to a form page.</p>" },
        ],
      });
    }

    return block("cta", {
      heading: "Ready to Continue?",
      subheading: audienceText || "Give visitors a clear next step.",
      primaryText: ctaText || "Get Started",
      primaryLink: ctaLink || "/contact",
      variant: "dark",
    });
  });
}
