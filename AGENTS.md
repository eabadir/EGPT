# EGPT — Agent Instructions

> Electronic Graph Paper Theory (EGPT) — a constructive, machine-verified proof that P = NP
> and a working integer-only math library (EGPTMath) that replaces FLOPs with IOPs.
> 85 Lean 4 theorems. No `sorry`. No custom axioms. 157 EGPTMath tests, 100% pass.
> The proof says scalable AI is possible. EGPTMath and FAT show how.
> Central principle: **"The address is the map."**

## Your Role

You are working in a repository with two equally important layers: **formal proofs** (Lean 4) and a **working integer-only math library** (EGPTMath/FAT) that demonstrates the proofs in practice. The proof chain answers "is it possible?" — EGPTMath answers "how do you build it?" Your primary obligations are to **never break the proof chain** and **never introduce floating point into EGPTMath**. When in doubt, verify with `cd Lean && lake build` and `cd EGPTMath && node test/EGPTTestSuite.js`.

## Critical Invariants — Never Violate

1. **The P=NP proof chain is sorry-free and axiom-free.** Do NOT introduce `sorry`, `axiom`, or `native_decide` into these 6 files:
   - `Lean/EGPT/Core.lean`
   - `Lean/EGPT/NumberTheory/Core.lean`
   - `Lean/EGPT/Constraints.lean`
   - `Lean/EGPT/Complexity/Core.lean`
   - `Lean/EGPT/Complexity/Tableau.lean`
   - `Lean/EGPT/Complexity/PPNP.lean`

2. **No floating point.** All math is integer operations (IOPs, not FLOPs). This is the core thesis.

3. **FAT is proprietary.** The Faster Abadir Transform's optimized implementation is NOT in this repo. Only educational/pedagogical variants exist in `EGPTMath/FAT/`.

4. **Physics is motivation, not proof.** `Lean/EGPT/Physics/` provides physical grounding but is NOT imported by the formal P=NP proof chain.

## Directory Map

| Directory | Purpose | Detailed Instructions |
|-----------|---------|----------------------|
| [`EGPTMath/`](EGPTMath/) | Integer-only math library — FLOPs become IOPs. Exact arithmetic, no error accumulation. 157 tests. | [`EGPTMath/CLAUDE.md`](EGPTMath/CLAUDE.md) |
| [`EGPTMath/FAT/`](EGPTMath/FAT/) | Faster Abadir Transform (pedagogical) — integer-only FFT/QFT. Classical QFT at O((log k)^3). | [`EGPTMath/FAT/FAT_README.md`](EGPTMath/FAT/FAT_README.md) |
| [`Lean/`](Lean/) | Formal Lean 4 proofs (85 theorems, sorry-free, axiom-free) | [`Lean/CLAUDE.md`](Lean/CLAUDE.md) |
| [`content/`](content/) | Papers, books, reference docs, pyFRAQTL SDK | [`content/CLAUDE.md`](content/CLAUDE.md) |
| [`www/`](www/) | Interactive browser demos and visualizers | [`www/CLAUDE.md`](www/CLAUDE.md) |
| [`scripts/`](scripts/) | Build utilities (LaTeX-to-Markdown, validation report) | — |

Each subdirectory's `CLAUDE.md` contains detailed conventions, file inventories, and working instructions.

## Build & Verify

```bash
# Lean proofs — typechecks all 85 theorems (requires Lean 4 + mathlib4)
cd Lean && lake build

# EGPTMath — run the full test suite (157 tests)
cd EGPTMath && npm install && node test/EGPTTestSuite.js

# Web demos — no build step, open HTML files directly
open www/EGPTNumberUniformity.html

# Regenerate proof validation report
cd Lean && node ../scripts/build_report.js

# Before pushing to main — regenerate sitemap
node scripts/generate_sitemap.js
```

## Proof Dependency Graph

### P=NP Proof Chain (6 files, sorry-free, axiom-free)

```
EGPT/Core.lean ─────────── ParticlePath, ComputerTape
       |
EGPT/NumberTheory/Core.lean ── ParticlePath ≃ ℕ bijection, arithmetic
       |
EGPT/Constraints.lean ──── CNF formulas, Literal_EGPT, encodeCNF
       |
EGPT/Complexity/Core.lean ── PathToConstraint, polynomial definitions
       |
EGPT/Complexity/Tableau.lean ── SatisfyingTableau, cost ≤ n²
       |
EGPT/Complexity/PPNP.lean ── P, NP, P_eq_NP, Cook-Levin theorem
```

### Entropy Chain (independent — Rota's Entropy Theorem)

```
EGPT/Entropy/Common.lean ── Shannon entropy, RECT source coding
       |
   ├── EGPT/Entropy/RET.lean ── RotaUniformTheorem: all entropy = C × Shannon
   └── EGPT/Entropy/H.lean ── 7 Rota axioms verified for Shannon entropy
```

### Physics Chain (motivation only — NOT imported by proof chain)

```
EGPT/Physics/Common.lean → UniformSystems → {BoseEinstein, FermiDirac, MaxwellBoltzmann}
       → PhysicsDist → PhotonicCA → RealityIsComputation
```

### Isolation

- Proof chain imports `Entropy.Common` and `Physics.PhysicsDist` for **type definitions only** — no Entropy or Physics theorem is used in P=NP.
- Physics files are downstream of everything; never imported by the proof chain.

For the full detailed dependency graph with per-file theorem inventories, see [`Lean/PROOF_DEPENDENCIES.md`](Lean/PROOF_DEPENDENCIES.md).

For Mermaid diagrams and a machine-readable JSON graph, see [`docs/PROOF_GRAPH.md`](docs/PROOF_GRAPH.md) and [`docs/proof_graph.json`](docs/proof_graph.json).

## Key Entry Points

| If you want to... | Start here |
|--------------------|------------|
| **Working implementations (the practical answer to scalable AI)** | |
| See integer-only math in action | [`EGPTMath/README.md`](EGPTMath/README.md) — FLOPs become IOPs, 157 tests |
| Understand how unlimited precision works | [`EGPTMath/EGPTMath_Developer_Guide.md`](EGPTMath/EGPTMath_Developer_Guide.md) |
| See integer-only FFT/QFT (FAT) | [`EGPTMath/FAT/FAT_README.md`](EGPTMath/FAT/FAT_README.md) — classical QFT, no floats |
| Run the test suite | `cd EGPTMath && node test/EGPTTestSuite.js` (157 tests) |
| See the FRAQTL factorization algorithm | [`content/pyFRAQTL/FRAQTL_WhitePaper.md`](content/pyFRAQTL/FRAQTL_WhitePaper.md) |
| **Formal proofs (why it works)** | |
| Understand the P=NP proof | [`Lean/EGPT/PeqNP_Proof_README.md`](Lean/EGPT/PeqNP_Proof_README.md) |
| Audit the proof chain step-by-step | [`SKEPTICS_GUIDE.md`](SKEPTICS_GUIDE.md) |
| See all 85 theorems with axiom inventory | [`Lean/EGPT_PROOFS_VALIDATION.md`](Lean/EGPT_PROOFS_VALIDATION.md) |
| Read the full dependency graph | [`Lean/PROOF_DEPENDENCIES.md`](Lean/PROOF_DEPENDENCIES.md) |
| See the Mermaid proof DAG | [`docs/PROOF_GRAPH.md`](docs/PROOF_GRAPH.md) |
| Ingest the graph programmatically | [`docs/proof_graph.json`](docs/proof_graph.json) |
| **Narrative and context** | |
| Understand the narrative and philosophy | [`EGPT_STORY.md`](EGPT_STORY.md) |
| Read the academic paper | [`content/Papers/EGPT_PeqNP/PeqNP_QED.md`](content/Papers/EGPT_PeqNP/PeqNP_QED.md) |
| Five foundational ideas + artifact maps | [`IDEAS.md`](IDEAS.md) |
| Explore interactive demos | [`www/`](www/) — open HTML files directly |

## EGPTMath — The Theory as Runnable Code

EGPTMath is the pedagogical JavaScript translation of the Lean 4 proofs. Every formal concept has a corresponding implementation:

| Lean Concept | JS Implementation | File |
|-------------|-------------------|------|
| `ParticlePath ≃ ℕ` bijection | PPF (Power Plus Fractional) encoding | `EGPTMath/EGPTNumber.js` |
| Integer-only arithmetic (IOPs) | All math via BigInt, no floats | `EGPTMath/EGPTMath.js` |
| Rota's Entropy Theorem (`H = C * Shannon`) | PPF satisfies `H(p*q) = H(p) + H(q)` | `EGPTMath/EGPTNumber.js` |
| Shannon source coding | Lossless PPF encode/decode round-trips | `EGPTMath/EGPTMath.js` |
| FFT as integer computation | FAT: Cooley-Tukey with exact rational twiddle factors | `EGPTMath/FAT/EGPTFAT.js` |
| QFT on classical hardware | `qft`/`iqft` aliases using FAT pipeline | `EGPTMath/FAT/EGPTFAT.js` |

The FAT variants in `EGPTMath/FAT/` demonstrate that the Quantum Fourier Transform is classically computable with integer-only arithmetic. These are pedagogical implementations — the optimized FAT is proprietary and not in this repo. See [`EGPTMath/FAT/FAT_README.md`](EGPTMath/FAT/FAT_README.md) for all variants, test results, and known limitations.

## Specialist Agent Instructions

Seven agents in [`.claude/agents/`](.claude/agents/) provide domain-specific conventions and working instructions for each layer of the repo:

| Agent File | Domain | Key Contents |
|-----------|--------|-------------|
| [`egpt-orchestrator.md`](.claude/agents/egpt-orchestrator.md) | Cross-layer sync | Change detection, sync matrix, delegation protocol |
| [`lean-prover.md`](.claude/agents/lean-prover.md) | Lean 4 formal proofs | Proof chain invariants, key definitions, module structure |
| [`js-engineer.md`](.claude/agents/js-engineer.md) | EGPTMath JS | Lean-to-JS mapping patterns, test suite, integer-only rules |
| [`doc-writer.md`](.claude/agents/doc-writer.md) | Documentation | CLAUDE.md maintenance, AI navigation files, cross-reference checks |
| [`demo-builder.md`](.claude/agents/demo-builder.md) | Web demos | Chart.js/p5.js conventions, self-contained HTML style guide |
| [`content-author.md`](.claude/agents/content-author.md) | Papers & stories | Content structure, tone by document type, key principles |
| [`sync-validator.md`](.claude/agents/sync-validator.md) | Consistency checks | 11 validation checks across all layers |

## Boundaries

- Do NOT modify proof chain files without running `cd Lean && lake build` after.
- Do NOT introduce floating-point operations into `EGPTMath/` core logic.
- Do NOT expose optimized FAT implementations. Only pedagogical variants in `EGPTMath/FAT/`.
- `content/` contains reference materials. Treat as read-only unless updating or adding papers.
- `Lean/PPNP/` is a development workspace, not part of the formal chain.
