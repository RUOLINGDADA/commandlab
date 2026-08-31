# 项目状态

- 当前阶段：v0.1.3 已发布，交互式 Git 工作台与远端同步功能已上线
- 当前版本：0.1.3
- 目标仓库：`RUOLINGDADA/commandlab`
- 目标站点：`https://ruolingdada.github.io/commandlab/`
- 在线沙箱：首发关闭，显示“暂未开放”
- 远程推送：已完成，`main` 已跟踪 `origin/main`
- GitHub Release：`v0.1.3` 已发布（`a71e6ba`）
- 当前开发分支：`main`（已快进至 `origin/main`）
- 分支规则：`Protect main` 已启用
- Pages：Actions #4 部署成功，线上验收通过

## 当前任务

- `docs/tasks/2026-08-31-interactive-git-workbench/`（交互式 Git 仿真终端与可点击工作区已完成本地实现与验收）
- `docs/tasks/2026-08-31-terminal-density-context-menu/`（终端固定滚动、紧凑输出、工作区右键菜单与命令提示已完成本地实现与验收）
- `docs/tasks/2026-08-31-ide-workspace-remote-sync/`（可见 `>` 操作入口、远端文件仿真、`git pull` 工作区同步已完成本地实现与验收）
- `docs/tasks/2026-08-31-home-live-workbench/`（主页已替换为完整在线 Git 工作台，并完成 ZCode 风格首屏布局验收）
- `docs/tasks/2026-08-31-release-v0.1.3/`（版本统一、main 合并、GitHub Release 与 Pages 部署，已完成）
- `docs/tasks/2026-08-31-commandlab-redesign/`（UI、Git 课程深度练习、百科扩充已完成；待后续发布决策）
- `docs/tasks/2026-08-31-reference-motion/`（全量命令百科、参数解析、首页工作区动效和响应式验收完成）
- `docs/tasks/2026-08-31-ui-release-v0.1.2/`（PR #12、Release `v0.1.2` 和 Pages 已完成；Docker 本机补验待环境修复）
- `docs/tasks/2026-08-31-git-animation-engine/`（Git 状态机、SVG 提交图、Docker adapter 与全量动画验收完成）
- `docs/tasks/2026-08-31-command-specific-ui/`（每命令专属动画 UI、VS Code 风格 Git 工作区与响应式验收完成）
- `docs/tasks/2026-08-30-ui-deployment-redesign/`（UI 与 Docker 部署实现及本地验收完成）
- `docs/tasks/2026-08-27-release-v0.1.1/`（发布与线上验收完成）
- `docs/tasks/2026-08-27-docker-course-redesign/`（实现与 PR #9 合并完成）
- `docs/tasks/2026-08-27-docker-guide-redesign/`（实现、验证、提交与分支推送完成，待创建 PR）

## 最近验证

- 交互式 Git 仿真：浏览器内命令执行器、Source Control/Git Graph/终端工作台已完成；24 条 Git 百科命令及常见查询命令均有反馈；桌面/390px 浏览器验收与工程检查通过
- 终端工作台续作：输出区域固定高度并内部滚动，命令行密度收紧；文件/分支/提交/远端/stash 支持上下文动作；`git `、`git st`、`git co` 支持候选与 Tab/方向键选择；桌面/390px 验收通过
- IDE 工作区远端同步续作：文件/分支/提交/远端/stash/远端文件/Git Graph 节点旁增加可见 `>` 操作入口；远端表单和 `git remote touch/files` 可创建/查看远端文件，`git pull` 将新增文件同步为 Tracked clean 状态并生成合并提交；新增冲突保护、命令候选和回归测试，桌面/390px 验收通过
- 内容校验：48 节课程通过
- Lint、TypeScript、Vitest：通过
- Next 静态构建与 `/commandlab` 导出校验：通过
- Docker 指南风格重构：完整工程验证、Pages 导出和浏览器验收通过；功能提交 `9183085` 已推送，最新文档交接提交因网络故障暂未推送
- UI 与部署重构：格式、Lint、TypeScript、Vitest、内容校验、生产构建和 Docker HTTP 冒烟通过；本机 8080 被占用，容器验收使用 18080
- UI 与 `v0.1.2` 发布：PR #12 已合并，Release 工作流 #3 与 Pages 工作流 #3 成功；线上关键路径 HTTP 200；Dependabot PR #14 已合并且 esbuild 告警为 Fixed
- Docker 本机补验：已通过 WSL 将 Docker Desktop 运行目录中的旧 socket 文件改名为 `.bak-20260831`（可恢复）；Docker Desktop 4.88.1 仍在启动时重新创建 `sailor-ingest.sock` 并退出，需升级/修复 Docker Desktop 后再运行 Compose 验收
- CommandLab 重构：内容校验通过（48 节课程、27 条百科），格式、Lint、TypeScript、Vitest、生产构建通过；浏览器桌面/移动端验收通过，移动端横向溢出已修复
- 命令百科与首页动效重构：Git 24 条、Docker 32 条百科均提供归一化语法和参数模型；首页工作区、入场/滚动/悬浮动效完成；百科搜索与 390px 移动端溢出检查通过
- 命令动画百科与搜索栏重构：56 条百科全部注册独立动画 spec 和静态演示页；Git 分支舞台包含提交节点、指针、分叉、合并/重放语义；搜索与筛选拆行并完成桌面/390px 验收
- Git 命令动画引擎重构：Git reducer 覆盖 24 条命令，场景统一为六阶段时间轴；add/commit/branch/switch/merge/rebase/reset/stash/fetch/push 等关键状态变化完成浏览器验收；普通构建、GitHub Pages 强制构建和 11 页导出校验通过
- 动画可读性重构：动画详情页改为全宽 IDE 式工作台，SVG 扩大至 1180×620，新增前后状态摘要、文件/提交/分支/远端动作路径和 0.5x/0.7x/1x 播放速度；桌面与 390px 浏览器验收通过
- 动画中间状态重构：时间轴扩展为 8 帧逐字输入与对象生成/指针移动分离，默认 0.5x；commit/merge/rebase 与 Docker 生命周期在中间帧显示真实节点、路径和前后快照
- 主页在线工作台续作：主页移除 `TerminalPreview compact`，首屏改为任务入口加完整 `InteractiveGitWorkbench`；桌面输入 `git status` 后终端输出和状态同步，390px 页面整体无横向溢出，完整工作台与紧凑模式计数分别为 1/0。
