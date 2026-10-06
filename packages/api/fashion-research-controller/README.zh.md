---
description: "Fashion Research Remote 控制器：Host CRUD／审核 Remotes 与 Client 快照服务。"
kind: "package-reference"
---

# Fashion Research Controller

[English](README.md) | 中文

## Summary

`@gentlexx/dsh-api-fashion-research-controller` 拥有 Host `ctx.fashionResearchController`（`ctx.remote.fashionResearch`）与 Client `ctx.fashionResearch`。它通过 Typert 投影 Fashion Research 注册表，不注册模型 tool，也不写入 Session 事件。

## Table of Contents

- [Use this package](#use-this-package)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Host 方法覆盖 Task／Source／Sample／Evidence 的 `create`／`get`／`list`／`update`／`archive` 以及 `reviewEvidence`。领域错误映射为稳定的 `fashion-research/*` RemoteError 码。Client 入口对本包生成的 `./remote` contribution 调用 `$mount`，安装 `ctx.fashionResearch`，维护按 Project 作用域的任务列表与按 Task 作用域的子对象列表快照，将成功写入合入当前作用域，并忽略过期的 load 响应。

## Model Experience

无。本包不注册 prompt、tool 或 session event。

#### KV Cache effect

无直接影响；Research Remotes 不改变模型请求。

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- v0 无 follow 流；Client 在重连或刷新后通过一元 list 调用刷新。
- 附件字节准入已延期；Fashion UI 路由位于 `ui-fashion-shell`。
- 有意不提供通用 `upsert` 与物理删除。

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

不发布配套 `./invariant`：Remote 投影镜像注册表，没有独立观察。

</details>
