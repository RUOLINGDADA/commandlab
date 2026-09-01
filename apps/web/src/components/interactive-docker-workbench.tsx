"use client";

import {
  ChevronRight,
  CircleDot,
  PackageOpen,
  Play,
  RefreshCcw,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TeachingDockerState } from "@commandlab/content-schema";
import { Button } from "@commandlab/ui";
import {
  createInteractiveDockerState,
  createInteractiveDockerWelcome,
  executeInteractiveDockerCommand,
  getInteractiveDockerCommandSuggestions,
  getInteractiveDockerContextActions,
  line,
  type InteractiveDockerLine,
  type InteractiveDockerSuggestion,
  type InteractiveDockerTarget,
} from "@/lib/interactive-docker";

type DockerContextMenu = InteractiveDockerTarget & { x: number; y: number };

/**
 * 浏览器内 Docker 工作台：终端、资源列表和状态面板共享一个确定性的内存会话。
 * 不执行宿主机 Docker Engine，也不读取本机文件系统。
 */
export function InteractiveDockerWorkbench({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<TeachingDockerState>(() => createInteractiveDockerState());
  const [transcript, setTranscript] = useState<InteractiveDockerLine[]>(() =>
    createInteractiveDockerWelcome(),
  );
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string | undefined>();
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<DockerContextMenu | null>(null);
  const suggestions = useMemo(() => getInteractiveDockerCommandSuggestions(input), [input]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const workbenchRef = useRef<HTMLElement>(null);
  const runningCount = state.containers.filter((item) => item.status === "running").length;
  const stoppedCount = state.containers.filter((item) => item.status !== "running").length;

  useEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [transcript]);

  const reset = useCallback(() => {
    setState(createInteractiveDockerState());
    setTranscript(createInteractiveDockerWelcome());
    setHistory([]);
    setHistoryIndex(-1);
    setInput("");
    setSelected(undefined);
    setSuggestionIndex(-1);
    setSuggestionsOpen(false);
    setContextMenu(null);
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const command = raw.trim();
      if (!command) return;
      if (command === "clear" || command === "cls") {
        setTranscript([]);
      } else {
        const result = executeInteractiveDockerCommand(state, command);
        setState(result.state);
        setTranscript((previous) => [
          ...previous,
          line("command", command),
          ...result.output.map((text) => line(result.error ? "error" : "output", text)),
        ]);
      }
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

  const onSuggestionSelect = (suggestion: InteractiveDockerSuggestion) => {
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
    } else if (event.key === "ArrowDown") {
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

  const openContextMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, target: InteractiveDockerTarget) => {
      event.preventDefault();
      event.stopPropagation();
      const bounds = workbenchRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const menuWidth = 246;
      const menuHeight = 230;
      const x = Math.max(8, Math.min(event.clientX - bounds.left, bounds.width - menuWidth - 8));
      const y = Math.max(8, Math.min(event.clientY - bounds.top, bounds.height - menuHeight - 8));
      setContextMenu({ ...target, x, y });
    },
    [],
  );

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

  const contextActions = contextMenu ? getInteractiveDockerContextActions(contextMenu) : [];
  const runContextAction = (command: string) => {
    if (!contextMenu) return;
    const selection = contextMenu.id;
    setContextMenu(null);
    runAndSelect(command, selection);
  };

  if (compact) {
    return (
      <div className="interactive-docker-compact" data-testid="interactive-docker-compact">
        <div className="interactive-compact-topbar">
          <span className="terminal-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <TerminalSquare size={14} />
          <strong>commandlab-docker-lab</strong>
          <span className="compact-session-state">
            <CircleDot size={10} /> 内存会话
          </span>
        </div>
        <div className="interactive-compact-body interactive-docker-compact-body">
          <div className="compact-branch-row">
            <CircleDot size={14} />
            <strong>Docker Engine 27.5</strong>
            <span>
              {runningCount} running · {state.images.length} images
            </span>
          </div>
          <p className="compact-docker-summary">
            容器、镜像、网络、卷和端口都在浏览器内存中模拟，不会修改电脑。
          </p>
          <Link className="interactive-compact-link" href="/terminal/?mode=docker#docker-terminal">
            打开 Docker 在线终端 <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section
      ref={workbenchRef}
      className="interactive-docker-workbench"
      data-testid="interactive-docker-workbench"
      aria-label="Docker 仿真工作区"
    >
      <header className="interactive-workbench-header">
        <div className="interactive-workbench-title">
          <span className="interactive-workbench-icon">
            <TerminalSquare size={18} />
          </span>
          <div>
            <p className="eyebrow">Docker 仿真工作区</p>
            <h2>commandlab-docker-lab</h2>
          </div>
          <span className="interactive-memory-badge">
            <CircleDot size={11} /> 内存隔离
          </span>
        </div>
        <div className="interactive-workbench-actions">
          <Button variant="ghost" type="button" onClick={() => runCommand("docker help")}>
            <PackageOpen size={15} /> 帮助
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
          <CircleDot size={15} /> Docker Engine 27.5
        </span>
        <span>
          <strong>{runningCount}</strong> running
        </span>
        <span>
          <strong>{stoppedCount}</strong> stopped
        </span>
        <span>
          <strong>{state.images.length}</strong> images
        </span>
        <span>
          <strong>{state.networks.length}</strong> networks
        </span>
        <span>
          <strong>{state.volumes.length}</strong> volumes
        </span>
        <span className="context-status">
          <CircleDot size={11} /> 浏览器内存会话
        </span>
      </div>

      <div className="interactive-workbench-grid">
        <aside className="interactive-sidebar" aria-label="Docker 资源浏览器">
          <DockerResourceSection
            title="Images"
            icon={<PackageOpen size={15} />}
            count={state.images.length}
          >
            {state.images.map((image) => {
              const target: InteractiveDockerTarget = {
                kind: "image",
                id: image.id,
                label: image.name,
              };
              return (
                <DockerResourceRow
                  key={image.id}
                  target={target}
                  selected={selected === image.id}
                  meta={image.status}
                  onSelect={() => runAndSelect(`docker inspect ${image.name}`, image.id)}
                  onContextMenu={openContextMenu}
                />
              );
            })}
          </DockerResourceSection>
          <DockerResourceSection
            title="Containers"
            icon={<CircleDot size={15} />}
            count={state.containers.length}
          >
            {state.containers.map((container) => {
              const target: InteractiveDockerTarget = {
                kind: "container",
                id: container.id,
                label: container.name,
                status: container.status,
              };
              return (
                <DockerResourceRow
                  key={container.id}
                  target={target}
                  selected={selected === container.id}
                  meta={container.status}
                  detail={container.image}
                  onSelect={() => runAndSelect(`docker logs ${container.name}`, container.id)}
                  onContextMenu={openContextMenu}
                />
              );
            })}
          </DockerResourceSection>
          <DockerResourceSection
            title="Networks"
            icon={<CircleDot size={15} />}
            count={state.networks.length}
          >
            {state.networks.map((name) => {
              const target: InteractiveDockerTarget = {
                kind: "network",
                id: `network:${name}`,
                label: name,
              };
              return (
                <DockerResourceRow
                  key={name}
                  target={target}
                  selected={selected === target.id}
                  meta="bridge"
                  onSelect={() => runAndSelect(`docker network inspect ${name}`, target.id)}
                  onContextMenu={openContextMenu}
                />
              );
            })}
          </DockerResourceSection>
          <DockerResourceSection
            title="Volumes"
            icon={<PackageOpen size={15} />}
            count={state.volumes.length}
          >
            {state.volumes.map((volume) => {
              const target: InteractiveDockerTarget = {
                kind: "volume",
                id: `volume:${volume.name}`,
                label: volume.name,
              };
              return (
                <DockerResourceRow
                  key={volume.name}
                  target={target}
                  selected={selected === target.id}
                  meta={`${volume.bytes} B`}
                  detail={
                    volume.attachedTo.length ? `挂载 ${volume.attachedTo.join(", ")}` : "未挂载"
                  }
                  onSelect={() => runAndSelect(`docker volume inspect ${volume.name}`, target.id)}
                  onContextMenu={openContextMenu}
                />
              );
            })}
          </DockerResourceSection>
        </aside>

        <main className="interactive-main">
          <DockerObjectBoard
            state={state}
            selected={selected}
            onSelect={runAndSelect}
            onContextMenu={openContextMenu}
          />
          <div className="interactive-lower-grid">
            <RecentDockerCommands history={history} onSelect={(command) => runCommand(command)} />
            <div className="interactive-shortcuts">
              <p className="interactive-panel-label">快速动作</p>
              <div className="shortcut-grid">
                {(
                  [
                    ["docker ps", "运行中的容器"],
                    ["docker image ls", "本地镜像"],
                    ["docker network create app-net", "创建网络"],
                    ["docker compose up -d", "启动 Compose"],
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

        <DockerTerminalPanel
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
        <DockerContextMenu
          menu={contextMenu}
          actions={contextActions}
          onSelect={runContextAction}
        />
      ) : null}
    </section>
  );
}

function DockerResourceSection({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="interactive-sidebar-section interactive-docker-resource-section">
      <div className="interactive-sidebar-heading">
        <span>
          {icon} {title}
        </span>
        <strong>{count}</strong>
      </div>
      <div className="interactive-docker-resource-list">{children}</div>
    </section>
  );
}

function DockerResourceRow({
  target,
  selected,
  meta,
  detail,
  onSelect,
  onContextMenu,
}: {
  target: InteractiveDockerTarget;
  selected: boolean;
  meta: string;
  detail?: string;
  onSelect: () => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, target: InteractiveDockerTarget) => void;
}) {
  const statusClass = meta === "running" ? "is-running" : meta === "stopped" ? "is-stopped" : "";
  return (
    <div
      className={`interactive-docker-resource-row${selected ? " is-selected" : ""}`}
      onContextMenu={(event) => onContextMenu(event, target)}
    >
      <button type="button" className="interactive-docker-resource-main" onClick={onSelect}>
        <CircleDot size={13} />
        <span>{target.label}</span>
        {detail ? <small>{detail}</small> : null}
      </button>
      <span className={`interactive-docker-resource-status ${statusClass}`}>{meta}</span>
      <button
        type="button"
        className="interactive-row-menu"
        aria-label={`${target.label} 更多操作`}
        title="更多操作"
        onClick={(event) => onContextMenu(event, target)}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function DockerObjectBoard({
  state,
  selected,
  onSelect,
  onContextMenu,
}: {
  state: TeachingDockerState;
  selected?: string | undefined;
  onSelect: (command: string, selection?: string) => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, target: InteractiveDockerTarget) => void;
}) {
  return (
    <section className="interactive-graph-panel interactive-docker-object-board">
      <div className="interactive-panel-heading">
        <div>
          <p className="interactive-panel-label">Resource workspace</p>
          <h3>容器编排与端口映射</h3>
        </div>
        <span>点击对象查看诊断；右键或 &gt; 执行上下文动作</span>
      </div>
      <div className="interactive-docker-overview-grid">
        <div>
          <strong>{state.containers.filter((item) => item.status === "running").length}</strong>
          <span>运行容器</span>
        </div>
        <div>
          <strong>{state.images.length}</strong>
          <span>本地镜像</span>
        </div>
        <div>
          <strong>{state.networks.length}</strong>
          <span>网络</span>
        </div>
        <div>
          <strong>{state.volumes.length}</strong>
          <span>卷</span>
        </div>
      </div>
      <div className="interactive-docker-container-list">
        {state.containers.map((container) => {
          const target: InteractiveDockerTarget = {
            kind: "container",
            id: container.id,
            label: container.name,
            status: container.status,
          };
          const ports = state.ports.filter((port) => port.target === container.name);
          return (
            <div
              className={`interactive-docker-container-card${selected === container.id ? " is-selected" : ""}`}
              key={container.id}
              onContextMenu={(event) => onContextMenu(event, target)}
            >
              <button
                type="button"
                className="interactive-docker-container-main"
                onClick={() => onSelect(`docker inspect ${container.name}`, container.id)}
              >
                <span
                  className={`interactive-docker-status-dot ${container.status === "running" ? "is-running" : ""}`}
                />
                <span className="interactive-docker-container-copy">
                  <strong>{container.name}</strong>
                  <small>
                    {container.image} · {container.status}
                  </small>
                </span>
              </button>
              <div className="interactive-docker-container-meta">
                <span>
                  {ports.length
                    ? ports.map((port) => `${port.host}:${port.container}`).join(", ")
                    : "无端口"}
                </span>
                <button
                  type="button"
                  className="interactive-row-menu"
                  aria-label={`${container.name} 更多操作`}
                  title="更多操作"
                  onClick={(event) => onContextMenu(event, target)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="interactive-docker-port-list">
        <div className="interactive-group-label">
          <span>PORTS</span>
          <strong>{state.ports.length}</strong>
        </div>
        {state.ports.length ? (
          state.ports.map((port) => (
            <button
              type="button"
              key={`${port.target}-${port.host}-${port.container}`}
              onClick={() => onSelect(`docker port ${port.target}`, port.target)}
            >
              <span>{port.target}</span>
              <code>
                0.0.0.0:{port.host} → {port.container}/tcp
              </code>
            </button>
          ))
        ) : (
          <p className="interactive-empty">暂无端口映射</p>
        )}
      </div>
    </section>
  );
}

function RecentDockerCommands({
  history,
  onSelect,
}: {
  history: string[];
  onSelect: (command: string) => void;
}) {
  return (
    <div className="interactive-history-panel">
      <p className="interactive-panel-label">最近命令</p>
      {history.length ? (
        history
          .slice()
          .reverse()
          .slice(0, 5)
          .map((command) => (
            <button type="button" key={command} onClick={() => onSelect(command)}>
              <Play size={11} />
              <code>{command}</code>
            </button>
          ))
      ) : (
        <p className="interactive-empty">执行过的 Docker 命令会出现在这里</p>
      )}
    </div>
  );
}

type DockerTerminalPanelProps = {
  input: string;
  transcript: InteractiveDockerLine[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  outputRef: React.RefObject<HTMLDivElement | null>;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  suggestions: InteractiveDockerSuggestion[];
  suggestionIndex: number;
  suggestionsOpen: boolean;
  onSuggestionSelect: (suggestion: InteractiveDockerSuggestion) => void;
  onFocus: () => void;
  onBlur: () => void;
};

function DockerTerminalPanel({
  input,
  transcript,
  inputRef,
  outputRef,
  onChange,
  onSubmit,
  onKeyDown,
  suggestions,
  suggestionIndex,
  suggestionsOpen,
  onSuggestionSelect,
  onFocus,
  onBlur,
}: DockerTerminalPanelProps) {
  return (
    <section className="interactive-terminal-panel" aria-label="Docker 仿真终端">
      <div className="interactive-terminal-heading">
        <span className="terminal-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <TerminalSquare size={14} />
        <strong>终端</strong>
        <span>zsh · ~/commandlab-docker-lab</span>
      </div>
      <div className="interactive-terminal-output" ref={outputRef} aria-live="polite">
        {transcript.map((item) =>
          item.kind === "command" ? (
            <p className="interactive-terminal-line interactive-terminal-command" key={item.id}>
              <span>learner@commandlab:~/docker-lab$</span> {item.text}
            </p>
          ) : (
            <p
              className={`interactive-terminal-line interactive-terminal-${item.kind}`}
              key={item.id}
            >
              {item.text}
            </p>
          ),
        )}
      </div>
      <div className="interactive-terminal-entry">
        <form className="interactive-terminal-input" onSubmit={onSubmit}>
          <span>learner@commandlab:~/docker-lab$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-label="输入 Docker 命令"
            aria-autocomplete="list"
            aria-controls="docker-command-suggestions"
            placeholder="输入 docker ps 并回车"
            spellCheck={false}
            autoComplete="off"
          />
          <button type="submit" aria-label="执行 Docker 命令" title="执行命令">
            <Play size={14} />
          </button>
        </form>
        {suggestionsOpen && suggestions.length ? (
          <ul
            id="docker-command-suggestions"
            className="interactive-terminal-suggestions"
            role="listbox"
            aria-label="Docker 命令提示"
          >
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.command} role="option" aria-selected={index === suggestionIndex}>
                <button
                  type="button"
                  className={index === suggestionIndex ? "is-active" : ""}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSuggestionSelect(suggestion)}
                >
                  <code>{suggestion.command}</code>
                  <span>{suggestion.description}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="interactive-terminal-footer">
        <span>↑↓ 浏览历史</span>
        <span>Tab 补全</span>
        <span>仅在浏览器内运行</span>
      </div>
    </section>
  );
}

function DockerContextMenu({
  menu,
  actions,
  onSelect,
}: {
  menu: DockerContextMenu;
  actions: InteractiveDockerSuggestion[];
  onSelect: (command: string) => void;
}) {
  return (
    <div
      className="interactive-context-menu"
      data-context-menu
      role="menu"
      aria-label={`${menu.label} 上下文菜单`}
      style={{ left: menu.x, top: menu.y }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="interactive-context-menu-heading">
        <span>上下文动作</span>
        <code>{menu.label}</code>
      </div>
      {actions.map((action) => (
        <button
          type="button"
          role="menuitem"
          className={/\b(rm|rmi|prune|down)\b/.test(action.command) ? "is-danger" : ""}
          key={action.command}
          onClick={() => onSelect(action.command)}
        >
          <span>{action.description}</span>
          <code>{action.command}</code>
        </button>
      ))}
    </div>
  );
}
