import { describe, expect, it } from "vitest";
import {
  createInteractiveDockerState,
  executeInteractiveDockerCommand,
  getInteractiveDockerCommandSuggestions,
  getInteractiveDockerContextActions,
} from "../apps/web/src/lib/interactive-docker";

describe("interactive Docker simulator", () => {
  it("docker run 创建容器、端口和镜像关系", () => {
    const initial = createInteractiveDockerState();
    const result = executeInteractiveDockerCommand(
      initial,
      "docker run --name api -p 8080:80 nginx:latest",
    );
    expect(result.error).toBe(false);
    expect(result.state.containers.find((item) => item.name === "api")?.status).toBe("running");
    expect(result.state.ports).toContainEqual({ host: 8080, container: 80, target: "api" });
  });

  it("docker stop 改变容器生命周期状态", () => {
    const initial = createInteractiveDockerState();
    const result = executeInteractiveDockerCommand(initial, "docker stop web");
    expect(result.state.containers.find((item) => item.name === "web")?.status).toBe("stopped");
    expect(result.output.join("\n")).toContain("stop web");
  });

  it("支持创建网络和卷", () => {
    const initial = createInteractiveDockerState();
    const network = executeInteractiveDockerCommand(initial, "docker network create app-net");
    const volume = executeInteractiveDockerCommand(network.state, "docker volume create app-data");
    expect(volume.state.networks).toContain("app-net");
    expect(volume.state.volumes.map((item) => item.name)).toContain("app-data");
  });

  it("docker compose up -d 同步服务、网络、卷和端口", () => {
    const result = executeInteractiveDockerCommand(
      createInteractiveDockerState(),
      "docker compose up -d",
    );
    expect(
      result.state.containers
        .filter((item) => item.name.startsWith("commandlab-"))
        .every((item) => item.status === "running"),
    ).toBe(true);
    expect(result.state.networks).toContain("commandlab-net");
    expect(result.state.volumes.map((item) => item.name)).toContain("commandlab-db-data");
    expect(result.state.ports).toContainEqual({
      host: 8081,
      container: 80,
      target: "commandlab-web",
    });
  });

  it("错误命令保留原状态", () => {
    const initial = createInteractiveDockerState();
    const before = JSON.stringify(initial);
    const result = executeInteractiveDockerCommand(initial, "docker stop missing");
    expect(result.error).toBe(true);
    expect(JSON.stringify(result.state)).toBe(before);
  });

  it("命令提示覆盖 Docker 高频前缀", () => {
    expect(
      getInteractiveDockerCommandSuggestions("docker st").map((item) => item.command),
    ).toContain("docker stop web");
    expect(getInteractiveDockerCommandSuggestions("docker ").length).toBeGreaterThan(0);
    expect(getInteractiveDockerCommandSuggestions("npm ")).toEqual([]);
  });

  it("资源对象映射可回放的上下文动作", () => {
    const actions = getInteractiveDockerContextActions({
      kind: "container",
      id: "ctr-web",
      label: "web",
      status: "running",
    });
    expect(actions.map((item) => item.command)).toEqual(
      expect.arrayContaining(["docker stop web", "docker logs web", "docker inspect web"]),
    );
  });

  it("docker image rmi 删除未使用镜像并保护在用镜像", () => {
    const initial = createInteractiveDockerState();
    const blocked = executeInteractiveDockerCommand(initial, "docker image rmi nginx:latest");
    expect(blocked.error).toBe(true);
    const pulled = executeInteractiveDockerCommand(initial, "docker pull alpine:latest");
    const removed = executeInteractiveDockerCommand(pulled.state, "docker image rmi alpine:latest");
    expect(removed.state.images.map((item) => item.name)).not.toContain("alpine:latest");
  });

  it("诊断输出包含端口、网络、健康状态和资源指标", () => {
    const initial = createInteractiveDockerState();
    const logs = executeInteractiveDockerCommand(initial, "docker logs web");
    const inspect = executeInteractiveDockerCommand(initial, "docker inspect web");
    const stats = executeInteractiveDockerCommand(initial, "docker stats web");
    expect(logs.output.join("\n")).toContain("network=bridge");
    expect(inspect.output.join("\n")).toContain("Health: healthy");
    expect(stats.output.join("\n")).toContain("NET I/O");
  });

  it("支持容器分组、镜像层历史和 Compose 配置预览", () => {
    const initial = createInteractiveDockerState();
    expect(executeInteractiveDockerCommand(initial, "docker container ls -a").output[0]).toContain(
      "PORTS",
    );
    expect(
      executeInteractiveDockerCommand(initial, "docker image history nginx:latest").output,
    ).toEqual(expect.arrayContaining([expect.stringContaining("CREATED BY")]));
    expect(executeInteractiveDockerCommand(initial, "docker compose config").output).toContain(
      "services:",
    );
  });
});
