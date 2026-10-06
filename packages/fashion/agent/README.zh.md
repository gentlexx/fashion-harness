---
description: "Fashion Agent Host 上下文：Project–Session 绑定、紧凑只读快照、pre-step 注入，以及受绑定约束的查询工具。"
kind: "package-reference"
---

# @gentlexx/dsh-fashion-agent

[English](README.md) | 中文

## 摘要

`dsh-fashion-agent` 拥有 `ctx.fashionAgentContext`。它把 Host 权威的 Project–Session 绑定存在 Storage Domain `fashion_agent_bindings@0`，从 Fashion 注册表折叠一份紧凑的实时快照，在 `agent/pre-step` 第 1 步注入该快照，并注册受绑定约束的只读 `fashion_project_query` 工具。工作区路径不是项目身份。本包不注册任何 Fashion 写工具。

## 目录

- [使用本包](#use-this-package)
- [模型体验](#model-experience)
- [已知限制与延后工作](#known-limitations-and-deferred-work)
- [维护说明](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

```yaml
- name: '@gentlexx/dsh-fashion-agent'
```

需要 `storageDomain` 以及 Fashion 的 project、research、analysis、design、feedback、evaluation 注册表，外加 `agents`。`tools` 与 `systemPrompt` 可选：存在时本包注册 `fashion_project_query` 和固定的 `fashion-agent-readonly` 段落。

`bind()` 按 Session id 存储 `{ projectId, boundAt, entrySurface }`。空白会话可绑定；已绑定同一项目的会话可继续；已绑定其他项目返回 `conflict-other-project`；已有用户消息但未绑定的会话返回 `needs-confirm`，直到 `confirmUnboundWithMessages` 为 true。项目缺失或不可访问返回 `unavailable`，并且不持久化绑定。快照在读取时计算，不写入绑定行或 Session metadata。

每个用户回合的 `agent/pre-step` 第 1 步追加一条插件来源的用户消息，内容为最新快照，或一条不泄漏其他项目正文的不可用通知。同一回合的后续步骤不再追加。未绑定会话不接收 Fashion 快照。

`fashion_project_query` 只接受 `section`。Host 从当前会话绑定读取 `projectId`。

<a id="model-experience"></a>

## 模型体验

### 只读系统提示

#### 模型所见

`fashion-agent-readonly` 段落是固定权限说明。实时项目字段不会写入该段落。

##### 权限正文

```markdown
Fashion project assistance is read-only. When this session is bound to a Fashion project, a compact snapshot is appended each user turn. Use fashion_project_query to read more of the same bound project; you cannot pass a project id. Never treat the workspace folder name as the project identity. Do not create, edit, approve, reject, export, or write Fashion project data. Return suggestions as text only.
```

#### Token 影响

插件加载期间为固定的每请求成本。该段落不随项目体量增长。

#### KV Cache 影响

在段落文本与顺序不变时前缀稳定。

### 每回合项目快照

#### 模型所见

`agent/pre-step` 第 1 步追加一条插件来源的用户消息。绑定文本包含 `projectId`、正式名称、`snapshotVersion`、`dataScope` 以及各域摘要。未绑定会话不接收 Fashion 消息。失效或失败的绑定只收到不可用通知，不含其他项目正文。

#### Token 影响

仅在第 1 步随紧凑快照增长。同一回合的后续步骤不再追加 Fashion 文本。

#### KV Cache 影响

对新用户消息是追加写入。它不改写系统提示前缀。

### 受绑定约束的项目查询

#### 模型所见

`fashion_project_query` 工具只接受 `section`。Host 从会话绑定提供 `projectId`。成功时，模型看到的文本列出 `section`、`projectId` 和 `snapshotVersion`，随后是 `body=` 加该分区的紧凑 JSON；分区为 `null` 时明确标注没有数据。失败文本只包含 `section` 和 `error`，从不包含正文。该工具不能创建、修改、批准、导出或写入 Fashion 数据。

#### Token 影响

schema 固定。结果大小随绑定项目的一个紧凑分区变化。

#### KV Cache 影响

工具历史为追加写入。它不改写系统提示前缀。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- 一期只读：Agent 不能改写 Fashion 存储、启动 Cursor，或把项目数据库复制到工作区。
- 当审核决策表不对外列出时，批准方向由交付包选中的 Concept 推断。
- DSH 源码检出对通用运行时工具的可见性是独立的 Harness 问题；本包不改该策略。

<a id="dev-note"></a>
### 维护说明

<details>
<summary>维护者工作上下文 — 点击展开</summary>

不发布 companion：绑定行、实时快照与 pre-step 消息是同一份 Host 观察；没有第二份存储时，独立 reporter 无法分叉。

</details>
