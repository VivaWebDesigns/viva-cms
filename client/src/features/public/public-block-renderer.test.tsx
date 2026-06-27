// @vitest-environment jsdom

import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { PublicBlockRenderer } from "@/features/public/public-block-renderer";

function findGradient(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>("section > div")).find((element) =>
    element.getAttribute("style")?.includes("linear-gradient"),
  );
}

describe("PublicBlockRenderer hero", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    (globalThis as typeof globalThis & { React?: typeof React; IS_REACT_ACT_ENVIRONMENT?: boolean }).React = React;
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    root = null;
    container.remove();
    document.body.innerHTML = "";
  });

  it("applies image opacity, bottom gradient, and right alignment", async () => {
    root = createRoot(container);

    await act(async () => {
      root!.render(
        React.createElement(PublicBlockRenderer, {
          block: {
            id: "hero-1",
            type: "hero",
            props: {
              heading: "Reusable CMS",
              subheading: "<p>Structured content that can travel.</p>",
              ctaText: "Start",
              ctaLink: "/",
              ctaAction: "internal-link",
              backgroundImageUrl: "/uploads/hero.jpg",
              backgroundImageOpacity: 42,
              backgroundPositionX: 30,
              backgroundPositionY: 70,
              overlayOpacity: 25,
              gradientEnabled: true,
              gradientColor: "#102234",
              gradientOpacity: 80,
              gradientHeight: 35,
              alignment: "right",
            },
          },
        }),
      );
    });

    const section = container.querySelector("section");
    expect(section?.className).toContain("text-right");
    expect(container.querySelector("img")?.getAttribute("style")).toContain("opacity: 0.42");
    expect(container.querySelector("img")?.getAttribute("style")).toContain("object-position: 30% 70%");
    expect(findGradient(container)?.getAttribute("style")).toContain("linear-gradient");
    expect(container.querySelector('[data-testid="hero-cta-primary"]')).not.toBeNull();
    expect(section?.innerHTML).toContain("justify-end");
  });

  it("can disable the hero bottom gradient", async () => {
    root = createRoot(container);

    await act(async () => {
      root!.render(
        React.createElement(PublicBlockRenderer, {
          block: {
            id: "hero-2",
            type: "hero",
            props: {
              heading: "Reusable CMS",
              backgroundImageUrl: "/uploads/hero.jpg",
              gradientEnabled: false,
            },
          },
        }),
      );
    });

    expect(findGradient(container)).toBeUndefined();
  });
});
