import type { CNFProblem, Clause, Point } from '../types';
import { calculateSpiralPoint } from '../hooks/useSquareSpiral';

/**
 * DIMACS CNF Format Parser
 * 
 * Standard format for CNF problems:
 * - Comment lines start with 'c'
 * - Problem line: 'p cnf <num_vars> <num_clauses>'
 * - Clause lines: '<lit> <lit> ... 0' (0 terminates clause)
 * - Literals: positive integers for positive, negative for negated
 * 
 * Example:
 * ```
 * c This is a comment
 * p cnf 3 2
 * 1 -2 0
 * -1 2 3 0
 * ```
 */

export interface DimacsParseResult {
  success: boolean;
  problem?: CNFProblem;
  error?: string;
  warnings?: string[];
}

/**
 * Parse a DIMACS CNF file content
 */
export function parseDimacs(content: string): DimacsParseResult {
  const warnings: string[] = [];
  let numVariables = 0;
  let numClauses = 0;
  const clauses: Clause[] = [];
  
  try {
    const lines = content.trim().split('\n');
    let problemLineFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Skip comment lines
      if (line.startsWith('c')) continue;
      
      // Parse problem line
      if (line.startsWith('p')) {
        if (problemLineFound) {
          return {
            success: false,
            error: `Multiple problem lines found (line ${i + 1})`
          };
        }
        
        const parts = line.split(/\s+/);
        if (parts.length !== 4 || parts[0] !== 'p' || parts[1] !== 'cnf') {
          return {
            success: false,
            error: `Invalid problem line format (line ${i + 1}): expected 'p cnf <vars> <clauses>'`
          };
        }
        
        numVariables = parseInt(parts[2], 10);
        numClauses = parseInt(parts[3], 10);
        
        if (isNaN(numVariables) || numVariables <= 0) {
          return {
            success: false,
            error: `Invalid number of variables: ${parts[2]} (line ${i + 1})`
          };
        }
        
        if (isNaN(numClauses) || numClauses < 0) {
          return {
            success: false,
            error: `Invalid number of clauses: ${parts[3]} (line ${i + 1})`
          };
        }
        
        if (numVariables > 25) {
          warnings.push(`Large problem (${numVariables} variables) may cause performance issues`);
        }
        
        problemLineFound = true;
        continue;
      }
      
      // Parse clause line
      if (!problemLineFound) {
        return {
          success: false,
          error: `Clause found before problem line (line ${i + 1})`
        };
      }
      
      const literals = line.split(/\s+/).map(s => parseInt(s, 10));
      
      // Check for clause terminator
      if (literals[literals.length - 1] !== 0) {
        return {
          success: false,
          error: `Clause not terminated with 0 (line ${i + 1})`
        };
      }
      
      // Remove the terminator
      literals.pop();
      
      if (literals.length === 0) {
        return {
          success: false,
          error: `Empty clause (line ${i + 1})`
        };
      }
      
      // Convert literals to our Clause format
      const clause: Clause = literals.map(lit => {
        if (lit === 0) {
          return {
            success: false,
            error: `Zero literal in middle of clause (line ${i + 1})`
          } as any; // Will be caught below
        }
        
        const varNum = Math.abs(lit);
        if (varNum > numVariables) {
          return {
            success: false,
            error: `Variable ${varNum} exceeds declared ${numVariables} (line ${i + 1})`
          } as any; // Will be caught below
        }
        
        const point: Point = calculateSpiralPoint(varNum);
        return {
          city: point,
          positive: lit > 0
        };
      });
      
      // Check for errors in literal conversion
      for (const literal of clause) {
        if ('error' in (literal as any)) {
          return literal as any;
        }
      }
      
      clauses.push(clause);
    }
    
    // Validation
    if (!problemLineFound) {
      return {
        success: false,
        error: 'No problem line found (p cnf <vars> <clauses>)'
      };
    }
    
    if (clauses.length !== numClauses) {
      warnings.push(`Expected ${numClauses} clauses but found ${clauses.length}`);
    }
    
    // Create CNF problem
    const problem: CNFProblem = {
      numVariables,
      clauses,
      description: `User-uploaded DIMACS CNF: ${numVariables} variables, ${clauses.length} clauses`,
      hasCertificate: false,
      problemSource: 'user-uploaded',
      tag: 'SAT'
    };
    
    return {
      success: true,
      problem,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Parse error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Export a CNF problem to DIMACS format
 */
export function exportToDimacs(problem: CNFProblem): string {
  const lines: string[] = [];
  
  // Add header comment
  lines.push('c Generated by Address Is The Map Visualizer');
  if (problem.description) {
    lines.push(`c ${problem.description}`);
  }
  if (problem.realWorldContext) {
    lines.push(`c Context: ${problem.realWorldContext}`);
  }
  lines.push('c');
  
  // Add problem line
  lines.push(`p cnf ${problem.numVariables} ${problem.clauses.length}`);
  
  // Add clauses
  for (const clause of problem.clauses) {
    const literals = clause.map(lit => {
      const sign = lit.positive ? '' : '-';
      return `${sign}${lit.city.num}`;
    });
    lines.push(`${literals.join(' ')} 0`);
  }
  
  return lines.join('\n');
}

/**
 * Validate DIMACS format without full parsing (quick check)
 */
export function validateDimacsFormat(content: string): { valid: boolean; error?: string } {
  const lines = content.trim().split('\n');
  let hasProblemLine = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('c')) continue;
    
    if (trimmed.startsWith('p')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length !== 4 || parts[1] !== 'cnf') {
        return { valid: false, error: 'Invalid problem line format' };
      }
      hasProblemLine = true;
      break;
    }
  }
  
  if (!hasProblemLine) {
    return { valid: false, error: 'No problem line found (p cnf ...)' };
  }
  
  return { valid: true };
}


