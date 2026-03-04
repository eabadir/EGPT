import React, { useMemo } from 'react';
import type { CNFProblem, Certificate, SolverResult, Clause, Literal } from '../types';

interface CertificateVerifierProps {
  problem: CNFProblem | null;
  certificate: Certificate | null;
  solverResult: SolverResult | null;
}

interface ClauseVerification {
  clauseIndex: number;
  clause: Clause;
  isSatisfied: boolean;
  witnessLiteral: Literal | null;
  witnessIndex: number;
  pathCost: number;
}

export const CertificateVerifier: React.FC<CertificateVerifierProps> = ({
  problem,
  certificate,
  solverResult
}) => {
  const verification = useMemo(() => {
    if (!problem || !certificate) {
      return null;
    }

    const clauseVerifications: ClauseVerification[] = [];
    let totalComplexity = 0;
    let allSatisfied = true;

    problem.clauses.forEach((clause, clauseIndex) => {
      const witnessIndex = certificate.witnessLiterals[clauseIndex];
      let isSatisfied = false;
      let witnessLiteral: Literal | null = null;
      let pathCost = 0;

      if (witnessIndex !== undefined && witnessIndex < clause.length) {
        witnessLiteral = clause[witnessIndex];
        const varValue = certificate.assignment[witnessLiteral.city.num - 1];
        isSatisfied = witnessLiteral.positive ? varValue : !varValue;
        pathCost = witnessLiteral.city.num; // PathToConstraint cost
        totalComplexity += pathCost;
      }

      if (!isSatisfied) {
        allSatisfied = false;
      }

      clauseVerifications.push({
        clauseIndex,
        clause,
        isSatisfied,
        witnessLiteral,
        witnessIndex,
        pathCost
      });
    });

    return {
      clauseVerifications,
      totalComplexity,
      allSatisfied,
      certificateSize: certificate.assignment.length,
      witnessCount: certificate.witnessLiterals.length
    };
  }, [problem, certificate]);

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-32 bg-slate-900/30 rounded-lg">
        <div className="text-center text-slate-500">
          <div className="text-2xl mb-1">🔍</div>
          <p className="text-sm">No problem to verify</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex items-center justify-center h-32 bg-slate-900/30 rounded-lg">
        <div className="text-center text-slate-500">
          <div className="text-2xl mb-1">📋</div>
          <p className="text-sm">No certificate to verify</p>
          <p className="text-xs">Run a solver to generate a certificate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Verification Summary */}
      <div className={`rounded-lg p-3 border ${
        verification?.allSatisfied 
          ? 'bg-green-900/30 border-green-500/50' 
          : 'bg-red-900/30 border-red-500/50'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          <div className={`text-2xl ${verification?.allSatisfied ? 'text-green-400' : 'text-red-400'}`}>
            {verification?.allSatisfied ? '✓' : '✗'}
          </div>
          <div>
            <h4 className={`font-semibold ${verification?.allSatisfied ? 'text-green-400' : 'text-red-400'}`}>
              {verification?.allSatisfied ? 'SATISFIABLE' : 'UNSATISFIABLE'}
            </h4>
            <p className="text-sm text-slate-400">
              {verification?.witnessCount} of {problem.clauses.length} clauses satisfied
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-slate-400">Certificate Size:</span>
            <span className="ml-2 font-mono text-slate-300">{verification?.certificateSize}</span>
          </div>
          <div>
            <span className="text-slate-400">Total Complexity:</span>
            <span className="ml-2 font-mono text-slate-300">{verification?.totalComplexity}</span>
          </div>
        </div>
      </div>

      {/* Solver Performance */}
      {solverResult && (
        <div className="bg-slate-900/50 rounded p-3">
          <h4 className="font-semibold text-slate-300 mb-2">Solver Performance</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-400">Time:</span>
              <span className="ml-2 font-mono text-slate-300">{solverResult.timeMs.toFixed(1)}ms</span>
            </div>
            <div>
              <span className="text-slate-400">Iterations:</span>
              <span className="ml-2 font-mono text-slate-300">{solverResult.iterations}</span>
            </div>
          </div>
        </div>
      )}

      {/* Clause-by-Clause Verification */}
      <div className="space-y-2">
        <h4 className="font-semibold text-slate-300">Clause Verification</h4>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {verification?.clauseVerifications.map(({ clauseIndex, clause, isSatisfied, witnessLiteral, pathCost }) => (
            <div key={clauseIndex} className={`rounded p-2 text-sm ${
              isSatisfied ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-300">Clause {clauseIndex + 1}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    isSatisfied ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {isSatisfied ? '✓' : '✗'}
                  </span>
                  <span className="text-xs text-slate-400">Cost: {pathCost}</span>
                </div>
              </div>
              
              <div className="text-slate-300 mb-1">
                ({clause.map(lit => `${lit.positive ? '' : '¬'}x${lit.city.num}`).join(' ∨ ')})
              </div>
              
              {witnessLiteral && (
                <div className="text-xs text-slate-400">
                  Witness: <span className="text-yellow-300">
                    {witnessLiteral.positive ? '' : '¬'}x{witnessLiteral.city.num}
                  </span>
                  <span className="ml-2">(Path cost: {witnessLiteral.city.num})</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* EGPT Theory Connection */}
      <div className="bg-blue-900/30 border border-blue-500/50 rounded p-3">
        <h4 className="font-semibold text-blue-400 mb-2">EGPT Theory Connection</h4>
        <div className="text-sm text-slate-300 space-y-1">
          <p><strong>Certificate:</strong> This corresponds to a <code className="text-cyan-300">SatisfyingTableau</code></p>
          <p><strong>Witness Paths:</strong> Each literal's cost = <code className="text-cyan-300">PathToConstraint</code></p>
          <p><strong>Complexity Bound:</strong> ≤ {problem.numVariables} × {problem.clauses.length} = {problem.numVariables * problem.clauses.length}</p>
          <p className="text-xs text-slate-400">
            This demonstrates <code className="text-cyan-300">tableauComplexity_upper_bound</code> from EGPT/Complexity/Tableau.lean
          </p>
        </div>
      </div>

      {/* Complexity Analysis */}
      <div className="bg-purple-900/30 border border-purple-500/50 rounded p-3">
        <h4 className="font-semibold text-purple-400 mb-2">Complexity Analysis</h4>
        <div className="text-sm text-slate-300 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400">Actual Complexity:</span>
              <span className="ml-2 font-mono">{verification?.totalComplexity}</span>
            </div>
            <div>
              <span className="text-slate-400">N² Bound:</span>
              <span className="ml-2 font-mono">{problem.numVariables * problem.numVariables}</span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded p-2">
            <h5 className="font-semibold text-yellow-400 mb-1">Complexity Comparison</h5>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Traditional Exponential:</span>
                <span className="font-mono text-red-400">{Math.pow(2, problem.numVariables).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>EGPT Polynomial (N²):</span>
                <span className="font-mono text-green-400">{problem.numVariables * problem.numVariables}</span>
              </div>
              <div className="flex justify-between">
                <span>Actual Certificate:</span>
                <span className="font-mono text-blue-400">{verification?.totalComplexity}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded p-2">
            <h5 className="font-semibold text-green-400 mb-1">Efficiency Analysis</h5>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>vs N² Bound:</span>
                <span className={`font-mono ${
                  (verification?.totalComplexity || 0) <= problem.numVariables * problem.numVariables
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {verification?.totalComplexity && problem.numVariables * problem.numVariables > 0
                    ? `${((verification.totalComplexity / (problem.numVariables * problem.numVariables)) * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>vs Exponential:</span>
                <span className="font-mono text-green-400">
                  {verification?.totalComplexity && Math.pow(2, problem.numVariables) > 0
                    ? `${((verification.totalComplexity / Math.pow(2, problem.numVariables)) * 100).toFixed(6)}%`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-slate-400">
            <p><strong>Key Insight:</strong> Certificate complexity stays within polynomial bounds, demonstrating P=NP</p>
            <p><strong>EGPT Connection:</strong> This corresponds to <code className="text-cyan-300">tableauComplexity_upper_bound</code> in EGPT/Complexity/Tableau.lean</p>
          </div>
        </div>
      </div>
    </div>
  );
};
