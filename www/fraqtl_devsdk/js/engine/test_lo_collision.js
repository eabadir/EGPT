/**
 * Diagnostic: Verify particles don't slip through LargeObjects.
 *
 * Scenario: Two particles at the same position heading toward a wall.
 * One gets inserted into the quadtree; the other is rejected (collision).
 * Both should be detected by the wall's LargeObject.collide().
 */
const { EGPTUniverse, Rectangle, Frame, Charge } = require("./engine.node.js");
const { LargeObject, CollisionTypes, CollisionActions } = require('../game/EntropyGameObjects.js');

const CANVAS_W = 100;
const CANVAS_H = 100;

function testSlipThrough() {
    console.log("=== Test: Particles slipping through LargeObject wall ===\n");

    const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
    const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);
    universe.init(rect, 0, 2, false, false, false, true, false);

    // Create a wall at x=50, full height, REFLECT_XY collision
    const wallRect = new Rectangle(48, 0, 4, CANVAS_H, null, false);
    const wall = new LargeObject({ universe, canvas_rect: rect }, [255, 0, 0], wallRect, CollisionTypes.REFLECT_XY, [CollisionActions.BLOCK], 'test_wall');
    universe.addLargeObject(wall);

    // Create two particles at the SAME position, both heading right toward the wall
    const p1 = Frame.makeLeafFrame(40, 50, 0, 8, 8, 0, false, Charge.POSITIVE, rect, null, false);
    const p2 = Frame.makeLeafFrame(40, 50, 0, 8, 8, 0, false, Charge.POSITIVE, rect, null, false);
    p1._label = "p1";
    p2._label = "p2";

    universe.addFundamentalFrames([p1, p2]);

    console.log(`  Wall at x=[${wallRect.left}, ${wallRect.right}]`);
    console.log(`  p1 start: (${p1.rect.x.toFixed(1)}, ${p1.rect.y.toFixed(1)}) vx=${p1.vx}`);
    console.log(`  p2 start: (${p2.rect.x.toFixed(1)}, ${p2.rect.y.toFixed(1)}) vx=${p2.vx}`);

    // Run ticks and track positions
    for (let t = 0; t < 20; t++) {
        universe.doTick();
        if (t < 5 || t === 9 || t === 19) {
            const p1x = p1.rect.x.toFixed(1);
            const p2x = p2.rect.x.toFixed(1);
            const p1alive = p1.is_alive;
            const p2alive = p2.is_alive;
            console.log(`  tick ${t + 1}: p1=(${p1x}) vx=${p1.vx.toFixed(2)} alive=${p1alive} | p2=(${p2x}) vx=${p2.vx.toFixed(2)} alive=${p2alive}`);
        }
    }

    // Check: both particles should have been reflected (vx < 0) or absorbed, NOT passed through
    const p1_past_wall = p1.is_alive && p1.rect.x > wallRect.right;
    const p2_past_wall = p2.is_alive && p2.rect.x > wallRect.right;

    console.log(`\n  p1 past wall: ${p1_past_wall} (x=${p1.rect.x.toFixed(1)})`);
    console.log(`  p2 past wall: ${p2_past_wall} (x=${p2.rect.x.toFixed(1)})`);

    let passed = 0, failed = 0;
    function assert(cond, msg) {
        if (cond) { console.log(`  PASS: ${msg}`); passed++; }
        else { console.log(`  FAIL: ${msg}`); failed++; }
    }

    assert(!p1_past_wall, "p1 did not slip through wall");
    assert(!p2_past_wall, "p2 did not slip through wall");

    console.log(`\n${passed} passed, ${failed} failed`);
    return failed;
}

function testManyParticlesSameSpot() {
    console.log("\n=== Test: Many co-located particles vs absorbing wall ===\n");

    const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
    const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);
    universe.init(rect, 0, 2, false, false, false, true, false);

    // Absorbing wall at x=60
    const wallRect = new Rectangle(58, 0, 4, CANVAS_H, null, false);
    const wall = new LargeObject({ universe, canvas_rect: rect }, [255, 0, 0], wallRect, CollisionTypes.REFLECT_XY, [CollisionActions.ABSORB], 'absorb_wall');
    universe.addLargeObject(wall);

    // 10 particles at same position heading right
    const particles = [];
    for (let i = 0; i < 10; i++) {
        const p = Frame.makeLeafFrame(30, 50, 0, 8, 8, 0, false, Charge.POSITIVE, rect, null, false);
        p._label = `p${i}`;
        particles.push(p);
    }
    universe.addFundamentalFrames(particles);

    console.log(`  ${particles.length} particles at (30, 50) heading right toward absorbing wall at x=58-62`);

    for (let t = 0; t < 40; t++) {
        universe.doTick();
    }

    const alive = particles.filter(p => p.is_alive);
    const pastWall = particles.filter(p => p.is_alive && p.rect.x > wallRect.right);

    console.log(`  After 40 ticks: ${alive.length} alive, ${pastWall.length} past wall`);

    let passed = 0, failed = 0;
    function assert(cond, msg) {
        if (cond) { console.log(`  PASS: ${msg}`); passed++; }
        else { console.log(`  FAIL: ${msg}`); failed++; }
    }

    assert(pastWall.length === 0, `no particles slipped through (${pastWall.length} past wall)`);
    assert(alive.length === 0, `all particles absorbed by wall (${alive.length} still alive)`);

    console.log(`\n${passed} passed, ${failed} failed`);
    return failed;
}

let totalFailed = 0;
totalFailed += testSlipThrough();
totalFailed += testManyParticlesSameSpot();
process.exitCode = totalFailed > 0 ? 1 : 0;
