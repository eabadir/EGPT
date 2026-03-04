import type { CNFProblem, Certificate, Clause, Literal } from '../types';

/**
 * Parse DIMACS CNF format
 * @param dimacsContent DIMACS format string
 * @returns Parsed CNF problem
 */
export const parseDIMACS = (dimacsContent: string): CNFProblem | null => {
  const lines = dimacsContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('c'));
  
  let numVariables = 0;
  let numClauses = 0;
  const clauses: Clause[] = [];
  
  for (const line of lines) {
    if (line.startsWith('p cnf')) {
      const parts = line.split(/\s+/);
      if (parts.length >= 4) {
        numVariables = parseInt(parts[2]);
        numClauses = parseInt(parts[3]);
      }
    } else if (line.startsWith('p')) {
      // Skip problem line for now
      continue;
    } else {
      // Parse clause
      const literals = line.split(/\s+/).map(lit => parseInt(lit)).filter(lit => lit !== 0);
      if (literals.length > 0) {
        const clause: Literal[] = literals.map(lit => {
          const varNum = Math.abs(lit);
          const isPositive = lit > 0;
          return {
            city: {
              x: (varNum - 1) % 3,
              y: Math.floor((varNum - 1) / 3),
              num: varNum
            },
            positive: isPositive
          };
        });
        clauses.push(clause);
      }
    }
  }
  
  if (numVariables === 0 || clauses.length === 0) {
    return null;
  }
  
  return {
    numVariables,
    clauses,
    description: `DIMACS CNF: ${numVariables} variables, ${clauses.length} clauses`
  };
};

/**
 * Convert CNF problem to DIMACS format
 * @param problem CNF problem
 * @returns DIMACS format string
 */
export const toDIMACS = (problem: CNFProblem): string => {
  let dimacs = `p cnf ${problem.numVariables} ${problem.clauses.length}\n`;
  
  for (const clause of problem.clauses) {
    const literals = clause.map(lit => {
      const sign = lit.positive ? '' : '-';
      return `${sign}${lit.city.num}`;
    });
    dimacs += literals.join(' ') + ' 0\n';
  }
  
  return dimacs;
};

/**
 * Calculate the theoretical complexity bound for a CNF problem
 * @param problem CNF problem
 * @returns Theoretical complexity bound
 */
export const calculateComplexityBound = (problem: CNFProblem): number => {
  return problem.numVariables * problem.clauses.length;
};

/**
 * Verify if a certificate satisfies a CNF problem
 * @param problem CNF problem
 * @param certificate Certificate to verify
 * @returns Verification result
 */
export const verifyCertificate = (problem: CNFProblem, certificate: Certificate): {
  isValid: boolean;
  satisfiedClauses: number;
  totalComplexity: number;
  clauseResults: Array<{
    clauseIndex: number;
    isSatisfied: boolean;
    witnessLiteral: Literal | null;
    pathCost: number;
  }>;
} => {
  const clauseResults = [];
  let satisfiedClauses = 0;
  let totalComplexity = 0;
  
  for (let i = 0; i < problem.clauses.length; i++) {
    const clause = problem.clauses[i];
    const witnessIndex = certificate.witnessLiterals[i];
    
    let isSatisfied = false;
    let witnessLiteral: Literal | null = null;
    let pathCost = 0;
    
    if (witnessIndex !== undefined && witnessIndex < clause.length) {
      witnessLiteral = clause[witnessIndex];
      const varValue = certificate.assignment[witnessLiteral.city.num - 1];
      isSatisfied = witnessLiteral.positive ? varValue : !varValue;
      pathCost = witnessLiteral.city.num;
      totalComplexity += pathCost;
    }
    
    if (isSatisfied) {
      satisfiedClauses++;
    }
    
    clauseResults.push({
      clauseIndex: i,
      isSatisfied,
      witnessLiteral,
      pathCost
    });
  }
  
  return {
    isValid: satisfiedClauses === problem.clauses.length,
    satisfiedClauses,
    totalComplexity,
    clauseResults
  };
};

/**
 * Calculate entropy for a given assignment
 * @param assignment Boolean assignment
 * @returns Entropy value
 */
export const calculateEntropy = (assignment: boolean[]): number => {
  const trueCount = assignment.filter(b => b).length;
  const falseCount = assignment.length - trueCount;
  
  if (trueCount === 0 || falseCount === 0) {
    return 0; // No entropy if all values are the same
  }
  
  const p = trueCount / assignment.length;
  const q = falseCount / assignment.length;
  
  return -(p * Math.log2(p) + q * Math.log2(q));
};

/**
 * Generate a random satisfying assignment for a CNF problem
 * @param problem CNF problem
 * @returns Random satisfying assignment or null if unsatisfiable
 */
export const generateRandomSatisfyingAssignment = (problem: CNFProblem): boolean[] | null => {
  const maxAttempts = 1000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const assignment: boolean[] = [];
    for (let i = 0; i < problem.numVariables; i++) {
      assignment.push(Math.random() > 0.5);
    }
    
    // Check if this assignment satisfies all clauses
    let allSatisfied = true;
    for (const clause of problem.clauses) {
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
      return assignment;
    }
  }
  
  return null; // Could not find satisfying assignment
};

/**
 * Calculate Manhattan distance between two points
 * @param p1 First point
 * @param p2 Second point
 * @returns Manhattan distance
 */
export const manhattanDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
  return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
};

/**
 * Calculate total path cost for a sequence of points
 * @param points Sequence of points
 * @returns Total Manhattan distance
 */
export const calculatePathCost = (points: Array<{ x: number; y: number }>): number => {
  if (points.length < 2) return 0;
  
  let totalCost = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalCost += manhattanDistance(points[i], points[i + 1]);
  }
  
  return totalCost;
};

/**
 * Format CNF clause for display
 * @param clause CNF clause
 * @returns Formatted string representation
 */
export const formatClause = (clause: Clause): string => {
  const literals = clause.map(lit => `${lit.positive ? '' : '¬'}x${lit.city.num}`);
  return `(${literals.join(' ∨ ')})`;
};

/**
 * Format CNF problem for display
 * @param problem CNF problem
 * @returns Formatted string representation
 */
export const formatCNF = (problem: CNFProblem): string => {
  const clauses = problem.clauses.map(formatClause);
  return clauses.join(' ∧ ');
};

/**
 * Check if a CNF problem is satisfiable (simple heuristic)
 * @param problem CNF problem
 * @returns True if likely satisfiable, false if likely unsatisfiable
 */
export const isLikelySatisfiable = (problem: CNFProblem): boolean => {
  // Simple heuristic: if there are more clauses than variables, it's likely unsatisfiable
  // This is not always true, but works for many cases
  return problem.clauses.length <= problem.numVariables * 2;
};
