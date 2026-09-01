"use client";

import {
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  StepBack,
  StepForward,
  Terminal,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  TeachingDockerState,
  TeachingFrame,
  TeachingGitState,
  TeachingScene,
} from "@commandlab/content-schema";
import { Button } from "@commandlab/ui";
import { CommandSpecificStage } from "./command-specific-views";

/** 教学动画总控：时间轴驱动终端、状态快照和 SVG，组件不推断命令语义。 */
export function CommandAnimation({
  scene,
  embedded = false,
}: {
  scene: TeachingScene;
  embedded?: boolean;
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(!embedded);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(0.5);
  const frame = scene.frames[frameIndex] ?? scene.frames[0]!;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) {
        setFrameIndex(scene.frames.length - 1);
        setPlaying(false);
      }
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [scene.frames.length]);

  useEffect(() => {
    if (!playing || reducedMotion || frameIndex >= scene.frames.length - 1) return;
    const timer = window.setTimeout(() => {
      if (frameIndex >= scene.frames.length - 2) {
        setFrameIndex(scene.frames.length - 1);
        setPlaying(false);
      } else {
        setFrameIndex((current) => current + 1);
      }
    }, frame.duration / playbackRate);
    return () => window.clearTimeout(timer);
  }, [frame.duration, frameIndex, playbackRate, playing, reducedMotion, scene.frames.length]);

  const selectFrame = (index: number) => {
    setFrameIndex(index);
    setPlaying(false);
  };
  const replay = () => {
    setFrameIndex(0);
    setPlaying(!reducedMotion);
  };

  return (
    <section
      className={`teaching-animation teaching-animation--${scene.tool}${embedded ? " teaching-animation--embedded" : ""}`}
      aria-label={`${scene.title} 教学演示`}
    >
      <div className="teaching-workbench">
        <TerminalPanel scene={scene} frame={frame} />
        <TeachingCanvas scene={scene} frame={frame} zoom={zoom} />
      </div>
      <div className="teaching-controls" aria-label="动画控制">
        <Button
          variant="secondary"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? "暂停动画" : "播放动画"}
          title={playing ? "暂停动画" : "播放动画"}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? "暂停" : "播放"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => selectFrame(Math.max(0, frameIndex - 1))}
          disabled={frameIndex === 0}
          aria-label="上一步"
          title="上一步"
        >
          <StepBack size={16} />
          上一步
        </Button>
        <Button
          variant="ghost"
          onClick={() => selectFrame(Math.min(scene.frames.length - 1, frameIndex + 1))}
          disabled={frameIndex === scene.frames.length - 1}
          aria-label="下一步"
          title="下一步"
        >
          <StepForward size={16} />
          下一步
        </Button>
        <Button variant="ghost" onClick={replay} aria-label="重新播放" title="重新播放">
          <RotateCcw size={16} />
          重播
        </Button>
        <span className="teaching-control-divider" aria-hidden="true" />
        <Button
          variant="ghost"
          onClick={() => setZoom((value) => Math.min(1.3, value + 0.1))}
          disabled={zoom >= 1.3}
          aria-label="放大画布"
          title="放大画布"
        >
          <ZoomIn size={16} />
          放大
        </Button>
        <Button
          variant="ghost"
          onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}
          disabled={zoom <= 0.8}
          aria-label="缩小画布"
          title="缩小画布"
        >
          <ZoomOut size={16} />
          缩小
        </Button>
        <Button variant="ghost" onClick={() => setZoom(1)} aria-label="重置视图" title="重置视图">
          <Maximize2 size={16} />
          重置视图
        </Button>
        <Button
          variant="ghost"
          onClick={() => setZoom(1)}
          aria-label="自动适配画布"
          title="自动适配画布"
        >
          <ScanLine size={16} />
          适配
        </Button>
        <span className="teaching-control-divider" aria-hidden="true" />
        <span className="teaching-speed-label">播放速度</span>
        <div className="teaching-speed" role="group" aria-label="播放速度">
          {[0.5, 0.7, 1].map((rate) => (
            <button
              className={playbackRate === rate ? "is-active" : ""}
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              type="button"
              aria-pressed={playbackRate === rate}
              title={`${rate} 倍速`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
      <div className="teaching-timeline" role="list" aria-label="命令执行时间轴">
        {scene.frames.map((item, index) => (
          <button
            className={index === frameIndex ? "is-active" : index < frameIndex ? "is-complete" : ""}
            key={item.id}
            onClick={() => selectFrame(index)}
            role="listitem"
            aria-label={`${phaseLabel(item)}：${item.narration}`}
          >
            <span className="teaching-timeline-dot">{index + 1}</span>
            <span>
              <strong>{phaseLabel(item)}</strong>
              <small>{item.commandText || "等待命令"}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="teaching-caption" aria-live="polite">
        <div>
          <span className="teaching-step">
            步骤 {frameIndex + 1} / {scene.frames.length}
          </span>
          <span className={`teaching-phase teaching-phase--${frame.phase}`}>
            {phaseLabel(frame)}
          </span>
        </div>
        <h3>{frame.narration}</h3>
        <div className="teaching-events">
          {frame.events.length ? (
            frame.events.map((item) => (
              <span key={`${item.type}-${item.subject}`}>
                <i />
                {item.detail}
              </span>
            ))
          ) : (
            <span>
              <i />
              {frame.phase === "idle"
                ? "画布已准备好，马上开始自动输入。"
                : "此阶段保持对象不变，先观察上下文。"}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function phaseLabel(frame: TeachingFrame) {
  return {
    idle: "准备",
    typing: "自动输入",
    executing: "执行命令",
    transitioning: "状态变化",
    settled: "完成",
  }[frame.phase];
}

function TerminalPanel({ scene, frame }: { scene: TeachingScene; frame: TeachingFrame }) {
  return (
    <div className="teaching-terminal" aria-label="自动命令终端">
      <div className="teaching-terminal-topbar">
        <span className="terminal-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <Terminal size={14} />
        <strong>commandlab · 教学终端</strong>
        <span className="teaching-terminal-status">{phaseLabel(frame)}</span>
      </div>
      <div className="teaching-terminal-body">
        <p className="terminal-prompt">
          <span>learner@commandlab</span>:~/demo$ <strong>{frame.commandText}</strong>
          <b className={frame.phase === "typing" ? "is-blinking" : ""}>▌</b>
        </p>
        {frame.phase === "idle" ? (
          <p className="terminal-muted">
            准备输入：<code>{scene.command}</code>
          </p>
        ) : null}
        {frame.terminalLines.map((line, index) => (
          <p
            className={
              index === frame.terminalLines.length - 1 && frame.phase === "executing"
                ? "terminal-line terminal-line--active"
                : "terminal-line"
            }
            key={`${line}-${index}`}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function TeachingCanvas({
  scene,
  frame,
  zoom,
}: {
  scene: TeachingScene;
  frame: TeachingFrame;
  zoom: number;
}) {
  return (
    <div className="teaching-canvas-wrap">
      <CommandSpecificStage scene={scene} frame={frame} zoom={zoom} />
    </div>
  );
}

// 旧 SVG 兼容实现暂由新命令专属舞台替代，保留在此文件便于迁移旧快照。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CanvasHeader({ scene, frame }: { scene: TeachingScene; frame: TeachingFrame }) {
  return (
    <g className="canvas-header">
      <text x="28" y="28" className="canvas-kicker">
        {scene.tool === "git" ? "GIT REPOSITORY" : "DOCKER ENGINE"}
      </text>
      <text x="28" y="52" className="canvas-command">
        {frame.commandText || scene.command}
      </text>
      <text x="1150" y="28" className="canvas-phase">
        {phaseLabel(frame)}
      </text>
    </g>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function GitCanvas({
  state,
  initialState,
  frame,
}: {
  state: TeachingGitState;
  initialState: TeachingGitState;
  frame: TeachingFrame;
}) {
  const positions = commitPositions(state);
  const active = new Set(frame.activeIds);
  frame.events.forEach((event) => {
    if (event.type === "merge-parents") {
      active.add("B");
      active.add("C");
    }
    if (event.type === "commit-replay") active.add("C");
    if (event.type === "remote-transfer") active.add("origin/main");
  });
  const changes =
    frame.phase === "executing" && frame.events.length
      ? frame.events.map(eventSummary).slice(0, 4)
      : summarizeGitChanges(initialState, state);
  return (
    <g className={`git-canvas git-canvas--${frame.transition}`}>
      <rect
        className="canvas-panel canvas-panel--workspace"
        x="20"
        y="76"
        width="350"
        height="510"
        rx="8"
      />
      <text className="canvas-panel-title" x="44" y="108">
        文件与暂存区
      </text>
      <text className="canvas-panel-subtitle" x="44" y="132">
        {state.repositoryInitialized ? "文件当前所在的地方" : "还没有 .git 目录"}
      </text>
      <text className="canvas-section-label" x="44" y="166">
        工作区
      </text>
      {state.workingTree.map((file, index) => (
        <FileChip
          file={file}
          x={44}
          y={180 + index * 38}
          active={active.has(file.path) || active.has("working-tree")}
          key={file.path}
        />
      ))}
      <line className="canvas-divider" x1="44" x2="346" y1="310" y2="310" />
      <text className="canvas-section-label" x="44" y="338">
        暂存区
      </text>
      {state.staging.length ? (
        state.staging.map((path, index) => (
          <g className="staged-chip" key={path}>
            <rect x="44" y={354 + index * 30} width="302" height="24" rx="5" />
            <text x="56" y={371 + index * 30}>
              {path}
            </text>
          </g>
        ))
      ) : (
        <text className="canvas-empty" x="44" y="370">
          暂存区为空
        </text>
      )}
      <text className="canvas-section-label" x="44" y="458">
        HEAD
      </text>
      <text className="canvas-ref" x="98" y="458">
        {state.head.name || "未初始化"}
        {state.head.commit ? ` → ${state.head.commit}` : ""}
      </text>
      <text className="canvas-section-label" x="44" y="490">
        stash 临时抽屉
      </text>
      <text className="canvas-ref" x="160" y="490">
        {state.stash.length ? state.stash.join(" · ") : "为空"}
      </text>
      <rect
        className="canvas-panel canvas-panel--graph"
        x="390"
        y="76"
        width="770"
        height="510"
        rx="8"
      />
      <text className="canvas-panel-title" x="424" y="108">
        提交图与引用
      </text>
      <text className="canvas-panel-subtitle" x="424" y="132">
        节点是快照，线表示父提交关系
      </text>
      <ChangeSummary changes={changes} frame={frame} />
      <ActionFlow frame={frame} positions={positions} />
      {state.commits.length ? (
        state.commits.map((commit, commitIndex) =>
          commit.parents.map((parent, parentIndex) => {
            const from = positions[parent];
            const to = positions[commit.id];
            return from && to ? (
              <path
                className={`commit-edge ${active.has(commit.id) || active.has(parent) ? "is-active" : ""}`}
                d={`M ${from.x} ${from.y} C ${from.x + 55} ${from.y}, ${to.x - 55} ${to.y}, ${to.x} ${to.y}`}
                key={`commit-edge-${commitIndex}-${parentIndex}-${parent}-${commit.id}`}
              />
            ) : null;
          }),
        )
      ) : (
        <text className="canvas-empty" x="650" y="350">
          执行 git init 后，提交图会从这里开始
        </text>
      )}
      {state.commits.map((commit) => (
        <CommitNode
          key={commit.id}
          commit={commit}
          position={positions[commit.id]!}
          active={active.has(commit.id) || active.has("commit-create")}
          current={commit.id === state.head.commit}
        />
      ))}
      {Object.entries(state.branches).map(([name, commitId]) =>
        positions[commitId] ? (
          <BranchPointer
            name={name}
            position={positions[commitId]!}
            active={active.has(name) || active.has("branch-create") || name === state.head.name}
            key={name}
          />
        ) : null,
      )}
      {state.head.commit && positions[state.head.commit] ? (
        <BranchPointer
          name="HEAD"
          position={positions[state.head.commit]!}
          active={active.has("HEAD") || state.head.kind === "detached"}
          head
          key="HEAD"
        />
      ) : null}
      {Object.entries(state.tags).map(([name, commitId]) =>
        positions[commitId] ? (
          <BranchPointer
            name={name}
            position={positions[commitId]!}
            active={active.has(name)}
            tag
            key={`tag-${name}`}
          />
        ) : null,
      )}
      {Object.entries(state.remoteBranches).map(([name, commitId]) =>
        positions[commitId] ? (
          <BranchPointer
            name={name}
            position={{ ...positions[commitId]!, y: positions[commitId]!.y + 36 }}
            active={active.has(name) || active.has("origin/main")}
            remote
            key={`remote-${name}`}
          />
        ) : null,
      )}
    </g>
  );
}

function summarizeGitChanges(before: TeachingGitState, after: TeachingGitState): string[] {
  const changes: string[] = [];
  if (!before.repositoryInitialized && after.repositoryInitialized)
    changes.push("普通文件夹 → Git 仓库：创建 .git 目录");
  const beforeFiles = new Map(before.workingTree.map((file) => [file.path, file.status]));
  after.workingTree.forEach((file) => {
    const previous = beforeFiles.get(file.path);
    if (previous && previous !== file.status)
      changes.push(`${file.path}：${statusLabel(previous)} → ${statusLabel(file.status)}`);
  });
  const beforeStaging = new Set(before.staging);
  after.staging
    .filter((path) => !beforeStaging.has(path))
    .forEach((path) => changes.push(`${path}：工作区 → 暂存区`));
  if (after.commits.length > before.commits.length) {
    const created = after.commits.slice(before.commits.length);
    created.forEach((commit) => changes.push(`新增提交 ${commit.id}：${commit.message}`));
  }
  Object.entries(after.branches).forEach(([name, commit]) => {
    if (!before.branches[name]) changes.push(`新建分支 ${name} → ${commit}`);
    else if (before.branches[name] !== commit)
      changes.push(`${name} 指针：${before.branches[name]} → ${commit}`);
  });
  if (before.head.name !== after.head.name || before.head.commit !== after.head.commit)
    changes.push(
      `HEAD：${before.head.name}@${before.head.commit} → ${after.head.name}@${after.head.commit}`,
    );
  Object.entries(after.remoteBranches).forEach(([name, commit]) => {
    if (before.remoteBranches[name] !== commit)
      changes.push(`${name}：${before.remoteBranches[name] ?? "无"} → ${commit}`);
  });
  if (before.stash.length !== after.stash.length)
    changes.push(`stash：${before.stash.length} 条临时改动 → ${after.stash.length} 条`);
  Object.entries(after.tags).forEach(([name, commit]) => {
    if (before.tags[name] !== commit) changes.push(`标签 ${name} → ${commit}`);
  });
  Object.entries(after.remotes).forEach(([name, url]) => {
    if (before.remotes[name] !== url) changes.push(`远端 ${name}：已登记共享地址`);
  });
  Object.entries(after.config).forEach(([name, value]) => {
    if (before.config[name] !== value) changes.push(`配置 ${name}：已写入 ${value}`);
  });
  if (before.workingTree.length > after.workingTree.length)
    changes.push(`清理：移除 ${before.workingTree.length - after.workingTree.length} 个未跟踪文件`);
  return changes.length ? changes.slice(0, 4) : ["状态保持不变：这条命令只读取信息。"];
}

function eventSummary(event: TeachingFrame["events"][number]): string {
  const labels: Record<string, string> = {
    "file-stage": "文件 chip 正在从工作区移入暂存区",
    "file-unstage": "文件从暂存区返回工作区",
    "commit-create": "暂存快照正在收束为新的提交节点",
    "pointer-move": "分支指针和 HEAD 正在移动",
    "branch-create": "新分支指针正在当前提交上出现",
    "head-switch": "HEAD 正在切换到另一条分支路线",
    "merge-parents": "两条父线正在汇合为一个合并提交",
    "commit-replay": "旧提交正在新底稿上逐个重放",
    "tag-create": "标签正在固定到当前提交",
    "remote-transfer": "提交对象正在本地与远端引用之间传输",
    "recovery-restore": "文件或提交正在沿恢复路径回到安全位置",
    "stash-save": "未完成改动正在进入 stash 抽屉",
    "cleanup-remove": "清理范围内的对象正在被移除",
    "diagnostic-read": "命令正在读取状态证据，没有写入提交图",
  };
  return labels[event.type] ?? event.detail;
}

function ChangeSummary({
  changes,
  frame,
  x = 424,
  y = 150,
  width = 702,
  height = 94,
}: {
  changes: string[];
  frame: TeachingFrame;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  return (
    <g className={`change-summary change-summary--${frame.phase}`}>
      <rect x={x} y={y} width={width} height={height} rx="10" />
      <text className="change-summary-title" x={x + 22} y={y + 27}>
        {frame.phase === "executing" ? "命令正在改变" : "这条命令实际改变了什么"}
      </text>
      {changes.map((change, index) => (
        <text className="change-summary-item" x={x + 22} y={y + 51 + index * 18} key={change}>
          <tspan className="change-summary-bullet">→</tspan> {change}
        </text>
      ))}
    </g>
  );
}

function ActionFlow({
  frame,
  positions,
}: {
  frame: TeachingFrame;
  positions: Record<string, { x: number; y: number }>;
}) {
  if (!frame.events.length || frame.phase === "idle" || frame.phase === "typing") return null;
  const type = frame.events[0]?.type;
  const latest = positions[Object.keys(positions).at(-1) ?? ""];
  if (type === "merge-parents" && latest && positions.B && positions.C) {
    return (
      <g className="action-flow">
        <path
          d={`M ${positions.B.x} ${positions.B.y} C ${positions.B.x + 80} ${positions.B.y} ${latest.x - 100} ${latest.y} ${latest.x - 32} ${latest.y}`}
          markerEnd="url(#teaching-arrow)"
        />
        <path
          d={`M ${positions.C.x} ${positions.C.y} C ${positions.C.x + 70} ${positions.C.y} ${latest.x - 70} ${latest.y} ${latest.x - 32} ${latest.y}`}
          markerEnd="url(#teaching-arrow)"
        />
        <text x="875" y="310" className="action-flow-label">
          双父线汇合
        </text>
      </g>
    );
  }
  if (type === "commit-replay" && latest && positions.C) {
    return (
      <g className="action-flow">
        <path
          d={`M ${positions.C.x} ${positions.C.y} C ${positions.C.x + 90} ${positions.C.y} ${latest.x - 90} ${latest.y} ${latest.x - 32} ${latest.y}`}
          markerEnd="url(#teaching-arrow)"
        />
        <text x="860" y="250" className="action-flow-label">
          重放到新底稿
        </text>
      </g>
    );
  }
  const flow =
    type === "file-stage"
      ? { d: "M 198 215 C 330 215 330 355 198 365", label: "文件移动" }
      : type === "commit-create" && latest
        ? {
            d: `M 350 365 C 415 365 420 ${latest.y} ${latest.x - 32} ${latest.y}`,
            label: "封存为提交",
          }
        : type === "branch-create" && latest
          ? {
              d: `M ${latest.x} ${latest.y + 34} C ${latest.x} ${latest.y + 5} ${latest.x} ${latest.y - 5} ${latest.x} ${latest.y - 28}`,
              label: "创建指针",
            }
          : type === "remote-transfer"
            ? { d: "M 1070 520 C 930 520 890 540 790 540", label: "对象传输" }
            : type === "stash-save"
              ? { d: "M 195 235 C 245 300 270 430 195 480", label: "收进抽屉" }
              : type === "recovery-restore"
                ? { d: "M 720 480 C 580 480 500 430 350 430", label: "恢复路径" }
                : null;
  return flow ? (
    <g className="action-flow">
      <path d={flow.d} markerEnd="url(#teaching-arrow)" />
      <text x="790" y="270" className="action-flow-label">
        {flow.label}
      </text>
    </g>
  ) : null;
}

function statusLabel(status: TeachingGitState["workingTree"][number]["status"]): string {
  return { untracked: "未跟踪", modified: "已修改", staged: "已暂存", clean: "干净" }[status];
}

function commitPositions(state: TeachingGitState): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  state.commits.forEach((commit, index) => {
    const laneY =
      commit.lane === "feature"
        ? 360
        : commit.lane === "remote"
          ? 540
          : commit.lane === "replay"
            ? 280
            : 480;
    positions[commit.id] = { x: 470 + index * 140, y: laneY };
  });
  return positions;
}

function FileChip({
  file,
  x,
  y,
  active,
}: {
  file: TeachingGitState["workingTree"][number];
  x: number;
  y: number;
  active: boolean;
}) {
  return (
    <g className={`file-chip file-chip--${file.status} ${active ? "is-active" : ""}`}>
      <rect x={x} y={y} width="302" height="28" rx="5" />
      <text x={x + 12} y={y + 19}>
        {file.path}
      </text>
      <text x={x + 288} y={y + 19} textAnchor="end">
        {file.status}
      </text>
    </g>
  );
}

function CommitNode({
  commit,
  position,
  active,
  current,
}: {
  commit: TeachingGitState["commits"][number];
  position: { x: number; y: number };
  active: boolean;
  current: boolean;
}) {
  return (
    <g
      className={`commit-node ${active ? "is-active" : ""} ${current ? "is-current" : ""}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <circle r="28" />
      <text textAnchor="middle" y="5">
        {commit.id}
      </text>
      <text className="commit-message" textAnchor="middle" y="52">
        {commit.message}
      </text>
    </g>
  );
}

function BranchPointer({
  name,
  position,
  active,
  head = false,
  tag = false,
  remote = false,
}: {
  name: string;
  position: { x: number; y: number };
  active: boolean;
  head?: boolean;
  tag?: boolean;
  remote?: boolean;
}) {
  const width = Math.max(72, name.length * 8 + 24);
  return (
    <g
      className={`branch-pointer ${head ? "is-head" : ""} ${tag ? "is-tag" : ""} ${remote ? "is-remote" : ""} ${active ? "is-active" : ""}`}
      style={{ transform: `translate(${position.x - width / 2}px, ${position.y - 64}px)` }}
    >
      <rect width={width} height="28" rx="6" />
      <text x={width / 2} y="19" textAnchor="middle">
        {name}
      </text>
    </g>
  );
}

function summarizeDockerChanges(before: TeachingDockerState, after: TeachingDockerState): string[] {
  const changes: string[] = [];
  const beforeImages = new Map(before.images.map((image) => [image.id, image.status]));
  after.images.forEach((image) => {
    if (beforeImages.get(image.id) !== image.status)
      changes.push(`镜像 ${image.name}：${beforeImages.get(image.id) ?? "无"} → ${image.status}`);
  });
  const beforeContainers = new Map(
    before.containers.map((container) => [container.id, container.status]),
  );
  after.containers.forEach((container) => {
    if (beforeContainers.get(container.id) !== container.status)
      changes.push(
        `容器 ${container.name}：${beforeContainers.get(container.id) ?? "无"} → ${container.status}`,
      );
  });
  if (before.networks.join() !== after.networks.join())
    changes.push(
      `网络：${before.networks.length ? before.networks.join("、") : "无"} → ${after.networks.join("、") || "无"}`,
    );
  if (before.volumes.length !== after.volumes.length)
    changes.push(`卷：${before.volumes.length} 个 → ${after.volumes.length} 个`);
  if (before.ports.length !== after.ports.length)
    changes.push(
      `端口：${before.ports.length ? "已映射" : "无"} → ${after.ports.length ? "已映射" : "无"}`,
    );
  return changes.length ? changes.slice(0, 4) : ["状态保持不变：这条命令只读取 Engine 证据。"];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DockerCanvas({
  state,
  initialState,
  frame,
}: {
  state: TeachingDockerState;
  initialState: TeachingDockerState;
  frame: TeachingFrame;
}) {
  const active = new Set(frame.activeIds);
  const changes = summarizeDockerChanges(initialState, state);
  return (
    <g className={`docker-canvas docker-canvas--${frame.transition}`}>
      <rect className="canvas-panel" x="20" y="76" width="1140" height="510" rx="8" />
      <text className="canvas-panel-title" x="44" y="108">
        Engine 对象状态
      </text>
      <text className="canvas-panel-subtitle" x="44" y="132">
        镜像、容器和持久化资源各自有生命周期
      </text>
      <ChangeSummary changes={changes} frame={frame} x={620} y={95} width={520} height={115} />
      <DockerRow
        label="镜像"
        items={state.images.map((item) => `${item.name} · ${item.status}`)}
        y={220}
        active={active.has("image") || active.has("layers")}
      />
      <DockerRow
        label="容器"
        items={state.containers.map((item) => `${item.name} · ${item.status}`)}
        y={295}
        active={active.has("container") || active.has("process")}
      />
      <DockerRow
        label="网络"
        items={state.networks.length ? state.networks : ["没有创建网络"]}
        y={370}
        active={active.has("network") || active.has("boundary")}
      />
      <DockerRow
        label="卷"
        items={
          state.volumes.length
            ? state.volumes.map((item) => `${item.name} · ${item.bytes}B`)
            : ["没有挂载卷"]
        }
        y={445}
        active={active.has("volume") || active.has("mount")}
      />
      <DockerRow
        label="端口"
        items={
          state.ports.length
            ? state.ports.map((port) => `${port.host}:${port.container} → ${port.target}`)
            : ["没有端口映射"]
        }
        y={520}
        active={active.has("network") || active.has("port")}
      />
    </g>
  );
}

function DockerRow({
  label,
  items,
  y,
  active,
}: {
  label: string;
  items: string[];
  y: number;
  active: boolean;
}) {
  return (
    <g className={`docker-row ${active ? "is-active" : ""}`}>
      <text className="canvas-section-label" x="44" y={y + 21}>
        {label}
      </text>
      {items.map((item, index) => (
        <g key={item}>
          <rect x={150 + index * 245} y={y} width="215" height="42" rx="6" />
          <circle cx={170 + index * 245} cy={y + 21} r="6" />
          <text x={186 + index * 245} y={y + 25}>
            {item}
          </text>
        </g>
      ))}
    </g>
  );
}
