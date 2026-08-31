# 关键决策

- 不把“所有命令”实现成一张不可维护的大表，而是按工具拆分命令族条目；每条条目增加 `syntax` 和 `parameters` 结构，后续可继续扩展。
- 动效只使用 CSS transform/opacity 和短时序列，避免引入动画库；尊重 `prefers-reduced-motion`。
- 百科搜索使用客户端过滤已加载条目，搜索标题、语法、参数、摘要和错误文本。
