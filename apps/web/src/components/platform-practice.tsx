"use client";

import { useState } from "react";
import { CheckCircle2, Clipboard, RotateCcw } from "lucide-react";
import type { GitLesson } from "@commandlab/content-schema";

const labels = { windows: "Windows PowerShell", macos: "macOS", linux: "Linux" } as const;

export function PlatformPractice({ guides }: { guides: GitLesson["platforms"] }) {
  const [active, setActive] = useState<GitLesson["platforms"][number]["platform"]>("windows");
  const guide = guides.find((item) => item.platform === active) ?? guides[0]!;

  async function copy(command: string) {
    await navigator.clipboard.writeText(command);
  }

  return (
    <section className="platform-practice">
      <div className="platform-tabs" role="tablist" aria-label="选择本机系统">
        {guides.map((item) => (
          <button
            key={item.platform}
            role="tab"
            aria-selected={active === item.platform}
            className={active === item.platform ? "is-active" : ""}
            onClick={() => setActive(item.platform)}
          >
            {labels[item.platform]}
          </button>
        ))}
      </div>
      <CommandGroup
        title="操作命令"
        icon={<Clipboard size={16} />}
        commands={guide.setup}
        onCopy={copy}
      />
      <CommandGroup
        title="验证结果"
        icon={<CheckCircle2 size={16} />}
        commands={guide.verify}
        onCopy={copy}
      />
      <CommandGroup
        title="安全清理"
        icon={<RotateCcw size={16} />}
        commands={guide.cleanup}
        onCopy={copy}
      />
    </section>
  );
}

function CommandGroup({
  title,
  icon,
  commands,
  onCopy,
}: {
  title: string;
  icon: React.ReactNode;
  commands: string[];
  onCopy: (command: string) => Promise<void>;
}) {
  return (
    <div className="command-group">
      <h4>
        {icon} {title}
      </h4>
      {commands.map((command) => (
        <div className="command-line" key={command}>
          <code>{command}</code>
          <button
            type="button"
            onClick={() => void onCopy(command)}
            aria-label={`复制命令 ${command}`}
          >
            复制
          </button>
        </div>
      ))}
    </div>
  );
}
