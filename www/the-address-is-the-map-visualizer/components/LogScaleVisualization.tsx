
import React, { useMemo } from 'react';
import type { PointWithDetails } from '../types';

interface LogScaleVisualizationProps {
  targetPointDetails: PointWithDetails;
}

export const LogScaleVisualization: React.FC<LogScaleVisualizationProps> = ({ targetPointDetails }) => {
  const { k, offsetInRing, ringSize } = targetPointDetails;

  const maxK = k + 1; // The "goal" is the next ring level

  const percentage = useMemo(() => {
    if (k === 0 && ringSize <= 1) return 0; // Handle N=0
    
    // Fractional progress within the current ring
    const progressInRing = ringSize > 0 ? offsetInRing / ringSize : 0;
    
    // Total progress is the number of full rings completed plus the progress in the current one
    const totalProgress = k + progressInRing;

    return (totalProgress / maxK) * 100;
  }, [k, offsetInRing, ringSize, maxK]);

  return (
    <div className="w-full px-2">
      <div className="relative h-2 bg-slate-700 rounded-full">
        <div 
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="absolute top-1/2 w-4 h-4 bg-slate-100 rounded-full border-2 border-pink-400 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
          style={{ left: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-2">
        <span>Ring 0</span>
        <span>Ring {maxK}</span>
      </div>
    </div>
  );
};