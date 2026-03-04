import React, { useState, useCallback } from 'react';
import type { CNFProblem, SolverResult } from '../types';
import { getAvailableSolvers, runSolverWithTimeout } from '../solvers/BruteForceSolver';

interface SolverInterfaceProps {
  problem: CNFProblem | null;
  onResult: (result: SolverResult) => void;
  onStartSolving: () => void;
  onCompleteSolving: () => void;
  isSolving: boolean;
}

export const SolverInterface: React.FC<SolverInterfaceProps> = ({
  problem,
  onResult,
  onStartSolving,
  onCompleteSolving,
  isSolving
}) => {
  const [selectedSolver, setSelectedSolver] = useState<string>('Brute Force');

  const availableSolvers = getAvailableSolvers();

  const runSolver = useCallback(async () => {
    if (!problem) return;

    onStartSolving();

    try {
      const solver = availableSolvers.find(s => s.name === selectedSolver);
      if (!solver) return;
      
      // Calculate N² timeout threshold
      const nSquaredBound = problem.numVariables * problem.numVariables;
      const timeoutMs = Math.min(5000, nSquaredBound * 5); // 5ms per N² operation, max 5 seconds
      
      const result = await runSolverWithTimeout(solver, problem, timeoutMs);
      
      // Add timeout information to result
      if (result.timeMs >= timeoutMs * 0.95) { // If we used 95% of timeout
        result.timeoutReached = true;
        result.timeoutMs = timeoutMs;
      }

      onResult(result);
    } catch (error) {
      console.error('Solver error:', error);
      const errorResult: SolverResult = {
        found: false,
        iterations: 0,
        timeMs: 0
      };
      onResult(errorResult);
    } finally {
      onCompleteSolving();
    }
  }, [problem, selectedSolver, availableSolvers, onResult, onStartSolving, onCompleteSolving]);

  if (!problem) {
    return (
      <div className="text-center text-slate-400 text-sm p-4">
        <p>Select a problem first</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Solver Selection Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Select Solver
        </label>
        <select
          value={selectedSolver}
          onChange={(e) => setSelectedSolver(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          disabled={isSolving}
        >
          {availableSolvers.map((solver) => (
            <option key={solver.name} value={solver.name}>
              {solver.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">
          {availableSolvers.find(s => s.name === selectedSolver)?.description}
        </p>
      </div>

      {/* Run Button */}
      <button
        onClick={runSolver}
        disabled={isSolving || !problem}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
          isSolving || !problem
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
        }`}
      >
        {isSolving ? (
          <span className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Solving...</span>
          </span>
        ) : (
          'Run Solver'
        )}
      </button>

      {/* Quick Info */}
      {problem && !isSolving && (
        <div className="bg-slate-900/50 rounded p-3 text-xs text-slate-400 space-y-1">
          <p>
            <span className="text-slate-500">Timeout:</span>{' '}
            <span className="font-mono text-slate-300">
              {Math.min(5000, problem.numVariables * problem.numVariables * 5)}ms
            </span>
            {' '}(N² × 5ms)
          </p>
          <p>
            <span className="text-slate-500">Max iterations:</span>{' '}
            <span className="font-mono text-slate-300">
              {Math.pow(2, problem.numVariables).toLocaleString()}
            </span>
            {' '}(2^N)
          </p>
        </div>
      )}
    </div>
  );
};
