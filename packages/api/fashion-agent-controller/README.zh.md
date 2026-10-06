---
description: "Fashion Agent Remote 控制器：Host 绑定／状态命令与 Client 快照服务。"
kind: "package-reference"
---

# Fashion Agent Controller

[English](README.md) | 中文

## 摘要

`@gentlexx/dsh-api-fashion-agent-controller` 拥有 Host `ctx.fashionAgentController`（`ctx.remote.fashionAgent`）与 Client `ctx.fashionAgent`。它通过 Typert 投影 Project–Session 绑定与实时状态。模型工具与 pre-step 注入仍由 `@gentlexx/dsh-fashion-agent` 拥有。

## 目录

- [使用本包](#use-this-package)
- [模型体验](#model-experience)
- [已知限制与延后工作](#known-limitations-and-deferred-work)
- [维护说明](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

Host 方法为 `bindSession` 与 `getStatus`。Client 入口 `$mount` 本包生成的 `./remote` 贡献，然后安装带 `bind` 与 `sync` 的 `ctx.fashionAgent`。Client 不会为查询发送模型自选的项目 id；查询仍是绑定会话上的 Host 工具。

<a id="model-experience"></a>

## 模型体验

无，因为本 Remote 只投影 Host 绑定状态，不注册 prompt、tool 或 session event。

#### KV Cache 影响

无直接效果；绑定与状态 Remote 不改变模型请求。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- v0 没有绑定 follow 流；Client 在会话变化后通过 `sync` 刷新。

<a id="dev-note"></a>
### 维护说明

<details>
<summary>维护者工作上下文 — 点击展开</summary>

不发布 companion：Remote 镜像 `ctx.fashionAgentContext`，没有独立观察。

</details>
