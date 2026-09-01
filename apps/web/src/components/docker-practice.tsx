"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronDown, Clipboard, RotateCcw } from "lucide-react";
import { TerminalSquare } from "lucide-react";
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
  const [attempted, setAttempted] = useState<string[]>([]);
  const [platform, setPlatform] =
    useState<DockerLesson["platforms"][number]["platform"]>("windows");
  const guide = platforms.find((item) => item.platform === platform) ?? platforms[0]!;

  useEffect(() => {
    void getLessonProgress(lessonId).then((progress) => {
      setCompleted(progress.completedSteps);
      setAttempted(progress.attemptedSteps);
    });
  }, [lessonId]);

  async function toggleStep(stepId: string) {
    const next = completed.includes(stepId)
      ? completed.filter((item) => item !== stepId)
      : [...completed, stepId];
    setCompleted(next);
    await updateLessonProgress(lessonId, { completedSteps: next });
  }

  async function toggleAttempted(stepId: string) {
    const next = attempted.includes(stepId)
      ? attempted.filter((item) => item !== stepId)
      : [...attempted, stepId];
    setAttempted(next);
    await updateLessonProgress(lessonId, { attemptedSteps: next });
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

      <div className="practice-bridge">
        <div>
          <p className="eyebrow">没有本机 Docker 也能继续</p>
          <strong>先在浏览器里模拟本节命令，再决定是否复制到电脑执行。</strong>
          <p>仿真终端只改变当前页面的内存状态，不会安装软件或修改文件。</p>
        </div>
        <Link
          href="/terminal/?mode=docker#docker-terminal"
          className="ui-button ui-button--secondary"
        >
          <TerminalSquare size={15} /> 打开 Docker 在线终端
        </Link>
      </div>

      {scenarios.map((scenario) => (
        <section className="scenario-card" key={scenario.id}>
          <div className="scenario-heading">
            <p className="eyebrow">实操场景 · 一个主任务 + 一个变体</p>
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
                attempted={attempted.includes(step.id)}
                onToggle={() => void toggleStep(step.id)}
                onToggleAttempted={() => void toggleAttempted(step.id)}
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
  attempted,
  onToggle,
  onToggleAttempted,
}: {
  index: number;
  step: ExerciseStep;
  done: boolean;
  attempted: boolean;
  onToggle: () => void;
  onToggleAttempted: () => void;
}) {
  return (
    <Card className={done ? "exercise-step is-done" : "exercise-step"}>
      <div className="step-title">
        <span className="step-number">{String(index).padStart(2, "0")}</span>
        <div>
          <p className="eyebrow">
            {step.role === "main" ? "主任务" : "变体任务"} · 步骤 {index}
          </p>
          <h4>{step.prompt}</h4>
        </div>
        <div className="step-state-actions">
          <button
            className="step-check"
            type="button"
            onClick={onToggleAttempted}
            aria-pressed={attempted}
          >
            {attempted ? "已尝试" : "标记已尝试"}
          </button>
          <button className="step-check" type="button" onClick={onToggle} aria-pressed={done}>
            <CheckCircle2 size={18} /> {done ? "已完成" : "标记完成"}
          </button>
        </div>
      </div>
      <p className="step-objective">
        <strong>操作目标：</strong>
        {step.objective}
      </p>
      {step.answer.commands[0] ? (
        <div className="step-online-action">
          <span>浏览器先试一遍</span>
          <Link href="/terminal/?mode=docker#docker-terminal" className="step-online-link">
            <TerminalSquare size={13} /> {step.answer.commands[0].command}
          </Link>
        </div>
      ) : null}
      {step.dangerous && (
        <p className="danger-warning">
          <AlertTriangle size={16} />
          此步骤可能删除或暴露资源，请确认只操作 `commandlab-` 前缀对象。
        </p>
      )}
      <div className="step-preparation">
        <strong>开始前确认</strong>
        <ul>
          {step.preparation.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
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
        <div className="answer-details-grid">
          <div>
            <h4>参数与关键字解释</h4>
            <ul>
              {step.answer.parameters.map((parameter) => (
                <li key={`${parameter.token}-${parameter.meaning}`}>
                  <code>{parameter.token}</code>：{parameter.meaning}。{parameter.effect}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Docker 内部执行流程</h4>
            <ol>
              {step.answer.process.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
          <div>
            <h4>对象状态变化</h4>
            <ul>
              {step.answer.stateChanges.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p>
          <strong>关键预期：</strong>
          {step.expected}
        </p>
      </details>
      <details>
        <summary>
          <ChevronDown size={16} />
          查看验证方法
        </summary>
        <CommandList title="验证命令" commands={step.verify} />
        <p className="verification-note">
          逐条执行后，核对命令描述中的字段或状态；不要只凭“命令没有报错”判断成功。
        </p>
      </details>
      <details>
        <summary>
          <ChevronDown size={16} />
          查看坑点与恢复
        </summary>
        <p>
          <strong>排查顺序：</strong>
          保留原始错误，先确认对象，再确认状态，接着判断原因，最后执行定向恢复。
        </p>
        <div className="pitfall-list">
          {step.pitfalls.map((pitfall) => (
            <div className="pitfall-item" key={pitfall.symptom}>
              <strong>{pitfall.symptom}</strong>
              <p>
                <b>原因：</b>
                {pitfall.cause}
              </p>
              {pitfall.diagnosis && (
                <p>
                  <b>排查：</b>
                  {pitfall.diagnosis}
                </p>
              )}
              <p>
                <b>恢复：</b>
                {pitfall.recovery}
              </p>
            </div>
          ))}
        </div>
        <p>
          <strong>排查顺序：</strong>
          {step.diagnosisOrder.join(" → ")}
        </p>
      </details>
      <details>
        <summary>
          <ChevronDown size={16} />
          查看命令辨析与变体练习
        </summary>
        <p>
          <strong>命令辨析：</strong>
          {step.comparisons
            .map(
              (item) =>
                `${item.command}：${item.purpose}，范围${item.scope}，风险${item.risk}，${item.reversible}`,
            )
            .join("；")}
        </p>
        <p>
          <strong>衍生练习：</strong>
          {step.variants.join("；")}
        </p>
      </details>
      <details>
        <summary>
          <ChevronDown size={16} />
          查看精确清理
        </summary>
        {step.dangerous && (
          <p className="danger-warning">
            <AlertTriangle size={16} />
            清理会删除本步骤创建的对象。先核对名称，只执行与当前课程相符的命令。
          </p>
        )}
        <CommandList title="清理命令" commands={step.cleanup} />
        <p className="verification-note">
          <strong>影响范围：</strong>
          {step.cleanupScope}
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
        <div className="command-item" key={`${title}-${item.command}`}>
          <div className="command-line">
            <code>{item.command}</code>
            <button
              type="button"
              onClick={() => void copy(item.command)}
              aria-label={`复制命令 ${item.command}`}
            >
              复制
            </button>
          </div>
          <p className="command-description">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
