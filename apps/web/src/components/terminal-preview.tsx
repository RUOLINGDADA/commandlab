import Link from "next/link";
import { LockKeyhole, Terminal } from "lucide-react";
import { Card } from "@commandlab/ui";
import { InteractiveGitWorkbench } from "./interactive-git-workbench";
import { InteractiveDockerWorkbench } from "./interactive-docker-workbench";

export function TerminalPreview({
  compact = false,
  tool = "git",
}: {
  compact?: boolean;
  tool?: "git" | "docker";
}) {
  if (compact)
    return tool === "docker" ? (
      <InteractiveDockerWorkbench compact />
    ) : (
      <InteractiveGitWorkbench compact />
    );
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
      <div className="terminal-screen terminal-screen--preview" aria-label="在线终端预览">
        <p>
          <span>$</span> git status
        </p>
        <p className="terminal-muted">On branch main</p>
        <p className="terminal-muted">working tree clean</p>
        <p className="terminal-info">
          这是只读预览。进入在线终端可以执行命令、查看提交图并练习 Git。
        </p>
      </div>
      <Link href="/terminal/" className="terminal-cta">
        <Terminal size={16} /> 打开在线终端
      </Link>
    </Card>
  );
}
