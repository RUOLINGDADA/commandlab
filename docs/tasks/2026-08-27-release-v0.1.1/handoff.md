# 任务交接

## 当前状态

`v0.1.1` 发布任务进行中，版本号、任务档案和本地完整验证已完成，尚未完成 PR、Release 和 Pages 部署。

## 关键入口

- `.github/workflows/release.yml`
- `.github/workflows/pages.yml`
- `package.json`
- `docs/project/status.md`

## 发布边界

只发布已合并的 Docker 课程重设计，不修改课程内容，不删除历史版本或远程资源。

## 已通过验证

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm validate:content`
- `pnpm security:secrets`
- GitHub Pages 环境变量下的 `pnpm build`
- `pnpm --filter @commandlab/web validate:export`
