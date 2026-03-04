import type { CNFProblem, Certificate } from '../types';
import type { SudokuGrid } from '../tools/sudokuDimacsGenerator';
import { getCellFromVariable } from '../tools/sudokuDimacsGenerator';

/**
 * Detect if a CNF problem is a Sudoku encoding
 * @param problem CNF problem to check
 * @returns true if problem appears to be a Sudoku encoding
 */
export function isSudokuProblem(problem: CNFProblem): boolean {
  // Sudoku uses exactly 729 variables (9×9×9)
  if (problem.numVariables !== 729) {
    return false;
  }
  
  // Additional validation: check if clause count is in expected range
  // Standard Sudoku encoding has ~11,988 base constraints
  // With clues, it could be 11,988 to ~12,000+ clauses
  // We'll be lenient and accept anything in a reasonable range
  const expectedBaseClauses = 11988; // Base constraints without clues
  const clueClauses = problem.clauses.length - expectedBaseClauses;
  
  // If we have a reasonable number of clauses (base + up to 81 clues)
  if (problem.clauses.length >= expectedBaseClauses && problem.clauses.length <= expectedBaseClauses + 81) {
    return true;
  }
  
  // Also check if description mentions Sudoku
  if (problem.description?.toLowerCase().includes('sudoku')) {
    return true;
  }
  
  // Check if realWorldContext mentions Sudoku
  if (problem.realWorldContext?.toLowerCase().includes('sudoku')) {
    return true;
  }
  
  return false;
}

/**
 * Extract Sudoku puzzle and solution from CNF problem
 * @param problem CNF problem (should be a Sudoku encoding)
 * @param certificate Optional certificate with solution assignment
 * @returns Object with puzzle grid (given cells) and optional solution grid
 */
export function extractSudokuFromCNF(
  problem: CNFProblem,
  certificate?: Certificate
): { puzzle: SudokuGrid; solution?: SudokuGrid } {
  // Initialize empty 9×9 grids
  const puzzle: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
  let solution: SudokuGrid | undefined;
  
  if (certificate) {
    solution = Array(9).fill(null).map(() => Array(9).fill(0));
  }
  
  // Extract clues from unit clauses (single literal clauses)
  for (const clause of problem.clauses) {
    if (clause.length === 1) {
      // This is a unit clause (clue)
      const literal = clause[0];
      if (literal.positive) {
        const varNum = literal.city.num;
        const { row, col, value } = getCellFromVariable(varNum);
        // Convert value index (0-8) to actual value (1-9)
        puzzle[row][col] = value + 1;
        
        // Also set in solution if available
        if (solution) {
          solution[row][col] = value + 1;
        }
      }
    }
  }
  
  // Extract solution from certificate assignment
  if (certificate && certificate.assignment && solution) {
    for (let varNum = 1; varNum <= 729; varNum++) {
      const varIndex = varNum - 1; // Convert to 0-indexed
      if (varIndex < certificate.assignment.length && certificate.assignment[varIndex]) {
        const { row, col, value } = getCellFromVariable(varNum);
        // Only set if not already set from clues (clues take precedence)
        if (solution[row][col] === 0) {
          solution[row][col] = value + 1;
        }
      }
    }
  }
  
  return { puzzle, solution };
}


