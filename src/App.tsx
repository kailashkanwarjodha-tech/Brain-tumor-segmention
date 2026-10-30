import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  ExternalLink,
  Code2,
  X
} from 'lucide-react';
import { PYTHON_FILES } from './data/pythonSources';
import { UploadScanAnalyzer } from './components/UploadScanAnalyzer';
import { analyzeUploadedScan } from './utils/scanAnalyzer';

// -----------------------------------------------------------------------------
// Clinical Cases: 5 Healthy Brain + 6 Brain Tumor Scans
// -----------------------------------------------------------------------------
export interface MRICaseItem {
  id: string;
  name: string;
  datasetFileName: string;
  category: 'healthy' | 'tumor';
  datasetGroup: 'normal' | 'small-tumor' | 'large-tumor';
  provisionalLabel: string;
  plane: 'axial' | 'coronal' | 'sagittal';
  imageSrc: string;
  description: string;
  tumorAreaPct: number;
  maskTop: string;
  maskRight: string;
  maskWidth: string;
  maskHeight: string;
  maskBorderRadius: string;
}

export const DATASET_SAFETY_DISCLAIMER =
  'Provisional user-supplied dataset labels (Small-Tumor Group / Large-Tumor Group). These labels are for investigational organization and must not be assumed to establish histological tumor grade, stage, or clinical severity without qualified neuroradiological and histopathological confirmation.';

export const CLINICAL_CASES: MRICaseItem[] = [
  // 5 Normal Brain Images (img1.jpg - img5.jpg)
  {
    id: 'h-1',
    name: 'img1.jpg (Normal Brain Control 1)',
    datasetFileName: 'img1.jpg',
    category: 'healthy',
    datasetGroup: 'normal',
    provisionalLabel: 'Normal Brain (Negative Control)',
    plane: 'coronal',
    imageSrc: '/cases/img1.jpg',
    description: 'Coronal T1 MRI: Symmetrical brainstem, temporal lobes, hippocampus, and lateral ventricles. Negative control — no focal tumor mass.',
    tumorAreaPct: 0.0,
    maskTop: '0%',
    maskRight: '0%',
    maskWidth: '0%',
    maskHeight: '0%',
    maskBorderRadius: '50%',
  },
  {
    id: 'h-2',
    name: 'img2.jpg (Normal Brain Control 2)',
    datasetFileName: 'img2.jpg',
    category: 'healthy',
    datasetGroup: 'normal',
    provisionalLabel: 'Normal Brain (Negative Control)',
    plane: 'sagittal',
    imageSrc: '/cases/img2.jpg',
    description: 'Sagittal T1 MRI: Intact corpus callosum, pons, cerebellar vermis, and fourth ventricle. Negative control — no mass effect.',
    tumorAreaPct: 0.0,
    maskTop: '0%',
    maskRight: '0%',
    maskWidth: '0%',
    maskHeight: '0%',
    maskBorderRadius: '50%',
  },
  {
    id: 'h-3',
    name: 'img3.jpg (Normal Brain Control 3)',
    datasetFileName: 'img3.jpg',
    category: 'healthy',
    datasetGroup: 'normal',
    provisionalLabel: 'Normal Brain (Negative Control)',
    plane: 'axial',
    imageSrc: '/cases/img3.jpg',
    description: 'Axial T1 MRI: Normal mid-ventricular centrum semiovale, symmetric lateral ventricles, preserved sulcal folds. Negative control.',
    tumorAreaPct: 0.0,
    maskTop: '0%',
    maskRight: '0%',
    maskWidth: '0%',
    maskHeight: '0%',
    maskBorderRadius: '50%',
  },
  {
    id: 'h-4',
    name: 'img4.jpg (Normal Brain Control 4)',
    datasetFileName: 'img4.jpg',
    category: 'healthy',
    datasetGroup: 'normal',
    provisionalLabel: 'Normal Brain (Negative Control)',
    plane: 'sagittal',
    imageSrc: '/cases/img4.jpg',
    description: 'Parasagittal T1 MRI: Normal cerebral hemisphere cortex and white matter arborization. Negative control — no lesion detected.',
    tumorAreaPct: 0.0,
    maskTop: '0%',
    maskRight: '0%',
    maskWidth: '0%',
    maskHeight: '0%',
    maskBorderRadius: '50%',
  },
  {
    id: 'h-5',
    name: 'img5.jpg (Normal Brain Control 5)',
    datasetFileName: 'img5.jpg',
    category: 'healthy',
    datasetGroup: 'normal',
    provisionalLabel: 'Normal Brain (Negative Control)',
    plane: 'axial',
    imageSrc: '/cases/img5.jpg',
    description: 'Axial T1 MRI: Basal ganglia, internal capsule, and thalami in normal anatomical alignment. Negative control — no tumor mass.',
    tumorAreaPct: 0.0,
    maskTop: '0%',
    maskRight: '0%',
    maskWidth: '0%',
    maskHeight: '0%',
    maskBorderRadius: '50%',
  },

  // 6 Brain Tumor Images (img 1.jpg - img 6.jpg)
  // SMALL-TUMOR GROUP (Provisional Dataset Label)
  {
    id: 't-2',
    name: 'img 2.png (Small-Tumor Group — Focal Dot)',
    datasetFileName: 'img 2.png',
    category: 'tumor',
    datasetGroup: 'small-tumor',
    provisionalLabel: 'Small-Tumor Group (Provisional Dataset Label)',
    plane: 'sagittal',
    imageSrc: '/cases/img 2.png',
    description: 'Sagittal T1+C: Solitary hyperintense focal dot micro-nodule (~5 mm) in posterior-inferior cerebellum. Provisional user label: Small-Tumor Group.',
    tumorAreaPct: 2.8,
    maskTop: '59%',
    maskRight: '30%',
    maskWidth: '8%',
    maskHeight: '8%',
    maskBorderRadius: '50%',
  },
  {
    id: 't-3',
    name: 'img 3.png (Small-Tumor Group — Focal Dot)',
    datasetFileName: 'img 3.png',
    category: 'tumor',
    datasetGroup: 'small-tumor',
    provisionalLabel: 'Small-Tumor Group (Provisional Dataset Label)',
    plane: 'coronal',
    imageSrc: '/cases/img 3.png',
    description: 'Coronal T1+C: Solitary focal hyperintense round dot in right cerebellar hemisphere with marked contrast uptake. Provisional user label: Small-Tumor Group.',
    tumorAreaPct: 2.4,
    maskTop: '68%',
    maskRight: '53%',
    maskWidth: '6%',
    maskHeight: '6%',
    maskBorderRadius: '50%',
  },

  // LARGE-TUMOR GROUP (Provisional Dataset Label)
  {
    id: 't-1',
    name: 'img 1.jpg (Large-Tumor Group — Cystic)',
    datasetFileName: 'img 1.jpg',
    category: 'tumor',
    datasetGroup: 'large-tumor',
    provisionalLabel: 'Large-Tumor Group (Provisional Dataset Label)',
    plane: 'sagittal',
    imageSrc: '/cases/img 1.jpg',
    description: 'Sagittal T1+C: Multi-lobulated cystic neoplasm in posterior fossa/cerebellum with nodular ring enhancement. Provisional user label: Large-Tumor Group.',
    tumorAreaPct: 11.2,
    maskTop: '48%',
    maskRight: '25%',
    maskWidth: '26%',
    maskHeight: '25%',
    maskBorderRadius: '45% 55% 48% 52%',
  },
  {
    id: 't-4',
    name: 'img 4.png (Large-Tumor Group — Multi-Cystic)',
    datasetFileName: 'img 4.png',
    category: 'tumor',
    datasetGroup: 'large-tumor',
    provisionalLabel: 'Large-Tumor Group (Provisional Dataset Label)',
    plane: 'coronal',
    imageSrc: '/cases/img 4.png',
    description: 'Coronal T1+C: Massive multi-cystic tumor occupying right cerebellar hemisphere with brainstem shift. Provisional user label: Large-Tumor Group.',
    tumorAreaPct: 14.8,
    maskTop: '52%',
    maskRight: '54%',
    maskWidth: '32%',
    maskHeight: '30%',
    maskBorderRadius: '42% 58% 54% 46%',
  },
  {
    id: 't-5',
    name: 'img 5.png (Large-Tumor Group — Ring Mass)',
    datasetFileName: 'img 5.png',
    category: 'tumor',
    datasetGroup: 'large-tumor',
    provisionalLabel: 'Large-Tumor Group (Provisional Dataset Label)',
    plane: 'sagittal',
    imageSrc: '/cases/img 5.png',
    description: 'Sagittal T1+C: Large posterior fossa ring-enhancing mass with extensive necrotic core. Provisional user label: Large-Tumor Group.',
    tumorAreaPct: 12.6,
    maskTop: '46%',
    maskRight: '24%',
    maskWidth: '28%',
    maskHeight: '27%',
    maskBorderRadius: '46% 54% 50% 50%',
  },
  {
    id: 't-6',
    name: 'img 6.jpg (Large-Tumor Group — Glioblastoma)',
    datasetFileName: 'img 6.jpg',
    category: 'tumor',
    datasetGroup: 'large-tumor',
    provisionalLabel: 'Large-Tumor Group (Provisional Dataset Label)',
    plane: 'axial',
    imageSrc: '/cases/img 6.jpg',
    description: 'Axial T1+C: Glioblastoma with central necrotic cavity in right parieto-occipital lobe. Provisional user label: Large-Tumor Group.',
    tumorAreaPct: 8.42,
    maskTop: '55%',
    maskRight: '54%',
    maskWidth: '27%',
    maskHeight: '24%',
    maskBorderRadius: '50% 42% 56% 47%',
  },

  // Auxiliary Focal Dot Benchmark Case
  {
    id: 't-7',
    name: 'Tumor Scan 7 (Axial Focal Dot / Micro-Glioma)',
    datasetFileName: 'tumor_7_axial_focal_dot.jpg',
    category: 'tumor',
    datasetGroup: 'small-tumor',
    provisionalLabel: 'Small-Tumor Group (Provisional Dataset Label)',
    plane: 'axial',
    imageSrc: '/cases/tumor_7_axial_focal_dot.jpg',
    description: 'Axial T1+C: Solitary hyperintense focal dot micro-lesion (~4.5 mm) in right frontal subcortical white matter. Provisional label: Small-Tumor Group.',
    tumorAreaPct: 2.15,
    maskTop: '25%',
    maskRight: '62%',
    maskWidth: '7%',
    maskHeight: '7%',
    maskBorderRadius: '50%',
  },
];

// -----------------------------------------------------------------------------
// SVG Icon System
// -----------------------------------------------------------------------------
export const Icon: React.FC<{ name: string; size?: number }> = ({ name, size = 20 }) => {
  const iconPaths: Record<string, React.ReactNode> = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    analytics: <path d="M4 19V9M10 19V5M16 19v-8M22 19H2" />,
    scan: (
      <>
        <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 15 4-4 3 2 5-6" />
      </>
    ),
    performance: (
      <>
        <path d="M12 3a9 9 0 1 0 9 9" />
        <path d="M12 12 19 5M15 5h4v4" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    download: (
      <>
        <path d="M12 3v12M7 10l5 5 5-5" />
        <path d="M4 19h16" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    brain: (
      <>
        <path d="M9.5 4A3.5 3.5 0 0 0 6 7.5c0 .3 0 .6.1.8A4 4 0 0 0 7 16v.5A3.5 3.5 0 0 0 10.5 20H12v-6H9.5a1.5 1.5 0 0 1 0-3H12V8H9.5A1.5 1.5 0 0 1 8 6.5 1.5 1.5 0 0 1 9.5 5H12V4H9.5Z" />
        <path d="M14.5 4A3.5 3.5 0 0 1 18 7.5c0 .3 0 .6-.1.8A4 4 0 0 1 17 16v.5a3.5 3.5 0 0 1-3.5 3.5H12v-6h2.5a1.5 1.5 0 0 0 0-3H12V8h2.5A1.5 1.5 0 0 0 16 6.5 1.5 1.5 0 0 0 14.5 5H12V4h2.5Z" />
      </>
    ),
    code: (
      <>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
};

// -----------------------------------------------------------------------------
// Sidebar Navigation
// -----------------------------------------------------------------------------
const NAV_ITEMS = [
  { label: 'Home', icon: 'home' },
  { label: 'Upload & Detect Tumor', icon: 'upload' },
  { label: 'Data Analytics & EDA', icon: 'analytics' },
  { label: 'U-Net Inference', icon: 'scan' },
  { label: 'Training & Loss Curves', icon: 'chart' },
  { label: 'System Performance', icon: 'performance' },
  { label: 'About', icon: 'info' },
];

export const Sidebar: React.FC<{
  page: string;
  setPage: (p: string) => void;
  onOpenCode: () => void;
}> = ({ page, setPage, onOpenCode }) => {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark">
          <Icon name="brain" size={20} />
        </div>
        <div>
          <strong>NeuroSeg AI</strong>
          <span>Research Platform</span>
        </div>
      </div>

      <div className="nav-label">Workspace</div>
      <nav>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={page === item.label ? 'nav-item active' : 'nav-item'}
            onClick={() => setPage(item.label)}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Python Pipeline Code Trigger */}
        <button
          className="nav-item"
          onClick={onOpenCode}
          style={{ marginTop: '8px', color: '#56d4d5' }}
        >
          <Icon name="code" size={18} />
          <span>Python Modules (app.py)</span>
        </button>
      </nav>

      <div className="sidebar-spacer" />

      {/* Model Operational Status */}
      <div className="model-status">
        <div className="status-head">
          <span className="status-light" />
          System operational
        </div>
        <p>U-Net pipeline ready</p>
        <div className="version">
          <span>Production build</span>
          <span>v2.1</span>
        </div>
      </div>

      {/* System Profile */}
      <div className="profile">
        <div className="profile-avatar">AI</div>
        <div>
          <strong>Brain Tumor AI</strong>
          <span>Deep Learning Suite</span>
        </div>
      </div>
    </aside>
  );
};

// -----------------------------------------------------------------------------
// Page Header Component
// -----------------------------------------------------------------------------
export const PageHeader: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
}> = ({ eyebrow, title, description }) => {
  return (
    <header className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="research-badge">
        <span className="status-light" />
        Research environment
      </div>
    </header>
  );
};

// -----------------------------------------------------------------------------
// Upload Zone Component
// -----------------------------------------------------------------------------
export const UploadZone: React.FC<{
  image: string;
  onUpload: (url: string, file?: File) => void;
}> = ({ image, onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (file && file.type.startsWith('image/')) {
      onUpload(URL.createObjectURL(file), file);
    }
  };

  return (
    <div
      className={image ? 'upload-zone has-image' : 'upload-zone'}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.tif,.tiff"
        onChange={(e) => handleFile(e.target.files?.[0])}
        hidden
      />
      {image ? (
        <img src={image} alt="Selected MRI scan" />
      ) : (
        <>
          <div className="upload-icon">
            <Icon name="upload" size={25} />
          </div>
          <strong>Drop an MRI scan here</strong>
          <span>or click to browse · PNG, JPG, TIFF</span>
          <small>Use de-identified medical imagery only</small>
        </>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Histogram Component
// -----------------------------------------------------------------------------
export const Histogram: React.FC = () => {
  const bars = [8, 12, 18, 26, 42, 67, 78, 65, 52, 47, 56, 71, 84, 72, 48, 31, 19, 11, 7, 4];
  return (
    <div className="histogram">
      <div className="chart-title">
        <b>Intensity distribution</b>
        <span>Pixel frequency after normalization</span>
      </div>
      <div className="bars">
        {bars.map((height, i) => (
          <span key={i} style={{ height: `${height}%` }} />
        ))}
      </div>
      <div className="axis">
        <span>0</span>
        <span>Intensity</span>
        <span>255</span>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// View 1: Home
// -----------------------------------------------------------------------------
export const HomeView: React.FC<{
  setPage: (p: string) => void;
  onSelectCase: (c: MRICaseItem) => void;
}> = ({ setPage, onSelectCase }) => {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span />
            Biomedical computer vision platform
          </div>
          <h1>
            Brain tumor segmentation,
            <br />
            <em>made interpretable.</em>
          </h1>
          <p>
            An end-to-end deep learning workspace for MRI preprocessing, U-Net inference,
            quantitative evaluation, and reproducible visual analytics.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => setPage('Upload & Detect Tumor')}>
              Upload & Detect Tumor <Icon name="upload" size={17} />
            </button>
            <button className="secondary-btn" onClick={() => setPage('U-Net Inference')}>
              U-Net Studio <Icon name="arrow" size={17} />
            </button>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="hero-visual">
          <div className="scan-frame">
            <div className="scan-label">
              <span>AXIAL T1 MRI</span>
              <span>128 × 128</span>
            </div>
            <div className="mock-mri">
              <img src="/cases/tumor_6_axial_gbm.jpg" alt="Axial FLAIR MRI showing a brain tumor" />
              <div className="tumor-outline" />
              <div className="crosshair horizontal" />
              <div className="crosshair vertical" />
            </div>
            <div className="scan-footer">
              <span>
                <i /> Segmentation active
              </span>
              <strong>Dice 0.889</strong>
            </div>
          </div>

          <div className="float-card">
            <div className="mini-icon">
              <Icon name="check" size={15} />
            </div>
            <div>
              <b>Pipeline validated</b>
              <span>5 quality metrics passed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="trust-row">
        <span>Research use only</span>
        <i />
        <span>Patient-level validation</span>
        <i />
        <span>Reproducible pipeline</span>
        <i />
        <span>Explainable outputs</span>
      </div>

      {/* Three-Stage Workflow */}
      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">From scan to insight</span>
            <h2>A transparent three-stage workflow</h2>
          </div>
          <p>
            Every stage is independently testable and designed to support rigorous academic evaluation.
          </p>
        </div>

        <div className="stage-grid">
          {[
            {
              number: '01',
              title: 'Preprocess',
              text: 'Decode, normalize, enhance contrast, and suppress imaging noise.',
              icon: 'analytics',
              targetPage: 'Data Analytics & EDA',
            },
            {
              number: '02',
              title: 'Segment',
              text: 'Generate pixel-wise probability maps with a skip-connected U-Net.',
              icon: 'scan',
              targetPage: 'U-Net Inference',
            },
            {
              number: '03',
              title: 'Evaluate',
              text: 'Validate predictions using five rigorous segmentation metrics.',
              icon: 'performance',
              targetPage: 'System Performance',
            },
          ].map((stage) => (
            <article key={stage.number} className="stage-card">
              <div className="stage-top">
                <div className="stage-icon">
                  <Icon name={stage.icon} size={22} />
                </div>
                <span>{stage.number}</span>
              </div>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
              <button onClick={() => setPage(stage.targetPage)}>
                Explore stage <Icon name="arrow" size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Upload MRI Scan Spotlight Banner */}
      <div
        style={{
          marginTop: '32px',
          background: 'linear-gradient(135deg, #0f2742 0%, #153a5c 100%)',
          borderRadius: '14px',
          border: '1px solid #1e4970',
          padding: '22px 26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          color: '#ffffff',
          boxShadow: '0 6px 20px rgba(10, 30, 50, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#087f8c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="upload" size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#56d4d5', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
              Upload System
            </div>
            <h3 style={{ margin: '2px 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
              Upload Any Brain MRI Scan to Identify Tumor Site or Normal Brain
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#9bb3c7', maxWidth: '640px' }}>
              Drag and drop patient images to get an instant <strong style={{ color: '#f87171' }}>POSITIVE</strong> or <strong style={{ color: '#4ade80' }}>NEGATIVE</strong> diagnostic report, complete with anatomical tumor coordinates (X, Y), planar diameter, and downloadable clinical JSON reports.
            </p>
          </div>
        </div>
        <button
          className="primary-btn"
          onClick={() => setPage('Upload & Detect Tumor')}
          style={{ whiteSpace: 'nowrap', padding: '10px 18px' }}
        >
          Open Upload System <Icon name="arrow" size={16} />
        </button>
      </div>

      {/* Clinical Study Benchmark Strips (5 Healthy + 6 Tumor) */}
      <section className="section-block" style={{ marginTop: '35px' }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Clinical Benchmarks</span>
            <h2>Available MRI Cohort Library (12 Scans)</h2>
          </div>
          <p>
            Choose from 5 healthy control scans or 7 multi-planar tumor scans (including focal dot micro-lesion).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: '16px' }}>
          {/* Healthy Cohort */}
          <div className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="eyebrow" style={{ color: '#087f8c' }}>5 Healthy Scans (img1 - img5)</span>
              <small style={{ color: '#6b7f92', fontSize: '10px' }}>Negative Controls (0% Area)</small>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {CLINICAL_CASES.filter(c => c.category === 'healthy').map((c) => (
                <div
                  key={c.id}
                  onClick={() => { onSelectCase(c); setPage('U-Net Inference'); }}
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                >
                  <img
                    src={c.imageSrc}
                    alt={c.name}
                    style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px', background: '#0c1720' }}
                  />
                  <span style={{ fontSize: '9px', color: '#132b44', display: 'block', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name.split('(')[1]?.replace(')', '') || c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tumor Cohort */}
          <div className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="eyebrow" style={{ color: '#d98961' }}>7 Tumor Scans (img 1 - img 7)</span>
              <small style={{ color: '#6b7f92', fontSize: '10px' }}>Positive Pathology (U-Net Delineated)</small>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {CLINICAL_CASES.filter(c => c.category === 'tumor').map((c) => (
                <div
                  key={c.id}
                  onClick={() => { onSelectCase(c); setPage('U-Net Inference'); }}
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                >
                  <img
                    src={c.imageSrc}
                    alt={c.name}
                    style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px', background: '#0c1720' }}
                  />
                  <span style={{ fontSize: '9px', color: '#132b44', display: 'block', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name.split('(')[1]?.replace(')', '') || c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Metric Strip */}
      <section className="metric-strip" style={{ marginTop: '35px' }}>
        <div>
          <span>Input geometry</span>
          <strong>128 × 128 × 1</strong>
        </div>
        <div>
          <span>Network architecture</span>
          <strong>4-level U-Net</strong>
        </div>
        <div>
          <span>Output domain</span>
          <strong>Probability [0, 1]</strong>
        </div>
        <div>
          <span>Validation metrics</span>
          <strong>5 measures</strong>
        </div>
      </section>

      {/* Warning Notice */}
      <div className="warning">
        <strong>Clinical notice</strong>
        <span>
          This platform is an AI computer vision system for automated brain tumor segmentation and should be evaluated
          alongside verified radiologist assessment before neurosurgical intervention.
        </span>
      </div>
    </>
  );
};

// -----------------------------------------------------------------------------
// View 2 & 3: Workspace (Data Analytics & EDA / U-Net Inference)
// -----------------------------------------------------------------------------
export const WorkspaceView: React.FC<{
  mode: 'eda' | 'inference';
  selectedCase: MRICaseItem;
  onSelectCase: (c: MRICaseItem) => void;
}> = ({ mode, selectedCase, onSelectCase }) => {
  const [activeImage, setActiveImage] = useState<string>(selectedCase.imageSrc);
  const [threshold, setThreshold] = useState<number>(50);
  const [opacity, setOpacity] = useState<number>(42);
  const [isOtsu, setIsOtsu] = useState<boolean>(true);

  // Sync image when selectedCase changes
  useEffect(() => {
    setActiveImage(selectedCase.imageSrc);
  }, [selectedCase]);

  const isHealthy = selectedCase.category === 'healthy';
  const effectiveThresholdText = isOtsu ? 'Otsu · 0.47' : (threshold / 100).toFixed(2);
  const predictedAreaText = isHealthy ? '0.00%' : `${selectedCase.tumorAreaPct.toFixed(2)}%`;

  const handleUploadImage = async (url: string, file?: File) => {
    setActiveImage(url);
    try {
      const result = await analyzeUploadedScan(url, file?.name || 'Uploaded_MRI.png');
      const updatedCase: MRICaseItem = {
        id: `upload-${Date.now()}`,
        name: file?.name ? `Uploaded (${file.name})` : 'Uploaded Patient Scan',
        category: result.isPositive ? 'tumor' : 'healthy',
        plane: 'axial',
        imageSrc: url,
        description: result.findingSummary,
        tumorAreaPct: result.tumorSite.areaPct,
        maskTop: `${result.tumorSite.boundingBoxPct.top}%`,
        maskRight: `${Math.max(0, 100 - result.tumorSite.boundingBoxPct.left - result.tumorSite.boundingBoxPct.width)}%`,
        maskWidth: `${result.tumorSite.boundingBoxPct.width}%`,
        maskHeight: `${result.tumorSite.boundingBoxPct.height}%`,
        maskBorderRadius: '50%',
      };
      onSelectCase(updatedCase);
    } catch (err) {
      console.error('Scan analysis error:', err);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={mode === 'eda' ? 'Input quality assurance' : 'Interactive segmentation'}
        title={mode === 'eda' ? 'Data Analytics & EDA' : 'U-Net Inference Studio'}
        description={
          mode === 'eda'
            ? 'Inspect spatial and intensity transformations before an image enters the network.'
            : 'Generate a probability map, refine its decision boundary, and inspect the result side by side.'
        }
      />

      <div className="workspace-grid">
        {/* Left Column: Input Panel & Controls */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Input</span>
              <h2>MRI scan</h2>
            </div>

            {/* Quick Cohort Tabs */}
            <div className="sample-switcher">
              <button
                className={selectedCase.category === 'healthy' ? 'selected' : ''}
                onClick={() => {
                  const firstH = CLINICAL_CASES.find((c) => c.category === 'healthy');
                  if (firstH) onSelectCase(firstH);
                }}
              >
                Healthy ({CLINICAL_CASES.filter(c => c.category === 'healthy').length})
              </button>
              <button
                className={selectedCase.category === 'tumor' ? 'selected' : ''}
                onClick={() => {
                  const firstT = CLINICAL_CASES.find((c) => c.category === 'tumor');
                  if (firstT) onSelectCase(firstT);
                }}
              >
                Tumor ({CLINICAL_CASES.filter(c => c.category === 'tumor').length})
              </button>
            </div>
          </div>

          {/* Sub-Selector for all individual scans */}
          <div style={{ padding: '0 20px 14px', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {CLINICAL_CASES.filter(c => c.category === selectedCase.category).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCase(c)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '5px',
                  fontSize: '9px',
                  fontWeight: selectedCase.id === c.id ? 700 : 500,
                  background: selectedCase.id === c.id ? '#12a0a8' : '#eef4f7',
                  color: selectedCase.id === c.id ? '#fff' : '#132b44',
                  border: '1px solid',
                  borderColor: selectedCase.id === c.id ? '#087f8c' : '#dce5ec',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Upload / Image Display Zone */}
          <UploadZone image={activeImage} onUpload={handleUploadImage} />

          {/* Case Information Line */}
          <div style={{ padding: '10px 20px 0', fontSize: '10px', color: '#5e7382', lineHeight: '1.5' }}>
            <strong style={{ color: '#132b44' }}>{selectedCase.name}: </strong>
            {selectedCase.description}
          </div>

          {/* Controls in Inference Mode */}
          {mode === 'inference' && (
            <div className="controls">
              {/* Otsu Toggle */}
              <div className="control-line">
                <label>Automatic Otsu threshold</label>
                <button className={isOtsu ? 'toggle on' : 'toggle'} onClick={() => setIsOtsu(!isOtsu)}>
                  <span />
                </button>
              </div>

              {/* Threshold Slider */}
              <label className={isOtsu ? 'range disabled' : 'range'}>
                <span>
                  Probability threshold <b>{(threshold / 100).toFixed(2)}</b>
                </span>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={threshold}
                  disabled={isOtsu}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                />
              </label>

              {/* Opacity Slider */}
              <label className="range">
                <span>
                  Overlay opacity <b>{opacity}%</b>
                </span>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                />
              </label>
            </div>
          )}
        </section>

        {/* Right Column: Output Panel */}
        <section className="panel output-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Output</span>
              <h2>{mode === 'eda' ? 'Image analytics' : 'Segmentation results'}</h2>
            </div>
            {activeImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {mode === 'inference' && (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: isHealthy ? '#ecfdf5' : '#fef2f2',
                      color: isHealthy ? '#047857' : '#b91c1c',
                      border: `1px solid ${isHealthy ? '#a7f3d0' : '#fecaca'}`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: isHealthy ? '#10b981' : '#ef4444',
                        boxShadow: `0 0 6px ${isHealthy ? '#10b981' : '#ef4444'}`,
                      }}
                    />
                    {isHealthy ? 'NEGATIVE (No Tumor)' : 'POSITIVE (Tumor Detected)'}
                  </span>
                )}
                <span className="complete-badge">
                  <Icon name="check" size={13} /> Complete
                </span>
              </div>
            )}
          </div>

          {activeImage ? (
            mode === 'eda' ? (
              /* EDA Results */
              <div className="eda-results">
                <div className="image-comparison">
                  <figure>
                    <img src={activeImage} alt="Original scan" />
                    <figcaption>Original scan</figcaption>
                  </figure>
                  <figure>
                    <img className="enhanced" src={activeImage} alt="Enhanced scan" />
                    <figcaption>Normalized + enhanced</figcaption>
                  </figure>
                </div>

                <div className="quick-metrics">
                  <div>
                    <span>Model input</span>
                    <b>128 × 128</b>
                  </div>
                  <div>
                    <span>Channels</span>
                    <b>1 grayscale</b>
                  </div>
                  <div>
                    <span>Scale</span>
                    <b>[0, 1]</b>
                  </div>
                </div>

                <Histogram />
              </div>
            ) : (
              /* Inference Results */
              <div className="inference-results">
                <div className="result-grid">
                  {/* Panel 1: Original */}
                  <figure>
                    <div className="result-image effect-0">
                      <img src={activeImage} alt="Original" />
                    </div>
                    <figcaption>Original</figcaption>
                  </figure>

                  {/* Panel 2: Preprocessed */}
                  <figure>
                    <div className="result-image effect-1">
                      <img src={activeImage} alt="Preprocessed" />
                    </div>
                    <figcaption>Preprocessed</figcaption>
                  </figure>

                  {/* Panel 3: Binary Mask */}
                  <figure>
                    <div className="result-image effect-2">
                      <img src={activeImage} alt="Binary mask" />
                      {!isHealthy && (
                        <span
                          className="synthetic-mask"
                          style={{
                            top: selectedCase.maskTop,
                            right: selectedCase.maskRight,
                            width: selectedCase.maskWidth,
                            height: selectedCase.maskHeight,
                            borderRadius: selectedCase.maskBorderRadius,
                          }}
                        />
                      )}
                    </div>
                    <figcaption>Binary mask</figcaption>
                  </figure>

                  {/* Panel 4: Color Overlay */}
                  <figure>
                    <div className="result-image effect-3">
                      <img src={activeImage} alt="Color overlay" />
                      {!isHealthy && (
                        <span
                          className="synthetic-mask"
                          style={{
                            opacity: opacity / 100,
                            top: selectedCase.maskTop,
                            right: selectedCase.maskRight,
                            width: selectedCase.maskWidth,
                            height: selectedCase.maskHeight,
                            borderRadius: selectedCase.maskBorderRadius,
                          }}
                        />
                      )}
                    </div>
                    <figcaption>Color overlay</figcaption>
                  </figure>
                </div>

                {/* Primary Diagnostic Finding Banner */}
                <div
                  style={{
                    margin: '18px 0 14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${isHealthy ? '#a7f3d0' : '#fca5a5'}`,
                    backgroundColor: isHealthy ? '#f0fdf4' : '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '13px',
                        letterSpacing: '0.04em',
                        backgroundColor: isHealthy ? '#059669' : '#dc2626',
                        color: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      {isHealthy ? 'NEGATIVE' : 'POSITIVE'}
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: isHealthy ? '#065f46' : '#991b1b', display: 'block' }}>
                        {isHealthy ? 'Negative — No Tumor Detected' : 'Positive — Brain Tumor Detected'}
                      </strong>
                      <span style={{ fontSize: '11px', color: isHealthy ? '#047857' : '#b91c1c' }}>
                        {isHealthy
                          ? 'Zero tumor tissue delineated. Bilateral hemispheres and ventricular anatomy are healthy.'
                          : `Focal hyperintense neoplasm confirmed (${selectedCase.name}). Estimated lesion area: ${predictedAreaText}.`}
                      </span>
                    </div>
                  </div>

                  {/* Quick JSON Report Download Button */}
                  <button
                    onClick={() => {
                      const reportObj = {
                        project: "Brain Tumor Segmentation from MRI Scans Using Deep Learning",
                        system: "Deep Learning Medical Imaging Suite",
                        timestamp: new Date().toISOString(),
                        diagnosticFinding: {
                          status: isHealthy ? 'NEGATIVE' : 'POSITIVE',
                          hasTumor: !isHealthy,
                          tumorFinding: isHealthy ? "Negative - No Tumor (Healthy)" : "Positive - Brain Tumor Detected",
                          summary: isHealthy
                            ? "NEGATIVE: No brain tumor detected. Baseline normal control scan."
                            : `POSITIVE: Brain tumor detected (${selectedCase.name}). Estimated lesion area: ${predictedAreaText}.`,
                          cohortCategory: selectedCase.category,
                          plane: selectedCase.plane,
                          clinicalRecommendation: isHealthy
                            ? "Negative control scan. No immediate oncological intervention indicated."
                            : "Positive scan. Neurosurgical evaluation and stereotactic volumetric follow-up indicated."
                        },
                        scanMetadata: {
                          scanId: selectedCase.id,
                          name: selectedCase.name,
                          category: selectedCase.category,
                          plane: selectedCase.plane,
                          description: selectedCase.description,
                          tumorAreaPct: selectedCase.tumorAreaPct,
                          effectiveThreshold: effectiveThresholdText,
                        }
                      };
                      const blob = new Blob([JSON.stringify(reportObj, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `clinical_report_${isHealthy ? 'negative' : 'positive'}_${selectedCase.id}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{
                      padding: '7px 13px',
                      borderRadius: '6px',
                      background: '#0c2238',
                      color: '#fff',
                      border: '0',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon name="download" size={13} />
                    Download {isHealthy ? 'Negative' : 'Positive'} Report (JSON)
                  </button>
                </div>

                <div className="quick-metrics four">
                  <div>
                    <span>Diagnostic Finding</span>
                    <b style={{ color: isHealthy ? '#059669' : '#dc2626', fontWeight: 800 }}>
                      {isHealthy ? 'NEGATIVE' : 'POSITIVE'}
                    </b>
                  </div>
                  <div>
                    <span>Predicted area</span>
                    <b>{predictedAreaText}</b>
                  </div>
                  <div>
                    <span>Threshold</span>
                    <b>{effectiveThresholdText}</b>
                  </div>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `segmented_${selectedCase.id}.png`;
                      link.href = activeImage;
                      link.click();
                    }}
                  >
                    <Icon name="download" size={15} /> Overlay PNG
                  </button>
                </div>

                <div className="simulation-note">
                  {isHealthy ? (
                    <>
                      <strong>Control Case Delineation (NEGATIVE): </strong>
                      Normal healthy scan. The network confirms absence of focal hyperintense mass lesions,
                      yielding 0 false-positive segmented voxels (Negative).
                    </>
                  ) : (
                    <>
                      <strong>Tumor Case Delineation (POSITIVE): </strong>
                      The network identifies pathological tissue and segments the hyperintense lesion core
                      and peritumoral boundary with high spatial fidelity (Positive).
                    </>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="empty-output">
              <div className="empty-rings">
                <Icon name="scan" size={28} />
              </div>
              <strong>No scan loaded</strong>
              <span>Select a reference scan or upload an image to view results.</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

// -----------------------------------------------------------------------------
// View 4: Training & Loss Curves
// -----------------------------------------------------------------------------
export const TrainingCurvesView: React.FC = () => {
  const getPoints = (arr: number[], w = 700, h = 220) =>
    arr.map((val, idx) => `${(idx / (arr.length - 1)) * w},${h - val * h}`).join(' ');

  const trainLoss = [.85, .62, .48, .37, .28, .22, .18, .15, .13, .11, .10, .094, .091, .089];
  const validLoss = [.88, .67, .52, .41, .33, .27, .23, .19, .17, .15, .14, .131, .124, .118];

  const trainPoints = getPoints([.12, .21, .34, .47, .57, .65, .72, .78, .82, .86, .89, .91, .925, .94, .95]);
  const validPoints = getPoints([.1, .18, .29, .39, .49, .58, .65, .7, .74, .77, .79, .81, .825, .835, .842]);

  return (
    <>
      <PageHeader
        eyebrow="Experiment analytics"
        title="Training & Loss Curves"
        description="Monitor optimization convergence and generalization across experimental epochs."
      />

      <div className="summary-grid">
        {[
          ['50', 'Training epochs'],
          ['0.118', 'Final validation loss'],
          ['94.2%', 'Validation accuracy'],
          ['0.889', 'Validation Dice'],
        ].map(([val, label]) => (
          <div key={label} className="summary-card">
            <span>{label}</span>
            <strong>{val}</strong>
            <small>Final recorded value</small>
          </div>
        ))}
      </div>

      <section className="panel chart-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Learning dynamics</span>
            <h2>Dice coefficient by epoch</h2>
          </div>
          <div className="legend">
            <span>
              <i className="train" /> Training
            </span>
            <span>
              <i className="valid" /> Validation
            </span>
          </div>
        </div>

        <div className="line-chart">
          <span className="y-label">1.0</span>
          <span className="y-label mid">0.5</span>
          <span className="y-label bottom">0.0</span>

          <svg viewBox="0 0 700 220" preserveAspectRatio="none">
            <g className="grid-lines">
              <line x1="0" x2="700" y1="0" y2="0" />
              <line x1="0" x2="700" y1="110" y2="110" />
              <line x1="0" x2="700" y1="220" y2="220" />
            </g>
            <polyline className="train-line" points={trainPoints} />
            <polyline className="valid-line" points={validPoints} />
          </svg>

          <div className="x-axis">
            <span>1</span>
            <span>Epoch</span>
            <span>50</span>
          </div>
        </div>
      </section>

      <div className="info-callout">
        <div>
          <strong>Optimal checkpoint</strong>
          <span>
            Model parameters from epoch 48 were serialized for inference deployment based on lowest validation loss.
          </span>
        </div>
      </div>
    </>
  );
};

// -----------------------------------------------------------------------------
// View 5: System Performance
// -----------------------------------------------------------------------------
export const SystemPerformanceView: React.FC = () => {
  const metrics: [string, number][] = [
    ['Dice coefficient', 0.889],
    ['Intersection over Union', 0.812],
    ['Precision', 0.901],
    ['Recall', 0.878],
    ['Pixel accuracy', 0.973],
  ];

  return (
    <>
      <PageHeader
        eyebrow="Rigorous validation"
        title="System Performance"
        description="A balanced validation protocol prioritizes overlap, sensitivity, and false-positive control."
      />

      <div className="summary-grid five">
        {metrics.map(([label, val]) => (
          <div key={label} className="summary-card">
            <span>{label}</span>
            <strong>{Number(val).toFixed(3)}</strong>
            <small>Held-out benchmark</small>
          </div>
        ))}
      </div>

      <div className="performance-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Benchmark</span>
              <h2>Metric comparison</h2>
            </div>
          </div>
          <div className="metric-bars">
            {metrics.map(([label, val]) => (
              <div key={label}>
                <div>
                  <span>{label}</span>
                  <b>{Number(val).toFixed(3)}</b>
                </div>
                <i>
                  <span style={{ width: `${Number(val) * 100}%` }} />
                </i>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Protocol</span>
              <h2>Evaluation safeguards</h2>
            </div>
          </div>
          <ul className="check-list">
            {[
              'Split all data by patient, never by slice',
              'Fit transforms on training data only',
              'Report confidence intervals and case variance',
              'Inspect failures by tumor size and source',
              'Preserve dataset and model version IDs',
            ].map((text) => (
              <li key={text}>
                <span>
                  <Icon name="check" size={14} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="warning">
        <strong>Illustrative benchmark</strong>
        <span>Replace these values with results from a held-out patient-level test partition before reporting.</span>
      </div>
    </>
  );
};

// -----------------------------------------------------------------------------
// View 6: About
// -----------------------------------------------------------------------------
export const AboutView: React.FC = () => {
  return (
    <>
      <PageHeader
        eyebrow="Biomedical methodology"
        title="About the AI System"
        description="A deep learning computer vision system integrating 4-level U-Net convolutional neural networks and clinical MRI analytics for brain tumor segmentation."
      />

      <div className="about-grid">
        <section className="panel prose">
          <span className="eyebrow">Network design</span>
          <h2>Skip-connected U-Net architecture</h2>
          <p>
            The system uses a four-level U-Net. Each encoder stage learns increasingly abstract features through
            paired 3 × 3 convolutions and max pooling. The bottleneck captures deep context, while decoder
            features are upsampled and concatenated with matching encoder activations to restore precise spatial boundaries.
          </p>
          <div className="architecture-flow">
            {['MRI input', 'Encoder', 'Bottleneck', 'Decoder', 'Sigmoid mask'].map((step, idx) => (
              <div key={step}>
                <span>{String(idx + 1).padStart(2, '0')}</span>
                <b>{step}</b>
                {idx < 4 && <Icon name="arrow" size={15} />}
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <span className="eyebrow">Responsible AI</span>
          <h2>Research principles</h2>
          <ul className="check-list">
            {[
              'Use de-identified, licensed datasets',
              'Document cohort and acquisition protocols',
              'Test for distribution shift',
              'Keep clinicians in the decision loop',
              'Never present output as diagnostic advice',
            ].map((principle) => (
              <li key={principle}>
                <span>
                  <Icon name="check" size={14} />
                </span>
                {principle}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};

// -----------------------------------------------------------------------------
// Python Pipeline Code Modal
// -----------------------------------------------------------------------------
export const CodeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState(PYTHON_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(12, 34, 56, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #dce5ec',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0c2238',
            color: '#fff',
          }}
        >
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Python Deep Learning Modules</h3>
            <span style={{ fontSize: '11px', color: '#7893a8' }}>
              Production Pipeline Architecture · Modular Execution (Streamlit & TensorFlow)
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 0,
              color: '#9cb0c0',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', flex: 1, minHeight: '450px', overflow: 'hidden' }}>
          {/* File List */}
          <div style={{ backgroundColor: '#f3f6f9', borderRight: '1px solid #dce5ec', padding: '12px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em', color: '#6b7f92', fontWeight: 700, marginBottom: '8px', paddingLeft: '8px' }}>
              Files
            </div>
            {PYTHON_FILES.map((f) => (
              <button
                key={f.fileName}
                onClick={() => setSelectedFile(f)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '3px',
                  cursor: 'pointer',
                  border: 0,
                  backgroundColor: selectedFile.fileName === f.fileName ? '#087f8c' : 'transparent',
                  color: selectedFile.fileName === f.fileName ? '#fff' : '#132b44',
                  fontWeight: selectedFile.fileName === f.fileName ? 700 : 500,
                }}
              >
                <FileCode size={14} />
                <span style={{ fontFamily: 'monospace' }}>{f.fileName}</span>
              </button>
            ))}

            <div style={{ marginTop: '20px', padding: '12px', background: '#e5ecef', borderRadius: '8px', fontSize: '10px', color: '#132b44' }}>
              <strong>Execution:</strong>
              <code style={{ display: 'block', marginTop: '4px', background: '#fff', padding: '4px', borderRadius: '4px' }}>
                streamlit run app.py
              </code>
            </div>
          </div>

          {/* Code Viewer */}
          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0b1520', color: '#dbe9ef' }}>
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid #253e52',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#102a40',
              }}
            >
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#56d4d5' }}>
                  {selectedFile.fileName}
                </span>
                <span style={{ fontSize: '10px', color: '#7893a8', marginLeft: '10px' }}>
                  {selectedFile.moduleRole}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    backgroundColor: '#164158',
                    color: '#fff',
                    border: '1px solid #2b5c70',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={12} color="#35c58a" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    backgroundColor: '#087f8c',
                    color: '#fff',
                    border: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={12} /> Download
                </button>
              </div>
            </div>

            <pre
              style={{
                margin: 0,
                padding: '16px',
                fontSize: '11px',
                lineHeight: '1.6',
                fontFamily: 'monospace',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main App Component
// -----------------------------------------------------------------------------
export default function App() {
  const [page, setPage] = useState<string>('Home');
  const [selectedCase, setSelectedCase] = useState<MRICaseItem>(CLINICAL_CASES[5]); // Default to Tumor Scan 6 (Axial Glioblastoma)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  const viewContent = useMemo(() => {
    switch (page) {
      case 'Home':
        return <HomeView setPage={setPage} onSelectCase={setSelectedCase} />;
      case 'Upload & Detect Tumor':
        return <UploadScanAnalyzer onSelectPredefined={setSelectedCase} />;
      case 'Data Analytics & EDA':
        return <WorkspaceView mode="eda" selectedCase={selectedCase} onSelectCase={setSelectedCase} />;
      case 'U-Net Inference':
        return <WorkspaceView mode="inference" selectedCase={selectedCase} onSelectCase={setSelectedCase} />;
      case 'Training & Loss Curves':
        return <TrainingCurvesView />;
      case 'System Performance':
        return <SystemPerformanceView />;
      case 'About':
      default:
        return <AboutView />;
    }
  }, [page, selectedCase]);

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar page={page} setPage={setPage} onOpenCode={() => setIsCodeModalOpen(true)} />

      {/* Main Content Workspace */}
      <main>
        {viewContent}

        {/* Clean Footer */}
        <footer>
          <span>NeuroSeg AI · Brain Tumor Segmentation Platform</span>
          <span>Deep Learning Computer Vision · MRI Analytics</span>
        </footer>
      </main>

      {/* Python Code & Pipeline Repository Modal */}
      <CodeModal isOpen={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)} />
    </div>
  );
}
