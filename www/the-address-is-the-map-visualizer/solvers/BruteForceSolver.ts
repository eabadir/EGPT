import type { CNFProblem, SolverResult, Certificate, Solver, SolverStatus } from '../types';
import { verifyCertificate } from './cnfUtils';

/**
 * Calculate solver status based on iterations and problem size
 */
function calculateStatus(
  found: boolean,
  iterations: number,
  numVariables: number,
  maxIterations: number,
  timedOut: boolean
): SolverStatus {
  const n2Bound = numVariables * numVariables;
  const totalSpace = Math.pow(2, numVariables);
  
  if (timedOut) {
    return 'timeout';
  }
  
  if (!found && iterations >= totalSpace) {
    return 'proven-unsat';
  }
  
  if (found) {
    return iterations <= n2Bound ? 'polynomial' : 'exponential';
  }
  
  // Not found and didn't exhaust search space
  return 'timeout';
}

/**
 * Brute force solver that tries all possible assignments
 */
export const bruteForceSolver: Solver = {
  name: 'Brute Force',
  description: 'Try all possible assignments until finding a satisfying one',
  solve: (cnf: CNFProblem): SolverResult => {
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
      const witnessLiterals: number[] = [];
      let complexity = 0;
      
      for (const clause of cnf.clauses) {
        let clauseSatisfied = false;
        let witnessIndex = -1;
        
        for (let i = 0; i < clause.length; i++) {
          const literal = clause[i];
          const varValue = assignmentArray[literal.city.num - 1];
          const literalValue = literal.positive ? varValue : !varValue;
          
          if (literalValue) {
            clauseSatisfied = true;
            witnessIndex = i;
            complexity += literal.city.num; // PathToConstraint cost
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
          assignment: assignmentArray,
          witnessLiterals,
          complexity
        };
        
        const totalSpace = 1 << cnf.numVariables;
        const status = calculateStatus(true, iterations, cnf.numVariables, totalSpace, false);
        
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
    
    // Exhausted all possibilities - proven UNSAT
    const totalSpace = 1 << cnf.numVariables;
    const status = calculateStatus(false, iterations, cnf.numVariables, totalSpace, false);
    
    return {
      found: false,
      iterations,
      timeMs: performance.now() - startTime,
      status,
      exploredSpace: 100,
      maxIterationsReached: true,
      timeoutReached: false
    };
  }
};

/**
 * Random solver that tries random assignments
 */
export const randomSolver: Solver = {
  name: 'Random Search',
  description: 'Try random assignments until finding a satisfying one',
  solve: (cnf: CNFProblem): SolverResult => {
    const startTime = performance.now();
    const maxAttempts = Math.min(10000, Math.pow(2, cnf.numVariables));
    let iterations = 0;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
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
        const status = calculateStatus(true, iterations, cnf.numVariables, maxAttempts, false);
        
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
    
    // Didn't find solution in max attempts - timeout/unknown
    const totalSpace = Math.pow(2, cnf.numVariables);
    const status = calculateStatus(false, iterations, cnf.numVariables, maxAttempts, true);
    
    return {
      found: false,
      iterations,
      timeMs: performance.now() - startTime,
      status,
      exploredSpace: (iterations / totalSpace) * 100,
      maxIterationsReached: false,
      timeoutReached: true
    };
  }
};

/**
 * DPLL solver (simplified implementation)
 */
export const dpllSolver: Solver = {
  name: 'DPLL',
  description: 'Davis-Putnam-Logemann-Loveland algorithm',
  solve: (cnf: CNFProblem): SolverResult => {
    const startTime = performance.now();
    let iterations = 0;
    
    // Simplified DPLL implementation
    const solveDPLL = (clauses: typeof cnf.clauses, assignment: boolean[]): boolean => {
      iterations++;
      
      // Check if all clauses are satisfied
      let allSatisfied = true;
      for (const clause of clauses) {
        let clauseSatisfied = false;
        for (const literal of clause) {
          const varValue = assignment[literal.city.num - 1];
          if ((literal.positive && varValue) || (!literal.positive && !varValue)) {
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
        return true;
      }
      
      // Check for empty clauses (unsatisfiable)
      for (const clause of clauses) {
        let hasUnassigned = false;
        for (const literal of clause) {
          const varValue = assignment[literal.city.num - 1];
          if ((literal.positive && varValue) || (!literal.positive && !varValue)) {
            hasUnassigned = true;
            break;
          }
        }
        if (!hasUnassigned) {
          return false; // Empty clause found
        }
      }
      
      // Find first unassigned variable
      let unassignedVar = -1;
      for (let i = 0; i < cnf.numVariables; i++) {
        if (assignment[i] === undefined) {
          unassignedVar = i;
          break;
        }
      }
      
      if (unassignedVar === -1) {
        return false; // All variables assigned but not satisfied
      }
      
      // Try both values for the unassigned variable
      assignment[unassignedVar] = true;
      if (solveDPLL(clauses, [...assignment])) {
        return true;
      }
      
      assignment[unassignedVar] = false;
      if (solveDPLL(clauses, [...assignment])) {
        return true;
      }
      
      return false;
    };
    
    const assignment: boolean[] = new Array(cnf.numVariables);
    const found = solveDPLL(cnf.clauses, assignment);
    
    if (found) {
      // Calculate witness literals and complexity
      const witnessLiterals: number[] = [];
      let complexity = 0;
      
      for (const clause of cnf.clauses) {
        let witnessIndex = -1;
        for (let i = 0; i < clause.length; i++) {
          const literal = clause[i];
          const varValue = assignment[literal.city.num - 1];
          if ((literal.positive && varValue) || (!literal.positive && !varValue)) {
            witnessIndex = i;
            complexity += literal.city.num;
            break;
          }
        }
        witnessLiterals.push(witnessIndex);
      }
      
      const certificate: Certificate = {
        assignment,
        witnessLiterals,
        complexity
      };
      
      const totalSpace = Math.pow(2, cnf.numVariables);
      const status = calculateStatus(true, iterations, cnf.numVariables, totalSpace, false);
      
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
    
    // DPLL concluded UNSAT
    const totalSpace = Math.pow(2, cnf.numVariables);
    const status = calculateStatus(false, iterations, cnf.numVariables, totalSpace, false);
    
    return {
      found: false,
      iterations,
      timeMs: performance.now() - startTime,
      status,
      exploredSpace: (iterations / totalSpace) * 100,
      maxIterationsReached: true,
      timeoutReached: false
    };
  }
};

/**
 * Get all available solvers
 */
export const getAvailableSolvers = (): Solver[] => {
  return [bruteForceSolver, randomSolver, dpllSolver];
};

/**
 * Run a solver with timeout
 */
export const runSolverWithTimeout = async (
  solver: Solver, 
  problem: CNFProblem, 
  timeoutMs: number = 10000
): Promise<SolverResult> => {
  return new Promise((resolve) => {
    let timedOut = false;
    
    const timeout = setTimeout(() => {
      timedOut = true;
      const totalSpace = Math.pow(2, problem.numVariables);
      resolve({
        found: false,
        iterations: 0,
        timeMs: timeoutMs,
        status: 'timeout',
        exploredSpace: 0,
        maxIterationsReached: false,
        timeoutReached: true,
        timeoutMs
      });
    }, timeoutMs);
    
    try {
      const result = solver.solve(problem);
      clearTimeout(timeout);
      if (!timedOut) {
        resolve(result);
      }
    } catch (error) {
      clearTimeout(timeout);
      if (!timedOut) {
        const totalSpace = Math.pow(2, problem.numVariables);
        resolve({
          found: false,
          iterations: 0,
          timeMs: 0,
          status: 'timeout',
          exploredSpace: 0,
          maxIterationsReached: false,
          timeoutReached: true
        });
      }
    }
  });
};
