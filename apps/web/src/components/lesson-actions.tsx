"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check, Save } from "lucide-react";
import { Button } from "@commandlab/ui";
import {
  getLessonProgress,
  updateLessonProgress,
  type LessonProgress,
} from "@commandlab/practice-runtime";

export function LessonActions({ lessonId }: { lessonId: string }) {
  const [progress, setProgress] = useState<LessonProgress>();
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getLessonProgress(lessonId).then(setProgress);
  }, [lessonId]);

  async function patch(next: Partial<LessonProgress>, feedback: string) {
    setProgress(await updateLessonProgress(lessonId, next));
    setMessage(feedback);
  }

  if (!progress) return <div className="lesson-actions skeleton">正在读取本地进度…</div>;

  return (
    <section className="lesson-actions" aria-label="本地学习操作">
      <div className="action-row">
        <Button
          variant={progress.completed ? "secondary" : "primary"}
          onClick={() => void patch({ completed: !progress.completed }, "完成状态已保存在本机。")}
        >
          <Check size={16} /> {progress.completed ? "已完成" : "标记完成"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => void patch({ favorite: !progress.favorite }, "收藏状态已更新。")}
        >
          <Bookmark size={16} fill={progress.favorite ? "currentColor" : "none"} />
          {progress.favorite ? "已收藏" : "收藏"}
        </Button>
      </div>
      <label htmlFor="lesson-note">本机笔记</label>
      <textarea
        id="lesson-note"
        value={progress.note}
        onChange={(event) => setProgress({ ...progress, note: event.target.value })}
        placeholder="记录命令、错误现象或自己的理解…"
      />
      <Button
        variant="ghost"
        onClick={() => void patch({ note: progress.note }, "笔记已保存在本机。")}
      >
        <Save size={15} /> 保存笔记
      </Button>
      <span className="save-message" role="status">
        {message}
      </span>
    </section>
  );
}
