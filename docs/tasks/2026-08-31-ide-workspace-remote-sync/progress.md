# 进度

## 2026-08-31

- 已完成只读审计：确认当前 `TeachingGitState` 只有远端引用，没有远端文件集合；`git pull` 尚未同步工作区文件；工作区动作依赖 `contextmenu` 事件。
- 已确认本轮采用可见 `>` 按钮替代右键入口，并继续复用现有仿真命令执行器。
- 已扩展 `remoteFiles` schema 与 Git reducer：支持 `git remote files`、`git remote touch <path>`、远端提交、`git pull` 文件合并、冲突保护、fetch 保留远端提交及 push 同步 clean 文件。
- 工作区文件、分支、提交、远端、stash、远端文件和 Git Graph 节点均提供可见 `>` 入口；Source Control 增加 `Tracked` 文件组，pull 后新增文件显示为 clean。
- 终端候选已覆盖 `git `、`git st`、`git co`、`git remote `、`git pull `、`git push `；输出区域固定高度、内部滚动并使用紧凑 Git 风格行距。
- 回归测试通过：`pnpm test`（6 个文件、29 项）、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm validate:content`、`pnpm build`。
- 浏览器桌面验收通过：可见入口菜单、文件暂存、远端创建、`git pull` 同步、命令候选和状态联动；此前 390px 验收确认无横向溢出、终端内部滚动和菜单视口约束。
