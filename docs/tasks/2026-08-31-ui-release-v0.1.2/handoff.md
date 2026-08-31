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

PR #12 已通过 5/5 检查并合并到 `main@5bd5560`；`v0.1.2` Release 和 Pages 部署均成功，线上关键路径返回 HTTP 200。剩余唯一验收项是 Docker Desktop 引擎恢复后运行 `docker compose -p commandlab up -d --build` 并执行 HTTP 冒烟。
