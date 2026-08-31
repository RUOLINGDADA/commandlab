# 项目总交接

项目已完成从空目录构建的 GitHub 首发版本，并完成 Docker 24 节课程深度重设计的本地实现与验证。继续工作前请阅读当前任务目录和 `.agents/skills/commandlab-project-workflow/SKILL.md`。

Docker 课程重设计已经通过 PR #9 合并，版本 PR #10 已完成。`v0.1.1` Release 与 GitHub Pages 部署成功，线上 Docker 第一课已确认显示逐步案例、三平台指引、折叠答案和步骤完成状态。

当前发布任务在 `docs/tasks/2026-08-31-ui-release-v0.1.2/`。UI 与 Docker 部署重构已完成本地实现、质量检查和静态导出，用户已确认继续执行 GitHub 发布。本地提交 `146f1aa`、`3d9d05b` 已完成；推送因 GitHub HTTPS 网络超时失败，浏览器仓库页未登录，因此 PR、Release 和 Pages 线上验收尚未执行。网络恢复并登录后，先推送 `codex/docker-guide-redesign`，创建并合并 Pull Request，再运行 `Create release` 创建 `v0.1.2`，等待 Pages 部署并执行线上验收。旧的 Docker 课程任务仍保留用于历史交接。分支已将 Docker 课程替换为新 24 节路径和新 slug，扩展步骤 Schema 与折叠交互，并补齐计划中的 15 个 Docker 百科条目。
