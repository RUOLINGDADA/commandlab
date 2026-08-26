import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { lessonSchema, type Lesson, type Tool } from "@commandlab/content-schema";

let lessonCache: Lesson[] | undefined;

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
      const minimumScenarios = lesson.level === "高级" || lesson.level === "精通" ? 2 : 1;
      if (lesson.scenarios.length < minimumScenarios) {
        throw new Error(`${lesson.id} 至少需要 ${minimumScenarios} 个实操场景。`);
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
