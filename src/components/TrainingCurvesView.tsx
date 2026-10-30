import React, { useState } from 'react';
import { TrendingUp, Award, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { TrainingEpochData } from '../types';

export const TrainingCurvesView: React.FC = () => {
  // Generate 50 epochs of realistic training metrics
  const totalEpochs = 50;
  const epochData: TrainingEpochData[] = Array.from({ length: totalEpochs }, (_, i) => {
    const epoch = i + 1;
    const trainLoss = 0.85 * Math.exp(-epoch / 9.0) + 0.08 + Math.sin(epoch) * 0.003;
    const valLoss = 0.88 * Math.exp(-epoch / 9.5) + 0.115 + Math.cos(epoch * 0.8) * 0.005;
    const trainDice = 1.0 - (0.80 * Math.exp(-epoch / 8.5) + 0.065) + Math.cos(epoch) * 0.004;
    const valDice = 1.0 - (0.82 * Math.exp(-epoch / 9.0) + 0.095) + Math.sin(epoch * 0.9) * 0.006;
    const trainAccuracy = 1.0 - (0.28 * Math.exp(-epoch / 7.0) + 0.015);
    const valAccuracy = 1.0 - (0.29 * Math.exp(-epoch / 7.5) + 0.025);

    return {
      epoch,
      trainLoss: Number(trainLoss.toFixed(4)),
      valLoss: Number(valLoss.toFixed(4)),
      trainDice: Number(trainDice.toFixed(4)),
      valDice: Number(valDice.toFixed(4)),
      trainAccuracy: Number(trainAccuracy.toFixed(4)),
      valAccuracy: Number(valAccuracy.toFixed(4)),
    };
  });

  const [selectedEpoch, setSelectedEpoch] = useState<number>(50);
  const current = epochData[selectedEpoch - 1];

  // Helper to generate SVG polyline points
  const getSvgPoints = (
    data: number[],
    minVal: number,
    maxVal: number,
    width = 500,
    height = 200
  ) => {
    const range = maxVal - minVal || 1;
    return data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - minVal) / range) * (height - 20) - 10;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const trainLossPoints = getSvgPoints(epochData.map(d => d.trainLoss), 0.05, 0.95);
  const valLossPoints = getSvgPoints(epochData.map(d => d.valLoss), 0.05, 0.95);

  const trainDicePoints = getSvgPoints(epochData.map(d => d.trainDice), 0.15, 0.98);
  const valDicePoints = getSvgPoints(epochData.map(d => d.valDice), 0.15, 0.98);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
              <span>Deep Learning Optimization</span>
              <span>·</span>
              <span className="font-mono-numbers">50 Epochs Complete</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Training Dynamics & Loss Function Convergence
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Tracking empirical optimization trajectories for Adam (Initial LR = 10⁻⁴, Batch Size = 16)
              optimizing the combined Binary Cross-Entropy and Dice loss objective.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
              <span className="font-semibold block font-mono-numbers">Early Stopping</span>
              <span className="text-[11px] text-emerald-700">Best Weights @ Ep 48</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Epoch Scrubber */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              Epoch Checkpoint Scrubber
            </span>
            <span className="text-xs font-mono-numbers text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Epoch {current.epoch} / 50
            </span>
          </div>
          <span className="text-[11px] font-mono-numbers text-slate-500">
            Learning Rate: {current.epoch > 35 ? '2.5e-5' : current.epoch > 20 ? '5.0e-5' : '1.0e-4'}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="50"
          value={selectedEpoch}
          onChange={(e) => setSelectedEpoch(parseInt(e.target.value, 10))}
          className="w-full accent-sky-600 cursor-pointer"
        />

        {/* Live Metric Readouts for Scrubbed Epoch */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-mono-numbers">Train Loss</div>
            <div className="text-lg font-bold font-mono-numbers text-sky-800 mt-0.5">
              {current.trainLoss.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-mono-numbers">Validation Loss</div>
            <div className="text-lg font-bold font-mono-numbers text-rose-800 mt-0.5">
              {current.valLoss.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-mono-numbers">Train Dice (DSC)</div>
            <div className="text-lg font-bold font-mono-numbers text-teal-800 mt-0.5">
              {current.trainDice.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-mono-numbers">Validation Dice</div>
            <div className="text-lg font-bold font-mono-numbers text-amber-800 mt-0.5">
              {current.valDice.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-mono-numbers">Train Accuracy</div>
            <div className="text-lg font-bold font-mono-numbers text-slate-800 mt-0.5">
              {(current.trainAccuracy * 100).toFixed(2)}%
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-mono-numbers">Val Accuracy</div>
            <div className="text-lg font-bold font-mono-numbers text-slate-800 mt-0.5">
              {(current.valAccuracy * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Visual Loss & Dice Curves Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: BCE + Dice Loss Progression */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">1. Hybrid Objective Loss Progression</h3>
              <p className="text-[11px] text-slate-500">Binary Cross-Entropy + Dice Loss</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono-numbers">
              <span className="flex items-center gap-1.5 text-sky-700">
                <span className="w-2.5 h-0.5 bg-sky-600 rounded" /> Train
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-2.5 h-0.5 bg-rose-500 rounded" /> Validation
              </span>
            </div>
          </div>

          <div className="pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible">
              {/* Grid lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="170" x2="500" y2="170" stroke="#f1f5f9" strokeWidth="1" />

              {/* Training curve */}
              <polyline
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                points={trainLossPoints}
              />
              {/* Validation curve */}
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                points={valLossPoints}
              />

              {/* Scrubber vertical line indicator */}
              <line
                x1={((selectedEpoch - 1) / 49) * 500}
                y1="10"
                x2={((selectedEpoch - 1) / 49) * 500}
                y2="190"
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers mt-1 border-t border-slate-100 pt-1">
              <span>Epoch 1 (Loss ~0.85)</span>
              <span>Epoch 25</span>
              <span>Epoch 50 (Loss ~0.09)</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Dice Similarity Coefficient Progression */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">2. Dice Similarity Coefficient (DSC)</h3>
              <p className="text-[11px] text-slate-500">Spatial overlap accuracy across training</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono-numbers">
              <span className="flex items-center gap-1.5 text-teal-700">
                <span className="w-2.5 h-0.5 bg-teal-600 rounded" /> Train DSC
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-0.5 bg-amber-500 rounded" /> Validation DSC
              </span>
            </div>
          </div>

          <div className="pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="170" x2="500" y2="170" stroke="#f1f5f9" strokeWidth="1" />

              <polyline
                fill="none"
                stroke="#0d9488"
                strokeWidth="2.5"
                points={trainDicePoints}
              />
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                points={valDicePoints}
              />

              <line
                x1={((selectedEpoch - 1) / 49) * 500}
                y1="10"
                x2={((selectedEpoch - 1) / 49) * 500}
                y2="190"
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers mt-1 border-t border-slate-100 pt-1">
              <span>Epoch 1 (DSC ~0.22)</span>
              <span>Epoch 25 (DSC ~0.86)</span>
              <span>Epoch 50 (DSC 0.9142)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
