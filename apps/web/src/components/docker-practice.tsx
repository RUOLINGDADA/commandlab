"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clipboard, RotateCcw } from "lucide-react";
import { Card } from "@commandlab/ui";
import { getLessonProgress, updateLessonProgress } from "@commandlab/practice-runtime";
import type { DockerLesson, ExerciseStep } from "@commandlab/content-schema";

const platformNames = { windows: "Windows WSL2", macos: "macOS", linux: "Linux" } as const;

/**
 * Docker 逐步实操面板：答案默认折叠，步骤完成状态写入 IndexedDB。
 * 所有命令只做复制，不会在浏览器内执行，避免首发版产生越权的主机操作。
 */
export function DockerPractice({
  lessonId,
  scenarios,
  platforms,
}: {
  lessonId: string;
  scenarios: DockerLesson["scenarios"];
  platforms: DockerLesson["platforms"];
}) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [platform, setPlatform] =
    useState<DockerLesson["platforms"][number]["platform"]>("windows");
  const guide = platforms.find((item) => item.platform === platform) ?? platforms[0]!;

  useEffect(() => {
    void getLessonProgress(lessonId).then((progress) => setCompleted(progress.completedSteps));
  }, [lessonId]);

  async function toggleStep(stepId: string) {
    const next = completed.includes(stepId)
      ? completed.filter((item) => item !== stepId)
      : [...completed, stepId];
    setCompleted(next);
    await updateLessonProgress(lessonId, { completedSteps: next });
  }

  return (
    <div className="docker-practice">
      <Card className="platform-overview">
        <div className="platform-tabs" role="tablist" aria-label="选择本机系统">
          {platforms.map((item) => (
            <button
              key={item.platform}
              role="tab"
              aria-selected={platform === item.platform}
              className={platform === item.platform ? "is-active" : ""}
              onClick={() => setPlatform(item.platform)}
            >
              {platformNames[item.platform]}
            </button>
          ))}
        </div>
        <p className="platform-note">{guide.notes}</p>
        <CommandList title="进入练习前" icon={<Clipboard size={16} />} commands={guide.setup} />
        <CommandList
          title="整节完成后验证"
          icon={<CheckCircle2 size={16} />}
          commands={guide.verify}
        />
        <CommandList title="安全清理" icon={<RotateCcw size={16} />} commands={guide.cleanup} />
      </Card>

      {scenarios.map((scenario) => (
        <section className="scenario-card" key={scenario.id}>
          <div className="scenario-heading">
            <p className="eyebrow">实操场景</p>
            <h3>{scenario.title}</h3>
            <p>{scenario.context}</p>
            <p>
              <strong>场景目标：</strong>
              {scenario.goal}
            </p>
            <div className="image-notes">
              {scenario.images.map((image) => (
                <span key={image.name}>
                  <code>{image.name}</code> · {image.purpose}（{image.source}）
                </span>
              ))}
            </div>
          </div>
          <div className="step-list">
            {scenario.steps.map((step, index) => (
              <StepCard
                key={step.id}
                index={index + 1}
                step={step}
                done={completed.includes(step.id)}
                onToggle={() => void toggleStep(step.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function StepCard({
  index,
  step,
  done,
  onToggle,
}: {
  index: number;
  step: ExerciseStep;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className={done ? "exercise-step is-done" : "exercise-step"}>
      <div className="step-title">
        <span className="step-number">{String(index).padStart(2, "0")}</span>
        <div>
          <p className="eyebrow">步骤 {index}</p>
          <h4>{step.prompt}</h4>
        </div>
        <button className="step-check" type="button" onClick={onToggle} aria-pressed={done}>
          <CheckCircle2 size={18} /> {done ? "已完成" : "标记完成"}
        </button>
      </div>
      <p className="step-objective">
        <strong>操作目标：</strong>
        {step.objective}
      </p>
      {step.dangerous && (
        <p className="danger-warning">
          <AlertTriangle size={16} />
          此步骤可能删除或暴露资源，请确认只操作 `commandlab-` 前缀对象。
        </p>
      )}
      <CommandList title="准备命令" commands={step.setup} />
      <details>
        <summary>
          <ChevronDown size={16} />
          查看分级提示
        </summary>
        <ul>
          {step.hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </details>
      <details>
        <summary>
          <ChevronDown size={16} />
          查看参考答案
        </summary>
        <p>{step.answer.explanation}</p>
        <CommandList title="答案命令" commands={step.answer.commands} />
        <p>
          <strong>关键预期：</strong>
          {step.expected}
        </p>
      </details>
      <details>
        <summary>
          <ChevronDown size={16} />
          查看验证、坑点和清理
        </summary>
        <p>
          <strong>验证：</strong>
        </p>
        <CommandList title="验证命令" commands={step.verify} />
        <p>
          <strong>常见坑点：</strong>
          {step.pitfalls
            .map(
              (pitfall) =>
                `${pitfall.symptom}（原因：${pitfall.cause}；恢复：${pitfall.recovery}）`,
            )
            .join("；")}
        </p>
        <p>
          <strong>命令辨析：</strong>
          {step.comparisons
            .map(
              (item) =>
                `${item.command}：${item.purpose}，范围${item.scope}，风险${item.risk}，${item.reversible}`,
            )
            .join("；")}
        </p>
        <CommandList title="清理命令" commands={step.cleanup} />
        <p>
          <strong>衍生练习：</strong>
          {step.variants.join("；")}
        </p>
      </details>
    </Card>
  );
}

function CommandList({
  title,
  icon,
  commands,
}: {
  title: string;
  icon?: React.ReactNode;
  commands: Array<{ command: string; description: string; shell?: string }>;
}) {
  async function copy(command: string) {
    await navigator.clipboard.writeText(command);
  }
  return (
    <div className="command-group">
      <h4>
        {icon}
        {title}
      </h4>
      {commands.map((item) => (
        <div className="command-line" key={`${title}-${item.command}`}>
          <code>{item.command}</code>
          <button
            type="button"
            onClick={() => void copy(item.command)}
            aria-label={`复制命令 ${item.command}`}
          >
            复制
          </button>
        </div>
      ))}
    </div>
  );
}
