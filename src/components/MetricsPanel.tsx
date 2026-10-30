import React from 'react';
import { SegmentationMetrics } from '../types';
import { Target, CheckCircle2, Cpu, BarChart2, Hash, Layers } from 'lucide-react';

interface MetricsPanelProps {
  metrics: SegmentationMetrics | null;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  if (!metrics) return null;

  const {
    dice,
    iou,
    precision,
    recall,
    specificity,
    accuracy,
    tumorAreaMm2,
    tumorPixelCount,
    contingency,
    latencyMs,
  } = metrics;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Quantitative Clinical Validation & Spatial Biomarkers
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                tumorPixelCount > 0
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {tumorPixelCount > 0 ? 'Positive (Tumor Detected)' : 'Negative (No Tumor)'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time evaluation against ground-truth segmentation masks
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono-numbers text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          <Cpu className="w-3.5 h-3.5 text-sky-600" />
          <span>Inference Latency: <strong>{latencyMs} ms</strong></span>
        </div>
      </div>

      {/* 6 Key Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Dice */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Dice Similarity (DSC)
          </span>
          <div className="my-1.5">
            <span className="text-2xl font-bold font-mono-numbers text-sky-800">
              {dice.toFixed(4)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers">
            2·TP / (2·TP + FP + FN)
          </span>
        </div>

        {/* Metric 2: IoU */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Jaccard Index (IoU)
          </span>
          <div className="my-1.5">
            <span className="text-2xl font-bold font-mono-numbers text-teal-800">
              {iou.toFixed(4)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers">
            DSC / (2 - DSC)
          </span>
        </div>

        {/* Metric 3: Sensitivity */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Recall / Sensitivity
          </span>
          <div className="my-1.5">
            <span className="text-2xl font-bold font-mono-numbers text-slate-800">
              {recall.toFixed(4)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers">
            TP / (TP + FN)
          </span>
        </div>

        {/* Metric 4: Precision */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Precision (PPV)
          </span>
          <div className="my-1.5">
            <span className="text-2xl font-bold font-mono-numbers text-slate-800">
              {precision.toFixed(4)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers">
            TP / (TP + FP)
          </span>
        </div>

        {/* Metric 5: Accuracy */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Pixel Accuracy
          </span>
          <div className="my-1.5">
            <span className="text-2xl font-bold font-mono-numbers text-slate-800">
              {(accuracy * 100).toFixed(2)}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers">
            (TP + TN) / Total
          </span>
        </div>

        {/* Metric 6: Tumor Area */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Lesion Area
          </span>
          <div className="my-1.5">
            <span className="text-2xl font-bold font-mono-numbers text-slate-900">
              {tumorAreaMm2}
            </span>
            <span className="text-xs text-slate-500 ml-1 font-mono-numbers">mm²</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers">
            {tumorPixelCount} voxels
          </span>
        </div>
      </div>

      {/* Contingency Table (Confusion Counts) */}
      <div className="pt-2">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
          Contingency Matrix (Pixel-Level Confusion Frequencies)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="text-[11px] font-medium text-emerald-800">True Positive (TP)</div>
            <div className="text-lg font-bold font-mono-numbers text-emerald-900 mt-1">
              {contingency.tp.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-700/80 mt-0.5">Correctly segmented lesion</div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <div className="text-[11px] font-medium text-amber-800">False Positive (FP)</div>
            <div className="text-lg font-bold font-mono-numbers text-amber-900 mt-1">
              {contingency.fp.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-700/80 mt-0.5">Over-segmented background</div>
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
            <div className="text-[11px] font-medium text-rose-800">False Negative (FN)</div>
            <div className="text-lg font-bold font-mono-numbers text-rose-900 mt-1">
              {contingency.fn.toLocaleString()}
            </div>
            <div className="text-[10px] text-rose-700/80 mt-0.5">Missed pathological tissue</div>
          </div>

          <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-lg">
            <div className="text-[11px] font-medium text-slate-700">True Negative (TN)</div>
            <div className="text-lg font-bold font-mono-numbers text-slate-900 mt-1">
              {contingency.tn.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Correctly identified healthy parenchymal tissue</div>
          </div>
        </div>
      </div>
    </div>
  );
};
