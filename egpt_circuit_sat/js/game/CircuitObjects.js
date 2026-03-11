/* Copyright 2023-2025 by Essam Abadir */

/**
 * CircuitObjects.js — Circuit simulation components for the EGPT FRAQTL VM.
 *
 * All circuit components are compositions of existing LargeObject walls and
 * QuantumEmitter sources. No engine modifications required — circuits are
 * spatial arrangements of boundaries and emitters. Particles diffuse through
 * wire channels via brownian motion; current emerges from pressure gradients
 * between battery (source) and ground (sink).
 *
 * Invariant compliance:
 *   - No force calculations — flow emerges from emission pressure vs. absorption
 *   - No teleportation — particles walk through gates pixel-by-pixel
 *   - Gates use local QuadTree density queries only
 *   - All components are experiment-layer objects (LargeObject / QuantumEmitter)
 */

(function () {
    let LargeObject, QuantumEmitter, CollisionTypes, CollisionActions, Rectangle, Frame;
    if (typeof module !== 'undefined') {
        const objs = require('./EntropyGameObjects.js');
        LargeObject = objs.LargeObject;
        QuantumEmitter = objs.QuantumEmitter;
        CollisionTypes = objs.CollisionTypes;
        CollisionActions = objs.CollisionActions;
        const engine = require('../engine/engine.node.js');
        Rectangle = engine.Rectangle;
        Frame = engine.Frame;
    } else {
        LargeObject = window.LargeObject;
        QuantumEmitter = window.QuantumEmitter;
        CollisionTypes = window.CollisionTypes;
        CollisionActions = window.CollisionActions;
        Rectangle = window.Rectangle;
        Frame = window.Frame;
    }

    /**
     * CircuitWire — A bounded channel defined by two parallel LargeObject walls.
     * Particles bounce between the walls and diffuse along the channel.
     *
     * @param {Object} context - { universe, canvas_rect }
     * @param {number} x1 - Start x position (center of wire)
     * @param {number} y1 - Start y position (center of wire)
     * @param {number} x2 - End x position (center of wire)
     * @param {number} y2 - End y position (center of wire)
     * @param {number} width - Channel width in pixels (gap between walls)
     * @param {number} wallThickness - Thickness of each wall (default 3)
     * @param {Array} color - Wall color [r, g, b] (default dark gray)
     */
    class CircuitWire {
        constructor(context, x1, y1, x2, y2, width = 6, wallThickness = 3, color = [80, 80, 80]) {
            this.context = context;
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this.width = width;
            this.wallThickness = wallThickness;
            this.color = color;
            this.walls = [];

            this._createWalls();
        }

        _createWalls() {
            const dx = this.x2 - this.x1;
            const dy = this.y2 - this.y1;
            const isHorizontal = Math.abs(dx) >= Math.abs(dy);

            if (isHorizontal) {
                // Horizontal wire: two walls above and below (tube walls)
                const left = Math.min(this.x1, this.x2);
                const right = Math.max(this.x1, this.x2);
                const centerY = (this.y1 + this.y2) / 2;
                const segLen = right - left;

                // Top wall — particles hitting it get repositioned downward (into channel)
                const topWall = new LargeObject(
                    this.context, this.color,
                    new Rectangle(left, centerY - this.width / 2 - this.wallThickness, segLen, this.wallThickness, null, false),
                    CollisionTypes.WALL,
                    [],
                    "TOP",      // name: wall IS the top
                    "bottom"    // reposition: eject particle downward into channel
                );
                // Bottom wall — particles hitting it get repositioned upward (into channel)
                const bottomWall = new LargeObject(
                    this.context, this.color,
                    new Rectangle(left, centerY + this.width / 2, segLen, this.wallThickness, null, false),
                    CollisionTypes.WALL,
                    [],
                    "BOTTOM",   // name: wall IS the bottom
                    "top"       // reposition: eject particle upward into channel
                );
                this.walls.push(topWall, bottomWall);
            } else {
                // Vertical wire: two walls left and right
                const top = Math.min(this.y1, this.y2);
                const bottom = Math.max(this.y1, this.y2);
                const centerX = (this.x1 + this.x2) / 2;
                const segLen = bottom - top;

                // Left wall — eject particles rightward into channel
                const leftWall = new LargeObject(
                    this.context, this.color,
                    new Rectangle(centerX - this.width / 2 - this.wallThickness, top, this.wallThickness, segLen, null, false),
                    CollisionTypes.WALL,
                    [],
                    "LEFT",     // name: wall IS the left
                    "right"     // reposition: eject particle rightward into channel
                );
                // Right wall — eject particles leftward into channel
                const rightWall = new LargeObject(
                    this.context, this.color,
                    new Rectangle(centerX + this.width / 2, top, this.wallThickness, segLen, null, false),
                    CollisionTypes.WALL,
                    [],
                    "RIGHT",    // name: wall IS the right
                    "left"      // reposition: eject particle leftward into channel
                );
                this.walls.push(leftWall, rightWall);
            }
        }

        /** Returns the bounding rect of the wire channel (the open space between walls). */
        getChannelRect() {
            const dx = this.x2 - this.x1;
            const dy = this.y2 - this.y1;
            const isHorizontal = Math.abs(dx) >= Math.abs(dy);
            if (isHorizontal) {
                const left = Math.min(this.x1, this.x2);
                const right = Math.max(this.x1, this.x2);
                const centerY = (this.y1 + this.y2) / 2;
                return new Rectangle(left, centerY - this.width / 2, right - left, this.width, null, false);
            } else {
                const top = Math.min(this.y1, this.y2);
                const bottom = Math.max(this.y1, this.y2);
                const centerX = (this.x1 + this.x2) / 2;
                return new Rectangle(centerX - this.width / 2, top, this.width, bottom - top, null, false);
            }
        }

        addToUniverse() {
            for (const wall of this.walls) {
                wall.addToUniverse();
            }
        }
    }

    /**
     * CircuitBattery — Particle source (+ terminal) and sink (- terminal).
     * Creates a pressure differential that drives diffusion current through the circuit.
     *
     * Voltage = initial momentum (vx/vy) — the potential energy that becomes
     * kinetic. Under brownian motion, this gives particles a probabilistic
     * directional drift toward the sink while still exploring all paths.
     *
     * Amperage = emission rate (particles per tick) — the number of charge
     * carriers injected into the circuit per tick.
     *
     * @param {Object} context - { universe, canvas_rect }
     * @param {number} sourceX - X position of + terminal (emitter)
     * @param {number} sourceY - Y position of + terminal
     * @param {number} sinkX - X position of - terminal (absorber)
     * @param {number} sinkY - Y position of - terminal
     * @param {number} amperage - Quanta emitted per tick (default 5)
     * @param {number} terminalSize - Size of terminal regions in pixels (default 8)
     * @param {number} fundamentalDim - Fundamental dimension layer (default 0)
     * @param {number} voltage - Initial momentum magnitude (default 1). Higher = faster drift.
     * @param {Array} sourceColor - Color of + terminal [r, g, b]
     * @param {Array} sinkColor - Color of - terminal [r, g, b]
     * @param {number} channelWidth - Width of the wire channel this battery connects to (enables self-sealing)
     * @param {number} wallThickness - Thickness of seal walls (default 3)
     */
    class CircuitBattery {
        constructor(context, sourceX, sourceY, sinkX, sinkY, amperage = 5, terminalSize = 8, fundamentalDim = 0, voltage = 1, sourceColor = [255, 60, 60], sinkColor = [60, 60, 255], channelWidth = 0, wallThickness = 3) {
            this.context = context;
            this.sourceX = sourceX;
            this.sourceY = sourceY;
            this.sinkX = sinkX;
            this.sinkY = sinkY;
            this.amperage = amperage;
            this.voltage = voltage;
            this.terminalSize = terminalSize;
            this.fundamentalDim = fundamentalDim;
            this.sourceColor = sourceColor;
            this.sinkColor = sinkColor;
            this.channelWidth = channelWidth;
            this.wallThickness = wallThickness;
            this.enabled = true;
            this.sealWalls = [];

            // Compute initial velocity direction from source toward sink
            const dx = sinkX - sourceX;
            const dy = sinkY - sourceY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            // Normalize and scale by voltage (capped at 1 by engine's speed limit,
            // but excess accumulates as momentum for future ticks)
            const vx = (dx / dist) * voltage;
            const vy = (dy / dist) * voltage;

            // + terminal: QuantumEmitter with directional momentum
            // Under brownian motion, this initial momentum gives particles a
            // probabilistic drift direction while still exploring all paths
            this.emitter = new QuantumEmitter(
                context,
                sourceColor,
                sourceX - terminalSize / 2, sourceY - terminalSize / 2,
                terminalSize, terminalSize,
                vx, vy, // initial momentum = voltage analog
                fundamentalDim,
                null, // wavelength auto
                null, // charge random
                false, // no wrap
                true, // auto_fire
                context.canvas_rect,
                false, // NOT random_direction — use the computed vx/vy
                Infinity,
                amperage,
                "battery_source"
            );
            this.emitter.fixedLeafMass = 1;
            this.emitter.source_rects.push(
                new Rectangle(sourceX - terminalSize / 2, sourceY - terminalSize / 2, terminalSize, terminalSize, null, false)
            );

            // - terminal: absorber wall (sink)
            this.sink = new LargeObject(
                context,
                sinkColor,
                new Rectangle(sinkX - terminalSize / 2, sinkY - terminalSize / 2, terminalSize, terminalSize, null, false),
                CollisionTypes.NONE,
                [CollisionActions.ABSORB],
                "battery_sink"
            );

            // Visual marker for + terminal
            this.sourceMarker = new LargeObject(
                context,
                sourceColor,
                new Rectangle(sourceX - terminalSize / 2, sourceY - terminalSize / 2, terminalSize, terminalSize, null, false),
                CollisionTypes.NONE,
                [],
                "battery_source_marker"
            );

            // Create seal walls if channelWidth is provided
            if (channelWidth > 0) {
                this._createSealWalls();
            }
        }

        /**
         * Create containment walls around the source and sink terminals.
         * Adds: (1) an end-cap wall behind the emitter to prevent backward escape,
         * (2) top/bottom (or left/right) channel walls spanning the terminal zones
         * so particles can't escape laterally between the battery and wire walls.
         */
        _createSealWalls() {
            const cw = this.channelWidth;
            const wt = this.wallThickness;
            const ts = this.terminalSize;
            const dx = this.sinkX - this.sourceX;
            const dy = this.sinkY - this.sourceY;
            const isHorizontal = Math.abs(dx) >= Math.abs(dy);
            const wallColor = [80, 80, 80];

            if (isHorizontal) {
                const flowRight = dx > 0;

                // Source end-cap: vertical wall behind the emitter
                const capX = flowRight
                    ? this.sourceX - ts / 2 - wt
                    : this.sourceX + ts / 2;
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(capX, this.sourceY - cw / 2 - wt, wt, cw + 2 * wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    flowRight ? "LEFT" : "RIGHT",
                    flowRight ? "right" : "left"
                ));

                // Source zone top/bottom walls: span the emitter terminal width
                const zoneLeft = this.sourceX - ts / 2;
                const zoneWidth = ts;

                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(zoneLeft, this.sourceY - cw / 2 - wt, zoneWidth, wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    "TOP",
                    "bottom"
                ));
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(zoneLeft, this.sourceY + cw / 2, zoneWidth, wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    "BOTTOM",
                    "top"
                ));

                // Sink end-cap: vertical wall behind the sink
                const sinkCapX = flowRight
                    ? this.sinkX + ts / 2
                    : this.sinkX - ts / 2 - wt;
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(sinkCapX, this.sinkY - cw / 2 - wt, wt, cw + 2 * wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    flowRight ? "RIGHT" : "LEFT",
                    flowRight ? "left" : "right"
                ));

                // Sink zone top/bottom walls
                const sinkZoneLeft = this.sinkX - ts / 2;
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(sinkZoneLeft, this.sinkY - cw / 2 - wt, ts, wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    "TOP",
                    "bottom"
                ));
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(sinkZoneLeft, this.sinkY + cw / 2, ts, wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    "BOTTOM",
                    "top"
                ));
            } else {
                const flowDown = dy > 0;

                // Source end-cap: horizontal wall behind the emitter
                const capY = flowDown
                    ? this.sourceY - ts / 2 - wt
                    : this.sourceY + ts / 2;
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(this.sourceX - cw / 2 - wt, capY, cw + 2 * wt, wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    flowDown ? "TOP" : "BOTTOM",
                    flowDown ? "bottom" : "top"
                ));

                // Source zone left/right walls
                const zoneTop = this.sourceY - ts / 2;
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(this.sourceX - cw / 2 - wt, zoneTop, wt, ts, null, false),
                    CollisionTypes.WALL,
                    [],
                    "LEFT",
                    "right"
                ));
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(this.sourceX + cw / 2, zoneTop, wt, ts, null, false),
                    CollisionTypes.WALL,
                    [],
                    "RIGHT",
                    "left"
                ));

                // Sink end-cap
                const sinkCapY = flowDown
                    ? this.sinkY + ts / 2
                    : this.sinkY - ts / 2 - wt;
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(this.sourceX - cw / 2 - wt, sinkCapY, cw + 2 * wt, wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    flowDown ? "BOTTOM" : "TOP",
                    flowDown ? "top" : "bottom"
                ));

                // Sink zone left/right walls
                const sinkZoneTop = this.sinkY - ts / 2;
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(this.sinkX - cw / 2 - wt, sinkZoneTop, wt, ts, null, false),
                    CollisionTypes.WALL,
                    [],
                    "LEFT",
                    "right"
                ));
                this.sealWalls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(this.sinkX + cw / 2, sinkZoneTop, wt, ts, null, false),
                    CollisionTypes.WALL,
                    [],
                    "RIGHT",
                    "left"
                ));
            }
        }

        /** Set amperage (particles per tick) */
        setAmperage(amperage) {
            this.amperage = amperage;
            this.emitter.burst_size = amperage;
        }

        /** Set voltage (initial momentum magnitude) — requires re-creating emitter velocity */
        setVoltage(voltage) {
            this.voltage = voltage;
            const dx = this.sinkX - this.sourceX;
            const dy = this.sinkY - this.sourceY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            this.emitter.vx = (dx / dist) * voltage;
            this.emitter.vy = (dy / dist) * voltage;
        }

        /** Enable/disable the battery */
        setEnabled(enabled) {
            this.enabled = enabled;
            this.emitter.auto_fire = enabled;
        }

        getTickFunction() {
            const self = this;
            return function () {
                if (!self.enabled) return [];
                let quanta = [];
                for (const srcRect of self.emitter.source_rects) {
                    quanta = quanta.concat(self.emitter.fire(srcRect, self.amperage));
                }
                return quanta;
            };
        }

        addToUniverse() {
            this.sink.addToUniverse();
            for (const wall of this.sealWalls) {
                wall.addToUniverse();
            }
            this.context.universe.experimentTickFunctions.push(this.getTickFunction());
        }
    }

    /**
     * CircuitProbe — Non-destructive measurement point.
     * Counts particles passing through a region without absorbing them.
     * Uses MARK action to count without removing particles from the simulation.
     *
     * @param {Object} context - { universe, canvas_rect }
     * @param {number} x - X position of probe center
     * @param {number} y - Y position of probe center
     * @param {number} size - Probe region size (default 6)
     * @param {string} name - Probe name for identification
     * @param {Array} color - Probe color [r, g, b]
     */
    class CircuitProbe {
        constructor(context, x, y, size = 6, name = "probe", color = [0, 255, 0]) {
            this.context = context;
            this.name = name;
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.tickCounts = [];        // rolling history of per-tick counts
            this.windowSize = 10;        // sliding window for averaging

            // Visual marker — rendered but doesn't interact with particles.
            // Density measurement is done by direct QuadTree query in sample().
            this.marker = new LargeObject(
                context,
                color,
                new Rectangle(x - size / 2, y - size / 2, size, size, null, false),
                CollisionTypes.NONE,
                [],
                "probe_" + name
            );

            // Search region for QuadTree density query
            this.searchRect = new Rectangle(x - size / 2, y - size / 2, size, size, null, false);
        }

        /** Get the current flow rate (particles per tick, averaged over window). */
        getFlowRate() {
            if (this.tickCounts.length === 0) return 0;
            const sum = this.tickCounts.reduce((a, b) => a + b, 0);
            return sum / this.tickCounts.length;
        }

        /** Get raw count for the most recent tick. */
        getLastCount() {
            return this.tickCounts.length > 0 ? this.tickCounts[this.tickCounts.length - 1] : 0;
        }

        /** Returns true if flow rate is above threshold (logical HIGH). */
        isHigh(threshold = 1) {
            return this.getFlowRate() >= threshold;
        }

        /**
         * Sample particle density via direct QuadTree query.
         * Called once per tick by the Circuit evaluation function.
         * @param {Object} qtree - QuadTree from the fundamental dimension
         */
        sample(qtree) {
            let count = 0;
            if (qtree) {
                const particles = qtree.query(this.searchRect, [], true);
                count = particles.length;
            }
            this.tickCounts.push(count);
            if (this.tickCounts.length > this.windowSize) {
                this.tickCounts.shift();
            }
            return count;
        }

        addToUniverse() {
            // Marker is purely visual — add it so it renders but it won't collide
            this.marker.addToUniverse();
        }
    }

    /**
     * CircuitResistor — Flow restriction via channel constriction.
     * A narrower wire segment that reduces throughput by geometric constraint.
     * No force calculations — resistance is purely spatial.
     *
     * @param {Object} context - { universe, canvas_rect }
     * @param {number} x - X position (center)
     * @param {number} y - Y position (center)
     * @param {number} length - Length along flow direction (default 10)
     * @param {number} channelWidth - Constricted channel width (default 2)
     * @param {number} outerWidth - Width of the containing wire for transition walls (default 6)
     * @param {boolean} horizontal - Flow direction (default true = left-to-right)
     * @param {number} wallThickness - Wall thickness (default 3)
     * @param {Array} color - Wall color [r, g, b]
     */
    class CircuitResistor {
        constructor(context, x, y, length = 10, channelWidth = 2, outerWidth = 6, horizontal = true, wallThickness = 3, color = [140, 100, 50]) {
            this.context = context;
            this.x = x;
            this.y = y;
            this.length = length;
            this.channelWidth = channelWidth;
            this.outerWidth = outerWidth;
            this.horizontal = horizontal;
            this.color = color;
            this.walls = [];

            this._createWalls(wallThickness);
        }

        _createWalls(wallThickness) {
            if (this.horizontal) {
                const left = this.x - this.length / 2;
                // Top constriction wall — narrows the channel from above
                const topWallH = (this.outerWidth - this.channelWidth) / 2;
                this.walls.push(new LargeObject(
                    this.context, this.color,
                    new Rectangle(left, this.y - this.outerWidth / 2, this.length, topWallH, null, false),
                    CollisionTypes.WALL,
                    [],
                    "TOP",      // wall is the top
                    "bottom"    // eject downward into narrowed channel
                ));
                // Bottom constriction wall — narrows the channel from below
                this.walls.push(new LargeObject(
                    this.context, this.color,
                    new Rectangle(left, this.y + this.channelWidth / 2, this.length, topWallH, null, false),
                    CollisionTypes.WALL,
                    [],
                    "BOTTOM",   // wall is the bottom
                    "top"       // eject upward into narrowed channel
                ));
            } else {
                const top = this.y - this.length / 2;
                const leftWallW = (this.outerWidth - this.channelWidth) / 2;
                this.walls.push(new LargeObject(
                    this.context, this.color,
                    new Rectangle(this.x - this.outerWidth / 2, top, leftWallW, this.length, null, false),
                    CollisionTypes.WALL,
                    [],
                    "LEFT",     // wall is the left
                    "right"     // eject rightward into channel
                ));
                this.walls.push(new LargeObject(
                    this.context, this.color,
                    new Rectangle(this.x + this.channelWidth / 2, top, leftWallW, this.length, null, false),
                    CollisionTypes.WALL,
                    [],
                    "RIGHT",    // wall is the right
                    "left"      // eject leftward into channel
                ));
            }
        }

        addToUniverse() {
            for (const wall of this.walls) {
                wall.addToUniverse();
            }
        }
    }

    /**
     * CircuitGate — Density-activated conditional boundary (AND, OR, NOT, XOR, BUFFER).
     *
     * The gate has a signal channel and one or two control regions. The gate body
     * is a LargeObject whose collision behavior toggles based on particle density
     * in the control region(s). Density is measured via local QuadTree query —
     * strictly local, no non-local interactions.
     *
     * Gate hysteresis is mandatory: uses thresholdHigh/thresholdLow to prevent
     * chatter between states.
     *
     * For NOT gates: when control input is HIGH, the gate blocks the signal.
     * When control is LOW, the gate opens — but since brownian motion doesn't
     * carry particles directionally through an open gap, NOT gates include
     * their own internal emitter to source output particles (like real CMOS).
     *
     * @param {Object} context - { universe, canvas_rect }
     * @param {string} gateType - 'AND', 'OR', 'NOT', 'XOR', 'BUFFER'
     * @param {number} x - Gate body X position (center)
     * @param {number} y - Gate body Y position (center)
     * @param {number} signalWidth - Width of signal channel (default 6)
     * @param {number} gateLength - Length of gate body along signal flow (default 4)
     * @param {boolean} horizontal - Signal flow direction (default true)
     * @param {Object} options - { thresholdHigh, thresholdLow, windowTicks, fundamentalDim, notEmissionRate }
     */
    class CircuitGate {
        constructor(context, gateType, x, y, signalWidth = 6, gateLength = 4, horizontal = true, options = {}) {
            this.context = context;
            this.gateType = gateType.toUpperCase();
            this.x = x;
            this.y = y;
            this.signalWidth = signalWidth;
            this.gateLength = gateLength;
            this.horizontal = horizontal;

            // Hysteresis thresholds
            this.thresholdHigh = options.thresholdHigh || 2;
            this.thresholdLow = options.thresholdLow || 1;
            this.windowTicks = options.windowTicks || 20;
            this.fundamentalDim = options.fundamentalDim || 0;
            this.notEmissionRate = options.notEmissionRate || 2;

            // Control input regions — set by Circuit container during layout
            this.controlRegions = []; // Array of Rectangle — areas to measure density
            this.controlCounts = [];  // Array of rolling count arrays

            // Gate state (with hysteresis)
            this.isOpen = (this.gateType === 'NOT'); // NOT defaults open, others default closed
            this._controlStates = []; // per-input HIGH/LOW state

            // Gate body — the wall that blocks/allows signal flow
            this.gateBody = this._createGateBody();

            // NOT gate internal emitter (CMOS-style power source)
            this.notEmitter = null;
            if (this.gateType === 'NOT') {
                this._createNotEmitter(options);
            }

            // Visual label
            this.label = this.gateType;
        }

        _createGateBody() {
            let rect;
            if (this.horizontal) {
                // Gate blocks the horizontal signal channel
                rect = new Rectangle(
                    this.x - this.gateLength / 2,
                    this.y - this.signalWidth / 2,
                    this.gateLength, this.signalWidth, null, false
                );
            } else {
                rect = new Rectangle(
                    this.x - this.signalWidth / 2,
                    this.y - this.gateLength / 2,
                    this.signalWidth, this.gateLength, null, false
                );
            }

            // Start as blocking wall (for AND/OR/XOR/BUFFER) or pass-through (for NOT)
            const collisionType = (this.gateType === 'NOT') ? CollisionTypes.NONE : CollisionTypes.WALL;
            const actions = [];

            // Reposition direction: push particles back to the upstream side
            const reposition = this.horizontal ? "left" : "top";

            return new LargeObject(
                this.context,
                [200, 200, 50], // yellow-ish for gates
                rect,
                collisionType,
                actions,
                "gate_" + this.gateType,
                reposition
            );
        }

        _createNotEmitter(options) {
            // NOT gate needs its own particle source on the output side
            const ts = 4;
            let emitX, emitY;
            if (this.horizontal) {
                emitX = this.x + this.gateLength / 2 + ts;
                emitY = this.y;
            } else {
                emitX = this.x;
                emitY = this.y + this.gateLength / 2 + ts;
            }

            this.notEmitter = new QuantumEmitter(
                this.context,
                [255, 200, 50],
                emitX - ts / 2, emitY - ts / 2,
                ts, ts,
                0, 0,
                this.fundamentalDim,
                null, null,
                false, true,
                this.context.canvas_rect,
                true, // random direction
                Infinity,
                this.notEmissionRate,
                "not_gate_emitter"
            );
            this.notEmitter.fixedLeafMass = 1;
            this.notEmitter.source_rects.push(
                new Rectangle(emitX - ts / 2, emitY - ts / 2, ts, ts, null, false)
            );
        }

        /**
         * Add a control input region. The gate will measure particle density
         * in this rectangular area to determine its state.
         */
        addControlRegion(rect) {
            this.controlRegions.push(rect);
            this.controlCounts.push([]);
            this._controlStates.push(false);
        }

        /**
         * Evaluate gate state. Called once per tick by the Circuit container.
         * Queries the QuadTree for particle density in each control region.
         */
        evaluate(qtree) {
            // Measure density in each control region
            for (let i = 0; i < this.controlRegions.length; i++) {
                const region = this.controlRegions[i];
                const particles = qtree.query(region, [], true);
                const count = particles.length;

                this.controlCounts[i].push(count);
                if (this.controlCounts[i].length > this.windowTicks) {
                    this.controlCounts[i].shift();
                }

                // Compute average over window
                const avg = this.controlCounts[i].reduce((a, b) => a + b, 0) / this.controlCounts[i].length;

                // Apply hysteresis
                if (this._controlStates[i] && avg < this.thresholdLow) {
                    this._controlStates[i] = false;
                } else if (!this._controlStates[i] && avg >= this.thresholdHigh) {
                    this._controlStates[i] = true;
                }
            }

            // Compute gate output based on type
            let shouldOpen;
            const states = this._controlStates;

            switch (this.gateType) {
                case 'NOT':
                    shouldOpen = states.length > 0 ? !states[0] : true;
                    break;
                case 'AND':
                    shouldOpen = states.length >= 2 ? (states[0] && states[1]) : false;
                    break;
                case 'OR':
                    shouldOpen = states.length >= 2 ? (states[0] || states[1]) : false;
                    break;
                case 'XOR':
                    shouldOpen = states.length >= 2 ? (states[0] !== states[1]) : false;
                    break;
                case 'BUFFER':
                    shouldOpen = states.length > 0 ? states[0] : false;
                    break;
                default:
                    shouldOpen = false;
            }

            // Update gate body collision behavior
            if (shouldOpen !== this.isOpen) {
                this.isOpen = shouldOpen;
                if (this.isOpen) {
                    // Open: no collision, particles pass through
                    this.gateBody.collision_type = CollisionTypes.NONE;
                    this.gateBody.arr_collision_actions = [];
                    this.gateBody.color = [50, 200, 50]; // green = open
                } else {
                    // Closed: wall repositions particles without flipping momentum
                    this.gateBody.collision_type = CollisionTypes.WALL;
                    this.gateBody.arr_collision_actions = [];
                    this.gateBody.color = [200, 50, 50]; // red = closed
                }
            }

            // NOT gate emitter: emit when gate is "open" (input LOW)
            if (this.notEmitter) {
                this.notEmitter.auto_fire = this.isOpen;
            }
        }

        /** Get tick function for NOT gate emitter. Returns empty array for non-NOT gates. */
        getTickFunction() {
            if (!this.notEmitter) return function () { return []; };
            const self = this;
            return function () {
                if (!self.notEmitter.auto_fire) return [];
                let quanta = [];
                for (const srcRect of self.notEmitter.source_rects) {
                    quanta = quanta.concat(self.notEmitter.fire(srcRect, self.notEmissionRate));
                }
                return quanta;
            };
        }

        addToUniverse() {
            this.gateBody.addToUniverse();
            if (this.notEmitter) {
                this.context.universe.experimentTickFunctions.push(this.getTickFunction());
            }
        }
    }

    /**
     * CircuitJunction — A junction point where wire segments meet.
     * Creates containment walls on unconnected sides to prevent particle escape.
     * Connected sides remain open for wire channels to attach.
     *
     * @param {Object} context - { universe, canvas_rect }
     * @param {number} x - Junction center X
     * @param {number} y - Junction center Y
     * @param {number} size - Junction channel width (default 8)
     * @param {Object} connections - Which sides have wire connections { left, right, top, bottom }
     * @param {number} wallThickness - Wall thickness (default 3)
     */
    class CircuitJunction {
        constructor(context, x, y, size = 8, connections = {}, wallThickness = 3) {
            this.context = context;
            this.x = x;
            this.y = y;
            this.size = size;
            this.connections = connections;
            this.walls = [];

            this._createWalls(wallThickness);
        }

        _createWalls(wt) {
            const s = this.size;
            const halfS = s / 2;
            const wallColor = [80, 80, 80];

            // For each unconnected side, create a WALL to seal it
            if (!this.connections.top) {
                this.walls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(this.x - halfS - wt, this.y - halfS - wt, s + 2 * wt, wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    "TOP",
                    "bottom"
                ));
            }
            if (!this.connections.bottom) {
                this.walls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(this.x - halfS - wt, this.y + halfS, s + 2 * wt, wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    "BOTTOM",
                    "top"
                ));
            }
            if (!this.connections.left) {
                this.walls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(this.x - halfS - wt, this.y - halfS - wt, wt, s + 2 * wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    "LEFT",
                    "right"
                ));
            }
            if (!this.connections.right) {
                this.walls.push(new LargeObject(
                    this.context, wallColor,
                    new Rectangle(this.x + halfS, this.y - halfS - wt, wt, s + 2 * wt, null, false),
                    CollisionTypes.WALL,
                    [],
                    "RIGHT",
                    "left"
                ));
            }
        }

        addToUniverse() {
            for (const wall of this.walls) {
                wall.addToUniverse();
            }
        }
    }

    /**
     * Circuit — Top-level container that assembles circuit components,
     * manages layout, and orchestrates per-tick gate evaluation.
     *
     * @param {Object} context - { universe, canvas_rect }
     * @param {Object} options - Circuit configuration
     */
    class Circuit {
        constructor(context, options = {}) {
            this.context = context;
            this.wires = [];
            this.batteries = [];
            this.gates = [];
            this.resistors = [];
            this.probes = [];
            this.junctions = [];
            this.wireWidth = options.wireWidth || 6;
            this.wallThickness = options.wallThickness || 3;
            this.fundamentalDim = options.fundamentalDim || 0;
            this.gateThreshold = options.gateThreshold || 3;
            this.gateWindowTicks = options.gateWindowTicks || 10;
        }

        addWire(x1, y1, x2, y2, width, wallThickness, color) {
            const wire = new CircuitWire(
                this.context, x1, y1, x2, y2,
                width || this.wireWidth,
                wallThickness || this.wallThickness,
                color
            );
            this.wires.push(wire);
            return wire;
        }

        addBattery(sourceX, sourceY, sinkX, sinkY, amperage, terminalSize, voltage) {
            const battery = new CircuitBattery(
                this.context, sourceX, sourceY, sinkX, sinkY,
                amperage || 5,
                terminalSize || 8,
                this.fundamentalDim,
                voltage || 1,
                [255, 60, 60], // sourceColor
                [60, 60, 255], // sinkColor
                this.wireWidth, // channelWidth — enables self-sealing
                this.wallThickness
            );
            this.batteries.push(battery);
            return battery;
        }

        addGate(gateType, x, y, signalWidth, gateLength, horizontal, options) {
            const gate = new CircuitGate(
                this.context, gateType, x, y,
                signalWidth || this.wireWidth,
                gateLength || 4,
                horizontal !== undefined ? horizontal : true,
                {
                    thresholdHigh: (options && options.thresholdHigh) || this.gateThreshold,
                    thresholdLow: (options && options.thresholdLow) || Math.max(1, this.gateThreshold - 1),
                    windowTicks: (options && options.windowTicks) || this.gateWindowTicks,
                    fundamentalDim: this.fundamentalDim,
                    notEmissionRate: (options && options.notEmissionRate) || 2,
                }
            );
            this.gates.push(gate);
            return gate;
        }

        addResistor(x, y, length, channelWidth, horizontal) {
            const resistor = new CircuitResistor(
                this.context, x, y,
                length || 10,
                channelWidth || 2,
                this.wireWidth,
                horizontal !== undefined ? horizontal : true,
                this.wallThickness
            );
            this.resistors.push(resistor);
            return resistor;
        }

        addProbe(x, y, name, size) {
            const probe = new CircuitProbe(
                this.context, x, y,
                size || this.wireWidth,
                name || ("probe_" + this.probes.length)
            );
            this.probes.push(probe);
            return probe;
        }

        addJunction(x, y, size, connections) {
            const junction = new CircuitJunction(
                this.context, x, y,
                size || this.wireWidth,
                connections || {},
                this.wallThickness
            );
            this.junctions.push(junction);
            return junction;
        }

        /**
         * Per-tick evaluation: sample probes and evaluate all gates.
         * Called as an experiment tick function by the universe.
         */
        getEvaluationTickFunction() {
            const self = this;
            return function () {
                // Get the quadtree from the fundamental dimension for local density queries
                const dim = self.context.universe.dimensions.get(self.fundamentalDim);
                if (!dim) return [];

                const qtree = dim.getQtreeFromFrames();

                if (qtree) {
                    // Evaluate all gates
                    for (const gate of self.gates) {
                        gate.evaluate(qtree);
                    }
                }

                // Sample all probes with the same qtree
                for (const probe of self.probes) {
                    probe.sample(qtree);
                }

                return [];
            };
        }

        /** Get a snapshot of all probe readings. */
        getCircuitState() {
            const state = {};
            for (const probe of this.probes) {
                state[probe.name] = {
                    flowRate: probe.getFlowRate(),
                    lastCount: probe.getLastCount(),
                    isHigh: probe.isHigh(this.gateThreshold),
                };
            }
            return state;
        }

        /** Add all components to the universe. */
        addToUniverse() {
            for (const wire of this.wires) wire.addToUniverse();
            for (const resistor of this.resistors) resistor.addToUniverse();
            for (const gate of this.gates) gate.addToUniverse();
            for (const battery of this.batteries) battery.addToUniverse();
            for (const probe of this.probes) probe.addToUniverse();
            for (const junction of this.junctions) junction.addToUniverse();

            // Register the evaluation tick function
            this.context.universe.experimentTickFunctions.push(this.getEvaluationTickFunction());
        }
    }

    // Export
    if (typeof module !== 'undefined') {
        module.exports = {
            CircuitWire,
            CircuitBattery,
            CircuitProbe,
            CircuitResistor,
            CircuitGate,
            CircuitJunction,
            Circuit,
        };
    } else {
        window.CircuitWire = CircuitWire;
        window.CircuitBattery = CircuitBattery;
        window.CircuitProbe = CircuitProbe;
        window.CircuitResistor = CircuitResistor;
        window.CircuitGate = CircuitGate;
        window.CircuitJunction = CircuitJunction;
        window.Circuit = Circuit;
    }
})();
