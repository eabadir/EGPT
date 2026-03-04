import type { CNFProblem, Certificate, OverlayPlacementConfig, Point } from '../types';
import { calculateSpiralPoint } from '../hooks/useSquareSpiral';

/**
 * Convert a CNF problem and optional certificate to an overlay placement configuration.
 * Maps variables to points on the spiral based on their variable number.
 */
export function cnfToOverlay(
  problem: CNFProblem | null,
  certificate: Certificate | null
): OverlayPlacementConfig {
  if (!problem) {
    return {
      mustVisit: [],
      mustAvoid: [],
      mustStartAt: undefined,
      mustEndAt: undefined,
    };
  }

  // Collect all unique variables from clauses
  const variableSet = new Set<number>();
  problem.clauses.forEach(clause => {
    clause.forEach(literal => {
      variableSet.add(literal.city.num);
    });
  });

  const variables = Array.from(variableSet).sort((a, b) => a - b);

  // If we have a certificate, use it to determine must visit/avoid
  if (certificate && certificate.assignment) {
    const mustVisit: Point[] = [];
    const mustAvoid: Point[] = [];

    variables.forEach((varNum, idx) => {
      // Use the assignment if available, otherwise default to the point
      const isTrue = idx < certificate.assignment.length ? certificate.assignment[idx] : false;
      const point = calculateSpiralPoint(varNum);
      
      if (isTrue) {
        mustVisit.push(point);
      } else {
        mustAvoid.push(point);
      }
    });

    return {
      mustVisit,
      mustAvoid,
      mustStartAt: mustVisit.length > 0 ? mustVisit[0] : undefined,
      mustEndAt: mustVisit.length > 1 ? mustVisit[mustVisit.length - 1] : undefined,
    };
  }

  // No certificate - just show all variables as neutral (will be rendered as constraint points)
  const allPoints = variables.map(varNum => calculateSpiralPoint(varNum));
  
  return {
    mustVisit: allPoints,
    mustAvoid: [],
    mustStartAt: allPoints.length > 0 ? allPoints[0] : undefined,
    mustEndAt: allPoints.length > 1 ? allPoints[allPoints.length - 1] : undefined,
  };
}

/**
 * Create a simple CNF problem from the old format (clauseCities and clauses).
 * This helps maintain backward compatibility with the existing SAT generation.
 */
export function simpleCnfToProblem(
  clauseCities: Point[],
  clauses: Array<Array<{ city: Point; positive: boolean }>>,
  description?: string,
  certificate?: import('../types').Certificate
): CNFProblem | null {
  if (clauseCities.length === 0 || clauses.length === 0) {
    return null;
  }

  return {
    numVariables: clauseCities.length,
    clauses: clauses,
    description: description || `Generated ${clauseCities.length}-variable SAT problem`,
    hasCertificate: !!certificate,
    certificate: certificate,
    problemSource: 'user-generated',
    tag: 'SAT',
    suggestedOverlay: 'circuit'
  };
}


