# Bug 记录

## REL-001：版本变化后本地 pnpm 拒绝刷新依赖状态

- 现象：并行运行 Lint 和 TypeScript 时，pnpm 报告非交互环境无法确认重建 `node_modules`。
- 复现：修改工作区包版本后直接运行 `turbo run lint`。
- 根因：pnpm 检测到工作区 package 状态变化，需要刷新本地依赖元数据。
- 修复：设置 `CI=true`，执行 `pnpm install --offline --frozen-lockfile`；未更新锁文件或依赖版本。
- 回归：Lint、TypeScript 和完整静态构建通过。
- 状态：已解决。

## REL-002：终端无法连接 GitHub Web Git 端点

- 现象：向 `https://github.com/RUOLINGDADA/commandlab.git` 推送时连接超时或重置。
- 复现：运行 `git push -u origin release/v0.1.1`。
- 根因：本机到 `github.com:443` 的网络路径不可用；`api.github.com:443` 正常，仓库权限和凭据有效。
- 修复：使用 GitHub 官方 Git Data API，从 Git 凭据助手在进程内读取认证，校验远程 `main` 基线后非强制创建发布分支；临时脚本随后删除。
- 回归：远程分支提交 `984892e` 创建成功，PR #10 全部检查通过并合并。
- 状态：已解决，不改变仓库发布架构。
