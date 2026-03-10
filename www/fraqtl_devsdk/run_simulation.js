/* Copyright 2023-2025 by Essam Abadir */

/**
 * Node.js Simulation Runner for EGPT experiments.
 *
 * Usage:
 *   node egpt_devsdk/run_simulation.js --experiment=<name> --ticks=<number> --out=<filename>
 *   node egpt_devsdk/run_simulation.js --experiment=particle_walk --fundamentalDimension=3 --fundamentalWaveLength=24
 *
 * Options:
 *   --experiment: particle_walk, wave_interference, blackbody, oscillator, atomic_model (default: particle_walk)
 *   --ticks: Number of ticks to run (default: 100)
 *   --out: Output filename for JSON data (default: simulation_data.json)
 *   --fundamentalDimension: Particle walk / wave_interference. Dimension n for 2^n x 2^n particles (default: 0)
 *   --fundamentalWaveLength: Particle walk (default 64) / wave_interference (default 8). Desired oscillation period
 */

const fs = require('fs');
const { EGPTUniverse, Rectangle } = require('./js/engine/engine.node.js');
require('./js/game/EntropyGameObjects.js');
const { createParticleWalkSetup } = require('./js/simulation/setupParticleWalk.js');
const { createWaveInterferenceSetup } = require('./js/simulation/setupWaveInterference.js');
const { createBlackbodySetup } = require('./js/simulation/setupBlackbody.js');
const { createOscillatorSetup } = require('./js/simulation/setupOscillator.js');
const { createAtomicModelSetup } = require('./js/simulation/setupAtomicModel.js');

// Parse arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key.startsWith('--')) {
        acc[key.slice(2)] = value;
    }
    return acc;
}, {});

const EXPERIMENT = args.experiment || 'particle_walk';
const TICKS = parseInt(args.ticks, 10) || 100;
const OUT_FILE = args.out || 'simulation_data.json';
const FUNDAMENTAL_DIMENSION = args.fundamentalDimension !== undefined ? parseInt(args.fundamentalDimension, 10) : undefined;
const FUNDAMENTAL_WAVELENGTH = args.fundamentalWaveLength !== undefined ? parseInt(args.fundamentalWaveLength, 10) : undefined;
const CANVAS_W = 600;
const CANVAS_H = 600;

console.log(`=== EGPT Simulation Runner ===`);
console.log(`Experiment: ${EXPERIMENT}`);
console.log(`Ticks: ${TICKS}`);
console.log(`Output: ${OUT_FILE}`);
if ((EXPERIMENT === 'particle_walk' || EXPERIMENT === 'wave_interference') && (FUNDAMENTAL_DIMENSION !== undefined || FUNDAMENTAL_WAVELENGTH !== undefined)) {
    console.log(`${EXPERIMENT} config: fundamentalDimension=${FUNDAMENTAL_DIMENSION ?? 'default'}, fundamentalWaveLength=${FUNDAMENTAL_WAVELENGTH ?? 'default'}`);
}

// Setup
const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);
const context = { universe, canvas_rect: rect };

let setupResult;
try {
    switch (EXPERIMENT) {
        case 'particle_walk': {
            const particleWalkOptions = { velocity: 1000 };
            if (FUNDAMENTAL_DIMENSION !== undefined) particleWalkOptions.fundamentalDimension = FUNDAMENTAL_DIMENSION;
            if (FUNDAMENTAL_WAVELENGTH !== undefined) particleWalkOptions.fundamentalWaveLength = FUNDAMENTAL_WAVELENGTH;
            setupResult = createParticleWalkSetup(context, particleWalkOptions);
            if (FUNDAMENTAL_WAVELENGTH !== undefined && setupResult.realizedWaveLength !== FUNDAMENTAL_WAVELENGTH) {
                console.log(`Note: requested wavelength ${FUNDAMENTAL_WAVELENGTH} realized as ${setupResult.realizedWaveLength}`);
            }
            break;
        }
        case 'wave_interference': {
            const waveInterferenceOptions = { velocity: 50000 };
            if (FUNDAMENTAL_DIMENSION !== undefined) waveInterferenceOptions.fundamentalDimension = FUNDAMENTAL_DIMENSION;
            if (FUNDAMENTAL_WAVELENGTH !== undefined) waveInterferenceOptions.fundamentalWaveLength = FUNDAMENTAL_WAVELENGTH;
            setupResult = createWaveInterferenceSetup(context, waveInterferenceOptions);
            if (FUNDAMENTAL_WAVELENGTH !== undefined && setupResult.realizedWaveLength !== FUNDAMENTAL_WAVELENGTH) {
                console.log(`Note: requested wavelength ${FUNDAMENTAL_WAVELENGTH} realized as ${setupResult.realizedWaveLength}`);
            }
            break;
        }
        case 'blackbody':
            setupResult = createBlackbodySetup(context);
            break;
        case 'oscillator':
            setupResult = createOscillatorSetup(context);
            break;
        case 'atomic_model':
            setupResult = createAtomicModelSetup(context);
            break;
        default:
            console.error(`Unknown experiment: ${EXPERIMENT}`);
            process.exit(1);
    }
} catch (e) {
    console.error("Setup failed:", e);
    process.exit(1);
}

// Run loop and collect data
const data = {
    experiment: EXPERIMENT,
    ticks: TICKS,
    frames: []
};

console.log('\nRunning simulation...');
const startTime = Date.now();

for (let t = 0; t < TICKS; t++) {
    universe.doTick();

    // Capture frame data from all dimensions
    const allFrames = [];
    for (const dim of universe.dimensions) {
        for (const f of dim.frames) {
            if (f.is_alive) {
                allFrames.push({
                    id: f.quantum_id,
                    layer: dim.layer,
                    x: f.rect.x,
                    y: f.rect.y,
                    vx: f.vx,
                    vy: f.vy,
                    is_leaf: f.is_leaf,
                    name: f.name || null
                });
            }
        }
    }

    data.frames.push({
        tick: t,
        count: allFrames.length,
        particles: allFrames
    });

    if (t % 10 === 0) process.stdout.write('.');
}

const duration = Date.now() - startTime;
console.log(`\nDone in ${duration}ms.`);

// Save data
fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2));
console.log(`Data saved to ${OUT_FILE}`);
