import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../utils/logger", () => ({
  logger: {
    app: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe("ensureSystemForms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not seed starter forms on a clean install", async () => {
    const mod = await import("../services/system-forms.service");
    await expect(mod.ensureSystemForms()).resolves.toBeUndefined();
  });
});
