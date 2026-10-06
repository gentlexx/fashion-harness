# 截图证据清单

[English](screenshot-manifest.md) | 中文

状态：`T06_CAPTURED_AND_VERIFIED`

这些截图来自 T-06 独立验证期间冻结在本地的应用提交。它们只能证明可见的产品状态，不代表实时市场数据、商业结果或全仓文档检查全部通过。

## 共同采集元数据

- 采集日期：`2026-10-06`
- 应用提交：`c1a8010b72764876b17744776d674fefc35d4ea9`
- 截图证据提交：`0a24188df7953fbc61bf21e001349b63bdd3d00e`
- 启动方式：使用全新本地 `DSH_HOME` 执行 `pnpm dsh --profile fashion`
- API Key：没有填写、读取或展示真实 Key；首次启动引导通过“稍后配置”关闭
- 运行检查：本地页面返回 HTTP 200
- 应用提交自动检查：build 通过并记录 252 个客户端产物；typecheck 通过；46 个 Fashion 定向测试文件、284 个测试通过
- 浏览器范围：人工检查了公开案例，以及 Research → Analysis → Design → Review → Deliverable/Evaluation 主链

## 证据索引

| 文件 | 可见场景与边界 | 尺寸 | SHA-256 |
| --- | --- | --- | --- |
| `01-fashion-home.png` | Fashion profile 首页、独立 Fashion Harness 标识、公开案例入口与本地项目入口。 | 1330×1292 | `5c06ad7cf79cbc3470947de333a49cf45474d9a7adb48b16acb8a7a86ec965fa` |
| `02-project-brief.png` | 本地项目概览与流程阶段，同时暴露当前边界：创建项目只填写名称，尚无完整 Brief 修订界面。 | 1330×1292 | `775394d64af00325ea6cab0d3f6e2c3923d5728630d10f7de047a442bd4fee5d` |
| `03-research-evidence.png` | Research Task 及 Source、Sample、Evidence、审核状态和追溯关系；公开使用前尚未完整复核所链接来源的存在性与归属。 | 1330×1292 | `d03accb2285d2ef4ab8382cecb51393702174a21c2be88c000033d83a7e6b2e0` |
| `04-analysis-opportunity.png` | 结构化市场条目、信号、趋势聚类与设计机会；内容是固定演示案例，不是实时市场情报。 | 1330×1292 | `1faec5128ac4783b8821b862e54b59ea5402095dfa666b2d89ad5ad638fc0b58` |
| `05-three-concepts-review.png` | 三个设计方向、人工审核与选定方向；Improvement 候选不保证所有派生记录之间的强一致。 | 1330×1292 | `0094a67b3bface683e1d55a34c2911155d2aa3aa4e027f40c1e9f2a720e3469a` |
| `06-deliverable-evaluation.png` | 交付物与固定评估视图；它不是真实设计师验证或商业证据，评估验证依赖 Git 检出。 | 1330×1292 | `2071c3769ba1fd59a83ca6e737d93ee16c65e3ac4cf0ca322da5e51f46c27c8a` |

## 解读边界

截图只验证上述应用提交在一次本地运行中的可见状态，不能独立验证来源权利、市场事实、模型质量、长期持久化、生产安全、设计师采用或业务价值。完整 T-06 结论还包含新公开材料之外、来自上游保留文档的链接债务披露。
