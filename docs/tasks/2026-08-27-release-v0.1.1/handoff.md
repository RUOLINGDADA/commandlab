# 任务交接

## 当前状态

`v0.1.1` 发布任务已完成：版本 PR #10 已合并，Release 与 Pages 部署成功，线上 Docker 新课程已验收。

## 关键入口

- `.github/workflows/release.yml`
- `.github/workflows/pages.yml`
- `package.json`
- `docs/project/status.md`

## 发布边界

只发布已合并的 Docker 课程重设计，不修改课程内容，不删除历史版本或远程资源。

## 发布记录

- Pull Request：`https://github.com/RUOLINGDADA/commandlab/pull/10`
- Release：`https://github.com/RUOLINGDADA/commandlab/releases/tag/v0.1.1`
- Release 工作流：`https://github.com/RUOLINGDADA/commandlab/actions/runs/33008282618`
- Pages 工作流：`https://github.com/RUOLINGDADA/commandlab/actions/runs/33008338380`
- 线上验收页（旧版首课记录）：`https://ruolingdada.github.io/commandlab/courses/docker/install-engine/`

## 后续事项

无发布阻塞项。后续课程质量优化应建立新的独立任务，不修改 `v0.1.1` 历史标签。

## 已通过验证

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm validate:content`
- `pnpm security:secrets`
- GitHub Pages 环境变量下的 `pnpm build`
- `pnpm --filter @commandlab/web validate:export`
