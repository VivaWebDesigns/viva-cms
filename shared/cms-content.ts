const SEED_KEY = "seedKey";
const APPROVED_MEDIA_FIELDS = new Set(["backgroundImageUrl", "imageUrl"]);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function stripSeedKeysFromCmsContent<T>(content: T): T {
  if (Array.isArray(content)) {
    return content.map((item) => stripSeedKeysFromCmsContent(item)) as T;
  }

  if (!isPlainRecord(content)) return content;

  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(content)) {
    if (key === SEED_KEY) continue;
    next[key] = stripSeedKeysFromCmsContent(value);
  }
  return next as T;
}

function getBlockList(content: unknown): Record<string, unknown>[] | null {
  if (!isPlainRecord(content) || !Array.isArray(content.blocks)) return null;
  return content.blocks.filter(isPlainRecord);
}

function sameBlockIdentity(existing: Record<string, unknown>, seeded: Record<string, unknown>) {
  if (typeof existing.id === "string" && typeof seeded.id === "string") {
    return existing.id === seeded.id;
  }

  if (typeof existing.seedKey === "string" && typeof seeded.seedKey === "string") {
    return existing.seedKey === seeded.seedKey;
  }

  return false;
}

function isBlankMediaValue(value: unknown) {
  return value === undefined || value === null || value === "";
}

function syncMediaFields(
  existing: Record<string, unknown>,
  seeded: Record<string, unknown>,
): { value: Record<string, unknown>; changed: boolean } {
  let changed = false;
  const next: Record<string, unknown> = { ...existing };

  for (const field of APPROVED_MEDIA_FIELDS) {
    if (typeof seeded[field] === "string" && isBlankMediaValue(existing[field])) {
      next[field] = seeded[field];
      changed = true;
    }
  }

  return { value: next, changed };
}

function syncBlockProps(
  existingBlock: Record<string, unknown>,
  seededBlock: Record<string, unknown>,
): { value: Record<string, unknown>; changed: boolean } {
  const existingProps = isPlainRecord(existingBlock.props) ? existingBlock.props : {};
  const seededProps = isPlainRecord(seededBlock.props) ? seededBlock.props : {};
  const syncedProps = syncMediaFields(existingProps, seededProps);
  if (!syncedProps.changed) return { value: existingBlock, changed: false };
  return { value: { ...existingBlock, props: syncedProps.value }, changed: true };
}

export function syncSeedMediaReferences<T>(existingContent: T, seededContent: unknown): T {
  const existingBlocks = getBlockList(existingContent);
  const seededBlocks = getBlockList(seededContent);

  if (!existingBlocks || !seededBlocks || existingBlocks.length === 0 || seededBlocks.length === 0) {
    return existingContent;
  }

  let changed = false;
  const usedSeedIndexes = new Set<number>();
  const nextBlocks = existingBlocks.map((existingBlock) => {
    const matchingSeedIndex = seededBlocks.findIndex((seededBlock, seededIndex) => {
      if (usedSeedIndexes.has(seededIndex)) return false;
      return sameBlockIdentity(existingBlock, seededBlock);
    });

    if (matchingSeedIndex === -1) return existingBlock;

    usedSeedIndexes.add(matchingSeedIndex);
    const synced = syncBlockProps(existingBlock, seededBlocks[matchingSeedIndex]);
    if (synced.changed) changed = true;
    return synced.value;
  });

  if (!changed || !isPlainRecord(existingContent)) return existingContent;
  return { ...existingContent, blocks: nextBlocks } as T;
}
