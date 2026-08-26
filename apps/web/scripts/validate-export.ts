import fs from "node:fs";
import path from "node:path";

const output = path.resolve(process.cwd(), "out");
const requiredPages = [
  "index.html",
  "learn/index.html",
  "courses/git/mental-model/index.html",
  "courses/docker/engine-model/index.html",
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
