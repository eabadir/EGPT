-- mathlib imports (uncomment as required)
-- NOTE: Factorization-related mathlib imports disabled because the trimmed mathlib
-- bundled with this project does not include these files. Re-enable when available.
-- import Mathlib/Data/Nat/Factorization/Basic
-- import Mathlib/Data/Nat/Prime
-- import Mathlib/Data/Finset/LocallyFinite
import EGPT.NumberTheory.Filter
import EGPT.NumberTheory.Core -- For ParticlePath bijection with ℕ
import EGPT.Complexity.PPNP -- For the final, canonical NP-Completeness proofs
import EGPT.Physics.PhotonicCA -- For the_system_has_equivalent_program
import EGPT.Entropy.Common -- For rect_program_for_dist and ShannonEntropyOfDist
import EGPT.Entropy.RET -- For the RET entropy function
import EGPT.Entropy.H -- For the canonical entropy function
--import Mathlib.Data.Nat.Factorization.Basic
--import Mathlib.Data.Nat.Prime
--import Mathlib.Data.Finset.LocallyFinite
import Mathlib.Data.Nat.Choose.Sum

open EGPT.Complexity EGPT.Constraints EGPT.Physics.PCA EGPT.Entropy.Common EGPT.NumberTheory.Filter
  EGPT.Complexity.PPNP EGPT.NumberTheory.Core EGPT.Entropy.RET Real Finset EGPT.Entropy.H
  BigOperators

namespace EGPT.Information


-- ==================================================================
-- PHASE 3: The Externalized Proof of Equivalence (Transport Theorem)
-- ==================================================================

/--
**Theorem (Rota Properties Transport Over Scaling):** If a function `H` satisfies
the properties of an entropy function, then any positive constant multiple of `H`
also satisfies those properties.

This transport also allows us to change the base of the logarithm in the entropy function
without re-writing all the axiom proofs which were more easily
done in nats.
-/
theorem RET_All_Enropy_Is_Scaled_Shannon_Entropy (ef : EntropyFunction) (C : ℝ) (hC_pos : 0 < C) :
    HasRotaEntropyProperties (fun p => (C * (ef.H_func p : ℝ)).toNNReal) :=
  let C_nn : NNReal := C.toNNReal
  have hC_nn_pos : 0 < C_nn := by
    simp only [C_nn]
    exact Real.toNNReal_pos.mpr hC_pos
  {
    -- Each axiom proof for the scaled function follows from the original proof by distributing the constant C.
    symmetry := by
      intro α β _ _ p_target hp e
      -- Goal: (C * ↑(ef.H_func (fun x => p_target (e x)))).toNNReal = (C * ↑(ef.H_func p_target)).toNNReal
      congr 2
      simp only [NNReal.coe_inj]
      exact ef.props.symmetry p_target hp e
    ,
    zero_invariance := by
      intro n p_orig hp_sum_1
      -- Goal: (C * ↑(ef.H_func p_ext)).toNNReal = (C * ↑(ef.H_func p_orig)).toNNReal
      congr 2
      simp only [NNReal.coe_inj]
      exact ef.props.zero_invariance p_orig hp_sum_1
    ,
    normalized := by
      intro p hp_sum_1
      -- Goal: (C * ↑(ef.H_func p)).toNNReal = 0
      simp only [ef.props.normalized p hp_sum_1, NNReal.coe_zero, mul_zero, Real.toNNReal_zero]
    ,
    max_uniform := by
      intro α _ h_card_pos p hp_sum_1
      -- Goal: (C * ↑(ef.H_func p)).toNNReal ≤ (C * ↑(ef.H_func (uniformDist h_card_pos))).toNNReal
      -- This follows from the monotonicity of toNNReal and multiplication by positive constants
      apply Real.toNNReal_le_toNNReal
      apply mul_le_mul_of_nonneg_left
      · exact NNReal.coe_le_coe.mpr (ef.props.max_uniform h_card_pos p hp_sum_1)
      · exact le_of_lt hC_pos
    ,
    continuity := by
      intro α _ p_center hp_sum_1 ε hε_pos
      -- Goal: ∃ δ > 0, ∀ (q : α → NNReal) (_hq_sum_1 : ∑ i, q i = 1),
      --       (∀ i, |(q i : ℝ) - (p_center i : ℝ)| < δ) →
      --       |((C * ↑(ef.H_func q)).toNNReal : ℝ) - ((C * ↑(ef.H_func p_center)).toNNReal : ℝ)| < ε

      -- Use continuity of the original entropy function ef.H_func
      -- We want: |C * ↑(ef.H_func q) - C * ↑(ef.H_func p_center)| < ε
      -- This gives us: |C| * |↑(ef.H_func q) - ↑(ef.H_func p_center)| < ε
      -- So we need: |↑(ef.H_func q) - ↑(ef.H_func p_center)| < ε / |C|

      have hC_abs_pos : |C| > 0 := abs_pos.mpr (ne_of_gt hC_pos)
      let ε_scaled := ε / |C|
      have hε_scaled_pos : ε_scaled > 0 := div_pos hε_pos hC_abs_pos

      -- Apply continuity of ef.H_func
      obtain ⟨δ, hδ_pos, hδ_works⟩ := ef.props.continuity p_center hp_sum_1 ε_scaled hε_scaled_pos

      use δ, hδ_pos
      intro q hq_sum_1 hq_close

      -- Apply the continuity property of ef.H_func
      have h_ef_close := hδ_works q hq_sum_1 hq_close

      -- Since ef.H_func returns NNReal, both values are non-negative, so toNNReal is identity
      have h_nonneg_q : (C * (ef.H_func q : ℝ)) ≥ 0 :=
        mul_nonneg (le_of_lt hC_pos) (NNReal.coe_nonneg _)
      have h_nonneg_p : (C * (ef.H_func p_center : ℝ)) ≥ 0 :=
        mul_nonneg (le_of_lt hC_pos) (NNReal.coe_nonneg _)

      rw [Real.coe_toNNReal _ h_nonneg_q, Real.coe_toNNReal _ h_nonneg_p]

      -- Now we have: |C * ↑(ef.H_func q) - C * ↑(ef.H_func p_center)| < ε
      rw [← mul_sub, abs_mul]

      -- Since C > 0, |C| = C
      rw [abs_of_pos hC_pos]

      -- Apply the bound from ef.H_func continuity
      have h_bound : |((ef.H_func q) : ℝ) - ((ef.H_func p_center) : ℝ)| < ε_scaled := h_ef_close

      -- Conclude: C * |↑(ef.H_func q) - ↑(ef.H_func p_center| < C * (ε / C) = ε
      calc C * |((ef.H_func q) : ℝ) - ((ef.H_func p_center) : ℝ)|
        < C * ε_scaled := by apply mul_lt_mul_of_pos_left h_bound hC_pos
        _ = C * (ε / |C|) := rfl
        _ = C * (ε / C) := by rw [abs_of_pos hC_pos]
        _ = ε := by field_simp [ne_of_gt hC_pos]
    ,
    cond_add_sigma := by
      -- Introduce all the universally quantified variables.
      intro N _inst prior M_map P_cond hprior_sum_1 hP_cond_props hH_P_cond_zero

      -- We will prove the equality in `ℝ` and then use `NNReal.eq` to finish.
      apply NNReal.eq
      symm  -- Flip the goal so calc starts with the correct side

      -- First, we establish that all scaled entropy terms are non-negative, so `toNNReal` behaves predictably.
      have h_joint_nonneg : 0 ≤ C * (ef.H_func (DependentPairDistSigma prior M_map P_cond) : ℝ) :=
        mul_nonneg (le_of_lt hC_pos) (NNReal.coe_nonneg _)
      have h_prior_nonneg : 0 ≤ C * (ef.H_func prior : ℝ) :=
        mul_nonneg (le_of_lt hC_pos) (NNReal.coe_nonneg _)
      have h_cond_i_nonneg (i : Fin N) : 0 ≤ C * (ef.H_func (P_cond i) : ℝ) :=
        mul_nonneg (le_of_lt hC_pos) (NNReal.coe_nonneg _)

      -- Now, let's work with the `ℝ`-valued equation.
      -- The `calc` block transforms the RHS into the LHS.
      calc
        -- Start with the expected LHS coerced to ℝ
        ↑((C * ↑(ef.H_func prior)).toNNReal + ∑ i, prior i * (C * ↑(ef.H_func (P_cond i))).toNNReal)

        -- Simplify coercions using toNNReal properties for nonnegative values.
        _ = (C * (ef.H_func prior : ℝ)) + ∑ i, (prior i : ℝ) * (C * (ef.H_func (P_cond i) : ℝ)) := by
            rw [NNReal.coe_add, NNReal.coe_sum]
            congr 1
            · rw [Real.coe_toNNReal _ h_prior_nonneg]
            · congr 1
              ext i
              rw [NNReal.coe_mul, Real.coe_toNNReal _ (h_cond_i_nonneg i)]

        -- Factor out the constant C in ℝ.
        _ = C * ((ef.H_func prior : ℝ) + ∑ i, (prior i : ℝ) * (ef.H_func (P_cond i) : ℝ)) := by
            rw [mul_add]
            congr 1
            rw [mul_sum]
            congr 1
            ext i
            ring

        -- Apply the original axiom for `ef`, coercing to ℝ.
        _ = C * (ef.H_func (DependentPairDistSigma prior M_map P_cond) : ℝ) := by
            congr 1
            -- We need to construct the proper hypothesis for the original axiom
            have hH_P_cond_zero_orig : ∀ (i : Fin N), M_map i = 0 → ef.H_func (P_cond i) = 0 := by
              intro i hi
              -- From hH_P_cond_zero, we have (C * ↑(ef.H_func (P_cond i))).toNNReal = 0
              have h := hH_P_cond_zero i hi
              -- Since C > 0, if (C * ↑(ef.H_func (P_cond i))).toNNReal = 0,
              -- then C * ↑(ef.H_func (P_cond i)) = 0, which implies ef.H_func (P_cond i) = 0
              have h_zero : C * ↑(ef.H_func (P_cond i)) = 0 := by
                have h_nonneg := h_cond_i_nonneg i
                -- From toNNReal a = 0 and a ≥ 0, we get a = 0
                have h_le_zero : C * ↑(ef.H_func (P_cond i)) ≤ 0 := Real.toNNReal_eq_zero.mp h
                exact le_antisymm h_le_zero h_nonneg
              have h_coe_zero : ↑(ef.H_func (P_cond i)) = (0 : ℝ) := by
                have h_nonzero : C ≠ 0 := ne_of_gt hC_pos
                rw [mul_eq_zero] at h_zero
                cases h_zero with
                | inl h => contradiction
                | inr h => exact h
              -- From coe zero to NNReal zero
              exact NNReal.coe_eq_zero.mp h_coe_zero
            have h_orig_axiom := ef.props.cond_add_sigma prior M_map P_cond hprior_sum_1 hP_cond_props hH_P_cond_zero_orig
            -- Apply coercion to both sides of the equality
            have h_real : (ef.H_func (DependentPairDistSigma prior M_map P_cond) : ℝ) =
                          (ef.H_func prior : ℝ) + ∑ i, (prior i : ℝ) * (ef.H_func (P_cond i) : ℝ) := by
              rw [h_orig_axiom]
              simp only [NNReal.coe_add, NNReal.coe_sum, NNReal.coe_mul]
            exact h_real.symm

        -- This is now the definition of the LHS coerced to ℝ.
        _ = ↑((C * ↑(ef.H_func (DependentPairDistSigma prior M_map P_cond))).toNNReal) := by
            rw [Real.coe_toNNReal _ h_joint_nonneg]
    ,
    apply_to_empty_domain := by
      -- Goal: (C * ↑(ef.H_func (fun (_ : Empty) => 0))).toNNReal = 0
      simp only [ef.props.apply_to_empty_domain, NNReal.coe_zero, mul_zero, Real.toNNReal_zero]
  }





/--
**Theorem:** For the canonical base-2 Shannon entropy function (`H_canonical_log2`),
the entropy of a single fair coin flip is exactly 1 bit.

**Interpretation:** This is the formal "unit test" confirming that our EGPT
entropy engine is perfectly calibrated for computer science applications, where
the bit is the fundamental unit of information.
-/
theorem entropy_of_fair_coin_is_one_bit :
    -- We model a fair coin flip as the uniform distribution on a set of 2 outcomes (Fin 2).
    let coin_flip_dist := canonicalUniformDist 2 (by norm_num)
    H_canonical_log2 coin_flip_dist = 1 := by

  -- Let's define our distribution for clarity.
  let coin_flip_dist := canonicalUniformDist 2 (by norm_num)
  -- Unfold the definition of our base-2 entropy function.
  simp only [H_canonical_log2, coin_flip_dist, canonicalUniformDist]

  -- The expression is now `((stdShannonEntropyLn (uniformDist ...)) / log 2).toNNReal`.
  -- From our previous proofs, we know that `stdShannonEntropyLn (uniformDist h_card_pos)` is `log (card)`.
  have h2_pos : (2 : ℕ) > 0 := by norm_num
  have h_uniform_entropy : stdShannonEntropyLn (uniformDist (Fintype_card_fin_pos h2_pos)) = log 2 := by
    rw [stdShannonEntropyLn_uniform_eq_log_card (Fintype_card_fin_pos h2_pos)]
    simp [Fintype.card_fin]

  -- Substitute this into our goal.
  rw [h_uniform_entropy]

  -- The goal is now `((log 2 / log 2)).toNNReal = 1`.
  -- `log 2 / log 2` simplifies to 1.
  have h_log2_ne_zero : log 2 ≠ 0 := ne_of_gt (log_pos (by norm_num : (2:ℝ) > 1))
  rw [div_self h_log2_ne_zero]

  -- The goal is now `(1:ℝ).toNNReal = 1`. This is true by definition.
  rw [Real.toNNReal_one]




/-!
We formalize the content of `EGPT_FTA.md`: the information (in bits) of a
uniform system with `n` equiprobable outcomes is `log₂ n`, and prime
factorization transports multiplicative structure of `n` into additive
structure of information.

We work directly with `Real.logb 2` (natural logarithm base-change).  When
connected to the canonical base-2 entropy `H_canonical_log2`, we obtain the
EGPT Fundamental Theorem of Information Arithmetic (FTA-Info):

    H(uniform_n) = ∑_{p prime | n} (ν_p n) * H(uniform_p)

Since `H(uniform_p) = log₂ p`, this is equivalent to the classical identity
`log₂ n = ∑ ν_p(n) * log₂ p`.
-/

lemma logb_two_pos : 1 < (2 : ℝ) := by norm_num
lemma log_two_ne_zero : Real.log 2 ≠ 0 := by exact ne_of_gt (Real.log_pos logb_two_pos)

@[simp] lemma logb_two_two : Real.logb 2 2 = 1 := by
  unfold Real.logb
  rw [div_self log_two_ne_zero]

lemma logb_two_factorization (n : ℕ) (_hn : 0 < n) :
    Real.logb 2 n =
      ∑ p ∈ n.factorization.support,
        (n.factorization p : ℝ) * Real.logb 2 p := by
  classical
  -- put both sides in exactly the same shape, then use the library lemma
  change Real.logb 2 (n : ℝ)
    = ∑ p ∈ n.factorization.support, (n.factorization p : ℝ) * Real.logb 2 (p : ℝ)
  simpa [Finsupp.sum] using (Real.logb_nat_eq_sum_factorization (b := 2) n)

/-! Bridge to entropy: entropy (in bits) of the uniform distribution on `n`
    outcomes equals `Real.logb 2 n` (proved or assumed elsewhere). We package
    the factorization version in entropy form. -/
lemma entropy_uniform_bits_factorization
    (n : ℕ) (hn : 1 < n)
    (bridge : H_canonical_log2 (canonicalUniformDist n (Nat.lt_trans (Nat.succ_pos 0) hn))
                = ((Real.logb 2 n)).toNNReal)
  :
  H_canonical_log2 (canonicalUniformDist n (Nat.lt_trans (Nat.succ_pos 0) hn)) =
    ((∑ p ∈ n.factorization.support, (n.factorization p : ℝ) * Real.logb 2 p)).toNNReal := by
  classical
  -- Apply bridge then factorization lemma
  have hn_pos : 0 < n := Nat.lt_trans (Nat.succ_pos 0) hn
  have hfac := logb_two_factorization n hn_pos
  rw [bridge, hfac]

/-!
Main statement (bits form): EGPT Fundamental Theorem of Information Arithmetic.
We state it purely in logarithmic terms; the entropy version follows by the
uniform-entropy bridge.
-/
theorem EGPT_FTA_information_bits (n : ℕ) (hn : 1 < n) :
    Real.logb 2 n = ∑ p ∈ n.factorization.support, (n.factorization p : ℝ) * Real.logb 2 p :=
  logb_two_factorization n (Nat.lt_trans (Nat.succ_pos 0) hn)

/-!
Entropy phrasing (schematic): each prime factor contributes additively its
bit-information.  This mirrors the Lean outline in `EGPT_FTA.md`.
-/
theorem EGPT_FTA_entropy_bits
    (n : ℕ) (hn : 1 < n)
    (bridge : H_canonical_log2 (canonicalUniformDist n (Nat.lt_trans (Nat.succ_pos 0) hn))
                = ((Real.logb 2 n)).toNNReal)
  :
  H_canonical_log2 (canonicalUniformDist n (Nat.lt_trans (Nat.succ_pos 0) hn)) =
    ((∑ p ∈ n.factorization.support, (n.factorization p : ℝ) * Real.logb 2 p)).toNNReal := by
  classical
  have hfac := EGPT_FTA_information_bits n hn
  simp [bridge, hfac]


/-!
### Section 1: Defining the Informationally Irreducible Class

This structure captures the properties of a single "class" of outcomes in a
Bernoulli process of `n` trials: all outcomes with exactly `k` successes.
-/

/--
A single "informationally irreducible class" for a Bernoulli process.
It contains the number of successes (`num_ones`), the number of outcomes
in the class (`multiplicity`), the probability of any single outcome in this
class (`prob`), and the total entropy this class contributes to the system.
-/
@[ext]
structure InfoIrreducibleClass where
  num_ones : ℕ
  multiplicity : ℕ
  prob : NNReal
  entropy_contribution : ℝ -- Using ℝ for entropy calculations involving logs

/-!
### Section 2: The Generator Function

This function generates the list of all n+1 irreducible classes for a
Bernoulli process of `n` trials with success probability `p`.
-/

/-- A helper function to compute `-p * logb 2 p` in bits. -/
noncomputable def negMulLogb2 (p : NNReal) : ℝ :=
  if p = 0 then 0 else -(p : ℝ) * logb 2 (p : ℝ)

/--
Generates the list of all `n+1` informationally irreducible classes for a
Bernoulli process of `n` trials with success probability `p`.
This is the formal analogue of the table in Section 9 of the JS demo.
-/
noncomputable def generateIrreducibleClasses (n : ℕ) (p : NNReal) (_hp_pos : 0 < p) (_hp_lt_one : p < 1) :
  List InfoIrreducibleClass :=
  (List.range (n + 1)).map fun k =>
    let mult := n.choose k
    let prob_k := p ^ k * (1 - p) ^ (n - k)
    -- The total entropy contribution from this class is:
    -- (number of outcomes in class) * (entropy of one outcome)
    -- = multiplicity * (-prob_k * logb 2 prob_k)
    let entropy_k := (mult : ℝ) * negMulLogb2 prob_k
    {
      num_ones := k,
      multiplicity := mult,
      prob := prob_k,
      entropy_contribution := entropy_k
    }


-- (Your preceding code is assumed present:
--   InfoIrreducibleClass, negMulLogb2, generateIrreducibleClasses, etc.)

/-- helper: the ℝ-coercions of `p : NNReal` and `1-p : NNReal` are positive under `0<p<1`. -/
lemma real_pos_of_nn (p : NNReal) (hp_pos : 0 < p) : 0 < (p : ℝ) :=
  by exact_mod_cast hp_pos

lemma real_pos_of_one_sub_nn (p : NNReal) (hp_lt_one : p < 1) :
  0 < ((1 - p : NNReal) : ℝ) :=
by
  -- Move to ℝ where we can use the standard subtraction and `sub_pos.mpr`.
  have hp_real_lt_one : (p : ℝ) < 1 := by exact_mod_cast hp_lt_one
  have hpos_real : 0 < (1 : ℝ) - p := sub_pos.mpr hp_real_lt_one
  -- Relate the ℝ expression `(1:ℝ) - p` to the coercion of `(1 - p : NNReal)`;
  -- for NNReal truncated subtraction, since `p ≤ 1` (from `p < 1`), the coercion matches.
  have hp_le_one : p ≤ 1 := le_of_lt hp_lt_one
  have hcoe : ((1 - p : NNReal) : ℝ) = (1 : ℝ) - p := by
    simpa using (NNReal.coe_sub hp_le_one)
  simpa [hcoe]

/-- helper: a variant of `Finset.sum_range_succ` that pulls off the first term. -/
lemma sum_range_succ_pull {α} [AddCommMonoid α]
    (f : ℕ → α) (n : ℕ) :
  ∑ k ∈ Finset.range (n+1), f k = f 0 + ∑ k ∈ Finset.range n, f (k+1) := by
  classical
  induction' n with n ih
  · simp
  · -- use the step case and `Finset.sum_range_succ` twice
    have h1 := Finset.sum_range_succ (fun k => f k) (n + 1)
    have h2 := Finset.sum_range_succ (fun k => f (k+1)) n
    -- apply induction hypothesis and rearrange
    calc ∑ k ∈ Finset.range (n + 2), f k
      = (∑ k ∈ Finset.range (n + 1), f k) + f (n + 1) := by exact h1
      _ = (f 0 + ∑ k ∈ Finset.range n, f (k + 1)) + f (n + 1) := by rw [ih]
      _ = f 0 + ((∑ k ∈ Finset.range n, f (k + 1)) + f (n + 1)) := by rw [add_assoc]
      _ = f 0 + (∑ k ∈ Finset.range (n + 1), f (k + 1)) := by rw [← h2]

/-- helper: `List.foldl` over `List.range` equals a `Finset.sum` over `Finset.range`. -/
lemma foldl_range_eq_sum {α} [AddCommMonoid α]
    (f : ℕ → α) (n : ℕ) :
    (List.range (n+1)).foldl (fun s k => s + f k) 0
    = ∑ k ∈ Finset.range (n+1), f k := by
  classical
  induction' n with n ih
  · -- n = 0: `[0]` on the left, `range 1` on the right
    simp
  · -- step: `range (n+2) = range (n+1) ++ [n+1]`
    have hr : List.range (n+2) = List.range (n+1) ++ [n+1] := by
      simp [List.range_succ]
    -- foldl over append; `sum_range_succ` for the RHS
    simp [hr, ih, Finset.sum_range_succ, add_comm, add_left_comm, add_assoc]

/-/ helper: rewrite the list `foldl` of entropy contributions as a `Finset.sum` over `k=0..n`. -/
lemma foldl_classes_as_sum
    (n : ℕ) (p : NNReal) (hp_pos : 0 < p) (hp_lt_one : p < 1) :
  (generateIrreducibleClasses n p hp_pos hp_lt_one).foldl
      (fun acc c => acc + c.entropy_contribution) 0
  =
  ∑ k ∈ Finset.range (n+1),
      ( (n.choose k : ℝ)
      * negMulLogb2 (p^k * (1 - p)^(n-k)) ) := by
  classical
  -- Unfold once and push `foldl` through the `map` using `List.foldl_map`.
  unfold generateIrreducibleClasses
  -- Turn the `foldl` over the mapped list into a `foldl` over `List.range`,
  -- then apply the generic `foldl_range_eq_sum` lemma.
  have := foldl_range_eq_sum
    (f := fun k => ( (n.choose k : ℝ) * negMulLogb2 (p^k * (1 - p)^(n-k)) ))
    n
  simpa [List.foldl_map, InfoIrreducibleClass.entropy_contribution] using this


/--
Transform the weighted sum with `(n.choose (k+1)) * (k+1)` to one with `((n-1).choose k)`
using `Nat.succ_mul_choose_eq`, and factor out `(n : ℝ) * x`.

This is the algebraic heart of `h_transform`, independent from the EGPT-specific `pk`.
-/
lemma choose_succ_weighted_sum_transform (n : ℕ) (x y : ℝ) :
    ∑ k ∈ Finset.range n,
      (n.choose (k+1) : ℝ) * x^(k+1) * y^(n - (k+1)) * ((k+1 : ℝ))
  = (n : ℝ) * x *
      ∑ k ∈ Finset.range n,
        ((n-1).choose k : ℝ) * x^k * y^((n-1) - k) := by
  classical
  -- Pointwise convert each summand using `Nat.succ_mul_choose_eq (n-1) k`.
  have hpoint :
      ∀ k ∈ Finset.range n,
        (n.choose (k+1) : ℝ) * x^(k+1) * y^(n - (k+1)) * ((k+1 : ℝ))
        = (n : ℝ) * x * (((n-1).choose k : ℝ) * x^k * y^((n-1) - k)) := by
    intro k hk
    -- Cast the binomial identity to `ℝ`:
    --   n * C(n-1,k) = C(n, k+1) * (k+1)
    have hnat := Nat.succ_mul_choose_eq (n-1) k
    have hcast : ((n.choose (k+1)) * (k+1) : ℝ)
                = (n : ℝ) * ((n-1).choose k : ℝ) := by
      -- `hnat` is: (n-1).succ * (n-1).choose k = (n-1).succ.choose (k.succ) * k.succ
      -- i.e. `n * C(n-1,k) = C(n,k+1) * (k+1)`.
      -- Cast to reals and rearrange the product.
      have hk_lt : k < n := Finset.mem_range.mp hk
      have hn_pos : 0 < n := Nat.pos_of_ne_zero (fun h => by simp [h] at hk_lt)
      -- We need to show that (n-1).succ = n
      have hn_succ : (n-1).succ = n := Nat.succ_pred_eq_of_pos hn_pos
      -- Apply the cast to the identity from hnat
      have h_cast := congrArg (fun t : ℕ => (t : ℝ)) hnat
      -- Simplify the casts and use hn_succ
      simp only [Nat.cast_mul] at h_cast
      rw [hn_succ] at h_cast
      -- Convert the RHS: k.succ = k+1
      have : n.choose k.succ = n.choose (k+1) := by simp [Nat.succ_eq_add_one]
      have : k.succ = k + 1 := Nat.succ_eq_add_one k
      rw [this] at h_cast
      simp only [Nat.cast_add, Nat.cast_one] at h_cast
      exact h_cast.symm
    -- Also rewrite the exponents: `x^(k+1) = x^k * x`, and
    -- `y^(n-(k+1)) = y^((n-1) - k)` since `k < n` for `k ∈ range n`.
    have hk_lt : k < n := Finset.mem_range.mp hk
    have hsub : n - (k+1) = (n-1) - k := by
      -- standard arithmetic on ℕ: holds since `k+1 ≤ n`.
      have hk1 : k + 1 ≤ n := Nat.succ_le_of_lt hk_lt
      -- Use omega for natural number arithmetic
      omega
    -- Now massage the term.
    calc
      (n.choose (k+1) : ℝ) * x^(k+1) * y^(n - (k+1)) * ((k+1 : ℝ))
          = ((n.choose (k+1) : ℝ) * (k+1 : ℝ)) * (x^(k+1) * y^(n - (k+1))) := by
            ring
      _ = ((n : ℝ) * ((n-1).choose k : ℝ)) * ( (x^k * x) * y^((n-1) - k) ) := by
            simpa [pow_succ, hsub, hcast, mul_comm, mul_left_comm, mul_assoc]
      _ = (n : ℝ) * x * (((n-1).choose k : ℝ) * x^k * y^((n-1) - k)) := by
            ring
  -- Summation and factor out the constant `(n : ℝ) * x`.
  have := Finset.sum_congr rfl (by intro k hk; simpa using hpoint k hk)
  simpa [Finset.mul_sum, Finset.sum_mul, mul_comm, mul_left_comm, mul_assoc]
    using this

/--
Binomial theorem in the exact index form we need: for any `n`,
`∑_{k=0}^{n-1} C(n-1,k) x^k y^{(n-1)-k} = if n=0 then 0 else (x+y)^(n-1)`.
This guards the `n=0` edge case where the LHS is an empty sum.
-/
lemma sum_choose_pow_pred_eq_add_pow (n : ℕ) (x y : ℝ) :
    ∑ k ∈ Finset.range n, ((n-1).choose k : ℝ) * x^k * y^((n-1) - k)
  = (if n = 0 then 0 else (x + y)^(n-1)) := by
  classical
  cases' n with m
  · -- n = 0
    simp
  · -- n = m+1
    -- now `n-1 = m` and `range n = range (m+1)`; apply `add_pow`.
    have : (∑ k ∈ Finset.range (m+1), ((m).choose k : ℝ) * x^k * y^(m - k))
            = (x + y)^m := by
      -- Transform the sum to match the binomial theorem exactly
      have h_sum_eq : (∑ k ∈ Finset.range (m+1), ((m).choose k : ℝ) * x^k * y^(m - k))
                     = (∑ k ∈ Finset.range (m+1), x^k * y^(m - k) * ((m).choose k : ℝ)) := by
        congr 1
        ext k
        ring
      rw [h_sum_eq, add_pow]
    simpa using this



/-- **Total entropy from classes equals the Shannon n·H formula (base 2).** -/
theorem total_entropy_from_classes_eq_shannon_formula
    (n : ℕ) (p : NNReal) (hp_pos : 0 < p) (hp_lt_one : p < 1) :
  (generateIrreducibleClasses n p hp_pos hp_lt_one).foldl
      (fun acc c => acc + c.entropy_contribution) 0
  =
  n * (negMulLogb2 p + negMulLogb2 (1 - p)) := by

  classical
  -- Rewrite the list-fold to a finset sum over k = 0..n
  have hfold := foldl_classes_as_sum n p hp_pos hp_lt_one
  -- For convenience, put the base-ℝ parameters in names:
  set q : ℝ := ((1 - p : NNReal) : ℝ)
  have hx_pos : 0 < (p : ℝ) := real_pos_of_nn p hp_pos
  have hy_pos : 0 < q := real_pos_of_one_sub_nn p hp_lt_one
  have hx_ne : (p : ℝ) ≠ 0 := ne_of_gt hx_pos
  have hy_ne : q ≠ 0 := ne_of_gt hy_pos

  -- Define the real-valued probability of each class
  set pk : ℕ → ℝ := fun k => (p : ℝ)^k * q^(n - k)
  have pk_pos : ∀ k ∈ Finset.range (n+1), 0 < pk k := by
    intro k hk
    have : 0 < (p : ℝ)^k * q^(n - k) :=
      mul_pos (pow_pos hx_pos k) (pow_pos hy_pos (n - k))
    simpa [pk] using this

  -- Expand logb₂ of the product using multiplicativity and power rule
  have logb_mul_pow :
      ∀ k ∈ Finset.range (n+1),
        Real.logb 2 (pk k)
          = (k : ℝ) * Real.logb 2 (p : ℝ)
            + ((n : ℝ) - k) * Real.logb 2 q := by
    intro k hk
    have hxk_ne : (p : ℝ)^k ≠ 0 := pow_ne_zero k hx_ne
    have hyk_ne : q^(n - k) ≠ 0 := pow_ne_zero (n - k) hy_ne
    have h :=
      (Real.logb_mul (b:=2) (x:=(p : ℝ)^k) (y:=q^(n - k)) hxk_ne hyk_ne)
    -- apply power rule on both factors
    rw [Real.logb_pow, Real.logb_pow] at h
    have hk_le : k ≤ n := Nat.le_of_lt_succ (Finset.mem_range.mp hk)
    have hcast : ((n - k : ℕ) : ℝ) = (n : ℝ) - k := Nat.cast_sub hk_le
    simpa [pk, hcast] using h

  -- Activate the nonzero branch of `negMulLogb2`
  have negMulLogb2_eval :
      ∀ k ∈ Finset.range (n+1),
        negMulLogb2 (p^k * (1 - p)^(n - k))
        = -(pk k) * Real.logb 2 (pk k) := by
    intro k hk
    have hnnpos : 0 < (p^k * (1 - p)^(n - k) : NNReal) := by
      have : 0 < pk k := pk_pos k hk
      have : 0 < ((p^k * (1 - p)^(n - k) : NNReal) : ℝ) := by simpa [pk] using this
      exact (by exact_mod_cast this)
    have hne : (p^k * (1 - p)^(n - k) : NNReal) ≠ 0 := ne_of_gt hnnpos
    simp [negMulLogb2, hne, pk]
    aesop

  -- Main algebraic expansion of the entropy sum
  have main_sum :
      ∑ k ∈ Finset.range (n+1),
          ( (n.choose k : ℝ) * negMulLogb2 (p^k * (1 - p)^(n - k)) )
      =
      -(Real.logb 2 (p : ℝ)) *
        (∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k * (k : ℝ))
      - (Real.logb 2 q) *
        (∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k * ((n : ℝ) - k)) := by
    -- pointwise expand and then sum; factor constants using big-operator lemmas
    have hpoint :
      ∀ k ∈ Finset.range (n+1),
        ( (n.choose k : ℝ) * negMulLogb2 (p^k * (1 - p)^(n - k)) )
        = -(Real.logb 2 (p : ℝ)) * ((n.choose k : ℝ) * pk k * (k : ℝ))
          - (Real.logb 2 q) * ((n.choose k : ℝ) * pk k * ((n : ℝ) - k)) := by
      intro k hk
      have h₁ := negMulLogb2_eval k hk
      have h₂ := logb_mul_pow k hk
      -- combine and distribute
      calc
        (n.choose k : ℝ) * negMulLogb2 (p^k * (1 - p)^(n - k))
            = (n.choose k : ℝ) * (-(pk k) * Real.logb 2 (pk k)) := by simpa [h₁]
        _ = -(n.choose k : ℝ) * (pk k) * Real.logb 2 (pk k) := by ring
        _ = -(n.choose k : ℝ) * (pk k)
              * ((k : ℝ) * Real.logb 2 (p : ℝ)
                 + ((n : ℝ) - k) * Real.logb 2 q) := by simpa [h₂]
        _ = -(Real.logb 2 (p : ℝ)) * ((n.choose k : ℝ) * pk k * (k : ℝ))
            - (Real.logb 2 q) * ((n.choose k : ℝ) * pk k * ((n : ℝ) - k)) := by
              ring
    -- Sum both sides and pull out constants
    classical
    have := Finset.sum_congr rfl (by intro k hk; simpa using hpoint k hk)
    -- Now use `sum_add_distrib` and linearity
    simpa [Finset.sum_add_distrib, Finset.mul_sum, Finset.sum_mul] using this

  -- Compute the binomial first moments S₁ and S₂.
  -- S₁ := ∑ C(n,k) pk(k) k = n p.
  have S1 :
    ∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k * (k : ℝ)
      = (n : ℝ) * (p : ℝ) := by
    -- pull off the first term (k=0) which is zero, then reindex k ↦ k+1
    have hpull :=
      sum_range_succ_pull (fun k => (n.choose k : ℝ) * pk k * (k : ℝ)) n
    have h0 : (n.choose 0 : ℝ) * pk 0 * (0 : ℝ) = 0 := by simp [pk]
    -- Apply hpull and h0 to rewrite the original sum
    have h_rewrite :
      ∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k * (k : ℝ)
      = ∑ k ∈ Finset.range n, (n.choose (k+1) : ℝ) * pk (k+1) * ((k+1 : ℝ)) := by
      simp [hpull, h0]
    -- Use the microlemma to transform the sum
    have h_transform :
      ∑ k ∈ Finset.range n,
        (n.choose (k+1) : ℝ) * pk (k+1) * ((k+1 : ℝ))
      = (n : ℝ) * (p : ℝ) *
          ∑ k ∈ Finset.range n,
            ((n-1).choose k : ℝ) * (p : ℝ)^k * q^((n-1) - k) := by
      -- apply the externalized transform and unfold `pk`
      simpa [pk, pow_succ, mul_comm, mul_left_comm, mul_assoc]
        using choose_succ_weighted_sum_transform n (p : ℝ) q
    -- Apply the binomial theorem to the sum and use p+q=1
    have binom :
      ∑ k ∈ Finset.range n,
        ((n-1).choose k : ℝ) * (p : ℝ)^k * q^((n-1) - k)
      = (if n = 0 then 0 else ((p : ℝ) + q)^(n-1)) := by
      simpa using sum_choose_pow_pred_eq_add_pow n (p : ℝ) q
    have pq_one : (p : ℝ) + q = 1 := by
      -- coerce `NNReal` subtraction to ℝ and simplify
      have hp_le_one : p ≤ 1 := le_of_lt hp_lt_one
      simp [q, NNReal.coe_sub hp_le_one]
    -- Put everything together using the calc chain
    calc
      ∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k * (k : ℝ)
          = ∑ k ∈ Finset.range n,
              (n.choose (k+1) : ℝ) * pk (k+1) * ((k+1 : ℝ)) := h_rewrite
      _ = (n : ℝ) * (p : ℝ) *
            ∑ k ∈ Finset.range n,
              ((n-1).choose k : ℝ) * (p : ℝ)^k * q^((n-1) - k) := h_transform
      _ = (n : ℝ) * (p : ℝ) * (if n = 0 then 0 else ((p : ℝ) + q)^(n-1)) := by simp [binom]
      _ = (n : ℝ) * (p : ℝ) := by aesop

  -- S₂ from S₁ and the binomial theorem: S₂ = n(1-p)
  have Ssum :
    ∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k
      = ( (p : ℝ) + q )^n := by
    simpa [pk, add_comm, add_left_comm, add_assoc, mul_comm, mul_left_comm, mul_assoc]
      using (add_pow (x := (p : ℝ)) (y := q) (n := n)).symm
  have S2 :
    ∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k * ((n : ℝ) - k)
      = (n : ℝ) * q := by
    classical
    -- split (n - k) and use linearity
    have hsplit :
      ∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k * ((n : ℝ) - k)
        = (n : ℝ) * (∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k)
          - (∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k * (k : ℝ)) := by
      -- apply distributive property for subtraction inside the sum
      conv_lhs =>
        arg 2
        ext k
        rw [mul_sub]
      rw [Finset.sum_sub_distrib]
      congr 1
      simp only [Finset.mul_sum]
      congr 1
      ext i
      ring
    -- now use Ssum and S1 and simplify with (p+q)=1
    have pq_one : (p : ℝ) + q = 1 := by
      have hp_le_one : p ≤ 1 := le_of_lt hp_lt_one
      simpa [q, NNReal.coe_sub hp_le_one] using (by ring : (p : ℝ) + ((1 : ℝ) - p) = 1)
    calc
      ∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k * ((n : ℝ) - k)
          = (n : ℝ) * (∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k)
            - (∑ k ∈ Finset.range (n+1), (n.choose k : ℝ) * pk k * (k : ℝ)) := hsplit
      _ = (n : ℝ) * (( (p : ℝ) + q )^n) - ( (n : ℝ) * (p : ℝ) ) := by
            simpa [Ssum, S1]
      _ = (n : ℝ) * (1 : ℝ) - (n : ℝ) * (p : ℝ) := by simpa [pq_one]
      _ = (n : ℝ) * (1 - (p : ℝ)) := by ring
      _ = (n : ℝ) * q := by
            have hp_le_one : p ≤ 1 := le_of_lt hp_lt_one
            simpa [q, NNReal.coe_sub hp_le_one]

  -- Use `main_sum`, `S1`, `S2` to finish the target equality
  -- First, rewrite `negMulLogb2` at `p` and `1-p`.
  have hnp : negMulLogb2 p = -(p : ℝ) * Real.logb 2 (p : ℝ) := by
    have : (p : NNReal) ≠ 0 := ne_of_gt hp_pos
    simpa [negMulLogb2, this]
  have hnq : negMulLogb2 (1 - p) = -q * Real.logb 2 q := by
    have hp_le_one : p ≤ 1 := le_of_lt hp_lt_one
    have : (1 - p : NNReal) ≠ 0 := by
      -- since 0 < q, coercion is nonzero
      have : 0 < q := hy_pos
      -- Convert from q ≠ 0 to (1 - p) ≠ 0
      have h_q_ne_zero : q ≠ 0 := ne_of_gt this
      -- Since q = ((1 - p : NNReal) : ℝ), and q ≠ 0, we have (1 - p : NNReal) ≠ 0
      intro h_zero
      have h_q_zero : q = 0 := by
        simp [q, h_zero]
      exact h_q_ne_zero h_q_zero
    simpa [negMulLogb2, q, this]

  -- Combine everything and convert back from the finset sum to the list foldl form
  have final_sum :
      ∑ k ∈ Finset.range (n+1), ( (n.choose k : ℝ) * negMulLogb2 (p^k * (1 - p)^(n - k)) )
      = (n : ℝ) * (negMulLogb2 p) + (n : ℝ) * (negMulLogb2 (1 - p)) := by
    have := main_sum
    -- Substitute S1 and S2 and rearrange
    rw [S1, S2] at this
    -- Now we need to rearrange the products to match the expected form
    convert this using 1
    -- Use the definitions of hnp and hnq to rewrite
    rw [hnp, hnq]
    ring

  -- Fold back to the original list-based definition
  -- Note: the RHS of the goal uses `n * (...)` with `n : ℕ`; coerce `n` to ℝ implicitly.
  -- The left side uses the `foldl` form; use `hfold` to rewrite it to a finset sum.
  simpa [hfold, two_mul, mul_add, add_comm, add_left_comm, add_assoc]
    using final_sum


/-!
## Section 10 (JS Demo Parity): Prime Information Atoms / EGPTPrimeGenerator

Mirrors the web Section 10 incremental identities:
  (1) log₂ n = Σ e_p · log₂ p
  (2) log₂(n!) = Σ α_p(n) · log₂ p,  α_p(n)=∑_{k≥1} ⌊n / p^k⌋
  (3) Incremental: log₂((n+1)!) − log₂(n!) = log₂(n+1).

We provide concise Lean lemmas (reusing earlier factorization identities) in
`namespace PrimeAtoms` to justify the JavaScript computations.
-/

namespace PrimeAtoms

open scoped BigOperators

noncomputable def primeAtomSum (m : ℕ) : ℝ :=
  ∑ p ∈ m.factorization.support, (m.factorization p : ℝ) * Real.logb 2 p

lemma primeAtomSum_eq_logb (m : ℕ) (hm : 0 < m) :
    primeAtomSum m = Real.logb 2 m := by
  classical
  simpa [primeAtomSum] using (logb_two_factorization m hm).symm

noncomputable def factorialPrimeAtomSum (n : ℕ) : ℝ := primeAtomSum (Nat.factorial n)

lemma factorialPrimeAtomSum_eq_logb (n : ℕ) :
    factorialPrimeAtomSum n = Real.logb 2 (Nat.factorial n) := by
  classical
  have hpos : 0 < Nat.factorial n := Nat.factorial_pos n
  -- unfold and apply earlier lemma
  unfold factorialPrimeAtomSum
  simpa using primeAtomSum_eq_logb (Nat.factorial n) hpos

lemma logb_factorial_succ (n : ℕ) :
    Real.logb 2 (Nat.factorial (n+1)) = Real.logb 2 (n+1) + Real.logb 2 (Nat.factorial n) := by
  classical
  have h1 : (Nat.factorial n : ℝ) ≠ 0 := by exact_mod_cast Nat.factorial_ne_zero n
  have h2 : ((n+1) : ℝ) ≠ 0 := by exact_mod_cast Nat.succ_ne_zero n
  have hfac : (Nat.factorial (n+1) : ℝ) = (n+1) * Nat.factorial n := by
    simp [Nat.factorial_succ, Nat.cast_mul, Nat.cast_add, Nat.cast_one]
  calc
    Real.logb 2 (Nat.factorial (n+1))
  = Real.logb 2 ((n+1) * Nat.factorial n) := by simp [hfac]
    _ = Real.logb 2 (n+1) + Real.logb 2 (Nat.factorial n) :=
          Real.logb_mul (b:=2) (x:=(n+1 : ℝ)) (y:=Nat.factorial n) h2 h1

lemma logb_factorial_increment (n : ℕ) :
    Real.logb 2 (Nat.factorial (n+1)) - Real.logb 2 (Nat.factorial n)
      = Real.logb 2 (n+1) := by
  classical
  have := logb_factorial_succ n
  simpa [sub_eq_add_neg, add_comm, add_left_comm, add_assoc]
    using congrArg (fun t => t - Real.logb 2 (Nat.factorial n)) this

theorem factorial_information_decomposition (n : ℕ) :
    Real.logb 2 (Nat.factorial n)
      = ∑ p ∈ (Nat.factorial n).factorization.support,
          ((Nat.factorial n).factorization p : ℝ) * Real.logb 2 p := by
  classical
  -- from factorialPrimeAtomSum_eq_logb and definition
  have := factorialPrimeAtomSum_eq_logb n
  -- rewrite target
  unfold factorialPrimeAtomSum at this
  -- this: ∑ ... = logb; want logb = ∑ ...
  simpa [primeAtomSum] using this.symm

theorem factorial_information_increment (n : ℕ) :
    Real.logb 2 (Nat.factorial (n+1))
      = Real.logb 2 (Nat.factorial n) + Real.logb 2 (n+1) :=
  (logb_factorial_succ n).trans (by simp [add_comm])

end PrimeAtoms

/-- NOTE: Detailed correctness lemmas (e.g., primes, product reconstruction) are
omitted here to avoid depending on any trimmed mathlib parts. The `primeAtomSum`
lemmas above already supply the identities used in the JS demo. `EGPTPrimeGenerator`
serves as an extraction-friendly list of (prime, exponent) pairs. -/

-- Optional explicit list generator mirroring JS (p,e) enumeration
noncomputable def EGPTPrimeGenerator (n : ℕ) : List (ℕ × ℕ) :=
  if n = 0 then [] else n.factorization.support.toList.map (fun p => (p, n.factorization p))
