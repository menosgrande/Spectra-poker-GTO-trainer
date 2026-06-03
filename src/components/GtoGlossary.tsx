import React, { useState } from 'react';
import { BookOpen, Search, ShieldCheck, Flame, Plus, Minus, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlossaryItem {
  term: string;
  kana: string;
  category: 'gto' | 'range' | 'play' | 'math';
  definition: string;
  details: string;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: "GTO (Game Theory Optimal)",
    kana: "ゲーム理論最適",
    category: "gto",
    definition: "いかなる対戦相手のプレイに対しても、理論的に搾取（攻略）されないための数学的最適解戦略。",
    details: "ポーカーソルバー（解析ソフト）によって計算された戦略です。GTOの絶対的な強みは、対戦相手がどんな達人であっても長期的には負けない（エクスプロイトされない）ことにあります。現代ポーカーの絶対的な北極星であり、ベースラインとなる戦術です。"
  },
  {
    term: "混合戦略 (Mixed Strategy)",
    kana: "こんごうせんりゃく",
    category: "gto",
    definition: "同じ手札から、複数の異なるアクション（ベット、コール、フォールド）を確率（頻度）で使い分ける高度な戦術。",
    details: "例えば、あるマージナルなハンドを100%レイズするのではなく、60%はレイズ、40%はチェックというように、確率的分散を行います。これにより、相手はあなたの手札を正確に見抜くことが完全に不可能になります。GTOの真髄です。"
  },
  {
    term: "ナッシュ均衡 (Nash Equilibrium)",
    kana: "なっしゅきんこう",
    category: "gto",
    definition: "お互いのプレイヤーが戦略を変更するインセンティブを持たない、対戦ゲームにおける究極のパワーバランス状態。",
    details: "お互いが完璧なGTOをプレイしている状態がナッシュ均衡です。もし相手がこの均衡から逸脱して極端なプレイ（ブラフしすぎ等）へ移行した場合、こちらはGTOを維持するか、あるいは相手の逸脱を咎める「エクスプロイト戦略」へと移行することで、最大の利益を回収できます。"
  },
  {
    term: "エクスプロイト (Exploit / 搾取)",
    kana: "えくすぷろいと",
    category: "gto",
    definition: "対戦相手のプレイスタイルや戦略的な偏り、ミス（リーク）を突いて、意図的に数学的限界を超えた利益を狙うアプローチ。",
    details: "GTOが「負けないための盾」なら、エクスプロイトは「相手を倒すための矛」です。例えば相手が『フォールドしすぎる』場合は、GTOの指定割合を超えて100%強気でブラフを打ち込むのが最適エクスプロイト戦術です。"
  },
  {
    term: "RFI (Raise First In / レイズ・ファーストイン)",
    kana: "れいずふぁーすといん",
    category: "play",
    definition: "プリフロップで誰もコールやレイズしていない状況において、自分が最初にレイズでポットへ参加する戦術オープンアクション。",
    details: "ポーカーのプリフロップの鉄則です。コール(Limp-In)で入るぬるい参加を避け、レイズ(RFI)で先制することで、フォールド・エクイティ（相手全員をフォールドさせて終わらせる勝率）を得ながらポットの主導権を確保できます。"
  },
  {
    term: "3-Bet (スリーベット / 再レイズ)",
    kana: "すりーべっと",
    category: "range",
    definition: "プリフロップにおける最初のレイズ（2-Bet）に対して、さらにその上へ被せる再増額アクション。",
    details: "相手のオープンを圧搾する絶対戦術です。3-Betレンジは主に「超強ハンド（AA, KK, QQ, AKsなど）」と「優れたブロッカー（相手のプレミアムハンドを減退させる効果）を持つストレート・フラッシュの素材（A5s, KTs, QJsなど）」でポラライズして構築され、相手に厳しい二者択一を迫ります。"
  },
  {
    term: "Squeeze (スクイーズ / 圧搾戦術)",
    kana: "すくいーず",
    category: "play",
    definition: "1枚のオープンレイザーと、それにコールドコールした複数(沈殿状態)のプレイヤーに対し、後方から超巨大な3-Betを打ち込んで全員を絞り出す高等戦術。",
    details: "人数が多いポットは勝率が激しく分散するため危険です。ここでSqueezeを仕掛け、中途半端な手でコールしたプレイヤーたちのフォールドを誘うことで、誰も見ていないデッドマネーをまるごと強奪します。成功率を高めるため通常より4倍〜5倍の巨大なベットサイズを叩くのが鉄則です。"
  },
  {
    term: "MDF (Minimum Defense Frequency / 最小ディフェンス頻度)",
    kana: "さいしょうでぃふぇんすひんど",
    category: "math",
    definition: "相手の狂気的なベットに対し、相手にブラフだけで自動的・無限に利益を出させないために、自陣がコールまたはレイズで死守しなければならない数学的最低割合。",
    details: "計算式は『MDF = ポット / (ポット + ベットサイズ)』です。例えば、相手が1ポットと同額（100%サイズ）のベットを放ってきた場合、自陣は最低でも上位50%のレンジを死守（Defense）しなければならず、これ以下しか守らない場合は相手がいつでも適当な2枚でベットするだけで搾取され続けてしまいます。"
  },
  {
    term: "SPR (Stack-to-Pot Ratio / スタック対ポット比率)",
    kana: "すたっくたいぽっとひりつ",
    category: "math",
    definition: "テーブル上の有効スタックサイズを、現在のポット額で割り算した比率。アクションの難易度や決着速度（コミットメント）を見極める指標。",
    details: "ポットが10ドルで有効スタックが100ドルなら SPR = 10（ディープで複雑な3D混合戦略が必要）。逆に、ポットが40ドルでスタックが40ドルなら SPR = 1。この場合は完全にコミット（Fold不可）しており、チェックレイズや全額投入などの非常にシンプルな単線的判断のみで決着をつけます。"
  },
  {
    term: "Float (フロート / 空中戦術)",
    kana: "ふろーと",
    category: "play",
    definition: "フロップで相手の強気なC-Betに対し、現時点では弱い役（あるいはハイカードのみ）のままコールだけで耐え、ターン移行時の相手のチェックを合図にポットを強奪するブラフ戦術。",
    details: "単なる『お祈りコール』ではなく、相手レンジの弱みを看破し、ターンやリバーで相手の弾薬が切れるタイミングをあらかじめ逆算してコールで浮遊（Float）する、極めてロジカルかつポストフロップのプレイアビリティを重視したGTOプロ戦術です。"
  },
  {
    term: "C-bet (Continuation Bet)",
    kana: "こんてぃにゅえーしょんべっと",
    category: "play",
    definition: "プリフロップで最後に強気なレイズで主導権を握ったアグレッサー側が、フロップでも手を緩めずに連続してベットを打ち込む戦術。",
    details: "主導権レンジが持つ圧倒的優位をそのまま引き継ぎ、相手にチェック・フォールドを迫る主要兵器です。レインボーで単切りのドライボードでは100%全レンジで安価に打つのが有効（高頻度C-Bet）で、逆にドローまみれの危険なウェットボードでは、チェックを大量に混ぜてレンジの崩壊を防ぐのがGTOの鉄則です。"
  },
  {
    term: "Merged Range (マージレンジ / 統合レンジ)",
    kana: "まーじれんじ",
    category: "range",
    definition: "自分の強弱（バリューと完全ブラフ）に二分するのではなく、中強度のマージナルハンド（ミドルペア等）を境界なく厚く織り交ぜて構成した強固なベットレンジ。",
    details: "相手の弱いペアを根こそぎ刈り取り、安易なチェックバックをさせないために活用されます。ウェットボードでの探査時や、ドンクベット戦略の基礎、あるいは相手が『コールしすぎる』コールパッシブのときにマージレンジで薄いベットを打ち続けるエクスプロイトが劇的な利益を生みます。"
  },
  {
    term: "レンジ (Hand Range)",
    kana: "ハンドレンジ",
    category: "range",
    definition: "特定のシチュエーションにおいて、プレイヤーが絶対に持ち得ると仮定される、全スターティングカードの束（組み合わせの総数）。",
    details: "ポーカーは自分の単一の『2枚の手札』だけで戦うものではありません。お互いが持っている可能性全体のスペクトル（13×13の169通り、1326通りコンボの実体）がどのようにボードと激突しているかを競うレンジ対レンジの戦争です。この感覚を脳裏に叩き込むのがSPECTRAのヒートマップです。"
  },
  {
    term: "レンジアドバンテージ (Range Advantage)",
    kana: "れんじあどばんてーじ",
    category: "range",
    definition: "自分のレンジ全体が、対戦相手のレンジ全体に対して、勝率（エクイティ）で統計的・圧倒的に優っている最強の状態。",
    details: "プリフロップで先にRFIを実行したプレイヤーは、常にレンジの上位（AA, KK, QQ, AKsなど）を100%保有しているため、高カードが多く落ちたボードでは無条件にこの優位が発動。相手はどれほど強い手を持っていようと、レンジ全体の勝率で押されているため極めて慎重なプレイ（チェック中心）を強制されます。"
  },
  {
    term: "ナッツアドバンテージ (Nuts Advantage)",
    kana: "なっつあどばんてーじ",
    category: "range",
    definition: "自陣のレンジ内に、勝率80%〜100%に属するスーパーモンスターハンド（セット、ストレート、フルハウス等）を、相手より圧倒的に豊かな確率で忍ばせている優位性。",
    details: "たとえレンジ全体の平均勝率（レンジアドバンテージ）が低くとも、このナッツアドバンテージを豊富に持つ側は、ポットを爆発的に膨らませる『オーバーベット（ポットの1.5x〜3xサイズ）』を合法的に打ち込む権利を手にします。相手はドローや並の1ペアでコールすることが絶対に不可能になります。"
  },
  {
    term: "ポラライズ (Polarized)",
    kana: "ぽららいず",
    category: "range",
    definition: "ベットレンジの構成を、『最高峰の超強手（バリュー）』と『完全なゴミ（ブラフ）』の二極端に完全に分離し、中間の強さ（1ペア等）を絶対にベットに入れない戦略。",
    details: "主にドロー完成後のリバーでのビックベットなどで採用されます。中程度の強さ（マージナルハンド）はベットしても、それより強い手にはコールされ、弱い手にはフォールドされるため、ベットによるメリットがありません。そのため、中程度の強さの手はすべてチェックレンジ（Showdown Value）へと回します。"
  }
];

const CATEGORY_MAP = {
  all: "すべて",
  gto: "GTO基礎",
  range: "レンジ / 優位性",
  play: "実戦ハイ戦術",
  math: "確率 / 数学"
};

export default function GtoGlossary() {
  const [activeViewTab, setActiveViewTab] = useState<'glossary' | 'tactical-heuristics'>('glossary');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'gto' | 'range' | 'play' | 'math'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredItems = GLOSSARY_ITEMS.filter(item => {
    const matchesCategory = activeCategoryTab === 'all' || item.category === activeCategoryTab;
    const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.kana.includes(searchQuery) ||
                          item.definition.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto p-4 bg-[#08080c] border border-white/10 rounded-xl shadow-2xl">
      
      {/* Search Header */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <BookOpen className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
        <h3 className="text-sm font-bold text-white tracking-tight">GTO特訓 ＆ 実戦応用コックピット</h3>
      </div>

      {/* Main Tab Switcher */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#050508] border border-white/5 rounded-lg">
        <button
          onClick={() => setActiveViewTab('glossary')}
          className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-all cursor-pointer flex flex-col items-center gap-1 justify-center ${
            activeViewTab === 'glossary'
              ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 font-extrabold text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5 animate-pulse" />
          <span>ポーカー用語サーチ</span>
        </button>

        <button
          onClick={() => setActiveViewTab('tactical-heuristics')}
          className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-all cursor-pointer flex flex-col items-center gap-1 justify-center ${
            activeViewTab === 'tactical-heuristics'
              ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 font-extrabold text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>実戦GTO戦術ガイド</span>
        </button>
      </div>

      {/* View 1: Tactical Heuristics Guide */}
      {activeViewTab === 'tactical-heuristics' && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3.5"
        >
          <div className="p-3 bg-gradient-to-br from-indigo-950/40 to-[#08080c] border border-indigo-500/20 rounded-lg space-y-1">
            <span className="text-[10px] text-indigo-400 font-mono font-black uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> MASTER TACTICS
            </span>
            <h4 className="text-xs font-bold text-slate-100">
              実戦で勝率を120%に激変させる「GTO行動ヒューリスティクス」
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal font-sans font-medium">
              複雑な計算式を知らなくても、GTOの「大原則」を2つ覚えるだけで、実戦テーブルでの致命傷をゼロに抑えて利益を最大化できます。
            </p>
          </div>

          <div className="space-y-3 p-3 bg-black/40 border border-white/5 rounded-lg">
            <div className="flex gap-2 items-start">
              <span className="px-1 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono font-black text-[10px] shrink-0">
                兵則 01
              </span>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-200 text-xs">ドライボードは「広く・超小さく」C-Betを打て</h5>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed font-sans">
                  ボードが「K♦ 7♣ 2♠」のように、ドロー（ストレート・フラッシュ）の気配が皆無な「ドライボード」では、プリフロップ・アグレッサー（あなた）に<strong>100%に近いレンジ有利</strong>が存在します。 
                  相手はヒットしていなければ絶対に降りるほかありません。したがって、ここでの最適GTOは「25%ポットなどの<strong>極小サイズで、持っている全カード無差別にベットを打つ</strong>」ことです。相手は少しでも浮いている手を大量に捨てさせられます。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-3 bg-black/40 border border-white/5 rounded-lg">
            <div className="flex gap-2 items-start">
              <span className="px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono font-black text-[10px] shrink-0">
                兵則 02
              </span>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-200 text-xs">ウェットボードは「チェック」を高頻度で混ぜ、打つ時は「巨大」にしろ</h5>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed font-sans">
                  ボードが「Q♥ J♥ T♦」などの、少しズレれば即ストレートやフラッシュが乱舞する「危険なウェットボード」では、相手（ディフェンダー）のコールドコールレンジ（中低位の接続カード）に著しく有利に機能します。
                  安易なC-Betを打つと相手のモンスター手にカウンター・チェックレイズを食らい、一気に致命傷になります。
                  したがって、ここでは<strong>「チェック」を高頻度で引き、中程度の強さ（1ペア等）を守り、打つときはセットや強ドローを絞り「オーバーベットに近いサイズで巨大に極限圧力をかける」</strong>のがGTOのポラライズ最適解です。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-3 bg-[#0a100f] border border-emerald-500/10 rounded-lg">
            <div className="flex gap-2 items-start">
              <span className="px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-black text-[10px] shrink-0">
                兵則 03
              </span>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-200 text-xs">SPR（スタックポット比）を見て「決着ライン」を即決せよ</h5>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed font-sans text-slate-300">
                  ポットサイズと自分の残りスタックの比が <strong>SPR</strong> です。SPRが約 <strong>3以下</strong>（マルチウェイや3Betポット等）と極めて小さくなった時、すでにポットに対してスタックが「コミット」されています。
                  この状況下では、ターンやリバーでの細かなGTOブラフ空中戦は消滅します。ドローからでも、トップペアのキッカー弱からでも、迷わずオールインまたはチェックコールの二択へ移行し、全チップを入れ合う覚悟を持つのが正しい単純戦法です。
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* View 2: Search Terms list */}
      {activeViewTab === 'glossary' && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Search Bar Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="GTO語、RFI、MDF、かな等で検索..."
              className="w-full bg-[#050508] border border-white/10 focus:border-purple-500 focus:outline-none rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 font-bold font-sans"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* Filters selectors Row */}
          <div className="flex flex-wrap gap-1">
            {(Object.keys(CATEGORY_MAP) as ('all' | 'gto' | 'range' | 'play' | 'math')[]).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategoryTab(cat);
                  setExpandedIndex(null);
                }}
                className={`px-2 py-0.8 text-[9px] sm:text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  activeCategoryTab === cat
                    ? 'bg-purple-600 font-extrabold text-white shadow'
                    : 'bg-[#0a0a10] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {CATEGORY_MAP[cat]}
              </button>
            ))}
          </div>

          {/* Terminology list */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="text-center p-6 bg-[#050508]/10 border border-dashed border-white/5 rounded text-slate-500 text-xs font-sans">
                該当する用語が見つかりません。検索条件を変更してください。
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                const categoryAccentClass = 
                  item.category === 'gto' ? 'border-purple-500/20 text-purple-400 bg-purple-500/5' :
                  item.category === 'range' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' :
                  item.category === 'play' ? 'border-amber-500/20 text-amber-400 bg-amber-500/5' :
                  'border-emerald-500/20 text-emerald-400 bg-emerald-500/5';

                return (
                  <div
                    key={idx}
                    className="bg-[#0a0a10] border border-white/5 hover:border-white/10 rounded-lg overflow-hidden transition-all"
                  >
                    {/* Term title bar */}
                    <div
                      onClick={() => toggleExpand(idx)}
                      className="p-2.5 flex justify-between items-center cursor-pointer select-none active:bg-white/5"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-200 tracking-tight font-sans">
                            {item.term}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[8px] font-mono uppercase font-black tracking-widest rounded border ${categoryAccentClass}`}>
                            {CATEGORY_MAP[item.category]}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold font-sans">{item.kana}</span>
                      </div>

                      <div>
                        {isExpanded ? (
                          <Minus className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                          <Plus className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Sub definition preview line */}
                    {!isExpanded && (
                      <div className="px-2.5 pb-2.5 pt-0">
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium line-clamp-1">
                          {item.definition}
                        </p>
                      </div>
                    )}

                    {/* Extended Details card */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-white/5 bg-[#050508]/80 text-[11px] leading-relaxed p-3 space-y-2 font-sans"
                        >
                          <div className="flex gap-2">
                            <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-slate-200 font-semibold">{item.definition}</p>
                          </div>

                          <div className="bg-black/40 border border-white/5 rounded p-2.5 text-[11px] text-slate-400 font-medium leading-relaxed">
                            {item.details}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      <div className="bg-[#050508] border border-white/5 p-2 rounded-lg text-[9px] text-slate-500 font-mono text-center block uppercase tracking-widest leading-relaxed">
        ● SPECTRA TACTICAL GLOSSARY v3.0 — OFFLINE LOAD COMPLETE
      </div>

    </div>
  );
}
