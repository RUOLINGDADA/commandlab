import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toolLabels, type Tool } from "@commandlab/content-schema";
import { ReferenceExplorer } from "@/components/reference-explorer";
import { getReferencesByTool } from "@/lib/content";

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
  const categories = Array.from(new Set(entries.map((entry) => entry.category)));
  return (
    <section className="page shell reference-page">
      <header className="page-heading reference-heading">
        <Link href="/reference/">← 返回工具百科</Link>
        <p className="eyebrow">{toolLabels[tool].name} 速查</p>
        <h1>{toolLabels[tool].name} 命令百科</h1>
        <p>把命令当成一张操作地图：先看它碰到的对象，再看参数如何改变结果，最后复制最小示例。</p>
        <div className="reference-stats">
          <span>
            <strong>{entries.length}</strong> 条命令
          </span>
          <span>
            <strong>{categories.length}</strong> 个主题
          </span>
          <span>
            <strong>100%</strong> 参数可解释
          </span>
        </div>
      </header>
      <div className="reference-layout">
        <aside className="reference-sidebar" aria-label="命令目录">
          <div className="reference-sidebar-title">
            <span className="live-dot" />
            命令目录
          </div>
          <p>按主题浏览</p>
          <nav>
            {categories.map((category) => {
              const first = entries.find((entry) => entry.category === category);
              return (
                <a href={`#command-${first?.slug ?? category}`} key={category}>
                  {category}
                  <span>{entries.filter((entry) => entry.category === category).length}</span>
                </a>
              );
            })}
          </nav>
          <div className="reference-sidebar-tip">
            <strong>小白阅读顺序</strong>
            <p>语法 → 参数 → 示例 → 执行后发生什么 → 错误恢复。</p>
          </div>
        </aside>
        <div className="reference-main">
          <ReferenceExplorer entries={entries} />
        </div>
      </div>
    </section>
  );
}
