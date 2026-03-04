export interface Point {
  x: number;
  y: number;
  num: number;
}

export interface PointWithDetails extends Point {
  k: number; // Ring level
  offsetInRing: number; // Offset from the start of the ring
  ringStartN: number; // N at the start of the ring
  ringSize: number; // Number of points in this ring's perimeter
  quadrant: number; // Which of the 4 segments of the ring the point is on (1-4)
  offsetInQuadrant: number; // Offset from the start of the quadrant
}

// A Literal is a single condition in a clause (e.g., "Visit City 5" or "Avoid City 10")
export interface Literal {
  city: Point;
  positive: boolean; // true for "visit", false for "avoid"
}

// A Clause is a set of literals connected by ORs.
export type Clause = Literal[];

// New types for the Test Center
export interface CNFProblem {
  numVariables: number;
  clauses: Clause[];
  description?: string;
  tag?: ProblemTag; // 'TR', 'SAT', 'AI'
  suggestedOverlay?: OverlayType;
  
  // NP-Complete certification
  hasCertificate: boolean; // Is this NP-Complete with known solution?
  certificate?: Certificate; // Pre-computed certificate if available
  problemSource?: 'builtin' | 'example' | 'user-uploaded' | 'user-generated';
  realWorldContext?: string; // e.g., "Neural network training for MNIST"
  uploadedBy?: string;
  uploadedDate?: string;
}

export interface Certificate {
  assignment: boolean[];
  witnessLiterals: number[]; // Index of satisfying literal per clause
  complexity: number;
}

export type SolverStatus = 'polynomial' | 'exponential' | 'timeout' | 'proven-unsat';

export interface SolverResult {
  found: boolean;
  certificate?: Certificate;
  iterations: number;
  timeMs: number;
  
  // Enhanced status tracking
  status: SolverStatus;
  exploredSpace: number; // Percentage of 2^N explored
  maxIterationsReached?: boolean; // Did we try all 2^N?
  timeoutReached?: boolean;
  timeoutMs?: number;
}

export interface EncoderDecoder {
  encode: (cnf: CNFProblem) => any;
  decode: (solution: any) => boolean[];
  encodingComplexity: (cnf: CNFProblem) => number;
}

export interface Solver {
  name: string;
  description: string;
  solve: (cnf: CNFProblem) => SolverResult;
}

export interface CustomSolver extends Solver {
  encoderDecoder: EncoderDecoder;
  code: string;
}

export interface VisualizationView {
  name: string;
  icon: string;
  render: (problem: CNFProblem, assignment?: boolean[]) => JSX.Element;
  suitable: (problem: CNFProblem) => boolean;
}

export interface VerifiedMetrics {
  bruteForceSolves: boolean;
  expectedIterations: number;
  maxIterations: number; // 2^N
  withinN2Bound: boolean;
  bruteForceTimeoutMs: number;
}

// Overlay types for visualization
export type OverlayType = 'none' | 'manhattan' | 'circuit' | 'neuralnet' | 'sudoku';

export interface OverlayPlacementConfig {
  mustVisit: Point[];
  mustAvoid: Point[];
  mustStartAt?: Point;
  mustEndAt?: Point;
}

// Problem tags for categorization
export type ProblemTag = 'TR' | 'SAT' | 'AI';