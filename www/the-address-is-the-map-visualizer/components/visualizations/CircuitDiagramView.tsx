import React, { useMemo } from 'react';
import type { VisualizationViewProps } from './types';

export const CircuitDiagramView: React.FC<VisualizationViewProps> = ({
  problem,
  assignment
}) => {
  // Layout parameters
  const inputX = 50;
  const gateX = 250;
  const outputX = 450;
  const verticalSpacing = 60;
  const startY = 50;

  // Get input wire colors based on assignment
  const getWireColor = (varIndex: number, inverted: boolean = false) => {
    if (!assignment || assignment.length <= varIndex) return 'rgb(100, 116, 139)';
    let value = assignment[varIndex];
    if (inverted) value = !value;
    return value ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
  };

  // Check if a clause is satisfied
  const isClauseSatisfied = (clauseIndex: number) => {
    if (!assignment) return false;
    const clause = problem.clauses[clauseIndex];
    return clause.some(literal => {
      const varValue = assignment[literal.city.num - 1];
      return literal.positive ? varValue : !varValue;
    });
  };

  // Calculate all clauses satisfied
  const allClausesSatisfied = useMemo(() => {
    if (!assignment) return false;
    return problem.clauses.every((_, i) => isClauseSatisfied(i));
  }, [problem, assignment]);

  return (
    <div className="relative w-full overflow-x-auto" style={{ minHeight: '500px' }}>
      <svg width="550" height={Math.max(500, startY + problem.numVariables * verticalSpacing + 100)} className="mx-auto">
        {/* Input variables */}
        {Array.from({ length: problem.numVariables }, (_, i) => {
          const y = startY + i * verticalSpacing;
          const color = getWireColor(i);
          
          return (
            <g key={`input-${i}`}>
              {/* Input label */}
              <text x={inputX - 30} y={y} textAnchor="end" dominantBaseline="middle" fill="rgb(203, 213, 225)" fontSize="14" fontWeight="bold">
                x₁{i + 1}
              </text>
              
              {/* Input node */}
              <circle cx={inputX} cy={y} r="6" fill={color} stroke="white" strokeWidth="2" />
              
              {/* Wire to gates */}
              <line x1={inputX + 6} y1={y} x2={gateX - 40} y2={y} stroke={color} strokeWidth="2" />
            </g>
          );
        })}

        {/* OR gates (one per clause) */}
        {problem.clauses.map((clause, clauseIdx) => {
          const gateY = startY + (clauseIdx * verticalSpacing);
          const satisfied = isClauseSatisfied(clauseIdx);
          const gateColor = assignment 
            ? (satisfied ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
            : 'rgb(100, 116, 139)';

          return (
            <g key={`clause-${clauseIdx}`}>
              {/* Input wires to this OR gate */}
              {clause.map((literal, litIdx) => {
                const inputY = startY + (literal.city.num - 1) * verticalSpacing;
                const color = getWireColor(literal.city.num - 1, !literal.positive);
                
                return (
                  <g key={`wire-${clauseIdx}-${litIdx}`}>
                    {/* Connection line */}
                    <path
                      d={`M ${gateX - 40} ${inputY} Q ${gateX - 20} ${inputY}, ${gateX - 20} ${gateY - 15 + litIdx * 10}`}
                      stroke={color}
                      strokeWidth="1.5"
                      fill="none"
                    />
                    
                    {/* NOT gate indicator if negated */}
                    {!literal.positive && (
                      <g>
                        <circle cx={gateX - 38} cy={inputY} r="3" fill="none" stroke="white" strokeWidth="1" />
                        <text x={gateX - 38} y={inputY - 8} textAnchor="middle" fill="rgb(203, 213, 225)" fontSize="10">¬</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* OR gate */}
              <g>
                <rect x={gateX} y={gateY - 20} width="60" height="40" rx="5" fill={gateColor} stroke="white" strokeWidth="2" />
                <text x={gateX + 30} y={gateY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12" fontWeight="bold">
                  OR
                </text>
              </g>

              {/* Output wire from OR gate */}
              <line x1={gateX + 60} y1={gateY} x2={outputX - 80} y2={gateY} stroke={gateColor} strokeWidth="2" />
            </g>
          );
        })}

        {/* Final AND gate (combines all clauses) */}
        {problem.clauses.length > 1 && (
          <g>
            {/* Collect wires to AND gate */}
            {problem.clauses.map((_, clauseIdx) => {
              const clauseY = startY + clauseIdx * verticalSpacing;
              const andY = startY + (problem.clauses.length * verticalSpacing) / 2;
              const satisfied = isClauseSatisfied(clauseIdx);
              const color = assignment 
                ? (satisfied ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
                : 'rgb(100, 116, 139)';
              
              return (
                <path
                  key={`and-input-${clauseIdx}`}
                  d={`M ${outputX - 80} ${clauseY} Q ${outputX - 60} ${clauseY}, ${outputX - 60} ${andY - 20 + clauseIdx * 8}`}
                  stroke={color}
                  strokeWidth="1.5"
                  fill="none"
                />
              );
            })}

            {/* AND gate */}
            <g>
              <rect x={outputX - 40} y={startY + (problem.clauses.length * verticalSpacing) / 2 - 25} width="60" height="50" rx="5" 
                fill={allClausesSatisfied ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'} 
                stroke="white" strokeWidth="2" 
              />
              <text x={outputX - 10} y={startY + (problem.clauses.length * verticalSpacing) / 2} 
                textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12" fontWeight="bold">
                AND
              </text>
            </g>

            {/* Output wire */}
            <line 
              x1={outputX + 20} 
              y1={startY + (problem.clauses.length * verticalSpacing) / 2} 
              x2={outputX + 60} 
              y2={startY + (problem.clauses.length * verticalSpacing) / 2}
              stroke={allClausesSatisfied ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
              strokeWidth="2"
            />

            {/* Output label */}
            <text 
              x={outputX + 70} 
              y={startY + (problem.clauses.length * verticalSpacing) / 2} 
              textAnchor="start" dominantBaseline="middle" fill="rgb(203, 213, 225)" fontSize="14" fontWeight="bold">
              {allClausesSatisfied ? 'SAT ✓' : 'UNSAT'}
            </text>
          </g>
        )}

        {/* Labels */}
        <text x={inputX} y={20} textAnchor="middle" fill="rgb(148, 163, 184)" fontSize="12">Inputs</text>
        <text x={gateX + 30} y={20} textAnchor="middle" fill="rgb(148, 163, 184)" fontSize="12">OR Gates (Clauses)</text>
        <text x={outputX} y={20} textAnchor="middle" fill="rgb(148, 163, 184)" fontSize="12">Output</text>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 rounded p-3 text-xs space-y-2">
        <h4 className="font-semibold text-slate-300 mb-2">Circuit Elements</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-5 rounded bg-slate-500 border-2 border-white flex items-center justify-center text-white text-xs">OR</div>
            <span className="text-slate-300">Clause (any literal)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-5 rounded bg-slate-500 border-2 border-white flex items-center justify-center text-white text-xs">AND</div>
            <span className="text-slate-300">All clauses</span>
          </div>
          <div className="flex items-center space-x-2">
            <circle cx="4" cy="4" r="3" fill="none" stroke="white" strokeWidth="1" />
            <text x="4" y="2" textAnchor="middle" fill="white" fontSize="8">¬</text>
            <span className="text-slate-300 ml-2">Negation</span>
          </div>
        </div>
        
        <h4 className="font-semibold text-slate-300 mt-3 mb-2">Signal Colors</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-green-500"></div>
            <span className="text-slate-300">True / Satisfied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-red-500"></div>
            <span className="text-slate-300">False / Unsatisfied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-slate-500"></div>
            <span className="text-slate-300">Unassigned</span>
          </div>
        </div>
      </div>
    </div>
  );
};







