# 任务交接

## 状态

首发实施已完成。`main` 已推送并受 `Protect main` 规则集保护；`v0.1.0` Release 已发布，GitHub Pages 已成功部署。

## 线上交付

- 仓库：https://github.com/RUOLINGDADA/commandlab
- Release：https://github.com/RUOLINGDADA/commandlab/releases/tag/v0.1.0
- Pages：https://ruolingdada.github.io/commandlab/
- Pages 工作流：https://github.com/RUOLINGDADA/commandlab/actions/workflows/pages.yml
- 自动部署修复 PR：https://github.com/RUOLINGDADA/commandlab/pull/7

## 下一步

- 后续功能请从短期分支发起 Pull Request；`main` 需要 `quality` 检查通过后 Squash 合并。
- 服务器准备好后，再按架构文档增加登录、云端进度和安全沙箱实现。

## 已验证

- 依赖安装：`pnpm install`
- 内容：`pnpm validate:content`
- 代码：`pnpm lint`、`pnpm typecheck`、`pnpm test`
- Pages：设置 `GITHUB_PAGES=true` 后 `pnpm build`，再执行 `pnpm --filter @commandlab/web validate:export`
- 本地浏览器：`http://localhost:3100/` 首页、Git 课程页、互动题反馈正常。

## 首次推送

```powershell
git remote add origin https://github.com/RUOLINGDADA/commandlab.git
git push -u origin main
```

`main` 当前指向提交 `bec3cf3`（Pages 发布触发修复）。本地验证命令：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm validate:content`、`pnpm build`。GitHub Actions 最近的 CI、Security、Release 和 Pages 运行均已成功。
