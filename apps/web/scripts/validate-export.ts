import fs from "node:fs";
import path from "node:path";

// Turbo 从仓库根目录执行脚本，而 Next.js 将静态文件输出到 apps/web/out。
// 同时保留从 apps/web 目录直接运行时的兼容路径，便于本地排查导出问题。
const outputCandidates = [
  path.resolve(process.cwd(), "out"),
  path.resolve(process.cwd(), "apps/web/out"),
];
const output = outputCandidates.find((candidate) => fs.existsSync(candidate));
if (!output) throw new Error("找不到 Next.js 静态导出目录 out。");
const requiredPages = [
  "index.html",
  "learn/index.html",
  "courses/git/mental-model/index.html",
  "courses/docker/install-engine/index.html",
  "reference/index.html",
  "reference/git/index.html",
  "reference/docker/index.html",
  "terminal/index.html",
];

for (const page of requiredPages) {
  const absolutePath = path.join(output, page);
  if (!fs.existsSync(absolutePath)) throw new Error(`静态导出缺少页面：${page}`);
  const html = fs.readFileSync(absolutePath, "utf8");
  if (!html.includes("/commandlab/_next/")) {
    throw new Error(`${page} 未使用 GitHub Pages 的 /commandlab 资源前缀。`);
  }
}

console.log(`静态导出校验通过：${requiredPages.length} 个关键页面。`);
