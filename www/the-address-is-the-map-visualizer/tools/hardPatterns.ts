import type { CNFProblem, Clause, Literal } from '../types';
import { calculateSpiralPoint } from '../hooks/useSquareSpiral';

/**
 * Hard SAT Problem Pattern Generators
 * 
 * Implements known hard SAT patterns from literature:
 * - Pigeon-hole principle (UNSAT, hard for resolution-based solvers)
 * - Graph coloring (hard for all solvers)
 * - Random 3-SAT at phase transition (≈ 4.26 clauses/variable)
 * - Forced ordering patterns (resistant to DPLL heuristics)
 */

/**
 * Generate Pigeon-hole Principle problem
 * 
 * Place n pigeons into n-1 holes - provably UNSAT
 * Known to be exponentially hard for DPLL
 * 
 * Variables: p_i_j represents "pigeon i goes in hole j"
 * Variable encoding: pigeon i, hole j → variable (i * holes + j)
 * 
 * @param pigeons Number of pigeons
 * @returns UNSAT CNF problem
 */
export function generatePigeonhole(pigeons: number): CNFProblem {
  const holes = pigeons - 1;
  const numVariables = pigeons * holes;
  const clauses: Clause[] = [];
  
  // Helper to get variable number for pigeon i in hole j
  const varNum = (i: number, j: number) => i * holes + j + 1;
  
  // Each pigeon must go in at least one hole
  for (let i = 0; i < pigeons; i++) {
    const clause: Clause = [];
    for (let j = 0; j < holes; j++) {
      clause.push({
        city: calculateSpiralPoint(varNum(i, j)),
        positive: true
      });
    }
    clauses.push(clause);
  }
  
  // No two pigeons can be in the same hole
  for (let j = 0; j < holes; j++) {
    for (let i1 = 0; i1 < pigeons; i1++) {
      for (let i2 = i1 + 1; i2 < pigeons; i2++) {
        clauses.push([
          { city: calculateSpiralPoint(varNum(i1, j)), positive: false },
          { city: calculateSpiralPoint(varNum(i2, j)), positive: false }
        ]);
      }
    }
  }
  
  return {
    numVariables,
    clauses,
    description: `Pigeon-hole: ${pigeons} pigeons, ${holes} holes (UNSAT)`,
    hasCertificate: false, // UNSAT problem
    problemSource: 'example',
    tag: 'SAT',
    suggestedOverlay: 'circuit',
    realWorldContext: `Classic UNSAT problem - ${pigeons} pigeons cannot fit in ${holes} holes`
  };
}

/**
 * Generate Graph 3-Coloring problem
 * 
 * Random graph with specified density, encode as 3-coloring SAT
 * Variables: v_i_c represents "vertex i has color c"
 * 
 * @param vertices Number of vertices
 * @param edgeProbability Probability of edge between any two vertices (0-1)
 * @returns CNF problem (may be SAT or UNSAT depending on graph)
 */
export function generateGraphColoring(vertices: number, edgeProbability: number = 0.5): CNFProblem {
  const colors = 3;
  const numVariables = vertices * colors;
  const clauses: Clause[] = [];
  
  // Helper to get variable number for vertex v with color c
  const varNum = (v: number, c: number) => v * colors + c + 1;
  
  // Each vertex must have at least one color
  for (let v = 0; v < vertices; v++) {
    const clause: Clause = [];
    for (let c = 0; c < colors; c++) {
      clause.push({
        city: calculateSpiralPoint(varNum(v, c)),
        positive: true
      });
    }
    clauses.push(clause);
  }
  
  // Each vertex can have at most one color
  for (let v = 0; v < vertices; v++) {
    for (let c1 = 0; c1 < colors; c1++) {
      for (let c2 = c1 + 1; c2 < colors; c2++) {
        clauses.push([
          { city: calculateSpiralPoint(varNum(v, c1)), positive: false },
          { city: calculateSpiralPoint(varNum(v, c2)), positive: false }
        ]);
      }
    }
  }
  
  // Generate random edges and add constraints
  const edges: [number, number][] = [];
  for (let v1 = 0; v1 < vertices; v1++) {
    for (let v2 = v1 + 1; v2 < vertices; v2++) {
      if (Math.random() < edgeProbability) {
        edges.push([v1, v2]);
        
        // Adjacent vertices cannot have the same color
        for (let c = 0; c < colors; c++) {
          clauses.push([
            { city: calculateSpiralPoint(varNum(v1, c)), positive: false },
            { city: calculateSpiralPoint(varNum(v2, c)), positive: false }
          ]);
        }
      }
    }
  }
  
  return {
    numVariables,
    clauses,
    description: `Graph 3-Coloring: ${vertices} vertices, ${edges.length} edges`,
    hasCertificate: true, // Assume SAT (may not always be true)
    problemSource: 'example',
    tag: 'SAT',
    suggestedOverlay: 'circuit',
    realWorldContext: `Graph coloring problem with ${vertices} nodes`
  };
}

/**
 * Generate Random 3-SAT at phase transition
 * 
 * The phase transition for 3-SAT occurs around clause-to-variable ratio ≈ 4.26
 * Problems at this ratio are hardest on average for all solvers
 * 
 * @param n Number of variables
 * @param clauseRatio Clauses per variable (default 4.26 for phase transition)
 * @returns CNF problem at phase transition
 */
export function generateHard3SAT(n: number, clauseRatio: number = 4.26): CNFProblem {
  const numClauses = Math.round(n * clauseRatio);
  const clauses: Clause[] = [];
  
  for (let i = 0; i < numClauses; i++) {
    const clause: Clause = [];
    const usedVars = new Set<number>();
    
    // Generate 3 distinct literals
    while (clause.length < 3) {
      const varNum = Math.floor(Math.random() * n) + 1;
      if (!usedVars.has(varNum)) {
        usedVars.add(varNum);
        clause.push({
          city: calculateSpiralPoint(varNum),
          positive: Math.random() > 0.5
        });
      }
    }
    
    clauses.push(clause);
  }
  
  return {
    numVariables: n,
    clauses,
    description: `Hard 3-SAT: ${n} vars, ${numClauses} clauses (ratio ${clauseRatio.toFixed(2)})`,
    hasCertificate: true, // Most are SAT at phase transition
    problemSource: 'example',
    tag: 'SAT',
    suggestedOverlay: 'circuit',
    realWorldContext: `Random 3-SAT at computational phase transition`
  };
}

/**
 * Generate Forced Ordering problem
 * 
 * Creates chain constraints that force a specific variable ordering
 * Resistant to many DPLL heuristics
 * 
 * Pattern: x1 → x2 → x3 → ... → xn
 * Encoded as: (¬x_i ∨ x_{i+1}) for all i
 * Plus additional constraints to make it harder
 * 
 * @param n Number of variables
 * @returns CNF problem with forced ordering
 */
export function generateForcedOrdering(n: number): CNFProblem {
  const clauses: Clause[] = [];
  
  // Chain constraints: x_i implies x_{i+1}
  for (let i = 1; i < n; i++) {
    clauses.push([
      { city: calculateSpiralPoint(i), positive: false },
      { city: calculateSpiralPoint(i + 1), positive: true }
    ]);
  }
  
  // Reverse chain: x_{i+1} implies x_i (creates bidirectional dependency)
  for (let i = 1; i < n; i++) {
    clauses.push([
      { city: calculateSpiralPoint(i + 1), positive: false },
      { city: calculateSpiralPoint(i), positive: true }
    ]);
  }
  
  // Add cross-dependencies to increase hardness
  const step = Math.max(2, Math.floor(n / 5));
  for (let i = 1; i <= n - step; i++) {
    clauses.push([
      { city: calculateSpiralPoint(i), positive: false },
      { city: calculateSpiralPoint(i + step), positive: false },
      { city: calculateSpiralPoint(Math.min(i + 2 * step, n)), positive: true }
    ]);
  }
  
  // Force at least one variable true to make it SAT
  const midpoint = Math.floor(n / 2);
  clauses.push([
    { city: calculateSpiralPoint(midpoint), positive: true }
  ]);
  
  return {
    numVariables: n,
    clauses,
    description: `Forced Ordering: ${n} vars with chain constraints`,
    hasCertificate: true,
    problemSource: 'example',
    tag: 'SAT',
    suggestedOverlay: 'circuit',
    realWorldContext: `Ordering constraints - resistant to DPLL heuristics`
  };
}

/**
 * Generate Mixed Hard Pattern
 * 
 * Combines elements from multiple hard patterns for maximum difficulty
 * 
 * @param n Number of variables
 * @returns Very hard CNF problem
 */
export function generateMixedHardPattern(n: number): CNFProblem {
  const clauses: Clause[] = [];
  
  // Start with hard 3-SAT base
  const base3SAT = generateHard3SAT(n, 4.0);
  clauses.push(...base3SAT.clauses);
  
  // Add some ordering constraints
  const chainLength = Math.floor(n / 3);
  for (let i = 1; i < chainLength; i++) {
    clauses.push([
      { city: calculateSpiralPoint(i), positive: false },
      { city: calculateSpiralPoint(i + 1), positive: true }
    ]);
  }
  
  // Add some XOR-like constraints (hard for DPLL)
  for (let i = 1; i <= n - 2; i += 3) {
    // (x_i ∨ x_{i+1}) ∧ (¬x_i ∨ ¬x_{i+1}) = x_i XOR x_{i+1}
    clauses.push([
      { city: calculateSpiralPoint(i), positive: true },
      { city: calculateSpiralPoint(i + 1), positive: true }
    ]);
    clauses.push([
      { city: calculateSpiralPoint(i), positive: false },
      { city: calculateSpiralPoint(i + 1), positive: false }
    ]);
  }
  
  return {
    numVariables: n,
    clauses,
    description: `Mixed Hard Pattern: ${n} vars, ${clauses.length} clauses`,
    hasCertificate: true,
    problemSource: 'example',
    tag: 'AI',
    suggestedOverlay: 'neuralnet',
    realWorldContext: `Hybrid hard pattern combining multiple difficult structures`
  };
}

/**
 * Generate a suite of test problems for a given size
 * 
 * @param n Number of variables
 * @returns Array of different hard problems
 */
export function generateProblemSuite(n: number): CNFProblem[] {
  return [
    generateHard3SAT(n, 4.26),
    generateHard3SAT(n, 4.5),
    generateGraphColoring(n, 0.3),
    generateGraphColoring(n, 0.5),
    generateForcedOrdering(n),
    generateMixedHardPattern(n)
  ];
}
