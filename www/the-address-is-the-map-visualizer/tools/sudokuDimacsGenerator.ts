import type { CNFProblem, Clause, Certificate } from '../types';
import { calculateSpiralPoint } from '../hooks/useSquareSpiral';
import { exportToDimacs } from '../utils/dimacsParser';

/**
 * Sudoku DIMACS CNF Generator
 * 
 * Encodes 9×9 Sudoku puzzles as SAT problems in DIMACS format.
 * Uses 729 variables (9 rows × 9 columns × 9 values) where:
 * - Variable x_{r,c,v} means "cell (row r, col c) has value v"
 * - Variable number: (r * 81 + c * 9 + v + 1) for 1-indexed DIMACS
 * 
 * Constraints:
 * 1. Each cell has exactly one value (at least one + at most one)
 * 2. Each row contains each value 1-9 exactly once
 * 3. Each column contains each value 1-9 exactly once
 * 4. Each 3×3 box contains each value 1-9 exactly once
 * 5. Given clues (unit clauses for pre-filled cells)
 */

// Sudoku grid type: 9×9 array, 0 = empty, 1-9 = value
export type SudokuGrid = number[][];

// Sudoku puzzle with solution
export interface SudokuPuzzle {
  puzzle: SudokuGrid;      // Puzzle with some cells empty (0)
  solution: SudokuGrid;    // Complete solution
  cnfProblem: CNFProblem;  // CNF encoding
}

/**
 * Get variable number for cell (row, col) with value
 * @param row 0-8
 * @param col 0-8
 * @param value 0-8 (0 means value 1, 8 means value 9)
 * @returns 1-indexed variable number (1-729)
 */
function getVariableNumber(row: number, col: number, value: number): number {
  return row * 81 + col * 9 + value + 1;
}

/**
 * Convert variable number back to (row, col, value)
 * @param varNum 1-indexed variable number (1-729)
 * @returns {row, col, value} where row,col,value are 0-8
 */
export function getCellFromVariable(varNum: number): { row: number; col: number; value: number } {
  const varIndex = varNum - 1; // Convert to 0-indexed
  const row = Math.floor(varIndex / 81);
  const col = Math.floor((varIndex % 81) / 9);
  const value = varIndex % 9;
  return { row, col, value };
}

/**
 * Generate all Sudoku constraints (without clues)
 * This includes all rules but no specific cell assignments
 */
function generateBaseConstraints(): Clause[] {
  const clauses: Clause[] = [];

  // Constraint 1: Each cell has at least one value (1-9)
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const clause: Clause = [];
      for (let value = 0; value < 9; value++) {
        const varNum = getVariableNumber(row, col, value);
        clause.push({
          city: calculateSpiralPoint(varNum),
          positive: true
        });
      }
      clauses.push(clause);
    }
  }

  // Constraint 2: Each cell has at most one value (pairwise exclusions)
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      for (let v1 = 0; v1 < 9; v1++) {
        for (let v2 = v1 + 1; v2 < 9; v2++) {
          const var1 = getVariableNumber(row, col, v1);
          const var2 = getVariableNumber(row, col, v2);
          clauses.push([
            { city: calculateSpiralPoint(var1), positive: false },
            { city: calculateSpiralPoint(var2), positive: false }
          ]);
        }
      }
    }
  }

  // Constraint 3: Each row contains each value exactly once
  // At least once: each row must have each value somewhere
  for (let row = 0; row < 9; row++) {
    for (let value = 0; value < 9; value++) {
      const clause: Clause = [];
      for (let col = 0; col < 9; col++) {
        const varNum = getVariableNumber(row, col, value);
        clause.push({
          city: calculateSpiralPoint(varNum),
          positive: true
        });
      }
      clauses.push(clause);
    }
  }

  // At most once: each row has each value at most once
  for (let row = 0; row < 9; row++) {
    for (let value = 0; value < 9; value++) {
      for (let col1 = 0; col1 < 9; col1++) {
        for (let col2 = col1 + 1; col2 < 9; col2++) {
          const var1 = getVariableNumber(row, col1, value);
          const var2 = getVariableNumber(row, col2, value);
          clauses.push([
            { city: calculateSpiralPoint(var1), positive: false },
            { city: calculateSpiralPoint(var2), positive: false }
          ]);
        }
      }
    }
  }

  // Constraint 4: Each column contains each value exactly once
  // At least once
  for (let col = 0; col < 9; col++) {
    for (let value = 0; value < 9; value++) {
      const clause: Clause = [];
      for (let row = 0; row < 9; row++) {
        const varNum = getVariableNumber(row, col, value);
        clause.push({
          city: calculateSpiralPoint(varNum),
          positive: true
        });
      }
      clauses.push(clause);
    }
  }

  // At most once
  for (let col = 0; col < 9; col++) {
    for (let value = 0; value < 9; value++) {
      for (let row1 = 0; row1 < 9; row1++) {
        for (let row2 = row1 + 1; row2 < 9; row2++) {
          const var1 = getVariableNumber(row1, col, value);
          const var2 = getVariableNumber(row2, col, value);
          clauses.push([
            { city: calculateSpiralPoint(var1), positive: false },
            { city: calculateSpiralPoint(var2), positive: false }
          ]);
        }
      }
    }
  }

  // Constraint 5: Each 3×3 box contains each value exactly once
  // Box coordinates: boxRow, boxCol (0-2 each)
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      // At least once
      for (let value = 0; value < 9; value++) {
        const clause: Clause = [];
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = boxRow * 3 + i;
            const col = boxCol * 3 + j;
            const varNum = getVariableNumber(row, col, value);
            clause.push({
              city: calculateSpiralPoint(varNum),
              positive: true
            });
          }
        }
        clauses.push(clause);
      }

      // At most once
      for (let value = 0; value < 9; value++) {
        const cells: Array<[number, number]> = [];
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            cells.push([boxRow * 3 + i, boxCol * 3 + j]);
          }
        }
        // Pairwise exclusions within the box
        for (let idx1 = 0; idx1 < cells.length; idx1++) {
          for (let idx2 = idx1 + 1; idx2 < cells.length; idx2++) {
            const [row1, col1] = cells[idx1];
            const [row2, col2] = cells[idx2];
            const var1 = getVariableNumber(row1, col1, value);
            const var2 = getVariableNumber(row2, col2, value);
            clauses.push([
              { city: calculateSpiralPoint(var1), positive: false },
              { city: calculateSpiralPoint(var2), positive: false }
            ]);
          }
        }
      }
    }
  }

  return clauses;
}

/**
 * Add unit clauses for given puzzle cells
 * @param puzzle 9×9 grid with 0 for empty, 1-9 for given values
 * @returns Array of unit clauses (single literal clauses)
 */
function generateClueClauses(puzzle: SudokuGrid): Clause[] {
  const clauses: Clause[] = [];
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = puzzle[row][col];
      if (value > 0 && value <= 9) {
        // Convert 1-9 to 0-8 index
        const valueIndex = value - 1;
        const varNum = getVariableNumber(row, col, valueIndex);
        clauses.push([
          { city: calculateSpiralPoint(varNum), positive: true }
        ]);
      }
    }
  }
  
  return clauses;
}

/**
 * Generate Sudoku constraints as CNF problem
 * @param puzzle Optional 9×9 puzzle grid (0 for empty, 1-9 for given values)
 * @returns CNFProblem with all Sudoku constraints
 */
export function generateSudokuConstraints(puzzle?: SudokuGrid): CNFProblem {
  const baseClauses = generateBaseConstraints();
  let clueClauses: Clause[] = [];
  let description = 'Sudoku problem: Complete constraint encoding';
  
  if (puzzle) {
    clueClauses = generateClueClauses(puzzle);
    const clueCount = clueClauses.length;
    description = `Sudoku problem with ${clueCount} given cells`;
  }
  
  const allClauses = [...baseClauses, ...clueClauses];
  
  return {
    numVariables: 729, // 9 × 9 × 9
    clauses: allClauses,
    description,
    hasCertificate: false,
    problemSource: 'user-generated',
    tag: 'SAT',
    suggestedOverlay: 'circuit',
    realWorldContext: '9×9 Sudoku puzzle as SAT problem'
  };
}

/**
 * Check if a value can be placed in a cell without violating Sudoku rules
 */
function isValidPlacement(grid: SudokuGrid, row: number, col: number, value: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === value) return false;
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === value) return false;
  }
  
  // Check box
  const boxRow = Math.floor(row / 3);
  const boxCol = Math.floor(col / 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = boxRow * 3 + i;
      const c = boxCol * 3 + j;
      if (r !== row && c !== col && grid[r][c] === value) return false;
    }
  }
  
  return true;
}

/**
 * Solve Sudoku using backtracking (for generating complete solutions)
 */
function solveSudoku(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        // Try each value 1-9
        for (let value = 1; value <= 9; value++) {
          if (isValidPlacement(grid, row, col, value)) {
            grid[row][col] = value;
            if (solveSudoku(grid)) {
              return true;
            }
            grid[row][col] = 0; // Backtrack
          }
        }
        return false; // No valid value found
      }
    }
  }
  return true; // All cells filled
}

/**
 * Generate a complete valid Sudoku solution
 */
function generateCompleteSolution(): SudokuGrid {
  // Create an empty grid
  const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
  
  // Fill with a valid solution
  // We'll use a known valid pattern and shuffle
  const pattern = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 4, 5, 6, 7, 8, 9, 1],
    [5, 6, 7, 8, 9, 1, 2, 3, 4],
    [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [3, 4, 5, 6, 7, 8, 9, 1, 2],
    [6, 7, 8, 9, 1, 2, 3, 4, 5],
    [9, 1, 2, 3, 4, 5, 6, 7, 8]
  ];
  
  // Randomize rows, columns, and values for variety
  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const cols = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Shuffle arrays
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  for (let i = cols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cols[i], cols[j]] = [cols[j], cols[i]];
  }
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  
  // Build grid with shuffled pattern
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const origRow = rows[r];
      const origCol = cols[c];
      const origValue = pattern[origRow][origCol];
      const newValue = values[origValue - 1];
      grid[r][c] = newValue;
    }
  }
  
  return grid;
}

/**
 * Remove cells from a complete solution to create a puzzle
 * @param solution Complete Sudoku solution
 * @param difficulty Number of cells to remove (17-60 typically)
 */
function createPuzzleFromSolution(solution: SudokuGrid, difficulty: number): SudokuGrid {
  const puzzle = solution.map(row => [...row]); // Deep copy
  
  // Remove cells randomly
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      cells.push([r, c]);
    }
  }
  
  // Shuffle cells
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  
  // Remove first 'difficulty' cells
  for (let i = 0; i < difficulty && i < cells.length; i++) {
    const [r, c] = cells[i];
    puzzle[r][c] = 0;
  }
  
  return puzzle;
}

/**
 * Convert solution grid to certificate assignment (boolean array for 729 variables)
 */
function solutionToCertificate(solution: SudokuGrid): boolean[] {
  const assignment: boolean[] = new Array(729).fill(false);
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = solution[row][col];
      if (value >= 1 && value <= 9) {
        const valueIndex = value - 1; // Convert 1-9 to 0-8
        const varNum = getVariableNumber(row, col, valueIndex);
        assignment[varNum - 1] = true; // Convert to 0-indexed
      }
    }
  }
  
  return assignment;
}

/**
 * Generate witness literals for certificate
 * For each clause, find which literal is satisfied by the assignment
 */
function computeWitnessLiterals(problem: CNFProblem, assignment: boolean[]): number[] {
  const witnessLiterals: number[] = [];
  
  for (const clause of problem.clauses) {
    let found = false;
    for (let i = 0; i < clause.length; i++) {
      const lit = clause[i];
      const varIndex = lit.city.num - 1; // Convert to 0-indexed
      const isTrue = lit.positive ? assignment[varIndex] : !assignment[varIndex];
      
      if (isTrue) {
        witnessLiterals.push(i);
        found = true;
        break;
      }
    }
    if (!found) {
      // Should not happen for valid certificate, but default to 0
      witnessLiterals.push(0);
    }
  }
  
  return witnessLiterals;
}

/**
 * Generate a random Sudoku puzzle with solution
 * @param difficulty Optional difficulty level ('easy', 'medium', 'hard') or number of clues
 * @returns Sudoku puzzle with CNF encoding and certificate
 */
export function generateRandomSudokuPuzzle(difficulty: 'easy' | 'medium' | 'hard' | number = 'medium'): SudokuPuzzle {
  // Determine number of clues based on difficulty
  let clues: number;
  if (typeof difficulty === 'number') {
    clues = Math.max(17, Math.min(81, difficulty)); // Minimum 17 for valid puzzle
  } else {
    const difficultyMap = {
      'easy': 45,      // ~36 cells to fill
      'medium': 35,    // ~46 cells to fill
      'hard': 25       // ~56 cells to fill
    };
    clues = difficultyMap[difficulty];
  }
  
  const cellsToRemove = 81 - clues;
  
  // Generate complete solution
  const solution = generateCompleteSolution();
  
  // Create puzzle by removing cells
  const puzzle = createPuzzleFromSolution(solution, cellsToRemove);
  
  // Generate CNF problem
  const cnfProblem = generateSudokuConstraints(puzzle);
  
  // Create certificate from solution
  const assignment = solutionToCertificate(solution);
  const witnessLiterals = computeWitnessLiterals(cnfProblem, assignment);
  
  const certificate: Certificate = {
    assignment,
    witnessLiterals,
    complexity: cnfProblem.clauses.length * cnfProblem.numVariables
  };
  
  cnfProblem.hasCertificate = true;
  cnfProblem.certificate = certificate;
  cnfProblem.description = `Sudoku puzzle (${difficulty}): ${clues} clues, ${cellsToRemove} cells to fill`;
  
  return {
    puzzle,
    solution,
    cnfProblem
  };
}

/**
 * Export Sudoku CNF problem to DIMACS format
 * This is a convenience wrapper around exportToDimacs
 * @param cnfProblem CNF problem from Sudoku encoding
 * @returns DIMACS format string
 */
export function exportSudokuToDimacs(cnfProblem: CNFProblem): string {
  return exportToDimacs(cnfProblem);
}

