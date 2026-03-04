import React from 'react';
import type { OverlayProps } from './types';
import type { Point } from '../../types';

const CircuitComponent: React.FC<{
  point: Point;
  type: 'visit' | 'avoid' | 'start' | 'end' | 'neutral';
}> = ({ point, type }) => {
  const x = point.x;
  const y = -point.y; // SVG coordinate conversion
  const size = 0.6;

  // Component colors and styles
  const styles = {
    visit: { color: '#22c55e', glowColor: '#4ade80' }, // green - active LED
    avoid: { color: '#64748b', glowColor: '#ef4444' }, // slate - resistor/blocked
    start: { color: '#3b82f6', glowColor: '#60a5fa' }, // blue - power source
    end: { color: '#a855f7', glowColor: '#c084fc' }, // purple - output terminal
    neutral: { color: '#475569', glowColor: 'none' }, // dark slate
  };

  const style = styles[type];

  return (
    <g className="circuit-component-group">
      {/* Connection pad */}
      <circle
        cx={x}
        cy={y}
        r={size * 0.8}
        fill="#1e293b"
        stroke={style.color}
        strokeWidth="0.08"
      />

      {/* Glow effect for active components */}
      {type !== 'neutral' && (
        <circle
          cx={x}
          cy={y}
          r={size * 0.5}
          fill={style.glowColor}
          opacity="0.6"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.8;0.3"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* LED for visit (active) */}
      {type === 'visit' && (
        <>
          <circle cx={x} cy={y} r={size * 0.4} fill={style.color} />
          <circle cx={x - 0.1} cy={y - 0.1} r={size * 0.15} fill="#dcfce7" opacity="0.8" />
        </>
      )}

      {/* Resistor for avoid */}
      {type === 'avoid' && (
        <g>
          <rect
            x={x - size * 0.4}
            y={y - size * 0.15}
            width={size * 0.8}
            height={size * 0.3}
            fill="none"
            stroke={style.color}
            strokeWidth="0.08"
          />
          <line
            x1={x - size * 0.5}
            y1={y}
            x2={x + size * 0.5}
            y2={y}
            stroke="#ef4444"
            strokeWidth="0.1"
          />
        </g>
      )}

      {/* Power source for start */}
      {type === 'start' && (
        <>
          <circle cx={x} cy={y} r={size * 0.35} fill={style.color} />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size * 0.6}
            fill="white"
            fontWeight="bold"
          >
            +
          </text>
        </>
      )}

      {/* Output terminal for end */}
      {type === 'end' && (
        <>
          <rect
            x={x - size * 0.3}
            y={y - size * 0.3}
            width={size * 0.6}
            height={size * 0.6}
            fill={style.color}
            rx="0.05"
          />
          <circle cx={x} cy={y} r={size * 0.15} fill="#1e293b" />
        </>
      )}

      {/* Neutral - simple junction */}
      {type === 'neutral' && (
        <circle cx={x} cy={y} r={size * 0.25} fill={style.color} />
      )}
    </g>
  );
};

export const CircuitOverlay: React.FC<OverlayProps> = ({
  placementConfig,
  spiralPoints,
  viewBox,
}) => {
  const { mustVisit, mustAvoid, mustStartAt, mustEndAt } = placementConfig;

  // Create a sparse grid of neutral junctions
  const neutralJunctions = spiralPoints.filter((p, idx) => {
    const isConstraint =
      mustVisit.some(v => v.num === p.num) ||
      mustAvoid.some(a => a.num === p.num) ||
      (mustStartAt && mustStartAt.num === p.num) ||
      (mustEndAt && mustEndAt.num === p.num);
    
    return !isConstraint && idx % 10 === 0 && Math.abs(p.x) <= 20 && Math.abs(p.y) <= 20;
  });

  // Create circuit board traces (grid pattern)
  const gridLines = Array.from({ length: 21 }, (_, i) => i - 10).filter(i => i % 2 === 0);

  return (
    <g className="circuit-overlay pointer-events-none">
      {/* PCB background grid (subtle) */}
      <g opacity="0.15" stroke="#22c55e" strokeWidth="0.03">
        {gridLines.map(coord => (
          <React.Fragment key={`circuit-grid-${coord}`}>
            <line x1={coord} y1={-20} x2={coord} y2={20} />
            <line x1={-20} y1={-coord} x2={20} y2={-coord} />
          </React.Fragment>
        ))}
      </g>

      {/* PCB traces along paths - more visible traces near constraints */}
      <g opacity="0.2" stroke="#10b981" strokeWidth="0.08" fill="none">
        {spiralPoints.slice(0, Math.min(1000, spiralPoints.length)).map((p, idx) => {
          if (idx === 0) return null;
          const prev = spiralPoints[idx - 1];
          return (
            <line
              key={`trace-${idx}`}
              x1={prev.x}
              y1={-prev.y}
              x2={p.x}
              y2={-p.y}
            />
          );
        })}
      </g>

      {/* Neutral junctions (background) */}
      {neutralJunctions.map(point => (
        <CircuitComponent key={`neutral-${point.num}`} point={point} type="neutral" />
      ))}

      {/* Must avoid components */}
      {mustAvoid.map(point => (
        <CircuitComponent key={`avoid-${point.num}`} point={point} type="avoid" />
      ))}

      {/* Must visit components */}
      {mustVisit.map(point => (
        <CircuitComponent key={`visit-${point.num}`} point={point} type="visit" />
      ))}

      {/* Start component */}
      {mustStartAt && (
        <CircuitComponent key={`start-${mustStartAt.num}`} point={mustStartAt} type="start" />
      )}

      {/* End component */}
      {mustEndAt && (
        <CircuitComponent key={`end-${mustEndAt.num}`} point={mustEndAt} type="end" />
      )}
    </g>
  );
};



