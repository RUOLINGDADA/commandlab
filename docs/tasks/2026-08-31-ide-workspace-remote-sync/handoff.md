# 交接

当前任务已完成可见 `>` 工作区操作入口、远端文件仿真和 `git pull` 文件同步。

关键文件：`packages/content-schema/src/index.ts`、`apps/web/src/lib/teaching/git-engine.ts`、`apps/web/src/lib/interactive-git.ts`、`apps/web/src/components/interactive-git-workbench.tsx`、`apps/web/src/styles/components.css`、`tests/interactive-git.test.ts`。

约束：所有 Git 行为继续限定在浏览器内存会话；不创建真实远端、不执行宿主机命令、不读写用户本地文件。

验证：使用 bundled Node/pnpm 执行 `pnpm test`（29/29）、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm validate:content` 和 `pnpm build` 均通过。开发服务器为 `http://localhost:3000`，桌面浏览器已验收入口菜单、候选、远端创建和 pull 同步；390px 验收已确认无整体横向溢出、终端内部滚动和菜单视口约束。

风险与下一步：普通 PowerShell 环境没有全局 Node，工程命令需要先把 `C:\Users\zhoujinyuan\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin` 加入 `PATH`。当前浏览器控制连接不提供动态 viewport API，因此本轮移动端证据沿用此前已通过的 390px 验收；代码中的 `1040px`、`720px` 响应式分支保持不变。`git-engine.ts` 的 fetch 仍以初始远端引用兼容既有测试，后续可用明确的远端初始状态字段替代。
