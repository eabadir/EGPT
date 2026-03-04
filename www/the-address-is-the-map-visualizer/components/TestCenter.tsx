import React, { useState } from 'react';
import { ProblemSpecification } from './ProblemSpecification';
import { CircuitVisualization } from './CircuitVisualization';
import { SolverInterface } from './SolverInterface';
import { CurrentProblemSummary } from './CurrentProblemSummary';
import { CompactResultsSummary } from './CompactResultsSummary';
import { ResultsDeepDive } from './ResultsDeepDive';
import type { CNFProblem, Certificate, SolverResult } from '../types';

export const TestCenter: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState<CNFProblem | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);
  const [isSolving, setIsSolving] = useState(false);

  const handleProblemChange = (problem: CNFProblem | null) => {
    setCurrentProblem(problem);
    setCertificate(null);
    setSolverResult(null);
  };

  const handleCertificateChange = (cert: Certificate | null) => {
    setCertificate(cert);
  };

  const handleSolverResult = (result: SolverResult) => {
    setSolverResult(result);
    if (result.certificate) {
      setCertificate(result.certificate);
    }
  };

  const handleStartSolving = () => {
    setIsSolving(true);
  };

  const handleSolvingComplete = () => {
    setIsSolving(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4">
      <header className="text-center mb-6">
        <h1 className="text-4xl lg:text-5xl font-bold text-purple-400 tracking-tight">P=NP Problem Test Center</h1>
        <p className="text-slate-400 mt-2 max-w-3xl mx-auto">
          Specify CNF problems, visualize them as circuits, and test solvers to explore P=NP complexity.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Solver Interface */}
          <div className="bg-slate-800/50 rounded-lg shadow-xl p-4">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Solver Interface</h2>
            <SolverInterface
              problem={currentProblem}
              onResult={handleSolverResult}
              onStartSolving={handleStartSolving}
              onCompleteSolving={handleSolvingComplete}
              isSolving={isSolving}
            />
          </div>

          {/* Problem Specification */}
          <div className="bg-slate-800/50 rounded-lg shadow-xl p-4">
            <h2 className="text-xl font-semibold text-emerald-400 mb-4">Input Method</h2>
            <ProblemSpecification
              onProblemChange={handleProblemChange}
              onCertificateChange={handleCertificateChange}
              currentProblem={currentProblem}
              currentCertificate={certificate}
            />
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Current Problem Summary */}
          <CurrentProblemSummary 
            problem={currentProblem}
            solverResult={solverResult}
          />

          {/* 2. Compact Results Summary */}
          {solverResult && currentProblem && (
            <CompactResultsSummary
              problem={currentProblem}
              result={solverResult}
              certificate={certificate}
            />
          )}

          {/* 3. Circuit Visualization */}
          {currentProblem && (
            <div className="bg-slate-800/50 rounded-lg shadow-xl p-4">
              <CircuitVisualization
                problem={currentProblem}
                certificate={certificate}
                isSolving={isSolving}
              />
            </div>
          )}

          {/* 4. Results Deep Dive */}
          {solverResult && currentProblem && (
            <ResultsDeepDive
              problem={currentProblem}
              result={solverResult}
              certificate={certificate}
            />
          )}
        </div>
      </main>
    </div>
  );
};
