import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.shortName}` },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.siteUrl),
};

const themeBootstrap = `(() => {
  try {
    const stored = window.localStorage.getItem("commandlab-theme");
    if (stored === "dark" || stored === "light") {
      document.documentElement.dataset.theme = stored;
    }
  } catch {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <head>
        <Script id="commandlab-theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
      </head>
      <body>
        <a href="#main" className="skip-link">
          跳到主要内容
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <footer className="ide-statusbar" role="contentinfo">
          <div className="ide-statusbar-inner">
            <span className="ide-statusbar-item is-primary">
              <span className="ide-statusbar-dot" /> main*
            </span>
            <span className="ide-statusbar-item">↑0 ↓0</span>
            <span className="ide-statusbar-item">0 errors, 0 warnings</span>
            <span className="ide-statusbar-spacer" />
            <span className="ide-statusbar-item">Go to file ⌘P</span>
            <span className="ide-statusbar-item">Spaces: 2</span>
            <span className="ide-statusbar-item">UTF-8</span>
            <span className="ide-statusbar-item">LF</span>
            <span className="ide-statusbar-item">CommandLab v0.2.0</span>
            <Link className="ide-statusbar-item" href="/learn/">
              课程
            </Link>
            <a className="ide-statusbar-item" href={siteConfig.repository}>
              GitHub
            </a>
            <a
              className="ide-statusbar-item"
              href={`${siteConfig.repository}/blob/main/CONTRIBUTING.md`}
            >
              参与贡献
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
