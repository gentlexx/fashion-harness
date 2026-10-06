---
description: "Fashion Design Remote + Client snapshot service for Brief through VisualDraft."
kind: "package-reference"
---

# @gentlexx/dsh-api-fashion-design-controller

English | [中文](README.zh.md)

## Summary

Host Typert Remote `fashionDesign` projects `ctx.fashionDesignRegistry` operations. The Client half mounts the generated Remote and installs `ctx.fashionDesign` with project-scoped Brief / ConceptSet / Concept snapshots. Upstream selected Opportunity checks stay on the Host registry. No model Tools; no approve/reject/export commands.

## Model Experience

None.

#### KV Cache effect

No direct effect.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- UI routes live in `ui-fashion-shell`.
- Browser must not value-import `dsh-fashion-design/order` or `/ids`.
- Provider-generated VisualDraft Remote commands are deferred with F3-01 Batch 4.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

No runtime invariant companion is published: Host Remote and Client snapshots observe the same registry through Typert.

</details>
