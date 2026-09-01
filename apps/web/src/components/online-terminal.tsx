"use client";

import { Box, FolderGit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { InteractiveDockerWorkbench } from "@/components/interactive-docker-workbench";
import { InteractiveGitWorkbench } from "@/components/interactive-git-workbench";

type TerminalMode = "git" | "docker";

/** 统一在线终端入口；两个仿真工作台各自保留浏览器内存会话。 */
export function OnlineTerminal() {
  const [mode, setMode] = useState<TerminalMode>("git");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("mode");
    if (requested !== "docker") return;
    const timer = window.setTimeout(() => setMode("docker"), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mode === "docker" && window.location.hash === "#docker-terminal") {
      window.setTimeout(() => document.getElementById("docker-terminal")?.scrollIntoView(), 0);
    }
  }, [mode]);

  return (
    <section className="online-terminal" data-testid="online-terminal" aria-label="在线终端">
      <div className="online-terminal-switcher" role="tablist" aria-label="选择仿真终端">
        <button
          className={mode === "git" ? "is-active" : ""}
          type="button"
          role="tab"
          aria-selected={mode === "git"}
          onClick={() => setMode("git")}
        >
          <FolderGit2 size={15} /> Git 工作台
        </button>
        <button
          className={mode === "docker" ? "is-active" : ""}
          type="button"
          role="tab"
          aria-selected={mode === "docker"}
          onClick={() => setMode("docker")}
        >
          <Box size={15} /> Docker 工作台
        </button>
      </div>
      <div className="online-terminal-panel" hidden={mode !== "git"}>
        <InteractiveGitWorkbench />
      </div>
      <div className="online-terminal-panel" id="docker-terminal" hidden={mode !== "docker"}>
        <InteractiveDockerWorkbench />
      </div>
    </section>
  );
}
