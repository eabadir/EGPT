import React from 'react';
import type { OverlayProps } from './types';
import type { Point } from '../../types';

const Building: React.FC<{
  point: Point;
  type: 'visit' | 'avoid' | 'start' | 'end' | 'neutral';
}> = ({ point, type }) => {
  const x = point.x;
  const y = -point.y; // SVG coordinate conversion
  const size = 0.7;
  const halfSize = size / 2;

  // Building base colors and styles
  const styles = {
    visit: { fill: '#fbbf24', stroke: '#f59e0b', glowColor: '#fbbf24' }, // amber
    avoid: { fill: '#64748b', stroke: '#475569', glowColor: '#ef4444' }, // slate with red glow
    start: { fill: '#34d399', stroke: '#10b981', glowColor: '#34d399' }, // emerald
    end: { fill: '#f87171', stroke: '#ef4444', glowColor: '#f87171' }, // red
    neutral: { fill: '#94a3b8', stroke: '#64748b', glowColor: 'none' }, // slate
  };

  const style = styles[type];

  return (
    <g className="building-group">
      {/* Glow effect for special buildings */}
      {type !== 'neutral' && (
        <circle
          cx={x}
          cy={y}
          r={size * 0.8}
          fill={style.glowColor}
          opacity="0.2"
        >
          <animate
            attributeName="r"
            values={`${size * 0.6};${size * 1.0};${size * 0.6}`}
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.4;0.2"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Building base */}
      <rect
        x={x - halfSize}
        y={y - halfSize}
        width={size}
        height={size}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth="0.05"
        rx="0.05"
      />

      {/* Windows */}
      {type !== 'avoid' && (
        <>
          <rect
            x={x - halfSize * 0.6}
            y={y - halfSize * 0.6}
            width={halfSize * 0.4}
            height={halfSize * 0.4}
            fill="#1e293b"
            opacity="0.6"
          />
          <rect
            x={x + halfSize * 0.2}
            y={y - halfSize * 0.6}
            width={halfSize * 0.4}
            height={halfSize * 0.4}
            fill="#1e293b"
            opacity="0.6"
          />
          <rect
            x={x - halfSize * 0.6}
            y={y + halfSize * 0.2}
            width={halfSize * 0.4}
            height={halfSize * 0.4}
            fill="#1e293b"
            opacity="0.6"
          />
          <rect
            x={x + halfSize * 0.2}
            y={y + halfSize * 0.2}
            width={halfSize * 0.4}
            height={halfSize * 0.4}
            fill="#1e293b"
            opacity="0.6"
          />
        </>
      )}

      {/* Rooftop detail */}
      {type === 'visit' && (
        <rect
          x={x - halfSize * 0.3}
          y={y - halfSize * 1.1}
          width={halfSize * 0.6}
          height={halfSize * 0.3}
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth="0.03"
        />
      )}

      {/* X mark for avoid buildings */}
      {type === 'avoid' && (
        <g stroke="#ef4444" strokeWidth="0.15" strokeLinecap="round">
          <line
            x1={x - halfSize * 0.5}
            y1={y - halfSize * 0.5}
            x2={x + halfSize * 0.5}
            y2={y + halfSize * 0.5}
          />
          <line
            x1={x - halfSize * 0.5}
            y1={y + halfSize * 0.5}
            x2={x + halfSize * 0.5}
            y2={y - halfSize * 0.5}
          />
        </g>
      )}

      {/* Start indicator - arrow pointing up */}
      {type === 'start' && (
        <path
          d={`M ${x} ${y - halfSize * 1.2} L ${x - 0.15} ${y - halfSize * 0.8} L ${x + 0.15} ${y - halfSize * 0.8} Z`}
          fill="#10b981"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-0.1; 0,0"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>
      )}

      {/* End indicator - flag */}
      {type === 'end' && (
        <>
          <line
            x1={x}
            y1={y - halfSize}
            x2={x}
            y2={y - halfSize * 1.5}
            stroke="#dc2626"
            strokeWidth="0.05"
          />
          <path
            d={`M ${x} ${y - halfSize * 1.5} L ${x + 0.3} ${y - halfSize * 1.3} L ${x} ${y - halfSize * 1.1} Z`}
            fill="#ef4444"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`0 ${x} ${y - halfSize * 1.3}; 5 ${x} ${y - halfSize * 1.3}; 0 ${x} ${y - halfSize * 1.3}`}
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </>
      )}
    </g>
  );
};

export const ManhattanOverlay: React.FC<OverlayProps> = ({
  placementConfig,
  spiralPoints,
  viewBox,
}) => {
  const { mustVisit, mustAvoid, mustStartAt, mustEndAt } = placementConfig;

  // Create a sparse grid of neutral buildings for city atmosphere
  const neutralBuildings = spiralPoints.filter((p, idx) => {
    // Only show every 5th-8th point as a neutral building
    // Skip points that are already in our constraint sets
    const isConstraint =
      mustVisit.some(v => v.num === p.num) ||
      mustAvoid.some(a => a.num === p.num) ||
      (mustStartAt && mustStartAt.num === p.num) ||
      (mustEndAt && mustEndAt.num === p.num);
    
    return !isConstraint && idx % 7 === 0 && Math.abs(p.x) <= 20 && Math.abs(p.y) <= 20;
  });

  return (
    <g className="manhattan-overlay pointer-events-none">
      {/* Grid lines for street effect */}
      <g opacity="0.1" stroke="#94a3b8" strokeWidth="0.02">
        {Array.from({ length: 41 }, (_, i) => i - 20).map(coord => (
          <React.Fragment key={`grid-${coord}`}>
            <line x1={coord} y1={-20} x2={coord} y2={20} />
            <line x1={-20} y1={-coord} x2={20} y2={-coord} />
          </React.Fragment>
        ))}
      </g>

      {/* Neutral buildings (background) */}
      {neutralBuildings.map(point => (
        <Building key={`neutral-${point.num}`} point={point} type="neutral" />
      ))}

      {/* Must avoid buildings */}
      {mustAvoid.map(point => (
        <Building key={`avoid-${point.num}`} point={point} type="avoid" />
      ))}

      {/* Must visit buildings */}
      {mustVisit.map(point => (
        <Building key={`visit-${point.num}`} point={point} type="visit" />
      ))}

      {/* Start building */}
      {mustStartAt && (
        <Building key={`start-${mustStartAt.num}`} point={mustStartAt} type="start" />
      )}

      {/* End building */}
      {mustEndAt && (
        <Building key={`end-${mustEndAt.num}`} point={mustEndAt} type="end" />
      )}
    </g>
  );
};



