import React, { useState, useMemo } from 'react';
import type { CNFProblem, SolverResult, Certificate, Clause, Literal } from '../types';
import { ComplexityVisualization } from './ComplexityVisualization';

interface ResultsDeepDiveProps {
  problem: CNFProblem | null;
  result: SolverResult | null;
  certificate: Certificate | null;
}

interface ClauseVerification {
  clauseIndex: number;
  clause: Clause;
  isSatisfied: boolean;
  witnessLiteral: Literal | null;
  witnessIndex: number;
  pathCost: number;
}

export const ResultsDeepDive: React.FC<ResultsDeepDiveProps> = ({
  problem,
  result,
  certificate
}) => {
  const [activeTab, setActiveTab] = useState<'complexity' | 'certificate' | 'theory'>('complexity');

  const verification = useMemo(() => {
    if (!problem || !certificate) return null;

    const clauseVerifications: ClauseVerification[] = [];
    let totalComplexity = 0;

    problem.clauses.forEach((clause, clauseIndex) => {
      const witnessIndex = certificate.witnessLiterals[clauseIndex];
      let isSatisfied = false;
      let witnessLiteral: Literal | null = null;
      let pathCost = 0;

      if (witnessIndex !== undefined && witnessIndex < clause.length) {
        witnessLiteral = clause[witnessIndex];
        const varValue = certificate.assignment[witnessLiteral.city.num - 1];
        isSatisfied = witnessLiteral.positive ? varValue : !varValue;
        pathCost = witnessLiteral.city.num;
        totalComplexity += pathCost;
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
      allSatisfied: clauseVerifications.every(cv => cv.isSatisfied)
    };
  }, [problem, certificate]);

  if (!problem || !result) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header with Tabs */}
      <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700">
        <h3 className="text-base font-bold text-slate-200 mb-3">Results Deep Dive</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('complexity')}
            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
              activeTab === 'complexity'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            📊 Complexity Analysis
          </button>
          {certificate && (
            <button
              onClick={() => setActiveTab('certificate')}
              className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                activeTab === 'certificate'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              🔍 Certificate Details
            </button>
          )}
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
              activeTab === 'theory'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🎓 EGPT Theory
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Complexity Analysis Tab */}
        {activeTab === 'complexity' && (
          <div className="space-y-4">
            <ComplexityVisualization
              numVariables={problem.numVariables}
              actualComplexity={certificate?.complexity}
            />

            {/* Detailed Metrics */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <h4 className="font-semibold text-slate-300 mb-3 text-sm">Detailed Complexity Metrics</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 mb-1">Problem Size:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Variables (N): {problem.numVariables}</li>
                    <li>Clauses (M): {problem.clauses.length}</li>
                    <li>Density: {(problem.clauses.length / problem.numVariables).toFixed(2)} clauses/var</li>
                  </ul>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Complexity Bounds:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>N²: {problem.numVariables * problem.numVariables}</li>
                    <li>2^N: {Math.pow(2, problem.numVariables).toLocaleString()}</li>
                    <li>Actual: {result.iterations.toLocaleString()}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Details Tab */}
        {activeTab === 'certificate' && certificate && verification && (
          <div className="space-y-3">
            {/* Overall Status */}
            <div className={`rounded-lg p-3 ${
              verification.allSatisfied 
                ? 'bg-green-900/30 border border-green-500/50' 
                : 'bg-red-900/30 border border-red-500/50'
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span className={verification.allSatisfied ? 'text-green-400' : 'text-red-400'}>
                  <strong>Status:</strong> {verification.allSatisfied ? '✓ Valid Certificate' : '✗ Invalid Certificate'}
                </span>
                <span className="text-slate-300">
                  <strong>Total Complexity:</strong> <span className="font-mono">{verification.totalComplexity}</span>
                </span>
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
              <h4 className="font-semibold text-slate-300 mb-2 text-sm">Variable Assignment</h4>
              <div className="flex flex-wrap gap-2">
                {certificate.assignment.map((value, i) => (
                  <div
                    key={i}
                    className={`px-2 py-1 rounded text-xs font-mono ${
                      value ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    }`}
                  >
                    x₁{i + 1} = {value ? 'T' : 'F'}
                  </div>
                ))}
              </div>
            </div>

            {/* Clause-by-Clause Verification */}
            <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
              <h4 className="font-semibold text-slate-300 mb-2 text-sm">Clause Verification</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {verification.clauseVerifications.map((cv, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-xs ${
                      cv.isSatisfied
                        ? 'bg-green-900/20 border border-green-500/30'
                        : 'bg-red-900/20 border border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cv.isSatisfied ? 'text-green-400' : 'text-red-400'}>
                        <strong>Clause {idx + 1}:</strong> {cv.isSatisfied ? '✓' : '✗'}
                      </span>
                      <span className="text-slate-400">
                        Path cost: <span className="font-mono">{cv.pathCost}</span>
                      </span>
                    </div>
                    {cv.witnessLiteral && (
                      <div className="text-slate-300">
                        Witness: x₁{cv.witnessLiteral.city.num} 
                        {cv.witnessLiteral.positive ? '' : ' (negated)'} = 
                        {certificate.assignment[cv.witnessLiteral.city.num - 1] ? ' T' : ' F'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EGPT Theory Tab */}
        {activeTab === 'theory' && (
          <div className="space-y-3">
            <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
              <h4 className="font-semibold text-emerald-400 mb-2 text-sm">Certificate = Tableau</h4>
              <p className="text-xs text-slate-300">
                The certificate corresponds to a <code className="text-cyan-300 bg-slate-800 px-1 rounded">SatisfyingTableau</code> in{' '}
                <code className="text-cyan-300 bg-slate-800 px-1 rounded">EGPT/Complexity/Tableau.lean</code>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                This structure contains the satisfying assignment and witness paths that prove the problem is satisfiable.
              </p>
            </div>

            <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
              <h4 className="font-semibold text-blue-400 mb-2 text-sm">Witness Paths</h4>
              <p className="text-xs text-slate-300">
                Each clause's satisfying literal is a <code className="text-cyan-300 bg-slate-800 px-1 rounded">PathToConstraint</code> with known cost.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                The sum of these path costs gives the total certificate complexity, which is bounded by N² in EGPT.
              </p>
            </div>

            <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
              <h4 className="font-semibold text-purple-400 mb-2 text-sm">P=NP Identity</h4>
              <p className="text-xs text-slate-300">
                With bijective encoding, P=NP as proven in <code className="text-cyan-300 bg-slate-800 px-1 rounded">EGPT/Complexity/PPNP.lean</code>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                The "Address Is The Map" property means natural numbers encode paths directly, 
                making verification and construction equally efficient - both polynomial time.
              </p>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-3">
              <h4 className="font-semibold text-emerald-400 mb-2 text-sm">Key Theorems</h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>
                  <code className="text-cyan-300 bg-slate-800 px-1 rounded">tableauComplexity_upper_bound</code>:{' '}
                  Proves certificate complexity ≤ N²
                </li>
                <li>
                  <code className="text-cyan-300 bg-slate-800 px-1 rounded">P_eq_NP</code>:{' '}
                  The main theorem establishing P=NP
                </li>
                <li>
                  <code className="text-cyan-300 bg-slate-800 px-1 rounded">CookLevin_EGPT</code>:{' '}
                  SAT is NP-complete in EGPT framework
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};







