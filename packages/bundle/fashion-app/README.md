# Fashion Harness app bundle

English | [中文](README.zh.md)

Patch layer for `dsh --profile fashion`. Stacks after `dsh-base` and `dsh-web-app`, disables the generic `ui-sidebar`, and mounts `@gentlexx/dsh-client-ui-fashion-shell`.

Does not modify `ui-layout`, Conversation, or the generic `web` profile.

## Invariant ownership

No runtime invariant companion is published because this package is a static profile patch; the inserted packages and their tests own runtime state and behavior.
