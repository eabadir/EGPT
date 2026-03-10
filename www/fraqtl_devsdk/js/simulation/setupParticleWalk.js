/* Copyright 2023-2025 by Essam Abadir */

/**
 * createParticleWalkSetup - Shared setup factory for the Wave-Particle Duality (Particle Walk) simulation.
 *
 * @param {Object} context - { universe, canvas_rect }
 * @param {Object} options - Optional overrides
 * @param {number} options.fundamentalDimension - Fundamental dimension n where leaf size is 2^n × 2^n (default 0)
 * @param {number} options.fundamentalWaveLength - Desired oscillation period for the fundamental particles (default 64)
 * @param {number} options.velocity - Initial velocity X baseline (default 1, matching egpt_core)
 */
(function () {
    let QuantumEmitter, Rectangle;
    if (typeof module !== 'undefined') {
        const objs = require('../game/EntropyGameObjects.js');
        QuantumEmitter = objs.QuantumEmitter;
        Rectangle = require('../engine/engine.node.js').Rectangle;
    } else {
        QuantumEmitter = window.QuantumEmitter;
        Rectangle = window.Rectangle;
    }



    function createParticleWalkSetup(context, options = {}) {
        const { canvas_rect, universe } = context;
        // Lazy resolve QuantumEmitter if not already resolved
        if (!QuantumEmitter) {
            if (typeof window !== 'undefined' && window.QuantumEmitter) {
                QuantumEmitter = window.QuantumEmitter;
            } else if (typeof require !== 'undefined') {
                const objs = require('../game/EntropyGameObjects.js');
                QuantumEmitter = objs.QuantumEmitter;
            }
        }
        if (!QuantumEmitter) {
            throw new Error("QuantumEmitter not found. Ensure EntropyGameObjects.js is loaded.");
        }

        const fundamentalDimension = options.fundamentalDimension !== undefined ? options.fundamentalDimension : 0;
        const desiredWaveLength = options.fundamentalWaveLength !== undefined ? options.fundamentalWaveLength : 64;
        const velocity = options.velocity !== undefined ? options.velocity : 1;
        let waveLengthMultiplier = Math.floor(desiredWaveLength / 4);
        waveLengthMultiplier = Math.max(1, waveLengthMultiplier);
        
        const use_quantum_dimension = false;
        const emergent_physics = false;
        const vx = velocity;
        const vy = 0;
        const charge = 1;
        const wrap = true;
        const autofire = false;

        // Match egpt_core particle walk setup:
        // - noObserverFrame=true selects the wave branch
        // - fixed leaf mass 1 means period = capacity * wavelengthConstant
        universe.init(canvas_rect, fundamentalDimension, waveLengthMultiplier, false, false, emergent_physics, true, false);
        universe.wavelengthConstant = waveLengthMultiplier;
        if (!emergent_physics) {
            universe.minMBFillRate = 0.2;
        }

        if (use_quantum_dimension) {
            universe.addDimension(3);
        }

        const light_source_center_y = Math.floor(canvas_rect.h / 2);
        const light_source_center_x = Math.floor(canvas_rect.w / 2);
        //constructor(context, color, left, top, width, height, vx, vy, level, wavelength, charge, wrap = true, auto_fire = false, canvas_rect = null, random_direction = false, quantum_limit = Infinity, burst_size = 100, name = "quantum_emitter") {
        const quantum_emitter = new QuantumEmitter(
            context,
            [255, 0, 0], // color
            10, 10, // left, top (will be overwritten by source_rects)
            10, 10, // width, height
            vx, vy,
            fundamentalDimension,
            null, //wavelength will be set automatically based on the fudamentalDimension and waveLengthMultiplier
            charge,
            wrap,
            autofire,
            canvas_rect
        );
        quantum_emitter.auto_fire = true;
        quantum_emitter.fixedLeafMass = 1;
        quantum_emitter.coreWaveMode = true;

        const light_source_height = 10;
        // Emitter placed at center? Original code:
        // let light_source_rect = new Rectangle(light_source_center_x, light_source_center_y, 1, light_source_height, null, true);
        // But usually particle walk implies left-to-right.
        // Let's stick to the original code's placement: center_x, center_y.
        const light_source_rect = new Rectangle(light_source_center_x, light_source_center_y, 1, light_source_height, null, true);
        quantum_emitter.source_rects.push(light_source_rect);

        // Add tick function
        universe.experimentTickFunctions.push(quantum_emitter.getDefaultTickFunction(20));

        return {
            universe,
            quantum_emitter,
            fundamentalDimension,
            // fundamentalWaveLength,
            // applyFundamentalWaveLength: (nextWaveLength) =>
            //     applyFundamentalWaveLength(universe, fundamentalDimension, nextWaveLength)
        };
    }

    if (typeof module !== 'undefined') {
        module.exports = {
            createParticleWalkSetup,
        
        };
    } else {
        window.createParticleWalkSetup = createParticleWalkSetup;
        
    }
})();
