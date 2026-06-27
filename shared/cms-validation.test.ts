import { describe, expect, it } from "vitest";
import { isValidCanonicalUrl } from "./cms-validation";

describe("CMS canonical URL validation", () => {
  it("accepts blank, absolute, and root-relative canonical URLs", () => {
    expect(isValidCanonicalUrl("")).toBe(true);
    expect(isValidCanonicalUrl("https://example.com/page")).toBe(true);
    expect(isValidCanonicalUrl("http://example.com/page")).toBe(true);
    expect(isValidCanonicalUrl("/")).toBe(true);
    expect(isValidCanonicalUrl("/services/")).toBe(true);
  });

  it("rejects invalid canonical URLs", () => {
    expect(isValidCanonicalUrl("not a url")).toBe(false);
    expect(isValidCanonicalUrl("ftp://example.com/file")).toBe(false);
    expect(isValidCanonicalUrl("//example.com/path")).toBe(false);
  });
});
