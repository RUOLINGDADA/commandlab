"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Lesson } from "@commandlab/content-schema";
import { CourseCard } from "./course-card";

export function SearchExplorer({ lessons }: { lessons: Lesson[] }) {
  const [query, setQuery] = useState("");
  const [tool, setTool] = useState<"all" | "git" | "docker">("all");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("zh-CN");
    return lessons.filter((lesson) => {
      const toolMatches = tool === "all" || lesson.tool === tool;
      const lessonDetails =
        lesson.tool === "git"
          ? [
              lesson.commands.map((item) => item.command).join(" "),
              lesson.pitfall.symptom,
              lesson.related.join(" "),
            ]
          : [
              lesson.scenarios
                .flatMap((scenario) => [
                  scenario.title,
                  scenario.context,
                  ...scenario.steps.flatMap((step) => [
                    step.prompt,
                    step.answer.commands.map((item) => item.command).join(" "),
                    step.pitfalls.map((pitfall) => pitfall.symptom).join(" "),
                  ]),
                ])
                .join(" "),
            ];
      const text = [lesson.title, lesson.summary, lesson.level, ...lessonDetails]
        .join(" ")
        .toLocaleLowerCase("zh-CN");
      return toolMatches && (!needle || text.includes(needle));
    });
  }, [lessons, query, tool]);

  return (
    <>
      <div className="search-panel">
        <label className="search-input">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索课程、命令或错误现象…"
          />
        </label>
        <div className="filter-tabs" aria-label="工具筛选">
          {(["all", "git", "docker"] as const).map((item) => (
            <button
              key={item}
              className={tool === item ? "is-active" : ""}
              onClick={() => setTool(item)}
            >
              {item === "all" ? "全部" : item === "git" ? "Git" : "Docker"}
            </button>
          ))}
        </div>
      </div>
      <p className="result-count">找到 {filtered.length} 节课程</p>
      <div className="course-grid">
        {filtered.map((lesson) => (
          <CourseCard lesson={lesson} key={lesson.id} />
        ))}
      </div>
    </>
  );
}
