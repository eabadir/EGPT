# Web Demos

Browser-based interactive demos and visualizations of EGPT concepts. **No build step** — open HTML files directly in your browser.

## Main Demos

| File | What It Shows |
|------|--------------|
| `EGPTNumberUniformity.html` | Single number entropy uniformity analysis (Chart.js) |
| `EGPTFactalWave.html` | Fractal wave visualization |
| `EGPTfractal.html` | EGPT fractal structure explorer |
| `EntropyUniformity.html` | Entropy distribution analysis |
| `GPUHeatDeath.html` | GPU entropy / heat death simulation |
| `EGPTTestRunner.html` | Interactive test runner — run 157+ EGPTMath tests in-browser with live results |

## Subdirectories

- **`RotaEntropy/`** — Interactive Rota entropy properties explorer (`RotaEntropyProperties.html`, 38KB). Also contains `TheGreatestDebate.html` and `EGPTPrimeShannonCodes.md`.
- **`the-address-is-the-map-visualizer/`** — React + TypeScript visualization app. This one DOES require a build step: `npm install && npm start`. Has its own `README.md` and development docs.
- **`GravitySim/`** — p5.js gravity simulation demonstrating how random walks on a discrete lattice produce inverse-square force laws (Newton's gravity, Coulomb's law). Open `index.html` directly. Files: `index.html`, `sketch.js` (~867 lines), `README.md`. Primary ideas: ID1, ID3, ID4. Secondary: ID5.
- **`fraqtl_devsdk/`** — EGPT FRAQTL DevSDK: full integer-only physics engine with 5 experiments (particle walk, wave interference, blackbody, harmonic oscillator, atomic model). Open `index.html` directly. Core engine: `js/engine/EGPTfraqtl.js` (~5000+ lines). Also includes `js/game/EntropyGame.js`, `js/consumers/P5Renderer.js`, CLI tools (`bin/cli.js`), tests, and its own `.claude/CLAUDE.md`. Primary ideas: ID1, ID2, ID3, ID4. Secondary: ID5.
- **`js/`** — Shared JavaScript visualization code (p5.js for cellular automata, Chart.js for graphs). Key file: `EGPTFractalWave.js` (~1400 lines, photonic CA simulation).
- **`css/`** — Shared stylesheets
- **`data/`** — Data files for visualizations

## Conventions

- Most demos are self-contained HTML files with inline or `js/`-referenced scripts
- Chart.js and p5.js are the primary visualization libraries
- The React app in `the-address-is-the-map-visualizer/` is the exception to the no-build-step rule
- GravitySim and fraqtl_devsdk are p5.js apps that open directly in the browser (no build step)
