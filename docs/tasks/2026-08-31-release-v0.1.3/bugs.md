# Bug 记录

## 待确认：Docker Desktop 本机引擎

- 既有记录显示 Docker Desktop 4.88.1 在本机启动时无法处理 `sailor-ingest.sock`；该问题不影响本次静态构建、GitHub Actions 或 Pages 发布。
- 发布验收以 CI、Pages 构建和线上 HTTP 为准；本机 Docker Compose 补验仍作为独立环境事项跟踪。
