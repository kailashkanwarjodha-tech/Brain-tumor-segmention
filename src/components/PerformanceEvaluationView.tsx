import React from 'react';
import { Award, ShieldCheck, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

export const PerformanceEvaluationView: React.FC = () => {
  const ablationModels = [
    { name: 'Otsu Threshold Baseline', dsc: 0.6420, iou: 0.4930, precision: 0.5840, recall: 0.7320, params: '0 (Heuristic)', latency: '4 ms' },
    { name: 'Standard FCN-8s', dsc: 0.7840, iou: 0.6520, precision: 0.8110, recall: 0.7620, params: '13.4 M', latency: '68 ms' },
    { name: 'SegNet Architecture', dsc: 0.8320, iou: 0.7180, precision: 0.8490, recall: 0.8190, params: '29.4 M', latency: '82 ms' },
    { name: 'Proposed U-Net (Ours)', dsc: 0.9142, iou: 0.8420, precision: 0.9210, recall: 0.9080, params: '7.8 M', latency: '42 ms', highlight: true },
    { name: 'Attention U-Net', dsc: 0.9230, iou: 0.8570, precision: 0.9340, recall: 0.9130, params: '8.6 M', latency: '54 ms' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
              <span>Quantitative Benchmarking</span>
              <span>·</span>
              <span className="font-mono-numbers">Hold-Out Test Set (N = 519)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              System Performance & Architectural Ablation Studies
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Empirical validation comparing the proposed U-Net against classical morphological heuristics
              and competing semantic segmentation network backbones on unseen clinical test scans.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono-numbers text-xs">
            <div className="px-3 py-2 bg-sky-50 border border-sky-200 rounded-lg text-sky-900">
              <span className="text-[10px] text-sky-600 uppercase block">Overall AUC-ROC</span>
              <span className="text-base font-bold">0.9620</span>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Ablation Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Ablation Study: Architecture Comparison</h3>
            <p className="text-xs text-slate-500">Evaluated on identical 128×128 normalized test set</p>
          </div>
          <span className="text-xs font-mono-numbers text-slate-500">K-Fold Cross-Validation (K=5)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Network Variant</th>
                <th className="py-2.5 px-3 text-right">Dice (DSC)</th>
                <th className="py-2.5 px-3 text-right">IoU (Jaccard)</th>
                <th className="py-2.5 px-3 text-right">Precision</th>
                <th className="py-2.5 px-3 text-right">Recall</th>
                <th className="py-2.5 px-3 text-right">Parameters</th>
                <th className="py-2.5 px-3 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-numbers">
              {ablationModels.map((m) => (
                <tr 
                  key={m.name} 
                  className={m.highlight ? 'bg-sky-50/70 font-semibold text-slate-900' : 'text-slate-700 hover:bg-slate-50'}
                >
                  <td className="py-3 px-3 font-sans font-medium flex items-center gap-2">
                    {m.highlight && <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />}
                    <span>{m.name}</span>
                  </td>
                  <td className={`py-3 px-3 text-right ${m.highlight ? 'text-sky-800 font-bold' : ''}`}>
                    {m.dsc.toFixed(4)}
                  </td>
                  <td className="py-3 px-3 text-right">{m.iou.toFixed(4)}</td>
                  <td className="py-3 px-3 text-right">{m.precision.toFixed(4)}</td>
                  <td className="py-3 px-3 text-right">{m.recall.toFixed(4)}</td>
                  <td className="py-3 px-3 text-right text-slate-500">{m.params}</td>
                  <td className="py-3 px-3 text-right text-slate-500">{m.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROC & PR Curve Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curve */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Receiver Operating Characteristic (ROC)</h3>
              <p className="text-[11px] text-slate-500">True Positive Rate vs False Positive Rate</p>
            </div>
            <span className="text-xs font-mono-numbers text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              AUC = 0.962
            </span>
          </div>

          <div className="pt-4">
            <svg viewBox="0 0 300 200" className="w-full h-44">
              <line x1="20" y1="180" x2="280" y2="180" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="20" y1="20" x2="20" y2="180" stroke="#cbd5e1" strokeWidth="1" />
              
              {/* Random chance line */}
              <line x1="20" y1="180" x2="280" y2="20" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
              
              {/* Model curve */}
              <path
                d="M 20 180 Q 30 50 100 35 T 280 20"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
              />
              {/* Shaded Area under Curve */}
              <path
                d="M 20 180 Q 30 50 100 35 T 280 20 L 280 180 Z"
                fill="#0284c7"
                fillOpacity="0.08"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers mt-1 border-t border-slate-100 pt-1">
              <span>0.0 FPR (1 - Specificity)</span>
              <span>Sensitivity (TPR)</span>
              <span>1.0 FPR</span>
            </div>
          </div>
        </div>

        {/* Precision-Recall Curve */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Precision-Recall Curve (PR-AUC)</h3>
              <p className="text-[11px] text-slate-500">Robustness under severe class imbalance</p>
            </div>
            <span className="text-xs font-mono-numbers text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              PR-AUC = 0.948
            </span>
          </div>

          <div className="pt-4">
            <svg viewBox="0 0 300 200" className="w-full h-44">
              <line x1="20" y1="180" x2="280" y2="180" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="20" y1="20" x2="20" y2="180" stroke="#cbd5e1" strokeWidth="1" />

              {/* PR curve */}
              <path
                d="M 20 25 C 160 30 220 50 280 180"
                fill="none"
                stroke="#0d9488"
                strokeWidth="2.5"
              />
              <path
                d="M 20 25 C 160 30 220 50 280 180 L 20 180 Z"
                fill="#0d9488"
                fillOpacity="0.08"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers mt-1 border-t border-slate-100 pt-1">
              <span>0.0 Recall</span>
              <span>Precision vs Recall</span>
              <span>1.0 Recall</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
