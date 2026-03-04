import Mathlib.Tactic.NormNum
import EGPT.NumberTheory.Core
import EGPT.Constraints

namespace EGPT.Complexity

open EGPT.NumberTheory.Core EGPT.Constraints

/-!
### Core Complexity Definitions (The "Logic" Preliminaries)

This file contains the minimal definitions required for the formal proof of P=NP.
It defines what constitutes a polynomial-time function and a polynomial bound
within the EGPT framework.
-/

/--
A predicate asserting that a function `f` from one ParticlePath to another is
computable by a native EGPT polynomial. The witness for this property is the
`EGPT_Polynomial` structure itself.
-/
def IsPolynomialEGPT (f : ParticlePath → ParticlePath) : Prop :=
  ∃ (P : EGPT_Polynomial), f = P.eval

/-- The identity function on `ParticlePath` is polynomial. -/
instance IsPolynomialEGPT.id : IsPolynomialEGPT id := by
  -- 1. The goal is `∃ (P : EGPT_Polynomial), id = P.eval`.
  -- 2. We provide the native identity polynomial as the witness.
  use EGPT_Polynomial.id
  -- 3. The goal becomes `id = EGPT_Polynomial.id.eval`.
  --    We use function extensionality to prove this.
  ext n
  -- 4. The goal is now `id n = EGPT_Polynomial.id.eval n`.
  --    This simplifies by definition.
  simp [EGPT_Polynomial.eval]
  -- The proof is complete.

/--
A predicate asserting that a function `p : ℕ → ℕ` is bounded by a native
EGPT polynomial. This is the canonical EGPT definition of a polynomial bound.
-/
def IsBoundedByEGPT_Polynomial (p : ℕ → ℕ) : Prop :=
  ∃ (P : EGPT_Polynomial), ∀ n, p n ≤ toNat (P.eval (fromNat n))


/--
**Calculates the EGPT "Path Cost" to verify a single literal.**

In the EGPT model, verifying the `i`-th literal in a `k`-variable system
requires a computational path of complexity `i`. This represents the
information needed to "address" or "focus on" the `i`-th component of the
state vector.

The path is a `ParticlePath` (EGPT Natural Number), making the cost a
direct, physical quantity.
-/
def PathToConstraint {k : ℕ} (l : Literal_EGPT k) : ParticlePath :=
  -- The complexity is the index of the particle/variable being constrained.
  fromNat l.particle_idx.val

end EGPT.Complexity
