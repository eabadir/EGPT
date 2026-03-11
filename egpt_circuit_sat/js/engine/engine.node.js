/* Copyright 2023-2025 by Essam Abadir */

/**
 * Node.js entry point for the EGPT engine.
 * Sets up global references that the engine expects from browser script-tag loading.
 * No P5.js or chroma dependencies required.
 */
const { Rectangle, Circle, QuadTree, CapacityError } = require('./quadtree.js');

global.Rectangle = Rectangle;
global.Circle = Circle;
global.QuadTree = QuadTree;
global.CapacityError = CapacityError;

const engine = require('./EGPTfraqtl.js');

// Set globals for EntropyGameObjects and other modules that expect browser-style globals
global.Frame = engine.Frame;
global.Dimension = engine.Dimension;
global.Charge = engine.Charge;
global.LightColor = engine.LightColor;
global.EGPTUniverse = engine.EGPTUniverse;

// Polyfill random for Node (P5 provides this in browser)
if (typeof random === 'undefined') {
    global.random = function (a, b) {
        if (b === undefined) return (a === undefined ? Math.random() : Math.random() * a);
        return a + Math.random() * (b - a);
    };
    global.radians = function(deg) { return deg * Math.PI / 180; };
    global.cos = Math.cos;
    global.sin = Math.sin;
}

module.exports = {
    ...engine,
    Rectangle,
    Circle,
    QuadTree,
    CapacityError
};
