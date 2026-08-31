import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Boxes,
  GitBranch,
  Laptop,
  ListChecks,
  Search,
} from "lucide-react";
import { Card } from "@commandlab/ui";
import { CourseCard } from "@/components/course-card";
import { InteractiveGitWorkbench } from "@/components/interactive-git-workbench";
import { Reveal } from "@/components/reveal";
import { validateContent } from "@/lib/content";

export default function HomePage() {
  const lessons = validateContent();
  const featured = [
    lessons.find((lesson) => lesson.id === "git-01")!,
    lessons.find((lesson) => lesson.id === "docker-01")!,
  ];

  return (
    <>
      <section className="hero shell hero-home">
        <div className="home-hero-top">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              <span className="live-dot" />
              命令行学习 · Git 与 Docker
            </p>
            <h1>
              把每条命令，<span>变成可验证的结果。</span>
            </h1>
            <p className="hero-description">
              CommandLab
              是一套可以边读边做的中文课程。你会先判断操作对象，再执行命令，最后用结果验证，而不是只背参数。
            </p>
            <div className="hero-actions">
              <Link href="/learn/" className="primary-link">
                浏览课程 <ArrowRight size={16} />
              </Link>
              <Link href="/reference/" className="secondary-link">
                打开工具百科 <Search size={16} />
              </Link>
            </div>
            <div className="hero-proof">
              <span>
                <strong>{lessons.length}</strong> 节课程
              </span>
              <span>
                <strong>2</strong> 条学习路径
              </span>
              <span>
                <strong>3</strong> 个平台指引
              </span>
            </div>
          </div>

          <aside className="home-launchpad" aria-label="工作区入口">
            <div className="home-launchpad-heading">
              <span className="live-dot" />
              <span>今日工作区</span>
              <small>内存隔离</small>
            </div>
            <p>从一个小任务开始，把结果留在当前会话里。</p>
            <nav className="home-launchpad-links" aria-label="快速入口">
              <Link href="/terminal/" className="is-current">
                <span>
                  <strong>Git 仿真终端</strong>
                  <small>输入命令，观察状态变化</small>
                </span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/learn/">
                <span>
                  <strong>学习路径</strong>
                  <small>按任务推进 Git 与 Docker</small>
                </span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/reference/">
                <span>
                  <strong>工具百科</strong>
                  <small>查语法、参数与演示</small>
                </span>
                <ArrowRight size={15} />
              </Link>
            </nav>
            <div className="home-launchpad-footer">
              <span>SESSION</span>
              <code>commandlab-git-lab</code>
            </div>
          </aside>
        </div>

        <div className="home-workbench-heading">
          <div>
            <p className="eyebrow">现在开始</p>
            <h2>在真实反馈里学会 Git</h2>
          </div>
          <div className="home-workbench-meta">
            <span>
              <span className="live-dot" /> 浏览器内运行
            </span>
            <span>状态、文件与提交图同步</span>
          </div>
        </div>
        <InteractiveGitWorkbench />
      </section>

      <Reveal>
        <section className="section shell">
          <div className="section-heading">
            <p className="eyebrow">课程怎么组织</p>
            <h2>读懂对象，再动手操作</h2>
            <p>每一节课都围绕一个可以验证的小结果展开。</p>
          </div>
          <div className="feature-grid">
            <Feature
              icon={<ListChecks />}
              title="按难度推进"
              text="从第一次提交、第一次容器启动开始，逐级进入协作、构建和排错。"
            />
            <Feature
              icon={<BookOpenCheck />}
              title="先看影响范围"
              text="课程会说明命令作用于工作区、镜像、容器还是宿主机，以及如何恢复。"
            />
            <Feature
              icon={<Laptop />}
              title="本机完成练习"
              text="Windows、macOS、Linux 都有对应步骤，执行结果和清理方式写在同一页。"
            />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section shell tool-paths">
          <div className="tool-path tool-path--git">
            <GitBranch />
            <div>
              <p className="eyebrow">01 · 版本控制</p>
              <h2>Git</h2>
              <p>从工作区和暂存区开始，逐步掌握提交、分支、协作与历史恢复。</p>
              <Link href="/courses/git/">
                进入 Git 课程 <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="tool-path tool-path--docker">
            <Boxes />
            <div>
              <p className="eyebrow">02 · 容器工具</p>
              <h2>Docker</h2>
              <p>从镜像和容器开始，练习构建、Compose、网络、数据与故障定位。</p>
              <Link href="/courses/docker/">
                进入 Docker 课程 <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section shell">
          <div className="section-heading">
            <p className="eyebrow">推荐入口</p>
            <h2>先完成两个小任务</h2>
          </div>
          <div className="course-grid course-grid--featured">
            {featured.map((lesson) => (
              <CourseCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section shell home-next-step">
          <div className="section-heading left">
            <p className="eyebrow">
              <ListChecks size={14} /> 学习顺序
            </p>
            <h2>今天只做一件事</h2>
          </div>
          <div className="tool-paths">
            <div className="tool-path">
              <strong className="next-step-number">01</strong>
              <div>
                <h2>先理解状态</h2>
                <p>遇到问题时，先用 status、ps 或 inspect 看清对象当前处于什么状态。</p>
                <Link href="/reference/">
                  查看速查手册 <ArrowRight size={15} />
                </Link>
              </div>
            </div>
            <div className="tool-path">
              <strong className="next-step-number">02</strong>
              <div>
                <h2>再执行变更</h2>
                <p>完成命令后保留输出，用下一条只读命令确认结果，再清理练习资源。</p>
                <Link href="/progress/">
                  查看学习进度 <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
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
