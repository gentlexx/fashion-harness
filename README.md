# Fashion Harness

English | [中文](README.zh.md)

**A traceable fashion-research and design-decision workbench built on DeepSeek Harness.**

Fashion Harness turns a small, attributable research set into reviewable design opportunities, three differentiated concept directions, human decisions, versioned deliverables, feedback, and evaluation records. It is designed for fashion designers who need evidence and revision history around AI-assisted work—not an autonomous system that replaces professional judgment.

> **Independent derivative project.** This repository is built on the open-source [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) codebase at tag `dsh-v0.1.5-rc.2` / commit `fb2c4b9e698e30edb738bca4cf0618587db7d203`. It is not an official DeepSeek project and is not endorsed by or affiliated with DeepSeek. See [NOTICE.md](NOTICE.md).

## What this version implements

The local publication candidate contains a deterministic, human-governed workflow:

```text
Project
→ ResearchTask → Source → Sample → Evidence
→ MarketItem / PopularitySignal / TrendCluster → DesignOpportunity
→ DesignOpportunityBrief → ConceptSet → three DesignConcepts
→ ReviewRound / ReviewDecision
→ versioned DesignDeliverable
→ DesignerFeedback / OutcomeAvailability
→ EvaluationRun / RuleResult / ImprovementItem
```

It also includes:

- a Fashion-only profile and project-first browser shell;
- project-scoped storage, revision checks, read-only R0 records, and cross-project guards;
- evidence states that separate `observed`, `derived`, and `needs_validation` claims;
- human-only opportunity selection, review, approval, and feedback decisions;
- frozen deliverable snapshots with content hashes and audience filtering;
- a read-only Fashion Agent context that binds a Session to one Project and exposes no Fashion write tool;
- deterministic evaluation rules and an improvement queue that still requires human triage;
- Fashion-profile configuration that disables the upstream welcome/onboarding prompts; the final no-key browser path remains pending T-06, and live model actions remain provider-dependent.

The candidate has passed T-04 focused checks (7 test files / 60 tests plus package, path, Cordis config, and client-i18n gates). A clean full build, full Fashion suite, fresh-home startup, and browser evidence are intentionally marked **pending** until the final application SHA is frozen.

## Why this is a Harness, not a chat demo

The core product value is not one prompt or one generated image. The Harness coordinates durable domain state, replaceable providers, tool permissions, human gates, provenance, revisions, and evaluation. Conversation is one workspace surface; it is not the source of truth.

The first release deliberately uses one observable, read-only Agent context instead of claiming a complete autonomous multi-agent system. Future Research, Design, and Evaluation agents will be split only when context isolation, ownership, or evaluation evidence justifies the added complexity.

## Public walkthrough

The repository includes a stable fictional walkthrough under [`examples/fashion-fictional-walkthrough/`](examples/fashion-fictional-walkthrough/README.md). It mirrors the current domain vocabulary but is not an import fixture, real client case, market forecast, or proof of commercial effect.

The built-in R0 case is different: it is a read-only public-source reconstruction with dated links and explicit review states. Volatile or unverified price, discount, stock, and count claims are not presented as current confirmed facts.

<a id="run"></a>

## Run from source

Requirements: Node.js and pnpm versions compatible with the upstream repository.

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm dsh --profile fashion
```

The web server uses `http://127.0.0.1:3080` by default. Use an isolated `DSH_HOME` when evaluating the repository so local settings, credentials, sessions, and storage remain separate.

The deterministic Fashion workbench is intended to be browsable without an API key. Live Agent/model actions require a provider configured through the Models settings page or the launching environment. Never commit credentials; [`.env.example`](.env.example) contains names only.

> These commands are the intended public workflow. Final clean-build and fresh-home browser results will be recorded in [Validation and Evidence](docs/fashion/validation-and-evidence.md) after T-06; this README does not claim they have already passed on the final SHA.

## Design decisions worth inspecting

- **Evidence before conclusions:** source, sample, claim type, review state, and limitations stay inspectable.
- **Human authority as domain state:** selection, approval, rejection, and feedback are explicit records rather than conversational phrases.
- **Revision correctness:** writes use expected revisions; stale decisions and artifacts are rejected or marked stale.
- **Read-only Agent boundary:** the model receives a compact project snapshot and can query the bound project, but cannot pass an arbitrary project ID or mutate Fashion storage.
- **Truthful outcome handling:** `unavailable` and `not_authorized` are not converted to zero; outcome records carry source and verification state.
- **Evaluation without automatic self-repair:** failed rules can propose an `ImprovementItem`, but only a person may accept, plan, resolve, or reject it.

## My role and AI-assisted implementation

I own the product problem, workflow and domain decisions, scope, technical-route choices, acceptance criteria, task organization, review judgments, and publication decisions. I use the repository to practice explaining, modifying, debugging, and validating an integrated AI application.

Cursor performed most code implementation and test-writing from frozen specifications. Codex supported information discovery, risk analysis, task decomposition, acceptance design, and independent review. AI output was not treated as acceptance: failing checks led to explicit repairs, and the public claims are limited to what can be inspected or reproduced.

The presence of TypeScript, React, Cordis, storage, testing, or other technologies in this monorepo is not a claim that I independently authored or fully mastered every part. The large upstream codebase is retained for reproducibility; the Fashion packages, profile integration, and public portfolio documents are separated from upstream ownership in [Architecture](docs/fashion/architecture.md).

## Known limits

- Some analysis `subjectRefs` / `memberRefs` do not yet receive complete existence-and-project-ownership validation.
- Brief creation and confirmation exist, but there is no complete product-grade Brief revision interface.
- Improvement candidates are human-triaged suggestions; they are not automatic fixes and are not strongly consistent with every later upstream state change.
- Evaluation currently depends on a Git checkout for some repository evidence.
- The R0 source set is small, dated, and non-representative; it is not live market data or sales prediction.
- No complete Fashion Dataset, production Ontology, fine-tuned fashion model, CAD/Tech Pack pipeline, or proven commercial outcome is claimed.
- Real designer usability and value remain a planned R1 study; no satisfaction or efficiency result is claimed.
- Final full build, clean startup, browser flow, and screenshots remain pending T-06.

## Documentation

- [Fashion documentation index](docs/fashion/README.md)
- [Product case study](docs/fashion/product-case-study.md)
- [Architecture and ownership map](docs/fashion/architecture.md)
- [Development process and AI collaboration](docs/fashion/development-process.md)
- [Validation and evidence](docs/fashion/validation-and-evidence.md)
- [Data provenance and limitations](docs/fashion/data-provenance-and-limitations.md)
- [Learning and iteration](docs/fashion/learning-and-iteration.md)
- [Roadmap and boundaries](docs/fashion/roadmap-and-boundaries.md)

## License and attribution

The repository retains the upstream MIT license and applicable copyright notice. Fashion additions are also offered under MIT. External pages, brand names, reports, and linked content remain the property of their respective owners and are not relicensed by this repository. See [LICENSE](LICENSE), [NOTICE.md](NOTICE.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and the retained [DeepSeek Harness brand guidelines](BRAND_GUIDELINES.md).
