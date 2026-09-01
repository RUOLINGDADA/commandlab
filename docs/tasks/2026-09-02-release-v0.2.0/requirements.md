# CommandLab v0.2.0 发布

## 已确认目标

- 将当前已完成的 IDE 风格 UI、Git/Docker 在线终端、课程嵌入动画和主题/布局修复发布为 `v0.2.0`。
- 将代码合并到受保护的 `main`，创建 GitHub Release，并触发 GitHub Pages 部署。
- 使用 Edge 浏览器完成线上关键页面验收。

## 范围

- 根项目与 5 个工作区包版本统一为 `0.2.0`。
- 更新 README、项目状态、任务索引、交接信息和本发布档案。
- 执行测试、内容校验、类型、Lint、格式、生产构建和 Pages 导出验证。
- 通过现有 `Create release` 与 `GitHub Pages` 工作流完成发布。

## 不包含

- 不删除既有 Release、标签或远程分支。
- 不修改 CI/Action 工作流，不新增后端或真实宿主机 Git/Docker 执行。

## 验收标准

- `main` 包含本轮功能与 `0.2.0` 版本提交，工作区干净。
- GitHub Release 页面存在 `v0.2.0`，目标为最新 `main`。
- Release 与 Pages 工作流成功，线上首页、在线终端、课程和百科关键页面可访问。
- Edge 浏览器线上页面返回 HTTP 200，桌面与 390px 页面无整体横向溢出。
