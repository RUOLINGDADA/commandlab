# 项目状态

- 当前阶段：UI 与 Docker 部署重构已完成，等待 GitHub 网络/登录后发布 `v0.1.2`
- 当前版本：0.1.2
- 目标仓库：`RUOLINGDADA/commandlab`
- 目标站点：`https://ruolingdada.github.io/commandlab/`
- 在线沙箱：首发关闭，显示“暂未开放”
- 远程推送：已完成，`main` 已跟踪 `origin/main`
- GitHub Release：`v0.1.1` 已发布，`v0.1.2` 发布中
- 当前开发分支：`codex/docker-guide-redesign`（Docker 24 节新路径、新 slug 与百科扩充）
- 分支规则：`Protect main` 已启用
- Pages：Actions 部署成功

## 当前任务

- `docs/tasks/2026-08-31-ui-release-v0.1.2/`（本地完成，远端发布受网络与登录阻塞）
- `docs/tasks/2026-08-30-ui-deployment-redesign/`（UI 与 Docker 部署实现及本地验收完成）
- `docs/tasks/2026-08-27-release-v0.1.1/`（发布与线上验收完成）
- `docs/tasks/2026-08-27-docker-course-redesign/`（实现与 PR #9 合并完成）
- `docs/tasks/2026-08-27-docker-guide-redesign/`（实现、验证、提交与分支推送完成，待创建 PR）

## 最近验证

- 内容校验：48 节课程通过
- Lint、TypeScript、Vitest：通过
- Next 静态构建与 `/commandlab` 导出校验：通过
- Docker 指南风格重构：完整工程验证、Pages 导出和浏览器验收通过；功能提交 `9183085` 已推送，最新文档交接提交因网络故障暂未推送
- UI 与部署重构：格式、Lint、TypeScript、Vitest、内容校验、生产构建和 Docker HTTP 冒烟通过；本机 8080 被占用，容器验收使用 18080
- UI 与 `v0.1.2` 发布：本地提交 `146f1aa`、`3d9d05b` 已完成；GitHub 推送因 HTTPS 超时失败，浏览器仓库页未登录，PR/Release/Pages 线上验收待恢复后执行
