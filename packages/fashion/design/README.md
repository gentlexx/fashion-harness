---
description: "Fashion Design registry: Brief, ConceptSet, Concept, VisualDraft, ReviewRound, and DesignDeliverable over Storage Domain for Fashion Harness."
kind: "package-reference"
---

# @gentlexx/dsh-fashion-design

English | [中文](README.zh.md)

## Summary

`dsh-fashion-design` owns `ctx.fashionDesignRegistry`: DesignOpportunityBrief, ConceptSet, DesignConcept, VisualDraft, DesignArtifact metadata, ReviewRound / ReviewDecision, ApprovalInvalidation, and DesignDeliverable / ExportArtifact over Storage Domain `fashion_design@1` (`compatibleVersions: [0]`). It seeds the reserved R0 design graph and a recorded Cropped approval plus public_portfolio deliverable once at open. Formal Brief creation requires a selected Opportunity exact revision. Human Host actors alone select/approve; clients never upload actorKind. No model Tools are registered.

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
- name: '@gentlexx/dsh-fashion-design'
```

Requires `storageDomain`, `fashionProjectRegistry`, `fashionResearchRegistry`, and `fashionAnalysisRegistry`. Upstream selected Opportunity checks go through the analysis registry only. `review_ready` requires exactly three Concepts with pairwise structural differentiation. Open review requires a `review_ready` ConceptSet exact revision; approve requires a current select; generate requires a currently valid approval. DeliverableSnapshot identity uses RFC 8785 JCS + SHA-256. Audience filtering is Host-owned (`public_portfolio` is not auto-publish). JSON and Markdown render from one frozen snapshot of the approved exact Concept revision; Markdown requires a non-empty title, design intent, silhouette, and proportion, and generation fails with `FashionDesignRenderFailedError` instead of writing an empty field. An audience that withholds the Concept renders a withheld marker. R0 uses fixed design and review ids under the existing R0 project; drifted or partial seeds fail startup.

## Model Experience

None. This package registers no model-visible tool, prompt, or session event. Design objects are never injected into model requests from this Host service.

#### KV Cache effect

No direct effect; design mutations do not alter model requests.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- No paid visual Provider; recorded/manual VisualDraft paths only in v0.
- DesignArtifact stores metadata/tombstones only; no Session attachment reuse as Project asset authorization.
- Deliverable export stores text JSON/Markdown/manifest only; no binary Tech Pack/CAD/BOM pipeline.
- R1 may calibrate display vocabulary for silhouette/proportion and readiness strength without changing revision or human-confirm gates.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

No runtime invariant companion is published: the registry and domain tables are the same observation under one owner. Domain version is `@1` with adjacent `@0` open; row `schemaVersion` stays `0`.

</details>
