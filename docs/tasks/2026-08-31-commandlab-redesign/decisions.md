# 关键决策

- 保留 Git/Docker 各 24 节约束，使用 frontmatter `order` 支持顺序调整，避免静态路由和进度数据失配。
- Git 采用与 Docker 同样的 `scenarios -> steps` 闭环，但保留 Git 专属历史/比较字段，确保现有内容可以逐步迁移。
- 命令仅提供复制，不在浏览器执行；删除、覆盖和改写历史操作必须展示影响范围。
- UI 使用现有 Next、React、Lucide 和 CSS 体系，避免引入新的运行时依赖。
