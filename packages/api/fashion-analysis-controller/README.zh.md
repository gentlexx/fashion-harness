---
description: "Fashion 分析 Remote 与 Client 快照服务，覆盖 MarketItem 到 DesignOpportunity。"
kind: "package-reference"
---

# @gentlexx/dsh-api-fashion-analysis-controller

[English](README.md) | 中文

## Summary

Host Typert Remote `fashionAnalysis` 投影 `ctx.fashionAnalysisRegistry`。Client 半挂载生成的 Remote，并安装带任务范围 MarketItem / Signal / Cluster / Opportunity 快照的 `ctx.fashionAnalysis`。每次 get/mutate 都要求父链 id。不注册模型 Tool。

## Model Experience

无。

#### KV Cache effect

无直接影响。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- UI 路由由 `ui-fashion-shell` 拥有。
- Browser 不得值导入 `dsh-fashion-analysis/order` 或 `/ids`。

<a id="dev-note"></a>
### 开发说明

<details>
<summary>维护者工作上下文 — 点击展开</summary>

不发布 `./invariant`：Host Remote 与 Client 快照通过 Typert 观察同一注册表。

</details>
