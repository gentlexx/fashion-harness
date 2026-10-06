---
description: "Fashion Harness 产品域的包映射：持久化 Project 注册表及相关 Fashion 自有 Host 服务。"
kind: "package-group"
---

# fashion/ — Fashion Harness 领域

[English](README.md) | 中文

## 摘要

`fashion/` 组拥有不属于通用 Harness 能力的 Fashion 产品域 Host 服务。Fashion Project 持久化在此；Fashion UI 与 Remote 控制器分别留在 `client/` 与 `api/`。

## 目录

- [包](#packages)
- [开发备注](#dev-note)

-----

<a id="packages"></a>
## 包

| 包 | 角色 | ctx 键 |
|---|---|---|
| [`project/`](project/README.zh.md) | 基于 Storage Domain `fashion_projects@0` 的持久化 Fashion Project 注册表。 | `ctx.fashionProjectRegistry` |
| [`research/`](research/README.zh.md) | 基于 Storage Domain `fashion_research@0` 的 ResearchTask／Source／Sample／Evidence 注册表。 | `ctx.fashionResearchRegistry` |
| [`analysis/`](analysis/README.zh.md) | 基于 Storage Domain `fashion_analysis@0` 的 MarketItem／Ontology／Signal／Cluster／Opportunity 注册表。 | `ctx.fashionAnalysisRegistry` |
| [`design/`](design/README.zh.md) | 基于 Storage Domain `fashion_design@0` 的 Brief／ConceptSet／Concept／VisualDraft 注册表。 | `ctx.fashionDesignRegistry` |
| [`agent/`](agent/README.zh.md) | Host Project–Session 绑定、紧凑只读快照、pre-step 注入与受绑定约束的查询。 | `ctx.fashionAgentContext` |

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文 — 点击展开</summary>

本组专属于 Fashion 产品，有意与 Workspace/Session 身份分离。

</details>
