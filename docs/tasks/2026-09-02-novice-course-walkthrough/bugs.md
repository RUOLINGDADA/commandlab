# 缺陷记录

## BUG-20260902-01

- 现象：课程页多个嵌入动画同时自动播放，初次进入时视觉焦点分散。
- 修复：嵌入播放器通过 `embedded` 模式默认暂停，并显示单一观察提示。
- 回归测试：`tests/theme-animation-layout.test.ts`；390px 第一节课程浏览器检查。
- 状态：已解决。

## BUG-20260902-02

- 现象：步骤要求新手独立完成 Docker 命令，但浏览器内仿真终端入口距离步骤很远且没有关联命令。
- 修复：DockerPractice 增加步骤级 Docker 在线终端链接，统一终端按 URL 参数切换到 Docker 模式。
- 回归测试：`tests/theme-animation-layout.test.ts`；点击步骤命令直达在线终端浏览器检查。
- 状态：已解决。

## BUG-20260902-03

- 现象：动画准备阶段直接出现 Engine、context、objects 等术语，新手不知道这些信息应该如何判断。
- 修复：动画终端增加新手观察提示，课程练习说明明确区分浏览器仿真和本机命令；Docker 课程紧凑终端改为 Docker 预览。
- 回归测试：`tests/theme-animation-layout.test.ts`；第一节课程完整走查。
- 状态：已解决。
