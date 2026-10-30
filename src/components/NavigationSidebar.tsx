import React from 'react';
import { 
  Activity, 
  BarChart3, 
  Layers, 
  TrendingUp, 
  Award, 
  Code2, 
  BookOpen, 
  Sliders,
  Sparkles,
  Terminal
} from 'lucide-react';
import { PipelineSettings } from '../types';

interface NavigationSidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  settings: PipelineSettings;
  onUpdateSettings: (updater: (prev: PipelineSettings) => PipelineSettings) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentPage,
  onSelectPage,
  settings,
  onUpdateSettings,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'inference', label: 'U-Net Inference & Pipeline', icon: Layers },
    { id: 'eda', label: 'Data Analytics & EDA', icon: BarChart3 },
    { id: 'curves', label: 'Training & Loss Curves', icon: TrendingUp },
    { id: 'performance', label: 'System Performance & Eval', icon: Award },
    { id: 'code', label: 'Python Code & Repository', icon: Code2 },
    { id: 'about', label: 'System Architecture & Docs', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col
        transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white">NeuroSegment AI</h1>
              <p className="text-[11px] text-slate-400 font-mono-numbers">Deep Learning MRI Diagnostic Suite</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Workspace Views
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Pipeline Configuration Parameters */}
          <div className="pt-6 px-3">
            <div className="flex items-center gap-1.5 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Pipeline Settings</span>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {/* Target Spatial Dimension */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Spatial Normalization</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
                  <button
                    onClick={() => onUpdateSettings(prev => ({ ...prev, targetResolution: 128 }))}
                    className={`py-1 text-[11px] rounded font-medium transition-colors ${
                      settings.targetResolution === 128
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    128 × 128
                  </button>
                  <button
                    onClick={() => onUpdateSettings(prev => ({ ...prev, targetResolution: 256 }))}
                    className={`py-1 text-[11px] rounded font-medium transition-colors ${
                      settings.targetResolution === 256
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    256 × 256
                  </button>
                </div>
              </div>

              {/* CLAHE Filter Toggle */}
              <label className="flex items-center justify-between cursor-pointer py-1 group">
                <span className="text-slate-300 group-hover:text-white text-xs">Adaptive CLAHE Filter</span>
                <input
                  type="checkbox"
                  checked={settings.useClahe}
                  onChange={(e) => onUpdateSettings(prev => ({ ...prev, useClahe: e.target.checked }))}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Morphological Noise Cleanup */}
              <label className="flex items-center justify-between cursor-pointer py-1 group">
                <span className="text-slate-300 group-hover:text-white text-xs">Morphological Opening/Closing</span>
                <input
                  type="checkbox"
                  checked={settings.useMorphologicalCleanup}
                  onChange={(e) => onUpdateSettings(prev => ({ ...prev, useMorphologicalCleanup: e.target.checked }))}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Perimeter Contour Line */}
              <label className="flex items-center justify-between cursor-pointer py-1 group">
                <span className="text-slate-300 group-hover:text-white text-xs">Draw Tumor Perimeter</span>
                <input
                  type="checkbox"
                  checked={settings.showContourPerimeter}
                  onChange={(e) => onUpdateSettings(prev => ({ ...prev, showContourPerimeter: e.target.checked }))}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Execution Command */}
        <div className="p-3 bg-slate-900/60 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-mono-numbers">
              <Terminal className="w-3 h-3 text-sky-400" />
              Streamlit CLI
            </span>
            <span className="text-[10px] text-emerald-400 font-mono-numbers">Ready</span>
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono-numbers text-slate-300 truncate select-all">
            streamlit run app.py
          </div>
        </div>
      </aside>
    </>
  );
};
