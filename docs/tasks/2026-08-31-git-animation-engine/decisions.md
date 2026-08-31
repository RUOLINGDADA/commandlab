# 关键决策

- Git 场景使用 immutable reducer 和显式事件差异，画布只渲染快照，不在组件内推断 Git 语义。
- 时间轴统一包含 idle、typing、executing、transitioning、settled；命令输入与状态变化分离，便于逐帧回看。
- 提交图使用 SVG path 和稳定坐标布局；分支标签、HEAD、暂存区、工作区和远端引用为独立图层。
- Docker 本轮使用同一 TeachingScene/Timeline/Controls 接口和轻量 adapter，不在 Git 任务中引入真实 Docker Engine。
- 参考项目只作为交互与建模参考，CommandLab 代码和视觉样式完全重新实现。
