import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Badge, Card } from "@commandlab/ui";
import { toolLabels, type Lesson } from "@commandlab/content-schema";

export function CourseCard({ lesson }: { lesson: Lesson }) {
  return (
    <Card className="course-card">
      <div className="course-card__meta">
        <Badge>{lesson.level}</Badge>
        <span>
          <Clock3 size={14} /> {lesson.duration} 分钟
        </span>
      </div>
      <p className="eyebrow" style={{ color: toolLabels[lesson.tool].accent }}>
        {toolLabels[lesson.tool].name} · {String(lesson.order).padStart(2, "0")}
      </p>
      <h3>{lesson.title}</h3>
      <p>{lesson.summary}</p>
      <Link href={`/courses/${lesson.tool}/${lesson.slug}/`} className="card-link">
        开始学习 <ArrowRight size={16} />
      </Link>
    </Card>
  );
}
