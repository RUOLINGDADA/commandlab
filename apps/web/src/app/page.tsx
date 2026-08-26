import Link from "next/link";
import { ArrowRight, BookOpenCheck, Boxes, GitBranch, Laptop, Route, Sparkles } from "lucide-react";
import { Card } from "@commandlab/ui";
import { CourseCard } from "@/components/course-card";
import { TerminalPreview } from "@/components/terminal-preview";
import { validateContent } from "@/lib/content";

export default function HomePage() {
  const lessons = validateContent();
  const featured = [
    lessons.find((lesson) => lesson.id === "git-01")!,
    lessons.find((lesson) => lesson.id === "docker-01")!,
  ];

  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={15} /> 面向初学者的开发工具实战平台
          </p>
          <h1>
            在动手与犯错中，<span>真正掌握命令。</span>
          </h1>
          <p className="hero-description">
            从 Git 的第一次提交到 Docker
            的生产排错。每节课都解释思维模型、常见坑点、命令区别，并给出三平台本机练习。
          </p>
          <div className="hero-actions">
            <Link href="/learn/" className="primary-link">
              开始学习 <ArrowRight size={17} />
            </Link>
            <Link href="/terminal/" className="secondary-link">
              查看在线终端计划
            </Link>
          </div>
          <div className="hero-proof">
            <span>
              <strong>48</strong> 节系统课程
            </span>
            <span>
              <strong>4</strong> 个能力等级
            </span>
            <span>
              <strong>3</strong> 个操作系统
            </span>
          </div>
        </div>
        <TerminalPreview compact />
      </section>

      <section className="section shell">
        <div className="section-heading">
          <p className="eyebrow">学习方法</p>
          <h2>从概念到独立解决问题</h2>
          <p>知识、练习与复盘放在同一条路径里。</p>
        </div>
        <div className="feature-grid">
          <Feature
            icon={<Route />}
            title="分级路径"
            text="从入门到精通，每一层都清楚说明前置知识和完成标准。"
          />
          <Feature
            icon={<BookOpenCheck />}
            title="命令辨析"
            text="比较相似命令的范围、风险和可逆性，不再凭感觉执行。"
          />
          <Feature
            icon={<Laptop />}
            title="三平台实战"
            text="Windows、macOS、Linux 分别提供命令、验证与安全清理步骤。"
          />
        </div>
      </section>

      <section className="section shell tool-paths">
        <div className="tool-path tool-path--git">
          <GitBranch />
          <div>
            <p className="eyebrow">路径 01</p>
            <h2>Git 版本控制</h2>
            <p>建立快照、分支协作、整理历史，再到恢复事故现场。</p>
            <Link href="/courses/git/">
              查看 Git 路径 <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="tool-path tool-path--docker">
          <Boxes />
          <div>
            <p className="eyebrow">路径 02</p>
            <h2>Docker 容器化</h2>
            <p>理解镜像与容器，写好构建文件，并能定位生产问题。</p>
            <Link href="/courses/docker/">
              查看 Docker 路径 <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <p className="eyebrow">从这里开始</p>
          <h2>第一节课，不需要任何经验</h2>
        </div>
        <div className="course-grid course-grid--featured">
          {featured.map((lesson) => (
            <CourseCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </section>
    </>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card className="feature-card">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </Card>
  );
}
