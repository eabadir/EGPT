# EGPT DEVSDK API Reference

This document describes the API for **egpt_devsdk** — the educational edition using a QuadTree-based engine. It reflects the refactored architecture: Engine produces `TickData`; consumers (e.g. `P5Renderer`) render it.

## Engine

- **egpt_devsdk**: Uses a simplified QuadTree-based engine (educational edition)
- Uses `planckConstant` and `wavelengthConstant` interchangeably (aliases for wavelength/scale)

---

## Context Object

Game objects (BouncyBox, OvenBox, SlitScreen, etc.) take a **context** object instead of EntropyGame directly. The context provides simulation bounds and universe access.

```javascript
context = {
  universe,      // EGPTUniverse instance
  canvas_rect     // Rectangle — simulation bounds (x, y, w, h)
}
```

**EntropyGame implements this shape**: In the browser, pass `this.entropyGame` as context. In Node tests, use a plain object: `{ universe, canvas_rect: rect }`.

---

## Rendering

The engine does not render. It returns `TickData` from `doTick()`. Rendering is done by consumers.

### P5Renderer

Standard P5.js consumer. Renders `TickData` and large objects to a P5 canvas.

```javascript
P5Renderer.render(tickData, largeObjects)
```

- **tickData** — Simulation output from `universe.doTick()`
- **largeObjects** — Array of LargeObject instances (walls, detectors)

Requires P5.js globals (`fill`, `rect`, `ellipse`, `background`, etc.) and `chroma` for color mapping.

---

## EntropyGame

Main orchestrator for UI, canvas, viewport, zoom/pan, and simulation loop. Implements the context shape (`universe`, `canvas_rect`).

### Constructor

```javascript
new EntropyGame(viewport_width, viewport_height, canvas_width?, canvas_height?, uiSetupFunctor?)
```

### Methods

| Method | Description |
|--------|-------------|
| `startSim()` | Start the simulation loop |
| `stopSim()` | Stop the simulation |
| `tearDown()` | Clean up and remove canvas/controls |
| `resizeGameCanvas(newVirtualWidth, newViewportWidth, canvas_rect)` | Resize the game canvas |
| `setFrameRate(fps)` | Set simulation frame rate |
| `initInterferenceChart(...)` | Initialize D3 interference chart for double-slit |
| `centerOn(x, y)` | Center viewport on coordinates |
| `zoom(delta)` | Zoom in/out |

### Properties

- `universe` — The EGPTUniverse instance
- `canvas_rect` — Rectangle defining the canvas bounds

### Draw Loop

```javascript
draw() {
  if (this.isLooping) {
    this.prerender();
    let tickData = this.doTick();
    if (tickData) {
      P5Renderer.render(tickData, this.universe.largeObjects);
    }
  }
}
```

---

## Setup Factories

Shared setup factories enable identical simulation config in browser and Node.

### createBlackbodySetup

Configures the Blackbody (BouncyBox) simulation. Used by both browser Experiments and Node tests.

```javascript
createBlackbodySetup(context, options = {})
```

**Returns**: `{ universe, bouncyBox, temperatureDial }`

**Options**:

| Option | Default | Description |
|--------|--------|-------------|
| `fundamental_dim` | 0 | Lowest dimension (leaf frame size 2^n × 2^n) |
| `quantum_dim` | 4 | Higher dimension for parent frames |
| `temperature` | 300 | Initial temperature |
| `boxFraction` | 1/3 | Fraction of canvas for box size |

**Example (browser)**:

```javascript
const context = this.entropyGame;
const { bouncyBox } = createBlackbodySetup(context, { temperature: 300 });
this.gameControls.setupTempSlider(bouncyBox.temperatureDial, 300);
this.entropyGame.startSim();
```

**Example (Node)**:

```javascript
const rect = new Rectangle(0, 0, 600, 600, null, false);
const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);
const context = { universe, canvas_rect: rect };
const { bouncyBox } = createBlackbodySetup(context, { temperature: 300 });
// Run ticks: universe.doTick()
```

---

### createParticleWalkSetup

Configures the Wave-Particle Duality / Particle Walk simulation. Used by both browser and Node setups.

```javascript
createParticleWalkSetup(context, options = {})
```

**Returns**: `{ universe, quantum_emitter, derivedPlanckConstant, realizedWaveLength, fundamentalDimension, fundamentalWaveLength }`

**Options**:

| Option | Default | Description |
|--------|--------|-------------|
| `fundamentalDimension` | `0` | Fundamental dimension `n`, so particle size is `2^n × 2^n` |
| `fundamentalWaveLength` | `64` | Desired full oscillation period for fundamental particles |
| `velocity` | `1` | Initial baseline velocity for particle walk |

**EGPT constraints**:

- `fundamentalDimension` must be a non-negative integer.
- `fundamentalWaveLength` must be an integer, at least `4`, and divisible by `4`.
- The setup derives an **integer** `planckConstant` from the requested `fundamentalDimension` and `fundamentalWaveLength`.
- If the requested wavelength is not exactly representable with an integer `planckConstant`, the setup logs a warning and reports the realized wavelength in `realizedWaveLength`.

**Example**:

```javascript
const { quantum_emitter, derivedPlanckConstant, realizedWaveLength } =
  createParticleWalkSetup(context, {
    fundamentalDimension: 2,   // 4x4 particles
    fundamentalWaveLength: 16  // full oscillation every 16 ticks/pixels
  });
```

For `fundamentalDimension = 2`, particle capacity is `16`, so the setup derives:

```text
planckConstant = round(16 / 16) = 1
realizedWaveLength = 16 * 1 = 16
```

**Non-representable combinations**: Some requested wavelengths cannot be exactly represented with a given dimension. For example, `fundamentalDimension = 3` (8×8 particles, capacity 64) with `fundamentalWaveLength = 24` yields `planckConstant = max(1, round(24/64)) = 1` and **realizedWaveLength = 64**, not 24. The setup logs a warning in this case. Use `fundamentalDimension = 1` with `fundamentalWaveLength = 24` for exact 24 (capacity 4, planckConstant 6).

---

### createWaveInterferenceSetup

Configures the Wave Interference simulation. Two PointSources emit particles radially in a circular pattern. Used by both browser Experiments and Node tests.

```javascript
createWaveInterferenceSetup(context, options = {})
```

**Returns**: `{ universe, pointSource1, pointSource2, derivedPlanckConstant, realizedWaveLength, fundamentalDimension, fundamentalWaveLength, applyFundamentalWaveLength }`

**Options**:

| Option | Default | Description |
|--------|--------|-------------|
| `fundamentalDimension` | `0` | Fundamental dimension `n`, so particle size is `2^n × 2^n` |
| `fundamentalWaveLength` | `8` | Desired full oscillation period for fundamental particles |
| `velocity` | `50000` | Initial velocity magnitude for radial emission |
| `sourceDiameter` | `32` | Diameter of each source circle (matches egpt_core) |
| `sourceSeparation` | `64` | Center-to-center distance between sources (matches egpt_core) |

**EGPT constraints**: Same as `createParticleWalkSetup` (dimension ≥ 0 integer; wavelength ≥ 4 and divisible by 4).

**Example**:

```javascript
const { pointSource1, pointSource2, realizedWaveLength } =
  createWaveInterferenceSetup(context, {
    fundamentalDimension: 0,
    fundamentalWaveLength: 8  // wavelength 8, circular emission
  });
```

---

## Experiments Setup Methods

All experiments use consistent signatures. Call these from your Experiments class or GameCard start handlers.

| Method | Signature | Description |
|--------|-----------|-------------|
| `setupEGPTFractal` | `()` | Interactive fractal: quantum in oscillator frame |
| `setupDoubleSlit` | `(useGreenLaser = false)` | Double-slit experiment; pass `true` for laser |
| `setupParticleWalk` | `()` | Wave-particle duality / random walk |
| `setupWaveInterference` | `()` | Two point sources, concentric interference |
| `setupBouncyBox` | `()` | Black body with bouncing quanta, temperature control |
| `setupBlackBody` | `()` | Black body radiation, temperature vs color |
| `setupAtomicModel` | `()` | Atom dropper, strong-force-like binding |
| `setupBigBang` | `(emergent_physics = true)` | Point source with emergent dimensions |

---

## Universe.init()

```javascript
universe.init(
  universe_rect,                  // Rectangle — required, simulation bounds
  fundamental_dimension_number,   // number — required, sets lowest_dimension and leaf frame size (2^n × 2^n)
  planckConstant = 1,             // number — wavelength/scale constant
  isGreedy = false,               // boolean — greedy frame packing
  noEscape = false,               // boolean — prevent quanta from leaving boundaries
  emergentDimensions = false,     // boolean — sets emergentPhysics; if true, enables top-down frame generation (Phase B) and auto-bundles brownianMotion=true, withInterQuantumCollisions=false
  noObserverFrame = false,        // boolean — if true, disables brownianMotion (no gravitational pull)
  withWrapping = false            // boolean — wrap quanta at boundaries
);
```

**Note**: The `emergentDimensions` parameter name is retained for backward compatibility. It sets `this.emergentPhysics`, which is the canonical property used for all branching logic.

**Bundled behavior when `emergentDimensions = true`**:

Setting `emergentDimensions = true` (i.e., `emergentPhysics = true`) automatically configures:
- `brownianMotion = true`
- `withInterQuantumCollisions = false`
- `withBonding = false`

This enforces the mutual exclusivity of the two frame generation modes:
- **Top-down** (`emergentPhysics = true`): Phase B density-based clustering via `addPointsFromQuadTree`, auto-spawn dimensions
- **Ground-up** (`emergentPhysics = false`): Phase C collision-based promotion via `handleStructurePromotion`, requires `withInterQuantumCollisions = true`

If `withInterQuantumCollisions` was set to `true` before calling `init()` with `emergentDimensions = true`, it will be overridden to `false` with a console warning.

**Note**: `doTick()` returns a `TickData` object. Rendering is handled by `P5Renderer.render(tickData, largeObjects)` in the game layer.

---

## Game Objects (EntropyGameObjects.js)

Game objects take **context** as the first parameter (e.g. `new BouncyBox(context, ...)`).

| Class | Purpose |
|-------|---------|
| `LargeObject` | Collidable walls/detectors |
| `SlitScreen` | Double-slit barrier |
| `DetectorWall` | Particle counting wall |
| `QuantumEmitter` | Emits quanta from rect(s) |
| `PointSource` | Radial emission (emergentPhysics param) |
| `SlitLightSource` | Light source for double-slit |
| `BouncyBox` | Box with bouncing quanta + OvenBox temperature control |
| `OvenBox` | Temperature-controlled wall emitters (used by BouncyBox) |
| `Box` | Rectangular wall enclosure |
| `Laser` | Laser beam emitter |
| `AtomDropper` | Drops atoms into simulation |
| `EgptFractal` | Fractal oscillator demo |

### EgptFractal Constructor

```javascript
new EgptFractal(entropyGame, canvas_rect, universe, entropyGameRef?)
```

The 4th parameter is optional (for API consistency with egpt_core).

---

## CollisionTypes

`NONE`, `REFLECT_X`, `REFLECT_Y`, `REFLECT_XY`, `RANDOM_X`, `RANDOM_Y`, `RANDOM_XY`, `MOMENTUM_BASED`, `BOUNCE_UP`, `BOUNCE_DOWN`, `BOUNCE_LEFT`, `BOUNCE_RIGHT`

---

## CollisionActions

`NONE`, `COUNT`, `RECOLOR`, `FORCE_RENDER`, `DETECT`, `MARK`, `KILL`, `CONTAIN_X`, `CONTAIN_Y`, `BLOCK`, `BOUNCE`, `ABSORB`

---

## GameCard Structure

```javascript
{
  title: 'Experiment Title',
  imageSrc: 'images/example.png',
  includeInMenu: true,
  text: 'Description',
  id: 'setupExperimentId',
  start: function(experiment) {
    experiment.setupExperimentId();
  }
}
```
