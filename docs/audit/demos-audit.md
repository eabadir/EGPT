# Demos Audit: www/ Directory Mapped to ID1-ID5

> Generated: 2026-03-06 | Task 4 of IDEAS Audit Plan

## The Five Ideas (Reference)

| ID | Author | Core Idea |
|----|--------|-----------|
| **ID1** | Ulam | CGS from a random walk -- physical units emerge from pure mathematics via random walks |
| **ID2** | Von Neumann | Statistical AI computer -- ultra-efficient computing operates statistically, not arithmetically |
| **ID3** | Einstein | Algebraic discrete physics -- all of modern physics derives from a purely algebraic, discrete theory |
| **ID4** | Rota | Entropy is the record of truth -- the logarithm is the unique measure; physics, computation, and information share one foundation |
| **ID5** | Abadir | CH decidable / unique representations -- in maximally compressed information space, Cantor's diagonal fails; all infinities collapse onto N |

---

## Demo Inventory and Idea Coverage

| File/Artifact | ID1 | ID2 | ID3 | ID4 | ID5 | Notes |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `EGPTfractal.html` + `js/EGPTfractal.js` | | | `●` | `◐` | | "Pyramids of EGPT" -- p5.js cellular automaton. Grows fractal pyramids from primes using a sieve; primes spawn new structures, composites are covered by existing ones. Demonstrates discrete algebraic structure (ID3) with entropy/prime coding undertone (ID4). |
| `EGPTFactalWave.html` + `js/EGPTFractalWave.js` | `●` | | `●` | `◐` | | "Fractal Wave (CA)" -- ~1400-line photonic cellular automaton. Uses BigInt exact arithmetic. Synchronized CAs spawn PRIME and FACTORIAL waves from random-walk-like collisions. Explicit random walk spawning (ID1), discrete algebraic physics simulation (ID3), information content of primes (ID4). |
| `EGPTNumberUniformity.html` + `js/EntropyComparisonExplorer.js` | | | | `●` | `●` | Single-number entropy uniformity deep-dive. Uses EGPTMath/EGPTNumber (PPF encoding) to analyze canonical entropy of any integer. Demonstrates Rota entropy uniformity (ID4) and unique PPF representations (ID5). |
| `EntropyUniformity.html` + `js/EntropyComparisonExplorer.js` | | | | `●` | `◐` | Multi-number comparative analysis: primes vs composites entropy distribution. Chart.js visualizations of deviation ranges, averages, histograms. Core ID4 demo; touches ID5 via canonical representation. |
| `GPUHeatDeath.html` | | `●` | `●` | `◐` | | "The Erosion of Information" -- floating-point rounding error visualizer across processor scales (CPU to data centers). Shows exponential decay of precision over operations. Directly motivates ID2 (why statistical/integer computing matters) and ID3 (discrete vs continuous arithmetic). Entropy angle (ID4) via information loss. |
| `RotaEntropy/RotaEntropyProperties.html` + `RotaEntropyProperties.js` | | | | `●` | | Interactive Bernoulli process demo of Rota's 5 entropy axioms: normalization, symmetry, continuity, zero invariance, max uniform, conditional additivity. Directly visualizes the Lean definitions. Pure ID4 pedagogical tool. |
| `RotaEntropy/TheGreatestDebate.html` | `◐` | `◐` | `●` | `●` | `◐` | "The Great Scoreboard: Reality vs Abstract" -- 2,600-year historical timeline (8 eras) tracking discrete vs continuum paradigms. Narrative presentation touching all five ideas. Primary framing is ID3 (algebraic discrete physics) and ID4 (entropy as foundation). |
| `RotaEntropy/EGPTPrimeShannonCodes.md` | | | | `●` | `●` | React component (not standalone HTML). Visualizes factorization as ParticlePath decomposition -- primes are "irreducible Shannon codes," composites decompose into repeating sub-paths. Core ID4 (entropy coding) and ID5 (unique representation). |
| `the-address-is-the-map-visualizer/` (React app) | | | | `◐` | `●` | Full React + TypeScript P=NP Test Center. Square spiral mapping N to grid, SAT/CNF solver interface (brute force, DPLL, random search), certificate verification, overlay visualizations (circuit, Manhattan, Sudoku, neural net). Demonstrates "the address is the map" (ID5). Touches ID4 via complexity/entropy bounds. |
| `js/EGPTCharting.js` | | | | `●` | | Reusable Chart.js widget module for entropy visualization. Infrastructure, not a standalone demo. Serves ID4 visualizations. |
| `css/style.css` | | | | | | Shared stylesheet. Not a demo. |
| `data/qft-presets.json`, `data/qft-testdata.csv` | | | `◐` | `◐` | | QFT test data and presets. Data files, not standalone demos. Suggest ID3/ID4 content for a future QFT demo. |

---

## Idea Coverage Summary

| Idea | Primary (`●`) Demos | Secondary (`◐`) Demos | Total Coverage |
|------|---------------------|----------------------|----------------|
| **ID1** -- Ulam (Random walk CGS) | 1 (FractalWave) | 1 (GreatestDebate) | **Weak** |
| **ID2** -- Von Neumann (Statistical AI) | 1 (GPUHeatDeath) | 1 (GreatestDebate) | **Weak** |
| **ID3** -- Einstein (Discrete physics) | 3 (Fractal, FractalWave, GPUHeatDeath) | 1 (GreatestDebate) | **Moderate** |
| **ID4** -- Rota (Entropy) | 5 (NumberUniformity, EntropyUniformity, RotaProperties, GreatestDebate, PrimeShannonCodes) | 4 | **Strong** |
| **ID5** -- Abadir (CH / Unique reps) | 2 (NumberUniformity, Address-is-the-Map) | 3 | **Moderate** |

---

## Target Audience by Demo

| Demo | Code-first Roles | Theory-first Roles | Outcome-first Roles |
|------|------------------|--------------------|---------------------|
| `EGPTfractal.html` | CS student | Mathematician, Physicist | |
| `EGPTFactalWave.html` | CS student, Hardware engineer | Physicist, Quantum computing enthusiast | |
| `EGPTNumberUniformity.html` | AI/ML engineer, Proof engineer | Mathematician | |
| `EntropyUniformity.html` | AI/ML engineer, Complexity theorist | Mathematician, Physicist | |
| `GPUHeatDeath.html` | Hardware engineer, AI/ML engineer | Physicist | Founder/investor, AI industry practitioner |
| `RotaEntropyProperties.html` | Proof engineer | Mathematician, Philosopher of mind | |
| `TheGreatestDebate.html` | CS student | Philosopher of mind, Physicist, Mathematician | Founder/investor |
| `PrimeShannonCodes` (component) | Cryptographer, CS student | Mathematician | |
| `the-address-is-the-map-visualizer/` | Complexity theorist, Proof engineer, CS student | Mathematician, Quantum computing enthusiast | Founder/investor |

---

## "Do This First" Actions

Every demo below can be opened immediately in a browser (except the React app, which needs `npm install && npm run dev`). These are the recommended first-touch entry points organized by audience:

### For someone who has never seen EGPT before:
1. **`GPUHeatDeath.html`** -- Immediately visceral. Shows why floating point fails at scale. No math prerequisite. (Outcome-first audiences start here.)
2. **`TheGreatestDebate.html`** -- Historical narrative context. Sets the philosophical stage. (Theory-first audiences start here.)
3. **`EGPTfractal.html`** -- Visual, hypnotic. Watch primes build fractal structure. (Everyone.)

### For code-oriented users:
4. **`EGPTFactalWave.html`** -- BigInt exact-arithmetic CA running in the browser. Inspect the console for collision events.
5. **`the-address-is-the-map-visualizer/`** -- Hands-on SAT solver. Upload DIMACS files, run solvers, verify certificates.

### For theory-oriented users:
6. **`RotaEntropyProperties.html`** -- Interactive proof of Rota's 5 axioms with a Bernoulli process. Adjust parameters and watch properties hold.
7. **`EntropyUniformity.html`** -- Compare primes vs composites. Edit the test numbers yourself.
8. **`EGPTNumberUniformity.html`** -- Deep-dive into a single number's entropy structure.

---

## Gap Analysis: Ideas Without Adequate Demo Coverage

### ID1 -- Ulam: CGS from a Random Walk (WEAK coverage)

**Current state:** Only the FractalWave CA has a random-walk connection, and it is indirect (wave spawning from collision events). There is no demo that directly shows physical units (centimeters, grams, seconds) emerging from a random walk.

**Suggested demos:**
- **"Random Walk to CGS" Visualizer** -- Animate a 1D/2D random walk and show how step count, displacement variance, and time ticks naturally produce length, mass, and time units. Interactive sliders for walk parameters. Target: Physicist, CS student, Philosopher of mind.
- **"Ulam's Monte Carlo"** -- Show how a random walk on the integer lattice converges to physical constants. Overlay the CGS derivation step by step.

### ID2 -- Von Neumann: Statistical AI Computer (WEAK coverage)

**Current state:** GPUHeatDeath shows why floating point is broken, but does not demonstrate the alternative -- a statistical/integer-only computer that works. There is no demo showing IOPs vs FLOPs performance or statistical computation.

**Suggested demos:**
- **"IOPs vs FLOPs" Side-by-Side** -- Run the same computation (e.g., dot product, FFT) in floating point and EGPTMath integer arithmetic. Show accumulated error divergence in real time. Target: AI/ML engineer, Hardware engineer, AI industry practitioner.
- **"Statistical Computer Simulator"** -- Visualize how integer-only operations achieve the same results as floating point with zero error accumulation. Connect to EGPTMath's 157-test suite. Target: Founder/investor, Hardware engineer.
- **"FAT vs FFT"** -- Pedagogical comparison of the Faster Abadir Transform (integer-only) against standard FFT. Show how classical QFT emerges from integer operations at O((log k)^3). Target: Quantum computing enthusiast, AI/ML engineer.

### ID3 -- Einstein: Algebraic Discrete Physics (MODERATE coverage, but indirect)

**Current state:** The fractal demos show discrete structure, and GPUHeatDeath shows why continuous math fails, but no demo directly derives a physical law from purely algebraic/discrete principles.

**Suggested demo:**
- **"Discrete Schrodinger"** -- Show a wave equation on a lattice (integer-only) and demonstrate that it reproduces standard quantum mechanics results. Target: Physicist, Quantum computing enthusiast.

### ID5 -- Abadir: CH Decidable / Unique Representations (MODERATE but could be stronger)

**Current state:** The address-is-the-map visualizer demonstrates the P=NP encoding side. No demo directly visualizes the Continuum Hypothesis result or why Cantor's diagonal fails in information space.

**Suggested demo:**
- **"Why Cantor's Diagonal Fails"** -- Interactive demonstration: attempt to construct a diagonal number outside the PPF encoding. Show visually that maximal compression leaves no room for the diagonal argument. Target: Mathematician, Philosopher of mind, Complexity theorist.

---

## File Inventory (Complete)

All files under `www/`:

### Standalone HTML Demos (open directly in browser)
- `www/EGPTfractal.html`
- `www/EGPTFactalWave.html`
- `www/EGPTNumberUniformity.html`
- `www/EntropyUniformity.html`
- `www/GPUHeatDeath.html`
- `www/RotaEntropy/RotaEntropyProperties.html`
- `www/RotaEntropy/TheGreatestDebate.html`

### React App (requires build step)
- `www/the-address-is-the-map-visualizer/` (27 TSX components, 3 solvers, utility modules)

### Supporting JavaScript Modules
- `www/js/EGPTFractalWave.js` -- Photonic CA engine (~1400 lines)
- `www/js/EGPTfractal.js` -- Pyramid fractal engine
- `www/js/EntropyComparisonExplorer.js` -- Entropy analysis core logic + UI controllers
- `www/js/EGPTCharting.js` -- Reusable Chart.js widget module

### Supporting Assets
- `www/css/style.css` -- Shared stylesheet
- `www/data/qft-presets.json` -- QFT preset configurations
- `www/data/qft-testdata.csv` -- QFT test data

### Documentation (within www/)
- `www/CLAUDE.md` -- Agent instructions for demo directory
- `www/RotaEntropy/EGPTPrimeShannonCodes.md` -- React component (TSX in markdown)
- `www/the-address-is-the-map-visualizer/README.md`
- `www/the-address-is-the-map-visualizer/README_ENHANCED.md`
- `www/the-address-is-the-map-visualizer/DEVELOPMENT_SETUP.md`
- `www/the-address-is-the-map-visualizer/GENERATED_PROBLEMS_SUMMARY.md`
- `www/the-address-is-the-map-visualizer/docs/PROBLEM_DESIGN_GUIDE.md`
