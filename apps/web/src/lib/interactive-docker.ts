import { teachingDockerStateSchema, type TeachingDockerState } from "@commandlab/content-schema";

export type InteractiveDockerLineKind = "system" | "command" | "output" | "error";

export type InteractiveDockerLine = {
  id: string;
  kind: InteractiveDockerLineKind;
  text: string;
};

export type InteractiveDockerResult = {
  state: TeachingDockerState;
  output: string[];
  error: boolean;
  command: string;
};

export type InteractiveDockerSuggestion = {
  command: string;
  description: string;
};

export type InteractiveDockerTarget =
  | {
      kind: "container";
      id: string;
      label: string;
      status: TeachingDockerState["containers"][number]["status"];
    }
  | { kind: "image"; id: string; label: string }
  | { kind: "network"; id: string; label: string }
  | { kind: "volume"; id: string; label: string };

const suggestionCatalog: InteractiveDockerSuggestion[] = [
  { command: "docker ps", description: "查看运行中的容器" },
  { command: "docker ps -a", description: "查看全部容器" },
  { command: "docker container ls -a", description: "用资源分组命令查看全部容器" },
  { command: "docker run --name api -p 8080:80 nginx:latest", description: "创建并启动容器" },
  { command: "docker create --name worker nginx:latest", description: "只创建容器" },
  { command: "docker start web", description: "启动已创建的容器" },
  { command: "docker stop web", description: "停止容器进程" },
  { command: "docker logs web", description: "查看容器输出" },
  { command: "docker inspect web", description: "读取结构化状态" },
  { command: "docker image ls", description: "列出本地镜像" },
  { command: "docker pull nginx:latest", description: "拉取镜像" },
  { command: "docker image history nginx:latest", description: "查看镜像层历史" },
  { command: "docker network create app-net", description: "创建容器网络" },
  { command: "docker volume create app-data", description: "创建持久化卷" },
  { command: "docker compose up -d", description: "启动 Compose 服务" },
  { command: "docker compose down", description: "停止 Compose 服务" },
  { command: "docker compose config", description: "展开 Compose 配置" },
  { command: "docker system df", description: "查看资源磁盘占用" },
  { command: "docker system prune", description: "清理停止对象" },
];

let lineSequence = 0;

/** 创建终端行，保证 React 列表在同一会话内拥有稳定 ID。 */
export function line(kind: InteractiveDockerLineKind, text: string): InteractiveDockerLine {
  lineSequence += 1;
  return { id: `docker-line-${lineSequence}`, kind, text };
}

/** 创建 Docker 工作台的固定演示状态，不读取宿主机 Docker Engine。 */
export function createInteractiveDockerState(): TeachingDockerState {
  return teachingDockerStateSchema.parse({
    tool: "docker",
    images: [
      { id: "img-nginx", name: "nginx:latest", status: "local" },
      { id: "img-node", name: "node:20-alpine", status: "local" },
    ],
    containers: [
      { id: "ctr-web", name: "web", image: "nginx:latest", status: "running" },
      { id: "ctr-worker", name: "worker", image: "node:20-alpine", status: "stopped" },
    ],
    networks: ["bridge"],
    volumes: [{ name: "commandlab-data", attachedTo: ["web"], bytes: 4096 }],
    ports: [{ host: 8080, container: 80, target: "web" }],
  });
}

/** 返回 Docker 工作台初始欢迎文本。 */
export function createInteractiveDockerWelcome(): InteractiveDockerLine[] {
  return [
    line("system", "CommandLab Docker 仿真终端 · 内存隔离会话"),
    line("system", "输入 docker help 查看命令；所有操作只改变当前浏览器会话。"),
    line("output", "提示：点击镜像、容器、网络或卷旁的 >，可把对应命令送入终端。"),
  ];
}

/** 根据当前输入返回 Docker 命令候选，不会执行或修改状态。 */
export function getInteractiveDockerCommandSuggestions(
  input: string,
): InteractiveDockerSuggestion[] {
  const value = input.trimStart().toLowerCase();
  if (!value || value === "docker") return suggestionCatalog.slice(0, 8);
  return suggestionCatalog
    .filter(
      (item) =>
        item.command.toLowerCase().startsWith(value) || item.command.toLowerCase().includes(value),
    )
    .slice(0, 8);
}

/** 返回对象旁可见操作入口对应的 Docker 命令。 */
export function getInteractiveDockerContextActions(
  target: InteractiveDockerTarget,
): InteractiveDockerSuggestion[] {
  if (target.kind === "container") {
    const actions: InteractiveDockerSuggestion[] = [
      { command: `docker logs ${target.label}`, description: "查看容器日志" },
      { command: `docker inspect ${target.label}`, description: "检查容器状态" },
    ];
    if (target.status === "running") {
      actions.unshift({ command: `docker stop ${target.label}`, description: "停止容器" });
    } else if (target.status !== "removed") {
      actions.unshift({ command: `docker start ${target.label}`, description: "启动容器" });
    }
    if (target.status !== "running") {
      actions.push({ command: `docker rm ${target.label}`, description: "删除容器" });
    }
    return actions;
  }
  if (target.kind === "image") {
    return [
      {
        command: `docker run --name ${target.label.split(":")[0]} -d ${target.label}`,
        description: "从镜像启动容器",
      },
      {
        command: `docker tag ${target.label} commandlab/${target.label}`,
        description: "添加镜像标签",
      },
      { command: `docker rmi ${target.label}`, description: "移除镜像引用" },
    ];
  }
  if (target.kind === "network") {
    return [
      { command: `docker network ls`, description: "查看网络列表" },
      { command: `docker network rm ${target.label}`, description: "移除网络" },
    ];
  }
  return [
    { command: `docker volume ls`, description: "查看卷列表" },
    { command: `docker volume rm ${target.label}`, description: "移除持久化卷" },
  ];
}

/** 执行一条 Docker 仿真命令；失败时返回原状态，绝不访问宿主机。 */
export function executeInteractiveDockerCommand(
  state: TeachingDockerState,
  raw: string,
): InteractiveDockerResult {
  const command = raw.trim();
  const tokens = tokenize(command);
  if (!command) return { state, output: [], error: false, command };
  if (!tokens.length || tokens[0] !== "docker") {
    return failure(state, command, "只支持以 docker 开头的仿真命令，例如 docker ps。");
  }
  tokens.shift();
  const group = tokens.shift()?.toLowerCase() ?? "help";
  if (group === "help" || group === "--help") return success(state, command, helpOutput());
  if (group === "version")
    return success(state, command, ["Client: Docker Engine 27.5", "Server: Docker Engine 27.5"]);
  if (group === "info") return success(state, command, infoOutput(state));
  if (group === "context") return runContext(state, tokens, command);
  if (group === "ps") return readPs(state, tokens, command);
  if (group === "container") {
    const sub = tokens.shift() ?? "ls";
    if (sub === "ls" || sub === "list") return readPs(state, tokens, command);
    if (sub === "inspect") return readInspect(state, tokens, command);
    return failure(state, command, `不支持 docker container ${sub}。`);
  }
  if (group === "images") return readImages(state, command);
  if (group === "image") return runImage(state, tokens, command);
  if (group === "run") return runContainer(state, tokens, command, true);
  if (group === "create") return runContainer(state, tokens, command, false);
  if (group === "start" || group === "stop" || group === "restart" || group === "kill") {
    return changeContainerStatus(state, group, tokens, command);
  }
  if (group === "rm") return removeContainer(state, tokens, command);
  if (group === "rename") return renameContainer(state, tokens, command);
  if (group === "logs") return readLogs(state, tokens, command);
  if (group === "exec") return runExec(state, tokens, command);
  if (group === "inspect") return readInspect(state, tokens, command);
  if (group === "stats") return readStats(state, tokens, command);
  if (group === "port") return readPort(state, tokens, command);
  if (group === "network") return runNetwork(state, tokens, command);
  if (group === "volume") return runVolume(state, tokens, command);
  if (group === "pull") return pullImage(state, tokens, command);
  if (group === "push") return pushImage(state, tokens, command);
  if (group === "tag") return tagImage(state, tokens, command);
  if (group === "build") return buildImage(state, tokens, command);
  if (group === "rmi") return removeImage(state, tokens, command);
  if (group === "cp") return copyFile(state, tokens, command);
  if (group === "compose") return runCompose(state, tokens, command);
  if (group === "login")
    return success(state, command, [
      "Login Succeeded",
      "认证信息仅在本次仿真会话中展示，不会保存。",
    ]);
  if (group === "system") return runSystem(state, tokens, command);
  return failure(state, command, `未知 Docker 子命令：${group}。输入 docker help 查看可用命令。`);
}

function runContext(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const sub = tokens[0] ?? "ls";
  if (sub === "ls")
    return success(state, command, [
      "NAME        DESCRIPTION          CURRENT",
      "default     Docker Desktop         *",
    ]);
  return failure(state, command, `不支持 docker context ${sub}。`);
}

function readPs(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const all = tokens.includes("-a") || tokens.includes("--all");
  const containers = state.containers.filter((item) => all || item.status === "running");
  if (!containers.length) return success(state, command, [all ? "没有容器" : "没有运行中的容器"]);
  return success(state, command, [
    "CONTAINER ID   NAME       IMAGE              STATUS       PORTS",
    ...containers.map((item) => {
      const ports = state.ports
        .filter((port) => port.target === item.name)
        .map((port) => `0.0.0.0:${port.host}->${port.container}/tcp`)
        .join(", ");
      return `${item.id}   ${item.name.padEnd(9)} ${item.image.padEnd(18)} ${item.status.padEnd(12)} ${ports || "-"}`;
    }),
  ]);
}

function readImages(state: TeachingDockerState, command: string): InteractiveDockerResult {
  if (!state.images.length) return success(state, command, ["没有本地镜像"]);
  return success(state, command, [
    "REPOSITORY          TAG       IMAGE ID     CREATED          SIZE     STATUS",
    ...state.images.map((item) => {
      const [repository, tag = "latest"] = item.name.split(":");
      return `${repository!.padEnd(19)} ${tag.padEnd(9)} ${item.id.padEnd(9)} 2 minutes ago   42MB     ${item.status}`;
    }),
  ]);
}

function runImage(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const sub = tokens.shift() ?? "ls";
  if (sub === "ls") return readImages(state, command);
  if (sub === "inspect") return readInspect(state, tokens, command);
  if (sub === "pull") return pullImage(state, tokens, command);
  if (sub === "history") {
    const name = tokens.find((token) => !token.startsWith("-"));
    if (!name || !state.images.some((item) => item.name === name))
      return failure(state, command, `Error: No such image: ${name ?? "(missing)"}`);
    return success(state, command, [
      "IMAGE          CREATED         CREATED BY",
      `${name.padEnd(14)} 2 minutes ago   /bin/sh -c nginx -g 'daemon off;'`,
      `${name.padEnd(14)} 3 minutes ago   /bin/sh -c #(nop) COPY application layers`,
      `${name.padEnd(14)} 4 minutes ago   /bin/sh -c #(nop) ADD file:base /`,
    ]);
  }
  if (sub === "rmi" || sub === "remove") return removeImage(state, tokens, command);
  return failure(state, command, `不支持 docker image ${sub}。`);
}

function removeImage(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const name = tokens.find((token) => !token.startsWith("-"));
  if (!name) return failure(state, command, "需要指定镜像名称。");
  const image = state.images.find((item) => item.name === name);
  if (!image) return failure(state, command, `Error: No such image: ${name}`);
  const inUse = state.containers.some((container) => container.image === name);
  if (inUse && !tokens.includes("-f") && !tokens.includes("--force")) {
    return failure(state, command, `Error: conflict: image ${name} is being used by a container`);
  }
  const next = clone(state);
  next.images = next.images.filter((item) => item.name !== name);
  return success(next, command, [image.id, "image removed"]);
}

function runContainer(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
  running: boolean,
): InteractiveDockerResult {
  const parsed = parseRunOptions(tokens);
  const image = parsed.positionals.at(-1);
  if (!image) return failure(state, command, "缺少镜像名称，例如 nginx:latest。");
  const imageName = image.includes(":") ? image : `${image}:latest`;
  const hasImage = state.images.some((item) => item.name === imageName);
  if (!hasImage)
    return failure(
      state,
      command,
      `Unable to find image '${imageName}' locally。先运行 docker pull ${imageName}。`,
    );
  const name = parsed.name ?? `container-${state.containers.length + 1}`;
  if (state.containers.some((item) => item.name === name))
    return failure(state, command, `Conflict. The container name "${name}" is already in use.`);
  const next = clone(state);
  next.containers.push({
    id: `ctr-${next.containers.length + 1}`,
    name,
    image: imageName,
    status: running ? "running" : "created",
  });
  if (parsed.network && !next.networks.includes(parsed.network)) next.networks.push(parsed.network);
  if (parsed.volume) {
    const [volumeName] = parsed.volume.split(":");
    const volume = next.volumes.find((item) => item.name === volumeName);
    if (volume) volume.attachedTo = Array.from(new Set([...volume.attachedTo, name]));
    else next.volumes.push({ name: volumeName!, attachedTo: [name], bytes: 0 });
  }
  if (parsed.port)
    next.ports.push({ host: parsed.port.host, container: parsed.port.container, target: name });
  return success(next, command, [
    `image ${imageName}  using local layer cache`,
    `container ${name}  ${running ? "started" : "created"}`,
    parsed.port
      ? `port ${parsed.port.host}->${parsed.port.container}/tcp published`
      : "port mapping: none",
    parsed.network ? `network ${parsed.network} attached` : "network bridge attached",
    parsed.volume ? `volume ${parsed.volume.split(":")[0]} mounted` : "mounts: none",
  ]);
}

function changeContainerStatus(
  state: TeachingDockerState,
  action: string,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const name = tokens.find((token) => !token.startsWith("-"));
  const container = name ? state.containers.find((item) => item.name === name) : undefined;
  if (!container) return failure(state, command, `No such container: ${name ?? "(missing name)"}`);
  if (container.status === "removed") return failure(state, command, `No such container: ${name}`);
  const next = clone(state);
  const target = next.containers.find((item) => item.name === name)!;
  target.status = action === "start" || action === "restart" ? "running" : "stopped";
  return success(next, command, [name!, `${action} ${name} ... done`]);
}

function removeContainer(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const name = tokens.find((token) => !token.startsWith("-"));
  if (!name) return failure(state, command, "需要指定容器名称。");
  const container = state.containers.find((item) => item.name === name);
  if (!container) return failure(state, command, `Error: No such container: ${name}`);
  if (container.status === "running" && !tokens.includes("-f") && !tokens.includes("--force")) {
    return failure(
      state,
      command,
      `Error: cannot remove running container ${name} without --force`,
    );
  }
  const next = clone(state);
  next.containers = next.containers.filter((item) => item.name !== name);
  next.ports = next.ports.filter((item) => item.target !== name);
  next.volumes = next.volumes.map((item) => ({
    ...item,
    attachedTo: item.attachedTo.filter((itemName) => itemName !== name),
  }));
  return success(next, command, [name, "container removed"]);
}

function renameContainer(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const [oldName, newName] = tokens.filter((token) => !token.startsWith("-"));
  if (!oldName || !newName) return failure(state, command, "用法：docker rename OLD NEW");
  if (!state.containers.some((item) => item.name === oldName))
    return failure(state, command, `No such container: ${oldName}`);
  if (state.containers.some((item) => item.name === newName))
    return failure(state, command, `Conflict. The container name "${newName}" is already in use.`);
  const next = clone(state);
  next.containers.find((item) => item.name === oldName)!.name = newName;
  next.ports = next.ports.map((item) =>
    item.target === oldName ? { ...item, target: newName } : item,
  );
  next.volumes = next.volumes.map((item) => ({
    ...item,
    attachedTo: item.attachedTo.map((itemName) => (itemName === oldName ? newName : itemName)),
  }));
  return success(next, command, [newName]);
}

function readLogs(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const name = tokens.find((token) => !token.startsWith("-"));
  const container = name ? state.containers.find((item) => item.name === name) : undefined;
  if (!container) return failure(state, command, `No such container: ${name ?? "(missing name)"}`);
  return success(state, command, [
    `${container.name} | 2026-09-01T12:00:00Z  starting ${container.image}`,
    `${container.name} | 2026-09-01T12:00:00Z  server listening on :80`,
    `${container.name} | 2026-09-01T12:00:01Z  healthcheck: healthy`,
    `${container.name} | 2026-09-01T12:00:01Z  status=${container.status}`,
    `${container.name} | network=bridge ports=${state.ports.filter((item) => item.target === container.name).length}`,
  ]);
}

function runExec(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const name = tokens.find((token) => !token.startsWith("-") && token !== "sh" && token !== "bash");
  const container = name ? state.containers.find((item) => item.name === name) : undefined;
  if (!container) return failure(state, command, `No such container: ${name ?? "(missing name)"}`);
  if (container.status !== "running")
    return failure(state, command, `Container ${name} is not running`);
  return success(state, command, [
    `root@${name}:/#`,
    "仿真 shell 已打开；输入 exit 返回 Docker 终端。",
  ]);
}

function readInspect(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const name = tokens.find((token) => !token.startsWith("-"));
  const container = name ? state.containers.find((item) => item.name === name) : undefined;
  if (container)
    return success(state, command, [
      `Name: /${container.name}`,
      `Image: ${container.image}`,
      `State: ${container.status}`,
      `Mounts: ${
        state.volumes
          .filter((item) => item.attachedTo.includes(container.name))
          .map((item) => item.name)
          .join(", ") || "none"
      }`,
      `Ports: ${
        state.ports
          .filter((item) => item.target === container.name)
          .map((item) => `${item.host}->${item.container}`)
          .join(", ") || "none"
      }`,
      `Networks: bridge`,
      `RestartPolicy: unless-stopped`,
      `Health: ${container.status === "running" ? "healthy" : "not running"}`,
    ]);
  const image = name ? state.images.find((item) => item.name === name) : undefined;
  if (image)
    return success(state, command, [
      `Id: ${image.id}`,
      `RepoTags: ${image.name}`,
      `Status: ${image.status}`,
      "Architecture: amd64",
      "Layers: 3 (base, runtime, application)",
    ]);
  return failure(state, command, `Error: No such object: ${name ?? "(missing name)"}`);
}

function readStats(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const name = tokens.find((token) => !token.startsWith("-"));
  if (name && !state.containers.some((item) => item.name === name))
    return failure(state, command, `No such container: ${name}`);
  return success(state, command, [
    "CONTAINER   CPU %   MEM USAGE / LIMIT   NET I/O       BLOCK I/O     PIDS",
    `${name ?? "web"}          0.4%     12MiB / 512MiB     1.2kB / 0B   0B / 0B       3`,
    "提示：仿真数据是固定快照，用于练习观察指标列。",
  ]);
}

function readPort(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const name = tokens.find((token) => !token.startsWith("-"));
  const ports = state.ports.filter((item) => !name || item.target === name);
  if (!ports.length) return failure(state, command, `没有找到 ${name ?? "目标容器"} 的端口映射。`);
  return success(
    state,
    command,
    ports.map((item) => `${item.container}/tcp -> 0.0.0.0:${item.host}`),
  );
}

function runNetwork(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const sub = tokens.shift() ?? "ls";
  if (sub === "ls")
    return success(state, command, [
      "NETWORK ID   NAME",
      ...state.networks.map((name, index) => `net-${index + 1}       ${name}`),
    ]);
  const name = tokens.find((token) => !token.startsWith("-"));
  if (!name) return failure(state, command, `docker network ${sub} 需要网络名称。`);
  if (sub === "create") {
    if (state.networks.includes(name))
      return failure(state, command, `Error: network ${name} already exists`);
    const next = clone(state);
    next.networks.push(name);
    return success(next, command, [name]);
  }
  if (sub === "rm") {
    if (name === "bridge")
      return failure(state, command, "Error: bridge is a default network and cannot be removed");
    const next = clone(state);
    next.networks = next.networks.filter((item) => item !== name);
    return success(next, command, [name]);
  }
  if (sub === "inspect")
    return success(state, command, [
      `Name: ${name}`,
      `Containers: ${
        state.containers
          .filter((item) => item.status !== "removed")
          .map((item) => item.name)
          .join(", ") || "none"
      }`,
    ]);
  return failure(state, command, `不支持 docker network ${sub}。`);
}

function runVolume(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const sub = tokens.shift() ?? "ls";
  if (sub === "ls")
    return success(state, command, [
      "DRIVER    VOLUME NAME",
      ...state.volumes.map((item) => `local     ${item.name}`),
    ]);
  const name = tokens.find((token) => !token.startsWith("-"));
  if (!name) return failure(state, command, `docker volume ${sub} 需要卷名称。`);
  if (sub === "create") {
    if (state.volumes.some((item) => item.name === name))
      return failure(state, command, `Error: volume ${name} already exists`);
    const next = clone(state);
    next.volumes.push({ name, attachedTo: [], bytes: 0 });
    return success(next, command, [name]);
  }
  if (sub === "rm") {
    const volume = state.volumes.find((item) => item.name === name);
    if (!volume) return failure(state, command, `Error: volume ${name} not found`);
    if (volume.attachedTo.length) return failure(state, command, `Error: volume ${name} is in use`);
    const next = clone(state);
    next.volumes = next.volumes.filter((item) => item.name !== name);
    return success(next, command, [name]);
  }
  if (sub === "inspect")
    return success(state, command, [
      `Name: ${name}`,
      `Mountpoint: /var/lib/docker/volumes/${name}`,
      `Size: ${state.volumes.find((item) => item.name === name)?.bytes ?? 0} B`,
    ]);
  return failure(state, command, `不支持 docker volume ${sub}。`);
}

function pullImage(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const name = tokens.find((token) => !token.startsWith("-"));
  if (!name) return failure(state, command, "需要指定镜像名称。");
  const imageName = name.includes(":") ? name : `${name}:latest`;
  if (state.images.some((item) => item.name === imageName))
    return success(state, command, [`${imageName}: Already exists`]);
  const next = clone(state);
  next.images.push({ id: `img-${next.images.length + 1}`, name: imageName, status: "local" });
  return success(next, command, [
    `Pulling from library/${imageName.split(":")[0]}`,
    `${imageName}: Pull complete`,
  ]);
}

function pushImage(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const name = tokens.find((token) => !token.startsWith("-"));
  const image = name ? state.images.find((item) => item.name === name) : undefined;
  if (!image)
    return failure(
      state,
      command,
      `An image does not exist locally with the tag: ${name ?? "(missing)"}`,
    );
  const next = clone(state);
  next.images.find((item) => item.id === image.id)!.status = "pushed";
  return success(next, command, [`${image.name}: pushed`]);
}

function tagImage(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const [source, target] = tokens.filter((token) => !token.startsWith("-"));
  const image = source ? state.images.find((item) => item.name === source) : undefined;
  if (!image || !target) return failure(state, command, "用法：docker tag SOURCE TARGET");
  const next = clone(state);
  next.images.push({ id: image.id, name: target, status: image.status });
  return success(next, command, [`${target} tagged`]);
}

function buildImage(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const tagIndex = tokens.findIndex((token) => token === "-t" || token === "--tag");
  const name = tagIndex >= 0 ? tokens[tagIndex + 1] : undefined;
  if (!name) return failure(state, command, "需要使用 -t 指定镜像标签。");
  const next = clone(state);
  next.images.push({ id: `img-${next.images.length + 1}`, name, status: "local" });
  return success(next, command, [
    `[1/3] FROM nginx:latest`,
    `[2/3] COPY . /usr/share/nginx/html`,
    `[3/3] exporting to image`,
    `Successfully built ${name}`,
  ]);
}

function copyFile(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const args = tokens.filter((token) => !token.startsWith("-"));
  if (args.length < 2) return failure(state, command, "用法：docker cp CONTAINER:SRC DEST");
  return success(state, command, [`copied ${args[0]} -> ${args[1]}`]);
}

function runCompose(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const sub = tokens.find((token) => !token.startsWith("-")) ?? "ps";
  if (sub === "ps")
    return success(state, command, [
      "NAME                 SERVICE   STATUS",
      ...state.containers
        .filter((item) => item.name.startsWith("commandlab-"))
        .map((item) => `${item.name.padEnd(20)} ${item.image.padEnd(9)} ${item.status}`),
    ]);
  if (sub === "up") {
    const next = clone(state);
    if (!next.networks.includes("commandlab-net")) next.networks.push("commandlab-net");
    if (!next.volumes.some((item) => item.name === "commandlab-db-data"))
      next.volumes.push({ name: "commandlab-db-data", attachedTo: ["commandlab-db"], bytes: 1024 });
    for (const item of [
      {
        id: `ctr-${next.containers.length + 1}`,
        name: "commandlab-db",
        image: "postgres:16-alpine",
      },
      { id: `ctr-${next.containers.length + 2}`, name: "commandlab-web", image: "nginx:latest" },
    ]) {
      const existing = next.containers.find((container) => container.name === item.name);
      if (existing) existing.status = "running";
      else next.containers.push({ ...item, status: "running" });
    }
    if (!next.ports.some((item) => item.target === "commandlab-web"))
      next.ports.push({ host: 8081, container: 80, target: "commandlab-web" });
    return success(next, command, [
      "Network commandlab-net  Created",
      "Container commandlab-db  Started",
      "Container commandlab-web  Started",
    ]);
  }
  if (sub === "config")
    return success(state, command, [
      "name: commandlab",
      "services:",
      "  web:",
      "    image: nginx:latest",
      '    ports: ["8081:80"]',
      "    networks: [commandlab-net]",
      "  db:",
      "    image: postgres:16-alpine",
      "    volumes: [commandlab-db-data:/var/lib/postgresql/data]",
      "networks: [commandlab-net]",
      "volumes: [commandlab-db-data]",
    ]);
  if (sub === "down") {
    const next = clone(state);
    next.containers = next.containers.filter((item) => !item.name.startsWith("commandlab-"));
    next.ports = next.ports.filter((item) => item.target !== "commandlab-web");
    next.networks = next.networks.filter((item) => item !== "commandlab-net");
    return success(next, command, [
      "Container commandlab-web  Removed",
      "Container commandlab-db  Removed",
      "Network commandlab-net  Removed",
    ]);
  }
  return failure(state, command, `不支持 docker compose ${sub}。`);
}

function runSystem(
  state: TeachingDockerState,
  tokens: string[],
  command: string,
): InteractiveDockerResult {
  const sub = tokens[0] ?? "df";
  if (sub === "df")
    return success(state, command, [
      `Images space: ${state.images.length * 42}MB`,
      `Containers space: ${state.containers.length * 8}MB`,
      `Volumes space: ${state.volumes.reduce((sum, item) => sum + item.bytes, 0)}B`,
    ]);
  if (sub === "prune") {
    const next = clone(state);
    next.containers = next.containers.filter((item) => item.status === "running");
    next.images = next.images.filter((image) =>
      next.containers.some((container) => container.image === image.name),
    );
    return success(next, command, [
      "Deleted Containers: stopped objects",
      "Total reclaimed space: 128MB",
    ]);
  }
  return failure(state, command, `不支持 docker system ${sub}。`);
}

function infoOutput(state: TeachingDockerState): string[] {
  return [
    "Containers: " + state.containers.length,
    " Running: " + state.containers.filter((item) => item.status === "running").length,
    " Images: " + state.images.length,
    " Networks: " + state.networks.length,
    " Volumes: " + state.volumes.length,
    " Server Version: 27.5",
  ];
}

function helpOutput(): string[] {
  return [
    "Docker 仿真命令：run/create/start/stop/restart/kill/rm/rename",
    "镜像：image ls/pull/build/pull/push/tag/rmi",
    "资源：network ls/create/rm、volume ls/create/rm、compose up/down/ps",
    "诊断：ps/logs/exec/inspect/stats/port/info/version/context",
    "输入 docker <command> --help 或点击对象旁的 > 查看下一步。",
  ];
}

function success(
  state: TeachingDockerState,
  command: string,
  output: string[],
): InteractiveDockerResult {
  return { state, output, error: false, command };
}

function failure(
  state: TeachingDockerState,
  command: string,
  message: string,
): InteractiveDockerResult {
  return { state, output: [message], error: true, command };
}

function clone(state: TeachingDockerState): TeachingDockerState {
  return teachingDockerStateSchema.parse(structuredClone(state));
}

function tokenize(input: string): string[] {
  const matches = input.match(/"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|\S+/g) ?? [];
  return matches.map((token) => token.replace(/^['"]|['"]$/g, ""));
}

function parseRunOptions(tokens: string[]) {
  let name: string | undefined;
  let network: string | undefined;
  let volume: string | undefined;
  let port: { host: number; container: number } | undefined;
  const positionals: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]!;
    if (token === "--name") name = tokens[++index];
    else if (token === "--network") network = tokens[++index];
    else if (token === "-v" || token === "--volume") volume = tokens[++index];
    else if (token === "-p" || token === "--publish") {
      const value = tokens[++index]?.split(":");
      if (
        value?.length === 2 &&
        Number.isInteger(Number(value[0])) &&
        Number.isInteger(Number(value[1]))
      ) {
        port = { host: Number(value[0]), container: Number(value[1]) };
      }
    } else if (token === "-d" || token === "-it" || token === "-i" || token === "-t") {
      continue;
    } else if (!token.startsWith("-")) positionals.push(token);
  }
  return { name, network, volume, port, positionals };
}
