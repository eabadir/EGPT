import React, { useState, useMemo } from 'react';
import type { CNFProblem, Certificate } from '../types';
import { GraphColoringView } from './visualizations/GraphColoringView';
import { CircuitDiagramView } from './visualizations/CircuitDiagramView';
import { GridConstraintView } from './visualizations/GridConstraintView';
import type { VisualizationViewComponent } from './visualizations/types';

interface CircuitVisualizationProps {
  problem: CNFProblem | null;
  certificate: Certificate | null;
  isSolving: boolean;
}

// Register all available visualization views
const visualizationViews: VisualizationViewComponent[] = [
  {
    name: 'Graph Coloring',
    icon: '🎨',
    description: 'Variables as nodes, clauses as edges',
    component: GraphColoringView,
    suitable: (problem) => problem.numVariables <= 20 // Graph gets crowded above 20 nodes
  },
  {
    name: 'Circuit Diagram',
    icon: '⚡',
    description: 'CNF as logic gates and wires',
    component: CircuitDiagramView,
    suitable: (problem) => problem.numVariables <= 25 && problem.clauses.length <= 50
  },
  {
    name: 'Constraint Grid',
    icon: '📊',
    description: 'Matrix of variables and clauses',
    component: GridConstraintView,
    suitable: (problem) => true // Grid view works for any size
  }
];

export const CircuitVisualization: React.FC<CircuitVisualizationProps> = ({
  problem,
  certificate,
  isSolving
}) => {
  const [selectedViewIndex, setSelectedViewIndex] = useState(0);

  // Get available views for current problem
  const availableViews = useMemo(() => {
    if (!problem) return visualizationViews;
    return visualizationViews.filter(view => view.suitable(problem));
  }, [problem]);

  // Ensure selected view is still valid
  const currentView = availableViews[selectedViewIndex] || availableViews[0];

  if (!problem) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <div className="text-center text-slate-400">
          <p className="text-lg font-semibold mb-2">No Problem Selected</p>
          <p className="text-sm">Select or define a problem to see its visualization</p>
        </div>
      </div>
    );
  }

  const CurrentViewComponent = currentView.component;
  const assignment = certificate?.assignment;

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header with view selector */}
      <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Problem Visualization</h3>
            <p className="text-sm text-slate-400 mt-1">
              {problem.description || `${problem.numVariables}-SAT with ${problem.clauses.length} clauses`}
            </p>
          </div>
          {isSolving && (
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
              <span className="text-sm">Solving...</span>
            </div>
          )}
        </div>

        {/* View Selector Tabs */}
        <div className="flex space-x-2">
          {availableViews.map((view, index) => (
            <button
              key={view.name}
              onClick={() => setSelectedViewIndex(index)}
              className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                selectedViewIndex === index
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title={view.description}
            >
              <span className="mr-2">{view.icon}</span>
              {view.name}
            </button>
          ))}
        </div>

        {/* View Description */}
        <p className="text-xs text-slate-400 mt-2">
          {currentView.description}
        </p>
      </div>

      {/* Visualization Content */}
      <div className="p-6">
        <CurrentViewComponent 
          problem={problem} 
          assignment={assignment}
        />
      </div>

      {/* Problem Details Footer */}
      <div className="bg-slate-900/30 px-6 py-3 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-slate-400">Variables:</span>
              <span className="ml-2 font-mono font-bold text-slate-200">{problem.numVariables}</span>
            </div>
            <div>
              <span className="text-slate-400">Clauses:</span>
              <span className="ml-2 font-mono font-bold text-slate-200">{problem.clauses.length}</span>
            </div>
            <div>
              <span className="text-slate-400">Density:</span>
              <span className="ml-2 font-mono font-bold text-slate-200">
                {(problem.clauses.length / problem.numVariables).toFixed(2)}
              </span>
            </div>
          </div>
          
          {certificate && (
            <div className="flex items-center space-x-2">
              <span className="text-green-400 font-semibold">✓ Certificate Available</span>
              <span className="text-xs text-slate-400">
                (Complexity: {certificate.complexity})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
