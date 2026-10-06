---
description: "Fashion Research 注册表：基于 Storage Domain 的 ResearchTask、Source、Sample 与 Evidence。"
kind: "package-reference"
---

# @gentlexx/dsh-fashion-research

[English](README.md) | 中文

## Summary

`dsh-fashion-research` 拥有 `ctx.fashionResearchRegistry`：在 Storage Domain `fashion_research@0` 上对 ResearchTask、Source、Sample、Evidence 提供 create/get/list/update/archive，以及仅限人类的 Evidence review。打开时幂等播种保留的 R0 公开重建研究图。证据归属于 Project 而非 Session，本包不注册模型 Tool。

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
- name: '@gentlexx/dsh-fashion-research'
```

依赖 `storageDomain` 与 `fashionProjectRegistry`。每次写入校验 Project 存在，并拒绝只读 Project（含 R0）。父链校验拒绝跨项目与跨任务引用。更新携带 `expectedRevision`，不一致时返回 revision-conflict。列表按 `updatedAt` 降序、同时间 `id` 升序。R0 在 `r0-us-womens-khaki-utility-jacket` 下使用固定 task/source/sample/evidence id；漂移或部分种子会在启动失败。

## Model Experience

无。本包不注册模型可见 tool、prompt 或 session event。本 Host 服务不会把研究对象注入模型请求。

#### KV Cache effect

无直接影响；研究数据变更不改变模型请求。

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- 附件定位符仅接受不透明引用；字节准入延期至存在 Project 授权 admit 路径。
- Fashion UI 路由由 `ui-fashion-shell` 拥有。
- R1 可能改名并增加必填业务范围字段；v0 禁止以 optional metadata 偷渡。
- MarketItem、PopularitySignal、TrendCluster 与机会卡由 F2-02 拥有。

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

不发布配套 `./invariant`：注册表与 domain 表在同一所有者下是同一观察。

</details>
