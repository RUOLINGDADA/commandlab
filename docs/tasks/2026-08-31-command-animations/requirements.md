# 命令动画百科与搜索栏重构

## 已确认目标

- 将 Git 与 Docker 百科升级为每条命令独立详情页和独立动画页。
- 每条命令拥有唯一动画注册项、至少 3 个步骤和专属状态变化；Git 分支命令必须展示提交图、指针和分叉/合并。
- 搜索框、主题筛选和命令目录分区布局，桌面、平板、390px 移动端不重叠、不产生整体横向溢出。
- 动画页提供播放、暂停、上一步、下一步、重播、文字讲解、参数、错误恢复、百科和课程链接。

## 范围

- `packages/content-schema` 动画类型。
- `apps/web` 动画注册表、渲染器、独立路由、百科卡片和响应式样式。
- 内容加载校验、测试、项目状态与交接文档。

## 验收标准

- Git 24 条、Docker 32 条百科均可访问 `/reference/[tool]/[slug]/animation/`，注册表数量、ID 与条目完全一致。
- 每条动画至少 3 帧，narration、actors、transition 均非空且按命令变化；分支命令包含 fork/switch/merge/rebase 语义。
- 搜索输入、筛选区 bounding box 不重叠；输入 `--hard`、`branch`、`端口` 可过滤；无结果有推荐词；移动端仅筛选区可横向滚动。
- 动画控件可交互，`prefers-reduced-motion` 下不自动播放并显示最终状态。
- `pnpm validate:content`、`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build` 通过。
