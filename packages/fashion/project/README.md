---
description: "Fashion Project registry: durable project records over Storage Domain for the Fashion Harness product shell."
kind: "package-reference"
---

# @gentlexx/dsh-fashion-project

English | [中文](README.zh.md)

## Summary

`dsh-fashion-project` owns `ctx.fashionProjectRegistry`: create, get, and list Fashion Project records over Storage Domain `fashion_projects@0`. It seeds the reserved R0 public-rebuild project once at open and is the only Host write path for Project v0. Mount it whenever the Fashion profile needs durable projects; skip it outside Fashion.

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
```

Requires `storageDomain`. `create({ title })` normalizes the title on the Host, mints a UUID `ProjectId`, and persists only after the domain write commits. `list()` returns Host-stable order (`createdAt` descending, then `id` ascending). R0 uses `r0-us-womens-khaki-utility-jacket` with `origin: public-rebuild` and `accessMode: read-only`; a drifted R0 row fails startup.

## Model Experience

None. This package registers no model-visible tool, prompt, or session event.

#### KV Cache effect

No direct effect; Project mutations do not alter model requests.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- v0 admits create/get/list only; update, delete, archive, and Session/Workspace binding are deferred.
- Incompatible Storage Domain upgrades need a separate architecture decision; this package does not ship a private migrator.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

No runtime invariant companion is published: the registry and domain table are the same observation under one owner.

</details>
