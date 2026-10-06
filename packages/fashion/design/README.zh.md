---
description: "时装设计注册表：Brief、ConceptSet、Concept、VisualDraft、ReviewRound 与 DesignDeliverable，落在 Fashion Harness 的 Storage Domain 上。"
kind: "package-reference"
---

# @gentlexx/dsh-fashion-design

[English](README.md) | 中文

## 摘要

`dsh-fashion-design` 拥有 `ctx.fashionDesignRegistry`：在 Storage Domain `fashion_design@1`（`compatibleVersions: [0]`）上管理 DesignOpportunityBrief、ConceptSet、DesignConcept、VisualDraft、DesignArtifact 元数据、ReviewRound／ReviewDecision、ApprovalInvalidation，以及 DesignDeliverable／ExportArtifact。打开时装载只读 R0 设计图，以及 Cropped 的 recorded 批准与 public_portfolio 交付包。正式 Brief 创建要求 selected Opportunity 精确 revision。仅 Host 人类 actor 可 select／approve；客户端不得上传 actorKind。不注册模型 Tool。

## 目录

- [使用本包](#use-this-package)
- [模型体验](#model-experience)
- [已知限制与延后工作](#known-limitations-and-deferred-work)
- [维护说明](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

```yaml
- name: '@gentlexx/dsh-fashion-project'
- name: '@gentlexx/dsh-fashion-research'
- name: '@gentlexx/dsh-fashion-analysis'
- name: '@gentlexx/dsh-fashion-design'
```

需要 `storageDomain`、`fashionProjectRegistry`、`fashionResearchRegistry` 与 `fashionAnalysisRegistry`。上游 selected Opportunity 校验只经由 analysis registry。`review_ready` 要求恰好三个 Concept 且 pairwise 结构差异通过。打开审核要求 `review_ready` ConceptSet 精确 revision；批准要求当前 select；生成要求当前有效批准。DeliverableSnapshot 身份使用 RFC 8785 JCS + SHA-256。受众过滤由 Host 拥有（`public_portfolio` 不是自动发布）。JSON 与 Markdown 从已批准精确 Concept revision 的同一份冻结快照渲染；Markdown 要求标题、设计意图、廓形与比例均非空，缺失时生成以 `FashionDesignRenderFailedError` 失败，而不写入空字段。对不展示该 Concept 的受众，渲染“已隐去”标记。R0 使用既有 R0 项目下的固定设计与审核 id；漂移或部分种子在启动时失败。

<a id="model-experience"></a>

## 模型体验

无。本包不注册模型可见的 tool、prompt 或 session event。本 Host 服务不会把设计对象注入模型请求。

#### KV Cache 影响

无直接影响；设计变更不改变模型请求。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- 无付费视觉 Provider；v0 仅 recorded／manual VisualDraft。
- DesignArtifact 只存元数据／tombstone；不以 Session 附件充当 Project 资产授权。
- 交付导出仅存文本 JSON／Markdown／manifest；无二进制 Tech Pack／CAD／BOM 管线。
- R1 可校准廓形／比例等显示词与 ready 强度，但不改 revision 或人类确认门禁。

<a id="dev-note"></a>
### 维护说明

<details>
<summary>维护者工作上下文 — 点击展开</summary>

不发布配套 `./invariant`：registry 与 domain 表是同一所有者下的同一观察。Domain 版本为 `@1` 并相邻打开 `@0`；行级 `schemaVersion` 仍为 `0`。

</details>
