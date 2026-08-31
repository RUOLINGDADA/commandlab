# 交接

发布任务正在进行，目标为 `v0.1.3`。

关键文件：`package.json`、`apps/web/package.json`、`packages/*/package.json`、`.github/workflows/release.yml`、`.github/workflows/pages.yml`、`README.md` 和 `docs/project/`。

发布约束：Release 工作流必须从 `main` 手动触发，输入版本必须与根 `package.json` 相同；Release 成功后 Pages 工作流负责静态构建和部署。
