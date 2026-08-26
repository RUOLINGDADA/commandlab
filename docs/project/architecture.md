# 架构说明

## 首发架构

- Next.js 静态导出部署到 GitHub Pages。
- MDX/YAML 课程在构建阶段转换并由 Zod 校验。
- 搜索、互动题和进度全部在浏览器中运行。
- IndexedDB 保存完成状态、收藏、笔记和练习记录。
- `PracticeRuntime` 隔离当前本机/互动练习与未来在线沙箱实现。

## 未来在线沙箱边界

在线沙箱必须由独立 API 提供短期会话、终端流、验证、重置和销毁能力。公网 Docker 终端只能运行于具备虚拟机边界的隔离环境，例如 Kubernetes + Kata Containers；不得挂载宿主 Docker Socket、宿主目录或集群凭据。

首发代码只保留正在使用的 `unavailable` 能力状态和稳定接口，不创建假 API、数据库或无效部署配置。
