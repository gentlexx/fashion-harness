# AI Application Development Perspective and Personal Technical Path

English | [中文](ai-application-development-path.zh.md)

This page is an optional extension to the project portfolio. Readers should first evaluate the [Fashion Harness overview](../../README.md), [engineering evidence](validation-and-evidence.md), and [contribution and code map](contribution-and-ownership.md). It then explains how I approach AI application development and how I plan to deepen the relevant engineering skills. Personal perspective explains a repeatable working method; it does not replace implemented functionality or verification evidence.

## 1. Career direction

My near-term focus is AI application development, Agent/Harness application engineering, and FDE or AI solution roles that combine domain understanding with delivery. Adjacent directions include AI application backend, Agent evaluation, and test development. Longer term, I aim to deepen Agent infrastructure, model inference, and systems engineering.

Fashion Harness is the current public proof of this direction. Other plans enter the portfolio or resume only after they produce code, tests, experiments, or another reviewable deliverable.

## 2. How I understand AI application development

AI application development is more than connecting a model API. A usable system must coordinate domain tasks, data and evidence, model context, tool permissions, workflow state, human decisions, engineering verification, and feedback-driven iteration.

| Component | Question I focus on |
| --- | --- |
| Domain | What task must the user complete, and which judgments remain human-owned? |
| Data / Evidence | Where did information come from, and is it observed, derived, or still unverified? |
| Model / Context | What may the model see and conclude, and when should the strategy or model change? |
| Tool / Permission | What may an Agent read or modify, and how are project boundaries enforced? |
| Workflow / State | How are intermediate results, revisions, approvals, failures, and recovery recorded? |
| Human-in-the-loop | Where do people compare, revise, approve, reject, and retain responsibility? |
| Engineering Validation | How do tests, startup checks, browser flows, and version evidence verify the implementation? |
| Feedback / Iteration | How does real use become the next rule, interaction, and acceptance criterion? |

Fashion Harness applies this structure to fashion research and design decisions: AI organizes evidence and proposes candidates, people retain professional review and approval, and project records preserve facts, versions, and evaluation inputs.

## 3. My project method

**Discover the domain task and constraints** (Problem Discovery)<br>
↓<br>
**Define scope, domain objects, and human authority** (Scope / Domain Model / Human Authority)<br>
↓<br>
**Freeze specifications and acceptance criteria** (Specification / Acceptance Criteria)<br>
↓<br>
**Coordinate AI-assisted implementation, research, and audit** (Implementation / Audit)<br>
↓<br>
**Run tests and human workflow verification** (Test / Human Verification)<br>
↓<br>
**Preserve versioned evidence, public boundaries, and improvements** (Versioned Evidence / Improvement)

In Fashion Harness, this maps to domain modeling, primary implementation by Cursor, research and independent validation with Codex, owner decisions, frozen commits, and screenshot evidence. See [Development Process and AI Collaboration](development-process.md).

## 4. Strengths demonstrated by the project

- translating an ambiguous domain problem into user flow, objects, rules, and staged scope;
- connecting product value, human responsibility, technical implementation, runtime conditions, and long-term evolution;
- assigning implementation, research, audit, and verification work across AI tools and reviewing their outputs;
- delivering with code, tests, runtime checks, screenshots, commits, and explicit limitations;
- turning long-range model, data, Agent, engineering, and infrastructure plans into a verifiable thin slice;
- learning from real project problems and producing code, tests, experiments, retrospectives, or interview explanations.

These strengths are grounded in current portfolio evidence. Future capabilities retain explicit entry conditions in the [Project Status and Roadmap](roadmap-and-boundaries.md).

## 5. Current technical practice and growth path

The project has given me practical exposure to TypeScript, React, domain modeling, controllers, state and revision rules, Vitest, build configuration, read-only Agent tools, browser verification, and Git-based evidence. I can explain the key objects, flows, human review rules, permission design, and verification results, while continuing to deepen independent modification, debugging, and testing.

My near-term path builds one independent engineering spine and expands horizontally through real project needs:

| Track | Current basis and use | Next reviewable progress |
| --- | --- | --- |
| Python primary track | AI application, API, RAG/Agent, typing, and basic testing practice | Independently deliver a backend or Agent vertical slice with APIs, state, error logging, and tests |
| Shared backend track | APIs, databases, configuration, errors, logging, tests, and deployment as common Python/Java concerns | Produce a runnable, debuggable, tested service with an explainable failure-handling path |
| Java gradual secondary track | OOP, design patterns, database, and course-practice foundation | Complete a bounded Spring Boot, JUnit, and database loop without forcing Java into Fashion Harness |
| TypeScript/React project-driven track | Reading, review, and verification in Fashion Harness | Complete a controlled change, client tests, and a debugging record around a real gap |
| Agent/Harness deepening track | Project-grounded understanding of domain objects, read-only context, permissions, and human review | Add evidence for runtime behavior, tool permissions, state recovery, failure tests, and observability |

The longer-term path connects five layers:

1. infrastructure: operating systems, networks, storage, containers, GPU, RAM, and SSD;
2. models: LLM/VLM, inference, quantization, training, model routing, and evaluation;
3. AI systems: Harness, Agent, Memory, RAG, Tool, Sandbox, and task recovery;
4. engineering: Python as a main track, multi-language engineering, APIs, databases, concurrency, testing, and deployment;
5. product and FDE: requirement decomposition, technical choices, domain fit, reliability, cost, and delivery.

This is not a one-time checklist. Priorities come from real target roles and recurring project gaps, and each learning item should produce reviewable evidence.

## 6. Personal view of the market and role selection

From my own interviews, job research, and project work, I have observed that many teams still value coding foundations, reliability, security, and controlled delivery. At the same time, AI application teams need people who can connect model capabilities to concrete workflows, design permission and human-review points, verify outputs, and improve the product with evidence.

My path therefore combines stronger independent coding, debugging, testing, and backend engineering with AI application design, Agent workflows, domain understanding, and human–AI delivery. I prioritize AI-native teams, established companies with concrete and well-governed AI transformation, and vertical-industry teams with real use cases, data boundaries, and delivery responsibility. Final targeting remains based on current job descriptions and direct team conversations.

## 7. How this page supports recruiting materials

The resume keeps only a concise position and portfolio link:

> Focused on AI application and Agent engineering, with project practice in domain problem decomposition, system planning, AI-assisted development, verification, and iterative delivery. Fashion Harness provides the reviewable implementation and versioned evidence.

The repository overview presents product and engineering results. This page explains the method and technical direction behind them. Interviews can then deepen one design decision, one validation-and-repair cycle, or one evidence-based next step. Internal long-range plans, raw interview material, and unverified ideas are not presented as public capability evidence.
