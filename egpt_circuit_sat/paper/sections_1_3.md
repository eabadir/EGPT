# Boolean Computation via Discrete Particle Transport: A Half-Adder Without Force Calculations

## 1. Introduction

A central question in unconventional computing is whether reliable Boolean computation can be performed using only discrete particle transport, geometric boundary conditions, and statistical density thresholds — without force calculations, fields, or continuous variables. Reaction-diffusion systems, cellular automata, and photonic reservoirs have each demonstrated that information processing need not depend on transistors or voltage rails. In this paper we ask a more specific question: can a complete combinational logic circuit --- a binary half-adder producing correct SUM and CARRY outputs for all four input combinations --- operate reliably within a physics engine that contains no force laws, no electrical variables, and no continuous fields?

We answer in the affirmative, using the EGPT FRAQTL VM, a discrete fractal physics engine rooted in the Ulam--von Neumann tradition of cellular automata and recursive self-reproducing systems. The engine operates on three irreducible primitives --- a tick of time, a pixel of space, and an occupancy count for mass --- and derives all macroscopic behavior from local, greedy, one-pixel-per-tick movement rules. There are no continuous force calculations, no gravitational or electromagnetic constants, and no differential equations. Particles (called "leaf frames") undergo Brownian motion, accumulate momentum, collide, and bounce, all governed by integer arithmetic and probabilistic coin flips.

Within this substrate we construct a half-adder whose wires are parallel boundary walls, whose batteries are particle emitters with directional momentum, and whose logic gates are density-activated conditional boundaries. No variable in the system represents voltage, current, or resistance. Instead, voltage corresponds to the initial momentum imparted to emitted particles; current is the statistical flow rate of particles through a channel; and resistance is a geometric constriction that reduces throughput. The gate evaluation logic (XOR, AND) is explicitly programmed as a function of measured density states — just as real-world logic gates have explicit switching behavior. The signal representation — the mapping from particle flow density to Boolean HIGH and LOW — is established by setting density thresholds, precisely as real-world circuits set voltage thresholds to define logic levels. What is notable is that this threshold-based approach works reliably in a stochastic discrete particle system with no fields or forces.

The result is, to our knowledge, the first demonstration of a complete combinational logic unit operating entirely within a discrete, force-free particle physics engine where information (quanta) is conserved — never created or destroyed by engine rules, only injected or removed at experiment boundaries (emitters and absorbers). The half-adder satisfies all four rows of its truth table as a statistical steady state, with probe measurements converging within approximately 1000 ticks of simulation time. The computation is deterministically reproducible given a PRNG seed (Mulberry32), and information propagation through the circuit is strictly bounded by the 1 px/tick speed limit, providing a natural causal locality guarantee.

This work is related to the tradition of Brownian computing (Bennett, 1982) and ballistic logic (Fredkin and Toffoli, 1982), but differs in a key respect: classical ballistic logic requires precise particle trajectories, while our system uses statistical flow, making it more robust to perturbation and closer in spirit to Bennett's thermodynamically reversible Brownian computer. Gate measurements are non-intrusive --- density queries that do not modify particle state --- analogous to quantum non-demolition measurement.

The remainder of this paper is organized as follows. Section 2 describes the EGPT FRAQTL model and its governing rules. Section 3 defines the circuit primitives --- wires, batteries, resistors, gates, and probes --- in terms of the engine's boundary and emitter objects. Section 4 details the half-adder layout. Section 5 presents experimental results across all four input combinations. Section 6 discusses signal-to-noise characteristics, convergence times, and the statistical nature of the outputs. Section 7 examines the computational significance of the result, connecting the half-adder to Circuit SAT and the question of computational universality. Section 8 places this work in the context of related approaches in unconventional computing, and Section 9 concludes with implications for scalability and future work.


## 2. The EGPT FRAQTL Model

### 2.1 Primitives

The EGPT FRAQTL VM defines exactly three primitives from which all physics is constructed:

- **Time**: one tick, the discrete and indivisible unit of temporal evolution. The simulation advances in lockstep; there is no sub-tick interpolation.
- **Space**: one pixel, the discrete and indivisible unit of spatial extent. All positions are defined on a two-dimensional integer (or, in the educational SDK, floating-point) grid.
- **Mass**: pixel occupancy, defined as the count of leaf quanta occupying a region. Mass is not a continuous scalar but a discrete, countable quantity.

Universe-level scale factors allow a developer to map these primitives to physical units ($1\ \text{px} = 1\ \text{Planck length}$, or $1\ \text{px} = 1\ \text{meter}$, etc.), but the engine internally operates strictly in ticks, pixels, and counts. No unit conversion occurs during simulation.

### 2.2 The Frame Axiom

The fundamental ontological commitment of the system is that **everything is a Frame**. There is no separate particle class, no rigid-body class, and no field object. A leaf frame ($\texttt{is\_leaf} = \text{true}$) is a single quantum --- the smallest possible entity. A composite frame is a collection of child frames bound within a spatial envelope. This recursive structure implements Ulam's partition theory in code: by the law of conditional additivity, every body is simultaneously an individual actor and an inertial reference frame for its children.

The recursion is strict and scale-invariant. A galaxy, an atom, and a single quantum are all Frames differing only in depth and child count. Parent motion cascades as inherited momentum to children, who spend that momentum on their next tick. This mechanism --- not a gravitational force law --- is how inertial reference frames and relativistic frame-dragging emerge.

### 2.3 Movement Rules

Three rules govern all motion:

1. **Universal speed limit.** A frame may displace by at most $\pm 1$ pixel per tick relative to its immediate parent. The engine's $\texttt{move()}$ function clamps all displacement to this bound. Excess intended velocity accumulates in momentum registers ($v_x$, $v_y$) and is spent on subsequent ticks. This is not an approximation of special relativity; it is the mechanism from which relativistic behavior emerges at scale.

2. **Brownian motion.** When enabled, each leaf frame receives a random $\pm 1$ perturbation to its displacement on every tick. Combined with momentum accumulation, this produces a biased random walk: particles drift in the direction of their accumulated momentum while stochastically exploring neighboring pixels.

3. **Momentum accumulation.** When a frame's intended displacement exceeds the 1 px/tick limit, the residual velocity is stored and applied on future ticks. A particle emitted with initial momentum $v_x = 10$ will move 1 pixel per tick in the $x$-direction for 10 consecutive ticks (modulated by Brownian noise and collisions), effectively converting potential energy into a sequence of discrete kinetic steps.

### 2.4 Collisions and Boundaries

No force calculations appear anywhere in the engine. Instead, two local mechanisms produce all interaction:

- **Collision**: when a leaf frame attempts to occupy a pixel claimed by a boundary object (a $\texttt{LargeObject}$), the engine repositions the frame to the nearest valid pixel on the specified side of the boundary and adjusts its momentum accordingly. The boundary's collision type (WALL, BOUNCE, ABSORB, etc.) determines whether momentum is preserved, reversed, or zeroed.
- **Compression**: a probabilistic 1-pixel nudge toward the parent frame's center of mass, modeling gravitational attraction without a force law.

These two rules --- repulsive collision and attractive compression --- suffice to produce stable orbits, wave interference, diffusion, and, as this paper demonstrates, directed current flow through bounded channels.

### 2.5 Wave--Particle Duality

Every Frame is an oscillator. Its wavelength is computed as:

$$\lambda = \left\lfloor \frac{C}{m} \cdot k_\lambda \right\rfloor, \quad \lambda_{\min} = 4$$

where $C$ is the frame's spatial capacity, $m$ is its mass (child count), and $k_\lambda$ is a wavelength constant. This wavelength drives a probabilistic coin flip ($p_{\text{heads}}$, $p_{\text{tails}}$) on each tick that modulates movement direction, producing interference patterns when many quanta traverse the same geometry. Higher mass yields shorter wavelength and higher oscillation frequency --- an analog of the de Broglie relation and, by extension, $E = mc^2$.

### 2.6 Information Conservation

Within the engine, **information (quanta) is strictly conserved**. No engine rule creates or destroys a leaf frame. Quanta enter the simulation only through experiment-layer emitters (QuantumEmitter objects) and exit only through experiment-layer absorbers (LargeObject boundaries with ABSORB collision type). Between injection and absorption, the total count of leaf frames is invariant under all engine operations: movement, collision, compression, and promotion merely reposition or reorganize existing quanta.

This conservation law is not emergent — it is an axiom of the engine, enforced by construction. The `doTick()` pipeline (Section 2.3) contains no code path that instantiates or deletes a leaf frame. Collision resolution repositions frames; merge and promote restructure the frame hierarchy; cleanup removes empty composite frames but never their leaf descendants. The conservation guarantee is what makes density-based circuit measurements meaningful: a change in particle count at a probe location reflects genuine transport, not spontaneous creation or annihilation.

### 2.7 Contrast with Existing Approaches

Traditional circuit simulators such as SPICE solve systems of differential equations (Kirchhoff's laws, Ohm's law, semiconductor transport equations) over continuous variables. Cellular automata approaches to computation --- Wireworld, the Billiard Ball Model, Rule 110 --- encode logic directly into cell-state transition rules. The EGPT approach differs from both: it provides a general-purpose physics substrate with no domain-specific rules for circuits or computation. The half-adder is constructed from spatial boundary conditions, particle emitters, and explicitly programmed density-threshold gates. The gate logic is engineered (as in any circuit), but the signal transport and signal-to-noise characteristics arise from statistical particle dynamics in a system where information is conserved — quanta are never created or destroyed by the engine itself.


## 3. Circuit Primitives

All circuit components in the EGPT FRAQTL VM are compositions of two engine-layer objects: **LargeObject** (a rectangular boundary with configurable collision behavior) and **QuantumEmitter** (a source that injects leaf frames with specified initial momentum). No engine modifications are required to build circuits; they are spatial arrangements of boundaries and emitters operating under Brownian motion with inter-particle collisions enabled.

### 3.1 Wires

A wire is a pair of parallel LargeObject walls forming a tube. For a horizontal wire, the top wall repositions colliding particles downward (into the channel) and the bottom wall repositions them upward. The channel width $w$ --- the gap between the inner faces of the two walls --- determines the cross-sectional area available to particle flow. Wall thickness $t$ serves as insulation: thicker walls intercept more particles that would otherwise escape laterally, reducing leakage.

Particles are not guided by any field or potential gradient along the wire. They diffuse through the channel via Brownian motion, biased by whatever momentum they carry from their source. The wire's function is purely geometric confinement: it defines the spatial region within which diffusion can occur, channeling stochastic motion into net directional flow.

### 3.2 Batteries

A battery consists of a positive terminal (QuantumEmitter) and a negative terminal (LargeObject with ABSORB collision action). The emitter injects $A$ particles per tick (the amperage analog), each with initial momentum $(v_x, v_y)$ directed from source toward sink. The magnitude $|v| = V$ is the voltage analog.

Because the engine's speed limit clamps displacement to 1 px/tick, a particle emitted with $V = 10$ does not move 10 pixels in one tick. Instead, it moves 1 pixel per tick while carrying 9 units of residual momentum, producing a sustained drift over subsequent ticks. Under Brownian motion, this drift is probabilistic: the particle explores lateral paths while maintaining a net flow direction. The pressure differential between the emitter (constant particle injection) and the sink (particle absorption) drives a statistical current through any connected wire channel.

Batteries can be enabled or disabled at runtime, toggling the $\texttt{auto\_fire}$ flag on their emitter. A disabled battery emits no particles and its sink absorbs any remaining particles that reach it. This on/off mechanism provides the binary input variables for the circuit SAT experiment.

### 3.3 Resistance

A resistor is a geometric constriction --- a wire segment where the channel width narrows from $w$ to $w_r < w$. Two additional LargeObject walls protrude inward from the wire walls, reducing the gap through which particles can pass. No material property, no resistance coefficient, and no Ohm's law constant appear anywhere in the implementation.

The resistance effect is purely statistical. Fewer pixels of cross-sectional area means fewer particles can transit the constriction per tick. Particles arriving at the bottleneck that cannot find an open pixel are repositioned upstream by the wall collision, creating a local pressure buildup. The ratio of downstream flow to upstream flow is determined entirely by the ratio of constricted width to wire width --- a geometric version of Ohm's law that emerges without being encoded.

### 3.4 Logic Gates

A logic gate is a density-activated conditional boundary. Its body is a LargeObject whose collision type toggles between WALL (blocking, gate closed) and NONE (transparent, gate open) based on the particle density measured in one or two control regions.

Density measurement is strictly local: the gate queries the spatial index (QuadTree) for the count of particles within each control region rectangle. These counts are averaged over a sliding window of $W$ ticks (default 60) and compared against hysteresis thresholds $\theta_{\text{high}}$ and $\theta_{\text{low}}$. A control input transitions to HIGH when the windowed average exceeds $\theta_{\text{high}}$ and remains HIGH until the average drops below $\theta_{\text{low}}$. This hysteresis prevents rapid oscillation (chatter) between states due to stochastic density fluctuations.

The gate's Boolean function is evaluated from the per-input HIGH/LOW states:

- **XOR gate**: opens when exactly one control input is HIGH ($s_0 \neq s_1$). This passes particles when either input A or input B is active, but blocks flow when both are active or both are inactive.
- **AND gate**: opens only when both control inputs are HIGH ($s_0 \land s_1$). This passes particles only when both input A and input B are active.
- **OR gate**: opens when at least one control input is HIGH ($s_0 \lor s_1$).
- **NOT gate**: opens when its single control input is LOW ($\neg s_0$). Because Brownian motion does not carry particles directionally through a newly opened gap, the NOT gate includes an internal QuantumEmitter on its output side that fires when the gate is open --- analogous to the power rail in CMOS logic.

When a gate opens, its body becomes transparent (collision type NONE) and particles in the upstream channel diffuse through. When it closes, the body reverts to a WALL that repositions incoming particles back upstream. The gate body spans both input rows of its channel, with a bi-directional divider wall maintaining complete separation between the two control inputs' particle streams. This prevents cross-contamination: particles from input A cannot leak into input B's channel or vice versa.

### 3.5 Probes

A probe is a non-intrusive density measurement point. It consists of a visual marker (a LargeObject with collision type NONE, which renders but does not interact with particles) and a search rectangle used for direct QuadTree density queries. Each tick, the probe counts the particles within its search region and maintains a rolling history over a configurable window.

The probe's $\texttt{getFlowRate()}$ method returns the windowed average particle count, and $\texttt{isHigh()}$ returns a Boolean by comparing that average against a threshold. Probes are the circuit's output measurement: a probe reading above threshold on the SUM or CARRY output indicates a logical HIGH for that output bit.

### 3.6 Electrical Analogs in a Discrete Particle System

It is worth emphasizing what is absent from the engine layer. The engine has no concept of voltage, current, or resistance. The experiment layer maps these intuitions onto engine primitives at setup time: voltage is the initial momentum of emitted particles --- a kinematic quantity that determines drift bias; amperage is the emission rate in particles per tick; resistance is the ratio of channel widths at a constriction --- a geometric parameter with no material coefficient. Once setup is complete, all computation proceeds through local geometric interactions and density measurements only.

Current, as measured by probes, is a time-averaged particle count in a spatial region --- a statistical observable that is never stored as an explicit variable. The relationship between geometric constriction and throughput reduction is qualitatively consistent with Ohm's law, though characterizing the precise functional form requires a systematic parameter sweep (see Section 9). Boolean gate evaluation logic is explicitly programmed as a function of measured density states, and the density thresholds that define HIGH and LOW are set by the experimenter — just as voltage thresholds define logic levels in real-world circuits. What is distinctive is that these standard circuit-design practices function reliably in a stochastic, discrete, force-free particle system where information is strictly conserved within the engine.
