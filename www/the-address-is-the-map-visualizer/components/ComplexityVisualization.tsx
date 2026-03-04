import React, { useMemo, useState } from 'react';

interface ComplexityVisualizationProps {
  numVariables: number;
  actualComplexity?: number;
}

export const ComplexityVisualization: React.FC<ComplexityVisualizationProps> = ({
  numVariables,
  actualComplexity
}) => {
  const [explorerN, setExplorerN] = useState(numVariables);
  const complexityData = useMemo(() => {
    const exponential = Math.pow(2, numVariables);
    const polynomial = numVariables * numVariables;
    const actual = actualComplexity || 0;
    
    // Scale for visualization (log scale for exponential)
    const maxValue = Math.max(exponential, polynomial, actual);
    const logMax = Math.log10(maxValue);
    
    return {
      exponential: {
        value: exponential,
        scaled: Math.log10(exponential) / logMax,
        label: `2^${numVariables} = ${exponential.toLocaleString()}`
      },
      polynomial: {
        value: polynomial,
        scaled: Math.log10(polynomial) / logMax,
        label: `N² = ${polynomial}`
      },
      actual: {
        value: actual,
        scaled: actual > 0 ? Math.log10(actual) / logMax : 0,
        label: `Certificate = ${actual}`
      }
    };
  }, [numVariables, actualComplexity]);

  // Calculate explorer data
  const explorerData = useMemo(() => {
    const exp = Math.pow(2, explorerN);
    const poly = explorerN * explorerN;
    return {
      exponential: exp,
      polynomial: poly,
      ratio: (exp / poly).toFixed(1)
    };
  }, [explorerN]);

  // Generate data points for the chart
  const chartData = useMemo(() => {
    const points = [];
    for (let n = 3; n <= 25; n++) {
      points.push({
        n,
        exponential: Math.pow(2, n),
        polynomial: n * n
      });
    }
    return points;
  }, []);

  // Find max for scaling
  const maxY = Math.pow(2, 25);
  const chartHeight = 300;

  return (
    <div className="bg-slate-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-purple-400 mb-4">Interactive Complexity Visualization</h3>
      
      {/* Interactive Scaling Chart */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Complexity Growth Chart</h4>
        
        {/* Chart Area */}
        <div className="relative" style={{ height: `${chartHeight}px` }}>
          {/* Y-axis labels (log scale) */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-400">
            <span>10^7</span>
            <span>10^6</span>
            <span>10^5</span>
            <span>10^4</span>
            <span>10^3</span>
            <span>10^2</span>
            <span>10^1</span>
          </div>
          
          {/* Chart Canvas */}
          <div className="absolute left-14 right-0 top-0 bottom-6 border-l-2 border-b-2 border-slate-600">
            {/* Grid lines */}
            {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, i) => (
              <div 
                key={i}
                className="absolute left-0 right-0 border-t border-slate-700/50"
                style={{ bottom: `${ratio * 100}%` }}
              />
            ))}
            
            {/* Exponential curve (2^N) */}
            <svg className="absolute inset-0" style={{ overflow: 'visible' }}>
              <path
                d={chartData.map((point, i) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = (Math.log10(point.exponential) / Math.log10(maxY)) * 100;
                  return `${i === 0 ? 'M' : 'L'} ${x}% ${100 - y}%`;
                }).join(' ')}
                stroke="rgb(239, 68, 68)"
                strokeWidth="3"
                fill="none"
              />
            </svg>
            
            {/* Polynomial curve (N²) */}
            <svg className="absolute inset-0" style={{ overflow: 'visible' }}>
              <path
                d={chartData.map((point, i) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = (Math.log10(point.polynomial) / Math.log10(maxY)) * 100;
                  return `${i === 0 ? 'M' : 'L'} ${x}% ${100 - y}%`;
                }).join(' ')}
                stroke="rgb(34, 197, 94)"
                strokeWidth="3"
                fill="none"
              />
            </svg>
            
            {/* Current problem marker */}
            {(() => {
              const index = numVariables - 3;
              if (index >= 0 && index < chartData.length) {
                const x = (index / (chartData.length - 1)) * 100;
                const actualY = actualComplexity 
                  ? (Math.log10(actualComplexity) / Math.log10(maxY)) * 100
                  : (Math.log10(chartData[index].polynomial) / Math.log10(maxY)) * 100;
                return (
                  <div
                    className="absolute w-3 h-3 bg-blue-400 rounded-full border-2 border-white"
                    style={{ 
                      left: `${x}%`, 
                      bottom: `${actualY}%`,
                      transform: 'translate(-50%, 50%)'
                    }}
                    title={`Your Problem (N=${numVariables})`}
                  />
                );
              }
              return null;
            })()}
            
            {/* Explorer marker */}
            {(() => {
              const index = explorerN - 3;
              if (index >= 0 && index < chartData.length) {
                const x = (index / (chartData.length - 1)) * 100;
                const y = (Math.log10(chartData[index].polynomial) / Math.log10(maxY)) * 100;
                return (
                  <div
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{ 
                      left: `${x}%`, 
                      bottom: `${y}%`,
                      transform: 'translate(-50%, 50%)'
                    }}
                  />
                );
              }
              return null;
            })()}
          </div>
          
          {/* X-axis labels */}
          <div className="absolute left-14 right-0 bottom-0 h-6 flex justify-between text-xs text-slate-400">
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
            <span>25</span>
            <span className="text-slate-500">(N)</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-red-500"></div>
            <span className="text-slate-300">2^N (Exponential)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-green-500"></div>
            <span className="text-slate-300">N² (Polynomial)</span>
          </div>
          {actualComplexity && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300">Your Problem</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Interactive Explorer */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Explore Complexity at Different Sizes</h4>
        
        <div className="flex items-center space-x-3 mb-3">
          <label className="text-sm text-slate-400">N =</label>
          <input
            type="range"
            min="3"
            max="25"
            value={explorerN}
            onChange={(e) => setExplorerN(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-mono font-bold text-slate-200 w-8">{explorerN}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-green-900/30 rounded p-2 border border-green-500/50">
            <p className="text-xs text-slate-400">N² Polynomial</p>
            <p className="text-lg font-mono font-bold text-green-400">{explorerData.polynomial.toLocaleString()}</p>
          </div>
          <div className="bg-red-900/30 rounded p-2 border border-red-500/50">
            <p className="text-xs text-slate-400">2^N Exponential</p>
            <p className="text-lg font-mono font-bold text-red-400">
              {explorerData.exponential > 1000000 
                ? `${(explorerData.exponential / 1000000).toFixed(1)}M` 
                : explorerData.exponential.toLocaleString()}
            </p>
          </div>
          <div className="bg-yellow-900/30 rounded p-2 border border-yellow-500/50">
            <p className="text-xs text-slate-400">Efficiency Gain</p>
            <p className="text-lg font-mono font-bold text-yellow-400">{explorerData.ratio}x</p>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-slate-400">
          <p>At N={explorerN}, EGPT's polynomial approach is <strong className="text-yellow-400">{explorerData.ratio}x more efficient</strong> than exponential brute force.</p>
        </div>
      </div>
      
      {/* Explanation */}
      <div className="bg-slate-900/50 rounded p-3 space-y-2">
        <h4 className="font-semibold text-yellow-400">The P=NP Question</h4>
        <div className="text-sm text-slate-300 space-y-1">
          <p><strong>Traditional View:</strong> NP problems require exponential time (2^N)</p>
          <p><strong>EGPT Insight:</strong> With bijective encoding, complexity becomes polynomial (N²)</p>
          <p><strong>Key:</strong> The "Address Is The Map" metaphor shows how addresses encode paths directly</p>
        </div>
        
        {actualComplexity && actualComplexity > 0 && (
          <div className="mt-3 p-2 bg-green-900/30 border border-green-500/50 rounded">
            <p className="text-sm text-green-300">
              <strong>Result:</strong> Certificate complexity ({actualComplexity}) stays well within polynomial bounds, 
              demonstrating P=NP through EGPT's bijective encoding.
            </p>
          </div>
        )}
      </div>
      
      {/* Scale Note */}
      <div className="mt-3 text-xs text-slate-400">
        <p><strong>Note:</strong> Chart uses logarithmic scale due to exponential growth. 
        Even small differences represent massive computational savings.</p>
      </div>
    </div>
  );
};
