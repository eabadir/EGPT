# Experimental Skeptic Audit (Deterministic Breadth Chain)

> **Status: Partially superseded (2026-03-13).** The files `PPNPExperimental.lean` and `Physics.lean` referenced below no longer exist as separate files. Their declarations were absorbed into `UTM.lean` during debate Exchanges 18-21. The deterministic breadth construction and experimental complexity classes (`P_exp`, `NP_exp`) are now non-chain experimental code within `UTM.lean`. The audit findings below remain historically accurate but file paths need mental translation: `PPNPExperimental.lean` → `UTM.lean`, `Physics.lean` → removed (physics motivation is in `Lean/EGPT/Physics/`).

## Findings (Complexity-Theorist Lens)

### High Severity

- **Experimental class definitions are intentionally identical (`P_exp`, `NP_exp`) by construction.**
  - Location: `Lean/EGPT/Complexity/PPNPExperimental.lean`
  - Risk: A skeptic will treat terminal closure (`P_exp_eq_NP_exp`) as non-probative unless upstream constructor equivalences and bounds are independently persuasive.
  - Status: expected by design; mitigated only by strengthening upstream theorems.

- **Deterministic breadth constructor still explores assignment-state space via `Finset (Vector Bool k)`.**
  - Location: `Lean/EGPT/Complexity/Physics.lean` (`deterministicBreadthRun`, `breadthRunFrom`)
  - Risk: Skeptics may classify this as filtered enumeration unless further structure is proved to avoid effective brute-force in worst case.
  - Status: open; requires stronger non-enumerative complexity argument.

### Medium Severity

- **Constructor cost bound currently formalized as clause/variable sweep (`cnf.length * k`).**
  - Location: `Physics.deterministicBreadthCost`, `Physics.deterministicBreadth_cost_le_nSquared`
  - Risk: This bound is a structural upper bound; skeptics will ask for transition-count realism and representation-level cost accounting.
  - Status: partially addressed (formal bound exists, realism argument incomplete).

- **Bridge to semantic SAT is nonemptiness-level, not yet uniqueness or canonical-path-level.**
  - Location: `deterministicBreadthRun_nonempty_iff_allSatisfyingAssignments_nonempty`
  - Risk: Nonemptiness equivalence is strong for decision form, but does not yet characterize path optimality or distributional guarantees.
  - Status: acceptable for decision-language objectives; open for stronger claims.

### Low Severity

- **Proof-chain isolation remains preserved.**
  - Experimental additions are parallel and do not modify load-bearing `PPNP.lean`.
  - Status: resolved.

## Theorem-Backed Resolutions

- CNF-only deterministic constructor exists:
  - `initBreadthState`, `breadthRunFrom`, `deterministicBreadthRun`
- Prefix and terminal survivor semantics:
  - `mem_breadthRunFrom_iff`
  - `mem_deterministicBreadthRun_iff_evalCNF`
- Semantic bridge:
  - `deterministicBreadthRun_nonempty_iff_allSatisfyingAssignments_nonempty`
- Common-factor bridge:
  - `deterministicBreadthRun_nonempty_iff_CNFSharesFactor`
- Polynomial structural bound:
  - `deterministicBreadth_cost_le_nSquared`
- Experimental class-layer closure:
  - `L_SAT_Breadth_in_NP_exp`, `L_SAT_Breadth_in_P_exp`, `P_exp_eq_NP_exp`

## Open Proof Obligations Before Load-Bearing Consideration

1. **Non-enumerative complexity witness:** prove the breadth constructor is not merely exhaustive filtering in disguise, or state precise constraints where it is.
2. **Cost model refinement:** tie transition operations and ordering mechanics to a machine-level polynomial bound beyond structural counting.
3. **Constructor completeness under stronger operational semantics:** if a stricter deterministic process is introduced, re-prove exact equivalence with `AllSatisfyingAssignments`.
4. **Skeptic-facing minimal assumptions table:** enumerate all assumptions not present as Lean theorems.

## Suggested Next Verification Checklist

- Build:
  - `cd Lean && lake build EGPT.Complexity.Decomposition`
  - `cd Lean && lake build EGPT.Complexity.Physics`
  - `cd Lean && lake build EGPT.Complexity.PPNPExperimental`
  - `cd Lean && lake build`
- Confirm load-bearing chain unchanged:
  - `EGPT/Core.lean`
  - `EGPT/NumberTheory/Core.lean`
  - `EGPT/Constraints.lean`
  - `EGPT/Complexity/Core.lean`
  - `EGPT/Complexity/TableauFromCNF.lean`
  - `EGPT/Complexity/ComplexityInformationBridge.lean`
  - `EGPT/Complexity/Interpretation.lean`
  - `EGPT/Complexity/PPNP.lean`
