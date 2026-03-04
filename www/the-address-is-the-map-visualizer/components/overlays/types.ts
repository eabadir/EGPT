import type { Point, CNFProblem, Certificate } from '../../types';

export type OverlayType = 'none' | 'manhattan' | 'circuit' | 'neuralnet' | 'sudoku';

export interface OverlayPlacementConfig {
  mustVisit: Point[];
  mustAvoid: Point[];
  mustStartAt?: Point;
  mustEndAt?: Point;
}

export interface OverlayProps {
  placementConfig: OverlayPlacementConfig;
  spiralPoints: Point[];
  viewBox: number[]; // [minX, minY, width, height]
  problem?: CNFProblem | null;
  certificate?: Certificate | null;
}


