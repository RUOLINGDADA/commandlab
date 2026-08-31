# 交接

## 当前状态

发布任务已获确认，正在完成版本、文档、本地验证和 GitHub 交付。

## 关键文件

- `apps/web/src/app/`
- `apps/web/src/styles/`
- `Dockerfile`
- `docker-compose.yml`
- `nginx.conf`
- `README.md`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `.github/workflows/pages.yml`

## 运行命令

- `pnpm install --frozen-lockfile`
- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm validate:content`
- `pnpm build`（Pages 校验时设置 `GITHUB_PAGES=true`）
- `docker compose up -d --build`

## 下一步

本地验证和提交已完成（`146f1aa`、`3d9d05b`）。待 GitHub HTTPS 网络恢复并完成账号登录后，推送 `codex/docker-guide-redesign`，创建并合并 PR；随后运行 `Create release` 输入 `0.1.2`，等待 Pages 部署并执行线上 HTTP 验收。
