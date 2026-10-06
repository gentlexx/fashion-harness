---
description: "Fashion Project Remote 控制器：Host create/get/list 与 Client 快照服务。"
kind: "package-reference"
---

# Fashion Project Controller

[English](README.md) | 中文

## 摘要

`@gentlexx/dsh-api-fashion-project-controller` 拥有 Host `ctx.fashionProjectController`（`ctx.remote.fashionProject`）与 Client `ctx.fashionProjects`。它通过 Typert 投影 Fashion Project 注册表，不注册模型工具。Fashion UI 需要创建、列出或打开持久化项目时使用本包。

## 目录

- [使用本包](#use-this-package)
- [模型体验](#model-experience)
- [已知限制与延后工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

Host 方法为 `create`、`get` 与 `list`。非法标题与缺失 id 映射为 `fashion-project/invalid-title` 与 `fashion-project/not-found`。Client 入口对本包生成的 `./remote` contribution 调用 `$mount`（Fashion 不进入共享的 `dsh-api-remotes`），再安装 `ctx.fashionProjects`、加载列表、将 Host create 响应合入快照，并忽略过期的 load 响应。

<a id="model-experience"></a>
## 模型体验

无。本包不注册提示词、工具或会话事件。

#### KV 缓存影响

无直接影响；Project Remote 不改变模型请求。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- v0 无 follow 流；Client 在重连或刷新后通过一元 `list()` 恢复。
- update/delete Remote 与领域一并延后。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文 — 点击展开</summary>

不发布 `./invariant` 伴生：Remote 投影镜像注册表，没有独立观察。

</details>
