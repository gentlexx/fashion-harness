# Development Process and Responsibility Boundary

English | [中文](development-process.zh.md)

## 1. Working method

This project follows a planning–rules–implementation–validation–retrospective loop instead of treating one AI-generated result as a deliverable.

1. **Requirements and scope**: define the user task, current engineering slice, long-term direction, and non-goals;
2. **Domain modeling**: turn sources, evidence, opportunities, concepts, review, feedback, and evaluation into testable objects;
3. **Rule design**: encode three-direction, revision binding, approval invalidation, and delivery conditions as invariants;
4. **AI-assisted implementation**: use Cursor for most code and test implementation;
5. **Independent audit**: use Codex to investigate state, review differences, plan publication changes, and check evidence;
6. **Human decisions**: the project owner decides the product goal, rules, boundary, technical route, and acceptance;
7. **Validation and records**: separate completed checks from unverified claims before deciding whether to publish.

## 2. Contribution disclosure

| Participant | Main responsibility |
| --- | --- |
| Project owner | Product framing, system planning, domain rules, scope, technical route, acceptance criteria, and final decisions |
| Cursor | Most code and test implementation, plus engineering changes against explicit tasks |
| Codex | Information discovery, independent audit, portfolio planning, change review, and public-claim correction |

This is not presented as a project in which every line was independently handwritten by the owner. It demonstrates the owner’s ability to understand requirements, design a system and its rules, organize AI-assisted implementation, inspect results, identify boundaries, and remain accountable for delivery.

## 3. Preventing AI output from becoming assumed fact

- constrain important business behavior with domain invariants and tests;
- compare AI-generated changes against the task list and code diff;
- separate the implementation role from the audit role;
- cite test counts only when they were actually run and label the stage;
- mark unrun checks as pending, then replace the label only with evidence from the corresponding frozen commit;
- do not convert the presence of a technology into a claim that the owner has mastered it;
- do not present walkthrough data, seed data, or planning documents as real customer outcomes.

## 4. Current phase

T-04 completed the focused engineering adjustments needed for publication: Fashion package naming, brand separation, configurable onboarding, build references, R0 uncertainty handling, and related checks. T-05 organizes those facts into material that a recruiter can inspect.

T-06 froze the application SHA and completed the full build, typecheck, focused Fashion suite, fresh-home startup, browser-flow inspection, and screenshot capture. The result is recorded as verified with disclosed limitations because corpus-wide documentation gates still expose retained upstream-link debt.

## 5. Reusable method

The process intentionally preserves evidence of these reusable capabilities:

- turn an ambiguous scenario into an implementable scope;
- translate business judgment into objects, states, and invariants;
- keep Agent context and permissions controlled;
- coordinate multiple AI tools across implementation, audit, and documentation roles;
- use tests, static gates, browser evidence, and version records to establish delivery confidence;
- feed technical gaps into the next learning and development cycle.
