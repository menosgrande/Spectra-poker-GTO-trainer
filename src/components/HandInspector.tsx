import React, { useState, useEffect } from 'react';
import { HandStrategy, Situation, SavedScenario } from '../types';
import { MessageSquare, Info, Percent, Save, CheckCircle2, ChevronRight, NotebookPen, History } from 'lucide-react';
import { motion } from 'motion/react';

interface HandInspectorProps {
  selectedHand: HandStrategy | null;
  currentSituation: Situation;
  scenarios: SavedScenario[];
  onSaveScenario: (title: string, notesStr: string) => void;
  onConsultAi: (hand: string) => void;
  onSwitchToMemoTab: () => void;
}

export default function HandInspector({
  selectedHand,
  currentSituation,
  scenarios,
  onSaveScenario,
  onConsultAi,
  onSwitchToMemoTab,
}: HandInspectorProps) {
  const [memoText, setMemoText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // If selectedHand is null, render empty state
  if (!selectedHand) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-8 bg-[#08080c]/40 text-center min-h-[220px]">
        <Info className="w-8 h-8 text-slate-500 mb-2" />
        <p className="text-slate-300 font-bold text-sm">ハンドをタップしてください</p>
        <p className="text-slate-400 text-xs mt-1 max-w-[280px] font-medium leading-relaxed">
          13x13マトリクスの任意のハンドをタップすると、GTO混合アクション頻度とEV（期待値）が拡大表示されます。
        </p>
      </div>
    );
  }

  const { hand, actions, ev, advice } = selectedHand;
  const isSuited = hand.endsWith('s');
  const isOffsuited = hand.endsWith('o');
  const isPair = !isSuited && !isOffsuited;

  // Calculate combo counts for professional poker theoretical feel
  let combos = 6;
  if (isSuited) combos = 4;
  if (isOffsuited) combos = 12;

  // Generate default title for this specific hand context
  const noteTitleForContext = `${hand} - ${currentSituation.name} 考察`;

  // Find notes that match this hand and situation
  const relevantNotes = scenarios.filter(s => 
    s.title.includes(hand) && 
    (s.title.includes(currentSituation.name) || s.notes.includes(currentSituation.name))
  );

  // Sync textbox state with the first matching note on hand change, or empty it
  useEffect(() => {
    if (relevantNotes.length > 0) {
      setMemoText(relevantNotes[0].notes);
    } else {
      setMemoText('');
    }
    setSaveSuccess(false);
  }, [hand, currentSituation.name, scenarios.length]);

  const handleSaveMemo = () => {
    if (!memoText.trim()) return;
    onSaveScenario(noteTitleForContext, memoText.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  // Represent beautifully with suits decoration
  const getSuitsDecoration = () => {
    if (isPair) {
      return (
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
          <span>♠️♥️</span>
          <span>♣️♦️</span>
          <span className="font-mono text-[9px] text-slate-500 ml-1">({combos} Combos)</span>
        </div>
      );
    } else if (isSuited) {
      return (
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-450 text-emerald-400">
          <span>♠️♠️</span>
          <span className="font-mono text-[9px] text-emerald-500 ml-1">({combos} Combos / Same Suit)</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-450 text-rose-400">
          <span>♠️♥️</span>
          <span className="font-mono text-[9px] text-rose-500 ml-1">({combos} Combos / Offsuit)</span>
        </div>
      );
    }
  };

  return (
    <div className="bg-[#08080c] border border-white/10 p-4 rounded-xl flex flex-col gap-4 w-full shadow-2xl">
      {/* Top Identity Segment */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {/* Big Hand Box */}
          <div className="relative w-14 h-14 rounded-lg bg-[#050508] flex flex-col justify-center items-center border border-white/10 shadow-inner">
            <span className="font-mono text-xl font-black text-white">{hand}</span>
            <span className="text-[8px] font-bold text-slate-500 font-mono absolute bottom-1">
              {isSuited ? 'SUITED' : isPair ? 'PAIR' : 'OFFSUIT'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-mono tracking-widest uppercase font-bold">コンビネーション :</span>
            </div>
            {getSuitsDecoration()}
            {/* EV Display */}
            <div className="flex items-baseline mt-1 gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">期待値 (EV):</span>
              <span className={`font-mono text-sm font-bold ${ev > 0 ? 'text-yellow-400' : 'text-slate-400'}`}>
                {ev > 0 ? `+${ev.toFixed(2)}` : ev === 0 ? '0.00' : ev.toFixed(2)} BB
              </span>
            </div>
          </div>
        </div>

        {/* AI Consultation Prompt Trigger */}
        <button
          onClick={() => onConsultAi(hand)}
          className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-600 hover:text-white transition-all cursor-pointer shadow-md shadow-black"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>AIに戦術相談</span>
        </button>
      </div>

      {/* Probability bar splits */}
      <div className="bg-[#050508] border border-white/5 p-3 rounded-lg flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
          <span>GTO 混合戦略比率</span>
          <Percent className="w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* Visual Percentage splits */}
        <div className="flex h-3 w-full bg-[#1e2d4d]/30 rounded-full overflow-hidden">
          <div
            style={{ width: `${actions.raise}%` }}
            className="h-full bg-rose-500 opacity-90"
          ></div>
          <div
            style={{ width: `${actions.call}%` }}
            className="h-full bg-emerald-500 opacity-90"
          ></div>
          <div
            style={{ width: `${actions.fold}%` }}
            className="h-full bg-[#1e2d4d]"
          ></div>
        </div>

        {/* Detailed action numbers */}
        <div className="grid grid-cols-3 text-center gap-1.5 text-[11px] font-mono font-bold mt-1">
          <div className="bg-rose-950/10 text-rose-400 p-1.5 rounded border border-rose-900/10">
            <div className="text-[10px] text-rose-500 font-bold mb-0.5">Raise (Bet)</div>
            <div className="text-xs font-bold">{actions.raise.toFixed(0)}%</div>
          </div>
          <div className="bg-emerald-950/10 text-emerald-400 p-1.5 rounded border border-emerald-900/10">
            <div className="text-[10px] text-emerald-500 font-bold mb-0.5">Call (Limp)</div>
            <div className="text-xs font-bold">{actions.call.toFixed(0)}%</div>
          </div>
          <div className="bg-[#1e2d4d]/10 text-slate-300 p-1.5 rounded border border-white/5">
            <div className="text-[10px] text-slate-500 font-bold mb-0.5">Fold</div>
            <div className="text-xs font-bold">{actions.fold.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Standard strategic advice text */}
      <div className="flex gap-2 bg-[#050508]/50 p-2.5 rounded-lg border border-white/5 text-xs text-slate-300 leading-relaxed font-medium">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>{advice}</p>
      </div>

      {/* Inline Memo Interface Section */}
      <div className="border-t border-white/10 pt-3 flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <NotebookPen className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white">ハンド解説メモ & 自分の癖を記録</span>
          </div>
          {relevantNotes.length > 0 && (
            <span className="text-[9px] font-extrabold text-amber-450 text-amber-400 flex items-center gap-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              <History className="w-3 h-3" /> 保存済み
            </span>
          )}
        </div>

        <textarea
          id="hand-memo-textarea"
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          placeholder="実戦での癖、レンジのズレ、独自の対戦相手ノート書き込みなど..."
          rows={2}
          className="w-full bg-[#050508] border border-white/10 focus:border-purple-500 focus:outline-none rounded p-2 text-xs text-slate-200 placeholder-slate-600 font-medium leading-relaxed"
        />

        <div className="flex justify-between items-center">
          <button
            id="hand-memo-view-all-btn"
            onClick={onSwitchToMemoTab}
            className="text-[10px] text-slate-400 hover:text-purple-400 font-bold transition-all flex items-center gap-0.5"
          >
            <span>すべてのメモを見る ({scenarios.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            id="hand-memo-save-btn"
            onClick={handleSaveMemo}
            disabled={!memoText.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/25 hover:bg-purple-600 hover:text-white disabled:opacity-40 select-none cursor-pointer transition-all active:scale-95 shadow"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>保存しました!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>クイック保存</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
