# 交互式 Docker 工作台

## 已确认目标

- 在现有 24 节 Docker 课程和 32 条百科之外，补齐一个可以直接操作的 Docker 仿真工作台。
- 终端支持常见 Docker 命令输入与提示；镜像、容器、网络、卷和 Compose 对象可点击并触发对应仿真命令。
- 工作台采用浏览器内存会话，不调用宿主机 Docker Engine、Shell、文件系统或公网仓库。

## 范围

- 新增 Docker 状态 reducer/命令执行器和工作台 UI。
- 在 `/courses/docker/` 学习路径中提供完整 Docker 工作台入口。
- 覆盖课程高频对象生命周期、镜像操作、端口/网络/卷、Compose、诊断和清理命令。

## 不包含

- 不创建真实在线 Docker 沙箱，不执行宿主机命令。
- 不改变已有 Docker 课程 Schema、正文、平台指引和答案复制流程。

## 验收标准

- 用户可在 Docker 工作台输入并执行 `docker run`、`docker ps`、`docker stop`、`docker image ls`、`docker network create`、`docker volume create`、`docker compose up -d` 等命令。
- 命令执行后，镜像/容器/网络/卷/端口面板和终端输出同步变化；错误命令保留原状态并显示可读错误。
- 对象行可点击，至少提供启动、停止、日志、检查、删除或清理等上下文动作；命令输入支持常用 Docker 子命令提示和历史。
- 桌面与 390px 窄屏布局无整体横向溢出，终端输出拥有独立滚动区域。
- 内容校验、Lint、TypeScript、测试、构建和 Pages 静态导出通过。
