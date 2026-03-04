import React from 'react';
import type { CNFProblem, SolverResult } from '../types';
import { exampleProblems } from '../examples/problems';

interface CurrentProblemSummaryProps {
  problem: CNFProblem | null;
  solverResult: SolverResult | null;
}

export const CurrentProblemSummary: React.FC<CurrentProblemSummaryProps> = ({
  problem,
  solverResult
}) => {
  if (!problem) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Current Problem</h3>
        <p className="text-sm text-slate-400">No problem selected. Choose an example or create a custom problem.</p>
      </div>
    );
  }

  // Find if this is an example problem with verified metadata
  const exampleProblem = exampleProblems.find(
    ex => ex.problem.description === problem.description &&
          ex.problem.numVariables === problem.numVariables &&
          ex.problem.clauses.length === problem.clauses.length
  );

  const getDifficultyStars = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      case 'extreme': return '⭐⭐⭐⭐';
      default: return '';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
      <h3 className="text-base font-semibold text-slate-300 mb-2">Current Problem</h3>
      
      <div className="space-y-2 text-sm">
        {/* Problem Name */}
        <div>
          <p className="font-semibold text-emerald-300">
            {problem.description || `${problem.numVariables}-SAT Problem`}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <span>
            <span className="font-semibold text-slate-300">{problem.numVariables}</span> variables
          </span>
          <span>•</span>
          <span>
            <span className="font-semibold text-slate-300">{problem.clauses.length}</span> clauses
          </span>
          <span>•</span>
          <span>
            Density: <span className="font-semibold text-slate-300">
              {(problem.clauses.length / problem.numVariables).toFixed(2)}
            </span>
          </span>
        </div>

        {/* Solver Info */}
        {solverResult && (
          <div className="text-xs text-slate-400">
            <span className="text-slate-500">Solver:</span>{' '}
            <span className="font-semibold text-slate-300">Brute Force</span>
          </div>
        )}

        {/* Difficulty and Expected Behavior */}
        {exampleProblem && (
          <div className="pt-2 border-t border-slate-700 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Difficulty:</span>
              <span className={`font-semibold capitalize ${getDifficultyColor(exampleProblem.difficulty)}`}>
                {getDifficultyStars(exampleProblem.difficulty)} {exampleProblem.difficulty}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              <span className="text-slate-500">Expected:</span>{' '}
              {exampleProblem.verified.bruteForceSolves ? 'SAT' : 'UNSAT'} in ~
              <span className="font-mono font-semibold text-slate-300">
                {exampleProblem.verified.expectedIterations.toLocaleString()}
              </span> iterations
            </div>
          </div>
        )}
      </div>
    </div>
  );
};







