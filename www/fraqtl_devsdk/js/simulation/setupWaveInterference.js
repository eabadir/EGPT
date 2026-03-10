/* Copyright 2023-2025 by Essam Abadir */

/**
 * createWaveInterferenceSetup - Shared setup factory for the Wave Interference simulation.
 *
 * @param {Object} context - { universe, canvas_rect }
 * @param {Object} options - Optional overrides
 * @param {number} options.fundamentalDimension - Fundamental dimension n where leaf size is 2^n × 2^n (default 0)
 * @param {number} options.fundamentalWaveLength - Desired oscillation period for fundamental particles (default 8)
 * @param {number} options.velocity - Initial velocity magnitude for radial emission (default 50000)
 * @param {number} options.sourceDiameter - Diameter of each source circle; emission from surface only; black interior (default: max(16, realizedWaveLength*2))
 */
(function () {
    let PointSource, Rectangle;
    if (typeof module !== 'undefined') {
        const objs = require('../game/EntropyGameObjects.js');
        PointSource = objs.PointSource;
        Rectangle = require('../engine/engine.node.js').Rectangle;
        const pw = require('./setupParticleWalk.js');
      
    } else {
        PointSource = window.PointSource;
        Rectangle = window.Rectangle;
      
    }

    function createWaveInterferenceSetup(context, options = {}) {
        const { canvas_rect, universe } = context;
        const CollisionTypes = typeof require !== 'undefined' ? require('../game/EntropyGameObjects.js').CollisionTypes : window.CollisionTypes;
        if (!PointSource) {
            if (typeof window !== 'undefined' && window.PointSource) {
                PointSource = window.PointSource;
            } else if (typeof require !== 'undefined') {
                const objs = require('../game/EntropyGameObjects.js');
                PointSource = objs.PointSource;
            }
        }
        if (!PointSource) {
            throw new Error("PointSource not found. Ensure EntropyGameObjects.js is loaded.");
        }


        // Original working config: fundamentalDimension=2 (4×4, capacity=16), wavelengthConstant=8
        // → realized wavelength = floor((16/1)*8) = 128. Large coherent oscillation for visible fringes.
        const fundamentalDimension = options.fundamentalDimension !== undefined ? options.fundamentalDimension : 2;
        const desiredWaveLength = options.fundamentalWaveLength !== undefined ? options.fundamentalWaveLength : 32;
        const wavelengthConstant = options.wavelengthConstant !== undefined ? options.wavelengthConstant : 8;

        const emergent_physics = false;

        universe.init(canvas_rect, fundamentalDimension, wavelengthConstant, false, false, emergent_physics, true, false);

        if (!emergent_physics) {
            universe.minMBFillRate = 0.2;
        }

        const light_source_center_y = Math.floor(canvas_rect.h / 2);
        const light_source_center_x = Math.floor(canvas_rect.w / 2);

        const color = [18, 33, 201];
        //source separation is the center-to-center distance between the two sources and should be 2 * wavelength
        //so particles emitted from the surface complete their first wavelength at the midpoint between sources
        const sourceSeparation = options.sourceSeparation !== undefined ? options.sourceSeparation : 2 * desiredWaveLength;
        console.log("sourceSeparation:", sourceSeparation, "desiredWaveLength:", desiredWaveLength);
        const sourceOffset = sourceSeparation / 2;
        const lightSourceDiameter = options.sourceDiameter !== undefined
            ? options.sourceDiameter
            : desiredWaveLength;
        // charge=null → random positive/negative per particle. Both phase components
        // (sine-like + cosine-like wave-walk) are needed for interference fringes.
        const charge = null;
        const wrap = false;
        const autofire = true;
        const dispersionAngleIncrement = 5;

        const center_x1 = light_source_center_x - sourceOffset;
        const center_x2 = light_source_center_x + sourceOffset;
        const sourceRadius = lightSourceDiameter / 2;
        //constructor(context, color, x, y, diameter, vx, wavelength, charge, wrap = true, auto_fire = false, canvas_rect = null, delay = 0, quantum_limit = Infinity, angle_increment = 5, frameDimension = 1, emergentPhysics = false) {
        const velocity = options.velocity !== undefined ? options.velocity : 50000;
        const quantumLimit = options.quantumLimit !== undefined ? options.quantumLimit : velocity;

        const pointSource1 = new PointSource(
            context, color, center_x1, light_source_center_y, lightSourceDiameter,
            velocity, desiredWaveLength, charge, wrap, autofire, canvas_rect, 0,
            quantumLimit, dispersionAngleIncrement, fundamentalDimension
        );

        const pointSource2 = new PointSource(
            context, color, center_x2, light_source_center_y, lightSourceDiameter,
            velocity, desiredWaveLength, charge, wrap, autofire, canvas_rect, 0,
            quantumLimit, dispersionAngleIncrement, fundamentalDimension
        );

        const source1Rect = new Rectangle(center_x1 - sourceRadius, light_source_center_y - sourceRadius, lightSourceDiameter, lightSourceDiameter, null, false);
        const source2Rect = new Rectangle(center_x2 - sourceRadius, light_source_center_y - sourceRadius, lightSourceDiameter, lightSourceDiameter, null, false);
        const source1Circle = new (typeof require !== 'undefined' ? require('../game/EntropyGameObjects.js').LargeObject : window.LargeObject)(
            context, [0, 0, 0], source1Rect, CollisionTypes.NONE, [], 'source1'
        );
        const source2Circle = new (typeof require !== 'undefined' ? require('../game/EntropyGameObjects.js').LargeObject : window.LargeObject)(
            context, [0, 0, 0], source2Rect, CollisionTypes.NONE, [], 'source2'
        );
        source1Circle.drawAsCircle = true;
        source2Circle.drawAsCircle = true;
        universe.addLargeObject(source1Circle);
        universe.addLargeObject(source2Circle);

        const experiment_tick = function () {
            let return_quanta = [];
            return_quanta = return_quanta.concat(pointSource1.fire());
            return_quanta = return_quanta.concat(pointSource2.fire());
            return return_quanta;
        };

        universe.experimentTickFunctions.push(experiment_tick);

        return {
            universe,
            pointSource1,
            pointSource2,
            fundamentalDimension,
            desiredWaveLength
            
        };
    }

    if (typeof module !== 'undefined') {
        module.exports = { createWaveInterferenceSetup }; 
    } else {
        window.createWaveInterferenceSetup = createWaveInterferenceSetup;
        
    }
})();
