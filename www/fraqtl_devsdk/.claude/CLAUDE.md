# EGPT FRAQTL DevSDK — Development Guide for Claude Code

## What Is This?

This is the **Educational Development SDK** for the EGPT FRAQTL VM — a discrete fractal physics engine based on Ulam-von Neumann cellular automata. No force calculations. Physics emerges from simple local rules.

When you open this project in Claude Code, this file and the agent team configuration in `memory/agent-team.md` automatically govern how changes are made. The multi-agent oversight protocol ensures that physics invariants are never violated.

## Core Axioms (Non-Negotiable)

These three primitives define the entire system. Every line of code must respect them:

| Primitive | Definition | Unit |
|-----------|-----------|------|
| **Time** | 1 tick in the simulation | The discrete, indivisible unit of time |
| **Space** | 1 pixel | The discrete, indivisible unit of space |
| **Mass** | Pixel occupancy (count of leaf quanta within a frame) | Discrete, countable |

Universe-level scale factors allow developers to map these to physical units (1 pixel = 1 Planck length, or 1 pixel = 1 meter, etc.) but the engine internally operates strictly in ticks, pixels, and occupancy counts.

## The Frame Axiom

**Everything is a Frame.** There is no separate "particle" class. A "quantum" or "fundamental particle" is simply a leaf Frame (`is_leaf = true`). This is Ulam's partition theory made code: by the law of conditional additivity, every physics body is both an individual actor AND an inertial reference frame to its children. The system is strictly recursive and scale-invariant.

## Engine Invariants (Must Never Be Violated)

### 1. Universal Speed Limit
- A frame can only move **1 pixel per tick** relative to its immediate parent
- `Frame.move()` caps displacement (`dx`, `dy`) to ±1
- Excess intended movement accumulates as momentum (`vx`, `vy`) for future ticks
- This is enforced recursively at every scale — it IS the emergence of relativity

### 2. Single Occupancy
- No two leaf quanta may occupy the same pixel at the same tick
- Enforced via spatial index insertion (QuadTree)
- Collision = failed insertion → triggers merge + bounce + promote pipeline
- Note: devsdk allows overlap and fractional positions for visualization purposes

### 3. Recursive Relativity
- Parent movement cascades as momentum to children (`move_children()`)
- Children spend this momentum on their next `move()` tick
- Every frame is an inertial reference frame for its children
- This is NOT optional — it is how gravity, inertia, and Lorentz invariance emerge

### 4. No Force Calculations
- There are NO force equations, NO F=ma, NO gravitational constants
- Every frame makes **local greedy choices** relative to itself and its children
- Attraction = probabilistic 1px nudge toward parent center (compress)
- Repulsion = collision bounce
- Complex physics **emerges** from these simple local rules

### 5. Conservation Laws Are Emergent
- Mass conservation: quanta are never created/destroyed by engine rules (only by experiment emitters/boundaries)
- Momentum conservation: emerges from collision resolution and the momentum accumulation mechanism
- Energy is not a separate variable — it is mass × velocity², which is conserved by the movement rules

### 6. Wavelength = Capacity / Mass
- Every Frame is an oscillator
- `wavelength = floor((capacity / mass) * WAVELENGTH_CONSTANT)`, minimum 4
- This drives the probabilistic coin-flip (p_heads/p_tails) that creates wave behavior
- Higher mass → shorter wavelength → higher frequency (E=mc² analog)

## doTick() Phase Pipeline

All implementations must follow this phase order:

```
Phase A: INJECTION     — Experiment tick functions emit new leaf frames
Phase B: STRUCTURE     — Build/populate higher dimensions from fundamental quadtree (iframe ticks only)
Phase C: PHYSICS       — Per-dimension: reinit → move → compress → collide → merge → promote → cleanup
Phase D: COLLECT       — Gather FrameData/DimensionData into TickData for rendering
```

Physics (Phase C) is separated from rendering. `doTick()` returns pure data; `doRender(tickData)` handles drawing.

## Project Structure

```
js/
  engine/           — Physics engine (EGPTfraqtl.js, quadtree.js, engine.node.js, tests)
  game/             — Game layer (EntropyGame.js, EntropyGameObjects.js, GameControls.js, charting.js)
  simulation/       — Experiment factories (setupParticleWalk.js, setupWaveInterference.js, etc.)
  consumers/        — Rendering consumers (P5Renderer.js, IConsumer.js)
  examples/         — Tutorial experiments and UI cards
  user/             — User experiment template (HelloEGPT.js)
bin/                — CLI runner (npx egpt-fraqtl-devsdk)
docs/               — API references, programming guide, design docs
images/             — Tutorial and experiment visualizations
css/                — Stylesheets
.claude/            — Agent team configuration for Claude Code
index.html          — Browser entry point (P5.js visualization)
run_simulation.js   — Node.js simulation runner
```

### Implementation Notes
- **devsdk** uses relaxed occupancy via QuadTree, floating-point for visualization scaling, simplified promotion
- Displacement is 1 virtual unit per tick; diagonal 1px = sqrt(2) units (Chebyshev metric)
- `withInterQuantumCollisions` flag gates inter-particle collision processing

### Frame Generation Modes (Mutually Exclusive)
- **Top-down** (`emergentPhysics=true`): Phase B density clustering, brownianMotion=true (forced), withInterQuantumCollisions=false (forced)
- **Ground-up** (`emergentPhysics=false`): Phase C collision-based promotion, wave-walk, withInterQuantumCollisions=true

## Anti-Patterns (Things That Must Never Appear in Code)

- `force = G * m1 * m2 / r²` or any continuous force calculation
- Displacement > 1px per tick without going through the momentum accumulation path
- Direct position assignment that bypasses `move()` and `boundary_check()`
- Creating "particle" objects that aren't Frames
- Treating dimensions as anything other than scale layers (they are NOT spatial dimensions)
- Destroying quanta inside engine rules (only experiment boundaries/emitters may create/destroy)

## Agent Team (MANDATORY)

**ALL work on this project MUST use the orchestrator agent team pattern.** The orchestrator (main Claude session) dispatches specialized subagents for every task. No physics code is written, reviewed, or merged without the appropriate agents. See `.claude/memory/agent-team.md` for full prompt templates and decision tree.

### Team Roles (Always Active)

| Role | Model | Mode | When Required |
|------|-------|------|---------------|
| **Theoretical Advisor** | Opus 4.6 | Read-only | ALL physics-touching changes — validates invariants, catches anti-patterns |
| **System Architect** | Opus 4.6 | Read-only | Cross-component changes, API surface changes, spatial index work |
| **Documentation Agent** | Sonnet 4.6 | Read+Write | After every implementation — keeps docs in sync |
| **Impl Agent (Engine/SDK)** | Sonnet 4.6 | Full | Engine, game, simulation code |

### Orchestration Rules
1. **Never skip the Theorist** for physics-touching changes. The Theorist has veto power.
2. **Never skip the Architect** for cross-component or API changes. The Architect has veto power.
3. **Always run agents in parallel** when their work is independent (e.g., Theorist + Architect reviews).
4. **Implementation agents use worktree isolation** for non-trivial changes.
5. **Documentation agent runs last**, after implementation is finalized and tests pass.
6. **All changes must pass** `npm test` before merge.

### Orchestrator Decision Flow
```
Request arrives → Classify:
  Physics-touching? → Theorist review → Impl agent → Architect review → Tests → Docs
  Cross-component?  → Architect review → Impl agent(s) → Tests → Docs
  Single-component? → Impl agent → Tests → Docs (if API changed)
  Docs-only?        → Docs agent directly
```

### Commit Style
- Short imperative subject line
- Body explains the "why" in terms of the physics model when relevant
- Reference the EGPT law or invariant being implemented/fixed when applicable

## License

Copyright 2023-2025 Essam Abadir. Licensed under the DeSciX Community License. See `docs/DeSciX_Community_License_v1.pdf`.
