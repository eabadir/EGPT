/* Copyright 2023-2025 by Essam Abadir */

/**
 * createOscillatorSetup - Shared setup factory for the Quantum Oscillator (Scenario 6).
 *
 * Builds a three-level frame hierarchy: observer > oscillator > quantum.
 * The quantum does a random walk inside the oscillator frame while compress()
 * pulls it toward the oscillator center, creating a stable oscillation.
 * The oscillator itself moves inside the observer frame, and the perceived
 * motion from the observer's rest frame produces an emergent wave pattern.
 *
 * @param {Object} context - { universe, canvas_rect }
 * @param {Object} options - Optional overrides
 * @param {number} options.quantumDimension - Dimension level for leaf quanta (default 2)
 * @param {number} options.oscillatorDelta - Delta added to quantumDimension for oscillator (default 3)
 */
(function () {
    let EgptFractal, Rectangle;
    if (typeof module !== 'undefined') {
        const objs = require('../game/EntropyGameObjects.js');
        EgptFractal = objs.EgptFractal;
        Rectangle = require('../engine/engine.node.js').Rectangle;
    } else {
        EgptFractal = window.EgptFractal;
        Rectangle = window.Rectangle;
    }

    function createOscillatorSetup(context, options = {}) {
        const { canvas_rect, universe } = context;

        if (!EgptFractal) {
            if (typeof window !== 'undefined' && window.EgptFractal) {
                EgptFractal = window.EgptFractal;
            } else if (typeof require !== 'undefined') {
                const objs = require('../game/EntropyGameObjects.js');
                EgptFractal = objs.EgptFractal;
            }
        }
        if (!EgptFractal) {
            throw new Error("EgptFractal not found. Ensure EntropyGameObjects.js is loaded.");
        }

        universe.emergentPhysics = false;

        const fractal = new EgptFractal(context, canvas_rect, universe);
        fractal.setupFractal();

        return {
            universe,
            fractal,
            quantum: fractal.quanta[0],
            oscillator: fractal.oscillator,
            observer: fractal.observer_frame
        };
    }

    if (typeof module !== 'undefined') {
        module.exports = { createOscillatorSetup };
    } else {
        window.createOscillatorSetup = createOscillatorSetup;
    }
})();
