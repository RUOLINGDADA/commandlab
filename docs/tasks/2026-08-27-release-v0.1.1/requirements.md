# v0.1.1 发布需求

## 已确认目标

将已经合并到 `main` 的 Docker 24 节课程深度重设计正式发布为 `v0.1.1`，并通过 GitHub Actions 更新 GitHub Pages。

## 包含范围

- 将根项目与工作区包版本统一更新到 `0.1.1`。
- 通过短期分支和 Pull Request 合并版本记录。
- 手动运行 `Create release` 工作流创建 `v0.1.1` Release。
- 确认 `GitHub Pages` 工作流成功，线上课程展示新版 Docker 实操内容。

## 不包含范围

- 不修改 Git 或 Docker 课程设计。
- 不创建服务器、后端或在线 Docker 沙箱。
- 不删除历史 Release 或 Git 标签。

## 验收标准

- GitHub Release 页面存在 `v0.1.1`，目标为最新 `main`。
- Pages 部署成功，`https://ruolingdada.github.io/commandlab/` 可访问。
- Docker 课程详情页显示“本机实战 · 逐步案例”及独立步骤完成按钮。
- 子路径资源正常加载，页面无明显构建错误。
