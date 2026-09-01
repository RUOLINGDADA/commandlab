import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toolLabels, type Tool } from "@commandlab/content-schema";
import { Card } from "@commandlab/ui";
import { CourseCard } from "@/components/course-card";
import { InteractiveDockerWorkbench } from "@/components/interactive-docker-workbench";
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
    <section className="page shell docs-frame course-index-page">
      <aside className="docs-sidebar" aria-label={`${toolLabels[typedTool].name} 课程导航`}>
        <p className="docs-kicker">课程路径</p>
        <h2>{toolLabels[typedTool].name}</h2>
        <nav className="docs-nav docs-nav--lessons">
          {lessons.slice(0, 8).map((item) => (
            <a href={`#lesson-${item.id}`} key={item.id}>
              <span>{String(item.order).padStart(2, "0")}</span>
              {item.title}
            </a>
          ))}
        </nav>
        <p className="docs-sidebar-note">
          目录顺序由每节课 frontmatter 的 `order` 控制，可直接调整课程编排。
        </p>
      </aside>
      <div className="docs-content">
        <header
          className="page-heading tool-heading"
          style={{ "--tool-accent": toolLabels[typedTool].accent } as React.CSSProperties}
        >
          <p className="eyebrow">24 节 · 四级路径</p>
          <h1>{toolLabels[typedTool].name}</h1>
          <p>{toolLabels[typedTool].description}</p>
        </header>
        {typedTool === "docker" ? <InteractiveDockerWorkbench /> : null}
        {typedTool === "docker" && (
          <Card className="practice-protocol">
            <p className="eyebrow">实操说明与安全协议</p>
            <h2>先完成题目，再展开答案</h2>
            <p>
              所有资源统一使用 <code>commandlab-</code>{" "}
              前缀。涉及删除、挂载、网络、端口、权限或资源限制时，先阅读步骤中的影响范围；错误出现时保留错误文本，按“对象—状态—原因—恢复”顺序排查。
            </p>
            <p>
              验收关注对象是否存在、状态是否正确、数据是否保留、退出码是否符合预期，以及输出是否包含目标名称或健康状态。完成后复盘命令操作的对象、宿主机影响和再次执行时的复用关系。
            </p>
          </Card>
        )}
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
                  <div id={`lesson-${lesson.id}`} key={lesson.id}>
                    <CourseCard lesson={lesson} />
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
