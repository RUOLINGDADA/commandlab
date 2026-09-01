import { describe, expect, it } from "vitest";
import {
  createInteractiveGitState,
  executeInteractiveGitCommand,
  getInteractiveCommandSuggestions,
  getInteractiveContextActions,
  interactiveGitCommands,
} from "../apps/web/src/lib/interactive-git";

describe("interactive Git simulator", () => {
  it("同步暂存、提交和分支状态", () => {
    const initial = createInteractiveGitState();
    const staged = executeInteractiveGitCommand(initial, "git add src/app.ts");
    expect(staged.state.staging).toContain("src/app.ts");
    expect(staged.output.join("\n")).toContain("src/app.ts");

    const committed = executeInteractiveGitCommand(staged.state, 'git commit -m "添加应用入口"');
    expect(committed.state.commits.at(-1)?.message).toBe("添加应用入口");
    expect(committed.state.staging).toEqual([]);

    const branched = executeInteractiveGitCommand(committed.state, "git switch -c experiment");
    expect(branched.state.branches.experiment).toBe(committed.state.head.commit);
    expect(branched.state.head.name).toBe("experiment");
  });

  it("支持工作区点击会使用的 restore staged 和 stash list", () => {
    const initial = createInteractiveGitState();
    const staged = executeInteractiveGitCommand(initial, "git add README.md");
    const restored = executeInteractiveGitCommand(staged.state, "git restore --staged README.md");
    expect(restored.state.staging).not.toContain("README.md");
    expect(restored.state.workingTree.find((file) => file.path === "README.md")?.status).toBe(
      "modified",
    );

    const stashed = executeInteractiveGitCommand(restored.state, "git stash push");
    expect(stashed.state.stash).toHaveLength(1);
    const listed = executeInteractiveGitCommand(stashed.state, "git stash list");
    expect(listed.output[0]).toContain("stash@{0}");
  });

  it("支持 commit -a 自动暂存已修改文件", () => {
    const initial = createInteractiveGitState();
    const committed = executeInteractiveGitCommand(initial, 'git commit -a -m "批量保存"');
    expect(committed.error).toBeUndefined();
    expect(committed.state.commits.at(-1)?.message).toBe("批量保存");
    expect(committed.state.staging).toEqual([]);
    expect(committed.state.workingTree.find((file) => file.path === "README.md")?.status).toBe(
      "clean",
    );
  });

  it("支持 HEAD~、HEAD^ 和唯一短提交引用", () => {
    const initial = createInteractiveGitState();
    const staged = executeInteractiveGitCommand(initial, "git add README.md");
    const committed = executeInteractiveGitCommand(staged.state, 'git commit -m "第二次提交"');
    const showParent = executeInteractiveGitCommand(committed.state, "git show HEAD~1");
    expect(showParent.error).toBeUndefined();
    expect(showParent.output.join("\n")).toContain("commit B");
    const showCaret = executeInteractiveGitCommand(committed.state, "git show HEAD^1");
    expect(showCaret.error).toBeUndefined();
    expect(showCaret.output.join("\n")).toContain("commit B");
  });
  it("错误命令不会污染原状态", () => {
    const initial = createInteractiveGitState();
    const before = JSON.stringify(initial);
    const result = executeInteractiveGitCommand(initial, "git switch missing");
    expect(result.error).toBeTruthy();
    expect(JSON.stringify(result.state)).toBe(before);
  });

  it("为注册的每条 Git 命令提供可观察反馈", () => {
    const state = createInteractiveGitState();
    for (const [name] of interactiveGitCommands) {
      const result = executeInteractiveGitCommand(state, `git ${name}`);
      expect(result.output.length, name).toBeGreaterThan(0);
    }
  });

  it("根据 Git 前缀提供紧凑命令候选", () => {
    expect(getInteractiveCommandSuggestions("git st").map((item) => item.command)).toContain(
      "git status",
    );
    expect(getInteractiveCommandSuggestions("git co").map((item) => item.command)).toEqual(
      expect.arrayContaining(["git commit", "git checkout"]),
    );
    expect(getInteractiveCommandSuggestions("git ").length).toBeGreaterThan(0);
    expect(getInteractiveCommandSuggestions("npm ")).toEqual([]);
    expect(getInteractiveCommandSuggestions("gitfoo")).toEqual([]);
    expect(getInteractiveCommandSuggestions("git remote ").map((item) => item.command)).toEqual(
      expect.arrayContaining(["git remote files", "git remote touch docs/remote-guide.md"]),
    );
  });

  it("为工作区目标映射可回放的上下文 Git 动作", () => {
    const fileActions = getInteractiveContextActions({
      kind: "file",
      id: "src/app.ts",
      label: "src/app.ts",
      staged: true,
    });
    expect(fileActions.map((item) => item.command)).toEqual([
      "git diff --cached -- src/app.ts",
      "git restore --staged src/app.ts",
      "git restore src/app.ts",
    ]);

    const commitActions = getInteractiveContextActions({
      kind: "commit",
      id: "D3",
      label: "保存入口",
    });
    expect(commitActions.map((item) => item.command)).toContain("git show D3");
    expect(commitActions.find((item) => item.id === "reset-hard")?.danger).toBe(true);

    expect(getInteractiveContextActions({ kind: "remote", id: "origin", label: "origin" })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ command: "git remote -v" }),
        expect.objectContaining({ command: "git fetch origin" }),
      ]),
    );
    expect(
      getInteractiveContextActions({ kind: "branch", id: "feature", label: "feature" }).map(
        (item) => item.command,
      ),
    ).toContain("git branch -d feature");
  });

  it("在远端创建文件并通过 pull 同步到本地工作区", () => {
    const initial = createInteractiveGitState();
    const remoteCreated = executeInteractiveGitCommand(initial, "git remote touch docs/remote.md");
    expect(remoteCreated.error).toBeUndefined();
    expect(remoteCreated.state.remoteFiles).toContainEqual({ path: "docs/remote.md", version: 1 });
    expect(remoteCreated.state.workingTree.some((file) => file.path === "docs/remote.md")).toBe(
      false,
    );

    const listed = executeInteractiveGitCommand(remoteCreated.state, "git remote files");
    expect(listed.output.join("\n")).toContain("docs/remote.md\tv1");

    const pulled = executeInteractiveGitCommand(remoteCreated.state, "git pull");
    expect(pulled.error).toBeUndefined();
    expect(pulled.output.join("\n")).toContain("new file: docs/remote.md");
    expect(pulled.state.workingTree).toContainEqual({
      path: "docs/remote.md",
      status: "clean",
      version: 1,
    });
    expect(pulled.state.commits.at(-1)?.message).toBe("合并远端更新");
  });

  it("pull 不覆盖本地未提交的远端同路径文件", () => {
    const initial = createInteractiveGitState();
    const remoteUpdated = executeInteractiveGitCommand(initial, "git remote touch README.md");
    const pulled = executeInteractiveGitCommand(remoteUpdated.state, "git pull");
    const readme = pulled.state.workingTree.find((file) => file.path === "README.md");
    expect(readme?.status).toBe("modified");
    expect(readme?.version).toBe(2);
    expect(pulled.output.join("\n")).toContain("CONFLICT (local changes): README.md");
    expect(pulled.state.head.commit).toBe(remoteUpdated.state.head.commit);
    expect(pulled.output.join("\n")).not.toContain("Merge made by the teaching engine");
  });

  it("git status 显示本地与远端的实际关系", () => {
    const initial = createInteractiveGitState();
    const diverged = executeInteractiveGitCommand(initial, "git remote touch docs/remote.md");
    expect(executeInteractiveGitCommand(diverged.state, "git status").output.join("\n")).toContain(
      "have diverged",
    );

    const pulled = executeInteractiveGitCommand(diverged.state, "git pull");
    expect(executeInteractiveGitCommand(pulled.state, "git status").output.join("\n")).toContain(
      "ahead of 'origin/main' by 1 commit",
    );
  });
});
