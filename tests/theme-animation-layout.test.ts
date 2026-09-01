import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("主题与课程动画布局回归契约", () => {
  it("百科动画入口使用客户端导航，而不是触发整页主题重置", () => {
    const source = read("apps/web/src/components/reference-explorer.tsx");
    expect(source).toContain('import Link from "next/link";');
    expect(source).toContain("<Link href={`/reference/${entry.tool}/${entry.slug}/animation/`}");
    expect(source).not.toContain("<a href={`/reference/${entry.tool}/${entry.slug}/animation/`}");
  });

  it("根布局在首次绘制前读取已保存主题", () => {
    const source = read("apps/web/src/app/layout.tsx");
    expect(source).toContain('strategy="beforeInteractive"');
    expect(source).toContain('localStorage.getItem("commandlab-theme")');
    expect(source).toContain("document.documentElement.dataset.theme = stored");
  });

  it("筛选项和嵌入舞台保留间距并隔离窄卡片内容", () => {
    const source = read("apps/web/src/styles/pages.css");
    expect(source).toContain(".filter-tabs button {");
    expect(source).toContain("gap: 6px;");
    expect(source).toContain("border: 1px solid var(--line);");
    expect(source).toContain(".animation-embed .command-specific-stage");
    expect(source).toContain(".animation-embed .teaching-canvas-wrap");
    expect(source).toContain(".animation-embed .teaching-canvas-wrap {");
    expect(source).toContain("overflow: auto;");
    expect(source).toContain(".animation-embed .git-ide-grid,");
    expect(source).toContain(".animation-embed .docker-specific-grid");
    expect(source).toContain("grid-template-columns: minmax(0, 1fr);");
    expect(source).toContain(".animation-embed .command-lens {");
    expect(source).toContain(".animation-embed .command-lens-state {");
    expect(source).toContain(".animation-embed .command-specific-stage {");
    expect(source).toContain("max-width: 100%;");
  });

  it("在线终端提供 Git 与 Docker 两种工作台模式", () => {
    const source = read("apps/web/src/components/online-terminal.tsx");
    expect(source).toContain("InteractiveGitWorkbench");
    expect(source).toContain("InteractiveDockerWorkbench");
    expect(source).toContain('aria-label="选择仿真终端"');
    expect(source).toContain('aria-selected={mode === "docker"}');
  });

  it("课程嵌入动画启用专用紧凑模式", () => {
    const source = read("apps/web/src/components/command-animation-embed.tsx");
    expect(source).toContain("embedded");
    const animation = read("apps/web/src/components/command-animation.tsx");
    expect(animation).toContain("teaching-animation--embedded");
  });

  it("新手 Docker 步骤提供浏览器仿真入口", () => {
    const source = read("apps/web/src/components/docker-practice.tsx");
    expect(source).toContain("没有本机 Docker 也能继续");
    expect(source).toContain("/terminal/?mode=docker#docker-terminal");
    expect(source).toContain("浏览器先试一遍");
  });

  it("课程嵌入动画默认暂停，完整动画页仍可自动播放", () => {
    const source = read("apps/web/src/components/command-animation.tsx");
    expect(source).toContain("useState(!embedded)");
    const preview = read("apps/web/src/components/terminal-preview.tsx");
    expect(preview).toContain("InteractiveDockerWorkbench compact");
    expect(preview).toContain('tool === "docker"');
  });
});
