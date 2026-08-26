# 任务交接

## 状态

实施完成，`main` 已推送到 GitHub。静态首发网站和课程均已实现。

## 下一步

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

`git push -u origin main` 已成功，远程 `main` 当前指向提交 `0640875c64ce05e206a866b4daa80bedc71bb94d`。请按 `docs/project/github-settings.md` 配置 Pages 和分支规则。暂未创建 Release。
