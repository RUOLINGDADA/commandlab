import { describe, expect, it } from "vitest";
import { loadReferences, validateContent } from "../apps/web/src/lib/content";

describe("工具百科", () => {
  const entries = loadReferences();

  it("Git 与 Docker 均提供可校验条目", () => {
    expect(entries.some((entry) => entry.tool === "git")).toBe(true);
    expect(entries.some((entry) => entry.tool === "docker")).toBe(true);
    expect(entries.filter((entry) => entry.tool === "docker")).toHaveLength(15);
    expect(entries.filter((entry) => entry.tool === "docker").map((entry) => entry.slug)).toEqual(
      expect.arrayContaining([
        "run",
        "ps",
        "logs",
        "exec",
        "stop",
        "start",
        "rm",
        "image",
        "build",
        "tag",
        "volume",
        "network",
        "compose",
        "inspect",
        "stats",
      ]),
    );
  });

  it("百科相关课程编号均存在", () => {
    const ids = new Set(validateContent().map((lesson) => lesson.id));
    for (const entry of entries) {
      expect(entry.body.length).toBeGreaterThan(30);
      expect(entry.examples.length).toBeGreaterThan(0);
      expect(entry.relatedLessons.every((id) => ids.has(id))).toBe(true);
    }
  });
});
