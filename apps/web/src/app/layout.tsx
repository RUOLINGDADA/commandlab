import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.shortName}` },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.siteUrl),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <body>
        <a href="#main" className="skip-link">
          跳到主要内容
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="shell footer-inner">
            <div>
              <strong>CommandLab</strong>
              <p>理解命令，而不只是记住命令。</p>
            </div>
            <div className="footer-links">
              <Link href="/learn/">课程</Link>
              <a href={siteConfig.repository}>GitHub</a>
              <a href={`${siteConfig.repository}/blob/main/CONTRIBUTING.md`}>参与贡献</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
