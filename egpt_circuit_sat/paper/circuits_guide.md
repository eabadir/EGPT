# FRAQTL Circuits: Simulating Electronics with Particle Diffusion

## 1. Introduction

This guide covers the EGPT FRAQTL VM circuit simulation system -- a way to model electronic circuits using particle diffusion through geometric channels. Instead of solving Kirchhoff's voltage and current laws or applying Ohm's law as formulas, circuits are built from spatial boundaries (walls) and particle sources (emitters). Voltage, current, resistance, and logic gate behavior all **emerge** from the geometry and the engine's fundamental rules: 1 pixel per tick speed limit, single occupancy, and brownian motion.

The circuit system is built entirely on existing experiment-layer objects -- `LargeObject` walls and `QuantumEmitter` sources. No engine modifications were needed. Every circuit component is a composition of these two primitives, arranged spatially to create the desired electrical behavior.

Key files:

- `js/game/CircuitObjects.js` -- All circuit component classes
- `js/simulation/setupCircuitBasic.js` -- Series resistor example
- `js/simulation/setupCircuitSAT.js` -- Half-adder (Circuit SAT) example
- `js/circuit/CircuitParser.js` -- Netlist parsing (JSON and BLIF)
- `js/circuit/CircuitLayout.js` -- Automatic topological layout

---

## 2. Physics-to-Electronics Correspondence

Every electronic concept maps to a FRAQTL primitive. No formulas are used -- behavior emerges from geometry and particle dynamics.

| Electronics Concept | FRAQTL Primitive |
|---|---|
| Charge carrier (electron) | Leaf Frame (particle) -- `is_leaf = true` |
| Wire | Two parallel `LargeObject` walls forming a tube (channel) |
| Voltage (V) | Initial momentum `(vx, vy)` toward sink -- direction vector scaled by voltage parameter |
| Current / Amperage (I) | Particles emitted per tick (`burst_size`) |
| Resistance (R) | Geometric constriction -- narrower channel gap reduces throughput |
| Insulation | Wall thickness -- thicker walls have higher collision detection probability, reducing leakage |
| Logic gate | Density-activated conditional boundary with hysteresis |
| Probe / ammeter | Non-intrusive QuadTree density query in a rectangular region |
| Ground / sink | `LargeObject` with `ABSORB` collision action |

---

## 3. Universe Configuration for Circuits

Circuit experiments require specific universe settings:

- **`emergentPhysics = false`** (ground-up mode) -- Circuits need collision-based physics, not top-down density clustering. Particles must physically walk through wire channels and bounce off walls.

- **`brownianMotion = true`** -- Particles explore all available paths via random walk. This creates realistic diffusion current: particles drift in the voltage direction while filling all accessible geometry. Without brownian motion, particles would travel in straight lines and miss branching paths.

- **`withInterQuantumCollisions = true`** -- Enables inter-particle collisions, which create pressure and backpressure effects. When a channel is congested (e.g., behind a resistor), particles push back against the flow, just like real current in a resistive circuit.

- **`fundamentalDim = 0`** -- Single dimension layer. Circuits operate on flat 2D geometry with no need for higher-dimensional structure formation.

Here is the initialization pattern from `setupCircuitBasic.js`:

```javascript
// Initialize universe: ground-up mode with brownian motion for diffusion
universe.init(canvas_rect, fundamentalDim, 1, false, false, false, false, false);
universe.brownianMotion = true;
universe.withInterQuantumCollisions = true;
```

The `universe.init()` call sets `emergentPhysics = false` implicitly (ground-up mode). Then brownian motion and inter-quantum collisions are enabled explicitly.

---

## 4. Circuit Components Reference

### 4.1 CircuitWire

A wire is two parallel `LargeObject` walls forming a tube. Particles bounce between the walls and diffuse along the channel.

**Constructor:**

```javascript
new CircuitWire(context, x1, y1, x2, y2, width, wallThickness, color)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `context` | Object | required | `{ universe, canvas_rect }` |
| `x1` | number | required | Start X position (center of wire) |
| `y1` | number | required | Start Y position (center of wire) |
| `x2` | number | required | End X position (center of wire) |
| `y2` | number | required | End Y position (center of wire) |
| `width` | number | `6` | Channel width in pixels (gap between walls) |
| `wallThickness` | number | `3` | Thickness of each wall in pixels |
| `color` | Array | `[80, 80, 80]` | Wall color `[r, g, b]` |

**How it works:**

The constructor auto-detects orientation (horizontal vs vertical) based on which delta is larger (`|dx| >= |dy|` = horizontal). It then creates two parallel walls with box-pattern containment: the wall named `"TOP"` has reposition `"bottom"`, ejecting particles downward into the channel, and vice versa.

Wall thickness acts as insulation. Thicker walls have a higher probability of detecting and bouncing back any particle that enters them, reducing leakage.

**Key method:**

- `getChannelRect()` -- Returns a `Rectangle` describing the open space between the walls (the area particles can occupy).

**Cross-section of a horizontal wire:**

```
         wallThickness
        |<--------->|
  ------+===========+------    <- Top wall (name="TOP", reposition="bottom")
        |           |
        |  channel  |  width   <- Open channel (particles diffuse here)
        |           |
  ------+===========+------    <- Bottom wall (name="BOTTOM", reposition="top")
```

**Code example:**

```javascript
// Create a horizontal wire from (50, 100) to (200, 100), 10px wide channel
const wire = new CircuitWire(context, 50, 100, 200, 100, 10, 3);
wire.addToUniverse();
```

---

### 4.2 CircuitBattery

A battery consists of two parts: a `QuantumEmitter` (+ terminal / source) and a `LargeObject` with `ABSORB` collision action (- terminal / sink). Together they create a pressure differential that drives diffusion current.

**Constructor:**

```javascript
new CircuitBattery(context, sourceX, sourceY, sinkX, sinkY, amperage, terminalSize, fundamentalDim, voltage, sourceColor, sinkColor)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `context` | Object | required | `{ universe, canvas_rect }` |
| `sourceX` | number | required | X position of + terminal (emitter center) |
| `sourceY` | number | required | Y position of + terminal |
| `sinkX` | number | required | X position of - terminal (absorber center) |
| `sinkY` | number | required | Y position of - terminal |
| `amperage` | number | `5` | Quanta emitted per tick |
| `terminalSize` | number | `8` | Size of terminal regions in pixels |
| `fundamentalDim` | number | `0` | Fundamental dimension layer |
| `voltage` | number | `1` | Initial momentum magnitude |
| `sourceColor` | Array | `[255, 60, 60]` | Color of + terminal |
| `sinkColor` | Array | `[60, 60, 255]` | Color of - terminal |

**How it works:**

- **Voltage** is modeled as the initial momentum direction vector. The constructor computes a unit vector from source to sink, then scales it by the `voltage` parameter. Under brownian motion, this initial momentum gives particles a probabilistic directional drift toward the sink while still exploring all paths. The engine's 1px/tick speed limit caps displacement, but excess momentum accumulates for future ticks.

- **Amperage** is the `burst_size` -- the number of particles emitted per tick. More particles per tick = more current.

- The emitter uses `random_direction = false` so particles inherit the computed `(vx, vy)` direction toward the sink.

- `fixedLeafMass = 1` ensures each emitted particle is exactly one quantum.

**Key methods:**

| Method | Description |
|---|---|
| `setVoltage(v)` | Recompute initial momentum magnitude. Updates emitter's `vx`/`vy`. |
| `setAmperage(a)` | Set particles per tick. Updates emitter's `burst_size`. |
| `setEnabled(bool)` | Enable/disable the battery. Sets `emitter.auto_fire`. |

**Code example:**

```javascript
// Battery: source at (50, 100), sink at (250, 100), 5 particles/tick, voltage 1
const battery = new CircuitBattery(context, 50, 100, 250, 100, 5, 8, 0, 1);
battery.addToUniverse();

// Adjust at runtime
battery.setAmperage(10);  // double the current
battery.setVoltage(2);    // increase drift speed
battery.setEnabled(false); // turn off
```

---

### 4.3 CircuitResistor

A resistor narrows the channel at a specific point using two additional walls that constrict the passage. Ohm's law emerges naturally: a narrower gap means fewer particles can pass per tick, reducing flow rate (current) downstream.

**Constructor:**

```javascript
new CircuitResistor(context, x, y, length, channelWidth, outerWidth, horizontal, wallThickness, color)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `context` | Object | required | `{ universe, canvas_rect }` |
| `x` | number | required | Center X position |
| `y` | number | required | Center Y position |
| `length` | number | `10` | Length along flow direction |
| `channelWidth` | number | `2` | Constricted channel width in pixels |
| `outerWidth` | number | `6` | Width of the containing wire (for transition walls) |
| `horizontal` | boolean | `true` | Flow direction (`true` = left-to-right) |
| `wallThickness` | number | `3` | Wall thickness |
| `color` | Array | `[140, 100, 50]` | Wall color (brownish by default) |

**How it works:**

The resistor creates two walls that protrude into the channel from opposite sides, leaving only `channelWidth` pixels of open space. The wall height on each side is `(outerWidth - channelWidth) / 2`.

```
  Wire top wall  ═══════════════════════════════════  Wire top wall
                 ┌─────────────┐
                 │  Resistor   │  <- Top constriction wall
                 │  top wall   │
                 └─────────────┘
                   channelWidth   <- Narrowed gap (e.g., 4px)
                 ┌─────────────┐
                 │  Resistor   │  <- Bottom constriction wall
                 │  bottom wall│
                 └─────────────┘
  Wire bottom wall ═══════════════════════════════════  Wire bottom wall
```

**Observed data:** In a 10px-wide channel with a 4px constriction, the `before_resistor` probe measures approximately 12 particles per tick while the `after_resistor` probe measures approximately 2 particles per tick. This 6:1 ratio emerges purely from the geometric bottleneck -- no resistance formula is involved.

**Code example:**

```javascript
// Resistor at center (150, 100): 20px long, 4px constriction in 10px channel
const resistor = new CircuitResistor(context, 150, 100, 20, 4, 10, true, 3);
resistor.addToUniverse();
```

---

### 4.4 CircuitProbe

A probe performs non-destructive particle density measurement. It counts particles in a rectangular region using a direct QuadTree query -- it does not use collision-based counting. Particles pass through the probe region unaffected.

**Constructor:**

```javascript
new CircuitProbe(context, x, y, size, name, color)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `context` | Object | required | `{ universe, canvas_rect }` |
| `x` | number | required | Probe center X |
| `y` | number | required | Probe center Y |
| `size` | number | `6` | Probe region size (square) |
| `name` | string | `"probe"` | Probe name for identification |
| `color` | Array | `[0, 255, 0]` | Probe color (green by default) |

**How it works:**

Each tick, the `Circuit` container calls `probe.sample(qtree)`, which performs a QuadTree `query()` on the probe's `searchRect`. The count of particles found is appended to a rolling window array (`tickCounts`). The window is capped at `windowSize` ticks (default 10), with the oldest entry shifted off when the window is full.

A visual `LargeObject` marker is added to the universe with `CollisionTypes.NONE` and no collision actions, so it renders but does not interact with particles.

**Key methods:**

| Method | Description |
|---|---|
| `sample(qtree)` | Count particles in the probe region via QuadTree query. Called by Circuit each tick. |
| `getFlowRate()` | Average particle count over the rolling window. |
| `getLastCount()` | Raw count from the most recent tick. |
| `isHigh(threshold)` | Returns `true` if `getFlowRate() >= threshold`. Used for digital logic. |

**Code example:**

```javascript
const probe = new CircuitProbe(context, 150, 100, 10, 'my_probe');
probe.addToUniverse();

// Later, in the evaluation loop:
probe.sample(qtree);
console.log('Flow rate:', probe.getFlowRate());
console.log('Is HIGH:', probe.isHigh(3));
```

---

### 4.5 CircuitGate

A gate is a density-activated conditional boundary. Its body is a `LargeObject` that toggles between `BOUNCE` (closed -- blocks particles) and `NONE` (open -- particles pass through) based on particle density in one or more control regions.

**Constructor:**

```javascript
new CircuitGate(context, gateType, x, y, signalWidth, gateLength, horizontal, options)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `context` | Object | required | `{ universe, canvas_rect }` |
| `gateType` | string | required | `'AND'`, `'OR'`, `'NOT'`, `'XOR'`, `'BUFFER'` |
| `x` | number | required | Gate body center X |
| `y` | number | required | Gate body center Y |
| `signalWidth` | number | `6` | Width of signal channel |
| `gateLength` | number | `4` | Length of gate body along signal flow |
| `horizontal` | boolean | `true` | Signal flow direction |
| `options.thresholdHigh` | number | `3` | Density above which a control input is considered HIGH |
| `options.thresholdLow` | number | `1` | Density below which a control input is considered LOW |
| `options.windowTicks` | number | `10` | Rolling average window for density measurement |
| `options.fundamentalDim` | number | `0` | Fundamental dimension layer |
| `options.notEmissionRate` | number | `2` | NOT gate internal emitter rate |

**How it works:**

1. **Control regions** are rectangular areas (set via `addControlRegion(rect)`) where particle density is sampled each tick via QuadTree query.

2. **Hysteresis** prevents chatter. Each control input tracks its own HIGH/LOW state independently:
   - Transitions to HIGH when rolling average density >= `thresholdHigh`
   - Transitions to LOW when rolling average density < `thresholdLow`
   - Stays in its current state when density is between the two thresholds

3. **Gate logic** computes output from per-input states:

| Gate Type | Logic | Default State |
|---|---|---|
| `AND` | Open when ALL inputs HIGH | Closed |
| `OR` | Open when ANY input HIGH | Closed |
| `NOT` | Open when input LOW | Open |
| `XOR` | Open when inputs DIFFER | Closed |
| `BUFFER` | Open when input HIGH | Closed |

4. **Visual feedback**: Green = open, Red = closed, Yellow = default/initial.

5. **NOT gate special behavior**: Since brownian motion alone does not carry particles directionally through an open gap, NOT gates include an internal `QuantumEmitter` (analogous to a CMOS pull-up transistor). When the gate is open (input LOW), the internal emitter fires particles into the output channel. When the input is HIGH, the gate body blocks the signal and the emitter stops.

**Key methods:**

| Method | Description |
|---|---|
| `addControlRegion(rect)` | Add a rectangular region where density is sampled. |
| `evaluate(qtree)` | Sample all control regions, apply hysteresis, update gate state. Called by Circuit each tick. |
| `getTickFunction()` | Returns tick function for NOT gate emitter. Non-NOT gates return a no-op. |

**Code example:**

```javascript
const gate = new CircuitGate(context, 'AND', 200, 100, 10, 8, true, {
    thresholdHigh: 3,
    thresholdLow: 1,
    windowTicks: 10,
});

// Add control input regions (rectangles overlapping input wire channels)
gate.addControlRegion(new Rectangle(170, 90, 20, 10, null, false));  // Input A
gate.addControlRegion(new Rectangle(170, 100, 20, 10, null, false)); // Input B

gate.addToUniverse();
```

---

### 4.6 CircuitJunction

A junction is an open area where wire segments converge. It has no walls and no collision behavior. Particles naturally diffuse into whichever connected channels are available.

**Constructor:**

```javascript
new CircuitJunction(context, x, y, size)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `context` | Object | required | `{ universe, canvas_rect }` |
| `x` | number | required | Junction center X |
| `y` | number | required | Junction center Y |
| `size` | number | `8` | Junction open area size |

Junctions are purely conceptual -- `addToUniverse()` is a no-op since junctions are just the absence of walls where channels meet.

---

### 4.7 Circuit (Container)

The `Circuit` class is the top-level orchestrator. It holds all components, provides builder methods, and manages per-tick gate evaluation and probe sampling.

**Constructor:**

```javascript
new Circuit(context, options)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `context` | Object | required | `{ universe, canvas_rect }` |
| `options.wireWidth` | number | `6` | Default channel width for all wires |
| `options.wallThickness` | number | `3` | Default wall thickness |
| `options.fundamentalDim` | number | `0` | Fundamental dimension layer |
| `options.gateThreshold` | number | `3` | Default gate threshold (HIGH trigger) |
| `options.gateWindowTicks` | number | `10` | Default gate rolling window size |

**Builder methods:**

| Method | Returns | Description |
|---|---|---|
| `addWire(x1, y1, x2, y2, width, wallThickness, color)` | `CircuitWire` | Add a wire channel |
| `addBattery(sourceX, sourceY, sinkX, sinkY, amperage, terminalSize, voltage)` | `CircuitBattery` | Add a battery (source + sink) |
| `addResistor(x, y, length, channelWidth, horizontal)` | `CircuitResistor` | Add a flow constriction |
| `addGate(gateType, x, y, signalWidth, gateLength, horizontal, options)` | `CircuitGate` | Add a logic gate |
| `addProbe(x, y, name, size)` | `CircuitProbe` | Add a density probe |
| `addJunction(x, y, size)` | `CircuitJunction` | Add an open junction |

**Lifecycle methods:**

| Method | Description |
|---|---|
| `addToUniverse()` | Adds all components to the universe and registers the evaluation tick function. Call this after all components are added. |
| `getEvaluationTickFunction()` | Returns the per-tick function that: (1) gets the QuadTree from the fundamental dimension, (2) evaluates all gates, (3) samples all probes. Automatically registered by `addToUniverse()`. |
| `getCircuitState()` | Returns a snapshot of all probe readings: `{ probeName: { flowRate, lastCount, isHigh } }`. |

---

## 5. Tutorial: Building a Series Resistor Circuit

This walkthrough follows `setupCircuitBasic.js` step by step.

### Circuit layout

```
  [Bat+] ════════ [Probe A] ═══ [Resistor] ═══ [Probe B] ════════ [Bat-]
  ╚══════════════════════════════════════════════════════════════════════╝
```

One continuous horizontal wire tube. The resistor narrows the channel at the midpoint. Probes sample density before and after the constriction. The battery source (left) emits particles that drift toward the battery sink (right).

### Step 1: Create context and initialize universe

```javascript
const wireWidth = 10;
const amperage = 5;
const voltage = 1;
const resistorWidth = 4;
const fundamentalDim = 0;
const wallThickness = 3;

// Ground-up mode, brownian motion, inter-particle collisions
universe.init(canvas_rect, fundamentalDim, 1, false, false, false, false, false);
universe.brownianMotion = true;
universe.withInterQuantumCollisions = true;
```

### Step 2: Create Circuit container

```javascript
const circuit = new Circuit(context, {
    wireWidth: wireWidth,
    wallThickness: wallThickness,
    fundamentalDim: fundamentalDim,
});
```

### Step 3: Compute layout positions

```javascript
const margin = 40;
const centerY = Math.round(canvas_rect.h / 2);
const wireLeft = margin;
const wireRight = canvas_rect.w - margin;
const wireLen = wireRight - wireLeft;

const batSourceX = wireLeft + 10;
const probeAX = wireLeft + Math.round(wireLen * 0.3);
const resistorX = wireLeft + Math.round(wireLen * 0.5);
const probeBX = wireLeft + Math.round(wireLen * 0.7);
const batSinkX = wireRight - 10;
```

### Step 4: Add continuous wire tube

```javascript
circuit.addWire(wireLeft, centerY, wireRight, centerY, wireWidth, wallThickness);
```

### Step 5: Add end-cap walls

End caps seal the wire at both ends, preventing particles from escaping:

```javascript
// Left end cap
circuit.addWire(wireLeft, centerY - wireWidth / 2, wireLeft, centerY + wireWidth / 2, wallThickness, wallThickness);

// Right end cap
circuit.addWire(wireRight, centerY - wireWidth / 2, wireRight, centerY + wireWidth / 2, wallThickness, wallThickness);
```

### Step 6: Add battery

Terminal size is slightly smaller than wire width so the emitter fits inside the channel:

```javascript
const battery = circuit.addBattery(
    batSourceX, centerY,   // source position
    batSinkX, centerY,     // sink position
    amperage,
    wireWidth - 2,         // terminal slightly smaller than wire
    voltage
);
```

### Step 7: Add probes

```javascript
const probeA = circuit.addProbe(probeAX, centerY, 'before_resistor', wireWidth);
const probeB = circuit.addProbe(probeBX, centerY, 'after_resistor', wireWidth);
```

### Step 8: Add resistor

```javascript
circuit.addResistor(resistorX, centerY, 20, resistorWidth, wireWidth, true, wallThickness);
```

The resistor is 20px long with a 4px constriction inside the 10px channel.

### Step 9: Add to universe

```javascript
circuit.addToUniverse();
```

This registers all walls, emitters, sinks, and the evaluation tick function.

### Step 10: Return API

```javascript
return {
    universe,
    circuit,
    battery,
    probes: { before_resistor: probeA, after_resistor: probeB },
    setBatteryAmperage: (amp) => battery.setAmperage(amp),
    setBatteryVoltage: (v) => battery.setVoltage(v),
    getCircuitState: () => circuit.getCircuitState(),
};
```

---

## 6. Tutorial: Building a Half-Adder (Circuit SAT)

This walkthrough follows `setupCircuitSAT.js`. A half-adder computes SUM (XOR) and CARRY (AND) from two binary inputs.

### Truth table

| A | B | SUM (XOR) | CARRY (AND) |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

### Layout strategy: 4 independent horizontal rows

```
Row 1: [Bat A] ===wire=== [ctrl region] [XOR gate] ===wire=== [Probe SUM]  ===wire=== [Sink A]
Row 2: [Bat B] ===wire=== [ctrl region] [XOR gate continued]   [dead-end stub]
Row 3: [Bat A'] ==wire=== [ctrl region] [AND gate] ===wire=== [Probe CARRY] ==wire=== [Sink B]
Row 4: [Bat B'] ==wire=== [ctrl region] [AND gate continued]   [dead-end stub]
```

Each gate spans two rows vertically (its `signalWidth` = the vertical distance from row N to row N+1 plus `wireWidth`). Each gate has two control regions, one overlapping each input wire channel just before the gate body.

### Step 1: Row positions

Rows are spaced vertically with enough room for wire width plus walls:

```javascript
const rowHeight = wireWidth + 10;
const totalRows = 4;
const totalHeight = totalRows * rowHeight;
const startY = Math.round((canvas_rect.h - totalHeight) / 2);

const row1Y = startY + rowHeight * 0.5;   // XOR input A
const row2Y = startY + rowHeight * 1.5;   // XOR input B
const row3Y = startY + rowHeight * 2.5;   // AND input A
const row4Y = startY + rowHeight * 3.5;   // AND input B
```

### Step 2: Column positions

```javascript
const batX = margin;                              // Battery source center
const gateX = Math.round(canvas_rect.w * 0.45);  // Gate center X
const probeX = Math.round(canvas_rect.w * 0.75); // Probe center X
const sinkX = canvas_rect.w - margin;            // Battery sink center
```

### Step 3: Wire routing with seamless connections

Input wires run from the right edge of the battery emitter to the left edge of the gate body. Output wires run from the gate body right edge to the sink:

```javascript
const inputWireX1 = batX + halfTerm;     // right edge of emitter
const inputWireX2 = gateX - halfGate;    // left edge of gate body
const outputWireX1 = gateX + halfGate;   // right edge of gate body
const outputWireX2 = sinkX - halfTerm;   // left edge of sink
```

### Step 4: Build XOR section

```javascript
// Batteries for XOR inputs (row 1 = input A, row 2 = input B)
const batA1 = circuit.addBattery(batX, row1Y, sinkX, row1Y, emissionRate, termSize);
batA1.setEnabled(inputA);
circuit.addWire(inputWireX1, row1Y, inputWireX2, row1Y, wireWidth);

const batB1 = circuit.addBattery(batX, row2Y, sinkX, row2Y, emissionRate, termSize);
batB1.setEnabled(inputB);
circuit.addWire(inputWireX1, row2Y, inputWireX2, row2Y, wireWidth);

// XOR gate spanning rows 1 and 2
const xorGateHeight = row2Y - row1Y + wireWidth;
const xorGate = circuit.addGate('XOR', gateX, xorY, xorGateHeight, gateLen, true, {
    thresholdHigh: gateThreshold,
    thresholdLow: Math.max(1, gateThreshold - 2),
});
```

### Step 5: Gate control region placement

Control regions are rectangles that overlap the wire channel just before the gate body. The gate samples particle density in these regions to determine input state:

```javascript
const ctrlLen = 20;
const ctrlX = gateX - halfGate - ctrlLen;

xorGate.addControlRegion(new Rectangle(ctrlX, row1Y - wireWidth / 2, ctrlLen, wireWidth, null, false));
xorGate.addControlRegion(new Rectangle(ctrlX, row2Y - wireWidth / 2, ctrlLen, wireWidth, null, false));
```

### Step 6: Output wires and dead-end stubs

The XOR output exits on row 1. Row 2 after the gate is a dead-end stub (particles that enter row 2 stay there):

```javascript
// Output wire: gate -> probe -> sink
circuit.addWire(outputWireX1, row1Y, probeX - halfTerm, row1Y, wireWidth);
const probeSUM = circuit.addProbe(probeX, row1Y, 'SUM', wireWidth);
circuit.addWire(probeX + halfTerm, row1Y, outputWireX2, row1Y, wireWidth);

// Dead-end stub for row 2 (short wire segment, capped)
circuit.addWire(outputWireX1, row2Y, outputWireX1 + wireWidth, row2Y, wireWidth);
```

### Step 7: End-cap walls

All open wire ends must be sealed:

```javascript
// Left caps (behind battery emitters)
addCap(leftCapX, row1Y);
addCap(leftCapX, row2Y);
addCap(leftCapX, row3Y);
addCap(leftCapX, row4Y);

// Right caps (output wire ends and dead-end stubs)
addCap(rightCapX, row1Y);
addCap(rightCapX, row3Y);
addCap(outputWireX1 + wireWidth, row2Y);
addCap(outputWireX1 + wireWidth, row4Y);
```

### Step 8: Input control

The returned API provides `setInputA` and `setInputB` functions that toggle both the XOR and AND copies of each input simultaneously:

```javascript
return {
    setInputA: (enabled) => { batA1.setEnabled(enabled); batA2.setEnabled(enabled); },
    setInputB: (enabled) => { batB1.setEnabled(enabled); batB2.setEnabled(enabled); },
    getCircuitState: () => circuit.getCircuitState(),
};
```

Each logical input maps to two batteries (one for the XOR gate and one for the AND gate), since the half-adder requires each input to drive both gates.

---

## 7. Parsed Netlists

For circuits beyond manual layout, the parser and layout engine can auto-generate spatial positions from a circuit description.

### CircuitParser

`CircuitParser.js` parses circuit descriptions into a normalized netlist format. It supports two input formats and auto-detects which one to use:

**JSON format** -- maps directly to EGPT circuit components:

```json
{
    "name": "half_adder",
    "nodes": ["A", "B", "SUM", "CARRY"],
    "components": [
        { "type": "battery", "name": "B_A", "from": "A_src", "to": "A_gnd", "rate": 5 },
        { "type": "gate", "name": "XOR1", "gateType": "XOR", "inputs": ["A", "B"], "output": "SUM" },
        { "type": "gate", "name": "AND1", "gateType": "AND", "inputs": ["A", "B"], "output": "CARRY" },
        { "type": "probe", "name": "P_SUM", "node": "SUM" },
        { "type": "probe", "name": "P_CARRY", "node": "CARRY" }
    ]
}
```

**BLIF format** (Berkeley Logic Interchange Format) -- standard for combinational logic:

```
.model half_adder
.inputs A B
.outputs SUM CARRY
.names A B SUM
10 1
01 1
.names A B CARRY
11 1
.end
```

The BLIF parser infers gate type from truth tables:
- `11 1` (only row) = AND
- `10 1` + `01 1` = XOR
- `1- 1` + `-1 1` = OR
- `0 1` (single input) = NOT
- `1 1` (single input) = BUFFER

**Usage:**

```javascript
const { parseCircuit, EXAMPLE_CIRCUITS } = require('./js/circuit/CircuitParser.js');

// Parse JSON
const netlist = parseCircuit(myJsonObject);

// Parse BLIF
const netlist = parseCircuit(blifString);

// Use built-in examples
const netlist = parseCircuit(EXAMPLE_CIRCUITS.half_adder);
const netlist = parseCircuit(EXAMPLE_CIRCUITS.half_adder_blif);
const netlist = parseCircuit(EXAMPLE_CIRCUITS.series);
const netlist = parseCircuit(EXAMPLE_CIRCUITS.not_gate);
```

**Normalized netlist format** (output of parser):

```javascript
{
    name: string,
    inputs: string[],          // input node names (batteries)
    outputs: string[],         // output node names (probes)
    nodes: string[],           // all intermediate node names
    components: [
        { type: 'battery', name, from, to, rate },
        { type: 'wire', from, to, width },
        { type: 'gate', name, gateType, inputs: [], output },
        { type: 'resistor', from, to, resistance },
        { type: 'probe', name, node },
        { type: 'ground', name, node },
    ]
}
```

### CircuitLayout

`CircuitLayout.js` converts a parsed netlist into spatial positions using topological sort and Manhattan routing.

**Placement strategy:**

1. **Topological sort** -- Gates are sorted by dependency depth. A gate's depth is 1 + the maximum depth of any gate that feeds its inputs. Input nodes have depth 0.

2. **Column placement** -- Components are placed left-to-right in columns:
   - Column 0: Batteries (sources)
   - Columns 1..N: Gates, ordered by depth level
   - Column N+1: Probes
   - Column N+2: Battery sinks (ground)

3. **Manhattan routing** -- Wires use horizontal-then-vertical segments (L-shaped routes). If source and destination are at the same Y, a direct horizontal wire is used.

**Usage:**

```javascript
const { layoutCircuit } = require('./js/circuit/CircuitLayout.js');

const layout = layoutCircuit(netlist, {
    originX: 50,
    originY: 50,
    wireWidth: 6,
    columnSpacing: 80,
    rowSpacing: 40,
    canvasWidth: 600,
    canvasHeight: 600,
});

// layout.nodePositions: Map of node name -> {x, y}
// layout.componentPlacements: Array of {component, type, x, y, ...}
// layout.wires: Array of {from: {x,y}, to: {x,y}, width}
// layout.bounds: {minX, minY, maxX, maxY}
```

---

## 8. Running Circuit Experiments

### Node CLI

```bash
# Series resistor circuit (default settings)
node egpt_devsdk/run_simulation.js --experiment=circuit_basic --ticks=200

# Series resistor with custom settings
node egpt_devsdk/run_simulation.js --experiment=circuit_basic --ticks=500 \
    --emissionRate=10 --wireWidth=12

# Half-adder: both inputs ON (A=1, B=1)
node egpt_devsdk/run_simulation.js --experiment=circuit_sat --ticks=300 \
    --inputA=true --inputB=true

# Half-adder: A=1, B=0
node egpt_devsdk/run_simulation.js --experiment=circuit_sat --ticks=300 \
    --inputA=true --inputB=false

# Custom gate threshold
node egpt_devsdk/run_simulation.js --experiment=circuit_sat --ticks=300 \
    --gateThreshold=5

# Save output to specific file
node egpt_devsdk/run_simulation.js --experiment=circuit_basic --ticks=200 \
    --out=circuit_data.json
```

**CLI options for circuit experiments:**

| Option | Default | Description |
|---|---|---|
| `--experiment` | `particle_walk` | `circuit_basic` or `circuit_sat` |
| `--ticks` | `100` | Number of simulation ticks |
| `--out` | `simulation_data.json` | Output JSON file |
| `--emissionRate` | `5` | Particles per tick (amperage) |
| `--wireWidth` | `8` | Channel width in pixels |
| `--inputA` | `true` | Half-adder input A (`true`/`false`) |
| `--inputB` | `true` | Half-adder input B (`true`/`false`) |
| `--gateThreshold` | `3` | Gate HIGH threshold |

### Browser

Open `egpt_devsdk/index.html` in a browser. Circuit experiments are available through the experiment selector UI alongside the other simulations.

### Interpreting output

The simulation logs circuit state every 50 ticks:

```
  Tick 50 circuit state: {"before_resistor":{"flowRate":11.8,"lastCount":13,"isHigh":true},"after_resistor":{"flowRate":2.1,"lastCount":3,"isHigh":false}}
```

| Field | Meaning |
|---|---|
| `flowRate` | Average particles in probe region over the last `windowSize` ticks |
| `lastCount` | Raw particle count at the most recent tick |
| `isHigh` | `true` if `flowRate >= gateThreshold` (digital HIGH) |

### Settling time

Circuits need time for particles to diffuse through the wire channels before probe readings stabilize. A rule of thumb: allow at least **2x the longest wire path in pixels** ticks for the circuit to reach steady state. For a 600px canvas with 40px margins, the longest path is ~520px, so allow at least 1000 ticks for stable readings.

---

## 9. Observed Results and Emergent Behavior

### Ohm's law emergence

In the series resistor circuit with a 10px channel constricted to 4px:

- **Before resistor** probe: ~12 particles per tick (flow rate)
- **After resistor** probe: ~2 particles per tick (flow rate)

The resistor does not calculate resistance -- the geometric bottleneck naturally limits throughput. Wider constrictions pass more particles; narrower ones pass fewer. The relationship between gap width and flow rate follows the expected inverse proportionality.

### Half-adder truth table verification

Running `circuit_sat` with all four input combinations confirms correct logic behavior after settling (~200+ ticks):

| A | B | SUM probe isHigh | CARRY probe isHigh |
|---|---|---|---|
| `false` | `false` | `false` | `false` |
| `false` | `true` | `true` | `false` |
| `true` | `false` | `true` | `false` |
| `true` | `true` | `false` | `true` |

### Signal propagation speed

Under brownian motion, signal propagation is a diffusion process, not a ballistic one. The drift velocity is approximately 1px per several ticks (depending on voltage and brownian noise). This is much slower than the engine's speed limit of 1px/tick because brownian motion randomizes direction each tick. Higher voltage increases the directional bias, speeding up propagation.

### Statistical nature

Probe readings are inherently stochastic. Any single tick may show high variance. The rolling window average (`windowSize = 10` by default) smooths this noise. For more stable readings, increase the window size or run more ticks. Gate hysteresis (separate HIGH and LOW thresholds) prevents rapid state oscillation due to noise.

---

## 10. Design Patterns and Tips

### Wire width vs wall thickness trade-off

- **Wider channels** (larger `wireWidth`): Higher maximum current, but particles spread out more, diluting density at probe points.
- **Thicker walls** (larger `wallThickness`): Better insulation (less leakage), but consumes more canvas space.
- A good starting ratio is `wireWidth = 8-12`, `wallThickness = 3`.

### Gate threshold tuning

Gate thresholds must be calibrated to the emission rate:
- If `amperage = 5` and `windowSize = 10`, a control region might see 2-8 particles per tick on average.
- Set `thresholdHigh` to a value that reliably detects "current flowing" (~3 for amperage 5).
- Set `thresholdLow` at least 2 below `thresholdHigh` to provide a clear hysteresis band.
- The `Circuit.addGate()` method defaults `thresholdLow` to `max(1, thresholdHigh - 2)`.

### End-capping all wire termini

Every open end of a wire channel must be sealed with an end-cap wall. Without caps, particles escape the circuit and are lost. Use a short perpendicular wire or a `LargeObject` with `BOUNCE` to seal each end.

### Terminal sizing

Battery terminal size should be slightly smaller than the wire width (`wireWidth - 2`) so the emitter and sink fit inside the channel without overlapping the wire walls.

### Probe placement

Place probes on straight wire sections, away from constrictions and junctions. Avoid placing probes directly adjacent to resistors or gate bodies, where turbulent bouncing creates noisy readings.

### Settling time

Total settling time = `gateWindowTicks` + wire_length_in_pixels. For circuits with multiple gate stages, multiply by the number of stages. The half-adder with ~200px wire paths and 10-tick windows settles in roughly 200-300 ticks.

### Control region sizing

Gate control regions should overlap a substantial portion of the input wire channel (20px is a good length). Too small and the QuadTree query may miss fast-moving particles; too large and you sample particles far from the gate, adding latency.

---

## Appendix A: Quick API Reference

### CircuitWire

```javascript
new CircuitWire(context, x1, y1, x2, y2, width = 6, wallThickness = 3, color = [80, 80, 80])
```

| Method | Returns | Description |
|---|---|---|
| `getChannelRect()` | `Rectangle` | Bounding rect of the open channel |
| `addToUniverse()` | void | Add walls to universe |

### CircuitBattery

```javascript
new CircuitBattery(context, sourceX, sourceY, sinkX, sinkY, amperage = 5, terminalSize = 8, fundamentalDim = 0, voltage = 1, sourceColor = [255, 60, 60], sinkColor = [60, 60, 255])
```

| Method | Returns | Description |
|---|---|---|
| `setVoltage(v)` | void | Update momentum direction magnitude |
| `setAmperage(a)` | void | Update emission rate |
| `setEnabled(bool)` | void | Enable/disable the battery |
| `getTickFunction()` | Function | Returns the emitter tick function |
| `addToUniverse()` | void | Add sink + register tick function |

### CircuitResistor

```javascript
new CircuitResistor(context, x, y, length = 10, channelWidth = 2, outerWidth = 6, horizontal = true, wallThickness = 3, color = [140, 100, 50])
```

| Method | Returns | Description |
|---|---|---|
| `addToUniverse()` | void | Add constriction walls to universe |

### CircuitProbe

```javascript
new CircuitProbe(context, x, y, size = 6, name = "probe", color = [0, 255, 0])
```

| Method | Returns | Description |
|---|---|---|
| `sample(qtree)` | number | Count particles via QuadTree query, update rolling window |
| `getFlowRate()` | number | Average count over rolling window |
| `getLastCount()` | number | Raw count from most recent tick |
| `isHigh(threshold = 1)` | boolean | `true` if `flowRate >= threshold` |
| `addToUniverse()` | void | Add visual marker |

### CircuitGate

```javascript
new CircuitGate(context, gateType, x, y, signalWidth = 6, gateLength = 4, horizontal = true, options = {})
```

Options: `{ thresholdHigh: 3, thresholdLow: 1, windowTicks: 10, fundamentalDim: 0, notEmissionRate: 2 }`

| Method | Returns | Description |
|---|---|---|
| `addControlRegion(rect)` | void | Add a density-sampling control input region |
| `evaluate(qtree)` | void | Sample controls, apply hysteresis, update gate state |
| `getTickFunction()` | Function | Tick function for NOT gate emitter |
| `addToUniverse()` | void | Add gate body + register emitter (if NOT) |

### CircuitJunction

```javascript
new CircuitJunction(context, x, y, size = 8)
```

| Method | Returns | Description |
|---|---|---|
| `addToUniverse()` | void | No-op (junctions are open space) |

### Circuit

```javascript
new Circuit(context, options = {})
```

Options: `{ wireWidth: 6, wallThickness: 3, fundamentalDim: 0, gateThreshold: 3, gateWindowTicks: 10 }`

| Method | Returns | Description |
|---|---|---|
| `addWire(x1, y1, x2, y2, width, wallThickness, color)` | `CircuitWire` | Add wire |
| `addBattery(sourceX, sourceY, sinkX, sinkY, amperage, terminalSize, voltage)` | `CircuitBattery` | Add battery |
| `addResistor(x, y, length, channelWidth, horizontal)` | `CircuitResistor` | Add resistor |
| `addGate(gateType, x, y, signalWidth, gateLength, horizontal, options)` | `CircuitGate` | Add gate |
| `addProbe(x, y, name, size)` | `CircuitProbe` | Add probe |
| `addJunction(x, y, size)` | `CircuitJunction` | Add junction |
| `addToUniverse()` | void | Add all components, register evaluation tick |
| `getEvaluationTickFunction()` | Function | Per-tick gate eval + probe sampling |
| `getCircuitState()` | Object | `{ probeName: { flowRate, lastCount, isHigh } }` |

### CircuitParser

```javascript
const { parseCircuit, parseJSON, parseBLIF, EXAMPLE_CIRCUITS } = require('./js/circuit/CircuitParser.js');
```

| Function | Description |
|---|---|
| `parseCircuit(source)` | Auto-detect format and parse to netlist |
| `parseJSON(json)` | Parse JSON circuit description |
| `parseBLIF(blifSource)` | Parse BLIF format |
| `EXAMPLE_CIRCUITS` | Built-in examples: `series`, `half_adder`, `half_adder_blif`, `not_gate` |

### CircuitLayout

```javascript
const { layoutCircuit } = require('./js/circuit/CircuitLayout.js');
```

| Function | Description |
|---|---|
| `layoutCircuit(netlist, options)` | Convert netlist to spatial positions |

Options: `{ originX: 50, originY: 50, wireWidth: 6, columnSpacing: 80, rowSpacing: 40, canvasWidth: 600, canvasHeight: 600 }`

Returns: `{ nodePositions, componentPlacements, wires, bounds }`
