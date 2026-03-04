import type { Clause, Certificate, CNFProblem } from '../types';

/**
 * Check if a clause is satisfied by a given assignment and return the witness literal.
 */
export function isClauseSatisfied(
  clause: Clause,
  assignment: boolean[]
): { satisfied: boolean; witnessIndex: number } {
  for (let i = 0; i < clause.length; i++) {
    const literal = clause[i];
    const varIdx = literal.city.num - 1; // Convert to 0-indexed
    
    if (varIdx >= assignment.length) {
      continue; // Skip if variable not in assignment
    }
    
    const varValue = assignment[varIdx];
    
    // Literal is satisfied if:
    // - It's positive and variable is true
    // - It's negative and variable is false
    if ((literal.positive && varValue) || (!literal.positive && !varValue)) {
      return { satisfied: true, witnessIndex: i };
    }
  }
  
  return { satisfied: false, witnessIndex: -1 };
}

/**
 * Get satisfaction status for all clauses in a problem.
 */
export function getClauseSatisfaction(
  problem: CNFProblem,
  certificate: Certificate | null
): Array<{ satisfied: boolean; witnessIndex: number }> {
  if (!certificate || !certificate.assignment) {
    return problem.clauses.map(() => ({ satisfied: false, witnessIndex: -1 }));
  }
  
  return problem.clauses.map(clause => 
    isClauseSatisfied(clause, certificate.assignment)
  );
}

/**
 * Format a literal for display.
 */
export function formatLiteral(literal: { city: { num: number }; positive: boolean }): string {
  const varName = `x${literal.city.num}`;
  return literal.positive ? varName : `¬${varName}`;
}

/**
 * Format a clause for display.
 */
export function formatClause(clause: Clause): string {
  return clause.map(formatLiteral).join(' ∨ ');
}



