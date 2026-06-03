import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RangeMatrixGuide() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<'structure' | 'colors'>('structure');

  return (
    <div className="bg-[#08080c] border border-white/10 rounded-xl overflow-hidden shadow-xl transition-all">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3.5 bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border-b border-white/5 flex justify-between items-center cursor-pointer select-none hover:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
            13×13 レンジ表の超実践的な読み方
            <span className="px-1.5 py-0.2 text-[8px] bg-purple-500/20 text-purple-300 font-mono font-black uppercase rounded border border-purple-500/30">
              GUIDE
            </span>
          </h4>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 space-y-3.5"
          >
            {/* Guide tabs */}
            <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#050508] border border-white/5 rounded-lg">
              <button
                onClick={() => setActiveSection('structure')}
                className={`py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  activeSection === 'structure'
                    ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 font-extrabold text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                碁盤の構造 (AA〜22s)
              </button>
              <button
                onClick={() => setActiveSection('colors')}
                className={`py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  activeSection === 'colors'
                    ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 font-extrabold text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                GTO色彩コードの意味
              </button>
            </div>

            {activeSection === 'structure' ? (
              <div className="space-y-3 text-[11px] leading-relaxed">
                <div className="p-2.5 bg-[#040406] border border-purple-500/10 rounded-lg">
                  <span className="text-[10px] text-purple-400 font-mono font-black uppercase tracking-wider block mb-1">
                    Lesson 01: 169通りの碁盤レイアウト
                  </span>
                  <p className="text-slate-405 text-slate-400 font-medium">
                    ポーカーのスターティングハンドをスート（絵柄）を省き169通りに抽象化したものがこの13×13マトリクスです。以下の<strong>3つのエリア</strong>を覚えるだけで、相手のレンジを立体的に把握できます。
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-slate-200">① 対角線（斜めのライン / ポケットペア AA〜22）</strong>
                      <p className="text-slate-400 font-medium leading-normal">
                        左上（A）から右下（2）へ斜めに貫くマスは「同じ数字のペア（AA, KK, QQ...）」です。スート（絵柄）を考慮しない全6コンボの束であり、ポーカーで最も強固な骨組みです。
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-slate-200">② 右上エリア（スーテッド / Suited [s]）</strong>
                      <p className="text-slate-400 font-medium leading-normal">
                        対角線の右上側は、スートが同じ2枚のハンド（例: <span className="text-rose-400 font-bold">AKs, QJs</span>）です。フラッシュに発展しやすいため、投機的でありながらGTOでも極めて高い参加率（緑・赤の高密度）を維持します。
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-slate-200">③ 左下エリア（オフスーテッド / Offsuit [o]）</strong>
                      <p className="text-slate-400 font-medium leading-normal">
                        対角線の左下側は、スートが異なる2枚のハンド（例: <span className="text-slate-300 font-bold">AKo, JTo</span>）です。フラッシュになる可能性が非常に低いため、GTOソルバーはスーテッドに比べて大幅に参加頻度を落とし、フォールド（青）を指示します。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 font-sans">
                <div className="p-2.5 bg-[#040406] border border-indigo-500/10 rounded-lg">
                  <span className="text-[10px] text-indigo-400 font-mono font-black uppercase tracking-wider block mb-1">
                    Lesson 02: 混合戦略（Mixed Strategy）のシグナル
                  </span>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    GTOは同じ手札でも、毎回同一の行動を取るのではなく、確率（頻度）でアクションを分散させます（例: 70% Bet / 30% Check）。
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-[#0c0a0d] border border-rose-500/10 rounded">
                    <span className="text-rose-451 text-rose-400 font-black block tracking-wider mb-1">■ 赤（Raise / Bet）</span>
                    <span className="text-slate-450 text-slate-400 font-medium leading-relaxed block">
                      レイズや強烈なベット。怪物ハンドや、相手のブロックを誘う強力なブラフに使われます。
                    </span>
                  </div>
                  <div className="p-2 bg-[#090c0d] border border-emerald-500/10 rounded">
                    <span className="text-emerald-451 text-emerald-400 font-black block tracking-wider mb-1">■ 緑（Call）</span>
                    <span className="text-slate-450 text-slate-400 font-medium leading-relaxed block">
                      コール、またはリンプイン（SB等）。様子見しつつ発展期待値（EV）を残すポラライズ前のマージナルハンド。
                    </span>
                  </div>
                  <div className="p-2 bg-[#0a0d16] border border-blue-500/20 rounded">
                    <span className="text-blue-451 text-blue-400 font-black block tracking-wider mb-1">■ 青〜黒（Fold）</span>
                    <span className="text-slate-450 text-slate-400 font-medium leading-relaxed block">
                      フォールド。期待値が常にマイナスとなる回収不可能なスクラップハンド群。
                    </span>
                  </div>
                  <div className="p-2 bg-[#0b0a10] border border-purple-500/15 rounded">
                    <span className="text-purple-451 text-purple-400 font-black block tracking-wider mb-1">■ 混合ストライプ</span>
                    <span className="text-slate-450 text-slate-400 font-medium leading-relaxed block">
                      混合アクション。RNG（乱数）テーブルに基づいて比率通りに確率混合する、プロレベルの難解防衛ライン。
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
