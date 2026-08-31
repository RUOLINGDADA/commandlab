# 交接

## 当前状态

发布任务已完成版本、文档、本地质量验证和 GitHub 交付；仅 Docker Desktop 本机引擎验收受环境阻塞。

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

PR #12 已通过 5/5 检查并合并到 `main@5bd5560`；`v0.1.2` Release 和 Pages 部署均成功，线上关键路径返回 HTTP 200；Dependabot PR #14 已合并且告警为 Fixed。Docker Desktop 4.88.1 启动时仍因 `sailor-ingest.sock` 无法移除而退出，旧运行文件已改名为 `.bak-20260831` 备份。恢复或升级 Docker Desktop 后运行 `docker compose -p commandlab up -d --build`，再用 `Invoke-WebRequest http://localhost:8080` 完成最后的本机验收。
