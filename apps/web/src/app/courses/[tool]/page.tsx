import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toolLabels, type Tool } from "@commandlab/content-schema";
import { CourseCard } from "@/components/course-card";
import { getLessonsByTool } from "@/lib/content";

export function generateStaticParams() {
  return [{ tool: "git" }, { tool: "docker" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  if (tool !== "git" && tool !== "docker") return {};
  return { title: `${toolLabels[tool].name} 学习路径` };
}

export default async function ToolCoursePage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  if (tool !== "git" && tool !== "docker") notFound();
  const typedTool = tool as Tool;
  const lessons = getLessonsByTool(typedTool);
  const levels = ["入门", "进阶", "高级", "精通"] as const;

  return (
    <section className="page shell">
      <header
        className="page-heading tool-heading"
        style={{ "--tool-accent": toolLabels[typedTool].accent } as React.CSSProperties}
      >
        <p className="eyebrow">24 节 · 四级路径</p>
        <h1>{toolLabels[typedTool].name}</h1>
        <p>{toolLabels[typedTool].description}</p>
      </header>
      {levels.map((level, index) => (
        <section className="level-section" key={level}>
          <div className="level-heading">
            <span>0{index + 1}</span>
            <div>
              <p className="eyebrow">LEVEL {index + 1}</p>
              <h2>{level}</h2>
            </div>
          </div>
          <div className="course-grid">
            {lessons
              .filter((lesson) => lesson.level === level)
              .map((lesson) => (
                <CourseCard key={lesson.id} lesson={lesson} />
              ))}
          </div>
        </section>
      ))}
    </section>
  );
}
