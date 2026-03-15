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
| `egpt_circuit_sat/` | Circuit SAT experiment — half-adder via particle transport, 80-run open dataset | — |
| `scripts/` | Build utilities (LaTeX-to-Markdown, file packager for AI indexing) | — |

## Key Conventions

- **No floating point.** Everything is integer operations (IOPs, not FLOPs). This is the core thesis.
- **"Address is the map"** is the central principle across all code and proofs.
- **Lean proof chain must stay sorry-free and axiom-free.** The 6-file P=NP proof chain (see `Lean/CLAUDE.md`) has no `sorry` and no custom axioms. Do not introduce them.
- **EGPTMath is the practical deliverable.** It is the integer-only math library that demonstrates scalable AI is possible — FLOPs become IOPs, exact arithmetic with no error accumulation. It is intentionally unoptimized for clarity, but the architecture (PPF encoding, integer FFT, lossless round-trips) is the real-world answer to the AI energy question.
- **FAT is proprietary.** The Faster Abadir Transform's optimized implementation is NOT in this repo. Only educational/pedagogical variants exist in `EGPTMath/FAT/`. The pedagogical FAT already demonstrates classical QFT — the optimized version is what benchmarks ~1.277 billion x faster than 2,048 GPUs.
- **Physics is motivation, not proof.** `Lean/EGPT/Physics/` (including `RealityIsComputation.lean`) provides physical grounding but is NOT imported by the formal proof chain.
- **GitHub Pages URLs for all external-facing links.** When generating citations, hyperlinks, or references in papers, documentation, READMEs, whitepapers, or any content intended for external consumption, always use the GitHub Pages base URL `https://eabadir.github.io/EGPT/` (not raw GitHub or blob URLs). This ensures external referrers land on the browsable site. Internal repo references (e.g., in CLAUDE.md files or agent instructions) may use relative paths.

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
- `EGPT_STORY_README.md` — Full narrative README (moved from README.md, 46KB)
- `EGPT_STORY.md` — Full narrative exposition (the original README, 46KB)
- `docs/PROOF_GRAPH.md` — Theorem dependency DAG with Mermaid diagrams (AI-optimized)
- `docs/proof_graph.json` — Machine-readable proof dependency graph (JSON)
- `content/pyFRAQTL/FRAQTL_WhitePaper.md` — FRAQTL factorization algorithm

## Agent Team

Twelve specialized agents in `.claude/agents/` keep the repo layers synchronized:

| Agent | Model | Role |
|-------|-------|------|
| `@egpt-orchestrator` | opus | Assesses cross-layer sync needs, delegates to specialists. Never edits directly. |
| `@lean-prover` | opus | Writes and verifies Lean 4 proofs. Guards proof chain invariants. |
| `@js-engineer` | sonnet | Translates Lean concepts into pedagogical JS in EGPTMath. |
| `@doc-writer` | sonnet | Maintains CLAUDE.md, README, proof walkthroughs, and narratives. |
| `@demo-builder` | sonnet | Creates interactive browser demos in www/. |
| `@content-author` | sonnet | Drafts papers, whitepapers, and story-form narratives in content/. |
| `@sync-validator` | haiku | Validates cross-layer consistency (theorem counts, test counts, file paths). |
| `@pnp-moderator` | opus | Moderates the P=NP debate. Invokes skeptic/advocate/rota, consults Stan (Ulam), triggers implementation via `@egpt-orchestrator`. Entry point for debate sessions. |
| `@pnp-skeptic` | opus | Gödel role — formal skeptic. Challenges whether EGPT's formalization captures standard P vs NP. |
| `@pnp-jvm` | opus | Von Neumann role — constructive advocate. Defends EGPT's information-theoretic proof from code. |
| `@pnp-rota` | opus | Rota role — entropy advisor. Filters arguments through RET, validates entropy claims, runs JS experiments. Works with the Advocate. |
| `@egpt-navigator` | sonnet | "Dungeon Master" / interactive guide — routes users to files, agents, and exploration paths through conversational discovery. Read-only concierge. |

**IMPORTANT — Orchestrator Usage**:
- **Proactively invoke `@egpt-orchestrator`** when work is conceptually significant enough to merit reflection across multiple layers — e.g., a new Lean proof (like decidability of the Continuum Hypothesis) should cascade into papers, documentation, JS demonstrations, and potentially web demos. If a result would be noteworthy in an academic or educational context, the orchestrator should assess which layers need to reflect it.
- **Always consult `@egpt-orchestrator` during planning.** Before designing an implementation approach for any non-trivial task, invoke the orchestrator to assess cross-layer impact and identify which specialists should be involved.
- **After completing work** that modifies files across layers (Lean proofs, EGPTMath code, documentation, web demos, or content), invoke `@egpt-orchestrator` to assess what downstream updates are needed.
- For quick consistency checks, invoke `@sync-validator` directly.

**P=NP Debate System** (`@pnp-moderator` → `@pnp-skeptic` + `@pnp-jvm` + `@pnp-rota`):
- **Entry point: `@pnp-moderator`.** Invoke with a question to explore. The moderator frames the question, invokes debaters and the entropy advisor, synthesizes results, and consults Stan at critical junctures.
- **Debate history** is in `content/Skeptics/01_QA.md` through `13_QA.md` (13 exchanges from the founding conversation) plus `DEBATE_STATE.md` (accumulated state) and `debate_log.jsonl` (append-only log). The debate models the 1931 von Neumann–Gödel exchange about the formalizability of intuitionism, transposed to Lean and P=NP.
- **Roles:** Gödel (skeptic), von Neumann (advocate), Rota (entropy advisor), Stan/Ulam (human — leaps of insight).
- **Implementation triggers:** When debaters agree to try a concrete formalization (new Lean proof, white paper, simulation), the moderator pauses the debate, consults Stan, and invokes `@egpt-orchestrator` to delegate parallelizable implementation work to specialist agents.
- **Stan (Ulam) in the loop:** The moderator consults Stan at impasses, when fundamental definitions might change, when the proof chain would be modified, or when genuinely new insights surface. Stan's contributions model Stanislaw Ulam — leaps of insight connecting disparate mathematical ideas.

## AI Navigation

Tool-agnostic AI navigation files complement this Claude-specific guide:
- [`AGENTS.md`](AGENTS.md) — For Cursor, GitHub Copilot, and generic AI agents
- [`.cursorrules`](.cursorrules) — Cursor agent rules
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — VS Code Copilot instructions
- [`llms.txt`](llms.txt) — Lightweight entry point (llms.txt standard)
- [`EGPT_STORY_README.md`](EGPT_STORY_README.md) — Full narrative README (moved from README.md)
- [`Lean/PROOF_DEPENDENCIES.md`](Lean/PROOF_DEPENDENCIES.md) — Full proof dependency graph with theorem inventory
- [`docs/PROOF_GRAPH.md`](docs/PROOF_GRAPH.md) — Mermaid diagrams of theorem dependency DAG
- [`docs/proof_graph.json`](docs/proof_graph.json) — Machine-readable dependency graph (JSON)

## License

[DeSciX Community License Membership Agreement (DCMA)](DeSciX_Community_License_v1.pdf) v1.0 — community source, open inside the DeSciX Community, value-return outside. See [LICENSE](LICENSE) for key terms. Non-members receive no license of any kind.
