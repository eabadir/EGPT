import type { CNFProblem } from '../types';
import { generateProblemSuite, generateHard3SAT, generateGraphColoring, generateForcedOrdering, generateMixedHardPattern } from './hardPatterns';
import { verifyProblemHardness, quickHardnessCheck, type HardnessResult } from './verifyHardness';

/**
 * Generate and filter hard SAT problems
 * 
 * Generates multiple candidate problems for each target size,
 * verifies hardness (all solvers exceed N³),
 * and selects the best problems for the library.
 */

/**
 * Generate candidate problems for a specific size
 * 
 * @param n Number of variables
 * @param candidatesPerPattern Number of candidates to generate per pattern type
 * @returns Array of candidate problems
 */
function generateCandidates(n: number, candidatesPerPattern: number = 5): CNFProblem[] {
  const candidates: CNFProblem[] = [];
  
  console.log(`\nGenerating candidates for n=${n}...`);
  
  // Hard 3-SAT at various ratios near phase transition
  for (let i = 0; i < candidatesPerPattern; i++) {
    const ratio = 4.0 + (Math.random() * 0.8); // 4.0 to 4.8
    candidates.push(generateHard3SAT(n, ratio));
  }
  
  // Graph coloring with various densities
  for (let i = 0; i < candidatesPerPattern; i++) {
    const density = 0.3 + (Math.random() * 0.3); // 0.3 to 0.6
    candidates.push(generateGraphColoring(n, density));
  }
  
  // Forced ordering patterns
  for (let i = 0; i < candidatesPerPattern; i++) {
    candidates.push(generateForcedOrdering(n));
  }
  
  // Mixed hard patterns
  for (let i = 0; i < candidatesPerPattern; i++) {
    candidates.push(generateMixedHardPattern(n));
  }
  
  console.log(`  Generated ${candidates.length} candidates`);
  return candidates;
}

/**
 * Quick filter candidates using fast hardness check
 * 
 * @param candidates Array of candidate problems
 * @returns Filtered array of likely hard problems
 */
function quickFilterCandidates(candidates: CNFProblem[]): CNFProblem[] {
  console.log(`\nQuick filtering ${candidates.length} candidates...`);
  
  const filtered: CNFProblem[] = [];
  
  for (let i = 0; i < candidates.length; i++) {
    if ((i + 1) % 5 === 0) {
      console.log(`  Checked ${i + 1}/${candidates.length} candidates`);
    }
    
    if (quickHardnessCheck(candidates[i])) {
      filtered.push(candidates[i]);
    }
  }
  
  console.log(`  Quick filter: ${filtered.length}/${candidates.length} passed (${(filtered.length / candidates.length * 100).toFixed(1)}%)`);
  return filtered;
}

/**
 * Select best problems from verified results
 * 
 * Selects problems with:
 * - Highest iteration counts (relative to N³)
 * - Good balance across problem types
 * - Satisfiable (not UNSAT)
 * 
 * @param results Array of hardness results
 * @param count Number of problems to select
 * @returns Selected best problems with their results
 */
function selectBestProblems(results: HardnessResult[], count: number): HardnessResult[] {
  // Filter to only qualified problems (all exceed N³)
  const qualified = results.filter(r => r.passesHardness.all);
  
  if (qualified.length === 0) {
    console.log('\n⚠ WARNING: No problems qualified! All results returned.');
    return results;
  }
  
  // Filter out UNSAT problems
  const sat = qualified.filter(r => r.bruteForce.found || r.randomSearch.runs.some(run => run.found) || r.dpll.found);
  
  if (sat.length === 0) {
    console.log('\n⚠ WARNING: All qualified problems are UNSAT! Returning qualified UNSAT problems.');
    return qualified.slice(0, count);
  }
  
  // Score each problem based on hardness metrics
  const scored = sat.map(result => {
    // Average ratio across all three solvers
    const avgRatio = (result.ratios.bruteForceToN3 + result.ratios.randomToN3 + result.ratios.dpllToN3) / 3;
    
    // Bonus for consistency (all three solvers have similar hardness)
    const ratioStdDev = Math.sqrt(
      (Math.pow(result.ratios.bruteForceToN3 - avgRatio, 2) +
       Math.pow(result.ratios.randomToN3 - avgRatio, 2) +
       Math.pow(result.ratios.dpllToN3 - avgRatio, 2)) / 3
    );
    const consistencyBonus = 1 / (1 + ratioStdDev); // 0-1, higher is more consistent
    
    // Final score: average hardness * consistency
    const score = avgRatio * (0.7 + 0.3 * consistencyBonus);
    
    return {
      result,
      score,
      avgRatio,
      consistencyBonus
    };
  });
  
  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);
  
  // Take top count
  const selected = scored.slice(0, count).map(s => s.result);
  
  console.log(`\nSelected ${selected.length} best problems:`);
  selected.forEach((r, i) => {
    const s = scored[i];
    console.log(`  ${i + 1}. ${r.problem.description}`);
    console.log(`     Score: ${s.score.toFixed(2)}, Avg ratio: ${s.avgRatio.toFixed(2)}x, Consistency: ${s.consistencyBonus.toFixed(2)}`);
  });
  
  return selected;
}

/**
 * Generate hard problems for all target sizes
 * 
 * @param targetSizes Array of problem sizes to generate
 * @param candidatesPerSize How many candidates to generate per size
 * @param randomRuns Number of random search runs for verification
 * @returns Array of hardness results for selected problems
 */
export async function generateCandidateProblems(
  targetSizes: number[] = [14, 16, 18, 19, 21],
  candidatesPerSize: number = 20,
  randomRuns: number = 50
): Promise<HardnessResult[]> {
  const allResults: HardnessResult[] = [];
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`HARD SAT PROBLEM GENERATION`);
  console.log(`Target sizes: ${targetSizes.join(', ')}`);
  console.log(`Candidates per size: ${candidatesPerSize}`);
  console.log(`Random search runs per problem: ${randomRuns}`);
  console.log(`${'='.repeat(80)}`);
  
  for (const n of targetSizes) {
    console.log(`\n\n${'*'.repeat(80)}`);
    console.log(`PROCESSING SIZE: ${n} variables (N³ = ${Math.pow(n, 3).toLocaleString()})`);
    console.log(`${'*'.repeat(80)}`);
    
    // Generate candidates
    const candidates = generateCandidates(n, candidatesPerSize);
    
    // Quick filter
    const filtered = quickFilterCandidates(candidates);
    
    if (filtered.length === 0) {
      console.log(`\n⚠ No candidates passed quick filter for n=${n}, skipping full verification`);
      continue;
    }
    
    // Full verification on filtered candidates
    console.log(`\nFull verification of ${filtered.length} candidates...`);
    for (let i = 0; i < filtered.length; i++) {
      console.log(`\n--- Candidate ${i + 1}/${filtered.length} for n=${n} ---`);
      const result = verifyProblemHardness(filtered[i], randomRuns);
      
      if (result.passesHardness.all) {
        allResults.push(result);
        console.log(`  ✓ QUALIFIED - Added to results`);
      } else {
        console.log(`  ✗ DID NOT QUALIFY`);
      }
    }
  }
  
  // Select best problem for each size
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`SELECTING BEST PROBLEMS`);
  console.log(`${'='.repeat(80)}`);
  
  const resultsBySize = new Map<number, HardnessResult[]>();
  for (const result of allResults) {
    const n = result.problem.numVariables;
    if (!resultsBySize.has(n)) {
      resultsBySize.set(n, []);
    }
    resultsBySize.get(n)!.push(result);
  }
  
  const selectedProblems: HardnessResult[] = [];
  for (const n of targetSizes) {
    const resultsForSize = resultsBySize.get(n) || [];
    if (resultsForSize.length > 0) {
      console.log(`\nSize ${n}: ${resultsForSize.length} qualified problems`);
      const best = selectBestProblems(resultsForSize, 1);
      selectedProblems.push(...best);
    } else {
      console.log(`\nSize ${n}: No qualified problems found`);
    }
  }
  
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`GENERATION COMPLETE`);
  console.log(`  Total candidates generated: ${targetSizes.length * candidatesPerSize * 4}`);
  console.log(`  Problems verified: ${allResults.length}`);
  console.log(`  Problems selected: ${selectedProblems.length}`);
  console.log(`${'='.repeat(80)}\n`);
  
  return selectedProblems;
}

/**
 * Export selected problems to JSON format
 * 
 * @param results Array of hardness results
 * @returns JSON-serializable object
 */
export function exportProblemsToJSON(results: HardnessResult[]): any {
  return results.map(r => ({
    problem: {
      numVariables: r.problem.numVariables,
      clauses: r.problem.clauses.map(clause => 
        clause.map(lit => ({
          varNum: lit.city.num,
          positive: lit.positive
        }))
      ),
      description: r.problem.description,
      tag: r.problem.tag,
      suggestedOverlay: r.problem.suggestedOverlay,
      realWorldContext: r.problem.realWorldContext
    },
    verification: {
      n3Bound: r.n3Bound,
      bruteForce: {
        found: r.bruteForce.found,
        iterations: r.bruteForce.iterations,
        timeMs: r.bruteForce.timeMs,
        certificate: r.bruteForce.certificate
      },
      randomSearch: {
        avgIterations: r.randomSearch.avgIterations,
        minIterations: r.randomSearch.minIterations,
        maxIterations: r.randomSearch.maxIterations,
        stdDev: r.randomSearch.stdDev,
        runsCount: r.randomSearch.runs.length
      },
      dpll: {
        found: r.dpll.found,
        iterations: r.dpll.iterations,
        timeMs: r.dpll.timeMs,
        certificate: r.dpll.certificate
      },
      passesHardness: r.passesHardness,
      ratios: r.ratios
    }
  }));
}
