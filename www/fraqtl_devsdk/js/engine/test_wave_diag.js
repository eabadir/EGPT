/**
 * Diagnostic: Wave Interference quadrant asymmetry investigation.
 *
 * Emits ONE burst of particles from a single PointSource, runs N ticks,
 * then reports per-quadrant statistics (radius, alive count, collisions).
 * Also tracks whether collision paths are being triggered.
 */
const { EGPTUniverse, Rectangle } = require("./engine.node.js");
require("../game/EntropyGameObjects.js");
const { createWaveInterferenceSetup } = require("../simulation/setupWaveInterference.js");

const CANVAS_W = 600;
const CANVAS_H = 600;
const TOTAL_TICKS = 100;

function runDiag() {
    console.log("=== Wave Interference Quadrant Diagnostic ===\n");

    const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
    const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);

    const setup = createWaveInterferenceSetup(
        { universe, canvas_rect: rect },
        { fundamentalDimension: 0, fundamentalWaveLength: 8, velocity: 50000 }
    );

    // Disable continuous emission — fire ONE burst only
    const ps1 = setup.pointSource1;
    universe.experimentTickFunctions = [];

    // Fire one burst from source 1 only
    const cohort = ps1.fire(ps1.w / 2);
    universe.addFundamentalFrames(cohort);

    const srcX = ps1.rect.x;
    const srcY = ps1.rect.y;

    console.log(`Source center: (${srcX}, ${srcY})`);
    console.log(`Canvas: ${CANVAS_W}x${CANVAS_H}`);
    console.log(`Cohort size: ${cohort.length}`);
    console.log(`emergentPhysics: ${universe.emergentPhysics}`);
    console.log(`withInterQuantumCollisions: ${universe.withInterQuantumCollisions}`);
    console.log(`Dimensions: [${universe.dimensions.keys().join(', ')}]`);

    // Tag each particle with its emission angle for tracking
    for (let p of cohort) {
        p._emitAngle = Math.atan2(p.vy, p.vx);
        p._initVx = p.vx;
        p._initVy = p.vy;
    }

    // Track collisions per tick
    let totalCollisions = 0;
    let ticksWithCollisions = 0;

    // Instrument Dimension.update to count collisions
    const origUpdate = global.Dimension.prototype.update;
    global.Dimension.prototype.update = function(t, largeObjects) {
        const result = origUpdate.call(this, t, largeObjects);
        // Count frames that got .other set (collision detected)
        const collided = this.frames.filter(f => f.other);
        if (collided.length > 0) {
            totalCollisions += collided.length;
            ticksWithCollisions++;
            if (t <= 5 || t % 20 === 0) {
                console.log(`  [tick ${t}] dim=${this.layer}: ${collided.length} collisions detected, ${this.frames.length} frames`);
            }
        }
        return result;
    };

    // Run simulation
    for (let t = 0; t < TOTAL_TICKS; t++) {
        universe.doTick();
    }

    // Restore
    global.Dimension.prototype.update = origUpdate;

    // Analyze per-quadrant
    const quadrants = { NE: [], NW: [], SE: [], SW: [] };
    const dead = { NE: 0, NW: 0, SE: 0, SW: 0 };

    for (let p of cohort) {
        const angle = p._emitAngle;
        let q;
        if (angle >= 0 && angle < Math.PI / 2) q = 'SE';       // screen coords: +x, +y = SE
        else if (angle >= Math.PI / 2) q = 'SW';                // -x, +y = SW
        else if (angle >= -Math.PI / 2 && angle < 0) q = 'NE';  // +x, -y = NE
        else q = 'NW';                                           // -x, -y = NW

        if (!p.is_alive) {
            dead[q]++;
            continue;
        }

        const dx = p.rect.x - srcX;
        const dy = p.rect.y - srcY;
        const radius = Math.sqrt(dx * dx + dy * dy);
        quadrants[q].push({
            radius,
            vx: p.vx,
            vy: p.vy,
            hasParent: !!p.parent,
            emitAngleDeg: (angle * 180 / Math.PI).toFixed(1)
        });
    }

    console.log(`\n=== After ${TOTAL_TICKS} ticks ===`);
    console.log(`Total collisions detected: ${totalCollisions}`);
    console.log(`Ticks with collisions: ${ticksWithCollisions}`);
    console.log(`Dimensions at end: [${universe.dimensions.keys().join(', ')}]`);

    for (let dimKey of universe.dimensions.keys()) {
        const dim = universe.dimensions.get(dimKey);
        console.log(`  dim ${dimKey}: ${dim.frames.length} frames`);
    }

    console.log(`\n=== Per-Quadrant Analysis ===`);
    for (let [qName, particles] of Object.entries(quadrants)) {
        const radii = particles.map(p => p.radius);
        const parented = particles.filter(p => p.hasParent).length;
        const meanR = radii.length > 0 ? radii.reduce((a, b) => a + b, 0) / radii.length : 0;
        const maxR = radii.length > 0 ? Math.max(...radii) : 0;
        const minR = radii.length > 0 ? Math.min(...radii) : 0;
        console.log(`  ${qName}: alive=${particles.length} dead=${dead[qName]} meanR=${meanR.toFixed(2)} minR=${minR.toFixed(2)} maxR=${maxR.toFixed(2)} parented=${parented}`);
    }

    // Check for outlier particles (radius > expected ~= emission_radius + TOTAL_TICKS * 1px/tick)
    const expectedMaxRadius = 16 + TOTAL_TICKS * 1.5; // generous bound
    console.log(`\n=== Outliers (radius > ${expectedMaxRadius.toFixed(0)}) ===`);
    let outlierCount = 0;
    for (let [qName, particles] of Object.entries(quadrants)) {
        for (let p of particles) {
            if (p.radius > expectedMaxRadius) {
                outlierCount++;
                if (outlierCount <= 20) {
                    console.log(`  ${qName} angle=${p.emitAngleDeg}° r=${p.radius.toFixed(2)} vx=${p.vx.toFixed(2)} vy=${p.vy.toFixed(2)} parented=${p.hasParent}`);
                }
            }
        }
    }
    console.log(`Total outliers: ${outlierCount}`);

    // Sample: dump first 5 particles from each quadrant with their velocity
    console.log(`\n=== Sample velocities (5 per quadrant) ===`);
    for (let [qName, particles] of Object.entries(quadrants)) {
        const sample = particles.slice(0, 5);
        for (let p of sample) {
            const vmag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            console.log(`  ${qName} angle=${p.emitAngleDeg}° r=${p.radius.toFixed(2)} |v|=${vmag.toFixed(2)} vx=${p.vx.toFixed(4)} vy=${p.vy.toFixed(4)}`);
        }
    }
}

runDiag();
