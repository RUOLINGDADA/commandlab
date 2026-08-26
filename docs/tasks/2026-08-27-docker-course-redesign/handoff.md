# 任务交接

## 当前状态

任务已完成。Docker Schema、页面组件、24 节课程内容、回归测试和静态导出校验均已落地。

## 接手入口

继续工作前先阅读本目录全部文档、`.agents/skills/commandlab-project-workflow/SKILL.md`、`packages/content-schema/src/index.ts`、`apps/web/src/lib/content.ts` 和课程详情页。

## 已验证命令

- `tsx apps/web/scripts/validate-content.ts`
- `turbo run lint`
- `turbo run typecheck`
- `vitest run`
- `GITHUB_PAGES=true GITHUB_REPOSITORY=RUOLINGDADA/commandlab turbo run build`
- `tsx apps/web/scripts/validate-export.ts`

## 后续事项

- 当前工作区修改尚未提交到分支；按项目规则从 `main` 创建短期分支后提交并发起 Pull Request。
- Docker 内容仍以本机复制执行为边界，不接入在线沙箱或后端。

## 约束

Git 课程不改；不要创建在线沙箱或后端；完成后通过短期分支和 Pull Request 合并。
