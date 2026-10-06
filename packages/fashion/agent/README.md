---
description: "Fashion Agent Host context: Project–Session binding, compact read-only snapshots, pre-step injection, and a bound query tool."
kind: "package-reference"
---

# @gentlexx/dsh-fashion-agent

English | [中文](README.zh.md)

## Summary

`dsh-fashion-agent` owns `ctx.fashionAgentContext`. It stores Host-authoritative Project–Session bindings in Storage Domain `fashion_agent_bindings@0`, folds a compact live snapshot from Fashion registries, injects that snapshot on `agent/pre-step` step 1, and registers the bound read-only `fashion_project_query` tool. Workspace paths are never project identity. The package registers no Fashion write tools.

## Table of Contents

- [Use this package](#use-this-package)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

```yaml
- name: '@gentlexx/dsh-fashion-agent'
```

Requires `storageDomain` and the Fashion project, research, analysis, design, feedback, and evaluation registries, plus `agents`. `tools` and `systemPrompt` are optional: when present, the package registers `fashion_project_query` and the fixed `fashion-agent-readonly` section.

`bind()` stores `{ projectId, boundAt, entrySurface }` keyed by Session id. A blank session binds; a same-project session continues; a different-project session returns `conflict-other-project`; an unbound session that already has user messages returns `needs-confirm` until `confirmUnboundWithMessages` is true. Missing or inaccessible projects return `unavailable` and persist no binding. Snapshots are computed at read time and are not written into the binding row or Session metadata.

On each user turn, step 1 of `agent/pre-step` appends a plugin-sourced user message with the latest snapshot, or a non-leaking unavailability notice. Later steps of the same turn add nothing. Unbound sessions receive no Fashion snapshot.

`fashion_project_query` accepts only `section`. The Host reads `projectId` from the calling session binding.

## Model Experience

### Read-only system prompt

#### What the model sees

The `fashion-agent-readonly` section is a fixed permission paragraph. Live project fields are never written into this section.

##### Permission text

```markdown
Fashion project assistance is read-only. When this session is bound to a Fashion project, a compact snapshot is appended each user turn. Use fashion_project_query to read more of the same bound project; you cannot pass a project id. Never treat the workspace folder name as the project identity. Do not create, edit, approve, reject, export, or write Fashion project data. Return suggestions as text only.
```

#### Token effect

Fixed per-request cost while the plugin is loaded. The paragraph does not grow with project size.

#### KV Cache effect

Prefix-stable while the section text and order stay unchanged.

### Per-turn project snapshot

#### What the model sees

A plugin-sourced user message on `agent/pre-step` step 1. Bound text includes `projectId`, the formal title, `snapshotVersion`, `dataScope`, and compact domain summaries. Unbound sessions receive no Fashion message. A dangling or failed binding receives an unavailability notice that does not include another project's body.

#### Token effect

Grows with the compact snapshot on step 1 only. Later steps of the same turn add no Fashion text.

#### KV Cache effect

Append-only for the new user message. It does not rewrite the system-prompt prefix.

### Bound project query

#### What the model sees

The `fashion_project_query` tool accepts only `section`. The Host supplies `projectId` from the session binding. The model-facing success text lists `section`, `projectId`, and `snapshotVersion`, then `body=` with the section as compact JSON; a `null` section is labeled as having no data. Failure text carries only `section` and `error`, never a body. The tool cannot create, edit, approve, export, or write Fashion data.

#### Token effect

The schema is fixed. Result size scales with one compact section of the bound project.

#### KV Cache effect

Append-only tool history. It does not rewrite the system-prompt prefix.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- Phase 1 is read-only: the Agent cannot mutate Fashion storage, start Cursor, or copy the project database into the workspace.
- Review approval is inferred from the selected deliverable concept when review decisions are not publicly listed.
- DSH source-checkout visibility for generic runtime tools is an independent Harness question; this package does not change that policy.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

No companion is published because binding rows, live snapshots, and pre-step messages are the same Host-owned observation; independent reporters cannot diverge without a second store.

</details>
