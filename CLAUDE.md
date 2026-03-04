# EGPT Mono-Repo

Electronic Graph Paper Theory (EGPT) — a constructive proof that P = NP, built from first principles using physically motivated, fully computable number theory derived from random walks.

Central principle: **"The address is the map."** In an information space where every element is maximally compressed, defining a problem is defining its solution.

## Directory Map

| Directory | Purpose | CLAUDE.md |
|-----------|---------|-----------|
| `Lean/` | Formal Lean 4 proofs (P=NP, Rota Entropy Theorem, number theory) | [`Lean/CLAUDE.md`](Lean/CLAUDE.md) |
| `EGPTMath/` | Pedagogical JavaScript integer math library (FLOPs → IOPs) | [`EGPTMath/CLAUDE.md`](EGPTMath/CLAUDE.md) |
| `content/` | Papers, books, reference docs, pyFRAQTL SDK | [`content/CLAUDE.md`](content/CLAUDE.md) |
| `www/` | Interactive browser demos and visualizers | [`www/CLAUDE.md`](www/CLAUDE.md) |
| `scripts/` | Build utilities (LaTeX-to-Markdown, file packager for AI indexing) | — |

## Key Conventions

- **No floating point.** Everything is integer operations (IOPs, not FLOPs). This is the core thesis.
- **"Address is the map"** is the central principle across all code and proofs.
- **Lean proof chain must stay sorry-free and axiom-free.** The 6-file P=NP proof chain (see `Lean/CLAUDE.md`) has no `sorry` and no custom axioms. Do not introduce them.
- **EGPTMath is pedagogical.** It is intentionally unoptimized to teach how continuous math becomes discrete.
- **FAT is proprietary.** The Faster Abadir Transform's optimized implementation is NOT in this repo. Only educational/pedagogical variants exist in `EGPTMath/FAT/`.
- **Physics is motivation, not proof.** `Lean/EGPT/Physics/` and `Lean/EGPT/Complexity/Physics.lean` provide physical grounding but are NOT imported by the formal proof chain.

## Build & Test

```bash
# Lean proofs — typechecks entire proof chain (requires Lean 4 + mathlib4)
cd Lean && lake build

# EGPTMath — run the full test suite (157 tests)
cd EGPTMath && npm install && node test/EGPTTestSuite.js

# Web demos — no build step, open HTML files directly
open www/EGPTNumberUniformity.html
```

## Key Files

- `EGPT_STORY.md` — Full narrative exposition (the original README, 46KB)
- `Lean/EGPT/PeqNP_Proof_README.md` — Detailed P=NP proof walkthrough
- `Lean/EGPT/Complexity/PPNP.lean` — The `P_eq_NP_EGPT` theorem
- `Lean/EGPT/NumberTheory/Core.lean` — ParticlePath ↔ ℕ bijection
- `content/pyFRAQTL/FRAQTL_WhitePaper.md` — FRAQTL factorization algorithm

## License

DeSciX (Decentralized Science) Community Agreement. Community source — transparent ideas, shared IP.
