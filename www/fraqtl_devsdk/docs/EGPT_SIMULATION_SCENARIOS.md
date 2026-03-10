# EGPT Simulation Scenarios & Configuration

This document details the core simulation scenarios (experiments) supported by the EGPT engine, mapping their conceptual goals to the specific code configurations (switches, parameters) used to achieve them.

## 1. Wave Particle Duality
### The universal frame
**Concept**: Particles travel in free space with no collisions and no external forces (no parent frame gravity). They maintain their momentum vector (`vx`, `vy`) indefinitely. The "random walk" component of movement appears perpendicular to the momentum, creating a visual wave pattern.
*   **Visual**: A stream of particles moving in a single direction, exhibiting wave-like oscillation.
*   **Key Mechanics**:
    *   No momentum loss (no parent frame drag).
    *   No Brownian motion (pure directional bias).
*   **Code Configuration** (`setupParticleWalk`):
    *   `emergentPhysics = false`: No dynamic dimension/frame generation.
    *   `noObserverFrame = true`: Disables the default "observer frame" gravitational pull (sets `brownianMotion = false` in `EGPTUniverse`).
    *   `QuantumEmitter`: Configured with `random_direction = false` to emit in a specific direction.
    *   Developer-facing controls should be expressed as:
        * `fundamentalDimension` — particle size via `2^n × 2^n`
        * `fundamentalWaveLength` — desired full oscillation period
    *   The setup layer derives an integer `planckConstant` from those values and warns if the requested period is not exactly representable.

### Wave Polarization
**Concept**: When `brownianMotion` is disabled, the particle-walk and wave-interference simulations use a **virtual parent frame** model for unparented leaf frames. The particle's baseline `vx` / `vy` is understood as having been imparted by a hypothetical, very distant universe-level parent whose effect is too small to change that baseline further. The visible wave motion then comes from a **virtual local inertial frame** imparting a periodic, orthogonal, non-deterministic bias.
*   **Baseline motion**: For this scenario, unparented leaf frames preserve their primary `vx` / `vy` direction. The virtual parent does **not** change that baseline momentum vector.
*   **Orthogonal bias**: The virtual parent contributes only the perpendicular wave-like component. This bias is **non-deterministic** but structured by wavelength and charge.
*   **Periodicity**: The oscillation period is exactly equal to the particle's `wavelength`.
*   **Phase**: The direction of the orthogonal bias (up/down or left/right) is controlled by the phase schedule of the particle's wave, i.e. `local_time % wavelength`.
*   **Polarization**: A cohort becomes polarized when particles share the same initial charge, baseline direction, and phase schedule. That does not require the orthogonal bias to be deterministic; it requires that the stochastic bias be sampled from the same phase-dependent distribution.
*   **Key Mechanics**:
    *   `spin` (UP/DOWN) flips by wave quadrant relative to `wavelength`.
    *   `p_heads` / `p_tails` are derived from `wavelength` and determine the probability of orthogonal bias direction.
    *   `charge` shifts the phase schedule, determining whether the particle behaves like the sine-like or cosine-like branch.
    *   In this simplified scenario, the virtual parent supplies the orthogonal bias while the distant universe-level parent explains the stable baseline `vx` / `vy`.
    *   EGPT constraints still apply:
        * leaf size must be `2^n × 2^n`
        * fundamental wavelength must be an integer and divisible by `4`
        * `planckConstant` is an integer engine parameter derived from the requested visible wave period

## 2. Wave Interference Patterns
**Concept**: Similar to Wave Particle Duality, but particles are emitted in all directions from point sources. The wave-like movement of individual particles leads to emergent interference patterns where their paths intersect.
*   **Visual**: Concentric waves radiating from point sources, showing interference where they overlap.
*   **Key Mechanics**:
    *   Same as Wave Particle Duality (no drag, no random noise).
    *   Multi-directional emission (circular pattern from each source).
*   **Code Configuration** (`setupWaveInterference`):
    *   `emergentPhysics = false`
    *   `noObserverFrame = true`: Disables `brownianMotion`.
    *   `PointSource`: Used instead of `QuantumEmitter` to emit radially.
    *   Developer-facing controls: `fundamentalDimension`, `fundamentalWaveLength` (default 8).



## 3. Big Bang
**Concept**: Demonstrates "emergent physics" where the universe dynamically allocates dimensions and frames based on particle proximity. Starts with a dense point source; as particles spread, they form hierarchical structures (frames) organically (top-down proximity-based generation).
*   **Visual**: An expanding cloud of particles that clump into hierarchical structures.
*   **Key Mechanics**:
    *   Pure Brownian motion enabled.
    *   Dynamic dimension/frame allocation (`emergentPhysics`).
    *   Recursive attraction (parent frames attract their children via `compress()`).
*   **Code Configuration** (`setupBigBang`):
    *   `emergentPhysics = true`: Enables `buildFramesFromSprites` (Phase B) and dynamic dimension spawning.
    *   `noObserverFrame = false`: Enables `brownianMotion` (default behavior).
    *   `iframe_interval_seconds = 1/60`: Runs structure building every tick for smooth emergence.

## 4. Double Slit
**Concept**: The Wave Interference experiment with the addition of `LargeObject` obstacles (walls with slits) and a detector screen. Demonstrates diffraction and interference through slits.
*   **Visual**: Plane waves or particle streams hitting a barrier, passing through slits, and forming an interference pattern on a back wall.
*   **Key Mechanics**:
    *   Same as Wave Interference (no drag).
    *   `LargeObject` collisions (Absorption/Blocking).
*   **Code Configuration** (`setupDoubleSlit`):
    *   `emergentPhysics = false`
    *   `noObserverFrame = true`: Disables `brownianMotion`.
    *   `SlitScreen`: Creates `LargeObject` walls.
    *   `DetectorWall`: Captures collision data.

## 5. Blackbody (Bouncy Box)
**Concept**: Extends the Oscillator concept. Particles are emitted into a box where they bounce off walls (LargeObjects) and interact with each other. Frame generation is "bottom-up" based on collisions (unlike BigBang's top-down proximity).
*   **Visual**: A box filled with bouncing particles.
*   **Key Mechanics**:
    *   LargeObject collisions (Bounce).
    *   Thermodynamic equilibrium simulation.
    *   Collision-based frame promotion (Phase C).
*   **Code Configuration** (`setupBlackBody` / `createBlackbodySetup`):
    *   `emergentPhysics = false`: Disables top-down `buildFramesFromSprites`. Frame promotion relies on `handleStructurePromotion` (bottom-up collision logic).
    *   `noObserverFrame = false`: Enables `brownianMotion`.
    *   `withInterQuantumCollisions = true`: Enables collision-based frame promotion (ground-up mode). When two leaf frames collide, `handleStructurePromotion` creates parent frames in the next dimension.
    *   `BouncyBox` / `OvenBox`: Manages temperature-based emission and wall boundaries.


## 6. Quantum Computing (Oscillator)
**Concept**: A particle (quantum) inside a parent frame. It moves in the direction of its momentum until the parent frame's attraction (`compress()`) overcomes it at the edge, causing it to turn around and accelerate back toward the center. This repeats, creating a stable oscillator.
*   **Visual**: A particle bouncing/oscillating within a defined box (frame), often recursively nested.
*   **Key Mechanics**:
    *   Parent frame gravity active.
    *   Momentum conservation (kinetic <-> potential energy exchange).
    *   "No Escape" (optional): Keeps particles contained for visual clarity.
*   **Code Configuration** (`setupEGPTFractal`):
    *   `emergentPhysics = false`: Structure is pre-defined (Oscillator Frame inside Observer Frame).
    *   `brownianMotion = true`: Explicitly enabled in `EgptFractal.setupFractal` (overriding `noObserverFrame` if it was set).
    *   `EgptFractal`: Custom class that builds the specific nested frame hierarchy.
