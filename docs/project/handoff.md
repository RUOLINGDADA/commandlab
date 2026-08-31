# 项目总交接

项目已完成从空目录构建的 GitHub 首发版本，并完成 Docker 24 节课程深度重设计的本地实现与验证。继续工作前请阅读当前任务目录和 `.agents/skills/commandlab-project-workflow/SKILL.md`。

Docker 课程重设计已经通过 PR #9 合并，版本 PR #10 已完成。`v0.1.1` Release 与 GitHub Pages 部署成功，线上 Docker 第一课已确认显示逐步案例、三平台指引、折叠答案和步骤完成状态。

当前发布任务在 `docs/tasks/2026-08-31-ui-release-v0.1.2/`。PR #12 已通过 5/5 检查并 Squash 合并到 `main@5bd5560`；`v0.1.2` Release 与 Pages 工作流 #3 均成功，线上首页、学习页、Docker 课程页、百科页、进度页和终端页返回 HTTP 200。Dependabot PR #14 已合并，esbuild 告警状态为 Fixed。Docker Desktop 4.88.1 因启动时无法移除 `sailor-ingest.sock` 而退出；已从 WSL 视角将旧 socket 文件改名为可恢复备份，但启动仍会重新创建并失败。恢复或升级 Docker Desktop 后执行 `docker compose -p commandlab up -d --build` 完成最后的镜像与 HTTP 验收。旧的 Docker 课程任务仍保留用于历史交接。分支已将 Docker 课程替换为新 24 节路径和新 slug，扩展步骤 Schema 与折叠交互，并补齐计划中的 15 个 Docker 百科条目。
