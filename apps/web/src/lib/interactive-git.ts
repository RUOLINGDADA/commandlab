import { teachingGitStateSchema, type TeachingGitState } from "@commandlab/content-schema";
import { applyGitCommand, cloneGitState, createInitialGitState } from "./teaching/git-engine";

export type InteractiveLineKind = "command" | "output" | "error" | "system";

export type InteractiveLine = {
  id: string;
  kind: InteractiveLineKind;
  text: string;
};

export type InteractiveCommandSuggestion = {
  command: string;
  description: string;
};

export type InteractiveContextTarget = {
  kind: "file" | "branch" | "commit" | "remote" | "remote-file" | "stash";
  id: string;
  label: string;
  staged?: boolean;
  current?: boolean;
};

export type InteractiveContextAction = {
  id: string;
  label: string;
  command: string;
  danger?: boolean;
};

export type InteractiveGitResult = {
  state: TeachingGitState;
  output: string[];
  error?: string | undefined;
  command?: string | undefined;
};

export const interactiveGitCommands = [
  ["init", "初始化仓库"],
  ["status", "查看工作区状态"],
  ["diff", "查看未暂存差异"],
  ["config", "读取或写入配置"],
  ["add", "把文件放入暂存区"],
  ["commit", "创建提交快照"],
  ["log", "查看提交历史"],
  ["tag", "管理标签引用"],
  ["branch", "查看或管理分支"],
  ["switch", "切换分支或创建分支"],
  ["checkout", "切换分支的兼容命令"],
  ["merge", "合并两条历史"],
  ["rebase", "重放提交"],
  ["cherry-pick", "摘取已有提交"],
  ["remote", "管理远端地址"],
  ["fetch", "取回远端引用"],
  ["pull", "取回并整合远端变化"],
  ["push", "发布本地提交"],
  ["restore", "恢复工作区或暂存区"],
  ["reset", "移动 HEAD 与三棵树"],
  ["revert", "用新提交撤销改动"],
  ["stash", "暂存临时改动"],
  ["clean", "清理未跟踪文件"],
  ["bisect", "二分定位问题提交"],
  ["show", "查看提交或对象"],
  ["rev-parse", "解析引用和 HEAD"],
  ["reflog", "查看引用移动记录"],
  ["ls-files", "列出索引文件"],
  ["describe", "为提交生成可读名称"],
  ["shortlog", "按作者汇总历史"],
  ["whatchanged", "查看每个提交的变化"],
  ["blame", "查看文件逐行归属"],
  ["grep", "在版本文件中搜索文本"],
  ["rm", "移除并暂存文件"],
  ["mv", "移动并暂存文件"],
  ["gc", "清理教学仓库对象"],
  ["clone", "模拟克隆仓库"],
  ["worktree", "查看工作树"],
  ["submodule", "查看子模块"],
] as const;

const commandNames: ReadonlySet<string> = new Set(interactiveGitCommands.map(([name]) => name));

const commonCommandSuggestions: InteractiveCommandSuggestion[] = [
  { command: "git status", description: "查看工作区状态" },
  { command: "git add .", description: "暂存全部变化" },
  { command: 'git commit -m "保存改动"', description: "创建提交快照" },
  { command: "git log --oneline", description: "查看提交历史" },
  { command: "git branch", description: "查看本地分支" },
  { command: "git switch main", description: "切换到 main 分支" },
  { command: "git diff", description: "查看未暂存差异" },
  { command: "git stash list", description: "查看临时改动" },
];

/** 根据终端输入生成紧凑的 Git 命令候选，不会执行或修改仿真状态。 */
export function getInteractiveCommandSuggestions(input: string): InteractiveCommandSuggestion[] {
  const normalized = input.trimStart().toLowerCase();
  if (!normalized || normalized === "git ") return commonCommandSuggestions;
  if (!normalized.startsWith("git")) return [];
  if (normalized === "git") return commonCommandSuggestions.slice(0, 5);
  if (!normalized.startsWith("git ")) return [];

  const body = normalized.slice(4);
  const [partialCommand = "", ...rest] = body.trim().split(/\s+/);
  const hasArguments = rest.length > 0 || body.endsWith(" ");
  const parameterSuggestions: InteractiveCommandSuggestion[] =
    partialCommand === "add"
      ? [
          { command: "git add .", description: "暂存全部变化" },
          { command: "git add README.md", description: "暂存指定文件" },
        ]
      : partialCommand === "commit"
        ? [{ command: 'git commit -m "保存改动"', description: "创建提交快照" }]
        : partialCommand === "log"
          ? [{ command: "git log --oneline", description: "紧凑查看提交历史" }]
          : partialCommand === "switch"
            ? [{ command: "git switch main", description: "切换到 main 分支" }]
            : partialCommand === "stash"
              ? [{ command: "git stash list", description: "查看临时改动" }]
              : partialCommand === "remote"
                ? [
                    { command: "git remote files", description: "查看远端文件快照" },
                    {
                      command: "git remote touch docs/remote-guide.md",
                      description: "在远端创建演示文件",
                    },
                  ]
                : partialCommand === "pull"
                  ? [{ command: "git pull origin main", description: "同步远端提交与文件" }]
                  : partialCommand === "push"
                    ? [{ command: "git push origin main", description: "发布本地提交" }]
                    : [];

  if (hasArguments) {
    const matchingParameters = parameterSuggestions.filter((item) =>
      item.command.startsWith(normalized),
    );
    return matchingParameters.length ? matchingParameters : parameterSuggestions;
  }

  return interactiveGitCommands
    .filter(
      ([name]) =>
        name.startsWith(partialCommand) || (partialCommand === "co" && name === "checkout"),
    )
    .map(([name, description]) => ({ command: `git ${name}`, description }))
    .slice(0, 8);
}

/** 为工作区对象返回可回放的上下文菜单动作。动作本身不直接修改状态。 */
export function getInteractiveContextActions(
  target: InteractiveContextTarget,
): InteractiveContextAction[] {
  switch (target.kind) {
    case "file":
      return [
        {
          id: "diff",
          label: "查看差异",
          command: target.staged ? `git diff --cached -- ${target.id}` : `git diff -- ${target.id}`,
        },
        {
          id: target.staged ? "unstage" : "stage",
          label: target.staged ? "撤回暂存" : "暂存文件",
          command: target.staged ? `git restore --staged ${target.id}` : `git add ${target.id}`,
        },
        {
          id: "restore",
          label: "恢复文件",
          command: `git restore ${target.id}`,
          danger: true,
        },
      ];
    case "branch":
      return [
        { id: "switch", label: "切换到此分支", command: `git switch ${target.id}` },
        { id: "log", label: "查看此分支历史", command: `git log ${target.id} --oneline` },
        ...(target.current
          ? []
          : [
              {
                id: "delete",
                label: "删除此分支",
                command: `git branch -d ${target.id}`,
                danger: true,
              },
            ]),
      ];
    case "commit":
      return [
        { id: "show", label: "查看提交详情", command: `git show ${target.id}` },
        { id: "log", label: "从此提交查看历史", command: `git log ${target.id} --oneline` },
        {
          id: "reset-hard",
          label: "将 HEAD 重置到此提交",
          command: `git reset --hard ${target.id}`,
          danger: true,
        },
      ];
    case "remote":
      return [
        { id: "list", label: "查看远端详情", command: "git remote -v" },
        { id: "fetch", label: "获取远端引用", command: `git fetch ${target.id}` },
      ];
    case "remote-file":
      return [
        { id: "list", label: "查看远端文件", command: "git remote files" },
        { id: "pull", label: "同步远端文件", command: "git pull" },
      ];
    case "stash":
      return [
        { id: "list", label: "查看 stash 列表", command: "git stash list" },
        { id: "pop", label: "弹出最新 stash", command: "git stash pop" },
      ];
  }
}

export function createInteractiveGitState(): TeachingGitState {
  return createInitialGitState({ includeFeature: true, includeRemote: true });
}

export function createInteractiveWelcome(): InteractiveLine[] {
  return [
    line("system", "CommandLab Git 仿真终端 · 内存隔离会话"),
    line("system", "输入 git help 查看命令；所有操作只改变当前浏览器会话。"),
    line("output", "提示：点击左侧文件、分支或提交，也会把对应命令送入终端。"),
  ];
}

export function line(kind: InteractiveLineKind, text: string): InteractiveLine {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, kind, text };
}

/** 将终端输入解析为保留引号内容的 token，支持 git -c key=value 这类常见写法。 */
export function tokenizeInteractiveCommand(input: string): string[] {
  const tokens = input.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\S+/g) ?? [];
  return tokens.map((token) => {
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      return token.slice(1, -1).replace(/\\([\\"'])/g, "$1");
    }
    return token;
  });
}

/**
 * 执行一条浏览器内 Git 命令。命令失败时直接返回原状态，保证错误不会污染提交图。
 */
export function executeInteractiveGitCommand(
  input: TeachingGitState,
  rawInput: string,
): InteractiveGitResult {
  const raw = rawInput.trim();
  if (!raw) return { state: input, output: [] };
  const tokens = tokenizeInteractiveCommand(raw);
  const first = tokens[0]?.toLowerCase() ?? "";
  if (first === "clear" || first === "cls") {
    return { state: input, output: [], command: first };
  }
  if (first === "help" || (first === "git" && ["help", "--help", "-h"].includes(tokens[1] ?? ""))) {
    return { state: input, output: helpLines(), command: raw };
  }
  if (
    first === "version" ||
    (first === "git" && ["--version", "version"].includes(tokens[1] ?? ""))
  ) {
    return { state: input, output: ["git version 2.46.0 (CommandLab simulator)"], command: raw };
  }
  if (first !== "git") {
    return {
      state: input,
      output: [
        `${first || "命令"}: command not found`,
        "提示：请使用 git <command>，或输入 help。",
      ],
      error: "只支持 Git 仿真命令。",
      command: raw,
    };
  }

  const command = tokens[1] ?? "";
  if (!commandNames.has(command)) {
    return {
      state: input,
      output: [`git: '${command || ""}' 不是一个 git 命令`, "提示：输入 git help 查看可演示命令。"],
      error: "暂不支持这条 Git 命令。",
      command: raw,
    };
  }

  const state = cloneGitState(input);
  if (command === "init" && state.repositoryInitialized) {
    return {
      state,
      output: ["Reinitialized existing Git repository in /workspace/commandlab-git-lab/.git/"],
      command: raw,
    };
  }
  if (command === "status") return readStatus(state, raw);
  if (command === "diff") return readDiff(state, raw);
  if (command === "log" || command === "whatchanged") return readLog(state, raw);
  if (command === "branch") return runBranch(state, tokens, raw);
  if (command === "tag") return runTag(state, tokens, raw);
  if (command === "remote") return runRemote(state, tokens, raw);
  if (command === "config") return runConfig(state, tokens, raw);
  if (command === "switch") return runSwitch(state, tokens, raw);
  if (command === "restore") return runRestore(state, tokens, raw);
  if (command === "reset") return runReset(state, tokens, raw);
  if (command === "stash") return runStash(state, tokens, raw);
  if (command === "show") return readShow(state, tokens, raw);
  if (command === "rev-parse") return readRevParse(state, tokens, raw);
  if (command === "reflog") return { state, output: state.reflog.slice(0, 8), command: raw };
  if (command === "ls-files") return readLsFiles(state, raw);
  if (command === "describe") return readDescribe(state, raw);
  if (["shortlog", "blame", "grep", "worktree", "submodule"].includes(command)) {
    return readInformational(state, command, tokens.slice(2), raw);
  }
  if (command === "rm") return runRemove(state, tokens, raw);
  if (command === "mv") return runMove(state, tokens, raw);
  if (command === "checkout") return runCheckout(state, tokens, raw);
  if (command === "clone") {
    return {
      state,
      output: [
        "Cloning into 'commandlab-demo'...",
        "remote: simulated repository ready",
        "已在内存中创建演示工作区。",
      ],
      command: raw,
    };
  }
  if (command === "gc") {
    return {
      state,
      output: ["Enumerating objects: 12, done.", "教学仓库对象已整理，提交和引用保持不变。"],
      command: raw,
    };
  }

  const prepared = prepareCommand(tokens);
  try {
    const result = applyGitCommand(state, prepared);
    const output = result.output.flatMap((item) => item.split("\n"));
    if (result.error) return { state, output, error: result.error, command: raw };
    return {
      state: result.state,
      output: output.length ? output : ["命令已执行，状态已同步。"],
      command: raw,
    };
  } catch {
    return {
      state,
      output: ["fatal: 仿真器无法安全完成这条命令", "状态保持不变，请检查参数后重试。"],
      error: "命令参数无效。",
      command: raw,
    };
  }
}

function prepareCommand(tokens: string[]): string {
  const command = tokens[1] ?? "";
  if (command === "add") {
    const requested = tokens.slice(2);
    if (
      !requested.length ||
      requested.includes(".") ||
      requested.includes("-A") ||
      requested.includes("--all") ||
      requested.includes("-u")
    ) {
      const paths = requested.includes("-u")
        ? ["README.md"]
        : ["README.md", "src/app.ts", "package.json"];
      return `git add ${paths.join(" ")}`;
    }
  }
  return `git ${tokens.slice(1).join(" ")}`;
}

function runBranch(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const args = tokens.slice(2);
  if (args.includes("--show-current")) return { state, output: [state.head.name], command: raw };
  if (!args.length || args.includes("-a") || args.includes("-r") || args.includes("-v")) {
    const local = Object.entries(state.branches).map(
      ([name, commit]) => `${name === state.head.name ? "*" : " "} ${name} ${commit}`,
    );
    const remote = Object.entries(state.remoteBranches).map(
      ([name, commit]) => `  ${name} ${commit}`,
    );
    return {
      state,
      output: args.includes("-r") ? remote : [...local, ...(args.includes("-a") ? remote : [])],
      command: raw,
    };
  }
  const deleteFlag = args.find((arg) => arg === "-d" || arg === "-D");
  if (deleteFlag) {
    const name = args.find((arg) => !arg.startsWith("-"));
    if (!name || !state.branches[name])
      return {
        state,
        output: [`error: branch '${name ?? ""}' not found`],
        error: "分支不存在。",
        command: raw,
      };
    if (name === state.head.name)
      return {
        state,
        output: [`error: cannot delete branch '${name}' checked out`],
        error: "不能删除当前分支。",
        command: raw,
      };
    const next = cloneGitState(state);
    delete next.branches[name];
    next.reflog.unshift(`HEAD@{0}: branch: deleted ${name}`);
    return { state: parseState(next), output: [`Deleted branch ${name}`], command: raw };
  }
  const renameFlag = args.find((arg) => arg === "-m" || arg === "-M" || arg === "--move");
  if (renameFlag) {
    const names = args.filter((arg) => !arg.startsWith("-"));
    const oldName = names.length > 1 ? (names[0] ?? state.head.name) : state.head.name;
    const newName = names.at(-1);
    if (!newName || !state.branches[oldName])
      return {
        state,
        output: ["error: invalid branch rename"],
        error: "分支名称无效。",
        command: raw,
      };
    const next = cloneGitState(state);
    next.branches[newName] = next.branches[oldName]!;
    delete next.branches[oldName];
    if (next.head.name === oldName) next.head.name = newName;
    return {
      state: parseState(next),
      output: [`分支 ${oldName} 已重命名为 ${newName}`],
      command: raw,
    };
  }
  const result = applyGitCommand(state, `git branch ${args.join(" ")}`);
  return {
    state: result.state,
    output: result.output.flatMap((item) => item.split("\n")),
    error: result.error,
    command: raw,
  };
}

function runTag(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const args = tokens.slice(2);
  if (!args.length || args.includes("-l")) {
    const output = Object.entries(state.tags).map(([name, commit]) => `${name} -> ${commit}`);
    return { state, output: output.length ? output : ["暂无标签"], command: raw };
  }
  const result = applyGitCommand(state, `git tag ${args.join(" ")}`);
  return { state: result.state, output: result.output, error: result.error, command: raw };
}

function runRemote(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const args = tokens.slice(2);
  if (args[0] === "get-url") {
    const remoteName = args[1] ?? "origin";
    const url = state.remotes[remoteName];
    return url
      ? { state, output: [url], command: raw }
      : {
          state,
          output: [`fatal: No such remote '${remoteName}'`],
          error: "远端不存在。",
          command: raw,
        };
  }
  if (!args.length || args.includes("-v")) {
    const output = Object.entries(state.remotes).flatMap(([name, url]) => [
      `${name}\t${url} (fetch)`,
      `${name}\t${url} (push)`,
    ]);
    return {
      state,
      output: output.length ? output : ["暂无远端；可执行 git remote add origin <url>"],
      command: raw,
    };
  }
  const result = applyGitCommand(state, `git remote ${args.join(" ")}`);
  return {
    state: result.state,
    output: result.output.flatMap((item) => item.split("\n")),
    error: result.error,
    command: raw,
  };
}

function runConfig(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const args = tokens.slice(2);
  if (!args.length || args.includes("--list") || args.includes("-l")) {
    const output = Object.entries(state.config).map(([key, value]) => `${key}=${value}`);
    return {
      state,
      output: output.length
        ? output
        : ['暂无配置；示例：git config user.name "CommandLab Learner"'],
      command: raw,
    };
  }
  const keyIndex = args.findIndex((arg) => !arg.startsWith("-"));
  const key = keyIndex >= 0 ? args[keyIndex] : undefined;
  const value = keyIndex >= 0 ? args.slice(keyIndex + 1).join(" ") : "";
  if (!key || !value)
    return {
      state,
      output: ["error: 使用 git config <key> <value>"],
      error: "配置参数不完整。",
      command: raw,
    };
  const next = cloneGitState(state);
  next.config[key] = value;
  return { state: parseState(next), output: [`配置已更新：${key}=${value}`], command: raw };
}

function runCheckout(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const args = tokens.slice(2);
  if (args[0] === "-b" || args[0] === "-B") {
    const name = args[1];
    if (!name)
      return {
        state,
        output: ["error: checkout 需要分支名称"],
        error: "分支名称缺失。",
        command: raw,
      };
    const created = applyGitCommand(state, `git branch ${name}`);
    if (created.error) return { state, output: created.output, error: created.error, command: raw };
    const switched = applyGitCommand(created.state, `git switch ${name}`);
    return {
      state: switched.state,
      output: [...created.output, ...switched.output],
      error: switched.error,
      command: raw,
    };
  }
  const target = args.find((arg) => !arg.startsWith("-"));
  if (!target)
    return {
      state,
      output: ["error: checkout 需要分支或提交引用"],
      error: "引用缺失。",
      command: raw,
    };
  if (state.branches[target]) return runApplied(state, `git switch ${target}`, raw);
  const commit = resolveRef(state, target);
  if (!commit)
    return {
      state,
      output: [`fatal: reference '${target}' not found`],
      error: "引用不存在。",
      command: raw,
    };
  const next = cloneGitState(state);
  next.head = { kind: "detached", name: "HEAD", commit };
  next.reflog.unshift(`HEAD@{0}: checkout: detached at ${commit}`);
  return {
    state: parseState(next),
    output: [`Note: switching to '${target}'`, "You are in 'detached HEAD' state."],
    command: raw,
  };
}

function runSwitch(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const args = tokens.slice(2);
  const createFlag = args.includes("-c") || args.includes("--create");
  if (createFlag) {
    const name = args.find((arg) => !arg.startsWith("-"));
    if (!name)
      return {
        state,
        output: ["fatal: missing branch name"],
        error: "分支名称缺失。",
        command: raw,
      };
    const created = applyGitCommand(state, `git branch ${name}`);
    if (created.error) return { state, output: created.output, error: created.error, command: raw };
    return runApplied(created.state, `git switch ${name}`, raw);
  }
  const target = args.find((arg) => !arg.startsWith("-"));
  return target
    ? runApplied(state, `git switch ${target}`, raw)
    : { state, output: ["fatal: missing branch name"], error: "分支名称缺失。", command: raw };
}

function runRestore(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const stagedOnly = tokens.includes("--staged") || tokens.includes("-S");
  const paths = tokens.slice(2).filter((token) => !token.startsWith("-"));
  const targets = paths.length ? paths : state.workingTree.map((file) => file.path);
  const next = cloneGitState(state);
  const existing = next.workingTree.filter((file) => targets.includes(file.path));
  if (!existing.length)
    return {
      state,
      output: ["error: pathspec did not match any files"],
      error: "文件不存在。",
      command: raw,
    };
  for (const file of existing) {
    if (stagedOnly) {
      next.staging = next.staging.filter((path) => path !== file.path);
      if (file.status === "staged") file.status = "modified";
    } else {
      file.status = "clean";
      next.staging = next.staging.filter((path) => path !== file.path);
    }
  }
  return {
    state: parseState(next),
    output: [`已${stagedOnly ? "撤回暂存" : "恢复"} ${existing.length} 个文件`],
    command: raw,
  };
}

function runReset(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const target = tokens.slice(2).find((token) => !token.startsWith("-")) ?? "A";
  const id = resolveRef(state, target);
  if (!id)
    return {
      state,
      output: [`fatal: ambiguous argument '${target}'`],
      error: "目标提交不存在。",
      command: raw,
    };
  const next = cloneGitState(state);
  const previous = next.head.commit;
  next.head.commit = id;
  if (next.head.kind === "branch" && next.head.name) next.branches[next.head.name] = id;
  if (tokens.includes("--hard")) {
    next.staging = [];
    next.workingTree.forEach((file) => (file.status = "clean"));
  } else if (!tokens.includes("--soft")) {
    next.staging = [];
    next.workingTree.forEach((file) => {
      if (file.status === "staged") file.status = "modified";
    });
  }
  next.reflog.unshift(`HEAD@{0}: reset: moving to ${id}`);
  return {
    state: parseState(next),
    output: [`HEAD is now at ${id}`, `指针从 ${previous} 移动到 ${id}`],
    command: raw,
  };
}

function runStash(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const action = tokens[2] ?? "push";
  if (action === "list")
    return {
      state,
      output: state.stash.length
        ? state.stash.map((item, index) => `stash@{${index}}: WIP on ${state.head.name}: ${item}`)
        : ["暂无 stash"],
      command: raw,
    };
  if (action === "drop") {
    if (!state.stash.length)
      return { state, output: ["No stash entries found."], error: "stash 为空。", command: raw };
    const next = cloneGitState(state);
    next.stash.pop();
    return { state: parseState(next), output: ["Dropped latest stash"], command: raw };
  }
  const result = applyGitCommand(state, `git stash ${action}`);
  return {
    state: result.state,
    output: result.output.flatMap((item) => item.split("\n")),
    error: result.error,
    command: raw,
  };
}

function runRemove(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const paths = tokens.slice(2).filter((token) => !token.startsWith("-"));
  if (!paths.length)
    return {
      state,
      output: ["error: pathspec is required"],
      error: "缺少文件路径。",
      command: raw,
    };
  const next = cloneGitState(state);
  const existing = next.workingTree.filter((file) => paths.includes(file.path));
  if (!existing.length)
    return {
      state,
      output: ["fatal: pathspec did not match any files"],
      error: "文件不存在。",
      command: raw,
    };
  next.workingTree = next.workingTree.filter((file) => !paths.includes(file.path));
  next.staging = next.staging.filter((path) => !paths.includes(path));
  return {
    state: parseState(next),
    output: existing.map((file) => `rm '${file.path}'`),
    command: raw,
  };
}

function runMove(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const paths = tokens.slice(2).filter((token) => !token.startsWith("-"));
  if (paths.length !== 2)
    return {
      state,
      output: ["error: 用法 git mv <旧路径> <新路径>"],
      error: "移动参数不完整。",
      command: raw,
    };
  const next = cloneGitState(state);
  const file = next.workingTree.find((item) => item.path === paths[0]);
  if (!file)
    return {
      state,
      output: [`fatal: '${paths[0]}' not found`],
      error: "文件不存在。",
      command: raw,
    };
  file.path = paths[1]!;
  file.status = "staged";
  next.staging = [...new Set([...next.staging.filter((path) => path !== paths[0]), paths[1]!])];
  return { state: parseState(next), output: [`Renamed ${paths[0]} -> ${paths[1]}`], command: raw };
}

function runApplied(state: TeachingGitState, command: string, raw: string): InteractiveGitResult {
  const result = applyGitCommand(state, command);
  return {
    state: result.state,
    output: result.output.flatMap((item) => item.split("\n")),
    error: result.error,
    command: raw,
  };
}

function readStatus(state: TeachingGitState, raw: string): InteractiveGitResult {
  const branch =
    state.head.kind === "detached"
      ? `HEAD detached at ${state.head.commit}`
      : `On branch ${state.head.name}`;
  const staged = state.workingTree.filter((file) => state.staging.includes(file.path));
  const changed = state.workingTree.filter(
    (file) => file.status === "modified" && !state.staging.includes(file.path),
  );
  const untracked = state.workingTree.filter((file) => file.status === "untracked");
  const output = [branch, trackingStatus(state), ""];
  if (staged.length)
    output.push(
      "Changes to be committed:",
      ...staged.map((file) => `\tnew file:   ${file.path}`),
      "",
    );
  if (changed.length)
    output.push(
      "Changes not staged for commit:",
      ...changed.map((file) => `\tmodified:   ${file.path}`),
      "",
    );
  if (untracked.length)
    output.push("Untracked files:", ...untracked.map((file) => `\t${file.path}`), "");
  if (!staged.length && !changed.length && !untracked.length) output.push("working tree clean");
  return { state, output, command: raw };
}

function trackingStatus(state: TeachingGitState): string {
  const local = state.head.commit;
  const remote = state.remoteBranches["origin/main"];
  if (!local || !remote) return "No remote tracking branch configured.";
  if (local === remote) return "Your branch is up to date with 'origin/main'.";
  const remoteIsAncestor = isAncestor(state, remote, local);
  const localIsAncestor = isAncestor(state, local, remote);
  if (remoteIsAncestor && !localIsAncestor) {
    return `Your branch is ahead of 'origin/main' by ${commitDistance(state, local, remote)} commit(s).`;
  }
  if (localIsAncestor && !remoteIsAncestor) {
    return `Your branch is behind 'origin/main' by ${commitDistance(state, remote, local)} commit(s).`;
  }
  return "Your branch and 'origin/main' have diverged.";
}

function isAncestor(state: TeachingGitState, ancestor: string, descendant: string): boolean {
  const pending = [descendant];
  const visited = new Set<string>();
  while (pending.length) {
    const current = pending.shift();
    if (!current || visited.has(current)) continue;
    if (current === ancestor) return true;
    visited.add(current);
    const commit = state.commits.find((item) => item.id === current);
    if (commit) pending.push(...commit.parents);
  }
  return false;
}

function commitDistance(state: TeachingGitState, descendant: string, ancestor: string): number {
  const pending: Array<{ id: string; distance: number }> = [{ id: descendant, distance: 0 }];
  const visited = new Set<string>();
  while (pending.length) {
    const current = pending.shift();
    if (!current || visited.has(current.id)) continue;
    if (current.id === ancestor) return current.distance;
    visited.add(current.id);
    const commit = state.commits.find((item) => item.id === current.id);
    if (commit) {
      pending.push(...commit.parents.map((id) => ({ id, distance: current.distance + 1 })));
    }
  }
  return 0;
}

function readDiff(state: TeachingGitState, raw: string): InteractiveGitResult {
  const stagedOnly = raw.includes("--staged") || raw.includes("--cached");
  const files = state.workingTree.filter((file) =>
    stagedOnly
      ? state.staging.includes(file.path)
      : file.status === "modified" || file.status === "untracked",
  );
  return {
    state,
    output: files.length
      ? files.flatMap((file) => [
          `diff --git a/${file.path} b/${file.path}`,
          `+ ${file.path} version ${file.version + 1}`,
          "",
        ])
      : ["没有未暂存差异。"],
    command: raw,
  };
}

function readLog(state: TeachingGitState, raw: string): InteractiveGitResult {
  const output = state.commits
    .slice()
    .reverse()
    .flatMap((commit) => [
      `commit ${commit.id}${commit.id === state.head.commit ? " (HEAD -> " + state.head.name + ")" : ""}`,
      `    ${commit.message}`,
      "",
    ]);
  return { state, output: output.length ? output : ["暂无提交"], command: raw };
}

function readShow(state: TeachingGitState, tokens: string[], raw: string): InteractiveGitResult {
  const ref = tokens.slice(2).find((token) => !token.startsWith("-")) ?? "HEAD";
  const id = resolveRef(state, ref);
  const commit = state.commits.find((item) => item.id === id);
  return commit
    ? {
        state,
        output: [
          `commit ${commit.id}`,
          `Parents: ${commit.parents.join(" ") || "(root)"}`,
          "",
          `    ${commit.message}`,
        ],
        command: raw,
      }
    : {
        state,
        output: [`fatal: ambiguous argument '${ref}'`],
        error: "引用不存在。",
        command: raw,
      };
}

function readRevParse(
  state: TeachingGitState,
  tokens: string[],
  raw: string,
): InteractiveGitResult {
  const ref = tokens.slice(2).find((token) => !token.startsWith("-")) ?? "HEAD";
  const id = resolveRef(state, ref);
  if (!id)
    return {
      state,
      output: [`fatal: ambiguous argument '${ref}'`],
      error: "引用不存在。",
      command: raw,
    };
  if (tokens.includes("--abbrev-ref") && ref === "HEAD")
    return { state, output: [state.head.name], command: raw };
  return { state, output: [id], command: raw };
}

function readLsFiles(state: TeachingGitState, raw: string): InteractiveGitResult {
  return {
    state,
    output: state.workingTree
      .filter((file) => file.status !== "untracked")
      .map((file) => file.path),
    command: raw,
  };
}

function readDescribe(state: TeachingGitState, raw: string): InteractiveGitResult {
  const tag = Object.entries(state.tags).find(([, commit]) => commit === state.head.commit)?.[0];
  return {
    state,
    output: [tag ? `${tag}-${state.head.commit}` : state.head.commit || "暂无提交标签"],
    command: raw,
  };
}

function readInformational(
  state: TeachingGitState,
  command: string,
  args: string[],
  raw: string,
): InteractiveGitResult {
  if (command === "blame" && args[0]) {
    return {
      state,
      output: [`A\t${state.head.commit}\t${args[0]}`, `B\t${state.head.commit}\t${args[0]}`],
      command: raw,
    };
  }
  if (command === "grep" && args[0])
    return { state, output: [`${args[0]}:README.md:1:CommandLab`], command: raw };
  if (command === "shortlog")
    return {
      state,
      output: [
        `CommandLab Learner (${state.commits.length})`,
        ...state.commits.map((commit) => `    ${commit.message}`),
      ],
      command: raw,
    };
  if (command === "worktree")
    return {
      state,
      output: [`${state.head.commit || "(empty)"} ${state.head.name} /workspace/commandlab`],
      command: raw,
    };
  if (command === "submodule") return { state, output: ["教学仓库没有子模块。"], command: raw };
  return readLog(state, raw);
}

function resolveRef(state: TeachingGitState, ref: string): string | undefined {
  if (ref === "HEAD") return state.head.commit || undefined;
  const parentMatch = /^(.*)(~|\^)(\d*)$/.exec(ref);
  if (parentMatch) {
    const base = parentMatch[1] === "HEAD" ? state.head.commit : resolveRef(state, parentMatch[1]!);
    if (!base) return undefined;
    const count = Math.max(1, Number(parentMatch[3] || 1));
    let current = base;
    for (let index = 0; index < count; index += 1) {
      const commit = state.commits.find((item) => item.id === current);
      const parent = commit?.parents[0];
      if (!parent) return undefined;
      current = parent;
    }
    return current;
  }
  const exact =
    state.branches[ref] ??
    state.tags[ref] ??
    state.remoteBranches[ref] ??
    state.commits.find((commit) => commit.id === ref)?.id;
  if (exact) return exact;
  const matches = state.commits.filter((commit) => commit.id.startsWith(ref));
  return matches.length === 1 ? matches[0]!.id : undefined;
}

function parseState(state: TeachingGitState): TeachingGitState {
  return teachingGitStateSchema.parse(state);
}

function helpLines(): string[] {
  return [
    "用法：git <命令> [参数]",
    "",
    ...interactiveGitCommands.map(
      ([name, description]) => `  git ${name.padEnd(12)} ${description}`,
    ),
    "",
    "内置：help / clear / reset（重置按钮）",
    "仿真扩展：git remote files / git remote touch <path>",
  ];
}

export function statusCounts(state: TeachingGitState) {
  return {
    changes: state.workingTree.filter((file) => file.status === "modified").length,
    staged: state.staging.length,
    untracked: state.workingTree.filter((file) => file.status === "untracked").length,
    commits: state.commits.length,
    branches: Object.keys(state.branches).length,
  };
}
