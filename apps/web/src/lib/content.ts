import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  lessonSchema,
  referenceEntrySchema,
  type Lesson,
  type ReferenceEntry,
  type Tool,
  type TeachingScene,
} from "@commandlab/content-schema";
import { buildAnimationRegistry } from "./animations";
import { buildTeachingRegistry } from "./teaching/scenes";

let lessonCache: Lesson[] | undefined;
type LoadedReference = Omit<ReferenceEntry, "syntax" | "parameters"> & {
  body: string;
  syntax: string;
  parameters: Array<{ flag: string; description: string; example?: string }>;
  animation: NonNullable<ReferenceEntry["animation"]>;
  teachingScene: TeachingScene;
};
let referenceCache: LoadedReference[] | undefined;

function contentRoot(): string {
  const rootCandidate = path.resolve(process.cwd(), "content");
  return fs.existsSync(rootCandidate)
    ? rootCandidate
    : path.resolve(process.cwd(), "../../content");
}

/**
 * 从仓库课程目录读取所有 MDX，并严格校验 frontmatter。
 * 该函数只在构建阶段执行，浏览器包不会包含文件系统访问。
 */
export function loadLessons(): Lesson[] {
  if (lessonCache) return lessonCache;

  const files = ["git", "docker"].flatMap((tool) => {
    const directory = path.join(contentRoot(), tool);
    return fs
      .readdirSync(directory)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => path.join(directory, file));
  });

  lessonCache = files
    .map((file) => {
      const parsed = matter(fs.readFileSync(file, "utf8"));
      const metadata = lessonSchema.parse(parsed.data);
      const body = parsed.content.trim();
      if (body.length < 120) throw new Error(`${file} 的教程正文过短。`);
      return { ...metadata, body };
    })
    .sort((left, right) => left.tool.localeCompare(right.tool) || left.order - right.order);

  return lessonCache;
}

/** 执行跨文件约束，确保课程数量、编号、顺序、平台和前置关系完整。 */
export function validateContent(): Lesson[] {
  const lessons = loadLessons();
  const ids = new Set<string>();
  const routes = new Set<string>();

  for (const lesson of lessons) {
    if (ids.has(lesson.id)) throw new Error(`课程编号重复：${lesson.id}`);
    ids.add(lesson.id);
    const route = `${lesson.tool}/${lesson.slug}`;
    if (routes.has(route)) throw new Error(`课程路由重复：${route}`);
    routes.add(route);

    const platforms = new Set(lesson.platforms.map((guide) => guide.platform));
    if (platforms.size !== 3) throw new Error(`${lesson.id} 的三平台指引不完整。`);

    if (lesson.tool === "docker") {
      if (lesson.scenarios.length !== 1) {
        throw new Error(`${lesson.id} 必须使用一个完整场景，并在其中包含主任务和变体。`);
      }
      const stepIds = lesson.scenarios.flatMap((scenario) => scenario.steps.map((step) => step.id));
      if (new Set(stepIds).size !== stepIds.length) {
        throw new Error(`${lesson.id} 的实操步骤编号重复。`);
      }
    }
  }

  for (const tool of ["git", "docker"] as const) {
    const toolLessons = lessons.filter((lesson) => lesson.tool === tool);
    if (toolLessons.length !== 24) throw new Error(`${tool} 必须恰好包含 24 节课。`);
    const expectedOrders = Array.from({ length: 24 }, (_, index) => index + 1);
    if (!expectedOrders.every((order) => toolLessons.some((lesson) => lesson.order === order))) {
      throw new Error(`${tool} 的课程顺序必须连续为 1 到 24。`);
    }
  }

  for (const lesson of lessons) {
    for (const prerequisite of lesson.prerequisites) {
      // Git 课程使用课程 ID 表达前置关系；Docker 课程允许写入本机环境前置条件。
      // 只有形如 tool-01 的值才需要解析为跨课程链接，避免把“已安装 Docker”误判为坏链接。
      if (/^(git|docker)-\d{2}$/.test(prerequisite) && !ids.has(prerequisite)) {
        throw new Error(`${lesson.id} 引用了不存在的前置课程 ${prerequisite}。`);
      }
    }
  }
  return lessons;
}

export function getLessonsByTool(tool: Tool): Lesson[] {
  return validateContent().filter((lesson) => lesson.tool === tool);
}

export function getLesson(tool: Tool, slug: string): Lesson | undefined {
  return validateContent().find((lesson) => lesson.tool === tool && lesson.slug === slug);
}

export function getLessonById(id: string): Lesson | undefined {
  return validateContent().find((lesson) => lesson.id === id);
}

/** 构建阶段读取工具百科条目，供静态百科页和搜索使用。 */
export function loadReferences(): LoadedReference[] {
  if (referenceCache) return referenceCache;
  const root = path.join(contentRoot(), "reference");
  if (!fs.existsSync(root)) return [];
  const files = (["git", "docker"] as const).flatMap((tool) => {
    const directory = path.join(root, tool);
    return fs.existsSync(directory)
      ? fs
          .readdirSync(directory)
          .filter((file) => file.endsWith(".mdx"))
          .map((file) => path.join(directory, file))
      : [];
  });
  const parsedEntries = files.map((file) => {
    const parsed = matter(fs.readFileSync(file, "utf8"));
    const metadata = referenceEntrySchema.parse(parsed.data);
    const body = parsed.content.trim();
    if (body.length < 30) throw new Error(`${file} 的百科正文过短。`);
    const parameters =
      metadata.parameters ??
      metadata.commonOptions.map((option) => {
        const [flag, ...rest] = option.split("：");
        return { flag: flag ?? option, description: rest.join("：") || option };
      });
    return {
      ...metadata,
      syntax: metadata.syntax ?? metadata.examples[0]?.command ?? metadata.title,
      parameters,
      body,
    };
  });
  const registry = buildAnimationRegistry(parsedEntries);
  const teachingRegistry = buildTeachingRegistry(parsedEntries);
  referenceCache = parsedEntries.map((entry) => {
    const animation = registry.get(`${entry.tool}/${entry.slug}`);
    const teachingScene = teachingRegistry.get(`${entry.tool}/${entry.slug}`)?.scene;
    if (!animation) throw new Error(`百科条目缺少动画注册项：${entry.tool}/${entry.slug}`);
    if (!teachingScene) throw new Error(`百科条目缺少教学场景：${entry.tool}/${entry.slug}`);
    return { ...entry, animation, teachingScene } as LoadedReference;
  });
  return referenceCache;
}

export function getReferencesByTool(tool: Tool): LoadedReference[] {
  return loadReferences().filter((entry) => entry.tool === tool);
}

export function getReference(tool: Tool, slug: string): LoadedReference | undefined {
  return loadReferences().find((entry) => entry.tool === tool && entry.slug === slug);
}

/**
 * 建立课程 → 引用条目的反向索引，用于在课程正文与练习区中嵌入命令动画。
 * 仅返回该课程下能直接定位到的引用条目，未命中的命令不出现。
 */
export function getLessonReferenceSlugs(lesson: {
  id: string;
  commands: ReadonlyArray<{ command: string }>;
}): string[] {
  const all = loadReferences();
  const commandToSlug = new Map<string, string>();
  for (const entry of all) {
    for (const example of entry.examples) {
      const parts = example.command.trim().split(/\s+/);
      const commandName = parts[0] === "git" || parts[0] === "docker" ? parts[1] : parts[0];
      if (commandName && !commandToSlug.has(commandName)) {
        commandToSlug.set(commandName, `${entry.tool}/${entry.slug}`);
      }
    }
    const syntaxParts = entry.syntax.trim().split(/\s+/);
    const commandName =
      syntaxParts[0] === "git" || syntaxParts[0] === "docker" ? syntaxParts[1] : syntaxParts[0];
    if (commandName && !commandToSlug.has(commandName)) {
      commandToSlug.set(commandName, `${entry.tool}/${entry.slug}`);
    }
  }
  const matched = new Set<string>();
  for (const { command } of lesson.commands) {
    const parts = command.trim().split(/\s+/);
    const commandName = parts[0] === "git" || parts[0] === "docker" ? parts[1] : parts[0];
    if (!commandName) continue;
    const target = commandToSlug.get(commandName);
    if (target) matched.add(target);
  }
  // 兜底：按课程 id 关联常见 lesson-to-reference 通道
  const fallback: Record<string, string[]> = {
    "git-04": ["git/commit"],
    "git-05": ["git/add", "git/restore"],
    "git-06": ["git/branch"],
    "git-07": ["git/switch"],
    "git-08": ["git/merge"],
    "git-09": ["git/rebase"],
    "git-10": ["git/reset"],
    "git-11": ["git/stash"],
    "git-12": ["git/log"],
    "git-13": ["git/show"],
    "git-14": ["git/reflog"],
    "git-15": ["git/cherry-pick"],
    "git-16": ["git/tag"],
    "git-17": ["git/remote"],
    "git-18": ["git/fetch"],
    "git-19": ["git/pull"],
    "git-20": ["git/push"],
    "git-21": ["git/diff"],
    "git-22": ["git/blame"],
    "git-23": ["git/clean"],
    "git-24": ["git/bisect"],
  };
  for (const slug of fallback[lesson.id] ?? []) {
    if (all.some((entry) => `${entry.tool}/${entry.slug}` === slug)) matched.add(slug);
  }
  return Array.from(matched);
}
