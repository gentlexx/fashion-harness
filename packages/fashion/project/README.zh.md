---
description: "Fashion Project 注册表：通过 Storage Domain 持久化 Fashion Harness 产品壳层的项目记录。"
kind: "package-reference"
---

# @gentlexx/dsh-fashion-project

[English](README.md) | 中文

## 摘要

`dsh-fashion-project` 拥有 `ctx.fashionProjectRegistry`：在 Storage Domain `fashion_projects@0` 上创建、读取与列出 Fashion Project 记录。打开时幂等播种保留的 R0 公开重制项目，并且是 Project v0 的唯一 Host 写入路径。Fashion profile 需要持久化项目时挂载本包；其他场景无需挂载。

## 目录

- [使用本包](#use-this-package)
- [模型体验](#model-experience)
- [已知限制与延后工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

```yaml
- name: '@gentlexx/dsh-fashion-project'
```

依赖 `storageDomain`。`create({ title })` 在 Host 规范化标题、生成 UUID `ProjectId`，并仅在 domain 写入提交后返回。`list()` 返回 Host 稳定顺序（`createdAt` 降序，再按 `id` 升序）。R0 使用 `r0-us-womens-khaki-utility-jacket`，`origin: public-rebuild` 且 `accessMode: read-only`；R0 行不变量漂移时启动失败。

## 模型体验

<a id="model-experience"></a>

无。本包不注册模型可见的工具、提示词或会话事件。

#### KV 缓存影响

无直接影响；Project 变更不改变模型请求。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- v0 仅提供 create/get/list；更新、删除、归档以及 Session/Workspace 绑定延后。
- 不兼容的 Storage Domain 升级需单独架构决策；本包不提供私有迁移器。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文 — 点击展开</summary>

不发布 `./invariant` 伴生：注册表与 domain 表在同一所有者下是同一观察。

</details>
