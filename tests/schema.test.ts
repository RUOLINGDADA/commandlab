import { describe, expect, it } from "vitest";
import { lessonSchema } from "@commandlab/content-schema";

describe("课程 Schema", () => {
  it("拒绝指向不存在选项的答案索引", () => {
    const result = lessonSchema.safeParse({
      id: "git-01",
      tool: "git",
      slug: "demo",
      title: "示例课程",
      summary: "用于验证课程数据约束的完整示例摘要。",
      level: "入门",
      order: 1,
      duration: 20,
      objectives: ["目标一", "目标二"],
      prerequisites: [],
      commands: [{ command: "git status", description: "查看状态" }],
      pitfall: { symptom: "状态错误", cause: "原因", recovery: "恢复" },
      comparison: { items: ["a", "b"], guidance: "指导", risk: "风险", reversible: "可逆" },
      related: ["git help"],
      quiz: { question: "问题", options: ["A", "B"], answer: 3, explanation: "解释" },
      practice: {
        goal: "目标",
        steps: ["第一步", "第二步"],
        expected: "结果",
        hint: "提示",
        solution: "解法",
        variant: "变体",
      },
      platforms: ["windows", "macos", "linux"].map((platform) => ({
        platform,
        setup: ["setup"],
        verify: ["verify"],
        cleanup: ["cleanup"],
      })),
    });
    expect(result.success).toBe(false);
  });
});
