import React from 'react';
import type { CNFProblem, SolverResult, Certificate } from '../types';

interface NPCompleteResultsBadgeProps {
  problem: CNFProblem;
  result: SolverResult | null;
  certificate: Certificate | null;
}

export const NPCompleteResultsBadge: React.FC<NPCompleteResultsBadgeProps> = ({
  problem,
  result,
  certificate
}) => {
  const isNPComplete = problem.hasCertificate;
  const n2Bound = problem.numVariables * problem.numVariables;

  // Determine visual styling based on problem type and solver result
  let problemTypeIcon = '';
  let problemTypeBg = '';
  let problemTypeBorder = '';
  let problemTypeText = '';
  let problemTypeLabel = '';
  let problemTypeSubtext = '';

  if (isNPComplete) {
    problemTypeIcon = '🏆';
    problemTypeBg = 'bg-green-900/30';
    problemTypeBorder = 'border-green-500/50';
    problemTypeText = 'text-green-400';
    problemTypeLabel = 'NP-Complete Problem';
    problemTypeSubtext = '✓ Certificate Provided';
  } else {
    problemTypeIcon = '❓';
    problemTypeBg = 'bg-blue-900/30';
    problemTypeBorder = 'border-blue-500/50';
    problemTypeText = 'text-blue-400';
    problemTypeLabel = 'NP-Uncertified Problem';
    problemTypeSubtext = '⚠ No certificate provided';
  }

  // Determine solver status styling
  let statusBg = 'bg-slate-900/50';
  let statusBorder = 'border-slate-700';
  let statusIcon = '';
  let statusText = '';
  let statusColor = 'text-slate-400';
  let statusDetail = '';

  if (!result) {
    statusIcon = '⏸';
    statusText = 'Not Yet Solved';
    statusDetail = 'Run a solver to see results';
  } else {
    const { status, iterations, found } = result;

    switch (status) {
      case 'polynomial':
        statusBg = 'bg-green-900/40';
        statusBorder = 'border-green-500';
        statusIcon = '✓';
        statusText = isNPComplete ? 'Solved in P-time' : 'SAT - Polynomial Solution';
        statusColor = 'text-green-400';
        statusDetail = `${iterations.toLocaleString()} / ${n2Bound} iterations (within N²)`;
        break;

      case 'exponential':
        statusBg = 'bg-yellow-900/40';
        statusBorder = 'border-yellow-500';
        statusIcon = '⚠';
        statusText = isNPComplete ? 'Solved (Exponential)' : 'SAT - Exceeded N²';
        statusColor = 'text-yellow-400';
        statusDetail = `${iterations.toLocaleString()} / ${n2Bound} iterations (${(iterations / n2Bound).toFixed(1)}x over N²)`;
        break;

      case 'timeout':
        if (isNPComplete) {
          statusBg = 'bg-red-900/40';
          statusBorder = 'border-red-500';
          statusIcon = '⏱';
          statusText = 'Certificate Not Verified';
          statusColor = 'text-red-400';
          statusDetail = 'Timeout reached before completion';
        } else {
          statusBg = 'bg-orange-900/40';
          statusBorder = 'border-orange-500';
          statusIcon = '?';
          statusText = 'Unknown - Timeout';
          statusColor = 'text-orange-400';
          statusDetail = `Explored ${result.exploredSpace.toFixed(1)}% of search space`;
        }
        break;

      case 'proven-unsat':
        statusBg = 'bg-blue-900/40';
        statusBorder = 'border-blue-500';
        statusIcon = '✗';
        statusText = 'UNSAT - Proven Unsatisfiable';
        statusColor = 'text-blue-400';
        statusDetail = `Exhausted all 2^${problem.numVariables} = ${Math.pow(2, problem.numVariables).toLocaleString()} possibilities`;
        break;
    }
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      {/* Problem Type Header */}
      <div className={`${problemTypeBg} border-b-2 ${problemTypeBorder} px-4 py-3`}>
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{problemTypeIcon}</span>
          <div className="flex-1">
            <div className={`text-lg font-bold ${problemTypeText}`}>
              {problemTypeLabel}
            </div>
            <div className="text-sm text-slate-400">{problemTypeSubtext}</div>
          </div>
          {problem.tag && (
            <div className="bg-slate-900/50 px-3 py-1 rounded-full">
              <span className="text-xs font-semibold text-cyan-400">{problem.tag}:</span>
            </div>
          )}
        </div>
      </div>

      {/* Solver Status Section */}
      {result && (
        <div className={`${statusBg} border-b-2 ${statusBorder} px-4 py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`text-2xl ${statusColor}`}>{statusIcon}</span>
              <div>
                <div className={`text-base font-bold ${statusColor}`}>
                  {statusText}
                </div>
                <div className="text-xs text-slate-400">{statusDetail}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-mono font-bold ${statusColor}`}>
                {result.iterations.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">iterations</div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-900/50 rounded p-2">
            <div className="text-xs text-slate-400 mb-1">Variables</div>
            <div className="text-lg font-mono font-bold text-cyan-400">
              {problem.numVariables}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded p-2">
            <div className="text-xs text-slate-400 mb-1">Clauses</div>
            <div className="text-lg font-mono font-bold text-cyan-400">
              {problem.clauses.length}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded p-2">
            <div className="text-xs text-slate-400 mb-1">N² Bound</div>
            <div className="text-lg font-mono font-bold text-green-400">
              {n2Bound}
            </div>
          </div>
        </div>

        {/* EGPT Insight */}
        {result && result.status !== 'timeout' && (
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-3">
            <div className="flex items-start space-x-2">
              <span className="text-emerald-400 text-sm">💡</span>
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-emerald-400">EGPT Insight:</span>{' '}
                {result.status === 'polynomial' ? (
                  <>This problem was solved within the N² bound, demonstrating polynomial-time verification!</>
                ) : result.status === 'exponential' ? (
                  <>With bijective encoding (Address Is The Map), this would require at most{' '}
                  <span className="font-mono font-bold text-emerald-400">{n2Bound}</span> operations
                  - that's <span className="font-bold text-emerald-400">{(result.iterations / n2Bound).toFixed(1)}x faster</span> than this brute force approach.</>
                ) : result.status === 'proven-unsat' ? (
                  <>This problem is proven unsatisfiable - no assignment can satisfy all clauses.</>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Certificate Info */}
        {certificate && result && result.found && (
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span>Certificate verified:</span>
              <span className="text-green-400 font-semibold">✓ All {problem.clauses.length} clauses satisfied</span>
            </div>
            {certificate.complexity > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span>Complexity:</span>
                <span className="font-mono text-emerald-400">{certificate.complexity}</span>
              </div>
            )}
          </div>
        )}

        {/* Problem Info */}
        {problem.description && (
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
            {problem.description}
          </div>
        )}
        
        {problem.realWorldContext && (
          <div className="text-xs text-slate-500 italic">
            Context: {problem.realWorldContext}
          </div>
        )}
      </div>
    </div>
  );
};


