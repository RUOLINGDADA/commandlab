import {
  commandAnimationSpecSchema,
  type AnimationKind,
  type CommandAnimationSpec,
  type ReferenceEntry,
  type Tool,
} from "@commandlab/content-schema";

type AnimationSeed = Pick<ReferenceEntry, "tool" | "slug" | "title">;

const gitKinds: Record<string, AnimationKind> = {
  add: "staging",
  commit: "commit",
  status: "diagnostic",
  diff: "workspace",
  init: "workspace",
  config: "workspace",
  log: "history",
  tag: "history",
  branch: "branch",
  switch: "branch",
  merge: "merge",
  rebase: "rebase",
  "cherry-pick": "history",
  fetch: "remote",
  pull: "remote",
  push: "remote",
  remote: "remote",
  restore: "recovery",
  reset: "recovery",
  revert: "recovery",
  reflog: "recovery",
  stash: "recovery",
  clean: "cleanup",
  bisect: "diagnostic",
  "command-index": "workspace",
};

const dockerKinds: Record<string, AnimationKind> = {
  run: "container",
  create: "container",
  start: "container",
  stop: "container",
  restart: "container",
  kill: "container",
  rm: "cleanup",
  ps: "diagnostic",
  logs: "diagnostic",
  exec: "container",
  inspect: "diagnostic",
  stats: "diagnostic",
  build: "image",
  image: "image",
  pull: "image",
  push: "image",
  tag: "image",
  "save-load": "image",
  rmi: "cleanup",
  prune: "cleanup",
  network: "network",
  port: "network",
  volume: "volume",
  compose: "compose",
  cp: "volume",
  context: "workspace",
  info: "diagnostic",
  version: "diagnostic",
  login: "remote",
  rename: "container",
  healthcheck: "diagnostic",
  "command-index": "workspace",
};

const templateByKind: Record<AnimationKind, (seed: AnimationSeed) => CommandAnimationSpec> = {
  workspace: (seed) =>
    spec(seed, "workspace", "工作台像一张桌面，命令先定位对象，再留下可检查的结果。", [
      frame(
        "看见原始对象",
        `${seed.title} 先把 ${seed.slug} 的目标摆到工作台上，仍保持原样。`,
        ["source"],
        "focus-source",
      ),
      frame(
        "命令标记变化",
        `终端执行 ${seed.title} 后，工作台出现一枚专属标记，提示下一步可检查。`,
        ["source", "result"],
        "mark-result",
      ),
      frame(
        "结果可核对",
        `现在可以用状态或差异命令核对 ${seed.slug} 的实际变化，而不是凭感觉操作。`,
        ["result"],
        "settle-result",
      ),
    ]),
  staging: (seed) =>
    spec(seed, "staging", "暂存区像待寄出的篮子，先挑选文件，再封装成提交。", [
      frame(
        "文件在工作区",
        `${seed.title} 看到文件改动，但它还没有进入下一次提交清单。`,
        ["workspace"],
        "highlight-file",
      ),
      frame(
        "文件移入暂存区",
        `执行 ${seed.title}，${seed.slug} 指定的文件快照从工作区移动到暂存区。`,
        ["workspace", "staging"],
        "move-to-staging",
      ),
      frame(
        "等待提交封存",
        "暂存区只是候选快照，只有 commit 才会把它写进历史。",
        ["staging"],
        "lock-staged-snapshot",
      ),
    ]),
  commit: (seed) =>
    spec(seed, "commit", "提交像给快照盖时间章，内容与说明一起进入历史。", [
      frame(
        "暂存快照就绪",
        "文件已经挑好，暂存区成为这次保存的唯一输入。",
        ["staging"],
        "freeze-staging",
      ),
      frame(
        "生成提交节点",
        `${seed.title} 把快照封装成新的提交节点，并记录本次说明。`,
        ["staging", "commit"],
        "create-commit-node",
      ),
      frame(
        "指针向前移动",
        "当前分支指针指向新节点，未来可以从这里继续工作或回看。",
        ["commit", "pointer"],
        "advance-head",
      ),
    ]),
  history: (seed) =>
    spec(seed, "history", "历史视图像时间轴，把提交、标签和差异放回先后顺序。", [
      frame(
        "收集历史节点",
        `${seed.title} 读取 ${seed.slug} 相关提交，旧节点按时间排开。`,
        ["history"],
        "scan-timeline",
      ),
      frame(
        "标出当前位置",
        "分支指针与标签贴在对应节点上，当前位置不再靠猜。",
        ["history", "pointer"],
        "pin-refs",
      ),
      frame(
        "高亮可追溯关系",
        "沿父提交连线回看，每一次变化都能找到来源和后续。",
        ["history", "diff"],
        "trace-parents",
      ),
    ]),
  branch: (seed) =>
    spec(seed, "branch", "分支是提交图上的轻量指针，分叉后各自前进，切换只改变工作区视角。", [
      frame(
        "主线已有提交",
        "主分支指针停在共同起点，提交节点和父子关系清楚可见。",
        ["main", "commit"],
        "show-mainline",
      ),
      frame(
        "创建专属分叉",
        `${seed.title} 创建 ${seed.slug} 指针；它与主线共享历史，但从此可以独立前进。`,
        ["main", "branch", "commit"],
        "fork-pointer",
      ),
      frame(
        "切换工作区视角",
        "切换指针后，工作区呈现目标分支快照，原分支仍停在原节点。",
        ["branch", "workspace"],
        "switch-pointer",
      ),
      frame(
        "两条路线并行",
        "新的提交沿目标分支向前，提交图用两条线表达真实分叉。",
        ["main", "branch", "commit"],
        "parallel-commit",
      ),
    ]),
  merge: (seed) =>
    spec(seed, "merge", "合并像把两条路线汇到同一个路口，共同历史保留，冲突需要选择。", [
      frame(
        "两条分支各自前进",
        "主分支和功能分支拥有共同祖先，但顶端节点已经不同。",
        ["main", "branch", "commit"],
        "show-diverged-heads",
      ),
      frame(
        "对齐共同祖先",
        `${seed.title} 找到两条路线的共同祖先，准备把 ${seed.slug} 的成果带回当前分支。`,
        ["main", "branch", "ancestor"],
        "find-common-ancestor",
      ),
      frame(
        "生成合并节点",
        "两条父线汇入新的合并提交；若同一行冲突，流程会停下来让人选择。",
        ["main", "branch", "merge"],
        "join-parents",
      ),
    ]),
  rebase: (seed) =>
    spec(seed, "rebase", "变基像把一串便签重新贴到最新底稿，内容保留但提交编号会重写。", [
      frame(
        "旧底稿与便签",
        "功能分支的提交暂时挂在旧主线后面，父节点关系保持可见。",
        ["base-old", "topic"],
        "show-old-base",
      ),
      frame(
        "逐个重放提交",
        `${seed.title} 按顺序重放 ${seed.slug} 上的提交，遇到冲突会暂停而不是隐藏。`,
        ["base-new", "topic", "replay"],
        "replay-commits",
      ),
      frame(
        "指针接到新底稿",
        "重放完成后，功能分支落在最新主线末端；旧节点仍可通过恢复工具追踪。",
        ["base-new", "topic", "pointer"],
        "reattach-pointer",
      ),
    ]),
  recovery: (seed) =>
    spec(seed, "recovery", "恢复操作像沿着安全路标回到某个状态，是否改写历史取决于命令。", [
      frame(
        "先保留现场",
        `${seed.title} 先展示 ${seed.slug} 相关的当前文件或引用，避免盲目覆盖。`,
        ["current", "evidence"],
        "capture-evidence",
      ),
      frame(
        "选择恢复路径",
        "恢复目标被标记出来：可以只还原文件，也可以移动指针，或新增反向提交。",
        ["current", "target", "route"],
        "select-recovery-route",
      ),
      frame(
        "验证并留下证据",
        "恢复后重新检查状态；需要时从引用记录找回原节点。",
        ["target", "evidence"],
        "verify-recovery",
      ),
    ]),
  remote: (seed) =>
    spec(seed, "remote", "远端协作像两个仓库之间传递包裹，先取回或认证，再决定是否合并/推送。", [
      frame(
        "本地与远端分开",
        `${seed.title} 把 ${seed.slug} 的本地引用和远端引用并排展示，避免混为一谈。`,
        ["local", "remote"],
        "separate-repos",
      ),
      frame(
        "建立传输通道",
        "认证或连接信息准备好后，远端对象沿通道传输，本地工作区尚未被悄悄覆盖。",
        ["local", "remote", "channel"],
        "open-channel",
      ),
      frame(
        "更新目标引用",
        "传输完成后，明确显示哪些分支或对象发生变化，下一步由使用者选择。",
        ["local", "remote", "refs"],
        "update-refs",
      ),
    ]),
  diagnostic: (seed) =>
    spec(seed, "diagnostic", "诊断像给系统做体检，只读取证据并把状态按时间或对象分类。", [
      frame(
        "采集现场",
        `${seed.title} 读取 ${seed.slug} 的当前状态，不修改目标对象。`,
        ["system"],
        "collect-state",
      ),
      frame(
        "分组异常信号",
        "输出按进程、文件、网络或历史关系分组，第一条异常最值得先看。",
        ["system", "signals"],
        "group-signals",
      ),
      frame(
        "形成下一步",
        "把可观察证据变成检查清单，再决定是否执行改变状态的命令。",
        ["signals", "checklist"],
        "form-checklist",
      ),
    ]),
  image: (seed) =>
    spec(seed, "image", "镜像像分层模具，构建、拉取、标签和推送都围绕不可变层与可读引用。", [
      frame(
        "准备镜像层",
        `${seed.title} 先定位 ${seed.slug} 对应的镜像或构建上下文。`,
        ["context", "layers"],
        "prepare-layers",
      ),
      frame(
        "层被复用或传输",
        "本地已有的层直接复用，缺少的层从仓库拉取或由构建步骤产生。",
        ["layers", "registry"],
        "transfer-layers",
      ),
      frame(
        "更新镜像引用",
        "标签指向新的镜像摘要；只有明确 push 才会改变远端仓库。",
        ["image", "tag", "registry"],
        "point-tag",
      ),
    ]),
  container: (seed) =>
    spec(seed, "container", "容器是镜像运行出来的实例，创建、启动、停止和删除是不同状态。", [
      frame(
        "镜像作为模板",
        `${seed.title} 选择 ${seed.slug} 需要的镜像与配置，尚未产生进程。`,
        ["image", "config"],
        "select-template",
      ),
      frame(
        "创建实例",
        "容器记录被建立，名称、挂载和网络配置就位，但进程可能仍未运行。",
        ["image", "container", "config"],
        "create-instance",
      ),
      frame(
        "进程进入生命周期",
        "启动后容器获得运行状态；停止只结束进程，删除才会移除实例记录。",
        ["container", "process", "state"],
        "run-process",
      ),
    ]),
  network: (seed) =>
    spec(seed, "network", "网络像有门牌和边界的园区，端口映射与服务名决定数据包如何到达。", [
      frame(
        "声明服务边界",
        `${seed.title} 为 ${seed.slug} 标出容器端口、主机端口或网络成员。`,
        ["container", "boundary"],
        "declare-boundary",
      ),
      frame(
        "解析目标地址",
        "端口映射或服务名被解析成实际目标，未声明的边界不会自动打开。",
        ["boundary", "dns", "target"],
        "resolve-target",
      ),
      frame(
        "数据包抵达进程",
        "请求沿连接线抵达监听进程，同时保留主机与容器端口的对应关系。",
        ["client", "target", "process"],
        "deliver-packet",
      ),
    ]),
  volume: (seed) =>
    spec(seed, "volume", "卷像独立硬盘，把持久化数据与容器实例生命周期分开。", [
      frame(
        "容器挂载目录",
        `${seed.title} 把 ${seed.slug} 的数据目录标记为可持久化位置。`,
        ["container", "mount"],
        "mount-volume",
      ),
      frame(
        "数据写入卷",
        "进程写入的数据落在卷中，即使容器停止，卷仍保持内容。",
        ["process", "volume"],
        "write-persistent-data",
      ),
      frame(
        "实例更换仍可复用",
        "删除旧容器后，新实例重新挂载同一卷，数据不会随容器记录一起消失。",
        ["volume", "new-container"],
        "reattach-volume",
      ),
    ]),
  compose: (seed) =>
    spec(seed, "compose", "编排像一张施工图，同时安排服务、网络、卷和依赖启动顺序。", [
      frame(
        "读取服务蓝图",
        `${seed.title} 读取 ${seed.slug} 的服务定义与依赖关系。`,
        ["file", "services"],
        "parse-blueprint",
      ),
      frame(
        "建立共享资源",
        "网络和卷先准备好，服务获得稳定的连接名与数据位置。",
        ["network", "volume", "services"],
        "provision-resources",
      ),
      frame(
        "按依赖启动",
        "数据库等依赖先就绪，应用服务随后加入，整体状态可从编排视图检查。",
        ["services", "dependencies", "state"],
        "start-dependency-order",
      ),
    ]),
  cleanup: (seed) =>
    spec(seed, "cleanup", "清理像按范围整理仓库，先圈定对象，再删除并确认是否可恢复。", [
      frame(
        "盘点可清理对象",
        `${seed.title} 列出 ${seed.slug} 会触及的对象与占用空间。`,
        ["inventory"],
        "scan-scope",
      ),
      frame(
        "执行定向删除",
        "删除动作只作用于已选范围；批量清理会额外标出共享或不可逆对象。",
        ["inventory", "selected", "danger"],
        "remove-selected",
      ),
      frame(
        "复核剩余状态",
        "重新列出资源，确认目标已释放且仍在使用的对象没有被误删。",
        ["selected", "remaining"],
        "verify-cleanup",
      ),
    ]),
};

function frame(label: string, narration: string, activeActors: string[], transition: string) {
  return { label, narration, activeActors, transition };
}

function spec(
  seed: AnimationSeed,
  kind: AnimationKind,
  metaphor: string,
  frames: CommandAnimationSpec["frames"],
): CommandAnimationSpec {
  const actors = actorMap(kind);
  return commandAnimationSpecSchema.parse({
    id: `${seed.tool}-${seed.slug}`,
    tool: seed.tool,
    slug: seed.slug,
    title: seed.title,
    kind,
    metaphor,
    actors,
    frames,
  });
}

function actorMap(kind: AnimationKind): CommandAnimationSpec["actors"] {
  const maps: Partial<Record<AnimationKind, CommandAnimationSpec["actors"]>> = {
    staging: [
      { id: "workspace", label: "工作区", role: "尚未加入下一次提交的文件改动" },
      { id: "staging", label: "暂存区", role: "准备封装的文件快照清单" },
      { id: "history", label: "提交历史", role: "已经保存并可回看的版本" },
    ],
    commit: [
      { id: "staging", label: "暂存快照", role: "本次提交将要封装的内容" },
      { id: "commit", label: "提交节点", role: "带说明和父节点的版本快照" },
      { id: "pointer", label: "HEAD 指针", role: "当前分支所在的最新位置" },
    ],
    history: [
      { id: "history", label: "提交时间轴", role: "按父子关系排列的历史节点" },
      { id: "pointer", label: "分支指针", role: "指向当前工作位置的引用" },
      { id: "diff", label: "差异高亮", role: "帮助定位版本之间变化的证据" },
    ],
    rebase: [
      { id: "base-old", label: "旧底稿", role: "变基前功能分支依附的主线" },
      { id: "base-new", label: "新底稿", role: "变基后要接上的最新主线" },
      { id: "topic", label: "功能提交", role: "等待逐个重放的提交序列" },
      { id: "replay", label: "重放过程", role: "按原顺序应用变更的临时状态" },
      { id: "pointer", label: "分支指针", role: "重放完成后更新的位置" },
    ],
    branch: [
      { id: "main", label: "main 指针", role: "稳定主线上的分支引用" },
      { id: "branch", label: "topic 指针", role: "从共同提交分叉出的工作路线" },
      { id: "commit", label: "提交节点", role: "按父子关系连接的版本快照" },
      { id: "workspace", label: "工作区", role: "当前指针对应的文件视角" },
    ],
    merge: [
      { id: "main", label: "当前分支", role: "准备接收合并结果的路线" },
      { id: "branch", label: "来源分支", role: "携带新提交的路线" },
      { id: "ancestor", label: "共同祖先", role: "两条路线分叉前的提交" },
      { id: "merge", label: "合并节点", role: "同时连接两个父提交的新快照" },
    ],
    container: [
      { id: "image", label: "镜像", role: "创建容器时使用的只读模板" },
      { id: "container", label: "容器", role: "镜像产生的可管理实例" },
      { id: "process", label: "进程", role: "容器内部正在运行的主程序" },
      { id: "state", label: "状态", role: "运行、停止或退出的生命周期标记" },
    ],
    recovery: [
      { id: "current", label: "当前状态", role: "恢复前的文件或引用位置" },
      { id: "target", label: "目标状态", role: "希望回到的安全快照" },
      { id: "evidence", label: "恢复证据", role: "reflog 或备份等可追踪线索" },
      { id: "route", label: "恢复路径", role: "只还原文件、移动指针或新增反向提交" },
    ],
    remote: [
      { id: "local", label: "本地仓库", role: "当前机器上的提交和引用" },
      { id: "remote", label: "远端仓库", role: "团队共享的对象与分支" },
      { id: "channel", label: "传输通道", role: "认证后交换对象的连接" },
      { id: "refs", label: "远端引用", role: "传输后更新的分支或标签位置" },
    ],
    image: [
      { id: "context", label: "构建上下文", role: "决定镜像内容的文件集合" },
      { id: "layers", label: "镜像层", role: "可复用且按顺序叠加的只读层" },
      { id: "registry", label: "镜像仓库", role: "拉取或推送镜像层的远端" },
      { id: "image", label: "镜像摘要", role: "由内容寻址并被标签指向的结果" },
      { id: "tag", label: "镜像标签", role: "指向镜像摘要的可读名字" },
    ],
    network: [
      { id: "container", label: "容器端口", role: "服务进程实际监听的端口" },
      { id: "boundary", label: "网络边界", role: "主机、网络和容器之间的门牌规则" },
      { id: "target", label: "目标服务", role: "请求最终要抵达的进程" },
      { id: "dns", label: "服务解析", role: "把服务名转换为目标地址" },
      { id: "client", label: "请求方", role: "发起连接并等待响应的客户端" },
      { id: "process", label: "监听进程", role: "容器内接收请求的服务进程" },
    ],
    volume: [
      { id: "container", label: "容器实例", role: "挂载卷并读写数据的运行单元" },
      { id: "volume", label: "持久化卷", role: "独立于容器保存数据的存储" },
      { id: "new-container", label: "新容器", role: "替换旧实例后重新挂载卷的单元" },
    ],
    compose: [
      { id: "file", label: "编排文件", role: "描述服务、网络和卷的蓝图" },
      { id: "services", label: "服务集合", role: "按依赖关系启动的多个容器" },
      { id: "dependencies", label: "依赖资源", role: "网络、卷和启动顺序等共享条件" },
      { id: "network", label: "共享网络", role: "服务之间使用的连接边界" },
      { id: "volume", label: "共享卷", role: "跨服务持久化的数据目录" },
      { id: "state", label: "编排状态", role: "所有服务当前是否健康就绪" },
    ],
    cleanup: [
      { id: "inventory", label: "资源盘点", role: "待清理对象和占用空间清单" },
      { id: "selected", label: "选中范围", role: "本次删除明确圈定的对象" },
      { id: "remaining", label: "剩余资源", role: "清理后仍被使用的对象" },
      { id: "danger", label: "风险提示", role: "共享或不可逆对象的醒目标记" },
    ],
    workspace: [
      { id: "source", label: "输入对象", role: "命令读取或准备处理的对象" },
      { id: "result", label: "结果状态", role: "执行后可观察的状态变化" },
      { id: "evidence", label: "验证证据", role: "帮助确认结果的输出" },
    ],
    diagnostic: [
      { id: "system", label: "当前现场", role: "命令读取的系统或仓库状态" },
      { id: "signals", label: "状态信号", role: "输出中值得关注的异常线索" },
      { id: "checklist", label: "排查清单", role: "根据证据形成的下一步检查" },
    ],
  };
  return (
    maps[kind] ?? [
      { id: "source", label: "输入对象", role: "命令读取或准备处理的对象" },
      { id: "result", label: "结果状态", role: "执行后可观察的状态变化" },
      { id: "evidence", label: "验证证据", role: "帮助小白确认结果的输出" },
    ]
  );
}

/** 根据百科条目生成并校验唯一的命令动画注册项。 */
export function getAnimationSpec(entry: AnimationSeed): CommandAnimationSpec {
  const map = entry.tool === "git" ? gitKinds : dockerKinds;
  const kind = map[entry.slug];
  if (!kind) throw new Error(`缺少 ${entry.tool}/${entry.slug} 的动画注册项。`);
  return templateByKind[kind](entry);
}

/** 对全部百科条目建立注册表，并拒绝重复 ID、缺帧或缺失命令。 */
export function buildAnimationRegistry(
  entries: AnimationSeed[],
): Map<string, CommandAnimationSpec> {
  const registry = new Map<string, CommandAnimationSpec>();
  for (const entry of entries) {
    const animation = getAnimationSpec(entry);
    if (registry.has(animation.id)) throw new Error(`动画 ID 重复：${animation.id}`);
    registry.set(`${entry.tool}/${entry.slug}`, animation);
  }
  return registry;
}

export function getAnimationByRoute(tool: Tool, slug: string): CommandAnimationSpec | undefined {
  const map = tool === "git" ? gitKinds : dockerKinds;
  const kind = map[slug];
  return kind ? templateByKind[kind]({ tool, slug, title: `${tool} ${slug}` }) : undefined;
}
