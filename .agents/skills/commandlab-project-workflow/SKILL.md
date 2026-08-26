---
name: commandlab-project-workflow
description: 处理 CommandLab 仓库中的开发、课程、设计、测试、Bug、部署和文档任务时，执行需求确认、任务分级、项目记录、交接与代码质量流程。不用于仓库外的通用问题。
---

# CommandLab 项目工作流

在修改仓库前，先读取 `docs/project/status.md`、`docs/project/handoff.md` 和相关任务档案，并完成必要的只读检查。

## 必须遵循的流程

1. 阅读 [需求确认协议](references/requirements-gate.md)，在用户明确确认目标、范围和验收标准前，不执行文件修改或其他有副作用的操作。
2. 按 [文档维护协议](references/documentation-protocol.md) 判断任务规模，并创建或更新任务档案。
3. 实现时遵守 [编码规范](references/coding-standards.md)，优先形成一体化的新设计，不保留重复实现或无要求的兼容层。
4. 执行与风险相称的测试；修复 Bug 时必须增加可证明问题不会复发的测试。
5. 结束前更新项目状态、任务进度、Bug 记录和交接信息，明确已完成事项、验证命令、风险与下一步。

用户在执行中改变需求时，暂停有副作用的操作，复述变更影响并重新取得确认。
