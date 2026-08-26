import { describe, expect, it } from "vitest";
import { validateContent } from "../apps/web/src/lib/content";

describe("课程内容", () => {
  const lessons = validateContent();

  it("Git 与 Docker 各包含 24 节课", () => {
    expect(lessons).toHaveLength(48);
    expect(lessons.filter((lesson) => lesson.tool === "git")).toHaveLength(24);
    expect(lessons.filter((lesson) => lesson.tool === "docker")).toHaveLength(24);
  });

  it("每个等级恰好包含六节课", () => {
    for (const tool of ["git", "docker"] as const) {
      for (const level of ["入门", "进阶", "高级", "精通"] as const) {
        expect(
          lessons.filter((lesson) => lesson.tool === tool && lesson.level === level),
        ).toHaveLength(6);
      }
    }
  });

  it("每节课具有三平台指引和足够正文", () => {
    for (const lesson of lessons) {
      expect(new Set(lesson.platforms.map((guide) => guide.platform)).size).toBe(3);
      expect(lesson.body.length).toBeGreaterThan(120);
      expect(lesson.platforms.every((guide) => guide.cleanup.length > 0)).toBe(true);
    }
  });
});
