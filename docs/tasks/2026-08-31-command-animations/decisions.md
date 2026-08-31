# 关键决策

- 使用统一 `CommandAnimationSpec` 数据契约和按 `kind` 复用的舞台渲染器；命令差异全部由注册项的 actors、frames、narration 和 transition 表达。
- 动画注册表按 Git/Docker 命令 slug 建立，加载器在构建期做一对一完整性校验，缺失注册直接报错。
- 动画页为静态生成路由，不执行真实命令，不引入额外动画依赖；播放状态仅在客户端控制。
- 搜索栏采用独立 grid 行，筛选区局部滚动，避免输入和分类共享可压缩空间。
