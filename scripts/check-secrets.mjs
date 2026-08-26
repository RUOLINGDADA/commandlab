import { execFileSync } from "node:child_process";
import fs from "node:fs";

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);
const patterns = [
  { name: "GitHub Personal Access Token", value: /gh[pousr]_[A-Za-z0-9]{30,}/ },
  { name: "私钥", value: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "AWS Access Key", value: /AKIA[0-9A-Z]{16}/ },
];

const findings = [];
for (const file of files) {
  const buffer = fs.readFileSync(file);
  if (buffer.includes(0)) continue;
  const content = buffer.toString("utf8");
  for (const pattern of patterns) {
    if (pattern.value.test(content)) findings.push(`${file}: ${pattern.name}`);
  }
}

if (findings.length > 0) {
  console.error(`发现疑似敏感信息：\n${findings.join("\n")}`);
  process.exit(1);
}
console.log(`敏感信息模式检查通过：${files.length} 个已跟踪文件。`);
