import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Boxes, GitBranch, Route } from "lucide-react";
import { Card } from "@commandlab/ui";
import { SearchExplorer } from "@/components/search-explorer";
import { validateContent } from "@/lib/content";

export const metadata: Metadata = { title: "学习路径" };

export default function LearnPage() {
  const lessons = validateContent();
  return (
    <section className="page shell docs-frame">
      <aside className="docs-sidebar" aria-label="学习导航">
        <p className="docs-kicker">学习工作台</p>
        <h2>课程导航</h2>
        <nav className="docs-nav">
          <Link className="is-current" href="/learn/">
            <BookOpen size={16} />
            全部课程
          </Link>
          <Link href="/courses/git/">
            <GitBranch size={16} />
            Git 路径<span>24 节</span>
          </Link>
          <Link href="/courses/docker/">
            <Boxes size={16} />
            Docker 路径<span>24 节</span>
          </Link>
          <Link href="/progress/">
            <Route size={16} />
            我的进度
          </Link>
        </nav>
        <div className="docs-sidebar-note">
          <strong>给零基础的建议</strong>
          <p>先完成 Git 01，再用 Docker 01 建立“状态 → 操作 → 验证”的习惯。</p>
        </div>
      </aside>
      <div className="docs-content">
        <header className="page-heading docs-heading">
          <p className="eyebrow">课程目录 · {lessons.length} 节</p>
          <h1>从第一条命令开始，做出可验证的结果</h1>
          <p>
            按工具、难度或你遇到的错误搜索课程。每节课都把命令放回一个真实任务，并给出恢复路径。
          </p>
        </header>
        <Card className="learning-callout">
          <div>
            <p className="eyebrow">学习方法</p>
            <h2>不要背命令，先认出它正在操作什么</h2>
            <p>
              工作区、暂存区、镜像、容器、卷和网络都会在课程中逐一标注。你可以先自己尝试，再展开分级提示。
            </p>
          </div>
          <ArrowUpRight size={22} />
        </Card>
        <SearchExplorer lessons={lessons} />
      </div>
    </section>
  );
}
