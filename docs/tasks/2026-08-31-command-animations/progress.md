# 进度记录

## 2026-08-31

- 完成现有百科加载器、schema、路由、卡片与响应式样式检查。
- 确认搜索栏遮挡来自同一 flex 工具栏，动画重复来自单一 `CommandScene`。
- 新增 `CommandAnimationSpec` schema、按命令 slug 的 56 条注册项和构建期完整性校验。
- 新增命令专属动画舞台与 `/reference/[tool]/[slug]/animation/` 静态路由，支持播放、暂停、逐帧和重播。
- 按动画 kind 实现分支图、暂存、提交、历史、恢复、远端、镜像、容器、网络、卷、编排和清理等不同视觉状态。
- 百科搜索栏拆成独立搜索行与筛选行，卡片增加专属动画入口；390px 浏览器验收无整体横向溢出。
- `pnpm validate:content`、`pnpm test`（14 项）、`pnpm typecheck`、`pnpm lint`、`pnpm build` 已通过。
- 使用 `GITHUB_PAGES=true` 完成静态导出并通过 11 个关键页面校验（含 Git add/branch、Docker run 动画页）。
