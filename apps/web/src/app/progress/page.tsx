import type { Metadata } from "next";
import { Database, ShieldCheck } from "lucide-react";
import { Card } from "@commandlab/ui";
import { ProgressDashboard } from "@/components/progress-dashboard";

export const metadata: Metadata = { title: "学习进度" };

export default function ProgressPage() {
  return (
    <section className="page shell narrow-page">
      <header className="page-heading">
        <p className="eyebrow">本地学习档案</p>
        <h1>每一步都值得被看见</h1>
        <p>完成记录、互动题和收藏保存在当前浏览器，不需要注册账号。</p>
      </header>
      <ProgressDashboard />
      <div className="info-grid">
        <Card className="info-card">
          <Database />
          <div>
            <h2>数据保存在哪里？</h2>
            <p>
              首发版使用浏览器 IndexedDB。清理站点数据会删除进度；云端同步将在服务器准备好后开放。
            </p>
          </div>
        </Card>
        <Card className="info-card">
          <ShieldCheck />
          <div>
            <h2>隐私优先</h2>
            <p>网站不会上传你的命令、笔记或学习记录，也没有隐藏的分析与追踪请求。</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
