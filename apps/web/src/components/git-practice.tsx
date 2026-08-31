"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Clipboard, RotateCcw } from "lucide-react";
import { Card } from "@commandlab/ui";
import { getLessonProgress, updateLessonProgress } from "@commandlab/practice-runtime";
import type { GitLesson } from "@commandlab/content-schema";

const platformNames = {
  windows: "Windows PowerShell",
  macos: "macOS 终端",
  linux: "Linux 终端",
} as const;

type GitStep = {
  id: string;
  role: "main" | "variant";
  prompt: string;
  objective: string;
  preparation: string[];
  hints: string[];
  commands: string[];
  expected: string;
  verify: string[];
  variant: string;
};

/** Git 深度练习面板：把旧版字段组合成与 Docker 一致的任务、答案、验证和恢复闭环。 */
export function GitPractice({ lesson }: { lesson: GitLesson }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [attempted, setAttempted] = useState<string[]>([]);
  const [platform, setPlatform] = useState<GitLesson["platforms"][number]["platform"]>("windows");
  const guide = lesson.platforms.find((item) => item.platform === platform) ?? lesson.platforms[0]!;
  const steps = useMemo(() => buildSteps(lesson, guide), [lesson, guide]);

  useEffect(() => {
    void getLessonProgress(lesson.id).then((progress) => {
      setCompleted(progress.completedSteps);
      setAttempted(progress.attemptedSteps);
    });
  }, [lesson.id]);

  async function toggle(
    list: string[],
    setter: (value: string[]) => void,
    stepId: string,
    field: "completedSteps" | "attemptedSteps",
  ) {
    const next = list.includes(stepId) ? list.filter((item) => item !== stepId) : [...list, stepId];
    setter(next);
    await updateLessonProgress(lesson.id, { [field]: next });
  }

  return (
    <div className="git-practice docker-practice">
      <Card className="platform-overview">
        <div className="platform-tabs" role="tablist" aria-label="选择本机系统">
          {lesson.platforms.map((item) => (
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
        <p className="platform-note">{platformNote(platform)}</p>
        <CommandGroup
          title="进入练习前"
          icon={<Clipboard size={16} />}
          commands={guide.setup.map((command) => ({
            command,
            description: "准备练习环境；请按顺序逐行执行。",
          }))}
        />
        <CommandGroup
          title="整节完成后验证"
          icon={<CheckCircle2 size={16} />}
          commands={guide.verify.map((command) => ({
            command,
            description: "只读检查：核对目标状态和输出证据。",
          }))}
        />
        <CommandGroup
          title="安全清理"
          icon={<RotateCcw size={16} />}
          commands={guide.cleanup.map((command) => ({
            command,
            description: "只清理本节创建的隔离目录或对象。",
          }))}
        />
      </Card>

      <section className="scenario-card">
        <div className="scenario-heading">
          <p className="eyebrow">Git 实操场景 · 主任务 + 变体</p>
          <h3>把“{lesson.title}”变成一次可复盘的命令行操作</h3>
          <p>
            你不需要记住所有参数。先在隔离目录确认状态，再执行一条改变对象的命令，最后用只读命令核对证据。
          </p>
          <p>
            <strong>场景目标：</strong>
            {lesson.practice.goal}。完成后请能说出命令改变了工作区、暂存区、引用还是历史。
          </p>
        </div>
        <div className="step-list">
          {steps.map((step, index) => (
            <Card
              className={completed.includes(step.id) ? "exercise-step is-done" : "exercise-step"}
              key={step.id}
            >
              <div className="step-title">
                <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="eyebrow">
                    {step.role === "main" ? "主任务" : "变体任务"} · 步骤 {index + 1}
                  </p>
                  <h4>{step.prompt}</h4>
                </div>
                <div className="step-state-actions">
                  <button
                    className="step-check"
                    type="button"
                    onClick={() => void toggle(attempted, setAttempted, step.id, "attemptedSteps")}
                    aria-pressed={attempted.includes(step.id)}
                  >
                    {attempted.includes(step.id) ? "已尝试" : "标记已尝试"}
                  </button>
                  <button
                    className="step-check"
                    type="button"
                    onClick={() => void toggle(completed, setCompleted, step.id, "completedSteps")}
                    aria-pressed={completed.includes(step.id)}
                  >
                    <CheckCircle2 size={18} /> {completed.includes(step.id) ? "已完成" : "标记完成"}
                  </button>
                </div>
              </div>
              <p className="step-objective">
                <strong>操作目标：</strong>
                {step.objective}
              </p>
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
                  <ChevronDown size={16} /> 查看分级提示
                </summary>
                <ul>
                  {step.hints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              </details>
              <details>
                <summary>
                  <ChevronDown size={16} /> 查看参考答案与命令解释
                </summary>
                <p>
                  先执行下面的命令，再逐条阅读它们作用的对象。命令不会在浏览器中执行，只会复制到剪贴板。
                </p>
                <CommandGroup
                  title="答案命令"
                  commands={step.commands.map((command) => ({
                    command,
                    description: explainCommand(command),
                  }))}
                />
                <p>
                  <strong>关键预期：</strong>
                  {step.expected}
                </p>
              </details>
              <details>
                <summary>
                  <ChevronDown size={16} /> 查看验证方法
                </summary>
                <CommandGroup
                  title="验证命令"
                  commands={step.verify.map((command) => ({
                    command,
                    description: "只读检查：核对状态、文件或提交图，不会再次改变仓库。",
                  }))}
                />
                <p className="verification-note">
                  不要只凭“没有报错”判断成功；请指出输出中哪一行证明目标已达成。
                </p>
              </details>
              <details>
                <summary>
                  <ChevronDown size={16} /> 查看坑点、恢复与变体
                </summary>
                <p>
                  <strong>常见现象：</strong>
                  {lesson.pitfall.symptom}
                </p>
                <p>
                  <strong>可能原因：</strong>
                  {lesson.pitfall.cause}
                </p>
                <p>
                  <strong>恢复方式：</strong>
                  {lesson.pitfall.recovery}
                </p>
                <p>
                  <strong>排查顺序：</strong>保留原始错误 → 运行状态检查 → 确认作用范围 → 建立恢复点
                  → 定向修复。
                </p>
                <p>
                  <strong>变体练习：</strong>
                  {step.variant}
                </p>
              </details>
              {lesson.comparison.items.length > 0 && (
                <details>
                  <summary>
                    <ChevronDown size={16} /> 查看命令辨析
                  </summary>
                  <p>
                    <strong>{lesson.comparison.items.join(" vs ")}</strong>：
                    {lesson.comparison.guidance}
                  </p>
                  <p>
                    <strong>风险：</strong>
                    {lesson.comparison.risk} <strong>可逆性：</strong>
                    {lesson.comparison.reversible}
                  </p>
                </details>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function buildSteps(lesson: GitLesson, guide: GitLesson["platforms"][number]): GitStep[] {
  const primary = lesson.commands.map((item) => item.command);
  return [
    {
      id: `${lesson.id}-main`,
      role: "main",
      prompt: `在隔离仓库完成“${lesson.practice.goal}”，并留下可复核结果`,
      objective: lesson.objectives[0] ?? lesson.summary,
      preparation: [
        "确认你位于 commandlab-git-lab 目录，不要在真实项目执行本练习。",
        "先运行 git status，记录当前分支和工作区是否干净。",
      ],
      hints: [
        "先预测命令会改变哪棵树，再执行。",
        "遇到错误先保存完整文本，不要连续盲目重试。",
        "答案只在你卡住时展开。",
      ],
      commands: primary,
      expected: lesson.practice.expected,
      verify: guide.verify,
      variant: lesson.practice.variant,
    },
    {
      id: `${lesson.id}-variant`,
      role: "variant",
      prompt: `改变一个条件，重新完成“${lesson.title}”并解释差异`,
      objective: "只改变一个文件、分支或参数，比较前后状态并说明差异来自哪里。",
      preparation: [
        "保留主任务的输出或提交 ID，确保可以对照。",
        "确认变体仍在隔离仓库，且不会覆盖未保存的真实文件。",
      ],
      hints: [
        "一次只改一个变量，才能知道结果为什么变化。",
        "优先使用 status、diff、log 等只读命令确认。",
        "如果需要撤销，先建立临时分支或复制目录。",
      ],
      commands: [primary[0] ?? "git status", primary[1] ?? "git diff"],
      expected: "变体仍能用稳定字段验证，并能清楚指出与主任务不同的状态。",
      verify: ["git status --short", "git log --oneline --decorate -5"],
      variant: "把本节命令写成一条值班记录：对象、状态、证据、风险和清理结果。",
    },
  ];
}

function platformNote(platform: keyof typeof platformNames): string {
  if (platform === "windows")
    return "PowerShell 会把命令拆成独立行执行；如果看到路径提示，请先确认当前位置。";
  if (platform === "macos") return "macOS 终端使用 bash/zsh；复制多行命令时按顺序逐行执行。";
  return "Linux 终端通常使用 bash；权限或 Git 身份错误时先保留错误文本再排查。";
}

function explainCommand(command: string): string {
  if (command.includes("status")) return "读取当前分支、暂存区和工作区状态，属于只读观察。";
  if (command.includes("diff")) return "比较文件变化；加上 --staged 时比较暂存区与最近一次提交。";
  if (command.includes("add")) return "把指定文件的当前内容放入暂存区，等待下一次提交。";
  if (command.includes("commit")) return "把暂存区快照写入提交历史，并移动当前分支指针。";
  if (command.includes("log")) return "读取提交历史和引用位置，不修改仓库。";
  if (command.includes("branch")) return "查看或创建分支引用；分支本身只是指向提交的名称。";
  return "执行本节核心 Git 操作；执行前先确认作用范围。";
}

function CommandGroup({
  title,
  icon,
  commands,
}: {
  title: string;
  icon?: React.ReactNode;
  commands: Array<{ command: string; description: string }>;
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
