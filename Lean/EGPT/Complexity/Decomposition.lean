import EGPT.Constraints
import EGPT.Complexity.Core
import EGPT.Complexity.PPNP
import EGPT.NumberTheory.Core

namespace EGPT.Complexity

open EGPT.Constraints EGPT.NumberTheory.Core

/-!
# Constructive Decomposition

This module isolates an assignment-free SAT criterion for experimentation,
without changing the load-bearing proof chain in `PPNP.lean`. It is aligned to
the explicit CNF-derived semantic layer `PPNP.AllSatisfyingAssignments`.

The criterion is grounded in a 2D walk view:
- Clause rows must all be covered by selected gates (literals).
- Global polarity must remain consistent (`x_i` and `¬x_i` cannot both be selected).
-/

/--
A decomposition record for a CNF.
`factors` are atom codes derived from all clause literals.
-/
structure ConstructiveDecomposition (k : ℕ) where
  cnf : SyntacticCNF_EGPT k
  factors : List EGPTPrime

/--
The concrete walk-cost model used in this experimental file:
walk each clause row against all `k` variable columns.
-/
def ConstructiveDecomposition.complexity {k : ℕ} (d : ConstructiveDecomposition k) : ℕ :=
  d.cnf.length * k

/--
Decompose a CNF by collecting all literal atom codes.
This function takes only the CNF (no assignment input).
-/
def decomposeCNF {k : ℕ} (cnf : SyntacticCNF_EGPT k) : ConstructiveDecomposition k :=
  let factors := (cnf.flatten.map LiteralToPrime)
  { cnf := cnf, factors := factors }

/--
Literal negation at the same variable address.
-/
def negateLiteral {k : ℕ} (l : Literal_EGPT k) : Literal_EGPT k :=
  { l with polarity := !l.polarity }

/--
A witness function for gate-selection decisions.
`true` means "selected in the walk".
-/
abbrev WalkWitness (k : ℕ) := Literal_EGPT k → Bool

/-- A clause is covered if one of its literals is selected. -/
def ClauseCoveredBy {k : ℕ} (w : WalkWitness k) (clause : Clause_EGPT k) : Prop :=
  ∃ lit, lit ∈ clause ∧ w lit = true

/-- Every clause row is covered by the selected gates. -/
def CoversAllClauses {k : ℕ} (cnf : SyntacticCNF_EGPT k) (w : WalkWitness k) : Prop :=
  ∀ clause ∈ cnf, ClauseCoveredBy w clause

/-- Global polarity consistency: never select both `xᵢ` and `¬xᵢ`. -/
def PolarityConsistent {k : ℕ} (w : WalkWitness k) : Prop :=
  ∀ lit, w lit = true → w (negateLiteral lit) = false

/--
Assignment-free SAT criterion:
there exists a clause-covering, polarity-consistent walk witness.
-/
def AssignmentFreeSAT {k : ℕ} (cnf : SyntacticCNF_EGPT k) : Prop :=
  ∃ w : WalkWitness k, CoversAllClauses cnf w ∧ PolarityConsistent w

/-- Build a concrete assignment from a walk witness. -/
def assignmentFromWitness {k : ℕ} (w : WalkWitness k) : Vector Bool k :=
  Vector.ofFn (fun i => w { particle_idx := i, polarity := true })

/--
If a literal is selected by a polarity-consistent witness, it evaluates to `true`
under the assignment induced by that witness.
-/
lemma witness_true_implies_eval_true {k : ℕ}
    (w : WalkWitness k) (h_cons : PolarityConsistent w)
    (lit : Literal_EGPT k) (h_w : w lit = true) :
    evalLiteral lit (assignmentFromWitness w) = true := by
  cases lit with
  | mk idx pol =>
    cases h_pol : pol
    · -- negative literal selected
      have h_neg : w { particle_idx := idx, polarity := true } = false := by
        simpa [negateLiteral, h_pol] using
          (h_cons { particle_idx := idx, polarity := false } (by simpa [h_pol] using h_w))
      have h_get : (assignmentFromWitness w).get idx = w { particle_idx := idx, polarity := true } := by
        simp [assignmentFromWitness, Vector.get]
      simp [evalLiteral, h_pol, h_get, h_neg]
    · -- positive literal selected
      have h_pos : w { particle_idx := idx, polarity := true } = true := by
        simpa [h_pol] using h_w
      have h_get : (assignmentFromWitness w).get idx = w { particle_idx := idx, polarity := true } := by
        simp [assignmentFromWitness, Vector.get]
      simp [evalLiteral, h_pol, h_get, h_pos]

/--
Soundness: any assignment-free witness yields a satisfying assignment.
-/
theorem assignmentFree_sound {k : ℕ} (cnf : SyntacticCNF_EGPT k) :
    AssignmentFreeSAT cnf → ∃ assignment : Vector Bool k, evalCNF cnf assignment = true := by
  intro h_sat
  rcases h_sat with ⟨w, h_cover, h_cons⟩
  refine ⟨assignmentFromWitness w, ?_⟩
  unfold evalCNF
  rw [List.all_eq_true]
  intro clause h_clause_mem
  rcases h_cover clause h_clause_mem with ⟨lit, h_lit_mem, h_lit_selected⟩
  unfold evalClause
  rw [List.any_eq_true]
  refine ⟨lit, h_lit_mem, ?_⟩
  exact witness_true_implies_eval_true w h_cons lit h_lit_selected

/-- The canonical witness extracted from a concrete assignment. -/
def witnessFromAssignment {k : ℕ} (assignment : Vector Bool k) : WalkWitness k :=
  fun lit => evalLiteral lit assignment

/-- Coverage of every clause by the witness induced from a satisfying assignment. -/
lemma witnessFromAssignment_covers {k : ℕ}
    (cnf : SyntacticCNF_EGPT k) (assignment : Vector Bool k)
    (h_sat : evalCNF cnf assignment = true) :
    CoversAllClauses cnf (witnessFromAssignment assignment) := by
  intro clause h_clause_mem
  have h_clause_true : evalClause clause assignment = true := by
    unfold evalCNF at h_sat
    rw [List.all_eq_true] at h_sat
    exact h_sat clause h_clause_mem
  unfold evalClause at h_clause_true
  rw [List.any_eq_true] at h_clause_true
  rcases h_clause_true with ⟨lit, h_lit_mem, h_lit_true⟩
  refine ⟨lit, h_lit_mem, ?_⟩
  simpa [witnessFromAssignment] using h_lit_true

/-- Polarity consistency of the witness induced from any assignment. -/
lemma witnessFromAssignment_consistent {k : ℕ} (assignment : Vector Bool k) :
    PolarityConsistent (witnessFromAssignment assignment) := by
  intro lit h_lit_true
  cases h_val : assignment.get lit.particle_idx <;>
    cases h_pol : lit.polarity <;>
    simp [witnessFromAssignment, evalLiteral, negateLiteral, h_val, h_pol] at h_lit_true ⊢

/--
Completeness: a satisfying assignment induces an assignment-free witness.
-/
theorem assignmentFree_complete {k : ℕ} (cnf : SyntacticCNF_EGPT k) :
    (∃ assignment : Vector Bool k, evalCNF cnf assignment = true) → AssignmentFreeSAT cnf := by
  rintro ⟨assignment, h_sat⟩
  refine ⟨witnessFromAssignment assignment, ?_, ?_⟩
  · exact witnessFromAssignment_covers cnf assignment h_sat
  · exact witnessFromAssignment_consistent assignment

/-- SAT is equivalent to the assignment-free clause-coverage + polarity criterion. -/
theorem assignmentFree_iff_sat {k : ℕ} (cnf : SyntacticCNF_EGPT k) :
    AssignmentFreeSAT cnf ↔ ∃ assignment : Vector Bool k, evalCNF cnf assignment = true := by
  constructor
  · exact assignmentFree_sound cnf
  · exact assignmentFree_complete cnf

/--
Alignment theorem to the explicit semantic layer:
assignment-free criterion is equivalent to nonempty CNF-derived satisfying set.
-/
theorem assignmentFree_iff_nonempty_allSatisfyingAssignments {k : ℕ} (cnf : SyntacticCNF_EGPT k) :
    AssignmentFreeSAT cnf ↔ (PPNP.AllSatisfyingAssignments cnf).Nonempty := by
  simpa [PPNP.AllSatisfyingAssignments] using (assignmentFree_iff_sat (cnf := cnf))

/--
Native polynomial used for the walk bound: `n²`.
-/
def decomposition_poly : EGPT_Polynomial :=
  EGPT_Polynomial.mul EGPT_Polynomial.id EGPT_Polynomial.id

@[simp] lemma eval_decomposition_poly (n : ℕ) :
    toNat ((decomposition_poly).eval (fromNat n)) = n * n := by
  simp [decomposition_poly, EGPT_Polynomial.eval, toNat_mul_ParticlePath, left_inv]

/-- Polynomial bound of the decomposition walk complexity by encoded input size. -/
theorem decomposition_is_poly_bounded {k : ℕ} (cnf : SyntacticCNF_EGPT k) :
    (decomposeCNF cnf).complexity ≤ toNat (decomposition_poly.eval (fromNat (encodeCNF cnf).length)) := by
  calc
    (decomposeCNF cnf).complexity
        = cnf.length * k := by simp [decomposeCNF, ConstructiveDecomposition.complexity]
    _ ≤ (encodeCNF cnf).length * (encodeCNF cnf).length := by
      apply Nat.mul_le_mul
      · exact cnf_length_le_encoded_length cnf
      · exact encodeCNF_size_ge_k k cnf
    _ = toNat (decomposition_poly.eval (fromNat (encodeCNF cnf).length)) := by
      rw [eval_decomposition_poly]

/-!
### SAT-Compatible Common-Factor Predicate (Prime-Indexed)

This section defines an arithmetic SAT criterion where each literal is mapped to
a prime-indexed atom (`literalAtom`), assignments are encoded as products of the
selected literal atoms, and clause/CNF satisfaction is characterized by shared
prime factors.
-/

/-- The literal selected by assignment `a` at variable index `i`. -/
def chosenLiteral {k : ℕ} (a : Vector Bool k) (i : Fin k) : Literal_EGPT k :=
  { particle_idx := i, polarity := a.get i }

/--
Prime-indexed assignment composite:
product of one selected literal atom per variable index.
-/
noncomputable def assignmentCompositePrime {k : ℕ} (a : Vector Bool k) : ℕ :=
  ((Finset.univ : Finset (Fin k)).toList.map (fun i => literalAtom (chosenLiteral a i))).prod

/-- A literal shares a factor with assignment composite iff its atom divides it. -/
def literalSharesFactor {k : ℕ} (a : Vector Bool k) (lit : Literal_EGPT k) : Prop :=
  literalAtom lit ∣ assignmentCompositePrime a

/-- A clause shares a factor with assignment composite if some member literal does. -/
def clauseSharesFactor {k : ℕ} (a : Vector Bool k) (clause : Clause_EGPT k) : Prop :=
  ∃ lit, lit ∈ clause ∧ literalSharesFactor a lit

/-- A CNF shares factors with assignment composite when all clauses do. -/
def cnfSharesFactor {k : ℕ} (a : Vector Bool k) (cnf : SyntacticCNF_EGPT k) : Prop :=
  ∀ clause ∈ cnf, clauseSharesFactor a clause

/-- CNF-level common-factor satisfiability (assignment-free existential form). -/
def CNFSharesFactor {k : ℕ} (cnf : SyntacticCNF_EGPT k) : Prop :=
  ∃ a : Vector Bool k, cnfSharesFactor a cnf

/-- Any assignment-selected literal evaluates to `true` by definition. -/
lemma evalLiteral_chosenLiteral_true {k : ℕ} (a : Vector Bool k) (i : Fin k) :
    evalLiteral (chosenLiteral a i) a = true := by
  cases hval : a.get i <;> simp [chosenLiteral, evalLiteral, hval]

/-- `evalLiteral` in equality form: literal polarity must match assignment bit. -/
lemma evalLiteral_eq_true_iff_polarity_eq {k : ℕ} (lit : Literal_EGPT k) (a : Vector Bool k) :
    evalLiteral lit a = true ↔ lit.polarity = a.get lit.particle_idx := by
  cases hval : a.get lit.particle_idx <;> cases hpol : lit.polarity <;>
    simp [evalLiteral, hval, hpol]

/--
Literal-level SAT/common-factor equivalence:
`evalLiteral = true` iff literal atom divides assignment composite.
-/
lemma evalLiteral_true_iff_literalSharesFactor {k : ℕ} (a : Vector Bool k) (lit : Literal_EGPT k) :
    evalLiteral lit a = true ↔ literalSharesFactor a lit := by
  constructor
  · intro h_eval
    have h_pol : lit.polarity = a.get lit.particle_idx :=
      (evalLiteral_eq_true_iff_polarity_eq lit a).1 h_eval
    have h_lit_eq : lit = chosenLiteral a lit.particle_idx := by
      cases lit with
      | mk idx pol =>
          simp [chosenLiteral] at h_pol ⊢
          cases h_pol
          rfl
    have h_mem : lit.particle_idx ∈ (Finset.univ : Finset (Fin k)) := Finset.mem_univ _
    have h_mem_list :
        literalAtom (chosenLiteral a lit.particle_idx) ∈
          (Finset.univ : Finset (Fin k)).toList.map (fun i => literalAtom (chosenLiteral a i)) := by
      rw [List.mem_map]
      exact ⟨lit.particle_idx, Finset.mem_toList.mpr h_mem, rfl⟩
    have h_dvd_selected :
        literalAtom (chosenLiteral a lit.particle_idx) ∣
          ((Finset.univ : Finset (Fin k)).toList.map (fun i => literalAtom (chosenLiteral a i))).prod := by
      exact List.dvd_prod h_mem_list
    unfold literalSharesFactor assignmentCompositePrime
    rw [h_lit_eq]
    exact h_dvd_selected
  · intro h_dvd
    have h_prime_nat : Nat.Prime (literalAtom lit) := literalAtom_prime lit
    have h_prime : Prime (literalAtom lit) := Nat.prime_iff.mp h_prime_nat
    have h_dvd_prod :
        literalAtom lit ∣ ((Finset.univ : Finset (Fin k)).toList.map (fun i => literalAtom (chosenLiteral a i))).prod := by
      simpa [literalSharesFactor, assignmentCompositePrime] using h_dvd
    rcases (Prime.dvd_prod_iff h_prime).1 h_dvd_prod with ⟨atom, h_atom_mem, h_dvd_i⟩
    rw [List.mem_map] at h_atom_mem
    rcases h_atom_mem with ⟨i, hi_mem, h_atom_eq⟩
    have _ : i ∈ (Finset.univ : Finset (Fin k)) := Finset.mem_toList.mp hi_mem
    have h_prime_i : Nat.Prime (literalAtom (chosenLiteral a i)) := literalAtom_prime (chosenLiteral a i)
    have h_dvd_i' : literalAtom lit ∣ literalAtom (chosenLiteral a i) := by
      simpa [h_atom_eq] using h_dvd_i
    have h_atom_eq_rev : literalAtom (chosenLiteral a i) = literalAtom lit := by
      exact (Nat.Prime.dvd_iff_eq h_prime_i h_prime_nat.ne_one).1 h_dvd_i'
    have h_lit_eq : lit = chosenLiteral a i := by
      exact literalAtom_injective h_atom_eq_rev.symm
    simpa [h_lit_eq] using evalLiteral_chosenLiteral_true a i

/--
Clause-level SAT/common-factor equivalence:
`evalClause = true` iff clause shares a factor with assignment composite.
-/
lemma evalClause_true_iff_clauseSharesFactor {k : ℕ} (a : Vector Bool k) (clause : Clause_EGPT k) :
    evalClause clause a = true ↔ clauseSharesFactor a clause := by
  constructor
  · intro h_clause
    unfold evalClause at h_clause
    rw [List.any_eq_true] at h_clause
    rcases h_clause with ⟨lit, h_mem, h_eval_lit⟩
    exact ⟨lit, h_mem, (evalLiteral_true_iff_literalSharesFactor a lit).1 h_eval_lit⟩
  · rintro ⟨lit, h_mem, h_share⟩
    unfold evalClause
    rw [List.any_eq_true]
    exact ⟨lit, h_mem, (evalLiteral_true_iff_literalSharesFactor a lit).2 h_share⟩

/--
CNF-level SAT/common-factor equivalence:
`evalCNF = true` iff every clause shares a factor with assignment composite.
-/
theorem evalCNF_true_iff_cnfSharesFactor {k : ℕ} (a : Vector Bool k) (cnf : SyntacticCNF_EGPT k) :
    evalCNF cnf a = true ↔ cnfSharesFactor a cnf := by
  constructor
  · intro h_cnf
    intro clause h_clause_mem
    have h_all : ∀ c ∈ cnf, evalClause c a = true := by
      simpa [evalCNF, List.all_eq_true] using h_cnf
    exact (evalClause_true_iff_clauseSharesFactor a clause).1 (h_all clause h_clause_mem)
  · intro h_share
    rw [evalCNF, List.all_eq_true]
    intro clause h_clause_mem
    exact (evalClause_true_iff_clauseSharesFactor a clause).2 (h_share clause h_clause_mem)

/--
Bridge theorem: CNF common-factor satisfiability is equivalent to nonempty
`AllSatisfyingAssignments`.
-/
theorem cnfSharesFactor_iff_nonempty_allSatisfyingAssignments {k : ℕ} (cnf : SyntacticCNF_EGPT k) :
    CNFSharesFactor cnf ↔ (PPNP.AllSatisfyingAssignments cnf).Nonempty := by
  constructor
  · rintro ⟨a, h_share⟩
    exact ⟨a, (evalCNF_true_iff_cnfSharesFactor a cnf).2 h_share⟩
  · rintro ⟨a, h_eval⟩
    exact ⟨a, (evalCNF_true_iff_cnfSharesFactor a cnf).1 h_eval⟩

/-- Constructor-facing bridge: common-factor success yields a satisfying assignment. -/
theorem exists_assignment_of_cnfSharesFactor {k : ℕ} (cnf : SyntacticCNF_EGPT k) :
    CNFSharesFactor cnf → ∃ assignment : Vector Bool k, evalCNF cnf assignment = true := by
  intro h
  rcases (cnfSharesFactor_iff_nonempty_allSatisfyingAssignments (cnf := cnf)).1 h with ⟨a, ha⟩
  exact ⟨a, ha⟩

/-- Constructor-facing bridge: satisfying assignment yields common-factor success. -/
theorem cnfSharesFactor_of_exists_assignment {k : ℕ} (cnf : SyntacticCNF_EGPT k) :
    (∃ assignment : Vector Bool k, evalCNF cnf assignment = true) → CNFSharesFactor cnf := by
  rintro ⟨a, ha⟩
  exact (cnfSharesFactor_iff_nonempty_allSatisfyingAssignments (cnf := cnf)).2 ⟨a, ha⟩

/-!
### Representative Lean Validation Cases
-/

private def lit0Pos : Literal_EGPT 1 :=
  { particle_idx := ⟨0, by decide⟩, polarity := true }

private def lit0Neg : Literal_EGPT 1 :=
  { particle_idx := ⟨0, by decide⟩, polarity := false }

private def satUnitCNF : SyntacticCNF_EGPT 1 := [[lit0Pos]]
private def unsatUnitCNF : SyntacticCNF_EGPT 1 := [[lit0Pos], [lit0Neg]]

private def aTrue1 : Vector Bool 1 := ⟨#[true], by decide⟩
private def aFalse1 : Vector Bool 1 := ⟨#[false], by decide⟩

private lemma aTrue1_get0 : aTrue1.get 0 = true := by
  rfl

private lemma aFalse1_get0 : aFalse1.get 0 = false := by
  rfl

example : evalCNF satUnitCNF aTrue1 = true := by
  simp [satUnitCNF, lit0Pos, evalCNF, evalClause, evalLiteral, aTrue1_get0]

example : cnfSharesFactor aTrue1 satUnitCNF := by
  exact (evalCNF_true_iff_cnfSharesFactor aTrue1 satUnitCNF).1 (by
    simp [satUnitCNF, lit0Pos, evalCNF, evalClause, evalLiteral, aTrue1_get0])

example : evalCNF satUnitCNF aFalse1 = false := by
  simp [satUnitCNF, lit0Pos, evalCNF, evalClause, evalLiteral, aFalse1_get0]

example : ¬ CNFSharesFactor unsatUnitCNF := by
  intro h
  rcases exists_assignment_of_cnfSharesFactor (cnf := unsatUnitCNF) h with ⟨a, h_eval⟩
  have h_cases : a.get ⟨0, by decide⟩ = true ∨ a.get ⟨0, by decide⟩ = false := by
    cases hbit : a.get ⟨0, by decide⟩ <;> simp [hbit]
  cases h_cases with
  | inl h_true =>
      have : evalCNF unsatUnitCNF a = false := by
        simp [unsatUnitCNF, lit0Pos, lit0Neg, evalCNF, evalClause, evalLiteral, h_true]
      rw [this] at h_eval
      contradiction
  | inr h_false =>
      have : evalCNF unsatUnitCNF a = false := by
        simp [unsatUnitCNF, lit0Pos, lit0Neg, evalCNF, evalClause, evalLiteral, h_false]
      rw [this] at h_eval
      contradiction

end EGPT.Complexity
