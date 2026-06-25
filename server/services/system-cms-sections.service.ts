import { logger } from "../utils/logger";

export async function ensureSystemCmsSections() {
  logger.cms.info("No starter sections are seeded for a clean CMS starter");

  return {
    created: 0,
    updated: 0,
    deleted: 0,
    total: 0,
  };
}
