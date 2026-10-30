import React from 'react';
import { BookOpen, HelpCircle, CheckCircle2, Layers, Award } from 'lucide-react';

export const AboutView: React.FC = () => {
  const defenseQnA = [
    {
      q: 'Why did you select the U-Net architecture over classical Fully Convolutional Networks (FCN-8s)?',
      a: 'Classical FCNs repeatedly downsample feature maps via maxpooling, permanently discarding fine spatial boundary coordinates. In neurosurgical tumor delineation, sub-millimeter edge precision is critical. U-Net introduces expansive skip connections concatenating shallow, high-resolution encoder features directly with deep decoder feature maps, preserving crisp microvascular boundaries.',
    },
    {
      q: 'Why is Binary Cross-Entropy (BCE) alone insufficient for brain tumor segmentation?',
      a: 'In brain MRI slices, healthy brain parenchyma and skull voxels occupy ~96-98% of the pixel volume, while the tumor occupies only 2-4%. Standard BCE suffers from catastrophic class imbalance: a naive model predicting 100% background achieves 96% accuracy with minimal loss. Hybrid BCE + Dice loss directly optimizes spatial overlap |X ∩ Y| / (|X| + |Y|), ensuring large gradient updates even for tiny lesions.',
    },
    {
      q: 'Why use cv2.INTER_AREA interpolation for spatial resizing rather than Bilinear or Nearest-Neighbor?',
      a: 'Nearest-neighbor introduces severe jagged moiré artifacts, while bilinear interpolation blurs focal hyperintensities. cv2.INTER_AREA computes pixel area relations, acting as a low-pass decimation filter that preserves total acoustic energy and avoids aliasing during image downsampling.',
    },
    {
      q: 'What is the role of morphological opening and closing post-processing?',
      a: 'Even high-performing neural models can produce isolated 1-2 pixel false-positive specks in skull bone or ventricles. Morphological opening (erosion followed by dilation) eliminates isolated speckle noise without altering primary mass volume. Morphological closing (dilation followed by erosion) bridges internal necrotic holes.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
          <span>Biomedical AI Systems Architecture</span>
          <span>·</span>
          <span>Neuro-Oncology Deep Learning</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Brain Tumor Segmentation from MRI Scans Using Deep Learning
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          An end-to-end data analytics and deep learning framework addressing automated localization, 
          quantification, and volumetric boundary delineation of brain tumors from Magnetic Resonance Imaging (MRI).
        </p>
      </div>

      {/* Mathematical Formulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formula 1 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">Metric Formulation</span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">Dice Similarity Coefficient (DSC)</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Standard clinical benchmark measuring harmonic spatial overlap between prediction and ground truth.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono-numbers text-xs font-bold text-slate-800">
              DSC = 2·|X ∩ Y| / (|X| + |Y|)
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-mono-numbers">
            Equivalence: 2·TP / (2·TP + FP + FN)
          </div>
        </div>

        {/* Formula 2 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">Metric Formulation</span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">Intersection over Union (IoU)</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Jaccard Index penalizing false-positive spatial spillover over union area.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono-numbers text-xs font-bold text-slate-800">
              IoU = |X ∩ Y| / |X ∪ Y| = TP / (TP + FP + FN)
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-mono-numbers">
            Algebraic identity: IoU = DSC / (2 - DSC)
          </div>
        </div>

        {/* Formula 3 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Objective Loss</span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">Hybrid BCE + Dice Loss</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Joint optimization combining pixel-level log-loss calibration with global overlap balance.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono-numbers text-xs font-bold text-slate-800">
              L_total = L_BCE + (1.0 - DSC)
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-mono-numbers">
            Prevents class-imbalance collapse
          </div>
        </div>
      </div>

      {/* Deep Learning Architectural Q&A Reference */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <HelpCircle className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Biomedical Computer Vision & U-Net Engineering Technical FAQ
          </h3>
        </div>

        <div className="space-y-4">
          {defenseQnA.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-900 flex items-start gap-2">
                <span className="text-sky-600 shrink-0 font-mono-numbers">Q{idx + 1}.</span>
                <span>{item.q}</span>
              </h4>
              <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
