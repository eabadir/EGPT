/* Copyright 2023-2025 by Essam Abadir */

/**
 * createCircuitBasicSetup - Shared setup factory for a basic series circuit.
 *
 * Demonstrates particle diffusion through a circuit: battery (source) →
 * wire → resistor → wire → probe → ground (sink).
 *
 * Wires are modeled as two parallel LargeObject walls ("tubes"). Resistance
 * is the width of space between the tubes — the resistor narrows the gap.
 *
 * Voltage = initial momentum toward sink (probabilistic drift under brownian motion).
 * Amperage = particles emitted per tick.
 *
 * Universe config: emergentPhysics=false, brownianMotion=true,
 * withInterQuantumCollisions=true, single fundamental dimension.
 *
 * @param {Object} context - { universe, canvas_rect }
 * @param {Object} options - Optional overrides
 * @param {number} options.wireWidth - Channel width in pixels (default 10)
 * @param {number} options.amperage - Particles per tick (default 5)
 * @param {number} options.voltage - Initial momentum magnitude (default 10)
 * @param {number} options.resistorWidth - Constricted channel width (default 4)
 */
(function () {
    let Circuit, CircuitWire, CircuitBattery, CircuitProbe, CircuitResistor, Rectangle;
    if (typeof module !== 'undefined') {
        const circuitObjs = require('../game/CircuitObjects.js');
        Circuit = circuitObjs.Circuit;
        CircuitWire = circuitObjs.CircuitWire;
        CircuitBattery = circuitObjs.CircuitBattery;
        CircuitProbe = circuitObjs.CircuitProbe;
        CircuitResistor = circuitObjs.CircuitResistor;
        Rectangle = require('../engine/engine.node.js').Rectangle;
    } else {
        Circuit = window.Circuit;
        CircuitWire = window.CircuitWire;
        CircuitBattery = window.CircuitBattery;
        CircuitProbe = window.CircuitProbe;
        CircuitResistor = window.CircuitResistor;
        Rectangle = window.Rectangle;
    }

    function createCircuitBasicSetup(context, options = {}) {
        const { canvas_rect, universe } = context;

        const wireWidth = options.wireWidth || 10;
        const amperage = options.amperage || options.emissionRate || 1;
        const voltage = options.voltage || 10;
        const resistorWidth = options.resistorWidth || 4;
        const fundamentalDim = 0;
        const wallThickness = 3;

        // Initialize universe: ground-up mode with brownian motion for diffusion
        universe.init(canvas_rect, fundamentalDim, 1, false, false, false, false, false);
        universe.brownianMotion = true;
        universe.withInterQuantumCollisions = true;

        const circuit = new Circuit(context, {
            wireWidth: wireWidth,
            wallThickness: wallThickness,
            fundamentalDim: fundamentalDim,
        });

        // Layout: one continuous horizontal tube from left to right
        //
        //  [Bat+] ════════ [Probe A] ═══ [Resistor] ═══ [Probe B] ════════ [Bat-]
        //  ╚════════════════════════════════════════════════════════════════════╝
        //
        // The wire is one continuous channel. The resistor is an overlay
        // that narrows the channel at one point. Probes are non-intrusive
        // density samplers.

        const margin = 40;
        const centerY = Math.round(canvas_rect.h / 2);
        const wireLeft = margin;
        const wireRight = canvas_rect.w - margin;
        const wireLen = wireRight - wireLeft;

        // Key X positions along the wire
        const batSourceX = wireLeft + 10;
        const probeAX = wireLeft + Math.round(wireLen * 0.3);
        const resistorX = wireLeft + Math.round(wireLen * 0.5);
        const probeBX = wireLeft + Math.round(wireLen * 0.7);
        const batSinkX = wireRight - 10;

        // One continuous wire tube spanning the full circuit
        // Battery self-sealing provides end-cap walls at both terminals
        circuit.addWire(wireLeft, centerY, wireRight, centerY, wireWidth, wallThickness);

        // Battery: source on left, sink on right
        // Terminal size fits inside the wire channel
        const battery = circuit.addBattery(
            batSourceX, centerY,
            batSinkX, centerY,
            amperage,
            wireWidth - 2, // terminal slightly smaller than wire to fit inside
            voltage
        );

        // Probe A: before resistor
        const probeA = circuit.addProbe(probeAX, centerY, 'before_resistor', wireWidth);

        // Resistor: narrows the channel at the midpoint
        circuit.addResistor(resistorX, centerY, 20, resistorWidth, wireWidth, true, wallThickness);

        // Probe B: after resistor
        const probeB = circuit.addProbe(probeBX, centerY, 'after_resistor', wireWidth);

        circuit.addToUniverse();

        return {
            universe,
            circuit,
            battery,
            probes: { before_resistor: probeA, after_resistor: probeB },
            setBatteryAmperage: (amp) => battery.setAmperage(amp),
            setBatteryVoltage: (v) => battery.setVoltage(v),
            getCircuitState: () => circuit.getCircuitState(),
        };
    }

    if (typeof module !== 'undefined') {
        module.exports = { createCircuitBasicSetup };
    } else {
        window.createCircuitBasicSetup = createCircuitBasicSetup;
    }
})();
