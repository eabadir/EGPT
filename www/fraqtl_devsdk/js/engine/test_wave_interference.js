/**
 * Diagnostic for devsdk wave interference: wavelength 8, circular emission.
 *
 * Goal:
 * - Use fundamentalDimension=0, fundamentalWaveLength=8
 * - Single PointSource burst at tick 0
 * - Verify particle.wavelength === 8
 * - Verify particles spread in a circular pattern (angular distribution)
 *
 * Usage:
 *   node egpt_devsdk/js/engine/test_wave_interference.js
 *   EGPT_TEST_DIM=0 EGPT_TEST_WL=8 node egpt_devsdk/js/engine/test_wave_interference.js
 */
const { EGPTUniverse, Rectangle } = require("./engine.node.js");
require("../game/EntropyGameObjects.js");
const { createWaveInterferenceSetup } = require("../simulation/setupWaveInterference.js");

const CANVAS_W = 600;
const CANVAS_H = 600;

const fundamentalDimension = parseInt(process.env.EGPT_TEST_DIM, 10);
const fundamentalWaveLength = parseInt(process.env.EGPT_TEST_WL, 10);
const useEnvOverrides = !isNaN(fundamentalDimension) && !isNaN(fundamentalWaveLength);

function runTest() {
  console.log("=== Wave Interference Diagnostic ===\n");

  const rect = new Rectangle(0, 0, CANVAS_W, CANVAS_H, null, false);
  const universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, rect, 1, 0);

  const setupOptions = {
    fundamentalDimension: useEnvOverrides ? fundamentalDimension : 0,
    fundamentalWaveLength: useEnvOverrides ? fundamentalWaveLength : 8,
    velocity: 50000
  };
  const setup = createWaveInterferenceSetup(
    { universe, canvas_rect: rect },
    setupOptions
  );

  const pointSource1 = setup.pointSource1;
  pointSource1.auto_fire = false;
  universe.experimentTickFunctions = [];

  const sourceRect = pointSource1.source_rects[0];
  const cohort = pointSource1.fire(sourceRect.w / 2);
  universe.addFundamentalFrames(cohort);

  const sample = cohort[0];
  const expectedWavelength = setup.realizedWaveLength;
  const actualWavelength = sample.wavelength;

  const centerX = pointSource1.rect.x + pointSource1.rect.w / 2;
  const centerY = pointSource1.rect.y + pointSource1.rect.h / 2;

  console.log("Setup");
  console.log(`  fundamentalDimension: ${setupOptions.fundamentalDimension}`);
  console.log(`  fundamentalWaveLength (requested): ${setupOptions.fundamentalWaveLength}`);
  console.log(`  realizedWaveLength: ${setup.realizedWaveLength}`);
  console.log(`  cohort size: ${cohort.length}`);
  console.log(`  particle.wavelength: ${actualWavelength}`);
  console.log(`  source center: (${centerX}, ${centerY})`);

  const totalTicks = 20;
  for (let t = 0; t < totalTicks; t++) {
    universe.doTick();
  }

  const alive = cohort.filter(p => p.is_alive);
  const angles = alive.map(p => {
    const dx = p.rect.x + p.rect.w / 2 - centerX;
    const dy = p.rect.y + p.rect.h / 2 - centerY;
    return Math.atan2(dy, dx);
  });
  const radii = alive.map(p => {
    const dx = p.rect.x + p.rect.w / 2 - centerX;
    const dy = p.rect.y + p.rect.h / 2 - centerY;
    return Math.sqrt(dx * dx + dy * dy);
  });

  const meanRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
  const radiusStd = Math.sqrt(
    radii.reduce((sum, r) => sum + (r - meanRadius) ** 2, 0) / radii.length
  );

  console.log("\nAfter 20 ticks");
  console.log(`  alive: ${alive.length}`);
  console.log(`  mean radius from source: ${meanRadius.toFixed(2)}`);
  console.log(`  radius std: ${radiusStd.toFixed(2)}`);
  console.log(`  angular spread: ${angles.length} directions`);

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

  assert(actualWavelength === expectedWavelength,
    `particle wavelength matches realized (${actualWavelength} === ${expectedWavelength})`);

  assert(alive.length >= cohort.length * 0.9,
    `most particles remain alive after 20 ticks (${alive.length}/${cohort.length})`);

  assert(meanRadius > 10,
    `particles spread radially (mean radius ${meanRadius.toFixed(2)} > 10)`);

  assert(angles.length >= 8,
    `circular emission: particles in multiple directions (${angles.length} unique angles)`);

  const fixedCharge = pointSource1.charge;
  assert(fixedCharge !== null && fixedCharge !== undefined,
    `emitter has fixed charge for polarization (charge=${fixedCharge})`);
  assert(cohort.every(p => p.charge === fixedCharge),
    `all particles share fixed charge (polarized cohort)`);

  console.log(`\nSummary: ${passed} passed, ${failed} failed`);
  process.exitCode = failed > 0 ? 1 : 0;
}

runTest();
