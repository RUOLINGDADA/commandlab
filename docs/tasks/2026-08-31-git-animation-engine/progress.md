# 进度记录

## 2026-08-31

- 检查现有 CommandLab 动画实现及 `learnGitBranching-main` 的 Visualization、VisNode、VisEdge、VisBranch、VisStagingArea 和 AnimationQueue。
- 确认采用纯 TypeScript 内存状态机 + React/SVG 重实现，不复制参考项目源码，不执行真实命令。

## 2026-08-31（续）

- 新增 TeachingScene、TeachingFrame、TeachingState、TeachingEvent 类型与 Git/Docker adapter。
- Git reducer 覆盖 24 个百科命令；56 条百科均生成独立六阶段场景和静态动画路由。
- Git 画布支持提交节点/边、分支指针、HEAD、标签、远端引用、工作区、暂存区、stash 抽屉；Docker 画布支持镜像、容器、网络、卷和端口映射。
- 修正分支场景初始 HEAD、commit 场景暂存快照、远端旧引用，确保 switch/merge/rebase/push/fetch 有实际状态变化。
- 完成桌面与 390px 浏览器检查：搜索/布局无整体横向溢出；暂停、下一步、重播和缩放控件可用。
- 验证通过：`pnpm validate:content`、`pnpm test`（20 项）、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、普通构建、`GITHUB_PAGES=true TURBO_FORCE=true pnpm build`、静态导出 11 页校验。

## 2026-08-31（可读性重构续）

- 将动画工作台从固定窄侧栏改为全宽 IDE 式布局：终端横向工具栏、文件/暂存区大面板、提交图与引用大画布。
- SVG 视图扩大到 1180×620，提交节点、分支指针、文件 chip、Docker 对象和文字字号同步放大；移动端保留画布局部横向滚动，页面整体无溢出。
- 新增“这条命令实际改变了什么”状态摘要，按工作区、暂存区、提交、分支、HEAD、远端和 stash 的前后快照生成说明。
- 新增命令动作路径：add 文件移动、commit 封存、branch 指针出现、merge 双父汇合、rebase 重放、stash 收进抽屉、恢复路径和远端传输。
- 默认播放速度调整为 0.7x，并提供 0.5x/0.7x/1x 控制；执行帧和最终帧均保留逐步查看。
- 浏览器验收：桌面画布约 1179px 宽；merge 执行帧显示 2 条汇合路径和 2 个高亮父节点；add 执行帧显示工作区到暂存区动作；390px 页面 `scrollWidth` 小于视口宽度。

## 2026-08-31（中间状态续）

- Git/Docker 时间轴扩展为 8 个阶段：准备、4 个逐字输入帧、执行、状态变化、完成；默认播放速度降为 0.5x，并保留 0.7x/1x。
- 新增 `createGitTransitionState`：commit/merge/rebase/cherry-pick/revert 先生成节点再移动指针，branch 先生成引用，reset 先移动引用，stash/远端先改变对象清单。
- Git 画布在执行帧显示命令动作路径，在状态变化帧显示中间节点和高亮父线；Docker 画布显示镜像、容器、网络、卷、端口的前后摘要。
- 浏览器确认 commit 第 4 帧仍在逐字输入，第 6 帧显示执行说明，第 7 帧出现 D2 节点但 HEAD 仍在 B；merge 第 7 帧显示 D3、双父动作路径和旧 HEAD。
- 最新 `pnpm format:check`、`pnpm build`、`GITHUB_PAGES=true TURBO_FORCE=true pnpm build` 与静态导出校验通过。
