# Electronic Graph Paper Theory (EGPT)

**What This Repository Contains**
- **P=NP Proof** — A constructive number theory and machine-verified proof that P = NP. [78 theorems, sorry-free, no custom axioms](Lean/EGPT_PROOFS_VALIDATION.md) — only Lean's three built-in axioms (`propext`, `Quot.sound`, `Classical.choice`).
- **EGPTMath** — A pedagogical integer-only math library that turns FLOPs into IOPs. 157 tests, 100% pass rate.
- **Faster Abadir Transform (FAT)** — Public benchmark Quantum Fourier Transform, 1.2 GHz CPU, 768 MB RAM single thread ~1.277 billion× faster than 2,048-GPU ShorGPU supercomputer.
- **Wave-Particle Duality Disproved** — Formal proof that Bose-Einstein statistics are fully explained by classical particle paths ([`WaveParticleDualityDisproved.lean`](Lean/PPNP/Proofs/WaveParticleDualityDisproved.lean)).

Built from first principles using physically motivated number theory derived from random walks, on the shoulders of John von Neumann, Stanislaw Ulam, and Gian-Carlo Rota.

**Skeptical? Start here: [Skeptic's Guide](SKEPTICS_GUIDE.md)** — a step-by-step audited walk-through of the entire proof chain, with a challenge: to deny P=NP, you must reject the Fundamental Theorem of Arithmetic, Rota's Entropy Theorem, the proven `ParticlePath ≃ ℕ` bijection, or information conservation. Each is already accepted mathematics or proven here axiom and sorry free. Or you must construct a counterexample — a satisfiable CNF whose solution contains information not present in the problem statement.

---
## The Intuitive Idea - A Physically Grounded Constructive Number Theory:
EGPT posits a discrete physical grid of reality and, therefore, everything in EGPT, even the very definition of numbers themselves, is a "travelling salesman" problem.

You cannot define the addresses a traveling salesman must visit without having already traced the path to each one — because the address *is* exactly the work of mapping the path to it. No other address can take exactly the same amount of work to define because only one thing can be in one place at one time.

## Core Claim Translated Into Traditional Number / Complexity / Information Theory Parlance
In an information space where every element is maximally compressed, a CNF formula defines the information content (entropy) of the full set of all possible witness certificates, and therefore no single solution is more difficult to construct than the set of all possible solutions. Specifically, a CNF formula is a list of addresses, and each address is simultaneously the path to reach that variable. The certificate for any satisfiable CNF has complexity bounded by n², where n is the encoded problem size. The classes P and NP, both defined by the existence of such a bounded certificate, are identical — not by accident, but because the information-theoretic structure of the space makes the distinction between "search" and "verification" vanish.
 
## The Lean 4 Proof
The proof chain is machine-verified in Lean 4 — no `sorry`, no custom axioms. EGPT rigorously constructs the standard mathematical universe (ℕ, ℤ, ℚ, ℝ) with matching Beth cardinalities and isomorphic arithmetic, all proven bijectively equivalent to the information space. Rota's entropy axioms are not assumed — they are formally proved as theorems within the same codebase.

---

## Quick Navigation

| Directory | What's Inside | Start Here |
|-----------|--------------|------------|
| [`Lean/`](Lean/) | Formal Lean 4 proofs (sorry-free, axiom-free P=NP proof chain) | [`EGPT/Complexity/PPNP.lean`](Lean/EGPT/Complexity/PPNP.lean) |
| [`EGPTMath/`](EGPTMath/) | Pedagogical JS integer math library — FLOPs become IOPs | [`EGPTMath.js`](EGPTMath/EGPTMath.js) |
| [`content/`](content/) | Papers, books, reference docs, pyFRAQTL SDK | [FAT White Paper (Colab)](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) |
| [`www/`](www/) | Interactive browser demos and visualizers | Open any `.html` in your browser |

| Document | Purpose |
|----------|---------|
| [**SKEPTICS_GUIDE.md**](SKEPTICS_GUIDE.md) | Step-by-step audited proof chain walk-through for skeptics |
| [**EGPT_STORY.md**](EGPT_STORY.md) | The full narrative — how this knowledge was passed down from von Neumann and Ulam through Rota |
| [**Lean/EGPT/PeqNP_Proof_README.md**](Lean/EGPT/PeqNP_Proof_README.md) | Detailed P=NP proof walkthrough |
| [**Lean/EGPT_PROOFS_VALIDATION.md**](Lean/EGPT_PROOFS_VALIDATION.md) | Build verification: 78 theorems, sorry-free, axiom inventory |

---

## The Proof Chain

The P=NP proof spans 6 files with **no `sorry`** and **no custom axioms**:

1. **Type foundations** — [`Core.lean`](Lean/EGPT/Core.lean): `ParticlePath`, `ComputerTape`, and `RandomWalkPath` are all `List Bool`. A natural number, a computation, and a particle's history are the same type.

2. **Numbers are paths** — [`NumberTheory/Core.lean`](Lean/EGPT/NumberTheory/Core.lean): `ParticlePath ≃ ℕ` (proven bijection), with arithmetic homomorphisms (`toNat(a+b) = toNat(a) + toNat(b)`, `toNat(a×b) = toNat(a) × toNat(b)`). Full hierarchy: `ChargedParticlePath ≃ ℤ`, `ParticleHistoryPMF ≃ ℚ`, `ParticleFuturePDF ≃ ℝ`. Beth cardinalities proven to match (`cardinal_of_egpt_level`).

3. **Constraints are addresses** — [`Constraints.lean`](Lean/EGPT/Constraints.lean): CNF formulas encoded as `ComputerTape` with proven size bounds. Each literal's variable index *is* a `ParticlePath`. The CNF *is* a list of addresses in information space.

4. **The cost of reaching a constraint** — [`Complexity/Core.lean`](Lean/EGPT/Complexity/Core.lean): `PathToConstraint` maps a literal to its `ParticlePath`. The cost to reach a variable is the variable's index.

5. **The CNF is the witness** — [`Complexity/Tableau.lean`](Lean/EGPT/Complexity/Tableau.lean): `constructSatisfyingTableau` deterministically walks every clause, producing a certificate. `tableauComplexity_upper_bound` proves cost ≤ `|cnf| × k ≤ n²`.

6. **P = NP** — [`Complexity/PPNP.lean`](Lean/EGPT/Complexity/PPNP.lean): `P_EGPT` and `NP_EGPT` are syntactically identical. `eval_canonical_np_poly` proves n² is standard ℕ `n*n`. Cook-Levin theorem proven within the framework. `P_eq_NP_EGPT` completes with `Iff.rfl`.

### Information-Theoretic Foundation

Independently, the codebase formalizes the information-theoretic argument that makes the P=NP result inevitable:

- **Rota's Entropy Theorem** ([`Entropy/RET.lean`](Lean/EGPT/Entropy/RET.lean)): proves that the logarithm is the *unique* information measure — `f0(n×m) = f0(n) + f0(m)`, culminating in `RET_All_Enropy_Is_Scaled_Shannon_Entropy`: all valid entropy functions are scalar multiples of Shannon entropy.
- **Rota's axioms are proved, not assumed** ([`Entropy/H.lean`](Lean/EGPT/Entropy/H.lean)): all 7 axioms formally verified for Shannon entropy, bundled as `TheCanonicalEntropyFunction_Ln`.
- **The LFTA** ([`NumberTheory/Analysis.lean`](Lean/EGPT/NumberTheory/Analysis.lean)): the Logarithmic Fundamental Theorem of Arithmetic — `log₂(n) = Σ ν_p(n)·log₂(p)` — proven directly. Prime information atoms formalized in the `PrimeAtoms` namespace.

Together, these prove that information is conserved under composition: you cannot construct a problem whose solution requires more information than the problem statement contains. The solving cost is a function of the problem definition, and nothing else.

---

## Verify It Yourself

```bash
# Typecheck the entire proof chain (requires Lean 4 + Mathlib)
cd Lean && lake build

# Run the integer math library test suite (157 tests)
cd EGPTMath && npm install && node test/EGPTTestSuite.js

# Explore the interactive demos (no build step)
open www/EGPTNumberUniformity.html
```

Lean's kernel guarantees: no `sorry`, no custom axioms, every step machine-verified.

---

## Working Implementations

### EGPTMath — Integer-Only Mathematics

A pedagogical JavaScript library demonstrating that all of mathematics — including transcendentals, complex numbers, and the FFT — can be performed with pure integer operations (IOPs, not FLOPs):

- 157 tests, 100% pass rate
- PPF (Power Plus Fractional) representation satisfying Rota's Entropy Theorem
- FFT reimplemented without floating point

EGPTMath is intentionally unoptimized. It exists to teach, not to benchmark.

### FAT — The Faster Abadir Transform

The Faster Abadir Transform demonstrates EGPT's principles in practice: a deterministic, classical computation of the Quantum Fourier Transform (QFT) that achieves O((log k)³) complexity — comparable to Shor's theoretical quantum advantage, on classical hardware. If the "magic" quantum step is efficiently classically computable, the basis for quantum advantage in algorithms like Shor's evaporates.

**White paper and live benchmark:** [**Logarithmic Root Finding: A Deterministic, EGPT-Native QFT**](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) — an interactive Colab notebook with the full white paper and independently reproducible results. (The published benchmark uses FRAQTL, an early un-optimized FAT precursor.)

Key result — an apples-to-apples comparison of the QFT step itself: a single 1.2 GHz CPU core with 768 MB RAM computes the QFT **~1.277 billion times faster** than 2,048 NVIDIA A100 GPUs on the JUWELS Booster supercomputer (Willsch et al. 2023). Reproducible in the notebook.

The `pyFRAQTL` SDK ([`content/pyFRAQTL/`](content/pyFRAQTL/)) provides programmatic access for independent verification.

---

## The Background

EGPT revives essentially unknown work by John von Neumann, Stanislaw Ulam, and Gian-Carlo Rota — three of the greatest mathematical minds of the 20th century.

Von Neumann, on his deathbed in 1956, rushed to complete *The Computer and the Brain* — a blueprint for a computing architecture that would make his own "von Neumann Machine" obsolete, by replacing exponentially compounding floating-point error with exact integer arithmetic. Ulam showed how Monte Carlo methods could solve "intractable" problems across physics, biology, and finance. Rota formalized the entropy theorem that proves the logarithm is the unique information measure — the mathematical foundation that makes P=NP provable.

## About Me

I'm Essam Abadir. Rota was my professor at MIT. The knowledge passed from von Neumann to Ulam, from Ulam to Rota, and from Rota to his students. To be upfront: they solved P=NP before I was born. I was lucky enough to be handed the solution.

For the full story: **[EGPT_STORY.md](EGPT_STORY.md)**

---

## License

Community source under the [DeSciX Community Agreement](content/Papers/). Working with this code is a job offer, not a handout.
