import React, { useState } from 'react';
import { Situation, HandStrategy } from '../types';
import { getHandFromGrid } from '../data/rangeData';
import { motion } from 'motion/react';

interface RangeMatrixProps {
  currentSituation: Situation;
  selectedHand: HandStrategy | null;
  onSelectHand: (hand: HandStrategy) => void;
}

export default function RangeMatrix({
  currentSituation,
  selectedHand,
  onSelectHand,
}: RangeMatrixProps) {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  // View mode state for the matrix
  // 'gto': show standard mixed strategy GTO split colors
  // 'ev': show yellow-green glow based on expected value
  // 'blockers': highlight certain classes of card (e.g. Ace, King blocks)
  const [viewMode, setViewMode] = useState<'gto' | 'ev' | 'blockers'>('gto');
  const [filterBlockerCard, setFilterBlockerCard] = useState<string>('A');

  // Custom Split Color function for GTO background decoration
  const getGtoBackground = (strategy: HandStrategy) => {
    const { raise, call, fold } = strategy.actions;
    
    // Pure strategies
    if (raise === 100) return 'rgb(244, 63, 94)'; // Rose-500
    if (call === 100) return 'rgb(16, 185, 129)';  // Emerald-500
    if (fold === 100) return 'rgb(26, 43, 76)';   // Deep Cobalt Fold

    // Mixed strategy calculation with accurate color proportions splits
    // GTO Wizard Split Render Strategy: Using hard CSS gradient cuts
    const rLimit = raise;
    const cLimit = raise + call;

    return `linear-gradient(135deg, 
      #f43f5e 0%, #f43f5e ${rLimit}%, 
      #10b981 ${rLimit}%, #10b981 ${cLimit}%, 
      #1e2d4d ${cLimit}%, #1e2d4d 100%
    )`;
  };

  // EV background calculation
  const getEvBackground = (strategy: HandStrategy) => {
    const ev = strategy.ev;
    if (ev <= 0) return '#050508'; // Dark bg
    // Linear scale between container and bright yellow-amber glow for EV
    const opacity = Math.min(1, ev / 3.5); // capped at 3.5 BB
    return `rgba(234, 179, 8, ${0.1 + opacity * 0.9})`; // Yellow intensity
  };

  const isBlockerMatch = (hand: string, card: string) => {
    return hand.includes(card);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-[550px] mx-auto bg-[#08080c] border border-white/10 p-3 sm:p-4 rounded-xl shadow-2xl">
      {/* Visual Mode Selector */}
      <div className="flex items-center justify-between gap-1 p-1 bg-[#0a0a10] rounded-lg border border-white/5">
        <button
          onClick={() => setViewMode('gto')}
          className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
            viewMode === 'gto'
              ? 'bg-rose-500/10 text-rose-450 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          GTOスペクトル
        </button>
        <button
          onClick={() => setViewMode('ev')}
          className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
            viewMode === 'ev'
              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          EV期待値
        </button>
        <button
          onClick={() => setViewMode('blockers')}
          className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
            viewMode === 'blockers'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ブロッカー
        </button>
      </div>

      {viewMode === 'blockers' && (
        <div className="flex items-center justify-start gap-1 bg-[#0a0a10] rounded p-1.5 border border-white/5">
          <span className="text-[10px] text-slate-500 font-bold uppercase mr-2 tracking-wider">ブロッカー抽出 :</span>
          {['A', 'K', 'Q', 'J', 'T'].map((card) => (
            <button
               key={card}
               onClick={() => setFilterBlockerCard(card)}
               className={`w-5 h-5 flex items-center justify-center font-mono text-[11px] font-bold rounded cursor-pointer transition-all ${
                 filterBlockerCard === card
                   ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold'
                   : 'bg-[#08080c] text-slate-500 hover:text-slate-300'
               }`}
            >
              {card}
            </button>
          ))}
        </div>
      )}

      {/* 13x13 Grid Board with Labels */}
      <div className="relative select-none">
        
        {/* Top Header Labels (X-Axis: Col Labels) */}
        <div className="grid grid-cols-[16px_1fr] mb-1">
          <div></div> {/* Top-left Spacer */}
          <div className="grid grid-cols-[repeat(13,_minmax(0,_1fr))] text-center">
            {ranks.map((r) => (
              <span key={r} className="font-mono text-[9px] font-bold text-slate-500">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Outer Flex row */}
        <div className="flex">
          {/* Left Header Labels (Y-Axis: Row Labels) */}
          <div className="flex flex-col justify-around text-right pr-1.5 w-4 gap-[2px]">
            {ranks.map((r) => (
              <span key={r} className="font-mono text-[9px] font-bold text-slate-500 leading-none h-4 sm:h-5 flex items-center justify-end">
                {r}
              </span>
            ))}
          </div>

          {/* Matrix Board */}
          <div id="gto-matrix" className="grid grid-cols-[repeat(13,_minmax(0,_1fr))] gap-[2px] w-full aspect-square bg-[#050508] p-[3px] rounded-lg border border-white/10">
            {Array.from({ length: 13 }).map((_, row) =>
              Array.from({ length: 13 }).map((_, col) => {
                const hand = getHandFromGrid(row, col);
                const strategy = currentSituation.ranges[hand] || {
                  hand,
                  actions: { raise: 0, call: 0, fold: 100 },
                  ev: 0,
                };

                const isSelected = selectedHand?.hand === hand;
                const isBlocked =
                  viewMode === 'blockers' &&
                  !isBlockerMatch(hand, filterBlockerCard);

                // Inline Style for GTO Mixed colors
                const cellStyle: React.CSSProperties = {
                  background:
                    viewMode === 'ev'
                      ? getEvBackground(strategy)
                      : getGtoBackground(strategy),
                  opacity: isBlocked ? 0.25 : 1,
                  transition: 'opacity 0.2s ease, transform 0.1s ease',
                };

                return (
                  <button
                    key={hand}
                    onClick={() => onSelectHand(strategy)}
                    style={cellStyle}
                    className={`relative w-full aspect-square rounded-[2px] flex items-center justify-center cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105 z-10 shadow-lg shadow-black/80'
                        : 'hover:scale-[1.08] hover:ring-1 hover:ring-white/40 hover:z-10'
                    }`}
                  >
                    {/* Tiny representation text */}
                    <span className="font-mono text-[8.5px] sm:text-[10px] scale-[0.7] sm:scale-1 w-full text-center pointer-events-none font-bold select-none text-zinc-100 mix-blend-difference drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]">
                      {hand}
                    </span>
                    
                    {/* Small EV dot for outstanding visual hint */}
                    {strategy.ev > 1 && viewMode === 'gto' && (
                      <span className="absolute bottom-[1px] right-[1px] w-[3px] h-[3px] rounded-full bg-yellow-400"></span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mini Color Indicator Legend */}
      <div className="flex items-center justify-around mt-1 bg-[#0a0a10] p-2.5 rounded-lg border border-white/5 text-[10px]">
        {viewMode === 'ev' ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded bg-amber-550 bg-yellow-500"></span>
            <span className="text-slate-400 font-bold">高EV (期待値)</span>
            <span className="inline-block w-2.5 h-2.5 rounded bg-[#050508] border border-white/10 ml-3"></span>
            <span className="text-slate-400 font-bold">EV 0 / Fold</span>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-2 rounded bg-rose-500"></span>
              <span className="text-rose-450 text-rose-400 font-bold">Raise (レイズ)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-2 rounded bg-emerald-500"></span>
              <span className="text-emerald-450 text-emerald-400 font-bold">Call (コール)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-2 rounded bg-[#1e2d4d]"></span>
              <span className="text-slate-400 font-bold">Fold (フォールド)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
