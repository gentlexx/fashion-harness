# 路线图与能力边界

[English](roadmap-and-boundaries.md) | 中文

## 1. 长期闭环

Fashion Harness 的长期方向是：

**合规服装与趋势信息**（Compliant Fashion & Trend Information）<br>
↓<br>
**数据清洗、标准化与多模态理解**（Cleaning / Standardization / Multimodal Understanding）<br>
↓<br>
**服装数据集与领域本体**（Fashion Dataset / Fashion Ontology）<br>
↓<br>
**趋势分析与设计机会**（Trend Analysis / Design Opportunity）<br>
↓<br>
**Harness 辅助研究与设计决策**（Harness-assisted Research & Design Decision）<br>
↓<br>
**设计师审核、专业工具深化与交付**（Designer Review / Professional-tool Refinement / Delivery）<br>
↓<br>
**设计师反馈、评测与可获得的市场结果**（Designer Feedback / Evaluation / Available Market Outcome）<br>
↓<br>
**进入下一轮模型、规则与工作流改进**（Model / Rule / Workflow Improvement Cycle）

长期核心资产是 Dataset、Ontology、Harness、设计师反馈和评测体系的组合，而不是单一模型。

## 2. 当前实现边界

当前仓库只实现长期闭环中的一个可验证切片：

**设计需求**（Brief）<br>
↓<br>
**建立小规模可追溯研究集**（Traceable Research Set）<br>
↓<br>
**形成趋势与设计机会**（Trend Cluster / Design Opportunity）<br>
↓<br>
**生成三个差异化设计方向**（Three Design Concepts）<br>
↓<br>
**完成人工审核与版本变更**（Human Review / Revision）<br>
↓<br>
**形成冻结交付快照**（Versioned Deliverable）<br>
↓<br>
**保留反馈与评测记录**（Designer Feedback / Evaluation Record）

这条切片用于验证产品结构、领域规则、Agent 上下文和交付证据，不代表完整商业产品。

## 3. 分阶段路线

| 阶段 | 目标 | 状态 |
| --- | --- | --- |
| 当前工程切片 | 建立领域对象、规则、控制器、Fashion Shell 和 Harness 读取能力 | 已实现（Implemented） |
| 公开化定向调整 | 品牌隔离、命名、引导配置、构建引用和种子不确定性治理 | T-04 已验证（Verified） |
| 最终候选验收 | 全量构建、Fashion 定向测试、启动、浏览器主流程、截图和应用 SHA | T-06 已验证，保留限制已披露（Verified with disclosed limitations） |
| 真实工作场景访谈 | 了解设计师现有研究与决策流程，校准专业判断边界和二期方向 | 已完成首位访谈（First interview completed） |
| 设计师产品试用 | 让设计师实际使用一期产品，记录可用性、摩擦和反馈 | 计划中（Planned） |
| 研究完整性 | 强化跨项目归属、引用存在性、授权和可追溯校验 | 计划中（Planned） |
| 工作流增强 | 完整 Brief 修订、受控写工具、多 Agent 分工与恢复机制 | 计划中（Planned） |
| 数据资产 | 合规采集、Dataset、Ontology 和质量评估 | 计划中（Planned） |
| 模型与专业链路 | 多模型路由、视觉生成、CAD/Tech Pack、训练或微调 | 计划中（Planned） |

## 4. 当前项目状态与后续方向

下表同时说明一期已经实现的功能、目前尚未达到的效果或证据，以及后续升级的进入条件。三者分开陈述，避免把已实现的工程能力、待验证的用户效果和远期规划混为一谈。

| 方面 | 当前已实现的功能 | 尚未达到的效果或证据 | 后续方向与进入条件 |
| --- | --- | --- | --- |
| 研究与数据 | 已建立 `ResearchTask → Source → Sample → Evidence` 可追溯对象链，并提供带日期和来源链接的 R0 公开资料重建 | 尚未实时采集全球时尚数据，也没有完整的 Fashion Dataset 或 Fashion Ontology | 先明确来源授权、使用条款、更新频率和可追溯要求，再逐步建立受控采集、数据规范、领域术语、质量检查和版本管理 |
| 分析与设计 | 已将市场条目、热度信号和趋势簇组织为设计机会，并从精确机会版本形成三个差异化候选方向 | 尚不能把合成演示数据解释为真实市场趋势，也不能预测销量或证明设计效果 | 先用获授权资料和真实任务校准分析规则，再建立基准任务，比较机会判断与候选质量 |
| 人工审核与交付 | 已实现候选修改、人工选择与批准、revision 有效性检查，以及版本化交付快照 | 尚未证明交付物能够直接替代设计师的专业深化，也没有打通 CAD 或 Tech Pack 生产链 | 根据设计师真实工作流，优先连接价值明确的专业工具与人工审核节点，再扩展多模态和生产交付 |
| 真实用户与效果验证 | 已完成首位设计师工作场景访谈；系统已具备记录 `DesignerFeedback` 和 `OutcomeAvailability` 的对象结构 | 设计师尚未实际试用一期产品，因此没有可用性、满意度、效率提升、销量或商业效果证据 | 作品集整理和一期缺口修复完成后，分别开展补充访谈与产品试用，再在后续实际项目中记录可获得的业务结果 |
| 评测与改进 | 已实现确定性规则、`RuleResult`、`ImprovementItem` 和需要人工分诊的改进队列 | 当前评测主要证明规则与状态转换正确，尚不能代表真实设计质量或商业价值 | 将真实试用发现转为可复核的验收标准，逐步补充产品、设计专业性和长期结果评测 |
| Agent 与自动化 | Agent 已绑定当前 Project，并只读取可观察的 Fashion 项目上下文，不提供 Fashion 写工具 | 尚未形成可自主写入的多 Agent 生产系统 | 先补齐受控写工具、权限、审计、失败恢复和人工批准机制，再评估是否需要按职责拆分 Agent |
| 工程与运行 | 已完成全量构建、typecheck、46 个 Fashion 定向测试文件／284 个测试、全新 `DSH_HOME` 启动、HTTP 200、人工浏览器主链和六张截图验证 | 保留的上游 translation-pairing 与 Markdown 链接债务仍会报告，不能表述为全仓所有门禁通过 | 先修复或隔离已披露的上游文档债务，再把可重复验证固化到持续集成和后续版本验收中 |
| 模型与专业链路 | 已保留可替换 Provider，并把模型输出置于证据状态、人工审核和版本规则之下 | 尚未训练或微调服装垂直模型，也未打通图像、视频和专业设计工具链 | 在数据资产、基准任务和评测方法成熟后，比较提示工程、检索、模型路由与训练／微调收益，再选择多模态集成 |

代码归属不是待补功能：仓库保留上游基座，主要 Fashion 实现由 Cursor 按冻结规格完成；项目所有者负责产品与领域决策、任务组织、验收、复核、公开边界和最终责任，不声称所有代码均由本人独立手写。

## 5. 近期优先级

1. 公开前修复保留的上游文档链接债务，或明确缩小公开范围；
2. 建立可重复的设计师试用脚本和反馈模板；
3. 优先修复引用完整性、Brief 修订和评估可移植性；
4. 再讨论受控写工具和多 Agent 协作，避免先扩张自动化权限；
5. 将每轮问题映射回个人学习计划和下一版本验收标准。

路线图会随证据更新；规划存在不等于功能已经实现。
