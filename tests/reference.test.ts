import { describe, expect, it } from "vitest";
import { loadReferences, validateContent } from "../apps/web/src/lib/content";
import { buildAnimationRegistry } from "../apps/web/src/lib/animations";

describe("工具百科", () => {
  const entries = loadReferences();

  it("Git 与 Docker 均提供可校验条目", () => {
    expect(entries.some((entry) => entry.tool === "git")).toBe(true);
    expect(entries.some((entry) => entry.tool === "docker")).toBe(true);
    expect(entries.filter((entry) => entry.tool === "docker").length).toBeGreaterThanOrEqual(15);
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

  it("命令百科提供完整语法和结构化参数解析", () => {
    for (const tool of ["git", "docker"] as const) {
      const toolEntries = entries.filter((entry) => entry.tool === tool);
      expect(toolEntries.length).toBeGreaterThanOrEqual(tool === "git" ? 20 : 24);
      expect(toolEntries.filter((entry) => entry.syntax && entry.parameters).length).toBe(
        toolEntries.length,
      );
      for (const entry of toolEntries) {
        expect(entry.syntax?.toLocaleLowerCase("en-US")).toContain(tool);
        expect(
          entry.parameters?.every(
            (parameter) => parameter.flag.length > 0 && parameter.description.length > 0,
          ),
        ).toBe(true);
      }
    }
  });

  it("每条百科命令都有唯一且至少三帧的专属动画", () => {
    const registry = buildAnimationRegistry(entries);
    expect(registry.size).toBe(entries.length);
    expect(new Set(Array.from(registry.values()).map((item) => item.id)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry.animation.frames.length).toBeGreaterThanOrEqual(3);
      expect(entry.animation.frames.every((frame) => frame.narration && frame.transition)).toBe(
        true,
      );
    }
  });

  it("Git 分支相关动画呈现分叉、切换、合并和重放语义", () => {
    for (const slug of ["branch", "switch", "merge", "rebase"]) {
      const entry = entries.find((item) => item.tool === "git" && item.slug === slug);
      expect(entry).toBeDefined();
      const text = entry!.animation.frames
        .map((frame) => `${frame.label} ${frame.narration} ${frame.transition}`)
        .join(" ");
      expect(text).toMatch(/分叉|切换|合并|重放|fork|switch|merge|replay/i);
    }
  });
});
