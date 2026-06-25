export interface CmsBuilderBlock {
  id: string;
  type: string;
  props?: Record<string, unknown> | null;
}

export const UNSUPPORTED_CMS_BLOCK_TYPES = new Set([
  "featured-professionals",
  "featured-counselors",
  "events-preview",
  "blog-preview",
  "therapist-map",
  "blog-post-feed",
  "blog-featured-post",
  "standard-blog-page",
  "events-archive",
  "video-archives",
  "directory-browser",
  "join-hero",
  "join-registration-form",
]);

export function filterUnsupportedCmsBlocks<T extends CmsBuilderBlock>(blocks: T[]): T[] {
  return blocks.filter((block) => !UNSUPPORTED_CMS_BLOCK_TYPES.has(block.type));
}
