"use client";

import { useEffect, useState } from "react";
import { Award, BookMarked, CheckCircle2 } from "lucide-react";
import { Card } from "@commandlab/ui";
import { listLessonProgress, type LessonProgress } from "@commandlab/practice-runtime";

export function ProgressDashboard() {
  const [records, setRecords] = useState<LessonProgress[]>([]);
  useEffect(() => {
    void listLessonProgress().then(setRecords);
  }, []);
  const completed = records.filter((item) => item.completed).length;
  const favorites = records.filter((item) => item.favorite).length;
  const correct = records.filter((item) => item.quizCorrect).length;

  return (
    <div className="stat-grid">
      <Stat icon={<CheckCircle2 />} value={`${completed}/48`} label="已完成课程" />
      <Stat icon={<Award />} value={String(correct)} label="答对互动题" />
      <Stat icon={<BookMarked />} value={String(favorites)} label="收藏课程" />
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card className="stat-card">
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </Card>
  );
}
