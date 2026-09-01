# 缺陷记录

## BUG-20260901-04

- 现象：在线终端只有 Git 入口，Docker 仿真终端只能从 Docker 学习路径进入。
- 修复：新增统一在线终端模式切换，并接入 Docker 工作台。
- 回归测试：`tests/theme-animation-layout.test.ts`；390px `/terminal/` 浏览器检查。
- 状态：已解决。

## BUG-20260901-05

- 现象：Docker 动画多个阶段终端输出重复，难以观察镜像层、容器、网络、卷和端口的具体变化。
- 修复：Docker 时间轴和仿真器输出增加解析、对象快照、端口、网络、挂载、层历史、健康状态和资源指标细节。
- 回归测试：`tests/interactive-docker.test.ts`；Docker 动画浏览器检查。
- 状态：已解决。

## BUG-20260901-06

- 现象：课程嵌入动画沿用完整播放器的密集布局，重点信息与控制区在窄卡片中层级不清。
- 修复：为 `CommandAnimation` 增加嵌入模式，收紧终端、专属舞台、图表和时间轴间距，同时保留控制区。
- 回归测试：`tests/theme-animation-layout.test.ts`；1280px/390px 课程页边界检查。
- 状态：已解决。
