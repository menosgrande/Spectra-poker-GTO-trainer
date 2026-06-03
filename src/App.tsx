import React, { useState, useEffect } from 'react';
import GtoHeader from './components/GtoHeader';
import RangeMatrix from './components/RangeMatrix';
import HandInspector from './components/HandInspector';
import RangeMatrixGuide from './components/RangeMatrixGuide';
import GtoTrainer from './components/GtoTrainer';
import GtoGlossary from './components/GtoGlossary';
import ScenarioHistory from './components/ScenarioHistory';
import BoardAnalyzer from './components/BoardAnalyzer';
import { SITUATIONS } from './data/rangeData';
import { Situation, HandStrategy, SavedScenario } from './types';
import { Landmark } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [currentSituation, setCurrentSituation] = useState<Situation>(SITUATIONS[0]);
  const [selectedHand, setSelectedHand] = useState<HandStrategy | null>(null);
  const [activeTab, setActiveTab] = useState<'viewer' | 'trainer' | 'glossary' | 'memo' | 'board'>('viewer');
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);

  // Load scenarios on mount from localStorage
  useEffect(() => {
    const localData = localStorage.getItem('spectra_saved_scenarios');
    if (localData) {
      setScenarios(JSON.parse(localData));
    } else {
      const defaults: SavedScenario[] = [
        {
          id: 'def-1',
          title: '3Betブラフのターゲット (A5s / K9s)',
          notes: 'BTNのオープンに対してBBからA5sを3Betする理由：相手のエース(A)コンボ数を減らすBlockerを持っており、フォールドエクイティが最も稼げる。バリュー3bet(AA, KK)の偏りを中和する最高のブラフ役。',
          createdAt: '2026-06-01',
        },
        {
          id: 'def-2',
          title: '40BB SB Limp-In 混合について',
          notes: 'SBはBBが非常にアグレッシブに3betシャブ(オールイン)してくるのを牽制するため、ナッツハンド(AA, KK)と中軸のスーテッド(KTs)を同じLimp-In(Call)レンジに混合して防御全体をLinear(線形)に整える必要がある。',
          createdAt: '2026-05-31',
        }
      ];
      setScenarios(defaults);
      localStorage.setItem('spectra_saved_scenarios', JSON.stringify(defaults));
    }
  }, []);

  // Shared function to save or update scenario notes
  const handleSaveScenario = (title: string, notesStr: string) => {
    const existingIndex = scenarios.findIndex(s => s.title === title);
    let updated: SavedScenario[];
    if (existingIndex !== -1) {
      updated = [...scenarios];
      updated[existingIndex] = {
        ...updated[existingIndex],
        notes: notesStr,
        createdAt: new Date().toISOString().split('T')[0]
      };
    } else {
      const newScenario: SavedScenario = {
        id: 'sc-' + Date.now(),
        title,
        notes: notesStr.trim(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      updated = [newScenario, ...scenarios];
    }
    setScenarios(updated);
    localStorage.setItem('spectra_saved_scenarios', JSON.stringify(updated));
  };

  const handleDeleteScenario = (id: string) => {
    const updated = scenarios.filter((s) => s.id !== id);
    setScenarios(updated);
    localStorage.setItem('spectra_saved_scenarios', JSON.stringify(updated));
  };

  // Handle hand selection on the matrix board
  const handleSelectHand = (strategy: HandStrategy) => {
    setSelectedHand(strategy);
  };

  // Safe fallback dummy / logs for legacy references
  const handleConsultAiFromHand = (hand: string) => {
    console.log(`Analyzing hand: ${hand} for situation: ${currentSituation.name}`);
    setActiveTab('glossary'); // Guide users to glossary to read terminology
  };

  const handleLoadScenarioNotes = (notes: string) => {
    console.log("Loading self-study notes: ", notes);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Dynamic Global Custom Header */}
      <GtoHeader
        situations={SITUATIONS}
        currentSituation={currentSituation}
        onSelectSituation={(sit) => {
          setCurrentSituation(sit);
          setSelectedHand(null); // Clear selected hand for smooth switch
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Client Content Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {activeTab === 'viewer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Side: 13x13 Range Matrix */}
            <div className="lg:col-span-7 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <RangeMatrix
                  currentSituation={currentSituation}
                  selectedHand={selectedHand}
                  onSelectHand={handleSelectHand}
                />
              </motion.div>
            </div>

            {/* Right Side: Inspector View */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <motion.div
                key={selectedHand ? selectedHand.hand : 'generic'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HandInspector
                  selectedHand={selectedHand}
                  currentSituation={currentSituation}
                  scenarios={scenarios}
                  onSaveScenario={handleSaveScenario}
                  onConsultAi={handleConsultAiFromHand}
                  onSwitchToMemoTab={() => setActiveTab('memo')}
                />
              </motion.div>

              {/* Dynamic 13x13 Range Matrix Guide */}
              <RangeMatrixGuide />
            </div>

          </div>
        )}

        {activeTab === 'trainer' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <GtoTrainer />
          </motion.div>
        )}

        {activeTab === 'board' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <BoardAnalyzer />
          </motion.div>
        )}

        {activeTab === 'glossary' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <GtoGlossary />
          </motion.div>
        )}

        {activeTab === 'memo' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <ScenarioHistory
              currentScenarioTitle={currentSituation.name}
              scenarios={scenarios}
              onSaveScenario={handleSaveScenario}
              onDeleteScenario={handleDeleteScenario}
              onLoadScenarioNotes={handleLoadScenarioNotes}
            />
          </motion.div>
        )}
      </main>

      {/* Humble Footer */}
      <footer className="py-5 border-t border-white/5 bg-[#050508] text-center text-[10px] text-slate-600 font-mono tracking-widest uppercase font-bold">
        SPECTRA MOBILE • OPTIMAL HAND RANGE VIEWER • POWERED BY GEMINI 1.5
      </footer>
    </div>
  );
}
