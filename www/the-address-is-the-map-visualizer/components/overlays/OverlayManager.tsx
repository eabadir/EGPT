import React from 'react';
import { ManhattanOverlay } from './ManhattanOverlay';
import { CircuitOverlay } from './CircuitOverlay';
import { NeuralNetOverlay } from './NeuralNetOverlay';
import { SudokuOverlay } from './SudokuOverlay';
import type { OverlayType, OverlayProps } from './types';

interface OverlayManagerProps extends OverlayProps {
  overlayType: OverlayType;
}

export const OverlayManager: React.FC<OverlayManagerProps> = ({
  overlayType,
  placementConfig,
  spiralPoints,
  viewBox,
  problem,
  certificate,
}) => {
  if (overlayType === 'none') {
    return null;
  }

  const overlayProps: OverlayProps = {
    placementConfig,
    spiralPoints,
    viewBox,
    problem,
    certificate,
  };

  return (
    <g className="overlay-manager">
      {overlayType === 'manhattan' && <ManhattanOverlay {...overlayProps} />}
      {overlayType === 'circuit' && <CircuitOverlay {...overlayProps} />}
      {overlayType === 'neuralnet' && <NeuralNetOverlay {...overlayProps} />}
      {overlayType === 'sudoku' && <SudokuOverlay {...overlayProps} />}
    </g>
  );
};

