# 交接

`v0.1.3` 发布已完成。

关键文件：`package.json`、`apps/web/package.json`、`packages/*/package.json`、`.github/workflows/release.yml`、`.github/workflows/pages.yml`、`README.md` 和 `docs/project/`。

发布结果：PR #16 已合并到 `main@a71e6ba`；`Create release #4` 成功并创建 [v0.1.3](https://github.com/RUOLINGDADA/commandlab/releases/tag/v0.1.3)；GitHub Pages #4 成功。

线上验收：

- 首页：https://ruolingdada.github.io/commandlab/
- 在线终端：https://ruolingdada.github.io/commandlab/terminal/

发布约束：Release 工作流必须从 `main` 手动触发，输入版本必须与根 `package.json` 相同；Release 成功后 Pages 工作流负责静态构建和部署。
