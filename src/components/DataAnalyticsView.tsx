import React, { useState } from 'react';
import { BarChart3, PieChart, Activity, Users, Layers, Info } from 'lucide-react';

export const DataAnalyticsView: React.FC = () => {
  const [selectedModality, setSelectedModality] = useState<'all' | 't1ce' | 'flair' | 't2'>('all');

  const pathologyDistribution = [
    { name: 'Glioma (Grade II–IV)', count: 1426, percentage: 41.2, color: 'bg-sky-600', text: 'text-sky-700' },
    { name: 'Pituitary Adenoma', count: 930, percentage: 26.9, color: 'bg-teal-600', text: 'text-teal-700' },
    { name: 'Meningioma', count: 708, percentage: 20.5, color: 'bg-amber-600', text: 'text-amber-700' },
    { name: 'Healthy / Non-Tumor Control', count: 396, percentage: 11.4, color: 'bg-slate-400', text: 'text-slate-600' },
  ];

  const anatomicalLocations = [
    { region: 'Frontal Lobe', percentage: 34.2, count: 1183 },
    { region: 'Temporal Lobe', percentage: 26.5, count: 917 },
    { region: 'Sellar / Suprasellar (Pituitary)', percentage: 26.9, count: 930 },
    { region: 'Parieto-Occipital', percentage: 12.4, count: 430 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
              <span>Biomedical Data Analytics</span>
              <span>·</span>
              <span className="font-mono-numbers">Cohort N = 3,460 Scans</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Exploratory Data Analysis (EDA) & Clinical Feature Distributions
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Statistical profiling of pathological subtypes, acquisition pulse sequences, age distribution,
              and voxel intensity spectrums utilized to train the U-Net segmentation model.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono-numbers">
              <div className="text-[10px] text-slate-400 uppercase">Total Slices</div>
              <div className="text-base font-bold text-slate-900">3,460</div>
            </div>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono-numbers">
              <div className="text-[10px] text-slate-400 uppercase">Median Patient Age</div>
              <div className="text-base font-bold text-sky-700">54.2 yrs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Pathology & Demographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pathology Subtype Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Pathological Tumor Class Distribution</h3>
              <span className="text-xs text-slate-500 font-mono-numbers">3,460 Scans</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 mb-4">
              Severe class imbalance is characteristic of medical imaging. Gliomas constitute the largest cohort, requiring hybrid BCE + Dice loss formulation.
            </p>

            <div className="space-y-3">
              {pathologyDistribution.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="font-mono-numbers text-slate-500">
                      {item.count.toLocaleString()} slices ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`} 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Dataset split: 70% Training (2,422), 15% Validation (519), 15% Hold-out Testing (519).</span>
          </div>
        </div>

        {/* Anatomical Region Localization */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Anatomical Intracranial Localization</h3>
              <span className="text-xs text-slate-500 font-mono-numbers">Cranial Distribution</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 mb-4">
              Distribution of lesion centroids across cerebral lobes, reflecting natural biological predilection for frontal and suprasellar regions.
            </p>

            <div className="space-y-3">
              {anatomicalLocations.map((item) => (
                <div key={item.region} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.region}</span>
                    <span className="font-mono-numbers text-slate-500">
                      {item.count} cases ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-800 rounded-full transition-all duration-500" 
                      style={{ width: `${item.percentage * 2}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Skull-stripping cranial bounds eliminate extraneous calvarial bone signal artifacts.</span>
          </div>
        </div>
      </div>

      {/* Dynamic Range Intensity Spectrum Analysis (EqualizeHist) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Intensity Spectrum & Dynamic Range Normalization (OpenCV equalizeHist)
            </h3>
            <p className="text-xs text-slate-500">
              Empirical demonstration of histogram equalization stretching low-contrast soft tissue distributions
            </p>
          </div>
          <span className="text-xs font-mono-numbers text-slate-500">Domain: [0, 255] uint8</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Raw Intensity Spectrum */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">1. Raw MRI Acquisition Spectrum</span>
              <span className="text-[11px] font-mono-numbers text-rose-600">Skewed / Compressed</span>
            </div>
            {/* SVG histogram curve */}
            <div className="h-40 w-full flex items-end gap-1 pt-4 pb-1">
              {[5, 12, 38, 95, 180, 220, 160, 90, 45, 25, 15, 10, 8, 5, 4, 3, 2, 2, 1, 1].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-slate-400 rounded-t-xs hover:bg-slate-600 transition-colors" 
                    style={{ height: `${(val / 220) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers border-t border-slate-200 pt-1">
              <span>0 (Air / CSF)</span>
              <span>128 (Grey / White Matter)</span>
              <span>255 (Hyperintense)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Most brain parenchymal voxels bunch in low-intensity bins [40–110], resulting in poor tumor contrast.
            </p>
          </div>

          {/* Equalized Spectrum */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">2. Post-Histogram Equalization (Equalized)</span>
              <span className="text-[11px] font-mono-numbers text-emerald-600">Uniform Dynamic Range</span>
            </div>
            {/* SVG equalized histogram curve */}
            <div className="h-40 w-full flex items-end gap-1 pt-4 pb-1">
              {[42, 45, 48, 50, 47, 49, 52, 48, 46, 50, 49, 47, 51, 48, 50, 46, 49, 48, 47, 45].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-sky-600 rounded-t-xs hover:bg-sky-800 transition-colors" 
                    style={{ height: `${(val / 60) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers border-t border-slate-200 pt-1">
              <span>0 (Air / CSF)</span>
              <span>128 (Enhanced Tissue)</span>
              <span>255 (Tumor Core)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              CDF mapping flattens the frequency spectrum, sharpening the contrast boundary between necrotic core and parenchyma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
