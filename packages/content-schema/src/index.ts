import { z } from "zod";

export const toolSchema = z.enum(["git", "docker"]);
export const levelSchema = z.enum(["入门", "进阶", "高级", "精通"]);
export const platformSchema = z.enum(["windows", "macos", "linux"]);

/** 可复制的命令或配置片段。shell 用于提示用户应在哪类终端执行。 */
export const commandSchema = z.object({
  command: z
    .string()
    .min(1)
    .refine(
      (value) => !/^(复现同一案例|改变一个可观察参数|故意改变一个参数|参考操作命令)/.test(value),
      "命令字段不能使用自然语言占位内容。",
    ),
  description: z.string().min(1),
  shell: z.enum(["sh", "powershell", "yaml", "dockerfile"]).default("sh"),
});

const imageSchema = z.object({
  name: z.string().min(1),
  source: z.string().min(2),
  purpose: z.string().min(2),
  risk: z.string().min(2),
});

const pitfallSchema = z.object({
  symptom: z.string().min(2),
  cause: z.string().min(2),
  diagnosis: z.string().min(10).optional(),
  recovery: z.string().min(2),
});

const comparisonSchema = z.object({
  command: z.string().min(1),
  purpose: z.string().min(2),
  scope: z.string().min(2),
  risk: z.string().min(2),
  reversible: z.string().min(2),
});

/** 一道真实本机练习步骤，题目、答案、验证和清理保持一一对应。 */
export const exerciseStepSchema = z.object({
  id: z.string().regex(/^step-[a-z0-9-]+$/),
  /** 题目只描述任务，不得泄露可直接执行的命令。 */
  prompt: z
    .string()
    .min(10)
    .refine(
      (value) =>
        !/(^|\s)(docker|docker-compose|compose|git)\s+/.test(value) &&
        !/```|&&|\|\||\|\s|\s--[a-z]|\$\{?PWD/.test(value),
      "实操题目只能描述任务，命令必须放在参考答案中。",
    ),
  objective: z.string().min(10),
  preparation: z.array(z.string().min(8)).min(1),
  hints: z.array(z.string().min(4)).min(2),
  answer: z.object({
    explanation: z.string().min(10),
    commands: z.array(commandSchema).min(1),
  }),
  expected: z.string().min(10),
  verify: z.array(commandSchema).min(1),
  cleanup: z.array(commandSchema).min(1),
  pitfalls: z.array(pitfallSchema).min(1),
  comparisons: z.array(comparisonSchema).min(2),
  variants: z.array(z.string().min(8)).min(1),
  dangerous: z.boolean().default(false),
});

/** 一个有背景、有镜像选择、有多步骤闭环的实操场景。 */
export const scenarioSchema = z.object({
  id: z.string().regex(/^scenario-[a-z0-9-]+$/),
  title: z.string().min(4),
  context: z.string().min(20),
  goal: z.string().min(10),
  prerequisites: z.array(z.string().min(4)).min(1),
  images: z.array(imageSchema).min(1),
  steps: z.array(exerciseStepSchema).min(1).max(3),
});

const platformGuideSchema = z.object({
  platform: platformSchema,
  notes: z.string().min(10),
  setup: z.array(commandSchema).min(1),
  verify: z.array(commandSchema).min(1),
  cleanup: z.array(commandSchema).min(1),
});

const interactiveQuizSchema = z.object({
  question: z.string().min(10),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().nonnegative(),
  explanation: z.string().min(10),
  type: z.enum(["choice", "order", "state", "output"]).default("choice"),
});

const commonLessonFields = {
  id: z.string().regex(/^(git|docker)-\d{2}$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  summary: z.string().min(10),
  level: levelSchema,
  order: z.number().int().min(1).max(24),
  duration: z.number().int().min(5).max(180),
  objectives: z.array(z.string().min(2)).min(2),
  prerequisites: z.array(z.string()),
};

const legacyPlatformGuideSchema = z.object({
  platform: platformSchema,
  setup: z.array(z.string().min(1)).min(1),
  verify: z.array(z.string().min(1)).min(1),
  cleanup: z.array(z.string().min(1)).min(1),
});

/** Git 内容保持首发模型，本轮只重构 Docker，避免无关课程发生迁移。 */
const gitLessonSchema = z
  .object({
    ...commonLessonFields,
    tool: z.literal("git"),
    commands: z.array(commandSchema.omit({ shell: true })).min(1),
    pitfall: pitfallSchema,
    comparison: z.object({
      items: z.array(z.string().min(1)).min(2),
      guidance: z.string().min(2),
      risk: z.string().min(2),
      reversible: z.string().min(2),
    }),
    related: z.array(z.string().min(1)).min(1),
    quiz: interactiveQuizSchema.omit({ type: true }),
    practice: z.object({
      goal: z.string().min(2),
      steps: z.array(z.string().min(1)).min(2),
      expected: z.string().min(2),
      hint: z.string().min(2),
      solution: z.string().min(2),
      variant: z.string().min(2),
    }),
    platforms: z.array(legacyPlatformGuideSchema).length(3),
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

/** Docker 课程的新数据契约，题目、答案、验证和清理按步骤形成闭环。 */
export const dockerLessonSchema = z
  .object({
    ...commonLessonFields,
    tool: z.literal("docker"),
    scenarios: z.array(scenarioSchema).min(1),
    interactiveQuiz: interactiveQuizSchema,
    platforms: z.array(platformGuideSchema).length(3),
  })
  .superRefine((lesson, context) => {
    if (lesson.interactiveQuiz.answer >= lesson.interactiveQuiz.options.length) {
      context.addIssue({
        code: "custom",
        path: ["interactiveQuiz", "answer"],
        message: "答案索引必须指向现有选项。",
      });
    }
    const minimumScenarios = lesson.level === "高级" || lesson.level === "精通" ? 2 : 1;
    if (lesson.scenarios.length < minimumScenarios) {
      context.addIssue({
        code: "custom",
        path: ["scenarios"],
        message: `${lesson.level}课程至少需要 ${minimumScenarios} 个实操场景。`,
      });
    }
    const stepIds = lesson.scenarios.flatMap((scenario) => scenario.steps.map((step) => step.id));
    if (new Set(stepIds).size !== stepIds.length) {
      context.addIssue({ code: "custom", path: ["scenarios"], message: "实操步骤编号不能重复。" });
    }
    for (const [scenarioIndex, scenario] of lesson.scenarios.entries()) {
      for (const [stepIndex, step] of scenario.steps.entries()) {
        if (step.pitfalls.some((pitfall) => !pitfall.diagnosis)) {
          context.addIssue({
            code: "custom",
            path: ["scenarios", scenarioIndex, "steps", stepIndex, "pitfalls"],
            message: "Docker 坑点必须包含具体排查证据。",
          });
        }
      }
    }
    const stepCount = stepIds.length;
    const ranges: Record<Level, [number, number][]> = {
      入门: [
        [10, 15],
        [15, 20],
        [20, 25],
      ],
      进阶: [
        [15, 20],
        [20, 25],
        [25, 30],
      ],
      高级: [
        [20, 25],
        [25, 30],
        [30, 35],
      ],
      精通: [
        [25, 30],
        [30, 35],
        [35, 40],
      ],
    };
    const [minimum, maximum] = ranges[lesson.level][Math.min(stepCount, 3) - 1]!;
    if (lesson.duration < minimum || lesson.duration > maximum) {
      context.addIssue({
        code: "custom",
        path: ["duration"],
        message: `${lesson.level}课程 ${stepCount} 步时长应为 ${minimum}-${maximum} 分钟。`,
      });
    }
  });

/** 工具百科条目，使用与课程相同的 MDX + YAML 内容管线。 */
export const referenceEntrySchema = z.object({
  id: z.string().regex(/^(git|docker)-ref-[a-z0-9-]+$/),
  tool: toolSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  category: z.string().min(2),
  object: z.string().min(2),
  summary: z.string().min(10),
  usage: z.string().min(10),
  commonOptions: z.array(z.string().min(2)).min(1),
  scenarios: z.array(z.string().min(10)).min(1),
  comparisons: z.array(z.string().min(10)).min(1),
  risk: z.enum(["低", "中", "高"]),
  reversible: z.string().min(10),
  errors: z.array(z.string().min(10)).min(1),
  examples: z.array(commandSchema).min(1),
  relatedLessons: z.array(z.string().regex(/^(git|docker)-\d{2}$/)).min(1),
});

/** 构建阶段按 tool 分派到 Git 或 Docker 的专用课程模型。 */
export const lessonSchema = z.union([gitLessonSchema, dockerLessonSchema]);

export type Tool = z.infer<typeof toolSchema>;
export type Level = z.infer<typeof levelSchema>;
export type Command = z.infer<typeof commandSchema>;
export type ExerciseStep = z.infer<typeof exerciseStepSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type InteractiveQuiz = z.infer<typeof interactiveQuizSchema>;
export type LessonMeta = z.infer<typeof lessonSchema>;
export type GitLesson = z.infer<typeof gitLessonSchema>;
export type DockerLesson = z.infer<typeof dockerLessonSchema>;
export type ReferenceEntry = z.infer<typeof referenceEntrySchema>;

/** 页面使用的完整课程对象，正文来自 MDX 的 frontmatter 之后。 */
export type Lesson = LessonMeta & {
  body: string;
};

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
