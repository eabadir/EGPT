## 4. Half-Adder Layout and Configuration

### 4.1 Topology

The half-adder is realized as four horizontal wire channels arranged in two pairs. Each pair feeds a single two-input logic gate:

- **Rows 1--2** carry copies of the input signals to an XOR gate, whose output is the SUM bit.
- **Rows 3--4** carry copies of the same input signals to an AND gate, whose output is the CARRY bit.

Each input variable (A, B) is implemented as a pair of batteries: one on row 1 and one on row 3 for input A, one on row 2 and one on row 4 for input B. Enabling or disabling a battery pair sets the corresponding Boolean input to 1 or 0. The duplication is necessary because each gate requires its own independent particle stream --- sharing a single wire between the XOR and AND gates would create backflow interference and signal coupling.

The layout proceeds left-to-right through five functional zones:

```
                 Input Wires        Ctrl    Gate   Chamber     Output Wires        Probe    Drain
               ┌────────────────────┬────┐┌────┐┌──────────┐┌──────────────────────┬─────┬────────┐
  Row 1  [+A] ═╡▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ctrl││    ││  exit 1  ││▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ SUM │▓▓▓▓▓▓▓╞═ [-A]
               │                    │    ││XOR ││──divider──││                      │     │        │
  Row 2  [+B] ═╡▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ctrl││    ││  exit 2  ││▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│     │▓▓▓▓▓▓▓╞═ [-B]
               ├────────────────────┴────┘└────┘└──────────┘└──────────────────────┴─────┴────────┤
               │                          ══════ separator ══════                                 │
               ├────────────────────┬────┐┌────┐┌──────────┐┌──────────────────────┬─────┬────────┤
  Row 3  [+A'] ╡▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ctrl││    ││  exit 3  ││▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│CARRY│▓▓▓▓▓▓▓╞═ [-A]
               │                    │    ││AND ││──divider──││                      │     │        │
  Row 4  [+B'] ╡▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ctrl││    ││  exit 4  ││▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│     │▓▓▓▓▓▓▓╞═ [-B]
               └────────────────────┴────┘└────┘└──────────┘└──────────────────────┴─────┴────────┘

  [+X]  = battery (QuantumEmitter)        ▓▓▓ = wire channel (bounded by walls)
  [-X]  = sink (LargeObject, ABSORB)      ctrl = control region (density query area)
```

Batteries are placed at the left margin ($x = 40$); sinks at the right margin ($x = w - 40$). The gate center is positioned at 45% of the canvas width, and the probe at 75%. This gives the input wires ample length for particle flow to develop a measurable density in the control regions before reaching the gate body.

### 4.2 Dual-Exit Chamber Design

A naive gate design would merge the two input rows into a single output channel after the gate body. This creates a mixing region where particles from input A can diffuse backward into input B's channel (and vice versa), corrupting the control region density measurements via backflow contamination. Early prototypes exhibited this failure mode: with both inputs active, backflow through the shared mixing region would cause one control input to read artificially high, producing intermittent gate misfires.

The solution is the **dual-exit chamber**: after the gate body, each row retains its own independent passage and its own exit gap in the chamber's right wall. A bi-directional divider wall runs the full length of the gate body plus the chamber, maintaining complete separation between the two rows. Both rows' output wires then lead to the same output probe, which spans both rows vertically.

The right wall of the chamber is constructed from three segments with two gaps --- one aligned with each row's channel center. This allows particles from row 1 (or row 3) to exit through their own gap without any possibility of crossing into the other row.

### 4.3 Bi-Directional Divider Walls

A standard LargeObject wall repositions colliding particles in a single direction. A top wall pushes particles downward; a bottom wall pushes particles upward. For a divider separating two rows, a single-direction wall creates an asymmetry: particles approaching from one side are correctly deflected, but particles approaching from the other side are pushed *through* the wall into the neighboring row.

The bi-directional divider solves this by stacking two LargeObject walls of half thickness:

- The **upper half** pushes particles upward (back into the upper row).
- The **lower half** pushes particles downward (back into the lower row).

This pattern appears between rows 1 and 2 (XOR section), between rows 3 and 4 (AND section), and in the separator between the XOR and AND sections. It ensures that no particle can cross from one row to another regardless of its direction of approach.

### 4.4 Parameters and Physical Interpretation

The experiment uses the following configuration:

| Parameter | Value | Physical Interpretation |
|-----------|-------|------------------------|
| `wireWidth` | 10 px | Channel cross-section; determines maximum particle throughput |
| `wallThick` | 6 px | Insulation thickness; captures laterally escaping particles |
| `voltage` | 2 | Initial momentum per emitted particle; determines drift bias |
| `emissionRate` | 3 particles/tick | Current injection rate; the "amperage" of each battery |
| `gateThreshold` | 3 | Windowed average density that triggers HIGH in a control region |
| `gateWindowTicks` | 60 | Sliding window length for density averaging (hysteresis buffer) |
| `chamberLen` | 20 px | Post-gate chamber length; allows particles to reach exit gaps |
| `gateLen` | 8 px | Gate body extent along the wire axis |
| `ctrlLen` | 20 px | Control region length along the wire axis |
| `probeThreshold` | 20 | Windowed average density at output probe that classifies as HIGH |

The voltage of 2 was chosen empirically to balance drift speed against Brownian noise. Higher voltages cause particles to traverse the control region too quickly, producing sparse density readings; lower voltages cause excessive diffusion time before signal arrival. The emission rate of 3 particles per tick produces a steady-state population of approximately 1000 active particles by tick 3000, sufficient for reliable density measurement without saturating the wire channels.

The gate threshold of 3 is deliberately low: a control region with 3 or more particles on average (over a 60-tick window) indicates active flow. The hysteresis band ($\theta_{\text{high}} = 3$, $\theta_{\text{low}} = 2$) prevents chatter from stochastic fluctuations around the threshold.


## 5. Experimental Results

### 5.1 Protocol

We ran the half-adder for all four input combinations $(A, B) \in \{(0,0), (0,1), (1,0), (1,1)\}$. Each combination was tested with 20 independent PRNG seeds ($s_i = 1000 + 137i$ for $i \in \{0, 1, \ldots, 19\}$), each run for 3000 ticks. The output probes (SUM and CARRY) were sampled at tick 3000 and classified as HIGH ($\geq 20$ windowed average) or LOW ($< 20$). A run is correct if both SUM and CARRY match the expected half-adder truth table.

### 5.2 Truth Table Accuracy

| A | B | Expected SUM | Expected CARRY | Correct / Total | Accuracy |
|---|---|:---:|:---:|:---:|:---:|
| 0 | 0 | LOW  | LOW  | 20/20 | 100% |
| 0 | 1 | HIGH | LOW  | 20/20 | 100% |
| 1 | 0 | HIGH | LOW  | 20/20 | 100% |
| 1 | 1 | LOW  | HIGH | 20/20 | 100% |

All 80 runs produce the correct output (100% accuracy across all seeds and input combinations). The $(0,0)$ case is trivially correct: with no batteries enabled, no particles are emitted, both probes read zero, and both outputs are LOW. The $(0,1)$ and $(1,0)$ cases are structurally identical up to which row carries the active particle stream; the XOR gate correctly opens in both cases (exactly one input HIGH) while the AND gate correctly remains closed (only one input HIGH). For $(1,1)$, the XOR gate correctly closes (both inputs HIGH) yielding SUM=LOW, and the AND gate correctly opens (both inputs HIGH) yielding CARRY=HIGH.

### 5.3 Flow Statistics at Tick 3000

| (A, B) | SUM Mean $\pm$ Std | SUM Range | CARRY Mean $\pm$ Std | CARRY Range |
|:---:|:---:|:---:|:---:|:---:|
| (0, 0) | 0.0 | [0.0, 0.0] | 0.0 | [0.0, 0.0] |
| (0, 1) | 85.2 $\pm$ 3.6 | [77.3, 91.6] | 0.0 | [0.0, 0.0] |
| (1, 0) | 68.2 $\pm$ 1.8 | [64.4, 71.8] | 0.0 | [0.0, 0.0] |
| (1, 1) | 9.5 $\pm$ 2.1 | [5.0, 14.3] | 131.9 $\pm$ 1.6 | [128.5, 135.8] |

Three features of these flow statistics deserve comment:

**Signal strength is well above threshold.** The probe threshold for HIGH classification is 20. The $(0,1)$ SUM flow averages 85.2 --- more than four times the threshold --- with no seed producing a flow below 77.3. This provides a wide noise margin: even significant stochastic fluctuations would not cause a misclassification.

**The A/B asymmetry.** The $(1,0)$ SUM flow (68.2) is 20% lower than the $(0,1)$ SUM flow (85.2), despite the two cases being logically symmetric. This asymmetry is **geometric**, not logical. Battery A is positioned on row 1 (upper XOR input) and Battery B on row 2 (lower XOR input). The two rows have identical wire lengths and wall configurations, but the rows occupy different vertical positions within the canvas. Because Brownian motion adds a uniform random $\pm 1$ perturbation on both axes, and the boundary conditions (top and bottom chamber walls, divider positions) differ slightly between the upper and lower rows, the effective diffusion paths are not perfectly symmetric. The asymmetry is consistent across seeds (standard deviation 1.8 vs 3.6), suggesting a systematic geometric bias rather than random variation. Importantly, this asymmetry does not affect correctness: both flows are far above the HIGH threshold.

**The (1,1) dual-input dynamics.** When both batteries are active, CARRY flow (131.9 $\pm$ 1.6) is the highest of any combination — consistent with double the particle injection rate flowing through the AND gate. The remarkably tight standard deviation (1.2% of mean) indicates that dual-input flow produces more consistent statistics than single-input flow. Meanwhile, the SUM channel shows a small leakage of 9.5 $\pm$ 2.1 despite the XOR gate being closed, representing diffusion through the finite-width gate body. This leakage (maximum 14.3) remains well below the threshold of 20, maintaining correct classification with a noise margin of +5.7.

### 5.4 Time-Series Dynamics

#### (0,1) Combo: Battery B Active Only

1. **Gate switching.** The XOR gate control region on row 2 begins accumulating particles immediately. By tick 500, the windowed average exceeds $\theta_{\text{high}} = 3$ in 100% of seeds, and the XOR gate opens. The AND gate never opens (only one control input is HIGH).

2. **Flow buildup.** SUM flow first appears at the output probe around tick 600, reflecting the transit time for particles to diffuse from the gate through the chamber and output wires to the probe position (approximately 30% of the canvas width at 1 px/tick with Brownian noise).

3. **Stabilization.** SUM flow reaches a steady state around tick 1700 at approximately 80 particles in the probe window. The system is in dynamic equilibrium: particles are emitted at a constant rate, diffuse through the wire, pass the open gate, and are eventually absorbed at the sink.

4. **Late-run gate oscillation.** Between tick 2500 and tick 3000, some seeds exhibit brief XOR gate closures where the control region density dips below $\theta_{\text{low}}$ for a few ticks before recovering. At tick 2500, 100% of seeds show the gate open; by tick 3000, this drops to 65%. This oscillation is caused by stochastic density fluctuations in the control region: as the steady-state particle population in the wire fluctuates, the windowed average occasionally dips below threshold. The hysteresis band ($\theta_{\text{high}} = 3$, $\theta_{\text{low}} = 2$) dampens but does not eliminate this effect. Despite the oscillation, no seed produces a final SUM reading below the probe threshold, because the probe integrates over a large spatial region and long time window that smooths out brief gate closures.

#### (1,0) Combo: Battery A Active Only

The dynamics are qualitatively identical to the $(0,1)$ case: the XOR gate opens by tick 500, SUM flow stabilizes around tick 1700 at approximately 67 particles. The key difference is that the XOR gate remains 100% open across all seeds through tick 3000 --- the late-run oscillation observed in the $(0,1)$ case does not appear. This greater stability likely reflects the geometric asymmetry discussed in Section 5.3: Battery A's row has slightly different effective diffusion characteristics that produce a more stable density in the control region.

#### (1,1) Combo: Both Batteries Active

The $(1,1)$ case exercises both gates simultaneously and produces the most distinctive dynamics:

1. **AND gate opens, XOR gate closes.** By tick 500, both control regions for each gate have accumulated sufficient density. The AND gate (both inputs HIGH → open) reaches 100% open across all seeds. The XOR gate (both inputs HIGH → closed) correctly closes in 100% of seeds. A brief transient at tick 400 shows 30% of seeds with the XOR gate open and 15% with the AND gate open, reflecting the stochastic variability in which gate reaches threshold first.

2. **CARRY flow dominates.** With the AND gate open and both batteries active, CARRY flow builds rapidly and stabilizes at 131.9 $\pm$ 1.6 (see Section 5.3 for cross-seed statistics).

3. **SUM leakage.** Despite the XOR gate being closed, a small residual SUM flow of 9.5 $\pm$ 2.1 is observed. This represents particles that diffuse through the gate region or around barriers before the gate fully closes, plus a small steady-state leakage through the closed gate body (which repositions particles upstream but cannot prevent all diffusion through the finite-width gate). Critically, this leakage (max 14.3) remains well below the probe threshold of 20, maintaining correct classification.

### 5.5 Convergence Time

The system reaches correct steady-state output by approximately tick 1700 across all tested input combinations. This convergence time is determined by three sequential processes:

1. **Control region fill** ($\sim$500 ticks): particles must diffuse from the battery to the control region and accumulate sufficient density to exceed the gate threshold.
2. **Gate-to-probe transit** ($\sim$100--200 ticks): once the gate opens, particles must diffuse through the chamber, output wire, and into the probe region.
3. **Probe window fill** ($\sim$1000 ticks): the probe's rolling window must accumulate enough samples to produce a stable average above threshold.

The total convergence time of $\sim$1700 ticks represents approximately 57% of the total simulation runtime. This is a significant computational overhead compared to electronic circuit simulation, but it is a physical consequence of the signal transport mechanism: information propagates at 1 px/tick through a Brownian diffusion channel, not at the speed of an electrical signal through a conductor.


## 6. Discussion

### 6.1 What This Result Demonstrates

The half-adder experiment demonstrates that a combinational logic circuit can operate correctly within a discrete physics engine that contains no force laws, no electrical variables, and no purpose-built computation primitives. The engine provides only three ingredients: spatial boundaries, particle emitters, and Brownian motion with momentum accumulation. From these, the circuit derives its signal encoding (particle flow density), signal transport (biased diffusion through bounded channels), and signal classification (density threshold comparison at probes).

It is important to be precise about what is explicitly engineered and what arises from the physics. The gate evaluation logic --- the mapping from control input states to gate open/closed decisions --- is explicitly programmed. The XOR gate checks $s_0 \neq s_1$; the AND gate checks $s_0 \land s_1$. These are Boolean functions applied to density-derived states, and they are implemented in code, not discovered by the physics.

What is distinctive about this substrate — and what validates the discrete stochastic approach — is how standard circuit-design elements map onto it:

- **Signal representation.** No variable in the engine encodes a logic level. HIGH and LOW are defined by density thresholds set by the experimenter, exactly as real-world circuits define logic levels via voltage thresholds. The parallel is direct: both are threshold interpretations imposed on a physical substrate, and both exhibit the same non-linear switching behavior with hysteresis.
- **Signal transport.** Particles are not guided along wires by any field or potential gradient. They diffuse through bounded channels via Brownian motion, biased by their initial momentum. The wire's function is geometric confinement, not signal conduction.
- **Ohm's law analog.** Channel constriction reduces throughput in a manner qualitatively consistent with Ohm's law, despite no resistance coefficient existing in the model.
- **Signal integrity.** The bi-directional divider walls, dual-exit chambers, and wall thickness all contribute to signal isolation, but the mechanism is geometric collision, not shielding or impedance matching.
- **Information conservation.** Within the engine, quanta are never created or destroyed. Only the experiment boundaries (emitters and absorbers) inject or remove particles. This conservation principle is fundamental: the engine preserves information, and the circuit's reliability depends on it.

### 6.2 Connection to Brownian Computing

Bennett (1982) showed that thermodynamically reversible computation is possible in principle via a Brownian mechanism: a computational device immersed in a thermal bath that drifts randomly along a computational path, eventually reaching the correct output with probability 1 given sufficient time. The EGPT circuit realizes a concrete instance of this idea. Particles undergo Brownian motion (the thermal bath), carry directed momentum (the computational bias), and accumulate at probes that measure the time-averaged outcome. The gate itself is a conditional barrier that opens or closes based on local density --- a physical instantiation of a conditional branch in Bennett's framework.

A key difference from Bennett's idealized model is that our system is dissipative: sinks absorb particles, and batteries continuously inject new ones. This creates a driven steady state rather than an equilibrium fluctuation. Information (quanta) is strictly conserved within the engine — particles are neither created nor destroyed by the physics rules. However, the experiment layer (emitters and absorbers) injects and removes particles at the circuit boundaries, making the overall experiment dissipative. Within the interior of the circuit, the physics is time-reversible at the single-tick level: every collision and boundary reposition has a well-defined inverse operation. The irreversibility is confined to the experiment layer (emitters and absorbers), not the engine layer.

### 6.3 Noise as a Feature

In conventional digital electronics, noise is the enemy: it corrupts signals and limits clock speed. In the EGPT circuit, stochastic fluctuations play the opposite role. Brownian motion is not merely tolerated; it is the signal transport mechanism. Without random perturbations, particles emitted with purely horizontal momentum would travel in straight lines, never filling the control regions above or below the wire centerline. The $\pm 1$ random perturbation on each tick distributes particles throughout the channel cross-section, enabling density-based measurement in spatially extended control regions.

The probe's time-windowed averaging acts as a low-pass filter that extracts the signal (mean flow rate) from the noise (tick-to-tick density fluctuations). The 60-tick gate window and the probe's rolling average both implement temporal integration that converts a noisy stochastic process into a reliable Boolean classification. This is analogous to the role of thermal averaging in biological signal transduction, where molecular noise is filtered by receptor integration times.

### 6.4 Scaling and Composability

If a half-adder works, does an arbitrary combinational circuit also work? We argue yes, in principle, based on three observations:

1. **Functional completeness.** The gate library includes AND, OR, XOR, NOT, and BUFFER. AND and NOT together form a functionally complete set; any Boolean function can be expressed as a composition of these gates.

2. **Signal fan-out.** Input A is already duplicated to rows 1 and 3 (feeding both the XOR and AND gates). The same mechanism --- multiple batteries driven by the same enable flag --- generalizes to arbitrary fan-out. Each copy is an independent particle stream, so fan-out does not divide signal strength.

3. **Signal cascading.** A probe output (HIGH/LOW) can in principle control a downstream gate's battery enable, allowing the output of one stage to serve as the input to the next. The current implementation does not chain stages, but the architecture supports it.

The practical obstacles to scaling are significant:

- **Convergence time.** Each stage requires $\sim$1700 ticks to stabilize. A 10-stage circuit would require $\sim$17,000 ticks, assuming no inter-stage interference.
- **Spatial extent.** Each wire channel occupies $\texttt{wireWidth} + 2 \times \texttt{wallThick} + 2 = 24$ pixels of vertical space. A circuit with 100 wires would require 2,400 pixels of vertical extent, which is computationally tractable but approaches the limits of useful visualization.
- **Parameter sensitivity.** The gate threshold, probe threshold, and voltage must be tuned in concert. As circuits grow larger and signal attenuation over longer wires becomes significant, systematic parameter optimization will be required.
- **Cross-talk.** Although the bi-directional dividers effectively eliminate cross-talk in the half-adder, larger circuits with more densely packed wires may require thicker insulation walls, increasing spatial overhead.

### 6.5 Limitations

Several limitations should be acknowledged:

- **Gate logic is engineered.** The Boolean evaluation function inside each gate is explicit code — just as in any real-world circuit. A geometry-only logic gate — one that computes XOR from particle dynamics alone, without a programmed evaluation function — remains an open challenge (see Section 9.2).
- **Convergence time is long.** 1700 ticks to reach steady state is acceptable for a proof of concept but would be prohibitive for practical computation. The fundamental bottleneck is Brownian diffusion: signal propagation scales as $\sqrt{t}$ (diffusive) rather than linearly with distance.
- **No feedback loops.** The half-adder is a purely combinational circuit. Sequential logic (flip-flops, registers, state machines) would require feedback paths where probe outputs control upstream batteries. While architecturally possible, the interaction between feedback delay and convergence time is unexplored.
- **Single simulation scale.** All experiments use a single set of universe parameters. The sensitivity of correctness to variations in wire width, voltage, emission rate, and gate threshold has not been systematically characterized.


## 7. Computational Significance: The Half-Adder and Circuit SAT

### 7.1 The Half-Adder as Computational Primitive

The half-adder is not merely a pedagogical example — it is the irreducible atom of arithmetic hardware. A half-adder takes two input bits and produces a Sum (XOR) and Carry (AND). From this base, a well-established compositional hierarchy follows:

- **Full adder**: Two half-adders plus an OR gate, handling carry-in for multi-bit chains.
- **Ripple-carry adder**: $N$ full adders chained in series, computing $N$-bit addition.
- **ALU**: Adders plus multiplexers, capable of addition, subtraction, bitwise logic, comparison, and shift.
- **General-purpose processor**: An ALU plus control logic, registers, and memory addressing.

Every digital processor ever manufactured implements exactly this chain. Demonstrating a correct half-adder in the EGPT engine — with its functionally complete gate set (AND, OR, NOT, XOR) — establishes three results: (1) individual gate correctness from density-based switching, (2) gate composability via particle-flow information transfer, and (3) functional sufficiency to express any Boolean function.

### 7.2 Connection to Circuit SAT

**Circuit SAT** is the decision problem: given a Boolean circuit $C$ with $n$ input variables and a single output bit, does there exist an assignment to the inputs such that $C$ outputs TRUE? Circuit SAT is NP-complete, following from the Cook-Levin theorem (1971). It is often considered the most natural NP-complete problem, as any polynomial-time verifiable property can be encoded as a polynomial-size Boolean circuit.

The EGPT half-adder performs **circuit evaluation**: given a circuit and an input assignment, determine the output. This is a polynomial-time operation — fundamentally different from circuit satisfiability (finding a satisfying input), which is NP-complete. The distinction must not be blurred.

Because the EGPT gate primitives are functionally complete, arbitrary Boolean circuits can in principle be constructed. This means Circuit SAT instances can be *encoded* in the engine — but the engine provides no mechanism to *search* for satisfying assignments faster than exhaustive enumeration over all $2^n$ inputs.

### 7.3 Precise Claims

**What this result demonstrates:**

- **Computational universality of the substrate.** The EGPT engine, using only its fundamental rules (1 px/tick speed limit, single occupancy, recursive relativity, no force calculations), can perform general-purpose Boolean computation.
- **Functional sufficiency of density-based switching.** It was not guaranteed a priori that stochastic particle density would produce reliable binary switching. The 80/80 accuracy establishes that it does, under the tested parameters.
- **Novel computational paradigm.** Information is carried by statistical properties of particle flow (density over time) rather than by deterministic voltage levels — conceptually closer to biological neural computation or chemical reaction networks than to conventional digital logic.
- **Natural noise tolerance.** Gate outputs are determined by time-averaged density, giving the system inherent robustness to transient fluctuations. This is the law of large numbers providing reliability from individually unpredictable particles.

**What this result does not imply:**

- EGPT does not solve or circumvent P vs NP. Circuit evaluation is in P; satisfiability remains NP-complete regardless of substrate.
- Brownian dynamics do not provide super-polynomial speedup over digital evaluation. The stochastic exploration within a single circuit evaluation improves signal-to-noise, not the number of evaluations performed.
- This is not quantum computation. The engine's "quantum" terminology refers to discrete quanta (countable particles), not quantum mechanics. There is no superposition, entanglement, or quantum interference.

### 7.4 Information Conservation and Computation

A distinguishing feature of the EGPT engine is strict information conservation: quanta are never created or destroyed by the physics rules. Only the experiment layer (emitters and absorbers) injects or removes particles. This conservation axiom — analogous to unitarity in quantum mechanics or charge conservation in electrodynamics — means that the engine preserves information content throughout the simulation. Computation occurs through the *rearrangement* and *transport* of conserved quanta, not through their creation or annihilation.

This property connects the system to the tradition of conservative logic (Fredkin and Toffoli, 1982), where computations preserve the total number of 1s and 0s. In the EGPT context, the conserved quantity is particle count within the engine, and the computational expressiveness arises from geometric boundary conditions that direct the flow of these conserved particles.


## 8. Related Work

### 8.1 Brownian and Thermodynamic Computing

Bennett (1982) established that computation can be performed by a Brownian mechanism with arbitrarily low energy dissipation, provided the computational steps are logically reversible. Fredkin and Toffoli (1982) demonstrated the conservative logic gate --- a universal logic primitive that conserves the number of 1s and 0s --- enabling reversible computation via billiard-ball-like interactions. Our work realizes the spirit of Bennett's Brownian computer in a concrete physical substrate, though our system is driven (dissipative at boundaries) rather than equilibrium.

### 8.2 Billiard Ball Computing

The Fredkin gate (Fredkin and Toffoli, 1982) computes via elastic collisions between idealized billiard balls on a frictionless table. Margolus (1984) showed that such computations can be embedded in partitioned cellular automata. The EGPT circuit differs in a fundamental respect: billiard ball computing requires precise trajectories and exact collision geometry, while our system uses statistical flow. Individual particle paths are unpredictable; only the ensemble average carries information. This makes the EGPT approach more robust to perturbation but slower to converge.

### 8.3 Lattice Gas Automata

Frisch, Hasslacher, and Pomeau (1986) showed that a simple lattice gas automaton on a hexagonal grid reproduces the Navier-Stokes equations in the macroscopic limit. Hardy, de Pazzis, and Pomeau (1973) provided earlier results on the square lattice. The EGPT engine shares the lattice gas philosophy --- deriving continuum-like behavior from discrete local rules --- but differs in its recursive frame hierarchy. Lattice gas models operate on a flat grid; EGPT frames form a scale-invariant tree where each frame is simultaneously a particle and an inertial reference frame.

### 8.4 Cellular Automata and Computation

Von Neumann (1966) and Ulam conceived of cellular automata as substrates for self-reproducing systems and universal computation. Wolfram (2002) extensively catalogued the computational capabilities of elementary cellular automata, showing that Rule 110 is Turing complete. The EGPT system is a direct descendant of the Ulam--von Neumann tradition but departs from the standard cellular automaton framework in two ways: (1) the cell state is not a finite symbol but a hierarchical frame with position, momentum, and children; and (2) the update rule is not a lookup table but a pipeline of physically motivated phases (move, compress, collide, merge, promote).

### 8.5 Quantum Cellular Automata

Quantum cellular automata (Schumacher and Werner, 2004; Gross et al., 2012) extend classical cellular automata to quantum state spaces, preserving locality and unitarity. The EGPT engine is classical, not quantum, but its wave-particle duality mechanism --- where each frame oscillates with a wavelength determined by its mass-to-capacity ratio --- produces interference patterns reminiscent of quantum behavior. Whether this analogy extends to computational universality in the quantum sense is an open question.

### 8.6 Agent-Based Modeling and Artificial Chemistry

Agent-based models (Epstein and Axtell, 1996) and artificial chemistry systems (Dittrich, Ziegler, and Banzhaf, 2001) simulate populations of interacting entities with local rules, producing emergent macroscopic behavior. The EGPT circuit can be viewed as an artificial chemistry where particles are reactants, wires are reaction vessels, and gates are catalysts whose activity depends on local concentration. The distinction is that EGPT particles obey a physics engine with conservation laws and a speed limit, rather than abstract reaction rules.

### 8.7 What Distinguishes EGPT

The EGPT FRAQTL VM occupies a unique position in this landscape. Unlike lattice gas automata, it has a recursive frame hierarchy that enables scale-invariant physics. Unlike billiard ball computing, it uses statistical flow rather than precise trajectories. Unlike conventional cellular automata, it derives its update rules from physical principles (momentum, collision, compression) rather than lookup tables. And unlike all of the above, it operates with zero force calculations --- no gravitational, electromagnetic, or nuclear forces appear anywhere in the engine. The half-adder experiment demonstrates that this minimal substrate is sufficient for combinational logic, suggesting that force laws may not be necessary prerequisites for computation in physical systems.


## 9. Conclusion

### 9.1 Summary of Contribution

We have presented, to our knowledge, the first complete combinational logic circuit --- a binary half-adder --- operating within a discrete, force-free particle physics engine. The half-adder produces correct SUM and CARRY outputs for all four input combinations, verified across 20 independent PRNG seeds per combination (80 total runs, 80 correct — 100% accuracy). Signal transport and integrity arise from Brownian diffusion through geometric boundaries; signal encoding uses explicitly set density thresholds — analogous to voltage thresholds in conventional circuits; and gate evaluation logic is explicitly programmed as density-threshold comparisons. Information (quanta) is conserved within the engine, with only the experiment boundaries (emitters and absorbers) injecting or removing particles. The system demonstrates that reliable Boolean computation can be performed using a physical substrate containing only three primitives (tick, pixel, occupancy count) and two interaction rules (collision and compression), with no force calculations of any kind.

### 9.2 Future Work

Several directions merit investigation:

**Larger circuits.** The immediate next step is a full adder (half-adder plus an OR gate for the carry chain), followed by a multi-bit ripple-carry adder. Success would validate the composability argument of Section 6.4 and characterize the scaling behavior of convergence time with circuit depth.

**Geometry-only gates.** The current gate evaluation logic is explicitly programmed, as in any circuit. A further result would be a gate whose Boolean function arises from geometry alone — for example, a Y-junction where particle streams from two inputs are geometrically diverted when both are active, producing an effective XOR without any programmed threshold comparison. This would require junction topologies where the discrete particle dynamics (collision, bounce, geometric confinement) naturally sort particles into distinct output channels based on the number of active inputs. Preliminary geometric experiments suggest this may be achievable.

**Systematic parameter sweeps.** The current parameter choices were determined empirically. A systematic exploration of the (voltage, emission rate, gate threshold, wire width, wall thickness) parameter space would characterize the region of correct operation and identify the sensitivity boundaries.

**Rust/WASM performance.** A Rust port of the engine core achieves a 5.1x speedup over the JavaScript implementation (1.27s vs 6.43s for 3000 ticks of the half-adder workload). Extending the Rust port to include the experiment layer (circuit objects, batteries, gates, probes) and compiling to WebAssembly would enable interactive circuit simulation in the browser at sufficient speed for real-time exploration. The deterministic PRNG (Mulberry32) is already implemented in both languages with cross-language parity, ensuring reproducibility across platforms.

**Formal verification.** The circuit's electrical analogs (Ohm's law, Kirchhoff's current law) invite formal analysis. Can we prove that the relationship between geometric constriction and flow reduction converges to Ohm's law in the limit of large particle counts and long time averages? Can we bound the probability of misclassification as a function of the noise margin (signal strength relative to threshold)? Such results would move the system from empirical demonstration to theoretical guarantee.

**Sequential logic.** Extending from combinational to sequential circuits requires feedback: the output of a probe must be able to control an upstream battery or gate. The architecture supports this in principle, but the interaction between feedback delay (determined by wire length and diffusion speed) and convergence time (determined by probe window length) introduces timing constraints that must be characterized before reliable sequential circuits can be constructed.

**Three-dimensional circuits.** The current engine operates on a two-dimensional grid. Extending to three dimensions would dramatically increase the available routing space, reduce cross-talk, and enable more compact circuit layouts. The engine's frame hierarchy is dimensionally agnostic, but the spatial index (QuadTree) would need to be replaced with an OcTree, and the collision geometry extended to three-dimensional boundaries.
