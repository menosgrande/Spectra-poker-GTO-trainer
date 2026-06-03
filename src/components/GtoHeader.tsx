import React from 'react';
import { Situation } from '../types';
import { Shield, Sparkles, BookOpen, Layers, Award, Camera } from 'lucide-react';
import { motion } from 'motion/react';

interface GtoHeaderProps {
  situations: Situation[];
  currentSituation: Situation;
  onSelectSituation: (sit: Situation) => void;
  activeTab: 'viewer' | 'trainer' | 'glossary' | 'memo' | 'board';
  setActiveTab: (tab: 'viewer' | 'trainer' | 'glossary' | 'memo' | 'board') => void;
}

export default function GtoHeader({
  situations,
  currentSituation,
  onSelectSituation,
  activeTab,
  setActiveTab,
}: GtoHeaderProps) {
  // Extract unique stack depths from situations list for rendering quick pills
  const stackDepths = ['100BB', '40BB', '20BB'] as const;

  const handleStackFilter = (depth: string) => {
    // Find the first situation matching this stack depth
    const match = situations.find((s) => s.stackDepth === depth);
    if (match) {
      onSelectSituation(match);
    }
  };

  return (
    <header id="gto-app-header" className="sticky top-0 z-40 bg-[#0a0a10]/95 backdrop-blur-md border-b border-white/10 p-3 pt-4 sm:p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Branding Title */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-rose-500 via-emerald-500 to-blue-500 shadow-lg shadow-black">
            <span className="font-mono text-xs font-bold text-white tracking-widest">SP</span>
            {/* Ambient decorative blinker */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="font-sans text-xl font-bold text-white tracking-widest">SPECTRA</h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono tracking-wider rounded bg-white/10 text-slate-400 uppercase">
                Mobile Pro
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">GTO Mixed Strategy Range Engine</p>
          </div>
        </div>

        {/* Global Tab Navigation */}
        <div className="flex items-center justify-between sm:justify-start gap-1 p-1 bg-[#08080c] border border-white/10 rounded-lg w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            id="tab-viewer"
            onClick={() => setActiveTab('viewer')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'viewer'
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-rose-450 text-rose-400" />
            <span>GTO レンジ</span>
          </button>
          <button
            id="tab-trainer"
            onClick={() => setActiveTab('trainer')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'trainer'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-450 text-emerald-400" />
            <span>GTO 特訓</span>
          </button>
          <button
            id="tab-board"
            onClick={() => setActiveTab('board')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'board'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-purple-400" />
            <span>ボード解析</span>
          </button>
          <button
            id="tab-glossary"
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'glossary'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>用語集</span>
          </button>
          <button
            id="tab-memo"
            onClick={() => setActiveTab('memo')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'memo'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>自習メモ</span>
          </button>
        </div>
      </div>

      {activeTab === 'viewer' && (
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-white/5 flex flex-col gap-2.5">
          {/* Filtering Row (Stack Depth & Quick Switch) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Stack Depth Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase">スタック:</span>
              <div className="flex gap-1">
                {stackDepths.map((depth) => {
                  const isActive = currentSituation.stackDepth === depth;
                  return (
                    <button
                      key={depth}
                      onClick={() => handleStackFilter(depth)}
                      className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded cursor-pointer transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                          : 'bg-[#08080c] text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {depth}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Situation Picker Dropdown/Fills */}
            <div className="flex items-center gap-1.5 max-w-full overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase whitespace-nowrap">シナリオ:</span>
              <div className="flex gap-1.5 whitespace-nowrap">
                {situations
                  .filter((sit) => sit.stackDepth === currentSituation.stackDepth)
                  .map((sit) => {
                    const isCurrent = sit.id === currentSituation.id;
                    return (
                      <button
                        key={sit.id}
                        onClick={() => onSelectSituation(sit)}
                        className={`px-3 py-1 text-xs font-bold rounded cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.35)] scale-[1.02]'
                            : 'bg-[#08080c] text-slate-400 hover:text-white hover:bg-[#0c0c14] border border-white/5'
                        }`}
                      >
                        {sit.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="bg-[#08080c]/60 border border-white/10 rounded-lg p-2.5 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 mr-2 uppercase tracking-wider">現在 :</span>
              <span className="text-white font-bold">{currentSituation.name}</span>
              <span className="mx-1.5 text-white/10">|</span>
              <span className="text-slate-400 text-[11px] font-medium">{currentSituation.description}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
