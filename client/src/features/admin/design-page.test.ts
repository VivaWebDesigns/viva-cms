import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import AdminDesignPage from "@/features/admin/design-page";

describe("AdminDesignPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders branding view without throwing", () => {
    (globalThis as typeof globalThis & { React?: typeof React }).React = React;
    vi.stubGlobal("location", { pathname: "/admin/design/branding", search: "", hash: "" });
    const client = new QueryClient();

    expect(() =>
      renderToString(
        React.createElement(
          QueryClientProvider,
          { client },
          React.createElement(AdminDesignPage, { initialSubview: "branding" }),
        ),
      ),
    ).not.toThrow();
  });

  it("renders the restored typography picker UI", () => {
    (globalThis as typeof globalThis & { React?: typeof React }).React = React;
    vi.stubGlobal("location", { pathname: "/admin/design/typography", search: "", hash: "" });
    const client = new QueryClient();
    client.setQueryData(["/api/admin/settings"], {
      branding: {
        frontend_heading_font: { value: "manrope", isSecret: false },
        frontend_body_font: { value: "inter", isSecret: false },
      },
    });

    const html = renderToString(
      React.createElement(
        QueryClientProvider,
        { client },
        React.createElement(AdminDesignPage, { initialSubview: "typography" }),
      ),
    );

    expect(html).toContain("Frontend Typography");
    expect(html).toContain("Heading Font Picker");
    expect(html).toContain("Body Font Picker");
    expect(html).toContain("Save Typography");
    expect(html).toContain("Manrope");
    expect(html).toContain("Inter");
    expect(html).toContain("The right words should feel understood.");
  });
});
