# Fashion Harness

English | [中文](README.zh.md)

**A traceable fashion-research and design-decision workbench built on DeepSeek Harness.**

Fashion Harness turns a small, attributable research set into reviewable design opportunities, three differentiated concept directions, human decisions, versioned deliverables, feedback, and evaluation records. It is designed for fashion designers who need evidence and revision history around AI-assisted work—not an autonomous system that replaces professional judgment.

**Portfolio status:** the frozen local application candidate passed T-06 build, typecheck, 46 Fashion-focused test files / 284 tests, fresh-home startup, HTTP access, manual browser inspection, and screenshot capture. Known product and repository limitations remain disclosed.

[90-second review](#90-second-review-path) · [Run locally](#run) · [Validation evidence](docs/fashion/validation-and-evidence.md) · [Known limits](#known-limits)

![Fashion Harness project-first home with the public case and local project entry](docs/fashion/assets/screenshots/01-fashion-home.png)

> **Independent derivative project.** This repository is built on the open-source [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) codebase at tag `dsh-v0.1.5-rc.2` / commit `fb2c4b9e698e30edb738bca4cf0618587db7d203`. It is not an official DeepSeek project and is not endorsed by or affiliated with DeepSeek. See [NOTICE.md](NOTICE.md).

<a id="90-second-review-path"></a>

## 90-second review path

| Time | Inspect | What it demonstrates |
| --- | --- | --- |
| First 15 seconds | This page, the screenshot, and [What this version implements](#what-this-version-implements) | The product problem, current workflow, and visible result |
| By 45 seconds | [Product case](docs/fashion/product-case-study.md) and [architecture / ownership map](docs/fashion/architecture.md) | Requirement judgment, domain modeling, Harness boundaries, and upstream-versus-Fashion ownership |
| By 70 seconds | [Development process](docs/fashion/development-process.md) | How product decisions, Cursor implementation, Codex audit, and human acceptance were separated |
| By 90 seconds | [Validation evidence](docs/fashion/validation-and-evidence.md), [screenshot manifest](docs/fashion/assets/screenshots/screenshot-manifest.md), and [known limits](#known-limits) | Build/test/runtime evidence, honest capability boundaries, and what remains to be improved |

For an interview-depth review, continue with [data provenance](docs/fashion/data-provenance-and-limitations.md), [learning and iteration](docs/fashion/learning-and-iteration.md), and the [roadmap](docs/fashion/roadmap-and-boundaries.md).

<a id="what-this-version-implements"></a>

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
- Fashion-profile configuration that disables the generic upstream welcome flow; the first-run API-key dialog remains visible but can be dismissed with **Configure later**, while live model actions remain provider-dependent.

On the frozen application commit `c1a8010b72764876b17744776d674fefc35d4ea9`, T-06 completed an offline frozen-lockfile install, a full build (252 client artifacts), typecheck, 46 Fashion-focused test files / 284 tests, fresh-`DSH_HOME` startup, HTTP 200 page access, manual browser-flow inspection, and six evidence screenshots. The corpus-wide translation-pairing and Markdown-link gates still report retained upstream documentation links to excluded `.agents` / `.github` content; this is disclosed documentation debt rather than a Fashion runtime pass.

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

> T-06 verified this workflow on the frozen application commit using an offline frozen-lockfile install and a fresh `DSH_HOME`. Exact results and disclosed failures are recorded in [Validation and Evidence](docs/fashion/validation-and-evidence.md).

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

<a id="known-limits"></a>

## Known limits

- Some analysis `subjectRefs` / `memberRefs` do not yet receive complete existence-and-project-ownership validation.
- Brief creation and confirmation exist, but there is no complete product-grade Brief revision interface.
- Improvement candidates are human-triaged suggestions; they are not automatic fixes and are not strongly consistent with every later upstream state change.
- Evaluation currently depends on a Git checkout for some repository evidence.
- The R0 source set is small, dated, and non-representative; it is not live market data or sales prediction.
- No complete Fashion Dataset, production Ontology, fine-tuned fashion model, CAD/Tech Pack pipeline, or proven commercial outcome is claimed.
- Real designer usability and value remain a planned R1 study; no satisfaction or efficiency result is claimed.
- Corpus-wide translation-pairing and Markdown-link checks still fail on retained upstream documentation links to intentionally excluded internal paths; the new Fashion public materials do not contribute those failures.

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
