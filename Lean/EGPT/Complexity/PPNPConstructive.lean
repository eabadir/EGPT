import EGPT.Core
import EGPT.Complexity.Core
import EGPT.Complexity.PPNP
import EGPT.Complexity.Physics
import EGPT.NumberTheory.Core

open EGPT EGPT.Complexity EGPT.NumberTheory.Core EGPT.Constraints

namespace EGPT.Complexity.PPNPExperimental

/-!
# Experimental Parallel P=NP Chain (Deterministic Breadth Constructor)

This module is an experimental class layer parallel to `PPNP.lean`.
It keeps the load-bearing chain untouched while expressing SAT class predicates
using a CNF-only deterministic breadth construction from `Complexity/Physics.lean`.
-/

/-- Canonical SAT language recognized by deterministic breadth survivors. -/
def L_SAT_Breadth (k : ℕ) : Set (CanonicalCNF k) :=
  { ccnf | (EGPT.Complexity.Physics.ConstructedSolutionSet ccnf.val).Nonempty }

/--
Constructed-set verifier in canonical-input form.
This is the NP-side verifier primitive for the experimental chain.
-/
def verifyCanonical_viaConstructedSet {k : ℕ}
    (input_ccnf : CanonicalCNF k) (candidate : Vector Bool k) : Bool :=
  EGPT.Complexity.Physics.verify_via_constructedSet input_ccnf.val candidate

/-- Canonical verifier equivalence: constructed-set verifier iff semantic SAT check. -/
theorem verifyCanonical_viaConstructedSet_iff_evalCNF {k : ℕ}
    (input_ccnf : CanonicalCNF k) (candidate : Vector Bool k) :
    verifyCanonical_viaConstructedSet input_ccnf candidate = true ↔
      evalCNF input_ccnf.val candidate = true := by
  unfold verifyCanonical_viaConstructedSet
  exact EGPT.Complexity.Physics.verify_via_constructedSet_iff_evalCNF input_ccnf.val candidate

/--
Experimental NP class:
membership is characterized by deterministic breadth-constructor success with
the standard `n²` bound.
-/
def NP_exp : Set (Π k, Set (CanonicalCNF k)) :=
{ L | ∀ (k : ℕ) (input_ccnf : CanonicalCNF k),
        (input_ccnf ∈ L k) ↔
          (EGPT.Complexity.Physics.ConstructedSolutionSet input_ccnf.val).Nonempty ∧
          EGPT.Complexity.Physics.deterministicBreadthCost input_ccnf.val ≤
            toNat (PPNP.canonical_np_poly.eval (fromNat (encodeCNF input_ccnf.val).length))
}

/--
Experimental P class:
same constructor proposition as `NP_exp` in this parallel lane.
-/
def P_exp : Set (Π k, Set (CanonicalCNF k)) :=
{ L | ∀ (k : ℕ) (input_ccnf : CanonicalCNF k),
        (input_ccnf ∈ L k) ↔
          (EGPT.Complexity.Physics.ConstructedSolutionSet input_ccnf.val).Nonempty ∧
          EGPT.Complexity.Physics.deterministicBreadthCost input_ccnf.val ≤
            toNat (PPNP.canonical_np_poly.eval (fromNat (encodeCNF input_ccnf.val).length))
}

/-- Experimental breadth language aligns with semantic SAT nonemptiness. -/
theorem L_SAT_Breadth_iff_semantic_nonempty {k : ℕ} (input_ccnf : CanonicalCNF k) :
    input_ccnf ∈ L_SAT_Breadth k ↔ (PPNP.AllSatisfyingAssignments input_ccnf.val).Nonempty := by
  simpa [EGPT.Complexity.Physics.ConstructedSolutionSet] using
    (EGPT.Complexity.Physics.deterministicBreadthRun_nonempty_iff_allSatisfyingAssignments_nonempty input_ccnf.val)

/-- The canonical SAT language is in `NP_exp`. -/
theorem L_SAT_Breadth_in_NP_exp :
  (L_SAT_Breadth : Π k, Set (CanonicalCNF k)) ∈ NP_exp := by
  intro k input_ccnf
  constructor
  · intro h_mem
    exact ⟨h_mem, by
      calc
        EGPT.Complexity.Physics.deterministicBreadthCost input_ccnf.val
          ≤ EGPT.Complexity.Physics.CNFMagnitude input_ccnf.val * EGPT.Complexity.Physics.CNFMagnitude input_ccnf.val :=
            EGPT.Complexity.Physics.deterministicBreadth_cost_le_nSquared input_ccnf.val
        _ = toNat (PPNP.canonical_np_poly.eval (fromNat (encodeCNF input_ccnf.val).length)) := by
            simp [EGPT.Complexity.Physics.CNFMagnitude, PPNP.eval_canonical_np_poly]
    ⟩
  · intro h
    exact h.1

/-- The canonical SAT language is in `P_exp`. -/
theorem L_SAT_Breadth_in_P_exp :
  (L_SAT_Breadth : Π k, Set (CanonicalCNF k)) ∈ P_exp := by
  intro k input_ccnf
  constructor
  · intro h_mem
    exact ⟨h_mem, by
      calc
        EGPT.Complexity.Physics.deterministicBreadthCost input_ccnf.val
          ≤ EGPT.Complexity.Physics.CNFMagnitude input_ccnf.val * EGPT.Complexity.Physics.CNFMagnitude input_ccnf.val :=
            EGPT.Complexity.Physics.deterministicBreadth_cost_le_nSquared input_ccnf.val
        _ = toNat (PPNP.canonical_np_poly.eval (fromNat (encodeCNF input_ccnf.val).length)) := by
            simp [EGPT.Complexity.Physics.CNFMagnitude, PPNP.eval_canonical_np_poly]
    ⟩
  · intro h
    exact h.1

/-- Final experimental parallel class closure. -/
theorem P_exp_eq_NP_exp : P_exp = NP_exp := by
  apply Set.ext
  intro L
  unfold P_exp NP_exp
  exact Iff.rfl

end EGPT.Complexity.PPNPExperimental
