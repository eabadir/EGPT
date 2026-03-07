# EGPT Mono-Repo

Electronic Graph Paper Theory (EGPT) — a constructive proof that P = NP and a working integer-only math library (EGPTMath) that turns FLOPs into IOPs, answering the question: how do you scale AI without cooking the planet? Built from first principles using physically motivated, fully computable number theory derived from random walks.

Central principle: **"The address is the map."** In an information space where every element is maximally compressed, defining a problem is defining its solution.

## Directory Map

| Directory | Purpose | CLAUDE.md |
|-----------|---------|-----------|
| `Lean/` | Formal Lean 4 proofs (P=NP, Rota Entropy Theorem, number theory) | [`Lean/CLAUDE.md`](Lean/CLAUDE.md) |
| `EGPTMath/` | Integer-only math library — the practical answer to scalable AI. Replaces FLOPs with IOPs: exact arithmetic, no error accumulation, 157 tests. | [`EGPTMath/CLAUDE.md`](EGPTMath/CLAUDE.md) |
| `EGPTMath/FAT/` | Faster Abadir Transform (pedagogical) — integer-only FFT/QFT. Demonstrates classical QFT at O((log k)^3). Optimized FAT is proprietary. | [`EGPTMath/FAT/FAT_README.md`](EGPTMath/FAT/FAT_README.md) |
| `content/` | Papers, books, reference docs, pyFRAQTL SDK | [`content/CLAUDE.md`](content/CLAUDE.md) |
| `www/` | Interactive browser demos and visualizers | [`www/CLAUDE.md`](www/CLAUDE.md) |
| `scripts/` | Build utilities (LaTeX-to-Markdown, file packager for AI indexing) | — |

## Key Conventions

- **No floating point.** Everything is integer operations (IOPs, not FLOPs). This is the core thesis.
- **"Address is the map"** is the central principle across all code and proofs.
- **Lean proof chain must stay sorry-free and axiom-free.** The 6-file P=NP proof chain (see `Lean/CLAUDE.md`) has no `sorry` and no custom axioms. Do not introduce them.
- **EGPTMath is the practical deliverable.** It is the integer-only math library that demonstrates scalable AI is possible — FLOPs become IOPs, exact arithmetic with no error accumulation. It is intentionally unoptimized for clarity, but the architecture (PPF encoding, integer FFT, lossless round-trips) is the real-world answer to the AI energy question.
- **FAT is proprietary.** The Faster Abadir Transform's optimized implementation is NOT in this repo. Only educational/pedagogical variants exist in `EGPTMath/FAT/`. The pedagogical FAT already demonstrates classical QFT — the optimized version is what benchmarks ~1.277 billion x faster than 2,048 GPUs.
- **Physics is motivation, not proof.** `Lean/EGPT/Physics/` (including `RealityIsComputation.lean`) provides physical grounding but is NOT imported by the formal proof chain.

## Build & Test

```bash
# Lean proofs — typechecks entire proof chain (requires Lean 4 + mathlib4)
cd Lean && lake build

# EGPTMath — run the full test suite (157 tests)
cd EGPTMath && npm install && node test/EGPTTestSuite.js

# Web demos — no build step, open HTML files directly
open www/EGPTNumberUniformity.html

# Before pushing to main — regenerate sitemap
node scripts/generate_sitemap.js
```

## Key Files

### Working Implementations (the practical answer)
- `EGPTMath/EGPTMath.js` — Integer-only vector algebra engine (~6800 lines, 157 tests)
- `EGPTMath/EGPTNumber.js` — PPF number representation: lossless Shannon coding, ParticlePath ↔ ℕ in JS
- `EGPTMath/FAT/EGPTFAT.js` — Pedagogical FAT: integer-only FFT/QFT (Cooley-Tukey, no floats)
- `EGPTMath/EGPTMath_Developer_Guide.md` — How unlimited precision works in information space

### Formal Proofs
- `Lean/EGPT/Complexity/PPNP.lean` — The `P_eq_NP` theorem
- `Lean/EGPT/NumberTheory/Core.lean` — ParticlePath ↔ ℕ bijection, Beth hierarchy
- `Lean/EGPT/NumberTheory/ContinuumHypothesis.lean` — CH & GCH decidable in EGPT (Hilbert #1)
- `Lean/EGPT/PeqNP_Proof_README.md` — Detailed P=NP proof walkthrough

### Documentation & Navigation
- `IDEAS.md` — Five foundational ideas (ID1-ID5), artifact maps, and "You might be looking for..." table
- `EGPT_STORY.md` — Full narrative exposition (the original README, 46KB)
- `docs/PROOF_GRAPH.md` — Theorem dependency DAG with Mermaid diagrams (AI-optimized)
- `docs/proof_graph.json` — Machine-readable proof dependency graph (JSON)
- `content/pyFRAQTL/FRAQTL_WhitePaper.md` — FRAQTL factorization algorithm

## Agent Team

Seven specialized agents in `.claude/agents/` keep the repo layers synchronized:

| Agent | Model | Role |
|-------|-------|------|
| `@egpt-orchestrator` | opus | Assesses cross-layer sync needs, delegates to specialists. Never edits directly. |
| `@lean-prover` | opus | Writes and verifies Lean 4 proofs. Guards proof chain invariants. |
| `@js-engineer` | sonnet | Translates Lean concepts into pedagogical JS in EGPTMath. |
| `@doc-writer` | sonnet | Maintains CLAUDE.md, README, proof walkthroughs, and narratives. |
| `@demo-builder` | sonnet | Creates interactive browser demos in www/. |
| `@content-author` | sonnet | Drafts papers, whitepapers, and story-form narratives in content/. |
| `@sync-validator` | haiku | Validates cross-layer consistency (theorem counts, test counts, file paths). |

**IMPORTANT — Orchestrator Usage**:
- **Proactively invoke `@egpt-orchestrator`** when work is conceptually significant enough to merit reflection across multiple layers — e.g., a new Lean proof (like decidability of the Continuum Hypothesis) should cascade into papers, documentation, JS demonstrations, and potentially web demos. If a result would be noteworthy in an academic or educational context, the orchestrator should assess which layers need to reflect it.
- **Always consult `@egpt-orchestrator` during planning.** Before designing an implementation approach for any non-trivial task, invoke the orchestrator to assess cross-layer impact and identify which specialists should be involved.
- **After completing work** that modifies files across layers (Lean proofs, EGPTMath code, documentation, web demos, or content), invoke `@egpt-orchestrator` to assess what downstream updates are needed.
- For quick consistency checks, invoke `@sync-validator` directly.

## AI Navigation

Tool-agnostic AI navigation files complement this Claude-specific guide:
- [`AGENTS.md`](AGENTS.md) — For Cursor, GitHub Copilot, and generic AI agents
- [`llms.txt`](llms.txt) — Lightweight entry point (llms.txt standard)
- [`Lean/PROOF_DEPENDENCIES.md`](Lean/PROOF_DEPENDENCIES.md) — Full proof dependency graph with theorem inventory
- [`docs/PROOF_GRAPH.md`](docs/PROOF_GRAPH.md) — Mermaid diagrams of theorem dependency DAG
- [`docs/proof_graph.json`](docs/proof_graph.json) — Machine-readable dependency graph (JSON)

## License

[DeSciX Community License Membership Agreement (DCMA)](DeSciX_Community_License_v1.pdf) v1.0 — community source, open inside the DeSciX Community, value-return outside. See [LICENSE](LICENSE) for key terms. Non-members receive no license of any kind.
