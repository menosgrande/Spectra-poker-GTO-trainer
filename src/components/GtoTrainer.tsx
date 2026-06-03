import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { QUIZ_QUESTIONS } from '../data/rangeData';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  HelpCircle, 
  Layers, 
  Swords, 
  BookOpen, 
  User, 
  Coins, 
  RotateCcw,
  Volume2,
  Save,
  Undo2,
  Trash2,
  Heart,
  Check,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pre-coded high-fidelity interactive game hands
interface GameDecision {
  street: 'Preflop' | 'Flop' | 'Turn' | 'River';
  board: string[];
  pot: number;
  opponentAction: string;
  precedingHistory: string;
  options: {
    Raise: { label: string; ev: number; correct: boolean; explanation: string; nextStackHero: number; nextPot: number };
    Call: { label: string; ev: number; correct: boolean; explanation: string; nextStackHero: number; nextPot: number };
    Fold: { label: string; ev: number; correct: boolean; explanation: string; nextStackHero: number; nextPot: number };
  };
}

interface GameHand {
  id: number;
  title: string;
  heroHand: string;
  opponentHand: string;
  heroPosition: string;
  opponentPosition: string;
  stackDepth: string;
  decisions: GameDecision[];
  winAmount: number; // BB won if optimal
  showdownWinner?: 'hero' | 'opponent' | 'fold';
}

const LIVE_GAME_HANDS: GameHand[] = [
  {
    id: 1,
    title: "AA - 乾いたAハイボードでのバリュー最大抽出",
    heroHand: "Ah Ad",
    opponentHand: "Ac Qs",
    heroPosition: "BTN",
    opponentPosition: "BB",
    stackDepth: "100BB",
    winAmount: 29.5,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "ブラインドを投稿。SBとBBフォールド、手番がBTNのあなたに回りました。",
        precedingHistory: "【プリフロップ】スタック深度：100BB。あなたの手札はポケットエース(Ah Ad)。",
        options: {
          Raise: {
            label: "2.5BBにオープンレイズ",
            ev: 1.50,
            correct: true,
            explanation: "【GTO正解！】AAはプリフロップで100%オープンレイズします！コール(リンプ)はBBにフリーロール(無料カード)を与え、せっかくの最強ハンドでのバリューを奪う大ミスになります。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Call: {
            label: "1.0BBでコール (リンプ)",
            ev: 0.20,
            correct: false,
            explanation: "【GTOエラー(-0.50BB)】100BBでAAをリンプインするのは大きなバリュー漏らしです。相手に安価なストレート・フラッシュ成立機会を与えてしまいます。",
            nextStackHero: 99.0,
            nextPot: 2.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【大エラー】AAをプリプロップでフォールドするのは深刻な損害です！絶対にあり得ません。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["As", "8d", "3c"],
        pot: 5.5,
        opponentAction: "BTNレイズにBBコール。フロップ[A♠ 8♦ 3♣]で、相手(BB)は「チェック」しました。",
        precedingHistory: "【プリフロップ】あなたは2.5BBレイズ、BBコール。ポット: 5.5BB。",
        options: {
          Raise: {
            label: "1.8BBベット (1/3ポット)",
            ev: 2.20,
            correct: true,
            explanation: "【GTO正解！】Aハイの乾いた(ドライな)ボードでのトップセット(A-A-A)は、BBの弱いペアやハイカードを引き留めるために、小型の「1/3ポットベット」がGTO推奨です。これにより相手は広くコールします。",
            nextStackHero: 95.7,
            nextPot: 9.1
          },
          Call: {
            label: "チェックバック (ポットコントロール)",
            ev: 1.80,
            correct: false,
            explanation: "【マージナル：EV減衰】バリューを失わないために小型ベットが推奨されます。チェックも罠(スロープレイ)としては機能しますが、高頻度ではお勧めされません。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【絶対にダメ】フロップトップセットで降りるのはポーカーを引退するレベルの過失です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          }
        }
      },
      {
        street: 'Turn',
        board: ["As", "8d", "3c", "Qh"],
        pot: 9.1,
        opponentAction: "あなたの1.8BBベットにBBコール。ターンで[Q♥]が落ち、BBは再び「チェック」しました。",
        precedingHistory: "【フロップ】あなたが1/3ポットの1.8BBをベット、BBコール。ポット: 9.1BB。",
        options: {
          Raise: {
            label: "6.0BBベット (2/3ポット強)",
            ev: 3.40,
            correct: true,
            explanation: "【GTO正解！】Qが落ちたことで、相手にはAxQx(2ペア)やKJs、JTsなどのストレートドローが広く含まれるようになりました。ここではベットサイズを2/3ポット以上に引き上げて本格的なバリューを搾取します。",
            nextStackHero: 89.7,
            nextPot: 21.1
          },
          Call: {
            label: "チェックバック",
            ev: 2.40,
            correct: false,
            explanation: "【バリュー逸失】Qのターンは、相手のコールレンジに直撃しやすく絶好のバリューポイントです。逃さず相手に大きな負担をかけましょう。",
            nextStackHero: 95.7,
            nextPot: 9.1
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "ナッツハンド継続中、絶対にフォールドしてはいけません。",
            nextStackHero: 95.7,
            nextPot: 9.1
          }
        }
      },
      {
        street: 'River',
        board: ["As", "8d", "3c", "Qh", "Jd"],
        pot: 21.1,
        opponentAction: "あなたの6.0BBベットにBBコール。リバー[J♦]が落ち、BBは「チェック」を表明しました。",
        precedingHistory: "【ターン】あなたが2/3ポットの6.0BBをベット、BBコール。ポット: 21.1BB。",
        options: {
          Raise: {
            label: "15.0BBベット (約70%ポット)",
            ev: 5.80,
            correct: true,
            explanation: "【GTO正解！】リバーのJで相手は2ペアやストレートに引っかけた可能性が高く、コール率が急増します。ポットの7割サイズという重いベットで、マキシマム(最大)バリューを召し抱えましょう！",
            nextStackHero: 74.7,
            nextPot: 51.1
          },
          Call: {
            label: "チェックしてショウダウン",
            ev: 2.10,
            correct: false,
            explanation: "【機会損失】相手はチェックコール(ミドルペア等でのキャッチ)を用意しています。ここで安全にチェックバックするのは、勝てる金をドブに捨てる大きな損失行為です。",
            nextStackHero: 89.7,
            nextPot: 21.1
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "勝率99%オーバーです。Foldは論外です。",
            nextStackHero: 89.7,
            nextPot: 21.1
          }
        }
      }
    ]
  },
  {
    id: 2,
    title: "Jh Th - BB防衛からの強ドローストレート昇華",
    heroHand: "Jh Th",
    opponentHand: "Kh Jd",
    heroPosition: "BB",
    opponentPosition: "BTN",
    stackDepth: "100BB",
    winAmount: 24.6,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "BTNが2.5BBにレイズ、SBフォールド。BBのあなたに手番が来ました。",
        precedingHistory: "【プリフロップ】スタック：100BB。あなたの手札は極上のスーテッドコネクター(Jh Th)。",
        options: {
          Raise: {
            label: "3Bet: 9.0BBにレイズ",
            ev: 0.60,
            correct: false,
            explanation: "【マージナル：最適ではない】3Betをマージナルブラフとして織り交ぜるGTO混合もありますが、100BBディープにおいてJTsは「コール」してフロップを見に行く方が圧倒的に利益的です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Call: {
            label: "2.5BBにコールしてディフェンス",
            ev: 1.10,
            correct: true,
            explanation: "【GTO正解！】素晴らしい判断です！Jh Thは優れた勝率実現力とドロー耐性を持つため、BB防衛ラインとしてピュアに「コール」してBB権利を守るのが最善の選択肢となります。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【タイトすぎ：大エラー】JTsをBTNの2.5xにフォールドするのは過剰フォールドです。ポジション不利でも十分利益を出せるハンドです。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Ks", "Qd", "4h"],
        pot: 5.5,
        opponentAction: "あなたがコール。フロップ[K♠ Q♦ 4♥]。あなたがチェックすると、BTNは「1.8BB（1/3ポット）」を打ってきました。",
        precedingHistory: "【プリフロップ】BTN 2.5BB、あなたコール。ポット：5.5BB。",
        options: {
          Raise: {
            label: "6.0BBにチェックレイズ",
            ev: 0.40,
            correct: false,
            explanation: "【過剰アクション】強烈なドロー(オープンエンドストレートドロー + ハートバックドア)ですが、チェックレイズすると相手の強ハンド(KQやセット)から3ベットAIを押し戻されてドロー権利を失う恐れがあり、コールが王道です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Call: {
            label: "1.8BBにコール",
            ev: 1.20,
            correct: true,
            explanation: "【GTO正解！】完璧です！相手の1/3ポットC-Betに対し、こちらのOESD(ストレートアウト8枚)は絶対フォールドできません。安価にコールし、ターンで引いた場合の莫大なインプライドオッズ(隠れたバリュー)を狙いに行きます。",
            nextStackHero: 95.7,
            nextPot: 9.1
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【大失策】オープンエンドストレートドローをフロップの小型ベットで捨てるのは致命傷です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          }
        }
      },
      {
        street: 'Turn',
        board: ["Ks", "Qd", "4h", "9h"],
        pot: 9.1,
        opponentAction: "あなたがコール。ターンで最高の[9♥]が落ち、BBのあなたに手番が回りました。（相手はインポジション）",
        precedingHistory: "【フロップ】あなたが1.8BBをコール、ポット: 9.1BB。ターン[9♥]であなたのストレート(9-T-J-Q-K)が完成、さらにフラッシュドローが追加！",
        options: {
          Raise: {
            label: "6.0BBのドンク・リードベットを放つ",
            ev: 3.20,
            correct: true,
            explanation: "【GTO正解！】奇跡の激変です！ストレートが完成し、さらにハートのフラッシュドローも手に入れたため、相手にチェックバック(無料カード)を許さず、主導権を奪ってこちらから「6BB」を自発ベットしてポットを膨らまします。",
            nextStackHero: 89.7,
            nextPot: 15.1
          },
          Call: {
            label: "チェックで回す",
            ev: 1.50,
            correct: false,
            explanation: "【バリュー漏らし】ここでチェックすると、相手にタダでドローを引かれたり、チェックバックされてリバーショウダウンに進んでしまうため、能動的バリューを逃してしまいます。",
            nextStackHero: 95.7,
            nextPot: 9.1
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "ストレート完成、何があってもフォールドしません。",
            nextStackHero: 95.7,
            nextPot: 9.1
          }
        }
      },
      {
        street: 'River',
        board: ["Ks", "Qd", "4h", "9h", "2c"],
        pot: 21.1,
        opponentAction: "ターンのあなたの6.0BBベットにBTNはコール。リバーでラグの[2c]が落ちました。BBのあなたに手番が回りました。",
        precedingHistory: "【ターン】あなたが6.0BBリードベット、BTNコール。ポット：21.1BB。リバーは無傷のラグ[2♣]。",
        options: {
          Raise: {
            label: "15.0BBの大バリューベットを打ち込む",
            ev: 4.80,
            correct: true,
            explanation: "【GTO最高決定！】リバーは完全に安全です。相手はKx(トップペア)を持っており、喜んでチェックコールをする準備ができています。相手の財布からチップを奪うため、ポットの約70%の強気のバリューベットを放ちます！",
            nextStackHero: 74.7,
            nextPot: 51.1
          },
          Call: {
            label: "チェックしてショウダウンを狙う",
            ev: 2.00,
            correct: false,
            explanation: "【損害】相手はチェックされるとチェックバックして一円も払わずに終わります。最高の完成ストレートを持っているので、勇気を持ってバリューを請求する義務があります。",
            nextStackHero: 89.7,
            nextPot: 21.1
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "ありのままのナッツ級です。降りるのは絶対にありません。",
            nextStackHero: 89.7,
            nextPot: 21.1
          }
        }
      }
    ]
  },
  {
    id: 3,
    title: "KTs - 40BBトーナメント中盤のLimp防衛と神フォールド",
    heroHand: "Kh Th",
    opponentHand: "Ac Td",
    heroPosition: "SB",
    opponentPosition: "BB",
    stackDepth: "40BB",
    winAmount: -2.5,
    showdownWinner: 'opponent',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "フォールドで回って、スモールブラインド(SB)のあなたに回りました。(スタック: 40BB)",
        precedingHistory: "【プリフロップ】40BBトーナメント中軸。SBのあなたの手札はKh Th。",
        options: {
          Raise: {
            label: "3.0BBのオープンレイズ",
            ev: 0.25,
            correct: false,
            explanation: "【非推奨：ミスタクティクス】40BBのスタック深度におけるSBからの3xオープンは、アグレッシブなBBからの3Betシャブ(40BBオールイン)の恰好の餌食になります。GTOではLimpイン(Call)を主力にします。",
            nextStackHero: 39.0,
            nextPot: 2.0
          },
          Call: {
            label: "1.0BBでLimp-In (コール)",
            ev: 0.48,
            correct: true,
            explanation: "【GTO正解！】完璧な知性！40BB SBでのKTsのような強スーテッドカードは「Limpレンジ」に含めます。これによりレンジを防御的にLinear(線形)に保ち、BBのチェックを誘ってポストフロップを快適に戦えます。",
            nextStackHero: 39.0,
            nextPot: 2.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "KTsをフォールドするのは大損失。SBからは100%戦うクオリティを持つ手です。",
            nextStackHero: 40.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Th", "7d", "3c"],
        pot: 2.0,
        opponentAction: "BBチェックでLimp戦へ。フロップ[T♥ 7♦ 3♣]。あなたがチェックすると、BBが「1.5BB」ベットを仕掛けました。",
        precedingHistory: "【プリフロップ】あなたがLimpコール、BBはチェックバック。ポット：2.0BB。",
        options: {
          Raise: {
            label: "4.5BBにチェックレイズ",
            ev: 0.10,
            correct: false,
            explanation: "【オーバープレイ】トップペア・キングキッカーは強いですが、レイズするとBBの弱いドローを降ろし、BBのセットや2ペアなどの極大ハンドにだけコールされる最悪の展開を招くため、コールが推奨されます。",
            nextStackHero: 39.0,
            nextPot: 2.0
          },
          Call: {
            label: "1.5BBにコール",
            ev: 0.85,
            correct: true,
            explanation: "【GTO正解！】お見事です！Tヒットキングキッカーは、相手のブラフベット(スチールスナイプ)をキャッチするのに最適な手です。ここは静かにコールしてターンを見に行きます。",
            nextStackHero: 37.5,
            nextPot: 5.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "トップペアを相手のフロップ1回のアタックに折れて放り出すのは、完全な逃げ腰(アンダーディフェンス)です。",
            nextStackHero: 39.0,
            nextPot: 2.0
          }
        }
      },
      {
        street: 'River',
        board: ["Th", "7d", "3c", "Qh", "Ad"],
        pot: 5.0,
        opponentAction: "あなたがコールしターン[Q♥]は両者チェック。リバーで最悪の[A♦]が落ち、あなたがチェックするとBBは「強気な3.5BB」を打ちました。",
        precedingHistory: "【ターン】[Q♥]で両名チェック。【リバー】オーバーカードの[A♦]が落下！あなたはチェック、BBは3.5BBの強気スタンス。",
        options: {
          Raise: {
            label: "8.0BBにレイズ(ブラフ)",
            ev: -2.50,
            correct: false,
            explanation: "【致命的傷跡】相手はAを確実に持って打ってきています。このボードにおいてこちらからショウダウンバリューのないレイズはチップをドブに捨てる、ただ無謀な暴走です。",
            nextStackHero: 37.5,
            nextPot: 5.0
          },
          Call: {
            label: "3.5BBをコール (キャッチャー)",
            ev: -0.65,
            correct: false,
            explanation: "【GTOミス(-0.65BB)】典型的なリバースインプライドオッズを踏んでいます。リバーの[A]はBBのプリフロップチェックバックレンジ(多くの弱いAx)に直撃しています。こちらの十(T)は価値が完全に崩壊しており、コールは損失確実です。",
            nextStackHero: 34.0,
            nextPot: 12.0
          },
          Fold: {
            label: "Fold (規律の撤退)",
            ev: 0.00,
            correct: true,
            explanation: "【GTO神回正解！】素晴らしい！これぞ真のGTO、真のプロです！リバーでAが落ちて相手がベットしてきた際、己のミドルペアを躊躇なく墓地に叩き捨てるマインドこそ、破滅を防ぎ勝利に生き残るための絶対技能です。最高評価！",
            nextStackHero: 37.5,
            nextPot: 5.0
          }
        }
      }
    ]
  },
  {
    id: 4,
    title: "QQ - 危険なウェットボードでのバリューコントロールとレイズへの対応",
    heroHand: "Qd Qs",
    opponentHand: "Js Ts",
    heroPosition: "HJ",
    opponentPosition: "CO",
    stackDepth: "100BB",
    winAmount: 15.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "UTGフォールド。手番がHJのあなたに回りました。",
        precedingHistory: "【プリフロップ】スタック: 100BB。あなたの手札はプレミアムペア(Qd Qs)。",
        options: {
          Raise: {
            label: "2.5BBにオープンレイズ",
            ev: 1.20,
            correct: true,
            explanation: "【GTO正解！】QQは当然100%オープンレイズします。タイトなアクションに見えても、強ハンドでバリューを築くのが基本中の基本です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Call: {
            label: "1.0BBコール (リンプ)",
            ev: 0.15,
            correct: false,
            explanation: "【ミステイク】プレミアムハンドでのリンプインは、後ろのプレイヤーにスクイーズされるか、安いBBチェックでゴミハンドに捲られるリスクを極大化させます。",
            nextStackHero: 99.0,
            nextPot: 2.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【GTOエラー】QQをプリフロップで自ら捨てるのは最大の失策です。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Jh", "9h", "3c"],
        pot: 6.5,
        opponentAction: "あなたのオープンにCOがコール。ボタンとブラインドフォールド。フロップ[J♥ 9♥ 3♣]で、あなたがチェックするとCOは「4.0BB（約60%ポット）」をベットしました。",
        precedingHistory: "【フロップ】お互いに主導権維持の場面。フロップ[J♥ 9♥ 3♣]（フラッシュ・ストレート両面ウェブボード）。ポット：6.5BB。",
        options: {
          Raise: {
            label: "12.0BBにチェックレイズ",
            ev: 0.20,
            correct: false,
            explanation: "【過剰アクション(-0.70BB)】危険なボードでレイズしすぎると、相手のJJや99、J9などの勝っている手を降ろせず、こちらのスタックを余計に失う危険があります。チェックコールで管理しましょう。",
            nextStackHero: 85.5,
            nextPot: 22.5
          },
          Call: {
            label: "4.0BBをコール",
            ev: 0.90,
            correct: true,
            explanation: "【GTO正解！】QQは依然としてオーバーペアとして非常に強いですが、ここでレイズを返すと相手のセット(JJや99)や勝っている手、または強ドロー以外を降ろしてしまうため、チェックコールに留めるのが推奨されます。",
            nextStackHero: 93.5,
            nextPot: 14.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【諦め早すぎ】オーバーペアをフロップの単発ベットでフォールドするのは過剰フォールドです。相手のJ10ペアなどを完全にカバーしています。",
            nextStackHero: 97.5,
            nextPot: 6.5
          }
        }
      },
      {
        street: 'Turn',
        board: ["Jh", "9h", "3c", "2s"],
        pot: 14.5,
        opponentAction: "あなたがコール。ターンは無害な[2♠]（ドロー未成立）。あなたがチェックすると、COはさらに強気に「9.0BB」を打ってきました。",
        precedingHistory: "【ターン】[2♠]が落ちて両者チェックコール。ポット：14.5BB。相手は2連続ダブルバレル。",
        options: {
          Raise: {
            label: "25.0BBに大きくレイズ",
            ev: -1.50,
            correct: false,
            explanation: "【大事故】ここで大きなレイズやオールインを返すと、相手のフォールデッドな手だけが降り、JJ/99などの強ハンドにだけコールされて大損害を被ります。",
            nextStackHero: 68.5,
            nextPot: 48.5
          },
          Call: {
            label: "9.0BBをコールして耐える",
            ev: 1.10,
            correct: true,
            explanation: "【GTO正解！】素晴らしい！Jもフリーズしたまま、ドローも未成立です。QQは相手のQJ, JTや、ハート・ストレート等のブラフをキャッチするために十分な強さがあります。ここでも「チェックコール」が最適解です。",
            nextStackHero: 84.5,
            nextPot: 32.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【弱腰ミステイク】相手のダブルバレルに恐れてオーバーペアを捨てるのは期待値を無視したプレイです。ここはコールで耐え抜きます。",
            nextStackHero: 93.5,
            nextPot: 14.5
          }
        }
      },
      {
        street: 'River',
        board: ["Jh", "9h", "3c", "2s", "5d"],
        pot: 32.5,
        opponentAction: "あなたがコール。リバーでラグ[5♦]が落ち、あなたがチェックするとCOは諦めて「チェックバック」を選択しました。",
        precedingHistory: "【リバー】[5♦]（全てのドロー未成立）。あなたチェック、COはチェックバックでショウダウンへ！",
        options: {
          Raise: {
            label: "ショウダウン (マッドブラフを警戒)",
            ev: 15.00,
            correct: true,
            explanation: "【GTO完全正解！】QQを見せて、相手のJs Ts（トップペア・キッカー10）を捲り大勝利です！バリューコントロールが完璧に機能し、安全にポットを獲得しました。",
            nextStackHero: 84.5,
            nextPot: 32.5
          },
          Call: {
            label: "ショウダウン (バリュー決定)",
            ev: 15.00,
            correct: true,
            explanation: "【GTO完全正解！】QQを見せて、相手のJs Ts（トップペア・キッカー10）を捲り大勝利です！バリューコントロールが完璧に機能し、安全にポットを獲得しました。",
            nextStackHero: 84.5,
            nextPot: 32.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "ショウダウン権があるのに降りるボタンを押す必要はありません。",
            nextStackHero: 84.5,
            nextPot: 32.5
          }
        }
      }
    ]
  },
  {
    id: 5,
    title: "AKs - プレフロップ3Bet戦略とフロップでのC-Betによるブラフ主導権",
    heroHand: "As Ks",
    opponentHand: "Jh Th",
    heroPosition: "BTN",
    opponentPosition: "SB",
    stackDepth: "100BB",
    winAmount: 18.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "SBが3.0BBにオープンレイズ、BBフォールド。BTNのあなたに回りました。",
        precedingHistory: "【プリフロップ】スタック：100BB。あなたの手札はプレミアムスーテッド(As Ks)。",
        options: {
          Raise: {
            label: "3Bet: 9.0BBに大きくレイズ",
            ev: 1.80,
            correct: true,
            explanation: "【GTO正解！】AKsは100%レイズ(3Bet)を返します！単なるコールに留めず、ポジションアドバンテージを活かしてバリューとフォールドを限界まで奪取します。",
            nextStackHero: 91.0,
            nextPot: 19.0
          },
          Call: {
            label: "3.0BBをコール",
            ev: 0.80,
            correct: false,
            explanation: "【非推奨ジレンマ(-1.00BB)】AKsをただコールするのは消極的すぎます。3Betを返して相手を窮地に追い込むのが正解です。",
            nextStackHero: 97.0,
            nextPot: 7.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【大失策】AKsをプリプロップで捨てるのはあり得ないプレイングです。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Qs", "7d", "2c"],
        pot: 19.0,
        opponentAction: "あなたの3BetにSBコール。フロップは[Q♠ 7♦ 2♣]の1枚スペード。相手は「チェック」しました。",
        precedingHistory: "【フロップ】[Q♠ 7♦ 2♣]。あなたはA-Kハイ。ポット：19.0BB。レンジ有利はあなたにあります。",
        options: {
          Raise: {
            label: "6.0BBベット (約30%ポットC-Bet)",
            ev: 1.40,
            correct: true,
            explanation: "【GTO正解！】レンジ優位(Range Advantage)があります。このようなQハイドライ盤面は相手のコールレンジにヒットしづらいため、小型の1/3ポットベットで相手のミドルペアやハイカードを払い落とするか、スペードバックドアの浮きを狙うチェックベットが推奨されます。",
            nextStackHero: 85.0,
            nextPot: 31.0
          },
          Call: {
            label: "チェックバック (様子見)",
            ev: 0.90,
            correct: false,
            explanation: "【弱気なチェック】チェックも無しではないですが、頻度的にはベットを打って主導権を利用したフリーフォールドを勝ち取るアグレッシブな展開が優勢です。",
            nextStackHero: 91.0,
            nextPot: 19.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "チェックされているのに自らフォールドはできません。",
            nextStackHero: 91.0,
            nextPot: 19.0
          }
        }
      },
      {
        street: 'Turn',
        board: ["Qs", "7d", "2c", "Ks"],
        pot: 31.0,
        opponentAction: "C-Betに相手コール。ターンで待望の[K♠]が落ち、極大トップペア＋スペードSFドローへ発展！相手は再び「チェック」しました。",
        precedingHistory: "【ターン】[K♠]であなたの勝率は一気に極大化（トップペア、Aキッカー、ロイヤルフラッシュまで視野）。相手の連続チェック。",
        options: {
          Raise: {
            label: "16.0BBベット (約50%ポット・バリュー)",
            ev: 3.50,
            correct: true,
            explanation: "【GTO大正解！】最高です！Kヒットによるトップペア・プレミアムキッカーに加え、フラッシュドローもあります。ここはベットを重ねて相手のQxやJTsなどの支払いを強力に搾り取ります！",
            nextStackHero: 69.0,
            nextPot: 63.0
          },
          Call: {
            label: "チェックバック (罠・スロープレイ)",
            ev: 1.20,
            correct: false,
            explanation: "【バリュー逸失】ここでスロープレイ(チェック)をするのはバリューの損失になります。相手にフリーカードを与えて危険なリブカードを配るミステイクです。能動的にポットを膨らましましょう。",
            nextStackHero: 85.0,
            nextPot: 31.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "勝率激高、フォールドは消去です。",
            nextStackHero: 85.0,
            nextPot: 31.0
          }
        }
      }
    ]
  },
  {
    id: 6,
    title: "87s - セミブラフOESDから極大バリューへの変貌",
    heroHand: "8d 7d",
    opponentHand: "As Kh",
    heroPosition: "CO",
    opponentPosition: "BTN",
    stackDepth: "100BB",
    winAmount: 20.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "全員フォールドし、CO位置のあなたに手番が回りました。",
        precedingHistory: "【プリフロップ】100BBディープ。あなたの手札は(8d 7d)。",
        options: {
          Raise: {
            label: "2.5BBにオープンレイズ",
            ev: 0.40,
            correct: true,
            explanation: "【GTO正解！】COからの87sは、適度なフラッシュ・ストレート破壊力を持つ最高のスチール＆オープンハンドです。相手を降ろしつつ、もしコールされてもマルチに捲りに行けます。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Call: {
            label: "1.0BBコール (リンプ)",
            ev: -0.10,
            correct: false,
            explanation: "【ミスティック】リンプコールは後ろのプレイヤーに好都合なチャンスを与えるため厳禁。積極的にレイズしてください。",
            nextStackHero: 99.0,
            nextPot: 2.0
          },
          Fold: {
            label: "Fold",
            ev: 0.10,
            correct: false,
            explanation: "【タイトすぎ】降りても大きな損害はないですが、GTO戦術ではCO位置の87sは高い頻度で2.5BBオープンすべき優良資産です。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["6c", "5h", "Kc"],
        pot: 6.5,
        opponentAction: "あなたがオープンし、BTNがコール。ブラインドはフォールド。フロップ[6♣ 5♥ K♣]、ストレートアウツ8枚のオープンエンド(OESD)！あなたがチェックすると、BTNは「3.0BB」を打ってきました。",
        precedingHistory: "【フロップ】[6♣ 5♥ K♣]、OESD。ポット: 6.5BB。BTNが約45%ポットベット。",
        options: {
          Raise: {
            label: "10.0BBにチェックレイズ",
            ev: 0.40,
            correct: false,
            explanation: "【過剰なアクション】セミブラフとしてたまにチェックレイズを混ぜるのは有効ですが、100BBで王道はやはりチェックコールです。無闇に相手のKx(強ペア)から反撃を食らうのを防ぎます。",
            nextStackHero: 87.5,
            nextPot: 19.5
          },
          Call: {
            label: "3.0BBをコール",
            ev: 0.85,
            correct: true,
            explanation: "【GTO正解！】完璧です！ストレート完成への近道(アウツ8枚)をしっかり引くために、3.0BBを静かにチェックコールして、隠されたインプライドオッズを蓄積します。",
            nextStackHero: 94.5,
            nextPot: 12.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【大事故フォールド】完璧なOESD(8枚アウト)を自ら捨てるのは絶対にNGです。引き確率は十分にあります。",
            nextStackHero: 97.5,
            nextPot: 6.5
          }
        }
      },
      {
        street: 'Turn',
        board: ["6c", "5h", "Kc", "9d"],
        pot: 12.5,
        opponentAction: "あなたがコール。ターンで期待通りの[9♦]が落ち、極限ストレート(5-6-7-8-9)が激変完成！チェックするとBTNは強気に「8.0BB」をダブルバレルしてきました。",
        precedingHistory: "【ターン】[9♦]。ストレート完成！ポット：12.5BB。相手はバリュー/ブラフの2発目(8BB)を放出。",
        options: {
          Raise: {
            label: "24.0BBにチェックレイズ！ (バリュー大爆破)",
            ev: 4.50,
            correct: true,
            explanation: "【GTO最高決定！】神聖なるバリュータイムです！相手のKxや2ペアから極大チップを呼び込みます。ここでコールするのは、不運なフラッシュ完成ラグなどの極小フリーカードを与えることになるため、3倍レイズでポットを完璧に回収します！",
            nextStackHero: 70.5,
            nextPot: 44.5
          },
          Call: {
            label: "8.0BBをただコールする (スロープレイ)",
            ev: 2.15,
            correct: false,
            explanation: "【温和すぎ】最善ストレート完成時、スロープレイコールするのは非推奨です。相手がコールするはずのチップ機会を潰すか、余計なフリーカードを与えてしまう不利益な選択です。",
            nextStackHero: 86.5,
            nextPot: 28.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "勝率100%継続をフォールドするのは大問題です。",
            nextStackHero: 94.5,
            nextPot: 12.5
          }
        }
      }
    ]
  },
  {
    id: 7,
    title: "AA - 20BBショートスタック環境下での罠コールとリバートラップ",
    heroHand: "Ac As",
    opponentHand: "Qc Td",
    heroPosition: "SB",
    opponentPosition: "BB",
    stackDepth: "20BB",
    winAmount: 12.5,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "全員フォールドし、SB（スモールブラインド）のあなたに回りました。(20BB残り)",
        precedingHistory: "【プリフロップ】ショートスタック(20BB)の過酷な終盤戦。あなたの手札は最強無比(Ac As)。",
        options: {
          Raise: {
            label: "4.0BBにオープンレイズ",
            ev: 1.10,
            correct: false,
            explanation: "【惜しい】ショートスタックでいきなり大きなレイズ(4倍)を放つと、BBのルースな多くのハンド(Q10やK10)を瞬時にフォールドさせてしまいます。甘い蜜を与えてトラップにかける余地を奪います。",
            nextStackHero: 16.0,
            nextPot: 7.0
          },
          Call: {
            label: "1.0BBでコール (罠リンプ)",
            ev: 1.65,
            correct: true,
            explanation: "【GTOプロ技！】20BBのショートスタック状況におけるSBからのAAは、相手のBBに高確率で「スチール/オープン/オールイン」のレイズ攻撃を促すため、あえて1BBで優しくコールする(Limp)のがバリュー期待値を限界突破させる至高のトラップです！",
            nextStackHero: 19.0,
            nextPot: 2.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "AAをショートスタックで捨てるマインドはポーカー界の珍事です。",
            nextStackHero: 20.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Qh", "8d", "4c"],
        pot: 2.0,
        opponentAction: "リンプしBBチェックバックでフロップ[Q♥ 8♦ 4♣]。あなたがチェックすると、BBが嬉しそうに「1.0BB」のジャブを打ってきました。",
        precedingHistory: "【フロップ】[Q♥ 8♦ 4♣]（完璧に乾いた安全なQボード）。チェック/チェック。ポット2.0BB。",
        options: {
          Raise: {
            label: "4.0BBにチェックレイズ",
            ev: 1.10,
            correct: false,
            explanation: "【過剰バリュー】ここで即座にレイズを返すと、相手のJ10ペアやドローブラフをすべて吹き飛ばしてしまいます。相手に諦めさせず、さらにコールで誘い込むのが大人の戦い方です。",
            nextStackHero: 15.0,
            nextPot: 7.0
          },
          Call: {
            label: "1.0BBをコールバック",
            ev: 1.80,
            correct: true,
            explanation: "【GTO正解！】このコールが芸術です！BBはこちらのリンプに対してQペアやストレートスチールで浮き足立っています。ここで再びコールに留め、相手に追加チップをベット（ダブルバレル）させるチャンスを創り出します。",
            nextStackHero: 18.0,
            nextPot: 4.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "オーバーペアで降りるのは論外です。",
            nextStackHero: 19.0,
            nextPot: 2.0
          }
        }
      },
      {
        street: 'Turn',
        board: ["Qh", "8d", "4c", "2s"],
        pot: 4.0,
        opponentAction: "あなたがコール。ターンはラグ[2s]。あなたが三度、誘惑 of チェックを置くと、BBは「3.0BB」の本格ベットを重ねてきました！残りスタックは15BBです。",
        precedingHistory: "【ターン】[2♠]。ポット：4.0BB。相手の3.0BBコミット志向ベット。",
        options: {
          Raise: {
            label: "チェックオールイン！(Shove)",
            ev: 3.20,
            correct: true,
            explanation: "【GTO大正解！！】これにてトラップが完全に密閉されました！ポットが蓄積され、BBはQトップペア(Q-10ヒット)を引き下ろせない状況（コミット）になっています。ここで全スタックを「オールインシャブ」することで、相手のQから全所持金を強奪します！",
            nextStackHero: 0.0,
            nextPot: 24.0
          },
          Call: {
            label: "3.0BBをコール",
            ev: 1.50,
            correct: false,
            explanation: "【遅すぎる】リバーで不都合なKやJのスケアカードが降ってきた場合、相手が急降下してチェックバック（無料開示）する可能性があるため、このターンの時点で全ての利益をオールインでかっさらうのがGTO最善です。",
            nextStackHero: 15.0,
            nextPot: 10.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "AAでこのストリートで降りる理由はありません。",
            nextStackHero: 18.0,
            nextPot: 4.0
          }
        }
      }
    ]
  },
  {
    id: 8,
    title: "KQo - トップペア成立時のトリッキーなチェックコールとブラフキャッチ",
    heroHand: "Kd Qs",
    opponentHand: "As Jd",
    heroPosition: "BB",
    opponentPosition: "BTN",
    stackDepth: "100BB",
    winAmount: 12.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "BTNが2.5BBにオープンレイズ、SBフォールド。BBのあなたに番が回りました。",
        precedingHistory: "【プリフロップ】100BBディープ。あなたの手札は(Kd Qs)。",
        options: {
          Raise: {
            label: "3Bet: 9.5BBに大きくレイズ",
            ev: 0.10,
            correct: false,
            explanation: "【お勧め困難：マージナル】3Betブラフのバリエーションとして組み入れるのはありですが、KQoは相手のコールや4Betに直面した時の強度が不十分なため、ピュアな「コール」の方が圧倒的に堅守なGTO標準です。",
            nextStackHero: 90.5,
            nextPot: 19.5
          },
          Call: {
            label: "2.5BBをコール (ディフェンス)",
            ev: 0.50,
            correct: true,
            explanation: "【GTO正解！】素晴らしい！KQoはBTNの2.5倍レイズに対して自ら降りてはならない基準ディフェンス手札です。コールで守り、フロップのヒットを狙います。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【弱すぎる】KQoをBTNの平たいレイズでフォールドするのは甘いおやつ（簡単に奪われるターゲット）に成り下がります。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Qc", "Jh", "4d"],
        pot: 5.5,
        opponentAction: "あなたがコール。フロップ[Q♣ J♥ 4♦]（トップペア・最高キングキッカー！）。あなたがチェックすると、BTNは「1.8BB（約1/3）」のC-Betを投下しました。",
        precedingHistory: "【フロップ】[Q♣ J♥ 4♦]。お見事。トップペア・Kキッカーを確保。ポット：5.5BB。相手の小型C-Bet。",
        options: {
          Raise: {
            label: "6.0BBにチェックレイズ",
            ev: 0.30,
            correct: false,
            explanation: "【過大バリュー失敗】ここでレイズしてしまうと、相手のAQやAQ同等以上の本命ハンドにのみ捕まる上、ブラフハンド（下位ドロー）を無駄にフォールドさせてしまうため、「チェックコール」こそがGTO正義です。",
            nextStackHero: 91.5,
            nextPot: 13.5
          },
          Call: {
            label: "1.8BBをコール",
            ev: 1.10,
            correct: true,
            explanation: "【GTO正解！！】完璧な意思。KQは非常にクオリティの高いバリューキャッチャーです。相手のブラフを残しつつ、チェックコールで冷徹についていきます。",
            nextStackHero: 95.7,
            nextPot: 9.1
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【ルール無視】この最強クラスのワンペアで相手の最初の単発ベットでフォールドするのはアンダープレイです。",
            nextStackHero: 97.5,
            nextPot: 5.5
          }
        }
      },
      {
        street: 'Turn',
        board: ["Qc", "Jh", "4d", "2s"],
        pot: 9.1,
        opponentAction: "あなたがコール。ターンは完全無害なラグ[2♠]。あなたがチェックすると、BTNはポットの5割サイズに近い「4.5BB」で二段階攻撃（ダブルバレル）をしてきました。",
        precedingHistory: "【ターン】[2♠]。ポット：9.1BB。一対一の耐久戦。相手の4.5BBへの対応、チェックポジション。",
        options: {
          Raise: {
            label: "15.0BBにチェックレイズ",
            ev: -0.20,
            correct: false,
            explanation: "【大事故】依然として強めのワンペアですが、ショウダウンまでお互いコントロール可能です。ここで自発的レイズに進むのは完全に裏目に出ます。",
            nextStackHero: 80.7,
            nextPot: 29.1
          },
          Call: {
            label: "4.5BBをさらにコールする (ブラフキャッチ維持)",
            ev: 1.30,
            correct: true,
            explanation: "【GTO正解！】その通り！Qペア・Kキッカーは相手の各種ブロードウェイブラフ(KT, T9, 89sなど)やJペアなどのスチールを見抜く優れたおとり（キャッチャー）です。安全についていきます。",
            nextStackHero: 91.2,
            nextPot: 18.1
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【臆病ミス】相手のアグレッシブに恐れてここで降りるようでは、多くのブラフキャッシュ機会を相手に容易に譲渡してしまいます。コールです。",
            nextStackHero: 95.7,
            nextPot: 9.1
          }
        }
      }
    ]
  },
  {
    id: 9,
    title: "JJ - セット完成時のターン急激なストレート警戒ボードでのポット調整",
    heroHand: "Jh Jd",
    opponentHand: "Qh Th",
    heroPosition: "SB",
    opponentPosition: "BTN",
    stackDepth: "100BB",
    winAmount: 18.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "BTNが2.5BBにオープン。SBのあなたに番が回りました。",
        precedingHistory: "【プリフロップ】100BBディープ。手札はミドルペア最高のポケットジャックス(Jh Jd)。",
        options: {
          Raise: {
            label: "3Bet: 10.0BBに大きくレイズ",
            ev: 1.25,
            correct: true,
            explanation: "【GTO正解！】JJはBTNオープンに対しては100% 3Betでの反撃が推奨されます。ポジション不利を打ち消すため、レンジ優位を活かして10BB前後に引き上げます。",
            nextStackHero: 90.0,
            nextPot: 21.0
          },
          Call: {
            label: "2.5BBをただコール",
            ev: 0.65,
            correct: false,
            explanation: "【非推奨】JJをSBから平コールすると、BBにスクイーズ(強制絞りレイズ)を打たれやすくなり、マルチウェイ戦に進むリスクが上がります。",
            nextStackHero: 97.5,
            nextPot: 6.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【言語道断】最強クラスの3Bet候補であるJJをプリフロップで捨てるゲームはありません。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Js", "8c", "2d"],
        pot: 21.0,
        opponentAction: "BTNがあなたの3Betをコール。フロップ[J♠ 8♣ 2♦]（トップセット完成！）。あなたがチェックすると相手は「7.0BB」をベットしました。",
        precedingHistory: "【フロップ】あなたが10.0BBに3Betし、BTNコール。ポット: 21.0BB。トップセット。",
        options: {
          Raise: {
            label: "20.0BBにチェックレイズ",
            ev: 1.10,
            correct: false,
            explanation: "【急ぎすぎ】非常にドライなボードのため、チェックレイズすると相手がブラフ（ハイカード）を完全に降ろしてしまいバリューが消失します。ここはスロープレイコールが最強です。",
            nextStackHero: 70.0,
            nextPot: 51.0
          },
          Call: {
            label: "7.0BBをコール (トラップ)",
            ev: 2.10,
            correct: true,
            explanation: "【GTO正解！】素晴らしい！J-8-2のような非常にドライな盤面におけるJJは強すぎて相手を全滅させがちです。コールに留めることで、相手のブラフバレルをもう一発引き出します。",
            nextStackHero: 83.0,
            nextPot: 35.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "トップセットでのフォールドはポーカー史上最も理不尽な選択です。",
            nextStackHero: 90.0,
            nextPot: 21.0
          }
        }
      },
      {
        street: 'Turn',
        board: ["Js", "8c", "2d", "9h"],
        pot: 35.0,
        opponentAction: "あなたがコールし、ターンで不穏な[9♥]（ストレート両面）が落ちました。あなたが再度チェックを置くと、相手は迷わず「18.0BB」を打ってきました！",
        precedingHistory: "【ターン】[9♥]。ポット: 35.0BB。相手は強気にダブルバレル。",
        options: {
          Raise: {
            label: "オールイン(残り73.0BB)",
            ev: -0.50,
            correct: false,
            explanation: "【ミステイク】相手のJ10、QTなどのストレート完成系に捕まる恐れがあります。また、ここでオールインすると相手がQJsや10sペアなどの弱いマージナルハンドを即降りるため、チェックコールでのバリューキープが推奨されます。",
            nextStackHero: 10.0,
            nextPot: 126.0
          },
          Call: {
            label: "18.0BBをコールして様子見",
            ev: 1.80,
            correct: true,
            explanation: "【GTO正解！】正解です！9hが入ったことでQTやT7などのストレートの恐怖が出ました。しかし、あなたのJJは依然としてリバーのフルハウス捲りアウト(10枚)を誇る極めて強靭なハンドです。コールでついていき危険なリバー状況を精査します。",
            nextStackHero: 65.0,
            nextPot: 71.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "セットをダブルバレルに対してここで捨てるのはフォールド過剰です。フルハウスアウトもあります。",
            nextStackHero: 83.0,
            nextPot: 35.0
          }
        }
      }
    ]
  },
  {
    id: 10,
    title: "99 - UTGオープンからのマニアックなモンスターボードのバリュー追求",
    heroHand: "9d 9c",
    opponentHand: "Kh Jd",
    heroPosition: "UTG",
    opponentPosition: "BB",
    stackDepth: "100BB",
    winAmount: 22.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "あなたがオープン。BBがコール。BBディフェンスを迎えました。",
        precedingHistory: "【プリフロップ】スタック: 100BB。あなたの手札は(9d 9c)。プレミアム候補のミドルペアです。",
        options: {
          Raise: {
            label: "2.5BBにオープンレイズ",
            ev: 0.60,
            correct: true,
            explanation: "【GTO正解！】アーリーポジション(UTG)からでも、99は100%オープンレイズを行います。プリフロップの主導権を奪うのが大切です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Call: {
            label: "1.0BBコール (リンプ)",
            ev: 0.10,
            correct: false,
            explanation: "【ミス】アーリーからリンパーになるのは後ろから3Betスクイーズを誘発し、不利なポット環境を自ら作ってしまう初心者特有のアクションです。",
            nextStackHero: 99.0,
            nextPot: 2.0
          },
          Fold: {
            label: "Fold",
            ev: 0.10,
            correct: false,
            explanation: "【弱腰】99をUTGから捨てるのはタイトすぎます。強いレンジの一部として主張しましょう。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["9s", "6d", "4h"],
        pot: 5.5,
        opponentAction: "BBがチェックしました。フロップは[9♠ 6♦ 4♥]（究極のセット完成！）。",
        precedingHistory: "【フロップ】あなたが2.5BBオープン、BBコール。盤面はミドルボード。セットオブナインズの降臨です。",
        options: {
          Raise: {
            label: "3.5BBにベット (約60%ポット強めのバリュー)",
            ev: 1.95,
            correct: true,
            explanation: "【GTO正解！】ストレートドロー（87や75、53s）が非常に多く絡むミドルボードです。ここは無料カードを与えずに強めに「3.5BB」を打って、BBのミドルペア（88, 77）やドローハンドから高額のバリューを取得すべきです。",
            nextStackHero: 94.0,
            nextPot: 12.5
          },
          Call: {
            label: "チェックバック (罠・スロープレイ)",
            ev: 1.20,
            correct: false,
            explanation: "【不適切】ドローが多い危険なボードでチェックバックすると、フリーカードを与えてしまい、ターンで簡単に逆転ストレートを許してしまうためNGです。能動的に打ちましょう。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "モンスターを自演フォールドするのは最悪の選択肢です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          }
        }
      },
      {
        street: 'Turn',
        board: ["9s", "6d", "4h", "Kc"],
        pot: 12.5,
        opponentAction: "あなたが3.5BB、相手コール、ターンで[K♣]が出現。BBは「チェック」しました。",
        precedingHistory: "【ターン】相手コール。[K♣]はAに次いで強力な相手のコールレンジ(KJs, KTs)を直撃する可能性がある好カードです。",
        options: {
          Raise: {
            label: "8.5BBにベット (ダブルバレル！)",
            ev: 3.80,
            correct: true,
            explanation: "【GTO大正解！】最高です。相手がKヒットやQJの浮きドローを保有している場合、このオーバーカードKにコールを連発します。ポットの約7割を強気にベットしてモンスターの支払いを極大化させましょう！",
            nextStackHero: 85.5,
            nextPot: 29.5
          },
          Call: {
            label: "チェックバック (用心する)",
            ev: 1.50,
            correct: false,
            explanation: "【バリュー不足】Kヒットで相手がルースにコールしてくれる絶好のバリュー機会（黄金のストリート）を無駄にしてはなりません。",
            nextStackHero: 94.0,
            nextPot: 12.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "降ろされる理由がありません。",
            nextStackHero: 94.0,
            nextPot: 12.5
          }
        }
      }
    ]
  },
  {
    id: 11,
    title: "A5s - SBからの3Betブラフ戦略とフロップハイカードへの適正C-Bet",
    heroHand: "As 5s",
    opponentHand: "Qc Jc",
    heroPosition: "SB",
    opponentPosition: "BTN",
    stackDepth: "100BB",
    winAmount: 11.5,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "BTNが2.5BBにオープン。SBのあなたに回りました。",
        precedingHistory: "【プリフロップ】100BBディープ。あなたの手札は(As 5s)。",
        options: {
          Raise: {
            label: "3Bet: 10.0BBにレイズ (3Betブラフ)",
            ev: 0.85,
            correct: true,
            explanation: "【GTO正解！】A5sは完璧な「3Betライトブラフ」の主要コアハンドです。Aブロッカー（相手がAA, AKを持っている確率を減少）と高いスーテッド＆ストレート(5-4-3-2-A)の完成力を活かし、ポジション不利を補うアグレッシブ戦略をとります。",
            nextStackHero: 90.0,
            nextPot: 21.0
          },
          Call: {
            label: "2.5BBをコール (スモールブラインド防衛)",
            ev: 0.20,
            correct: false,
            explanation: "【非推奨】SBからローAスーテッドでただコールするのは非常に弱いアクションです。BBの搾取スクイーズを誘い、ポストフロップで常にアウトオブポジション(OOP)を強いられ利益化が著しく難しくなります。",
            nextStackHero: 97.5,
            nextPot: 6.0
          },
          Fold: {
            label: "Fold",
            ev: 0.40,
            correct: false,
            explanation: "【弱気】フォールドはミスではありませんが、BTNがルースなオープンをしているレンジに対してA5sという極めて強いブロッカーを手放すのは期待値の毀損です。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Kd", "9h", "2c"],
        pot: 21.0,
        opponentAction: "BTNがあなたの3Betをコールしました。フロップ[K♦ 9♥ 2♣]の非常に乾いたボード。あなたの手番です。",
        precedingHistory: "【フロップ】あなたが10BBに3Bet、BTNはコール。ポットは21BBに成長。",
        options: {
          Raise: {
            label: "6.5BBベット (約1/3ポットC-Bet)",
            ev: 1.15,
            correct: true,
            explanation: "【GTO大正解！】素晴らしい！このトール(Kハイ)ボードは3Betしたあなた側に「強力レンジレンジ優位（AA, KK, AK）」があるため、小型の1/3ベットを打つだけで、相手のQJ, JTなどのマージナルな浮きペアやフロートを即座にフォールドに追い込む戦略が劇的に有効です。",
            nextStackHero: 83.5,
            nextPot: 34.0
          },
          Call: {
            label: "チェックしてギブアップ",
            ev: 0.50,
            correct: false,
            explanation: "【弱腰】せっかく3Betでレンジ勝率を獲得したのに、Kハイドライで一回もベットせずに諦めてチェックするのは、相手にポジション（無料の主導権）を簡単に譲り渡し失策となります。",
            nextStackHero: 90.0,
            nextPot: 21.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "自らチェックせずに降りるボタンはありません。",
            nextStackHero: 90.0,
            nextPot: 21.0
          }
        }
      }
    ]
  },
  {
    id: 12,
    title: "KQs - ポジションを活かしたバロック・ストレートへの変貌とターン猛撃",
    heroHand: "Ks Qs",
    opponentHand: "As Th",
    heroPosition: "CO",
    opponentPosition: "HJ",
    stackDepth: "100BB",
    winAmount: 25.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "HJが2.5BBにオープン。あなたがCO(カットオフ)です。",
        precedingHistory: "【プリフロップ】あなたの手札は(Ks Qs)。インポジションが確約される素晴らしい環境です。",
        options: {
          Raise: {
            label: "7.5BBに3Betレイズ",
            ev: 0.80,
            correct: false,
            explanation: "【混合戦略だが今回はコール推奨】3BetもGTOで一部選択肢にありますが、HJというややタイトなオープンレンジに対して、KQスーテッドはコールに留めることでインポジションのまま相手のドミド手を誘い込み利益を出すのが非常に一般的です。",
            nextStackHero: 92.5,
            nextPot: 11.5
          },
          Call: {
            label: "2.5BBをフラットコール",
            ev: 1.20,
            correct: true,
            explanation: "【GTO正解！】KQsは極めてコールのバリューが強い手札です。ポジションを持ち、非常にコントロールしやすい状態でフロップを覗きます。",
            nextStackHero: 97.5,
            nextPot: 6.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "この手のプレミアムスーテッドをプリフロで捨てるのは明らかな失策です。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Js", "9d", "4c"],
        pot: 6.5,
        opponentAction: "HJは「3.0BB（約45%ポット）」をベットしてきました。",
        precedingHistory: "【フロップ】[J♠ 9♦ 4♣]。あなたにはインサイドストレート（Tアウト4枚）と、バックドアスペードフラッシュ（2枚）があります。",
        options: {
          Raise: {
            label: "10.0BBにレイズ (お仕置きブラフ)",
            ev: 0.20,
            correct: false,
            explanation: "【過大】ここでレイズしてしまうと、相手のオーバーペア(QQ-AA)やAJにのみ捕まり、ブラフドローとして高くつきすぎます。コールが最もバランスが良いです。",
            nextStackHero: 87.5,
            nextPot: 26.5
          },
          Call: {
            label: "3.0BBをコールして耐える",
            ev: 0.95,
            correct: true,
            explanation: "【GTO正解！】素晴らしいです！KQはバックドアドロー(フラッシュ＋ストレート)に溢れています。このような強い「フロート候補(Float)」は相手のベットをインポジションでコールし、ターンでの大発展を待ち受けるのが現代ポーカーの定石です。",
            nextStackHero: 94.5,
            nextPot: 12.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【弱すぎ】バックドアドローとハイカード2枚を無視して1発目で降りるのはミスです。",
            nextStackHero: 97.5,
            nextPot: 6.5
          }
        }
      },
      {
        street: 'Turn',
        board: ["Js", "9d", "4c", "Ts"],
        pot: 12.5,
        opponentAction: "ターンはドラマチックな[T♠]！あなたにはOESD(K-Q-J-T)が奇跡完成し、さらにフラッシュドロー(KsQsTs)も追加！相手は「チェック」を表明しました。",
        precedingHistory: "【ターン】[T♠]の極大発展。相手の弱気のチェック。",
        options: {
          Raise: {
            label: "8.5BBをヘビーベット (バリューバースト)",
            ev: 3.50,
            correct: true,
            explanation: "【GTO究極正解！】神がかり的な展開です。ストレートが完成、さらにフラッシュドローまでバックアップに持ちました。相手のJやAA/KK, JXから極大ポットをぶんどるため、力強くベットを開始します！",
            nextStackHero: 86.0,
            nextPot: 29.5
          },
          Call: {
            label: "チェックバック (罠・トラップチェック)",
            ev: 1.50,
            correct: false,
            explanation: "【バリュー流出】ターンをチェックすると、リバーでフラッシュやペアなどの嫌なカードが落ちた場合に相手からお金を取るのが難しくなります。今すぐ最大バリューを回収しに行きましょう！",
            nextStackHero: 94.5,
            nextPot: 12.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "絶対にありません。",
            nextStackHero: 94.5,
            nextPot: 12.5
          }
        }
      }
    ]
  },
  {
    id: 13,
    title: "54s - BB防衛からのセカンドペア管理と冷酷なショウダウン獲得",
    heroHand: "5h 4h",
    opponentHand: "As Th",
    heroPosition: "BB",
    opponentPosition: "BTN",
    stackDepth: "100BB",
    winAmount: 11.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "BTNが2.5BBにオープン、SBフォールド。BBのあなたに回りました。",
        precedingHistory: "【プリフロップ】スタック: 100BB。あなたの手札は極小スーテッドコネクター(5h 4h)。",
        options: {
          Raise: {
            label: "3Bet: 9.5BBにレイズ",
            ev: -0.10,
            correct: false,
            explanation: "【過剰】54sは3Betレンジとして稀に織り交ざりますが、低すぎるためBBからBTNへのピュア3Betは損益分岐を下回りやすいです。「コール」一択です。",
            nextStackHero: 90.5,
            nextPot: 19.5
          },
          Call: {
            label: "2.5BBをコールしてディフェンス",
            ev: 0.45,
            correct: true,
            explanation: "【GTO正解！】BBはポットにすでに1BB貼っているため非常に格安でコールできます。54sはポテンシャル最高でオッズが合う最強のディフェンスハンドです。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "ディフェンスを拒否して格安プライスの54sを捨てるのはタイトな初心者ミスです。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Kh", "5s", "2d"],
        pot: 5.5,
        opponentAction: "あなたがコール。フロップ[K♥ 5♠ 2♦]。あなたがチェックすると、相手は「1.8BB（約1/3）」をベットしてきました。",
        precedingHistory: "【フロップ】[K♥ 5♠ 2♦]。あなたにはミドルペア(5のワンペア)と、ハート1枚のバックドアがあります。",
        options: {
          Raise: {
            label: "6.0BBにチェックレイズ",
            ev: -0.50,
            correct: false,
            explanation: "【大事故】ミドルペアをチェックレイズすると、相手のKやオーバーペアを呼んでしまい大赤字ドツボにハマります。最善はチェックコール一択です。",
            nextStackHero: 91.5,
            nextPot: 13.5
          },
          Call: {
            label: "1.8BBをコール",
            ev: 0.65,
            correct: true,
            explanation: "【GTO正解！】ミドルペア＋ハートバックドアは1/3ポットベットに対して完璧なマージナルバリューキャッチャーです。相手のJ10、QTなどのブラフハイカードから逃げずについていきます。",
            nextStackHero: 95.7,
            nextPot: 9.1
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【過剰フォールド】相手のハーフ/小型C-Betに5ペアをすぐ捨てるのは、エクスプロイト(標的)されやすい弱々しいプレイヤーの特徴です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          }
        }
      },
      {
        street: 'Turn',
        board: ["Kh", "5s", "2d", "4c"],
        pot: 9.1,
        opponentAction: "コール後にターンで[4♣]が落ち、あなたが衝撃の「2ペア(5と4)」に昇格！チェックすると、相手は「6.0BB（強バレル）」を継続しました。",
        precedingHistory: "【ターン】[4♣]。劇的な2ペアへの昇格！あなたはチェック、相手の強気の2発目(6BB)。",
        options: {
          Raise: {
            label: "18.0BBにチェックレイズ！ (バリューお仕置き)",
            ev: 2.80,
            correct: true,
            explanation: "【GTO最高決定！】ここがバリューポイントです！相手はKヒットを信じて気持ちよくベットしてきました。2ペアという隠れた破壊ハンドを見せてチェックレイズを返し、相手のトップペアから限界利益を奪取します！",
            nextStackHero: 77.7,
            nextPot: 33.1
          },
          Call: {
            label: "6.0BBをただコールする",
            ev: 1.50,
            correct: false,
            explanation: "【慎重すぎ】2ペアをただコールすると、リバーでAやQなどの不都合なカードが落ちてボードがロックされた際に価値追求が極めて難しくなります。ここでレイズを返すのが最善です。",
            nextStackHero: 89.7,
            nextPot: 21.1
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "2ペアで降りるのは論外です。",
            nextStackHero: 95.7,
            nextPot: 9.1
          }
        }
      }
    ]
  },
  {
    id: 14,
    title: "KJo - HJからのプリフディフェンス境界線と戦略的ギブアップの決断",
    heroHand: "Ks Jd",
    opponentHand: "Ah Qs",
    heroPosition: "CO",
    opponentPosition: "HJ",
    stackDepth: "100BB",
    winAmount: 0.0,
    showdownWinner: 'fold',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "HJが2.5BBにレイズでオープン。CO(カットオフ)のあなたに回りました。",
        precedingHistory: "【プリフロップ】100BBディープ。あなたの手札は(Ks Jd)。弱い絵札の組み合わせ(オフスート)です。",
        options: {
          Raise: {
            label: "7.5BBに3Betレイズする",
            ev: -0.30,
            correct: false,
            explanation: "【過剰攻撃】HJレイズに対してKJoで3Betブラフをするのは、レンジの支配(AQ, AK, AJ等)によりコールや4Betを食らった時の耐性が弱すぎるためお勧めできません。",
            nextStackHero: 92.5,
            nextPot: 11.5
          },
          Call: {
            label: "2.5BBをコール (インポジションを重視)",
            ev: -0.15,
            correct: false,
            explanation: "【落とし穴】KJoは「ドミネイト」を極めて食らいやすいマージナルハンドです。HJがAQやKQをオープンしている確率が非常に高く、もしKやJがヒットしても、相手のキッカー優位にハメられて大損する罠の選択肢です。",
            nextStackHero: 97.5,
            nextPot: 6.5
          },
          Fold: {
            label: "Fold (レンジ規律を厳守)",
            ev: 0.00,
            correct: true,
            explanation: "【GTO驚愕の完全正解！】素晴らしい！ポーカープロのように規律あるフォールドです。KJoはパッと見強そうですが、GTO基準でアーリー/ミドル(HJ)のタイトなオープンレンジに対してはCOからでも高頻度でピュア「フォールド」が推奨されます。無駄な傷を負わない強さがここにあります。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      }
    ]
  },
  {
    id: 15,
    title: "QQ - ボタンからの4Betバリュー戦略と積極コミットメント",
    heroHand: "Qh Qs",
    opponentHand: "Jh Tc",
    heroPosition: "BTN",
    opponentPosition: "SB",
    stackDepth: "100BB",
    winAmount: 22.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "あなたが2.5BBオープン。SBが10.0BBに巨大な3Bet。BBフォールド。手番がBTNのあなたに戻りました。",
        precedingHistory: "【プリフロップ】100BBディープ。ポケットクイーンズ(Qh Qs)。",
        options: {
          Raise: {
            label: "24.0BBに4Betを仕掛ける！",
            ev: 1.90,
            correct: true,
            explanation: "【GTO正解！】QQはSBのワイドな3Betに対して絶対強しのバリューレンジです。ただコールするとインポジションでもフロップAやKで沈黙せざるを得なくなります。自ら4Betを返し、ポットコミットを狙いましょう！",
            nextStackHero: 76.0,
            nextPot: 49.0
          },
          Call: {
            label: "10.0BBにただコール (スロープレイ)",
            ev: 1.10,
            correct: false,
            explanation: "【慎重すぎ】コールも混合であり得ますが、相手のAハイ、Kハイブラフにフリーカードを与えて、フロップでAやKが落ちた際に対処不能に陥るため、4Betで今すぐ主導権を確保するのが推奨されます。",
            nextStackHero: 90.0,
            nextPot: 21.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "プレミアムポケットペアQQを3Betだけで捨てるのは世紀の大エラーです。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Jh", "7d", "2s"],
        pot: 49.0,
        opponentAction: "相手が4Betにコール！フロップ[J♥ 7♦ 2♠]のクリーンなミドルボード。相手(SB)はチェックしました。あなたの残りスタックは76.0BBです。",
        precedingHistory: "【フロップ】巨大な4Betポット(49.0BB)。[J♥ 7♦ 2♠]。あなたのQQはオーバーペア最高の神盤面！",
        options: {
          Raise: {
            label: "16.0BBベット (約1/3ポット・コミットベット)",
            ev: 4.60,
            correct: true,
            explanation: "【GTO完璧大正解！】最高です。4Betポットではポットが大きいため、小さな1/3ベット(16.0BB)を打つだけで、相手のJペア(AJ, KJs)やTT-88の支払いを引き止めつつ、リバーでのシャブ(オールイン)への綺麗なラインを作ることができます。",
            nextStackHero: 60.0,
            nextPot: 81.0
          },
          Call: {
            label: "チェックバック (罠・スロープレイ)",
            ev: 2.20,
            correct: false,
            explanation: "【バリュー緩み】ここでチェックバックして不都合なKやAのフリーカードを相手にタダで配るのはあまりにも致命的なリスクになります。能動的に今すぐ搾取しましょう。",
            nextStackHero: 76.0,
            nextPot: 49.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "降ろされる心配は皆無です。",
            nextStackHero: 76.0,
            nextPot: 49.0
          }
        }
      }
    ]
  },
  {
    id: 16,
    title: "T9s - UTGオープンをターゲットにした巧妙なチェックレイズブラフ",
    heroHand: "Th 9h",
    opponentHand: "As Kd",
    heroPosition: "BB",
    opponentPosition: "UTG",
    stackDepth: "100BB",
    winAmount: 14.5,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "タイトなUTGが2.5BBにオープン。BTN、SBフォールド。BBのあなたに回りました。",
        precedingHistory: "【プリフロップ】100BB。あなたの手札は(Th 9h)。おなじみのスーテッドコネクター。",
        options: {
          Raise: {
            label: "3Bet: 10.0BBにレイズ",
            ev: 0.10,
            correct: false,
            explanation: "【危険】UTGのタイトなオープンに対してT9sで3Betをするのは自殺行為になりがちです。よりタイトな相手に対してはコールでインプライドオッズを狙うのが賢い防衛法です。",
            nextStackHero: 90.0,
            nextPot: 21.0
          },
          Call: {
            label: "2.5BBにコール (ディフェンス)",
            ev: 0.50,
            correct: true,
            explanation: "【GTO正解！】オッズとポジションのアドバンテージ（オッズ適合）が認められ、T9sはBBでの鉄板コール防衛範囲内です。ターン以降の捲りを期待します。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【弱腰】T9sのような強いスーテッドをBTNやHJではなく、UTGからでもBBならオッズがよいため捨てないのが最新GTOです。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Jh", "7s", "2d"],
        pot: 5.5,
        opponentAction: "あなたがチェック。UTGは「1.8BB」をC-Betしてきました。フロップは[J♥ 7♠ 2♦]（ハート1枚とバックドアストドロ）。",
        precedingHistory: "【フロップ】[J♥ 7♠ 2♦]。あなたにはバックドアフラッシュと、バックドアガット(8-T9-J)等への発展性の含みがあります。",
        options: {
          Raise: {
            label: "6.5BBにチェックレイズ！ (セミブラフ始動)",
            ev: 0.85,
            correct: true,
            explanation: "【GTO超プロ級正解！】これぞ高段位ポーカー！Jハイドライボードでは、UTGの1/3ポットC-Betは単なる自動C-Bet(ブラフ含む空振りAKなど)がほとんどです。ここにT9s(ハートバックドア付)で見事な「チェックレイズブラフ」を叩き込むことで、相手のAK/AQを瞬時に払い落とすか、もしコールされてもターンでの大逆転アウト（ハート、8、Qなど）を活かして圧倒的期待値を絞り出します！",
            nextStackHero: 91.0,
            nextPot: 13.8
          },
          Call: {
            label: "1.8BBをピュアコール",
            ev: 0.35,
            correct: false,
            explanation: "【消極ミスティック】ハイカードも全くヒットしていないT9sでチェックコールに留めると、ターンで何も引けなかった場合にただのゴミになり自らチェックフォールドする悲しい限界を迎えてしまいます。アグレッシブに行きましょう。",
            nextStackHero: 95.7,
            nextPot: 9.1
          },
          Fold: {
            label: "Fold",
            ev: 0.45,
            correct: false,
            explanation: "【消極フォールド】降りるのも無難に見えますが、ハイレベルな対抗戦略としてはこのバックドア付き優良ハンドをブラフレンジの核に回すのが極めて利益的です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          }
        }
      }
    ]
  },
  {
    id: 17,
    title: "ATs - ミドルポジションからの2ペア神バリューと慎重なスロープレイ",
    heroHand: "Ah Th",
    opponentHand: "As Qd",
    heroPosition: "MP",
    opponentPosition: "UTG",
    stackDepth: "100BB",
    winAmount: 26.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "UTGが2.5BBにオープン。あなたがMP(ミドルポジション)です。",
        precedingHistory: "【プリフロップ】あなたの手札は(Ah Th)。極めて美しいエーススーテッド。",
        options: {
          Raise: {
            label: "7.5BBに3Betレイズする",
            ev: 0.20,
            correct: false,
            explanation: "【危険：ドミネイト可能性高】UTGオープンに対してMPからのATsは、コールして様子を見るのがGTO混合戦略の王道です。3Betを仕掛けると、相手のAQ, AK, AJ等にドミネイトされたまま高額なポットを作る破滅リスクを呼び込みます。",
            nextStackHero: 92.5,
            nextPot: 11.5
          },
          Call: {
            label: "2.5BBをコール (ディフェンス併用)",
            ev: 0.70,
            correct: true,
            explanation: "【GTO正解！】ATsはコールして慎重にフロップを引きに行くのに最高のスペックを持ちます。マルチウェイまたはペア完成、フラッドドローに期待します。",
            nextStackHero: 97.5,
            nextPot: 6.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "エーススーテッド中位をオープンに対して即捨てはタイト過剰です。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Ad", "Tc", "7s"],
        pot: 6.5,
        opponentAction: "あなたがコールし、フロップ[A♦ T♣ 7♠]（極上の2ペア！）。UTGチェック。",
        precedingHistory: "【フロップ】[A♦ T♣ 7♠]。あなたが2ペア(AとT)を獲得。相手のチェックが入りました。",
        options: {
          Raise: {
            label: "4.0BBにベット (バリューバースト)",
            ev: 2.10,
            correct: true,
            explanation: "【GTO正解！】完璧です！相手がUTGでチェックしてきたため、AK、AQなどの強ハイカードを引き連れているかドロー（QJや7ペア）を守っている可能性が高いです。ここでしっかりと「4BB」を能動ベットし、ポットを適正に大きくしていきます。",
            nextStackHero: 93.5,
            nextPot: 14.5
          },
          Call: {
            label: "チェックバック (罠・スロー)",
            ev: 1.40,
            correct: false,
            explanation: "【不利益】非常に強い2ペアですが、相手のチェックに対してただチェックしてパスするのはバリューを失いすぎます。相手はA持っていれば喜んでコールしてくれます。",
            nextStackHero: 97.5,
            nextPot: 6.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "最高の2ペアで自ら降りる戦略は宇宙空間にしかありません。",
            nextStackHero: 97.5,
            nextPot: 6.5
          }
        }
      }
    ]
  },
  {
    id: 18,
    title: "KJs - ポットコントロールチェックバックとリバーの鮮やかなブラフキャッチ",
    heroHand: "Kh Jh",
    opponentHand: "Qd Td",
    heroPosition: "HJ",
    opponentPosition: "BB",
    stackDepth: "100BB",
    winAmount: 16.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "あなたがHJから2.5BBにオープン。BBがコール。あなた手番です。",
        precedingHistory: "【プリフロップ】スタック: 100BB。手札(Kh Jh)。",
        options: {
          Raise: {
            label: "2.5BBにオープンレイズ",
            ev: 0.50,
            correct: true,
            explanation: "【GTO正解！】HJ位置からのKJsは、当然100%オープンレイズの基本対象です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Call: {
            label: "1.0BBコール",
            ev: 0.05,
            correct: false,
            explanation: "【ミス】アーリー/ミドルでリンプインするのは損失行為です。",
            nextStackHero: 99.0,
            nextPot: 2.0
          },
          Fold: {
            label: "Fold",
            ev: 0.10,
            correct: false,
            explanation: "KJsは非常に高いスチールパワーを持つバリュー手札です。捨てるべきではありません。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Kc", "9s", "4d"],
        pot: 5.5,
        opponentAction: "BBチェック。フロップ[K♣ 9♠ 4♦]（トップペア、Jキッカー）。",
        precedingHistory: "【フロップ】あなたがオープン、BBコール。盤面はKハイ。あなたはトップペア(K)を確保。",
        options: {
          Raise: {
            label: "2.0BBにベット (約35%ポットC-Bet)",
            ev: 1.20,
            correct: true,
            explanation: "【GTO正解！】トップペアですがキッカーがJ（中位）です。BBのミドルペアやガットドロー(QJ, JT)から広く安い支払いをもぎ取るため、小ぶりの1/3ポットベットを叩き込みます。",
            nextStackHero: 95.5,
            nextPot: 9.5
          },
          Call: {
            label: "チェックバック (フリーカード許容)",
            ev: 0.70,
            correct: false,
            explanation: "【弱気】チェックバックするのも悪くない（弱目のKなど）ですが、一般的にはKJsのように強いワンペアなら一度ベットを打ち、主導権と価値を明確に請求するのが現代ポーカーの流れです。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "トップペアで降りるのは致命的なエラーです。",
            nextStackHero: 97.5,
            nextPot: 5.5
          }
        }
      },
      {
        street: 'Turn',
        board: ["Kc", "9s", "4d", "Qs"],
        pot: 9.5,
        opponentAction: "あなたが2BB、BBはコール。ターンで[Q♠]が落ち、BBは「チェック」しました。",
        precedingHistory: "【ターン】[Q♠]の出現。ボードにストレートドロー(JT)が完全に成立。あなたのトップペアキッカーが危険にさらされます。",
        options: {
          Raise: {
            label: "5.5BBにベット (強バレル)",
            ev: 0.20,
            correct: false,
            explanation: "【過剰バリュー（罠へのダイブ）】ここでターンさらに強気でベットすると、相手の2ペア(KQ)やストレート完成(JT)、セットにだけ捕まり、弱っている手を全部降ろしてしまうため、チェックバックでポットを安全管理するのがGTO至上主義です。",
            nextStackHero: 90.0,
            nextPot: 20.5
          },
          Call: {
            label: "チェックバック (ポットコントロール)",
            ev: 1.10,
            correct: true,
            explanation: "【GTO神回正解！】美しい！トップペア・マージナルキッカーはポット拡大を避け、「チェックバック」してリバーで相手のブラフを誘う（ブラフキャッチャー化する）のが、GTOソルバーが教えてくれる最高の守備ポーカーです。",
            nextStackHero: 95.5,
            nextPot: 9.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "チェックバックの機会があるのにフォールドするのは非合理的です。",
            nextStackHero: 95.5,
            nextPot: 9.5
          }
        }
      }
    ]
  },
  {
    id: 19,
    title: "QJs - MTTミドルスタックでのポジションを活かしたアグレッシブピボット",
    heroHand: "Qd Jd",
    opponentHand: "Kc Ts",
    heroPosition: "BTN",
    opponentPosition: "HJ",
    stackDepth: "40BB",
    winAmount: 10.5,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "HJが2.2BBにオープン。SBフォールド。BTNのあなたに回りました。",
        precedingHistory: "【プリフロップ】スタック: 40BB (MTT中盤戦)。あなたの手札は(Qd Jd)。",
        options: {
          Raise: {
            label: "6.0BBに3Betレイズ (牽制)",
            ev: 0.15,
            correct: false,
            explanation: "【スタック不適合】40BBのトーナメント戦において、QJsで3Betを打ってコールや4Betオールインを食らうと、あなたの極めて貴重な40BBの大半を瞬時に失い、泥沼に叩き落とされます。最も安全な「コール」を選択してください。",
            nextStackHero: 34.0,
            nextPot: 13.5
          },
          Call: {
            label: "2.2BBをフラットコール",
            ev: 0.65,
            correct: true,
            explanation: "【GTO正解！】QJsは非常に高いディフェンス勝率を持ちます。40BBという浅いスタックでもコールに留めておくことで、高勝率状態で相手のポット管理エラーをインポジションから美味しくいただく体制を作ります。",
            nextStackHero: 37.8,
            nextPot: 5.9
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "QJsをド真ん中のBTNオープンディフェンス局面で無条件カットするのは消極主義のミスプレイです。",
            nextStackHero: 40.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Kh", "Tc", "2s"],
        pot: 5.9,
        opponentAction: "相手(HJ)は強気に「2.5BB（ハーフポット）」をベットしました。",
        precedingHistory: "【フロップ】[Kh Tc 2s]。あなたはQ-Jを握って、インサイドストレートドロー(Aアウト4枚)と、オーバーカード(Q, J)を狙います。",
        options: {
          Raise: {
            label: "7.0BBにレイズブラフ",
            ev: -0.40,
            correct: false,
            explanation: "【自殺行為】40BBスタックでKハイボードにハーフベットをしてきた相手に対し、純粋なブラフレイズを仕掛けるのは無謀の極みです。ここは今すぐ潔く「フォールド」すべきです。",
            nextStackHero: 30.8,
            nextPot: 19.9
          },
          Call: {
            label: "2.5BBをコール (追いかける)",
            ev: -0.10,
            correct: false,
            explanation: "【ミス】オッズ算出して見ましょう。40BB環境で、ストレートアウツがわずか4枚(9のみ)しかないインサイドナッツのためにハーフポットをコールで追うのは、完全に数学を無視した期待値大崩壊のリーク（損失犯行）です。",
            nextStackHero: 35.3,
            nextPot: 10.9
          },
          Fold: {
            label: "Fold (賢者の撤退)",
            ev: 0.00,
            correct: true,
            explanation: "【GTO正解！！】実にお見事！KハイボードにおけるQJは、十分なアウツがなく、スタックサイズ40BBの状況下では無理に追いかけるべきではありません。引けない時は即時に潔く1円も支払わずにフォールドするのが、プロンプトトーナメント攻略の鉄則です。",
            nextStackHero: 37.8,
            nextPot: 5.9
          }
        }
      }
    ]
  },
  {
    id: 20,
    title: "AQo - マージナル3Betのドミネーション回避とフォールドの選択肢",
    heroHand: "Ah Qd",
    opponentHand: "Kd Kc",
    heroPosition: "MP",
    opponentPosition: "UTG",
    stackDepth: "100BB",
    winAmount: 0.0,
    showdownWinner: 'fold',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "UTGが極めてタイトなプレイスタイルで3.0BBにオープン。HJ、COフォールド。手番がMPのあなたに回りました。",
        precedingHistory: "【プリフロップ】100BBディープ。あなたの手札は(Ah Qd)。",
        options: {
          Raise: {
            label: "9.5BBへ3Betレイズする",
            ev: -0.25,
            correct: false,
            explanation: "【GTOミステイク】非常にタイトなUTGのオープン(通常J+、AK)に対し、AQオフスートで3Betを仕掛けるのは「セルフドミネイト（AA, KK, AKに容易に捕まる）」の最悪の失策です。",
            nextStackHero: 90.5,
            nextPot: 20.5
          },
          Call: {
            label: "3.0BBをただコール",
            ev: 0.10,
            correct: false,
            explanation: "【マージナル：EV超小】コールも一部許容されますが、やはりUTGの最強レンジに対してオフスートAQはポストフロップでキッカー問題（もしAが当たってもAKに大敗）に泣かされる危険性が極めて大きいです。",
            nextStackHero: 97.0,
            nextPot: 7.5
          },
          Fold: {
            label: "Fold (完全プロ規律の降り)",
            ev: 0.00,
            correct: true,
            explanation: "【最高峰GTO正解！】神プレイ！驚くかもしれませんが、タイトなUTGの3倍オープンに対して、オフスートのAQ(AQo)はミドルポジションから「ピュアフォールド」するのがGTOの非常に高い推奨（または混合最頻）です。大事故に巻き込まれる前にスマートに降りる、これこそが超一流の神盾です。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      }
    ]
  },
  {
    id: 21,
    title: "AQs - ダブルガットストドローの攻撃的チェックコールと逆転劇",
    heroHand: "As Qs",
    opponentHand: "Jh Th",
    heroPosition: "BTN",
    opponentPosition: "BB",
    stackDepth: "100BB",
    winAmount: 18.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "BTNのあなたにオープン権利がきました。",
        precedingHistory: "【プリフロップ】100BB。あなたの手札は(As Qs)。",
        options: {
          Raise: {
            label: "2.5BBにオープン",
            ev: 1.10,
            correct: true,
            explanation: "【GTO正解！】言うまでもありません！AQsは100%オープンレイズを行います。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Call: {
            label: "1.0BBコール (リンプ)",
            ev: 0.20,
            correct: false,
            explanation: "【大損失】最高クラスのスーテッドエースでリンプするのは自らバリューを捨てています。",
            nextStackHero: 99.0,
            nextPot: 2.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "AQsフォールドは即ゲームアンインストールレベルの退化です。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Kd", "Js", "3c"],
        pot: 5.5,
        opponentAction: "BBがコール。フロップは[K♦ J♠ 3♣]で、BBは「チェック」。あなたが2.0BB(1/3ポットC-Bet)を打つと、BBは強硬に「7.0BB」にチェックレイズしてきました！",
        precedingHistory: "【フロップ】[K♦ J♠ 3♣]（両面ガット：9およびTアウト8枚＋スペードバックドア）。あなたは2BBを打つが、いきなり7BBへとチェックレイズ（牙剥き）を被りました。",
        options: {
          Raise: {
            label: "16.0BBに3ベットレイズ（突貫）",
            ev: -0.80,
            correct: false,
            explanation: "【過激すぎ】ここでさらにレイズを返すと相手のセット(JJ)や2ペアに完全にシャットアウトされ、せっかくのハイクオリティなドローがフォールドアウトを強いられます。ここは「コール」で相手のレンジを観察しましょう。",
            nextStackHero: 81.5,
            nextPot: 32.5
          },
          Call: {
            label: "7.0BBをコールして耐え抜く",
            ev: 1.25,
            correct: true,
            explanation: "【GTO正解！】見事な思考判断です！AQsにはエースオーバーカード＋強烈な「ダブルガットストレートドロー（TならK-Q-J-T-[A]、9ならQ-J-[T]-9-[K]でいずれもストレート成立のアウツ8枚）」が存在します。チェックレイズを完全にコールして、ターンでの大暴れを狙うのが至高のポーカーです。",
            nextStackHero: 90.5,
            nextPot: 19.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "【臆病すぎる】ダブルガット＋ハイカード2枚をフロップでフォールドするのはインプライドオッズを全て自演無視する重大なポーカーのエラーです。",
            nextStackHero: 95.5,
            nextPot: 7.5
          }
        }
      }
    ]
  },
  {
    id: 22,
    title: "KTs - ターンヒット時のマージナルチェックバックとリバーのバリュー誘い込み",
    heroHand: "Kh Ts",
    opponentHand: "Qs Jd",
    heroPosition: "BTN",
    opponentPosition: "BB",
    stackDepth: "100BB",
    winAmount: 11.5,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "BTNのあなたに順番が回りました。",
        precedingHistory: "【プリフロップ】あなたの手札は(Kh Ts)。BTNからの高頻度スチールコア。スタック：100BB。",
        options: {
          Raise: {
            label: "2.5BBにオープン",
            ev: 0.40,
            correct: true,
            explanation: "【GTO正解！】BTNでのKTsは、文句なしの100%オープンレイズ枠です。ブラインドに安価に勝たせず主導権を奪います。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Call: {
            label: "1.0BBコール",
            ev: -0.10,
            correct: false,
            explanation: "【失策】BTNでのリンプはGTO的に利益が最も出にくいポンコツプレイの一つです。",
            nextStackHero: 99.0,
            nextPot: 2.0
          },
          Fold: {
            label: "Fold",
            ev: 0.10,
            correct: false,
            explanation: "【タイト。スチール機会損失】KTsは依然として良好なレンジ支配が可能、フォールドは消極的すぎます。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Kc", "9h", "8d"],
        pot: 5.5,
        opponentAction: "BBがコール。フロップ[K♣ 9♥ 8♦]のヒット＆極めてドローが豊富なウェットボード！BBはチェック。",
        precedingHistory: "【フロップ】[K♣ 9♥ 8♦]。あなたはトップペア(K、Tキッカー)。相手チェック。",
        options: {
          Raise: {
            label: "2.0BBベット (約35%ポットC-Bet)",
            ev: 0.85,
            correct: true,
            explanation: "【GTO正解！】トップペアですのでしっかりとベットします。JTやQJなどの各種ストレート・フラッシュ候補が多いウェットボードですので、バリュー請求＋相手のフリーカード阻止のために小型ベットを叩き込みます。",
            nextStackHero: 95.5,
            nextPot: 9.5
          },
          Call: {
            label: "チェックバック (罠・ポットコントロール)",
            ev: 0.40,
            correct: false,
            explanation: "【危険】この極度に危険なドライでない、ストレートアウトが大量にあるウェットボードで、トップペアがチェックバックを置くのは、相手に無料ストレート成立権を与える非常にハイリスクなプレイです。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "トップペアをチェック時点で投棄することはありません。",
            nextStackHero: 97.5,
            nextPot: 5.5
          }
        }
      },
      {
        street: 'Turn',
        board: ["Kc", "9h", "8d", "Qc"],
        pot: 9.5,
        opponentAction: "相手(BB)はあなたの2.0BBベットをコール。ターンで[Q♣]が落ちました。BBは「チェック」しました。",
        precedingHistory: "【ターン】[Q♣]。これはボードを一気に激変させました。JTならストレート完成、相手は2ペアやKペア＋ドローを広く保有しています。",
        options: {
          Raise: {
            label: "6.0BBを追加ベット (さらにダブルバレル)",
            ev: -0.40,
            correct: false,
            explanation: "【破滅への一歩】ターンでQが落ちたことで、相手はQヒットでの向上、またはJTなどのストレート完成が大幅に含まれます。このQボードで依然として10引きトップペアを強打し続けると、相手の強い役やフラッシュ含む2ペアにだけ捕まり大赤字になるため、チェックバックで無料のショウダウン狙いに回るのがGTO黄金律です！",
            nextStackHero: 89.5,
            nextPot: 21.5
          },
          Call: {
            label: "チェックバック (完璧なポット調整)",
            ev: 1.10,
            correct: true,
            explanation: "【GTO極上正解！】その通り！この激ウェット盤面における弱トップペアは、能動ベットすると危険極まりないです。チェックバックして、リバーでショウダウンを安価に見に行く体制を作り、相手のブラフ意欲を温存させるのがソルバー推奨です。",
            nextStackHero: 95.5,
            nextPot: 9.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "ギブアップは不要です。チェックバック権利があります。",
            nextStackHero: 95.5,
            nextPot: 9.5
          }
        }
      }
    ]
  },
  {
    id: 23,
    title: "76s - BBからのオープンエンドストレート極大チェックレイズバリュー",
    heroHand: "7d 6d",
    opponentHand: "As Ks",
    heroPosition: "BB",
    opponentPosition: "BTN",
    stackDepth: "100BB",
    winAmount: 24.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "BTNが2.5BBにオープン。SBフォールド。BBのあなたに番です。",
        precedingHistory: "【プリフロップ】スタック：100BB。あなたの手札は(7d 6d)のスーテッドコネクター。",
        options: {
          Raise: {
            label: "3Bet: 10.0BBにレイズ",
            ev: 0.20,
            correct: false,
            explanation: "【高頻度コール推奨】たまに3Betブラフをかける混合もありますが、76sはBBにおいて完全に100%「コール」が最大利益。オッズが非常に安いため、マルチに耐性を活かしてディフェンスしましょう。",
            nextStackHero: 90.0,
            nextPot: 21.0
          },
          Call: {
            label: "2.5BBをフラットコール (防衛成功)",
            ev: 0.80,
            correct: true,
            explanation: "【GTO正解！】オッズ完璧、優れたディフェンス。コールして、破壊力抜群のストレートやフラッシュドローをじっくり狙います。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "76sをBTNの平たいオープンで放棄するのは、オッズ損失を甚大にするミステークです。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["9d", "8h", "5c"],
        pot: 5.5,
        opponentAction: "あなたがチェック。BTNが「3.5BB（約65%ポットの強C-Bet）」を打ってきました。フロップは[9♦ 8♥ 5♣]。あなたはオープンエンド(OESD)！",
        precedingHistory: "【フロップ】[9♦ 8♥ 5♣]（オープンエンド：3のアウト4枚、Tのアウト4枚、計8枚）。相手の強気のC-Bet。",
        options: {
          Raise: {
            label: "11.0BBへチェックレイズ！ (爆弾セミブラフ)",
            ev: 1.45,
            correct: true,
            explanation: "【GTO完全正解！！】これぞ爆発。相手は985という非常に湿った、BTNのハイカード(AK/AQ)を破壊しやすい盤面でもアグレッシブに打ってきました。ここで76sという最強クラスの「オープンエンドストレートドロー」を使って11BB前後に大きなチェックレイズ（チェックレイズ・セミブラフ）を叩き返すことで、相手を即死(Fold)させるか、コールされてもターンでの巨大なインプライドを仕込む、現代最強のGTO常套手段です！",
            nextStackHero: 86.5,
            nextPot: 20.0
          },
          Call: {
            label: "3.5BBをコール (引きに行く)",
            ev: 0.90,
            correct: false,
            explanation: "【タイト消極】コールするのも悪くありませんが、このウェットボードはBTN側のレンジ（オーバーハイカード）を圧迫する最大のチャンスです。チェックコールだけで優しく流すと、主導権を奪われ不利になります。レイズが支配的です。",
            nextStackHero: 94.0,
            nextPot: 12.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "アウト8枚を投げ捨てるアクションはGTO上完全に追放されます。",
            nextStackHero: 97.5,
            nextPot: 5.5
          }
        }
      }
    ]
  },
  {
    id: 24,
    title: "A9s - SB 20BBショートスタックトーナメントでのプッシュオアフォールド",
    heroHand: "Ah 9h",
    opponentHand: "Jh Tc",
    heroPosition: "SB",
    opponentPosition: "BTN",
    stackDepth: "20BB",
    winAmount: 13.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "BTNが2.0BBにオープン。あなたはSB位置、残り20BBです。",
        precedingHistory: "【プリフロップ】20BBショートのファイナルゲーム。あなたの手札は優秀な(Ah 9h)。",
        options: {
          Raise: {
            label: "オールイン(20BB Shove/3Bet Shove)！",
            ev: 1.80,
            correct: true,
            explanation: "【GTO大正解！！】20BBのショートスタック状況におけるSBからのA9sは、相手のBTNからの高頻度なマージナルオープンを完璧に粉砕し、強権的にフォールドを奪い取る、非の打ち所のない「3Bet 20BBジャムオールイン(Shove)」の鉄板境界ハンドです。オッズ獲得とスチールで即利益を獲得します！",
            nextStackHero: 0.0,
            nextPot: 23.5
          },
          Call: {
            label: "2.0BBをコールバック",
            ev: 0.40,
            correct: false,
            explanation: "【ミステイク：ポストフロップ崩壊】20BBの浅すぎる環境で、A9sをSBからピュアコールすると、OOP(アウトオブポジ)で極めて難しい局面にハメられ、スタックの半分を自動ギブアップする羽目になります。オールイン一択です。",
            nextStackHero: 18.0,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "ショートスタックでこれほど強力のA9スーテッドを即諦めするのは、自らバストアウトを選ぶ不運のプレイングです。",
            nextStackHero: 20.0,
            nextPot: 1.5
          }
        }
      }
    ]
  },
  {
    id: 25,
    title: "65s - COからのタイトなレンジ規律と不要な3Betからの逃走",
    heroHand: "6d 5d",
    opponentHand: "Jc Jd",
    heroPosition: "CO",
    opponentPosition: "UTG",
    stackDepth: "100BB",
    winAmount: 0.0,
    showdownWinner: 'fold',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "タイトなUTGが3.0BBの3倍に大きくオープン。あなたがCO(カットオフ)です。",
        precedingHistory: "【プリフロップ】100BBディープ。あなたの手札は(6d 5d)スーテッドコネクターです。",
        options: {
          Raise: {
            label: "9.5BBに3Betレイズする",
            ev: -0.40,
            correct: false,
            explanation: "【大事故】相手は超強力レンジのUTGオープンです。65sでミドルから3Betを仕掛けると、後ろのBTNやBB、そしてUTG本人からの4Betオールインにより、せっかくの資産を即失う破滅を招きます。",
            nextStackHero: 90.5,
            nextPot: 21.0
          },
          Call: {
            label: "3.0BBをコール",
            ev: -0.20,
            correct: false,
            explanation: "【ミス】一見インポジションで強そうですが、UTGのオープンサイズが3倍（3BB）というかなり強気の状況下では、65sのようなローコネのコール期待値は完全にマイナス域にドロップします。後ろにBBスクイーズがいることを忘れてはいけません。",
            nextStackHero: 97.0,
            nextPot: 7.5
          },
          Fold: {
            label: "Fold (完全プロ防衛のフォールド)",
            ev: 0.00,
            correct: true,
            explanation: "【GTO最高決定！】見事です！この1回のフォールドに強靭なプロ意識が感じられます。GTOのポジション戦略において、UTGの3BBのようなタイト強化オープンに対し、COでの65sは「ピュアフォールド」が最適解です。不条理な戦いを自動シャットアウトします。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      }
    ]
  },
  {
    id: 26,
    title: "AA - BB位置での神懸かり的な3Betバリューとリバートラップ",
    heroHand: "Ah Ac",
    opponentHand: "Ks Jd",
    heroPosition: "BB",
    opponentPosition: "SB",
    stackDepth: "100BB",
    winAmount: 19.5,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "SBが3.0BBにオープン。あなたがBBで手札は最強無比(Ah Ac)です！",
        precedingHistory: "【プリフロップ】100BB。ブラインド対ブラインドの極限戦闘。あなたの手にはポケットエース。",
        options: {
          Raise: {
            label: "10.0BBに大きく3Betレイズ(バリューの主張)！",
            ev: 1.90,
            correct: true,
            explanation: "【GTO正解！】当然です！AAはBBでも100% 3Bet。SBのルースな多くのマージナルレンジを締め上げ、ポットを一気に引き上げます。",
            nextStackHero: 90.0,
            nextPot: 20.0
          },
          Call: {
            label: "3.0BBを静かにただコールする (罠リンプ)",
            ev: 1.10,
            correct: false,
            explanation: "【マージナル：EV低下】一部トラップとしてコールするGTO混合もありますが、SB対BBはレンジが非常にワイドであるため、3Betを打ってポットを最大化させるのが王立GTOバリューラインです。",
            nextStackHero: 97.0,
            nextPot: 6.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "AAをBBで捨てるのはポーカー狂気の沙汰です。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Kh", "8d", "2s"],
        pot: 20.0,
        opponentAction: "SBはあなたの3Betをコール。フロップ[K♥ 8♦ 2♠]のKハイ乾いたボード。SBは「チェック」しました。",
        precedingHistory: "【フロップ】[K♥ 8♦ 2♠]。あなたのAAは神がかり的なオーバーペア状態。相手チェック。",
        options: {
          Raise: {
            label: "6.5BBベット (約1/3ポットバリュー)",
            ev: 2.45,
            correct: true,
            explanation: "【GTO正解！】完璧です！Kヒットを抱えたSBは死ぬまでついてきます。このドライ board では、相手を引き留めて不必要なフォールドを防ぐため、1/3ポットの優しく高価値なベットでバリューを築き上げます。",
            nextStackHero: 83.5,
            nextPot: 33.0
          },
          Call: {
            label: "チェックバック (罠・スロープレイ)",
            ev: 1.50,
            correct: false,
            explanation: "【バリュー流出】相手がK（トップペア）を持っている確率が極めて高く、自発ベットしてチップをかっ攫うだけの簡単なお仕事。チェックバックで逃げる必要はありません。",
            nextStackHero: 90.0,
            nextPot: 20.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "もちろんできません。",
            nextStackHero: 90.0,
            nextPot: 20.0
          }
        }
      }
    ]
  },
  {
    id: 27,
    title: "44 - 3Betスクイーズコールのセットマイニングとフロップ爆発",
    heroHand: "4c 4d",
    opponentHand: "As Kh",
    heroPosition: "BTN",
    opponentPosition: "SB",
    stackDepth: "100BB",
    winAmount: 23.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "HJが2.5BBオープン。あなたがBTNで2.5BBをコール、SBが「12.0BB」という超巨大スクイーズ(3Bet)を仕掛けました！HJフォールド。BTNのあなたに回りました。",
        precedingHistory: "【プリフロップ】100BB。ポケットフォー(4c 4d)。BTNコールした状態でSBの強搾取12BBスクイーズ。",
        options: {
          Raise: {
            label: "オールイン(残り97.5BB)",
            ev: -1.80,
            correct: false,
            explanation: "【大失策】44で100BBをプリフロップでSBスクイーズに対してオールインするのは狂気のアクシデントです。高確率でQQ+やAKに捕まり即死します。",
            nextStackHero: 0.0,
            nextPot: 115.0
          },
          Call: {
            label: "12.0BBにコールして『セットマイニング』",
            ev: 0.50,
            correct: true,
            explanation: "【GTO正解！】お見事！ポットが既にHJ、BTN、SB込みで18.5BB近くに膨張しています。44のペアはプリプロップでコールし、フロップ「セット（4の3カード）」を引いて（確率約12%）相手のAKやAA/KKから一瞬で100BBを奪い取る、インプライドオッズ適合の『セットマイニング』が推奨されます。",
            nextStackHero: 88.0,
            nextPot: 26.5
          },
          Fold: {
            label: "Fold",
            ev: 0.40,
            correct: false,
            explanation: "【タイト】フォールドも悪くありませんが、100BBディープでオッズがよくインポジションであればコールして一発爆発フルチャージを狙いに行くのがGTO利益的です。",
            nextStackHero: 97.5,
            nextPot: 14.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Qh", "4s", "2d"],
        pot: 26.5,
        opponentAction: "あなたがコール！フロップに[Q♥ 4♠ 2♦]（奇跡の4セット完成！）。SBは「10.0BB」を力強く打ってきました。残りスタックは88BB。",
        precedingHistory: "【フロップ】[Q♥ 4♠ 2♦]。あなたはローセット(4)を極限獲得。相手のエヌ・ベット10BB。",
        options: {
          Raise: {
            label: "25.0BBに大きなレイズ！ (バリュー大放出)",
            ev: -0.20,
            correct: false,
            explanation: "【急ぎすぎドツボ】このドライボードで即レイズしてしまうと、SBの持っているAKやJ10等のドローブラフを即座にフォールドさせてしまい、せっかくの100BBの最大化機会を台無しにしてしまいます。ここは「チェックコール（フラットコール）」して相手のターンを誘発させるのがプロポーカーです。",
            nextStackHero: 63.0,
            nextPot: 61.5
          },
          Call: {
            label: "10.0BBをフラットコール (相手を罠にはめる)",
            ev: 2.10,
            correct: true,
            explanation: "【GTO大正解！！！】完璧です！お見事！相手のプレフロップスクイザー(AA, KK, AK)はこのQ-4-2のような無害なボードで高頻度でダブルバレル（2連続ベット）を打ち続けます。ここでレイズせずに優しくコールして次のターンで全スタックを奪い取るラインを確定します。",
            nextStackHero: 78.0,
            nextPot: 46.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "セットの投機フォールドはただただあり得ません。",
            nextStackHero: 88.0,
            nextPot: 26.5
          }
        }
      }
    ]
  },
  {
    id: 28,
    title: "KQs - MTTファイナルテーブルでのバブルコントロールとマージナルフォールド",
    heroHand: "Kh Qh",
    opponentHand: "Ah Ad",
    heroPosition: "CO",
    opponentPosition: "UTG",
    stackDepth: "30BB",
    winAmount: 0.0,
    showdownWinner: 'fold',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "UTG(極めて堅実なチップリーダー)が3.0BBにオープン。HJフォールド。あなたがCO、残り30BB(インザマネー/賞金バブル直前)です。",
        precedingHistory: "【プリフロップ】トーナメントバブル期極限状態。あなたの手札は(Kh Qh)。",
        options: {
          Raise: {
            label: "オールイン(30BB Shove)！",
            ev: -2.10,
            correct: false,
            explanation: "【大失策バブルアウト】もっともダメなバブル期のエキセントリックアクション。最も堅いUTGのインレンジ（AA-QQ, AKのみ）に対し、30BBでKQスーテッドを突っ込むと相手にスナップコールされバブルアウト(即飛び・賞金0円)を食らいます。",
            nextStackHero: 0.0,
            nextPot: 34.5
          },
          Call: {
            label: "3.0BBをコールバック",
            ev: -0.80,
            correct: false,
            explanation: "【ミステイク：コミットハメ】バブル状況下において、30BBしか持たないあなたが3BBをコールしてフロップを覗き、もしKやQが落ちても勝てている保証はなく、大半のスタックを簡単に掠め取られます。リスク回避第一です。",
            nextStackHero: 27.0,
            nextPot: 7.5
          },
          Fold: {
            label: "Fold (バブル戦術・賞金確保の英断)",
            ev: 0.00,
            correct: true,
            explanation: "【GTO最高の完全正解！】素晴らしい！！これこそが本当のICM(トーナメント生涯期待値)＆バブル戦術の極意です！通常のキャッシュゲームならKQsはコール可能ですが、バブル期(30BB)のタイトUTGオープンに対し、COからKQsを「ピュアフォールド」して確実に賞金を確定させていくのが、世界トッププロも実践する至高の撤退術です！",
            nextStackHero: 30.0,
            nextPot: 1.5
          }
        }
      }
    ]
  },
  {
    id: 29,
    title: "JTs - フロップOESD完成時の高期待値アプローチとインプライド強奪",
    heroHand: "Jh Tc",
    opponentHand: "As Qd",
    heroPosition: "BTN",
    opponentPosition: "BB",
    stackDepth: "100BB",
    winAmount: 16.5,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "BTNのあなたにオープンが回りました。",
        precedingHistory: "【プリフロップ】手札(Jh Tc)。スタック：100BB。",
        options: {
          Raise: {
            label: "2.5BBにオープンレイズ",
            ev: 0.35,
            correct: true,
            explanation: "【GTO正解！】JToはBTNからの定番オープンレンジです。ブラインドを攻撃します。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Call: {
            label: "1.0BBコール",
            ev: -0.15,
            correct: false,
            explanation: "【ミステイク】BTNからのオフスートリンプは利益に貢献しません。",
            nextStackHero: 99.0,
            nextPot: 2.0
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "BTNのこれほど強いマージナルハンドを即降りするようでは優位を発揮できません。",
            nextStackHero: 100.0,
            nextPot: 1.5
          }
        }
      },
      {
        street: 'Flop',
        board: ["Kh", "9d", "2s"],
        pot: 5.5,
        opponentAction: "BBコール。フロップ[K♥ 9♦ 2♠]、ストレート期待度最高の「オープンエンド(OESD)！」BBはチェックしました。",
        precedingHistory: "【フロップ】[K♥ 9♦ 2♠]。インサイドでなく、前後をカバーするアウツ8枚のOESD！相手チェック。",
        options: {
          Raise: {
            label: "2.0BBにベット (C-Bet攻撃)",
            ev: 0.80,
            correct: true,
            explanation: "【GTO正解！】完璧です！OESD(8枚アウト)という最強のセミブラフ資産があります。ここでベット(1/3ポット)を放つことで、相手のミドルペアやハイカードを降ろし空売りでポットを回収するか、コールされても容易に逆転ストレートをバースト完成させ高額インプライドにコミットします。",
            nextStackHero: 95.5,
            nextPot: 9.5
          },
          Call: {
            label: "チェックバック (見守る)",
            ev: 0.40,
            correct: false,
            explanation: "【不十分アグレッシブ】チェックバックを打つのも間違いではないですが、インポジションの強みを活かして自動チェックフォールドを相手に強要するベットを仕掛けるのが大本命GTO推奨です。",
            nextStackHero: 97.5,
            nextPot: 5.5
          },
          Fold: {
            label: "Fold",
            ev: 0.00,
            correct: false,
            explanation: "チェックされているのにOESDを自ら捨てる悲劇は存在しません。",
            nextStackHero: 97.5,
            nextPot: 5.5
          }
        }
      }
    ]
  },
  {
    id: 30,
    title: "KK - プレフロップ5Betジャブオールインと究極トップバリューの最大化",
    heroHand: "Ks Kc",
    opponentHand: "Ad Qh",
    heroPosition: "BTN",
    opponentPosition: "SB",
    stackDepth: "100BB",
    winAmount: 45.0,
    showdownWinner: 'hero',
    decisions: [
      {
        street: 'Preflop',
        board: [],
        pot: 1.5,
        opponentAction: "あなたが2.5BBにオープン、SBは10.0BBに強硬3Bet！BBフォールド。さらにあなたが24.0BBに4Betを返すと、SBは嬉々として『100BBオールイン(5Bet Shove)』を豪快にブチ込んできました！！",
        precedingHistory: "【プリフロップ】100BB。ポケットキングス(Ks Kc)！プリフロップでの狂乱の打撃戦。相手が100BBをプッシュ！",
        options: {
          Raise: {
            label: "コール (スナップコールで決着！)！",
            ev: 18.50,
            correct: true,
            explanation: "【GTO当然の大正解！！！】完璧です！迷いなく今すぐ「コール（Snap Call）」です！100BBにおいてKKは世界で2番目に強いプリフロップナッツ。SBのオールインレンジにはAA、QQ、JJ、AK、または稀にAQブラフが含まれます。AA（相手にのみ勝っている）以外はすべてあなたが勝率で圧勝（約65〜80%優位）しています。即時コールが最高峰の期待値バリューです！",
            nextStackHero: 0.0,
            nextPot: 200.0
          },
          Call: {
            label: "1.0BBコール (不可能選択肢)",
            ev: 0.00,
            correct: false,
            explanation: "相手は100BBのフルコミットをしています。コールしかありません。",
            nextStackHero: 0.0,
            nextPot: 200.0
          },
          Fold: {
            label: "Fold",
            ev: -100.00,
            correct: false,
            explanation: "【ポーカー最大級の失策】KKを100BBでAAを恐れてフォールドするなど、GTOソルバーの歴史に完全泥を塗る最大の不条理ミスです。何があろうと絶対にコールです。",
            nextStackHero: 76.0,
            nextPot: 48.0
          }
        }
      }
    ]
  }
];

export default function GtoTrainer() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(QUIZ_QUESTIONS);
  const [streetFilter, setStreetFilter] = useState<'all' | 'preflop' | 'postflop'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'Raise' | 'Call' | 'Fold' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0, lostEv: 0 });
  const [isLoadingNewQuestion, setIsLoadingNewQuestion] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Active Training Mode Selection
  // 'quiz': Traditional card-based GTO quiz (single-view QA)
  // 'game': Immersive poker room simulator (multi-street gameplay)
  const [trainingMode, setTrainingMode] = useState<'quiz' | 'game'>('game');

  // --- Live Game Mode States ---
  const [gameHandIndex, setGameHandIndex] = useState(0);
  const [gameDecisionStep, setGameDecisionStep] = useState(0);
  const [gameHeroStack, setGameHeroStack] = useState(100.0);
  const [isGameAnswered, setIsGameAnswered] = useState(false);
  const [gameSelectedAnswer, setGameSelectedAnswer] = useState<'Raise' | 'Call' | 'Fold' | null>(null);
  const [gamePoints, setGamePoints] = useState({ correct: 0, total: 0, evLoss: 0 });
  const [gameState, setGameState] = useState<'welcome' | 'playing' | 'hand_over'>('welcome');
  const [gameModeStrategy, setGameModeStrategy] = useState<'sequential' | 'shuffled'>('shuffled');
  const [gamePlayedIndices, setGamePlayedIndices] = useState<number[]>([]);

  // --- Save, Checkpoint, and Session Recovery States ---
  const [hasSaveData, setHasSaveData] = useState(false);
  const [saveNotify, setSaveNotify] = useState<string | null>(null);

  // Check for saved sessions on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('poker_gto_simulator_save');
      if (saved) {
        setHasSaveData(true);
      }
    } catch (e) {
      console.error("Failed to check saved GTO session", e);
    }
  }, []);

  // Active Live Hand & Decision Reference
  const activeGameHand = LIVE_GAME_HANDS[gameHandIndex];
  const activeDecision = activeGameHand?.decisions[gameDecisionStep];

  // Autosave function to persist game progress on every user choice or progression
  const autosave = (
    handIdx: number,
    step: number,
    stack: number,
    points: typeof gamePoints,
    state: typeof gameState,
    isAnswered: boolean,
    selectedAns: typeof gameSelectedAnswer,
    strategy: typeof gameModeStrategy = gameModeStrategy,
    playedIndices: number[] = gamePlayedIndices
  ) => {
    try {
      const data = {
        gameHandIndex: handIdx,
        gameDecisionStep: step,
        gameHeroStack: stack,
        gamePoints: points,
        gameState: state,
        isGameAnswered: isAnswered,
        gameSelectedAnswer: selectedAns,
        gameModeStrategy: strategy,
        gamePlayedIndices: playedIndices,
        timestamp: Date.now()
      };
      localStorage.setItem('poker_gto_simulator_save', JSON.stringify(data));
      setHasSaveData(true);
      setSaveNotify("💾 進行状況を自動保存しました");
      setTimeout(() => setSaveNotify(null), 1500);
    } catch (e) {
      console.error("Autosave failed in GtoTrainer", e);
    }
  };

  // Manual save trigger with toast message
  const handleManualSave = () => {
    try {
      const data = {
        gameHandIndex,
        gameDecisionStep,
        gameHeroStack,
        gamePoints,
        gameState,
        isGameAnswered,
        gameSelectedAnswer,
        gameModeStrategy,
        gamePlayedIndices,
        timestamp: Date.now()
      };
      localStorage.setItem('poker_gto_simulator_save', JSON.stringify(data));
      setHasSaveData(true);
      setSaveNotify("💾 セーブ完了！ブラウザを再起動してもこの局面から再開できます。");
      setTimeout(() => setSaveNotify(null), 3500);
    } catch (e) {
      console.error("Manual save failed in GtoTrainer", e);
    }
  };

  // Load saved session
  const handleLoadSave = () => {
    try {
      const savedStr = localStorage.getItem('poker_gto_simulator_save');
      if (savedStr) {
        const data = JSON.parse(savedStr);
        setGameHandIndex(data.gameHandIndex ?? 0);
        setGameDecisionStep(data.gameDecisionStep ?? 0);
        setGameHeroStack(data.gameHeroStack ?? 100.0);
        setGamePoints(data.gamePoints ?? { correct: 0, total: 0, evLoss: 0 });
        setGameState(data.gameState ?? 'playing');
        setIsGameAnswered(data.isGameAnswered ?? false);
        setGameSelectedAnswer(data.gameSelectedAnswer ?? null);
        if (data.gameModeStrategy) {
          setGameModeStrategy(data.gameModeStrategy);
        }
        if (data.gamePlayedIndices) {
          setGamePlayedIndices(data.gamePlayedIndices);
        }
        setSaveNotify("💾 セーブデータを正常にロードしました");
        setTimeout(() => setSaveNotify(null), 2500);
      }
    } catch (e) {
      console.error("Failed to load saved GTO session", e);
    }
  };

  // Delete saved GTO session
  const handleClearSave = () => {
    try {
      localStorage.removeItem('poker_gto_simulator_save');
      setHasSaveData(false);
      setSaveNotify("🗑️ セーブデータを消去しました");
      setTimeout(() => setSaveNotify(null), 2500);
    } catch (e) {
      console.error("Failed to clear saved GTO session", e);
    }
  };

  // Checkpoint Continue/Retry Option (ゲームでいうコンティニュー、ミス時などの手番やり直し)
  const handleRetryDecision = () => {
    if (!isGameAnswered || !activeDecision || !gameSelectedAnswer) return;

    const actualSelection = activeDecision.options[gameSelectedAnswer];
    const bestActionKey = Object.keys(activeDecision.options).find(
      key => activeDecision.options[key as 'Raise' | 'Call' | 'Fold'].correct
    ) as 'Raise' | 'Call' | 'Fold';
    const bestEV = activeDecision.options[bestActionKey].ev;
    const currentEV = actualSelection.ev;
    const evLoss = Math.max(0, bestEV - currentEV);

    // Cancel back the points added for this decision
    setGamePoints((prev) => ({
      correct: prev.correct - (actualSelection.correct ? 1 : 0),
      total: Math.max(0, prev.total - 1),
      evLoss: Math.max(0, prev.evLoss - evLoss)
    }));

    // Backtrack Hero stack size to pre-decision value
    let prevStack = parseFloat(activeGameHand.stackDepth);
    if (gameDecisionStep > 0) {
      const prevDecision = activeGameHand.decisions[gameDecisionStep - 1];
      const prevBestActionKey = Object.keys(prevDecision.options).find(
        key => prevDecision.options[key as 'Raise' | 'Call' | 'Fold'].correct
      ) as 'Raise' | 'Call' | 'Fold';
      prevStack = prevDecision.options[prevBestActionKey].nextStackHero;
    }
    setGameHeroStack(prevStack);

    setIsGameAnswered(false);
    setGameSelectedAnswer(null);

    const revertedPoints = {
      correct: gamePoints.correct - (actualSelection.correct ? 1 : 0),
      total: Math.max(0, gamePoints.total - 1),
      evLoss: Math.max(0, gamePoints.evLoss - evLoss)
    };

    // Autosave the reverted state
    autosave(gameHandIndex, gameDecisionStep, prevStack, revertedPoints, 'playing', false, null);

    setSaveNotify("🔄 局面をやり直しました (コンティニュー成功！)");
    setTimeout(() => setSaveNotify(null), 3000);
  };

  const handleStartGame = () => {
    let initialIndex = 0;
    let initialPlayed = [0];

    if (gameModeStrategy === 'shuffled') {
      initialIndex = Math.floor(Math.random() * LIVE_GAME_HANDS.length);
      initialPlayed = [initialIndex];
    } else {
      initialIndex = gameHandIndex;
      initialPlayed = [gameHandIndex];
    }

    setGamePlayedIndices(initialPlayed);
    setGameHandIndex(initialIndex);
    setGameDecisionStep(0);
    const initialStack = parseFloat(LIVE_GAME_HANDS[initialIndex].stackDepth);
    setGameHeroStack(initialStack);
    setIsGameAnswered(false);
    setGameSelectedAnswer(null);
    setGameState('playing');
    
    // Initial autosave
    autosave(initialIndex, 0, initialStack, gamePoints, 'playing', false, null, gameModeStrategy, initialPlayed);
  };

  const handleGameAnswer = (action: 'Raise' | 'Call' | 'Fold') => {
    if (isGameAnswered || !activeDecision) return;

    setGameSelectedAnswer(action);
    setIsGameAnswered(true);

    const selectionDetails = activeDecision.options[action];
    const bestActionKey = Object.keys(activeDecision.options).find(
      key => activeDecision.options[key as 'Raise' | 'Call' | 'Fold'].correct
    ) as 'Raise' | 'Call' | 'Fold';
    const bestEV = activeDecision.options[bestActionKey].ev;
    const currentEV = selectionDetails.ev;
    const evLoss = Math.max(0, bestEV - currentEV);

    const updatedPoints = {
      correct: gamePoints.correct + (selectionDetails.correct ? 1 : 0),
      total: gamePoints.total + 1,
      evLoss: gamePoints.evLoss + evLoss
    };

    setGamePoints(updatedPoints);

    // Update real stack size
    const updatedHeroStack = selectionDetails.nextStackHero;
    setGameHeroStack(updatedHeroStack);

    // Save automatically
    autosave(gameHandIndex, gameDecisionStep, updatedHeroStack, updatedPoints, 'playing', true, action);
  };

  const handleGameNext = () => {
    setIsGameAnswered(false);
    setGameSelectedAnswer(null);

    // If there is another decision step in the hand
    if (gameDecisionStep < activeGameHand.decisions.length - 1) {
      const nextStep = gameDecisionStep + 1;
      setGameDecisionStep(nextStep);
      autosave(gameHandIndex, nextStep, gameHeroStack, gamePoints, 'playing', false, null);
    } else {
      // Hand is completed!
      setGameState('hand_over');
      autosave(gameHandIndex, gameDecisionStep, gameHeroStack, gamePoints, 'hand_over', false, null);
    }
  };

  const handleNextGameHand = () => {
    if (gameModeStrategy === 'shuffled') {
      // Shuffled random battle mode!
      // Find remaining ones
      const unplayed = LIVE_GAME_HANDS.map((_, i) => i).filter((i) => !gamePlayedIndices.includes(i));
      
      let nextIndex = 0;
      let nextPlayed = [...gamePlayedIndices];

      if (unplayed.length > 0) {
        // Pick one at random from remaining pool
        nextIndex = unplayed[Math.floor(Math.random() * unplayed.length)];
        nextPlayed.push(nextIndex);
      } else {
        // All played! Reset pool and select any random one (could be different from last)
        const candidates = LIVE_GAME_HANDS.map((_, i) => i).filter((i) => i !== gameHandIndex);
        nextIndex = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : 0;
        nextPlayed = [nextIndex];
        setSaveNotify("👑 全てのシナリオを読破！新しいランダム周回をスタートします。");
        setTimeout(() => setSaveNotify(null), 4000);
      }

      setGamePlayedIndices(nextPlayed);
      const initialStack = parseFloat(LIVE_GAME_HANDS[nextIndex].stackDepth);
      setGameHandIndex(nextIndex);
      setGameDecisionStep(0);
      setGameHeroStack(initialStack);
      setIsGameAnswered(false);
      setGameSelectedAnswer(null);
      setGameState('playing');
      autosave(nextIndex, 0, initialStack, gamePoints, 'playing', false, null, gameModeStrategy, nextPlayed);

    } else {
      // Sequential classic campaign mode
      if (gameHandIndex < LIVE_GAME_HANDS.length - 1) {
        const nextIndex = gameHandIndex + 1;
        const initialStack = parseFloat(LIVE_GAME_HANDS[nextIndex].stackDepth);
        setGameHandIndex(nextIndex);
        setGameDecisionStep(0);
        setGameHeroStack(initialStack);
        setIsGameAnswered(false);
        setGameSelectedAnswer(null);
        setGameState('playing');
        autosave(nextIndex, 0, initialStack, gamePoints, 'playing', false, null);
      } else {
        // Completed campaign! Loop or restart game
        setGameState('welcome');
        autosave(0, 0, parseFloat(LIVE_GAME_HANDS[0].stackDepth), gamePoints, 'welcome', false, null);
      }
    }
  };

  // --- Pre-existing Quiz Mode Filters and Logics ---
  const filteredQuestions = questions.filter(q => {
    const isPreflop = !q.street || q.street === 'Preflop';
    if (streetFilter === 'preflop') return isPreflop;
    if (streetFilter === 'postflop') return !isPreflop;
    return true; 
  });

  const safeIndex = currentIndex >= filteredQuestions.length ? 0 : currentIndex;
  const currentQuestion = filteredQuestions[safeIndex] || filteredQuestions[0] || questions[0];

  const handleFilterChange = (filter: 'all' | 'preflop' | 'postflop') => {
    setStreetFilter(filter);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleAnswer = (action: 'Raise' | 'Call' | 'Fold') => {
    if (isAnswered || !currentQuestion) return;
    
    setSelectedAnswer(action);
    setIsAnswered(true);

    const isCorrect = action === currentQuestion.correctAction;
    const correctEV = currentQuestion.evs[currentQuestion.correctAction];
    const selectedEV = currentQuestion.evs[action];
    const evLoss = Math.max(0, correctEV - selectedEV);

    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      lostEv: prev.lostEv + evLoss,
    }));
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    
    if (filteredQuestions.length > 0) {
      if (currentIndex < filteredQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    } else {
      setCurrentIndex(0);
    }
  };

  const generateAiQuiz = async () => {
    setIsLoadingNewQuestion(true);
    setAiError(null);
    try {
      const response = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('AIクイズのサーバー生成に失敗しました');
      }

      const newQuestion: QuizQuestion = await response.json();
      
      if (!newQuestion.hand || !newQuestion.correctAction || !newQuestion.evs) {
        throw new Error('API返却データ構造が正しくありません。');
      }

      setQuestions((prev) => [newQuestion, ...prev]);
      setStreetFilter('all');
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } catch (err: any) {
      console.error(err);
      setAiError('【無料枠/API上限到達エラー】Gemini AIクイズの生成上限に達しました。ローカル収録されている傑作GTOトレーニング問題（全データ完全無料版）でいつでも特訓を継続できます。');
    } finally {
      setIsLoadingNewQuestion(false);
    }
  };

  const parseHandToCards = (hand: string): string[] => {
    if (!hand) return ["As", "Kd"]; 
    let cleaned = hand.trim();
    cleaned = cleaned.replace(/10/g, 'T');
    cleaned = cleaned.replace(/[♠♠️]/g, 's')
                     .replace(/[♥♥️]/g, 'h')
                     .replace(/[♦♦️]/g, 'd')
                     .replace(/[♣♣️]/g, 'c');
    cleaned = cleaned.replace(/[,/\-+]/g, ' ');
    const parts = cleaned.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return [
        parts[0].length >= 2 ? parts[0].slice(0, 2) : `${parts[0]}h`,
        parts[1].length >= 2 ? parts[1].slice(0, 2) : `${parts[1]}s`
      ];
    }

    const single = parts[0] || "";
    if (single.length === 4 && /[shdc]/.test(single[1]) && /[shdc]/.test(single[3])) {
      return [single.slice(0, 2), single.slice(2, 4)];
    }
    if (single.length >= 2 && single[0] === single[1]) {
      const rank = single[0];
      return [`${rank}s`, `${rank}h`];
    }
    if (single.length >= 3) {
      const r1 = single[0];
      const r2 = single[1];
      const notation = single[2].toLowerCase();
      if (notation === 's') {
        return [`${r1}h`, `${r2}h`]; 
      } else {
        return [`${r1}h`, `${r2}s`]; 
      }
    }
    if (single.length === 2) {
      return [`${single[0]}h`, `${single[1]}s`];
    }
    return ["As", "Kd"];
  };

  const getCardColorClass = (card: string) => {
    if (!card || card.length < 2) return 'text-zinc-400';
    const suit = card[1].toLowerCase(); 
    if (suit === 's') return 'text-slate-950 font-bold'; // Spade: Elegant Black
    if (suit === 'h') return 'text-red-650 font-bold';   // Heart: Vibrant Red
    if (suit === 'd') return 'text-blue-600 font-bold';  // Diamond: Royal Blue (4-color standard)
    if (suit === 'c') return 'text-emerald-600 font-bold'; // Club: Vibrant Green (4-color standard)
    return 'text-zinc-400';
  };

  const getCardSuitSymbol = (suitChar: string) => {
    const suit = suitChar.toLowerCase();
    if (suit === 'h') return '♥️';
    if (suit === 'd') return '♦️';
    if (suit === 's') return '♠️';
    if (suit === 'c') return '♣️';
    return '🃏';
  };

  const getActionBtnStyle = (action: 'Raise' | 'Call' | 'Fold') => {
    if (!isAnswered) {
      const base = "w-full py-3 px-4 font-bold rounded-lg border text-sm transition-all shadow-md active:scale-95 cursor-pointer text-center ";
      if (action === 'Raise') return base + "bg-rose-500/10 text-rose-450 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white";
      if (action === 'Call') return base + "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white";
      return base + "bg-[#1e2d4d]/20 text-slate-300 border-white/10 hover:bg-[#1e2d4d] hover:text-white";
    }

    const isCurrent = selectedAnswer === action;
    const isCorrectOnGto = currentQuestion?.correctAction === action;

    if (isCorrectOnGto) {
      return "w-full py-3 px-4 font-bold rounded-lg text-sm bg-emerald-500 text-white border border-emerald-400 font-mono shadow-md flex items-center justify-center gap-1.5";
    }
    if (isCurrent && !isCorrectOnGto) {
      return "w-full py-3 px-4 font-bold rounded-lg text-sm bg-rose-500 text-white border border-rose-400 font-mono shadow-md flex items-center justify-center gap-1.5";
    }

    return "w-full py-3 px-4 font-semibold rounded-lg text-sm bg-[#050508] text-slate-500 border border-white/5 opacity-50";
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto p-4 bg-[#08080c] border border-[#1e1e2d] rounded-xl shadow-2xl">
      
      {/* Mode Selector Header */}
      <div className="flex items-center justify-between p-1 bg-[#0a0a10] border border-white/5 rounded-lg">
        <button
          onClick={() => setTrainingMode('game')}
          className={`flex-1 py-2 px-3 text-xs font-black transition-all rounded cursor-pointer text-center flex items-center justify-center gap-1.5 ${
            trainingMode === 'game'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>実戦ポーカーゲーム</span>
        </button>
        <button
          onClick={() => setTrainingMode('quiz')}
          className={`flex-1 py-2 px-3 text-xs font-black transition-all rounded cursor-pointer text-center flex items-center justify-center gap-1.5 ${
            trainingMode === 'quiz'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>一問一答GTOクイズ</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. IMMERSIVE PLAYABLE POKER SIMULATOR GAME SCREEN */}
      {/* ========================================================= */}
      {trainingMode === 'game' && (
        <div className="flex flex-col gap-4">
          
          {/* Game Stats Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#0a0a10] border border-white/5 rounded-lg text-center text-xs">
            <div className="flex flex-col">
              <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider mb-0.5">GTO判定精度</span>
              <span className="font-mono text-base font-black text-emerald-400">
                {gamePoints.total > 0 ? `${((gamePoints.correct / gamePoints.total) * 100).toFixed(0)}%` : '100%'}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">({gamePoints.correct} / {gamePoints.total} 判定)</span>
            </div>
            <div className="flex flex-col border-x border-white/10">
              <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider mb-0.5">累計判定EV損失</span>
              <span className="font-mono text-base font-black text-rose-400">
                {gamePoints.evLoss > 0 ? `-${gamePoints.evLoss.toFixed(2)}` : '0.00'} <span className="text-[10px]">BB</span>
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">GTO適合度を数値化</span>
            </div>
            <div className="flex flex-col gap-1.5 justify-center items-center">
              <button
                onClick={() => {
                  if (confirm("GTOの対戦履歴と進行度をすべてリセットし、最初から開始しますか？")) {
                    setGamePoints({ correct: 0, total: 0, evLoss: 0 });
                    handleStartGame();
                  }
                }}
                className="w-full flex items-center justify-center gap-1 py-1 px-2.5 bg-[#161622] hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-white font-bold text-[9px] rounded transition-all select-none cursor-pointer uppercase tracking-wider"
                title="進行状況を消去し、最初からリセットします"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>リセット</span>
              </button>

              {gameState === 'playing' && (
                <button
                  onClick={handleManualSave}
                  className="w-full flex items-center justify-center gap-1 py-1 px-2.5 bg-[#161622] hover:bg-amber-500/10 hover:text-amber-450 hover:border-amber-500/20 border border-white/5 text-slate-400 font-bold text-[9px] rounded transition-all select-none cursor-pointer uppercase tracking-wider shadow"
                  title="現在のプレイヤー情報を手動セーブします"
                >
                  <Save className="w-2.5 h-2.5" />
                  <span>セーブ</span>
                </button>
              )}
            </div>
          </div>

          {/* Autosave/Manual save transient toast banner */}
          <AnimatePresence>
            {saveNotify && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-[#0b0c16] border border-amber-500/30 text-amber-400 font-bold text-[10px] py-1.5 px-3 rounded-md shadow-xl text-center flex items-center justify-center gap-1.5 select-none"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>{saveNotify}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {gameState === 'welcome' && (
            <div className="bg-[#050508]/80 border border-white/5 p-6 rounded-xl text-center flex flex-col items-center gap-5 py-8 max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white mb-1.5 leading-none">GTO 実戦ポーカーシミュレーターへようこそ</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  プリフロップからリバーショウダウンまで、実戦のテーブルの熱狂をシミュレーション。あなたの判断精度をGTOソルバー基準でリアルタイムに測定します。
                </p>
              </div>

              {/* Mode Strategy Selector */}
              <div className="w-full bg-[#08080c] border border-white/5 p-3.5 rounded-lg text-left space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block text-center">対戦モードを選択</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGameModeStrategy('shuffled')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      gameModeStrategy === 'shuffled'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-white/2 border-white/5 text-slate-450 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ランダム実戦モード</span>
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      全8つの高難度シナリオから無作為に選ばれ、実戦の緊張感をリアルに体験します。 (推奨)
                    </span>
                  </button>

                  <button
                    onClick={() => setGameModeStrategy('sequential')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      gameModeStrategy === 'sequential'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-white/2 border-white/5 text-slate-450 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>キャンペーン突破モード</span>
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      シナリオ#1から#8まで、順を追って攻略していきます。クリックして個別シナリオ選択も可能です。
                    </span>
                  </button>
                </div>
              </div>

              {/* Scenario Pack List */}
              <div className="w-full text-left space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                    {gameModeStrategy === 'shuffled' ? '収録シナリオプール (全8種ランダム抽選・順不同)' : '収録シナリオパック (クリックして開始シナリオを選択)'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded-md font-mono">
                    {LIVE_GAME_HANDS.length} SCENARIOS
                  </span>
                </div>
                
                <div className="bg-[#08080c] border border-white/5 rounded-lg p-2 max-h-[200px] overflow-y-auto space-y-1.5 custom-scrollbar">
                  {LIVE_GAME_HANDS.map((hand, idx) => {
                    const isSelected = gameHandIndex === idx;
                    return (
                      <div
                        key={hand.id}
                        onClick={() => {
                          setGameHandIndex(idx);
                        }}
                        className={`flex justify-between items-center p-2 rounded-md transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/2 hover:bg-white/5 border-transparent text-slate-300'
                        }`}
                      >
                        <div className="text-left min-w-0 pr-2">
                          <span className="font-mono text-[9px] text-slate-500 mr-2">#{idx + 1}</span>
                          <span className="font-bold text-xs truncate inline-block md:max-w-sm max-w-[200px] align-middle">{hand.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 uppercase">
                            {hand.heroPosition}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-500 font-black">
                            {hand.stackDepth}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartGame}
                className="w-full py-3 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-lg shadow-lg active:scale-98 transition-all cursor-pointer mt-1"
              >
                {gameModeStrategy === 'shuffled' 
                  ? 'ランダム実戦をスタートする' 
                  : `シナリオ #${gameHandIndex + 1} からキャンペーンをスタート`}
              </button>
            </div>
          )}

          {gameState === 'playing' && activeDecision && (
            <div className="flex flex-col gap-4">
              
              {/* Game Arena Info */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span className="font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded leading-none">
                  HAND {gameHandIndex + 1} / {LIVE_GAME_HANDS.length} : {activeDecision.street}
                </span>
                <span className="text-slate-400 font-bold uppercase">
                  {activeGameHand.title.split(' - ')[0]}
                </span>
              </div>

              {/* Majestic Dynamic Poker Room Table */}
              <div className="relative w-full aspect-[2/1] rounded-[100px] border-[12px] border-amber-950/80 bg-[#073b24] shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] flex flex-col justify-center items-center p-6 border-double overflow-visible my-3 select-none">
                
                {/* Felt glow highlights */}
                <div className="absolute inset-x-8 top-12 bottom-12 rounded-[80px] bg-[#0c5c39]/30 blur-xl pointer-events-none" />

                {/* --- 6-Max Clockwise Multiplayer Seats --- */}
                {(() => {
                  const SEAT_POSITIONS = ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'];
                  const seatCoordinates: Record<string, string> = {
                    SB: "absolute bottom-[-16px] right-2 md:right-8 z-20",
                    BB: "absolute top-[-16px] right-2 md:right-8 z-20",
                    UTG: "absolute top-[-16px] left-1/2 -translate-x-1/2 z-20",
                    HJ: "absolute top-[-16px] left-2 md:left-8 z-20",
                    CO: "absolute bottom-[-16px] left-2 md:left-8 z-20",
                    BTN: "absolute bottom-[-16px] left-1/2 -translate-x-1/2 z-20",
                  };

                  return SEAT_POSITIONS.map((pos) => {
                    const isHero = activeGameHand.heroPosition === pos;
                    const isOpponent = activeGameHand.opponentPosition === pos;
                    const isActive = isHero || isOpponent;
                    
                    // Status/Action bubble info (for visual liveness)
                    let actionBubble: string | null = null;
                    if (isOpponent && activeDecision.opponentAction) {
                      actionBubble = activeDecision.opponentAction;
                    } else if (isHero && isGameAnswered && gameSelectedAnswer) {
                      actionBubble = `私は ${
                        gameSelectedAnswer === 'Raise' ? 'レイズ' : gameSelectedAnswer === 'Call' ? 'コール' : 'フォールド'
                      }`;
                    }

                    // Stack display
                    let stackText = "Folded";
                    if (isHero) {
                      stackText = `${gameHeroStack.toFixed(1)} BB`;
                    } else if (isOpponent) {
                      stackText = `${gameHeroStack.toFixed(1)} BB`; 
                    }

                    // Card displays inside seats!
                    let seatCards: string[] | null = null;
                    if (isHero) {
                      seatCards = activeGameHand.heroHand.split(' ');
                    } else if (isOpponent) {
                      if (gameState === 'hand_over') {
                        seatCards = activeGameHand.opponentHand.split(' ');
                      } else {
                        // Facedown cards during actions
                        seatCards = ['XX', 'XX'];
                      }
                    }

                    // Glowing border for active actor
                    const isMyTurn = isHero && !isGameAnswered;

                    return (
                      <div key={pos} className={seatCoordinates[pos]}>
                        <div className="flex flex-col items-center relative">
                          
                          {/* Action bubble overlay */}
                          {actionBubble && (
                            <div className="absolute -top-7 z-30 bg-black/95 text-[9px] text-white font-bold py-0.5 px-2 rounded-lg border border-white/10 shadow-lg whitespace-nowrap animate-bounce leading-none">
                              💭 {actionBubble.length > 20 ? actionBubble.slice(0, 20) + '...' : actionBubble}
                            </div>
                          )}

                          {/* Player Badge */}
                          <div className={`flex items-center gap-1 bg-[#090a0f]/95 border ${
                            isHero 
                              ? isMyTurn 
                                ? 'border-emerald-400 ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.4)] text-emerald-100' 
                                : 'border-emerald-500/40 text-emerald-100' 
                              : isOpponent 
                                ? 'border-blue-500/40 text-blue-100 font-bold' 
                                : 'border-white/5 opacity-45 text-slate-500'
                          } rounded-lg p-0.5 px-2 text-[10px] font-medium shadow-2xl transition-all duration-300`}>
                            
                            {isActive ? (
                              <div className={`w-1.5 h-1.5 rounded-full ${isHero ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-600/50" />
                            )}

                            <span className={`font-mono text-[9px] uppercase ${
                              isHero ? 'text-emerald-400 font-extrabold' : isOpponent ? 'text-blue-400 font-extrabold' : 'text-slate-500'
                            }`}>
                              {pos}
                            </span>
                            <span className="opacity-30">|</span>
                            <span className="font-mono text-[9px] text-zinc-300">{stackText}</span>
                          </div>

                          {/* Mini Pocket cards */}
                          {seatCards && (
                            <div className="flex gap-0.5 mt-1 animate-fade-in">
                              {seatCards.map((card, cIdx) => {
                                if (card === 'XX') {
                                  return (
                                    <div 
                                      key={cIdx} 
                                      className="w-4 h-6 rounded bg-gradient-to-br from-rose-700 to-rose-900 border border-white/20 shadow-md flex items-center justify-center text-[8px] text-white/80 font-black"
                                    >
                                      ♠
                                    </div>
                                  );
                                }
                                const cardColor = getCardColorClass(card);
                                return (
                                  <div 
                                    key={cIdx} 
                                    className="w-4 h-6 rounded bg-white border border-slate-300 shadow-md flex flex-col justify-between p-0.5 leading-none shrink-0"
                                  >
                                    <div className="flex justify-between items-start text-[7px] font-black w-full">
                                      <span className={cardColor}>{card[0]}</span>
                                    </div>
                                    <div className={`text-center text-[9px] -mt-1 font-bold ${cardColor}`}>
                                      {getCardSuitSymbol(card[1])}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Dealer Button D Marker */}
                          {pos === 'BTN' && (
                            <div className="absolute top-2 -right-4 w-4 h-4 rounded-full bg-amber-400 border border-amber-600 flex items-center justify-center text-[8px] font-black text-slate-950 shadow-md select-none z-10">
                              D
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  });
                })()}

                {/* --- Middle Felt Area : Pot Size & Community Cards --- */}
                <div className="relative flex flex-col items-center gap-1.5 my-auto w-full z-10 pointer-events-auto">
                  {/* Pot size metric */}
                  <div className="flex items-center gap-1 bg-[#051f13] border border-amber-500/20 px-3 py-1 rounded-full text-xs font-mono font-black text-amber-400 shadow-md">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>ポット: {activeDecision.pot.toFixed(1)} BB</span>
                  </div>

                  {/* Community board cards representation */}
                  <div className="flex gap-1 justify-center min-h-[50px] items-center">
                    {activeDecision.board.length === 0 ? (
                      <span className="text-[10px] text-[#2db57b] uppercase tracking-widest font-mono font-extrabold opacity-70">
                        プリフロップ配分
                      </span>
                    ) : (
                      activeDecision.board.map((card, idx) => {
                        const cardColor = getCardColorClass(card);
                        return (
                          <div 
                            key={idx} 
                            className="w-8 h-12 rounded bg-white border border-slate-300 flex flex-col justify-between p-1 shadow-lg shadow-black/50 overflow-hidden shrink-0 animate-fade-in"
                          >
                            <div className="flex justify-between items-start leading-none text-[10px] font-black w-full">
                              <span className={cardColor}>{card[0]}</span>
                              <span className={`text-[8px] ${cardColor}`}>{getCardSuitSymbol(card[1])}</span>
                            </div>
                            <div className={`text-center text-xs leading-none my-0.5 ${cardColor}`}>
                              {getCardSuitSymbol(card[1])}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Hand History log */}
              <div className="bg-[#050508]/60 border border-white/5 rounded-lg p-2.5 text-xs">
                <span className="text-[9px] font-mono tracking-widest font-black text-slate-500 block uppercase mb-1">直帰履歴 & ポジション目標</span>
                <p className="text-slate-300 font-medium leading-relaxed">
                  {activeDecision.precedingHistory}
                </p>
                {activeDecision.opponentAction && (
                  <p className="text-rose-450 text-rose-400 font-bold mt-1 shadow-sm leading-snug flex items-center gap-1.5 bg-rose-500/5 p-1 px-2 rounded border border-rose-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>相手アクション: {activeDecision.opponentAction}</span>
                  </p>
                )}
              </div>

              {/* Pocket Cards Dealt */}
              <div className="bg-[#0c0c14]/80 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-[9px] font-mono tracking-widest font-black text-slate-500 uppercase">自分の手札 (Hero pocket)</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    {activeGameHand.heroPosition} • スタック {gameHeroStack.toFixed(1)} BB
                  </span>
                </div>

                <div className="flex gap-2">
                  {activeGameHand.heroHand.split(' ').map((h, i) => (
                    <div
                      key={i}
                      className="w-10 h-14 rounded-md bg-white border border-slate-300 flex flex-col justify-between p-1 shadow-xl shadow-black/80 shrink-0"
                    >
                      <div className="flex justify-between items-start leading-[1] text-xs font-black w-full">
                        <span className={`font-mono ${getCardColorClass(h)}`}>{h[0]}</span>
                        <span className={`font-mono text-[8px] ${getCardColorClass(h)}`}>{getCardSuitSymbol(h[1])}</span>
                      </div>
                      <div className="text-center relative">
                        <span className={`text-base leading-none ${getCardColorClass(h)}`}>
                          {getCardSuitSymbol(h[1])}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Decisions Grid */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(['Raise', 'Call', 'Fold'] as const).map((act) => {
                  const optDetails = activeDecision.options[act];
                  const label = act === 'Raise' 
                    ? (activeDecision.street === 'Preflop' ? 'Raise' : 'Bet / Raise')
                    : act === 'Call'
                    ? (activeDecision.street === 'Preflop' ? 'Call' : 'Check / Call')
                    : 'Fold';

                  let btnStyle = "w-full py-3 px-3 font-bold rounded-xl text-xs transition-all border shadow-lg cursor-pointer active:scale-95 leading-none ";
                  
                  if (!isGameAnswered) {
                    if (act === 'Raise') btnStyle += "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-white";
                    else if (act === 'Call') btnStyle += "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white";
                    else btnStyle += "bg-slate-800/20 text-slate-400 border-white/5 hover:bg-slate-700 hover:text-white";
                  } else {
                    const isUserAction = gameSelectedAnswer === act;
                    const isOptimalAction = optDetails.correct;

                    if (isOptimalAction) {
                      btnStyle += "bg-emerald-500 text-white border-emerald-400";
                    } else if (isUserAction) {
                      btnStyle += "bg-rose-500 text-white border-rose-400";
                    } else {
                      btnStyle += "bg-[#050508] text-slate-600 border-white/5 opacity-40";
                    }
                  }

                  return (
                    <button
                      key={act}
                      onClick={() => handleGameAnswer(act)}
                      className={btnStyle}
                    >
                      <div className="font-extrabold uppercase mb-0.5">{label}</div>
                      <div className="text-[8px] font-mono opacity-80 whitespace-nowrap overflow-hidden">
                        {optDetails.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* GTO Interactive Feedback Overlay info */}
              {isGameAnswered && gameSelectedAnswer && (
                <div className="bg-[#0a0a10] border border-white/10 rounded-xl p-4 flex flex-col gap-3 animate-fade-in shadow-2xl">
                  
                  {/* Status outcome */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div>
                      {activeDecision.options[gameSelectedAnswer].correct ? (
                        <span className="text-emerald-400 font-extrabold flex items-center gap-1 text-xs bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> GTO適合アクション!
                        </span>
                      ) : (
                        <span className="text-rose-400 font-extrabold flex items-center gap-1 text-xs bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
                          <ShieldAlert className="w-3.5 h-3.5" /> 期待値ロス発生
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!activeDecision.options[gameSelectedAnswer].correct && (
                        <button
                          onClick={handleRetryDecision}
                          className="flex items-center gap-1.5 py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/35 hover:border-amber-500/50 text-[11px] font-bold rounded-lg transition-all cursor-pointer leading-none shadow-md"
                          title="この手番の直前の判断状態に戻ってやり直します（コンティニュー）"
                        >
                          <Undo2 className="w-3 h-3 text-amber-400" />
                          <span>やり直す(Continue)</span>
                        </button>
                      )}

                      <button
                        onClick={handleGameNext}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-lg transition-all cursor-pointer leading-none shadow-md shadow-emerald-950/40"
                      >
                        <span>次の手番へ</span>
                        <ChevronRight className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* EV loss metrics */}
                  <div className="bg-[#050508] p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 block mb-1">戦略ルート期待値 (GTO EV BB)</span>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      {(['Raise', 'Call', 'Fold'] as const).map((act) => {
                        const opt = activeDecision.options[act];
                        return (
                          <div key={act} className="flex justify-between items-center font-mono">
                            <span className={opt.correct ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                              {act === 'Raise' ? 'Raise / Bet' : act === 'Call' ? 'Call / Check' : 'Fold'}
                              {opt.correct && " (Optimal)"}
                            </span>
                            <span className="font-bold">
                              {opt.ev >= 0 ? `+${opt.ev.toFixed(2)}` : opt.ev.toFixed(2)} BB
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Explanation */}
                  <p className="text-xs text-slate-300 leading-relaxed font-medium bg-[#050508]/40 p-3 rounded border border-white/5">
                    {activeDecision.options[gameSelectedAnswer].explanation}
                  </p>

                </div>
              )}

            </div>
          )}

          {gameState === 'hand_over' && (
            <div className="bg-[#050508]/80 border border-white/5 p-6 rounded-xl text-center flex flex-col items-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 animate-pulse">
                <Award className="w-7 h-7" />
              </div>
              
              <div>
                <span className="text-[9px] font-mono tracking-widest font-black text-yellow-500 block uppercase mb-1">
                  ハンドシナリオ完了 (HAND STAGE CLEAR)
                </span>
                <h3 className="text-base font-black text-white leading-tight">
                  {activeGameHand.title.split(' - ')[0]} をクリアしました！
                </h3>
              </div>

              {/* Hand Result Card */}
              <div className="w-full bg-[#08080c] border border-white/5 rounded-xl p-4 space-y-2.5 text-xs text-left">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="font-bold text-slate-400">最終獲得ポット（理論値）:</span>
                  <span className={`font-mono font-black text-sm ${activeGameHand.winAmount >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {activeGameHand.winAmount >= 0 ? `+${activeGameHand.winAmount.toFixed(1)}` : activeGameHand.winAmount.toFixed(1)} BB
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-450">ショウダウン結果:</span>
                  <span className="font-mono text-white font-black uppercase">
                    {activeGameHand.showdownWinner === 'hero' ? '🏆 HERO WINS (勝利)' : activeGameHand.showdownWinner === 'opponent' ? '💀 OPPONENT WINS (敗北)' : 'FOLDED撤退 (安全)'}
                  </span>
                </div>

                {activeGameHand.showdownWinner !== 'fold' && (
                  <div className="bg-[#0c0c14] rounded p-2.5 border border-white/5 flex justify-between items-center mt-2">
                    <div className="text-[11px]">
                      <span className="text-slate-500 block text-[9px] font-mono">相手の手札 (BB)</span>
                      <span className="font-black text-zinc-300 font-mono">{activeGameHand.opponentHand}</span>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="text-emerald-400 block text-[9px] font-mono">あなたの手札 (BTN)</span>
                      <span className="font-black text-emerald-400 font-mono">{activeGameHand.heroHand}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={handleStartGame}
                  className="py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/5 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>もう一度プレイ</span>
                </button>
                <button
                  onClick={handleNextGameHand}
                  className="py-2.5 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>次回のハンドへ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TRADITIONAL CARD-BASED GTO FLASHCARD QUIZ MODE SCREEN */}
      {/* ========================================================= */}
      {trainingMode === 'quiz' && (
        <div className="flex flex-col gap-4">
          
          {/* Mini Profile Trainer Scoreboard */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#0a0a10] border border-white/5 rounded-lg text-center text-xs">
            <div className="flex flex-col">
              <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider mb-0.5">正解率</span>
              <span className="font-mono text-base font-black text-white">
                {stats.total > 0 ? `${((stats.correct / stats.total) * 100).toFixed(0)}%` : '0%'}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">({stats.correct} / {stats.total})</span>
            </div>
            <div className="flex flex-col border-x border-white/10">
              <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider mb-0.5">トータルEVロス</span>
              <span className="font-mono text-base font-black text-rose-400">
                {stats.lostEv > 0 ? `-${stats.lostEv.toFixed(2)}` : '0.00'} <span className="text-[10px]">BB</span>
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">GTO適合度を可視化</span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <button
                onClick={generateAiQuiz}
                disabled={isLoadingNewQuestion}
                className="flex items-center gap-2 py-1.5 px-2 bg-gradient-to-tr from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-[10px] rounded disabled:opacity-50 transition-all select-none shadow cursor-pointer uppercase tracking-wider"
              >
                {isLoadingNewQuestion ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                )}
                <span>AIクイズ作成</span>
              </button>
            </div>
          </div>

          {/* Street Filter Selection Buttons */}
          <div className="flex border-b border-white/5 pb-1 gap-1">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${streetFilter === 'all' ? 'bg-[#1b1b2f] text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
            >
              すべて ({questions.length})
            </button>
            <button
              onClick={() => handleFilterChange('preflop')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${streetFilter === 'preflop' ? 'bg-[#1b1b2f] text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
            >
              プリフロップのみ ({questions.filter(q => !q.street || q.street === 'Preflop').length})
            </button>
            <button
              onClick={() => handleFilterChange('postflop')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${streetFilter === 'postflop' ? 'bg-rose-550/10 text-rose-450 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
            >
              ポストフロップ ({questions.filter(q => q.street && q.street !== 'Preflop').length})
            </button>
          </div>

          {aiError && (
            <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2.5 rounded">
              {aiError}
            </div>
          )}

          {/* Progress tracking */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>GTO SCENARIO: {safeIndex + 1} / {filteredQuestions.length || 1}</span>
            <span className="bg-indigo-950/30 text-indigo-400 border border-indigo-900/30 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">
              {currentQuestion.street || 'Preflop'}
            </span>
          </div>

          {/* Main Card Arena */}
          <div className="relative bg-[#05050a]/60 border border-white/5 p-4 rounded-xl flex flex-col items-center gap-4 text-center">
            {/* Scenario metadata */}
            <div className="w-full flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-indigo-400" /> {currentQuestion.situationName}</span>
              <span>{currentQuestion.stackDepth} ({currentQuestion.position})</span>
            </div>

            {/* Dynamic Card Display */}
            <div className="flex flex-wrap gap-4 justify-center items-center my-1 w-full">
              {/* HERO'S pocket cards */}
              <div className="flex flex-col items-center gap-1 bg-[#0d0d16] border border-white/5 p-2 rounded-lg">
                <span className="text-[9px] text-[#8e8ea6] uppercase font-black tracking-widest">自分の手札 (HERO's Hand)</span>
                <div className="flex gap-1.5">
                  {parseHandToCards(currentQuestion.hand).map((h, i) => (
                    <div
                      key={i}
                      className="w-14 h-20 rounded-md bg-white border border-slate-300 flex flex-col justify-between p-1.5 shadow-lg shadow-black/80"
                    >
                      <div className="flex justify-between items-start w-full leading-[1]">
                        <span className={`font-mono text-sm font-black ${getCardColorClass(h)}`}>
                          {h[0]}
                        </span>
                        <span className={`font-mono text-[9px] ${getCardColorClass(h)}`}>
                          {getCardSuitSymbol(h[1])}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className={`text-xl leading-[1] ${getCardColorClass(h)}`}>
                          {getCardSuitSymbol(h[1])}
                        </span>
                      </div>
                      <div className="text-right w-full leading-[1]">
                        <span className={`font-mono text-[9px] ${getCardColorClass(h)}`}>
                          {h[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMMUNITY board cards (FLOP, TURN, RIVER only) */}
              {currentQuestion.board && currentQuestion.board.length > 0 && (
                <div className="flex flex-col items-center gap-1 bg-[#100d16] border border-rose-500/10 p-2 rounded-lg">
                  <span className="text-[9px] text-rose-450 text-rose-400 uppercase font-black tracking-widest">
                    ボード (Community Board) • {currentQuestion.street}
                  </span>
                  <div className="flex gap-1">
                    {currentQuestion.board.map((card, idx) => {
                      const cardColor = getCardColorClass(card);
                      return (
                        <div 
                          key={idx} 
                          className="w-11 h-16 rounded bg-white border border-slate-300 flex flex-col justify-between p-1 shadow"
                        >
                          <div className="flex justify-between items-start w-full leading-[1] text-[11px] font-black">
                            <span className={cardColor}>{card[0]}</span>
                            <span className={`text-[8px] ${cardColor}`}>{getCardSuitSymbol(card[1])}</span>
                          </div>
                          <div className={`text-center text-sm ${cardColor}`}>
                            {getCardSuitSymbol(card[1])}
                          </div>
                          <div className="text-right w-full leading-[1] text-[8px] text-zinc-400 font-mono">
                            {card[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action summaries & histories */}
            <div className="flex flex-col gap-2 w-full">
              {currentQuestion.precedingHistory && (
                <div className="w-full text-left bg-[#0c0c14]/90 border border-white/5 p-2 rounded text-xs text-slate-300">
                  <span className="text-[9px] font-bold text-yellow-500/80 block uppercase tracking-widest mb-0.5">
                    ゲーム進行履歴 (Preceding Game History):
                  </span>
                  <p className="font-medium whitespace-pre-wrap leading-relaxed">{currentQuestion.precedingHistory}</p>
                </div>
              )}

              {currentQuestion.opponentActionText && (
                <div className="w-full text-left bg-rose-950/20 border border-rose-500/20 px-2.5 py-2 rounded text-xs flex items-start gap-2 animate-pulse">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0 animate-ping" />
                  <div>
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block">
                      対戦相手のアクション (Opponent Action):
                    </span>
                    <p className="text-slate-200 font-bold mt-0.5 leading-snug">{currentQuestion.opponentActionText}</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-300 px-2">
              スタック残高: <span className="font-mono text-yellow-400 font-bold">{currentQuestion.stackDepth}</span>。
              自身のポジション: <span className="font-mono text-rose-450 text-rose-400 font-bold">{currentQuestion.position}</span>
              {currentQuestion.opponentPosition && currentQuestion.opponentPosition !== 'None' && (
                <> (vs <span className="text-blue-400 font-bold">{currentQuestion.opponentPosition}</span>)</>
              )}。
              選択しているストリート: <span className="text-indigo-400 font-bold uppercase">{currentQuestion.street || 'Preflop'}</span>
            </p>

            {/* Action Selection Buttons */}
            <div className="grid grid-cols-3 gap-2 w-full mt-1">
              {(['Raise', 'Call', 'Fold'] as const).map((act) => {
                const isCurrentPreflop = !currentQuestion.street || currentQuestion.street === 'Preflop';
                let label = '';
                if (act === 'Raise') {
                  label = isCurrentPreflop ? 'Raise (Open)' : 'Raise / Bet';
                } else if (act === 'Call') {
                  label = isCurrentPreflop ? 'Call (Limp)' : 'Call / Check';
                } else {
                  label = 'Fold';
                }
                return (
                  <button
                    key={act}
                    onClick={() => handleAnswer(act)}
                    className={getActionBtnStyle(act)}
                  >
                    {isAnswered && currentQuestion.correctAction === act && (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {isAnswered && selectedAnswer === act && currentQuestion.correctAction !== act && (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Answer feedback panel */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 bg-[#0a0a10]/95 border border-[#2d2d42] p-4 rounded-xl shadow-2xl animate-fade-in"
            >
              {/* Header Feedback */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  {selectedAnswer === currentQuestion.correctAction ? (
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1 text-xs bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)] select-none">
                      <CheckCircle2 className="w-3.5 h-3.5" /> GTO適合アクション!
                    </span>
                  ) : (
                    <span className="text-rose-450 text-rose-400 font-extrabold flex items-center gap-1 text-xs bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)] select-none">
                      <ShieldAlert className="w-3.5 h-3.5" /> EV ロス発生
                    </span>
                  )}
                </div>

                {/* Next buttons */}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 py-1.5 px-3 bg-white/10 border border-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-lg transition-all cursor-pointer leading-none"
                >
                  <span>次の問題へ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* EV Comparisons */}
              <div className="bg-[#050508] p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  各アクションプランのGTO期待値 (EVBB)
                </span>
                <div className="space-y-1.5">
                  {(['Raise', 'Call', 'Fold'] as const).map((act) => {
                    const evval = currentQuestion.evs[act];
                    const isActionGto = currentQuestion.correctAction === act;
                    const isUserAction = selectedAnswer === act;
                    const isCurrentPreflop = !currentQuestion.street || currentQuestion.street === 'Preflop';
                    let label = '';
                    if (act === 'Raise') {
                      label = 'Raise / Bet';
                    } else if (act === 'Call') {
                      label = isCurrentPreflop ? 'Call / Limp' : 'Call / Check';
                    } else {
                      label = 'Fold';
                    }
                    return (
                      <div key={act} className="flex flex-col text-xs">
                        <div className="flex justify-between items-center mb-0.5 font-semibold">
                          <span className="flex items-center gap-1">
                            <span className={isActionGto ? 'text-emerald-400' : 'text-slate-400'}>
                              {label}
                            </span>
                            {isActionGto && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded uppercase font-bold">BEST</span>}
                            {isUserAction && <span className="text-[8px] bg-white/10 text-white px-1 rounded font-bold">YOURS</span>}
                          </span>
                          <span className="font-mono text-[11px] font-bold">
                            {evval >= 0 ? `+${evval.toFixed(2)}` : evval.toFixed(2)} BB
                          </span>
                        </div>
                        {/* Relative filling bar for visual comparisons */}
                        <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.max(3, Math.min(100, (evval + 1) * 35))}%` }}
                            className={`h-full ${isActionGto ? 'bg-emerald-500' : 'bg-slate-600'}`}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation Text */}
              <div className="text-xs text-slate-300 leading-relaxed bg-[#050508]/40 p-3 rounded-lg border border-white/5 font-medium">
                <p className="font-bold text-slate-405 text-slate-400 mb-1 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  GTO戦略の背景・ブロッカー解説:
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            </motion.div>
          )}

        </div>
      )}

    </div>
  );
}
