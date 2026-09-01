# 决策

- 复用 `TeachingDockerState` Schema 作为交互状态边界，避免另造一份对象模型。
- 命令执行器使用确定性内存 reducer；错误返回原状态，便于教学演示和回归测试。
- 工作台放在 `/courses/docker/` 顶部，课程正文和本机复制练习继续作为真实 Docker 的学习入口。
