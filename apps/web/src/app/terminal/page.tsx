import type { Metadata } from "next";
import { TerminalPreview } from "@/components/terminal-preview";

export const metadata: Metadata = { title: "在线终端" };

export default function TerminalPage() {
  return (
    <section className="page shell terminal-page">
      <header className="page-heading">
        <p className="eyebrow">真实沙箱路线图</p>
        <h1>自由实验，也要安全隔离</h1>
        <p>公网 Docker 终端不能与普通网站共用一台服务器。我们会在具备独立虚拟机边界后开放。</p>
      </header>
      <TerminalPreview />
      <div className="roadmap-list">
        <div>
          <span>01</span>
          <h2>当前可用</h2>
          <p>完整课程、互动题、三平台本机命令、验证与清理步骤。</p>
        </div>
        <div>
          <span>02</span>
          <h2>基础设施</h2>
          <p>使用 Kubernetes 与 Kata Containers，让每次练习运行在独立轻量虚拟机中。</p>
        </div>
        <div>
          <span>03</span>
          <h2>正式开放</h2>
          <p>加入 GitHub 登录、资源配额、自动回收、审计与跨设备进度。</p>
        </div>
      </div>
    </section>
  );
}
