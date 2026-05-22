import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn()", () => {
  // ── Basic class merging ──
  it("merges multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes via clsx syntax", () => {
    const result = cn("base", false && "hidden", "visible");
    expect(result).toBe("base visible");
    expect(result).not.toContain("hidden");
  });

  it("handles undefined and null values gracefully", () => {
    expect(cn("a", undefined, "b", null)).toBe("a b");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles a single class", () => {
    expect(cn("single")).toBe("single");
  });

  // ── Tailwind conflict resolution ──
  it("resolves Tailwind padding conflicts (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("resolves Tailwind margin conflicts", () => {
    expect(cn("m-2", "m-4")).toBe("m-4");
  });

  it("resolves Tailwind color conflicts", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("resolves Tailwind display conflicts", () => {
    expect(cn("flex", "inline-flex")).toBe("inline-flex");
  });

  it("resolves Tailwind sizing conflicts", () => {
    expect(cn("w-full", "w-1/2")).toBe("w-1/2");
  });

  it("preserves non-conflicting classes", () => {
    expect(cn("text-center", "font-bold", "px-4")).toBe("text-center font-bold px-4");
  });

  // ── Merge with arrays ──
  it("handles array of classes", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  // ── Merge with objects ──
  it("handles object syntax", () => {
    expect(cn({ "is-active": true, hidden: false }, "base")).toBe("is-active base");
  });
});
