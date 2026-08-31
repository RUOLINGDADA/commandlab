import { describe, expect, it } from "vitest";
import { loadReferences } from "../apps/web/src/lib/content";
import { applyGitCommand, createInitialGitState } from "../apps/web/src/lib/teaching/git-engine";
import { buildTeachingRegistry } from "../apps/web/src/lib/teaching/scenes";

describe("教学动画状态机", () => {
  const entries = loadReferences();

  it("为 Git 与 Docker 每条百科建立五阶段以上独立时间轴", () => {
    const registry = buildTeachingRegistry(entries);
    expect(registry.size).toBe(entries.length);
    for (const [route, timeline] of registry) {
      expect(timeline.frames.map((frame) => frame.phase)).toEqual([
        "idle",
        "typing",
        "typing",
        "typing",
        "typing",
        "executing",
        "transitioning",
        "settled",
      ]);
      expect(timeline.scene.id).toBe(route.replace("/", "-"));
      expect(timeline.scene.finalState).toEqual(timeline.frames.at(-1)?.state);
      expect(new Set(timeline.frames.map((frame) => frame.transition)).size).toBeGreaterThan(1);
    }
  });

  it("git add 只把目标文件移动到暂存区", () => {
    const before = createInitialGitState();
    const result = applyGitCommand(before, "git add README.md");
    expect(result.state.staging).toEqual(["README.md"]);
    expect(result.state.workingTree.find((file) => file.path === "README.md")?.status).toBe(
      "staged",
    );
    expect(result.state.workingTree.find((file) => file.path === "src/app.ts")?.status).toBe(
      "untracked",
    );
    expect(result.events.some((event) => event.type === "file-stage")).toBe(true);
  });

  it("init 创建仓库，commit 封存暂存快照并前移指针", () => {
    const empty = createInitialGitState({ initialized: false });
    const initialized = applyGitCommand(empty, "git init");
    expect(initialized.state.repositoryInitialized).toBe(true);
    expect(initialized.state.head.commit).toBe("A");

    const staged = createInitialGitState({ includeStaged: true });
    const committed = applyGitCommand(staged, 'git commit -m "保存首页改动"');
    expect(committed.state.commits).toHaveLength(3);
    expect(committed.state.head.commit).toBe("D2");
    expect(committed.state.staging).toEqual([]);
  });

  it("branch、switch、merge 和 rebase 产生不同提交图语义", () => {
    const base = createInitialGitState({ includeFeature: true });
    const branch = applyGitCommand(createInitialGitState(), "git branch feature");
    expect(branch.state.commits).toHaveLength(2);
    expect(branch.state.branches.feature).toBe("B");

    const switched = applyGitCommand(base, "git switch feature");
    expect(switched.state.head.name).toBe("feature");
    expect(base.head.name).toBe("main");
    expect(switched.events[0]?.type).toBe("head-switch");

    const merged = applyGitCommand(base, "git merge feature");
    expect(merged.state.commits.at(-1)?.parents).toHaveLength(2);
    expect(merged.events.some((event) => event.type === "merge-parents")).toBe(true);

    const rebased = applyGitCommand(base, "git rebase main");
    expect(rebased.state.commits.at(-1)?.lane).toBe("replay");
    expect(rebased.events.some((event) => event.type === "commit-replay")).toBe(true);
  });

  it("reset、revert、stash 和远端命令展示不同恢复路径", () => {
    const reset = applyGitCommand(createInitialGitState(), "git reset --hard A");
    expect(reset.state.head.commit).toBe("A");
    expect(reset.state.workingTree.every((file) => file.status === "clean")).toBe(true);

    const revert = applyGitCommand(createInitialGitState(), "git revert B");
    expect(revert.state.commits).toHaveLength(3);
    expect(revert.state.commits.at(-1)?.parents).toEqual(["B"]);

    const stashed = applyGitCommand(createInitialGitState(), "git stash push");
    expect(stashed.state.stash).toHaveLength(1);
    expect(stashed.state.workingTree.every((file) => file.status === "clean")).toBe(true);

    const fetched = applyGitCommand(
      createInitialGitState({ includeRemote: true }),
      "git fetch origin",
    );
    expect(fetched.state.remoteBranches["origin/main"]).toBe("B");
    const pushed = applyGitCommand(
      createInitialGitState({ includeRemote: true }),
      "git push origin main",
    );
    expect(pushed.state.remoteBranches["origin/main"]).toBe("B");
  });

  it("非法命令和非法引用不修改原始状态", () => {
    const before = createInitialGitState();
    const unknown = applyGitCommand(before, "git totally-unknown");
    expect(unknown.state).toEqual(before);
    const invalidRef = applyGitCommand(before, "git switch missing");
    expect(invalidRef.state).toEqual(before);
    expect(invalidRef.error).toBeTruthy();
  });
});
