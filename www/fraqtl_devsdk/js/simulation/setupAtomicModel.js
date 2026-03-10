/* Copyright 2023-2025 by Essam Abadir */

/**
 * createAtomicModelSetup - Shared setup factory for the Atomic Model experiment.
 *
 * Builds a three-level frame hierarchy demonstrating the strong force as
 * emergent confinement via compress():
 *   - Quarks (level 0 leaf frames) oscillate inside subatomic frames
 *   - Subatomic frames oscillate inside the atom frame
 *   - The atom frame is stationary (lab/observer rest frame)
 *
 * @param {Object} context - { universe, canvas_rect }
 * @param {Object} options - Optional overrides
 * @param {number} options.quarkDimension - Leaf quanta level (default 0, 1x1)
 * @param {number} options.subatomicDimension - Subatomic frame level (default 3, 8x8)
 * @param {number} options.atomDimension - Atom frame level (default 6, 64x64)
 * @param {number} options.quarksPerProton - Quarks in the proton frame (default 48)
 * @param {boolean} options.includeElectron - Add an electron quark outside the proton (default true)
 */
(function () {
    let Frame, Charge, Rectangle;
    if (typeof module !== 'undefined') {
        const engine = require('../engine/engine.node.js');
        Frame = engine.Frame;
        Charge = engine.Charge;
        Rectangle = engine.Rectangle;
        require('../game/EntropyGameObjects.js');
    } else {
        Frame = window.Frame;
        Charge = window.Charge;
        Rectangle = window.Rectangle;
    }

function createAtomicModelSetup(context, options = {}) {
    const { canvas_rect, universe } = context;

    const quarkDimLevel = options.quarkDimension !== undefined ? options.quarkDimension : 0;
    const subatomicDimLevel = options.subatomicDimension !== undefined ? options.subatomicDimension : 3;
    const atomDimLevel = options.atomDimension !== undefined ? options.atomDimension : 6;
    const quarksPerProton = options.quarksPerProton !== undefined ? options.quarksPerProton : 48;
    const includeElectron = options.includeElectron !== undefined ? options.includeElectron : true;

    // Init universe FIRST (resets dimensions), then add our hierarchy dimensions
    universe.init(canvas_rect, quarkDimLevel, 1, false, false, false, true, false);

    const quarkDim = universe.addDimension(quarkDimLevel);
    const subatomicDim = universe.addDimension(subatomicDimLevel);
    const atomDim = universe.addDimension(atomDimLevel);

    const subatomicW = subatomicDim.mb_w; // 2^3 = 8
    const atomW = atomDim.mb_w;           // 2^6 = 64

    // Center the atom on the canvas
    const centerX = Math.round(canvas_rect.w / 2);
    const centerY = Math.round(canvas_rect.h / 2);
    const atomRect = new Rectangle(centerX, centerY, atomW, atomW, null, true);

    // Place the proton frame at the center of the atom
    const protonRect = new Rectangle(centerX, centerY, subatomicW, subatomicW, null, true);

    // Create quarks filling the proton frame in a grid pattern
    const quarkW = Math.max(1, Math.pow(2, quarkDimLevel)); // 1 for level 0
    const protonQuarks = [];
    let placed = 0;
    for (let x = protonRect.left; x < protonRect.left + protonRect.w && placed < quarksPerProton; x += quarkW) {
        for (let y = protonRect.top; y < protonRect.top + protonRect.h && placed < quarksPerProton; y += quarkW) {
            const quark = Frame.makeLeafFrame(x, y, quarkDimLevel, 1, 0, 0, false, Charge.POSITIVE, canvas_rect);
            quark.name = 'quark_' + placed;
            protonQuarks.push(quark);
            placed++;
        }
    }

    // Register quarks in the quark dimension (so they get their own move() calls)
    for (const quark of protonQuarks) {
        quarkDim.addFrame(quark);
    }

    // Create the proton frame containing the quarks
    const proton = subatomicDim.createFrameFromRect(protonRect, protonQuarks, 0, 0);
    proton.name = 'proton';

    // Optionally add an electron — a single quark outside the proton but inside the atom
    const subatomicFrames = [proton];
    let electron = null;
    if (includeElectron) {
        const electronX = atomRect.left + Math.round(atomW * 0.75);
        const electronY = atomRect.top + Math.round(atomW * 0.25);
        electron = Frame.makeLeafFrame(electronX, electronY, quarkDimLevel, 1, 0, 0, false, Charge.NEGATIVE, canvas_rect);
        electron.name = 'electron';
        quarkDim.addFrame(electron);
    }

    // Build the atom frame containing subatomic particles
    const atomChildFrames = [...subatomicFrames];
    const atom = atomDim.createFrameFromRect(atomRect, atomChildFrames, 0, 0, true, true);
    atom.name = 'atom';

    // Add the electron directly to the atom's children (not via a subatomic frame)
    if (electron) {
        atom.insert(electron);
    }

    universe.leafQuantaWidth = quarkW;
    universe.brownianMotion = true;

    return {
        universe,
        atom,
        proton,
        electron,
        protonQuarks,
        quarkDim,
        subatomicDim,
        atomDim
    };
}

if (typeof module !== 'undefined') {
    module.exports = { createAtomicModelSetup };
} else {
    window.createAtomicModelSetup = createAtomicModelSetup;
}
})();
