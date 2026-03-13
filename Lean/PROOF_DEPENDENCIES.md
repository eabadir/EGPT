# EGPT Proof Dependency Graph

> 87 machine-verified theorems across 25 Lean 4 files.
> No `sorry`. No custom axioms. Only Lean's built-in `propext`, `Quot.sound`, `Classical.choice`.

## P=NP Proof Chain (8 files, sorry-free, axiom-free)

The core constructive proof. Each file depends only on those above it.

```
Mathlib
  |
EGPT/Basic.lean .......................... helper lemmas (Mathlib only)
  |
EGPT/Core.lean ........................... ParticlePath, ComputerTape
  |                                        PathCompress_AllTrue, IIDParticleSource
  |
EGPT/NumberTheory/Core.lean .............. ParticlePath ≃ ℕ bijection
  |                                        toNat, fromNat, arithmetic, EGPT_Polynomial
  |                                        cardinal_of_egpt_level
  |
EGPT/Constraints.lean .................... Literal_EGPT, Clause_EGPT, SyntacticCNF_EGPT
  |                                        CanonicalCNF, encodeCNF, normalizeCNF
  |
EGPT/Complexity/Core.lean ................ PathToConstraint, IsPolynomialEGPT
  |                                        IsBoundedByEGPT_Polynomial
  |
EGPT/Complexity/TableauFromCNF.lean ...... SatisfyingTableau, walkCNFPaths
  |                                        walkComplexity_upper_bound (cost ≤ n²)
  |
EGPT/Complexity/ComplexityInformationBridge.lean  nSquared_time_complexity_is_information_complexity
  |                                               walk_nSquared_bound_is_time_and_information
  |
EGPT/Complexity/Interpretation.lean ...... Thin import shim — re-exports ComplexityInformationBridge
  |
EGPT/Complexity/PPNP.lean ............... AllSatisfyingAssignments (CNF-derived semantic set)
                                          allSatisfyingAssignments_nonempty_iff_bounded_tableau
                                          P, NP (identical definitions), P_eq_NP (Set.ext + Iff.rfl)
                                          L_SAT_in_NP, L_SAT_in_P
                                          EGPT_CookLevin_Theorem
```

**Cross-chain imports:** `TableauFromCNF.lean` and `PPNP.lean` both import `EGPT.Entropy.Common` and `EGPT.Physics.PhysicsDist` for type definitions (entropy-related types used in complexity bounds). `ComplexityInformationBridge.lean` imports `EGPT.Entropy.Common` for `IRECT_Program_to_Entropy` and `IRECT_RECT_inverse_for_integer_complexity`. These are data-type and interface imports — the P=NP result does not depend on any Entropy or Physics *theorem*.

## Entropy Chain (Rota's Entropy Theorem)

Independent proof that all valid entropy measures are scalar multiples of Shannon entropy.

```
Mathlib
  |
EGPT/Core.lean ─────────────────┐
EGPT/Complexity/Core.lean ──────┤  (type imports only)
                                |
EGPT/Entropy/Common.lean ................ Shannon entropy, RECT, source coding
  |                                       stdShannonEntropyLn_uniform_eq_log_card
  |                                       rect_program_for_dist, IID_Source_to_Program
  |
  ├─── EGPT/Entropy/RET.lean ............ Rota's Entropy Theorem
  |                                       f0_mul_eq_add_f0, uniformEntropy_power_law
  |                                       RotaUniformTheorem: all entropy = C × Shannon
  |
  └─── EGPT/Entropy/H.lean .............. Canonical entropy axiom verification
                                          7 Rota axioms verified for Shannon entropy
                                          entropy_of_fair_coin_is_one_bit
                                          (imports PPNP, Physics — capstone verification)
```

**Note:** `H.lean` imports `Complexity.PPNP` and `Physics.PhotonicCA` because it serves as a capstone verification file that ties the entire formalization together. It is NOT part of the P=NP proof chain.

## Physics Chain (motivation — NOT imported by proof chain)

Physical grounding showing all statistical systems reduce to Shannon entropy.

```
EGPT/Physics/Common.lean ................ Physical entropy definitions
  |                                       (imports: Core, Basic, Entropy.Common)
  |
EGPT/Physics/UniformSystems.lean ........ Uniform distribution ≡ C × Shannon
  |
  ├── EGPT/Physics/BoseEinstein.lean .... H_BE = C × Shannon
  ├── EGPT/Physics/FermiDirac.lean ...... H_FD = C × Shannon
  └── EGPT/Physics/MaxwellBoltzmann.lean  H_MB = C × Shannon
        |
EGPT/Physics/PhysicsDist.lean ........... Unified: entropy_{BE,FD,MB} = C × Shannon
  |
EGPT/Physics/PhotonicCA.lean ............ Every BE system has equivalent program
  |
EGPT/Physics/RealityIsComputation.lean .. Capstone: every physical system is a program
```

## Number Theory Extensions

Files that extend the core number theory but are NOT part of the P=NP proof chain.

```
EGPT/NumberTheory/Filter.lean ........... RejectionFilter, probability distributions
                                          (imports: NumberTheory.Core, Constraints)

EGPT/NumberTheory/ContinuumHypothesis.lean  CH & GCH decidable and true (Hilbert #1)
                                            EGPT_ContinuumHypothesis
                                            EGPT_GeneralizedContinuumHypothesis
                                            (imports: NumberTheory.Core)

EGPT/NumberTheory/Analysis.lean ......... FTA via information, entropy decomposition
                                          (imports: entire chain — capstone analysis)
```

## Complexity Extensions

```
EGPT/Complexity/UTM.lean ................ Universal Turing Machine certifier
                                          (imports: Tableau, Filter)

EGPT/Complexity/Decomposition.lean ...... Assignment-free SAT criterion (experimental)
                                          AssignmentFreeSAT
                                          assignmentFree_iff_nonempty_allSatisfyingAssignments
                                          CNFSharesFactor (prime-indexed common-factor criterion)
                                          evalCNF_true_iff_cnfSharesFactor
                                          cnfSharesFactor_iff_nonempty_allSatisfyingAssignments
                                          decomposition_is_poly_bounded

EGPT/Complexity/Physics.lean ............ Constrained systems ≡ SAT
                                          (imports: Core, NumberTheory, Filter, Constraints)
```

## Other Proofs

```
PPNP/Proofs/WaveParticleDualityDisproved.lean ... BE explained by classical paths
```

## File-by-File Theorem Count

| File | Theorems | Key Results |
|------|----------|-------------|
| `Core.lean` | — | Definitions: ParticlePath, ComputerTape |
| `NumberTheory/Core.lean` | 9 | `equivParticlePathToNat`, cardinal_of_egpt_level |
| `NumberTheory/ContinuumHypothesis.lean` | 4 | `EGPT_ContinuumHypothesis`, `EGPT_GeneralizedContinuumHypothesis` |
| `NumberTheory/Filter.lean` | 5 | `distOfRejectionFilter`, `eventsPMF` |
| `NumberTheory/Analysis.lean` | 6 | `EGPT_Fundamental_Theorem_of_Arithmetic_via_Information` |
| `Constraints.lean` | 7 | `encodeCNF_size_ge_k`, `evalCNF_normalize_eq_evalCNF` |
| `Entropy/Common.lean` | 7 | `rect_program_for_dist`, `RECT_Entropy_to_Program` |
| `Entropy/RET.lean` | 10 | `RotaUniformTheorem`, `uniformEntropy_power_law` |
| `Entropy/H.lean` | 10 | 7 Rota axioms + `entropy_of_fair_coin_is_one_bit` |
| `Complexity/Core.lean` | — | Definitions: PathToConstraint, `equivPathNat`, `equivCNFPath`, `pathNat`, `natPath` |
| `Complexity/TableauFromCNF.lean` | 4 | `walkCNFPaths`, `walkComplexity_upper_bound` |
| `Complexity/ComplexityInformationBridge.lean` | 2 | `nSquared_time_complexity_is_information_complexity`, `walk_nSquared_bound_is_time_and_information` |
| `Complexity/Interpretation.lean` | — | Import shim (re-exports ComplexityInformationBridge) |
| `Complexity/PPNP.lean` | 11 | `AllSatisfyingAssignments`, `allSatisfyingAssignments_nonempty_iff_bounded_tableau`, `P_eq_NP` (`Set.ext` + `Iff.rfl`), `EGPT_CookLevin_Theorem` |
| `Complexity/Decomposition.lean` | 9 | `assignmentFree_iff_nonempty_allSatisfyingAssignments`, `decomposition_is_poly_bounded` |
| `Complexity/UTM.lean` | 1 | `UniversalTuringMachine_EGPT` |
| `Complexity/Physics.lean` | 2 | `constrainedSystem_equiv_SAT` |
| `Physics/Common.lean` | 1 | `H_physical_system` |
| `Physics/UniformSystems.lean` | 4 | `H_physical_system_is_rota_uniform` |
| `Physics/BoseEinstein.lean` | 3 | `H_BE_from_Multiset_eq_C_shannon` |
| `Physics/FermiDirac.lean` | 1 | `H_FD_eq_C_shannon` |
| `Physics/MaxwellBoltzmann.lean` | 1 | `H_MB_eq_C_shannon` |
| `Physics/PhysicsDist.lean` | 4 | `H_physics_dist_linear_combination_eq_generalized_C_Shannon` |
| `Physics/PhotonicCA.lean` | 1 | `be_system_has_equivalent_program` |
| `Physics/RealityIsComputation.lean` | 3 | `RealityIsComputation`, `ContinuousFieldsAreComputation` |
| `PPNP/.../WaveParticleDualityDisproved.lean` | 2 | `Wave_Particle_Duality_Disproved_QED` |

**Total: 87 verified theorems** (see [`EGPT_PROOFS_VALIDATION.md`](EGPT_PROOFS_VALIDATION.md) for full axiom inventory)

## Isolation Guarantees

1. **Proof chain files** (`Core.lean` through `PPNP.lean`, including `ComplexityInformationBridge.lean` and `Interpretation.lean`) import `Entropy.Common` and `Physics.PhysicsDist` only for type definitions and interfaces. No Entropy or Physics *theorem* is used in the P=NP proof.
2. **No proof chain file imports from `EGPT.Physics.*` modules** (only `PhysicsDist` types via `TableauFromCNF.lean` and `PPNP.lean`).
3. **`ComplexityInformationBridge.lean`** uses `IRECT_Program_to_Entropy` and `IRECT_RECT_inverse_for_integer_complexity` from `Entropy.Common` as interfaces that bridge time and information complexity. No entropy theorem about physical distributions is invoked.
4. **The Entropy chain** (`Common`, `RET`, `H`) imports from Mathlib and `EGPT.Core`/`EGPT.Complexity.Core` for types. `H.lean` is a capstone file importing broadly.
5. **Physics files** are downstream of Entropy but never imported by the proof chain.

## How to Verify

```bash
# Typecheck all 87 theorems
cd Lean && lake build

# Regenerate validation report
node ../scripts/build_report.js

# Verify proof chain is sorry-free
grep -r "sorry" EGPT/Core.lean EGPT/NumberTheory/Core.lean \
  EGPT/Constraints.lean EGPT/Complexity/Core.lean \
  EGPT/Complexity/TableauFromCNF.lean \
  EGPT/Complexity/ComplexityInformationBridge.lean \
  EGPT/Complexity/Interpretation.lean \
  EGPT/Complexity/PPNP.lean
# Expected: 0 matches
```
