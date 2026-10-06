# Learning and Iteration

English | [中文](learning-and-iteration.zh.md)

## 1. Learning while building

Fashion Harness does not use code volume to claim mastery of every technology. It maps real project problems into learning tasks and feeds the result into the next design and implementation cycle.

Each iteration asks four questions:

1. what is the most important uncertainty in the current user task;
2. which domain rule or engineering evidence can reduce it;
3. what must the owner learn to explain, modify, and validate;
4. which work remains AI-assisted and which conclusion remains unverified.

## 2. Capability evidence and learning map

| Project problem | Current evidence | Next learning direction |
| --- | --- | --- |
| Chat output is difficult to trace | Source, Sample, Evidence, and analysis chain | Data governance, reference integrity, and source rights |
| Model output can exceed authority | Session binding, read-only query, controlled snapshot | Agent permissions, tool contracts, and context engineering |
| Design directions can converge | Three-direction and pairwise-difference invariant | Evaluation rubrics, design semantics, and human–AI collaboration |
| Approval can become stale after edits | Revision binding and approval invalidation | Event modeling, state machines, and audit logs |
| AI implementation is not trustworthy by default | Focused tests, independent audit, staged gates | Test design, debugging, and end-to-end verification |
| Planning can outgrow implementation | Implemented / Pending / Planned labels | Scope management, delivery rhythm, and technical-debt governance |

## 3. Honest technical boundary

The presence of TypeScript, React, domain modeling, testing, Agent tools, and build configuration does not mean the owner independently masters every implementation detail. Public statements distinguish:

- **personally designed and decided**: product goals, domain divisions, key rules, scope, technical route, and acceptance criteria;
- **able to explain, modify, and validate**: parts understood through review, testing, and iteration;
- **AI-assisted implementation**: most code and tests implemented by Cursor, with Codex supporting audit and documentation review;
- **not yet mastered or implemented**: explicitly labeled as Planned or a learning objective.

Python and Java learning can continue in parallel, but a technology’s presence in the repository is not automatically listed as personal mastery.

## 4. Feeding feedback into the next cycle

The system has structures for feedback, outcome availability, development events, and improvement candidates. The intended next loop is:

`Designer observation → structured feedback → issue classification → rule or interaction change → test and evaluation → new version evidence`

Before a real designer study exists, the fictional walkthrough may validate explanation and object continuity only; it is not user validation.

## 5. Relevance to recruitment

The repository aims to show more than a working page: it preserves evidence of requirement understanding, system design, technical composition, AI-tool collaboration, validation, honest boundaries, and sustainable learning. Interview statements should trace back to code, documentation, or validation evidence and support follow-up questions about design rationale, verification, and remaining gaps.
