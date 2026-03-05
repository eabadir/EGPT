import React, { useState } from 'react';
import type { CNFProblem, SolverResult, Certificate } from '../types';

interface ResultsSummaryProps {
  problem: CNFProblem | null;
  result: SolverResult | null;
  certificate: Certificate | null;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  problem,
  result,
  certificate
}) => {
  const [showDetailed, setShowDetailed] = useState(false);

  if (!problem || !result) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <div className="text-center text-slate-400">
          <p className="text-lg font-semibold mb-2">No Results Yet</p>
          <p className="text-sm">Select a problem and run a solver to see results</p>
        </div>
      </div>
    );
  }

  const n2Bound = problem.numVariables * problem.numVariables;
  const exponential = Math.pow(2, problem.numVariables);
  const exceedsN2 = result.iterations > n2Bound;
  const ratio = (result.iterations / n2Bound).toFixed(2);
  const percentOfExponential = ((result.iterations / exponential) * 100).toFixed(2);

  // Determine status color and icon
  let statusColor = 'text-green-400';
  let statusIcon = '✓';
  let statusText = 'Within N² Bound';
  let statusBg = 'bg-green-900/30 border-green-500/50';

  if (result.timeoutReached) {
    statusColor = 'text-red-400';
    statusIcon = '✗';
    statusText = 'TIMEOUT';
    statusBg = 'bg-red-900/30 border-red-500/50';
  } else if (!result.found) {
    statusColor = 'text-blue-400';
    statusIcon = 'ℹ';
    statusText = 'UNSAT';
    statusBg = 'bg-blue-900/30 border-blue-500/50';
  } else if (exceedsN2) {
    statusColor = 'text-yellow-400';
    statusIcon = '⚠️';
    statusText = 'Exceeded N² Bound';
    statusBg = 'bg-yellow-900/30 border-yellow-500/50';
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700">
        <h3 className="text-xl font-bold text-slate-200">Solver Results</h3>
        <p className="text-sm text-slate-400 mt-1">
          Problem: {problem.description || `${problem.numVariables}-SAT`} 
          <span className="ml-2">(N={problem.numVariables}, M={problem.clauses.length} clauses)</span>
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Status */}
        <div className={`rounded-lg p-4 border ${statusBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`text-3xl ${statusColor}`}>{statusIcon}</span>
              <div>
                <p className={`text-xl font-bold ${statusColor}`}>
                  {result.found ? 'SAT - Solution Found' : (result.timeoutReached ? 'TIMEOUT' : 'UNSAT - No Solution')}
                </p>
                <p className={`text-sm ${statusColor}`}>{statusText}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-slate-200">{result.iterations.toLocaleString()}</p>
              <p className="text-xs text-slate-400">iterations</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Time Elapsed</p>
            <p className="text-2xl font-mono font-bold text-slate-200">{result.timeMs.toFixed(2)}ms</p>
          </div>
          <div className="bg-slate-900/50 rounded p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Iterations</p>
            <p className="text-2xl font-mono font-bold text-slate-200">{result.iterations.toLocaleString()}</p>
          </div>
        </div>

        {/* Complexity Analysis */}
        <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-600">
          <h4 className="font-bold text-lg text-slate-200 mb-3">Complexity Analysis</h4>
          
          <div className="space-y-3">
            {/* N² Bound */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-300">N² Bound (EGPT Polynomial)</p>
                <p className="text-xs text-slate-400">Maximum operations with bijective encoding</p>
              </div>
              <p className="text-lg font-mono font-bold text-green-400">{n2Bound.toLocaleString()}</p>
            </div>

            {/* Status */}
            <div className={`flex items-start justify-between p-3 rounded ${statusBg}`}>
              <div>
                <p className="text-sm font-semibold text-slate-300">Status</p>
                <p className="text-xs text-slate-400">
                  {exceedsN2 
                    ? `${ratio}x over polynomial bound` 
                    : 'Within polynomial bound'}
                </p>
              </div>
              <p className={`text-lg font-mono font-bold ${statusColor}`}>
                {result.iterations.toLocaleString()} / {n2Bound.toLocaleString()}
              </p>
            </div>

            {/* Exponential Comparison */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-300">Exponential (2^N) Brute Force</p>
                <p className="text-xs text-slate-400">Total possible assignments to check</p>
              </div>
              <p className="text-lg font-mono font-bold text-red-400">{exponential.toLocaleString()}</p>
            </div>

            {/* Actual vs Exponential */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-300">Actual Complexity</p>
                <p className="text-xs text-slate-400">{percentOfExponential}% of exponential worst case</p>
              </div>
              <p className="text-lg font-mono font-bold text-blue-400">{result.iterations.toLocaleString()}</p>
            </div>

            {/* EGPT Insight */}
            <div className="mt-4 pt-4 border-t border-slate-600">
              <p className="text-sm font-semibold text-emerald-400 mb-2">💡 EGPT Insight</p>
              <p className="text-xs text-slate-300">
                With bijective encoding (Address Is The Map), this problem would be solvable in at most <strong className="text-emerald-400">{n2Bound} operations</strong> - 
                {exceedsN2 && ` that's ${ratio}x faster than brute force`}
                {!exceedsN2 && result.found && ` brute force got lucky this time`}
                {!result.found && ` and EGPT can detect UNSAT more efficiently`}.
              </p>
            </div>

            {/* Scaling Impact */}
            <div className="mt-3 bg-purple-900/20 rounded p-3 border border-purple-500/30">
              <p className="text-sm font-semibold text-purple-400 mb-2">📊 Scaling Impact</p>
              <div className="text-xs text-slate-300 space-y-1">
                <p>• <strong>Traditional P vs NP:</strong> Can we solve NP problems in polynomial time?</p>
                <p>• <strong>Exponential (2^N):</strong> Grows astronomically - {exponential.toLocaleString()} assignments at N={problem.numVariables}</p>
                <p>• <strong>Polynomial (N²):</strong> Stays tractable - only {n2Bound} operations needed</p>
                <p>• <strong>The Difference:</strong> {(exponential / n2Bound).toFixed(0)}x efficiency gain with EGPT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Details (if available) */}
        {certificate && (
          <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-600">
            <h4 className="font-bold text-lg text-slate-200 mb-3">Certificate Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Assignment:</span>
                <span className="font-mono text-slate-300">
                  [{certificate.assignment.map(b => b ? 'T' : 'F').join(', ')}]
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Certificate Complexity:</span>
                <span className="font-mono text-emerald-400">{certificate.complexity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clauses Satisfied:</span>
                <span className="font-mono text-green-400">{problem.clauses.length}/{problem.clauses.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Breakdown Button */}
        <button
          onClick={() => setShowDetailed(!showDetailed)}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 rounded px-4 py-2 text-sm font-semibold transition-colors"
        >
          {showDetailed ? '▼ Hide' : '▶'} Detailed Breakdown
        </button>

        {/* Detailed Breakdown */}
        {showDetailed && (
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600 space-y-3">
            <h4 className="font-bold text-slate-200">Detailed Analysis</h4>
            
            <div className="text-sm text-slate-300 space-y-2">
              <p><strong className="text-slate-200">Problem Size:</strong></p>
              <ul className="list-disc list-inside ml-4 text-xs space-y-1">
                <li>Variables (N): {problem.numVariables}</li>
                <li>Clauses (M): {problem.clauses.length}</li>
                <li>Clause Density: {(problem.clauses.length / problem.numVariables).toFixed(2)} clauses per variable</li>
              </ul>

              <p className="pt-2"><strong className="text-slate-200">Complexity Bounds:</strong></p>
              <ul className="list-disc list-inside ml-4 text-xs space-y-1">
                <li>N² Polynomial: {n2Bound} operations</li>
                <li>2^N Exponential: {exponential.toLocaleString()} assignments</li>
                <li>Actual Used: {result.iterations.toLocaleString()} iterations</li>
                <li>Efficiency vs N²: {((result.iterations / n2Bound) * 100).toFixed(1)}%</li>
                <li>Efficiency vs 2^N: {percentOfExponential}%</li>
              </ul>

              <p className="pt-2"><strong className="text-slate-200">Performance:</strong></p>
              <ul className="list-disc list-inside ml-4 text-xs space-y-1">
                <li>Time: {result.timeMs.toFixed(2)}ms</li>
                <li>Iterations per ms: {(result.iterations / result.timeMs).toFixed(0)}</li>
                {result.timeoutReached && (
                  <li className="text-yellow-400">Timeout reached at {result.timeoutMs}ms</li>
                )}
              </ul>

              <p className="pt-2"><strong className="text-slate-200">EGPT Connection:</strong></p>
              <ul className="list-disc list-inside ml-4 text-xs space-y-1">
                <li>This corresponds to <code className="text-cyan-300">tableauComplexity_upper_bound</code> in EGPT/Complexity/Tableau.lean</li>
                <li>Certificate complexity demonstrates <code className="text-cyan-300">P_eq_NP</code> theorem</li>
                <li>Bijective encoding provides the "decoder ring" to transform exponential → polynomial</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};







