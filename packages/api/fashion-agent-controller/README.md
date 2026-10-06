---
description: "Fashion Agent Remote controller: Host bind/status commands and Client snapshot service."
kind: "package-reference"
---

# Fashion Agent Controller

English | [中文](README.zh.md)

## Summary

`@gentlexx/dsh-api-fashion-agent-controller` owns Host `ctx.fashionAgentController` (`ctx.remote.fashionAgent`) and Client `ctx.fashionAgent`. It projects Project–Session bind and live status over Typert. Model tools and pre-step injection stay on `@gentlexx/dsh-fashion-agent`.

## Table of Contents

- [Use this package](#use-this-package)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Host methods are `bindSession` and `getStatus`. The Client entry `$mount`s this package's generated `./remote` contribution, then installs `ctx.fashionAgent` with `bind` and `sync`. The Client never sends a model-chosen project id for query; query remains a Host tool on the bound session.

## Model Experience

None, as this Remote only projects Host binding status and registers no prompt, tool, or session event.

#### KV Cache effect

No direct effect; bind and status Remotes do not alter model requests.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- v0 has no bind follow stream; the Client refreshes via `sync` after session changes.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

No companion is published because the Remote mirrors `ctx.fashionAgentContext` without an independent observation.

</details>
