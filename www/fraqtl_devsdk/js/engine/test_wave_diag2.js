/**
 * Diagnostic 2: Isolate the collision effect.
 * Test A: Single particle per angle, widely spaced — should have NO collisions.
 * Test B: Compare radius after N ticks with and without the collision code path.
 */
const { EGPTUniverse, Rectangle, Frame, Charge } = require("./engine.node.js");

const CANVAS_W = 600;
const CANVAS_H = 600;
const TOTAL_TICKS = 100;

function testA_singleParticlePerAngle() {
    console.log("=== TEST A: Single particle per angle (no collisions expected) ===\n");

    const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
    const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);
    universe.init(rect, 0, 2, false, false, false, true, false);
    universe.wavelengthConstant = 8;

    const srcX = 300, srcY = 300;
    const emitRadius = 16;
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    const particles = [];

    for (let deg of angles) {
        const rad = deg * Math.PI / 180;
        const px = srcX + emitRadius * Math.cos(rad);
        const py = srcY + emitRadius * Math.sin(rad);
        const vx = emitRadius * Math.cos(rad);
        const vy = emitRadius * Math.sin(rad);
        const p = Frame.makeLeafFrame(px, py, 0, 8, vx, vy, false, Charge.POSITIVE, rect, null, false);
        particles.push({ frame: p, angleDeg: deg, initR: emitRadius });
    }

    universe.addFundamentalFrames(particles.map(p => p.frame));

    for (let t = 0; t < TOTAL_TICKS; t++) {
        universe.doTick();
    }

    console.log("After 100 ticks:");
    for (let p of particles) {
        const f = p.frame;
        const dx = f.rect.x - srcX;
        const dy = f.rect.y - srcY;
        const r = Math.sqrt(dx * dx + dy * dy);
        const vmag = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
        console.log(`  ${p.angleDeg}°: alive=${f.is_alive} r=${r.toFixed(2)} |v|=${vmag.toFixed(2)} vx=${f.vx.toFixed(2)} vy=${f.vy.toFixed(2)} parent=${!!f.parent} dx=${f.dx.toFixed(4)} dy=${f.dy.toFixed(4)}`);
    }
    console.log(`  Dimensions: [${universe.dimensions.keys().join(', ')}]`);
    const dim0 = universe.dimensions.get(0);
    console.log(`  dim0 frames: ${dim0.frames.length}`);
}

function testB_measureDxDy() {
    console.log("\n=== TEST B: Measure actual dx/dy per tick for 8 angles ===\n");

    const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
    const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);
    universe.init(rect, 0, 2, false, false, false, true, false);
    universe.wavelengthConstant = 8;

    const srcX = 300, srcY = 300;
    const emitRadius = 16;
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    const particles = [];

    for (let deg of angles) {
        const rad = deg * Math.PI / 180;
        const px = srcX + emitRadius * Math.cos(rad);
        const py = srcY + emitRadius * Math.sin(rad);
        const vx = emitRadius * Math.cos(rad);
        const vy = emitRadius * Math.sin(rad);
        const p = Frame.makeLeafFrame(px, py, 0, 8, vx, vy, false, Charge.POSITIVE, rect, null, false);
        particles.push({ frame: p, angleDeg: deg, dxSum: 0, dySum: 0, dxSqSum: 0, dySqSum: 0 });
    }

    universe.addFundamentalFrames(particles.map(p => p.frame));

    // Track dx/dy each tick
    for (let t = 0; t < TOTAL_TICKS; t++) {
        // Record positions before tick
        const beforePos = particles.map(p => ({ x: p.frame.rect.x, y: p.frame.rect.y }));

        universe.doTick();

        // Measure actual displacement
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const actual_dx = p.frame.rect.x - beforePos[i].x;
            const actual_dy = p.frame.rect.y - beforePos[i].y;
            p.dxSum += actual_dx;
            p.dySum += actual_dy;
            p.dxSqSum += actual_dx * actual_dx;
            p.dySqSum += actual_dy * actual_dy;

            // Print first 3 ticks
            if (t < 3) {
                const mag = Math.sqrt(actual_dx * actual_dx + actual_dy * actual_dy);
                if (i === 0 || i === 3 || i === 5) { // 0°, 135°, 225°
                    console.log(`  tick ${t+1} ${p.angleDeg}°: dx=${actual_dx.toFixed(4)} dy=${actual_dy.toFixed(4)} |d|=${mag.toFixed(4)}`);
                }
            }
        }
    }

    console.log(`\nAfter ${TOTAL_TICKS} ticks — cumulative displacement:`);
    for (let p of particles) {
        const totalDisp = Math.sqrt(p.dxSum * p.dxSum + p.dySum * p.dySum);
        const meanStepMag = Math.sqrt(p.dxSqSum + p.dySqSum) / Math.sqrt(TOTAL_TICKS); // RMS step size
        const f = p.frame;
        const r = Math.sqrt((f.rect.x - 300) ** 2 + (f.rect.y - 300) ** 2);
        console.log(`  ${p.angleDeg}°: totalDisp=${totalDisp.toFixed(2)} r=${r.toFixed(2)} avgStep=${(totalDisp/TOTAL_TICKS).toFixed(4)} alive=${f.is_alive}`);
    }
}

testA_singleParticlePerAngle();
testB_measureDxDy();
