---
description: "Fashion Research registry: ResearchTask, Source, Sample, and Evidence over Storage Domain for the Fashion Harness product."
kind: "package-reference"
---

# @gentlexx/dsh-fashion-research

English | [中文](README.zh.md)

## Summary

`dsh-fashion-research` owns `ctx.fashionResearchRegistry`: create/get/list/update/archive for ResearchTask, Source, Sample, and Evidence over Storage Domain `fashion_research@0`, plus human-only Evidence review. It seeds the reserved R0 public-rebuild research graph once at open. Evidence belongs to a Project, not a Session, and this package registers no model Tools.

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
```

Requires `storageDomain` and `fashionProjectRegistry`. Every write verifies Project existence and rejects read-only Projects (including R0). Parent-chain checks refuse cross-project and cross-task references. Updates carry `expectedRevision` and fail with revision-conflict on mismatch. List order is `updatedAt` descending, then `id` ascending. R0 uses fixed task/source/sample/evidence ids under `r0-us-womens-khaki-utility-jacket`; drifted or partial seeds fail startup.

## Model Experience

None. This package registers no model-visible tool, prompt, or session event. Research objects are never injected into model requests from this Host service.

#### KV Cache effect

No direct effect; research mutations do not alter model requests.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- Attachment locators accept opaque refs only; byte intake is deferred until a Project-authorized admit path exists.
- Fashion UI routes are owned by `ui-fashion-shell`.
- R1 may rename labels and add required business scope fields; v0 forbids smuggling those fields as optional metadata.
- F2-02 owns MarketItem, PopularitySignal, TrendCluster, and opportunity cards.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

No runtime invariant companion is published: the registry and domain tables are the same observation under one owner.

</details>
