# 贡献与归属地图

[English](contribution-and-ownership.md) | 中文

本页用于分离产品所有权、AI 辅助实现、独立复核和冻结上游基座。它是一份证据地图，不表示仓库中所有保留文件都由项目所有者独立编写。

## 1. 职责边界

| 参与方 | 在本项目中的职责 | 不作的主张 |
| --- | --- | --- |
| 项目所有者（`gentlexx`） | 产品问题、用户流程、长期闭环、当前范围、领域规则、技术路线取舍、任务组织、验收标准、复核决策、公开边界和最终责任 | 独立编写或熟练掌握每一行代码与全部上游技术 |
| Cursor | 根据明确规格完成主要 Fashion 代码和测试实现，并按复核结论执行工程修复 | 产品所有权或独立验收权 |
| Codex | 资料调查、状态审计、风险分析、任务拆分、验收设计、公开表述校正和 T-06 独立验证 | 主要实现作者身份，或未经所有者确认自行发布的权限 |
| DeepSeek Harness 上游 | 冻结 monorepo 基座、运行 package、Host、共享 UI、构建系统和上游架构 | Fashion 专属产品决策，或作品所有者对上游代码的个人作者主张 |

## 2. 版本证据

本地历史刻意按阶段拆分，便于复核每类边界：

| 提交 | 阶段 | 本阶段变更文件数 | 含义 |
| --- | --- | ---: | --- |
| `1fa5742` | 冻结上游基线 | 基线导入 | DeepSeek Harness `dsh-v0.1.5-rc.2` 基座 |
| `b0e5c6f` | Fashion 实现 | 391 | 领域包、控制器、Fashion Shell、bundle、集成与测试 |
| `c1a8010` | 公开作品材料 | 40 | README、产品案例、架构、来源、过程和公开边界 |
| `0a24188` | 截图证据 | 6 | 从冻结应用提交采集的六张截图 |
| `a827b5e` | T-06 证据更新 | 24 | 验证数字、运行结果、截图清单和已披露债务 |
| `4831eff` | 招聘者优先首屏 | 3 | 双语首屏和 90 秒阅读路径 |
| `152c7f1` | 贡献地图与 GitHub 边界 | 10 | 贡献地图、招聘者导航调整，以及上游与 Fashion 自有路径的 Linguist 展示边界 |

冻结应用行为在 `c1a8010b72764876b17744776d674fefc35d4ea9` 上完成验证。后续提交只增加证据和展示材料，没有静默修改已验证应用行为。

## 3. Fashion 专属代码地图

冻结应用在 Fashion 专属 package 路径中新增 362 个文件：

| 路径 | 文件数 | 作用 |
| --- | ---: | --- |
| `packages/fashion/` | 141 | Project、Research、Analysis、Design、Feedback、Evaluation 和 Agent 上下文七个领域包 |
| `packages/api/fashion-*` | 120 | 将领域操作提供给 Host 的七个应用控制器包 |
| `packages/client/ui-fashion-shell/` | 91 | 项目优先的浏览器工作台，以及 Fashion 专属导航、表单和视图 |
| `packages/bundle/fashion-app/` | 10 | Fashion profile 装配与应用 bundle |

Fashion package 使用私有 `@gentlexx/*` workspace scope。保留的 `@deepseek-ai/*` 表示上游 package 家族，不作为个人作品声明。

下面不是完整文件清单，而是便于技术面试官从业务问题追到实现和验证的代表性切片。表中的“项目所有者参与”描述产品判断、规则定义和验收责任，不等同于声称独立手写对应代码。

| 代表模块 | 解决的问题 | 关键代码与测试 | 项目所有者参与 | 验证方式 |
| --- | --- | --- | --- | --- |
| 研究与证据 | 让来源、样本和证据保留可追溯关系，并区分已观察、推导所得和仍待验证的信息 | [Evidence 对象](../../packages/fashion/research/src/schema/v0/evidence.ts)、[Research registry](../../packages/fashion/research/src/registry.ts)、[Research 测试](../../packages/fashion/research/tests/research.spec.ts) | 定义证据链、状态边界、公开资料边界和验收场景 | 定向测试、研究工作台人工浏览，以及[截图 03](assets/screenshots/03-research-evidence.png) |
| 分析与机会 | 把市场条目和热度信号整理为趋势簇与可确认的设计机会，避免把推断直接写成事实 | [分析记录](../../packages/fashion/analysis/src/schema/v0/records.ts)、[Analysis registry](../../packages/fashion/analysis/src/registry.ts)、[Analysis 测试](../../packages/fashion/analysis/tests/analysis.spec.ts) | 定义分析对象、事实与推断的区分、机会确认规则和验收标准 | 定向测试、Research → Analysis 主链人工检查，以及[截图 04](assets/screenshots/04-analysis-opportunity.png) |
| 设计、审核与交付 | 固化三个差异化候选方向，由人完成修改、选择与批准，并让交付物绑定获批 revision | [审核对象](../../packages/fashion/design/src/schema/v0/review.ts)、[Design registry](../../packages/fashion/design/src/registry.ts)、[精确输入导出](../../packages/fashion/design/src/export/exact-inputs.ts)、[Design 测试](../../packages/fashion/design/tests/design.spec.ts)、[revision 审核测试](../../packages/fashion/design/tests/review-f302.spec.ts) | 决定“三个候选”、人工批准、revision 有效性、冻结交付和不能自动越过的 gate | 定向测试、候选修改与重新审核人工操作，以及[截图 05](assets/screenshots/05-three-concepts-review.png)和[截图 06](assets/screenshots/06-deliverable-evaluation.png) |
| Agent 只读上下文 | 给 Agent 提供与当前项目绑定、可检查且不含 Fashion 写工具的上下文，防止绕过人工决策 | [上下文快照](../../packages/fashion/agent/src/snapshot.ts)、[工具边界](../../packages/fashion/agent/src/tools.ts)、[Agent 测试](../../packages/fashion/agent/tests/fashion-agent.spec.ts) | 选择一期只读策略、Session 与 Project 绑定方式及禁止自动写入的边界 | 工具清单和上下文快照测试、项目隔离检查 |
| 反馈与确定性评测 | 记录设计师反馈和结果可用性；用规则结果形成待人工分诊的改进项，而不是自动改写业务对象 | [Feedback 对象](../../packages/fashion/feedback/src/schema/v0/records.ts)、[评测规则](../../packages/fashion/evaluation/src/rules.ts)、[评测报告](../../packages/fashion/evaluation/src/report.ts)、[Evaluation 测试](../../packages/fashion/evaluation/tests/evaluation.spec.ts) | 定义未知结果的表达、确定性规则、改进项分诊和“没有真实结果时不补写”的边界 | 定向测试、交付与评测页面人工检查，以及[截图 06](assets/screenshots/06-deliverable-evaluation.png) |
| 应用装配与浏览器主链 | 将领域包、控制器和项目优先 UI 装配为可启动的 Fashion profile | [Fashion Shell](../../packages/client/ui-fashion-shell/src/client)、[Fashion bundle](../../packages/bundle/fashion-app/src/index.ts)、[Bundle 测试](../../packages/bundle/fashion-app/tests/fashion-app.spec.ts) | 拆分端到端任务、规定页面流程和验收标准，复核修复结论与最终公开范围 | 全量构建、typecheck、46 个 Fashion 测试文件／284 个测试、全新 `DSH_HOME` 启动、HTTP 200 和人工浏览器主链；详见[验证与证据](validation-and-evidence.zh.md) |

## 4. 定向上游集成

Fashion Harness 通过狭窄集成缝接入现有系统，没有把整个 Host 复制为 Fashion 代码：

- CLI／profile 注册和 Fashion Web 资源；
- `app-boot` 中的应用 profile 选择；
- Conversation slot 与 Fashion hero 替换；
- Models 设置页的引导行为；
- 静态前端 Host 对 Fashion favicon 和 manifest 的选择；
- TypeScript project reference、package 元数据、锁文件和仓库校验脚本。

这些文件属于 Fashion 变更集，但其所在 package 的其余部分仍归上游基座。

## 5. 作品希望证明的能力

- 把模糊产品场景转换为边界清楚的工程切片；
- 将来源、证据、分析、概念、审核、交付、反馈和评估建成可检查状态；
- 设计 revision、人工权威、项目隔离、来源和 Agent 权限规则；
- 在大型既有系统中选择合适的集成缝；
- 协调 AI 完成实现，同时由人负责验收与公开决策；
- 实际执行测试、静态门禁、启动检查、浏览器复核、截图采集和版本化证据；
- 识别限制，不把规划能力写成已经完成的能力。

## 6. 明确不作的主张

- 不声称所有保留源码由项目所有者独立手写；
- 不声称修改或掌握所有 DeepSeek Harness 上游 package；
- 不声称当前版本是自治多 Agent 生产系统；
- 不声称 R0 代表实时市场或证明商业价值；
- 不把测试存在自动等同于真实设计师可用性；
- 不把 GitHub 语言比例当作作者归属证明。

## 7. GitHub 语言统计策略

仓库为了可复现构建和运行验证而保留 7,000 多个未改上游文件。根 `.gitattributes` 先将大范围上游路径标记为 `linguist-vendored`，再对 Fashion package 和定向集成文件显式取消该属性。GitHub Linguist 会把 vendored 文件排除在仓库语言统计之外；该配置只影响展示，不改变文件、许可、历史或所有权。

此策略遵循 [GitHub Linguist override 文档](https://github.com/github-linguist/linguist/blob/main/docs/overrides.md)。复核贡献时应结合本页、提交历史和源码差异，而不能只看语言比例。

## 8. 快速复核入口

- 产品决策：[产品案例](product-case-study.zh.md)
- 系统结构：[架构说明](architecture.zh.md)
- AI 协作：[开发过程](development-process.zh.md)
- 可复现证据：[验证与证据](validation-and-evidence.zh.md)
- 当前限制：[数据来源与限制](data-provenance-and-limitations.zh.md)
