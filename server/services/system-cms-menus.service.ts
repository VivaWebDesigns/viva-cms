import { randomUUID } from "crypto";
import { storage } from "../storage";
import type { InsertCmsMenu, MenuItem, StandardMenuLocation } from "@shared/schema";

function id() {
  return randomUUID();
}

function item(label: string, url: string, children: MenuItem[] = [], openInNewTab = false): MenuItem {
  return {
    id: id(),
    label,
    url,
    openInNewTab,
    children,
  };
}

const defaultMenus: Array<InsertCmsMenu & { location: StandardMenuLocation }> = [
  {
    name: "Main Navigation",
    location: "main_navigation",
    items: [
      item("Home", "/"),
      item("Login", "/auth/login"),
    ],
  },
];

export async function ensureSystemCmsMenus() {
  const menus = await storage.cmsMenus.getAll();
  const assignedLocations = new Set(menus.map((menu) => menu.location));
  const hasMainNavigation = assignedLocations.has("main_navigation");

  if (hasMainNavigation) return;

  for (const menu of defaultMenus) {
    await storage.cmsMenus.create(menu);
  }
}
