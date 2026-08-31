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
      expect(lesson.scenarios).toHaveLength(1);
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
    expect(stepIds.size).toBeGreaterThanOrEqual(24);
  });

  it("Docker 互动题按课程主题唯一且题目不泄露命令", () => {
    const dockerLessons = lessons.filter((lesson) => lesson.tool === "docker");
    expect(new Set(dockerLessons.map((lesson) => lesson.interactiveQuiz.question)).size).toBe(24);
    for (const lesson of dockerLessons) {
      expect(lesson.interactiveQuiz.type).toBeDefined();
      for (const scenario of lesson.scenarios) {
        for (const step of scenario.steps) {
          expect(step.prompt).not.toMatch(/docker\s|git\s|```|&&|\|\||--[a-z]/);
          expect(step.preparation.join(" ")).not.toMatch(/docker\s/);
        }
      }
    }
  });

  it("Docker 使用新课程路径并为每节明确主任务与变体", () => {
    const dockerLessons = lessons.filter((lesson) => lesson.tool === "docker");
    expect(dockerLessons.map((lesson) => lesson.slug)).toEqual([
      "install-engine",
      "hello-pull",
      "interactive",
      "background-naming",
      "lifecycle",
      "logs-exec-top",
      "web-port",
      "image-catalog",
      "image-cleanup",
      "dockerfile-basic",
      "dockerfile-instructions",
      "context-ignore",
      "layers-cache",
      "multi-stage",
      "volumes",
      "bind-mount",
      "network-dns",
      "config-env",
      "registry-tags",
      "compose-app",
      "compose-health",
      "resources-logs",
      "security-debug",
      "production-delivery",
    ]);
    for (const lesson of dockerLessons) {
      const steps = lesson.scenarios[0]!.steps;
      expect(steps.filter((step) => step.role === "main")).toHaveLength(1);
      expect(steps.filter((step) => step.role === "variant")).toHaveLength(1);
      for (const step of steps) {
        expect(step.diagnosisOrder.length).toBeGreaterThanOrEqual(3);
        expect(step.cleanupScope).toContain("commandlab-");
      }
    }
  });
});
