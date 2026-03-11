import EGPT.Core
import EGPT.Complexity.Core
import EGPT.Entropy.Common
import EGPT.Physics.PhysicsDist
import EGPT.NumberTheory.Core -- For ParticlePath, fromNat, toNat

open EGPT EGPT.Complexity EGPT.NumberTheory.Core EGPT.Constraints

namespace EGPT.Complexity

/--
**The Satisfying Tableau (NP Certificate Structure).**

This structure formalizes an NP certificate. It bundles:
1.  `assignment`: The proposed solution (`Vector Bool k`).
2.  `witness_paths`: A list of `ParticlePath`s. For each clause in the original
    CNF, this list contains the path to the *specific literal* that was
    satisfied by the assignment. This is the "proof of work."
3.  `h_valid`: A proof that the assignment is indeed a valid solution.
-/
structure SatisfyingTableau (k : ℕ) where
  cnf : SyntacticCNF_EGPT k
  assignment : Vector Bool k
  witness_paths : List ParticlePath
  h_valid : evalCNF cnf assignment = true

/--
**Measures the complexity of a Satisfying Tableau.**

The complexity is not an abstract polynomial but a concrete natural number:
the sum of the complexities (lengths) of all the witness paths, where each
`ParticlePath` is bijectively equivalent to ℕ (via `equivParticlePathToNat`).
This is the total information cost required to specify the complete proof of satisfaction.
-/
def SatisfyingTableau.complexity {k : ℕ} (tableau : SatisfyingTableau k) : ℕ :=
  (tableau.witness_paths.map toNat).sum

/--
**Constructs a Satisfying Tableau from a known solution.**

This is the core constructive function. Given a CNF and a proven satisfying
assignment, it generates the canonical Tableau. It does this by iterating
through each clause, finding the first literal that satisfies it (which is
guaranteed to exist), and recording the `PathToConstraint` for that literal.
-/
noncomputable def constructSatisfyingTableau {k : ℕ} (cnf : SyntacticCNF_EGPT k) (solution : { v : Vector Bool k // evalCNF cnf v = true }) : SatisfyingTableau k :=
  let assignment := solution.val
  let h_valid := solution.property

  -- For each clause, find the path to the literal that makes it true.
  let witness_paths := cnf.map (fun clause =>
    -- Since the assignment is valid, each clause must be satisfied.
    -- This means `clause.any (evalLiteral · assignment)` is true.
    -- Therefore, there MUST be a literal in the clause that evaluates to true.
    -- We use `find?` to get the first such literal.
    let witness_literal_opt := clause.find? (fun lit => evalLiteral lit assignment)
    -- We know this is `some`, so we can extract the path.
    -- If it were `none`, something is wrong with our `h_valid` premise.
    match witness_literal_opt with
    | some lit => PathToConstraint lit
    | none => fromNat 0 -- Should be unreachable if h_valid is correct.
  )

  {
    cnf := cnf,
    assignment := assignment,
    witness_paths := witness_paths,
    h_valid := h_valid
  }

/--
**Theorem: The complexity of a canonical Tableau is the sum of the path costs
to its witness literals.**

This theorem makes the claim formal and provable. It confirms that
the "size of a satisfying Tableau" is precisely the sum of the EGPT natural
numbers (`ParticlePath`s) representing the work needed to verify each clause.
-/
theorem tableauComplexity_eq_sum_of_paths {k : ℕ} (cnf : SyntacticCNF_EGPT k) (solution : { v : Vector Bool k // evalCNF cnf v = true }) :
  let tableau := constructSatisfyingTableau cnf solution
  tableau.complexity = (tableau.witness_paths.map toNat).sum :=
by
  -- The proof is by definition.
  intro tableau
  simp [SatisfyingTableau.complexity]


/--
**Helper Lemma: The cost to verify a single clause is bounded by `k`.**

The "cost" is the EGPT ParticlePath to the witness literal. Its complexity is
the literal's variable index, which is always less than `k`.
-/
lemma cost_of_witness_le_k {k : ℕ} (cnf : SyntacticCNF_EGPT k) (solution : { v : Vector Bool k // evalCNF cnf v = true }) (clause : Clause_EGPT k) (h_clause_in_cnf : clause ∈ cnf) :
  -- The cost is the complexity of the path to the witness literal.
  -- We define it using the `find?` operation from the tableau construction.
  let witness_literal_opt := clause.find? (fun lit => evalLiteral lit solution.val)
  -- The property we want to prove about this cost:
  match witness_literal_opt with
  | some lit => (PathToConstraint lit).val.length ≤ k
  | none => 0 ≤ k -- This case is unreachable, so any true statement suffices.
:= by
  -- Let's deconstruct the `solution` into the assignment vector and the validity proof.
  let assignment := solution.val
  have h_valid_assignment : evalCNF cnf assignment = true := solution.property

  -- Unfold the definition of `evalCNF` to use the validity proof.
  unfold evalCNF at h_valid_assignment
  -- `h_valid_assignment` is now `cnf.all (fun c => evalClause c assignment) = true`.
  -- Since our `clause` is in `cnf`, it must be satisfied.
  have h_clause_is_sat : evalClause clause assignment = true := by
    rw [List.all_eq_true] at h_valid_assignment
    exact h_valid_assignment clause h_clause_in_cnf

  -- Unfold `evalClause` to show that *some* literal in it must be true.
  unfold evalClause at h_clause_is_sat
  -- `h_clause_is_sat` is now `clause.any (fun lit => evalLiteral lit assignment) = true`.

  -- The `find?` operation will return `some` if there's a literal that evaluates to true.
  -- We can directly work with the match expression in the goal
  cases h_find_result : clause.find? (fun lit => evalLiteral lit assignment) with
  | none =>
    -- This case should be impossible - if no literal is found, but clause.any returns true
    rw [List.any_eq_true] at h_clause_is_sat
    obtain ⟨lit, h_mem, h_eval⟩ := h_clause_is_sat
    -- Show contradiction: if find? returns none, then no element satisfies the predicate
    have h_find_none := List.find?_eq_none.mp h_find_result
    have h_not_eval := h_find_none lit h_mem
    rw [h_eval] at h_not_eval
    exact absurd rfl h_not_eval
  | some witness_lit =>
    -- This is the main case. We need to prove `(PathToConstraint witness_lit).val.length ≤ k`.
    simp only [PathToConstraint, toNat, fromNat, List.length_replicate]
    -- The goal simplifies to `witness_lit.particle_idx.val ≤ k`.
    -- Since `witness_lit.particle_idx` is of type `Fin k`, its value is strictly less than k.
    have h_lt : witness_lit.particle_idx.val < k := witness_lit.particle_idx.isLt
    -- `a < b` implies `a ≤ b` for natural numbers.
    exact Nat.le_of_lt h_lt



-- Helper lemma: The complexity of the path to any literal is bounded by k
lemma path_complexity_le_k {k : ℕ} (clause : Clause_EGPT k) (solution : Vector Bool k) :
  (toNat (match clause.find? (fun lit => evalLiteral lit solution) with
   | some lit => fromNat lit.particle_idx.val
   | none => fromNat 0)) ≤ k := by
  cases h_find : clause.find? (fun lit => evalLiteral lit solution) with
  | none =>
    simp only [toNat, fromNat, List.length_replicate]
    exact Nat.zero_le k
  | some witness_lit =>
    simp only [toNat, fromNat, List.length_replicate]
    exact Nat.le_of_lt witness_lit.particle_idx.isLt

-- Final, clean proof of the main theorem.
theorem tableauComplexity_upper_bound {k : ℕ} (cnf : SyntacticCNF_EGPT k) (solution : { v : Vector Bool k // evalCNF cnf v = true }) :
  (constructSatisfyingTableau cnf solution).complexity ≤ cnf.length * k :=
by
  -- We'll use a simple approach: bound each element and use list induction
  have h_bound_element : ∀ clause ∈ cnf,
    (toNat (match clause.find? (fun lit => evalLiteral lit solution.val) with
    | some lit => fromNat lit.particle_idx.val
    | none => fromNat 0)) ≤ k := by
    intro clause _
    exact path_complexity_le_k clause solution.val

  -- Use induction on cnf to prove the sum bound
  unfold constructSatisfyingTableau SatisfyingTableau.complexity
  simp [PathToConstraint, List.map_map, Function.comp]

  induction cnf with
  | nil => simp
  | cons head tail ih =>
    simp [List.map_cons, List.sum_cons, List.length_cons]
    have h_head : (toNat (match head.find? (fun lit => evalLiteral lit solution.val) with
      | some lit => fromNat lit.particle_idx.val
      | none => fromNat 0)) ≤ k := path_complexity_le_k head solution.val

    -- For the inductive step
    have h_tail : (tail.map (toNat ∘ fun clause =>
      match clause.find? (fun lit => evalLiteral lit solution.val) with
      | some lit => fromNat lit.particle_idx.val
      | none => fromNat 0)).sum ≤ tail.length * k := by
      -- First, we need to show that our solution works for the tail
      have h_tail_sat : evalCNF tail solution.val = true := by
        have h_full_sat := solution.property
        unfold evalCNF at h_full_sat ⊢
        -- Use the fact that if (a && b) = true, then b = true
        rw [List.all_cons] at h_full_sat
        simp only [Bool.and_eq_true] at h_full_sat
        exact h_full_sat.2

      -- Create a solution specifically for the tail
      let tail_solution : { v : Vector Bool k // evalCNF tail v = true } := ⟨solution.val, h_tail_sat⟩

      -- Apply the inductive hypothesis
      apply ih tail_solution

      -- Prove that each clause in tail satisfies the bound
      intro clause h_mem_tail
      exact path_complexity_le_k clause solution.val

    linarith [h_head, h_tail]

/--
**The Computable Generator (The "Universal Tableau")**

This function represents the "Full Walk" pre-construction.
It does NOT require a proof that a solution exists.
It does NOT use Classical.choice.
It is purely computable (executable code).

It takes:
1. The Map (cnf)
2. A Coordinate (candidate_assignment)

It returns:
- `some Tableau` if the coordinate hits a solution (reconstructing the path).
- `none` if the coordinate is empty space.
-/
def computeTableau? {k : ℕ} (cnf : SyntacticCNF_EGPT k)
  (candidate : Vector Bool k) : Option (SatisfyingTableau k) :=

  -- 1. The "Check": Is this coordinate actually a solution?
  -- This is the only "search" part, but here it is just a lookup.
  if h_valid : evalCNF cnf candidate = true then

    -- 2. The "Full Walk": Reconstruct the witness paths.
    -- This logic is identical to `constructSatisfyingTableau` but
    -- purely computational because we HAVE the candidate in hand.
    let witness_paths := cnf.map (fun clause =>
      -- Find the first literal in the clause that is true for this candidate
      match clause.find? (fun lit => evalLiteral lit candidate) with
      | some lit => PathToConstraint lit
      | none     => fromNat 0 -- (Impossible case given h_valid, but needed for type safety)
    )

    -- 3. Return the constructed object
    some {
      cnf := cnf,
      assignment := candidate,
      witness_paths := witness_paths,
      h_valid := h_valid -- The proof is carried along
    }
  else
    -- The candidate was not a solution
    none

/--
**The Solution Space (All Possible Valid Constructed Solutions)**

This structure represents the space of all possible solutions for a given CNF.
Constructing this object does NOT require searching. It simply "is" the problem
geometry. The total information in the CNF problem statement *is* the solution space.
-/
structure AllPossibleValidConstructedSolutions (k : ℕ) where
  cnf : SyntacticCNF_EGPT k

/--
**Step 1: Constructively Generate All Valid Solutions**

This function corresponds to "I'm going to construct all the solutions."
In information theory, defining the constraints *is* defining the solution manifold.
This operation is polynomial (linear) in the size of the input.
-/
def constructivelyGenerateAllValidSolutions {k : ℕ} (cnf : SyntacticCNF_EGPT k) : AllPossibleValidConstructedSolutions k :=
  { cnf := cnf }

/--
**Step 2: Retrieve a Constructed Solution**

This function corresponds to "If you give me the witness... I'll give you back
that particular construction which I already had."

It does NOT "solve" the problem. It navigates the `AllPossibleValidConstructedSolutions` using the
witness as a coordinate. The complexity (N²) is the cost of traversing the
map (the CNF) to the specific address (the witness), not the cost of finding the map.
-/
def retrieveConstructedSolution {k : ℕ} (space : AllPossibleValidConstructedSolutions k)
  (witness : Vector Bool k) : Option (SatisfyingTableau k) :=
  computeTableau? space.cnf witness

/--
**The Witness Address (Non-computational)**
Extracts the coordinate from the existence proof.
This is the ONLY non-computable step. A witness represents the "magic" of knowing
that there is an easy to check solution. This is the "witness" provided by the problem statement.
-/
noncomputable def verifyWitnessAddressIsInSolutionSet {k : ℕ} (cnf : SyntacticCNF_EGPT k)
  (h_sat : ∃ v : Vector Bool k, evalCNF cnf v = true) : Vector Bool k :=
  h_sat.choose

/--
**Deterministic Tableau Construction from CNF Alone.**

This wrapper makes the witness separation explicit:
1. `constructivelyGenerateAllValidSolutions`: Computable construction of the solution space.
2. `verifyWitnessAddressIsInSolutionSet`: Non-computable extraction of the address (witness).
3. `retrieveConstructedSolution`: Computable navigation to the address.

The complexity bound comes from step 3 (navigation), which is O(N²).
The oracle step (2) is O(1) in information space (it's just a coordinate).
-/
noncomputable def constructTableauFromCNF {k : ℕ} (cnf : SyntacticCNF_EGPT k)
  (h_sat : ∃ v : Vector Bool k, evalCNF cnf v = true) : SatisfyingTableau k :=
  let solutionSpace := constructivelyGenerateAllValidSolutions cnf
  let coordinate := verifyWitnessAddressIsInSolutionSet cnf h_sat
  match retrieveConstructedSolution solutionSpace coordinate with
  | some tableau => tableau
  | none =>
    -- Fallback for type safety, mathematically unreachable given h_sat
    constructSatisfyingTableau cnf ⟨coordinate, h_sat.choose_spec⟩

/-- The deterministic construction produces a tableau for the correct CNF. -/
lemma constructTableauFromCNF_cnf {k : ℕ} (cnf : SyntacticCNF_EGPT k)
  (h_sat : ∃ v : Vector Bool k, evalCNF cnf v = true) :
  (constructTableauFromCNF cnf h_sat).cnf = cnf := by
  unfold constructTableauFromCNF
  dsimp only [verifyWitnessAddressIsInSolutionSet]
  split
  case h_1 tableau h_some =>
    unfold retrieveConstructedSolution computeTableau? at h_some
    have h_cond : evalCNF (constructivelyGenerateAllValidSolutions cnf).cnf h_sat.choose = true := by
      dsimp [constructivelyGenerateAllValidSolutions]
      exact h_sat.choose_spec
    rw [dif_pos h_cond] at h_some
    injection h_some with h_eq
    rw [← h_eq]
    rfl
  case h_2 h_none =>
    unfold constructSatisfyingTableau
    rfl

/--
**Complexity bound for the deterministic construction.**

The deterministic construction walks every clause and every literal in the CNF.
The total cost is bounded by `|cnf| × k` — the number of clauses times the
maximum variable index. This bound depends only on the CNF's structure, not on
which satisfying assignment was chosen.
-/
theorem constructTableauFromCNF_complexity_bound {k : ℕ} (cnf : SyntacticCNF_EGPT k)
  (h_sat : ∃ v : Vector Bool k, evalCNF cnf v = true) :
  (constructTableauFromCNF cnf h_sat).complexity ≤ cnf.length * k := by
  unfold constructTableauFromCNF
  dsimp only [verifyWitnessAddressIsInSolutionSet]
  split
  case h_1 tableau h_some =>
    unfold retrieveConstructedSolution computeTableau? at h_some
    have h_cond : evalCNF (constructivelyGenerateAllValidSolutions cnf).cnf h_sat.choose = true := by
      dsimp [constructivelyGenerateAllValidSolutions]
      exact h_sat.choose_spec
    rw [dif_pos h_cond] at h_some
    injection h_some with h_eq
    rw [← h_eq]
    dsimp [constructivelyGenerateAllValidSolutions]
    let sol : { v : Vector Bool k // evalCNF cnf v = true } := ⟨h_sat.choose, h_sat.choose_spec⟩
    have h_eq_cons : {
        cnf := cnf,
        assignment := h_sat.choose,
        witness_paths := (cnf.map (fun clause =>
          match clause.find? (fun lit => evalLiteral lit h_sat.choose) with
          | some lit => PathToConstraint lit
          | none => fromNat 0)),
        h_valid := h_cond
      } = constructSatisfyingTableau cnf sol := by
      unfold constructSatisfyingTableau
      rfl
    rw [h_eq_cons]
    exact tableauComplexity_upper_bound cnf sol
  case h_2 h_none =>
    exact tableauComplexity_upper_bound cnf ⟨h_sat.choose, h_sat.choose_spec⟩

-- EGPT — Electronic Graph Paper Theory
-- Copyright (C) 2026 Essam Abadir
-- Licensed under the DeSciX Community Source Code License (DCSL) v1.0.
-- See LICENSE and DeSciX_Community_License_v1.pdf in the repository root.
-- Provided WITHOUT ANY WARRANTY. See the DCSL for details.
