import React from 'react';
import type { OverlayType } from '../types';

interface OverlayControlsProps {
  overlayType: OverlayType;
  onOverlayTypeChange: (type: OverlayType) => void;
  spiralOpacity: number;
  onSpiralOpacityChange: (opacity: number) => void;
}

export const OverlayControls: React.FC<OverlayControlsProps> = ({
  overlayType,
  onOverlayTypeChange,
  spiralOpacity,
  onSpiralOpacityChange,
}) => {
  return (
    <div className="bg-slate-800/50 rounded-lg shadow-xl p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">
          Turn The Address Into The Map
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          View the spiral as different overlays to understand how addresses map to locations
        </p>
      </div>

      {/* Overlay Type Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Overlay Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOverlayTypeChange('none')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              overlayType === 'none'
                ? 'bg-cyan-500 text-slate-900 shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            None
          </button>
          <button
            onClick={() => onOverlayTypeChange('manhattan')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              overlayType === 'manhattan'
                ? 'bg-amber-500 text-slate-900 shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🏙️ City
          </button>
          <button
            onClick={() => onOverlayTypeChange('circuit')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              overlayType === 'circuit'
                ? 'bg-green-500 text-slate-900 shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            ⚡ Circuit
          </button>
          <button
            onClick={() => onOverlayTypeChange('neuralnet')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              overlayType === 'neuralnet'
                ? 'bg-cyan-400 text-slate-900 shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🧠 Neural Net
          </button>
          <button
            onClick={() => onOverlayTypeChange('sudoku')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all col-span-2 ${
              overlayType === 'sudoku'
                ? 'bg-purple-500 text-slate-900 shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🔢 Sudoku
          </button>
        </div>
      </div>

      {/* Spiral Opacity Slider */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Spiral Path Opacity: {Math.round(spiralOpacity * 100)}%
        </label>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500">Hidden</span>
          <input
            type="range"
            min="0"
            max="100"
            value={spiralOpacity * 100}
            onChange={(e) => onSpiralOpacityChange(parseInt(e.target.value) / 100)}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-cyan-400
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-cyan-400
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer"
          />
          <span className="text-xs text-slate-500">Visible</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {overlayType === 'none'
            ? 'Adjust spiral visibility'
            : 'Control how much the spiral path shows through the overlay'}
        </p>
      </div>

      {/* Info box */}
      {overlayType !== 'none' && (
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400">
            {overlayType === 'manhattan' && (
              <>
                <span className="text-amber-400 font-semibold">🏙️ City View:</span> Buildings
                represent addresses. Golden buildings are destinations to visit, gray buildings
                are locations to avoid.
              </>
            )}
            {overlayType === 'circuit' && (
              <>
                <span className="text-green-400 font-semibold">⚡ Circuit View:</span> Electronic
                components on a circuit board. Green LEDs are active nodes, resistors are
                blocked paths.
              </>
            )}
            {overlayType === 'neuralnet' && (
              <>
                <span className="text-cyan-400 font-semibold">🧠 Neural Net View:</span> Neurons
                in a network. Cyan neurons are activated, gray neurons are inactive, connections
                show the network topology.
              </>
            )}
            {overlayType === 'sudoku' && (
              <>
                <span className="text-purple-400 font-semibold">🔢 Sudoku View:</span> Classic 9×9
                Sudoku puzzle grid. Blue numbers are given clues, gray numbers are solved cells.
                Shows how Sudoku constraints are encoded as SAT.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

