# IDEAS: Five Ideas, One Repository

This repository contains five interlocking ideas from five authors across a century of mathematics, physics, and computation. Each idea is independently interesting. Together, they resolve the oldest open questions in mathematics and provide a practical blueprint for the next generation of computing.

**Central principle:** "The address is the map." In an information space where every element is maximally compressed, defining a problem is defining its solution.

---

## 1. You Might Be Looking For...

| You're looking for... | It lives in... | Start here |
|-----------------------|----------------|------------|
| The P=NP proof | ID5 (Abadir) + ID1 (Ulam), ID4 (Rota) | [SKEPTICS_GUIDE.md](SKEPTICS_GUIDE.md) or `cd Lean && lake build` |
| Hilbert's First Problem (Continuum Hypothesis) | ID5 (Abadir) | [CH_README.md](CH_README.md) and [CH_SKEPTICS_GUIDE.md](CH_SKEPTICS_GUIDE.md) |
| Integer-only AI / no floating point | ID2 (Von Neumann) | `cd EGPTMath && npm install && node test/EGPTTestSuite.js` |
| Rota's Entropy Theorem formalized | ID4 (Rota) | [RET_README.md](RET_README.md) |
| Quantum advantage / QFT benchmarks | ID2 (Von Neumann) + ID5 (Abadir) | [QFT Benchmark on Google Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) |
| How physics emerges from math | ID1 (Ulam) + ID3 (Einstein) | [EGPT_STORY.md](EGPT_STORY.md) |
| FRAQTL factorization / crypto implications | ID5 (Abadir) + ID2 (Von Neumann) | [content/pyFRAQTL/FRAQTL_WhitePaper.md](content/pyFRAQTL/FRAQTL_WhitePaper.md) |
| Does P=NP break cryptography? | ID5 (Abadir) + ID4 (Rota) | [content/pyFRAQTL/No Q-Day Threat.md](content/pyFRAQTL/No%20Q-Day%20Threat.md) |
| Consciousness / reality as computation | ID3 (Einstein) + ID4 (Rota) | [Lean/EGPT/Physics/RealityIsComputation.lean](Lean/EGPT/Physics/RealityIsComputation.lean) |
| Von Neumann's brain-computer diagnosis | ID2 (Von Neumann) | [content/Notes/Precision Loss.md](content/Notes/Precision%20Loss.md) |
| Monte Carlo, AI, and random walks | ID1 (Ulam) + ID2 (Von Neumann) | [content/Notes/Monte Carlo and AI.md](content/Notes/Monte%20Carlo%20and%20AI.md) |
| Cantor's diagonal argument flaw | ID5 (Abadir) | [content/Papers/Integer_Infinity_Tautology.md](content/Papers/Integer_Infinity_Tautology.md) |
| FLOPs-to-IOPs benchmarks / FAT performance | ID2 (Von Neumann) | [EGPTMath/FAT/FAT_README.md](EGPTMath/FAT/FAT_README.md) and [QFT Benchmark on Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) |
| Commercial implications / investment case | ID2 (Von Neumann) + ID5 (Abadir) | [content/Faster Abadir Transform BP/Executive_Summary.md](content/Faster%20Abadir%20Transform%20BP/Executive_Summary.md) |
| The complete P=NP paper (readable) | ID5 (Abadir) + ID4 (Rota) | [content/Papers/EGPT_PeqNP/PeqNP_QED.md](content/Papers/EGPT_PeqNP/PeqNP_QED.md) |
| "I just want to run something" | ID2 (Von Neumann) | Open [www/GPUHeatDeath.html](www/GPUHeatDeath.html) in a browser or `cd EGPTMath && node test/EGPTTestSuite.js` |
| Emergent gravity / inverse-square laws | ID1 (Ulam) + ID3 (Einstein) | Open [www/GravitySim/](www/GravitySim/index.html) -- watch gravity emerge from random walks |
| Double slit experiment explained | ID3 (Einstein) + ID1 (Ulam) | Open [www/fraqtl_devsdk/](www/fraqtl_devsdk/index.html) -- run the wave interference experiment |
| Why quantum computing can't outperform classical | ID3 + ID2 + ID5 | Read [Quantum Computing vs Fractal Compression](content/Papers/Quantum%20Computing%20vs%20Fractal%20Compression%20In%20a%20Chaotic%20Discontinuum.docx.md) |
| Physics simulation without differential equations | ID3 (Einstein) + ID1 (Ulam) | Open [www/fraqtl_devsdk/](www/fraqtl_devsdk/index.html) -- 5 experiments, zero force equations |
| The New Manhattan Project | All five ideas | [README.md — The New Manhattan Project](README.md#the-new-manhattan-project) |
| The triumvirate: proof + paper + experiment | ID1 + ID3 | [README.md — Computational Experiments](README.md#computational-experiments-the-third-leg) |
| The full story from first principles | All five ideas | [EGPT_STORY.md](EGPT_STORY.md) |

---

## 2. The Five Ideas

### ID1 -- Ulam: CGS from a Random Walk

#### Voice

In his unfinished essay "Physics for Mathematicians," Ulam proposed something radical: that the fundamental units of physics -- centimeters, grams, seconds -- could be *reconstructed* from a random walk. As Rota recounts in *Indiscrete Thoughts*: "One of the most striking is his proposal for the reconstruction of the CGS system on the basis of random walk." Ulam's question was not "what mathematics can do for physics, but what physics can do for mathematics." He saw that if you start with a particle flipping coins -- stepping left or right, recording a history -- distance, mass, and time emerge as statistical properties of the walk itself, not as externally imposed coordinates. **In EGPT, this becomes the `ParticlePath`: a `List Bool` whose length is the natural number it represents, and whose history is the data structure from which all of number theory, physics, and computation are constructed.**

#### Artifacts

| Artifact | Layer | Do This First | Relevant Roles |
|----------|-------|:-------------:|----------------|
| [Lean/EGPT/Core.lean](Lean/EGPT/Core.lean) -- `ParticlePath`, `RandomWalkPath` | Proof | | Mathematician, Proof engineer |
| [Lean/EGPT/NumberTheory/Core.lean](Lean/EGPT/NumberTheory/Core.lean) -- `equivParticlePathToNat` | Proof | | Mathematician, Complexity theorist |
| [Lean/EGPT/Complexity/Physics.lean](Lean/EGPT/Complexity/Physics.lean) -- Markov process model | Proof | | Physicist |
| [EGPTMath/EGPTNumber.js](EGPTMath/EGPTNumber.js) -- PPF encoding (`{N, offset}` mirrors ParticlePath) | Code | | AI/ML engineer, CS student |
| [EGPTMath/test/verify_ppf_bijection.js](EGPTMath/test/verify_ppf_bijection.js) -- ParticlePath-to-N demo | Code | CS student | CS student, Mathematician |
| [www/EGPTFactalWave.html](www/EGPTFactalWave.html) -- Photonic CA with random walk spawning | Demo | CS student | CS student, Physicist |
| [content/Books/Ulam/Science Computers And People.md](content/Books/Ulam/Science%20Computers%20And%20People.md) | Reading | | Physicist, Philosopher of mind |
| [content/Books/Rota/Indiscrete Thoughts.md](content/Books/Rota/Indiscrete%20Thoughts.md) -- "Stan Ulam" chapter | Reading | | Physicist, Mathematician |
| [GravitySim](www/GravitySim/index.html) -- Gravity from random walks | Demo | Physicist, CS student | Physicist, CS student, Founder/investor |
| [FRAQTL DevSDK](www/fraqtl_devsdk/index.html) -- Particle walk experiment | Demo | CS student | CS student, Physicist, QC enthusiast |
| [GravityPaper.tex](content/Papers/GravityPaper/GravityPaper.tex) -- Analytical derivation of inverse-square laws | Reading | | Physicist, Mathematician |

#### Connections

Ulam and von Neumann were best friends and collaborators at Los Alamos. Ulam's random walk gave them Monte Carlo -- the method that solved "intractable" quantum neutron diffusion by sampling rather than solving differential equations. Von Neumann recognized that Monte Carlo's success was a principle, not a trick: the statistical approach *is* the correct computational architecture (**ID2**). Ulam proposed deriving CGS units from a random walk; Einstein demanded a "purely algebraic theory" of physics free from the continuum -- these are the same program seen from two ends (**ID3**). Rota was Ulam's disciple; he formalized the random walk's information content into the entropy theorem that proves the walk is a lossless record of physics (**ID4**). The Abadir Completeness Theorem validates `ParticlePath` as a foundation not just for physics but for all of mathematics -- the walk can reconstruct everything (**ID5**).

---

### ID2 -- Von Neumann: The Statistical AI Computer

#### Voice

On his deathbed in 1957, von Neumann completed a devastating diagnosis of his own creation. In *The Computer and the Brain*, he showed that fixed-precision arithmetic self-destructs: "425 successive operations each of which increases an error by 5 per cent only" degrades precision by a factor of a billion. He concluded that "the nervous system appears to be using a radically different system of notation from the ones we are familiar with in ordinary arithmetics and mathematics: instead of the precise systems of markers where the position -- and presence or absence -- of every marker counts decisively in determining the meaning of the message, we have here a system of notations in which the meaning is conveyed by the statistical properties of the message." His final verdict: "a deterioration in arithmetics has been traded for an improvement in logics." **In EGPT, this trade is made exact: integer-only arithmetic (IOPs, not FLOPs) eliminates error accumulation entirely, and the `ParticlePath` encoding is precisely the statistical notation von Neumann envisioned -- where the length of a pulse train, not the precision of any single marker, carries all the information.**

#### Artifacts

| Artifact | Layer | Do This First | Relevant Roles |
|----------|-------|:-------------:|----------------|
| [EGPTMath/EGPTMath.js](EGPTMath/EGPTMath.js) -- Integer-only vector algebra (~6800 lines) | Code | AI/ML engineer | AI/ML engineer, Hardware engineer |
| [EGPTMath/test/EGPTTestSuite.js](EGPTMath/test/EGPTTestSuite.js) -- 157 tests, zero floats | Code | AI/ML engineer | AI/ML engineer, CS student |
| [EGPTMath/FAT/EGPTFAT.js](EGPTMath/FAT/EGPTFAT.js) -- Integer-only FFT/QFT | Code | QC enthusiast | Quantum computing enthusiast, Hardware engineer |
| [EGPTMath/FAT/FAT_README.md](EGPTMath/FAT/FAT_README.md) -- FAT architecture docs | Code | | Hardware engineer, QC enthusiast |
| [Lean/EGPT/Complexity/PPNP.lean](Lean/EGPT/Complexity/PPNP.lean) -- `P_eq_NP` | Proof | Complexity theorist | Complexity theorist, Proof engineer |
| [Lean/EGPT/Complexity/TableauFromCNF.lean](Lean/EGPT/Complexity/TableauFromCNF.lean) -- Certificate construction | Proof | | Complexity theorist, Proof engineer |
| [www/GPUHeatDeath.html](www/GPUHeatDeath.html) -- Floating-point erosion visualizer | Demo | Everyone | Founder/investor, Hardware engineer, AI/ML engineer |
| [content/Notes/Precision Loss.md](content/Notes/Precision%20Loss.md) -- Key von Neumann quotes | Reading | | AI/ML engineer, Hardware engineer |
| [content/Notes/Monte Carlo and AI.md](content/Notes/Monte%20Carlo%20and%20AI.md) -- "AI Is Monte Carlo" | Reading | | AI industry practitioner, AI/ML engineer |
| [content/Notes/ENIAC and El Capitan.md](content/Notes/ENIAC%20and%20El%20Capitan.md) -- FLOPs vs IOPs history | Reading | | Hardware engineer, Founder/investor |
| [FRAQTL DevSDK](www/fraqtl_devsdk/index.html) -- 5 physics experiments, zero floats | Demo+Code | CS student | AI/ML engineer, CS student, Hardware engineer |
| [Patent Application Background](content/Papers/Quantum%20Computing%20Fractal%20Compression%20In%20A%20Swarm%20Enviornment%20-%20Patent%20Application%20Background.md) -- Commercial fractal compression architecture | Reading | | Founder/investor, Hardware engineer |

#### Connections

Von Neumann's error analysis justifies why Ulam's random walk approach succeeds where conventional numerical methods fail: if 425 operations at 5% error per step degrade precision by a billion-fold, then any deep computation must avoid fixed-precision arithmetic (**ID1**). Von Neumann and Einstein diagnosed the same disease -- the continuous, fixed-precision mathematical framework -- from different organs of the body of knowledge: von Neumann attacked it from computation, Einstein from physics (**ID3**). Rota's entropy theorem explains why von Neumann's statistical computer can be *exact* rather than merely approximate: when entropy always adds up (conditional additivity), there is no rounding, no "arithmetical deterioration" (**ID4**). The "address is the map" principle resolves the Turing model's hidden assumption that von Neumann intuited but never formalized: in the Turing model, memory access is O(1), but in physical computation, the cost of reaching information *is* the information itself (**ID5**).

---

### ID3 -- Einstein: Algebraic Discrete Physics

#### Voice

Einstein spent his final years haunted by a suspicion he could not resolve. In his 1954 letter to Michele Besso: "I consider it quite possible that physics cannot be based on the field concept, i.e., on continuous structures. In that case, nothing remains of my entire castle in the air, gravitation theory included, [and of] the rest of modern physics." Earlier, in 1917, he had written to Dallenbach: "the question seems to me to be how one can formulate statements about a discontinuum without resorting to a continuum...But for this we unfortunately are still lacking the mathematical form. How much I have toiled in this direction already!!" He sought "a purely algebraic theory" of physics built from integers, and he died without finding one. **EGPT provides exactly that missing mathematical form: the `Physics/` module derives all three canonical statistical distributions (Bose-Einstein, Fermi-Dirac, Maxwell-Boltzmann) from discrete combinatorics, and `RealityIsComputation.lean` proves that every physical system has an equivalent computable program -- discrete, algebraic, integer-indexed.**

#### Artifacts

| Artifact | Layer | Do This First | Relevant Roles |
|----------|-------|:-------------:|----------------|
| [Lean/EGPT/Physics/RealityIsComputation.lean](Lean/EGPT/Physics/RealityIsComputation.lean) -- Every physical system is computable | Proof | Physicist | Physicist, Philosopher of mind |
| [Lean/EGPT/Physics/PhysicsDist.lean](Lean/EGPT/Physics/PhysicsDist.lean) -- BE/FD/MB unified | Proof | | Physicist, Mathematician |
| [Lean/EGPT/Physics/BoseEinstein.lean](Lean/EGPT/Physics/BoseEinstein.lean) | Proof | | Physicist, QC enthusiast |
| [Lean/EGPT/Physics/FermiDirac.lean](Lean/EGPT/Physics/FermiDirac.lean) | Proof | | Physicist |
| [Lean/EGPT/Physics/MaxwellBoltzmann.lean](Lean/EGPT/Physics/MaxwellBoltzmann.lean) | Proof | | Physicist |
| [Lean/EGPT/Physics/PhotonicCA.lean](Lean/EGPT/Physics/PhotonicCA.lean) -- BE systems are classically computable | Proof | | QC enthusiast |
| [EGPTMath/EGPTranscendental.js](EGPTMath/EGPTranscendental.js) -- PI as rational phase, not transcendental | Code | | Physicist, Mathematician |
| [www/EGPTfractal.html](www/EGPTfractal.html) -- Discrete algebraic fractal growth | Demo | CS student | CS student, Physicist |
| [www/RotaEntropy/TheGreatestDebate.html](www/RotaEntropy/TheGreatestDebate.html) -- 2,600-year timeline | Demo | | Philosopher of mind, Physicist |
| [content/docs/EGPT_Stories/Story of Nile Deriving Gravity.md](content/docs/EGPT_Stories/Story%20of%20Nile%20Deriving%20Gravity.md) | Reading | | Physicist, CS student |
| [GravitySim](www/GravitySim/index.html) -- Emergent Newton's law from random walks | Demo | Physicist | Physicist, CS student |
| [FRAQTL DevSDK](www/fraqtl_devsdk/index.html) -- 5 experiments: gravity, double slit, blackbody, atoms, waves | Demo+Code | CS student | CS student, Physicist, QC enthusiast |
| [GravityPaper.tex](content/Papers/GravityPaper/GravityPaper.tex) -- Analytical derivation: G and k_e as dimensional scaling factors | Reading | | Physicist, Mathematician |
| [Quantum Computing vs Fractal Compression](content/Papers/Quantum%20Computing%20vs%20Fractal%20Compression%20In%20a%20Chaotic%20Discontinuum.docx.md) -- Physics Computation Languages, fractal compression >= quantum | Reading | | QC enthusiast, Physicist, Complexity theorist |

#### Connections

The GravitySim and FRAQTL DevSDK now provide the first computable emergent models for gravity, the double slit experiment, wave interference, blackbody radiation, and atomic structure -- no prior computable emergent model existed for any of these phenomena, let alone all of them from the same discrete framework. The GravityPaper provides the rigorous analytical derivation proving that G and k_e are not fundamental constants but dimensional scaling factors converting informational probability to force units.

Einstein demanded a "purely algebraic theory" free from the continuum; Ulam proposed the random walk that provides exactly that discrete foundation (**ID1**). Einstein's conviction that reality is algebraic implies the correct computing architecture must also be algebraic and discrete -- which is precisely von Neumann's conclusion (**ID2**). Rota's entropy theorem provides the bridge from discrete information theory to continuous-looking physics that Einstein could not find: all three statistical mechanics distributions have entropy equal to C times Shannon entropy, captured by a single discrete measure (**ID4**). The proof that no intermediate cardinality exists between the integers and the reals -- that the Beth staircase is rigid and integer-stepped -- means Einstein's discrete physics is not merely possible but *necessary*: the mathematical universe itself is discrete at the level of the container (**ID5**).

---

### ID4 -- Rota: Entropy Is the Record of Truth

#### Voice

Rota taught that "success in mathematics does not lie in solving problems but in their trivialization. The moment of glory comes with the discovery of a new theory that does not solve any of the old problems but renders them irrelevant." His own contribution to this principle was the entropy theorem he derived in his unpublished 400-page probability textbook at MIT: the proof that the logarithm is the *unique* function satisfying all seven axioms of an information measure. Conditional additivity -- H(X,Y) = H(X) + H(Y|X), the requirement that information *always adds up* -- singles out Shannon entropy and no other. If entropy is the unique measure and Shannon's Coding Theorem guarantees that any quantity of entropy can be efficiently coded in C*log(n) bits, then every well-formed probabilistic system is computable. **In EGPT, this is formalized as `HasRotaEntropyProperties` in `Entropy/Common.lean`, with all seven axioms proven constructively for Shannon entropy in `Entropy/H.lean`. RET is the bridge theorem: it guarantees that information-space arithmetic is lossless, which is why "the address is the map" works.**

#### Artifacts

| Artifact | Layer | Do This First | Relevant Roles |
|----------|-------|:-------------:|----------------|
| [Lean/EGPT/Entropy/H.lean](Lean/EGPT/Entropy/H.lean) -- 7 Rota axioms proven for Shannon entropy | Proof | Mathematician | Mathematician, Proof engineer |
| [Lean/EGPT/Entropy/Common.lean](Lean/EGPT/Entropy/Common.lean) -- `HasRotaEntropyProperties`, RECT | Proof | | Proof engineer, Mathematician |
| [Lean/EGPT/Entropy/RET.lean](Lean/EGPT/Entropy/RET.lean) -- RET proof infrastructure | Proof | | Mathematician |
| [Lean/EGPT/NumberTheory/Analysis.lean](Lean/EGPT/NumberTheory/Analysis.lean) -- All entropy is scaled Shannon | Proof | | Mathematician, Physicist |
| [EGPTMath/EGPTMath.js](EGPTMath/EGPTMath.js) -- H(p*q)=H(p)+H(q) (RET Iron Law) | Code | | AI/ML engineer, Cryptographer |
| [EGPTMath/EGPTNumber.js](EGPTMath/EGPTNumber.js) -- PPF as Shannon coding | Code | | AI/ML engineer, CS student |
| [www/RotaEntropy/RotaEntropyProperties.html](www/RotaEntropy/RotaEntropyProperties.html) -- Interactive Bernoulli entropy demo | Demo | Mathematician | Mathematician, CS student |
| [www/EGPTNumberUniformity.html](www/EGPTNumberUniformity.html) -- Single-number entropy deep-dive | Demo | CS student | CS student, Mathematician |
| [www/EntropyUniformity.html](www/EntropyUniformity.html) -- Primes vs composites entropy | Demo | | Mathematician, Physicist |
| [content/Books/Rota/1992_Edition/ch8 - Entropy and Information.pdf](content/Books/Rota/1992_Edition/ch8%20-%20Entropy%20and%20Information.pdf) -- The "entropy game" derivation | Reading | | Mathematician, Proof engineer |
| [RET_README.md](RET_README.md) -- Rota Entropy Theorem walkthrough | Reading | Physicist | Physicist, Mathematician |
| [GravityPaper.tex](content/Papers/GravityPaper/GravityPaper.tex) -- Rota-EGPT Equivalence: force = Shannon entropy | Reading | | Mathematician, Physicist |

#### Connections

Rota was Ulam's disciple at Los Alamos. He formalized Ulam's intuition that the random walk is fundamental into a rigorous probability theory whose capstone is the entropy theorem: the walk generates a Bernoulli process, RET proves it has a unique information measure, Shannon's coding theorem guarantees that measure is efficiently codeable (**ID1**). Rota's theorem explains why von Neumann's integer-only statistical computer works without precision loss: if there is only one valid information measure, then a machine computing in units of that measure cannot accumulate rounding error (**ID2**). RET + Shannon's Coding Theorem is the "mathematical form" Einstein said was lacking -- all three statistical mechanics distributions have entropy = C*log(n), a single discrete measure covering all of physics (**ID3**). Rota's distinction between entropy (a continuous, real-valued measure of information *density*) and cardinality (a discrete, integer-valued measure of address-space *size*) is what makes the Continuum Hypothesis decidable: there is no Beth-1.5, just as there is no 1.5-bit storage container (**ID5**).

---

### ID5 -- Abadir: CH Decidable / Unique Representations

#### Voice

The central insight is embarrassingly simple: "Is there a whole number between 0 and 1?" In an information space where every element is maximally compressed -- where the Fundamental Theorem of Arithmetic serves as a Shannon coder and every natural number is a unique prime-factored address -- Cantor's diagonal argument does not escape the address space. It merely builds a new composite from existing primes. "You haven't left the map; you've just pointed to an empty lot on the map and built a house there." The Continuum Hypothesis is decidable because the hierarchy of infinities is isomorphic to the natural numbers: Level 0 is `ParticlePath`, Level 1 is `ParticlePath -> Bool`, and the step between them is atomic -- you cannot have half a function arrow, just as you cannot have half a bit. **In EGPT, this is the `AbadirCompletenessTheorem` in `ContinuumHypothesis.lean`: every type constructible in Lean's type theory from a countably infinite base has cardinality equal to some Beth number. The address is the map, and the map is complete.**

#### Artifacts

| Artifact | Layer | Do This First | Relevant Roles |
|----------|-------|:-------------:|----------------|
| [Lean/EGPT/NumberTheory/ContinuumHypothesis.lean](Lean/EGPT/NumberTheory/ContinuumHypothesis.lean) -- CH, GCH, `AbadirCompletenessTheorem` | Proof | Mathematician | Mathematician, Complexity theorist |
| [Lean/EGPT/NumberTheory/Core.lean](Lean/EGPT/NumberTheory/Core.lean) -- ParticlePath-to-N bijection | Proof | | Mathematician, Proof engineer |
| [Lean/EGPT/Complexity/PPNP.lean](Lean/EGPT/Complexity/PPNP.lean) -- `P_eq_NP` theorem | Proof | Complexity theorist | Complexity theorist, Cryptographer |
| [Lean/EGPT/Constraints.lean](Lean/EGPT/Constraints.lean) -- CNF as physical constraints | Proof | | Complexity theorist, Proof engineer |
| [EGPTMath/test/verify_ppf_bijection.js](EGPTMath/test/verify_ppf_bijection.js) -- Every N maps to an N-gon vertex | Code | CS student | CS student, Mathematician |
| [EGPTMath/FAT/EGPTFAT_PurePPF.js](EGPTMath/FAT/EGPTFAT_PurePPF.js) -- PPF encode/decode at I/O boundaries | Code | | Hardware engineer, QC enthusiast |
| [www/the-address-is-the-map-visualizer/](www/the-address-is-the-map-visualizer/) -- P=NP Test Center (React app) | Demo | Complexity theorist | Complexity theorist, CS student |
| [CH_README.md](CH_README.md) -- CH proof walkthrough | Reading | Mathematician | Mathematician, Philosopher of mind |
| [CH_SKEPTICS_GUIDE.md](CH_SKEPTICS_GUIDE.md) -- CH skeptic walkthrough | Reading | | Mathematician, Complexity theorist |
| [content/Papers/Integer_Infinity_Tautology.md](content/Papers/Integer_Infinity_Tautology.md) -- "Is there a whole number between 0 and 1?" | Reading | Philosopher of mind | Philosopher of mind, Mathematician |
| [content/Papers/EGPT_PeqNP/PeqNP_QED.md](content/Papers/EGPT_PeqNP/PeqNP_QED.md) -- Full P=NP paper (78 theorems, sorry-free) | Reading | Complexity theorist | Complexity theorist, Proof engineer |
| [SKEPTICS_GUIDE.md](SKEPTICS_GUIDE.md) -- P=NP skeptic walkthrough | Reading | Complexity theorist | Complexity theorist, Mathematician |
| [content/pyFRAQTL/FRAQTL_WhitePaper.md](content/pyFRAQTL/FRAQTL_WhitePaper.md) -- Classical QFT at O((log k)^3) | Reading | Cryptographer | Cryptographer, QC enthusiast |
| [Quantum Computing vs Fractal Compression](content/Papers/Quantum%20Computing%20vs%20Fractal%20Compression%20In%20a%20Chaotic%20Discontinuum.docx.md) -- Formal proof: fractal compression >= quantum | Reading | | QC enthusiast, Complexity theorist |

#### Connections

Ulam's random walk gives us `ParticlePath`, the data structure that makes P=NP provable and CH decidable. Because every walk is informationally primitive, the address space has no gaps and no hidden dimensions -- Cantor's diagonal fails because every walk is already in the enumeration by construction (**ID1**). The "address is the map" resolves the Free Address Fallacy: in the Turing model, memory access is O(1), but in EGPT, the cost of reaching an address *is* the address, which is why `walkCNFPaths` produces a certificate in polynomial time (**ID2**). The proof that no intermediate cardinality exists removes the last mathematical obstacle to Einstein's discrete physics (**ID3**). Unique representations give Rota's entropy theorem its full power: without them, you could encode the same information multiple ways and violate conditional additivity by double-counting. The Fundamental Theorem of Arithmetic, treated as a Shannon coder, prevents this (**ID4**).

---

## 3. Reading Paths by Role

### Code-First Roles

#### AI/ML Engineer

> *"Where are the IOPs? How do I replace floating point?"*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Run `cd EGPTMath && npm install && node test/EGPTTestSuite.js` | ID2 | 157 tests pass with zero floating-point operations. Integer-only vector algebra works. |
| 2 | Read [EGPTMath/EGPTNumber.js](EGPTMath/EGPTNumber.js) (first 100 lines) | ID4, ID5 | How numbers are represented as PPF vectors -- the Shannon-coded addresses. |
| 3 | Read [content/Notes/Monte Carlo and AI.md](content/Notes/Monte%20Carlo%20and%20AI.md) | ID1, ID2 | Why all of deep learning is Monte Carlo in disguise, and what that means for architecture. |
| 4 | Read [content/Notes/Precision Loss.md](content/Notes/Precision%20Loss.md) | ID2 | Von Neumann's diagnosis: why floating-point self-destructs after 425 operations. |
| 5 | Open [www/GPUHeatDeath.html](www/GPUHeatDeath.html) in a browser | ID2 | Watch floating-point error accumulate in real time across processor scales. |
| 6 | Read [EGPTMath/FAT/FAT_README.md](EGPTMath/FAT/FAT_README.md) | ID2 | How FAT replaces FFT with integer-only operations. |

#### CS Student / Learner Coder

> *"How do I get started coding with this?"*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Open [www/GPUHeatDeath.html](www/GPUHeatDeath.html) in a browser | ID2 | Why this project exists -- floating-point error is a real engineering problem. |
| 2 | Open [www/GravitySim/](www/GravitySim/index.html) in a browser | ID1, ID3 | Watch gravity emerge from random walks. Adjust mass and distance sliders to see the inverse-square law appear. |
| 3 | Open [www/fraqtl_devsdk/](www/fraqtl_devsdk/index.html) -- try the experiments | ID3, ID1 | Five physics simulations (double slit, waves, blackbody, atoms) -- all running from the same discrete engine, zero force equations. Tinker with parameters. |
| 4 | Read [content/docs/EGPT_Stories/The Story of EGPT.md](content/docs/EGPT_Stories/The%20Story%20of%20EGPT.md) | All | Father-daughter conversation format. No prerequisites. Introduces ParticlePath, the Iron Rule (1+1=2), and the Manhattan grid analogy. |
| 5 | Run `cd EGPTMath && npm install && node test/verify_ppf_bijection.js` | ID5 | See every natural number map to an N-gon vertex. The simplest runnable proof in the repo. |
| 5 | Run `cd EGPTMath && node test/EGPTTestSuite.js` | ID2 | See 157 tests pass. Read the test file to understand the API. |
| 6 | Read [content/Papers/EGPT_PeqNP/PeqNP_QED.md](content/Papers/EGPT_PeqNP/PeqNP_QED.md) | ID5 | The P=NP proof in readable markdown. |

#### Complexity Theorist

> *"I came for the P=NP claim. Convince me."*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Run `cd Lean && lake build` | ID5 | The entire proof chain typechecks: zero `sorry`, zero custom axioms. |
| 2 | Read [SKEPTICS_GUIDE.md](SKEPTICS_GUIDE.md) | ID5 | The skeptic's walkthrough of the P=NP argument: where does EGPT diverge from the standard model? |
| 3 | Read [content/Papers/EGPT_PeqNP/PeqNP_QED.md](content/Papers/EGPT_PeqNP/PeqNP_QED.md) | ID5, ID4 | The full proof paper: 78 machine-verified theorems, the Free Address Fallacy, certificate complexity bound. |
| 4 | Read [Lean/EGPT/Complexity/PPNP.lean](Lean/EGPT/Complexity/PPNP.lean) (line 378) | ID5 | The `P_eq_NP` theorem statement: 10 lines via `Set.ext` + `Iff.rfl`. |
| 5 | Read [Lean/EGPT/Complexity/TableauFromCNF.lean](Lean/EGPT/Complexity/TableauFromCNF.lean) | ID2, ID5 | `walkCNFPaths` and `walkComplexity_upper_bound` -- the certificate and its polynomial cost. |
| 6 | Read [Lean/EGPT_PROOFS_VALIDATION.md](Lean/EGPT_PROOFS_VALIDATION.md) | All | The complete theorem inventory showing only `propext`, `Quot.sound`, `Classical.choice`. |

#### Proof Engineer

> *"How is the Lean 4 proof structured? What techniques were used?"*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Read [Lean/EGPT_PROOFS_VALIDATION.md](Lean/EGPT_PROOFS_VALIDATION.md) | All | Full axiom inventory: the 8-file proof chain uses only standard Lean axioms. |
| 2 | Read [content/docs/EGPT_FTA.md](content/docs/EGPT_FTA.md) | ID4, ID5 | Lean artifact map: theorem names, file locations, logical dependency chain. |
| 3 | Run `cd Lean && lake build` | All | Verify the entire proof chain builds cleanly. |
| 4 | Read [Lean/EGPT/Complexity/PPNP.lean](Lean/EGPT/Complexity/PPNP.lean) | ID5 | The sorry-free P=NP proof. Study `Set.ext` + `Iff.rfl` pattern. |
| 5 | Read [Lean/EGPT/Entropy/H.lean](Lean/EGPT/Entropy/H.lean) | ID4 | Seven Rota axioms proven individually for Shannon entropy. Study the constructive verification pattern. |

#### Cryptographer

> *"If P=NP, is RSA broken? What about FRAQTL?"*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Read [content/pyFRAQTL/No Q-Day Threat.md](content/pyFRAQTL/No%20Q-Day%20Threat.md) | ID5 | P=NP does not break cryptography. Security comes from physical entropy, not the P/NP barrier. |
| 2 | Run the [QFT Benchmark on Google Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) | ID2, ID5 | See classical integer-only QFT outperform GPU FFT. Factor a number. |
| 3 | Read [content/pyFRAQTL/FRAQTL_WhitePaper.md](content/pyFRAQTL/FRAQTL_WhitePaper.md) | ID5 | FRAQTL algorithm: O((log k)^3) classical QFT, 256-bit factorization in 39s on one CPU. |
| 4 | Read [content/Papers/EGPT_PeqNP/PeqNP_QED.md](content/Papers/EGPT_PeqNP/PeqNP_QED.md) | ID5, ID4 | The actual P=NP proof to audit for cryptographic implications. |

#### Hardware / Infrastructure Engineer

> *"FLOPs to IOPs -- show me the benchmarks."*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Run the [QFT Benchmark on Google Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) | ID2 | Performance numbers: single CPU vs. 2,048 GPUs. |
| 2 | Read [content/Notes/ENIAC and El Capitan.md](content/Notes/ENIAC%20and%20El%20Capitan.md) | ID1, ID2 | ENIAC Monte Carlo vs. El Capitan QFT: the historical FLOPs-to-IOPs argument. |
| 3 | Read [content/Notes/Precision Loss.md](content/Notes/Precision%20Loss.md) | ID2 | Von Neumann's error accumulation analysis -- the engineering case for integers. |
| 4 | Read [EGPTMath/FAT/FAT_README.md](EGPTMath/FAT/FAT_README.md) | ID2 | FAT architecture: how integer-only FFT works, variant descriptions, known limitations. |
| 5 | Read [content/Faster Abadir Transform BP/Technical_Docs.md](content/Faster%20Abadir%20Transform%20BP/Technical_Docs.md) | ID2 | FAT C API: drop-in replacement for FFTW, CMSIS-DSP, Qiskit. |

### Theory-First Roles

#### Mathematician

> *"Number theory, set theory, formal methods -- what theorems are here?"*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Read [Lean/EGPT_PROOFS_VALIDATION.md](Lean/EGPT_PROOFS_VALIDATION.md) | All | Complete theorem inventory organized by module. |
| 2 | Run `cd Lean && lake build` | All | Verify everything typechecks. |
| 3 | Read [Lean/EGPT/NumberTheory/ContinuumHypothesis.lean](Lean/EGPT/NumberTheory/ContinuumHypothesis.lean) | ID5 | CH, GCH, and `AbadirCompletenessTheorem` -- Hilbert's First Problem resolved. |
| 4 | Read [content/Papers/Integer_Infinity_Tautology.md](content/Papers/Integer_Infinity_Tautology.md) | ID5 | "Is there a whole number between 0 and 1?" -- the tautological argument. |
| 5 | Read [content/Books/Rota/1992_Edition/ch8 - Entropy and Information.pdf](content/Books/Rota/1992_Edition/ch8%20-%20Entropy%20and%20Information.pdf) | ID4 | Rota's entropy derivation in his own words -- the "entropy game." |
| 6 | Read [Lean/EGPT/Entropy/H.lean](Lean/EGPT/Entropy/H.lean) | ID4 | All seven Rota axioms proven constructively for Shannon entropy. |

#### Physicist

> *"Discrete physics, CGS reconstruction, statistical mechanics."*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Read [EGPT_STORY.md](EGPT_STORY.md) | All | The narrative arc from Ulam's random walk to "reality is computation." |
| 2 | Open [www/GravitySim/](www/GravitySim/index.html) in a browser | ID1, ID3 | Watch gravity emerge from random walks in real time. First stochastic, non-field derivation of inverse-square laws. |
| 3 | Open [www/fraqtl_devsdk/](www/fraqtl_devsdk/index.html) -- try all 5 experiments | ID3, ID1 | Double slit, wave interference, blackbody radiation, atomic model -- all from the same discrete framework, zero force equations. |
| 4 | Read [content/Papers/GravityPaper/GravityPaper.tex](content/Papers/GravityPaper/GravityPaper.tex) | ID1, ID3, ID4 | Rigorous derivation: P(interaction) = (m1 m2)/(4r^2). G and k_e are dimensional scaling factors, not fundamental constants. |
| 5 | Read [Lean/EGPT/Physics/RealityIsComputation.lean](Lean/EGPT/Physics/RealityIsComputation.lean) | ID3 | One-line proof: every physical system has a computable program. |
| 6 | Read [Lean/EGPT/Physics/PhysicsDist.lean](Lean/EGPT/Physics/PhysicsDist.lean) | ID3, ID4 | Bose-Einstein, Fermi-Dirac, Maxwell-Boltzmann unified: entropy = C x Shannon for all three. |

#### Quantum Computing Enthusiast

> *"Is QFT really classically computable with integers?"*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Run the [QFT Benchmark on Google Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) | ID2, ID5 | Classical integer-only QFT at O((log k)^3). See it run. |
| 2 | Open [www/fraqtl_devsdk/](www/fraqtl_devsdk/index.html) -- wave interference experiment | ID3, ID1 | The double slit experiment running from discrete random walks. Answers Feynman's "impossible to explain" claim. |
| 3 | Read [Quantum Computing vs Fractal Compression](content/Papers/Quantum%20Computing%20vs%20Fractal%20Compression%20In%20a%20Chaotic%20Discontinuum.docx.md) | ID3, ID2, ID5 | The foundational paper: formal proof that fractal compression >= quantum computing. Physics Computation Languages defined. |
| 4 | Read [content/pyFRAQTL/FRAQTL_WhitePaper.md](content/pyFRAQTL/FRAQTL_WhitePaper.md) | ID5 | FRAQTL algorithm: detailed complexity analysis vs. quantum hardware. |
| 5 | Read [EGPTMath/FAT/FAT_README.md](EGPTMath/FAT/FAT_README.md) | ID2 | FAT architecture: Cooley-Tukey with exact phase-space arithmetic, zero floats. |
| 6 | Read [Lean/EGPT/Physics/PhotonicCA.lean](Lean/EGPT/Physics/PhotonicCA.lean) | ID3 | Proof that Bose-Einstein systems have equivalent classical programs via RECT. |

#### Philosopher of Mind

> *"Consciousness as computation? Reality as a cellular automaton?"*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Read [EGPT_STORY.md](EGPT_STORY.md) | All | The philosophical arc: entropy, information, consciousness, and what "reality is computation" means. |
| 2 | Read [content/Books/Rota/Indiscrete Thoughts.md](content/Books/Rota/Indiscrete%20Thoughts.md) | ID4, ID1 | Rota on meaning, mathematics, and the "new unit in science." Includes the Ulam chapter. |
| 3 | Read [content/Papers/Integer_Infinity_Tautology.md](content/Papers/Integer_Infinity_Tautology.md) | ID5 | "Is there a whole number between 0 and 1?" -- the simplest argument for why the continuum is a category error. |
| 4 | Read [content/docs/EGPT_Stories/An EGPT Story: The Impossible Audit.md](content/docs/EGPT_Stories/An%20EGPT%20Story%3A%20The%20Impossible%20Audit.md) | ID4, ID5 | Allegory: a physicist, mathematician, computer scientist, and auditor each try to solve the same problem. Rota's class meets Goldratt's "The Goal." |
| 5 | Read [Lean/EGPT/Physics/RealityIsComputation.lean](Lean/EGPT/Physics/RealityIsComputation.lean) | ID3 | The formal theorem: every physical system has an equivalent computable program. |
| 6 | Read [content/Notes/Precision Loss.md](content/Notes/Precision%20Loss.md) | ID2 | Von Neumann on statistical vs. arithmetic intelligence -- the brain does not compute with floats. |

### Outcome-First Roles

#### Founder / Investor

> *"What is the commercial angle? Show me the benchmark."*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Run the [QFT Benchmark on Google Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) | ID2 | The "1.277 billion x faster" claim, verified live. |
| 1b | Open [www/GravitySim/](www/GravitySim/index.html) in a browser | ID1, ID3 | Watch gravity emerge from random walks -- no equations, no fields, just particles and statistics. The most intuitive demo of what EGPT does. |
| 2 | Read [content/Faster Abadir Transform BP/Executive_Summary.md](content/Faster%20Abadir%20Transform%20BP/Executive_Summary.md) | ID2, ID5 | Business case: ARM-style licensing, $500M Series A. |
| 3 | Read [content/Faster Abadir Transform BP/Market_Research.md](content/Faster%20Abadir%20Transform%20BP/Market_Research.md) | ID2 | $12.6T addressable market analysis. |
| 4 | Open [www/GPUHeatDeath.html](www/GPUHeatDeath.html) in a browser | ID2 | The problem statement, made visceral: floating point erodes information at scale. |
| 5 | Read [content/docs/EGPT_Stories/The Story of EGPT.md](content/docs/EGPT_Stories/The%20Story%20of%20EGPT.md) | All | The narrative for understanding what EGPT is and why it matters. |

#### AI Industry Practitioner

> *"What does this mean for my work?"*

| Step | Action | Idea | What you learn |
|------|--------|------|----------------|
| 1 | Read [content/Papers/EGPT_PeqNP/PeqNP_QED.md](content/Papers/EGPT_PeqNP/PeqNP_QED.md) | ID5, ID4 | The P=NP paper: what was proven and how. |
| 2 | Read [content/Notes/Monte Carlo and AI.md](content/Notes/Monte%20Carlo%20and%20AI.md) | ID1, ID2 | "What we think of as AI is Monte Carlo in disguise." Connects EGPT to current practice. |
| 3 | Run `cd EGPTMath && npm install && node test/EGPTTestSuite.js` | ID2 | See the integer-only math library pass 157 tests. |
| 4 | Read [content/Faster Abadir Transform BP/Executive_Summary.md](content/Faster%20Abadir%20Transform%20BP/Executive_Summary.md) | ID2 | Business implications and benchmark numbers. |
| 5 | Read [content/docs/EGPT_Stories/The Story of EGPT.md](content/docs/EGPT_Stories/The%20Story%20of%20EGPT.md) | All | Accessible explanation of the full framework. |

---

## 4. External Resources

| Resource | URL | Description |
|----------|-----|-------------|
| QFT Benchmark (Google Colab) | [colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) | Runnable notebook: classical integer-only QFT vs GPU FFT. The "1.277 billion x faster" benchmark. Used by cryptographers, hardware engineers, QC enthusiasts, and investors. |
| GitHub Pages | *TBD* | Will host llms.txt, IDEAS.md, interactive demos, and the full proof chain. |

---

## Appendix: Proof Chain Architecture

The Lean proof chain has three independent branches and one set-theory result. None depend on custom axioms.

```
PROOF CHAIN (sorry-free, axiom-free):
  Core.lean (ParticlePath)
    -> NumberTheory/Core.lean (bijection N <=> ParticlePath)
      -> Constraints.lean (CNF encoding)
        -> Complexity/Core.lean (polynomial definitions)
          -> Complexity/TableauFromCNF.lean (certificate construction)
            -> Complexity/ComplexityInformationBridge.lean (complexity-information bridge)
              -> Complexity/Interpretation.lean (interpretation layer)
                -> Complexity/PPNP.lean [P_eq_NP]

ENTROPY (independent, Rota axioms as foundation):
  Basic.lean + Core.lean
    -> Entropy/Common.lean (HasRotaEntropyProperties, RECT)
      -> Entropy/RET.lean (monotonicity, conditional additivity)
        -> Entropy/H.lean [7 Rota axioms proven for Shannon entropy]

PHYSICS (motivation layer, not imported by proof chain):
  Entropy/* + NumberTheory/*
    -> Physics/Common.lean -> Physics/UniformSystems.lean
      -> Physics/BoseEinstein.lean, FermiDirac.lean, MaxwellBoltzmann.lean
        -> Physics/PhysicsDist.lean (all three unified)
          -> Physics/PhotonicCA.lean
            -> Physics/RealityIsComputation.lean [every physical system is computable]

SET THEORY (independent):
  NumberTheory/Core.lean
    -> NumberTheory/ContinuumHypothesis.lean [CH, GCH, AbadirCompletenessTheorem]
```

Build and verify: `cd Lean && lake build`

Run the EGPTMath test suite: `cd EGPTMath && npm install && node test/EGPTTestSuite.js`

Open a demo: `open www/GPUHeatDeath.html`
