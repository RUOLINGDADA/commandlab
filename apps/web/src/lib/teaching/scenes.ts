import {
  teachingDockerStateSchema,
  teachingFrameSchema,
  teachingSceneSchema,
  type AnimationKind,
  type ReferenceEntry,
  type TeachingDockerState,
  type TeachingGitState,
} from "@commandlab/content-schema";
import { applyGitCommand, createGitTransitionState, createInitialGitState } from "./git-engine";
import type { TeachingTimeline } from "./types";

type ReferenceSeed = Pick<ReferenceEntry, "tool" | "slug" | "title" | "syntax" | "summary"> & {};

const gitProfiles: Record<
  string,
  {
    command: string;
    kind: AnimationKind;
    includeFeature?: boolean;
    includeRemote?: boolean;
    headBranch?: "main" | "feature";
    includeStaged?: boolean;
    metaphor: string;
  }
> = {
  init: {
    command: "git init",
    kind: "workspace",
    metaphor: "把普通文件夹变成有版本记忆的工作台。",
  },
  status: {
    command: "git status",
    kind: "diagnostic",
    metaphor: "像给工作区做体检，先看哪些文件有变化。",
  },
  diff: { command: "git diff", kind: "workspace", metaphor: "像打开修改前后的逐行对照灯。" },
  config: {
    command: 'git config user.name "CommandLab Learner"',
    kind: "workspace",
    metaphor: "给提交盖章前，先登记是谁在操作。",
  },
  add: {
    command: "git add README.md",
    kind: "staging",
    metaphor: "把选中的文件放入下一次提交的待寄清单。",
  },
  commit: {
    command: 'git commit -m "保存首页改动"',
    kind: "commit",
    includeStaged: true,
    metaphor: "把暂存快照封装成一个可以回看的时间点。",
  },
  log: {
    command: "git log --oneline",
    kind: "history",
    metaphor: "按时间线翻阅提交和它们的父子关系。",
  },
  tag: {
    command: "git tag v1.0",
    kind: "history",
    metaphor: "给某个稳定提交贴一个不会漂移的标签。",
  },
  branch: {
    command: "git branch feature",
    kind: "branch",
    metaphor: "只创建一根新指针，不复制任何提交。",
  },
  switch: {
    command: "git switch feature",
    kind: "branch",
    includeFeature: true,
    metaphor: "让 HEAD 和工作区视角切到另一条路线。",
  },
  merge: {
    command: "git merge feature",
    kind: "merge",
    includeFeature: true,
    metaphor: "把功能分支的历史汇入当前分支并保留双亲。",
  },
  rebase: {
    command: "git rebase main",
    kind: "rebase",
    includeFeature: true,
    headBranch: "feature",
    metaphor: "把功能提交逐个重放到最新主线底稿。",
  },
  "cherry-pick": {
    command: "git cherry-pick C",
    kind: "history",
    includeFeature: true,
    metaphor: "只摘取一个提交的改动，复制成当前分支的新节点。",
  },
  remote: {
    command: "git remote add origin https://example.com/repo.git",
    kind: "remote",
    includeRemote: true,
    metaphor: "为本地仓库登记一个共享远端地址。",
  },
  fetch: {
    command: "git fetch origin",
    kind: "remote",
    includeRemote: true,
    metaphor: "取回远端对象和引用，但不动当前工作分支。",
  },
  pull: {
    command: "git pull origin main",
    kind: "remote",
    includeRemote: true,
    metaphor: "先取回远端变化，再把它整合到当前分支。",
  },
  push: {
    command: "git push origin main",
    kind: "remote",
    includeRemote: true,
    metaphor: "把本地提交沿通道送到共享远端。",
  },
  restore: {
    command: "git restore README.md",
    kind: "recovery",
    metaphor: "从最近提交取回文件，撤销未暂存改动。",
  },
  reset: {
    command: "git reset --hard A",
    kind: "recovery",
    metaphor: "把指针、暂存区和工作区一起退回旧快照。",
  },
  revert: {
    command: "git revert B",
    kind: "recovery",
    metaphor: "保留旧记录，用一笔新的反向提交抵消影响。",
  },
  stash: {
    command: "git stash push",
    kind: "recovery",
    metaphor: "把未完成工作收进抽屉，暂时还原干净工作区。",
  },
  clean: {
    command: "git clean -f",
    kind: "cleanup",
    metaphor: "清理未跟踪文件，释放工作区中没有版本记录的角落。",
  },
  bisect: {
    command: "git bisect start",
    kind: "diagnostic",
    metaphor: "用二分法缩小范围，找出最早引入问题的提交。",
  },
  "command-index": {
    command: "git help",
    kind: "workspace",
    metaphor: "打开命令地图，先找到适合当前问题的入口。",
  },
};

const dockerProfiles: Record<
  string,
  { command: string; kind: AnimationKind; output: string; metaphor: string }
> = {
  build: {
    command: "docker build -t demo:latest .",
    kind: "image",
    output: "Successfully built demo:latest",
    metaphor: "按 Dockerfile 把上下文逐层烘焙成镜像。",
  },
  run: {
    command: "docker run --name web -p 8080:80 nginx",
    kind: "container",
    output: "container web started",
    metaphor: "用镜像模板创建并启动一个可观察的容器实例。",
  },
  create: {
    command: "docker create --name web nginx",
    kind: "container",
    output: "container web created",
    metaphor: "先登记容器配置，进程还没有开始运行。",
  },
  start: {
    command: "docker start web",
    kind: "container",
    output: "web",
    metaphor: "让已经创建的容器重新进入运行状态。",
  },
  stop: {
    command: "docker stop web",
    kind: "container",
    output: "web",
    metaphor: "结束主进程，但保留容器记录供以后启动。",
  },
  restart: {
    command: "docker restart web",
    kind: "container",
    output: "web",
    metaphor: "先停止再启动同一个容器，配置和卷仍然保留。",
  },
  kill: {
    command: "docker kill web",
    kind: "container",
    output: "web",
    metaphor: "直接终止容器进程，不等待应用优雅退出。",
  },
  rm: {
    command: "docker rm web",
    kind: "cleanup",
    output: "web",
    metaphor: "删除容器记录，镜像和独立卷不随之消失。",
  },
  ps: {
    command: "docker ps",
    kind: "diagnostic",
    output: "CONTAINER ID   IMAGE   STATUS",
    metaphor: "查看当前容器值班表和运行状态。",
  },
  logs: {
    command: "docker logs web",
    kind: "diagnostic",
    output: "server listening on :80",
    metaphor: "从容器黑匣子读取主进程输出。",
  },
  exec: {
    command: "docker exec -it web sh",
    kind: "container",
    output: "/ #",
    metaphor: "在正在运行的容器内部打开一个临时操作入口。",
  },
  inspect: {
    command: "docker inspect web",
    kind: "diagnostic",
    output: "Mounts · NetworkSettings · State",
    metaphor: "打开容器档案袋，核对配置和真实状态。",
  },
  stats: {
    command: "docker stats web",
    kind: "diagnostic",
    output: "CPU 0.4%   MEM 12MiB",
    metaphor: "连续观察容器资源消耗，找到异常负载。",
  },
  image: {
    command: "docker image ls",
    kind: "image",
    output: "REPOSITORY   TAG   IMAGE ID",
    metaphor: "列出本地镜像和标签指向的内容。",
  },
  pull: {
    command: "docker pull nginx:latest",
    kind: "image",
    output: "Downloaded newer image for nginx:latest",
    metaphor: "从仓库拉取缺少的镜像层并在本地组装。",
  },
  push: {
    command: "docker push demo:latest",
    kind: "image",
    output: "latest: pushed",
    metaphor: "把本地镜像层上传到共享仓库。",
  },
  tag: {
    command: "docker tag nginx demo:latest",
    kind: "image",
    output: "tag demo:latest created",
    metaphor: "给同一个镜像摘要增加一个可读别名。",
  },
  "save-load": {
    command: "docker save nginx -o nginx.tar",
    kind: "image",
    output: "image archive written",
    metaphor: "把镜像层打包成文件，再从文件恢复。",
  },
  rmi: {
    command: "docker rmi demo:latest",
    kind: "cleanup",
    output: "Untagged: demo:latest",
    metaphor: "移除镜像引用，只有不再被使用的层才会释放。",
  },
  prune: {
    command: "docker system prune",
    kind: "cleanup",
    output: "Total reclaimed space: 128MB",
    metaphor: "按范围清理无用资源，先确认不会误删仍需对象。",
  },
  network: {
    command: "docker network create app-net",
    kind: "network",
    output: "app-net",
    metaphor: "建立容器之间可以互相找到的私有网络边界。",
  },
  port: {
    command: "docker port web 80",
    kind: "network",
    output: "0.0.0.0:8080",
    metaphor: "把容器端口映射关系翻译成主机可访问地址。",
  },
  volume: {
    command: "docker volume create app-data",
    kind: "volume",
    output: "app-data",
    metaphor: "创建独立存储，让数据脱离容器生命周期。",
  },
  compose: {
    command: "docker compose up -d",
    kind: "compose",
    output: "Container db Started\nContainer web Started",
    metaphor: "按一张蓝图准备网络、卷和服务依赖。",
  },
  cp: {
    command: "docker cp web:/etc/nginx/nginx.conf ./nginx.conf",
    kind: "volume",
    output: "copied 1 file",
    metaphor: "在主机和容器文件系统之间搬运文件。",
  },
  context: {
    command: "docker context ls",
    kind: "workspace",
    output: "default *   desktop-linux",
    metaphor: "确认 CLI 当前连接的是哪一个 Docker Engine。",
  },
  info: {
    command: "docker info",
    kind: "diagnostic",
    output: "Containers · Images · Server Version",
    metaphor: "读取 Engine 全局体检报告。",
  },
  version: {
    command: "docker version",
    kind: "diagnostic",
    output: "Client · Server",
    metaphor: "分别确认客户端与服务端版本是否匹配。",
  },
  login: {
    command: "docker login registry.example.com",
    kind: "remote",
    output: "Login Succeeded",
    metaphor: "建立访问镜像仓库所需的认证通道。",
  },
  rename: {
    command: "docker rename web frontend",
    kind: "container",
    output: "frontend",
    metaphor: "只更换容器门牌，不改变镜像和文件内容。",
  },
  healthcheck: {
    command: "docker inspect --format '{{.State.Health.Status}}' web",
    kind: "diagnostic",
    output: "healthy",
    metaphor: "读取健康检查结果，确认服务是否真的可用。",
  },
  "command-index": {
    command: "docker --help",
    kind: "workspace",
    output: "Management Commands · Commands",
    metaphor: "打开 Docker 命令地图，找到下一步工具。",
  },
};

function gitTimeline(seed: ReferenceSeed): TeachingTimeline {
  const profile = gitProfiles[seed.slug];
  if (!profile) throw new Error(`缺少 Git 教学场景：${seed.slug}`);
  const initialOptions: {
    initialized: boolean;
    includeFeature?: boolean;
    includeRemote?: boolean;
    headBranch?: "main" | "feature";
    includeStaged?: boolean;
  } = { initialized: seed.slug !== "init" };
  if (profile.includeFeature !== undefined) initialOptions.includeFeature = profile.includeFeature;
  if (profile.includeRemote !== undefined) initialOptions.includeRemote = profile.includeRemote;
  if (profile.headBranch !== undefined) initialOptions.headBranch = profile.headBranch;
  if (profile.includeStaged !== undefined) initialOptions.includeStaged = profile.includeStaged;
  const initial = createInitialGitState(initialOptions);
  const result = applyGitCommand(initial, profile.command);
  const finalState = result.state;
  const transitionState = createGitTransitionState(initial, finalState, profile.command);
  const typedFrames = [0.2, 0.45, 0.7, 1].map((progress, index) =>
    makeFrame(
      seed,
      profile,
      "typing",
      profile.command.slice(0, Math.max(1, Math.ceil(profile.command.length * progress))),
      initial,
      [],
      [index === 3 ? "命令输入完成，等待执行" : "终端正在逐字输入命令"],
      index === 3 ? "finish-typing" : "type-command",
      850,
    ),
  );
  const frames = [
    makeFrame(seed, profile, "idle", "", initial, [], ["准备教学仓库"], "hold-initial", 900),
    ...typedFrames,
    makeFrame(
      seed,
      profile,
      "executing",
      profile.command,
      initial,
      result.events,
      result.output,
      "highlight-command",
      1400,
    ),
    makeFrame(
      seed,
      profile,
      "transitioning",
      profile.command,
      transitionState,
      result.events,
      result.output,
      result.events[0]?.type || "state-transition",
      2400,
    ),
    makeFrame(
      seed,
      profile,
      "settled",
      profile.command,
      finalState,
      result.events,
      result.output,
      "settle-state",
      1800,
    ),
  ];
  const scene = teachingSceneSchema.parse({
    id: `git-${seed.slug}`,
    tool: "git",
    slug: seed.slug,
    title: seed.title,
    command: profile.command,
    kind: profile.kind,
    metaphor: profile.metaphor,
    initialState: initial,
    frames,
    finalState,
  });
  return { scene, frames };
}

function makeFrame(
  seed: ReferenceSeed,
  profile: { command: string; metaphor: string },
  phase: "idle" | "typing" | "executing" | "transitioning" | "settled",
  commandText: string,
  state: TeachingGitState,
  events: TeachingEventLike[],
  output: string[],
  transition: string,
  duration: number,
) {
  const phaseCopy = {
    idle: "先看见命令将要操作的对象。",
    typing: "终端正在自动输入，画布暂时保持原状态。",
    executing: "命令已输入，教学引擎正在处理对象关系。",
    transitioning: "前后状态差异沿着对象路径展开。",
    settled: "命令完成，最终状态可以逐项核对。",
  }[phase];
  return teachingFrameSchema.parse({
    id: `${seed.tool}-${seed.slug}-${phase}-${commandText.length}`,
    phase,
    commandText,
    terminalLines: output,
    state,
    events,
    activeIds: events.map((item) => item.subject),
    narration: `${phaseCopy}${profile.metaphor}`,
    transition,
    duration,
  });
}

type TeachingEventLike = { type: string; subject: string; detail: string };

function dockerInitial(slug: string): TeachingDockerState {
  return teachingDockerStateSchema.parse({
    tool: "docker",
    images: [{ id: "img-nginx", name: "nginx:latest", status: "local" }],
    containers: [
      {
        id: "ctr-web",
        name: "web",
        image: "nginx:latest",
        status: ["stop", "kill", "rm"].includes(slug) ? "running" : "stopped",
      },
    ],
    networks: [],
    volumes: [],
    ports: [],
  });
}

function dockerTimeline(seed: ReferenceSeed): TeachingTimeline {
  const profile = dockerProfiles[seed.slug];
  if (!profile) throw new Error(`缺少 Docker 教学场景：${seed.slug}`);
  const initial = dockerInitial(seed.slug);
  const final = structuredClone(initial);
  if (["run", "start", "restart"].includes(seed.slug)) final.containers[0]!.status = "running";
  if (["stop", "kill"].includes(seed.slug)) final.containers[0]!.status = "stopped";
  if (seed.slug === "rm") final.containers[0]!.status = "removed";
  if (["pull", "push", "build", "tag"].includes(seed.slug))
    final.images[0]!.status = seed.slug === "push" ? "pushed" : "local";
  if (["network", "compose"].includes(seed.slug)) final.networks = ["app-net"];
  if (["volume", "compose"].includes(seed.slug))
    final.volumes = [{ name: "app-data", attachedTo: ["web"], bytes: 4096 }];
  if (seed.slug === "port" || seed.slug === "run")
    final.ports = [{ host: 8080, container: 80, target: "web" }];
  const typedFrames = [0.2, 0.45, 0.7, 1].map((progress, index) =>
    dockerFrame(
      seed,
      profile,
      "typing",
      profile.command.slice(0, Math.max(1, Math.ceil(profile.command.length * progress))),
      initial,
      [],
      index === 3 ? "finish-typing" : "type-command",
      850,
    ),
  );
  const events = [
    {
      type: dockerEventType(seed.slug),
      subject: seed.slug,
      detail: `${profile.metaphor} 当前画布会把 ${seed.slug} 的对象变化单独高亮。`,
    },
  ];
  const frames = [
    dockerFrame(seed, profile, "idle", "", initial, [], "hold-initial", 900),
    ...typedFrames,
    dockerFrame(
      seed,
      profile,
      "executing",
      profile.command,
      initial,
      events,
      "highlight-command",
      1400,
    ),
    dockerFrame(
      seed,
      profile,
      "transitioning",
      profile.command,
      final,
      events,
      "state-transition",
      2400,
    ),
    dockerFrame(seed, profile, "settled", profile.command, final, events, "settle-state", 1700),
  ];
  const scene = teachingSceneSchema.parse({
    id: `docker-${seed.slug}`,
    tool: "docker",
    slug: seed.slug,
    title: seed.title,
    command: profile.command,
    kind: profile.kind,
    metaphor: profile.metaphor,
    initialState: initial,
    frames,
    finalState: final,
  });
  return { scene, frames };
}

function dockerFrame(
  seed: ReferenceSeed,
  profile: { command: string; metaphor: string; output: string },
  phase: "idle" | "typing" | "executing" | "transitioning" | "settled",
  commandText: string,
  state: TeachingDockerState,
  events: TeachingEventLike[],
  transition: string,
  duration: number,
) {
  const copy = {
    idle: "先盘点 Engine 中已有的对象。",
    typing: "终端正在自动输入，容器和镜像保持原位。",
    executing: "命令已输入，Engine 开始处理请求。",
    transitioning: "对象沿着生命周期路径移动。",
    settled: "最终状态已经稳定，可以检查每个对象。",
  }[phase];
  return teachingFrameSchema.parse({
    id: `${seed.tool}-${seed.slug}-${phase}-${commandText.length}`,
    phase,
    commandText,
    terminalLines: phase === "idle" ? [] : profile.output.split("\n"),
    state,
    events,
    activeIds: events.map((item) => item.subject),
    narration: `${copy}${profile.metaphor}`,
    transition,
    duration,
  });
}

function dockerEventType(slug: string): TeachingEventLike["type"] {
  if (["run", "create", "start", "stop", "restart", "kill", "rm", "rename", "exec"].includes(slug))
    return "container-lifecycle";
  if (["network", "port"].includes(slug)) return "network-connect";
  if (["volume", "cp"].includes(slug)) return "volume-mount";
  if (slug === "compose") return "compose-orchestrate";
  if (["prune", "rmi"].includes(slug)) return "cleanup-remove";
  if (["build", "pull", "push", "tag", "image", "save-load"].includes(slug)) return "image-layer";
  return "diagnostic-read";
}

/** 从百科条目构建完整教学场景，供静态路由和测试共用。 */
export function buildTeachingTimeline(entry: ReferenceSeed): TeachingTimeline {
  return entry.tool === "git" ? gitTimeline(entry) : dockerTimeline(entry);
}

export function buildTeachingRegistry(entries: ReferenceSeed[]): Map<string, TeachingTimeline> {
  const registry = new Map<string, TeachingTimeline>();
  for (const entry of entries) {
    const timeline = buildTeachingTimeline(entry);
    if (registry.has(timeline.scene.id)) throw new Error(`教学场景 ID 重复：${timeline.scene.id}`);
    registry.set(`${entry.tool}/${entry.slug}`, timeline);
  }
  return registry;
}
