# Fashion shell 客户端包

[English](README.md) | 中文

Fashion Harness 产品壳层：项目优先侧栏、`fashion.projects` 主面板、History 路由、Research 路由（URL Source + 文本 Evidence + 人工审阅）、R0 只读样例概览，以及 Fashion Agent 引导条／上下文条。

**持久化** 由 `@gentlexx/dsh-fashion-project` / `@gentlexx/dsh-fashion-research` / `@gentlexx/dsh-fashion-analysis` 及其控制器负责。本包只拥有 Client 呈现与 History。

**Agent 上下文** 展示 Host `ctx.fashionAgent` 绑定状态以及路由／列表身份。永不把 Session id 当作 project id，也永不写入 Session 元数据。持久 Project–Session 绑定与模型注入由 `@gentlexx/dsh-fashion-agent` 拥有。

**占用的槽位（仅 Fashion profile）：** `sidebar`、keyed `main`（`fashion.projects`）、`conversation.session.header.utilities`（侧栏恢复）、与产品无关的 `conversation.hero.lead`，以及 `conversation.input.dock` id `fashion-agent-context`。通用 `web` profile 不加载本包。

## 不变量归属

本包不发布运行时不变量 companion，因为 shell 只负责浏览器组合；slot、路由和呈现行为由其定向客户端测试约束。
