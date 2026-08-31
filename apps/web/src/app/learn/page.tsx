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
        <h1>按问题找一节课</h1>
        <p>先选工具或输入现象。课程按四个难度阶段排列，每节都以一个可验证结果收尾。</p>
      </header>
      <SearchExplorer lessons={lessons} />
    </section>
  );
}
