# 交接

本任务已完成本地实现。关键入口：`packages/content-schema/src/index.ts`、`apps/web/src/lib/content.ts`、`apps/web/src/app/page.tsx`、`apps/web/src/components/reference-explorer.tsx`、`apps/web/src/components/reveal.tsx`、`content/reference/`。

百科当前包含 Git 24 条、Docker 32 条；每条加载后都有 `syntax` 与 `parameters`，旧条目从 `commonOptions` 自动归一化。验证命令：`pnpm validate:content`、`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build`。
