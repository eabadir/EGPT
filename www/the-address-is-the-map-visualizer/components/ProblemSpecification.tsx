import React, { useState } from 'react';
import type { CNFProblem, Certificate, Clause, Literal } from '../types';
import { exampleProblems } from '../examples/problems';

interface ProblemSpecificationProps {
  onProblemChange: (problem: CNFProblem | null) => void;
  onCertificateChange: (certificate: Certificate | null) => void;
  currentProblem: CNFProblem | null;
  currentCertificate: Certificate | null;
}

export const ProblemSpecification: React.FC<ProblemSpecificationProps> = ({
  onProblemChange,
  onCertificateChange,
  currentProblem,
  currentCertificate
}) => {
  const [inputMethod, setInputMethod] = useState<'custom' | 'random' | 'example'>('example');
  const [manualCNF, setManualCNF] = useState('');
  const [numVariables, setNumVariables] = useState(3);
  const [numClauses, setNumClauses] = useState(4);
  const [manualCertificate, setManualCertificate] = useState('');
  const [selectedExample, setSelectedExample] = useState(-1);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);


  const generateRandomProblem = () => {
    const clauses: Clause[] = [];
    const cities = Array.from({ length: numVariables }, (_, i) => ({
      x: i % 3,
      y: Math.floor(i / 3),
      num: i + 1
    }));

    for (let i = 0; i < numClauses; i++) {
      const clause: Literal[] = [];
      const usedVars = new Set<number>();
      
      // Generate 2-3 literals per clause
      const clauseSize = Math.floor(Math.random() * 2) + 2;
      
      while (clause.length < clauseSize && clause.length < numVariables) {
        const varIndex = Math.floor(Math.random() * numVariables);
        if (!usedVars.has(varIndex)) {
          usedVars.add(varIndex);
          clause.push({
            city: cities[varIndex],
            positive: Math.random() > 0.5
          });
        }
      }
      
      if (clause.length > 0) {
        clauses.push(clause);
      }
    }

    const problem: CNFProblem = {
      numVariables,
      clauses,
      description: `Random ${numVariables}-SAT with ${clauses.length} clauses`
    };

    onProblemChange(problem);
  };

  const parseManualCNF = () => {
    // Simple parser for CNF format like: (x1 ∨ ¬x2 ∨ x3) ∧ (¬x1 ∨ x2)
    try {
      const lines = manualCNF.split('\n').filter(line => line.trim());
      const clauses: Clause[] = [];
      let maxVar = 0;

      for (const line of lines) {
        const clauseMatch = line.match(/\(([^)]+)\)/);
        if (clauseMatch) {
          const literals = clauseMatch[1].split('∨').map(lit => lit.trim());
          const clause: Literal[] = [];
          
          for (const literal of literals) {
            const isPositive = !literal.startsWith('¬');
            const varName = isPositive ? literal : literal.substring(1);
            const varNum = parseInt(varName.replace('x', ''));
            
            if (!isNaN(varNum)) {
              maxVar = Math.max(maxVar, varNum);
              clause.push({
                city: { x: (varNum - 1) % 3, y: Math.floor((varNum - 1) / 3), num: varNum },
                positive: isPositive
              });
            }
          }
          
          if (clause.length > 0) {
            clauses.push(clause);
          }
        }
      }

      if (clauses.length > 0) {
        const problem: CNFProblem = {
          numVariables: maxVar,
          clauses,
          description: 'Manual CNF input'
        };
        onProblemChange(problem);
      }
    } catch (error) {
      console.error('Error parsing CNF:', error);
    }
  };

  const parseCertificate = () => {
    try {
      const values = manualCertificate.split(',').map(v => v.trim() === 'true' || v.trim() === '1');
      if (values.length === currentProblem?.numVariables) {
        // Calculate witness literals and complexity
        const witnessLiterals: number[] = [];
        let complexity = 0;

        for (const clause of currentProblem.clauses) {
          let witnessFound = false;
          for (let i = 0; i < clause.length; i++) {
            const literal = clause[i];
            const varValue = values[literal.city.num - 1];
            if ((literal.positive && varValue) || (!literal.positive && !varValue)) {
              witnessLiterals.push(i);
              complexity += literal.city.num; // PathToConstraint cost
              witnessFound = true;
              break;
            }
          }
          if (!witnessFound) {
            // Invalid certificate
            return;
          }
        }

        const certificate: Certificate = {
          assignment: values,
          witnessLiterals,
          complexity
        };

        onCertificateChange(certificate);
      }
    } catch (error) {
      console.error('Error parsing certificate:', error);
    }
  };

  const renderInputMethod = () => {
    switch (inputMethod) {
      case 'example':
        return (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-300">Example Problems</h4>
            <select
              value={selectedExample}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                setSelectedExample(index);
                if (index >= 0 && index < exampleProblems.length) {
                  const example = exampleProblems[index];
                  onProblemChange(example.problem);
                  if (example.certificate) {
                    onCertificateChange(example.certificate);
                  }
                }
              }}
              className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm"
            >
              <option value="-1">Select an example problem...</option>
              {exampleProblems.map((example, i) => (
                <option key={i} value={i}>
                  {example.difficulty.toUpperCase()}: {example.problem.description} ({example.problem.numVariables}v, {example.problem.clauses.length}c)
                </option>
              ))}
            </select>
            
            {selectedExample >= 0 && selectedExample < exampleProblems.length && (
              <div className="bg-slate-900/50 rounded p-3 text-sm space-y-3">
                <div>
                  <div className="font-semibold text-emerald-300 mb-1">
                    {exampleProblems[selectedExample].problem.description}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {exampleProblems[selectedExample].problem.numVariables} variables, {exampleProblems[selectedExample].problem.clauses.length} clauses
                    {' • '}
                    <span className="capitalize">{exampleProblems[selectedExample].difficulty}</span> difficulty
                  </div>
                </div>

                {/* Verification Badges */}
                <div className="bg-slate-800/50 rounded p-2 border border-slate-700 space-y-1">
                  <div className="flex items-start space-x-2 text-xs">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300">
                      <strong>Verified:</strong> Brute force {exampleProblems[selectedExample].verified.bruteForceSolves ? 'finds solution' : 'proves UNSAT'} in ~{exampleProblems[selectedExample].verified.expectedIterations.toLocaleString()} iterations
                    </span>
                  </div>
                  <div className="flex items-start space-x-2 text-xs">
                    <span className={exampleProblems[selectedExample].verified.withinN2Bound ? 'text-green-400' : 'text-yellow-400'}>
                      {exampleProblems[selectedExample].verified.withinN2Bound ? '✓' : '⚠️'}
                    </span>
                    <span className="text-slate-300">
                      <strong>N² Bound:</strong> {exampleProblems[selectedExample].verified.expectedIterations.toLocaleString()} {exampleProblems[selectedExample].verified.withinN2Bound ? '≤' : '>'} {exampleProblems[selectedExample].problem.numVariables * exampleProblems[selectedExample].problem.numVariables} ({exampleProblems[selectedExample].problem.numVariables}²)
                    </span>
                  </div>
                  <button 
                    className="w-full mt-2 text-xs text-cyan-400 hover:text-cyan-300 text-left"
                    onClick={() => setShowVerificationDetails(!showVerificationDetails)}
                  >
                    {showVerificationDetails ? '▼' : '▶'} Show verification details
                  </button>
                </div>

                {/* Verification Details (expandable) */}
                {showVerificationDetails && (
                  <div className="bg-slate-800/30 rounded p-3 border border-slate-600 space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-slate-300 mb-1">What to Expect:</p>
                      <p className="text-slate-400">{exampleProblems[selectedExample].whatToExpect}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-300 mb-1">Why It's Hard:</p>
                      <p className="text-slate-400">{exampleProblems[selectedExample].whyItsHard}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-400 mb-1">EGPT Insight:</p>
                      <p className="text-slate-400">{exampleProblems[selectedExample].egptInsight}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-purple-400 mb-1">Key Learning:</p>
                      <p className="text-slate-400">{exampleProblems[selectedExample].keyLearning}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-700">
                      <p className="font-semibold text-slate-300 mb-1">Verified Metrics:</p>
                      <ul className="space-y-1 text-slate-400">
                        <li>• Expected iterations: {exampleProblems[selectedExample].verified.expectedIterations.toLocaleString()}</li>
                        <li>• Maximum possible (2^N): {exampleProblems[selectedExample].verified.maxIterations.toLocaleString()}</li>
                        <li>• Timeout threshold: {exampleProblems[selectedExample].verified.bruteForceTimeoutMs}ms</li>
                        <li>• Solves: {exampleProblems[selectedExample].verified.bruteForceSolves ? 'Yes (SAT)' : 'No (UNSAT)'}</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-300">
                  {exampleProblems[selectedExample].explanation}
                </div>
                
                {exampleProblems[selectedExample].certificate && (
                  <div className="text-xs text-green-400">
                    ✓ Includes known certificate
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'random':
        return (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-300">Random Problem</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Variables</label>
                <input
                  type="number"
                  value={numVariables}
                  onChange={(e) => setNumVariables(parseInt(e.target.value) || 3)}
                  min="2"
                  max="10"
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Clauses</label>
                <input
                  type="number"
                  value={numClauses}
                  onChange={(e) => setNumClauses(parseInt(e.target.value) || 4)}
                  min="1"
                  max="20"
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm"
                />
              </div>
            </div>
            <button
              onClick={generateRandomProblem}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Generate Random Problem
            </button>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-300">Custom CNF Input</h4>
            
            {/* CNF Input */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                CNF Formula (one clause per line)
              </label>
              <div className="text-xs text-slate-400 mb-2">
                Format: (x1 ∨ ¬x2 ∨ x3) ∧ (¬x1 ∨ x2)
              </div>
              <textarea
                value={manualCNF}
                onChange={(e) => setManualCNF(e.target.value)}
                placeholder="(x1 ∨ ¬x2 ∨ x3)&#10;(¬x1 ∨ x2)"
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm h-24 font-mono"
              />
            </div>

            {/* Certificate Input */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Certificate (optional)
              </label>
              <div className="text-xs text-slate-400 mb-2">
                Format: [true, false, true, ...]
              </div>
              <textarea
                value={manualCertificate}
                onChange={(e) => setManualCertificate(e.target.value)}
                placeholder='[true, false, true]'
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm h-16 font-mono"
              />
            </div>

            {/* Parse Button */}
            <button
              onClick={() => {
                parseManualCNF();
                if (manualCertificate.trim()) {
                  parseManualCertificate();
                }
              }}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Parse CNF & Certificate
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Method Selection */}
      <div>
        <h3 className="font-semibold text-slate-300 mb-2">Input Method</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'example', label: 'Examples' },
            { key: 'random', label: 'Random' },
            { key: 'custom', label: 'Custom' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setInputMethod(key as any)}
              className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                inputMethod === key
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Method Content */}
      {renderInputMethod()}

      {/* Current Problem Display */}
      {currentProblem && (
        <div className="bg-slate-900/50 rounded p-3">
          <h4 className="font-semibold text-blue-300 mb-2">Current Problem</h4>
          <div className="text-sm space-y-1">
            <div><strong>Variables:</strong> {currentProblem.numVariables}</div>
            <div><strong>Clauses:</strong> {currentProblem.clauses.length}</div>
            {currentProblem.description && (
              <div><strong>Description:</strong> {currentProblem.description}</div>
            )}
          </div>
        </div>
      )}

      {/* Certificate Input */}
      {currentProblem && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-300">Certificate (Optional)</h4>
          <div className="text-xs text-slate-400 mb-2">
            Comma-separated boolean values: true,false,true,false
          </div>
          <input
            type="text"
            value={manualCertificate}
            onChange={(e) => setManualCertificate(e.target.value)}
            placeholder="true,false,true"
            className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm font-mono"
          />
          <button
            onClick={parseCertificate}
            className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Parse Certificate
          </button>
        </div>
      )}

      {/* Current Certificate Display */}
      {currentCertificate && (
        <div className="bg-slate-900/50 rounded p-3">
          <h4 className="font-semibold text-green-300 mb-2">Current Certificate</h4>
          <div className="text-sm space-y-1">
            <div><strong>Assignment:</strong> [{currentCertificate.assignment.map(b => b ? 'T' : 'F').join(', ')}]</div>
            <div><strong>Complexity:</strong> {currentCertificate.complexity}</div>
            <div><strong>Witnesses:</strong> {currentCertificate.witnessLiterals.length} clauses satisfied</div>
          </div>
        </div>
      )}
    </div>
  );
};
