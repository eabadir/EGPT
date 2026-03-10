/**
 * Burst-on-tick-0 diagnostic for devsdk particle-walk polarization.
 *
 * Goal:
 * - mimic the core particle-walk setup as closely as possible
 * - emit one cohort only at tick 0
 * - inspect whether the cohort mean y-motion follows the expected wave schedule
 * - expose mismatches in effective wavelength / phase / polarization
 *
 * Usage:
 *   node egpt_devsdk/js/engine/test_wave_period.js
 *   EGPT_TEST_DIM=3 EGPT_TEST_WL=24 node egpt_devsdk/js/engine/test_wave_period.js
 *   EGPT_TEST_DIM=3 EGPT_TEST_WL=64 node egpt_devsdk/js/engine/test_wave_period.js
 */
const { EGPTUniverse, Rectangle, Charge } = require("./engine.node.js");
require("../game/EntropyGameObjects.js");
const { createParticleWalkSetup } = require("../simulation/setupParticleWalk.js");

const CANVAS_W = 600;
const CANVAS_H = 600;

const fundamentalDimension = parseInt(process.env.EGPT_TEST_DIM, 10);
const fundamentalWaveLength = parseInt(process.env.EGPT_TEST_WL, 10);
const useEnvOverrides = !isNaN(fundamentalDimension) && !isNaN(fundamentalWaveLength);

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function signOfDelta(a, b, epsilon = 1e-9) {
  const d = b - a;
  if (d > epsilon) return 1;
  if (d < -epsilon) return -1;
  return 0;
}

function runTest() {
  console.log("=== Particle Walk Wave Period Diagnostic ===\n");

  const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
  const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);

  const cohortSize = 128;
  const fixedCharge = Charge.NEGATIVE;

  const setupOptions = {
    fundamentalDimension: useEnvOverrides ? fundamentalDimension : 0,
    fundamentalWaveLength: useEnvOverrides ? fundamentalWaveLength : 64,
    velocity: 1
  };
  const setup = createParticleWalkSetup(
    { universe, canvas_rect: rect },
    setupOptions
  );

  const quantumEmitter = setup.quantum_emitter;
  quantumEmitter.auto_fire = false;
  universe.experimentTickFunctions = [];

  const sourceRect = quantumEmitter.source_rects[1] || quantumEmitter.source_rects[0] || quantumEmitter.source_rect;
  const cohort = quantumEmitter.fire(sourceRect, cohortSize);
  for (const p of cohort) {
    p.charge = fixedCharge;
  }
  universe.addFundamentalFrames(cohort);

  const sample = cohort[0];
  const expectedCorePeriod = setup.realizedWaveLength;
  const actualDevsdkPeriod = sample.wavelength;

  console.log("Setup");
  console.log(`  fundamentalDimension: ${setupOptions.fundamentalDimension}`);
  console.log(`  fundamentalWaveLength (requested): ${setupOptions.fundamentalWaveLength}`);
  console.log(`  realizedWaveLength: ${setup.realizedWaveLength}`);
  console.log(`  cohort size: ${cohortSize}`);
  console.log(`  initial vx/vy: (${sample.vx}, ${sample.vy})`);
  console.log(`  charge: ${fixedCharge} (${fixedCharge === Charge.NEGATIVE ? "NEGATIVE" : "POSITIVE"})`);
  console.log(`  actual devsdk particle.wavelength: ${actualDevsdkPeriod}`);
  console.log(`  initial p_up: ${sample.p_up}`);
  console.log(`  initial spin: ${sample.spin}`);

  const totalTicks = expectedCorePeriod * 2;
  const meanYHistory = [];
  const meanVyHistory = [];
  const phaseHistory = [];

  for (let t = 0; t < totalTicks; t++) {
    const alive = cohort.filter(p => p.is_alive);
    const ys = alive.map(p => p.rect.y);
    const vys = alive.map(p => p.vy);
    meanYHistory.push(average(ys));
    meanVyHistory.push(average(vys));
    phaseHistory.push({
      tick: t,
      local_time: cohort[0].local_time,
      wavelength: cohort[0].wavelength,
      spin: cohort[0].spin,
      p_up: cohort[0].p_up
    });
    universe.doTick();
  }

  const q = expectedCorePeriod / 4;
  const quarterMeans = [
    average(meanYHistory.slice(0, q)),
    average(meanYHistory.slice(q, 2 * q)),
    average(meanYHistory.slice(2 * q, 3 * q)),
    average(meanYHistory.slice(3 * q, 4 * q))
  ];

  const quarterTrends = [
    signOfDelta(quarterMeans[0], quarterMeans[1]),
    signOfDelta(quarterMeans[1], quarterMeans[2]),
    signOfDelta(quarterMeans[2], quarterMeans[3])
  ];

  console.log("\nObserved Cohort Mean Y");
  console.log(`  quarter means (period ${expectedCorePeriod}): ${quarterMeans.map(v => v.toFixed(4)).join(", ")}`);
  console.log(`  quarter-to-quarter trend signs: ${quarterTrends.join(", ")}`);

  console.log("\nObserved Mean Vy");
  console.log(`  first 24 ticks: ${meanVyHistory.slice(0, 24).map(v => v.toFixed(4)).join(", ")}`);

  console.log("\nPhase Schedule Sample");
  for (const row of phaseHistory.slice(0, 20)) {
    console.log(
      `  tick=${row.tick} local_time=${row.local_time} wavelength=${row.wavelength} spin=${row.spin} p_up=${row.p_up.toFixed(6)}`
    );
  }

  let passed = 0;
  let failed = 0;
  function assert(cond, msg) {
    if (cond) {
      console.log(`  PASS: ${msg}`);
      passed++;
    } else {
      console.log(`  FAIL: ${msg}`);
      failed++;
    }
  }

  // All particles in the burst should preserve the same charge.
  assert(cohort.every(p => p.charge === fixedCharge), "burst cohort preserves fixed initial charge");

  // Core contract expectation: leaf frames in particle walk effectively oscillate with realized period.
  assert(actualDevsdkPeriod === expectedCorePeriod,
    `effective devsdk wavelength matches realized (${actualDevsdkPeriod} === ${expectedCorePeriod})`);

  // The cohort mean should not stay perfectly flat over the expected period.
  const overallYRange = Math.max(...meanYHistory) - Math.min(...meanYHistory);
  assert(overallYRange > 0.25, `cohort mean y changes over the expected period (range=${overallYRange.toFixed(4)})`);

  // We expect at least one direction reversal within one core period if a wave is present.
  const distinctTrendSigns = new Set(quarterTrends.filter(v => v !== 0));
  assert(distinctTrendSigns.size > 1, "cohort mean y reverses direction within one expected period");

  console.log(`\nSummary: ${passed} passed, ${failed} failed`);
  process.exitCode = failed > 0 ? 1 : 0;
}

runTest();
