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
│   ├── ContinuumHypothesis.lean   # CH & GCH decidable in EGPT (beth staircase has no gaps)
│   ├── Analysis.lean              # Analytical properties
│   └── Filter.lean                # Rejection filters, probability distributions
├── Complexity/                    # *** THE P=NP PROOF CHAIN ***
│   ├── Core.lean                  # PathToConstraint, polynomial definitions, equivPathNat/equivCNFPath/pathNat/natPath aliases
│   ├── TableauFromCNF.lean        # SatisfyingTableau, walkCNFPaths, walkComplexity_upper_bound
│   ├── ComplexityInformationBridge.lean  # Interpretation theorems: time complexity = information complexity
│   ├── Interpretation.lean        # Thin import shim re-exporting ComplexityInformationBridge
│   ├── PPNP.lean                  # P, NP, P_eq_NP, Cook-Levin theorem
│   └── UTM.lean                   # Universal Turing Machine (NOT used in proof)
├── Entropy/                       # *** INDEPENDENT PROOF — not in P=NP chain ***
│   ├── Common.lean                # Rota's 5 entropy axioms (HasRotaEntropyProperties)
│   ├── H.lean                     # Entropy function definitions
│   └── RET.lean                   # Rota's Entropy Theorem (RotaUniformTheorem_formula_with_C_constant)
├── Physics/                       # Physical models (motivation, NOT used in proof)
│   ├── Common.lean, BoseEinstein.lean, FermiDirac.lean, MaxwellBoltzmann.lean
│   ├── PhysicsDist.lean, UniformSystems.lean, PhotonicCA.lean
│   ├── RealityIsComputation.lean  # RealityIsComputation — capstone: physics systems have computable programs
└── Deprecated/                    # Earlier proof attempts (archived)

PPNP/                              # Development workspace
├── Proofs/
│   ├── EGPT_PequalsNP.lean        # Main proof entry point
│   └── WaveParticleDualityDisproved.lean
└── Dev/                           # Scratch work
```

## Critical Invariants

1. **The P=NP proof chain is sorry-free and axiom-free.** These 8 files form the chain:
   - `EGPT/Core.lean`
   - `EGPT/NumberTheory/Core.lean`
   - `EGPT/Constraints.lean`
   - `EGPT/Complexity/Core.lean`
   - `EGPT/Complexity/TableauFromCNF.lean`
   - `EGPT/Complexity/ComplexityInformationBridge.lean`
   - `EGPT/Complexity/Interpretation.lean`
   - `EGPT/Complexity/PPNP.lean`

   Do NOT introduce `sorry`, `axiom`, or `native_decide` into these files.

2. **Physics is semantics, not syntax.** The `Physics/` directory (including `RealityIsComputation.lean`) provides the physics-computation bridge and physical motivation. It is NEVER imported by the proof chain. Keep it that way. All three canonical distributions (BE/FD/MB) have formal `H = C × Shannon` proofs over Lean ℝ, with Rota's continuity axiom ("discrete continuity") proven — not assumed.

3. **Entropy is independent.** The `Entropy/` module formalizes Rota's Entropy Theorem as a separate, information-theoretic proof. It has `sorry`s because it takes Rota's axioms as foundations. It is NOT used in the constructive P=NP chain.

## Key Definitions

| Definition | File | Purpose |
|-----------|------|---------|
| `ParticlePath` | `Core.lean` | `{ L : List Bool // PathCompress_AllTrue L }` — maximally compressed paths |
| `equivParticlePathToNat` | `NumberTheory/Core.lean` | Proven bijection `ParticlePath ≃ ℕ` |
| `equivPathNat` | `Complexity/Core.lean` | Complexity-facing alias for `equivParticlePathToNat` |
| `equivCNFPath` | `Complexity/Core.lean` | Complexity-facing alias for `equivSyntacticCNF_to_ParticlePath` |
| `pathNat` / `natPath` | `Complexity/Core.lean` | Aliases for `toNat` / `fromNat` used within the complexity layer |
| `SatisfyingTableau` | `Complexity/TableauFromCNF.lean` | Certificate type for CNF satisfiability |
| `walkCNFPaths` | `Complexity/TableauFromCNF.lean` | Full walk: visits every CNF clause and records the path to its satisfied literal |
| `walkComplexity_upper_bound` | `Complexity/TableauFromCNF.lean` | Walk cost ≤ clauses × variables (the n² bound) |
| `ComplexityInformationBridge` | `Complexity/ComplexityInformationBridge.lean` | Interpretation theorems: n² time complexity = n² information complexity |
| `P` / `NP` | `Complexity/PPNP.lean` | Complexity class definitions — identical definitions, identity forced by bijection chain |
| `P_eq_NP` | `Complexity/PPNP.lean` | **The P = NP theorem — definitional identity (`Set.ext` + `Iff.rfl`), consequence of proven bijection chain** |
| `canonical_n_squared_bound` | `Complexity/PPNP.lean` | \|cnf\| x k ≤ n² helper lemma |
| `EGPT_CookLevin_Theorem` | `Complexity/PPNP.lean` | SAT is NP-Complete |
| `EGPT_ContinuumHypothesis` | `NumberTheory/ContinuumHypothesis.lean` | CH decidable & true (Hilbert #1) |
| `EGPT_GeneralizedContinuumHypothesis` | `NumberTheory/ContinuumHypothesis.lean` | GCH: no gap between consecutive beth levels |
| `TypeTheoryConstructible` | `NumberTheory/ContinuumHypothesis.lean` | Types constructible in Lean 4 / CIC from ℕ via finitary operations |
| `AbadirCompletenessTheorem` | `NumberTheory/ContinuumHypothesis.lean` | Every `TypeTheoryConstructible` type has beth-level cardinality |

## Documentation

- [`EGPT/PeqNP_Proof_README.md`](EGPT/PeqNP_Proof_README.md) — Detailed proof walkthrough with code references
- [`EGPT/EGPTOverview.md`](EGPT/EGPTOverview.md) — Physics-informed overview
- [`EGPT/NumberTheory/CH_README.md`](EGPT/NumberTheory/CH_README.md) — CH/GCH/Universe Completeness proof walkthrough
- [`PPNP/RET_README.md`](PPNP/RET_README.md) — Rota Entropy Theorem documentation
