import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, GraduationCap, Info, PlayCircle } from "lucide-react";
import { Badge, Card } from "@commandlab/ui";
import type { Tool } from "@commandlab/content-schema";
import { CommandAnimation } from "@/components/command-animation";
import { getReference, getReferencesByTool, getLessonById } from "@/lib/content";

export function generateStaticParams() {
  return (["git", "docker"] as const).flatMap((tool) =>
    getReferencesByTool(tool).map((entry) => ({ tool, slug: entry.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string; slug: string }>;
}): Promise<Metadata> {
  const { tool, slug } = await params;
  const entry = tool === "git" || tool === "docker" ? getReference(tool, slug) : undefined;
  return entry ? { title: `${entry.title} 动画演示` } : {};
}

export default async function CommandAnimationPage({
  params,
}: {
  params: Promise<{ tool: string; slug: string }>;
}) {
  const { tool, slug } = await params;
  if (tool !== "git" && tool !== "docker") notFound();
  const entry = getReference(tool as Tool, slug);
  if (!entry) notFound();
  const lesson = getLessonById(entry.relatedLessons[0] ?? "");
  const parameters = entry.parameters ?? [];
  return (
    <section className="page shell animation-page">
      <div className="animation-breadcrumbs">
        <Link href={`/reference/${tool}/`}>
          <ArrowLeft size={15} />
          返回 {tool.toUpperCase()} 百科
        </Link>
        <span>/</span>
        <span>{entry.title}</span>
      </div>
      <header className="animation-heading">
        <div>
          <Badge>{entry.category}</Badge>
          <h1>{entry.title}</h1>
          <p className="animation-syntax">
            <code>{entry.teachingScene.command}</code>
          </p>
          <p>{entry.animation.metaphor}</p>
        </div>
        <div className="animation-heading-actions">
          <Link className="secondary-link" href={`/reference/${tool}/#command-${entry.slug}`}>
            <BookOpen size={16} />
            命令百科
          </Link>
          {lesson && (
            <Link className="primary-link" href={`/courses/${tool}/${lesson.slug}/`}>
              <GraduationCap size={16} />
              进入课程
            </Link>
          )}
        </div>
      </header>
      <div className="animation-layout">
        <main>
          <CommandAnimation scene={entry.teachingScene} />
          <Card className="animation-object-card">
            <Info size={18} />
            <div>
              <strong>操作对象</strong>
              <p>{entry.object}</p>
              <span>{entry.summary}</span>
            </div>
          </Card>
        </main>
        <aside className="animation-aside">
          <Card>
            <div className="animation-aside-title">
              <PlayCircle size={17} />
              动画中的角色
            </div>
            <div className="actor-list">
              {entry.animation.actors.map((actor) => (
                <div key={actor.id}>
                  <strong>{actor.label}</strong>
                  <span>{actor.role}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2>参数解析</h2>
            <div className="animation-parameters">
              {parameters.map((parameter) => (
                <div key={parameter.flag}>
                  <code>{parameter.flag}</code>
                  <p>{parameter.description}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2>常见错误与恢复</h2>
            <ul className="animation-errors">
              {entry.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
            <p className="animation-reversible">{entry.reversible}</p>
          </Card>
        </aside>
      </div>
    </section>
  );
}
