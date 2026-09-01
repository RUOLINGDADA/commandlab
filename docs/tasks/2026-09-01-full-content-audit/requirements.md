# 需求确认

## 目标

以完全没有命令行经验的新手视角，逐节审阅并改进 Git 与 Docker 全部教程；同时继续扩充命令百科，让每条高频命令都能回答“是什么、为什么、怎么做、如何验证、出错怎么办、如何清理”。

## 范围

- `content/git/` 24 节课程。
- `content/docker/` 24 节课程。
- `content/reference/git/` 与 `content/reference/docker/` 现有百科条目及索引。
- 与内容渲染、课程步骤和百科数据契约直接相关的测试与文档记录。

不包含发布、远端仓库修改、宿主机 Docker 环境修复和无关 UI 重构。

## 验收标准

- 课程中的命令、参数、预期输出和后续步骤相互一致，危险命令有明确范围和恢复提示。
- 首次出现的关键术语有通俗解释，步骤说明包含可执行动作、验证方式和失败后的下一步。
- Git 与 Docker 百科补齐高频缺口或明显缺少的场景，并保持现有 schema 与页面可渲染。
- `pnpm validate:content`、`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build` 全部通过。
- 浏览器抽查 Git/Docker 入门、中级和高风险课程，桌面与 390px 页面无内容遮挡或不可读文本。
