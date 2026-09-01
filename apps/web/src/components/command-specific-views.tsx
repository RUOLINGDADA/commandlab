"use client";

import {
  ArrowDown,
  ArrowRight,
  Check,
  CircleDot,
  GitBranch,
  GitCommitHorizontal,
  HardDrive,
  History,
  Network,
  Package,
  MoveRight,
  RotateCcw,
  Server,
  TerminalSquare,
  Upload,
  Waypoints,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  TeachingDockerState,
  TeachingFrame,
  TeachingGitState,
  TeachingScene,
} from "@commandlab/content-schema";

type ViewDefinition = {
  slug: string;
  label: string;
  eyebrow: string;
  layout:
    | "source-control"
    | "snapshot"
    | "pointer"
    | "switcher"
    | "merge"
    | "rebase"
    | "trees"
    | "shelf"
    | "remote"
    | "inspect"
    | "image"
    | "container"
    | "network"
    | "volume"
    | "compose"
    | "cleanup";
  accent: string;
};

const gitViews: Record<string, ViewDefinition> = {
  init: {
    slug: "init",
    label: "初始化工作区",
    eyebrow: "REPOSITORY BOOTSTRAP",
    layout: "source-control",
    accent: "mint",
  },
  status: {
    slug: "status",
    label: "检查工作区体检单",
    eyebrow: "SOURCE CONTROL CHECK",
    layout: "source-control",
    accent: "blue",
  },
  diff: {
    slug: "diff",
    label: "对照修改差异",
    eyebrow: "DIFF INSPECTOR",
    layout: "inspect",
    accent: "amber",
  },
  show: {
    slug: "show",
    label: "查看单个提交",
    eyebrow: "COMMIT INSPECTOR",
    layout: "inspect",
    accent: "blue",
  },
  grep: {
    slug: "grep",
    label: "搜索仓库文本",
    eyebrow: "TEXT SEARCH",
    layout: "inspect",
    accent: "teal",
  },
  clone: {
    slug: "clone",
    label: "复制远端仓库",
    eyebrow: "REPOSITORY CLONE",
    layout: "remote",
    accent: "blue",
  },
  mv: {
    slug: "mv",
    label: "移动已跟踪文件",
    eyebrow: "INDEX MOVE",
    layout: "snapshot",
    accent: "amber",
  },
  rm: {
    slug: "rm",
    label: "准备删除或停止跟踪",
    eyebrow: "INDEX CLEANUP",
    layout: "cleanup",
    accent: "red",
  },
  config: {
    slug: "config",
    label: "登记提交身份",
    eyebrow: "IDENTITY SETTINGS",
    layout: "inspect",
    accent: "purple",
  },
  add: {
    slug: "add",
    label: "把文件放进暂存区",
    eyebrow: "INDEX STAGING",
    layout: "snapshot",
    accent: "orange",
  },
  commit: {
    slug: "commit",
    label: "封存一个版本快照",
    eyebrow: "COMMIT SNAPSHOT",
    layout: "snapshot",
    accent: "orange",
  },
  log: {
    slug: "log",
    label: "沿时间线翻阅历史",
    eyebrow: "HISTORY TIMELINE",
    layout: "source-control",
    accent: "blue",
  },
  tag: {
    slug: "tag",
    label: "给稳定节点贴标签",
    eyebrow: "RELEASE MARKER",
    layout: "pointer",
    accent: "amber",
  },
  branch: {
    slug: "branch",
    label: "只创建一根新指针",
    eyebrow: "REF POINTER",
    layout: "pointer",
    accent: "green",
  },
  switch: {
    slug: "switch",
    label: "切换 HEAD 视角",
    eyebrow: "WORKTREE SWITCH",
    layout: "switcher",
    accent: "teal",
  },
  merge: {
    slug: "merge",
    label: "让两条历史汇合",
    eyebrow: "TWO-PARENT MERGE",
    layout: "merge",
    accent: "orange",
  },
  rebase: {
    slug: "rebase",
    label: "把提交逐个重放",
    eyebrow: "COMMIT REPLAY",
    layout: "rebase",
    accent: "purple",
  },
  "cherry-pick": {
    slug: "cherry-pick",
    label: "只摘取一个提交",
    eyebrow: "SELECTIVE REPLAY",
    layout: "rebase",
    accent: "purple",
  },
  remote: {
    slug: "remote",
    label: "登记远端地址",
    eyebrow: "REMOTE REGISTRY",
    layout: "remote",
    accent: "blue",
  },
  fetch: {
    slug: "fetch",
    label: "只取回远端信息",
    eyebrow: "REMOTE FETCH",
    layout: "remote",
    accent: "blue",
  },
  pull: {
    slug: "pull",
    label: "取回并整合远端",
    eyebrow: "REMOTE INTEGRATION",
    layout: "remote",
    accent: "teal",
  },
  push: {
    slug: "push",
    label: "把本地提交送上去",
    eyebrow: "REMOTE PUBLISH",
    layout: "remote",
    accent: "green",
  },
  restore: {
    slug: "restore",
    label: "把文件恢复到快照",
    eyebrow: "FILE RECOVERY",
    layout: "trees",
    accent: "amber",
  },
  reset: {
    slug: "reset",
    label: "移动三棵树的指针",
    eyebrow: "THREE TREES",
    layout: "trees",
    accent: "red",
  },
  revert: {
    slug: "revert",
    label: "用新提交抵消旧提交",
    eyebrow: "SAFE UNDO",
    layout: "snapshot",
    accent: "red",
  },
  stash: {
    slug: "stash",
    label: "把未完成工作收进抽屉",
    eyebrow: "TEMPORARY SHELF",
    layout: "shelf",
    accent: "teal",
  },
  clean: {
    slug: "clean",
    label: "清理未跟踪文件",
    eyebrow: "WORKTREE CLEANUP",
    layout: "cleanup",
    accent: "red",
  },
  bisect: {
    slug: "bisect",
    label: "二分定位问题提交",
    eyebrow: "BINARY SEARCH",
    layout: "source-control",
    accent: "purple",
  },
  "command-index": {
    slug: "command-index",
    label: "打开命令地图",
    eyebrow: "COMMAND INDEX",
    layout: "inspect",
    accent: "blue",
  },
};

const dockerViews: Record<string, ViewDefinition> = {
  build: {
    slug: "build",
    label: "逐层烘焙镜像",
    eyebrow: "IMAGE LAYERS",
    layout: "image",
    accent: "orange",
  },
  run: {
    slug: "run",
    label: "从镜像启动容器",
    eyebrow: "CONTAINER LAUNCH",
    layout: "container",
    accent: "green",
  },
  create: {
    slug: "create",
    label: "只创建不启动",
    eyebrow: "CONTAINER CREATE",
    layout: "container",
    accent: "blue",
  },
  start: {
    slug: "start",
    label: "启动已有容器",
    eyebrow: "PROCESS START",
    layout: "container",
    accent: "green",
  },
  stop: {
    slug: "stop",
    label: "优雅停止进程",
    eyebrow: "PROCESS STOP",
    layout: "container",
    accent: "amber",
  },
  restart: {
    slug: "restart",
    label: "停止后重新启动",
    eyebrow: "PROCESS RESTART",
    layout: "container",
    accent: "teal",
  },
  kill: {
    slug: "kill",
    label: "立即终止进程",
    eyebrow: "FORCE STOP",
    layout: "container",
    accent: "red",
  },
  rm: {
    slug: "rm",
    label: "删除容器记录",
    eyebrow: "CONTAINER REMOVE",
    layout: "cleanup",
    accent: "red",
  },
  ps: {
    slug: "ps",
    label: "查看容器值班表",
    eyebrow: "CONTAINER LIST",
    layout: "inspect",
    accent: "blue",
  },
  logs: {
    slug: "logs",
    label: "读取容器黑匣子",
    eyebrow: "LOG STREAM",
    layout: "inspect",
    accent: "purple",
  },
  exec: {
    slug: "exec",
    label: "打开容器内部入口",
    eyebrow: "SHELL ATTACH",
    layout: "container",
    accent: "teal",
  },
  inspect: {
    slug: "inspect",
    label: "打开容器档案袋",
    eyebrow: "OBJECT INSPECTOR",
    layout: "inspect",
    accent: "blue",
  },
  stats: {
    slug: "stats",
    label: "观察资源消耗",
    eyebrow: "RESOURCE TELEMETRY",
    layout: "inspect",
    accent: "amber",
  },
  image: {
    slug: "image",
    label: "盘点本地镜像",
    eyebrow: "IMAGE CATALOG",
    layout: "image",
    accent: "blue",
  },
  pull: {
    slug: "pull",
    label: "拉取镜像层",
    eyebrow: "LAYER DOWNLOAD",
    layout: "image",
    accent: "blue",
  },
  push: {
    slug: "push",
    label: "上传镜像层",
    eyebrow: "LAYER UPLOAD",
    layout: "image",
    accent: "green",
  },
  tag: {
    slug: "tag",
    label: "增加镜像别名",
    eyebrow: "IMAGE ALIAS",
    layout: "image",
    accent: "amber",
  },
  "save-load": {
    slug: "save-load",
    label: "把镜像装进文件",
    eyebrow: "IMAGE ARCHIVE",
    layout: "image",
    accent: "purple",
  },
  rmi: {
    slug: "rmi",
    label: "移除镜像引用",
    eyebrow: "IMAGE CLEANUP",
    layout: "cleanup",
    accent: "red",
  },
  prune: {
    slug: "prune",
    label: "按范围回收资源",
    eyebrow: "RESOURCE PRUNE",
    layout: "cleanup",
    accent: "red",
  },
  network: {
    slug: "network",
    label: "建立私有网络边界",
    eyebrow: "NETWORK TOPOLOGY",
    layout: "network",
    accent: "teal",
  },
  port: {
    slug: "port",
    label: "查看端口映射",
    eyebrow: "PORT BRIDGE",
    layout: "network",
    accent: "orange",
  },
  volume: {
    slug: "volume",
    label: "分离持久化数据",
    eyebrow: "PERSISTENT VOLUME",
    layout: "volume",
    accent: "purple",
  },
  compose: {
    slug: "compose",
    label: "按蓝图编排服务",
    eyebrow: "SERVICE ORCHESTRATION",
    layout: "compose",
    accent: "teal",
  },
  cp: {
    slug: "cp",
    label: "搬运容器文件",
    eyebrow: "FILE TRANSFER",
    layout: "volume",
    accent: "blue",
  },
  context: {
    slug: "context",
    label: "确认 Engine 连接目标",
    eyebrow: "ENGINE CONTEXT",
    layout: "inspect",
    accent: "blue",
  },
  info: {
    slug: "info",
    label: "读取 Engine 体检报告",
    eyebrow: "ENGINE REPORT",
    layout: "inspect",
    accent: "blue",
  },
  version: {
    slug: "version",
    label: "核对客户端与服务端",
    eyebrow: "VERSION HANDSHAKE",
    layout: "inspect",
    accent: "purple",
  },
  login: {
    slug: "login",
    label: "建立仓库认证通道",
    eyebrow: "REGISTRY AUTH",
    layout: "remote",
    accent: "green",
  },
  rename: {
    slug: "rename",
    label: "更换容器门牌",
    eyebrow: "CONTAINER LABEL",
    layout: "container",
    accent: "amber",
  },
  healthcheck: {
    slug: "healthcheck",
    label: "读取健康检查结果",
    eyebrow: "HEALTH SIGNAL",
    layout: "inspect",
    accent: "green",
  },
  "container-prune": {
    slug: "container-prune",
    label: "清理已停止容器",
    eyebrow: "CONTAINER PRUNE",
    layout: "cleanup",
    accent: "red",
  },
  "system-df": {
    slug: "system-df",
    label: "盘点 Engine 磁盘",
    eyebrow: "DISK USAGE",
    layout: "inspect",
    accent: "blue",
  },
  "compose-down": {
    slug: "compose-down",
    label: "回收 Compose 项目",
    eyebrow: "COMPOSE TEARDOWN",
    layout: "compose",
    accent: "amber",
  },
  "command-index": {
    slug: "command-index",
    label: "打开 Docker 命令地图",
    eyebrow: "COMMAND INDEX",
    layout: "inspect",
    accent: "blue",
  },
};

/** 获取命令专属视图注册项；缺失注册会明确显示迁移问题。 */
export function getCommandView(scene: TeachingScene): ViewDefinition {
  const registry = scene.tool === "git" ? gitViews : dockerViews;
  return (
    registry[scene.slug] ?? {
      slug: scene.slug,
      label: `${scene.slug} 专属舞台缺失`,
      eyebrow: "MISSING COMMAND VIEW",
      layout: "inspect",
      accent: "red",
    }
  );
}

/** 返回指定工具已登记的命令视图 slug，供内容校验和测试检查覆盖范围。 */
export function getCommandViewSlugs(tool: "git" | "docker") {
  return Object.keys(tool === "git" ? gitViews : dockerViews);
}

export function CommandSpecificStage({
  scene,
  frame,
  zoom,
}: {
  scene: TeachingScene;
  frame: TeachingFrame;
  zoom: number;
}) {
  const view = getCommandView(scene);
  return scene.tool === "git" ? (
    <GitCommandStage scene={scene} frame={frame} view={view} zoom={zoom} />
  ) : (
    <DockerCommandStage scene={scene} frame={frame} view={view} />
  );
}

function GitCommandStage({
  scene,
  frame,
  view,
  zoom,
}: {
  scene: TeachingScene;
  frame: TeachingFrame;
  view: ViewDefinition;
  zoom: number;
}) {
  const state = frame.state as TeachingGitState;
  const history = [...state.commits].reverse();
  return (
    <div
      className={`command-specific-stage command-specific-stage--git command-specific-stage--${view.slug} command-specific-stage--${view.layout} accent-${view.accent}`}
      data-command-view={view.slug}
      data-command-layout={view.layout}
    >
      <div className="git-ide-context">
        <div className="git-branch-context">
          <GitBranch size={16} />
          <span>当前分支</span>
          <strong>{state.head.name || "未初始化"}</strong>
          <em>HEAD</em>
        </div>
        <div className="git-branch-metrics">
          <span>
            <b>{branchCount(state)}</b> 分支
          </span>
          <span>
            <b>{aheadCount(state)}</b> ahead
          </span>
          <span>
            <b>0</b> behind
          </span>
        </div>
        <div className="git-ide-actions">
          <span className="git-dot git-dot--live" /> Working Tree{" "}
          {state.repositoryInitialized ? "已连接" : "待初始化"}
        </div>
      </div>
      <div className="git-ide-grid">
        <GitSourceControl state={state} history={history} frame={frame} />
        <div className="git-command-main">
          <CommandLens view={view} scene={scene} frame={frame} state={state} />
          <GitFocusBoard view={view} state={state} frame={frame} />
          <GitGraph state={state} frame={frame} zoom={zoom} />
        </div>
      </div>
    </div>
  );
}

function GitFocusBoard({
  view,
  state,
  frame,
}: {
  view: ViewDefinition;
  state: TeachingGitState;
  frame: TeachingFrame;
}) {
  const active = new Set(frame.activeIds);
  if (view.layout === "snapshot") {
    return (
      <section className="git-focus-board git-focus-board--snapshot" data-focus-board="snapshot">
        <div className="git-board-heading">
          <Package size={15} />
          <strong>
            {view.slug === "add"
              ? "暂存传送带"
              : view.slug === "revert"
                ? "反向快照"
                : "提交封存台"}
          </strong>
          <span>
            {view.slug === "add" ? "只把选择的文件放入 index" : "快照一旦进入历史，旧节点不会消失"}
          </span>
        </div>
        <div className="snapshot-lanes">
          <SnapshotLane
            label="WORKTREE"
            value={state.workingTree.map((file) => file.path).join("、") || "干净"}
            active={active.has("working-tree")}
          />
          <ArrowRight className="snapshot-arrow" size={17} />
          <SnapshotLane
            label="INDEX"
            value={state.staging.join("、") || "等待暂存"}
            active={active.has("staging") || active.size > 0}
          />
          <ArrowRight className="snapshot-arrow" size={17} />
          <SnapshotLane
            label="HISTORY"
            value={state.head.commit || "下一次 commit"}
            active={active.has("commit-create")}
          />
        </div>
      </section>
    );
  }
  if (view.layout === "pointer") {
    return (
      <section className="git-focus-board git-focus-board--pointer" data-focus-board="pointer">
        <div className="git-board-heading">
          <GitBranch size={15} />
          <strong>引用指针工作台</strong>
          <span>指针移动，不会复制提交内容</span>
        </div>
        <div className="pointer-board">
          <div className="pointer-current">
            <small>当前提交</small>
            <strong>{state.head.commit || "working tree"}</strong>
            <span>HEAD / {state.head.name || "detached"}</span>
          </div>
          <div className="pointer-list">
            {Object.entries(state.branches).map(([name, commit]) => (
              <div
                className={`pointer-item ${name === state.head.name ? "is-current" : ""}`}
                key={name}
              >
                <GitBranch size={13} />
                <code>{name}</code>
                <span>→ {commit}</span>
                {name === state.head.name ? <em>HEAD</em> : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (view.layout === "switcher") {
    return (
      <section className="git-focus-board git-focus-board--switcher" data-focus-board="switcher">
        <div className="git-board-heading">
          <MoveRight size={15} />
          <strong>HEAD 视角切换</strong>
          <span>分支位置不动，工作区观察角度改变</span>
        </div>
        <div className="switcher-board">
          <SwitchBranch
            name="main"
            commit={state.branches.main ?? "A"}
            current={state.head.name === "main"}
          />
          <MoveRight className="switcher-arrow" size={24} />
          <SwitchBranch
            name="feature"
            commit={state.branches.feature ?? "C"}
            current={state.head.name === "feature"}
          />
        </div>
      </section>
    );
  }
  if (view.layout === "merge") {
    return (
      <section className="git-focus-board git-focus-board--merge" data-focus-board="merge">
        <div className="git-board-heading">
          <GitCommitHorizontal size={15} />
          <strong>双父线汇合区</strong>
          <span>main 与 feature 的历史在一个新节点汇合</span>
        </div>
        <div className="merge-board">
          <div className="merge-lane">
            <span>main</span>
            <i className="merge-node">B</i>
          </div>
          <div className="merge-lane merge-lane--feature">
            <span>feature</span>
            <i className="merge-node">C</i>
          </div>
          <div className="merge-junction">
            <ArrowDown size={17} />
            <strong>merge</strong>
            <small>parents: B + C</small>
          </div>
          <div className="merge-result">
            <GitCommitHorizontal size={16} />
            <strong>D3</strong>
            <span>合并提交</span>
          </div>
        </div>
      </section>
    );
  }
  if (view.layout === "rebase") {
    return (
      <section className="git-focus-board git-focus-board--rebase" data-focus-board="rebase">
        <div className="git-board-heading">
          <Waypoints size={15} />
          <strong>{view.slug === "cherry-pick" ? "单提交摘取" : "提交重放队列"}</strong>
          <span>
            {view.slug === "cherry-pick"
              ? "只复制 C 的改动，不搬运整条分支"
              : "旧提交作为历史证据，新提交排队重写"}
          </span>
        </div>
        <div className="rebase-board">
          <div className="rebase-base">
            <small>NEW BASE</small>
            <strong>main · {state.branches.main ?? "B"}</strong>
          </div>
          <div className="rebase-queue">
            <span className="queue-label">REPLAY QUEUE</span>
            {["C", "C'", "D'"].map((id, index) => (
              <div
                className={`queue-item ${active.has("C") && index === 0 ? "is-active" : ""}`}
                key={id}
              >
                <b>{index + 1}</b>
                <code>{id}</code>
                <span>{index === 0 ? "修改首页" : index === 1 ? "重放提交" : "新历史节点"}</span>
              </div>
            ))}
          </div>
          <div className="rebase-result">
            <Check size={15} />
            <strong>新链路</strong>
            <span>old commits remain as evidence</span>
          </div>
        </div>
      </section>
    );
  }
  if (view.layout === "trees") {
    return (
      <section className="git-focus-board git-focus-board--trees" data-focus-board="trees">
        <div className="git-board-heading">
          <RotateCcw size={15} />
          <strong>三棵树对照台</strong>
          <span>reset/restore 改变的范围不同，逐层观察才不会误删</span>
        </div>
        <div className="trees-board">
          <TreeCard label="HEAD" value={state.head.commit || "A"} hint="历史指针" />
          <ArrowRight size={17} />
          <TreeCard label="INDEX" value={state.staging.join("、") || "空"} hint="暂存快照" />
          <ArrowRight size={17} />
          <TreeCard
            label="WORKTREE"
            value={state.workingTree.map((file) => file.status).join("、") || "clean"}
            hint="电脑里的文件"
          />
        </div>
      </section>
    );
  }
  if (view.layout === "shelf") {
    return (
      <section className="git-focus-board git-focus-board--shelf" data-focus-board="shelf">
        <div className="git-board-heading">
          <HardDrive size={15} />
          <strong>stash 抽屉</strong>
          <span>把未完成改动暂存起来，让工作区先变干净</span>
        </div>
        <div className="shelf-board">
          <div className="shelf-files">
            {state.workingTree.slice(0, 3).map((file) => (
              <span key={file.path}>
                {file.path}
                <b>{file.status}</b>
              </span>
            ))}
          </div>
          <ArrowRight size={20} className="shelf-arrow" />
          <div className="shelf-drawer">
            <HardDrive size={18} />
            <strong>{state.stash.length ? `${state.stash.length} 条 stash` : "stash@{0}"}</strong>
            <small>稍后可 pop / apply</small>
          </div>
        </div>
      </section>
    );
  }
  if (view.layout === "remote") {
    return (
      <section className="git-focus-board git-focus-board--remote" data-focus-board="remote">
        <div className="git-board-heading">
          <Upload size={15} />
          <strong>本地 / 远端双泳道</strong>
          <span>
            {view.slug === "fetch"
              ? "只更新 origin/main"
              : view.slug === "push"
                ? "把本地对象上传"
                : "传输后再决定是否整合"}
          </span>
        </div>
        <div className="remote-board">
          <div className="remote-lane">
            <small>LOCAL</small>
            <strong>{state.head.name || "main"}</strong>
            <div className="remote-commits">
              {state.commits.slice(-3).map((commit) => (
                <i key={commit.id}>{commit.id}</i>
              ))}
            </div>
          </div>
          <div className="remote-transfer">
            <Upload size={18} />
            <span>{view.slug === "fetch" ? "fetch" : view.slug === "push" ? "push" : "pull"}</span>
          </div>
          <div className="remote-lane remote-lane--origin">
            <small>REMOTE</small>
            <strong>origin/main</strong>
            <div className="remote-commits">
              {Object.values(state.remoteBranches).map((commit) => (
                <i key={commit}>{commit}</i>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="git-focus-board git-focus-board--inspect" data-focus-board="inspect">
      <div className="git-board-heading">
        <TerminalSquare size={15} />
        <strong>命令证据检查台</strong>
        <span>读取状态，不会悄悄改写提交图</span>
      </div>
      <div className="inspect-board">
        <InspectCell
          label="Repository"
          value={state.repositoryInitialized ? ".git connected" : "not initialized"}
        />
        <InspectCell label="HEAD" value={state.head.commit || "working tree"} />
        <InspectCell label="Working tree" value={`${state.workingTree.length} files`} />
        <InspectCell label="Last event" value={frame.events[0]?.detail || "diagnostic-read"} />
      </div>
    </section>
  );
}

function SnapshotLane({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className={`snapshot-lane ${active ? "is-active" : ""}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
function SwitchBranch({
  name,
  commit,
  current,
}: {
  name: string;
  commit: string;
  current: boolean;
}) {
  return (
    <div className={`switch-branch ${current ? "is-current" : ""}`}>
      <GitBranch size={15} />
      <strong>{name}</strong>
      <code>{commit}</code>
      {current ? <em>HEAD</em> : <span>目标</span>}
    </div>
  );
}
function TreeCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="tree-card">
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{hint}</span>
    </div>
  );
}
function InspectCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="inspect-cell">
      <small>{label}</small>
      <code>{value}</code>
    </div>
  );
}

function GitSourceControl({
  state,
  history,
  frame,
}: {
  state: TeachingGitState;
  history: TeachingGitState["commits"];
  frame: TeachingFrame;
}) {
  const staged = new Set(state.staging);
  const changes = state.workingTree.filter((file) => file.status === "modified");
  const untracked = state.workingTree.filter((file) => file.status === "untracked");
  return (
    <aside className="git-source-control" aria-label="VS Code 风格 Git 源代码管理">
      <div className="git-source-heading">
        <span>SOURCE CONTROL</span>
        <strong>{changes.length + untracked.length + staged.size}</strong>
      </div>
      <div className="git-source-section git-source-section--branch">
        <div className="git-source-section-title">
          <GitBranch size={14} /> 分支
        </div>
        {Object.entries(state.branches).map(([name, commit]) => (
          <div
            className={`git-branch-row ${name === state.head.name ? "is-current" : ""}`}
            key={name}
          >
            <CircleDot size={13} />
            <span>{name}</span>
            <code>{commit}</code>
            {name === state.head.name ? <em>当前</em> : null}
          </div>
        ))}
      </div>
      <ChangeGroup title="STAGED CHANGES" count={staged.size} tone="staged">
        {Array.from(staged).map((path) => (
          <FileRow key={path} path={path} status="M" active={frame.activeIds.includes(path)} />
        ))}
      </ChangeGroup>
      <ChangeGroup title="CHANGES" count={changes.length} tone="modified">
        {changes.map((file) => (
          <FileRow
            key={file.path}
            path={file.path}
            status="M"
            active={frame.activeIds.includes(file.path)}
          />
        ))}
      </ChangeGroup>
      <ChangeGroup title="UNTRACKED" count={untracked.length} tone="untracked">
        {untracked.map((file) => (
          <FileRow
            key={file.path}
            path={file.path}
            status="U"
            active={frame.activeIds.includes(file.path)}
          />
        ))}
      </ChangeGroup>
      <div className="git-source-section git-history-mini">
        <div className="git-source-section-title">
          <History size={14} /> COMMITS
        </div>
        {history.slice(0, 6).map((commit) => (
          <div
            className={`git-history-row ${commit.id === state.head.commit ? "is-head" : ""}`}
            key={commit.id}
          >
            <span className="git-history-node" />
            <div>
              <strong>{commit.message}</strong>
              <small>
                {commit.id} · {commit.lane}
              </small>
            </div>
          </div>
        ))}
        {history.length === 0 ? (
          <p className="git-empty">还没有提交，先运行 init / commit。</p>
        ) : null}
      </div>
    </aside>
  );
}

function ChangeGroup({
  title,
  count,
  tone,
  children,
}: {
  title: string;
  count: number;
  tone: string;
  children: ReactNode;
}) {
  return (
    <section className={`git-change-group git-change-group--${tone}`}>
      <div className="git-source-section-title">
        <span>{title}</span>
        <b>{count}</b>
      </div>
      {count ? children : <p className="git-empty">没有文件</p>}
    </section>
  );
}

function FileRow({ path, status, active }: { path: string; status: string; active: boolean }) {
  return (
    <div className={`git-file-row ${active ? "is-active" : ""}`}>
      <span className="git-file-icon">{status}</span>
      <code>{path}</code>
      <span className="git-file-action">···</span>
    </div>
  );
}

function CommandLens({
  view,
  scene,
  frame,
  state,
}: {
  view: ViewDefinition;
  scene: TeachingScene;
  frame: TeachingFrame;
  state: TeachingGitState;
}) {
  const icon =
    view.layout === "merge" ? (
      <GitCommitHorizontal />
    ) : view.layout === "rebase" ? (
      <Waypoints />
    ) : view.layout === "remote" ? (
      <Upload />
    ) : view.layout === "trees" ? (
      <RotateCcw />
    ) : view.layout === "shelf" ? (
      <HardDrive />
    ) : view.layout === "pointer" ? (
      <GitBranch />
    ) : view.layout === "snapshot" ? (
      <Package />
    ) : (
      <TerminalSquare />
    );
  return (
    <section className="command-lens">
      <div className="command-lens-icon">{icon}</div>
      <div className="command-lens-copy">
        <span>{view.eyebrow}</span>
        <h2>{view.label}</h2>
        <p>{scene.metaphor}</p>
      </div>
      <div className="command-lens-state">
        <small>当前阶段</small>
        <strong>{phaseLabel(frame.phase)}</strong>
        <code>
          {state.head.name
            ? `${state.head.name} @ ${state.head.commit || "working tree"}`
            : "未初始化"}
        </code>
      </div>
      <div className="command-lens-steps">
        <LensStep index="01" label="对象" value={objectLabel(view.layout)} />
        <LensStep index="02" label="动作" value={actionLabel(view.slug)} />
        <LensStep index="03" label="结果" value={resultLabel(view.slug, state)} />
      </div>
    </section>
  );
}

function LensStep({ index, label, value }: { index: string; label: string; value: string }) {
  return (
    <div className="lens-step">
      <span>{index}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function GitGraph({
  state,
  frame,
  zoom,
}: {
  state: TeachingGitState;
  frame: TeachingFrame;
  zoom: number;
}) {
  const positions = graphPositions(state);
  const active = new Set(frame.activeIds);
  return (
    <section className="git-graph-panel">
      <div className="git-graph-toolbar">
        <div>
          <span className="git-graph-kicker">GIT GRAPH</span>
          <strong>提交历史 / 引用关系</strong>
        </div>
        <div className="git-graph-legend">
          <span>
            <i className="legend-dot legend-dot--head" /> HEAD
          </span>
          <span>
            <i className="legend-dot legend-dot--branch" /> 分支
          </span>
          <span>
            <i className="legend-dot legend-dot--remote" /> 远端
          </span>
        </div>
      </div>
      <div className="git-graph-scroll">
        <svg
          className="git-graph-svg"
          viewBox="0 0 860 410"
          role="img"
          aria-label="提交节点、分支和 HEAD 的 Git Graph"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          <line x1="34" x2="826" y1="205" y2="205" className="git-graph-baseline" />
          {state.commits.map((commit) =>
            commit.parents.map((parent) => {
              const from = positions[parent];
              const to = positions[commit.id];
              return from && to ? (
                <path
                  className={`git-graph-edge ${active.has(commit.id) || active.has(parent) ? "is-active" : ""}`}
                  d={`M ${from.x} ${from.y} C ${(from.x + to.x) / 2} ${from.y}, ${(from.x + to.x) / 2} ${to.y}, ${to.x} ${to.y}`}
                  key={`${parent}-${commit.id}`}
                />
              ) : null;
            }),
          )}
          {state.commits.map((commit) => {
            const position = positions[commit.id]!;
            return (
              <g
                className={`git-graph-commit ${active.has(commit.id) ? "is-active" : ""} ${state.head.commit === commit.id ? "is-head" : ""}`}
                key={commit.id}
                transform={`translate(${position.x} ${position.y})`}
              >
                <circle r="22" />
                <text textAnchor="middle" dy="5">
                  {commit.id}
                </text>
                <text className="git-graph-message" x="-28" y="46">
                  {commit.message}
                </text>
              </g>
            );
          })}
          {Object.entries(state.branches).map(([name, commit]) => {
            const p = positions[commit];
            return p ? (
              <g
                className={`git-graph-ref ${name === state.head.name ? "is-current" : ""}`}
                key={name}
                transform={`translate(${p.x} ${p.y - 42})`}
              >
                <rect width={Math.max(76, name.length * 9 + 24)} height="24" rx="5" />
                <text x={Math.max(38, (name.length * 9 + 24) / 2)} y="16" textAnchor="middle">
                  {name}
                </text>
              </g>
            ) : null;
          })}
          {state.head.commit && positions[state.head.commit] ? (
            <g
              className="git-graph-head"
              transform={`translate(${positions[state.head.commit]!.x} ${positions[state.head.commit]!.y + 35})`}
            >
              <path d="M 0 0 l 10 9 l -10 9 l -10 -9 z" />
              <text x="18" y="14">
                HEAD → {state.head.name || "detached"}
              </text>
            </g>
          ) : null}
          {Object.entries(state.remoteBranches).map(([name, commit]) => {
            const p = positions[commit];
            return p ? (
              <g
                className="git-graph-remote"
                key={name}
                transform={`translate(${p.x} ${p.y + 36})`}
              >
                <rect width="112" height="22" rx="4" />
                <text x="56" y="15" textAnchor="middle">
                  {name}
                </text>
              </g>
            ) : null;
          })}
          {!state.commits.length ? (
            <text x="430" y="210" textAnchor="middle" className="git-graph-empty">
              提交后，节点会从这里开始出现
            </text>
          ) : null}
        </svg>
      </div>
      <div className="git-graph-footer">
        <span>
          <b>{state.commits.length}</b> commits
        </span>
        <span>
          <b>{Object.keys(state.branches).length}</b> branches
        </span>
        <span>
          当前 HEAD：<code>{state.head.commit || "working tree"}</code>
        </span>
      </div>
    </section>
  );
}

function DockerCommandStage({
  scene,
  frame,
  view,
}: {
  scene: TeachingScene;
  frame: TeachingFrame;
  view: ViewDefinition;
}) {
  const state = frame.state as TeachingDockerState;
  return (
    <div
      className={`command-specific-stage command-specific-stage--docker command-specific-stage--${view.slug} command-specific-stage--${view.layout} accent-${view.accent}`}
      data-command-view={view.slug}
      data-command-layout={view.layout}
    >
      <div className="docker-command-header">
        <div className="docker-command-icon">
          <DockerIcon layout={view.layout} />
        </div>
        <div>
          <span>{view.eyebrow}</span>
          <h2>{view.label}</h2>
          <p>{scene.metaphor}</p>
        </div>
        <div className="docker-object-count">
          <strong>{state.containers.length + state.images.length + state.volumes.length}</strong>
          <small>对象快照</small>
        </div>
      </div>
      <div className="docker-specific-grid">
        <DockerFocus view={view} state={state} frame={frame} />
        <DockerInventory state={state} frame={frame} />
      </div>
    </div>
  );
}

function DockerFocus({
  view,
  state,
  frame,
}: {
  view: ViewDefinition;
  state: TeachingDockerState;
  frame: TeachingFrame;
}) {
  const cards =
    view.layout === "image"
      ? [
          { label: "镜像层", value: `${state.images.length || 0} 层`, icon: <Package /> },
          {
            label: "传输",
            value:
              view.slug === "push" ? "上传仓库" : view.slug === "pull" ? "下载仓库" : "本地组装",
            icon: <ArrowDown />,
          },
        ]
      : view.layout === "network"
        ? [
            {
              label: "网络边界",
              value: state.networks.join(" / ") || "app-net",
              icon: <Network />,
            },
            {
              label: "端口",
              value: state.ports.length
                ? `${state.ports[0]!.host} → ${state.ports[0]!.container}`
                : "未映射",
              icon: <ArrowRight />,
            },
          ]
        : view.layout === "volume"
          ? [
              {
                label: "数据归属",
                value: state.volumes.length ? "独立于容器" : "等待挂载",
                icon: <HardDrive />,
              },
              { label: "容量", value: `${state.volumes[0]?.bytes ?? 0} B`, icon: <Package /> },
            ]
          : view.layout === "compose"
            ? [
                { label: "服务", value: "web + db", icon: <Waypoints /> },
                { label: "依赖", value: "network → volume", icon: <Network /> },
              ]
            : [
                { label: "容器进程", value: state.containers[0]?.status ?? "无", icon: <Server /> },
                {
                  label: "镜像来源",
                  value: state.containers[0]?.image ?? "nginx:latest",
                  icon: <Package />,
                },
              ];
  return (
    <section className="docker-focus">
      <div className="docker-focus-title">
        <span>专属对象舞台</span>
        <strong>{view.label}</strong>
      </div>
      <div className="docker-focus-cards">
        {cards.map((card) => (
          <div className="docker-focus-card" key={card.label}>
            {card.icon}
            <small>{card.label}</small>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>
      <div className="docker-progress-track">
        <span
          style={{
            width:
              frame.phase === "settled"
                ? "100%"
                : frame.phase === "transitioning"
                  ? "68%"
                  : frame.phase === "executing"
                    ? "38%"
                    : "8%",
          }}
        />
      </div>
      <p className="docker-focus-narration">{frame.narration}</p>
    </section>
  );
}

function DockerInventory({ state, frame }: { state: TeachingDockerState; frame: TeachingFrame }) {
  return (
    <section className="docker-inventory">
      <div className="docker-inventory-title">
        <span>ENGINE SNAPSHOT</span>
        <em>{phaseLabel(frame.phase)}</em>
      </div>
      <InventoryRow
        label="Images"
        value={state.images.map((item) => `${item.name} · ${item.status}`).join("、") || "空"}
        active={frame.activeIds.includes("image")}
      />
      <InventoryRow
        label="Containers"
        value={state.containers.map((item) => `${item.name} · ${item.status}`).join("、") || "空"}
        active={frame.activeIds.includes("container")}
      />
      <InventoryRow
        label="Networks"
        value={state.networks.join("、") || "无网络"}
        active={frame.activeIds.includes("network")}
      />
      <InventoryRow
        label="Volumes"
        value={state.volumes.map((item) => `${item.name} · ${item.bytes}B`).join("、") || "无卷"}
        active={frame.activeIds.includes("volume")}
      />
      <InventoryRow
        label="Ports"
        value={
          state.ports.map((port) => `${port.host}:${port.container} → ${port.target}`).join("、") ||
          "无映射"
        }
        active={frame.activeIds.includes("port")}
      />
    </section>
  );
}

function InventoryRow({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className={`docker-inventory-row ${active ? "is-active" : ""}`}>
      <span>{label}</span>
      <code>{value}</code>
      <Check size={14} />
    </div>
  );
}

function DockerIcon({ layout }: { layout: ViewDefinition["layout"] }) {
  return layout === "network" ? (
    <Network />
  ) : layout === "volume" ? (
    <HardDrive />
  ) : layout === "image" ? (
    <Package />
  ) : layout === "container" ? (
    <Server />
  ) : layout === "compose" ? (
    <Waypoints />
  ) : (
    <TerminalSquare />
  );
}

function graphPositions(state: TeachingGitState): Record<string, { x: number; y: number }> {
  const result: Record<string, { x: number; y: number }> = {};
  state.commits.forEach((commit, index) => {
    const lane =
      commit.lane === "feature"
        ? 285
        : commit.lane === "replay"
          ? 125
          : commit.lane === "remote"
            ? 350
            : 205;
    result[commit.id] = { x: 86 + index * 118, y: lane };
  });
  return result;
}

function branchCount(state: TeachingGitState) {
  return Object.keys(state.branches).length;
}
function aheadCount(state: TeachingGitState) {
  return state.head.commit ? Math.max(0, state.commits.length - 1) : 0;
}
function objectLabel(layout: ViewDefinition["layout"]) {
  return {
    "source-control": "工作区 + 历史",
    snapshot: "暂存快照",
    pointer: "引用指针",
    switcher: "HEAD + 工作区",
    merge: "双父提交",
    rebase: "重放队列",
    trees: "HEAD / index / 文件",
    shelf: "stash 抽屉",
    remote: "本地 / 远端",
    inspect: "状态证据",
    image: "镜像层",
    container: "容器进程",
    network: "网络边界",
    volume: "持久化数据",
    compose: "服务蓝图",
    cleanup: "待回收对象",
  }[layout];
}
function actionLabel(slug: string) {
  return (
    (
      {
        add: "stage file",
        commit: "seal snapshot",
        branch: "create ref",
        switch: "move HEAD",
        merge: "join parents",
        rebase: "replay commits",
        reset: "move trees",
        stash: "shelve changes",
        fetch: "download refs",
        pull: "integrate",
        push: "publish objects",
        run: "start process",
        build: "bake layers",
        compose: "orchestrate",
      } as Record<string, string>
    )[slug] ?? slug
  );
}
function resultLabel(slug: string, state: TeachingGitState) {
  return slug === "branch"
    ? "提交不变"
    : slug === "switch"
      ? `HEAD → ${state.head.name}`
      : slug === "merge"
        ? "新双父节点"
        : slug === "rebase"
          ? "新链路"
          : slug === "reset"
            ? "指针已回退"
            : slug === "stash"
              ? "工作区变干净"
              : state.head.commit || "可观察状态";
}
function phaseLabel(phase: TeachingFrame["phase"]) {
  return {
    idle: "准备",
    typing: "自动输入",
    executing: "执行命令",
    transitioning: "状态变化",
    settled: "完成",
  }[phase];
}
