## EGPT_FTA: Guide to the Fundamental Theorem of Information Arithmetic & Prime Numbers

This document is the glue between:
1. The interactive web demo (`index.html` + `RotaEntropyProperties.js` Sections 5–12)
2. The Lean formalization (notably `EGPT/NumberTheory/Analysis.lean` and supporting entropy modules)
3. The classical Fundamental Theorem of Arithmetic (FTA)

Its goal: show how multiplicative structure of naturals becomes additive structure of information when calibrated by a single physical unit (a fair coin = 1 bit).

---
## 1. Core Lean Artifacts (Renamed / Intuitive)

| Concept | Lean Name | Location |
|---------|-----------|----------|
| Calibration: fair coin = 1 bit | `entropy_of_fair_coin_is_one_bit` | `EGPT/Entropy/H.lean` |
| Log decomposition over primes | `EGPT_Fundamental_Theorem_of_Arithmetic_via_Information` | `EGPT/NumberTheory/Analysis.lean` |
| Uniform entropy = sum of prime bits | `EGPT_Fundamental_Theorem_of_Arithmetic_via_Entropy_Bits` | `EGPT/NumberTheory/Analysis.lean` |
| Factorial additive step | `PrimeAtoms.logb_factorial_succ` | `EGPT/NumberTheory/Analysis.lean` |
| Factorial prime expansion | `PrimeAtoms.factorial_information_decomposition` | `EGPT/NumberTheory/Analysis.lean` |
| Incremental factorial info | `PrimeAtoms.factorial_information_increment` | `EGPT/NumberTheory/Analysis.lean` |
| Bernoulli class entropy sum | `total_entropy_from_classes_eq_shannon_formula` | `EGPT/NumberTheory/Analysis.lean` |

All prime/log identities reduce to library lemma `logb_nat_eq_sum_factorization` specialized to base 2.

---
## 2. Web Section Mapping

| Web Section | Idea | Lean Connection |
|-------------|------|-----------------|
| 5 Conditional Additivity | H_{n+1}=H_n+H₁ for IID | Used as prototype for additive decomposition |
| 6–8 Code length ↔ log₂ | Uniform entropy = log₂(2^n)=n | Coin calibration lemma |
| 9 Irreducible Classes | Binomial partitioning | `generateIrreducibleClasses`, class sum theorem |
| 10 Prime Atoms | log₂ n = Σ e_p log₂ p | `EGPT_Fundamental_Theorem_of_Arithmetic_via_Information` |
| 11 Efficient Factorization | Extract atoms incrementally | Uses identity + prime enumeration (JS) |
| 12 Pascal Row Primes | Binomial coeff factor lenses | Bernoulli class ↔ combinatorial coefficient logs |

The Bernoulli process (additive per independent trial) is the pedagogical gateway to prime factor additivity (additive per independent prime power).

---
## 3. Logical Chain

1. Axioms (Rota entropy properties) ⇒ any admissible entropy is logarithmic up to a positive scale C.
2. Calibration (`entropy_of_fair_coin_is_one_bit`) ⇒ C=1 for base 2.
3. Therefore uniform entropy on n states: H = log₂ n.
4. Factorization of n = ∏ p^ν_p ⇒ log₂ n = Σ ν_p log₂ p (`EGPT_Fundamental_Theorem_of_Arithmetic_via_Information`).
5. Uniform entropy decomposition ⇒ `EGPT_Fundamental_Theorem_of_Arithmetic_via_Entropy_Bits`.
6. Extend multiplicative family to factorial: log₂ n! = Σ_{p≤n} (Σ floor(n/p^k)) log₂ p (Legendre) implemented via `PrimeAtoms` namespace.
7. Increment (n! → (n+1)!) adds exactly log₂(n+1) bits (mirrors IID step additivity).
8. Pascal row coefficients act as aggregated class multiplicities; summing class information recovers n bits (Section 12 visualization).

---
## 4. Number Theory Mental Model

Multiplicative world (Nat): product, prime powers, factorial
⇓ via log₂ (forced by axioms + calibration)
Additive world (Info): sums of atomic contributions log₂ p, linear accumulation for factorial and IID trials.

Thus: Primes are the irreducible information atoms; binomial coefficients describe how IID structure distributes probability mass; factorial encodes cumulative inclusion of all integers 1..n; Legendre exponents count how many times each atom appears inside that cumulative product.

---
## 5. Reading the Lean Code Efficiently

Suggested order if you are new:
1. Skim `entropy_of_fair_coin_is_one_bit` (unit calibration).
2. Jump to `EGPT_Fundamental_Theorem_of_Arithmetic_via_Information` (core algebraic bridge).
3. Look at `EGPT_Fundamental_Theorem_of_Arithmetic_via_Entropy_Bits` (entropy phrasing wrapper).
4. Inspect `PrimeAtoms` namespace for factorial/Legendre style lemmas.
5. Review `total_entropy_from_classes_eq_shannon_formula` to see IID combinatorial expansion technique reused conceptually in Pascal / factorial views.

Proof bodies intentionally minimal: we rely on mathlib's prime factorization sum lemma and standard transformations (powers, products, logarithm laws). This keeps the surface area small for future extension or porting.

---
## 6. Connecting Sections 10–12 (Primes, Factorization, Pascal)

Section 10 (log₂ n decomposition): immediate application of `EGPT_Fundamental_Theorem_of_Arithmetic_via_Information`.

Section 11 (efficient factorization): algorithmic reflection. Trial division finds primes; each discovery justifies adding e·log₂ p to a running sum that must converge to log₂ N. Lean backs correctness of the target sum; JS shows constructive accumulation.

Section 12 (Pascal row): The row (C(n,k)) supplies multiplicities of outcome classes in the Bernoulli sample space. Factor each C(n,k): its prime exponents indicate how many times each atom participates in that class count. Probability weighting (C(n,k)/2^n) redistributes the total n bits of uniform entropy over prime atoms. This is a didactic fusion: combinatorics (Pascal) + arithmetic (factorization) + information (log additivity).

---
## 7. Extending / Modifying

TBD

---
## 8. FAQ Quick Answers

Q: Why base 2?  A: Calibration choice. Any base is permissible; base 2 chosen because a fair coin defines the operational bit.
Q: Where is uniqueness of prime factorization used?  A: Hidden inside `factorization` library theorems feeding `logb_nat_eq_sum_factorization`.
Q: Are primes “independent” in an information sense?  A: Log converts multiplicative independence into additive linear independence (up to rational relations among logs—which do not affect integer exponent recovery given uniqueness in ℕ).
Q: How does factorial help?  A: It aggregates all integers up to n, letting us count cumulative prime appearances (Legendre exponents) and compare incremental information steps.

---
## 9. Minimal Reference Snippets

Log decomposition (numbers): log₂ n = Σ_p ν_p(n) log₂ p.
Factorial step: log₂((n+1)!) = log₂(n!) + log₂(n+1).
Entropy-class sum: Σ_k C(n,k) * [−p^k (1−p)^{n−k} log₂( p^k (1−p)^{n−k}) ] = n * H(Bernoulli(p)).

---
## 10. Verification Notes

Lean side: proofs compile relying on base mathlib factorization + logarithm identities. JS side: numeric tables check Σ e·log₂ p ≈ log₂ n (Section 10) and Σ class contributions ≈ n * H₁ (Sections 5,9,12). Discrepancies bounded by floating error.

---
If you are adding new educational panels, mirror them with tiny, lemma-scoped formal artifacts using existing patterns: define a helper, reduce to `logb`, apply a library lemma, wrap in entropy phrasing if needed.

This keeps the codebase approachable while preserving formal trust.