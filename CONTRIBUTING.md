# 参与贡献

感谢改进 CommandLab。请先创建 Issue 描述问题或课程建议，再从短期分支提交 Pull Request。

## 开发流程

1. Fork 仓库并从 `main` 创建 `feat/...`、`fix/...` 或 `docs/...` 分支。
2. 安装 Node.js 24 与 pnpm 11.19.0，执行 `pnpm install --frozen-lockfile`。
3. 修改后运行 `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`。
4. 使用约定式标题，例如 `feat: 增加 Git 交互式变基练习`。
5. 在 Pull Request 中说明影响范围、验证结果和界面截图。

## 课程要求

- 解释命令背后的状态模型，不只给出操作步骤。
- 提供 Windows PowerShell、macOS、Linux 的操作、验证和清理命令。
- 明确危险操作、不可逆风险与恢复方式。
- 不在课程中加入真实密钥、个人信息或无法合法再发布的内容。

代码与课程使用不同许可，详见 [NOTICE](NOTICE.md)。
