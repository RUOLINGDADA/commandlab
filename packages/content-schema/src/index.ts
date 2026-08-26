import { z } from "zod";

export const toolSchema = z.enum(["git", "docker"]);
export const levelSchema = z.enum(["入门", "进阶", "高级", "精通"]);
export const platformSchema = z.enum(["windows", "macos", "linux"]);

const commandSchema = z.object({
  command: z.string().min(1),
  description: z.string().min(1),
});

const platformGuideSchema = z.object({
  platform: platformSchema,
  setup: z.array(z.string().min(1)).min(1),
  verify: z.array(z.string().min(1)).min(1),
  cleanup: z.array(z.string().min(1)).min(1),
});

const quizSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().nonnegative(),
  explanation: z.string().min(1),
});

/** 单节课程的稳定数据契约，构建、搜索、页面和练习运行时共同依赖。 */
export const lessonSchema = z
  .object({
    id: z.string().regex(/^(git|docker)-\d{2}$/),
    tool: toolSchema,
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(2),
    summary: z.string().min(10),
    level: levelSchema,
    order: z.number().int().min(1).max(24),
    duration: z.number().int().min(5).max(180),
    objectives: z.array(z.string().min(2)).min(2),
    prerequisites: z.array(z.string()),
    commands: z.array(commandSchema).min(1),
    pitfall: z.object({
      symptom: z.string().min(2),
      cause: z.string().min(2),
      recovery: z.string().min(2),
    }),
    comparison: z.object({
      items: z.array(z.string().min(1)).min(2),
      guidance: z.string().min(2),
      risk: z.string().min(2),
      reversible: z.string().min(2),
    }),
    related: z.array(z.string().min(1)).min(1),
    quiz: quizSchema,
    practice: z.object({
      goal: z.string().min(2),
      steps: z.array(z.string().min(1)).min(2),
      expected: z.string().min(2),
      hint: z.string().min(2),
      solution: z.string().min(2),
      variant: z.string().min(2),
    }),
    platforms: z.array(platformGuideSchema).length(3),
  })
  .superRefine((lesson, context) => {
    if (lesson.quiz.answer >= lesson.quiz.options.length) {
      context.addIssue({
        code: "custom",
        path: ["quiz", "answer"],
        message: "答案索引必须指向现有选项。",
      });
    }
  });

export type Tool = z.infer<typeof toolSchema>;
export type Level = z.infer<typeof levelSchema>;
export type LessonMeta = z.infer<typeof lessonSchema>;

/** 页面使用的完整课程对象，正文来自 MDX 的 frontmatter 之后。 */
export interface Lesson extends LessonMeta {
  body: string;
}

/** 内容列表的展示配置。 */
export const toolLabels: Record<Tool, { name: string; accent: string; description: string }> = {
  git: {
    name: "Git",
    accent: "#f97316",
    description: "从第一次提交到团队协作、历史整理与事故恢复。",
  },
  docker: {
    name: "Docker",
    accent: "#38bdf8",
    description: "从容器生命周期到镜像构建、Compose 与生产排错。",
  },
};
