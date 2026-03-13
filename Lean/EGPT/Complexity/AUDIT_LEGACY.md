# Audit of Legacy Distractions in EGPT Complexity

## Executive Summary
This audit identifies components within the `Lean/EGPT/Complexity/` directory that are **not** used in the formal P=NP proof chain (`PPNP.lean` and its dependencies) and may cause confusion for traditional complexity theorists. These components largely relate to "physical" simulations, rejection sampling, and probability filters, which serve as motivation but are not part of the constructive proof.

## 1. Unused Files and Modules

The following files are located in `Lean/EGPT/Complexity/` but are **not imported** by `PPNP.lean` or its dependencies (`Core.lean`, `TableauFromCNF.lean`). They should be considered for removal or relocation to a `Physics/` or `Simulation/` namespace to clarify the proof structure.

### 1.1 `Lean/EGPT/Complexity/Physics.lean`
- **Status:** **UNUSED** in P=NP proof.
- **Confusing Concepts:**
  - `RejectionFilter`: A probabilistic structure imported from `NumberTheory.Filter`. The P=NP proof uses constructive `SatisfyingTableau`, not probabilistic filters.
  - `NDTM_A_run`: A non-deterministic Turing Machine simulator using random walks and seeds. The proof uses the `walkCNFPaths` construction, which is deterministic given an endpoint.
  - `ParticleState_SAT`, `advance_state`: Markov process definitions.
  - `DMachine`, `ConstrainedSystem`: Alternative definitions of verification not used in `PPNP.lean`.
- **Recommendation:** Move to `Lean/EGPT/Physics/` or `Lean/EGPT/Simulation/`.

### 1.2 `Lean/EGPT/Complexity/UTM.lean`
- **Status:** **UNUSED** in P=NP proof.
- **Confusing Concepts:**
  - `UniversalTuringMachine_EGPT`: Defined as a function transforming `RejectionFilter` to `RejectionFilter`.
  - Uses `Classical.choice` to pick a witness. The P=NP proof is constructive and does not rely on choice for the existence of the tableau (the tableau is constructed from the endpoint).
- **Recommendation:** Deprecate or redefine `UTM` in terms of `SatisfyingTableau` (see Refactoring Suggestions).

## 2. Confusing Terminology in Core Files

### 2.1 "Filter" Artifacts
- The term "Filter" (specifically `RejectionFilter`) appears in `Physics.lean` and `UTM.lean` but is absent from the core proof chain.
- **Confusion Risk:** Complexity theorists might confuse "Rejection Filter" with "Bloom Filter" or "Filter" in topology/order theory.
- **Action:** Ensure `PPNP.lean`, `TableauFromCNF.lean`, and `Constraints.lean` remain free of `RejectionFilter` dependencies. (Current state: They are free).

### 2.2 "Particle" Terminology
- **Location:** `EGPT.Core` and `NumberTheory.Core`.
- **Terms:** `ParticlePath`, `ChargedParticlePath`, `ParticleHistoryPMF`.
- **Issue:** While fundamental to EGPT's "physical" motivation, these names obscure the standard complexity theoretic interpretation (Unary Number, Integer, Rational).
- **Status Update:** Complexity readability aliases have been added:
  - `ComputerProgram := ComputerTape`
  - `CanonicalCNFProgram` and CNF→program bridge theorems in `Complexity/Core.lean`
  - Program-composition closure lemmas for reviewer-facing interpretation.

## 3. Dependency Graph Verification
The `PPNP.lean` proof chain strictly imports:
1. `EGPT.Core`
2. `EGPT.NumberTheory.Core`
3. `EGPT.Constraints`
4. `EGPT.Complexity.Core`
5. `EGPT.Complexity.TableauFromCNF`

It **does not** import:
- `EGPT.Complexity.Physics`
- `EGPT.Complexity.UTM`
- `EGPT.NumberTheory.Filter` (except via `Physics` or `UTM`)

## 4. Conclusion
To clarify the proof for complexity theorists, we should:
1. **Remove** `Physics.lean` and `UTM.lean` from the `Complexity/` directory.
2. **Rename** or **Alias** physical terms in the complexity context.
3. **Focus** the complexity namespace strictly on `CNF`, `Tableau`, and the `P`/`NP` class definitions.
4. **Keep interpretation theorems separate from chain logic:** `Complexity/Interpretation.lean` now provides a non-chain theorem clarifying that in EGPT the `n²` bound is both time and information complexity.
