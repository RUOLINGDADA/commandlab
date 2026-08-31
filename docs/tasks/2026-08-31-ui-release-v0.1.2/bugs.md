# 缺陷记录

## 当前状态

没有已确认的产品缺陷。

## 环境限制

- 本机默认 Docker 端口 `8080` 已被占用；本地容器验收使用 `18080`，Compose 默认端口保持 `8080`。
- GitHub Actions、PR 合并和 Release 依赖远端网络与当前 GitHub 登录权限；该阻塞已解除，PR #12、Release 和 Pages 均已完成。
- Docker Desktop daemon 未运行时，`docker version` 报无法连接 `dockerDesktopLinuxEngine`；不影响静态构建，需在发布后通过 CI 或启动 daemon 完成镜像验收。
