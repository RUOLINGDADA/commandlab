# Bug 记录

## CL-001：Docker MDX 缺少 frontmatter 起始分隔线

- 现象：内容校验读取 Docker 文件时，gray-matter 返回空元数据。
- 根因：批量生成文件只有结尾 `---`，缺少开头分隔线。
- 修复：为 24 个 Docker MDX 文件补齐开头 `---`。
- 回归：内容校验通过。

## CL-002：Docker 环境前置条件被误判为课程链接

- 现象：`docker-01` 的环境前置条件被报告为不存在的课程。
- 根因：校验器对所有 prerequisites 字符串都按课程 ID 解析。
- 修复：仅对 `git-01`/`docker-01` 形式的值执行课程 ID 存在性校验。
- 回归：内容校验和内容测试通过。

## CL-003：课程联合类型导致页面访问错误字段

- 现象：TypeScript 报告 Docker 课程不存在 `pitfall`、Git 课程不存在 `scenarios`。
- 根因：页面和搜索组件未按 `tool` 判别联合类型。
- 修复：导出 `GitLesson`/`DockerLesson`，并在页面、练习和搜索逻辑中按工具收窄类型。
- 回归：Lint 与 TypeScript 通过。

## CL-004：静态导出校验脚本找不到 Turbo 输出目录

- 现象：从仓库根目录执行导出校验时报告缺少 `index.html`。
- 根因：Next 输出位于 `apps/web/out`，脚本只查找根目录 `out`。
- 修复：脚本同时探测根目录和 `apps/web/out`。
- 回归：GitHub Pages 构建后导出校验通过。
