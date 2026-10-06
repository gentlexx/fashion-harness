# Product Case Study: From Generated Output to Reviewable Design Decisions

English | [中文](product-case-study.zh.md)

## 1. Problem

A general chat interface can generate fashion ideas quickly, but it does not reliably answer delivery questions: where did the material come from, how was a conclusion formed, why are the directions different, who approved the current revision, does an old approval remain valid after a change, and can the final output be reviewed later?

Fashion Harness defines the problem as building a traceable, human-reviewed, and iterative fashion-research and design-decision workbench—not merely generating plausible text.

## 2. Current user and task

The current engineering slice is intended for a product planner or designer who needs to turn an initial Brief into design directions. The core task is to:

1. establish a project and Brief;
2. record research tasks, sources, samples, and evidence;
3. organize attributes, popularity signals, and analysis runs into design opportunities;
4. create exactly three differentiated concepts from the selected opportunity revision;
5. ask a person to review, request changes, or approve;
6. invalidate an old approval when the version changes;
7. export a deliverable with a snapshot digest;
8. retain feedback, outcome availability, and evaluation records.

## 3. Product decisions

### Decision one: objects before interface copy

The research layer uses `ResearchTask`, `Source`, `Sample`, and `Evidence`; the analysis layer uses `AnalysisRun`, `TrendCluster`, and `DesignOpportunity`; the design layer uses `ConceptSet`, `ReviewRound`, and `DesignDeliverable`. Object modeling makes provenance, revisions, and state testable instead of leaving them inside conversation text.

### Decision two: human judgment is the primary flow

Evidence requires human review, an opportunity requires explicit selection, concepts require review, and a revision creates a new review state. The system does not equate model output with fact or approval.

### Decision three: approval is bound to a revision

The `review_ready` state requires exactly three pairwise-differentiated concepts. Approval applies only to the current selection and version. A design change invalidates the old approval so that an earlier decision cannot silently authorize new content.

### Decision four: an unknown outcome is valid state

The feedback layer uses `OutcomeAvailability` to distinguish “not yet observed,” “not available,” and “available” rather than filling a gap with invented metrics. The current repository has no real sales or commercial outcomes and makes no such claim.

## 4. Current result

| Capability | Status | Evidence |
| --- | --- | --- |
| Domain objects and state rules | Implemented | Distributed across seven Fashion domain packages |
| Project–Session binding | Implemented | The Harness reads a compact project snapshot |
| Read-only project query tool | Implemented | The tool accepts only a section; the Host supplies projectId |
| Three-direction, review, and delivery rules | Implemented | Domain invariants and focused tests exist |
| Publication-focused checks | T-04 verified | 60 focused tests and related gates passed |
| Final application verification | T-06 verified with disclosed limitations | Build, typecheck, 46 focused files / 284 tests, fresh-home startup, browser flow, and screenshots passed; upstream documentation-link debt remains disclosed |
| Real designer feedback | Not claimed | No real-user conclusion exists yet |

## 5. Known product gaps

- analysis-reference existence and project ownership are not fully validated;
- there is no complete Brief revision interface for every field and revision;
- `ImprovementItem` candidates are not strongly consistent and do not automatically modify domain state;
- Evaluation depends on a Git checkout;
- corpus-wide translation-pairing and Markdown-link checks still fail on retained upstream links to excluded internal paths; the Fashion application checks and browser flow passed T-06.

These gaps are retained as explicit boundaries rather than presented as completed capability.
