---
description: "Package map for the Fashion Harness product domain: durable Project registry and related Fashion-owned Host services."
kind: "package-group"
---

# fashion/ — Fashion Harness domain

English | [中文](README.zh.md)

## Summary

The `fashion/` group owns Fashion product-domain Host services that are not generic Harness capabilities. Fashion Project persistence lives here; Fashion UI and Remote controllers remain in `client/` and `api/`.

## Table of Contents

- [Packages](#packages)
- [Dev Note](#dev-note)

-----

<a id="packages"></a>
## Packages

| Package | Role | ctx key |
|---|---|---|
| [`project/`](project/README.md) | Durable Fashion Project registry over Storage Domain `fashion_projects@0`. | `ctx.fashionProjectRegistry` |
| [`research/`](research/README.md) | Durable ResearchTask/Source/Sample/Evidence registry over Storage Domain `fashion_research@0`. | `ctx.fashionResearchRegistry` |
| [`analysis/`](analysis/README.md) | Durable MarketItem/Ontology/Signal/Cluster/Opportunity registry over Storage Domain `fashion_analysis@0`. | `ctx.fashionAnalysisRegistry` |
| [`design/`](design/README.md) | Durable Brief/ConceptSet/Concept/VisualDraft registry over Storage Domain `fashion_design@0`. | `ctx.fashionDesignRegistry` |
| [`agent/`](agent/README.md) | Host Project–Session binding, compact read-only snapshots, pre-step injection, and bound query. | `ctx.fashionAgentContext` |

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

This group is Fashion-product-specific and intentionally separate from Workspace/Session identity.

</details>
