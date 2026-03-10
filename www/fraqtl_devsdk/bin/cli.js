#!/usr/bin/env node
/* Copyright 2023-2025 by Essam Abadir */

/**
 * EGPT FRAQTL DevSDK — CLI Simulation Runner
 *
 * Usage:
 *   npx egpt-fraqtl-devsdk --experiment=<name> --ticks=<number> --out=<filename>
 *   npx egpt-fraqtl-devsdk --help
 *
 * Experiments:
 *   particle_walk      Quantum random walk (wave-particle duality)
 *   wave_interference   Double-slit wave interference
 *   blackbody           Blackbody radiation
 *   oscillator          Harmonic oscillator
 *   atomic_model        Atomic structure formation
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key.startsWith('--')) {
        acc[key.slice(2)] = value === undefined ? true : value;
    }
    return acc;
}, {});

if (args.help || args.h) {
    console.log(`
EGPT FRAQTL DevSDK — Discrete Fractal Physics Engine
=====================================================

Usage:
  egpt-fraqtl-devsdk --experiment=<name> [options]

Experiments:
  particle_walk       Quantum random walk (default)
  wave_interference   Double-slit wave interference
  blackbody           Blackbody radiation
  oscillator          Harmonic oscillator
  atomic_model        Atomic structure formation

Options:
  --experiment=<name>           Experiment to run (default: particle_walk)
  --ticks=<number>              Number of simulation ticks (default: 100)
  --out=<filename>              Output JSON file (default: simulation_data.json)
  --fundamentalDimension=<n>    Dimension n for 2^n x 2^n particles
  --fundamentalWaveLength=<n>   Desired oscillation period
  --help                        Show this help message

Examples:
  egpt-fraqtl-devsdk --experiment=particle_walk --ticks=200
  egpt-fraqtl-devsdk --experiment=wave_interference --ticks=500 --out=wave_data.json
  egpt-fraqtl-devsdk --experiment=blackbody --ticks=100

Core Axioms:
  Time  = 1 tick (discrete, indivisible)
  Space = 1 pixel (discrete, indivisible)
  Mass  = pixel occupancy (leaf quanta count)
  No force calculations. Physics emerges.
`);
    process.exit(0);
}

// Load engine
const { EGPTUniverse, Rectangle } = require('../js/engine/engine.node.js');
require('../js/game/EntropyGameObjects.js');
const { createParticleWalkSetup } = require('../js/simulation/setupParticleWalk.js');
const { createWaveInterferenceSetup } = require('../js/simulation/setupWaveInterference.js');
const { createBlackbodySetup } = require('../js/simulation/setupBlackbody.js');
const { createOscillatorSetup } = require('../js/simulation/setupOscillator.js');
const { createAtomicModelSetup } = require('../js/simulation/setupAtomicModel.js');

const EXPERIMENT = args.experiment || 'particle_walk';
const TICKS = parseInt(args.ticks, 10) || 100;
const OUT_FILE = args.out || 'simulation_data.json';
const FUNDAMENTAL_DIMENSION = args.fundamentalDimension !== undefined ? parseInt(args.fundamentalDimension, 10) : undefined;
const FUNDAMENTAL_WAVELENGTH = args.fundamentalWaveLength !== undefined ? parseInt(args.fundamentalWaveLength, 10) : undefined;
const CANVAS_W = 600;
const CANVAS_H = 600;

console.log(`=== EGPT FRAQTL DevSDK ===`);
console.log(`Experiment: ${EXPERIMENT}`);
console.log(`Ticks: ${TICKS}`);
console.log(`Output: ${OUT_FILE}`);
if ((EXPERIMENT === 'particle_walk' || EXPERIMENT === 'wave_interference') && (FUNDAMENTAL_DIMENSION !== undefined || FUNDAMENTAL_WAVELENGTH !== undefined)) {
    console.log(`Config: fundamentalDimension=${FUNDAMENTAL_DIMENSION ?? 'default'}, fundamentalWaveLength=${FUNDAMENTAL_WAVELENGTH ?? 'default'}`);
}

// Setup universe
const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);
const context = { universe, canvas_rect: rect };

let setupResult;
try {
    switch (EXPERIMENT) {
        case 'particle_walk': {
            const opts = { velocity: 1000 };
            if (FUNDAMENTAL_DIMENSION !== undefined) opts.fundamentalDimension = FUNDAMENTAL_DIMENSION;
            if (FUNDAMENTAL_WAVELENGTH !== undefined) opts.fundamentalWaveLength = FUNDAMENTAL_WAVELENGTH;
            setupResult = createParticleWalkSetup(context, opts);
            if (FUNDAMENTAL_WAVELENGTH !== undefined && setupResult.realizedWaveLength !== FUNDAMENTAL_WAVELENGTH) {
                console.log(`Note: requested wavelength ${FUNDAMENTAL_WAVELENGTH} realized as ${setupResult.realizedWaveLength}`);
            }
            break;
        }
        case 'wave_interference': {
            const opts = { velocity: 50000 };
            if (FUNDAMENTAL_DIMENSION !== undefined) opts.fundamentalDimension = FUNDAMENTAL_DIMENSION;
            if (FUNDAMENTAL_WAVELENGTH !== undefined) opts.fundamentalWaveLength = FUNDAMENTAL_WAVELENGTH;
            setupResult = createWaveInterferenceSetup(context, opts);
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
            console.error('Available: particle_walk, wave_interference, blackbody, oscillator, atomic_model');
            process.exit(1);
    }
} catch (e) {
    console.error("Setup failed:", e);
    process.exit(1);
}

// Run simulation and collect data
const data = {
    experiment: EXPERIMENT,
    ticks: TICKS,
    frames: []
};

console.log('\nRunning simulation...');
const startTime = Date.now();

for (let t = 0; t < TICKS; t++) {
    universe.doTick();

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
