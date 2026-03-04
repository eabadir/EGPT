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

## Subdirectories

- **`RotaEntropy/`** — Interactive Rota entropy properties explorer (`RotaEntropyProperties.html`, 38KB). Also contains `TheGreatestDebate.html` and `EGPTPrimeShannonCodes.md`.
- **`the-address-is-the-map-visualizer/`** — React + TypeScript visualization app. This one DOES require a build step: `npm install && npm start`. Has its own `README.md` and development docs.
- **`js/`** — Shared JavaScript visualization code (p5.js for cellular automata, Chart.js for graphs). Key file: `EGPTFractalWave.js` (~1400 lines, photonic CA simulation).
- **`css/`** — Shared stylesheets
- **`data/`** — Data files for visualizations

## Conventions

- Most demos are self-contained HTML files with inline or `js/`-referenced scripts
- Chart.js and p5.js are the primary visualization libraries
- The React app in `the-address-is-the-map-visualizer/` is the exception to the no-build-step rule
