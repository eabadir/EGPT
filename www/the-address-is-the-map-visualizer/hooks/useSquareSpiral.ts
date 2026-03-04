import { useMemo } from 'react';
import type { Point, PointWithDetails } from '../types';

export const calculateSpiralPoint = (n: number): Point => {
  if (n === 0) {
    return { x: 0, y: 0, num: 0 };
  }

  // k is the ring level (k=1 is the first 3x3 square)
  const k = Math.ceil((Math.sqrt(n + 1) - 1) / 2);
  const s = 2 * k; // side length of the k-th ring's path
  const nStartOfRing = Math.pow(2 * k - 1, 2);
  const offset = n - nStartOfRing;

  const endOfSeg1 = s - 1;
  const endOfSeg2 = endOfSeg1 + s;
  const endOfSeg3 = endOfSeg2 + s;

  let x: number, y: number;

  if (offset <= endOfSeg1) {
    x = k;
    y = -(k - 1) + offset;
  } else if (offset <= endOfSeg2) {
    const offsetInSeg = offset - endOfSeg1;
    x = k - offsetInSeg;
    y = k;
  } else if (offset <= endOfSeg3) {
    const offsetInSeg = offset - endOfSeg2;
    x = -k;
    y = k - offsetInSeg;
  } else {
    const offsetInSeg = offset - endOfSeg3;
    x = -k + offsetInSeg;
    y = -k;
  }

  return { x, y, num: n };
};

export const getPointDetails = (n: number): PointWithDetails => {
  if (n === 0) {
    return { x: 0, y: 0, num: 0, k: 0, offsetInRing: 0, ringStartN: 0, ringSize: 1, quadrant: 0, offsetInQuadrant: 0 };
  }

  const k = Math.ceil((Math.sqrt(n + 1) - 1) / 2);
  const s = 2 * k; // The number of points on each side of the ring's path
  const ringStartN = Math.pow(2 * k - 1, 2);
  const offsetInRing = n - ringStartN;
  const ringSize = 8 * k;

  const quadrant = Math.floor(offsetInRing / s) + 1;
  const offsetInQuadrant = offsetInRing % s;

  const { x, y } = calculateSpiralPoint(n);

  return { x, y, num: n, k, offsetInRing, ringStartN, ringSize, quadrant, offsetInQuadrant };
};


export const useSquareSpiral = (maxN: number): { spiralPoints: Point[] } => {
  return useMemo(() => {
    if (maxN < 1) {
      return { spiralPoints: [] };
    }
    
    const points: Point[] = new Array(maxN);
    for (let i = 0; i < maxN; i++) {
      points[i] = calculateSpiralPoint(i);
    }
    
    return { spiralPoints: points };
  }, [maxN]);
};

export const calculateEntropy = (n: number): number => {
    if (n <= 0) return 0.0;
    const { k, offsetInRing, ringSize } = getPointDetails(n);
    if (k === 0) return 0.0; // Technically covered by n<=0, but good for clarity
    
    const fractionalOffset = ringSize > 0 ? offsetInRing / ringSize : 0;
    return k + fractionalOffset;
};