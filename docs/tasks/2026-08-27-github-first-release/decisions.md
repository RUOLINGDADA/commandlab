# 决策

## 静态首发

当前没有服务器，因此首发仅实现可真实运行的静态能力。登录、数据库和在线沙箱延后，避免假实现与冗余代码。

## 内容许可

源代码使用 MIT；`content/` 内课程使用 CC BY-NC-SA 4.0，并通过 NOTICE 明确边界。

## GitHub 发布与保护

- 使用 Ruleset 而非旧式 branch protection，统一表达 `main` 的 PR、检查、删除和强推限制。
- 发布工作流保留 `workflow_dispatch`，Pages 同时支持 `release`、`workflow_run` 和手动触发，以兼顾 GitHub Token 事件抑制与人工补发场景。
- 仓库元数据使用中文描述、GitHub Pages 首页和英文兼容 Topics，避免 GitHub 对非 ASCII Topic 的校验失败。
