# Git 命令动画引擎重构

## 已确认目标

- 参考 `learnGitBranching-main` 的状态建模、提交图、分支指针、暂存区和动画队列，重做 CommandLab 命令动画。
- 页面自动逐字输入命令，不执行本机 Git/Docker。
- Git 命令进入内存教学状态机，SVG 画布根据状态差异展示真实对象变化。
- 每条 Git 百科命令拥有独立场景、命令脚本、初始状态、事件和讲解；Docker 共用时间轴和页面接口。

## 范围

- `packages/content-schema` 教学场景和状态快照类型。
- `apps/web/src/lib/teaching` Git reducer、时间轴、场景注册和 Docker adapter。
- `apps/web/src/components/command-animation.tsx` SVG 画布、终端、控制器和响应式布局。
- 动画详情页、内容加载器、测试、任务交接文档。

## 验收标准

- 24 条 Git 百科命令均有独立可校验场景；每条至少包含 idle、typing、executing、transitioning、settled 五个阶段。
- `git add` 展示文件进入暂存区，`commit` 展示新提交与指针前移，`branch/switch/merge/rebase` 展示真实提交图变化，恢复和远端命令展示各自对象变化。
- 页面自动显示完整命令输入，终端、事件说明和 SVG 状态同步。
- 播放、暂停、上一步、下一步、重播、缩放和重置视图可用；移动端无整体横向溢出；reduced-motion 直接显示最终状态。
- Docker 现有动画可通过同一控制器和时间轴访问。
- `pnpm validate:content`、`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build` 与静态导出校验通过。
