import React, { useMemo } from 'react';
import type { VisualizationViewProps } from './types';

export const GraphColoringView: React.FC<VisualizationViewProps> = ({
  problem,
  assignment
}) => {
  // Extract all cities (nodes) from clauses
  const cities = useMemo(() => {
    const cityMap = new Map();
    problem.clauses.forEach(clause => {
      clause.forEach(literal => {
        const key = `${literal.city.x},${literal.city.y}`;
        if (!cityMap.has(key)) {
          cityMap.set(key, literal.city);
        }
      });
    });
    return Array.from(cityMap.values());
  }, [problem]);

  // Extract all edges (clause relationships)
  const edges = useMemo(() => {
    const edgeSet = new Set<string>();
    problem.clauses.forEach((clause, clauseIndex) => {
      // Each clause creates edges between its literals
      for (let i = 0; i < clause.length; i++) {
        for (let j = i + 1; j < clause.length; j++) {
          const city1 = clause[i].city;
          const city2 = clause[j].city;
          const key = `${Math.min(city1.num, city2.num)}-${Math.max(city1.num, city2.num)}-${clauseIndex}`;
          edgeSet.add(key);
        }
      }
    });
    
    return Array.from(edgeSet).map(key => {
      const [num1, num2, clauseIdx] = key.split('-').map(Number);
      return {
        from: problem.clauses[clauseIdx].find(l => l.city.num === num1)?.city,
        to: problem.clauses[clauseIdx].find(l => l.city.num === num2)?.city,
        clauseIndex: clauseIdx
      };
    }).filter(edge => edge.from && edge.to);
  }, [problem]);

  // Position cities in a circle
  const cityPositions = useMemo(() => {
    const radius = 140;
    const centerX = 200;
    const centerY = 200;
    
    return cities.map((city, index) => {
      const angle = (index / cities.length) * 2 * Math.PI - Math.PI / 2;
      return {
        city,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  }, [cities]);

  // Determine node colors based on assignment
  const getNodeColor = (cityNum: number) => {
    if (!assignment || assignment.length < cityNum) return 'rgb(100, 116, 139)'; // unassigned
    const value = assignment[cityNum - 1];
    return value ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'; // true = green, false = red
  };

  // Check if an edge is satisfied
  const isEdgeSatisfied = (clauseIndex: number) => {
    if (!assignment) return false;
    const clause = problem.clauses[clauseIndex];
    return clause.some(literal => {
      const varValue = assignment[literal.city.num - 1];
      return literal.positive ? varValue : !varValue;
    });
  };

  return (
    <div className="relative w-full" style={{ height: '400px' }}>
      <svg width="400" height="400" className="mx-auto">
        {/* Draw edges */}
        {edges.map((edge, i) => {
          if (!edge.from || !edge.to) return null;
          const fromPos = cityPositions.find(p => p.city.num === edge.from?.num);
          const toPos = cityPositions.find(p => p.city.num === edge.to?.num);
          if (!fromPos || !toPos) return null;

          const satisfied = isEdgeSatisfied(edge.clauseIndex);
          const strokeColor = assignment 
            ? (satisfied ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
            : 'rgb(71, 85, 105)';

          return (
            <line
              key={`edge-${i}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={strokeColor}
              strokeWidth="2"
              opacity="0.6"
            />
          );
        })}

        {/* Draw nodes */}
        {cityPositions.map((pos, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r="20"
              fill={getNodeColor(pos.city.num)}
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              x₁{pos.city.num}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 rounded p-3 text-xs space-y-1">
        <h4 className="font-semibold text-slate-300 mb-2">Node Colors</h4>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-slate-500"></div>
          <span className="text-slate-300">Unassigned</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-slate-300">True</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-slate-300">False</span>
        </div>
        
        <h4 className="font-semibold text-slate-300 mt-3 mb-2">Edge Colors</h4>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-slate-600"></div>
          <span className="text-slate-300">Unsatisfied</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-green-500"></div>
          <span className="text-slate-300">Satisfied</span>
        </div>
      </div>
    </div>
  );
};







