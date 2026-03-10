/**
 * Diagnostic 3: Isolate WHY outliers persist after collision gate fix.
 * Compare: with LargeObjects vs without. Track frame count growth.
 */
const { EGPTUniverse, Rectangle, Frame, Charge } = require("./engine.node.js");

const CANVAS_W = 600;
const CANVAS_H = 600;
const TOTAL_TICKS = 100;

function runScenario(label, useLargeObjects) {
    console.log(`\n=== ${label} ===`);

    const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
    const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);
    universe.init(rect, 0, 2, false, false, false, true, false);
    universe.wavelengthConstant = 8;

    const srcX = 300, srcY = 300; // Centered this time
    const emitRadius = 16;
    const angleIncrement = 2;
    const particles = [];

    for (let deg = 0; deg < 360; deg += angleIncrement) {
        const rad = deg * Math.PI / 180;
        const px = srcX + emitRadius * Math.cos(rad);
        const py = srcY + emitRadius * Math.sin(rad);
        const vx = emitRadius * Math.cos(rad);
        const vy = emitRadius * Math.sin(rad);
        const p = Frame.makeLeafFrame(px, py, 0, 8, vx, vy, false, Charge.POSITIVE, rect, null, false);
        p._emitAngleDeg = deg;
        particles.push(p);
    }

    universe.addFundamentalFrames(particles);

    if (useLargeObjects) {
        // Add source circles like the real experiment
        const LargeObject = require('../game/EntropyGameObjects.js').LargeObject;
        const CollisionTypes = require('../game/EntropyGameObjects.js').CollisionTypes;
        const srcRect = new Rectangle(srcX - emitRadius, srcY - emitRadius, emitRadius * 2, emitRadius * 2, null, false);
        const srcCircle = new LargeObject({ universe, canvas_rect: rect }, [0, 0, 0], srcRect, CollisionTypes.NONE, [], 'src');
        srcCircle.drawAsCircle = true;
        universe.addLargeObject(srcCircle);
    }

    console.log(`  particles: ${particles.length}, centered: (${srcX},${srcY}), LargeObjects: ${useLargeObjects}`);
    console.log(`  withInterQuantumCollisions: ${universe.withInterQuantumCollisions}`);

    let dim0 = universe.dimensions.get(0);
    const frameCounts = [];

    for (let t = 0; t < TOTAL_TICKS; t++) {
        universe.doTick();
        dim0 = universe.dimensions.get(0);
        if (t < 5 || t === 19 || t === 49 || t === 99) {
            frameCounts.push({ tick: t + 1, count: dim0.frames.length, alive: dim0.frames.filter(f => f.is_alive).length });
        }
    }

    console.log(`  Frame counts:`, frameCounts.map(f => `tick${f.tick}:${f.count}(alive:${f.alive})`).join(' '));

    // Per-quadrant radius
    const quadrants = { NE: [], NW: [], SE: [], SW: [] };
    for (let p of particles) {
        if (!p.is_alive) continue;
        const dx = p.rect.x - srcX;
        const dy = p.rect.y - srcY;
        const r = Math.sqrt(dx * dx + dy * dy);
        const angle = p._emitAngleDeg;
        const q = (angle >= 0 && angle < 90) ? 'SE' : (angle >= 90 && angle < 180) ? 'SW' : (angle >= 180 && angle < 270) ? 'NW' : 'NE';
        quadrants[q].push(r);
    }

    for (let [qName, radii] of Object.entries(quadrants)) {
        if (radii.length === 0) { console.log(`  ${qName}: no alive`); continue; }
        const mean = radii.reduce((a, b) => a + b, 0) / radii.length;
        const max = Math.max(...radii);
        const min = Math.min(...radii);
        console.log(`  ${qName}: n=${radii.length} mean=${mean.toFixed(1)} min=${min.toFixed(1)} max=${max.toFixed(1)}`);
    }
}

runScenario("WITHOUT LargeObjects, centered source", false);
runScenario("WITH LargeObjects, centered source", true);
