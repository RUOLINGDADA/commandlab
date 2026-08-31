# CommandLab UI 与部署重构需求

## 目标

将 CommandLab 重设计为更接近真实开发者文档工作台的中文 Git / Docker 学习站点，减少生成式营销视觉与空泛文案，并提供可重复的一键 Docker 部署方式。

## 范围

- 重做全局颜色、排版、导航、首页及主要内容页布局。
- 重写首页、课程入口、工具百科、学习进度、终端计划等用户可见文案。
- 保留课程数据、互动题、平台练习、完成状态、收藏和笔记能力。
- 增加 Dockerfile、docker-compose.yml、.dockerignore 与部署说明。
- 完成本地开发、类型、Lint、测试、内容校验和生产构建验证。
- 本地验收完成前不推送 GitHub、不创建 PR、不发布 Release。

## 不包含

- 不新增后端、账号、数据库或远程在线沙箱。
- 不改变 Git / Docker 课程数量与课程数据模型。
- 不执行 GitHub 远程发布操作。

## 验收标准

- 首页首屏能直接进入学习路径、工具百科与本地练习，并明确当前终端不可用状态。
- 主要页面桌面端与移动端无明显溢出、遮挡、不可点击或内容截断。
- 课程搜索、工具筛选、课程详情、练习、进度和主题切换继续可用。
- Docker 一键部署文档给出 `docker compose up -d --build`，且镜像能提供静态站点。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm validate:content`、`pnpm build` 通过。
- 最终交付只包含本地文件和本地访问地址，不包含 GitHub 发布结果。
