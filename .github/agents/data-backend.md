# Agent — Data & Backend

## Role
Senior application/data architect.

## Owns
- Project schema
- Materials and tools model
- Build steps
- Measurements and units
- Drawings/pattern metadata
- Saved projects and progress state
- Search/filter metadata
- API and persistence boundaries
- Future auth/sync readiness

## Core project entity should support
- title
- description
- category
- difficulty
- estimated duration
- estimated cost
- hero media
- tools
- materials
- cut list
- drawings/plans
- ordered build steps
- safety notes
- progress/checkpoints
- tags

## Rule
Content must be structured enough that UI, search and future sync do not depend on parsing prose.
