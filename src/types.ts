export type PathologyType = 
  | 'Glioblastoma (Grade IV)'
  | 'Meningioma (Dural Base)'
  | 'Pituitary Adenoma (Sellar)'
  | 'Oligodendroglioma (Grade II)'
  | 'Healthy Brain (Control)';

export type PulseSequence = 'T1-Weighted' | 'T1-Gd Contrast' | 'T2-Weighted' | 'FLAIR';

export interface MRICase {
  id: string;
  patientId: string;
  pathology: PathologyType;
  sequence: PulseSequence;
  age: number;
  gender: 'Male' | 'Female';
  sliceLocation: string;
  tumorAreaMm2: number;
  description: string;
  imageSrc?: string;
  isUploadedByUser?: boolean;
}

export interface ContingencyCounts {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface SegmentationMetrics {
  dice: number;
  iou: number;
  precision: number;
  recall: number;
  specificity: number;
  accuracy: number;
  tumorAreaMm2: number;
  tumorPixelCount: number;
  perimeterMm: number;
  contingency: ContingencyCounts;
  latencyMs: number;
}

export interface PipelineSettings {
  targetResolution: 128 | 256;
  useClahe: boolean;
  useMorphologicalCleanup: boolean;
  binarizationMode: 'manual' | 'otsu';
  manualThreshold: number;
  overlayOpacity: number;
  overlayColor: 'crimson' | 'cyan' | 'amber' | 'emerald';
  showContourPerimeter: boolean;
}

export interface TrainingEpochData {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainDice: number;
  valDice: number;
  trainAccuracy: number;
  valAccuracy: number;
}
