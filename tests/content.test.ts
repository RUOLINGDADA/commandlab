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

  it("Docker 每个实操步骤都具备答案、验证、清理和唯一编号", () => {
    const dockerLessons = lessons.filter((lesson) => lesson.tool === "docker");
    const stepIds = new Set<string>();
    for (const lesson of dockerLessons) {
      const minimumScenarios = lesson.level === "高级" || lesson.level === "精通" ? 2 : 1;
      expect(lesson.scenarios.length).toBeGreaterThanOrEqual(minimumScenarios);
      for (const scenario of lesson.scenarios) {
        expect(scenario.images.length).toBeGreaterThan(0);
        for (const step of scenario.steps) {
          expect(step.prompt.length).toBeGreaterThan(10);
          expect(step.answer.commands.length).toBeGreaterThan(0);
          expect(step.verify.length).toBeGreaterThan(0);
          expect(step.cleanup.length).toBeGreaterThan(0);
          expect(step.pitfalls.length).toBeGreaterThan(0);
          expect(step.variants.length).toBeGreaterThan(0);
          expect(stepIds.has(step.id)).toBe(false);
          stepIds.add(step.id);
        }
      }
    }
    expect(stepIds.size).toBeGreaterThanOrEqual(48);
  });
});
