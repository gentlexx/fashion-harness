---
description: "Fashion Research Remote controller: Host CRUD/review Remotes and Client snapshot service."
kind: "package-reference"
---

# Fashion Research Controller

English | [中文](README.zh.md)

## Summary

`@gentlexx/dsh-api-fashion-research-controller` owns Host `ctx.fashionResearchController` (`ctx.remote.fashionResearch`) and Client `ctx.fashionResearch`. It projects the Fashion Research registry over Typert without registering model tools and without writing Session events.

## Table of Contents

- [Use this package](#use-this-package)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Host methods cover Task/Source/Sample/Evidence `create`/`get`/`list`/`update`/`archive` plus `reviewEvidence`. Domain errors map to stable `fashion-research/*` RemoteError codes. The Client entry `$mount`s this package's generated `./remote` contribution, installs `ctx.fashionResearch`, keeps project-scoped task and task-scoped child list snapshots, merges successful writes into the active scope, and ignores stale load responses.

## Model Experience

None. This package registers no prompt, tool, or session event.

#### KV Cache effect

No direct effect; Research Remotes do not alter model requests.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- v0 has no follow stream; Clients refresh via unary list calls after reconnect or reload.
- Attachment byte intake is deferred; Fashion UI routes live in `ui-fashion-shell`.
- Generic `upsert` and physical delete are intentionally absent.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

No runtime invariant companion is published: Remote projection mirrors the registry without an independent observation.

</details>
