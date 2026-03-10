/* Copyright 2023-2025 by Essam Abadir */

/**
 * createBlackbodySetup - Shared setup factory for the Blackbody (BouncyBox) simulation.
 * Used by both browser Experiments and Node test_blackbody.js for identical simulation config.
 *
 * @param {Object} context - { universe, canvas_rect } (EntropyGame implements this)
 * @param {Object} options - Optional overrides
 * @param {number} options.fundamental_dim - Default 0
 * @param {number} options.quantum_dim - Default 4
 * @param {number} options.temperature - Default 300
 * @param {number} options.boxFraction - Fraction of canvas for box size (default 1/3)
 */
(function () {
    let BouncyBox, CollisionTypes, CollisionActions, Rectangle;
    if (typeof module !== 'undefined') {
        const objs = require('../game/EntropyGameObjects.js');
        BouncyBox = objs.BouncyBox;
        CollisionTypes = objs.CollisionTypes;
        CollisionActions = objs.CollisionActions;
        Rectangle = require('../engine/engine.node.js').Rectangle;
    } else {
        BouncyBox = window.BouncyBox;
        CollisionTypes = window.CollisionTypes;
        CollisionActions = window.CollisionActions;
        Rectangle = window.Rectangle;
    }

function createBlackbodySetup(context, options = {}) {
    const { canvas_rect, universe } = context;
    const fundamental_dim = options.fundamental_dim !== undefined ? options.fundamental_dim : 0;
    const quantum_dim = options.quantum_dim !== undefined ? options.quantum_dim : 4;
    const temperature = options.temperature !== undefined ? options.temperature : 300;
    const boxFraction = options.boxFraction !== undefined ? options.boxFraction : 1 / 3;

    const wallColor = [120, 120, 120];
    const wallThickness = 10;
    const slitHeight = 60;
    const wallCollisionType = CollisionTypes.BOUNCE;
    const wallCollisionActions = [CollisionActions.RECOLOR, CollisionActions.BOUNCE];
    const num_bouncing_balls = 1;

    const screenCenterX = Math.round(canvas_rect.w / 2);
    const screenCenterY = Math.round(canvas_rect.h / 2);
    const boxW = Math.round(canvas_rect.w * boxFraction);
    const boxH = Math.round(canvas_rect.h * boxFraction);
    const boxRect = new Rectangle(screenCenterX, screenCenterY, boxW, boxH, null, true);

    const bouncyBox = new BouncyBox(context, boxRect, wallColor, wallThickness, slitHeight, wallCollisionType, wallCollisionActions, num_bouncing_balls, fundamental_dim, quantum_dim);

    bouncyBox.temperatureDial.setTemperature(temperature);

    return { universe, bouncyBox, temperatureDial: bouncyBox.temperatureDial };
}

if (typeof module !== 'undefined') {
    module.exports = { createBlackbodySetup };
} else {
    window.createBlackbodySetup = createBlackbodySetup;
}
})();
