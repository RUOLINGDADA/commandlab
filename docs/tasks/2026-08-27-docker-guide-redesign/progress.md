# 进度

## 2026-08-27

- 已调研参考指南的 Hello World、容器、镜像、网络、Dockerfile、Compose、故障排除和最佳实践章节。
- 已确认采用新课程体系、新 slug、混合官方镜像和“主任务 + 变体任务”。
- 已创建分支 `codex/docker-guide-redesign`。
- 已扩展 Docker Schema：每个场景恰好一个主任务和一个变体，答案包含参数、执行流程、状态变化、排查顺序和清理影响范围。
- 已用新 slug 替换全部 24 节 Docker 课程，课程顺序按四级、每级六节组织，旧课程文件已删除。
- 已更新实操组件：主任务/变体标签、答案详情、独立验证、坑点恢复和精确清理折叠区。
- 已补齐 15 个 Docker 百科条目并关联新课程编号；百科总数为 17（含 2 个 Git 条目）。
- 已更新静态导出关键路径为 `/courses/docker/install-engine/`，进度测试同步新步骤编号。
- 已通过 `pnpm validate:content` 和 `pnpm test`（4 个测试文件、11 个测试）。
- 已通过 `pnpm format:check`、`pnpm lint`、`pnpm typecheck`、GitHub Pages 环境下的 `pnpm build` 与 `validate:export`。
- 已完成本地浏览器验收：新首课、答案折叠、平台切换和 15 条 Docker 百科均正常，无横向溢出。
- 已提交 `9183085 feat: redesign Docker guide curriculum`，并推送到 `origin/codex/docker-guide-redesign`。
- Pull Request 创建入口：`https://github.com/RUOLINGDADA/commandlab/pull/new/codex/docker-guide-redesign`。
