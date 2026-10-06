# Fashion Harness 应用 bundle

[English](README.md) | 中文

本包是 `dsh --profile fashion` 的 patch 层。它叠加在 `dsh-base` 和 `dsh-web-app` 之后，关闭通用 `ui-sidebar`，并装载 `@gentlexx/dsh-client-ui-fashion-shell`。

本包不修改 `ui-layout`、Conversation 或通用 `web` profile。

## 不变量归属

本包不发布运行时不变量 companion，因为它是静态 profile patch；被插入的 packages 及其测试负责运行时状态和行为。
