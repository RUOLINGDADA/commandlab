import Link from "next/link";
import { Code2, TerminalSquare } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="返回 CommandLab 首页">
          <span className="brand-mark">
            <TerminalSquare size={20} />
          </span>
          <span>
            <strong>CommandLab</strong>
            <small>命令工坊</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          <Link href="/learn/">学习路径</Link>
          <Link href="/reference/">工具百科</Link>
          <Link href="/progress/">学习进度</Link>
          <Link href="/terminal/">在线终端</Link>
        </nav>
        <div className="header-actions">
          <a href={siteConfig.repository} className="icon-link" aria-label="打开 GitHub 仓库">
            <Code2 size={19} />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
