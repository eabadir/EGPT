import React from 'react';
import type { OverlayProps } from './types';
import type { Point } from '../../types';

const Neuron: React.FC<{
  point: Point;
  type: 'visit' | 'avoid' | 'start' | 'end' | 'neutral';
}> = ({ point, type }) => {
  const x = point.x;
  const y = -point.y; // SVG coordinate conversion
  const size = 0.7;

  // Neuron colors and styles
  const styles = {
    visit: { color: '#06b6d4', glowColor: '#22d3ee' }, // cyan - activated neuron
    avoid: { color: '#64748b', glowColor: '#94a3b8' }, // slate - inactive neuron
    start: { color: '#10b981', glowColor: '#34d399' }, // emerald - input layer
    end: { color: '#f59e0b', glowColor: '#fbbf24' }, // amber - output layer
    neutral: { color: '#475569', glowColor: 'none' }, // dark slate
  };

  const style = styles[type];

  return (
    <g className="neuron-group">
      {/* Activation glow */}
      {type !== 'neutral' && type !== 'avoid' && (
        <circle
          cx={x}
          cy={y}
          r={size * 1.2}
          fill={style.glowColor}
          opacity="0.3"
        >
          <animate
            attributeName="r"
            values={`${size * 0.8};${size * 1.4};${size * 0.8}`}
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.5;0.2"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Neuron body */}
      <circle
        cx={x}
        cy={y}
        r={size * 0.5}
        fill={style.color}
        stroke={style.glowColor || style.color}
        strokeWidth="0.08"
      />

      {/* Neuron core - gradient effect */}
      <circle
        cx={x - 0.1}
        cy={y - 0.1}
        r={size * 0.2}
        fill="white"
        opacity="0.6"
      />

      {/* Input neuron indicator */}
      {type === 'start' && (
        <g>
          <line
            x1={x - size * 0.8}
            y1={y}
            x2={x - size * 0.5}
            y2={y}
            stroke="#10b981"
            strokeWidth="0.1"
          />
          <circle
            cx={x - size * 0.8}
            cy={y}
            r="0.15"
            fill="#10b981"
          >
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}

      {/* Output neuron indicator */}
      {type === 'end' && (
        <g>
          <line
            x1={x + size * 0.5}
            y1={y}
            x2={x + size * 0.8}
            y2={y}
            stroke="#f59e0b"
            strokeWidth="0.1"
          />
          <path
            d={`M ${x + size * 0.8} ${y} L ${x + size * 0.65} ${y - 0.15} L ${x + size * 0.65} ${y + 0.15} Z`}
            fill="#f59e0b"
          >
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      )}

      {/* Inactive neuron X */}
      {type === 'avoid' && (
        <g stroke="#ef4444" strokeWidth="0.12" strokeLinecap="round" opacity="0.7">
          <line
            x1={x - size * 0.3}
            y1={y - size * 0.3}
            x2={x + size * 0.3}
            y2={y + size * 0.3}
          />
          <line
            x1={x - size * 0.3}
            y1={y + size * 0.3}
            x2={x + size * 0.3}
            y2={y - size * 0.3}
          />
        </g>
      )}

      {/* Activation indicator for visited neurons */}
      {type === 'visit' && (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.5}
          fill="white"
          fontWeight="bold"
        >
          ✓
        </text>
      )}
    </g>
  );
};

export const NeuralNetOverlay: React.FC<OverlayProps> = ({
  placementConfig,
  spiralPoints,
  viewBox,
}) => {
  const { mustVisit, mustAvoid, mustStartAt, mustEndAt } = placementConfig;

  // Create neural network connections (sparse, between nearby neurons)
  const allNeurons = [...mustVisit, ...mustAvoid];
  const connections: Array<[Point, Point]> = [];
  
  // Connect nearby neurons (within distance 5)
  for (let i = 0; i < allNeurons.length; i++) {
    for (let j = i + 1; j < allNeurons.length && j < i + 4; j++) {
      const p1 = allNeurons[i];
      const p2 = allNeurons[j];
      const dist = Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
      if (dist <= 5) {
        connections.push([p1, p2]);
      }
    }
  }

  // Create a sparse grid of neutral neurons
  const neutralNeurons = spiralPoints.filter((p, idx) => {
    const isConstraint =
      mustVisit.some(v => v.num === p.num) ||
      mustAvoid.some(a => a.num === p.num) ||
      (mustStartAt && mustStartAt.num === p.num) ||
      (mustEndAt && mustEndAt.num === p.num);
    
    return !isConstraint && idx % 12 === 0 && Math.abs(p.x) <= 20 && Math.abs(p.y) <= 20;
  });

  return (
    <g className="neuralnet-overlay pointer-events-none">
      {/* Grid pattern suggesting network structure */}
      <defs>
        <pattern id="neuralGrid" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.1" fill="#06b6d4" opacity="0.15" />
        </pattern>
      </defs>
      <rect x="-20" y="-20" width="40" height="40" fill="url(#neuralGrid)" />

      {/* Neural connections (synapses) */}
      <g opacity="0.3" stroke="#06b6d4" strokeWidth="0.05">
        {connections.map(([p1, p2], idx) => {
          const isActivated = mustVisit.some(v => v.num === p1.num || v.num === p2.num);
          return (
            <line
              key={`conn-${idx}`}
              x1={p1.x}
              y1={-p1.y}
              x2={p2.x}
              y2={-p2.y}
              stroke={isActivated ? '#22d3ee' : '#06b6d4'}
              opacity={isActivated ? 0.6 : 0.2}
            >
              {isActivated && (
                <animate
                  attributeName="opacity"
                  values="0.3;0.8;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </line>
          );
        })}
      </g>

      {/* Neutral neurons (background) */}
      {neutralNeurons.map(point => (
        <Neuron key={`neutral-${point.num}`} point={point} type="neutral" />
      ))}

      {/* Must avoid neurons (inactive) */}
      {mustAvoid.map(point => (
        <Neuron key={`avoid-${point.num}`} point={point} type="avoid" />
      ))}

      {/* Must visit neurons (activated) */}
      {mustVisit.map(point => (
        <Neuron key={`visit-${point.num}`} point={point} type="visit" />
      ))}

      {/* Start neuron (input) */}
      {mustStartAt && (
        <Neuron key={`start-${mustStartAt.num}`} point={mustStartAt} type="start" />
      )}

      {/* End neuron (output) */}
      {mustEndAt && (
        <Neuron key={`end-${mustEndAt.num}`} point={mustEndAt} type="end" />
      )}
    </g>
  );
};



