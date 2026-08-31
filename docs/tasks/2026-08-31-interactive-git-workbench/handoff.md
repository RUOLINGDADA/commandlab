# 交接

任务已在本地完成。

关键文件：`apps/web/src/lib/interactive-git.ts`、`apps/web/src/components/interactive-git-workbench.tsx`、`apps/web/src/components/terminal-preview.tsx`、`apps/web/src/app/terminal/page.tsx`、`apps/web/src/styles/components.css`。

交付内容：浏览器内存隔离 Git 会话；终端输入、回车/按钮执行、上下键历史、帮助、清屏和重置；Source Control 文件分组、分支/远端/stash 列表、可点击提交图；首页紧凑预览和 `/terminal` 完整工作台。所有错误命令返回原状态，不访问宿主文件或真实 shell。

验证命令：使用 bundled Node/pnpm 执行 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm validate:content`、`pnpm build`。

浏览器验收：`http://localhost:3000/terminal/` 桌面与 390px 均通过；`git status`、`git add src/app.ts`、`git commit -m "保存应用入口"`、点击 `feature`、点击提交节点 `D3` 和首页紧凑终端均已验证。在线沙箱仍不执行真实命令，符合静态站点安全边界。
