# Demo Gap Proposals

> Generated: 2026-03-07 | Updated: 2026-03-09 | Phase 2, Task 3 of IDEAS Audit Plan

## Update (2026-03-09): Gaps Partially Addressed

The following Phase 1 gaps have been partially addressed by new artifacts:

- **ID1 "Random Walk to CGS" gap** is now partially addressed by **`www/GravitySim/`** -- a p5.js simulation that shows random walks on a discrete lattice producing inverse-square force laws (Newton's gravity, Coulomb's law). This directly demonstrates Ulam's insight that physics emerges from random walks, though it derives force laws rather than the full CGS dimensional system (length, mass, time units from walk statistics). The original Proposal 1 below remains relevant for the complete CGS derivation.

- **ID2 "IOPs vs FLOPs" gap** is now partially addressed by **`www/fraqtl_devsdk/`** -- the EGPT FRAQTL DevSDK, a full integer-only physics engine with 5 experiments (particle walk, wave interference, blackbody, harmonic oscillator, atomic model). This demonstrates that statistical/integer computing works for real physics simulations, directly showing the alternative that the Phase 1 audit noted was missing. The original Proposal 2 below (a direct side-by-side float vs integer comparison) remains valuable as a focused pedagogical tool for the founder/investor audience.

---

## Reference: Coverage from Phase 1

| Idea | Coverage | Action |
|------|----------|--------|
| **ID1** -- Ulam (Random walk CGS) | ~~Weak~~ Moderate (GravitySim added) | ~~New demo needed~~ Partially addressed; full CGS derivation demo still valuable |
| **ID2** -- Von Neumann (Statistical AI computer) | ~~Weak~~ Moderate (fraqtl_devsdk added) | ~~New demo needed~~ Partially addressed; direct IOPs vs FLOPs comparison still valuable |
| **ID3** -- Einstein (Algebraic discrete physics) | ~~Moderate~~ Strong (GravitySim + fraqtl_devsdk added) | Optional enhancement |
| **ID5** -- Abadir (CH decidable / unique reps) | Moderate | Targeted demo needed |

---

## Proposal 1: "Random Walk to CGS" (ID1 -- Ulam)

**What it shows:** A canvas animation of a 2D random walk on an integer lattice. As the walk progresses, the display derives three quantities from the walk statistics alone: step count produces a time unit, root-mean-square displacement produces a length unit, and the ratio of displacement-squared to time produces a mass-equivalent unit. A sidebar shows these converging to CGS-like dimensional quantities in real time, with the mathematical relationships annotated at each step.

**Connection to ID1:** This is the direct visualization of Ulam's insight that physical units (centimeters, grams, seconds) are not fundamental -- they emerge from the statistics of a random walk on a discrete lattice. The demo makes the abstract claim concrete: you watch dimensionless integers become physical dimensions.

**Status (2026-03-09):** GravitySim partially addresses this by showing force laws from random walks, but does not yet derive dimensional units (length, mass, time) from walk statistics. This proposal remains relevant for the complete CGS derivation.

**User roles served:** CS students get a visual, interactive first encounter with EGPT's foundational claim that physics emerges from combinatorics. Physicists and quantum computing enthusiasts see a familiar random-walk process reframed. Founders/investors get an intuitive "aha" for why discrete math can replace continuous physics.

**Technology:** Self-contained HTML file with Canvas API for the walk animation and Chart.js for the convergence plots. Dark-theme styling consistent with `GPUHeatDeath.html`. Interactive controls: walk speed slider, pause/resume, reset. No build step required.

---

## Proposal 2: "IOPs vs FLOPs" Side-by-Side (ID2 -- Von Neumann)

**What it shows:** Two parallel computation panels run the same sequence of arithmetic operations (e.g., iterated multiply-accumulate, or a small FFT). The left panel uses JavaScript's native `Number` (IEEE 754 float64). The right panel uses EGPTMath's integer-only PPF arithmetic (imported from `EGPTMath/EGPTNumber.js`). A shared chart plots accumulated error over thousands of operations: the float panel drifts exponentially while the integer panel stays at zero. A final scoreboard shows operation count, total error, and energy-equivalent cost (extrapolated from the GPUHeatDeath model).

**Connection to ID2:** Von Neumann's statistical AI computer thesis is that an ultra-efficient machine operates on integers, not floats. This demo is the direct empirical demonstration: same computation, same browser, zero error vs exponential drift. It answers "why IOPs instead of FLOPs?" with a live experiment the viewer controls.

**Status (2026-03-09):** fraqtl_devsdk partially addresses this by demonstrating a full integer-only physics engine, but does not provide the direct side-by-side float-vs-integer error comparison. This proposal remains valuable as a focused pedagogical tool.

**User roles served:** Founders/investors see the benchmark story ("why this matters for AI scaling"). AI/ML engineers and hardware engineers see quantified error divergence. Quantum computing enthusiasts see the connection between exact arithmetic and quantum error correction.

**Technology:** Self-contained HTML file. Imports `EGPTNumber.js` via a `<script>` tag (or inlines a minimal subset). Uses Chart.js for the real-time error divergence plot. Tailwind CSS for layout, matching the `GPUHeatDeath.html` aesthetic. Interactive controls: operation type selector (multiply, dot product, FFT butterfly), iteration count slider, auto-run toggle.

---

## Proposal 3: "Why Cantor's Diagonal Fails" (ID5 -- Abadir)

**What it shows:** An interactive grid visualizer. The left panel displays a table of natural numbers mapped to their PPF (Prime Power Factorization) encodings -- each row is a natural number, each column shows its canonical representation. The user clicks "Attempt Diagonal" and the demo walks through Cantor's diagonal construction step by step, highlighting each diagonal element. At the critical moment, the demo shows that the constructed "new" number already has a PPF address in the table -- it was always there because maximal compression leaves no room for elements outside the enumeration. An annotation panel explains each step.

**Connection to ID5:** Abadir's result is that in a maximally compressed information space (where every element has a unique, canonical representation), Cantor's diagonal argument cannot produce an element outside the enumeration. This demo makes that abstract proof tangible: the viewer literally tries to diagonalize and watches it fail, with the PPF encoding revealing why.

**User roles served:** CS students get an interactive proof walkthrough that demystifies one of the most famous arguments in mathematics. Complexity theorists and proof engineers see the CH decidability result grounded in a concrete construction. Philosophers of mind and mathematicians engage with the foundational claim that the continuum is an artifact of non-canonical representations.

**Technology:** Self-contained HTML file. Uses a CSS grid or HTML table for the diagonal visualization, with step-by-step animation driven by vanilla JS. Imports a minimal PPF encoder from `EGPTNumber.js` (or inlines the encoding logic). Dark theme with syntax-highlighted number representations. Controls: step forward/back buttons, auto-play, adjustable grid size.

---

## Proposal 4: "FAT vs FFT" Pedagogical Comparison (ID2 + ID3)

**What it shows:** Two side-by-side panels compute the Discrete Fourier Transform of a user-supplied signal (or preset waveforms). The left panel runs a standard radix-2 FFT using float64 arithmetic. The right panel runs the pedagogical FAT from `EGPTMath/FAT/EGPTFAT.js` using integer-only operations. Both display the resulting frequency spectrum. Below, a comparison panel highlights: (a) numerical differences between outputs, (b) operation counts, and (c) the fact that FAT produces exact integer results while FFT accumulates rounding error in the twiddle factors.

**Connection to ID2 and ID3:** This bridges Von Neumann's statistical computer (ID2) with Einstein's algebraic discrete physics (ID3). The FFT is one of the most important algorithms in scientific computing; showing that it can be done exactly with integers -- and that this is equivalent to a classical QFT -- demonstrates both ideas simultaneously.

**User roles served:** Quantum computing enthusiasts see the "classical QFT" claim made concrete. AI/ML engineers see a practical algorithm they use daily reimplemented without floats. Hardware engineers see the architectural implications. Note: the existing `data/qft-presets.json` and `data/qft-testdata.csv` files suggest this demo was already planned.

**Technology:** Self-contained HTML file. Imports `EGPTFAT.js` for the integer FFT. Uses Chart.js for spectrum plots. Preset signals (sine, square, impulse) plus a custom input field. Matches the dark-theme Tailwind pattern from `GPUHeatDeath.html`.

---

## Proposal 5: "The EGPT Starting Line" -- Guided Onboarding (Cross-cutting)

**What it shows:** A single-page interactive guide that asks the viewer "Who are you?" (CS student / quantum enthusiast / founder-investor / mathematician / engineer) and then presents a curated 3-step tour through the existing demos, with one-sentence context for each step. Each path highlights different ideas: the CS student path starts with the fractal demo (ID3), then GPUHeatDeath (ID2), then the address-is-the-map visualizer (ID5). The founder path starts with GPUHeatDeath (ID2), then IOPs vs FLOPs (ID2, proposed above), then TheGreatestDebate (all ideas).

**Connection:** This is not a new idea demo -- it is the "where do I start?" entry point that the Phase 1 audit identified as missing for CS students and founders/investors. Every demo in `www/` currently assumes the viewer already knows what they are looking at.

**User roles served:** All underserved roles identified in Phase 1: CS students who need gentle onboarding, quantum computing enthusiasts who need the FAT-to-QFT narrative threaded, and founders/investors who need the "why this matters" story sequenced.

**Technology:** Self-contained HTML file. Minimal JS for the role-selection UI and step sequencing. Links to existing demos (opens in new tabs). Could use the same Tailwind dark-theme pattern. No build step.

---

## Priority Ranking

| Priority | Proposal | Reason |
|----------|----------|--------|
| 1 | **IOPs vs FLOPs** (Proposal 2) | Fills the biggest narrative gap (ID2 is the practical thesis) and serves the founder/investor audience that currently has almost no entry point. fraqtl_devsdk demonstrates integer physics but does not provide the direct comparison. |
| 2 | **Why Cantor's Diagonal Fails** (Proposal 3) | Unique, highly shareable, and directly visualizes the most provocative theoretical claim (CH decidability). |
| 3 | **Random Walk to CGS** (Proposal 1) | Fills the remaining ID1 gap (CGS dimensional derivation). GravitySim shows force laws but not unit emergence. |
| 4 | **The EGPT Starting Line** (Proposal 5) | Low implementation cost, high impact for discoverability. Depends on Proposals 1-3 existing first to have a complete tour. |
| 5 | **FAT vs FFT** (Proposal 4) | Important for the quantum computing audience, but partially blocked by the proprietary nature of the optimized FAT. The pedagogical version is still valuable. |
