# 执行记录

## 已完成

- 完成项目状态、交接、工作流规范和相关组件/样式的只读检查。
- 确认百科动画入口使用原生链接，课程嵌入舞台存在隐藏溢出与固定最小高度约束。
- 百科筛选项增加按钮边界、6px 间距和窄屏换行；移动端实测无文字重叠。
- 动画入口改为 Next `Link`，根布局加入 `beforeInteractive` 主题预初始化；主题按钮改用 `useSyncExternalStore`，消除 hydration 警告。
- 专属舞台改为内容自然增高，嵌入路径取消裁切，并为窄屏 Git 上下文增加多行布局；390px Git/Docker 课程实测无整体横向溢出。
- 进一步复现发现桌面双列嵌入卡片仍被专属舞台固定列宽撑破；已将嵌入 Git/Docker 网格改为单列、命令栏改为可收缩轨道，并以卡片边界隔离溢出。
- 复测发现嵌入舞台在超宽内容下仍可能被 `overflow: hidden` 裁掉；改为 `max-width: 100%` + 舞台/画布自身 `overflow: auto`，保留完整内容可滚动查看。
- 新增 `tests/theme-animation-layout.test.ts`，覆盖客户端导航、主题预初始化和布局约束。

## 验证

- `pnpm test`：42 项通过。
- `pnpm validate:content`：48 节课程、56 条百科通过。
- `pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build`：通过。
- 浏览器：桌面与 390px 检查百科筛选、百科到动画导航、Git/Docker 课程嵌入；主题保持浅色，页面无整体横向溢出。
- 浏览器复测：1280px Git/Docker 嵌入卡片均保持在各自边界内，`body.scrollWidth === clientWidth`；390px Git 两张卡片上下排列且边界无重叠。
- 浏览器补测：390px 课程嵌入舞台内容边界不超过卡片，超宽内容具备内部滚动；浅色主题进入动画详情后 `data-theme` 仍为 `light`；筛选按钮边框与 6px 间距有效。
