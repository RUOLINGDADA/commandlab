import type { Metadata } from "next";
import { TerminalPreview } from "@/components/terminal-preview";

export const metadata: Metadata = { title: "在线终端" };

export default function TerminalPage() {
  return (
    <section className="page shell terminal-page">
      <header className="page-heading">
        <p className="eyebrow">在线终端</p>
        <h1>在线沙箱暂未开放</h1>
        <p>
          当前版本提供完整的本机练习，不会在服务器上执行你的命令。独立隔离环境准备好后，再开放公网终端。
        </p>
      </header>
      <TerminalPreview />
      <div className="roadmap-list">
        <div>
          <span>01</span>
          <h2>现在可以做什么</h2>
          <p>完整课程、互动题、三平台本机命令、验证与清理步骤。</p>
        </div>
        <div>
          <span>02</span>
          <h2>开放前提</h2>
          <p>使用 Kubernetes 与 Kata Containers，让每次练习运行在独立轻量虚拟机中。</p>
        </div>
        <div>
          <span>03</span>
          <h2>后续安排</h2>
          <p>加入 GitHub 登录、资源配额、自动回收、审计与跨设备进度。</p>
        </div>
      </div>
    </section>
  );
}
