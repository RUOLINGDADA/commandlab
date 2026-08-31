# 进度

## 2026-08-31

- 完成只读检查：确认现有 `git-engine` 覆盖 24 条 Git 百科命令，但当前终端与首页工作区仍为静态预览。
- 已确认复用 `TeachingGitState` 与既有 schema，新增交互层不改变动画页契约。
- 新增 `interactive-git.ts`：支持引号参数、24 条百科命令、常见查询命令、历史/清屏/帮助和错误状态回滚。
- 新增 `interactive-git-workbench.tsx`：Source Control、Git Graph、远端/stash 和终端输入共享内存状态；首页紧凑预览与 `/terminal` 已接入。
- 浏览器验收：桌面与 390px 均无整体横向溢出；实测 `status`、`add`、`commit`、`switch`、`show`、`log` 及首页输入。
- 工程验证：`pnpm test`（6 个文件、24 项）、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm validate:content`、`pnpm build` 全部通过。
