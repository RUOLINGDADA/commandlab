# 进度

## 2026-08-31

- 已读取 CommandLab 项目工作流、项目状态和最近交接。
- 已确认主页目前使用 `TerminalPreview compact`，在线终端页使用完整 `InteractiveGitWorkbench`。
- 已对照 ZCode 主页，确认本轮采用首屏任务入口加完整侧栏/主区/终端工作台的布局方向。
- 已移除主页 `TerminalPreview compact`，改为全宽完整 `InteractiveGitWorkbench`，新增任务入口和会话状态侧栏。
- 已通过 `pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm test`（29/29）、`pnpm validate:content`、`pnpm build` 和静态导出校验（11 个关键页面）。
- 浏览器验收通过：桌面主页输入 `git status` 后输出同步；390px 页面 `scrollWidth` 与可视宽度一致，完整工作台计数为 1、紧凑模式为 0。
