# 交接

当前任务已完成终端密度/滚动、工作区右键菜单和终端命令提示。

关键文件：`apps/web/src/components/interactive-git-workbench.tsx`、`apps/web/src/lib/interactive-git.ts`、`apps/web/src/styles/components.css`、`tests/interactive-git.test.ts`。

约束：Git 仿真只在浏览器内存执行，不调用宿主机 Shell/Git；保持当前工作树中用户已有改动。

验证命令：使用 bundled Node/pnpm 执行 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm validate:content` 和 `pnpm build`，全部通过。

浏览器验收：桌面连续输出后终端内部滚动、README/提交/分支/远端右键动作、`git st` 候选和方向键/Tab 选择均通过；390px 视口无整体横向溢出，终端仍有独立滚动。

已知边界：菜单动作仍是浏览器内仿真命令，不执行宿主机 Git；候选列表最多显示 8 项以保持紧凑。
