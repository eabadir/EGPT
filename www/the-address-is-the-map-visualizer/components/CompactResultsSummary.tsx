import React, { useMemo } from 'react';
import type { CNFProblem, SolverResult, Certificate } from '../types';

interface CompactResultsSummaryProps {
  problem: CNFProblem | null;
  result: SolverResult | null;
  certificate: Certificate | null;
}

export const CompactResultsSummary: React.FC<CompactResultsSummaryProps> = ({
  problem,
  result,
  certificate
}) => {
  const analysis = useMemo(() => {
    if (!problem || !result) return null;

    const n2Bound = problem.numVariables * problem.numVariables;
    const exponential = Math.pow(2, problem.numVariables);
    const exceedsN2 = result.iterations > n2Bound;
    const ratio = (result.iterations / n2Bound).toFixed(2);
    const percentOfExponential = ((result.iterations / exponential) * 100).toFixed(2);

    return {
      n2Bound,
      exponential,
      exceedsN2,
      ratio,
      percentOfExponential,
      isInP: !exceedsN2 && result.found
    };
  }, [problem, result]);

  if (!problem || !result || !analysis) {
    return null;
  }

  // Determine status styling
  let statusBg = 'bg-green-900/40';
  let statusBorder = 'border-green-500';
  let statusIcon = '✓';
  let statusText = 'SAT - Within N² Bound';
  let statusColor = 'text-green-400';
  let notP = '';

  if (result.timeoutReached) {
    statusBg = 'bg-red-900/50';
    statusBorder = 'border-red-600';
    statusIcon = '✗';
    statusText = 'TIMEOUT';
    statusColor = 'text-red-400';
    notP = ' (Not P)';
  } else if (!result.found) {
    statusBg = 'bg-blue-900/40';
    statusBorder = 'border-blue-500';
    statusIcon = 'ℹ';
    statusText = 'UNSAT - No Solution';
    statusColor = 'text-blue-400';
  } else if (analysis.exceedsN2) {
    statusBg = 'bg-red-900/40';
    statusBorder = 'border-red-500';
    statusIcon = '⚠️';
    statusText = 'SAT - Exceeded N² Bound';
    statusColor = 'text-red-400';
    notP = ' (Not P)';
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      {/* Status Banner */}
      <div className={`${statusBg} border-b-2 ${statusBorder} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`text-2xl ${statusColor}`}>{statusIcon}</span>
            <span className={`text-base font-bold ${statusColor}`}>
              {statusText}{notP}
            </span>
          </div>
          <div className="text-right">
            <div className={`text-xl font-mono font-bold ${statusColor}`}>
              {result.iterations.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">iterations</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Compact Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className={`rounded p-2 ${analysis.exceedsN2 || result.timeoutReached ? 'bg-red-900/30 border border-red-500/50' : 'bg-slate-900/50'}`}>
            <div className="text-xs text-slate-400 mb-1">Iterations</div>
            <div className={`text-lg font-mono font-bold ${analysis.exceedsN2 || result.timeoutReached ? 'text-red-400' : 'text-slate-200'}`}>
              {result.iterations.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded p-2">
            <div className="text-xs text-slate-400 mb-1">N² Bound</div>
            <div className="text-lg font-mono font-bold text-green-400">
              {analysis.n2Bound}
            </div>
            <div className="text-xs text-slate-500">({problem.numVariables}²)</div>
          </div>
          <div className="bg-slate-900/50 rounded p-2">
            <div className="text-xs text-slate-400 mb-1">Time</div>
            <div className="text-lg font-mono font-bold text-slate-200">
              {result.timeMs.toFixed(2)}ms
            </div>
          </div>
        </div>


        {/* EGPT Insight */}
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-2">
          <div className="flex items-start space-x-2">
            <span className="text-emerald-400 text-sm">💡</span>
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">EGPT Insight:</span>{' '}
              With bijective encoding (Address Is The Map), this would require at most{' '}
              <span className="font-mono font-bold text-emerald-400">{analysis.n2Bound}</span> operations
              {analysis.exceedsN2 && (
                <> - that's <span className="font-bold text-emerald-400">{analysis.ratio}x faster</span> than brute force</>
              )}.
            </div>
          </div>
        </div>

        {/* Certificate Info (if available) */}
        {certificate && (
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
            Certificate complexity: <span className="font-mono text-emerald-400">{certificate.complexity}</span>
            {' • '}
            All {problem.clauses.length} clauses satisfied
          </div>
        )}
      </div>
    </div>
  );
};

