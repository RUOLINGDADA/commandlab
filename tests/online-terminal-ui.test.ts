import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

describe("在线终端输入交互", () => {
  it("Git 和 Docker 都显式处理 Enter，避免受控表单提交失效", () => {
    const git = read("apps/web/src/components/interactive-git-workbench.tsx");
    const docker = read("apps/web/src/components/interactive-docker-workbench.tsx");
    expect(git).toContain('if (event.key === "Enter")');
    expect(git).toContain("event.preventDefault();\n      runCommand(input);");
    expect(docker).toContain('if (event.key === "Enter")');
    expect(docker).toContain("event.preventDefault();\n      runCommand(input);");
  });
});
