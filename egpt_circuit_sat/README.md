# EGPT Circuit SAT: Half-Adder via Discrete Particle Transport

A complete, self-contained package for reproducing and demonstrating the half-adder circuit SAT experiment described in the white paper *"Boolean Computation via Discrete Particle Transport: A Half-Adder Without Force Calculations"*.

## What Is This?

This experiment demonstrates a binary half-adder (XOR gate for SUM, AND gate for CARRY) operating entirely within the **EGPT FRAQTL VM** -- a discrete fractal physics engine with:

- **No force calculations** -- no F=ma, no gravitational constants, no electromagnetic fields
- **Three primitives only** -- time (1 tick), space (1 pixel), mass (pixel occupancy)
- **Information conservation** -- quanta are never created or destroyed by engine rules
- **Deterministic reproduction** -- seeded Mulberry32 PRNG for exact replay

The half-adder produces correct SUM and CARRY outputs for all four input combinations (0,0), (0,1), (1,0), (1,1) as a statistical steady state of particle flow through geometric boundaries.

## Quick Start

### Reproduce the 80-experiment dataset (Node.js)

```bash
# Full reproduction (4 combos x 20 seeds x 3000 ticks each)
node run_multiseed.js

# Quick smoke test (4 combos x 1 seed x 1000 ticks)
node run_multiseed.js --seeds=1 --ticks=1000 --verbose
```

No `npm install` required -- the engine is pure JavaScript with zero dependencies.

### Run the interactive web demo

Open `index.html` in a modern browser. The half-adder visualization will start immediately with both inputs active (1,1). Use the controls panel to:

- Toggle **Input A** and **Input B** on/off
- Click **Run Truth Table Sweep** to automatically test all 4 combinations
- Watch particles flow through wires, activate density-threshold gates, and produce correct outputs

## Working Parameters

| Parameter | Value | Meaning |
|-----------|-------|---------|
| voltage | 2 | Initial momentum of emitted particles |
| emissionRate | 3 | Particles injected per tick per battery |
| gateThreshold | 3 | Density threshold for gate activation |
| probeThreshold | 20 | Density threshold for output HIGH/LOW |
| wallThick | 6 | Boundary wall thickness (insulation) |
| ticks | 3000 | Simulation duration per experiment |

## Results

80/80 experiments correct (100%). See `data/` for the full dataset.

| Input (A,B) | Expected SUM | Expected CARRY | SUM Flow | CARRY Flow |
|-------------|-------------|----------------|----------|------------|
| (0,0) | LOW | LOW | 0.0 | 0.0 |
| (0,1) | HIGH | LOW | 85.2 +/- 3.6 | 0.0 |
| (1,0) | HIGH | LOW | 68.2 +/- 1.8 | 0.0 |
| (1,1) | LOW | HIGH | 9.5 +/- 2.1 | 131.9 +/- 1.6 |

## File Layout

```
paper/              White paper draft (Sections 1-3, 4-9, circuits guide)
data/               Collected experiment data (80 runs, 4 JSON files)
js/
  engine/           EGPT FRAQTL VM engine (EGPTfraqtl.js, quadtree.js)
  game/             Game objects, circuit components, controls, charting
  circuit/          Circuit parser and layout engine
  simulation/       Experiment setup factories
  consumers/        P5.js renderer
  vendor/           Vendored libraries (P5.js, D3.js, Chroma.js, Bootstrap)
css/                Stylesheets
run_multiseed.js    CLI runner for reproducing experiments
index.html          Interactive web demo
```

## White Paper

The full paper is in `paper/`:
- `sections_1_3.md` -- Introduction, EGPT Model, Circuit Primitives
- `sections_4_8.md` -- Layout, Results, Discussion, Circuit SAT, Related Work, Conclusion
- `circuits_guide.md` -- Programming guide for building circuits in the EGPT FRAQTL VM

## License

Copyright 2023-2025 Essam Abadir. Licensed under the DeSciX Community License. See `LICENSE.pdf`.
