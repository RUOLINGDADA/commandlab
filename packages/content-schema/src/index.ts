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

const parameterSchema = z.object({
  token: z.string().min(1),
  meaning: z.string().min(6),
  effect: z.string().min(6),
});

/** 百科命令的参数逐项解析；flag 使用可复制的短参数或长参数写法。 */
const referenceParameterSchema = z.object({
  flag: z.string().min(1),
  description: z.string().min(8),
  example: z.string().min(1).optional(),
});

/** 命令动画按对象变化分组，渲染器可复用但每条命令的帧必须独立。 */
export const animationKindSchema = z.enum([
  "workspace",
  "staging",
  "commit",
  "history",
  "branch",
  "merge",
  "rebase",
  "recovery",
  "remote",
  "image",
  "container",
  "network",
  "volume",
  "compose",
  "cleanup",
  "diagnostic",
]);

export const commandAnimationFrameSchema = z.object({
  label: z.string().min(2),
  narration: z.string().min(10),
  activeActors: z.array(z.string().min(1)).min(1),
  transition: z.string().min(2),
});

export const commandAnimationActorSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  role: z.string().min(4),
});

export const commandAnimationSpecSchema = z.object({
  id: z.string().regex(/^(git|docker)-[a-z0-9-]+$/),
  tool: toolSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  kind: animationKindSchema,
  metaphor: z.string().min(10),
  actors: z.array(commandAnimationActorSchema).min(2),
  frames: z.array(commandAnimationFrameSchema).min(3),
});

/** 教学 Git 提交节点的最小可视化状态。parents 用提交 ID 表达有向图。 */
export const teachingGitCommitSchema = z.object({
  id: z.string().min(1),
  parents: z.array(z.string()),
  message: z.string().min(1),
  lane: z.enum(["main", "feature", "remote", "replay"]).default("main"),
});

export const teachingGitFileSchema = z.object({
  path: z.string().min(1),
  status: z.enum(["untracked", "modified", "staged", "clean"]),
  version: z.number().int().nonnegative(),
});

/** 远端分支上的文件快照；pull 会把它与本地 workingTree 进行确定性同步。 */
export const teachingGitRemoteFileSchema = z.object({
  path: z.string().min(1),
  version: z.number().int().nonnegative(),
});

export const teachingGitStateSchema = z.object({
  tool: z.literal("git"),
  repositoryInitialized: z.boolean(),
  commits: z.array(teachingGitCommitSchema),
  branches: z.record(z.string(), z.string()),
  head: z.object({ kind: z.enum(["branch", "detached"]), name: z.string(), commit: z.string() }),
  tags: z.record(z.string(), z.string()),
  workingTree: z.array(teachingGitFileSchema),
  remoteFiles: z.array(teachingGitRemoteFileSchema),
  staging: z.array(z.string()),
  remotes: z.record(z.string(), z.string()),
  remoteBranches: z.record(z.string(), z.string()),
  reflog: z.array(z.string()),
  stash: z.array(z.string()),
  config: z.record(z.string(), z.string()),
});

/** Docker 先使用轻量状态快照接入同一时间轴，后续可扩展为完整 Engine 模型。 */
export const teachingDockerStateSchema = z.object({
  tool: z.literal("docker"),
  images: z.array(
    z.object({ id: z.string(), name: z.string(), status: z.enum(["local", "pulling", "pushed"]) }),
  ),
  containers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      image: z.string(),
      status: z.enum(["created", "running", "stopped", "removed"]),
    }),
  ),
  networks: z.array(z.string()),
  volumes: z.array(
    z.object({
      name: z.string(),
      attachedTo: z.array(z.string()),
      bytes: z.number().nonnegative(),
    }),
  ),
  ports: z.array(
    z.object({
      host: z.number().int().positive(),
      container: z.number().int().positive(),
      target: z.string(),
    }),
  ),
});

export const teachingStateSchema = z.discriminatedUnion("tool", [
  teachingGitStateSchema,
  teachingDockerStateSchema,
]);

export const teachingEventSchema = z.object({
  type: z.enum([
    "repository-init",
    "file-stage",
    "file-unstage",
    "commit-create",
    "pointer-move",
    "branch-create",
    "head-switch",
    "merge-parents",
    "commit-replay",
    "tag-create",
    "remote-transfer",
    "recovery-restore",
    "stash-save",
    "diagnostic-read",
    "image-layer",
    "container-lifecycle",
    "network-connect",
    "volume-mount",
    "compose-orchestrate",
    "cleanup-remove",
  ]),
  subject: z.string().min(1),
  detail: z.string().min(8),
});

export const teachingPhaseSchema = z.enum([
  "idle",
  "typing",
  "executing",
  "transitioning",
  "settled",
]);

export const teachingFrameSchema = z.object({
  id: z.string().min(1),
  phase: teachingPhaseSchema,
  commandText: z.string(),
  terminalLines: z.array(z.string()),
  state: teachingStateSchema,
  events: z.array(teachingEventSchema),
  activeIds: z.array(z.string()),
  narration: z.string().min(10),
  transition: z.string().min(2),
  duration: z.number().int().positive(),
});

/** 一条命令的完整教学场景；页面骨架只依赖这个契约。 */
export const teachingSceneSchema = z.object({
  id: z.string().regex(/^(git|docker)-[a-z0-9-]+$/),
  tool: toolSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  command: z.string().min(3),
  kind: animationKindSchema,
  metaphor: z.string().min(10),
  initialState: teachingStateSchema,
  frames: z.array(teachingFrameSchema).min(5),
  finalState: teachingStateSchema,
});

const exerciseRoleSchema = z.enum(["main", "variant"]);

/** 一道真实本机练习步骤，题目、答案、验证和清理保持一一对应。 */
export const exerciseStepSchema = z.object({
  id: z.string().regex(/^step-[a-z0-9-]+$/),
  role: exerciseRoleSchema,
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
    parameters: z.array(parameterSchema).min(1),
    process: z.array(z.string().min(10)).min(2),
    stateChanges: z.array(z.string().min(8)).min(1),
  }),
  expected: z.string().min(10),
  verify: z.array(commandSchema).min(1),
  cleanup: z.array(commandSchema).min(1),
  pitfalls: z.array(pitfallSchema).min(1),
  diagnosisOrder: z.array(z.string().min(2)).min(3),
  cleanupScope: z.string().min(10),
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
  steps: z.array(exerciseStepSchema).length(2),
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
    if (lesson.scenarios.length !== 1) {
      context.addIssue({
        code: "custom",
        path: ["scenarios"],
        message: "Docker 课程必须使用一个完整场景，并包含主任务和变体任务。",
      });
    }
    const stepIds = lesson.scenarios.flatMap((scenario) => scenario.steps.map((step) => step.id));
    if (new Set(stepIds).size !== stepIds.length) {
      context.addIssue({ code: "custom", path: ["scenarios"], message: "实操步骤编号不能重复。" });
    }
    for (const [scenarioIndex, scenario] of lesson.scenarios.entries()) {
      const roles = scenario.steps.map((step) => step.role);
      if (
        roles.filter((role) => role === "main").length !== 1 ||
        roles.filter((role) => role === "variant").length !== 1
      ) {
        context.addIssue({
          code: "custom",
          path: ["scenarios", scenarioIndex, "steps"],
          message: "每个 Docker 场景必须恰好包含一个主任务和一个变体任务。",
        });
      }
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
    const ranges: Record<Level, [number, number]> = {
      入门: [15, 20],
      进阶: [20, 25],
      高级: [25, 30],
      精通: [30, 35],
    };
    const [minimum, maximum] = ranges[lesson.level];
    if (lesson.duration < minimum || lesson.duration > maximum) {
      context.addIssue({
        code: "custom",
        path: ["duration"],
        message: `${lesson.level}课程（2 个步骤）时长应为 ${minimum}-${maximum} 分钟。`,
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
  /** 命令完整语法；旧条目缺省时由首个示例回退。 */
  syntax: z.string().min(1).optional(),
  /** 逐参数说明；旧条目可暂由 commonOptions 展示。 */
  parameters: z.array(referenceParameterSchema).min(1).optional(),
  commonOptions: z.array(z.string().min(2)).min(1),
  scenarios: z.array(z.string().min(10)).min(1),
  comparisons: z.array(z.string().min(10)).min(1),
  risk: z.enum(["低", "中", "高"]),
  reversible: z.string().min(10),
  errors: z.array(z.string().min(10)).min(1),
  examples: z.array(commandSchema).min(1),
  relatedLessons: z.array(z.string().regex(/^(git|docker)-\d{2}$/)).min(1),
  /** 可选的内容内动画元数据；缺省条目由构建期注册表补齐并严格校验。 */
  animation: commandAnimationSpecSchema.optional(),
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
export type ReferenceParameter = z.infer<typeof referenceParameterSchema>;
export type AnimationKind = z.infer<typeof animationKindSchema>;
export type CommandAnimationFrame = z.infer<typeof commandAnimationFrameSchema>;
export type CommandAnimationActor = z.infer<typeof commandAnimationActorSchema>;
export type CommandAnimationSpec = z.infer<typeof commandAnimationSpecSchema>;
export type TeachingGitCommit = z.infer<typeof teachingGitCommitSchema>;
export type TeachingGitFile = z.infer<typeof teachingGitFileSchema>;
export type TeachingGitRemoteFile = z.infer<typeof teachingGitRemoteFileSchema>;
export type TeachingGitState = z.infer<typeof teachingGitStateSchema>;
export type TeachingDockerState = z.infer<typeof teachingDockerStateSchema>;
export type TeachingState = z.infer<typeof teachingStateSchema>;
export type TeachingEvent = z.infer<typeof teachingEventSchema>;
export type TeachingPhase = z.infer<typeof teachingPhaseSchema>;
export type TeachingFrame = z.infer<typeof teachingFrameSchema>;
export type TeachingScene = z.infer<typeof teachingSceneSchema>;

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
