# IDE 工作区操作入口与远端同步

## 已确认目标

- 浏览器右键事件不可靠，工作区对象改用可见的 `>` 操作入口打开动作菜单。
- 终端和工作区继续向 VS Code/GitHub Desktop 式 IDE 工作流靠拢：对象动作、命令候选、状态和输出保持联动。
- 仿真远端可以创建新文件，执行 `git pull` 后把远端新增/更新文件同步到本地工作区。
- 命令名称、参数和对应反馈保持匹配，常用 Git 操作继续可在浏览器内回放。

## 范围

- 扩展 Git 仿真状态 schema、工作台组件、终端命令执行器、Git reducer、样式、测试和项目记录。
- 远端文件和同步只存在当前浏览器会话，不访问网络、宿主机文件系统、Shell 或真实 Git。
- 保留现有固定高度终端、内部滚动、命令历史、错误回滚和移动端布局。

## 验收标准

- 文件、分支、提交、远端、stash 和 Git Graph 对象旁都有可见 `>` 操作按钮；点击按钮能打开动作菜单，菜单不依赖浏览器右键。
- 远端面板可通过可见表单创建新文件；终端执行 `git remote touch <path>` 也能创建远端文件并生成远端提交。
- 执行 `git pull` 会更新 `origin/main`、生成同步提交，并把远端新增/更新文件加入本地工作区；`git status` 能显示同步结果。
- `git remote files`、`git remote touch`、`git pull` 等命令有明确、与状态一致的终端反馈和候选提示。
- 现有暂存、提交、切换、合并、stash、错误回滚、历史和重置行为不被破坏；桌面与 390px 无整体横向溢出。
- `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm validate:content` 和 `pnpm build` 通过。
