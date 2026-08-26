import { openDB, type DBSchema } from "idb";

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  favorite: boolean;
  quizCorrect: boolean;
  /** Docker 逐步实操已完成的步骤 ID；Git 课程为空数组。 */
  completedSteps: string[];
  note: string;
  updatedAt: string;
}

interface CommandLabDatabase extends DBSchema {
  progress: {
    key: string;
    value: LessonProgress;
  };
}

export type SandboxAvailability =
  | { status: "unavailable"; message: string }
  | { status: "available"; endpoint: string };

/**
 * 首发版明确关闭在线沙箱。页面只读取此状态，不会向不存在的后端发送请求。
 * 未来实现只需替换适配器，而不需要修改课程数据与页面结构。
 */
export const sandboxAvailability: SandboxAvailability = {
  status: "unavailable",
  message: "在线终端正在准备中。现在可以使用三平台本机练习完成同一任务。",
};

const databasePromise =
  typeof window === "undefined"
    ? null
    : openDB<CommandLabDatabase>("commandlab", 1, {
        upgrade(database) {
          if (!database.objectStoreNames.contains("progress")) {
            database.createObjectStore("progress", { keyPath: "lessonId" });
          }
        },
      });

/** 读取单节课的本地学习状态；服务端渲染时返回空状态。 */
export async function getLessonProgress(lessonId: string): Promise<LessonProgress> {
  const empty: LessonProgress = {
    lessonId,
    completed: false,
    favorite: false,
    quizCorrect: false,
    completedSteps: [],
    note: "",
    updatedAt: new Date(0).toISOString(),
  };
  if (!databasePromise) return empty;
  const stored = await (await databasePromise).get("progress", lessonId);
  return stored ? { ...empty, ...stored, completedSteps: stored.completedSteps ?? [] } : empty;
}

/** 合并并持久化单节课状态，保证未修改字段不会被意外清空。 */
export async function updateLessonProgress(
  lessonId: string,
  patch: Partial<Omit<LessonProgress, "lessonId" | "updatedAt">>,
): Promise<LessonProgress> {
  const database = await databasePromise;
  if (!database) throw new Error("IndexedDB 只能在浏览器中使用。");
  const current = await getLessonProgress(lessonId);
  const next = { ...current, ...patch, lessonId, updatedAt: new Date().toISOString() };
  await database.put("progress", next);
  return next;
}

/** 返回全部学习记录，用于仪表盘统计。 */
export async function listLessonProgress(): Promise<LessonProgress[]> {
  if (!databasePromise) return [];
  return (await databasePromise).getAll("progress");
}
