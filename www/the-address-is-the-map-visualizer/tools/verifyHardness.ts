import type { CNFProblem, SolverResult } from '../types';
import { bruteForceSolver } from '../solvers/BruteForceSolver';
import { RandomSearchSolver } from '../solvers/RandomSearchSolver';
import { DPLLSolver } from '../solvers/DPLLSolver';

/**
 * Hardness verification result for a single problem
 */
export interface HardnessResult {
  problem: CNFProblem;
  bruteForce: SolverResult;
  randomSearch: {
    runs: SolverResult[];
    avgIterations: number;
    minIterations: number;
    maxIterations: number;
    stdDev: number;
  };
  dpll: SolverResult;
  n3Bound: number;
  passesHardness: {
    bruteForce: boolean;
    random: boolean;
    dpll: boolean;
    all: boolean;
  };
  ratios: {
    bruteForceToN3: number;
    randomToN3: number;
    dpllToN3: number;
  };
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Verify problem hardness across all three solvers
 * 
 * @param problem CNF problem to test
 * @param randomRuns Number of random search runs (default 50)
 * @param randomMaxIterations Max iterations per random run (default 1M)
 * @returns Comprehensive hardness analysis
 */
export function verifyProblemHardness(
  problem: CNFProblem,
  randomRuns: number = 50,
  randomMaxIterations: number = 1000000
): HardnessResult {
  const n3 = Math.pow(problem.numVariables, 3);
  
  console.log(`\nVerifying hardness for: ${problem.description || 'Unnamed problem'}`);
  console.log(`  Variables: ${problem.numVariables}, N³ bound: ${n3.toLocaleString()}`);
  
  // Test brute force
  console.log(`  Testing brute force...`);
  const bruteForce = bruteForceSolver.solve(problem);
  console.log(`    → ${bruteForce.iterations.toLocaleString()} iterations in ${bruteForce.timeMs.toFixed(2)}ms`);
  
  // Test random search multiple times
  console.log(`  Testing random search (${randomRuns} runs)...`);
  const randomSolver = new RandomSearchSolver(randomMaxIterations);
  const randomRuns_results: SolverResult[] = [];
  
  for (let i = 0; i < randomRuns; i++) {
    const result = randomSolver.solve(problem);
    randomRuns_results.push(result);
    
    if ((i + 1) % 10 === 0) {
      console.log(`    → Completed ${i + 1}/${randomRuns} runs`);
    }
  }
  
  const avgIterations = randomRuns_results.reduce((sum, r) => sum + r.iterations, 0) / randomRuns;
  const minIterations = Math.min(...randomRuns_results.map(r => r.iterations));
  const maxIterations = Math.max(...randomRuns_results.map(r => r.iterations));
  const stdDev = calculateStdDev(randomRuns_results.map(r => r.iterations));
  
  console.log(`    → Avg: ${avgIterations.toLocaleString()}, Min: ${minIterations.toLocaleString()}, Max: ${maxIterations.toLocaleString()}`);
  
  // Test DPLL
  console.log(`  Testing DPLL...`);
  const dpllSolver = new DPLLSolver();
  const dpll = dpllSolver.solve(problem);
  console.log(`    → ${dpll.iterations.toLocaleString()} iterations in ${dpll.timeMs.toFixed(2)}ms`);
  
  // Calculate hardness passes
  const passesHardness = {
    bruteForce: bruteForce.iterations > n3,
    random: avgIterations > n3,
    dpll: dpll.iterations > n3,
    all: false
  };
  passesHardness.all = passesHardness.bruteForce && passesHardness.random && passesHardness.dpll;
  
  const ratios = {
    bruteForceToN3: bruteForce.iterations / n3,
    randomToN3: avgIterations / n3,
    dpllToN3: dpll.iterations / n3
  };
  
  console.log(`  Hardness check:`);
  console.log(`    BruteForce: ${passesHardness.bruteForce ? '✓' : '✗'} (${ratios.bruteForceToN3.toFixed(2)}x N³)`);
  console.log(`    Random:     ${passesHardness.random ? '✓' : '✗'} (${ratios.randomToN3.toFixed(2)}x N³)`);
  console.log(`    DPLL:       ${passesHardness.dpll ? '✓' : '✗'} (${ratios.dpllToN3.toFixed(2)}x N³)`);
  console.log(`    Overall:    ${passesHardness.all ? '✓ PASSED' : '✗ FAILED'}`);
  
  return {
    problem,
    bruteForce,
    randomSearch: {
      runs: randomRuns_results,
      avgIterations,
      minIterations,
      maxIterations,
      stdDev
    },
    dpll,
    n3Bound: n3,
    passesHardness,
    ratios
  };
}

/**
 * Batch verify multiple problems
 * 
 * @param problems Array of CNF problems to verify
 * @param randomRuns Number of random runs per problem
 * @returns Array of hardness results
 */
export function batchVerifyHardness(
  problems: CNFProblem[],
  randomRuns: number = 50
): HardnessResult[] {
  const results: HardnessResult[] = [];
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`BATCH HARDNESS VERIFICATION`);
  console.log(`Testing ${problems.length} problems with ${randomRuns} random runs each`);
  console.log(`${'='.repeat(80)}`);
  
  for (let i = 0; i < problems.length; i++) {
    console.log(`\n[${i + 1}/${problems.length}] Testing problem...`);
    const result = verifyProblemHardness(problems[i], randomRuns);
    results.push(result);
  }
  
  // Summary
  const qualified = results.filter(r => r.passesHardness.all);
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SUMMARY`);
  console.log(`  Total tested: ${results.length}`);
  console.log(`  Qualified (all exceed N³): ${qualified.length}`);
  console.log(`  Success rate: ${(qualified.length / results.length * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(80)}\n`);
  
  return results;
}

/**
 * Quick check if a problem is likely to pass hardness test
 * Uses just one random run for fast screening
 * 
 * @param problem CNF problem to check
 * @returns True if likely to pass full verification
 */
export function quickHardnessCheck(problem: CNFProblem): boolean {
  const n3 = Math.pow(problem.numVariables, 3);
  
  // Quick DPLL check (usually fastest fail indicator)
  const dpllSolver = new DPLLSolver();
  const dpll = dpllSolver.solve(problem);
  
  if (dpll.iterations <= n3) {
    return false; // DPLL too fast, likely easy problem
  }
  
  // Quick random check (1 run)
  const randomSolver = new RandomSearchSolver(100000);
  const random = randomSolver.solve(problem);
  
  if (random.iterations <= n3) {
    return false; // Random too fast, likely easy problem
  }
  
  return true; // Likely to pass full verification
}
