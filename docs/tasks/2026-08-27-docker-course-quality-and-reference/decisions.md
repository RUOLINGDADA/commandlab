# 设计决策

- 保留 Docker 课程编号、slug 和现有导航 URL。
- 步骤使用 1–3 个真实任务，不再强制无意义的重复变体。
- 主流程只使用常见命令，冷门参数放入折叠拓展说明。
- 百科采用 `content/reference/<tool>/*.mdx`，路由为 `/reference/`、`/reference/git/`、`/reference/docker/`。
- 通用练习协议只放在 Docker 课程路径首页。
- 所有实验资源使用 `commandlab-` 前缀，不创建兼容层或假后端。
