---
description: "时装设计 Remote + Client 快照服务，覆盖 Brief 到 VisualDraft。"
kind: "package-reference"
---

# @gentlexx/dsh-api-fashion-design-controller

[English](README.md) | 中文

## 摘要

Host Typert Remote `fashionDesign` 投影 `ctx.fashionDesignRegistry` 操作。Client 半部挂载生成的 Remote，并安装带项目作用域 Brief／ConceptSet／Concept 快照的 `ctx.fashionDesign`。上游 selected Opportunity 校验留在 Host registry。无模型 Tool；无批准／拒绝／导出命令。

## 模型体验

无。

#### KV Cache 影响

无直接影响。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- UI 路由在 `ui-fashion-shell`。
- Browser 不得 value-import `dsh-fashion-design/order` 或 `/ids`。
- Provider 生成 VisualDraft 的 Remote 命令与 F3-01 Batch 4 一并延后。

<a id="dev-note"></a>
### 维护说明

<details>
<summary>维护者工作上下文 — 点击展开</summary>

不发布配套 `./invariant`：Host Remote 与 Client 快照通过 Typert 观察同一 registry。

</details>
