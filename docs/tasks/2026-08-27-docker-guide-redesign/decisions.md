# 设计决策

- 参考站只用于学习路径和讲解方法，不复制其文本、过时版本或示例。
- 使用 `docker compose`、当前镜像标签、用户网络、Healthcheck、非 root 和只读文件系统等现代实践。
- 不将 Docker Machine、旧版 `docker-compose`、`links`、`MAINTAINER` 作为主线内容。
- 每节恰好两个步骤：一个主任务和一个有明确业务变化的变体任务。
- 新 slug 直接替换旧 slug，不增加重定向或重复课程。
