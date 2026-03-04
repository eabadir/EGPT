/**
 * Verification test suite for example problems
 * 
 * This suite verifies that all example problems have accurate metadata
 * about brute force performance. Run this test when:
 * - Adding new example problems
 * - Modifying existing problems
 * - Updating the solver implementation
 */

import { describe, it, expect } from 'vitest';
import { exampleProblems } from '../examples/problems';
import type { CNFProblem, SolverResult } from '../types';

// Simple brute force solver for testing
function bruteForceSolve(cnf: CNFProblem): SolverResult {
  const startTime = performance.now();
  let iterations = 0;
  
  // Try all 2^n assignments
  for (let assignment = 0; assignment < (1 << cnf.numVariables); assignment++) {
    iterations++;
    
    // Convert assignment to boolean array
    const assignmentArray: boolean[] = [];
    for (let i = 0; i < cnf.numVariables; i++) {
      assignmentArray.push(((assignment >> i) & 1) === 1);
    }
    
    // Check if this assignment satisfies all clauses
    let allSatisfied = true;
    for (const clause of cnf.clauses) {
      let clauseSatisfied = false;
      for (const literal of clause) {
        const varValue = assignmentArray[literal.city.num - 1];
        const literalValue = literal.positive ? varValue : !varValue;
        if (literalValue) {
          clauseSatisfied = true;
          break;
        }
      }
      if (!clauseSatisfied) {
        allSatisfied = false;
        break;
      }
    }
    
    if (allSatisfied) {
      return {
        found: true,
        certificate: {
          assignment: assignmentArray,
          witnessLiterals: [],
          complexity: 0
        },
        iterations,
        timeMs: performance.now() - startTime
      };
    }
  }
  
  return {
    found: false,
    iterations,
    timeMs: performance.now() - startTime
  };
}

describe('Example Problem Verification', () => {
  exampleProblems.forEach((example, index) => {
    describe(`Problem ${index + 1}: ${example.problem.description}`, () => {
      let result: SolverResult;
      
      it('should match verified bruteForceSolves status', () => {
        result = bruteForceSolve(example.problem);
        expect(result.found).toBe(example.verified.bruteForceSolves);
      });
      
      it('should match verified maxIterations (2^N)', () => {
        const expected = Math.pow(2, example.problem.numVariables);
        expect(example.verified.maxIterations).toBe(expected);
      });
      
      it('should have iterations within ±10% of expectedIterations', () => {
        if (!result) {
          result = bruteForceSolve(example.problem);
        }
        
        const expected = example.verified.expectedIterations;
        const tolerance = expected * 0.1;
        const lowerBound = expected - tolerance;
        const upperBound = expected + tolerance;
        
        expect(result.iterations).toBeGreaterThanOrEqual(lowerBound);
        expect(result.iterations).toBeLessThanOrEqual(upperBound);
      });
      
      it('should correctly identify withinN2Bound status', () => {
        if (!result) {
          result = bruteForceSolve(example.problem);
        }
        
        const n2Bound = example.problem.numVariables * example.problem.numVariables;
        const actualWithinBound = result.iterations <= n2Bound;
        
        expect(example.verified.withinN2Bound).toBe(actualWithinBound);
      });
      
      it('should have correct timeout calculation', () => {
        const n2 = example.problem.numVariables * example.problem.numVariables;
        const expectedTimeout = n2 * 5;
        
        expect(example.verified.bruteForceTimeoutMs).toBe(expectedTimeout);
      });
      
      it('should have non-empty educational fields', () => {
        expect(example.whatToExpect).toBeTruthy();
        expect(example.whyItsHard).toBeTruthy();
        expect(example.egptInsight).toBeTruthy();
        expect(example.keyLearning).toBeTruthy();
      });
    });
  });
  
  it('should have problems spanning all difficulty levels', () => {
    const difficulties = new Set(exampleProblems.map(p => p.difficulty));
    
    expect(difficulties.has('easy')).toBe(true);
    expect(difficulties.has('medium')).toBe(true);
    expect(difficulties.has('hard')).toBe(true);
    expect(difficulties.has('extreme')).toBe(true);
  });
  
  it('should have problems with increasing complexity', () => {
    const sizes = exampleProblems.map(p => p.problem.numVariables);
    
    // Check that we have a good range
    expect(Math.min(...sizes)).toBeLessThanOrEqual(5);
    expect(Math.max(...sizes)).toBeGreaterThanOrEqual(15);
  });
  
  it('should have both SAT and UNSAT examples', () => {
    const hasSAT = exampleProblems.some(p => p.verified.bruteForceSolves);
    const hasUNSAT = exampleProblems.some(p => !p.verified.bruteForceSolves);
    
    expect(hasSAT).toBe(true);
    expect(hasUNSAT).toBe(true);
  });
});







