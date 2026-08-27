import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Container, GitBranch } from "lucide-react";
import { Card } from "@commandlab/ui";

export const metadata: Metadata = { title: "工具百科" };

export default function ReferencePage() {
  return (
    <section className="page shell">
      <header className="page-heading">
        <p className="eyebrow">速查手册</p>
        <h1>工具百科</h1>
        <p>按对象、场景和风险快速查找 Git 与 Docker 的常用命令。</p>
      </header>
      <div className="tool-paths reference-tools">
        <Card className="tool-path tool-path--git">
          <GitBranch size={34} />
          <div>
            <p className="eyebrow">版本控制</p>
            <h2>Git 百科</h2>
            <p>状态、提交、分支、撤销和协作命令。</p>
            <Link href="/reference/git/">浏览 Git 条目 →</Link>
          </div>
        </Card>
        <Card className="tool-path tool-path--docker">
          <Container size={34} />
          <div>
            <p className="eyebrow">容器工具</p>
            <h2>Docker 百科</h2>
            <p>镜像、容器、网络、卷和排错命令。</p>
            <Link href="/reference/docker/">浏览 Docker 条目 →</Link>
          </div>
        </Card>
      </div>
      <Card className="info-card reference-note">
        <BookOpen size={22} />
        <div>
          <h2>怎么查</h2>
          <p>每个条目都说明操作对象、常用参数、真实场景、相似命令、风险、可逆性和常见错误。</p>
        </div>
      </Card>
    </section>
  );
}
