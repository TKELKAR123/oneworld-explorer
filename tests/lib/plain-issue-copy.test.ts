import { describe, expect, it } from "vitest";
import { plainIssueHeadline } from "../../apps/web/lib/plain-issue-copy";

describe("plain-issue-copy", () => {
  it("maps stopover rule without section symbol in headline", () => {
    const h = plainIssueHeadline({
      code: "R3015-8-stopovers",
      severity: "error",
      message: "Minimum 2 stopovers required; detected 1 per §8.",
    });
    expect(h).not.toMatch(/§/);
    expect(h).toMatch(/stopover/i);
  });

  it("falls back to message cleanup", () => {
    const h = plainIssueHeadline({
      code: "R3015-4k-transcon",
      severity: "error",
      message: "Too many US transcontinental sectors per §4(k).",
    });
    expect(h).not.toMatch(/§/);
  });
});
