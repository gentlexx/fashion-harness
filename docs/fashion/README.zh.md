# Fashion Harness 文档导航

[English](README.md) | 中文

本目录展示 Fashion Harness 当前可公开的产品、系统与工程证据。阅读时请区分四种状态：

- **Implemented**：候选代码中已经存在；
- **T-04 verified**：已通过 T-04 定向测试或静态检查；
- **T-06 verified with disclosed limitations**：最终构建、Fashion 定向测试、启动、浏览器主链与截图已在应用提交上通过，同时保留并公开命名文档债务；
- **Planned**：属于长期设计，但尚未实现。

## 推荐阅读路径

1. [产品案例](product-case-study.zh.md)：问题、用户、范围和产品决策；
2. [系统架构](architecture.zh.md)：领域包、控制器、Harness 与证据链；
3. [开发过程](development-process.zh.md)：从规划到实现、审计和交付的工作方式；
4. [验证与证据](validation-and-evidence.zh.md)：已经验证什么、还缺什么；
5. [数据来源与限制](data-provenance-and-limitations.zh.md)：可追溯性、合规和已知边界；
6. [学习与迭代](learning-and-iteration.zh.md)：如何把项目问题映射回学习路线；
7. [路线图与能力边界](roadmap-and-boundaries.zh.md)：当前切片与长期闭环的关系；
8. [虚构演练](../../examples/fashion-fictional-walkthrough/README.zh.md)：不用真实客户数据说明一次端到端流程；
9. [截图证据清单](assets/screenshots/screenshot-manifest.zh.md)：包含从冻结应用提交采集的六张截图、哈希和场景边界。

## 当前公开结论

Fashion Harness 已实现一个服装研究与设计决策闭环的工程切片：从 Brief 和可追溯研究对象出发，形成趋势机会、三个设计方向、人工审核、交付与评估记录。T-06 已在冻结应用提交上完成构建、typecheck、46 个 Fashion 定向测试文件／284 个测试、全新运行目录启动、页面 HTTP 200、人工浏览器检查和六张截图。保留的上游文档链接仍会导致全仓 translation-pairing 与 Markdown 链接门禁失败；该债务被公开披露而不是隐藏。

本仓库不声称已经实现大规模自动采集、实时市场预测、完整 Fashion Dataset/Ontology、垂直模型训练、CAD/Tech Pack 或真实商业效果。
