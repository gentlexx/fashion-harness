---
description: "Fashion 分析注册表：在 Storage Domain 上管理 MarketItem、Ontology、Attribute、PopularitySignal、TrendCluster 与 DesignOpportunity。"
kind: "package-reference"
---

# @gentlexx/dsh-fashion-analysis

[English](README.md) | 中文

## Summary

`dsh-fashion-analysis` 拥有 `ctx.fashionAnalysisRegistry`：在 Storage Domain `fashion_analysis@0` 上管理 MarketItem、Ontology Lite、AttributeAssertion、PopularitySignal、AnalysisRun、TrendCluster、DesignOpportunity 与 OpportunityDecision。启动时幂等写入保留的 R0 分析图。正式输入要求 F2-01 confirmed Evidence；规则不得 selected Opportunity，也不得确认同款。不注册模型 Tool。

## Table of Contents

- [使用本包](#use-this-package)
- [Model Experience](#model-experience)
- [已知限制与延后工作](#known-limitations-and-deferred-work)
- [开发说明](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

```yaml
- name: '@gentlexx/dsh-fashion-project'
- name: '@gentlexx/dsh-fashion-research'
- name: '@gentlexx/dsh-fashion-analysis'
```

需要 `storageDomain`、`fashionProjectRegistry` 与 `fashionResearchRegistry`。父链校验拒绝跨项目/跨任务引用。`reconcileStale` 在关联 Evidence 变为 rejected/invalidated/archived 时把下游分析行标 stale，不改写 F2-01 历史。R0 使用既有 R0 项目/任务下的固定分析 id；漂移或部分缺失会启动失败。普通项目初始没有 MarketItem/Signal/Cluster/Opportunity。

## Model Experience

无。本包不注册模型可见 Tool、提示词或 Session 事件。Host 服务不会把分析对象注入模型请求。

#### KV Cache effect

无直接影响；分析变更不改变模型请求。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- 不做 embedding/统计聚类；ClusterMethod 仅 manual|rule。
- 不做跨平台 hotScore；PopularitySignal 保留平台指标语义。
- 附件字节摄取仍与 F2-01 一并延期。
- R1 可能替换机会 reason code 显示词；v0 使用工程词加自由备注。

<a id="dev-note"></a>
### 开发说明

<details>
<summary>维护者工作上下文 — 点击展开</summary>

不发布 `./invariant` 伴生：注册表与 Domain 表在同一所有者下是同一观察。

</details>
