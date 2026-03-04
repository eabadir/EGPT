import React from 'react';
import type { PointWithDetails } from '../types';

interface NumberLineVisualizationProps {
  targetPointDetails: PointWithDetails;
}

export const NumberLineVisualization: React.FC<NumberLineVisualizationProps> = ({ targetPointDetails }) => {
  const { num, ringStartN, ringSize } = targetPointDetails;

  // Handle the special case for N=0 where ringSize is 1, but should be treated as a full bar
  const effectiveRingSize = ringSize === 1 && ringStartN === 0 ? 0 : ringSize;
  const progressInRing = num - ringStartN;

  const percentage = effectiveRingSize > 0 ? (progressInRing / effectiveRingSize) * 100 : 100;

  const startLabel = ringStartN;
  const endLabel = ringStartN + effectiveRingSize;

  return (
    <div className="w-full px-2">
      <div className="relative h-2 bg-slate-700 rounded-full">
        <div 
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="absolute top-1/2 w-4 h-4 bg-slate-100 rounded-full border-2 border-cyan-400 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
          style={{ left: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
};