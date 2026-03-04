import type { CNFProblem, SolverResult, Certificate, Solver, SolverStatus, Clause, Literal } from '../types';

/**
 * Calculate solver status based on iterations and problem size
 */
function calculateStatus(
  found: boolean,
  iterations: number,
  numVariables: number
): SolverStatus {
  const n2Bound = numVariables * numVariables;
  
  if (!found) {
    return 'proven-unsat';
  }
  
  return iterations <= n2Bound ? 'polynomial' : 'exponential';
}

/**
 * DPLL (Davis-Putnam-Logemann-Loveland) Solver
 * 
 * Complete SAT solver with:
 * - Unit propagation
 * - Pure literal elimination  
 * - Backtracking
 * - Iteration counting (each recursive call = 1 iteration)
 */
export class DPLLSolver implements Solver {
  name = 'DPLL';
  description = 'Davis-Putnam-Logemann-Loveland algorithm with unit propagation';
  private iterations: number = 0;
  private startTime: number = 0;

  solve(cnf: CNFProblem): SolverResult {
    this.startTime = performance.now();
    this.iterations = 0;
    
    // Initialize partial assignment (undefined = unassigned)
    const assignment: (boolean | undefined)[] = new Array(cnf.numVariables).fill(undefined);
    
    const result = this.dpll(cnf.clauses, assignment, cnf.numVariables);
    
    if (result) {
      // Calculate witness literals and complexity
      const witnessLiterals: number[] = [];
      let complexity = 0;
      
      for (const clause of cnf.clauses) {
        let witnessIndex = -1;
        for (let i = 0; i < clause.length; i++) {
          const literal = clause[i];
          const varValue = assignment[literal.city.num - 1];
          const literalValue = literal.positive ? varValue : !varValue;
          if (literalValue) {
            witnessIndex = i;
            complexity += literal.city.num;
            break;
          }
        }
        witnessLiterals.push(witnessIndex);
      }
      
      const certificate: Certificate = {
        assignment: assignment as boolean[],
        witnessLiterals,
        complexity
      };
      
      const totalSpace = Math.pow(2, cnf.numVariables);
      const status = calculateStatus(true, this.iterations, cnf.numVariables);
      
      return {
        found: true,
        certificate,
        iterations: this.iterations,
        timeMs: performance.now() - this.startTime,
        status,
        exploredSpace: (this.iterations / totalSpace) * 100,
        maxIterationsReached: false,
        timeoutReached: false
      };
    }
    
    // DPLL concluded UNSAT
    const totalSpace = Math.pow(2, cnf.numVariables);
    const status = calculateStatus(false, this.iterations, cnf.numVariables);
    
    return {
      found: false,
      iterations: this.iterations,
      timeMs: performance.now() - this.startTime,
      status,
      exploredSpace: (this.iterations / totalSpace) * 100,
      maxIterationsReached: true,
      timeoutReached: false
    };
  }

  /**
   * Main DPLL recursive algorithm
   */
  private dpll(
    clauses: Clause[],
    assignment: (boolean | undefined)[],
    numVariables: number
  ): boolean {
    this.iterations++;
    
    // Unit propagation
    let propagated = true;
    while (propagated) {
      propagated = false;
      const unitClause = this.findUnitClause(clauses, assignment);
      
      if (unitClause) {
        const literal = unitClause.literal;
        const varIndex = literal.city.num - 1;
        assignment[varIndex] = literal.positive;
        propagated = true;
      }
    }
    
    // Pure literal elimination
    const pureLiteral = this.findPureLiteral(clauses, assignment);
    if (pureLiteral) {
      const varIndex = pureLiteral.varIndex;
      assignment[varIndex] = pureLiteral.value;
      return this.dpll(clauses, assignment, numVariables);
    }
    
    // Check if all clauses are satisfied
    const allSatisfied = this.allClausesSatisfied(clauses, assignment);
    if (allSatisfied) {
      return true;
    }
    
    // Check for empty clause (conflict)
    const hasEmptyClause = this.hasEmptyClause(clauses, assignment);
    if (hasEmptyClause) {
      return false;
    }
    
    // Find first unassigned variable
    const unassignedVar = assignment.findIndex(val => val === undefined);
    if (unassignedVar === -1) {
      // All variables assigned but not all clauses satisfied
      return false;
    }
    
    // Try true first
    const assignmentTrue = [...assignment];
    assignmentTrue[unassignedVar] = true;
    if (this.dpll(clauses, assignmentTrue, numVariables)) {
      // Copy successful assignment back
      for (let i = 0; i < numVariables; i++) {
        assignment[i] = assignmentTrue[i];
      }
      return true;
    }
    
    // Try false
    const assignmentFalse = [...assignment];
    assignmentFalse[unassignedVar] = false;
    if (this.dpll(clauses, assignmentFalse, numVariables)) {
      // Copy successful assignment back
      for (let i = 0; i < numVariables; i++) {
        assignment[i] = assignmentFalse[i];
      }
      return true;
    }
    
    return false;
  }

  /**
   * Find a unit clause (clause with only one unassigned literal)
   */
  private findUnitClause(
    clauses: Clause[],
    assignment: (boolean | undefined)[]
  ): { literal: Literal } | null {
    for (const clause of clauses) {
      let unassignedLiteral: Literal | null = null;
      let unassignedCount = 0;
      let clauseSatisfied = false;
      
      for (const literal of clause) {
        const varIndex = literal.city.num - 1;
        const varValue = assignment[varIndex];
        
        if (varValue === undefined) {
          unassignedLiteral = literal;
          unassignedCount++;
        } else {
          const literalValue = literal.positive ? varValue : !varValue;
          if (literalValue) {
            clauseSatisfied = true;
            break;
          }
        }
      }
      
      // Unit clause: not satisfied and exactly one unassigned literal
      if (!clauseSatisfied && unassignedCount === 1 && unassignedLiteral) {
        return { literal: unassignedLiteral };
      }
    }
    
    return null;
  }

  /**
   * Find a pure literal (variable that appears only positive or only negative)
   */
  private findPureLiteral(
    clauses: Clause[],
    assignment: (boolean | undefined)[]
  ): { varIndex: number; value: boolean } | null {
    const literalOccurrences = new Map<number, { positive: boolean; negative: boolean }>();
    
    // Collect occurrences
    for (const clause of clauses) {
      for (const literal of clause) {
        const varIndex = literal.city.num - 1;
        
        // Skip if already assigned
        if (assignment[varIndex] !== undefined) {
          continue;
        }
        
        if (!literalOccurrences.has(varIndex)) {
          literalOccurrences.set(varIndex, { positive: false, negative: false });
        }
        
        const occ = literalOccurrences.get(varIndex)!;
        if (literal.positive) {
          occ.positive = true;
        } else {
          occ.negative = true;
        }
      }
    }
    
    // Find pure literal
    for (const [varIndex, occ] of literalOccurrences.entries()) {
      if (occ.positive && !occ.negative) {
        return { varIndex, value: true };
      }
      if (occ.negative && !occ.positive) {
        return { varIndex, value: false };
      }
    }
    
    return null;
  }

  /**
   * Check if all clauses are satisfied
   */
  private allClausesSatisfied(
    clauses: Clause[],
    assignment: (boolean | undefined)[]
  ): boolean {
    for (const clause of clauses) {
      let clauseSatisfied = false;
      
      for (const literal of clause) {
        const varIndex = literal.city.num - 1;
        const varValue = assignment[varIndex];
        
        if (varValue !== undefined) {
          const literalValue = literal.positive ? varValue : !varValue;
          if (literalValue) {
            clauseSatisfied = true;
            break;
          }
        }
      }
      
      if (!clauseSatisfied) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if there's an empty clause (all literals false)
   */
  private hasEmptyClause(
    clauses: Clause[],
    assignment: (boolean | undefined)[]
  ): boolean {
    for (const clause of clauses) {
      let allFalse = true;
      
      for (const literal of clause) {
        const varIndex = literal.city.num - 1;
        const varValue = assignment[varIndex];
        
        if (varValue === undefined) {
          allFalse = false;
          break;
        }
        
        const literalValue = literal.positive ? varValue : !varValue;
        if (literalValue) {
          allFalse = false;
          break;
        }
      }
      
      if (allFalse) {
        return true;
      }
    }
    
    return false;
  }
}

/**
 * Create default DPLL solver instance
 */
export const dpllSolver: Solver = new DPLLSolver();
