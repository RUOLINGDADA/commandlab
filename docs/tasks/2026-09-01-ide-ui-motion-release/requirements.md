# IDE 工具风 UI 重设计、教程动画与 v0.2.0 发布

## 已确认目标（2026-09-01 与用户确认）

1. 收尾未提交的「交互式 Docker 工作台」，并入本轮一起完成。
2. UI 全站重设计为 IDE 工具风：深色为主、密集排版、等宽字体、真实编辑器控件（活动栏/侧栏/标签页/状态栏），去除渐变紫蓝、玻璃拟态、emoji 装饰、营销腔等「AI 感」。
3. 教程动画嵌入课程正文：Git/Docker 课程页关键命令直接内嵌可播放动画（复用并完善现有动画引擎），同时打磨 56 条命令动画的中间态与节奏。
4. 在线终端升级为 VSCode/IntelliJ 级 Git 工具模拟：Source Control 提交框、暂存勾选、分支选择器、状态栏、差异/历史视图等。
5. 完成后发布 v0.2.0：PR、Release、GitHub Pages。

## 范围

- `apps/web/src/styles/`（foundation/components/pages）整体重写为 IDE 设计体系。
- 全局布局、站点头部、首页、学习目录、课程详情、百科、动画详情、终端页逐一适配。
- 交互式 Git 工作台组件升级为 IDE 级 Git 工具模拟。
- 交互式 Docker 工作台收尾并通过验收。
- 课程详情页嵌入命令动画播放器；动画引擎帧打磨。
- 发布流程：PR → main → Release v0.2.0 → Pages 验收。

## 不包含

- 不创建真实在线沙箱（不调用宿主机 Git/Docker/Shell）。
- 不改变课程 Schema、百科内容模型与已有课程正文文本的教学结构（仅新增动画嵌入区块）。
- 不改 CI/Action 工作流本身，除非发布所需。

## 验收标准

- 全站桌面与 390px：无整体横向溢出；视觉呈现为 IDE 工具风，无紫蓝渐变、玻璃拟态卡片与 emoji 装饰残留。
- Git 工作台具备：变更/暂存分组的 Source Control 面板、提交信息输入与提交按钮、分支切换、状态栏（分支/同步状态）、文件差异查看，行为与 VSCode/IntelliJ 对应交互一致。
- Docker 工作台：`docker run/ps/stop/image ls/network create/volume create/compose up -d` 可用，错误保留原状态；对象行可点击；终端独立滚动。
- Git/Docker 课程详情页：关键命令处内嵌可播放动画，播放/暂停/速度控制可用。
- `pnpm validate:content`、`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build` 与 Pages 强制构建导出全部通过。
- PR 合并后 Release v0.2.0 与 Pages 工作流成功，线上关键路径 HTTP 200。
