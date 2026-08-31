# 缺陷记录

## 当前状态

没有已确认的产品缺陷。

## 环境限制

- 本机默认 Docker 端口 `8080` 已被占用；本地容器验收使用 `18080`，Compose 默认端口保持 `8080`。
- GitHub Actions、PR 合并和 Release 依赖远端网络与当前 GitHub 登录权限；该阻塞已解除，PR #12、Release 和 Pages 均已完成。
- Docker Desktop 4.88.1 启动时无法移除运行目录中的 `sailor-ingest.sock`，随后后端退出，`docker version` 报无法连接 `dockerDesktopLinuxEngine`；已通过 WSL 将旧 socket、Inference、Vfkit 和 OTLP 文件改名为 `.bak-20260831`，但启动仍会重新创建 `sailor-ingest.sock`。不影响静态构建和已完成的线上部署，需升级/修复 Docker Desktop 后再完成镜像验收。
