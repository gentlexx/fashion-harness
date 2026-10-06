# Fashion shell client package

English | [中文](README.zh.md)

Fashion Harness product shell: projects-first sidebar, `fashion.projects` main panel, History router, Research routes (URL Source + text Evidence + human review), R0 read-only fixture overview, and Fashion Agent lead/context strip.

**Persistence** lives in `@gentlexx/dsh-fashion-project` / `@gentlexx/dsh-fashion-research` / `@gentlexx/dsh-fashion-analysis` plus their controllers. This package owns Client presentation and History only.

**Agent context** shows Host `ctx.fashionAgent` binding status plus route/list identity. It never reads Session ids as project ids and never writes Session metadata. Durable Project–Session binding and model injection are owned by `@gentlexx/dsh-fashion-agent`.

**Slots occupied (Fashion profile only):** `sidebar`, keyed `main` (`fashion.projects`), `conversation.session.header.utilities` (sidebar restore), product-agnostic `conversation.hero.lead`, and `conversation.input.dock` id `fashion-agent-context`. The generic `web` profile does not load this package.

## Invariant ownership

No runtime invariant companion is published because the shell owns browser composition only; slot, routing, and presentation behavior is enforced by its focused client tests.
