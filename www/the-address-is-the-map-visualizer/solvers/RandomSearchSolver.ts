import type { CNFProblem, SolverResult, Certificate, Solver, SolverStatus } from '../types';

/**
 * Calculate solver status based on iterations and problem size
 */
function calculateStatus(
  found: boolean,
  iterations: number,
  numVariables: number,
  maxIterations: number
): SolverStatus {
  const n2Bound = numVariables * numVariables;
  
  if (!found) {
    return 'timeout';
  }
  
  return iterations <= n2Bound ? 'polynomial' : 'exponential';
}

/**
 * Random Search Solver with configurable iteration limit
 * For hardness testing - no hardcoded limits
 */
export class RandomSearchSolver implements Solver {
  name = 'Random Search';
  description = 'Try random assignments until finding a satisfying one';
  private maxIterations: number;

  constructor(maxIterations: number = 1000000) {
    this.maxIterations = maxIterations;
  }

  solve(cnf: CNFProblem): SolverResult {
    const startTime = performance.now();
    let iterations = 0;
    
    while (iterations < this.maxIterations) {
      iterations++;
      
      // Generate random assignment
      const assignment: boolean[] = [];
      for (let i = 0; i < cnf.numVariables; i++) {
        assignment.push(Math.random() > 0.5);
      }
      
      // Check if this assignment satisfies all clauses
      let allSatisfied = true;
      const witnessLiterals: number[] = [];
      let complexity = 0;
      
      for (const clause of cnf.clauses) {
        let clauseSatisfied = false;
        let witnessIndex = -1;
        
        for (let i = 0; i < clause.length; i++) {
          const literal = clause[i];
          const varValue = assignment[literal.city.num - 1];
          const literalValue = literal.positive ? varValue : !varValue;
          
          if (literalValue) {
            clauseSatisfied = true;
            witnessIndex = i;
            complexity += literal.city.num;
            break;
          }
        }
        
        if (!clauseSatisfied) {
          allSatisfied = false;
          break;
        }
        
        witnessLiterals.push(witnessIndex);
      }
      
      if (allSatisfied) {
        const certificate: Certificate = {
          assignment,
          witnessLiterals,
          complexity
        };
        
        const totalSpace = Math.pow(2, cnf.numVariables);
        const status = calculateStatus(true, iterations, cnf.numVariables, this.maxIterations);
        
        return {
          found: true,
          certificate,
          iterations,
          timeMs: performance.now() - startTime,
          status,
          exploredSpace: (iterations / totalSpace) * 100,
          maxIterationsReached: false,
          timeoutReached: false
        };
      }
    }
    
    // Didn't find solution in max attempts
    const totalSpace = Math.pow(2, cnf.numVariables);
    const status: SolverStatus = 'timeout';
    
    return {
      found: false,
      iterations,
      timeMs: performance.now() - startTime,
      status,
      exploredSpace: (iterations / totalSpace) * 100,
      maxIterationsReached: iterations >= totalSpace,
      timeoutReached: true
    };
  }
}

/**
 * Create default random search solver with 1M iteration limit
 */
export const randomSearchSolver: Solver = new RandomSearchSolver(1000000);
