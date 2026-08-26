import type { Metadata } from "next";
import { SearchExplorer } from "@/components/search-explorer";
import { validateContent } from "@/lib/content";

export const metadata: Metadata = { title: "学习路径" };

export default function LearnPage() {
  const lessons = validateContent();
  return (
    <section className="page shell">
      <header className="page-heading">
        <p className="eyebrow">课程目录</p>
        <h1>选择你的下一项能力</h1>
        <p>按工具筛选，或直接搜索命令、错误现象与知识点。</p>
      </header>
      <SearchExplorer lessons={lessons} />
    </section>
  );
}
