# CommandLab UI、Git 课程与百科重构需求

## 已确认目标

- 参考 zcode 文档站的清晰层级、侧栏导航、搜索入口和阅读节奏，重新设计 CommandLab UI。
- 将 Git 课程改造成与 Docker 同等详细的零基础实操课程，包含主任务、变体、答案、验证、坑点、恢复、比较和清理。
- 再次详细丰富 Git 与 Docker 百科，覆盖对象、参数、场景、风险、错误和关联课程。
- 允许通过内容文件增删课程并调整顺序，课程目录按 `order` 自动排序。

## 范围

- `apps/web` 的全局导航、首页、课程目录、课程详情和百科页面及响应式样式。
- `packages/content-schema` 的 Git 课程模型与校验。
- `content/git`、`content/reference/git`、`content/reference/docker` 内容。
- 项目任务、状态与交接文档。

## 不包含

- 不新增后端、账号、在线执行沙箱或外部发布操作。
- 不改变 Git 与 Docker 各 24 节的数量约束；顺序可通过 frontmatter 的 `order` 调整。

## 验收标准

- 小白可在每节 Git/Docker 课程中看到明确前置、逐步任务、答案解释、关键字释义、验证、清理与错误恢复。
- Git 和 Docker 详情页交互结构一致，移动端不出现横向溢出；课程目录和百科可搜索、分工具浏览。
- Git/Docker 百科条目数量和正文显著扩充，且每条仍通过 schema 校验。
- `pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm validate:content` 和生产构建通过。
