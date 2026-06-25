import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const STANDARD_MENU_LOCATIONS = [
  "main_navigation",
  "footer_primary",
  "footer_secondary",
  "footer_tertiary",
  "footer_legal",
] as const;

export const MENU_LOCATIONS = [
  ...STANDARD_MENU_LOCATIONS,
  "unassigned",
] as const;

export type StandardMenuLocation = (typeof STANDARD_MENU_LOCATIONS)[number];
export type MenuLocation = (typeof MENU_LOCATIONS)[number];

export const MENU_LOCATION_LABELS: Record<MenuLocation, string> = {
  main_navigation: "Main Navigation",
  footer_primary: "Footer Primary Column",
  footer_secondary: "Footer Secondary Column",
  footer_tertiary: "Footer Tertiary Column",
  footer_legal: "Footer Legal Links",
  unassigned: "Unassigned",
};

export const PUBLIC_MENU_LOCATIONS = [
  ...STANDARD_MENU_LOCATIONS,
] as const;

export type PublicMenuLocation = (typeof PUBLIC_MENU_LOCATIONS)[number];

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
  children: MenuItem[];
}

export const menuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string().min(1),
    url: z.string().min(1),
    openInNewTab: z.preprocess((v) => v ?? false, z.boolean()),
    children: z.preprocess((v) => v ?? [], z.array(menuItemSchema)),
  })
) as z.ZodType<MenuItem>;

export const cmsMenus = pgTable("cms_menus", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull().default("unassigned"),
  items: jsonb("items").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCmsMenuSchema = createInsertSchema(cmsMenus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCmsMenu = z.infer<typeof insertCmsMenuSchema>;
export type CmsMenu = typeof cmsMenus.$inferSelect;
