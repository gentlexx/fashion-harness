# Fashion Harness Documentation

English | [中文](README.zh.md)

This directory contains the public product, system, and engineering evidence for Fashion Harness. Read each statement with one of four statuses:

- **Implemented**: present in the candidate code;
- **T-04 verified**: covered by a focused T-04 test or static check;
- **T-06 verified with disclosed limitations**: final build, focused Fashion tests, startup, browser flow, and screenshots passed on the application commit, while named documentation debt remains public;
- **Planned**: designed for a later phase but not implemented.

## Suggested reading path

1. [Product case study](product-case-study.md): problem, users, scope, and product decisions;
2. [Architecture](architecture.md): domain packages, controllers, Harness, and evidence chain;
3. [Development process](development-process.md): the workflow from planning to implementation, audit, and delivery;
4. [Validation and evidence](validation-and-evidence.md): what has been verified and what remains open;
5. [Data provenance and limitations](data-provenance-and-limitations.md): traceability, compliance, and known boundaries;
6. [Learning and iteration](learning-and-iteration.md): how project problems map back to a learning path;
7. [Roadmap and boundaries](roadmap-and-boundaries.md): how the current slice relates to the long-term loop;
8. [Fictional walkthrough](../../examples/fashion-fictional-walkthrough/README.md): an end-to-end explanation without real client data;
9. [Screenshot evidence manifest](assets/screenshots/screenshot-manifest.md): six screenshots captured from the frozen application commit, with hashes and scenario boundaries.

## Current public conclusion

Fashion Harness implements an engineering slice of a fashion-research and design-decision loop: a Brief and traceable research objects lead to design opportunities, three concept directions, human review, delivery, and evaluation records. T-06 verified the frozen application commit through build, typecheck, 46 Fashion-focused test files / 284 tests, fresh-home startup, HTTP 200 access, manual browser inspection, and six screenshots. Retained upstream documentation links still cause the corpus-wide translation-pairing and Markdown-link gates to fail, and that debt is disclosed rather than hidden.

This repository does not claim large-scale automated collection, live market prediction, a complete Fashion Dataset/Ontology, vertical-model training, CAD/Tech Pack production, or proven commercial outcomes.
