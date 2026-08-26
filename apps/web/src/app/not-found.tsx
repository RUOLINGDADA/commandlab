import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page shell empty-state">
      <p className="eyebrow">404</p>
      <h1>这条学习路径不存在</h1>
      <p>课程可能已调整，返回目录选择一个有效入口。</p>
      <Link href="/learn/" className="primary-link">
        返回课程目录
      </Link>
    </section>
  );
}
