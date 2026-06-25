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
});
