---
description: "Fashion Project Remote controller: Host create/get/list and Client snapshot service."
kind: "package-reference"
---

# Fashion Project Controller

English | [中文](README.zh.md)

## Summary

`@gentlexx/dsh-api-fashion-project-controller` owns Host `ctx.fashionProjectController` (`ctx.remote.fashionProject`) and Client `ctx.fashionProjects`. It projects the Fashion Project registry over Typert without registering model tools. Use it when the Fashion UI must create, list, or open durable projects.

## Table of Contents

- [Use this package](#use-this-package)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Host methods are `create`, `get`, and `list`. Invalid titles and missing ids map to `fashion-project/invalid-title` and `fashion-project/not-found`. The Client entry `$mount`s this package's generated `./remote` contribution (keeping Fashion out of shared `dsh-api-remotes`), then installs `ctx.fashionProjects`, loads the list, merges Host create responses into the snapshot, and ignores stale load responses.

## Model Experience

None. This package registers no prompt, tool, or session event.

#### KV Cache effect

No direct effect; Project Remotes do not alter model requests.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- v0 has no follow stream; Clients refresh via unary `list()` after reconnect or reload.
- Update and delete Remotes are deferred with the domain.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

No runtime invariant companion is published: Remote projection mirrors the registry without an independent observation.

</details>
