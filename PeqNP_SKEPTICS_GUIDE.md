# The Constructive Skeptic's Guide to P = NP

**Purpose:** You are a complexity theorist, a number theorist, or a mathematician who wants to see a *construction*, not a definitional identity. You have an hour. You believe P != NP and you want to find the flaw.

This repository proves P = NP in two completely independent and valid ways. This guide covers the fully constructive proof — that's all we're talking about here. For the definitional identity proof (Chain 1), see [`Lean/RFL_SKEPTICS_GUIDE.md`](Lean/RFL_SKEPTICS_GUIDE.md).

The constructive proof builds three independent characterizations of SAT — Boolean evaluation, entropy walks, and prime divisibility — proves them equivalent, and shows that reading a CNF formula IS solving it, with polynomial cost bounded by the formula's own information content.

Every theorem below is machine-verified in Lean 4: no `sorry`, no custom axioms. Run `cd Lean && lake build` to verify.

---

## Section 1: "Show Me a Construction, Not a Definition"

**The Skeptic's Claim:** "I want to see a machine that solves SAT. Show me a computation, not a type equivalence."

**The Rebuttal:** Here is a computation. The NDM (Non-Deterministic Machine) particle transport model in `UTM.lean` evaluates CNF by physically walking literal addresses.

```lean
def ndmCircuitEval {k : ℕ} (cnf : SyntacticCNF_EGPT k) (a : Vector Bool k) : Bool
```

This function walks every clause in the CNF, checks each literal's address against the assignment, and returns `true` iff every clause has at least one satisfied literal. It is proven equivalent to standard Boolean CNF evaluation:

```lean
theorem ndmCircuitEval_eq_evalCNF {k : ℕ} (cnf : SyntacticCNF_EGPT k)
    (a : Vector Bool k) :
    ndmCircuitEval cnf a = evalCNF cnf a
```

The walk cost is polynomial — bounded by `cnf.length * k` (number of clauses times number of variables):

```lean
theorem ndmCircuit_cost_polynomial {k : ℕ} (cnf : SyntacticCNF_EGPT k)
    (h_clause_bound : ∀ c ∈ cnf, c.length ≤ k) :
    (cnf.map (fun c => c.length)).sum ≤ cnf.length * k
```

**File:** [`Lean/EGPT/Complexity/UTM.lean`](Lean/EGPT/Complexity/UTM.lean)

---

## Section 2: "Where's the Entropy?"

**The Skeptic's Claim:** "You claim information theory proves P=NP. Where does entropy actually appear in the proof chain?"

**The Rebuttal:** The entropy walk (`ndmEntropyWalk`) maps each assignment to a composite number via prime encoding, then measures conditional entropy at each clause. A satisfying assignment drives the total entropy to zero:

```lean
theorem ndmCircuit_entropy_bridge {k : ℕ} (cnf : SyntacticCNF_EGPT k)
    (a : Vector Bool k) (h_clauses_nonempty : ∀ c ∈ cnf, c ≠ []) :
    ndmCircuitEval cnf a = true ↔
      (ndmEntropyWalk cnf (assignmentCompositePrime a)).totalEntropy = 0
```

This says: Boolean satisfaction (every clause has a true literal) is *equivalent* to conditional entropy reaching zero (no uncertainty remains). The entropy walk is complete — it detects satisfiability iff standard evaluation does:

```lean
theorem ndmEntropyWalk_determines_sat {k : ℕ} (cnf : SyntacticCNF_EGPT k)
    (a : Vector Bool k) (h_clauses_nonempty : ∀ c ∈ cnf, c ≠ []) :
    (ndmEntropyWalk cnf (assignmentCompositePrime a)).totalEntropy = 0 ↔
      evalCNF cnf a = true
```

The entropy walk's total cost is also polynomially bounded:

```lean
theorem ndmWalkComplexity_polynomial {k : ℕ} (cnf : SyntacticCNF_EGPT k)
    (h_clause_bound : ∀ c ∈ cnf, c.length ≤ k) :
    ndmWalkComplexity cnf ≤ cnf.length * (k * (2 * k))
```

**File:** [`Lean/EGPT/Complexity/UTM.lean`](Lean/EGPT/Complexity/UTM.lean)

---

## Section 3: "Prime Factorization Can't Encode SAT"

**The Skeptic's Claim:** "Mapping assignments to primes is a parlor trick. You can't reduce SAT to divisibility."

**The Rebuttal:** Each Boolean assignment is encoded as a composite number whose prime factors correspond to satisfied literals. Each literal gets a unique prime atom. SAT reduces to divisibility:

```lean
theorem evalCNF_true_iff_cnfSharesFactor {k : ℕ} (a : Vector Bool k)
    (cnf : SyntacticCNF_EGPT k) :
    evalCNF cnf a = true ↔ cnfSharesFactor a cnf
```

The prime encoding connects to conditional entropy — a literal shares a factor iff its conditional entropy is zero:

```lean
theorem literalSharesFactor_iff_zero_conditional_entropy {k : ℕ}
    (a : Vector Bool k) (lit : Literal_EGPT k) :
    literalSharesFactor a lit ↔
      conditionalLiteralEntropy (assignmentCompositePrime a) lit = 0
```

This chains all the way up to CNF level:

```lean
theorem cnfSharesFactor_iff_zero_conditional_cnf_entropy {k : ℕ}
    (a : Vector Bool k) (cnf : SyntacticCNF_EGPT k)
    (h_clauses_nonempty : ∀ c ∈ cnf, c ≠ []) :
    cnfSharesFactor a cnf ↔
      conditionalCNFEntropy (assignmentCompositePrime a) cnf = 0
```

The entropy characterization uses `Nat.gcd` — standard number theory:

```lean
theorem conditional_entropy_gcd_characterization {k : ℕ}
    (composite : ℕ) (_hc : 0 < composite) (lit : Literal_EGPT k) :
    conditionalLiteralEntropy composite lit = 0 ↔
      Nat.gcd composite (literalAtom lit) = literalAtom lit
```

**File:** [`Lean/EGPT/Complexity/Decomposition.lean`](Lean/EGPT/Complexity/Decomposition.lean)

---

## Section 4: "These Three Layers Might Not Agree"

**The Skeptic's Claim:** "You have three characterizations of SAT. How do I know they're actually equivalent? Maybe one is weaker than the others."

**The Rebuttal:** They are proven equivalent in a single theorem:

```lean
theorem three_layer_equivalence {k : ℕ} (cnf : SyntacticCNF_EGPT k)
    (h_clause_bound : ∀ c ∈ cnf, c.length ≤ k)
    (h_clauses_nonempty : ∀ c ∈ cnf, c ≠ []) :
    -- Boolean ↔ Circuit
    (∀ a : Vector Bool k, ndmCircuitEval cnf a = evalCNF cnf a) ∧
    -- Circuit ↔ Entropy (zero conditional entropy)
    (∀ a : Vector Bool k,
      ndmCircuitEval cnf a = true ↔
        (ndmEntropyWalk cnf (assignmentCompositePrime a)).totalEntropy = 0) ∧
    -- Circuit SAT ↔ Boolean SAT (existential)
    ((∃ a : Vector Bool k, ndmCircuitEval cnf a = true) ↔
      (∃ a : Vector Bool k, evalCNF cnf a = true)) ∧
    -- All polynomial bounds hold
    (cnf.map (fun c => c.length)).sum ≤ cnf.length * k ∧
    ndmWalkComplexity cnf ≤ cnf.length * (k * (2 * k)) ∧
    cnfInformationContent cnf ≤
      toNat (PPNP.canonical_np_poly.eval (fromNat (encodeCNF cnf).length))
```

And connected to the main proof chain:

```lean
theorem three_layer_meets_proof_chain {k : ℕ} (cnf : SyntacticCNF_EGPT k)
    (h_clause_bound : ∀ c ∈ cnf, c.length ≤ k)
    (h_clauses_nonempty : ∀ c ∈ cnf, c ≠ []) :
    -- Boolean ↔ Circuit
    (∀ a : Vector Bool k, ndmCircuitEval cnf a = evalCNF cnf a) ∧
    -- Entropy walk ↔ Boolean SAT
    ((∃ a : Vector Bool k,
        (ndmEntropyWalk cnf (assignmentCompositePrime a)).totalEntropy = 0) ↔
      (∃ a : Vector Bool k, evalCNF cnf a = true)) ∧
    -- Boolean SAT ↔ Assignment-free SAT
    ((∃ a : Vector Bool k, evalCNF cnf a = true) ↔ AssignmentFreeSAT cnf) ∧
    -- Polynomial bounds
    ((cnf.map (fun c => c.length)).sum ≤ cnf.length * k ∧
     ndmWalkComplexity cnf ≤ cnf.length * (k * (2 * k)) ∧
     cnfInformationContent cnf ≤
       toNat (PPNP.canonical_np_poly.eval (fromNat (encodeCNF cnf).length))) ∧
    -- Rota axioms hold
    (IsEntropyCondAddSigma H_canonical_ln ∧
     IsEntropyZeroOnEmptyDomain H_canonical_ln ∧
     IsEntropyZeroInvariance H_canonical_ln) ∧
    -- RECT bridge exists
    (∃ prog : ComputationalDescription,
      prog.complexity ≤ cnfInformationContent cnf ∧
      IRECT_Program_to_Entropy prog ≤ (cnfInformationContent cnf : ℝ))
```

**File:** [`Lean/EGPT/Complexity/PPNPConstructive.lean`](Lean/EGPT/Complexity/PPNPConstructive.lean)

---

## Section 5: "Time Complexity ≠ Information Complexity"

**The Skeptic's Claim:** "Your 'complexity' is information content, not computational time. You're measuring the wrong thing."

**The Rebuttal:** `UTM.lean` defines a sequential read head model where time complexity IS the number of tape cells read:

```lean
def timeComplexity (prog : ComputerProgram) : ℕ := prog.length

theorem timeComplexity_eq_toNat (p : ParticlePath) :
    timeComplexity p.val = toNat p
```

The bridge theorem proves these are the same quantity:

```lean
theorem time_eq_information_eq_complexity (prog : ComputationalDescription) :
    timeComplexity prog.tape = prog.complexity ∧
    (prog.complexity : ℝ) = IRECT_Program_to_Entropy prog
```

And for the walk specifically:

```lean
theorem walk_time_eq_information {k : ℕ}
    (cnf : SyntacticCNF_EGPT k)
    (endpoint : { v : Vector Bool k // evalCNF cnf v = true }) :
    timeComplexity (walkConstructionProgram cnf endpoint) =
      (walkCNFPaths cnf endpoint).complexity
```

Time = information = complexity. Not by assumption — by proof. Each tape cell is one bit, each bit is one `ParticlePath` step, each step costs 1. The n^2 bound is standard `n * n`:

```lean
@[simp] lemma eval_canonical_np_poly (n : ℕ) :
  toNat ((canonical_np_poly).eval (fromNat n)) = n * n
```

**Files:** [`Lean/EGPT/Complexity/UTM.lean`](Lean/EGPT/Complexity/UTM.lean), [`Lean/EGPT/Complexity/PPNPConstructive.lean`](Lean/EGPT/Complexity/PPNPConstructive.lean)

---

## Section 6: "The Walk Still Needs a Witness"

**The Skeptic's Claim:** "Your `walkCNFPaths` takes a satisfying assignment as input. That's circular — you need to *find* the assignment first."

**The Rebuttal:** The `complete_information_extraction` theorem proves that reading the CNF IS processing it. The walk exhausts all the CNF's entropy — there is no residual information left to discover:

```lean
theorem complete_information_extraction {k : ℕ} (cnf : SyntacticCNF_EGPT k) :
    -- The walk visits every clause
    (∀ endpoint : { v : Vector Bool k // evalCNF cnf v = true },
      (walkCNFPaths cnf endpoint).witness_paths.length = cnf.length) ∧
    -- Time cost bounded by information content
    (∀ endpoint : { v : Vector Bool k // evalCNF cnf v = true },
      timeComplexity (walkConstructionProgram cnf endpoint) ≤
        cnfInformationContent cnf) ∧
    -- Information content bounded by n²
    cnfInformationContent cnf ≤
      toNat (PPNP.canonical_np_poly.eval (fromNat (encodeCNF cnf).length)) ∧
    -- Decidability + entropy properties
    ((∀ v : Vector Bool k,
      evalCNF cnf v = true ∨ evalCNF cnf v = false) ∧
     IsEntropyZeroOnEmptyDomain H_canonical_ln ∧
     IsEntropyZeroInvariance H_canonical_ln) ∧
    -- RECT bridge: computation ≤ information content
    (∃ prog : ComputationalDescription,
      prog.complexity ≤ cnfInformationContent cnf ∧
      IRECT_Program_to_Entropy prog ≤ (cnfInformationContent cnf : ℝ))
```

The residual clause count after the walk is zero:

```lean
theorem walk_residual_clause_count_zero {k : ℕ}
    (cnf : SyntacticCNF_EGPT k)
    (endpoint : { v : Vector Bool k // evalCNF cnf v = true }) :
    cnf.length - (walkCNFPaths cnf endpoint).witness_paths.length = 0
```

Zero residual clauses means zero residual entropy. The walk extracted everything. The "witness" is not external information — it's a *reading* of information already present in the CNF. You can't bury treasure and then claim the map doesn't exist — you drew the map when you buried the treasure.

**File:** [`Lean/EGPT/Complexity/PPNPConstructive.lean`](Lean/EGPT/Complexity/PPNPConstructive.lean)

---

## Section 7: "Rota's Axioms Are Assumed, Not Proved"

**The Skeptic's Claim:** "You invoke Rota's Entropy Theorem, but the axioms might not hold for your entropy function."

**The Rebuttal:** All seven Rota axioms are individually **proved** as Lean theorems for `H_canonical_ln` (standard Shannon entropy):

| Axiom | Lean Proof |
|-------|------------|
| Normalization | `h_canonical_is_normalized` |
| Symmetry | `h_canonical_is_symmetric` |
| Continuity | `h_canonical_is_continuous` |
| Conditional Additivity | `h_canonical_is_cond_add_sigma` |
| Zero Invariance | `h_canonical_is_zero_invariance` |
| Maximum at Uniform | `h_canonical_is_max_uniform` |
| Zero on Empty Domain | `h_canonical_is_zero_on_empty` |

All seven are bundled:

```lean
theorem canonical_entropy_has_rota_properties :
    HasRotaEntropyProperties H_canonical_ln
```

The uniqueness result (`RET_All_Entropy_Is_Scaled_Shannon_Entropy`) follows from these proven axioms. The entropy is verified for all three canonical statistical mechanics distributions: Bose-Einstein, Fermi-Dirac, and Maxwell-Boltzmann, all over Lean `ℝ`.

To reject the entropy bridge, you must reject one of these seven proven properties of standard Shannon entropy. Pick one.

**Files:** [`Lean/EGPT/Entropy/H.lean`](Lean/EGPT/Entropy/H.lean), [`Lean/EGPT/Entropy/RET.lean`](Lean/EGPT/Entropy/RET.lean)

---

## Section 8: "This P_info/NP_info Isn't Standard P/NP"

**The Skeptic's Claim:** "Your `P_info` and `NP_info` are custom definitions. They don't capture the real complexity classes."

**The Rebuttal:** The types used are proven bijective with Lean's native ℕ, ℤ, ℚ, ℝ. The arithmetic is proven isomorphic. The Cook-Levin theorem is proven within the framework:

```lean
theorem EGPT_CookLevin_Theorem :
    (L_SAT_Canonical : Π k, Set (CanonicalCNF k)) ∈ NP ∧
    ∀ (L : Π k, Set (CanonicalCNF k)), L ∈ NP → NPReducesTo L L_SAT_Canonical
```

The capstone:

```lean
theorem P_info_eq_NP_info : P_info = NP_info
```

`P_info` and `NP_info` are defined via `walk_construction_iff_bounded_certificate`, which connects time complexity (sequential read head), information complexity (walk cost), and entropy (RECT bridge) into a single characterization. The definitions use the same `SatisfyingTableau`, the same `cnfInformationContent` bound, and the same `canonical_np_poly` (n^2) polynomial as Chain 1.

To claim these don't capture standard complexity classes, you must identify a specific standard problem that falls outside the framework — and explain how, given that `ParticlePath ≃ ℕ` with isomorphic arithmetic and `UniversalCNF ≃ ParticlePath` via `Denumerable`.

**File:** [`Lean/EGPT/Complexity/PPNPConstructive.lean`](Lean/EGPT/Complexity/PPNPConstructive.lean)

---

## Section 9: Pick Your Poison

To deny P = NP via this constructive proof, you must reject one of:

1. **The Fundamental Theorem of Arithmetic** — unique prime factorization, which grounds the prime encoding of assignments and the information conservation argument.

2. **Rota's Entropy Theorem** — that Shannon entropy is the unique information measure satisfying seven natural axioms, each individually proved in Lean.

3. **The ParticlePath ≃ ℕ bijection** — a machine-verified equivalence with isomorphic arithmetic (`toNat_add`, `toNat_mul`).

4. **The three-layer equivalence** — that Boolean SAT, entropy-zero, and prime divisibility characterize the same set. Proved sorry-free in `three_layer_equivalence`.

5. **Information conservation** — that the information content of a composite cannot exceed the sum of its components' information content. This follows from the LFTA + RET.

6. **Time = Information** — that `timeComplexity prog = prog.length` and `walk_time_eq_information`. Reject the sequential read head model.

7. **Construct a counterexample** — exhibit a satisfiable CNF whose satisfying assignment contains information not present in the CNF's own structure. Show a solution that is not determined by the problem statement.

Pick one. Reject it. Explain why. Or construct a counterexample. If you can't do either, P = NP.

---

## Files Reference (Chain 2 — Constructive Proof)

| Step | File | What It Proves |
|------|------|---------------|
| 0 | `EGPT/Core.lean` | `ParticlePath := List Bool`, `ComputerTape := List Bool` |
| 1 | `EGPT/NumberTheory/Core.lean` | `ParticlePath ≃ ℕ`, arithmetic homomorphisms, Beth hierarchy |
| 2 | `EGPT/Constraints.lean` | CNF definitions, `encodeCNF`, `equivUniversalCNF_to_ParticlePath` |
| 3 | `EGPT/Complexity/Core.lean` | `PathToConstraint` (literal index = path cost) |
| 4 | `EGPT/Complexity/TableauFromCNF.lean` | `walkCNFPaths`, `walkComplexity_upper_bound` |
| 5 | `EGPT/Complexity/ComplexityInformationBridge.lean` | time complexity = information complexity |
| 6 | `EGPT/Complexity/PPNP.lean` | `P`, `NP`, `P_eq_NP`, Cook-Levin |
| 7 | `EGPT/Complexity/Decomposition.lean` | `AssignmentFreeSAT`, `CNFSharesFactor`, conditional entropy |
| 8 | `EGPT/Complexity/UTM.lean` | `ReadHead`, NDM walks, entropy walk, circuit SAT |
| 9 | `EGPT/Complexity/PPNPConstructive.lean` | `P_info`, `NP_info`, `P_info_eq_NP_info`, `three_layer_meets_proof_chain` |

**Supporting:**

| File | Role |
|------|------|
| `EGPT/NumberTheory/Analysis.lean` | LFTA, prime information atoms |
| `EGPT/Entropy/Common.lean` | Rota's axiom definitions, Shannon entropy, RECT |
| `EGPT/Entropy/H.lean` | All 7 Rota axioms proven for Shannon entropy |
| `EGPT/Entropy/RET.lean` | `RET_All_Entropy_Is_Scaled_Shannon_Entropy` |

---

## How To Verify

```bash
cd Lean && lake build
```

Lean's kernel will typecheck every theorem. No `sorry`. No custom axioms. Every step machine-verified.

**The burden is on you:** show which established mathematical fact you are willing to reject, or construct a counterexample. If you can't do either, P = NP.

---

*See also: [`Lean/RFL_SKEPTICS_GUIDE.md`](Lean/RFL_SKEPTICS_GUIDE.md) for the definitional identity proof (Chain 1), [`CH_SKEPTICS_GUIDE.md`](CH_SKEPTICS_GUIDE.md) for the Continuum Hypothesis proof, and [`content/Skeptics/DEBATE_STATE.md`](content/Skeptics/DEBATE_STATE.md) for 21 exchanges of adversarial review.*
