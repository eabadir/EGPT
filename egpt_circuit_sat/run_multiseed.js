/* Copyright 2023-2025 by Essam Abadir */

/**
 * Multi-seed experiment runner for the EGPT Circuit SAT half-adder.
 * Reproduces the 80-experiment dataset (4 input combos × 20 seeds) from the white paper.
 *
 * Usage:
 *   node run_multiseed.js                          # Full 80-experiment run
 *   node run_multiseed.js --seeds=5 --ticks=1000   # Quick smoke test
 *   node run_multiseed.js --out=results.json        # Custom output file
 *
 * Options:
 *   --seeds          Number of PRNG seeds per combo (default: 20)
 *   --ticks          Simulation ticks per run (default: 3000)
 *   --probeThreshold Density threshold for HIGH classification (default: 20)
 *   --out            Output JSON filename (default: data/multiseed_results.json)
 *   --verbose        Print per-seed results
 */

const fs = require('fs');
const path = require('path');
const { EGPTUniverse, Rectangle } = require('./js/engine/engine.node.js');
require('./js/game/EntropyGameObjects.js');
const { createCircuitSATSetup } = require('./js/simulation/setupCircuitSAT.js');

// Parse CLI arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key.startsWith('--')) {
        acc[key.slice(2)] = value === undefined ? 'true' : value;
    }
    return acc;
}, {});

const NUM_SEEDS = parseInt(args.seeds, 10) || 20;
const TICKS = parseInt(args.ticks, 10) || 3000;
const PROBE_THRESHOLD = parseInt(args.probeThreshold, 10) || 20;
const OUT_FILE = args.out || 'data/multiseed_results.json';
const VERBOSE = args.verbose === 'true' || args.verbose === '';
const CANVAS_W = 600;
const CANVAS_H = 600;

// Half-adder truth table
const COMBOS = [
    { inputA: false, inputB: false, expectedSUM: false, expectedCARRY: false, label: '(0,0)' },
    { inputA: false, inputB: true,  expectedSUM: true,  expectedCARRY: false, label: '(0,1)' },
    { inputA: true,  inputB: false, expectedSUM: true,  expectedCARRY: false, label: '(1,0)' },
    { inputA: true,  inputB: true,  expectedSUM: false, expectedCARRY: true,  label: '(1,1)' },
];

console.log('=== EGPT Circuit SAT: Multi-Seed Half-Adder Experiment ===');
console.log(`Seeds: ${NUM_SEEDS} | Ticks: ${TICKS} | Probe threshold: ${PROBE_THRESHOLD}`);
console.log('');

const allResults = {};
let totalCorrect = 0;
let totalRuns = 0;

for (const combo of COMBOS) {
    const comboResults = [];
    const startTime = Date.now();

    for (let seed = 1; seed <= NUM_SEEDS; seed++) {
        // Create a fresh universe with a specific PRNG seed
        const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
        const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, seed);
        const context = { universe, canvas_rect: rect };

        // Set up the half-adder circuit
        const satSetup = createCircuitSATSetup(context, {
            inputA: combo.inputA,
            inputB: combo.inputB,
        });

        // Run simulation
        for (let t = 0; t < TICKS; t++) {
            universe.doTick();
        }

        // Read final probe state
        const state = satSetup.getCircuitState();
        const sumFlow = state.SUM ? state.SUM.flowRate : 0;
        const carryFlow = state.CARRY ? state.CARRY.flowRate : 0;
        const sumHigh = sumFlow >= PROBE_THRESHOLD;
        const carryHigh = carryFlow >= PROBE_THRESHOLD;
        const correct = (sumHigh === combo.expectedSUM) && (carryHigh === combo.expectedCARRY);

        comboResults.push({
            seed,
            sumFlowRate: Math.round(sumFlow * 100) / 100,
            carryFlowRate: Math.round(carryFlow * 100) / 100,
            sumHigh,
            carryHigh,
            correct,
        });

        totalCorrect += correct ? 1 : 0;
        totalRuns++;

        if (VERBOSE) {
            const mark = correct ? 'OK' : 'FAIL';
            console.log(`  ${combo.label} seed=${seed}: SUM=${sumFlow.toFixed(1)} CARRY=${carryFlow.toFixed(1)} [${mark}]`);
        } else {
            process.stdout.write('.');
        }
    }

    const duration = Date.now() - startTime;
    const correctCount = comboResults.filter(r => r.correct).length;
    const sumFlows = comboResults.map(r => r.sumFlowRate);
    const carryFlows = comboResults.map(r => r.carryFlowRate);

    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = arr => { const m = mean(arr); return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length); };

    const comboKey = `${combo.inputA ? 1 : 0},${combo.inputB ? 1 : 0}`;
    allResults[comboKey] = {
        inputA: combo.inputA,
        inputB: combo.inputB,
        expectedSUM: combo.expectedSUM,
        expectedCARRY: combo.expectedCARRY,
        correct: `${correctCount}/${NUM_SEEDS}`,
        sumFlow: { mean: +mean(sumFlows).toFixed(2), std: +std(sumFlows).toFixed(2), min: Math.min(...sumFlows), max: Math.max(...sumFlows) },
        carryFlow: { mean: +mean(carryFlows).toFixed(2), std: +std(carryFlows).toFixed(2), min: Math.min(...carryFlows), max: Math.max(...carryFlows) },
        seeds: comboResults,
        durationMs: duration,
    };

    if (!VERBOSE) process.stdout.write('\n');
    console.log(`${combo.label}: ${correctCount}/${NUM_SEEDS} correct | SUM=${mean(sumFlows).toFixed(1)}±${std(sumFlows).toFixed(1)} | CARRY=${mean(carryFlows).toFixed(1)}±${std(carryFlows).toFixed(1)} | ${duration}ms`);
}

// Summary
console.log('\n=== Summary ===');
console.log(`Total: ${totalCorrect}/${totalRuns} correct (${(totalCorrect / totalRuns * 100).toFixed(1)}%)`);

// Write output
const output = {
    experiment: 'circuit_sat_half_adder',
    params: {
        seeds: NUM_SEEDS,
        ticks: TICKS,
        probeThreshold: PROBE_THRESHOLD,
        canvasSize: { w: CANVAS_W, h: CANVAS_H },
        voltage: 2,
        emissionRate: 3,
        gateThreshold: 3,
        wallThick: 6,
    },
    totalCorrect: `${totalCorrect}/${totalRuns}`,
    combos: allResults,
    timestamp: new Date().toISOString(),
};

// Ensure output directory exists
const outDir = path.dirname(OUT_FILE);
if (outDir && !fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
console.log(`\nResults saved to ${OUT_FILE}`);
