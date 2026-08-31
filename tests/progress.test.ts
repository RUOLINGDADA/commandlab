import "fake-indexeddb/auto";
import { beforeAll, describe, expect, it } from "vitest";

describe("本地学习进度", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true });
  });

  it("合并更新时保留未修改字段", async () => {
    const runtime = await import("@commandlab/practice-runtime");
    await runtime.updateLessonProgress("git-01", { favorite: true, note: "三棵树" });
    const next = await runtime.updateLessonProgress("git-01", { completed: true });
    expect(next.favorite).toBe(true);
    expect(next.note).toBe("三棵树");
    expect(next.completed).toBe(true);
  });

  it("Docker 步骤完成记录可持久化并兼容旧记录", async () => {
    const runtime = await import("@commandlab/practice-runtime");
    await runtime.updateLessonProgress("docker-01", { completedSteps: ["step-install-engine-1"] });
    const next = await runtime.updateLessonProgress("docker-01", {
      completedSteps: ["step-install-engine-1", "step-install-engine-2"],
    });
    expect(next.completedSteps).toEqual(["step-install-engine-1", "step-install-engine-2"]);
    expect((await runtime.getLessonProgress("docker-01")).completedSteps).toContain(
      "step-install-engine-2",
    );
  });
});
