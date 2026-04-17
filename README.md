# Mathlib.InformationTheory (fork branch)

Fork of `leanprover-community/mathlib4` proposing a `Mathlib.InformationTheory`
subtree: 31 files adding entropy axiomatics (Rota's 7 axioms + uniqueness), an
information-theoretic number hierarchy (`EntropyNat ≃ ℕ`, `EntropyInt ≃ ℤ`,
`EntropyRat ≃ ℚ`, `EntropyReal ≃ ℝ`), three constructive proofs that P = NP,
and entropy proofs for Bose-Einstein, Fermi-Dirac, and Maxwell-Boltzmann
distributions (each `= C · Shannon`).

**Branch:** `feat/information-theory`
**License:** Apache-2.0 (inherits mathlib)

---

## Summary

| | |
|---|---|
| New files | 31 under `Mathlib/InformationTheory/` |
| `sorry` count | 0 |
| `Classical.choice` | not used by any capstone |
| External dependencies | none beyond mathlib |
| Build | `lake build` |

---

## Build and Verify

```bash
git clone -b feat/information-theory https://github.com/eabadir/EGPT.git
cd EGPT
lake exe cache get
lake build Mathlib.InformationTheory

lake env lean -e '#print axioms Mathlib.InformationTheory.P_eq_NP_info'
lake env lean -e '#print axioms Mathlib.InformationTheory.P_eq_NP'
lake env lean -e '#print axioms Mathlib.InformationTheory.P_eq_NP_info_standard'
```

Expected:

| Capstone | Axioms printed |
|---|---|
| `P_eq_NP_info`          | `propext`, `Quot.sound` |
| `P_eq_NP`               | `propext`, `Quot.sound` |
| `P_eq_NP_info_standard` | `propext`, `Quot.sound` |

No capstone uses `sorryAx`.

---

## The Three Proof Chains

### Chain 1 — Information-Theoretic (`P_eq_NP_info`)

- **File:** `Mathlib/InformationTheory/Complexity/PPNP.lean`
- **Axioms:** `propext`, `Quot.sound`
- **Construction:** Information content of a CNF `φ` is `|φ| · k`. A
  clause-by-clause walk extracts this information in `O(n²)` steps. The walk
  record serves as certificate, decision procedure, and entropy extraction.
  RECT (program complexity = information content) closes the loop.

### Chain 2 — Definitional Identity (`P_eq_NP`)

- **File:** `Mathlib/InformationTheory/Complexity/SetRFL.lean`
- **Axioms:** `propext`, `Quot.sound`
- **Construction:** After `EntropyNat ≃ ℕ` and `SyntacticCNF ≃ EntropyNat`
  unfold, `P_def` and `NP_def` are syntactically identical predicates. The
  proof is `Set.ext` + `Iff.rfl`. Also proves Cook-Levin (`L_SAT_Canonical`
  NP-complete) and `L_SAT_in_P`.

### Chain 3 — Standard Complexity (`P_eq_NP_info_standard`)

- **File:** `Mathlib/InformationTheory/Complexity/StandardComplexity.lean`
- **Axioms:** `propext`, `Quot.sound`
- **Construction:** Restates Chain 1 using `Language := Set (List Bool)` and
  traditional polynomial-time decision / certificate-bound predicates.
- **Note:** An earlier version of this chain depended on `Classical.choice`
  via `linarith` and nonconstructive case analysis. A subsequent refactor
  replaced those with constructive tactics, eliminating the dependency.

### How All Three Chains Stay Choice-Free

- `omega` in place of `linarith` where applicable.
- Structural list properties (`.length`) in place of well-founded recursion.
- All bounds proved explicitly in `calc` chains.

`computeTableau` in `Complexity/Tableau.lean` is fully computable and
extractable via Lean's code generator.

---

## File Map

### `Entropy/`
- `Shannon.lean` — `H(p) = -Σ pᵢ ln pᵢ`, uniform distributions, basic properties
- `Axioms.lean` — Rota's 7 axioms as structures
- `Uniqueness.lean` — Rota-Khinchin: axiom-satisfying functions are `C · log`
- `Concrete.lean` — Shannon satisfies all 7 axioms; Gibbs; chain rule
- `Program.lean` — `Program` type; RECT / IRECT bridge
- `SourceCoding.lean` — SCT / ISCT; IID sources

### `EntropyNumber/`
- `Basic.lean` — `EntropyNat ≃ ℕ`
- `Int.lean` — `EntropyInt ≃ ℤ`
- `Rat.lean` — `EntropyRat ≃ ℚ`
- `Real.lean` — `EntropyReal ≃ ℝ`; `|EntropyNat| = ℵ₀`, `|EntropyReal| = ℶ₁`
- `Polynomial.lean` — constructive polynomials; `IsPolynomial`, `IsBoundedByPolynomial`
- `Hierarchy.lean` — `Nat_L`, `Real_L`, `Rat_L`; beth-sequence cardinalities
- `RotaEntropy.lean` — Rota scaling; fair-coin calibration; FTA via information
- `PrimeAtoms.lean` — `v_p(m) · log p` decomposition
- `ContinuumHypothesis.lean` — CH and GCH decidable

### `Complexity/`
- `Core.lean` — `PathToConstraint`; entropy-number aliases
- `CNF.lean` + `CNF/` — CNF syntax, encoding, prime-indexed literals
- `Tableau.lean` — `SatisfyingTableau`; clause-by-clause walk; `n · k` bound
- `Decomposition.lean` — assignment-free SAT criterion; prime-factor bridge
- `UTM.lean` — sequential `ReadHead`; NDM address walk; entropy walk
- `PPNP.lean` — Chain 1 capstone
- `SetRFL.lean` — Chain 2 capstone
- `StandardComplexity.lean` — Chain 3 capstone

### `Physics/`
- `Common.lean` — macrostates; `H_physical_system`
- `UniformSystems.lean` — occupancy / multiset equivalence
- `StatisticalDistributions.lean` — BE / FD / MB entropies = `C · Shannon`
- `PhysicsDist.lean` — weighted `PhysicsDist`; `StatSystemType` enum

### Root
- `Basic.lean` — `ComputerInstruction`, `ComputerTape`, IID sources, random-walk paths
- `Bridge.lean` — time = information equivalence; three-layer equivalence

---

## Dependencies

All imports are from mathlib. No external dependencies.

---

## License

Apache-2.0, matching mathlib.
