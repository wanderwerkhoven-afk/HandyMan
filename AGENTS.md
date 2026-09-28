# Team HandyMan — AI Agent Operating Model

## Mission

Build HandyMan into a polished responsive DIY application and desktop website for woodworking and handcrafted projects, with reliable plans, patterns, materials, tools and step-by-step build instructions.

## Team command

**Team HandyMan** activates the complete workflow.

The Orchestrator should:
1. Inspect the current repository before changing code.
2. Split the request into independent workstreams.
3. Assign each workstream to the most relevant specialist.
4. Run independent analysis/design tasks in parallel where possible.
5. Prevent multiple agents from editing the same surface without coordination.
6. Integrate work into one coherent implementation.
7. Run Code Canonicalizer + Repository Steward on the integrated change.
8. Run QA, Review + Code Hygiene Review before considering the task complete.
9. Record meaningful product or architecture decisions.

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
| Code Canonicalizer | Canonical code ownership, deduplication, dead-code cleanup |
| Repository Steward | Folder structure, naming, file placement and safe moves |
| Code Hygiene Review | Final duplicate/override/structure regression gate |
| Project Research Lead | Finds trustworthy DIY projects and coordinates source-backed research |
| Build Requirements Researcher | Verifies materials, tools, hardware, dimensions and build requirements |
| Project Media & Licensing | Finds hero imagery and records provenance/reuse status |
| Project Evidence Review | Validates evidence completeness and catalog readiness |

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
- Mobile and desktop are both first-class supported experiences; neither may be a stretched/emulated version of the other.
- Empty/loading/error states are considered.
- Accessibility basics are respected.
- Data/state behavior is deterministic.
- Existing behavior is not unintentionally broken.
- Code Canonicalizer has removed superseded iterations, duplicate ownership and stale overrides.
- Repository Steward has checked file/folder placement and naming.
- QA/Review has checked the final integrated result.
- Code Hygiene Review has passed the final implementation.
- README/docs are updated when architecture or usage changes.

## Product principles

1. **Craft first** — Handmade projects should feel tangible, warm and premium.
2. **Clarity over decoration** — Measurements and instructions must remain easy to read.
3. **Show the build** — Finished result, tools, materials, cut list, drawings and steps belong together.
4. **Progressive detail** — A beginner can start quickly; an experienced maker can inspect exact dimensions.
5. **Cross-device usability** — Mobile controls must work one-handed in workshop conditions, while desktop must use the available space for efficient browsing and building.
6. **No fake precision** — Never invent measurements or safety-critical woodworking instructions and present them as verified.


## Permanent canonical-code policy

Every **Team HandyMan** command includes a maintenance pass. Iterative development must modify the canonical implementation rather than stack patches on top of earlier patches.

When multiple historical implementations solve the same behavior, preserve the latest intentional product behavior, fold it into the canonical owner, then remove superseded code. Do not keep duplicate CSS blocks, duplicate event handlers, duplicate state, or old/new file copies as a safety blanket.

The Repository Steward may improve structure incrementally when the benefit is clear. Structural changes must update references atomically and must not break a working feature merely to satisfy an aesthetic folder preference.


## Team HandyMan — Project Research workflow

When asked to find or add new projects, run the research agents before project content is added to the product.

Workflow:
1. **Project Research Lead** discovers candidate projects using trustworthy sources and selects the primary source.
2. **Build Requirements Researcher** independently extracts and verifies everything required to execute the build.
3. **Project Media & Licensing** traces the hero image, direct image URL, creator and reuse/license status.
4. **Project Evidence Review** checks evidence and returns RESEARCH READY, CATALOG READY or HOLD.
5. Only CATALOG READY data may be presented internally as verified build data. Unknowns remain explicit; they are never filled by invention.

Research output must retain clickable source URLs and per-project hero-image URLs/provenance so the product team can audit where content came from.

## Responsive product policy

HandyMan is one responsive product across phone, tablet and desktop. Mobile remains a critical workshop context, but desktop is not a phone mockup centered in a large browser window. Every new screen must define its information hierarchy and layout for narrow and wide viewports. Shared data, components, navigation semantics and interaction state stay canonical across breakpoints; presentation may adapt substantially when wider space improves usability. QA must check at minimum a narrow phone, tablet/intermediate width and a desktop viewport.

## No horizontal ribbon policy

Phone and tablet layouts must not rely on horizontally scrolling ribbons for primary categories, tabs, filters or build navigation. When all choices do not fit, use visible selection buttons in a wrapping/grid arrangement or an explicit selector control. Horizontal scrolling remains reserved for content where lateral browsing is intrinsically meaningful, never as a way to hide primary navigation choices.

## Locale, units and currency policy

Until explicitly changed by the product owner, HandyMan is a Dutch-language product. New user-facing copy must be Dutch.

All user-facing measurements use the metric system. Lengths are expressed in millimetres, centimetres or metres as appropriate; imperial measurements may remain only as source provenance or stock nomenclature when technically necessary, never as the primary displayed measurement.

All user-facing project cost indications use euros (€). Source prices in other currencies must not be presented as euro values without an explicit conversion or a separately researched euro estimate. Unknown costs remain unknown rather than being invented.

