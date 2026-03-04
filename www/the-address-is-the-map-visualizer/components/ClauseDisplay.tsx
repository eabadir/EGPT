import React, { useMemo } from 'react';
import type { CNFProblem, Certificate } from '../types';
import { getClauseSatisfaction, formatLiteral } from '../utils/clauseUtils';

interface ClauseDisplayProps {
  problem: CNFProblem | null;
  certificate: Certificate | null;
  isSolving: boolean;
}

export const ClauseDisplay: React.FC<ClauseDisplayProps> = ({
  problem,
  certificate,
  isSolving
}) => {
  const satisfaction = useMemo(() => {
    if (!problem) return [];
    return getClauseSatisfaction(problem, certificate);
  }, [problem, certificate]);

  if (!problem || problem.clauses.length === 0) {
    return (
      <div className="text-center text-slate-400 text-sm p-4">
        <p>No clauses to display. Load or generate a problem first.</p>
      </div>
    );
  }

  const allSatisfied = satisfaction.every(s => s.satisfied);
  const numSatisfied = satisfaction.filter(s => s.satisfied).length;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          CNF Clauses ({problem.clauses.length})
        </h3>
        {certificate && (
          <div className={`text-xs font-semibold px-2 py-1 rounded ${
            allSatisfied 
              ? 'bg-green-900/30 text-green-400 border border-green-500/50'
              : 'bg-red-900/30 text-red-400 border border-red-500/50'
          }`}>
            {numSatisfied}/{problem.clauses.length} Satisfied
          </div>
        )}
      </div>

      {/* Clause List */}
      <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
        {problem.clauses.map((clause, idx) => {
          const { satisfied, witnessIndex } = satisfaction[idx];
          
          return (
            <div
              key={idx}
              className={`p-2 rounded text-xs font-mono transition-all ${
                certificate
                  ? satisfied
                    ? 'bg-green-900/20 border border-green-500/30'
                    : 'bg-red-900/20 border border-red-500/30'
                  : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              <div className="flex items-start gap-2">
                {/* Status Icon */}
                <span className="flex-shrink-0 mt-0.5">
                  {certificate ? (
                    satisfied ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )
                  ) : (
                    <span className="text-slate-500">{idx + 1}.</span>
                  )}
                </span>

                {/* Clause */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1">
                    {clause.map((literal, litIdx) => {
                      const isWitness = satisfied && witnessIndex === litIdx;
                      return (
                        <React.Fragment key={litIdx}>
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              isWitness
                                ? 'bg-yellow-500/30 text-yellow-200 font-bold ring-1 ring-yellow-400/50'
                                : literal.positive
                                ? 'text-cyan-300'
                                : 'text-pink-300'
                            }`}
                          >
                            {formatLiteral(literal)}
                          </span>
                          {litIdx < clause.length - 1 && (
                            <span className="text-slate-500">∨</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  
                  {/* Witness indicator */}
                  {satisfied && witnessIndex >= 0 && (
                    <div className="mt-1 text-[10px] text-yellow-400/80">
                      Witness: {formatLiteral(clause[witnessIndex])}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Solving indicator */}
      {isSolving && (
        <div className="text-center text-sm text-slate-400 animate-pulse">
          Solving...
        </div>
      )}
    </div>
  );
};



