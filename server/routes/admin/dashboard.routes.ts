import { Router } from "express";
import { desc, sql } from "drizzle-orm";
import { db } from "../../db";
import { asyncHandler } from "../../middleware/error-handler";
import { activityLogs, cmsFormSubmissions, cmsForms, cmsMedia, cmsPages, cmsSections, users } from "@shared/schema";

const router = Router();

router.get(
  "/dashboard-stats",
  asyncHandler(async (_req, res) => {
    const [
      totalPages,
      publishedPages,
      draftPages,
      mediaAssets,
      sections,
      forms,
      submissions,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(cmsPages),
      db.select({ count: sql<number>`count(*)` }).from(cmsPages).where(sql`${cmsPages.status} = 'published'`),
      db.select({ count: sql<number>`count(*)` }).from(cmsPages).where(sql`${cmsPages.status} = 'draft'`),
      db.select({ count: sql<number>`count(*)` }).from(cmsMedia),
      db.select({ count: sql<number>`count(*)` }).from(cmsSections),
      db.select({ count: sql<number>`count(*)` }).from(cmsForms),
      db.select({ count: sql<number>`count(*)` }).from(cmsFormSubmissions),
    ]);

    res.json({
      totalPages: Number(totalPages[0]?.count ?? 0),
      publishedPages: Number(publishedPages[0]?.count ?? 0),
      draftPages: Number(draftPages[0]?.count ?? 0),
      mediaAssets: Number(mediaAssets[0]?.count ?? 0),
      sections: Number(sections[0]?.count ?? 0),
      forms: Number(forms[0]?.count ?? 0),
      submissions: Number(submissions[0]?.count ?? 0),
    });
  }),
);

router.get(
  "/dashboard-activity",
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        details: activityLogs.details,
        createdAt: activityLogs.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(activityLogs)
      .leftJoin(users, sql`${activityLogs.userId} = ${users.id}`)
      .orderBy(desc(activityLogs.createdAt))
      .limit(12);

    res.json(
      rows.map((row) => ({
        id: row.id,
        action: row.action,
        details: row.details,
        createdAt: row.createdAt,
        userName:
          row.firstName || row.lastName
            ? `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim()
            : row.email || "System",
      })),
    );
  }),
);

export default router;
