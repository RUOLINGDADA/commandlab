"use client";

import { useMemo, useState } from "react";
import { BookOpen, PlayCircle, Search, TerminalSquare } from "lucide-react";
import { Badge, Card } from "@commandlab/ui";
import type { ReferenceEntry } from "@commandlab/content-schema";

/** 百科命令浏览器：按命令、语法、参数和错误现象过滤，并逐项展开参数说明。 */
export function ReferenceExplorer({
  entries,
}: {
  entries: Array<
    ReferenceEntry & {
      body: string;
      animation: NonNullable<ReferenceEntry["animation"]>;
      teachingScene: import("@commandlab/content-schema").TeachingScene;
    }
  >;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const categories = ["全部", ...Array.from(new Set(entries.map((entry) => entry.category)))];
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("zh-CN");
    return entries.filter((entry) => {
      const text = [
        entry.title,
        entry.summary,
        entry.object,
        entry.usage,
        entry.syntax,
        ...(entry.parameters ?? []).flatMap((item) => [item.flag, item.description, item.example]),
        ...entry.commonOptions,
        ...entry.errors,
        entry.animation.metaphor,
        ...entry.animation.frames.flatMap((frame) => [frame.label, frame.narration]),
      ]
        .join(" ")
        .toLocaleLowerCase("zh-CN");
      return (
        (category === "全部" || entry.category === category) && (!needle || text.includes(needle))
      );
    });
  }, [category, entries, query]);

  return (
    <div className="reference-explorer">
      <div className="reference-toolbar">
        <label className="search-input reference-search-row">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索命令、参数、对象或错误…"
            aria-label="搜索百科"
          />
        </label>
        <div className="filter-row">
          <span>主题筛选</span>
          <div className="filter-tabs" aria-label="百科分类筛选">
            {categories.map((item) => (
              <button
                className={category === item ? "is-active" : ""}
                key={item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="result-count">
        显示 {filtered.length} / {entries.length} 条命令
      </p>
      {filtered.length === 0 ? (
        <Card className="reference-empty">
          <BookOpen size={21} />
          <div>
            <h2>没有找到匹配命令</h2>
            <p>试试输入 `status`、`--force`、`端口` 或错误关键词。</p>
          </div>
        </Card>
      ) : (
        <div className="reference-grid">
          {filtered.map((entry) => (
            <ReferenceCard entry={entry} key={entry.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReferenceCard({
  entry,
}: {
  entry: ReferenceEntry & {
    body: string;
    animation: NonNullable<ReferenceEntry["animation"]>;
    teachingScene: import("@commandlab/content-schema").TeachingScene;
  };
}) {
  const parameters: Array<{ flag: string; description: string; example?: string }> =
    entry.parameters ??
    entry.commonOptions.map((option) => {
      const [flag, ...rest] = option.split("：");
      return { flag: flag ?? option, description: rest.join("：") || option };
    });
  const syntax = entry.syntax ?? entry.examples[0]?.command ?? entry.title;
  return (
    <Card id={`command-${entry.slug}`} className="reference-card reference-card--command">
      <div className="reference-card-top">
        <Badge>{entry.category}</Badge>
        <span className={`risk risk-${entry.risk}`}>风险：{entry.risk}</span>
      </div>
      <div className="reference-command-title">
        <TerminalSquare size={18} />
        <h2>{entry.title}</h2>
      </div>
      <p>{entry.summary}</p>
      <p>
        <strong>操作对象：</strong>
        {entry.object}
      </p>
      <div className="reference-syntax">
        <span>完整语法</span>
        <code>{syntax}</code>
      </div>
      <div className="reference-animation-link">
        <PlayCircle size={16} />
        <div>
          <strong>专属动画：{entry.animation.frames.length} 步</strong>
          <span>{entry.animation.frames[0]?.narration}</span>
        </div>
        <a href={`/reference/${entry.tool}/${entry.slug}/animation/`}>观看动画演示 →</a>
      </div>
      <details open>
        <summary>查看全部参数解析</summary>
        <div className="parameter-list">
          {parameters.map((parameter) => (
            <div className="parameter-item" key={`${parameter.flag}-${parameter.description}`}>
              <code>{parameter.flag}</code>
              <div>
                <p>{parameter.description}</p>
                {parameter.example && (
                  <small>
                    示例：<code>{parameter.example}</code>
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="reference-usage">
          <strong>使用场景：</strong>
          {entry.usage}
        </p>
        <h3>常见错误</h3>
        <ul>
          {entry.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
        <h3>可逆性</h3>
        <p>{entry.reversible}</p>
      </details>
      <div className="reference-examples">
        {entry.examples.map((example) => (
          <code key={example.command}>{example.command}</code>
        ))}
      </div>
    </Card>
  );
}
