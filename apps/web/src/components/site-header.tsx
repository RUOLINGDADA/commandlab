import Link from "next/link";
import {
  BookOpenText,
  GitBranch,
  LayoutGrid,
  LineChart,
  TerminalSquare,
  Waypoints,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "@/lib/site";

const NAV_ITEMS = [
  { href: "/learn/", label: "学习路径", icon: BookOpenText, shortcut: "Ctrl+1" },
  { href: "/reference/", label: "命令百科", icon: LayoutGrid, shortcut: "Ctrl+2" },
  { href: "/progress/", label: "学习进度", icon: LineChart, shortcut: "Ctrl+3" },
  { href: "/terminal/", label: "在线终端", icon: TerminalSquare, shortcut: "Ctrl+4" },
];

/** 站点头部：模拟 IDE 顶栏 + 标题栏 + 标签页式主导航。 */
export function SiteHeader() {
  return (
    <>
      <div className="ide-titlebar" role="presentation">
        <div className="ide-titlebar-left">
          <span className="ide-titlebar-traffic">
            <i /> <i /> <i />
          </span>
          <span className="ide-titlebar-title">CommandLab</span>
        </div>
        <div className="ide-titlebar-center">
          <span className="ide-titlebar-crumb">~/</span>
          <span className="ide-titlebar-crumb is-current">commandlab</span>
        </div>
        <div className="ide-titlebar-right">
          <ThemeToggle />
          <a
            className="ide-titlebar-button"
            href={siteConfig.repository}
            aria-label="打开 GitHub 仓库"
            title="GitHub 仓库"
          >
            <GitBranch size={14} />
          </a>
        </div>
      </div>
      <header className="ide-tabbar" role="banner">
        <div className="ide-tabbar-inner">
          <Link href="/" className="ide-tabbar-brand" aria-label="返回 CommandLab 首页">
            <Waypoints size={16} />
            <span>commandlab</span>
            <small>命令工坊</small>
          </Link>
          <nav className="ide-tabbar-nav" aria-label="主导航">
            {NAV_ITEMS.map((item) => (
              <Link href={item.href} key={item.href} className="ide-tabbar-link">
                <item.icon size={14} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="ide-tabbar-meta" aria-hidden="true">
            <span>v0.2.0</span>
            <span>main</span>
            <span>UTF-8</span>
            <span>LF</span>
          </div>
        </div>
      </header>
    </>
  );
}
