# 路线图与能力边界

[English](roadmap-and-boundaries.md) | 中文

## 1. 长期闭环

Fashion Harness 的长期方向是：

```text
Compliant fashion and trend information
→ cleaning, standardization, and multimodal understanding
→ Fashion Dataset / Fashion Ontology
→ trend analysis and design opportunities
→ Harness-assisted research and design decisions
→ designer review, professional-tool refinement, and delivery
→ designer feedback, evaluation, and available market outcomes
→ the next model, rule, and workflow improvement cycle
```

长期核心资产是 Dataset、Ontology、Harness、设计师反馈和评测体系的组合，而不是单一模型。

## 2. 当前实现边界

当前仓库只实现长期闭环中的一个可验证切片：

```text
Brief
→ small traceable research set
→ trends and design opportunities
→ three design directions
→ human review and version change
→ delivery snapshot
→ feedback and evaluation records
```

这条切片用于验证产品结构、领域规则、Agent 上下文和交付证据，不代表完整商业产品。

## 3. 分阶段路线

| 阶段 | 目标 | 状态 |
| --- | --- | --- |
| 当前工程切片 | 建立领域对象、规则、控制器、Fashion Shell 和 Harness 读取能力 | Implemented |
| 公开化定向调整 | 品牌隔离、命名、引导配置、构建引用和种子不确定性治理 | T-04 verified |
| 最终候选验收 | 全量构建、测试、启动、浏览器主流程、截图和应用 SHA | Pending T-06 |
| 设计师试用 | 观察真实任务、记录摩擦与反馈、形成迭代证据 | Planned |
| 研究完整性 | 强化跨项目归属、引用存在性、授权和可追溯校验 | Planned |
| 工作流增强 | 完整 Brief 修订、受控写工具、多 Agent 分工与恢复机制 | Planned |
| 数据资产 | 合规采集、Dataset、Ontology 和质量评估 | Planned |
| 模型与专业链路 | 多模型路由、视觉生成、CAD/Tech Pack、训练或微调 | Planned |

## 4. 当前不作的主张

- 不声称实时抓取全球时尚数据；
- 不声称预测销量或证明商业效果；
- 不声称已拥有完整 Fashion Dataset 或 Ontology；
- 不声称已训练或微调服装垂直模型；
- 不声称已打通图像、视频、CAD 或 Tech Pack 生产线；
- 不声称已完成真实服装设计师用户研究；
- 不声称已经实现可自主写入的多 Agent 生产系统；
- 不声称所有代码由项目所有者独立手写。

## 5. 近期优先级

1. 完成 T-06 最终候选验证并修复真实 blocker；
2. 只在最终应用提交上采集截图和运行证据；
3. 建立可重复的设计师试用脚本和反馈模板；
4. 优先修复引用完整性、Brief 修订和评估可移植性；
5. 再讨论受控写工具和多 Agent 协作，避免先扩张自动化权限；
6. 将每轮问题映射回个人学习计划和下一版本验收标准。

路线图会随证据更新；规划存在不等于功能已经实现。
