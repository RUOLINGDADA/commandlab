"use client";

import Link from "next/link";
import {
  Check,
  ChevronRight,
  CircleDot,
  FileCode2,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  History,
  PackageOpen,
  Play,
  Plus,
  RefreshCcw,
  RotateCcw,
  TerminalSquare,
  Trash2,
  Upload,
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
 * 浏览器内 Git 工作台：终端和可视化面板共享一个隔离状态，所有动作都可回放。
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
  const suggestions = useMemo(() => getInteractiveCommandSuggestions(input), [input]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const workbenchRef = useRef<HTMLElement>(null);
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
  }, []);

  const openContextMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, target: InteractiveContextTarget) => {
      event.preventDefault();
      event.stopPropagation();
      const bounds = workbenchRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const menuWidth = 232;
      const menuHeight = 190;
      const x = Math.max(8, Math.min(event.clientX - bounds.left, bounds.width - menuWidth - 8));
      const y = Math.max(8, Math.min(event.clientY - bounds.top, bounds.height - menuHeight - 8));
      setContextMenu({ ...target, x, y });
    },
    [],
  );

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
        setTranscript((previous) => [...previous, line("command", command), ...outputLines]);
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

  const contextActions = contextMenu ? getInteractiveContextActions(contextMenu) : [];
  const runContextAction = (command: string) => {
    if (!contextMenu) return;
    const selection = contextMenu.id;
    setContextMenu(null);
    runAndSelect(command, selection);
  };

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
            <TerminalSquare size={18} />
          </span>
          <div>
            <p className="eyebrow">Git 仿真工作区</p>
            <h2>commandlab-git-lab</h2>
          </div>
          <span className="interactive-memory-badge">
            <CircleDot size={11} /> 内存隔离
          </span>
        </div>
        <div className="interactive-workbench-actions">
          <Button variant="ghost" type="button" onClick={() => runCommand("help")}>
            <History size={15} /> 帮助
          </Button>
          <Button variant="ghost" type="button" onClick={() => setTranscript([])}>
            <Trash2 size={15} /> 清屏
          </Button>
          <Button variant="secondary" type="button" onClick={reset}>
            <RefreshCcw size={15} /> 重置会话
          </Button>
        </div>
      </header>

      <div className="interactive-context-bar">
        <span className="context-branch">
          <GitBranch size={15} /> {state.head.name}
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
      </div>

      <div className="interactive-workbench-grid">
        <aside className="interactive-sidebar" aria-label="Git Source Control">
          <WorkspaceFiles
            state={state}
            selected={selected}
            onSelect={runAndSelect}
            onContextMenu={openContextMenu}
          />
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
            <RecentCommands history={history} onSelect={(command) => runCommand(command)} />
            <div className="interactive-shortcuts">
              <p className="interactive-panel-label">快速动作</p>
              <div className="shortcut-grid">
                {(
                  [
                    ["git status", "检查状态"],
                    ["git add .", "暂存全部"],
                    ['git commit -m "保存改动"', "创建提交"],
                    ["git log --oneline", "查看历史"],
                  ] as const
                ).map(([command, label]) => (
                  <button type="button" key={command} onClick={() => runCommand(command)}>
                    <Play size={12} /> <span>{label}</span>
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
      {contextMenu ? (
        <ContextMenu menu={contextMenu} actions={contextActions} onSelect={runContextAction} />
      ) : null}
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
    <div className="interactive-sidebar-section">
      <div className="interactive-sidebar-heading">
        <span>
          <FolderGit2 size={15} /> Source Control
        </span>
        <strong>{changes.length + staged.length + untracked.length}</strong>
      </div>
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
      <FileGroup
        label="Tracked"
        count={tracked.length}
        files={tracked}
        selected={selected}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        action="none"
      />
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
            <FileCode2 size={14} />
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
              {action === "stage" ? <Plus size={13} /> : <RotateCcw size={13} />}
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
          <GitBranch size={15} /> 分支
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
                <GitBranch size={13} />
                <span>{name}</span>
                <code>{commit}</code>
                {name === state.head.name ? <Check size={13} /> : null}
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
          <Upload size={15} /> 远端
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
                <Upload size={13} />
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
                <FileCode2 size={13} />
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
          <Plus size={13} />
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
          <PackageOpen size={15} /> stash
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
                  <PackageOpen size={13} />
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
            <GitBranch size={12} /> {name} <code>{commit}</code>
          </span>
        ))}
        {Object.entries(state.remoteBranches).map(([name, commit]) => (
          <span className="is-remote" key={name}>
            <Upload size={12} /> {name} <code>{commit}</code>
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
                  <GitCommitHorizontal size={15} />
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

function RecentCommands({
  history,
  onSelect,
}: {
  history: string[];
  onSelect: (command: string) => void;
}) {
  return (
    <section className="interactive-history-panel">
      <p className="interactive-panel-label">命令历史</p>
      {history.length ? (
        history
          .slice()
          .reverse()
          .slice(0, 5)
          .map((command) => (
            <button type="button" key={command} onClick={() => onSelect(command)}>
              <History size={12} /> <code>{command}</code>
            </button>
          ))
      ) : (
        <p className="interactive-empty">执行过的命令会显示在这里</p>
      )}
    </section>
  );
}
