import Link from "next/link";
import { LockKeyhole, ServerCog, Terminal } from "lucide-react";
import { Card } from "@commandlab/ui";
import { sandboxAvailability } from "@commandlab/practice-runtime";
import { InteractiveGitWorkbench } from "./interactive-git-workbench";

export function TerminalPreview({ compact = false }: { compact?: boolean }) {
  if (compact) return <InteractiveGitWorkbench compact />;
  return (
    <Card className={compact ? "terminal-card is-compact" : "terminal-card"}>
      <div className="terminal-topbar">
        <span className="terminal-dots">
          <i />
          <i />
          <i />
        </span>
        <span>commandlab-sandbox</span>
        <LockKeyhole size={14} />
      </div>
      <div className="terminal-screen" aria-label="在线终端暂未开放">
        <p>
          <span>$</span> commandlab sandbox --status
        </p>
        <p className="terminal-muted">online sandbox: unavailable</p>
        <p className="terminal-info">
          {sandboxAvailability.status === "unavailable"
            ? sandboxAvailability.message
            : "在线沙箱已连接。"}
        </p>
        {!compact && (
          <div className="terminal-roadmap">
            <ServerCog size={18} />
            <span>为保护学习者与服务器，公网自由终端将在专业隔离环境准备后开放。</span>
          </div>
        )}
      </div>
      {!compact && (
        <Link href="/learn/" className="terminal-cta">
          <Terminal size={16} /> 先从本机练习开始
        </Link>
      )}
    </Card>
  );
}
