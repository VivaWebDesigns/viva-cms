import { describe, expect, it } from "vitest";
import { getBlockDef, normalizeBlockType } from "@/features/admin/cms/builder/block-registry";
import { createFallbackBlockDef } from "@/features/admin/cms/builder/block-editor";

describe("block registry compatibility helpers", () => {
  it("normalizes known block aliases to current block types", () => {
    expect(normalizeBlockType("call-to-action")).toBe("cta");
    expect(normalizeBlockType("cta-banner")).toBe("cta");
    expect(getBlockDef("call-to-action")?.type).toBe("cta");
    expect(getBlockDef("cta-banner")?.type).toBe("cta");
  });

  it("creates a compatibility editor definition from primitive block props", () => {
    const fallbackDef = createFallbackBlockDef("unknown-cta", {
      heading: "Join us",
      primaryLink: "/join",
      enableHoverMotion: true,
      limit: 5,
    });

    expect(fallbackDef.label).toContain("Compatibility Mode");
    expect(fallbackDef.propDefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "heading", type: "text" }),
        expect.objectContaining({ key: "primaryLink", type: "url" }),
        expect.objectContaining({ key: "enableHoverMotion", type: "boolean" }),
        expect.objectContaining({ key: "limit", type: "number" }),
      ]),
    );
  });

  it("exposes reusable hero darkness and alignment controls", () => {
    const hero = getBlockDef("hero");
    expect(hero).toBeTruthy();
    expect(hero?.defaultProps).toEqual(
      expect.objectContaining({
        backgroundImageOpacity: 55,
        overlayOpacity: 30,
        gradientEnabled: true,
        gradientColor: "#102234",
        gradientOpacity: 75,
        gradientHeight: 40,
        alignment: "center",
      }),
    );
    expect(hero?.propDefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "backgroundImageOpacity", type: "number", min: 0, max: 100 }),
        expect.objectContaining({ key: "gradientEnabled", type: "boolean" }),
        expect.objectContaining({ key: "gradientColor", type: "color" }),
        expect.objectContaining({ key: "gradientOpacity", type: "number", min: 0, max: 100 }),
        expect.objectContaining({ key: "gradientHeight", type: "number", min: 0, max: 100 }),
        expect.objectContaining({ key: "alignment", type: "select" }),
      ]),
    );
  });
});
