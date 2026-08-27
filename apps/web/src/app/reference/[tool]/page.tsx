import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card } from "@commandlab/ui";
import { toolLabels, type Tool } from "@commandlab/content-schema";
import { getLessonById, getReferencesByTool } from "@/lib/content";

export function generateStaticParams() {
  return [{ tool: "git" }, { tool: "docker" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  return tool === "git" || tool === "docker" ? { title: `${toolLabels[tool].name} 工具百科` } : {};
}

export default async function ReferenceToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  if (tool !== "git" && tool !== "docker") notFound();
  const entries = getReferencesByTool(tool as Tool);
  return (
    <section className="page shell">
      <header className="page-heading">
        <Link href="/reference/">← 返回工具百科</Link>
        <p className="eyebrow">{toolLabels[tool].name} 速查</p>
        <h1>{toolLabels[tool].name} 常用操作</h1>
        <p>从真实场景出发，先看对象和风险，再复制示例。</p>
      </header>
      <div className="reference-grid">
        {entries.map((entry) => {
          const lesson = getLessonById(entry.relatedLessons[0]!);
          return (
            <Card className="reference-card" key={entry.id}>
              <div className="reference-card-top">
                <Badge>{entry.category}</Badge>
                <span className={`risk risk-${entry.risk}`}>风险：{entry.risk}</span>
              </div>
              <h2>{entry.title}</h2>
              <p>{entry.summary}</p>
              <p>
                <strong>操作对象：</strong>
                {entry.object}
              </p>
              <details>
                <summary>查看参数、场景和错误</summary>
                <p>{entry.usage}</p>
                <h3>常用参数</h3>
                <ul>
                  {entry.commonOptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>适用场景</h3>
                <ul>
                  {entry.scenarios.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>相似命令</h3>
                <ul>
                  {entry.comparisons.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>常见错误</h3>
                <ul>
                  {entry.errors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>
                  <strong>可逆性：</strong>
                  {entry.reversible}
                </p>
              </details>
              <div className="reference-examples">
                {entry.examples.map((example) => (
                  <code key={example.command}>{example.command}</code>
                ))}
              </div>
              {lesson && <Link href={`/courses/${entry.tool}/${lesson.slug}/`}>相关课程 →</Link>}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
