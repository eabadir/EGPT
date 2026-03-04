import React, { useMemo } from 'react';
import type { OverlayProps } from './types';
import { isSudokuProblem, extractSudokuFromCNF } from '../../utils/sudokuDetector';

export const SudokuOverlay: React.FC<OverlayProps> = ({
  problem,
  certificate,
  viewBox,
}) => {
  // Extract Sudoku puzzle and solution
  const sudokuData = useMemo(() => {
    if (!problem || !isSudokuProblem(problem)) {
      return null;
    }
    
    return extractSudokuFromCNF(problem, certificate || undefined);
  }, [problem, certificate]);

  if (!sudokuData) {
    return null;
  }

  const { puzzle, solution } = sudokuData;
  
  // Calculate grid size and position
  const [vbMinX, vbMinY, vbWidth, vbHeight] = viewBox;
  const gridSize = Math.min(vbWidth, vbHeight) * 0.6; // 60% of smaller dimension
  const cellSize = gridSize / 9;
  const gridX = vbMinX + vbWidth / 2 - gridSize / 2;
  const gridY = vbMinY + vbHeight / 2 - gridSize / 2;

  // Render a single cell
  const renderCell = (row: number, col: number) => {
    const x = gridX + col * cellSize;
    const y = gridY + row * cellSize;
    const value = solution?.[row]?.[col] || puzzle[row][col];
    const isGiven = puzzle[row][col] > 0;
    const isSolution = solution && solution[row][col] > 0 && !isGiven;
    
    // Box border logic (thicker lines between 3x3 boxes)
    const isBoxLeft = col % 3 === 0;
    const isBoxTop = row % 3 === 0;
    
    return (
      <g key={`cell-${row}-${col}`}>
        {/* Cell background */}
        <rect
          x={x}
          y={y}
          width={cellSize}
          height={cellSize}
          fill={isSolution ? '#1e293b' : '#0f172a'}
          stroke={isGiven ? '#3b82f6' : '#334155'}
          strokeWidth={isBoxLeft || isBoxTop ? '0.15' : '0.05'}
          className="sudoku-cell"
        />
        
        {/* Cell value */}
        {value > 0 && (
          <text
            x={x + cellSize / 2}
            y={y + cellSize / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={cellSize * 0.4}
            fill={isGiven ? '#60a5fa' : '#94a3b8'}
            fontWeight={isGiven ? 'bold' : 'normal'}
            className="sudoku-value"
          >
            {value}
          </text>
        )}
      </g>
    );
  };

  return (
    <g className="sudoku-overlay pointer-events-none">
      {/* Outer border */}
      <rect
        x={gridX}
        y={gridY}
        width={gridSize}
        height={gridSize}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="0.2"
        rx="0.5"
      />
      
      {/* Render all cells */}
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => renderCell(row, col))
      )}
      
      {/* Box dividers (thick lines between 3x3 boxes) */}
      <g stroke="#3b82f6" strokeWidth="0.2">
        {/* Vertical dividers */}
        <line x1={gridX + 3 * cellSize} y1={gridY} x2={gridX + 3 * cellSize} y2={gridY + gridSize} />
        <line x1={gridX + 6 * cellSize} y1={gridY} x2={gridX + 6 * cellSize} y2={gridY + gridSize} />
        
        {/* Horizontal dividers */}
        <line x1={gridX} y1={gridY + 3 * cellSize} x2={gridX + gridSize} y2={gridY + 3 * cellSize} />
        <line x1={gridX} y1={gridY + 6 * cellSize} x2={gridX + gridSize} y2={gridY + 6 * cellSize} />
      </g>
      
      {/* Title/Label */}
      <text
        x={gridX + gridSize / 2}
        y={gridY - 0.5}
        textAnchor="middle"
        fontSize={cellSize * 0.3}
        fill="#60a5fa"
        fontWeight="bold"
        className="sudoku-title"
      >
        Sudoku Puzzle
      </text>
    </g>
  );
};


