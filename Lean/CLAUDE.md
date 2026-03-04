# Lean Proofs

Formal Lean 4 proofs of EGPT number theory, the P=NP theorem, and Rota's Entropy Theorem.

## Toolchain

- **Lean**: v4.21.0-rc3 (see `lean-toolchain`)
- **Build system**: Lake
- **Dependency**: mathlib4 (from GitHub master)
- **Build**: `lake build` (from this directory)

## Module Structure

```
EGPT.lean                          # Root module — imports EGPT.Core
EGPT/
├── Core.lean                      # ParticlePath, PathCompress_AllTrue, ComputerTape
├── Basic.lean                     # Helper lemmas (logarithms, casts, Archimedean)
├── Constraints.lean               # CNF formulas, Literal_EGPT, CanonicalCNF, encodeCNF
├── NumberTheory/
│   ├── Core.lean                  # ParticlePath ↔ ℕ bijection, arithmetic, EGPT_Polynomial
│   ├── Analysis.lean              # Analytical properties
│   └── Filter.lean                # Rejection filters, probability distributions
├── Complexity/                    # *** THE P=NP PROOF CHAIN ***
│   ├── Core.lean                  # PathToConstraint, polynomial definitions
│   ├── Tableau.lean               # SatisfyingTableau, constructSatisfyingTableau, complexity bounds
│   ├── PPNP.lean                  # P_EGPT, NP_EGPT, P_eq_NP_EGPT, Cook-Levin theorem
│   ├── Physics.lean               # Physical model (NOT used in proof — semantics only)
│   └── UTM.lean                   # Universal Turing Machine (NOT used in proof)
├── Entropy/                       # *** INDEPENDENT PROOF — not in P=NP chain ***
│   ├── Common.lean                # Rota's 5 entropy axioms (HasRotaEntropyProperties)
│   ├── H.lean                     # Entropy function definitions
│   └── RET.lean                   # Rota's Entropy Theorem (RotaUniformTheorem_formula_with_C_constant)
├── Physics/                       # Physical models (motivation, NOT used in proof)
│   ├── Common.lean, BoseEinstein.lean, PhotonicCA.lean
│   ├── PhysicsDist.lean, UniformSystems.lean
└── Deprecated/                    # Earlier proof attempts (archived)

PPNP/                              # Development workspace
├── Proofs/
│   ├── EGPT_PequalsNP.lean        # Main proof entry point
│   └── WaveParticleDualityDisproved.lean
└── Dev/                           # Scratch work
```

## Critical Invariants

1. **The P=NP proof chain is sorry-free and axiom-free.** These 6 files form the chain:
   - `EGPT/Core.lean`
   - `EGPT/NumberTheory/Core.lean`
   - `EGPT/Constraints.lean`
   - `EGPT/Complexity/Core.lean`
   - `EGPT/Complexity/Tableau.lean`
   - `EGPT/Complexity/PPNP.lean`

   Do NOT introduce `sorry`, `axiom`, or `native_decide` into these files.

2. **Physics is semantics, not syntax.** `Physics.lean` and the `Physics/` directory provide physical motivation. They are NEVER imported by the proof chain. Keep it that way.

3. **Entropy is independent.** The `Entropy/` module formalizes Rota's Entropy Theorem as a separate, information-theoretic proof. It has `sorry`s because it takes Rota's axioms as foundations. It is NOT used in the constructive P=NP chain.

## Key Definitions

| Definition | File | Purpose |
|-----------|------|---------|
| `ParticlePath` | `Core.lean` | `{ L : List Bool // PathCompress_AllTrue L }` — maximally compressed paths |
| `equivParticlePathToNat` | `NumberTheory/Core.lean` | Proven bijection `ParticlePath ≃ ℕ` |
| `SatisfyingTableau` | `Complexity/Tableau.lean` | Certificate type for CNF satisfiability |
| `constructSatisfyingTableau` | `Complexity/Tableau.lean` | Deterministic certificate construction |
| `tableauComplexity_upper_bound` | `Complexity/Tableau.lean` | Cost ≤ clauses × variables |
| `P_EGPT` / `NP_EGPT` | `Complexity/PPNP.lean` | Complexity class definitions (identical) |
| `P_eq_NP_EGPT` | `Complexity/PPNP.lean` | **The P = NP theorem** |
| `EGPT_CookLevin_Theorem` | `Complexity/PPNP.lean` | SAT is NP-Complete |

## Documentation

- [`EGPT/PeqNP_Proof_README.md`](EGPT/PeqNP_Proof_README.md) — Detailed proof walkthrough with code references
- [`EGPT/EGPTOverview.md`](EGPT/EGPTOverview.md) — Physics-informed overview
- [`PPNP/RET_README.md`](PPNP/RET_README.md) — Rota Entropy Theorem documentation
