"use client";

import Link from "next/link";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Download,
  FileCode2,
  Files,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  GitPullRequestArrow,
  History,
  Layers,
  Play,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TeachingGitState } from "@commandlab/content-schema";
import { Button } from "@commandlab/ui";
import {
  createInteractiveGitState,
  createInteractiveWelcome,
  executeInteractiveGitCommand,
  getInteractiveCommandSuggestions,
  getInteractiveContextActions,
  type InteractiveCommandSuggestion,
  type InteractiveContextTarget,
  type InteractiveLine,
  line,
  statusCounts,
} from "@/lib/interactive-git";
import {
  ContextMenu,
  ContextTrigger,
  TerminalPanel,
  type WorkbenchContextMenu,
} from "@/components/interactive-git-workbench-panels";

type InteractiveGitWorkbenchProps = { compact?: boolean };

/**
 * 浏览器内 Git 工作台：模拟 VS Code/IntelliJ 的 Source Control 工具窗口。
 * 终端、Source Control 面板、提交框、状态栏、命令历史与对象操作共享一个隔离内存状态。
 */
export function InteractiveGitWorkbench({ compact = false }: InteractiveGitWorkbenchProps) {
  const [state, setState] = useState<TeachingGitState>(() => createInteractiveGitState());
  const [transcript, setTranscript] = useState<InteractiveLine[]>(() => createInteractiveWelcome());
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string | undefined>();
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<WorkbenchContextMenu | null>(null);
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [diffTarget, setDiffTarget] = useState<{ path: string; staged: boolean } | null>(null);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const suggestions = useMemo(() => getInteractiveCommandSuggestions(input), [input]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const workbenchRef = useRef<HTMLElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const counts = useMemo(() => statusCounts(state), [state]);

  useEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [transcript]);

  const reset = useCallback(() => {
    setState(createInteractiveGitState());
    setTranscript(createInteractiveWelcome());
    setHistory([]);
    setHistoryIndex(-1);
    setSelected(undefined);
    setInput("");
    setSuggestionIndex(-1);
    setSuggestionsOpen(false);
    setContextMenu(null);
    setCommitMessage("");
    setDiffTarget(null);
    setSearchTerm("");
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const command = raw.trim();
      if (!command) return;
      const result = executeInteractiveGitCommand(state, command);
      if (result.command === "clear" || result.command === "cls") {
        setTranscript([]);
      } else {
        const outputLines = result.output.map((text) =>
          line(result.error ? "error" : "output", text),
        );
        setTranscript((previous) =>
          [...previous, line("command", command), ...outputLines].slice(-240),
        );
      }
      setState(result.state);
      if (command !== "clear" && command !== "cls") {
        setHistory((previous) =>
          [...previous.filter((item) => item !== command), command].slice(-30),
        );
      }
      setHistoryIndex(-1);
      setInput("");
      setSuggestionIndex(-1);
      setSuggestionsOpen(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [state],
  );

  const openContextMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, target: InteractiveContextTarget) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY, ...target });
    },
    [],
  );

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runCommand(input);
  };

  const onInputChange = (value: string) => {
    setInput(value);
    setSuggestionIndex(-1);
    setSuggestionsOpen(true);
  };

  const onSuggestionSelect = (suggestion: InteractiveCommandSuggestion) => {
    setInput(suggestion.command);
    setSuggestionIndex(-1);
    setSuggestionsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runCommand(input);
      return;
    }
    if (suggestionsOpen && suggestions.length > 1 && input.trim()) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSuggestionIndex((current) => Math.min(suggestions.length - 1, current + 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSuggestionIndex((current) =>
          Math.max(0, current < 0 ? suggestions.length - 1 : current - 1),
        );
        return;
      }
    }
    if (suggestionsOpen && suggestions.length && input.trim() && event.key === "Tab") {
      event.preventDefault();
      onSuggestionSelect(suggestions[suggestionIndex >= 0 ? suggestionIndex : 0]!);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const nextIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? "");
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex < 0) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex] ?? "");
      }
    }
  };

  const runAndSelect = (command: string, selection?: string) => {
    setSelected(selection);
    if (command.startsWith("git diff ")) {
      const path = command.split(" -- ").pop()?.trim();
      if (path) {
        setDiffTarget({ path, staged: command.includes("--cached") });
      }
    } else if (command === "git diff") {
      setDiffTarget(null);
    }
    runCommand(command);
  };

  useEffect(() => {
    if (!contextMenu) return;
    const closeOnPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-context-menu]")) {
        setContextMenu(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContextMenu(null);
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (!branchMenuOpen) return;
    const closeOnPointerDown = (event: PointerEvent) => {
      if (!branchRef.current?.contains(event.target as Node)) {
        setBranchMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    return () => document.removeEventListener("pointerdown", closeOnPointerDown);
  }, [branchMenuOpen]);

  const contextActions = contextMenu ? getInteractiveContextActions(contextMenu) : [];
  const runContextAction = (command: string) => {
    if (!contextMenu) return;
    const selection = contextMenu.id;
    setContextMenu(null);
    runAndSelect(command, selection);
  };

  const onCommit = () => {
    const message = commitMessage.trim();
    if (!message) {
      runCommand('git commit -m "保存改动"');
      return;
    }
    const escapedMessage = message.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    runCommand(`git commit -m "${escapedMessage}"`);
    setCommitMessage("");
  };

  const stageAll = () => runCommand("git add .");
  const unstageAll = () => runCommand("git restore --staged .");
  const discardAll = () => runCommand("git checkout -- .");
  const pull = () => runCommand("git pull");
  const push = () => runCommand("git push");

  if (compact) {
    return (
      <div className="interactive-git-compact" data-testid="interactive-git-compact">
        <div className="interactive-compact-topbar">
          <span className="terminal-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <FolderGit2 size={14} />
          <strong>commandlab-git-lab</strong>
          <span className="compact-session-state">
            <CircleDot size={10} /> 内存会话
          </span>
        </div>
        <div className="interactive-compact-body">
          <div className="compact-branch-row">
            <GitBranch size={14} />
            <strong>{state.head.name}</strong>
            <span>HEAD → {state.head.commit}</span>
          </div>
          <div className="compact-command-output" aria-live="polite">
            {transcript.slice(-2).map((item) => (
              <p className={`compact-line compact-line--${item.kind}`} key={item.id}>
                {item.text}
              </p>
            ))}
          </div>
          <form className="compact-input-row" onSubmit={onSubmit}>
            <span>$</span>
            <input
              aria-label="Git 仿真命令"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="输入 git status"
              spellCheck={false}
            />
            <button type="submit" aria-label="执行命令" title="执行命令">
              <Play size={14} />
            </button>
          </form>
          <div className="compact-actions">
            {(["git status", "git log --oneline", "git add ."] as const).map((command) => (
              <button type="button" key={command} onClick={() => runCommand(command)}>
                {command}
              </button>
            ))}
          </div>
        </div>
        <Link className="interactive-compact-link" href="/terminal/">
          打开完整 Git 工作台 <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <section
      ref={workbenchRef}
      className="interactive-git-workbench"
      data-testid="interactive-git-workbench"
      aria-label="Git 仿真工作区"
    >
      <header className="interactive-workbench-header">
        <div className="interactive-workbench-title">
          <span className="interactive-workbench-icon">
            <FolderGit2 size={16} />
          </span>
          <div>
            <p className="eyebrow">Source Control · Main</p>
            <h2>commandlab-git-lab</h2>
          </div>
        </div>
        <div ref={branchRef} className="ide-branch-picker">
          <button
            type="button"
            className="ide-branch-current"
            aria-haspopup="listbox"
            aria-expanded={branchMenuOpen}
            onClick={() => setBranchMenuOpen((open) => !open)}
            title="点击切换分支"
          >
            <GitBranch size={14} />
            <span>{state.head.name}</span>
            <ChevronDown size={12} />
          </button>
          {branchMenuOpen ? (
            <ul className="ide-branch-menu" role="listbox">
              {Object.entries(state.branches).map(([name, commit]) => (
                <li key={name}>
                  <button
                    type="button"
                    className={name === state.head.name ? "is-current" : ""}
                    onClick={() => {
                      setBranchMenuOpen(false);
                      runCommand(`git switch ${name}`);
                    }}
                  >
                    <GitBranch size={12} />
                    <span>{name}</span>
                    <code>{commit}</code>
                    {name === state.head.name ? <Check size={12} /> : null}
                  </button>
                </li>
              ))}
              <li className="ide-branch-menu-divider" />
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setBranchMenuOpen(false);
                    const name = window.prompt("新分支名称");
                    if (name) runCommand(`git switch -c ${name.trim()}`);
                  }}
                >
                  <Plus size={12} /> <span>新建分支…</span>
                </button>
              </li>
            </ul>
          ) : null}
        </div>
        <div className="interactive-workbench-actions">
          <Button variant="ghost" type="button" onClick={() => runCommand("help")}>
            <History size={14} /> 帮助
          </Button>
          <Button variant="ghost" type="button" onClick={() => setTranscript([])}>
            <Trash2 size={14} /> 清屏
          </Button>
          <Button variant="secondary" type="button" onClick={reset}>
            <RefreshCcw size={14} /> 重置
          </Button>
        </div>
      </header>

      <div className="interactive-context-bar">
        <span className="context-branch">
          <GitBranch size={13} /> {state.head.name}
        </span>
        <span>
          HEAD <strong>{state.head.commit || "(empty)"}</strong>
        </span>
        <span>
          <strong>{counts.commits}</strong> commits
        </span>
        <span>
          <strong>{counts.branches}</strong> branches
        </span>
        <span className="context-status">
          <CircleDot size={11} />{" "}
          {counts.changes + counts.staged + counts.untracked ? "有未提交变化" : "工作区干净"}
        </span>
        <span className="ide-context-spacer" />
        <button type="button" className="ide-context-button" onClick={pull} title="git pull">
          <Download size={12} /> Pull
        </button>
        <button
          type="button"
          className="ide-context-button"
          onClick={push}
          disabled={!counts.commits}
          title="git push"
        >
          <Upload size={12} /> Push
        </button>
        <button
          type="button"
          className="ide-context-button"
          onClick={() => runCommand("git fetch")}
        >
          <RefreshCcw size={12} /> Fetch
        </button>
      </div>

      <div className="interactive-workbench-grid">
        <aside className="interactive-sidebar" aria-label="Git Source Control">
          <div className="interactive-sidebar-section">
            <div className="interactive-source-control-head">
              <span className="interactive-panel-label">
                <Layers size={12} /> Source Control
              </span>
              <strong>{counts.changes + counts.staged + counts.untracked}</strong>
            </div>
            <div className="ide-source-actions">
              <button
                type="button"
                onClick={stageAll}
                disabled={counts.changes + counts.untracked === 0}
                title="git add ."
              >
                <Plus size={12} /> 暂存全部
              </button>
              <button
                type="button"
                onClick={unstageAll}
                disabled={counts.staged === 0}
                title="git restore --staged ."
              >
                <RotateCcw size={12} /> 撤回全部
              </button>
              <button
                type="button"
                onClick={discardAll}
                disabled={counts.changes + counts.untracked === 0}
                title="git checkout -- ."
              >
                <X size={12} /> 丢弃改动
              </button>
            </div>
            <WorkspaceFiles
              state={state}
              selected={selected}
              onSelect={runAndSelect}
              onContextMenu={openContextMenu}
            />
          </div>
          <CommitMessageBox
            message={commitMessage}
            onChange={setCommitMessage}
            onCommit={onCommit}
            disabled={counts.staged === 0 && counts.changes + counts.untracked === 0}
            stagedCount={counts.staged}
          />
          <div className="interactive-sidebar-section">
            <div className="interactive-panel-label">
              <Search size={12} /> Source Control 搜索
            </div>
            <input
              className="ide-search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="按文件名筛选…"
              spellCheck={false}
            />
            <p className="interactive-empty">仅在浏览器内运行，不读取文件系统。</p>
          </div>
          <BranchList
            state={state}
            selected={selected}
            onSelect={runAndSelect}
            onContextMenu={openContextMenu}
          />
          <RemoteList
            state={state}
            selected={selected}
            onSelect={runAndSelect}
            onContextMenu={openContextMenu}
          />
          <StashList
            state={state}
            selected={selected}
            onSelect={runAndSelect}
            onContextMenu={openContextMenu}
          />
        </aside>
        <main className="interactive-main">
          <CommitGraph
            state={state}
            selected={selected}
            onSelect={runAndSelect}
            onContextMenu={openContextMenu}
          />
          <div className="interactive-lower-grid">
            <DiffView
              state={state}
              target={diffTarget}
              onClose={() => setDiffTarget(null)}
              onOpenFile={(path) => runAndSelect(`git diff -- ${path}`, path)}
            />
            <div className="interactive-shortcuts">
              <p className="interactive-panel-label">快速动作</p>
              <div className="shortcut-grid">
                {(
                  [
                    ["git status", "检查状态", Files],
                    ["git add .", "暂存全部", Plus],
                    ['git commit -m "保存改动"', "创建提交", Send],
                    ["git log --oneline", "查看历史", History],
                    ["git switch -c feature", "新建分支", GitBranch],
                    ["git merge main", "合并分支", GitMerge],
                    ["git pull", "同步远端", GitPullRequestArrow],
                    ["git stash", "暂存改动", Layers],
                  ] as const
                ).map(([command, label, Icon]) => (
                  <button type="button" key={command} onClick={() => runCommand(command)}>
                    <Icon size={12} /> <span>{label}</span>
                    <code>{command}</code>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
        <TerminalPanel
          input={input}
          transcript={transcript}
          inputRef={inputRef}
          outputRef={outputRef}
          onChange={onInputChange}
          onSubmit={onSubmit}
          onKeyDown={onInputKeyDown}
          suggestions={suggestions}
          suggestionIndex={suggestionIndex}
          suggestionsOpen={suggestionsOpen}
          onSuggestionSelect={onSuggestionSelect}
          onFocus={() => setSuggestionsOpen(true)}
          onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 120)}
        />
      </div>
      <footer className="interactive-ide-statusbar" role="contentinfo">
        <span>
          <GitBranch size={11} /> {state.head.name}
        </span>
        <span>
          <CircleDot size={11} /> {counts.changes + counts.staged} changes
        </span>
        <span>
          <Upload size={11} /> ↑0 ↓0
        </span>
        <span>
          <AlertCircle size={11} /> 0 errors, 0 warnings
        </span>
        <span className="ide-status-spacer" />
        <span>{counts.commits} commits</span>
        <span>HEAD {state.head.commit || "(empty)"}</span>
        <span>UTF-8</span>
        <span>LF</span>
      </footer>
      {contextMenu ? (
        <ContextMenu menu={contextMenu} actions={contextActions} onSelect={runContextAction} />
      ) : null}
    </section>
  );
}

function CommitMessageBox({
  message,
  onChange,
  onCommit,
  disabled,
  stagedCount,
}: {
  message: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  disabled: boolean;
  stagedCount: number;
}) {
  return (
    <div className="ide-commit-box">
      <label className="interactive-panel-label" htmlFor="commit-message">
        <Send size={12} /> Message (Ctrl+Enter 提交)
      </label>
      <textarea
        id="commit-message"
        value={message}
        onChange={(event) => onChange(event.target.value)}
        placeholder="feat: …"
        spellCheck={false}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            onCommit();
          }
        }}
      />
      <div className="ide-commit-box-actions">
        <span>
          {stagedCount > 0 ? `${stagedCount} 个文件待提交` : "暂存区为空，可改用 -a 一次性提交"}
        </span>
        <Button
          variant="primary"
          type="button"
          onClick={onCommit}
          disabled={disabled && message.length === 0}
        >
          <Send size={12} /> Commit
        </Button>
      </div>
    </div>
  );
}

function DiffView({
  state,
  target,
  onClose,
  onOpenFile,
}: {
  state: TeachingGitState;
  target: { path: string; staged: boolean } | null;
  onClose: () => void;
  onOpenFile: (path: string) => void;
}) {
  const file = target ? state.workingTree.find((item) => item.path === target.path) : null;
  return (
    <section className="interactive-diff-view">
      <div className="interactive-diff-heading">
        <div>
          <p className="interactive-panel-label">
            <FileCode2 size={12} /> Diff
          </p>
          <h3>{target ? target.path : "全部未暂存变更"}</h3>
        </div>
        {target ? (
          <button type="button" onClick={onClose} aria-label="关闭差异视图" title="关闭">
            <X size={12} />
          </button>
        ) : null}
      </div>
      {target ? (
        file ? (
          <pre className="interactive-diff-body" aria-live="polite">
            <span className="diff-line diff-meta">
              diff --git a/{file.path} b/{file.path}
            </span>
            <span className="diff-line diff-meta">
              index {file.version.toString(16).padStart(7, "0")}..
              {(file.version + 1).toString(16).padStart(7, "0")} 100644
            </span>
            <span className="diff-line diff-meta">--- a/{file.path}</span>
            <span className="diff-line diff-meta">+++ b/{file.path}</span>
            <span className="diff-line diff-context">@@ -1,3 +1,4 @@</span>
            <span className="diff-line diff-context">{"  CommandLab 教学仓库"}</span>
            <span className="diff-line diff-context">{"  学习 Git / Docker 命令"}</span>
            <span className="diff-line diff-add">{"+ 已更新一节实验段落"}</span>
            <span className="diff-line diff-context">{"  返回查看动画"}</span>
          </pre>
        ) : (
          <p className="interactive-empty">文件不存在：{target.path}</p>
        )
      ) : state.workingTree.filter((f) => f.status !== "clean").length ? (
        <ul className="interactive-diff-list">
          {state.workingTree
            .filter((file) => file.status !== "clean")
            .map((file) => (
              <li key={file.path}>
                <button type="button" onClick={() => onOpenFile(file.path)}>
                  <FileCode2 size={12} /> <span>{file.path}</span>
                  <code>{file.status}</code>
                </button>
              </li>
            ))}
        </ul>
      ) : (
        <p className="interactive-empty">工作区无变更</p>
      )}
    </section>
  );
}

function WorkspaceFiles({
  state,
  selected,
  onSelect,
  onContextMenu,
}: {
  state: TeachingGitState;
  selected?: string | undefined;
  onSelect: (command: string, selection: string) => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, target: InteractiveContextTarget) => void;
}) {
  const staged = state.workingTree.filter((file) => state.staging.includes(file.path));
  const changes = state.workingTree.filter(
    (file) => file.status === "modified" && !state.staging.includes(file.path),
  );
  const untracked = state.workingTree.filter((file) => file.status === "untracked");
  const tracked = state.workingTree.filter(
    (file) => file.status === "clean" && !state.staging.includes(file.path),
  );
  return (
    <div className="ide-workspace-files">
      <FileGroup
        label="Changes"
        count={changes.length}
        files={changes}
        selected={selected}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        action="stage"
      />
      <FileGroup
        label="Staged Changes"
        count={staged.length}
        files={staged}
        selected={selected}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        action="unstage"
      />
      <FileGroup
        label="Untracked"
        count={untracked.length}
        files={untracked}
        selected={selected}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        action="stage"
      />
      {tracked.length > 0 ? (
        <FileGroup
          label="Tracked"
          count={tracked.length}
          files={tracked.slice(0, 4)}
          selected={selected}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
          action="none"
        />
      ) : null}
      {!changes.length && !staged.length && !untracked.length ? (
        <p className="interactive-empty">工作区干净</p>
      ) : null}
    </div>
  );
}

function FileGroup({
  label,
  count,
  files,
  selected,
  onSelect,
  onContextMenu,
  action,
}: {
  label: string;
  count: number;
  files: TeachingGitState["workingTree"];
  selected?: string | undefined;
  onSelect: (command: string, selection: string) => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, target: InteractiveContextTarget) => void;
  action: "stage" | "unstage" | "none";
}) {
  if (!files.length) return null;
  return (
    <div className="interactive-file-group">
      <div className="interactive-group-label">
        <span>{label}</span>
        <strong>{count}</strong>
      </div>
      {files.map((file) => (
        <div
          className={`interactive-file-row ${selected === file.path ? "is-selected" : ""}`}
          key={file.path}
          onContextMenu={(event) =>
            onContextMenu(event, {
              kind: "file",
              id: file.path,
              label: file.path,
              staged: action === "unstage",
            })
          }
        >
          <button
            type="button"
            className="interactive-file-main"
            onClick={() => onSelect(`git diff -- ${file.path}`, file.path)}
          >
            <FileCode2 size={13} />
            <span>{file.path}</span>
            <em className={file.status === "clean" ? "is-clean" : undefined}>
              {file.status === "untracked"
                ? "U"
                : file.status === "staged"
                  ? "A"
                  : file.status === "clean"
                    ? "C"
                    : "M"}
            </em>
          </button>
          {action === "none" ? (
            <span className="interactive-file-spacer" aria-hidden="true" />
          ) : (
            <button
              type="button"
              className="interactive-icon-action"
              onClick={() =>
                onSelect(
                  action === "stage" ? `git add ${file.path}` : `git restore --staged ${file.path}`,
                  file.path,
                )
              }
              aria-label={`${action === "stage" ? "暂存" : "撤回"} ${file.path}`}
              title={action === "stage" ? "暂存文件" : "撤回暂存"}
            >
              {action === "stage" ? <Plus size={12} /> : <RotateCcw size={12} />}
            </button>
          )}
          <ContextTrigger
            target={{
              kind: "file",
              id: file.path,
              label: file.path,
              staged: action === "unstage",
            }}
            onOpen={onContextMenu}
          />
        </div>
      ))}
    </div>
  );
}

function BranchList({
  state,
  selected,
  onSelect,
  onContextMenu,
}: {
  state: TeachingGitState;
  selected?: string | undefined;
  onSelect: (command: string, selection: string) => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, target: InteractiveContextTarget) => void;
}) {
  return (
    <div className="interactive-sidebar-section">
      <div className="interactive-sidebar-heading">
        <span>
          <GitBranch size={13} /> 分支
        </span>
        <strong>{Object.keys(state.branches).length}</strong>
      </div>
      <div className="interactive-ref-list">
        {Object.entries(state.branches).map(([name, commit]) => {
          const target = {
            kind: "branch" as const,
            id: name,
            label: name,
            current: name === state.head.name,
          };
          return (
            <div className="interactive-ref-action-row" key={name}>
              <button
                type="button"
                className={`interactive-ref-row ${selected === name ? "is-selected" : ""}`}
                onClick={() => onSelect(`git switch ${name}`, name)}
                onContextMenu={(event) => onContextMenu(event, target)}
              >
                <GitBranch size={12} />
                <span>{name}</span>
                <code>{commit}</code>
                {name === state.head.name ? <Check size={12} /> : null}
              </button>
              <ContextTrigger target={target} onOpen={onContextMenu} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RemoteList({
  state,
  selected,
  onSelect,
  onContextMenu,
}: {
  state: TeachingGitState;
  selected?: string | undefined;
  onSelect: (command: string, selection: string) => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, target: InteractiveContextTarget) => void;
}) {
  return (
    <div className="interactive-sidebar-section">
      <div className="interactive-sidebar-heading">
        <span>
          <Upload size={13} /> 远端
        </span>
        <strong>{Object.keys(state.remotes).length}</strong>
      </div>
      <div className="interactive-ref-list">
        {Object.keys(state.remotes).map((name) => {
          const target = { kind: "remote" as const, id: name, label: name };
          return (
            <div className="interactive-ref-action-row" key={name}>
              <button
                type="button"
                className={`interactive-ref-row ${selected === name ? "is-selected" : ""}`}
                onClick={() => onSelect("git remote -v", name)}
                onContextMenu={(event) => onContextMenu(event, target)}
              >
                <Upload size={12} />
                <span>{name}</span>
                <code>{state.remoteBranches[`${name}/main`] ?? "-"}</code>
              </button>
              <ContextTrigger target={target} onOpen={onContextMenu} />
            </div>
          );
        })}
      </div>
      <RemoteFiles
        files={state.remoteFiles}
        selected={selected}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
      />
    </div>
  );
}

function RemoteFiles({
  files,
  selected,
  onSelect,
  onContextMenu,
}: {
  files: TeachingGitState["remoteFiles"];
  selected?: string | undefined;
  onSelect: (command: string, selection: string) => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, target: InteractiveContextTarget) => void;
}) {
  const [path, setPath] = useState("");
  const createRemoteFile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextPath = path.trim();
    if (!nextPath) return;
    onSelect(`git remote touch ${nextPath}`, `remote-file:${nextPath}`);
    setPath("");
  };

  return (
    <div className="interactive-remote-files">
      <div className="interactive-group-label">
        <span>远端文件</span>
        <strong>{files.length}</strong>
      </div>
      <div className="interactive-ref-list">
        {files.map((file) => {
          const target = { kind: "remote-file" as const, id: file.path, label: file.path };
          return (
            <div className="interactive-ref-action-row" key={file.path}>
              <button
                type="button"
                className={`interactive-ref-row ${selected === `remote-file:${file.path}` ? "is-selected" : ""}`}
                onClick={() => onSelect("git remote files", `remote-file:${file.path}`)}
                onContextMenu={(event) => onContextMenu(event, target)}
              >
                <FileCode2 size={12} />
                <span>{file.path}</span>
                <code>v{file.version}</code>
              </button>
              <ContextTrigger target={target} onOpen={onContextMenu} />
            </div>
          );
        })}
      </div>
      <form className="interactive-remote-create" onSubmit={createRemoteFile}>
        <input
          aria-label="远端新文件路径"
          value={path}
          onChange={(event) => setPath(event.target.value)}
          placeholder="docs/remote.md"
          spellCheck={false}
        />
        <button type="submit" aria-label="创建远端文件" title="创建远端文件">
          <Plus size={12} />
        </button>
      </form>
    </div>
  );
}

function StashList({
  state,
  selected,
  onSelect,
  onContextMenu,
}: {
  state: TeachingGitState;
  selected?: string | undefined;
  onSelect: (command: string, selection: string) => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, target: InteractiveContextTarget) => void;
}) {
  return (
    <div className="interactive-sidebar-section">
      <div className="interactive-sidebar-heading">
        <span>
          <Layers size={13} /> stash
        </span>
        <strong>{state.stash.length}</strong>
      </div>
      <div className="interactive-ref-list">
        {state.stash.length ? (
          state.stash.map((item, index) => {
            const target = {
              kind: "stash" as const,
              id: `stash@{${index}}`,
              label: `stash@{${index}}`,
            };
            return (
              <div className="interactive-ref-action-row" key={`${item}-${index}`}>
                <button
                  type="button"
                  className={`interactive-ref-row ${selected === target.id ? "is-selected" : ""}`}
                  onClick={() => onSelect("git stash list", target.id)}
                  onContextMenu={(event) => onContextMenu(event, target)}
                >
                  <Layers size={12} />
                  <span>stash@&#123;{index}&#125;</span>
                  <code>{item}</code>
                </button>
                <ContextTrigger target={target} onOpen={onContextMenu} />
              </div>
            );
          })
        ) : (
          <p className="interactive-empty">暂无临时改动</p>
        )}
      </div>
    </div>
  );
}

function CommitGraph({
  state,
  selected,
  onSelect,
  onContextMenu,
}: {
  state: TeachingGitState;
  selected?: string | undefined;
  onSelect: (command: string, selection: string) => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, target: InteractiveContextTarget) => void;
}) {
  const commits = state.commits.slice().reverse();
  return (
    <section className="interactive-graph-panel">
      <div className="interactive-panel-heading">
        <div>
          <p className="interactive-panel-label">Git Graph</p>
          <h3>提交历史</h3>
        </div>
        <span>{state.commits.length} 个快照 · 点击节点查看详情</span>
      </div>
      <div className="interactive-branch-strip">
        {Object.entries(state.branches).map(([name, commit]) => (
          <span className={name === state.head.name ? "is-current" : ""} key={name}>
            <GitBranch size={11} /> {name} <code>{commit}</code>
          </span>
        ))}
        {Object.entries(state.remoteBranches).map(([name, commit]) => (
          <span className="is-remote" key={name}>
            <Upload size={11} /> {name} <code>{commit}</code>
          </span>
        ))}
      </div>
      <div className="interactive-commit-list">
        {commits.length ? (
          commits.map((commit, index) => (
            <div className="interactive-commit-row-wrap" key={commit.id}>
              <span
                className={`interactive-commit-line ${index === commits.length - 1 ? "is-last" : ""}`}
                aria-hidden="true"
              />
              <button
                type="button"
                className={`interactive-commit-row ${selected === commit.id ? "is-selected" : ""} ${commit.id === state.head.commit ? "is-head" : ""}`}
                onClick={() => onSelect(`git show ${commit.id}`, commit.id)}
                onContextMenu={(event) =>
                  onContextMenu(event, { kind: "commit", id: commit.id, label: commit.message })
                }
              >
                <span className="interactive-commit-node">
                  <GitCommitHorizontal size={13} />
                </span>
                <span className="interactive-commit-copy">
                  <strong>{commit.message}</strong>
                  <small>
                    {commit.id} · parent {commit.parents.join(", ") || "root"}
                  </small>
                </span>
                {commit.id === state.head.commit ? (
                  <span className="interactive-head-label">HEAD</span>
                ) : null}
              </button>
              <ContextTrigger
                target={{ kind: "commit", id: commit.id, label: commit.message }}
                onOpen={onContextMenu}
              />
            </div>
          ))
        ) : (
          <p className="interactive-empty interactive-empty--graph">
            执行 git init 后会出现提交节点
          </p>
        )}
      </div>
    </section>
  );
}
