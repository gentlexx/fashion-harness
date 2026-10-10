# 路线图与能力边界

[English](roadmap-and-boundaries.md) | 中文

## 1. 长期闭环

Fashion Harness 的长期方向是：

```text
合规服装与趋势信息（Compliant Fashion & Trend Information）
→ 数据清洗、标准化与多模态理解（Cleaning / Standardization / Multimodal Understanding）
→ 服装数据集与领域本体（Fashion Dataset / Fashion Ontology）
→ 趋势分析与设计机会（Trend Analysis / Design Opportunity）
→ Harness 辅助研究与设计决策（Harness-assisted Research & Design Decision）
→ 设计师审核、专业工具深化与交付（Designer Review / Professional-tool Refinement / Delivery）
→ 设计师反馈、评测与可获得的市场结果（Designer Feedback / Evaluation / Available Market Outcome）
→ 下一轮模型、规则与工作流改进（Model / Rule / Workflow Improvement Cycle）
```

长期核心资产是 Dataset、Ontology、Harness、设计师反馈和评测体系的组合，而不是单一模型。

## 2. 当前实现边界

当前仓库只实现长期闭环中的一个可验证切片：

```text
设计需求（Brief）
→ 小规模可追溯研究集（Traceable Research Set）
→ 趋势与设计机会（Trend Cluster / Design Opportunity）
→ 三个差异化设计方向（Three Design Concepts）
→ 人工审核与版本变更（Human Review / Revision）
→ 冻结交付快照（Versioned Deliverable）
→ 反馈与评测记录（Designer Feedback / Evaluation Record）
```

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

## 4. 当前不作的主张

- 不声称实时抓取全球时尚数据；
- 不声称预测销量或证明商业效果；
- 不声称已拥有完整 Fashion Dataset 或 Ontology；
- 不声称已训练或微调服装垂直模型；
- 不声称已打通图像、视频、CAD 或 Tech Pack 生产线；
- 不把已完成的设计师工作场景访谈写成一期产品试用、可用性验证或效果证明；
- 不声称已经实现可自主写入的多 Agent 生产系统；
- 不声称所有代码由项目所有者独立手写。

## 5. 近期优先级

1. 公开前修复保留的上游文档链接债务，或明确缩小公开范围；
2. 建立可重复的设计师试用脚本和反馈模板；
3. 优先修复引用完整性、Brief 修订和评估可移植性；
4. 再讨论受控写工具和多 Agent 协作，避免先扩张自动化权限；
5. 将每轮问题映射回个人学习计划和下一版本验收标准。

路线图会随证据更新；规划存在不等于功能已经实现。
