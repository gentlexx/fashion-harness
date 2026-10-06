---
description: "Fashion Analysis registry: MarketItem, Ontology, Attribute, PopularitySignal, TrendCluster, and DesignOpportunity over Storage Domain for Fashion Harness."
kind: "package-reference"
---

# @gentlexx/dsh-fashion-analysis

English | [中文](README.zh.md)

## Summary

`dsh-fashion-analysis` owns `ctx.fashionAnalysisRegistry`: MarketItem, Ontology Lite, AttributeAssertion, PopularitySignal, AnalysisRun, TrendCluster, DesignOpportunity, and OpportunityDecision over Storage Domain `fashion_analysis@0`. It seeds the reserved R0 analysis graph once at open. Formal inputs require confirmed F2-01 Evidence; rules never select Opportunities or confirm same-item dedupe. No model Tools are registered.

## Table of Contents

- [Use this package](#use-this-package)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

```yaml
- name: '@gentlexx/dsh-fashion-project'
- name: '@gentlexx/dsh-fashion-research'
- name: '@gentlexx/dsh-fashion-analysis'
```

Requires `storageDomain`, `fashionProjectRegistry`, and `fashionResearchRegistry`. Parent-chain checks refuse cross-project and cross-task references. `reconcileStale` marks dependent analysis rows when linked Evidence becomes rejected/invalidated/archived without rewriting F2-01 history. R0 uses fixed analysis ids under the existing R0 project/task; drifted or partial seeds fail startup. Ordinary projects start with no MarketItem/Signal/Cluster/Opportunity.

## Model Experience

None. This package registers no model-visible tool, prompt, or session event. Analysis objects are never injected into model requests from this Host service.

#### KV Cache effect

No direct effect; analysis mutations do not alter model requests.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- No embedding/statistical clustering; ClusterMethod is manual|rule only.
- No cross-platform hotScore; PopularitySignal keeps platform metric semantics.
- Attachment byte intake remains deferred with F2-01.
- R1 may replace opportunity reason-code display vocabulary; v0 uses engineering codes plus free-text note.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

No runtime invariant companion is published: the registry and domain tables are the same observation under one owner.

</details>
