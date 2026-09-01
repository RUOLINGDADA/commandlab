# 交接

## 当前状态

v0.2.0 发布准备已开始。版本文件已同步，Edge 已连接；待完成工程检查、合并到 `main`、创建 Release、Pages 部署和线上验收。

## 关键文件

- `package.json`
- `apps/web/package.json`
- `packages/*/package.json`
- `.github/workflows/release.yml`
- `.github/workflows/pages.yml`
- `README.md`
- `docs/project/`

## 发布约束

Release 工作流必须从 `main` 手动触发，输入版本必须与根 `package.json` 相同；Release 成功后 Pages 工作流负责静态构建和部署。
