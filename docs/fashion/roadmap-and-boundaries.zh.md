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

## 4. 当前项目功能边界与后续方向

以下内容目前尚未实现或尚未形成证据，将按照数据合规、真实使用反馈和工程稳定性逐步推进，而不是为了扩大功能清单一次性加入：

| 当前项目功能边界 | 后续方向与进入条件 |
| --- | --- |
| 当前不实时抓取全球时尚数据 | 先明确来源授权、使用条款、更新频率和可追溯要求，再增加受控采集与更新能力 |
| 当前不能预测销量，也没有商业效果证据 | 在真实设计师试用和后续实际项目中分别记录可用性、决策效率与可获得的业务结果，不用合成数据代替真实结果 |
| 当前没有完整的 Fashion Dataset 或 Fashion Ontology | 从获得授权且可追溯的小规模资料开始，逐步建立数据规范、领域术语、质量检查和版本管理 |
| 当前没有训练或微调服装垂直模型 | 在数据资产、基准任务和评测方法成熟后，再比较提示工程、检索、模型路由与训练／微调的实际收益 |
| 当前没有打通图像、视频、CAD 或 Tech Pack 生产链 | 根据设计师真实工作流，优先连接价值明确的专业工具和人工审核节点，再扩展多模态交付 |
| 已完成首位设计师工作场景访谈，但尚未进行一期产品试用 | 作品集整理和一期缺口修复完成后，开展补充访谈与产品试用，分开记录场景研究、使用反馈和效果证据 |
| 当前 Agent 只读取项目上下文，尚未形成可自主写入的多 Agent 生产系统 | 先补齐受控写工具、权限、审计、失败恢复和人工批准机制，再评估是否需要按职责拆分 Agent |

代码归属不是待补功能：仓库保留上游基座，主要 Fashion 实现由 Cursor 按冻结规格完成；项目所有者负责产品与领域决策、任务组织、验收、复核、公开边界和最终责任，不声称所有代码均由本人独立手写。

## 5. 近期优先级

1. 公开前修复保留的上游文档链接债务，或明确缩小公开范围；
2. 建立可重复的设计师试用脚本和反馈模板；
3. 优先修复引用完整性、Brief 修订和评估可移植性；
4. 再讨论受控写工具和多 Agent 协作，避免先扩张自动化权限；
5. 将每轮问题映射回个人学习计划和下一版本验收标准。

路线图会随证据更新；规划存在不等于功能已经实现。
