import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Target,
  Maximize2,
  RefreshCw,
  Eye,
  Sliders,
  Crosshair,
  Sparkles,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { analyzeUploadedScan, ScanAnalysisResult } from '../utils/scanAnalyzer';
import { CLINICAL_CASES, MRICaseItem } from '../App';

export const UploadScanAnalyzer: React.FC<{
  onSelectPredefined?: (item: MRICaseItem) => void;
}> = () => {
  const [currentImageSrc, setCurrentImageSrc] = useState<string>('/cases/tumor_6_axial_gbm.jpg');
  const [currentFileName, setCurrentFileName] = useState<string>('Tumor_Scan_6_Axial_GBM.jpg');
  const [analysisResult, setAnalysisResult] = useState<ScanAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [overlayAlpha, setOverlayAlpha] = useState<number>(55);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run analysis when currentImageSrc or currentFileName changes
  useEffect(() => {
    let isCancelled = false;

    const runAnalysis = async () => {
      setIsAnalyzing(true);
      setAnalysisStep('Reading scan voxels & intracranial boundary...');

      setTimeout(() => {
        if (!isCancelled) setAnalysisStep('Evaluating bilateral hemispheric symmetry...');
      }, 150);

      setTimeout(() => {
        if (!isCancelled) setAnalysisStep('Scanning for focal hyperintensities & lesion site...');
      }, 300);

      try {
        const result = await analyzeUploadedScan(currentImageSrc, currentFileName);
        if (!isCancelled) {
          setAnalysisResult(result);
          setIsAnalyzing(false);
          setAnalysisStep('');
        }
      } catch (err) {
        console.error('Scan analysis error:', err);
        if (!isCancelled) {
          setIsAnalyzing(false);
          setAnalysisStep('');
        }
      }
    };

    runAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [currentImageSrc, currentFileName]);

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, TIFF, WebP).');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCurrentFileName(file.name);
    setCurrentImageSrc(objectUrl);
  };

  const handleDownloadJsonReport = () => {
    if (!analysisResult) return;

    const exportData = {
      platform: 'NeuroSeg AI Medical Computer Vision Suite',
      project: 'Brain Tumor Segmentation from MRI Scans Using Deep Learning',
      reportId: analysisResult.scanId,
      timestamp: new Date().toISOString(),
      fileName: analysisResult.fileName,
      diagnosticVerdict: {
        status: analysisResult.status,
        hasTumor: analysisResult.isPositive,
        interpretation: analysisResult.isPositive
          ? 'POSITIVE: Yeah, there is a brain tumor.'
          : 'NEGATIVE: There is no tumor (Normal healthy brain).',
        title: analysisResult.findingTitle,
        clinicalSummary: analysisResult.findingSummary,
        confidence: `${analysisResult.metrics.confidencePct}%`,
      },
      tumorSiteDetails: analysisResult.tumorSite.detected
        ? {
            siteIdentified: true,
            locationName: analysisResult.tumorSite.locationName,
            hemisphere: analysisResult.tumorSite.hemisphere,
            anatomicalRegion: analysisResult.tumorSite.anatomicalRegion,
            coordinatesPercent: analysisResult.tumorSite.coordinatesPct,
            boundingBoxPercent: analysisResult.tumorSite.boundingBoxPct,
            estimatedTumorAreaMm2: analysisResult.tumorSite.areaMm2,
            cerebralAreaPercentage: `${analysisResult.tumorSite.areaPct}%`,
            maximumPlanarDiameterMm: `${analysisResult.tumorSite.maxDiameterMm} mm`,
            morphologyDescription: analysisResult.tumorSite.morphology,
          }
        : {
            siteIdentified: false,
            locationName: 'None (No tumor detected)',
            cerebralIntegrity: 'Symmetrical healthy brain parenchyma',
          },
      quantitativeMetrics: {
        bilateralSymmetryIndex: `${analysisResult.metrics.symmetryIndexPct}%`,
        lesionContrastRatio: analysisResult.metrics.lesionContrastRatio,
        meanBrainIntensity: analysisResult.metrics.parenchymaMeanIntensity,
        diceScoreEstimate: analysisResult.metrics.diceEstimated,
        iouScoreEstimate: analysisResult.metrics.iouEstimated,
        processingLatencyMs: analysisResult.processingTimeMs,
      },
      clinicalRecommendation: analysisResult.recommendation,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical_report_${analysisResult.status.toLowerCase()}_${analysisResult.scanId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPositive = analysisResult?.isPositive ?? false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f2742 0%, #091b2e 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(10, 30, 50, 0.25)',
          border: '1px solid #1a3d60',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'rgba(86, 212, 213, 0.15)',
              border: '1px solid rgba(86, 212, 213, 0.4)',
              color: '#56d4d5',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px',
            }}
          >
            <Sparkles size={13} />
            AI MRI Upload & Tumor Site Identification System
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Upload Brain MRI & Automated Tumor Localization
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#9bb3c7', lineHeight: '1.6' }}>
            Upload any patient brain MRI scan. The deep vision system automatically determines whether the scan is{' '}
            <strong style={{ color: '#f87171' }}>POSITIVE</strong> (tumor detected) or{' '}
            <strong style={{ color: '#4ade80' }}>NEGATIVE</strong> (normal healthy brain), pinpointing the exact tumor site, anatomical coordinates, and surface area.
          </p>
        </div>

        {/* Quick Upload CTA button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.tif,.tiff,.webp"
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 20px',
              background: '#087f8c',
              color: '#ffffff',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '13px',
              border: 0,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(8, 127, 140, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            <Upload size={16} />
            Upload New MRI Scan
          </button>
        </div>
      </div>

      {/* Main Upload & Work Area Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '22px' }}>
        {/* Left Column: Upload Box & Scan Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Drag & Drop Upload Card */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileUpload(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: isDragging ? '#e6f7f8' : '#ffffff',
              border: `2px dashed ${isDragging ? '#087f8c' : '#c8d7e3'}`,
              borderRadius: '14px',
              padding: '24px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#e0f4f6',
                color: '#087f8c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Upload size={24} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: '#132b44' }}>
              Drag & Drop MRI Image Here
            </h3>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#688094' }}>
              or click to browse your computer
            </p>
            <div
              style={{
                display: 'inline-block',
                background: '#f1f5f9',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '10px',
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              PNG, JPG, TIFF, WEBP · Max 25MB
            </div>
          </div>

          {/* Quick Test Presets: 5 Healthy Brain + 6 Brain Tumor Scans */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #dce5ec',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#688094',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Quick Test Library (12 Clinical Scans)</span>
              <span style={{ fontSize: '10px', color: '#087f8c', fontWeight: 600 }}>1-Click Try</span>
            </div>

            {/* Healthy Scans Group */}
            <div style={{ marginBottom: '14px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#047857',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ShieldCheck size={13} />
                5 Healthy Brain Scans (Negative Controls):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {CLINICAL_CASES.filter((c) => c.category === 'healthy').map((c, idx) => {
                  const isSelected = currentImageSrc === c.imageSrc;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCurrentFileName(`${c.name}.jpg`);
                        setCurrentImageSrc(c.imageSrc);
                      }}
                      title={`${c.name} - ${c.description}`}
                      style={{
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: `1.5px solid ${isSelected ? '#059669' : '#d1fae5'}`,
                        background: isSelected ? '#ecfdf5' : '#f9fafb',
                        color: isSelected ? '#065f46' : '#1f2937',
                        fontSize: '10px',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      H-{idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tumor Scans Group */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#b91c1c',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <AlertCircle size={13} />
                7 Brain Tumor Scans (Positive Cases — incl. Small Dot):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {CLINICAL_CASES.filter((c) => c.category === 'tumor').map((c, idx) => {
                  const isSelected = currentImageSrc === c.imageSrc;
                  const isDot = c.id === 't-7';
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCurrentFileName(`${c.name}.jpg`);
                        setCurrentImageSrc(c.imageSrc);
                      }}
                      title={`${c.name} - ${c.description}`}
                      style={{
                        padding: '6px 2px',
                        borderRadius: '6px',
                        border: `1.5px solid ${
                          isSelected
                            ? '#dc2626'
                            : isDot
                            ? '#fca5a5'
                            : '#fee2e2'
                        }`,
                        background: isSelected
                          ? '#fef2f2'
                          : isDot
                          ? '#fff5f5'
                          : '#f9fafb',
                        color: isSelected ? '#991b1b' : '#1f2937',
                        fontSize: '9.5px',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                      }}
                    >
                      {isDot ? 'T-7 (Dot)' : `T-${idx + 1}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current File Metadata Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '11px',
              color: '#475569',
              lineHeight: '1.6',
            }}
          >
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              Current Loaded Scan:
            </div>
            <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', color: '#087f8c', fontWeight: 600 }}>
              {currentFileName}
            </div>
            {analysisResult && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>Latency: <b>{analysisResult.processingTimeMs} ms</b></div>
                <div>Brain Voxels Evaluated: <b>65,536 (256×256)</b></div>
                <div>Model Architecture: <b>Deep U-Net (Skip Connections)</b></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Diagnostic Report & Spatial Visualizer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Primary POSITIVE / NEGATIVE Diagnosis Banner */}
          {analysisResult && !isAnalyzing && (
            <div
              style={{
                borderRadius: '14px',
                padding: '18px 22px',
                background: isPositive ? '#fef2f2' : '#f0fdf4',
                border: `2px solid ${isPositive ? '#f87171' : '#4ade80'}`,
                boxShadow: isPositive
                  ? '0 6px 20px rgba(239, 68, 68, 0.12)'
                  : '0 6px 20px rgba(16, 185, 129, 0.12)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Big Status Badge */}
                <div
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '18px',
                    letterSpacing: '0.06em',
                    background: isPositive ? '#dc2626' : '#059669',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  {isPositive ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
                  {isPositive ? 'POSITIVE' : 'NEGATIVE'}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: isPositive ? '#991b1b' : '#065f46',
                      marginBottom: '3px',
                    }}
                  >
                    {isPositive
                      ? 'Yeah, there is tumor — Brain Tumor Detected'
                      : 'There is no tumor — Normal Healthy Brain'}
                  </div>
                  <div style={{ fontSize: '12px', color: isPositive ? '#b91c1c' : '#047857', maxWidth: '640px' }}>
                    {analysisResult.findingSummary}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDownloadJsonReport}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '7px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: isPositive ? '#dc2626' : '#059669',
                    color: '#fff',
                    border: 0,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={13} />
                  Download JSON Report
                </button>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '7px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#ffffff',
                    color: '#1e293b',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={13} />
                  View Clinical Sheet
                </button>
              </div>
            </div>
          )}

          {/* Loading Animation during analysis */}
          {isAnalyzing && (
            <div
              style={{
                borderRadius: '14px',
                padding: '24px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
              }}
            >
              <RefreshCw className="animate-spin text-teal-600" size={24} />
              <div>
                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                  Processing Uploaded Scan...
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{analysisStep}</span>
              </div>
            </div>
          )}

          {/* Tumor Site Identification Card */}
          {analysisResult && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #dce5ec',
                padding: '18px 20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid #eef2f6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: isPositive ? '#fee2e2' : '#e0f2fe',
                      color: isPositive ? '#dc2626' : '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Target size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      {isPositive ? 'Identified Tumor Site & Spatial Coordinates' : 'Anatomical Symmetry & Baseline Integrity'}
                    </h3>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {isPositive
                        ? 'Automated localization of neoplastic lesion boundary, volume, and coordinates'
                        : 'Bilateral parenchymal symmetry verification & absence of focal masses'}
                    </span>
                  </div>
                </div>

                {/* View Crosshair Toggle */}
                {isPositive && (
                  <button
                    onClick={() => setShowCrosshair(!showCrosshair)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: showCrosshair ? '#087f8c' : '#f1f5f9',
                      color: showCrosshair ? '#fff' : '#475569',
                      border: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <Crosshair size={13} />
                    {showCrosshair ? 'Site Crosshair ON' : 'Site Crosshair OFF'}
                  </button>
                )}
              </div>

              {/* Spatial Coordinates Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Identified Site / Region
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {analysisResult.tumorSite.locationName}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Spatial Centroid (X, Y)
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: isPositive ? '#dc2626' : '#059669', marginTop: '2px' }}>
                    {isPositive
                      ? `X: ${analysisResult.tumorSite.coordinatesPct.x}% · Y: ${analysisResult.tumorSite.coordinatesPct.y}%`
                      : 'N/A (Symmetrical Midline)'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Estimated Lesion Area
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {isPositive ? `${analysisResult.tumorSite.areaMm2} mm² (${analysisResult.tumorSite.areaPct}%)` : '0 mm² (0.00%)'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Max Planar Diameter
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {isPositive ? `${analysisResult.tumorSite.maxDiameterMm} mm` : '0.0 mm'}
                  </div>
                </div>
              </div>

              {/* Morphology & Recommendation Line */}
              <div
                style={{
                  background: isPositive ? '#fff1f2' : '#f0fdf4',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '11px',
                  color: isPositive ? '#881337' : '#14532d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Activity size={16} />
                <div>
                  <strong>Diagnostic Recommendation: </strong>
                  {analysisResult.recommendation}
                </div>
              </div>
            </div>
          )}

          {/* 4-Panel Medical Visualizer */}
          {analysisResult && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #dce5ec',
                padding: '18px 20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Multi-Stage Computer Vision & Lesion Localization Inspection
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Side-by-side progression from raw MRI upload to segmented tumor site
                  </span>
                </div>

                {/* Opacity slider for overlay */}
                {isPositive && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <span style={{ color: '#64748b' }}>Overlay Opacity:</span>
                    <input
                      type="range"
                      min="20"
                      max="90"
                      value={overlayAlpha}
                      onChange={(e) => setOverlayAlpha(Number(e.target.value))}
                      style={{ width: '80px', accentColor: '#dc2626' }}
                    />
                    <b>{overlayAlpha}%</b>
                  </div>
                )}
              </div>

              {/* 4-View Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {/* Panel 1: Original with Tumor Site Crosshair */}
                <div
                  style={{
                    background: '#091522',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#000',
                    }}
                  >
                    <img
                      src={currentImageSrc}
                      alt="Original MRI Scan"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Tumor Site Crosshair and Reticle */}
                    {isPositive && showCrosshair && (
                      <>
                        <div
                          style={{
                            position: 'absolute',
                            left: `${analysisResult.tumorSite.coordinatesPct.x}%`,
                            top: `${analysisResult.tumorSite.coordinatesPct.y}%`,
                            width: '28px',
                            height: '28px',
                            transform: 'translate(-50%, -50%)',
                            border: '2px solid #ef4444',
                            borderRadius: '50%',
                            boxShadow: '0 0 10px #ef4444',
                            pointerEvents: 'none',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            left: `${analysisResult.tumorSite.coordinatesPct.x}%`,
                            top: `${analysisResult.tumorSite.coordinatesPct.y}%`,
                            width: '4px',
                            height: '4px',
                            transform: 'translate(-50%, -50%)',
                            background: '#ffffff',
                            borderRadius: '50%',
                            boxShadow: '0 0 6px #fff',
                            pointerEvents: 'none',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            left: `${analysisResult.tumorSite.coordinatesPct.x}%`,
                            top: `${analysisResult.tumorSite.coordinatesPct.y}%`,
                            transform: 'translate(-50%, -170%)',
                            background: 'rgba(220, 38, 38, 0.95)',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                            pointerEvents: 'none',
                          }}
                        >
                          TUMOR SITE
                        </div>
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      marginTop: '6px',
                      textAlign: 'center',
                    }}
                  >
                    1. Original Scan {isPositive && showCrosshair ? '(Target Site)' : ''}
                  </div>
                </div>

                {/* Panel 2: Preprocessed / Skull Stripped */}
                <div
                  style={{
                    background: '#091522',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#000',
                    }}
                  >
                    <img
                      src={analysisResult.processedImageSrc}
                      alt="Preprocessed Scan"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      marginTop: '6px',
                      textAlign: 'center',
                    }}
                  >
                    2. Contrast Enhanced (CLAHE)
                  </div>
                </div>

                {/* Panel 3: Binary Mask */}
                <div
                  style={{
                    background: '#091522',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#000',
                    }}
                  >
                    <img
                      src={analysisResult.binaryMaskSrc}
                      alt="Binary Segmentation Mask"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      marginTop: '6px',
                      textAlign: 'center',
                    }}
                  >
                    3. Binary Mask {isPositive ? '(Isolated Lesion)' : '(0 Pixels)'}
                  </div>
                </div>

                {/* Panel 4: Color Delineation Overlay */}
                <div
                  style={{
                    background: '#091522',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#000',
                    }}
                  >
                    <img
                      src={analysisResult.overlayImageSrc}
                      alt="Color Overlay"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: isPositive ? 1 : 0.9,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isPositive ? '#f87171' : '#4ade80',
                      marginTop: '6px',
                      textAlign: 'center',
                    }}
                  >
                    4. {isPositive ? 'Segmented Lesion Site' : 'Normal Baseline Control'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Diagnostic Report Sheet Modal */}
      {isReportModalOpen && analysisResult && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 24, 40, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1px solid #dce5ec',
            }}
          >
            {/* Sheet Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0f2742',
                color: '#fff',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                  Clinical MRI Diagnostic Examination Report
                </h3>
                <span style={{ fontSize: '11px', color: '#9bb3c7' }}>
                  Protocol: Axial / Sagittal / Coronal T1+C Magnetic Resonance Imaging
                </span>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 0,
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 800,
                }}
              >
                ✕
              </button>
            </div>

            {/* Sheet Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Verdict Ribbon */}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: isPositive ? '#fef2f2' : '#f0fdf4',
                  border: `2px solid ${isPositive ? '#ef4444' : '#10b981'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                    Primary Finding
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 900,
                      color: isPositive ? '#dc2626' : '#059669',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {isPositive ? 'POSITIVE — Tumor Detected' : 'NEGATIVE — Normal Healthy Brain'}
                  </div>
                </div>

                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: isPositive ? '#dc2626' : '#059669',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '12px',
                  }}
                >
                  Confidence {analysisResult.metrics.confidencePct}%
                </div>
              </div>

              {/* Patient & Scan Fields */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  fontSize: '12px',
                  background: '#f8fafc',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Scan ID
                  </span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{analysisResult.scanId}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                    File Name
                  </span>
                  <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
                    {analysisResult.fileName}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Examination Timestamp
                  </span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{new Date().toLocaleString()}</div>
                </div>
              </div>

              {/* Tumor Site Identification section */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  Tumor Site Localization & Spatial Findings
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Identified Tumor Site:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>
                      {analysisResult.tumorSite.locationName}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Coordinates (Centroid):</span>
                    <strong style={{ display: 'block', color: isPositive ? '#dc2626' : '#059669' }}>
                      {isPositive
                        ? `X: ${analysisResult.tumorSite.coordinatesPct.x}%, Y: ${analysisResult.tumorSite.coordinatesPct.y}%`
                        : 'None (Healthy)'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Estimated Surface Area:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>
                      {analysisResult.tumorSite.areaMm2} mm² ({analysisResult.tumorSite.areaPct}%)
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Maximum Lesion Diameter:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>
                      {analysisResult.tumorSite.maxDiameterMm} mm
                    </strong>
                  </div>
                </div>
              </div>

              {/* Radiologist Impression & Notes */}
              <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#334155' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Radiological Impression:
                </div>
                <p style={{ margin: 0 }}>{analysisResult.findingSummary}</p>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '10px', marginBottom: '4px' }}>
                  Next Clinical Step:
                </div>
                <p style={{ margin: 0 }}>{analysisResult.recommendation}</p>
              </div>

              {/* Footer Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                  paddingTop: '14px',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadJsonReport}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '7px',
                    border: 0,
                    background: '#087f8c',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  Download Clinical JSON Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
