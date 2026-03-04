import React, { useMemo, useRef } from 'react';
import type { Point, OverlayType, OverlayPlacementConfig, CNFProblem, Certificate } from '../types';
import { OverlayManager } from './overlays/OverlayManager';

interface GridVisualizationProps {
  spiralPoints: Point[];
  targetPoint: Point;
  scaleChangePoints: Point[];
  onPointSelect: (n: number) => void;
  clauseCities: Point[];
  solutionAssignment: Map<number, boolean>;
  solutionPath: Point[];
  pathPoints: Point[];
  certificatePath?: Point[];
  overlayType?: OverlayType;
  spiralOpacity?: number;
  overlayPlacementConfig?: OverlayPlacementConfig;
  currentProblem?: CNFProblem | null;
  certificate?: Certificate | null;
}

const OffscreenIndicator: React.FC<{ targetPoint: Point, viewBox: number[] }> = ({ targetPoint, viewBox }) => {
    const { x: edgeX, y: edgeY, angle } = useMemo(() => {
        const [vbMinX, vbMinY, vbWidth, vbHeight] = viewBox;

        const targetX = targetPoint.x;
        const targetY = -targetPoint.y; // SVG Y-axis is inverted from Cartesian

        const angleRad = Math.atan2(targetY, targetX);
        const angleDeg = angleRad * 180 / Math.PI;

        const padding = 1.0;
        const bounds = {
            left: vbMinX + padding,
            right: vbMinX + vbWidth - padding,
            top: vbMinY + padding,
            bottom: vbMinY + vbHeight - padding,
        };

        let x, y;
        
        const boxWidth = bounds.right - bounds.left;
        const boxHeight = bounds.bottom - bounds.top;

        if (Math.abs(targetY * boxWidth) <= Math.abs(targetX * boxHeight)) {
            if (targetX > 0) {
                x = bounds.right;
                y = targetY * (x / targetX);
            } else {
                x = bounds.left;
                y = targetY * (x / targetX);
            }
        } else {
            if (targetY > 0) {
                y = bounds.bottom;
                x = targetX * (y / targetY);
            } else {
                y = bounds.top;
                x = targetX * (y / targetY);
            }
        }

        return { x, y, angle: angleDeg };
    }, [targetPoint, viewBox]);

    return (
      <g className="pointer-events-none">
        <line 
          x1="0" y1="0" 
          x2={edgeX} y2={edgeY} 
          stroke="#34d399" 
          strokeWidth="0.2" 
          strokeDasharray="0.5 0.5"
        />
        <g transform={`translate(${edgeX}, ${edgeY}) rotate(${angle})`}>
          <path d="M -0.8 0.5 L 0 0 L -0.8 -0.5 Z" fill="#34d399" />
          <circle cx="0" cy="0" r="0.4" fill="#34d399">
            <animate attributeName="r" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>
    );
};


export const GridVisualization: React.FC<GridVisualizationProps> = ({ 
  spiralPoints, 
  targetPoint, 
  scaleChangePoints, 
  onPointSelect,
  clauseCities, 
  solutionAssignment, 
  solutionPath, 
  pathPoints,
  certificatePath = [],
  overlayType = 'none',
  spiralOpacity = 1.0,
  overlayPlacementConfig,
  currentProblem,
  certificate
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const { viewBox, viewBoxArr, pathData, solutionPathData, pathLineData, certificatePathData, labelPositions } = useMemo(() => {
    if (spiralPoints.length === 0) {
      return { viewBox: '-10 -10 20 20', viewBoxArr: [-10, -10, 20, 20], pathData: '', solutionPathData: '', pathLineData: '', certificatePathData: '', labelPositions: {} };
    }
    
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    spiralPoints.forEach(p => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });

    const padding = 2;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    
    const pathData = spiralPoints.map((p, i) => i === 0 ? `M ${p.x} ${-p.y}` : `L ${p.x} ${-p.y}`).join(' ');
    
    const solutionPathData = solutionPath.map((p, i) => i === 0 ? `M ${p.x} ${-p.y}` : `L ${p.x} ${-p.y}`).join(' ');
    
    const pathLineData = pathPoints.length > 1 ? pathPoints.map((p, i) => i === 0 ? `M ${p.x} ${-p.y}` : `L ${p.x} ${-p.y}`).join(' ') : '';
    
    const certificatePathData = certificatePath.length > 1 ? certificatePath.map((p, i) => i === 0 ? `M ${p.x} ${-p.y}` : `L ${p.x} ${-p.y}`).join(' ') : '';


    const vb = [minX - padding, minY - padding, width, height];

    const axisOffset = maxX * 0.5; // Position labels halfway from center to edge on each axis

    const labelPositions = {
      q1: { x: axisOffset, y: 0 },         // Right
      q2: { x: 0, y: -axisOffset },        // Top (negative Y in SVG)
      q3: { x: -axisOffset, y: 0 },        // Left
      q4: { x: 0, y: axisOffset },         // Bottom (positive Y in SVG)
    };

    return { 
      viewBox: vb.join(' '),
      viewBoxArr: vb,
      pathData,
      solutionPathData,
      pathLineData,
      certificatePathData,
      labelPositions
    };
  }, [spiralPoints, solutionPath, pathPoints, certificatePath]);

  const isTargetVisible = useMemo(() => {
    const [minX, minY, width, height] = viewBoxArr;
    const { x, y } = targetPoint;
    return x >= minX && x <= minX + width && y >= minY && y <= minY+height;
  }, [targetPoint, viewBoxArr]);


  const { shortestPathData, shortestPathColor } = useMemo(() => {
    const { x, y } = targetPoint;
    if (x === 0 && y === 0) return { shortestPathData: '', shortestPathColor: 'transparent'};

    let path = 'M 0 0';
    let color = 'stroke-pink-400';
    
    if (x !== 0) path += ` H ${x}`;
    if (y !== 0) path += ` V ${-y}`;
    
    return { shortestPathData: path, shortestPathColor: color };
  }, [targetPoint]);
  
  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformedPt = pt.matrixTransform(ctm.inverse());
      const clickX = transformedPt.x;
      const clickY = -transformedPt.y; 

      let closestPoint = spiralPoints[0];
      let minDistance = Infinity;

      for (const point of spiralPoints) {
        const distance = Math.sqrt(Math.pow(point.x - clickX, 2) + Math.pow(point.y - clickY, 2));
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }
      onPointSelect(closestPoint.num);
    }
  };

  return (
    <svg 
      ref={svgRef} 
      viewBox={viewBox} 
      className="max-w-full max-h-full transition-all duration-500 cursor-pointer"
      onClick={handleClick}
    >
      <defs>
        <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" /> {/* cyan-400 */}
          <stop offset="100%" stopColor="#a78bfa" /> {/* violet-400 */}
        </linearGradient>
      </defs>

      {/* Spiral elements group with opacity control */}
      <g opacity={spiralOpacity} className="transition-opacity duration-500">
        {/* Quadrant Labels */}
        {'q1' in labelPositions && <text x={labelPositions.q1.x} y={labelPositions.q1.y} fontSize="2.5" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="font-sans font-normal pointer-events-none">Q1</text>}
        {'q2' in labelPositions && <text x={labelPositions.q2.x} y={labelPositions.q2.y} fontSize="2.5" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="font-sans font-normal pointer-events-none">Q2</text>}
        {'q3' in labelPositions && <text x={labelPositions.q3.x} y={labelPositions.q3.y} fontSize="2.5" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="font-sans font-normal pointer-events-none">Q3</text>}
        {'q4' in labelPositions && <text x={labelPositions.q4.x} y={labelPositions.q4.y} fontSize="2.5" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="font-sans font-normal pointer-events-none">Q4</text>}
        
        {/* Spiral Path */}
        <path 
          d={pathData} 
          stroke="url(#spiralGradient)" 
          strokeWidth="0.1" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-all duration-500 pointer-events-none"
        />
      </g>
      
      {/* Manual Path Visualization (from Add to Path) */}
      {pathLineData && (
        <>
          <path
            d={pathLineData}
            stroke="#a78bfa" // violet-400
            strokeWidth="0.1"
            strokeDasharray="0.4 0.4"
            fill="none"
            className="pointer-events-none"
          />
          {pathPoints.map(p => (
            <circle 
              key={`path-pt-${p.num}-${Math.random()}`}
              cx={p.x} 
              cy={-p.y} 
              r="0.3" 
              fill="#c4b5fd" // violet-300
              className="pointer-events-none"
            />
          ))}
        </>
      )}
      
      {/* Certificate Path Visualization (from solver) */}
      {certificatePathData && (
        <>
          <path
            d={certificatePathData}
            stroke="#8b5cf6" // violet-500
            strokeWidth="0.2"
            strokeDasharray="0.5 0.3"
            fill="none"
            className="pointer-events-none"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-10"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          {certificatePath.map((p, idx) => (
            <g key={`cert-pt-${p.num}`}>
              <circle 
                cx={p.x} 
                cy={-p.y} 
                r="0.35" 
                fill="#8b5cf6" // violet-500
                className="pointer-events-none"
              />
              <circle 
                cx={p.x} 
                cy={-p.y} 
                r="0.25" 
                fill="#c4b5fd" // violet-300
                className="pointer-events-none"
              />
              {/* Label showing visit order */}
              <text
                x={p.x}
                y={-p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="0.3"
                fill="#1e1b4b"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {idx + 1}
              </text>
            </g>
          ))}
        </>
      )}
      
      {/* --- SAT VISUALIZATION --- */}
      {solutionPathData && (
        <path
          d={solutionPathData}
          stroke="#facc15" // yellow-400
          strokeWidth="0.15"
          strokeDasharray="0.3 0.3"
          fill="none"
          className="pointer-events-none"
        />
      )}

      {clauseCities.map(p => {
        const isVisited = solutionAssignment.get(p.num);
        if (isVisited === true) {
          return ( // Star shape for 'hit' points
            <path 
              key={`sat-${p.num}`}
              transform={`translate(${p.x}, ${-p.y}) scale(0.4)`}
              d="M0,-1.05 L0.22,-0.31 L0.95,0.31 L0.36,0.85 L0.59,1.62 L0,1.2 L-0.59,1.62 L-0.36,0.85 L-0.95,0.31 L-0.22,-0.31 Z"
              fill="#facc15"
              className="pointer-events-none"
            >
              <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" />
            </path>
          );
        }
        if (isVisited === false) {
          return ( // X shape for 'avoid' points
            <g key={`sat-${p.num}`} transform={`translate(${p.x}, ${-p.y}) scale(0.3)`} stroke="#f87171" strokeWidth="0.5" strokeLinecap="round" className="pointer-events-none">
              <line x1="-1" y1="-1" x2="1" y2="1" />
              <line x1="-1" y1="1" x2="1" y2="-1" />
               <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin={`${p.num % 7}s`} repeatCount="indefinite" />
            </g>
          );
        }
        return null;
      })}
      {/* --- END SAT VISUALIZATION --- */}

      {/* Overlay System */}
      {overlayType !== 'none' && overlayPlacementConfig && (
        <OverlayManager
          overlayType={overlayType}
          placementConfig={overlayPlacementConfig}
          spiralPoints={spiralPoints}
          viewBox={viewBoxArr}
          problem={currentProblem}
          certificate={certificate}
        />
      )}

      {isTargetVisible && <path
        d={shortestPathData}
        className={`${shortestPathColor} transition-all duration-500 pointer-events-none`}
        strokeWidth="0.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />}
      
      {scaleChangePoints.map(p => (
        <circle key={p.num} cx={p.x} cy={-p.y} r="0.25" fill="#f59e0b" className="pointer-events-none">
          <animate attributeName="r" values="0.25;0.4;0.25" dur="2s" begin={`${p.num % 8}s`} repeatCount="indefinite" />
        </circle>
      ))}

      <circle cx="0" cy="0" r="0.4" fill="#f472b6" className="pointer-events-none" />

      {isTargetVisible ? (
        <circle 
          cx={targetPoint.x} 
          cy={-targetPoint.y} 
          r="0.4" 
          fill="#34d399"
          className="transition-all duration-500 pointer-events-none"
        >
          <animate attributeName="r" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" />
        </circle>
      ) : (
        <OffscreenIndicator targetPoint={targetPoint} viewBox={viewBoxArr} />
      )}
    </svg>
  );
};
