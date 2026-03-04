import React, { useMemo } from 'react';
import type { PointWithDetails, Clause, Literal } from '../types';

interface ControlsProps {
  targetN: number;
  onNChange: (newN: number) => void;
  maxN: number;
  targetPointDetails?: PointWithDetails;
  onGenerateCnf: () => void;
  totalSolutionEntropy: number;
  clauses: Clause[];
  onAddToPath: (n: number) => void;
}

const SmallInfoCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
  <div className="bg-slate-900/70 p-2 rounded-lg text-center">
    <h4 className="text-xs text-slate-400 font-medium">{title}</h4>
    <p className="text-xl font-bold text-cyan-300 font-mono">{value}</p>
    <p className="text-[10px] text-slate-500 truncate" title={description}>{description}</p>
  </div>
);

const LocationAnalysis: React.FC<{ details: PointWithDetails }> = ({ details }) => {
  const { x, y, num, k, offsetInRing, ringStartN, ringSize, quadrant, offsetInQuadrant } = details;
  
  const manhattanDistance = Math.abs(x) + Math.abs(y);

  // This entropy metric, {Ring}.{Fractional Offset}, is monotonic and bijectively maps
  // to the address N and its representation in the complex plane, reinforcing
  // the "address is the map" concept.
  const entropy = useMemo(() => {
    if (k === 0) return 0.0;
    const fractionalOffset = ringSize > 0 ? offsetInRing / ringSize : 0;
    return k + fractionalOffset;
  }, [k, offsetInRing, ringSize]);
  const entropyStr = entropy.toFixed(3);


  // Spiral Projection: Rotate by +45 degrees for complex plane alignment
  const spiralRotX = ((x - y) / Math.sqrt(2)).toFixed(2);
  const spiralRotY = ((x + y) / Math.sqrt(2)).toFixed(2);
  const spiralComplexSign = parseFloat(spiralRotY) >= 0 ? '+' : '-';
  const spiralComplexY = Math.abs(parseFloat(spiralRotY));

  // Re-calculate offset from entropy for the inversion proof
  const invertedOffset = Math.round((entropy - k) * (8 * k || 1));

  return (
    <div className="bg-slate-800 p-4 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-center text-slate-300">Location Analysis</h3>
      
      {/* --- Coordinate Systems --- */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-slate-400">Coordinate Systems</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-900/50 p-3 rounded">
            <h4 className="font-semibold text-emerald-400">Cartesian</h4>
            <p className="font-mono text-lg">{`(${x}, ${y})`}</p>
          </div>
          <div className="bg-slate-900/50 p-3 rounded">
            <h4 className="font-semibold text-sky-400">Spiral Polar</h4>
            <p className="font-mono text-lg">{`(k:${k}, q:${quadrant}, o:${offsetInQuadrant})`}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded col-span-full">
            <h4 className="font-semibold text-violet-400">Complex Plane (Rotated +45°)</h4>
            <p className="font-mono text-lg">{`${spiralRotX} ${spiralComplexSign} ${spiralComplexY}i`}</p>
        </div>
      </div>
      
      {/* Transformation */}
      <div>
        <h4 className="text-md font-semibold text-slate-400 mb-2">Transformation (Address to Coordinates)</h4>
        <div className="bg-slate-900/50 p-3 rounded font-mono text-xs space-y-1 text-slate-300">
          <p><span className="text-slate-500">Ring (k)</span> = ceil((sqrt({num}+1)-1)/2) = <span className="text-cyan-300">{k}</span></p>
          <p><span className="text-slate-500">Ring Start</span> = (2*{k}-1)² = <span className="text-cyan-300">{ringStartN}</span></p>
          <p><span className="text-slate-500">Offset</span> = {num} - {ringStartN} = <span className="text-cyan-300">{offsetInRing}</span></p>
          <p><span className="text-slate-500">Quadrant</span> = floor({offsetInRing} / (2*{k})) + 1 = <span className="text-cyan-300">{quadrant || 0}</span></p>
          <p><span className="text-slate-500">Q. Offset</span> = {offsetInRing} % (2*{k}) = <span className="text-cyan-300">{offsetInQuadrant}</span></p>
        </div>
      </div>

       {/* Metrics & Inversion */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-slate-400">Topological Entropy</h4>
        <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-900/50 p-2 rounded">
                <h4 className="text-sm text-slate-400">Manhattan Distance</h4>
                <p className="font-mono text-2xl text-pink-400 font-bold">{manhattanDistance}</p>
            </div>
            <div className="bg-slate-900/50 p-2 rounded">
                <h4 className="text-sm text-slate-400">Entropy</h4>
                <p className="font-mono text-2xl text-pink-400 font-bold">{entropyStr}</p>
            </div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded font-mono text-xs space-y-1 text-slate-300">
            <p className="text-slate-400 text-sm mb-2 not-font-mono">This entropy is bijective and can be inverted to find the original address:</p>
            <p><span className="text-slate-500">Ring (k)</span> = floor({entropyStr}) = <span className="text-cyan-300">{k}</span></p>
            <p><span className="text-slate-500">Offset</span> = round(({entropyStr} - {k}) * (8*{k})) = <span className="text-cyan-300">{invertedOffset}</span></p>
            <p><span className="text-slate-500">Address (N)</span> = (2*{k}-1)² + {invertedOffset} = <span className="text-cyan-300">{num}</span></p>
        </div>
      </div>
    </div>
  );
};


const LiteralTag: React.FC<{ literal: Literal }> = ({ literal }) => {
  const bgColor = literal.positive ? 'bg-emerald-500/20' : 'bg-red-500/20';
  const textColor = literal.positive ? 'text-emerald-300' : 'text-red-300';
  const text = literal.positive ? 'Visit' : 'Avoid';
  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${bgColor} ${textColor}`}>
      {text} <span className="font-mono">{literal.city.num}</span>
    </span>
  );
};

const CnfControls: React.FC<{ onGenerate: () => void; totalEntropy: number; clauses: Clause[] }> = ({ onGenerate, totalEntropy, clauses }) => (
  <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
    <h3 className="text-lg font-semibold text-yellow-400 text-center">Constraint Satisfaction (SAT) Simulation</h3>
    <button
      onClick={onGenerate}
      className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
    >
      Generate New Problem
    </button>
    
    {clauses.length > 0 && (
      <div className="space-y-2 pt-2">
        <h4 className="text-sm text-slate-400">Problem Constraints (all must be true):</h4>
        <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
          {clauses.map((clause, i) => (
            <div key={i} className="bg-slate-800/60 rounded p-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="font-bold">{i + 1}:</span>
              <div className="flex flex-wrap gap-2">
                <LiteralTag literal={clause[0]} />
                <span>OR</span>
                <LiteralTag literal={clause[1]} />
                <span>OR</span>
                <LiteralTag literal={clause[2]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {totalEntropy > 0 && (
      <div className="text-center pt-2">
        <p className="text-sm text-slate-400">Satisfying Path Cost (Manhattan Distance):</p>
        <p className="text-2xl font-bold text-yellow-300 font-mono">{totalEntropy}</p>
      </div>
    )}
  </div>
);

export const Controls: React.FC<ControlsProps> = ({ targetN, onNChange, maxN, targetPointDetails, onGenerateCnf, totalSolutionEntropy, clauses, onAddToPath }) => {
  const { k = 0, offsetInRing = 0 } = targetPointDetails ?? {};
  
  const sqrtN = useMemo(() => (targetN > 0 ? Math.sqrt(targetN).toFixed(2) : 0), [targetN]);

  return (
    <div className="space-y-4">
      <CnfControls onGenerate={onGenerateCnf} totalEntropy={totalSolutionEntropy} clauses={clauses} />
      
      <div className="bg-slate-800/50 rounded-lg shadow-xl p-4 space-y-4">
        <div>
          <label htmlFor="n-input" className="block text-sm font-medium text-slate-300 mb-2">
            Enter Address (N)
          </label>
          <input
            id="n-input"
            type="number"
            value={targetN}
            onChange={(e) => onNChange(parseInt(e.target.value, 10))}
            min="0"
            className="w-full bg-slate-900 border border-slate-700 text-cyan-300 rounded-md p-2 text-center text-lg font-mono focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>
        
        <div className="mt-2">
          <button
            onClick={() => onAddToPath(targetN)}
            aria-label={`Add ${targetN} to path`}
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Add to Path
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <SmallInfoCard title="Scale" value={sqrtN} description="≈ sqrt(N)" />
          <SmallInfoCard title="Ring Level" value={k} description="Concentric Square (k)" />
          <SmallInfoCard title="Ring Offset" value={offsetInRing} description="N - Start of Ring" />
        </div>
      </div>

      {targetPointDetails && <LocationAnalysis details={targetPointDetails} />}
    </div>
  );
};