"use client";

import { useState } from "react";
import { Button, Card } from "@commandlab/ui";
import { updateLessonProgress } from "@commandlab/practice-runtime";
import type { LessonMeta } from "@commandlab/content-schema";

export function QuizCard({ lessonId, quiz }: { lessonId: string; quiz: LessonMeta["quiz"] }) {
  const [selected, setSelected] = useState<number>();
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === quiz.answer;

  async function submit() {
    if (selected === undefined) return;
    setSubmitted(true);
    await updateLessonProgress(lessonId, { quizCorrect: correct });
  }

  return (
    <Card className="quiz-card">
      <p className="eyebrow">浏览器互动题</p>
      <h3>{quiz.question}</h3>
      <div className="quiz-options" role="radiogroup" aria-label="答案选项">
        {quiz.options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={selected === index ? "quiz-option is-selected" : "quiz-option"}
            onClick={() => {
              setSelected(index);
              setSubmitted(false);
            }}
          >
            <span>{String.fromCharCode(65 + index)}</span>
            {option}
          </button>
        ))}
      </div>
      <Button disabled={selected === undefined} onClick={() => void submit()}>
        检查答案
      </Button>
      {submitted && (
        <p className={correct ? "feedback is-correct" : "feedback is-wrong"} role="status">
          <strong>{correct ? "回答正确。" : "再想一想。"}</strong> {quiz.explanation}
        </p>
      )}
    </Card>
  );
}
