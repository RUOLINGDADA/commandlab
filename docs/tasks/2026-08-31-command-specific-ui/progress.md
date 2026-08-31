# 进度记录

## 2026-08-31

- 读取项目工作流、状态、交接和 Git 动画引擎任务档案。
- 确认现有 `CommandAnimation` 的时间轴与状态机可复用，但 `GitCanvas`/`DockerCanvas` 仍是公共布局，无法满足每个命令独立 UI 的要求。
- 确认本轮将以专属视图注册表拆分视觉层，并补齐 VS Code 风格 Git 工作区信息层。

## 2026-08-31（实现与验收）

- 新增 `command-specific-views.tsx`：56 条 Git/Docker 命令均有唯一视图注册项、布局类型、色彩重点和专属标题。
- Git 舞台改为 IDE 式结构：当前分支/HEAD/ahead/behind 顶栏、Source Control 左栏、Changes/Staged/Untracked 分组、提交历史和中央 Git Graph。
- Git add/commit、branch、switch、merge、rebase/cherry-pick、reset/restore、stash、fetch/pull/push、诊断命令分别加入暂存传送带、引用指针板、HEAD 切换板、双父汇合板、重放队列、三棵树、stash 抽屉、远端双泳道和证据检查台。
- Docker 镜像、容器、网络、卷、编排、清理和诊断命令按对象类型加入不同的专属焦点卡和 Engine 快照面板。
- 浏览器验收：Git 9 个重点命令和 Docker run 均显示各自 `data-command-view`/`data-focus-board`；桌面截图确认 Graph 与当前分支信息可见；390px 页面无整体横向溢出且 Source Control/main 舞台正确堆叠。
- 工程验收：`pnpm validate:content`、`pnpm test`（20 项）、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build` 通过。
