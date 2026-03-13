# EGPT Artifact Reference

Canonical catalog of all linkable Electronic Graph Paper Theory (EGPT) artifacts. Use this document when cross-referencing EGPT results in LaTeX papers, whitepapers, and external documentation.

**Base URL:** `https://eabadir.github.io/EGPT/`

All external-facing links use GitHub Pages URLs (not raw GitHub blob URLs). To construct a link, append the repo-relative path to the base URL.

**P=NP Proof Chain:** The formal proof consists of 8 sorry-free, axiom-free Lean 4 files containing 87 theorems. The chain typechecks end-to-end with `lake build`. No custom axioms are introduced; the final theorem `P_eq_NP` closes by `rfl`.

---

## Lean 4 Theorems

| Theorem | File | GitHub Pages URL | Description |
|---------|------|------------------|-------------|
| `P_eq_NP` | `Lean/EGPT/Complexity/PPNP.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Complexity/PPNP.lean` | The P=NP theorem — proved by reflexivity |
| `EGPT_CookLevin_Theorem` | `Lean/EGPT/Complexity/PPNP.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Complexity/PPNP.lean` | Cook-Levin: SAT is NP-Complete |
| `L_SAT_in_P` | `Lean/EGPT/Complexity/PPNP.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Complexity/PPNP.lean` | SAT is in P (constructive) |
| `L_SAT_in_NP` | `Lean/EGPT/Complexity/PPNP.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Complexity/PPNP.lean` | SAT is in NP |
| `equivParticlePathToNat` | `Lean/EGPT/NumberTheory/Core.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/NumberTheory/Core.lean` | Bijection ParticlePath ≃ ℕ ("address is the map") |
| `toNat_add_ParticlePath` | `Lean/EGPT/NumberTheory/Core.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/NumberTheory/Core.lean` | Addition respects bijection |
| `toNat_mul_ParticlePath` | `Lean/EGPT/NumberTheory/Core.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/NumberTheory/Core.lean` | Multiplication respects bijection |
| `walkComplexity_upper_bound` | `Lean/EGPT/Complexity/TableauFromCNF.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Complexity/TableauFromCNF.lean` | Certificate cost ≤ clauses × variables |
| `walkCNFPaths` | `Lean/EGPT/Complexity/TableauFromCNF.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Complexity/TableauFromCNF.lean` | Deterministic polynomial certificate construction |
| `evalCNF_normalize_eq_evalCNF` | `Lean/EGPT/Constraints.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Constraints.lean` | Normalization preserves CNF semantics |
| `encodeCNF_normalize_length_eq` | `Lean/EGPT/Constraints.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Constraints.lean` | Normalization preserves encoding length |
| `constrainedSystem_equiv_SAT` | `Lean/EGPT/Complexity/Physics.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Complexity/Physics.lean` | Path existence ↔ satisfiability |
| `underlying_state_evolution_is_memoryless` | `Lean/EGPT/Complexity/Physics.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Complexity/Physics.lean` | Markov property of state evolution |
| `EGPT_ContinuumHypothesis` | `Lean/EGPT/NumberTheory/ContinuumHypothesis.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/NumberTheory/ContinuumHypothesis.lean` | CH decidable and true (Hilbert #1) |
| `EGPT_GeneralizedContinuumHypothesis` | `Lean/EGPT/NumberTheory/ContinuumHypothesis.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/NumberTheory/ContinuumHypothesis.lean` | GCH decidable and true |
| `EGPT_cardinality_is_beth` | `Lean/EGPT/NumberTheory/ContinuumHypothesis.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/NumberTheory/ContinuumHypothesis.lean` | EGPT types have beth cardinalities |
| `RealityIsComputation'` | `Lean/EGPT/Physics/RealityIsComputation.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Physics/RealityIsComputation.lean` | Every physical system has computable program |
| `PhotonDistributionsHaveClassicalExplanationFromIndividualPaths` | `Lean/PPNP/Proofs/WaveParticleDualityDisproved.lean` | `https://eabadir.github.io/EGPT/Lean/PPNP/Proofs/WaveParticleDualityDisproved.lean` | Wave-particle duality disproof — BE from individual paths |
| `be_system_has_equivalent_program` | `Lean/EGPT/Physics/PhotonicCA.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Physics/PhotonicCA.lean` | Bose-Einstein system has computable program |
| `card_omega_be` | `Lean/EGPT/Physics/BoseEinstein.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Physics/BoseEinstein.lean` | BE state space cardinality |
| `card_omega_FD` | `Lean/EGPT/Physics/FermiDirac.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Physics/FermiDirac.lean` | FD state space cardinality = choose(N,M) |
| `p_FD_sums_to_one` | `Lean/EGPT/Physics/FermiDirac.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Physics/FermiDirac.lean` | FD distribution validity |
| `card_omega_MB` | `Lean/EGPT/Physics/MaxwellBoltzmann.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Physics/MaxwellBoltzmann.lean` | MB state space cardinality = N^M |
| `p_MB_sums_to_one` | `Lean/EGPT/Physics/MaxwellBoltzmann.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Physics/MaxwellBoltzmann.lean` | MB distribution validity |
| `H_canonical_uniform_eq_C_shannon` | `Lean/EGPT/Physics/UniformSystems.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Physics/UniformSystems.lean` | H = C × Shannon for uniform systems |
| `RET_All_Entropy_Is_Scaled_Shannon_Entropy` | `Lean/EGPT/NumberTheory/Analysis.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/NumberTheory/Analysis.lean` | Capstone: all entropy = scaled Shannon |
| `stdShannonEntropyLn_nonneg` | `Lean/EGPT/Entropy/H.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Entropy/H.lean` | Entropy non-negativity |
| `h_canonical_is_symmetric` | `Lean/EGPT/Entropy/H.lean` | `https://eabadir.github.io/EGPT/Lean/EGPT/Entropy/H.lean` | Entropy symmetry axiom |

## Papers

| Paper Title | Directory | GitHub Pages URL | Description |
|-------------|-----------|------------------|-------------|
| Without Attraction There Is Nothing | `content/Papers/Without_Attraction_There_Is_Nothing/` | `https://eabadir.github.io/EGPT/content/Papers/Without_Attraction_There_Is_Nothing/Without_Attraction_There_Is_Nothing.tex` | Wave-particle duality, DSE, Feynman diagrams, attraction as fundamental force |
| The Address Is the Map | `content/Papers/Address_Is_The_Map/` | `https://eabadir.github.io/EGPT/content/Papers/Address_Is_The_Map/Address_Is_The_Map.tex` | Core EGPT principle, P=NP via constructive number theory |
| P Probably Equals NP (Formal) | `content/Papers/PPNP_Paper/` | `https://eabadir.github.io/EGPT/content/Papers/PPNP_Paper/PprobablyEqualsNP_formal.tex` | Formal P=NP proof, Shannon entropy, least action |
| Rota's Entropy Theorem (Original Proof) | `content/Papers/RET_Paper/` | `https://eabadir.github.io/EGPT/content/Papers/RET_Paper/Rota_Entropy_Theorem_Original_Proof.tex` | Entropy uniqueness, Conditional Additivity, information cost |
| The Entropy Game | `content/Papers/Entropy Game/` | `https://eabadir.github.io/EGPT/content/Papers/Entropy%20Game/TheEntropyGame.tex` | Game-theoretic entropy in discrete spaces |
| Emergent Inverse-Square Laws (Gravity) | `content/Papers/GravityPaper/` | `https://eabadir.github.io/EGPT/content/Papers/GravityPaper/GravityPaper.tex` | Newton/Coulomb from random walks on lattices |
| Continuum Hypothesis Is Decidable | `content/Papers/ContinuumHypothesis/` | `https://eabadir.github.io/EGPT/content/Papers/ContinuumHypothesis/ContinuumHypothesis.tex` | Hilbert #1 resolved, beth staircase |
| The Man Who Understood Entropy | `content/Papers/TheManWhoUnderstoodEntropy/` | `https://eabadir.github.io/EGPT/content/Papers/TheManWhoUnderstoodEntropy/TheManWhoUnderstoodEntropy.tex` | Rota's Lean 4 formalization, seven-axiom proof |
| Structural Security of Crypto When P=NP | `content/Papers/AddressMap_And_Crypto/` | `https://eabadir.github.io/EGPT/content/Papers/AddressMap_And_Crypto/Structural_Security_Of_Crypto_When_PeqNP.tex` | P=NP doesn't break RSA, thermodynamic factorization cost |
| FRAQTL Whitepaper | `content/pyFRAQTL/` | `https://eabadir.github.io/EGPT/content/pyFRAQTL/FRAQTL_WhitePaper.md` | Classical QFT, O((log k)^3), FAT algorithm |

## Web Demos and Interactive Experiments

| Demo Title | Path | GitHub Pages URL | Description |
|------------|------|------------------|-------------|
| FRAQTL DevSDK (DSE Experiment) | `www/fraqtl_devsdk/` | `https://eabadir.github.io/EGPT/www/fraqtl_devsdk/index.html` | Integer-only physics engine: particle walk, wave interference, DSE, blackbody, harmonic oscillator |
| Gravity Simulation | `www/GravitySim/` | `https://eabadir.github.io/EGPT/www/GravitySim/index.html` | Random walk gravity, validates inverse-square derivation |
| GPU Heat Death (Info Erosion) | `www/GPUHeatDeath.html` | `https://eabadir.github.io/EGPT/www/GPUHeatDeath.html` | Floating-point info loss, IOPs vs FLOPs motivation |
| Fractal Wave (Cellular Automata) | `www/EGPTFactalWave.html` | `https://eabadir.github.io/EGPT/www/EGPTFactalWave.html` | Prime number CA waves, primes as fundamental frequencies |
| Address Is The Map Visualizer | `www/the-address-is-the-map-visualizer/` | `https://eabadir.github.io/EGPT/www/the-address-is-the-map-visualizer/index.html` | Interactive address=map principle |
| Rota Entropy Explorer | `www/RotaEntropy/` | `https://eabadir.github.io/EGPT/www/RotaEntropy/index.html` | Interactive RET axiom exploration |
| Number Uniformity Analysis | `www/EGPTNumberUniformity.html` | `https://eabadir.github.io/EGPT/www/EGPTNumberUniformity.html` | Entropy uniformity, Shannon coding visualization |
| Circuit SAT Demo | `egpt_circuit_sat/index.html` | `https://eabadir.github.io/EGPT/egpt_circuit_sat/index.html` | Half-adder experiment interactive visualization |
