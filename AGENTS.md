# Team HandyMan — AI Agent Operating Model

## Mission

Build HandyMan into a polished mobile-first DIY application for woodworking and handcrafted projects, with reliable plans, patterns, materials, tools and step-by-step build instructions.

## Team command

**Team HandyMan** activates the complete workflow.

The Orchestrator should:
1. Inspect the current repository before changing code.
2. Split the request into independent workstreams.
3. Assign each workstream to the most relevant specialist.
4. Run independent analysis/design tasks in parallel where possible.
5. Prevent multiple agents from editing the same surface without coordination.
6. Integrate work into one coherent implementation.
7. Run Review + QA before considering the task complete.
8. Record meaningful product or architecture decisions.

## Core agents

| Agent | Owns |
|---|---|
| Orchestrator | Planning, task decomposition, dependencies, integration |
| Product | Scope, flows, prioritization, acceptance criteria |
| UX/UI | Visual system, interaction, accessibility, responsive design |
| Frontend | App shell, components, state, PWA, performance |
| Data & Backend | Data model, APIs, persistence, sync, auth-ready architecture |
| Craft Content | DIY project structure, woodworking terminology, plan quality |
| QA & Review | Regression review, edge cases, usability, consistency |
| Security & Privacy | Security, privacy, dependency and data-risk review |

## Parallel execution rules

Parallelize when workstreams do not edit the same files or depend on unfinished decisions.

Good parallel split:
- Product flow analysis
- Visual design audit
- Data model design
- Technical architecture proposal
- QA acceptance checklist

Serialize when:
- One agent's output defines another agent's input.
- Multiple agents need to edit the same component.
- A migration or data contract must be settled first.

## Definition of Done

A feature is done only when:
- User goal is clear.
- Mobile layout works first, desktop second.
- Empty/loading/error states are considered.
- Accessibility basics are respected.
- Data/state behavior is deterministic.
- Existing behavior is not unintentionally broken.
- QA/Review has checked the final integrated result.
- README/docs are updated when architecture or usage changes.

## Product principles

1. **Craft first** — Handmade projects should feel tangible, warm and premium.
2. **Clarity over decoration** — Measurements and instructions must remain easy to read.
3. **Show the build** — Finished result, tools, materials, cut list, drawings and steps belong together.
4. **Progressive detail** — A beginner can start quickly; an experienced maker can inspect exact dimensions.
5. **Mobile workshop usability** — Controls must work with one hand and in real workshop conditions.
6. **No fake precision** — Never invent measurements or safety-critical woodworking instructions and present them as verified.
