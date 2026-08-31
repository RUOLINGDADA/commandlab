# 项目总交接

项目已完成从空目录构建的 GitHub 首发版本，并完成 Docker 24 节课程深度重设计的本地实现与验证。继续工作前请阅读当前任务目录和 `.agents/skills/commandlab-project-workflow/SKILL.md`。

Docker 课程重设计已经通过 PR #9 合并，版本 PR #10 已完成。`v0.1.1` Release 与 GitHub Pages 部署成功，线上 Docker 第一课已确认显示逐步案例、三平台指引、折叠答案和步骤完成状态。

当前发布任务 `docs/tasks/2026-08-31-release-v0.1.3/` 已完成。PR #12 已通过 5/5 检查并 Squash 合并到 `main@5bd5560`；`v0.1.2` Release 与 Pages 工作流 #3 均成功。最新 PR #16 已通过 5/5 检查并 Squash 合并到 `main@a71e6ba`；`v0.1.3` Release 与 Pages 工作流 #4 均成功，线上首页与终端页返回 HTTP 200。Dependabot PR #14 已合并，esbuild 告警状态为 Fixed。Docker Desktop 4.88.1 因启动时无法移除 `sailor-ingest.sock` 而退出；已从 WSL 视角将旧 socket 文件改名为可恢复备份，但启动仍会重新创建并失败。恢复或升级 Docker Desktop 后执行 `docker compose -p commandlab up -d --build` 完成最后的镜像与 HTTP 验收。

本轮 `docs/tasks/2026-08-31-commandlab-redesign/` 已完成本地 UI、Git 深度练习组件和百科扩充。Git 详情页现在与 Docker 使用相同的双步骤任务闭环；学习目录使用文档式侧栏、搜索和工具筛选。验证命令：`pnpm validate:content`、`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build`。工作区依赖缺少全局 Node 时，使用 `load_workspace_dependencies` 返回的 bundled Node 与 pnpm 路径执行。

本轮 `docs/tasks/2026-08-31-reference-motion/` 已完成全量命令百科与首页动效：百科当前 Git 24 条、Docker 32 条，加载器统一补齐 `syntax`/`parameters`；首页新增工作区预览、状态浮层、入场和滚动显现；百科支持命令、参数、错误搜索。桌面/390px 移动端浏览器验收通过，未执行线上发布。

本轮 `docs/tasks/2026-08-31-command-animations/` 已完成命令独立动画架构：新增 `CommandAnimationSpec` schema、56 条命令注册表、按 kind 复用且按命令配置帧的动画舞台，以及 `/reference/[tool]/[slug]/animation/` 静态路由。百科搜索工具栏拆成独立搜索行和局部滚动筛选行，卡片提供动画入口。已完成内容校验、14 项测试、TypeScript、Lint、格式、生产构建和桌面/390px 浏览器验收；未执行线上发布。

本轮 `docs/tasks/2026-08-31-git-animation-engine/` 已完成 Git 命令动画引擎重构：TeachingScene/TeachingFrame/TeachingState 类型、Git 内存 reducer、六阶段时间轴、SVG 提交图与 Docker adapter 已接入。Git 分支初始 HEAD、commit 暂存快照和远端旧引用已修正；stash 抽屉与 Docker 端口映射已加入画布。20 项测试、内容校验、Lint、TypeScript、格式、普通构建、`GITHUB_PAGES=true TURBO_FORCE=true pnpm build` 和 11 页静态导出校验通过。浏览器已验收 add/commit/branch/merge/rebase/reset/stash/fetch、Docker run、播放控制及 390px 无整体横向溢出。开发服务器 `http://localhost:3000` 保持运行，未执行线上发布。

随后又加入 8 帧逐字输入时间轴和 `createGitTransitionState` 中间快照：commit/merge/rebase 等先展示节点生成，再展示 HEAD/分支指针移动；Docker 增加镜像、容器、网络、卷、端口的前后状态摘要。默认播放速度为 0.5x，最新普通/Pages 构建与静态导出验证通过。

在该任务的可读性续作中，动画详情页进一步改为全宽 IDE 式工作台：终端横向工具栏、文件/暂存区面板、1180×620 提交图画布、前后状态摘要和命令专属动作路径；默认播放速度为 0.7x，并可切换 0.5x/1x。桌面 merge/add 与 390px 移动端均已实测，最新普通构建、强制 Pages 构建和静态导出校验通过。

最新续作 `docs/tasks/2026-08-31-command-specific-ui/` 已完成：动画页面不再让所有命令共用同一主画布，新增按 tool/slug 注册的专属视图。Git 工作区现在有当前分支、HEAD、ahead/behind、Source Control 文件分组、提交历史侧栏和中央 Git Graph；重点命令分别使用暂存传送带、引用指针板、HEAD 切换板、双父汇合板、重放队列、三棵树、stash 抽屉和远端双泳道。Docker 按镜像、容器、网络、卷、编排、清理和诊断使用不同焦点舞台。浏览器已检查桌面和 390px；工程验证通过内容校验、20 项测试、类型、lint、格式和生产构建。

当前任务 `docs/tasks/2026-08-31-interactive-git-workbench/` 已完成：新增 `apps/web/src/lib/interactive-git.ts` 与 `apps/web/src/components/interactive-git-workbench.tsx`，并将 `/terminal`、首页和课程紧凑预览接入交互工作台。命令执行只改变内存 `TeachingGitState`，错误返回原状态；工作区文件、分支、提交、远端和 stash 可点击，终端支持输入、历史、帮助、清屏和重置。已通过 `pnpm test`（6 个文件、24 项）、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm validate:content`、`pnpm build`，并完成桌面/390px 浏览器验收。

续作 `docs/tasks/2026-08-31-terminal-density-context-menu/` 已完成：终端工作台网格使用固定高度，输出区域独立滚动且采用紧凑 Git 风格行距；工作区文件、分支、提交、远端和 stash 行支持边界内右键菜单，动作通过仿真命令执行器回放；终端候选支持 `git `、`git st`、`git co` 和常用参数模板，可用方向键、Tab 或点击选择。新增候选/菜单映射单测，完整工程验证和桌面/390px 浏览器验收通过。工作台仍只运行浏览器内存状态，不调用宿主机 Git/Shell。

最新续作 `docs/tasks/2026-08-31-ide-workspace-remote-sync/` 已完成：浏览器右键不稳定的问题改为所有工作区对象旁显示可见 `>` 操作入口，菜单动作继续通过仿真命令回放；Git 状态新增受 schema 校验的 `remoteFiles` 快照，支持远端表单、`git remote files`、`git remote touch <path>`、远端提交以及 `git pull` 将远端新增/更新文件同步到本地 Tracked clean 文件。pull 会生成合并提交，并对本地未提交同路径文件报告冲突且不覆盖。命令候选覆盖 `git remote `、`git pull ` 和 `git push `。已通过 29 项测试、类型、Lint、格式、内容校验、生产构建和桌面/390px 浏览器验收；工作台仍只运行在浏览器内存会话。
