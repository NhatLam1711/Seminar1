import React from 'react';

interface ContourMapProps {
  path: { w1: number; w2: number }[];
  title: string;
  description: string;
  type: 'batch' | 'sgd' | 'minibatch';
}

export default function ContourMap({ path, title, description, type }: ContourMapProps) {
  // Generate concentric ellipses for contour lines
  // Cost function conceptually: J(w1, w2) = w1^2 + 2*w2^2
  const contours = [];
  for (let r = 0.5; r <= 8; r += 0.8) {
    contours.push(r);
  }

  // Map w1 in [-8, 8], w2 in [-8, 8] to SVG [0, 100]
  const mapCoord = (val: number) => ((val + 8) / 16) * 100;

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold mb-2 text-primary">{title}</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">{description}</p>
      </div>

      <div className="flex-1 w-full relative bg-black/20 rounded-xl overflow-hidden border border-white/10 shadow-inner">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {/* Minimum Point (0,0) */}
          <circle cx="50" cy="50" r="1.5" fill="#10b981" className="animate-pulse" />
          
          {/* Contour lines */}
          {contours.map((r, i) => (
            <ellipse 
              key={`c-${i}`} 
              cx="50" 
              cy="50" 
              rx={(r / 8) * 50} 
              ry={(r / 8 / 2) * 50} 
              fill="none" 
              stroke="rgba(139, 92, 246, 0.3)" 
              strokeWidth="0.5"
            />
          ))}

          {/* Path Line */}
          {path.length > 1 && (
            <polyline
              points={path.map(p => `${mapCoord(p.w1)},${mapCoord(p.w2)}`).join(' ')}
              fill="none"
              stroke={type === 'batch' ? '#3b82f6' : type === 'sgd' ? '#f43f5e' : '#f59e0b'}
              strokeWidth="0.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.8"
            />
          )}

          {/* Points/Steps */}
          {path.map((p, i) => (
            <circle
              key={`p-${i}`}
              cx={mapCoord(p.w1)}
              cy={mapCoord(p.w2)}
              r={i === path.length - 1 ? "1.5" : "0.6"}
              fill={i === path.length - 1 ? "#fff" : (type === 'batch' ? '#3b82f6' : type === 'sgd' ? '#f43f5e' : '#f59e0b')}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
