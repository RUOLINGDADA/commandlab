import {
  teachingEventSchema,
  teachingGitStateSchema,
  type TeachingEvent,
  type TeachingGitCommit,
  type TeachingGitFile,
  type TeachingGitState,
} from "@commandlab/content-schema";
import type { ApplyResult, GitCommand } from "./types";

const supportedCommands = new Set([
  "init",
  "status",
  "diff",
  "config",
  "add",
  "commit",
  "log",
  "tag",
  "branch",
  "switch",
  "merge",
  "rebase",
  "cherry-pick",
  "remote",
  "fetch",
  "pull",
  "push",
  "restore",
  "reset",
  "revert",
  "stash",
  "clean",
  "bisect",
]);

export function cloneGitState(state: TeachingGitState): TeachingGitState {
  return JSON.parse(JSON.stringify(state)) as TeachingGitState;
}

/** 创建有文件、提交图、远端引用的固定教学仓库，避免随机布局导致截图不稳定。 */
export function createInitialGitState(
  options: {
    initialized?: boolean;
    includeFeature?: boolean;
    includeRemote?: boolean;
    headBranch?: "main" | "feature";
    includeStaged?: boolean;
  } = {},
): TeachingGitState {
  const initialized = options.initialized ?? true;
  const commits: TeachingGitCommit[] = initialized
    ? [
        { id: "A", parents: [], message: "初始化项目", lane: "main" },
        { id: "B", parents: ["A"], message: "添加首页", lane: "main" },
      ]
    : [];
  const branches: Record<string, string> = initialized ? { main: "B" } : {};
  if (options.includeFeature && initialized) {
    commits.push({ id: "C", parents: ["B"], message: "准备功能分支", lane: "feature" });
    branches.feature = "C";
  }
  const headBranch =
    options.includeFeature && options.headBranch === "feature" ? "feature" : "main";
  const headCommit = initialized ? (headBranch === "feature" ? "C" : "B") : "";
  return teachingGitStateSchema.parse({
    tool: "git",
    repositoryInitialized: initialized,
    commits,
    branches,
    head: {
      kind: "branch",
      name: initialized ? headBranch : "main",
      commit: headCommit,
    },
    tags: {},
    workingTree: initialized
      ? [
          {
            path: "README.md",
            status: options.includeStaged ? "staged" : "modified",
            version: 2,
          },
          { path: "src/app.ts", status: "untracked", version: 1 },
          { path: "package.json", status: "clean", version: 1 },
        ]
      : [],
    remoteFiles: initialized
      ? [
          { path: "README.md", version: 2 },
          { path: "package.json", version: 1 },
        ]
      : [],
    staging: options.includeStaged ? ["README.md"] : [],
    remotes: options.includeRemote ? { origin: "https://example.com/commandlab.git" } : {},
    remoteBranches: options.includeRemote && initialized ? { "origin/main": "A" } : {},
    reflog: initialized ? ["HEAD@{0}: checkout: moving to main"] : [],
    stash: [],
    config: {},
  });
}

export function parseTeachingCommand(command: string): GitCommand {
  const tokens = command.trim().split(/\s+/).filter(Boolean);
  const gitIndex = tokens[0] === "git" ? 1 : 0;
  const name = tokens[gitIndex] ?? "";
  const args: string[] = [];
  const flags: Record<string, string[]> = {};
  let currentFlag: string | undefined;
  for (const token of tokens.slice(gitIndex + 1)) {
    if (token.startsWith("-")) {
      currentFlag = token;
      flags[currentFlag] ??= [];
      continue;
    }
    if (currentFlag) {
      flags[currentFlag]!.push(token);
      currentFlag = undefined;
    } else {
      args.push(token);
    }
  }
  return { name, args, flags };
}

function event(type: TeachingEvent["type"], subject: string, detail: string): TeachingEvent {
  return teachingEventSchema.parse({ type, subject, detail });
}

function nextCommitId(state: TeachingGitState, prefix = "D") {
  let index = state.commits.length;
  let id = `${prefix}${index}`;
  while (state.commits.some((commit) => commit.id === id)) id = `${prefix}${++index}`;
  return id;
}

function selectedFiles(state: TeachingGitState, args: string[]): TeachingGitFile[] {
  const paths = args.length ? new Set(args) : undefined;
  return state.workingTree.filter((file) => !paths || paths.has(file.path));
}

function addCommit(
  state: TeachingGitState,
  message: string,
  parents: string[],
  lane: TeachingGitCommit["lane"] = "main",
) {
  const id = nextCommitId(state);
  state.commits.push({ id, parents, message, lane });
  if (state.head.kind === "branch" && state.head.name) state.branches[state.head.name] = id;
  state.head.commit = id;
  state.reflog.unshift(`HEAD@{0}: commit: ${message}`);
  return id;
}

/** 纯 reducer：只在内存中变更教学状态，并返回可供画布使用的语义事件。 */
export function applyGitCommand(input: TeachingGitState, commandText: string): ApplyResult {
  const state = cloneGitState(input);
  const command = parseTeachingCommand(commandText);
  const events: TeachingEvent[] = [];
  const output: string[] = [];
  if (!supportedCommands.has(command.name)) {
    return {
      state: input,
      events: [
        event(
          "diagnostic-read",
          command.name || "空命令",
          "教学引擎无法识别这条命令，状态保持不变。",
        ),
      ],
      output: ["未知命令，未改变教学仓库。"],
      error: "暂不支持这条命令的演示。",
    };
  }
  if (command.name !== "init" && !state.repositoryInitialized) {
    return {
      state: input,
      events: [event("diagnostic-read", command.name, "仓库尚未初始化，命令没有可操作的提交图。")],
      output: ["fatal: not a git repository"],
      error: "请先初始化仓库。",
    };
  }

  switch (command.name) {
    case "init":
      state.repositoryInitialized = true;
      state.commits = [{ id: "A", parents: [], message: "初始化项目", lane: "main" }];
      state.branches = { main: "A" };
      state.head = { kind: "branch", name: "main", commit: "A" };
      state.remoteFiles = [];
      state.reflog.unshift("HEAD@{0}: init");
      events.push(
        event("repository-init", "repository", "工作区出现 .git 目录，main 指针开始指向初始提交。"),
      );
      output.push("Initialized empty Git repository");
      break;
    case "add": {
      const files = selectedFiles(state, command.args).filter((file) => file.status !== "clean");
      for (const file of files) {
        if (!state.staging.includes(file.path)) state.staging.push(file.path);
        file.status = "staged";
        events.push(
          event("file-stage", file.path, `${file.path} 的当前快照进入暂存区，等待 commit 封存。`),
        );
      }
      output.push(
        files.length
          ? `已暂存 ${files.map((file) => file.path).join("、")}`
          : "没有新的文件需要暂存",
      );
      break;
    }
    case "commit": {
      const message = command.flags["-m"]?.join(" ") || "保存本次改动";
      if (!state.staging.length) {
        output.push("nothing to commit");
        events.push(event("diagnostic-read", "staging", "暂存区为空，commit 没有新快照可以封存。"));
        break;
      }
      const parent = state.head.commit;
      const id = addCommit(
        state,
        message,
        parent ? [parent] : [],
        state.head.name === "feature" ? "feature" : "main",
      );
      for (const file of state.workingTree)
        if (state.staging.includes(file.path)) file.status = "clean";
      state.staging = [];
      events.push(
        event("commit-create", id, `暂存区被封装为 ${id}，提交父节点是 ${parent || "无"}。`),
      );
      events.push(
        event("pointer-move", state.head.name, `${state.head.name} 与 HEAD 一起前移到 ${id}。`),
      );
      output.push(`[${state.head.name} ${id}] ${message}`);
      break;
    }
    case "branch": {
      const name = command.args[0] || "feature";
      const target = command.args[1] || state.head.commit;
      state.branches[name] = target;
      events.push(event("branch-create", name, `${name} 指针创建在 ${target}，没有复制任何提交。`));
      output.push(`已创建分支 ${name} -> ${target}`);
      break;
    }
    case "switch": {
      const name = command.args[0] || "main";
      if (!state.branches[name])
        return {
          state: input,
          events: [event("diagnostic-read", name, "目标分支不存在，HEAD 保持原位置。")],
          output: [`fatal: invalid reference: ${name}`],
          error: "目标分支不存在。",
        };
      const previous = state.head.name;
      state.head = { kind: "branch", name, commit: state.branches[name] };
      state.reflog.unshift(`HEAD@{0}: checkout: moving from ${previous} to ${name}`);
      events.push(
        event(
          "head-switch",
          name,
          `HEAD 从 ${previous} 切换到 ${name}，工作区改为显示 ${state.branches[name]} 快照。`,
        ),
      );
      output.push(`Switched to branch '${name}'`);
      break;
    }
    case "merge": {
      const source = command.args[0] || "feature";
      const sourceCommit = state.branches[source];
      if (!sourceCommit)
        return {
          state: input,
          events: [event("diagnostic-read", source, "找不到要合并的来源分支，提交图没有变化。")],
          output: [`fatal: not something we can merge: ${source}`],
          error: "来源分支不存在。",
        };
      const id = addCommit(state, `合并 ${source}`, [state.head.commit, sourceCommit], "main");
      events.push(
        event(
          "merge-parents",
          id,
          `${id} 同时连接当前分支和 ${source} 的两个父提交，分叉历史在此汇合。`,
        ),
      );
      output.push(`Merge made by the teaching engine: ${id}`);
      break;
    }
    case "rebase": {
      const base = command.args[0] || "main";
      const baseCommit = state.branches[base];
      if (!baseCommit)
        return {
          state: input,
          events: [event("diagnostic-read", base, "找不到变基底稿，提交图保持不变。")],
          output: [`fatal: invalid upstream '${base}'`],
          error: "变基底稿不存在。",
        };
      const old = state.head.commit;
      const id = nextCommitId(state, "R");
      state.commits.push({ id, parents: [baseCommit], message: "重放功能改动", lane: "replay" });
      state.branches[state.head.name] = id;
      state.head.commit = id;
      state.reflog.unshift(`HEAD@{0}: rebase onto ${base}`);
      events.push(
        event("commit-replay", id, `把 ${old} 的内容重放到 ${baseCommit} 之后，新节点使用 ${id}。`),
      );
      events.push(
        event(
          "pointer-move",
          state.head.name,
          `${state.head.name} 指针从旧节点移动到重放后的 ${id}。`,
        ),
      );
      output.push(`Successfully rebased and updated ${state.head.name}`);
      break;
    }
    case "cherry-pick": {
      const source = command.args[0] || "C";
      const id = addCommit(state, `摘取 ${source}`, [state.head.commit], "feature");
      events.push(event("commit-create", id, `把 ${source} 的改动复制成当前分支的新提交 ${id}。`));
      output.push(`cherry-pick: created ${id}`);
      break;
    }
    case "tag": {
      const name = command.args[0] || "v1.0";
      state.tags[name] = command.args[1] || state.head.commit;
      events.push(
        event("tag-create", name, `标签 ${name} 指向 ${state.tags[name]}，不会移动分支指针。`),
      );
      output.push(`已创建标签 ${name}`);
      break;
    }
    case "remote": {
      if (command.args[0] === "files") {
        if (state.remoteFiles.length)
          output.push(
            ...state.remoteFiles.map((file) => `origin/main\t${file.path}\tv${file.version}`),
          );
        else output.push("远端没有文件");
        events.push(event("diagnostic-read", "remote-files", "读取 origin/main 的远端文件快照。"));
        break;
      }
      if (command.args[0] === "touch") {
        const path = command.args[1];
        if (!path) {
          return {
            state: input,
            events: [event("diagnostic-read", "remote-files", "远端新文件命令缺少文件路径。")],
            output: ["error: git remote touch 需要文件路径"],
            error: "远端文件路径缺失。",
          };
        }
        const existing = state.remoteFiles.find((file) => file.path === path);
        const version = (existing?.version ?? 0) + 1;
        if (existing) existing.version = version;
        else state.remoteFiles.push({ path, version });
        const parent = state.remoteBranches["origin/main"] || state.head.commit;
        const id = nextCommitId(state, "R");
        state.commits.push({
          id,
          parents: parent ? [parent] : [],
          message: `远端${existing ? "更新" : "新增"} ${path}`,
          lane: "remote",
        });
        state.remoteBranches["origin/main"] = id;
        events.push(
          event(
            "remote-transfer",
            path,
            `origin/main 创建远端文件 ${path} 的版本 v${version}，等待 pull 同步到本地。`,
          ),
        );
        output.push(
          `[origin/main ${id}] ${existing ? "updated" : "created"} ${path} (v${version})`,
          "远端文件已创建；执行 git pull 同步到本地工作区。",
        );
        break;
      }
      const name = command.args[1] || "origin";
      state.remotes[name] = command.args[2] || "https://example.com/commandlab.git";
      events.push(event("remote-transfer", name, `${name} 远端地址已记录，本地提交图尚未改变。`));
      output.push(`origin ${state.remotes[name]}`);
      break;
    }
    case "fetch":
      if (state.remoteBranches["origin/main"] === "A")
        state.remoteBranches["origin/main"] = state.branches.main || state.head.commit;
      events.push(
        event(
          "remote-transfer",
          "origin/main",
          "远端对象进入本地引用区，但当前工作分支仍停在原位置。",
        ),
      );
      output.push("From origin\n * branch main -> origin/main");
      break;
    case "pull": {
      const remote = state.remoteBranches["origin/main"] || state.head.commit;
      const local = state.head.commit;
      const synced: string[] = [];
      const conflicts: string[] = [];
      for (const remoteFile of state.remoteFiles) {
        const localFile = state.workingTree.find((file) => file.path === remoteFile.path);
        if (!localFile) {
          state.workingTree.push({
            path: remoteFile.path,
            status: "clean",
            version: remoteFile.version,
          });
          synced.push(`new file: ${remoteFile.path}`);
        } else if (remoteFile.version > localFile.version) {
          if (localFile.status === "clean") {
            localFile.version = remoteFile.version;
            synced.push(`updated: ${remoteFile.path}`);
          } else {
            conflicts.push(localFile.path);
          }
        }
      }
      // 发生冲突时只保留取回的远端引用，不能伪造已完成的 merge 提交。
      const id =
        remote && remote !== local && !conflicts.length
          ? addCommit(state, "合并远端更新", [local, remote], "main")
          : local;
      events.push(
        event("remote-transfer", "origin/main", "先取回远端引用，再把远端变化合并进当前分支。"),
      );
      if (id && id !== local)
        events.push(
          event("merge-parents", id, `pull 产生合并节点 ${id}，本地和远端父节点都被保留。`),
        );
      output.push(
        synced.length || conflicts.length
          ? `From origin\n${[...synced, ...conflicts.map((path) => `CONFLICT (local changes): ${path}`)].join("\n")}`
          : "Already up to date",
      );
      if (conflicts.length) output.push("本地未提交改动已保留，请手动解决冲突。");
      if (id && id !== local) output.push(`Merge made by the teaching engine: ${id}`);
      break;
    }
    case "push": {
      state.remotes.origin ||= "https://example.com/commandlab.git";
      state.remoteBranches["origin/main"] = state.head.commit;
      for (const localFile of state.workingTree.filter((file) => file.status === "clean")) {
        const remoteFile = state.remoteFiles.find((file) => file.path === localFile.path);
        if (remoteFile) remoteFile.version = Math.max(remoteFile.version, localFile.version);
        else state.remoteFiles.push({ path: localFile.path, version: localFile.version });
      }
      events.push(
        event(
          "remote-transfer",
          "origin/main",
          `本地 ${state.head.commit} 沿传输通道推送到远端引用。`,
        ),
      );
      output.push(`To origin\n   ${state.head.commit} -> main`);
      break;
    }
    case "restore": {
      const files = selectedFiles(state, command.args);
      for (const file of files) {
        file.status = "clean";
        state.staging = state.staging.filter((path) => path !== file.path);
        events.push(
          event(
            command.flags["--staged"] ? "file-unstage" : "recovery-restore",
            file.path,
            `${file.path} 回到最近提交的干净状态。`,
          ),
        );
      }
      output.push(`已恢复 ${files.length} 个文件`);
      break;
    }
    case "reset": {
      const target = command.args[0] || "A";
      if (!state.commits.some((commit) => commit.id === target))
        return {
          state: input,
          events: [event("diagnostic-read", target, "找不到 reset 目标提交，指针保持原位置。")],
          output: [`fatal: ambiguous argument '${target}'`],
          error: "目标提交不存在。",
        };
      const previous = state.head.commit;
      state.head.commit = target;
      if (state.head.name) state.branches[state.head.name] = target;
      if (command.flags["--hard"]) {
        state.staging = [];
        state.workingTree.forEach((file) => (file.status = "clean"));
      }
      state.reflog.unshift(`HEAD@{0}: reset: moving to ${target}`);
      events.push(
        event(
          "pointer-move",
          state.head.name,
          `HEAD 从 ${previous} 移回 ${target}；${command.flags["--hard"] ? "暂存区和工作区也被覆盖。" : "文件改动仍被保留。"}`,
        ),
      );
      output.push(`HEAD is now at ${target}`);
      break;
    }
    case "revert": {
      const source = command.args[0] || state.head.commit;
      const id = addCommit(state, `撤销 ${source}`, [state.head.commit], "main");
      events.push(
        event(
          "recovery-restore",
          source,
          `保留原提交 ${source}，新增反向提交 ${id} 抵消它的影响。`,
        ),
      );
      output.push(`[${state.head.name} ${id}] Revert ${source}`);
      break;
    }
    case "stash": {
      const action = command.args[0] || "push";
      if (action === "pop" || action === "apply") {
        const saved = state.stash[state.stash.length - 1];
        state.workingTree.find((file) => file.path === "README.md")!.status = saved
          ? "modified"
          : "clean";
        events.push(event("stash-save", "stash", "抽屉里的临时改动重新回到工作区。"));
        output.push("Applied stash");
      } else {
        state.stash.push("README.md + src/app.ts");
        state.workingTree.forEach((file) => (file.status = "clean"));
        state.staging = [];
        events.push(
          event("stash-save", "stash", "工作区改动被收进 stash 抽屉，提交历史没有新增节点。"),
        );
        output.push("Saved working directory and index state");
      }
      break;
    }
    case "clean": {
      const removed = state.workingTree
        .filter((file) => file.status === "untracked")
        .map((file) => file.path);
      state.workingTree = state.workingTree.filter((file) => file.status !== "untracked");
      events.push(
        event(
          "cleanup-remove",
          "working-tree",
          `清理范围内移除了 ${removed.length ? removed.join("、") : "没有"} 未跟踪文件。`,
        ),
      );
      output.push(removed.length ? `Removing ${removed.join(" ")}` : "nothing to clean");
      break;
    }
    case "config":
      state.config[command.args[0] || "user.name"] =
        command.args.slice(1).join(" ") || "CommandLab Learner";
      events.push(event("diagnostic-read", "config", "配置写入仓库设置，不会创建提交或移动分支。"));
      output.push("配置已更新");
      break;
    case "status":
    case "diff":
    case "log":
    case "bisect":
      events.push(
        event(
          "diagnostic-read",
          command.name,
          `${command.name} 只读取教学仓库证据，状态保持不变。`,
        ),
      );
      output.push(
        command.name === "status"
          ? "On branch main\nChanges not staged for commit"
          : `${command.name}: teaching evidence shown`,
      );
      break;
  }
  return { state: teachingGitStateSchema.parse(state), events, output };
}

/**
 * 创建命令执行中的中间快照。中间快照故意只完成“对象生成”或“引用移动”中的一半，
 * 让画布可以像 Git 客户端一样先展示动作，再展示最终稳定状态。
 */
export function createGitTransitionState(
  before: TeachingGitState,
  after: TeachingGitState,
  commandText: string,
): TeachingGitState {
  const command = parseTeachingCommand(commandText);
  const state = cloneGitState(before);
  switch (command.name) {
    case "init":
    case "add":
    case "restore":
    case "clean":
    case "config":
      return cloneGitState(after);
    case "commit":
      state.commits = cloneGitState(after).commits;
      return teachingGitStateSchema.parse(state);
    case "branch":
      state.branches = { ...after.branches };
      return teachingGitStateSchema.parse(state);
    case "switch":
      state.head = { ...after.head };
      return teachingGitStateSchema.parse(state);
    case "merge":
    case "pull":
    case "cherry-pick":
    case "rebase":
    case "revert":
      state.commits = cloneGitState(after).commits;
      return teachingGitStateSchema.parse(state);
    case "tag":
      state.tags = { ...after.tags };
      return teachingGitStateSchema.parse(state);
    case "fetch":
    case "push":
      state.remoteBranches = { ...after.remoteBranches };
      return teachingGitStateSchema.parse(state);
    case "reset":
      state.head = { ...after.head };
      state.branches = { ...after.branches };
      return teachingGitStateSchema.parse(state);
    case "stash":
      state.stash = [...after.stash];
      return teachingGitStateSchema.parse(state);
    case "status":
    case "diff":
    case "log":
    case "bisect":
    case "remote":
      state.remoteFiles = [...after.remoteFiles];
      state.remoteBranches = { ...after.remoteBranches };
      return teachingGitStateSchema.parse(state);
    default:
      return cloneGitState(after);
  }
}

export function diffTeachingState(
  before: TeachingGitState,
  after: TeachingGitState,
): TeachingEvent[] {
  const events: TeachingEvent[] = [];
  if (before.head.commit !== after.head.commit)
    events.push(
      event(
        "pointer-move",
        after.head.name,
        `指针从 ${before.head.commit || "空"} 变为 ${after.head.commit || "空"}。`,
      ),
    );
  if (before.staging.join() !== after.staging.join())
    events.push(event("file-stage", "staging", "暂存区文件清单发生变化。"));
  if (before.commits.length !== after.commits.length)
    events.push(
      event("commit-create", after.commits.at(-1)?.id || "commit", "提交图节点数量发生变化。"),
    );
  return events;
}
