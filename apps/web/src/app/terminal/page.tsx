import type { Metadata } from "next";
import { OnlineTerminal } from "@/components/online-terminal";

export const metadata: Metadata = { title: "在线终端" };

export default function TerminalPage() {
  return (
    <section className="page shell terminal-page">
      <header className="page-heading">
        <p className="eyebrow">Git · Docker 仿真终端</p>
        <h1>在隔离工作区里直接练习命令</h1>
        <p>
          这是一个浏览器内的隔离演示环境。切换 Git 或 Docker
          工作台，输入命令或点击对象，终端与状态面板会立即同步变化。
        </p>
      </header>
      <OnlineTerminal />
      <div className="roadmap-list">
        <div>
          <span>01</span>
          <h2>内存隔离</h2>
          <p>仿真器不读取或写入你的真实文件，刷新页面即可回到固定演示仓库。</p>
        </div>
        <div>
          <span>02</span>
          <h2>命令与对象同步</h2>
          <p>输入 Git 或 Docker 高频命令，观察文件、提交、镜像、容器、网络和卷如何改变。</p>
        </div>
        <div>
          <span>03</span>
          <h2>保留真实练习入口</h2>
          <p>需要连接本机 Git 时，仍可从课程页复制命令，在隔离目录中完成实际操作。</p>
        </div>
      </div>
    </section>
  );
}
