# egpt-fraqtl-devsdk

Discrete fractal physics engine. No force calculations. Physics emerges.

## What Is EGPT?

EGPT (Electronic Graph Paper Theory) models the universe as a discrete, fractal system based on Ulam-von Neumann cellular automata, Gian-Carlo Rota's Entropy Theorem, and Essam Abadir's extensions. Three primitives define everything:

| Primitive | Definition | Unit |
|-----------|-----------|------|
| **Time** | 1 tick | Discrete, indivisible |
| **Space** | 1 pixel | Discrete, indivisible |
| **Mass** | Pixel occupancy | Count of leaf quanta within a frame |

**The Frame Axiom:** Everything is a Frame. There is no separate "particle" class — a quantum is simply a leaf Frame (`is_leaf = true`). By Ulam's partition theory, every body is both an individual actor AND an inertial reference frame to its children. The system is strictly recursive and scale-invariant.

There are **no force calculations** — no `F=ma`, no gravitational constants. Every frame makes local greedy choices (1px nudges), and complex physics (gravity, wave-particle duality, atom formation) **emerges** from these simple rules.

## Quick Start

### Install

```bash
npm install egpt-fraqtl-devsdk
```

### Run a Simulation (Node.js, Headless)

```bash
npx egpt-fraqtl-devsdk --experiment=particle_walk --ticks=200
npx egpt-fraqtl-devsdk --experiment=wave_interference --ticks=500 --out=wave_data.json
npx egpt-fraqtl-devsdk --help
```

### Use Programmatically

```javascript
const { EGPTUniverse, Rectangle } = require('egpt-fraqtl-devsdk');

// Create a 600x600 universe
const rect = new Rectangle(0, 0, 600, 600, null, false);
const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);

// Run 100 ticks
for (let t = 0; t < 100; t++) {
    universe.doTick();
    // Access universe.dimensions[0].frames for particle data
}
```

### Browser Visualization (P5.js)

Open `index.html` in a local web server to see the full interactive visualization with experiment selection, zoom/pan controls, and real-time charting.

## Available Experiments

| Name | Description | Command |
|------|-------------|---------|
| `particle_walk` | Quantum random walk — wave-particle duality | `--experiment=particle_walk` |
| `wave_interference` | Double-slit wave interference patterns | `--experiment=wave_interference` |
| `blackbody` | Blackbody radiation spectrum | `--experiment=blackbody` |
| `oscillator` | Harmonic oscillator | `--experiment=oscillator` |
| `atomic_model` | Atomic structure formation | `--experiment=atomic_model` |

### CLI Options

```
--experiment=<name>           Experiment to run (default: particle_walk)
--ticks=<number>              Number of simulation ticks (default: 100)
--out=<filename>              Output JSON file (default: simulation_data.json)
--fundamentalDimension=<n>    Dimension n for 2^n x 2^n particles
--fundamentalWaveLength=<n>   Desired oscillation period
```

## Project Structure

```
js/
  engine/           Physics engine core
    EGPTfraqtl.js     Main engine (Frame, Dimension, EGPTUniverse)
    quadtree.js        Spatial indexing (QuadTree, Rectangle)
    engine.node.js     Node.js adapter (sets up globals, polyfills)
    test_*.js          Test suite
  game/             Game object layer
    EntropyGame.js     Main game manager (browser)
    EntropyGameObjects.js  Reusable objects (PointSource, OvenBox, SlitScreen, etc.)
    GameControls.js    UI controls (browser)
    charting.js        Data visualization (browser)
  simulation/       Experiment setup factories
    setupParticleWalk.js
    setupWaveInterference.js
    setupBlackbody.js
    setupOscillator.js
    setupAtomicModel.js
  consumers/        Rendering consumers
    P5Renderer.js      P5.js renderer (browser)
    IConsumer.js       Consumer interface documentation
  examples/         Tutorial experiments
  user/             User experiment template (HelloEGPT.js)
bin/                CLI runner
docs/               Documentation
  EGPT_DEVSDK_API_REFERENCE.md
  EGPT_DEVSDK_IMPLEMENTATION_GUIDE.md
  EGPT_SIMULATION_SCENARIOS.md
  EGPT FRACTAL Programming Guide.md
  COLLISION_SYSTEM_DESIGN.md
  DeSciX_Community_License_v1.pdf
.claude/            Agent team config (for Claude Code users)
```

## Engine Invariants

These rules can never be violated. The agent team enforces them automatically.

1. **Universal Speed Limit** — 1 pixel/tick max displacement. Excess becomes momentum.
2. **Single Occupancy** — No two leaf quanta in the same pixel at the same tick.
3. **Recursive Relativity** — Parent movement cascades as momentum to children.
4. **No Force Calculations** — Only local greedy choices. No F=ma, no G constant.
5. **Emergent Conservation** — Mass, momentum, energy conservation emerges from the rules.
6. **Wavelength = Capacity/Mass** — Every Frame is an oscillator. Higher mass = shorter wavelength.

## For Claude Code Users

This package includes a `.claude/` directory with:
- **CLAUDE.md** — Engine invariants, anti-patterns, and development rules
- **memory/agent-team.md** — Full multi-agent orchestration protocol with prompt templates

When you open this project in Claude Code or VSCode with the Claude extension, the AI assistant automatically:
- Enforces physics model constraints (no force calculations, 1px/tick speed limit, etc.)
- Uses a multi-agent review protocol for physics-touching changes (Theorist, Architect, Docs, Impl agents)
- Runs tests before merging any changes
- Catches anti-patterns that would break emergent physics

### Agent Team Roles

| Role | Purpose |
|------|---------|
| **Theoretical Advisor** | Validates all physics changes against invariants. Has veto power. |
| **System Architect** | Reviews API surface, spatial index, and data flow consistency. |
| **Documentation Agent** | Keeps docs in sync after every implementation change. |
| **Implementation Agent** | Writes engine, game, and simulation code. |

See `.claude/memory/agent-team.md` for the full prompt templates and orchestration protocol.

## Writing Your Own Experiment

1. Create a setup factory in `js/simulation/`:

```javascript
function createMyExperimentSetup(context, options) {
    const { universe, canvas_rect } = context;
    // Add dimensions, create emitters, configure universe
    // Return { tickFunction, ... } for the simulation loop
}
module.exports = { createMyExperimentSetup };
```

2. Wire it into `bin/cli.js` or create your own Node script
3. For browser mode, add a card in `js/examples/tutorial/Experiments.js`
4. Run `npm test` to verify engine invariants still hold

## Tests

```bash
npm test                    # Main promotion test suite
npm run test:wave           # Wave interference tests
npm run test:period         # Wave period tests
npm run test:collision      # Collision tests
npm run test:all            # All test suites
```

## Documentation

- [API Reference](docs/EGPT_DEVSDK_API_REFERENCE.md)
- [Implementation Guide](docs/EGPT_DEVSDK_IMPLEMENTATION_GUIDE.md)
- [Simulation Scenarios](docs/EGPT_SIMULATION_SCENARIOS.md)
- [Programming Guide](docs/EGPT%20FRACTAL%20Programming%20Guide.md)
- [Collision System Design](docs/COLLISION_SYSTEM_DESIGN.md)

## License

Copyright 2023-2025 Essam Abadir. Licensed under the DeSciX Community License. See [docs/DeSciX_Community_License_v1.pdf](docs/DeSciX_Community_License_v1.pdf).
