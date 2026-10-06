# 验证与证据

[English](validation-and-evidence.md) | 中文

## 1. 证据原则

验证结论必须绑定到实际运行阶段和对应代码状态。T-04 的结果只能证明公开化调整的定向检查通过，不能替代 T-06 的最终应用验收。

## 2. T-04 已验证

| 检查 | 结果 | 说明 |
| --- | --- | --- |
| Fashion 定向测试 | 7 个测试文件、60 个测试通过 | 覆盖本轮公开化调整相关行为 |
| 品牌定向复验 | 1 个测试文件、2 个测试通过 | 在调整后再次验证 Fashion 标识 |
| Package invariants | 通过 | 验证 Fashion package 元数据与约束 |
| TypeScript path references | 通过 | 验证项目引用关系 |
| Cordis configuration | 通过 | 验证配置结构 |
| Client UI i18n | 通过 | 验证 UI 国际化约束 |
| Diff whitespace check | 通过 | 未发现差异空白错误 |

以上为 **T-04 verified**。数字不代表全仓测试规模，也不表示最终应用已经完成浏览器验收。

## 3. T-06 待验证

| 检查 | 当前状态 | 通过标准 |
| --- | --- | --- |
| 锁文件安装 | Pending T-06 | 使用锁文件完成依赖安装且没有意外修改 |
| 全量构建 | Pending T-06 | `pnpm run build` 成功 |
| 全量类型检查 | Pending T-06 | 项目定义的 typecheck 成功 |
| Fashion 目标测试 | Pending T-06 | 最终应用提交上的目标测试全部通过 |
| Fashion profile 启动 | Pending T-06 | 使用全新本地数据目录成功启动 |
| 页面可访问 | Pending T-06 | Fashion 页面返回成功并可加载 |
| 无密钥体验 | Pending T-06 | 引导框不遮挡 Fashion 主流程；不填写真实密钥 |
| 核心浏览器流程 | Pending T-06 | 按证据脚本完成并保存可复核结果 |
| 截图 | Pending T-06 | 仅从最终应用提交拍摄，写入 SHA 与场景说明 |

当前预期运行方式是：

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm dsh --profile fashion
```

这些命令是待 T-06 验证的运行入口，不是当前已经完成全量验证的声明。

## 4. 证据分层

- **代码证据**：领域对象、控制器、配置、测试与 package 结构；
- **自动化证据**：测试和静态校验日志；
- **运行证据**：T-06 的启动记录、浏览器路径和最终截图；
- **人工证据**：对版本绑定、设计差异和限制披露的复核；
- **版本证据**：最终应用提交与后续单独的证据提交。

截图目录当前只有清单，不包含占位图或伪造界面。参见[截图证据清单](assets/screenshots/screenshot-manifest.zh.md)。

## 5. 当前不能得出的结论

- 不能据 T-04 推断全仓构建和测试全部通过；
- 不能据虚构演练推断真实设计师满意或商业有效；
- 不能据 R0 种子推断实时市场状态；
- 不能据代码存在推断项目所有者已经独立掌握其中每项技术；
- 不能在 T-06 前把任何截图或 SHA 标为最终证据。
