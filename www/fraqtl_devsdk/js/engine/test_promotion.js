/**
 * Node.js test for frame promotion (structure building).
 * Exercises the Blackbody scenario: emergentPhysics=false, dims 0 and 1,
 * leaf frames injected at overlapping positions, promotion should create parent frames.
 */
const { EGPTUniverse, Frame, Rectangle } = require('./engine.node.js');

const CANVAS_W = 100;
const CANVAS_H = 100;

function createUniverse() {
    let rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
    // Ground-up mode: withInterQuantumCollisions=true, emergentPhysics=false
    let universe = new EGPTUniverse(60, 1, true, false, true, 0, 0.1, rect, 1, 0);
    universe.init(rect, 0, 1, false, false, false, true, false);
    universe.addDimension(1);
    return universe;
}

function injectOverlappingLeaves(universe, count, clusterX, clusterY) {
    let frames = [];
    for (let i = 0; i < count; i++) {
        let x = clusterX + Math.floor(Math.random() * 2);
        let y = clusterY + Math.floor(Math.random() * 2);
        let leaf = Frame.makeLeafFrame(x, y, 0, 1, 0, 0, true, null, universe.universe_rect, null, false);
        frames.push(leaf);
    }
    universe.addFundamentalFrames(frames);
    return frames;
}

function runTest() {
    console.log('=== Promotion Test: Blackbody scenario (emergentPhysics=false) ===\n');

    let universe = createUniverse();
    let dimKeys = universe.dimensions.keys();
    console.log(`Dimensions: [${dimKeys.join(', ')}]`);
    console.log(`emergentPhysics: ${universe.emergentPhysics}`);

    // Inject clusters of overlapping leaves
    injectOverlappingLeaves(universe, 20, 10, 10);
    injectOverlappingLeaves(universe, 20, 50, 50);
    injectOverlappingLeaves(universe, 20, 30, 30);

    let dim0 = universe.dimensions.get(0);
    let dim1 = universe.dimensions.get(1);
    console.log(`\nBefore ticks: dim0.frames=${dim0.frames.length}, dim1.frames=${dim1.frames.length}`);

    let promotionCount = 0;
    for (let t = 0; t < 120; t++) {
        let tickData = universe.doTick();

        let dim1Now = universe.dimensions.get(1);
        if (dim1Now && dim1Now.frames.length > 0 && promotionCount === 0) {
            promotionCount = dim1Now.frames.length;
            console.log(`\n[tick ${universe.tick}] First promotions detected! dim1.frames = ${dim1Now.frames.length}`);
        }

        // Re-inject some leaves every 10 ticks to keep density up
        if (t % 10 === 0 && t > 0) {
            injectOverlappingLeaves(universe, 10, 10 + Math.floor(Math.random() * 5), 10 + Math.floor(Math.random() * 5));
        }
    }

    dim0 = universe.dimensions.get(0);
    dim1 = universe.dimensions.get(1);
    console.log(`\nAfter 120 ticks:`);
    console.log(`  dim0.frames = ${dim0.frames.length}`);
    console.log(`  dim1.frames = ${dim1 ? dim1.frames.length : 'N/A'}`);

    let lastTick = universe.doTick();
    console.log(`\nTickData sample (tick ${lastTick.universeData.tick}):`);
    console.log(`  universeData.dimensionCount = ${lastTick.universeData.dimensionCount}`);
    console.log(`  dimensionData.length = ${lastTick.dimensionData.length}`);
    console.log(`  frameData.length = ${lastTick.frameData.length}`);

    if (lastTick.frameData.length > 0) {
        let sample = lastTick.frameData[0];
        console.log(`  sample frameData: id=${sample.id} layer=${sample.layer} fullness=${sample.fullness.toFixed(3)} mass=${sample.mass} alive=${sample.isAlive}`);
    }

    // Assertions
    let passed = 0;
    let failed = 0;

    function assert(condition, msg) {
        if (condition) {
            console.log(`  PASS: ${msg}`);
            passed++;
        } else {
            console.log(`  FAIL: ${msg}`);
            failed++;
        }
    }

    console.log('\n=== Assertions ===');
    assert(dim0.frames.length > 0, 'dim0 has frames');
    assert(dim1 && dim1.frames.length > 0, 'dim1 has frames (promotion occurred)');
    assert(lastTick.frameData.length > 0, 'TickData contains frame data');
    assert(lastTick.dimensionData.length === 2, 'TickData has 2 dimension entries');
    assert(lastTick.frameData.every(fd => typeof fd.fullness === 'number'), 'All FrameData have numeric fullness');
    assert(lastTick.frameData.every(fd => fd.rect && typeof fd.rect.x === 'number'), 'All FrameData have valid rect');

    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
}

runTest();
