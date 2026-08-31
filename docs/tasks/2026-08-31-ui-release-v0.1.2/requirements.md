# CommandLab UI 与部署发布需求

## 已确认目标

完成 UI 与 Docker 部署重构的本地收尾，并通过 Pull Request 发布到 `RUOLINGDADA/commandlab`，创建 `v0.1.2` Release，更新 GitHub Pages。

## 包含范围

- 提交现有 UI、响应式样式、文案和 Docker 一键部署配置。
- 将根项目与工作区包版本统一更新到 `0.1.2`。
- 执行格式、Lint、类型、测试、内容、静态导出和 Docker HTTP 验证。
- 推送短期分支，创建并合并 Pull Request。
- 通过 `Create release` 工作流创建 `v0.1.2` 并确认 Pages 部署与关键页面可访问。
- 更新项目状态、任务索引、进度、决策、缺陷和交接文档。

## 不包含范围

- 不新增后端、账号、数据库或在线终端/沙箱。
- 不改变 Git / Docker 课程数量与课程数据模型。
- 不删除历史 Release、标签或远程资源。

## 验收标准

- `pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm validate:content`、Pages 构建/导出和 Docker HTTP 冒烟全部通过。
- PR 必需检查通过并以 Squash 方式合并到 `main`。
- GitHub Release 页面存在 `v0.1.2`，目标为合并后的最新 `main`。
- `https://ruolingdada.github.io/commandlab/` 及首页、学习页、Docker 课程页、百科页、进度页和终端页可访问，子路径资源正常加载。
- 项目状态、任务档案和交接文档准确记录完成项、验证命令和剩余风险。
