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
