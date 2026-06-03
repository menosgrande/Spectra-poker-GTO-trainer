import React, { useState } from 'react';
import { SavedScenario } from '../types';
import { BookOpen, Plus, Trash2, Calendar, FileText, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ScenarioHistoryProps {
  currentScenarioTitle: string;
  scenarios: SavedScenario[];
  onSaveScenario: (title: string, notesStr: string) => void;
  onDeleteScenario: (id: string) => void;
  onLoadScenarioNotes: (notes: string) => void;
}

export default function ScenarioHistory({
  currentScenarioTitle,
  scenarios,
  onSaveScenario,
  onDeleteScenario,
  onLoadScenarioNotes,
}: ScenarioHistoryProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    const activeTitle = title.trim() || `${currentScenarioTitle}に関するメモ`;
    if (!notes.trim()) return;

    onSaveScenario(activeTitle, notes.trim());

    // Reset inputs
    setTitle('');
    setNotes('');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteScenario(id);
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto p-4 bg-[#08080c] border border-white/10 rounded-xl shadow-2xl">
      
      {/* Mini Title */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <BookOpen className="w-4.5 h-4.5 text-purple-400" />
        <h3 className="text-sm font-bold text-white tracking-tight">GTO自習メモ ＆ 実戦課題ログ</h3>
      </div>

      {/* Editor to insert new notes */}
      <div className="bg-[#0a0a10] border border-white/5 p-3.5 rounded-lg space-y-3">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">自習ノートを残す</span>
        
        <div>
          <input
            id="memo-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`メモのタイトル (デフォルト: ${currentScenarioTitle}...)`}
            className="w-full bg-[#050508] border border-white/10 focus:border-purple-500 focus:outline-none rounded p-2 text-xs text-white placeholder-slate-600 font-bold"
          />
        </div>

        <div>
          <textarea
            id="memo-desc-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="実戦で迷ったハンド、GTOと自分のプレイの乖離、AIのアドバイス要約、次回のアクションなどを書き残してください..."
            rows={3}
            className="w-full bg-[#050508] border border-white/10 focus:border-purple-500 focus:outline-none rounded p-2 text-xs text-white placeholder-slate-600 font-medium leading-relaxed"
          />
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-[10px] text-slate-500 font-mono italic">
            * 端末(localStorage)に安全に保存されます
          </span>
          <button
            id="save-memo-btn"
            onClick={handleSave}
            disabled={!notes.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs rounded transition-all cursor-pointer shadow-md shadow-black"
          >
            {saveSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>保存完了</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>自習ノートを保存</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Saved scenarios timeline list */}
      <div className="space-y-2.5 mt-1">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">保存された虎の巻一覧 ({scenarios.length})</span>
        
        {scenarios.length === 0 ? (
          <div className="text-center p-6 bg-[#050508]/10 border border-dashed border-white/5 rounded text-slate-500 text-xs">
            自習メモはまだありません。上記のフォームに入力して追加してください。
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={() => onLoadScenarioNotes(sc.notes)}
                className="group relative flex flex-col gap-1.5 p-3 bg-[#0a0a10] border border-white/5 hover:border-white/10 hover:bg-[#0e0e16] rounded-lg cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-purple-400 transition-colors flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> {sc.title}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-500 font-mono flex items-center gap-0.5 font-bold">
                       <Calendar className="w-3 h-3" /> {sc.createdAt}
                    </span>
                    <button
                      onClick={(e) => handleDelete(sc.id, e)}
                      className="text-slate-600 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                      title="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium line-clamp-2">
                  {sc.notes}
                </p>

                <div className="text-[9px] text-purple-400/80 group-hover:text-purple-400 text-right font-extrabold transition-colors flex items-center justify-end gap-0.5 mt-0.5">
                  <span>このノートを着眼/コピー</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
