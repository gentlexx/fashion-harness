# Contribution and Ownership Map

English | [中文](contribution-and-ownership.zh.md)

This page separates product ownership, AI-assisted implementation, independent review, and the frozen upstream base. It is an evidence map, not a claim that every retained file was independently authored by the project owner.

## 1. Responsibility boundary

| Participant | Responsibility in this project | Not claimed |
| --- | --- | --- |
| Project owner (`gentlexx`) | Product problem, user workflow, long-term loop, current scope, domain rules, technical-route choices, task organization, acceptance criteria, review decisions, publication boundary, and final accountability | Independent authorship or mastery of every line and every upstream technology |
| Cursor | Most Fashion code and test implementation from explicit specifications, plus engineering repairs requested after review | Product ownership or independent acceptance authority |
| Codex | Information discovery, state audit, risk analysis, task decomposition, acceptance design, public-claim correction, and independent T-06 verification | Main implementation authorship or authority to publish without the owner |
| DeepSeek Harness upstream | Frozen monorepo base, runtime packages, Host, shared UI, build system, and upstream architecture | Fashion-specific product decisions or personal authorship by the portfolio owner |

## 2. Version evidence

The local history is intentionally staged so reviewers can inspect each boundary:

| Commit | Stage | Changed files in that stage | Meaning |
| --- | --- | ---: | --- |
| `1fa5742` | Frozen upstream baseline | Baseline import | DeepSeek Harness `dsh-v0.1.5-rc.2` base |
| `b0e5c6f` | Fashion implementation | 391 | Domain packages, controllers, Fashion Shell, bundle, integration, and tests |
| `c1a8010` | Public portfolio material | 40 | README, case study, architecture, provenance, process, and public boundaries |
| `0a24188` | Screenshot evidence | 6 | Six screenshots from the frozen application commit |
| `a827b5e` | T-06 evidence update | 24 | Verified counts, runtime result, screenshot manifest, and disclosed debt |
| `4831eff` | Recruiter-first front page | 3 | Bilingual first screen and 90-second reading path |
| `152c7f1` | Contribution and GitHub boundary | 10 | Contribution map, recruiter navigation refinement, and Linguist boundary between upstream and Fashion-owned paths |

The frozen application behavior was verified at `c1a8010b72764876b17744776d674fefc35d4ea9`. Later commits add evidence and presentation material rather than silently changing that application.

## 3. Fashion-specific code map

The frozen application contains 362 new files in Fashion-specific package paths:

| Path | Files | Role |
| --- | ---: | --- |
| `packages/fashion/` | 141 | Seven domain packages for project, research, analysis, design, feedback, evaluation, and Agent context |
| `packages/api/fashion-*` | 120 | Seven application-controller packages exposing domain operations to the Host |
| `packages/client/ui-fashion-shell/` | 91 | Project-first browser workbench and Fashion-specific navigation, forms, and views |
| `packages/bundle/fashion-app/` | 10 | Fashion profile composition and application bundle |

The Fashion packages use the private `@gentlexx/*` workspace scope. Retained `@deepseek-ai/*` packages identify upstream package families and are not presented as personal work.

## 4. Targeted upstream integration

Fashion Harness also changes narrow integration seams instead of copying the whole Host into Fashion code:

- CLI/profile registration and Fashion web assets;
- application profile selection in `app-boot`;
- conversation slots and Fashion hero replacement;
- model-settings onboarding behavior;
- Fashion favicon and manifest selection in the static frontend Host;
- TypeScript project references, package metadata, lockfile, and repository verification scripts.

These files are part of the Fashion change set, but the surrounding packages remain upstream-owned.

## 5. What the portfolio is intended to prove

- translate an ambiguous product scenario into a bounded engineering slice;
- model sources, evidence, analysis, concepts, review, delivery, feedback, and evaluation as inspectable state;
- design revision, human-authority, project-isolation, provenance, and Agent-permission rules;
- choose integration seams across a large existing system;
- coordinate AI implementation while keeping acceptance and publication decisions human-owned;
- run tests, static gates, startup checks, browser inspection, screenshot capture, and versioned evidence;
- identify limitations without converting planned capability into completed capability.

## 6. Claims deliberately not made

- that all retained source code was independently handwritten by the owner;
- that every upstream DeepSeek Harness package was modified or mastered;
- that the current version is an autonomous multi-agent production system;
- that R0 represents live market data or proves commercial value;
- that test presence alone proves real-designer usability;
- that GitHub language percentages are an authorship measure.

## 7. GitHub language-statistics policy

The repository retains more than 7,000 unchanged upstream files for reproducible build and runtime verification. Root `.gitattributes` marks broad upstream paths as `linguist-vendored`, then explicitly unsets that attribute for Fashion packages and targeted integration files. GitHub Linguist excludes vendored files from repository language statistics; the override changes presentation only, not the files, license, history, or ownership.

The policy follows the [GitHub Linguist override documentation](https://github.com/github-linguist/linguist/blob/main/docs/overrides.md). Reviewers should use this page, the commit history, and the source diff—not the language bar alone—to judge contribution.

## 8. Review shortcuts

- Product decisions: [Product case study](product-case-study.md)
- System structure: [Architecture](architecture.md)
- AI collaboration: [Development process](development-process.md)
- Reproducible evidence: [Validation and evidence](validation-and-evidence.md)
- Current limits: [Data provenance and limitations](data-provenance-and-limitations.md)
