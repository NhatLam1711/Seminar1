import React, { useState } from 'react';
import ThreeDSurface from '../components/ThreeDSurface';
import { useGradientDescent } from '../hooks/useGradientDescent';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';

export default function SGDPage() {
  const [lr, setLr] = useState(0.015); // Smaller LR needed for SGD
  const [isShuffle, setIsShuffle] = useState(true);
  const { path, isPlaying, setIsPlaying, iteration, reset, step } = useGradientDescent(1, lr, isShuffle);

  return (
    <div className="w-full h-full p-8 flex flex-col pt-24 overflow-y-auto">
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto flex-1 min-h-[500px]">
        {/* Visualization */}
        <div className="flex-[2] bg-surface rounded-xl p-6 shadow-2xl flex flex-col">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold mb-2 text-accent">Stochastic Gradient Descent (SGD)</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">Uses only 1 data point per step. The gradient is very noisy, making the path highly erratic and zig-zagged. Bounces around minimum due to data noise.</p>
          </div>
          <div className="flex-1 w-full relative">
            <ThreeDSurface path={path} isPlaying={isPlaying} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 bg-surface rounded-xl border border-white/10 p-6 flex flex-col shadow-2xl">
          <h3 className="text-xl font-bold mb-6">Controls</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="py-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors flex items-center justify-center font-semibold"
            >
              {isPlaying ? <><Pause className="mr-2" size={20} /> Pause</> : <><Play className="mr-2" size={20} /> Play</>}
            </button>
            <button 
              onClick={step}
              disabled={isPlaying}
              className="py-3 rounded-lg bg-surface border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <StepForward className="mr-2" size={20} /> Step
            </button>
            <button 
              onClick={reset}
              className="py-3 rounded-lg bg-surface border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center col-span-2"
            >
              <RotateCcw className="mr-2" size={20} /> Restart
            </button>
          </div>

          <div className="mb-6 flex items-center justify-between bg-black/30 p-3 rounded-lg border border-white/10">
            <span className="text-sm font-medium text-gray-300">Shuffle Data</span>
            <button 
              onClick={() => { setIsShuffle(!isShuffle); reset(); }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isShuffle ? 'bg-accent' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isShuffle ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Learning Rate (α) = <span className="text-accent font-mono">{lr.toFixed(3)}</span>
            </label>
            <input 
              type="range" 
              min="0.001" max="0.05" step="0.001" 
              value={lr} 
              onChange={(e) => {
                setLr(parseFloat(e.target.value));
                if (iteration === 0) reset();
              }}
              className="w-full accent-accent"
            />
          </div>
          
          <div className="mt-auto bg-black/40 rounded-lg p-4 font-mono text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Batch Size:</span>
              <span className="text-white">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Iteration:</span>
              <span className="text-white">{iteration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">w1:</span>
              <span className="text-accent">{path[path.length-1].w1.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">w2:</span>
              <span className="text-accent">{path[path.length-1].w2.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
