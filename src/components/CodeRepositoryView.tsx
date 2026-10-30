import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  FolderGit2, 
  ExternalLink,
  Code2
} from 'lucide-react';
import { PYTHON_FILES, PythonFileDoc } from '../data/pythonSources';

export const CodeRepositoryView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonFileDoc>(PYTHON_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = () => {
    // Downloads all files as individual downloads sequentially
    PYTHON_FILES.forEach((f, idx) => {
      setTimeout(() => {
        const blob = new Blob([f.code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = f.fileName;
        link.click();
        URL.revokeObjectURL(url);
      }, idx * 200);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
              <span>Modular Architecture</span>
              <span>·</span>
              <span className="font-mono-numbers">Python 3.10+ / TensorFlow 2.x</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Decoupled Python Codebase & Pipeline Repository
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Production-standard modular engineering adhering to clean code principles, strict type hints,
              and inline architectural explanations for brain tumor segmentation and clinical evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllZip}
              className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              Download All Modules
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Quick Start Guide */}
      <div className="bg-slate-950 text-slate-200 rounded-xl p-5 border border-slate-800 font-mono-numbers text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>Terminal Execution Sequence (Local Workstation or Google Colab)</span>
          </div>
          <span className="text-[11px] text-emerald-400">bash / zsh</span>
        </div>

        <div className="space-y-2 text-slate-300">
          <p className="text-slate-500"># 1. Initialize virtual environment and activate</p>
          <div className="p-2 bg-slate-900/90 rounded border border-slate-800/80 text-sky-300 select-all">
            python3 -m venv venv && source venv/bin/activate
          </div>

          <p className="text-slate-500 pt-1"># 2. Install pinned dependencies</p>
          <div className="p-2 bg-slate-900/90 rounded border border-slate-800/80 text-sky-300 select-all">
            pip install -r requirements.txt
          </div>

          <p className="text-slate-500 pt-1"># 3. Launch the clinical Streamlit dashboard</p>
          <div className="p-2 bg-slate-900/90 rounded border border-slate-800/80 text-emerald-300 select-all">
            streamlit run app.py
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: File Explorer */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide px-2 pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Project Files</span>
          </div>

          <div className="space-y-1">
            {PYTHON_FILES.map((file) => {
              const isSelected = selectedFile.fileName === file.fileName;
              return (
                <button
                  key={file.fileName}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex flex-col ${
                    isSelected
                      ? 'bg-sky-50 text-sky-900 border border-sky-200 font-medium'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="font-mono-numbers">{file.fileName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 truncate pl-5">
                    {file.moduleRole}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-numbers text-xs font-bold text-slate-900">
                  {selectedFile.fileName}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-sky-700 font-medium">{selectedFile.moduleRole}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{selectedFile.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadFile}
                className="px-2.5 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium hover:bg-sky-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Syntax Box */}
          <div className="flex-1 bg-slate-950 rounded-lg p-4 overflow-x-auto text-xs font-mono-numbers text-slate-200 leading-relaxed border border-slate-800 max-h-[560px]">
            <pre>
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
