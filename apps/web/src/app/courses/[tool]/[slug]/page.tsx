import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock3,
  GitCompareArrows,
  Lightbulb,
} from "lucide-react";
import { Badge, Card } from "@commandlab/ui";
import { toolLabels, type Tool } from "@commandlab/content-schema";
import { LessonActions } from "@/components/lesson-actions";
import { PlatformPractice } from "@/components/platform-practice";
import { DockerPractice } from "@/components/docker-practice";
import { QuizCard } from "@/components/quiz-card";
import { TerminalPreview } from "@/components/terminal-preview";
import { getLesson, getLessonsByTool, validateContent } from "@/lib/content";

export function generateStaticParams() {
  return validateContent().map((lesson) => ({ tool: lesson.tool, slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string; slug: string }>;
}): Promise<Metadata> {
  const { tool, slug } = await params;
  if (tool !== "git" && tool !== "docker") return {};
  const lesson = getLesson(tool, slug);
  return lesson ? { title: lesson.title, description: lesson.summary } : {};
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ tool: string; slug: string }>;
}) {
  const { tool, slug } = await params;
  if (tool !== "git" && tool !== "docker") notFound();
  const lesson = getLesson(tool, slug);
  if (!lesson) notFound();
  const lessons = getLessonsByTool(tool as Tool);
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const previous = lessons[currentIndex - 1];
  const next = lessons[currentIndex + 1];

  return (
    <article className="lesson-layout shell">
      <aside className="lesson-sidebar">
        <Link href={`/courses/${tool}/`} className="back-link">
          <ArrowLeft size={15} /> 返回 {toolLabels[tool].name} 路径
        </Link>
        <div className="lesson-index">
          <p>{lesson.level}</p>
          <strong>{String(lesson.order).padStart(2, "0")}</strong>
          <span>/ 24</span>
        </div>
        <nav aria-label="同级课程">
          {lessons.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((item) => (
            <Link
              className={item.id === lesson.id ? "is-current" : ""}
              href={`/courses/${tool}/${item.slug}/`}
              key={item.id}
            >
              {String(item.order).padStart(2, "0")} {item.title}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lesson-main">
        <header className="lesson-header">
          <div className="lesson-meta">
            <Badge>{lesson.level}</Badge>
            <span>
              <Clock3 size={14} /> 约 {lesson.duration} 分钟
            </span>
          </div>
          <h1>{lesson.title}</h1>
          <p>{lesson.summary}</p>
          <div className="objective-list">
            <strong>完成后你将能够</strong>
            <ul>
              {lesson.objectives.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </header>

        <section className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.body}</ReactMarkdown>
        </section>

        {lesson.tool === "git" && (
          <div className="insight-grid">
            <Card className="insight-card pitfall-card">
              <AlertTriangle />
              <div>
                <p className="eyebrow">常见坑点</p>
                <h3>{lesson.pitfall.symptom}</h3>
                <p>
                  <strong>原因：</strong>
                  {lesson.pitfall.cause}
                </p>
                <p>
                  <strong>恢复：</strong>
                  {lesson.pitfall.recovery}
                </p>
              </div>
            </Card>
            <Card className="insight-card compare-card">
              <GitCompareArrows />
              <div>
                <p className="eyebrow">命令辨析</p>
                <h3>{lesson.comparison.items.join(" vs ")}</h3>
                <p>{lesson.comparison.guidance}</p>
                <p>
                  <strong>风险：</strong>
                  {lesson.comparison.risk}
                </p>
                <p>
                  <strong>可逆性：</strong>
                  {lesson.comparison.reversible}
                </p>
              </div>
            </Card>
          </div>
        )}

        {lesson.tool === "docker" ? (
          <section className="practice-section">
            <div className="section-heading left">
              <p className="eyebrow">本机实战 · 逐步案例</p>
              <h2>跟着场景完成每一个可验证步骤</h2>
              <p>答案默认折叠；命令只会复制到剪贴板，不会在浏览器中执行。</p>
            </div>
            <DockerPractice
              lessonId={lesson.id}
              scenarios={lesson.scenarios}
              platforms={lesson.platforms}
            />
          </section>
        ) : (
          <section className="practice-section">
            <div className="section-heading left">
              <p className="eyebrow">本机实战</p>
              <h2>{lesson.practice.goal}</h2>
              <p>{lesson.practice.steps.join(" → ")}</p>
            </div>
            <PlatformPractice guides={lesson.platforms} />
            <Card className="hint-card">
              <Lightbulb />
              <div>
                <strong>提示</strong>
                <p>{lesson.practice.hint}</p>
                <details>
                  <summary>查看参考解法</summary>
                  <p>{lesson.practice.solution}</p>
                </details>
                <p>
                  <strong>衍生练习：</strong>
                  {lesson.practice.variant}
                </p>
              </div>
            </Card>
          </section>
        )}

        <QuizCard
          lessonId={lesson.id}
          quiz={
            lesson.tool === "docker" ? lesson.interactiveQuiz : { ...lesson.quiz, type: "choice" }
          }
        />
        <TerminalPreview compact />
        <LessonActions lessonId={lesson.id} />

        <nav className="lesson-pagination" aria-label="课程翻页">
          {previous ? (
            <Link href={`/courses/${tool}/${previous.slug}/`}>
              <ArrowLeft />{" "}
              <span>
                <small>上一节</small>
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/courses/${tool}/${next.slug}/`}>
              <span>
                <small>下一节</small>
                {next.title}
              </span>{" "}
              <ArrowRight />
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
