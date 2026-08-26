# 进度

## 2026-08-27

- 已确认仓库所有者、仓库名、许可和 GitHub Pages 发布方式。
- 已创建项目级 Skill、需求门槛、文档协议和中文编码规范。
- 已完成 pnpm/Turborepo/Next.js 静态网站、共享 Schema、IndexedDB 进度与统一练习运行时。
- 已生成 Git 与 Docker 各 24 节课程，内容校验通过（共 48 节）。
- 已完成 GitHub 仓库治理文件、Issue/PR 模板、Dependabot、CI、CodeQL、Release 和 Pages 工作流。
- 已通过 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm validate:content`、Pages 构建和静态导出检查。
- 已通过本地浏览器首页、课程页、互动题反馈和在线终端占位状态冒烟检查。
- 已使用本机 Git 成功推送 `main` 到 `https://github.com/RUOLINGDADA/commandlab.git`，远程分支校验通过。

## 2026-08-27（GitHub 首发收尾）

- 已创建并启用 `Protect main` 分支规则集：要求 Pull Request、`quality` 状态检查，禁止删除和强制推送，仅允许 Squash 合并。
- 已将仓库默认分支确认​​为 `main`，补充仓库描述、Pages 首页地址和 GitHub Topics。
- 已启用 Dependabot Alerts、Dependabot Security Updates、Secret Scanning、Push Protection 和 Private Vulnerability Reporting。
- 已创建并发布 GitHub Release `v0.1.0`，目标提交为 `5d6326d`。
- GitHub Pages 工作流 `#1` 构建和部署均成功，线上地址已可访问。
- 已修复 Pages 自动触发边界：新增 `Create release` 成功后的 `workflow_run` 触发，并通过 PR #7 以 Squash 方式合并。
- 线上冒烟：主页、学习路径、Git 课程、Docker 课程、课程详情、进度页和终端入口均返回 HTTP 200。
