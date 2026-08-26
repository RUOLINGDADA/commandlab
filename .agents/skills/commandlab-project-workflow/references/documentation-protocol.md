# 文档维护协议

## 任务分级

- 小任务：修改不超过三个源文件、不跨模块，且不改变公开接口、内容模型、安全或部署。更新项目总状态与交接即可。
- 中大型任务：超过小任务边界时，在 `docs/tasks/<YYYY-MM-DD>-<slug>/` 创建 `requirements.md`、`plan.md`、`progress.md`、`decisions.md`、`bugs.md`、`handoff.md`。

## 更新要求

- `requirements.md`：记录确认后的目标、范围和验收标准。
- `plan.md`：使用可检查的步骤与状态，不记录空泛意图。
- `progress.md`：按时间追加实际完成项和验证结果。
- `decisions.md`：记录会影响后续实现的选择、原因和替代方案。
- `bugs.md`：记录现象、复现、根因、修复、回归测试和状态。
- `handoff.md`：记录当前状态、关键文件、运行命令、风险和下一步。

项目级 `docs/project/status.md` 和 `docs/project/handoff.md` 始终保持可直接接手；任务索引与 Bug 索引必须能定位对应档案。
