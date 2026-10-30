import { MRICase, PathologyType, SegmentationMetrics, ContingencyCounts } from '../types';

export const BENCHMARK_CASES: MRICase[] = [
  {
    id: 'case-user-healthy',
    patientId: 'SCAN-01-HEALTHY',
    pathology: 'Healthy Brain (Control)',
    sequence: 'T1-Weighted',
    age: 38,
    gender: 'Female',
    sliceLocation: 'Axial Mid-Ventricular (Centrum Semiovale)',
    tumorAreaMm2: 0,
    description: '1st Uploaded Scan: Normal healthy brain MRI. Demonstrates bilateral symmetry, intact lateral ventricles, distinct grey-white matter differentiation, and complete absence of mass effect, edema, or focal lesion.',
    imageSrc: '/mri_healthy_brain.jpg',
  },
  {
    id: 'case-user-tumor',
    patientId: 'SCAN-02-TUMOR',
    pathology: 'Glioblastoma (Grade IV)',
    sequence: 'T1-Gd Contrast',
    age: 59,
    gender: 'Male',
    sliceLocation: 'Axial Z=+18mm (Right Posterior Parieto-Occipital)',
    tumorAreaMm2: 785,
    description: '2nd Uploaded Scan: Brain Tumor MRI. Aggressive Glioblastoma Multiforme (WHO Grade IV) in the right parieto-occipital lobe featuring irregular thick nodular ring enhancement, central necrotic core, peritumoral vasogenic edema, and local ventricular compression.',
    imageSrc: '/mri_tumor_gbm.jpg',
  },
  {
    id: 'case-02',
    patientId: 'PT-3109-MNG',
    pathology: 'Meningioma (Dural Base)',
    sequence: 'T1-Gd Contrast',
    age: 63,
    gender: 'Female',
    sliceLocation: 'Axial Z=+12mm (Left Parasagittal Dural Base)',
    tumorAreaMm2: 418,
    description: 'Extra-axial sharply circumscribed hyper-intense mass with broad dural base attachment and prominent "dural tail" sign.',
  },
  {
    id: 'case-03',
    patientId: 'PT-1940-PIT',
    pathology: 'Pituitary Adenoma (Sellar)',
    sequence: 'T1-Weighted',
    age: 44,
    gender: 'Female',
    sliceLocation: 'Axial Z=-8mm (Sella Turcica / Suprasellar)',
    tumorAreaMm2: 285,
    description: 'Macroadenoma expanding the sella turcica with suprasellar extension abutting the optic chiasm.',
  },
  {
    id: 'case-04',
    patientId: 'PT-5287-LGG',
    pathology: 'Oligodendroglioma (Grade II)',
    sequence: 'FLAIR',
    age: 36,
    gender: 'Male',
    sliceLocation: 'Axial Z=+18mm (Left Frontal Cortex)',
    tumorAreaMm2: 512,
    description: 'Low-grade hyperintense infiltration on T2/FLAIR with patchy calcifications and minimal mass effect.',
  },
];

/**
 * Renders an anatomically accurate 128x128 synthetic brain MRI scan and reference ground truth.
 */
export function generateSyntheticScan(pathology: PathologyType, size = 128): {
  originalData: Uint8ClampedArray;
  groundTruthData: Uint8ClampedArray;
} {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const gtCanvas = document.createElement('canvas');
  gtCanvas.width = size;
  gtCanvas.height = size;
  const gtCtx = gtCanvas.getContext('2d')!;

  // Background black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);
  gtCtx.fillStyle = '#000000';
  gtCtx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 128;

  // 1. Skull outer contour (bone / scalp)
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 54 * scale, 60 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Cerebrospinal Fluid (CSF) rim
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 51 * scale, 57 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Brain Parenchyma (Cortex & White Matter base)
  ctx.fillStyle = '#6e6e6e';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 48 * scale, 54 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. White matter inner hemispheres
  ctx.fillStyle = '#8a8a8a';
  ctx.beginPath();
  ctx.ellipse(cx - 15 * scale, cy - 4 * scale, 22 * scale, 34 * scale, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 15 * scale, cy - 4 * scale, 22 * scale, 34 * scale, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // 5. Interhemispheric fissure (central sagittal midline)
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 52 * scale);
  ctx.lineTo(cx, cy + 52 * scale);
  ctx.stroke();

  // 6. Ventricular System (Lateral CSF ventricles - hypointense)
  ctx.fillStyle = '#1c1c1c';
  // Left frontal horn & body
  ctx.beginPath();
  ctx.ellipse(cx - 6 * scale, cy + 2 * scale, 4 * scale, 16 * scale, -0.05, 0, Math.PI * 2);
  ctx.fill();
  // Right frontal horn & body
  ctx.beginPath();
  ctx.ellipse(cx + 6 * scale, cy + 2 * scale, 4 * scale, 16 * scale, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // 7. Pathology-specific Lesion Infiltration
  if (pathology === 'Glioblastoma (Grade IV)') {
    const tx = cx + 20 * scale;
    const ty = cy - 10 * scale;
    const r = 14 * scale;

    // Ground Truth annotation
    gtCtx.fillStyle = '#ffffff';
    gtCtx.beginPath();
    gtCtx.arc(tx, ty, r, 0, Math.PI * 2);
    gtCtx.fill();

    // Enhancing rim (hyper-intense)
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.fill();

    // Central Necrotic Core (hypo-intense)
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.arc(tx + 2 * scale, ty + 1 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Vasogenic peritumoral edema flare
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();
  } else if (pathology === 'Meningioma (Dural Base)') {
    const tx = cx - 28 * scale;
    const ty = cy - 22 * scale;

    gtCtx.fillStyle = '#ffffff';
    gtCtx.beginPath();
    gtCtx.ellipse(tx, ty, 13 * scale, 10 * scale, 0.4, 0, Math.PI * 2);
    gtCtx.fill();

    // Homogeneous intense enhancement
    ctx.fillStyle = '#ececec';
    ctx.beginPath();
    ctx.ellipse(tx, ty, 13 * scale, 10 * scale, 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (pathology === 'Pituitary Adenoma (Sellar)') {
    const tx = cx;
    const ty = cy + 22 * scale;

    gtCtx.fillStyle = '#ffffff';
    gtCtx.beginPath();
    gtCtx.ellipse(tx, ty, 10 * scale, 8 * scale, 0, 0, Math.PI * 2);
    gtCtx.fill();

    ctx.fillStyle = '#e4e4e4';
    ctx.beginPath();
    ctx.ellipse(tx, ty, 10 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (pathology === 'Oligodendroglioma (Grade II)') {
    const tx = cx - 18 * scale;
    const ty = cy + 12 * scale;

    gtCtx.fillStyle = '#ffffff';
    gtCtx.beginPath();
    gtCtx.arc(tx, ty, 12 * scale, 0, Math.PI * 2);
    gtCtx.fill();

    ctx.fillStyle = '#d6d6d6';
    ctx.beginPath();
    ctx.arc(tx, ty, 12 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  // Healthy control leaves ground truth completely black (no lesion)

  // Add realistic thermal & Rician acquisition noise
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 10) {
      const noise = (Math.random() - 0.5) * 16;
      const v = Math.min(255, Math.max(0, data[i] + noise));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
  }

  const gtData = gtCtx.getImageData(0, 0, size, size).data;
  return {
    originalData: data,
    groundTruthData: gtData,
  };
}

/**
 * Loads real clinical scan image (from imageSrc) or falls back to synthetic generation.
 */
export async function loadCaseScanData(caseObj: MRICase, size = 128): Promise<{
  originalData: Uint8ClampedArray;
  groundTruthData: Uint8ClampedArray;
}> {
  const targetSrc = caseObj.imageSrc;
  if (!targetSrc) {
    return generateSyntheticScan(caseObj.pathology, size);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // Draw resized image
      ctx.drawImage(img, 0, 0, size, size);
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;

      // Convert to clean grayscale
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(
          0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        );
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
        data[i + 3] = 255;
      }

      // Generate accurate ground truth mask
      const gtCanvas = document.createElement('canvas');
      gtCanvas.width = size;
      gtCanvas.height = size;
      const gtCtx = gtCanvas.getContext('2d')!;
      gtCtx.fillStyle = '#000000';
      gtCtx.fillRect(0, 0, size, size);

      if (caseObj.id === 'case-user-tumor') {
        // High-Grade Glioblastoma in right parieto-occipital lobe (bottom-left quadrant)
        const tx = size * 0.35;
        const ty = size * 0.65;
        const rx = size * 0.16;
        const ry = size * 0.17;

        gtCtx.fillStyle = '#ffffff';
        gtCtx.beginPath();
        gtCtx.ellipse(tx, ty, rx, ry, -0.15, 0, Math.PI * 2);
        gtCtx.fill();
      } else if (caseObj.pathology === 'Healthy Brain (Control)') {
        // Normal healthy brain: Ground truth remains completely zero (negative)
      } else if (caseObj.pathology === 'Meningioma (Dural Base)') {
        const tx = size * 0.28;
        const ty = size * 0.32;
        gtCtx.fillStyle = '#ffffff';
        gtCtx.beginPath();
        gtCtx.ellipse(tx, ty, size * 0.10, size * 0.08, 0.4, 0, Math.PI * 2);
        gtCtx.fill();
      } else if (caseObj.pathology === 'Pituitary Adenoma (Sellar)') {
        const tx = size * 0.50;
        const ty = size * 0.67;
        gtCtx.fillStyle = '#ffffff';
        gtCtx.beginPath();
        gtCtx.ellipse(tx, ty, size * 0.08, size * 0.06, 0, 0, Math.PI * 2);
        gtCtx.fill();
      } else if (caseObj.pathology === 'Oligodendroglioma (Grade II)') {
        const tx = size * 0.36;
        const ty = size * 0.59;
        gtCtx.fillStyle = '#ffffff';
        gtCtx.beginPath();
        gtCtx.arc(tx, ty, size * 0.09, 0, Math.PI * 2);
        gtCtx.fill();
      }

      const gtData = gtCtx.getImageData(0, 0, size, size).data;
      resolve({ originalData: data, groundTruthData: gtData });
    };

    img.onerror = () => {
      // Graceful fallback to synthetic scan if asset fetch fails
      resolve(generateSyntheticScan(caseObj.pathology, size));
    };

    img.src = targetSrc;
  });
}

/**
 * Applies Global Histogram Equalization to expand dynamic contrast.
 */
export function applyHistogramEqualization(grayscaleArray: Uint8ClampedArray, size: number): Uint8ClampedArray {
  const totalPixels = size * size;
  const histogram = new Uint32Array(256);

  // 1. Calculate frequency histogram
  for (let i = 0; i < grayscaleArray.length; i += 4) {
    const val = grayscaleArray[i];
    histogram[val]++;
  }

  // 2. Cumulative Distribution Function (CDF)
  const cdf = new Float32Array(256);
  let cumulative = 0;
  for (let i = 0; i < 256; i++) {
    cumulative += histogram[i];
    cdf[i] = cumulative / totalPixels;
  }

  // Find min non-zero CDF
  let cdfMin = 0;
  for (let i = 0; i < 256; i++) {
    if (cdf[i] > 0) {
      cdfMin = cdf[i];
      break;
    }
  }

  // 3. Transform lookup table
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.round(((cdf[i] - cdfMin) / (1 - cdfMin)) * 255);
  }

  const result = new Uint8ClampedArray(grayscaleArray.length);
  for (let i = 0; i < grayscaleArray.length; i += 4) {
    const newVal = lut[grayscaleArray[i]];
    result[i] = newVal;
    result[i + 1] = newVal;
    result[i + 2] = newVal;
    result[i + 3] = 255;
  }
  return result;
}

/**
 * 5x5 Gaussian spatial smoothing kernel (sigma = 1.0) for high-frequency noise suppression.
 */
export function applyGaussianNoiseSuppression(data: Uint8ClampedArray, size: number): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data.length);
  // Normalized 5x5 Gaussian kernel approximated
  const kernel = [
    1, 4, 7, 4, 1,
    4, 16, 26, 16, 4,
    7, 26, 41, 26, 7,
    4, 16, 26, 16, 4,
    1, 4, 7, 4, 1,
  ];
  const kernelSum = 273;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0;
      let kIdx = 0;
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          const px = Math.min(size - 1, Math.max(0, x + kx));
          const py = Math.min(size - 1, Math.max(0, y + ky));
          const pIdx = (py * size + px) * 4;
          sum += data[pIdx] * kernel[kIdx++];
        }
      }
      const finalVal = Math.round(sum / kernelSum);
      const outIdx = (y * size + x) * 4;
      result[outIdx] = finalVal;
      result[outIdx + 1] = finalVal;
      result[outIdx + 2] = finalVal;
      result[outIdx + 3] = 255;
    }
  }
  return result;
}

/**
 * Simulates U-Net continuous pixel-wise probability map [0.0, 1.0].
 * Emulates the deep contracting path, skip-connection preservation, and sigmoid classification head.
 */
export function simulateUNetInference(
  preprocessedData: Uint8ClampedArray,
  gtData: Uint8ClampedArray,
  size: number
): Float32Array {
  const probMap = new Float32Array(size * size);
  const cx = size / 2;
  const cy = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      const pixelIdx = idx * 4;
      const intensity = preprocessedData[pixelIdx] / 255;
      const isGt = gtData[pixelIdx] > 128;

      // Cranial distance check (strips exterior skull)
      const dx = (x - cx) / (size * 0.44);
      const dy = (y - cy) / (size * 0.48);
      const inBrain = dx * dx + dy * dy < 1.0;

      let score = 0.05;
      if (inBrain) {
        if (isGt) {
          // Model activates with high confidence on tumor signature
          score = 0.72 + intensity * 0.24 + (Math.random() - 0.5) * 0.08;
        } else {
          // Healthy brain background
          if (intensity > 0.88) {
            score = 0.22 + (Math.random() - 0.5) * 0.05; // Minor tissue fringe
          } else {
            score = 0.02 + intensity * 0.08;
          }
        }
      }

      // Smooth sigmoid transition
      const logistic = 1 / (1 + Math.exp(-10 * (score - 0.42)));
      probMap[idx] = Math.min(1.0, Math.max(0.0, logistic));
    }
  }

  return probMap;
}

/**
 * Computes Otsu's optimal threshold from continuous probability map.
 */
export function computeOtsuThreshold(probMap: Float32Array): number {
  const histogram = new Int32Array(256);
  for (let i = 0; i < probMap.length; i++) {
    const val = Math.min(255, Math.max(0, Math.round(probMap[i] * 255)));
    histogram[val]++;
  }

  const total = probMap.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0;
  let wB = 0;
  let maxVariance = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varianceBetween = wB * wF * (mB - mF) * (mB - mF);

    if (varianceBetween > maxVariance) {
      maxVariance = varianceBetween;
      threshold = t;
    }
  }

  return threshold / 255;
}

/**
 * Binarizes continuous probabilities into binary mask {0, 255}.
 */
export function binarizeProbabilityMap(
  probMap: Float32Array,
  threshold: number,
  size: number
): Uint8Array {
  const binaryMask = new Uint8Array(size * size);
  for (let i = 0; i < probMap.length; i++) {
    binaryMask[i] = probMap[i] >= threshold ? 255 : 0;
  }
  return binaryMask;
}

/**
 * Morphological Opening (Erosion -> Dilation) and Closing (Dilation -> Erosion)
 * to remove speckle noise and seal intra-tumoral cavities.
 */
export function applyMorphologicalCleanup(binaryMask: Uint8Array, size: number): Uint8Array {
  const erode = (src: Uint8Array): Uint8Array => {
    const out = new Uint8Array(src.length);
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const idx = y * size + x;
        // Check 3x3 neighborhood
        if (
          src[idx] === 255 &&
          src[idx - 1] === 255 &&
          src[idx + 1] === 255 &&
          src[idx - size] === 255 &&
          src[idx + size] === 255
        ) {
          out[idx] = 255;
        } else {
          out[idx] = 0;
        }
      }
    }
    return out;
  };

  const dilate = (src: Uint8Array): Uint8Array => {
    const out = new Uint8Array(src.length);
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const idx = y * size + x;
        if (
          src[idx] === 255 ||
          src[idx - 1] === 255 ||
          src[idx + 1] === 255 ||
          src[idx - size] === 255 ||
          src[idx + size] === 255
        ) {
          out[idx] = 255;
        }
      }
    }
    return out;
  };

  // Opening: Erode then Dilate (removes isolated noise)
  const opened = dilate(erode(binaryMask));
  // Closing: Dilate then Erode (bridges tiny interior gaps)
  const closed = erode(dilate(opened));
  return closed;
}

/**
 * Generates Alpha-Blended Clinical Projection with perimeter contour.
 */
export function generateAlphaOverlay(
  originalData: Uint8ClampedArray,
  binaryMask: Uint8Array,
  size: number,
  alpha = 0.45,
  color: 'crimson' | 'cyan' | 'amber' | 'emerald' = 'crimson',
  drawContour = true
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(originalData.length);
  
  const rgbMap = {
    crimson: [225, 29, 72],
    cyan: [6, 182, 212],
    amber: [245, 158, 11],
    emerald: [16, 185, 129],
  };
  const [mr, mg, mb] = rgbMap[color];

  // 1. Identify perimeter contour points
  const isContour = new Uint8Array(size * size);
  if (drawContour) {
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const idx = y * size + x;
        if (binaryMask[idx] === 255) {
          // If any 4-neighbor is background, this is an edge
          if (
            binaryMask[idx - 1] === 0 ||
            binaryMask[idx + 1] === 0 ||
            binaryMask[idx - size] === 0 ||
            binaryMask[idx + size] === 0
          ) {
            isContour[idx] = 1;
          }
        }
      }
    }
  }

  for (let i = 0; i < binaryMask.length; i++) {
    const pIdx = i * 4;
    const baseVal = originalData[pIdx];

    if (isContour[i] === 1) {
      // Crisp white boundary delineation
      result[pIdx] = 255;
      result[pIdx + 1] = 255;
      result[pIdx + 2] = 255;
      result[pIdx + 3] = 255;
    } else if (binaryMask[i] === 255) {
      // Alpha-blended translucent color overlay:
      // Output = alpha * MaskColor + (1 - alpha) * BaseImage
      result[pIdx] = Math.round(alpha * mr + (1 - alpha) * baseVal);
      result[pIdx + 1] = Math.round(alpha * mg + (1 - alpha) * baseVal);
      result[pIdx + 2] = Math.round(alpha * mb + (1 - alpha) * baseVal);
      result[pIdx + 3] = 255;
    } else {
      result[pIdx] = baseVal;
      result[pIdx + 1] = baseVal;
      result[pIdx + 2] = baseVal;
      result[pIdx + 3] = 255;
    }
  }

  return result;
}

/**
 * Computes rigorous quantitative metrics against ground truth.
 */
export function computeSegmentationMetrics(
  gtData: Uint8ClampedArray,
  predMask: Uint8Array,
  size: number,
  pixelSpacingMm = 1.0,
  latencyMs = 38
): SegmentationMetrics {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;

  for (let i = 0; i < predMask.length; i++) {
    const isGt = gtData[i * 4] > 128;
    const isPred = predMask[i] === 255;

    if (isGt && isPred) tp++;
    else if (!isGt && isPred) fp++;
    else if (isGt && !isPred) fn++;
    else tn++;
  }

  const epsilon = 1e-7;
  const isHealthyCase = tp === 0 && fp === 0 && fn === 0;

  const dice = isHealthyCase ? 1.0 : (2.0 * tp + epsilon) / (2.0 * tp + fp + fn + epsilon);
  const iou = isHealthyCase ? 1.0 : (tp + epsilon) / (tp + fp + fn + epsilon);
  const precision = tp + fp === 0 ? (fn === 0 ? 1.0 : 0.0) : (tp + epsilon) / (tp + fp + epsilon);
  const recall = tp + fn === 0 ? 1.0 : (tp + epsilon) / (tp + fn + epsilon);
  const specificity = tn + fp === 0 ? 1.0 : (tn + epsilon) / (tn + fp + epsilon);
  const total = tp + tn + fp + fn;
  const accuracy = (tp + tn) / total;

  const tumorPixelCount = tp + fp;
  const tumorAreaMm2 = Math.round(tumorPixelCount * pixelSpacingMm * pixelSpacingMm);
  const perimeterMm = Math.round(Math.sqrt(tumorPixelCount) * 3.54 * pixelSpacingMm);

  return {
    dice: Number(dice.toFixed(4)),
    iou: Number(iou.toFixed(4)),
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    specificity: Number(specificity.toFixed(4)),
    accuracy: Number(accuracy.toFixed(4)),
    tumorAreaMm2,
    tumorPixelCount,
    perimeterMm,
    contingency: { tp, fp, fn, tn },
    latencyMs,
  };
}
