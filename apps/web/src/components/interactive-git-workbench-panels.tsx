import { ChevronRight, Play, TerminalSquare } from "lucide-react";
import type {
  InteractiveCommandSuggestion,
  InteractiveContextAction,
  InteractiveContextTarget,
  InteractiveLine,
} from "@/lib/interactive-git";

export type WorkbenchContextMenu = InteractiveContextTarget & { x: number; y: number };

export type TerminalPanelProps = {
  input: string;
  transcript: InteractiveLine[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  outputRef: React.RefObject<HTMLDivElement | null>;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  suggestions: InteractiveCommandSuggestion[];
  suggestionIndex: number;
  suggestionsOpen: boolean;
  onSuggestionSelect: (suggestion: InteractiveCommandSuggestion) => void;
  onFocus: () => void;
  onBlur: () => void;
};

export function TerminalPanel({
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
}: TerminalPanelProps) {
  return (
    <section className="interactive-terminal-panel" aria-label="Git 仿真终端">
      <div className="interactive-terminal-heading">
        <span className="terminal-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <TerminalSquare size={14} />
        <strong>终端</strong>
        <span>zsh · ~/commandlab-git-lab</span>
      </div>
      <div className="interactive-terminal-output" ref={outputRef} aria-live="polite">
        {transcript.map((item) =>
          item.kind === "command" ? (
            <p className="interactive-terminal-line interactive-terminal-command" key={item.id}>
              <span>learner@commandlab:~/demo$</span> {item.text}
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
          <span>learner@commandlab:~/demo$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-label="输入 Git 命令"
            aria-autocomplete="list"
            aria-controls="git-command-suggestions"
            placeholder="输入 git status 并回车"
            spellCheck={false}
            autoComplete="off"
          />
          <button type="submit" aria-label="执行 Git 命令" title="执行命令">
            <Play size={14} />
          </button>
        </form>
        {suggestionsOpen && suggestions.length ? (
          <ul
            id="git-command-suggestions"
            className="interactive-terminal-suggestions"
            role="listbox"
            aria-label="Git 命令提示"
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
        <span>Enter 执行</span>
        <span>仅在浏览器内运行</span>
      </div>
    </section>
  );
}

export function ContextMenu({
  menu,
  actions,
  onSelect,
}: {
  menu: WorkbenchContextMenu;
  actions: InteractiveContextAction[];
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
          className={action.danger ? "is-danger" : ""}
          key={action.id}
          onClick={() => onSelect(action.command)}
        >
          <span>{action.label}</span>
          <code>{action.command}</code>
        </button>
      ))}
    </div>
  );
}

export function ContextTrigger({
  target,
  onOpen,
}: {
  target: InteractiveContextTarget;
  onOpen: (event: React.MouseEvent<HTMLElement>, target: InteractiveContextTarget) => void;
}) {
  return (
    <button
      type="button"
      className="interactive-row-menu"
      aria-label={`${target.label} 更多操作`}
      title="更多操作"
      onClick={(event) => onOpen(event, target)}
    >
      <ChevronRight size={14} />
    </button>
  );
}
