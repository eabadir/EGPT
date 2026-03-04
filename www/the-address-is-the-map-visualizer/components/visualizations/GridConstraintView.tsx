import React, { useMemo } from 'react';
import type { VisualizationViewProps } from './types';

export const GridConstraintView: React.FC<VisualizationViewProps> = ({
  problem,
  assignment
}) => {
  // Check if a literal is satisfied
  const isLiteralSatisfied = (varIndex: number, positive: boolean) => {
    if (!assignment || assignment.length <= varIndex) return null;
    const value = assignment[varIndex];
    return positive ? value : !value;
  };

  // Check if a clause is satisfied
  const isClauseSatisfied = (clauseIndex: number) => {
    if (!assignment) return null;
    const clause = problem.clauses[clauseIndex];
    return clause.some(literal => {
      const varValue = assignment[literal.city.num - 1];
      return literal.positive ? varValue : !varValue;
    });
  };

  // Find which literal satisfies the clause (if any)
  const getSatisfyingLiteral = (clauseIndex: number) => {
    if (!assignment) return -1;
    const clause = problem.clauses[clauseIndex];
    return clause.findIndex(literal => {
      const varValue = assignment[literal.city.num - 1];
      return literal.positive ? varValue : !varValue;
    });
  };

  return (
    <div className="relative w-full overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Header */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Constraint Matrix View</h4>
          <p className="text-xs text-slate-400">
            Each row is a clause, each column is a variable. 
            <span className="text-green-400 ml-1">+</span> = positive literal, 
            <span className="text-red-400 ml-1">-</span> = negative literal
          </p>
        </div>

        {/* Grid Table */}
        <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800">
                <th className="px-3 py-2 text-left text-slate-400 font-semibold border-r border-slate-700">Clause</th>
                {Array.from({ length: problem.numVariables }, (_, i) => (
                  <th key={i} className="px-3 py-2 text-center border-r border-slate-700 last:border-r-0">
                    <div className="font-mono text-slate-300">x₁{i + 1}</div>
                    {assignment && (
                      <div className={`text-xs mt-1 ${assignment[i] ? 'text-green-400' : 'text-red-400'}`}>
                        {assignment[i] ? 'T' : 'F'}
                      </div>
                    )}
                  </th>
                ))}
                <th className="px-3 py-2 text-center text-slate-400 font-semibold border-l border-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {problem.clauses.map((clause, clauseIdx) => {
                const satisfied = isClauseSatisfied(clauseIdx);
                const satisfyingLitIdx = getSatisfyingLiteral(clauseIdx);
                const rowBg = satisfied === true ? 'bg-green-900/20' : satisfied === false ? 'bg-red-900/20' : '';

                return (
                  <tr key={clauseIdx} className={`border-t border-slate-700 ${rowBg}`}>
                    <td className="px-3 py-2 font-mono text-slate-300 border-r border-slate-700">
                      C{clauseIdx + 1}
                    </td>
                    {Array.from({ length: problem.numVariables }, (_, varIdx) => {
                      // Find if this variable appears in this clause
                      const literalIdx = clause.findIndex(lit => lit.city.num - 1 === varIdx);
                      const literal = literalIdx >= 0 ? clause[literalIdx] : null;
                      
                      let cellContent = '';
                      let cellColor = 'text-slate-600';
                      let cellBg = '';
                      
                      if (literal) {
                        cellContent = literal.positive ? '+' : '-';
                        
                        if (assignment) {
                          const litSatisfied = isLiteralSatisfied(varIdx, literal.positive);
                          if (litSatisfied) {
                            cellColor = 'text-green-400 font-bold';
                            if (literalIdx === satisfyingLitIdx) {
                              cellBg = 'bg-green-500/30';
                            }
                          } else {
                            cellColor = 'text-red-400';
                          }
                        } else {
                          cellColor = literal.positive ? 'text-green-300' : 'text-red-300';
                        }
                      }

                      return (
                        <td 
                          key={varIdx} 
                          className={`px-3 py-2 text-center font-mono text-lg border-r border-slate-700 last:border-r-0 ${cellBg}`}
                        >
                          <span className={cellColor}>{cellContent || '·'}</span>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center border-l border-slate-700">
                      {satisfied === true && <span className="text-green-400 font-bold">✓ SAT</span>}
                      {satisfied === false && <span className="text-red-400 font-bold">✗ UNSAT</span>}
                      {satisfied === null && <span className="text-slate-500">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        {assignment && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-400">Total Clauses</p>
              <p className="text-xl font-bold text-slate-200">{problem.clauses.length}</p>
            </div>
            <div className="bg-green-900/30 rounded p-3 border border-green-500/50">
              <p className="text-xs text-slate-400">Satisfied</p>
              <p className="text-xl font-bold text-green-400">
                {problem.clauses.filter((_, i) => isClauseSatisfied(i)).length}
              </p>
            </div>
            <div className="bg-red-900/30 rounded p-3 border border-red-500/50">
              <p className="text-xs text-slate-400">Unsatisfied</p>
              <p className="text-xl font-bold text-red-400">
                {problem.clauses.filter((_, i) => !isClauseSatisfied(i)).length}
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 bg-slate-800/50 rounded p-3 border border-slate-700">
          <h4 className="font-semibold text-slate-300 mb-2 text-xs">How to Read This Matrix</h4>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
            <div>
              <p className="font-semibold text-slate-300 mb-1">Symbols:</p>
              <ul className="space-y-1">
                <li><span className="text-green-300">+</span> = Variable must be true</li>
                <li><span className="text-red-300">-</span> = Variable must be false</li>
                <li><span className="text-slate-600">·</span> = Variable not in clause</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-1">Highlights:</p>
              <ul className="space-y-1">
                <li><span className="text-green-400">Bold green</span> = Satisfying literal</li>
                <li><span className="bg-green-500/30 px-1 rounded">Highlighted</span> = First satisfying literal</li>
                <li><span className="text-red-400">Red</span> = Unsatisfied literal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};







