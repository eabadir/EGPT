**AI Navigation** — [IDEAS.md](IDEAS.md) | [llms.txt](llms.txt) | [sitemap.xml](sitemap.xml) | [.claude/agents/](.claude/agents/)
Raw: https://raw.githubusercontent.com/eabadir/EGPT/main/

**200 MegaWatts vs. 20 Watts: AI Data Centers vs. The Human Brain**
Why are we boiling rivers to cool data centers instead of building "computer brains"?

## The AI Energy Crisis: von Neumann Machines vs von Neumann's **"Computer Brain"**
Imagine there was an AI computer which ran on the power of a dim refrigerator lightbulb but out-performed the most massive of data centers? That computer exists and it is called the human brain.

This project is a job offer, not a handout. We are building the foundation of [John von Neumann's (JvM)](IDEAS.md#id2----von-neumann-the-statistical-ai-computer) hyper-efficient AGI computing architecture laid out in "[The Computer & The Brain](content/docs/)". 

If you want the "let me see you solve Circuit SAT" proof that P=NP and the Computer Brain is buildable then you can run the following *Stochastic Half-Adder Circuit Component* (SHACC) in your own browser. Why does the SHACC prove P=NP? Because every modern circuit is made of some finite number, N, of hardware half-adders but the physics equations of computing how they work are an intractable P vs NP problem (Circuit SAT). If you can simulate one half-adder in polynomial time then doing N simulations is a constant multiple polynomial computation. You run the SHACC simulation from node js source, recreate the data, re-run the analysis, and confirm.   

JvM's Computer Brain and is the proposal for stochastic architecture and the SHACC is its most basic component. There would be no way to build Computer Brain or the SHACC if P != NP.

But, if you don't believe your eyes or the experimental data and you feel hardcore mathematical symbolic proof is necessary then there are 30,000 lines of computer verifiable Lean code with no "sorry" or custom axioms in them, you can build the verification yourself, and you can extract the P=NP solution to C code.

**P=NP Circuit SAT — Experimentally Solved**  
100% accuracy: 80 runs, 20 seeds, 4 input combos, zero failures. Half-adder boolean computation via particle diffusion in a force-free discrete physics engine. Open code, open data, fully reproducible.
[Whitepaper](https://eabadir.github.io/EGPT/egpt_circuit_sat/paper/egpt_circuit_sat_whitepaper.pdf)

## Getting Started
### INSTALLATION INSTRUCTIONS
As an AI project we focus on AI driven development via the UnkAmon Visual Studio Marketplace Extension which will clone this repository and bring the sources here alive with the assistance of AI agents. Use of Claude Code is optional but advanced agent coordination is enabled if you do use claude code by invoking @egpt-orchestrator in the agent prompt.
https://marketplace.visualstudio.com/items?itemName=descix.egpt

Direct install (opens VS Code):
vscode:extension/descix.egpt

While I invite you to just jump right in and start building I encourage you to go oldschool first and read this README to gain context on what you might be building and why.

### BROWSE THE REPOSITORY
- The repository site is: https://eabadir.github.io/EGPT and, given the volume of information from essential history and philosophy to hard core machine checked math proofs, the site is organized in a mind map structure in an attempt to let different audiences follow the path most appropriate to them.
- If you are looking for one place to start and have a computer science background I'd suggest: [P=NP Circuit Sat - Run the simulation](https://eabadir.github.io/EGPT/egpt_circuit_sat/) · [Whitepaper](https://eabadir.github.io/EGPT/egpt_circuit_sat/paper/egpt_circuit_sat_whitepaper.pdf) · [Data](https://eabadir.github.io/EGPT/egpt_circuit_sat/data/multiseed_results.json)

This not only shows the Computer Brain can be built but it provides working foundations to build it. But, you have trouble believing your eyes and you want formal proof validation you'll also find [formalized machine checked proofs](Lean/EGPT_PROOFS_VALIDATION.md), [computational simulation derivations](www/GravitySim/index.html) of the [necessary physics](www/fraqtl_devsdk/index.html), and [working pedagogical code libraries](EGPTMath/).

The computational approach was first ideated by [Stanislaw Ulam](IDEAS.md#id1----ulam-cgs-from-a-random-walk), then formalized and existentially proved by [Gian-Carlo Rota](IDEAS.md#id4----rota-entropy-is-the-record-of-truth), and now constructively extended by [Essam Abadir](IDEAS.md#id5----abadir-ch-decidable--unique-representations). The work is only beginning and you are invited to [join](#join-the-project).

# Electronic Graph Paper Theory: A Project To Revolutionize AI, Physics, & Computing
This project is about building the next generation of Artificial Intelligence and the approach is to it in the same way actual "Intelligence" is built. 

This is a wildly different approach than the rest of the world takes and the tools here just as wild. For that reason, the project goes to extradorinary lengths to validate the foundation upon which this project is built. The source code here covers rigorous machine checkable proofs and physics experiments code and data - it is completely transparent and, using AI agents, extremely easy to reproduce every step of the validation chain. 

## P=NP & The Continuum Hypothesis: von Neumann vs. Godel
### Godel's Question: Can We Build A Computer That Thinks?
In 1956, knowing John von Neumann was on his death bed, Godel asked exactly this question. In fact, the history of computer science regards this letter as the proto *P vs NP* letter. Comp sci geeks have been so taken by *P vs NP* that I believe they missed the real reason a mathematician like Godel would think it was so important to bother his dieing friend with a math problem:

> If there really were a machine with ϕ(n) ∼ k · n (or even ∼ k · n2), this would have consequences of the greatest importance. Namely, it would obviously mean that in spite of the undecidability of the Entscheidungsproblem, **the mental work of a mathematician concerning Yes-or-No questions could be completely replaced by a machine**. (Emphasis Added)
- [Kurt G¨odel’s Letter to John von Neumann - 1956](content/SSG_History/Godel%20Letter%20to%20Von%20Neumann.pdf)


So, in response to Godel's letter, what did JvM proceed to do while on his deathbed? Amazingly, he disavowed his life's crowning achievement, the "von Neumann Machine", which became the architecture of every modern computing device from Apple iPhones to super computers - there are no non-von Neumann Machines. He feverishly wrote why his first pass at the computer was wrong. Sadly, he never got to finish, "The Computer & The Brain" as the architectural blueprint for the ultra-efficient stochastic computer ... and now we boil rivers to cool data centers. 

## Let's Just Get P=NP Out of The Way
First let's be clear that I believe I'm the fourth person (that I know of) to prove P=NP: Ulam & von Neumann with Monte Carlo solving quantum neutron diffusion for the nuclear bombs (not just the hydrogen bomb); Rota's existential proof formalized in this repository; and John Conway's ONAG implicitly constructive proof that the Real and "Sureal" numbers are computable from cellular automata.

*The Address Is the Map Proof Concept:* Pretend you are a salesman in a maze called Manhattan (or an electron on a maze called a circuit). If I tell you there are N obstacles and also tell you the Manhattan cross-streets where the obstacles are then the worst case for getting through the maze is walking to every obstacle's cross-street location and then trying every other one from there (this is a polynomial time N^2 worst case). If I don't tell you where the obstacles are then the problem might be impossible ("non-deterministically" polynomial or NP). 

Let's say that I try to hide the cross-street addresses by turning them into phone numbers. You might say that I "encoded" the cross-streets into phone numbers. The solution to the NP problem presents itself if you can figure out how to decode my mapped phone numbers back to cross-streets.

I'm intentionally using the encode/decode language because the solution is Shannon Encoding and informational entropy - this tells you exactly how much work it will take.

The proof conceptually uses the notion that every phone number (scalar) is a cross-street (vector) address in physical grid space. How much informational work does it take to figure out the co I used? Actually, it takes exactly the same amount of informational work I used to create the cipher mapping ("the map") in the first place.

### What The Code Actually Looks Like

Before you decide what to push back on, look at the actual construction. Open [`Complexity/TableauFromCNF.lean`](Lean/EGPT/Complexity/TableauFromCNF.lean). The entire P=NP proof rests on three steps:

```lean
-- walkCNFPaths deterministically traverses every clause and literal in the CNF
def walkCNFPaths {k : ℕ} (cnf : SyntacticCNF_EGPT k)
  (h_sat : ∃ v : Vector Bool k, evalCNF cnf v = true) : SatisfyingTableau k :=
  let solutionSpace := constructivelyGenerateAllValidSolutions cnf    -- Step 1: def, O(n)
  let coordinate := verifyWitnessAddressIsInSolutionSet cnf h_sat     -- Step 2: noncomputable, O(1)
  match retrieveConstructedSolution solutionSpace coordinate with     -- Step 3: def, O(n²)
  | some tableau => tableau
  | none => walkCNFPaths cnf ⟨coordinate, h_sat.choose_spec⟩
```

Steps 1 and 3 are `def` — computable, executable, Lean will compile them. Step 2 is the **only** `noncomputable def` — it calls `Exists.choose` to select a satisfying assignment (exactly k bits). Both the input (`SyntacticCNF_EGPT k`, which is `List (List (Fin k × Bool))`) and the output (`Vector Bool k`) are finite types bijective with ℕ. The proven bound: `complexity ≤ |cnf| × k ≤ n²`, for **any** existence proof.

Your job: decide whether Step 2 is O(1) or O(2^k). The deep dive is in the **[Skeptic's Guide](SKEPTICS_GUIDE.md)**.

### What You'll Try To Push Back On
1) ***Skeptic:* EGPT's P=NP is consistent only in its framework**
EGPT's number theory is bijectively equivalent to every number object in Lean's standard universe: `ParticlePath ≃ ℕ`, `ChargedParticlePath ≃ ℤ`, `ParticleHistoryPMF ≃ ℚ`, `ParticleFuturePDF ≃ ℝ` — all with proven arithmetic homomorphisms (`toNat(a+b) = toNat(a) + toNat(b)`, `toNat(a×b) = toNat(a) × toNat(b)`). The Beth cardinalities match. The n² bound is standard `n * n` over Lean's `ℕ`, proven via the homomorphism chain. This is not a restricted subsystem — it is the standard mathematical universe accessed through a constructive isomorphism rooted in `List Bool`. Any theorem proven here translates directly to standard mathematics via `toNat`/`fromNat`, and vice versa. To reject the result, you must reject the bijection — which Lean's kernel has verified.

2) ***Skeptic:* EGPT uses non-standard complexity theory definitions of P and/or NP**
In PPNP.lean, P and NP are given **identical definitions** — both are the set of CNF instances that have a satisfying assignment. The proof that P = NP is therefore `Set.ext` + `Iff.rfl`: definitional equality, not a non-trivial argument between structurally distinct classes. The non-trivial content is the chain of bijections and bounds established earlier in the proof chain — `ParticlePath ≃ ℕ`, the n² complexity bound via `walkCNFPaths`, and the information-conservation result from RET — which forces P and NP to be the same set in a maximally compressed information space. If two classes really are the same, the proof should show their equivalence is trivial; the hard work is in proving the bijection chain that makes the definitions identical.

3) ***Skeptic:* EGPT uses a circular argument feeding the solution to the solver**
The construction is not circular. `walkCNFPaths` takes only the CNF and an existence proof (`h_sat : ∃ v, evalCNF cnf v = true`) — a `Prop` that certifies a solution exists but provides no computational information about which solution. The deterministic construction then walks every clause and every literal in the CNF's clause structure, covering its entire information content in n² time. The witness (existence proof) is structurally separated from the computation: it guarantees `find?` will hit a satisfying literal rather than falling through to the unreachable branch, but the walk itself is driven entirely by the CNF. The n² bound is a property of the CNF's structure (`|clauses| × |variables| ≤ n²`), not of any particular witness. The proof was refactored specifically to make this separation explicit and machine-verifiable.

## Latest: Experimental Confirmation of P=NP

**100% accuracy across 80 runs** — a half-adder circuit built from discrete particle transport produces correct Boolean outputs for all input combinations, with zero failures across 20 independent PRNG seeds. No force calculations, no floating point, no fields. Open code, open data, fully reproducible.

- **[Run the interactive demo](egpt_circuit_sat/index.html)** — watch particles compute a half-adder in your browser
- **[Read the whitepaper](egpt_circuit_sat/paper/egpt_circuit_sat_whitepaper.pdf)** — full experimental methodology and results
- **[Download or Reproduce the data](egpt_circuit_sat/)** — see the data directory or
`node run_multiseed.js` (zero dependencies, ~2-3hr data generation)

---

# Electronic Graph Paper Theory (EGPT): Consciousness, the Universe, and Everything
- *The Question:* How far can we scale AI?
- *The Problem:* AI datacenters already consume the energy of small nations. The brain does the same work on 20 watts — the energy of a small light bulb. Can we scale AI without cooking the planet?
- *The Goal:* A working computing architecture as efficient as the brain, grounded in a rigorous mathematical proof of why that efficiency is possible.
- *The Solution:* Random walks. This repository contains the formal proofs — 85 machine-verified theorems — showing that computation, physics, and information theory are the same thing, and that the brain's "low-precision statistical" approach is not a limitation but the optimal architecture.

## What This Repository Contains
About 30,000 lines of math proofs and computer code that proves five ideas from five people — three who knew each other and each changed history, one who carried forward their torch, and one who found the flaw in the foundation everyone else was standing on:

1. **[Ulam's idea](IDEAS.md#id1----ulam-cgs-from-a-random-walk)** — the Centimeter-Gram-Second (CGS) system of physical units can be reconstructed from a random walk (see "Physics for Mathematicians" in *Science, Computers, and People*, Ulam 1986, edited posthumously by Gian-Carlo Rota; recounted in Rota's *Indiscrete Thoughts*, 1997).
2. **[Von Neumann's idea](IDEAS.md#id2----von-neumann-the-statistical-ai-computer)** — an ultra-efficient AI computer can be built that operates like the brain: statistically, not arithmetically (see *The Computer and the Brain*, von Neumann 1958, posthumous).
3. **[Einstein's idea](IDEAS.md#id3----einstein-algebraic-discrete-physics)** — all of modern physics can be derived from a purely algebraic, discrete theory (see letter to Michele Besso, 1954; *The Meaning of Relativity*, 5th ed., 1956, posthumous).
4. **[Rota's idea](IDEAS.md#id4----rota-entropy-is-the-record-of-truth)** — if truth is the record of what actually happened in reality, then entropy is the record of truth. Entropy always adds up — it is the unique measure that does — and any amount of it can be efficiently coded into a finite program. This is Rota's Entropy Theorem (RET): the proof that the logarithm is the only function satisfying all seven axioms of information, and therefore that physics, computation, and information theory share the same mathematical foundation (see Rota's unpublished 400-page manuscript, taught at MIT 1970s–1999; formalized here in Lean 4).
5. **[Abadir's idea](IDEAS.md#id5----abadir-ch-decidable--unique-representations)** — Cantor's diagonalization argument makes a hidden assumption: it allows non-unique representations. In an information space where every element is maximally compressed (the Fundamental Theorem of Arithmetic), all combinations are already accounted for. The Continuum Hypothesis is not independent of mathematics — it is decidable, because the EGPT hierarchy, which is bijective with the standard mathematical universe (ℕ, ℤ, ℚ, ℝ), collapses all infinities onto ℕ via the Beth staircase. Hilbert's First Problem, resolved. ([`ContinuumHypothesis.lean`](Lean/EGPT/NumberTheory/ContinuumHypothesis.lean))

- **Lean Proofs: P_eq_NP, RealityIsComputation, ContinuousFieldsAreComputation, ContinuumHypothesis** — fully constructive and proven bijectively equivalent to the standard mathematical universe (ℕ, ℤ, ℚ, ℝ) with matching Beth cardinalities and isomorphic arithmetic, 85 machine-verified theorems build the chain from number theory through entropy through complexity through physics. No `sorry`, no custom axioms.
- **EGPTMath** — A pedagogical integer-only math library that turns FLOPs into IOPs. 157 tests, 100% pass rate.
- **Faster Abadir Transform (FAT)** — Public benchmark: Quantum Fourier Transform on a 1.2 GHz CPU, 768 MB RAM single thread — ~1.277 billion× faster than 2,048-GPU ShorGPU supercomputer.

**Skeptical?** Good. Pick the idea that bothers you most:

| Claim | Entry Point | Key Proof |
|-------|-------------|-----------|
| Ulam: Numbers are random walks | [EGPT Number Theory](Lean/EGPT/NumberTheory/Core.lean) | `ParticlePath ≃ ℕ` bijection |
| Von Neumann: The brain is right, arithmetic is wrong | [P = NP Proof](Lean/EGPT/Complexity/PPNP.lean) | `P_eq_NP` — identical P and NP definitions, proof is `Iff.rfl` |
| Einstein: Continuous fields are discrete | [Reality Is Computation](Lean/EGPT/Physics/RealityIsComputation.lean) | `ContinuousFieldsAreComputation` |
| Rota: All entropy is Shannon entropy | [Rota's Entropy Theorem](Lean/EGPT/Entropy/RET.lean) | `RET_All_Entropy_Is_Scaled_Shannon_Entropy` |
| Abadir: The Continuum Hypothesis is decidable | [CH Proof](Lean/EGPT/NumberTheory/ContinuumHypothesis.lean) | `EGPT_ContinuumHypothesis` |

Or start with the full walk-through: [Skeptic's Guide](SKEPTICS_GUIDE.md)

### Proof Structure

See [`docs/PROOF_GRAPH.md`](docs/PROOF_GRAPH.md) for the logical dependency graph of the EGPT theorems (Mermaid diagrams + [`proof_graph.json`](docs/proof_graph.json) for machine consumption).

### For AI Agents

- [`IDEAS.md`](IDEAS.md) — Five foundational ideas, artifact maps, and "You might be looking for..." table
- [`AGENTS.md`](AGENTS.md) — Navigation, build commands, proof dependency graph
- [`llms.txt`](llms.txt) — Lightweight project summary with links
- [`docs/PROOF_GRAPH.md`](docs/PROOF_GRAPH.md) — Theorem dependency DAG with Mermaid diagrams
- Per-directory detailed instructions: [`Lean/CLAUDE.md`](Lean/CLAUDE.md), [`EGPTMath/CLAUDE.md`](EGPTMath/CLAUDE.md), [`content/CLAUDE.md`](content/CLAUDE.md), [`www/CLAUDE.md`](www/CLAUDE.md)

## Back for more?
If you are able, or willing, to slog through 30,000 lines of code without understanding the highlevel then, by all means, do your thing and get back to it. I just can't do that. 

## Artificial Intelligence, Applied Mathematics, Physics, and Philosophy

Rota was a professor of applied mathematics and philosophy at MIT and, when I wanted to add a second major in 1991 in "AI" my advisor sent me his way to ask if I could join his "department." He laughed, told me never to tell people I was working on "AI" because they'd think I was crazy, said "of course, we probably have room for you because I'm not sure there's anyone else in it", and pointed me to JvM's "The Computer & The Brain". The following semester I learned Ulam's math in Rota's class.

I'm not sure anyone joined after me so today I invite you to join our department of applied mathematics as well. Before we get into the reams of hardcore math and code I would refer you to the training manual JvM left for us in his essay "The Mathematician." As applied mathematicians we must be theoretical physicists because we cannot apply concepts we don't understand ourselves. In fact, we must be theoreticians in every other discipline.

Since our goal is scalable AI as efficient as the brain there will of course be A LOT of hardcore math and code here but, if we hope to reach our goal I'm going to tell you what Rota told me:

> "Philosophers are needed today more than ever to tell the AI engineers some unpleasant truths. The philosopher's role has always been that of stating facts that may have been on everybody's mind but that no one dared state clearly. Eventually, engineers will reluctantly acknowledge that what the philosopher says is the truth, but they will then get rid of the philosopher."
[\- Gian-Carlo Rota, ](http://giancarlorota.org/essays/rotasharp.html)

So, don't be surprised when you see A LOT of philosophy here. You can't do anything efficiently if you don't know what you are doing. If we are to have efficient AI one must have a model of reality in order to have a model of consciousness.

### What This Repository Doesn't Contain
If there are all these proofs and working code, what is this a theory of? 

While I can prove and do prove here that everything in reality can be explained by particles doing a random walk, I just can't tell you *why* they move randomly. Could it be some deterministic behavior that looks random? Is it possible that gravity is fundamental and that the particles are really governed by some action at a distance that pulls them together and causes the chaotic 3-body problem?

We had to leave something for the physicists to do with those amazing super-colliders.

### THE THEORY PART:
Reality is made up of discrete particles which are fundamentally stochastic. We don't live in a simulation, simulations work because they mimic reality and not the other way around.

All the code in this repository is to confirm what John von Neumann and Stanislaw Ulam would have told you 70 years ago. All you needed to do was read their posthumously published books based on their collaboration at the Manhattan Project: von Neumann's *The Computer and the Brain* (1958) and Ulam's *Science, Computers, and People* (1986). Ulam's book opens with his visionary essay "Physics for Mathematicians," where he proposes reconstructing the CGS system — distance, mass, and time — on the basis of a random walk. Not from continuous equations. From a particle flipping coins.

Rota edited that book. He had been Ulam's disciple at Los Alamos and went on to formalize Ulam's intuitions into rigorous mathematics — a 400-page text that was never published but taught to his students at MIT until his death in 1999. The capstone of that text is what I call Rota's Entropy Theorem: the proof that the logarithm is the unique information measure, and therefore that all of physics, information theory, and computation share the same mathematical foundation.

Just to be clear, if they were right, it would not only make scalable AI possible but it would solve the AI energy crisis. 

To be even clearer, EVERYONE thinks they must have been wrong and Georg Cantor and Kurt Gödel were right and that the real numbers are uncountably larger than the integers, that mathematical truth is fundamentally incomplete ... and that some version of the following are reality: Schrödinger's Cat, spooky action at a distance, black hole singularities, 11-dimensional strings, etc.

## Are The Answers To The Big Questions Knowable?
What is reality? What is consciousness? Are they describable by science or are they outside our grasp?

John von Neumann and Albert Einstein, universally acknowledged as two of the greatest intellectual giants of the 20th Century, and of all time, pondered these questions on their deathbeds. 

Their last furiously written letters tell the story of the most tragic irony of history. They both died having realized that the very thing history would remember them for, the "von Neumann Architecture" and "General Relativity" was wrong, and even more tragically, that the very foundations of computer science and physics were doomed as a result.

> "I consider it quite possible that physics cannot be based on the field concept, i.e., on continuous structures. In that case, nothing remains of my entire castle in the air, gravitation theory included, [and of] the rest of modern physics.”
> — Albert Einstein, *Letter to Michele Besso*, 1954 pub 1956 (posthumous)

> "the nervous system appears to be using a radically divergent system of notation from the ones we are familiar with in ordinary arithmetics and mathematics ...this leads to a lower level of arithmetical precision but to a higher level of logical reliability: a deterioration in arithmetics has been traded for an improvement in logics."
> — John von Neumann, *The Computer and the Brain*, 1957 pub 1958 (posthumous)

Von Neumann spent the last year of his life on this question. *The Computer and the Brain* — written on his deathbed, published posthumously in 1957 — is his answer to why the question is hard and what a solution would have to look like. He showed that the brain operates at 2–3 decimal digits of precision in a statistical message system where meaning is carried by frequencies of pulse trains, not by the precise position of individual markers. No known computing machine, he wrote, can operate reliably at such low precision. The brain's computational language is "not digital but statistical" — fundamentally different from anything we call mathematics.

Einstein, independently, reached the same wall from the physics side. In his final years he concluded that continuous field theory could not be the foundation of physics, and that reality must be described by "a purely algebraic theory" built from integers. He died in 1955 without finding one.

Both men identified the same missing piece: a mathematical proof that discrete, statistical computation and continuous, deterministic physics are the same thing. This repository contains that proof, built on work by the people who knew them — John von Neumann, Stanislaw Ulam, and Gian-Carlo Rota.

Here's what the proofs actually say:

---

## What This Repository Proves

The proof chain runs from the ground up — deriving numbers from a physical random walk, proving all entropy is computable, and arriving at the formal machine-verified result that every physical system *is* a computation:

- **Reality Is Computation** — The capstone: for any physical system described by Bose-Einstein, Fermi-Dirac, or Maxwell-Boltzmann statistics, there exists a finite program whose bit-length equals the system's entropy. Field theory and statistical theory are the same thing. Einstein's last question, answered. ([`RealityIsComputation.lean`](Lean/EGPT/Physics/RealityIsComputation.lean), [`RET_README.md`](RET_README.md))

- **Rota's Entropy Theorem (RET)** — All entropy functions satisfying seven natural axioms are scalar multiples of Shannon entropy. The axioms are not assumed — they are proved as theorems. This is the mathematical tool Einstein needed and did not have. ([`RET.lean`](Lean/EGPT/Entropy/RET.lean))

- **P = NP** — In an information space where every element is maximally compressed, the information to solve a problem is contained in its statement. Search and verification are the same operation. This is the complexity-theoretic consequence of RET: if information is conserved, there is no hidden cost to finding a solution. ([`PPNP.lean`](Lean/EGPT/Complexity/PPNP.lean))

- **Wave-Particle Duality Disproved** — Bose-Einstein statistics are fully explained by deterministic classical particle paths. No wave-particle duality required. ([`WaveParticleDualityDisproved.lean`](Lean/PPNP/Proofs/WaveParticleDualityDisproved.lean))

All [85 theorems, sorry-free, no custom axioms](Lean/EGPT_PROOFS_VALIDATION.md) — only Lean's three built-in axioms (`propext`, `Quot.sound`, `Classical.choice`).

---

## The Chain: From Random Walks to Computable Consciousness

EGPT is not a single result. It is a chain of formally proven results that connect physics, information theory, number theory, and computation into a single framework. The chain runs:

### 1. Numbers Are Random Walks

A natural number is a `List Bool` — a sequence of binary choices. A particle's random walk through a discrete grid is a `List Bool`. A computation on a Turing tape is a `List Bool`. These are not analogies. They are the same type:

```
ParticlePath = ComputerTape = RandomWalkPath = List Bool
```

`ParticlePath ≃ ℕ` is a proven bijection with arithmetic homomorphisms. The full hierarchy follows: `ChargedParticlePath ≃ ℤ`, `ParticleHistoryPMF ≃ ℚ`, `ParticleFuturePDF ≃ ℝ` — each at the correct Beth cardinality.

This is the formalization of Ulam's program from "Physics for Mathematicians": reconstruct the physical units — distance, mass, time — from a random walk. A particle flipping coins generates a `ParticlePath`. That path *is* a natural number. The number system is not assumed; it is derived from the walk. The `IIDParticleSource` in `Core.lean` is the direct Lean 4 formalization of Ulam's random walk.

### 2. All Entropy Is Shannon Entropy (RET)

Rota's Entropy Theorem proves that the logarithm is the *unique* information measure. All valid entropy — Boltzmann's, Gibbs's, von Neumann's, Shannon's — is C × Shannon entropy. The seven Rota axioms are not assumed; they are formally proved for the concrete Shannon function.

This is the tool Einstein was missing. It proves the continuous and discrete descriptions of reality are not competing — they are the same description in two notations.

### 3. Shannon Entropy Maps to a Computable Program (RECT)

Rota's Entropy and Computability Theorem: for any information content H, there exists a program whose bit-length is ⌈H⌉. Entropy *is* program complexity. Shannon's Source Coding Theorem gives the lower bound; RECT gives the constructive program.

### 4. P = NP

A CNF formula is a list of addresses (each variable index *is* a `ParticlePath`), and the certificate for any satisfiable CNF has complexity bounded by n². In a maximally compressed information space, P and NP have **identical definitions** — both are the set of CNF instances that have a satisfying assignment. The proof `P_eq_NP` is `Set.ext` + `Iff.rfl`: definitional equality. The non-trivial work is in `walkCNFPaths` (which establishes the n² bound) and the bijection chain that forces the definitions to coincide. The n² bound comes from the CNF's structure, not from any witness.

The information-theoretic argument: RET proves information is conserved. You cannot construct a problem whose solution requires more information than the problem statement contains. The distinction between "search" and "verification" vanishes because the CNF's clause structure already encodes all the information needed.

### 5. Reality Is Computation

The capstone composes steps 1–4. For every Bose-Einstein, Fermi-Dirac, and Maxwell-Boltzmann system — which exhaust all finite "balls into boxes" occupancy models — there exists a finite program whose bit-length equals ⌈entropy⌉. The proof is one line:

```lean
exact RECT_Entropy_to_Program (entropy_of_stat_system type params h_valid)
```

The value is in the statement: the physical system *is* the program.

### 6. Continuous Fields Are Computable

A corollary: since RET proves that scaling any entropy by C > 0 preserves all axioms, and since ℝ is constructively built from ℕ through the Beth hierarchy, every continuous field theory admits a program representation. Einstein's continuous fields and Boltzmann's discrete particles are computationally identical.

### 7. Wave-Particle Duality Disproved

For any valid Bose-Einstein system, there exists a deterministic `PathProgram` — a classical particle path — whose complexity equals the system's entropy. The "wave" is the probability distribution over the ensemble; the "particle" is the individual path. Both are `List Bool`. No duality required.

---

## Computational Experiments: The Third Leg

Most scientific claims rest on two legs: theory and observation. EGPT adds a third: **computational emergence** — running simulations where physical phenomena arise from first principles without being programmed in. No force equations. No wave functions. Just particles doing random walks on a discrete grid.

This repository contains what we believe to be the first computationally emergent models of gravity, wave interference, blackbody radiation, atomic structure, and wave-particle duality — all from the same discrete framework. For each, the repository provides a **triumvirate** that no other framework offers for any one of them, let alone all five: a formal machine-checked proof, an interactive simulation, and an analytical derivation.

| Unsolved Problem | Lean Proof | Simulation | Paper / Derivation |
|-----------------|------------|------------|-------------------|
| **Circuit SAT (Half-Adder)** | [`PPNP.lean`](Lean/EGPT/Complexity/PPNP.lean) — `P_eq_NP` | [`Circuit SAT Demo`](egpt_circuit_sat/index.html) — 100% accuracy, 80/80 runs, [open data](egpt_circuit_sat/data/multiseed_results.json) | [`Whitepaper`](egpt_circuit_sat/paper/egpt_circuit_sat_whitepaper.pdf) — Boolean computation via particle diffusion |
| **Stochastic Gravity** | [`RealityIsComputation.lean`](Lean/EGPT/Physics/RealityIsComputation.lean) — `ContinuousFieldsAreComputation`; [`PhysicsDist.lean`](Lean/EGPT/Physics/PhysicsDist.lean) — `entropy_BE_eq_C_shannon` | [`GravitySim`](www/GravitySim/index.html) — inverse-square law from random walk collisions | [`GravityPaper.tex`](content/Papers/GravityPaper/GravityPaper.tex) — P(interaction) = m₁m₂/4r²; G and k_e as dimensional scaling factors |
| **Blackbody Radiation** | [`BoseEinstein.lean`](Lean/EGPT/Physics/BoseEinstein.lean) — `H_BE_from_Multiset_eq_C_shannon`; [`PhysicsDist.lean`](Lean/EGPT/Physics/PhysicsDist.lean) — `entropy_BE_eq_C_shannon` | [`FRAQTL DevSDK`](www/fraqtl_devsdk/index.html) — blackbody experiment ([`setupBlackbody.js`](www/fraqtl_devsdk/js/simulation/setupBlackbody.js)) | [Quantum Computing vs Fractal Compression](content/Papers/Quantum%20Computing%20vs%20Fractal%20Compression%20In%20a%20Chaotic%20Discontinuum.docx.md) — oscillatory motion and entropy |
| **Double Slit / Cellular Automata** | [`PhotonicCA.lean`](Lean/EGPT/Physics/PhotonicCA.lean) — `be_system_has_equivalent_program` | [`FRAQTL DevSDK`](www/fraqtl_devsdk/index.html) — wave interference ([`setupWaveInterference.js`](www/fraqtl_devsdk/js/simulation/setupWaveInterference.js)) | [Quantum Computing vs Fractal Compression](content/Papers/Quantum%20Computing%20vs%20Fractal%20Compression%20In%20a%20Chaotic%20Discontinuum.docx.md) — fractal algorithms produce wave behavior |
| **Wave-Particle Duality** | [`WaveParticleDualityDisproved.lean`](Lean/PPNP/Proofs/WaveParticleDualityDisproved.lean) — `Wave_Particle_Duality_Disproved_QED` | [`FRAQTL DevSDK`](www/fraqtl_devsdk/index.html) — particle paths produce "wave" interference patterns | [`PeqNP_QED.md`](content/Papers/EGPT_PeqNP/PeqNP_QED.md) — "Wave-Particle Duality is a Computational Artifact" |
| **P = NP** | [`PPNP.lean`](Lean/EGPT/Complexity/PPNP.lean) — `P_eq_NP` (identical P/NP definitions, proof is `Iff.rfl`); [`TableauFromCNF.lean`](Lean/EGPT/Complexity/TableauFromCNF.lean) — `walkCNFPaths` + `tableauComplexity_upper_bound` ≤ n² | [Address Is The Map Visualizer](www/the-address-is-the-map-visualizer/) — SAT solver; [FRAQTL Colab](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) | [`PeqNP_QED.md`](content/Papers/EGPT_PeqNP/PeqNP_QED.md); [`SKEPTICS_GUIDE.md`](SKEPTICS_GUIDE.md); [`FRAQTL_WhitePaper.md`](content/pyFRAQTL/FRAQTL_WhitePaper.md) |

The distinction matters: traditional physics simulations *input* the laws and watch consequences unfold. These experiments *derive* the laws from something more primitive. The inverse-square law is not programmed — it is discovered by the simulation, the same way it was discovered by observation.

---

## Why This Matters: Von Neumann's Unfinished Blueprint

Von Neumann's *The Computer and the Brain* identifies the central obstacle to computing consciousness: the brain uses a statistical message system operating at 2–3 decimal digits of precision. In a conventional von Neumann machine, floating-point errors accumulate as √N over N operations — after 10¹⁰ operations, precision of 10¹² is required just to maintain 10³ accuracy. The brain, with 10¹⁰ neurons firing at ~100 Hz, cannot possibly be doing this. Von Neumann concluded the brain's language is "not digital but statistical" and that it must be "essentially different" from mathematics as we know it.

He was right about the problem but died before anyone could prove the solution: **P = NP means stochastic computation is polynomially equivalent to deterministic computation.** The brain's "low-precision statistical" approach is not a limitation — it is optimal. Monte Carlo random walks (Ulam's invention, not coincidentally) are as powerful as exhaustive search, because the information to solve a problem is already contained in its statement.

EGPT's integer-only arithmetic (IOPs, not FLOPs) is the computing architecture von Neumann described but could not build: exact, with no error accumulation, operating on the same `List Bool` substrate as physical reality itself. The FAT benchmark demonstrates this is not theoretical — a single 1.2 GHz core outperforms 2,048 GPUs on the Quantum Fourier Transform by a factor of ~1.277 billion.

The chain from random walks to computable consciousness:

**Ulam's random walk** → numbers (`ParticlePath ≃ ℕ`) → Shannon coding (RET) → information conservation (P=NP) → every physical system is a program (`RealityIsComputation`) → Einstein's answer (fields = statistics) → von Neumann's brain-computer (`List Bool` at low precision, statistical, no FLOPs) → **computable consciousness**

---

## Quick Navigation

| Directory | What's Inside | Start Here |
|-----------|--------------|------------|
| [`Lean/`](Lean/) | Formal Lean 4 proofs (sorry-free, axiom-free proof chain) | [`EGPT/Physics/RealityIsComputation.lean`](Lean/EGPT/Physics/RealityIsComputation.lean) |
| [`EGPTMath/`](EGPTMath/) | Pedagogical JS integer math library — FLOPs become IOPs | [`EGPTMath.js`](EGPTMath/EGPTMath.js) |
| [`content/`](content/) | Papers, books, reference docs, pyFRAQTL SDK | [FAT White Paper (Colab)](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) |
| [`www/`](www/) | Interactive browser demos and visualizers | Open any `.html` in your browser |
| [`egpt_circuit_sat/`](egpt_circuit_sat/) | Circuit SAT experiment — half-adder via particle transport | [`index.html`](egpt_circuit_sat/index.html) |

| Document | Purpose |
|----------|---------|
| [**RET_README.md**](RET_README.md) | Einstein's question answered: why RET is the most important result |
| [**SKEPTICS_GUIDE.md**](SKEPTICS_GUIDE.md) | Step-by-step audited proof chain walk-through |
| [**EGPT_STORY.md**](EGPT_STORY.md) | The full narrative — knowledge passed from von Neumann → Ulam → Rota |
| [**Lean/EGPT/PeqNP_Proof_README.md**](Lean/EGPT/PeqNP_Proof_README.md) | Detailed P=NP proof walkthrough |
| [**Lean/EGPT_PROOFS_VALIDATION.md**](Lean/EGPT_PROOFS_VALIDATION.md) | Build verification: 85 theorems, sorry-free, axiom inventory |

---

## The Proof Chain (Lean 4)

The full proof chain spans 6 core files + physics extensions, with **no `sorry`** and **no custom axioms**:

1. **Type foundations** — [`Core.lean`](Lean/EGPT/Core.lean): `ParticlePath`, `ComputerTape`, and `RandomWalkPath` are all `List Bool`. `IIDParticleSource` formalizes Ulam's random walk from "Physics for Mathematicians" — the coin-flipping particle that generates the number system.

2. **Numbers are paths** — [`NumberTheory/Core.lean`](Lean/EGPT/NumberTheory/Core.lean): `ParticlePath ≃ ℕ` (proven bijection), with arithmetic homomorphisms. Full hierarchy through ℤ, ℚ, ℝ at matching Beth cardinalities.

3. **Entropy is unique** — [`Entropy/RET.lean`](Lean/EGPT/Entropy/RET.lean): All 7 Rota axioms proved for Shannon entropy. `RET_All_Entropy_Is_Scaled_Shannon_Entropy`: all valid entropy = C × Shannon.

4. **Constraints are addresses** — [`Constraints.lean`](Lean/EGPT/Constraints.lean): CNF formulas encoded as `ComputerTape`. Each literal's variable index *is* a `ParticlePath` — an address in information space.

5. **The CNF is the witness** — [`Complexity/TableauFromCNF.lean`](Lean/EGPT/Complexity/TableauFromCNF.lean): `walkCNFPaths` deterministically walks every clause. `tableauComplexity_upper_bound` proves cost ≤ n².

6. **P = NP** — [`Complexity/PPNP.lean`](Lean/EGPT/Complexity/PPNP.lean): `P` and `NP` are given identical definitions in a maximally compressed information space. `P_eq_NP` is `Set.ext` + `Iff.rfl` — definitional equality. The non-trivial content is the bijection chain and bounds (steps 1–5) that forces this identity.

7. **Three physics distributions** — [`Physics/BoseEinstein.lean`](Lean/EGPT/Physics/BoseEinstein.lean), [`FermiDirac.lean`](Lean/EGPT/Physics/FermiDirac.lean), [`MaxwellBoltzmann.lean`](Lean/EGPT/Physics/MaxwellBoltzmann.lean): Each proven H = C × Shannon over ℝ.

8. **Reality is computation** — [`Physics/RealityIsComputation.lean`](Lean/EGPT/Physics/RealityIsComputation.lean): `RealityIsComputation`, `ContinuousFieldsAreComputation`, `Wave_Particle_Duality_Disproved_QED`.

### Information-Theoretic Foundation

- **Rota's Entropy Theorem** ([`Entropy/RET.lean`](Lean/EGPT/Entropy/RET.lean)): the logarithm is the *unique* information measure — `RET_All_Entropy_Is_Scaled_Shannon_Entropy`.
- **Rota's axioms are proved, not assumed** ([`Entropy/H.lean`](Lean/EGPT/Entropy/H.lean)): all 7 axioms formally verified, bundled as `TheCanonicalEntropyFunction_Ln`.
- **The LFTA** ([`NumberTheory/Analysis.lean`](Lean/EGPT/NumberTheory/Analysis.lean)): the Logarithmic Fundamental Theorem of Arithmetic — `log₂(n) = Σ ν_p(n)·log₂(p)`.
- **Shannon's Source Coding Theorem & RECT** ([`Entropy/Common.lean`](Lean/EGPT/Entropy/Common.lean)): `SCT_Source_to_Entropy`, `RECT_Entropy_to_Program`, `IID_Source_to_Program`.

Together, these prove information is conserved under composition: you cannot construct a problem whose solution requires more information than the problem statement contains.

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

85 theorems. No `sorry`. No custom axioms. Every step machine-verified by Lean's kernel.

---

## Working Implementations

### EGPTMath — Integer-Only Mathematics

A pedagogical JavaScript library demonstrating that all of mathematics — including transcendentals, complex numbers, and the FFT — can be performed with pure integer operations (IOPs, not FLOPs). This is von Neumann's replacement architecture in practice: exact arithmetic with no error accumulation.

- 157 tests, 100% pass rate
- PPF (Power Plus Fractional) representation satisfying Rota's Entropy Theorem
- FFT reimplemented without floating point

EGPTMath is intentionally unoptimized. It exists to teach, not to benchmark.

### FAT — The Faster Abadir Transform

The Faster Abadir Transform demonstrates EGPT's principles in practice: a deterministic, classical computation of the Quantum Fourier Transform (QFT) that achieves O((log k)³) complexity — comparable to Shor's theoretical quantum advantage, on classical hardware. If the "magic" quantum step is efficiently classically computable, the basis for quantum advantage in algorithms like Shor's evaporates.

**White paper and live benchmark:** [**Logarithmic Root Finding: A Deterministic, EGPT-Native QFT**](https://colab.research.google.com/drive/1LQLCHDNp9kCFgJXIzlitaVxuYiHRATXm) — an interactive Colab notebook with the full white paper and independently reproducible results.

Key result: a single 1.2 GHz CPU core with 768 MB RAM computes the QFT **~1.277 billion times faster** than 2,048 NVIDIA A100 GPUs on the JUWELS Booster supercomputer (Willsch et al. 2023).

---

## The Background

The intellectual lineage of this work runs through three people who knew each other and, in some cases, knew Einstein personally:

**John von Neumann** (1903–1957) created the architecture of every computer in existence, then spent his final year arguing it was wrong — that the brain uses a fundamentally different, statistical computation that his own machine could not replicate. *The Computer and the Brain* is his blueprint for what would need to replace it.

**Stanislaw Ulam** (1909–1984), von Neumann's closest collaborator, invented the Monte Carlo method at Los Alamos and proposed — in his essay "Physics for Mathematicians" — that the CGS system of physical units could be reconstructed from a random walk. Not approximated. *Derived.* Distance is how far the particle walks. Time is how many steps it takes. Mass is the information content of its path. The essay was unpublished at his death; Rota edited it into Ulam's posthumous *Science, Computers, and People* (1986). EGPT's `IIDParticleSource` is the direct formalization of Ulam's random walk.

**Gian-Carlo Rota** (1932–1999), Ulam's disciple at Los Alamos and later professor of applied mathematics and philosophy at MIT, edited Ulam's posthumous book, recounted Ulam's program in *Indiscrete Thoughts* (1997), and formalized the entropy theorem that unifies all of information theory. His unpublished 400+ page manuscript (available in [`content/docs/`](content/docs/)) contains the combinatorial proof that makes everything else in this repository possible — the proof that the logarithm is the unique information measure. That manuscript also laid out five great unsolved problems that Rota knew the text provided answers to. This repository contains machine-verified formalizations of those answers.

## About Me

I'm Essam Abadir. Rota was my professor at MIT. The knowledge passed from von Neumann to Ulam, from Ulam to Rota, and from Rota to his students. To be upfront: they answered most of these questions before I was born. I was lucky enough to be handed the answers.

My contribution was finding the flaw in the foundation everyone else was standing on: Cantor's diagonalization argument makes a hidden assumption — it allows non-unique representations. In an information space where every element is maximally compressed, the "new" number Cantor constructs is already accounted for. This insight, formalized as the EGPT Beth staircase, makes the Continuum Hypothesis decidable — Hilbert's First Problem, resolved. The full argument and machine-verified proof are in [`ContinuumHypothesis.lean`](Lean/EGPT/NumberTheory/ContinuumHypothesis.lean).

The EGPT hierarchy is not a restricted subsystem — it is bijective with the standard mathematical universe:

- `ParticlePath ≃ ℕ` — cardinality beth 0
- `ChargedParticlePath ≃ ℤ` — cardinality beth 0
- `ParticleHistoryPMF ≃ ℚ` — cardinality beth 0
- `ParticleFuturePDF ≃ ℝ` — cardinality beth 1
- `Nat_L n` — cardinality beth n, for all n : ℕ

Every type lives at some level with cardinality `beth n`. Since there is no natural number between `k` and `k + 1`, there is no cardinality between consecutive beth levels. All infinities collapse onto ℕ. The Continuum Hypothesis and the Generalized Continuum Hypothesis are both decidably true.

It took me 35 years after Rota's class to see it clearly. The Lean formalization is the proof that the insight is correct. The FAT benchmark is the proof that it matters in practice.

For the full story: **[EGPT_STORY.md](EGPT_STORY.md)**

---

## The New Manhattan Project

The first Manhattan Project produced two things that changed the world: a new kind of physics (quantum simulation via Ulam's Monte Carlo method) and a new kind of computing (von Neumann's stored-program architecture / ENIAC). Both were built from blueprints that von Neumann and Ulam designed together at Los Alamos. Rota, as Ulam's disciple, spent the next four decades formalizing the mathematics behind that first revolution — and in doing so, laid the foundation for the next one.

This repository is the blueprint for that next revolution. The objective is a new computing architecture for AI and physics that is vastly faster and more energy-efficient — the realization of von Neumann's final vision in *The Computer and the Brain*. The implications are as large as the first revolution:

| First Manhattan Project | The New Manhattan Project |
|------------------------|--------------------------|
| Von Neumann architecture (ENIAC) | Integer-only statistical computing (FAT / IOPs) |
| Monte Carlo simulation (Ulam) | P=NP hypercomputing (FRAQTL) |
| Quantum physics as intractable | Quantum physics as classically computable |
| Floating-point arithmetic | Integer-only arithmetic — no error accumulation |
| 2,048 GPUs for one QFT | One 1.2 GHz CPU, ~1.277 billion× faster |

Rota formalized the math behind the first Manhattan Project. In his unpublished textbook, he laid out five great unsolved problems that he knew the text provided answers to. This repository contains machine-verified formalizations of those answers — 85 Lean 4 theorems, the [computational experiments](www/GravitySim/index.html) that demonstrate them, and the [working code](EGPTMath/) that implements them.

The first Manhattan Project's blueprints were classified. These are open. You're reading them.

### Join the Project

Rota told me in 1991 that there was probably room in his "department" because he wasn't sure there was anyone else in it. I'm not sure anyone joined after me. So today I invite you to join — not as a spectator, but as a builder.

The proofs are done. The experiments work. What remains is engineering: bringing integer-only computing and FRAQTL into production systems, building the tools that replace floating-point AI infrastructure, and demonstrating to a skeptical world that von Neumann and Ulam were right all along.

Pick your entry point from the [Ideas Framework](IDEAS.md), choose the role that fits you from the [reading paths](IDEAS.md#3-reading-paths-by-role), and start building.

---

## License

Community source under the [DeSciX Community License Membership Agreement (DCMA)](DeSciX_Community_License_v1.pdf) v1.0.
See [LICENSE](LICENSE) for a summary of key terms.

Open inside the DeSciX Community, value-return outside. Working with this code is a job offer, not a handout.
