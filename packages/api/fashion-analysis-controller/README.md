---
description: "Fashion Analysis Remote + Client snapshot service for MarketItem through DesignOpportunity."
kind: "package-reference"
---

# @gentlexx/dsh-api-fashion-analysis-controller

English | [中文](README.zh.md)

## Summary

Host Typert Remote `fashionAnalysis` projects `ctx.fashionAnalysisRegistry` operations. The Client half mounts the generated Remote and installs `ctx.fashionAnalysis` with task-scoped MarketItem / Signal / Cluster / Opportunity snapshots. Parent-chain ids are required on every get/mutate. No model Tools.

## Model Experience

None.

#### KV Cache effect

No direct effect.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- UI routes live in `ui-fashion-shell`.
- Browser must not value-import `dsh-fashion-analysis/order` or `/ids`.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

No runtime invariant companion is published: Host Remote and Client snapshots observe the same registry through Typert.

</details>
