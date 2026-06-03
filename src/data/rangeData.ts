import { HandRangeMap, Situation, HandStrategy, QuizQuestion } from '../types';

// Helper to get hand notation from row and col indices
export function getHandFromGrid(row: number, col: number): string {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const r1 = ranks[row];
  const r2 = ranks[col];

  if (row === col) {
    return r1 + r2; // e.g., "AA"
  } else if (row < col) {
    return r1 + r2 + 's'; // e.g., "AKs" (Suited)
  } else {
    return r2 + r1 + 'o'; // e.g., "AKo" (Offsuited)
  }
}

// Convert hand string to grid coordinates [row, col]
export function getGridFromHand(hand: string): [number, number] {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const r1 = hand[0];
  const r2 = hand[1];
  const isSuited = hand.endsWith('s');
  const isOffsuited = hand.endsWith('o');

  const idx1 = ranks.indexOf(r1);
  const idx2 = ranks.indexOf(r2);

  if (!isSuited && !isOffsuited) {
    // Pocket pair
    return [idx1, idx1];
  } else if (isSuited) {
    // Suited: row < col, e.g. A(0) K(1) s => row 0, col 1
    return [idx1, idx2];
  } else {
    // Offsuited: row > col, e.g. A(0) K(1) o => row 1, col 0
    return [idx2, idx1];
  }
}

// Generate full range (169 hands) with specific parameters
function generateRange(
  rules: {
    raiseHands: string[]; // 100% Raise
    mixedRaiseHands: { [hand: string]: number }; // e.g., { "A5s": 50, "A4s": 30 }
    callHands: string[]; // 100% Call
    mixedCallHands: { [hand: string]: number }; // e.g., { "QJs": 40 }
    evBase: { [hand: string]: number }; // Specific Hand EV
  },
  defaultEvFunc: (hand: string, row: number, col: number) => number
): HandRangeMap {
  const map: HandRangeMap = {};
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const hand = getHandFromGrid(r, c);
      let raise = 0;
      let call = 0;
      let fold = 100;

      // Determine Action Frequency
      if (rules.raiseHands.includes(hand)) {
        raise = 100;
        fold = 0;
      } else if (hand in rules.mixedRaiseHands) {
        raise = rules.mixedRaiseHands[hand];
        fold = 100 - raise;
      }

      if (rules.callHands.includes(hand)) {
        call = 100;
        raise = 0;
        fold = 0;
      } else if (hand in rules.mixedCallHands) {
        const potentialCall = rules.mixedCallHands[hand];
        // Ensure total doesn't exceed 100%
        call = Math.min(potentialCall, 100 - raise);
        fold = Math.max(0, 100 - raise - call);
      }

      // Calculate EV
      let ev = defaultEvFunc(hand, r, c);
      if (hand in rules.evBase) {
        ev = rules.evBase[hand];
      }

      // Adjust EV based on strategy (Fold EV is 0)
      if (fold === 100) {
        ev = 0;
      }

      // Construct advice / tips for tricky hands
      let advice = "";
      if (raise > 0 && raise < 100) {
        advice = `GTO混合戦略。Raise頻度 ${raise}%。バリューとブラフのバランスを保つため、乱数を利用してアクションを決定してください。`;
      } else if (call > 0 && call < 100) {
        advice = `GTO混合戦略。Call頻度 ${call}%。対戦相手のレンジが広い場合にコールで利益を出せます。`;
      } else if (raise === 100) {
        advice = `GTOピュア戦略。Raise 100%。バリューあるいはセミブラフとして強力なハンドです。`;
      } else if (call === 100) {
        advice = `GTOピュア戦略。Call 100%。ポットオッズとポストフロップでの実現性が十分なハンドです。`;
      } else {
        advice = `Fold。このシチュエーションにおいて期待値（EV）がマイナスになるため、即座にフォールドします。`;
      }

      map[hand] = {
        hand,
        actions: { raise, call, fold },
        ev,
        advice,
      };
    }
  }

  return map;
}

// -----------------------------------------------------------------------------
// 1. UTG RFI (Preflop Open, 100BB)
// -----------------------------------------------------------------------------
const utgRfiRules = {
  raiseHands: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s',
    'KQs', 'KJs', 'KTs',
    'QJs', 'QTs',
    'JTs',
    'T9s',
    'AKo', 'AQo', 'AJo',
  ],
  mixedRaiseHands: {
    '77': 60, '66': 40, '55': 20,
    'A8s': 50, 'A7s': 40, 'A5s': 60, 'A4s': 45, 'A3s': 30, 'A2s': 20,
    'K9s': 30, 'Q9s': 25, 'J9s': 20,
    '98s': 40, '87s': 35, '76s': 20,
    'KQo': 55, 'ATo': 30,
  },
  callHands: [] as string[],
  mixedCallHands: {} as { [hand: string]: number },
  evBase: {
    'AA': 4.85, 'KK': 3.62, 'QQ': 2.72, 'JJ': 1.95, 'TT': 1.35,
    'AKs': 2.15, 'AQs': 1.65, 'AKo': 1.45, 'AQo': 0.95,
  } as { [hand: string]: number },
};

const utgRfiRange = generateRange(utgRfiRules, (hand, row, col) => {
  // Pure fold or basic calculation
  const isPocket = row === col;
  const isSuited = row < col;
  const highCardValue = 14 - row;
  const lowCardValue = 14 - col;

  if (isPocket && highCardValue >= 6) return (highCardValue - 6) * 0.15;
  if (isSuited && highCardValue >= 10 && lowCardValue >= 9) return (highCardValue + lowCardValue - 18) * 0.08;
  return 0;
});

// -----------------------------------------------------------------------------
// 2. BTN RFI (Preflop Open, 100BB)
// -----------------------------------------------------------------------------
const btnRfiRules = {
  // BTN opens wide! ~40% of hands
  raiseHands: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s',
    'QJs', 'QTs', 'Q9s', 'Q8s',
    'JTs', 'J9s', 'J8s',
    'T9s', 'T8s',
    '98s', '97s',
    '87s', '86s',
    '76s', '65s', '54s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o',
    'KQo', 'KJo', 'KTo',
    'QJo', 'QTo',
    'JTo',
  ],
  mixedRaiseHands: {
    'K4s': 50, 'K3s': 40, 'K2s': 30,
    'Q7s': 60, 'Q6s': 40, 'Q5s': 20,
    'J7s': 50, 'T7s': 40, '96s': 30, '85s': 30, '75s': 45, '64s': 30,
    'A8o': 60, 'A7o': 40, 'A5o': 50, 'A4o': 30,
    'K9o': 50, 'Q9o': 40, 'J9o': 30, 'T9o': 20,
  } as { [hand: string]: number },
  callHands: [] as string[],
  mixedCallHands: {} as { [hand: string]: number },
  evBase: {
    'AA': 5.25, 'KK': 4.10, 'QQ': 3.15, 'JJ': 2.45, 'TT': 1.85,
    'AKs': 2.50, 'AQs': 2.05, 'AKo': 1.85, 'AQo': 1.35,
    '76s': 0.15, 'T9s': 0.35, '54s': 0.10, 'A2s': 0.35,
  } as { [hand: string]: number },
};

const btnRfiRange = generateRange(btnRfiRules, (hand, row, col) => {
  const isPocket = row === col;
  const isSuited = row < col;
  const highValue = 14 - Math.min(row, col);
  const lowValue = 14 - Math.max(row, col);

  if (isPocket) return highValue * 0.1;
  if (isSuited) return (highValue + lowValue) * 0.04;
  return Math.max(0, (highValue + lowValue - 14) * 0.01);
});

// -----------------------------------------------------------------------------
// 3. BB vs BTN Open Defence (100BB, Call Heavy & 3Bet Light)
// -----------------------------------------------------------------------------
const bbVsBtnRules = {
  // Hands we definitely 3-bet (Raise) for value or as strong semi-bluffs
  raiseHands: [
    'AA', 'KK', 'QQ', 'JJ', 'TT',
    'AKs', 'AQs', 'AJs',
    'AKo', 'AQo',
  ],
  // Hands we 3-bet at some frequency (light 3-bet / mixed)
  mixedRaiseHands: {
    '99': 40, '88': 30, '77': 20,
    'ATs': 30, 'A5s': 50, 'A4s': 40, 'A3s': 30,
    'KTs': 25, 'QTs': 20, 'JTs': 15,
    'T9s': 25, '98s': 20, '87s': 15, '76s': 15, '54s': 15,
    'AJo': 35, 'ATo': 20, 'KQo': 30,
  } as { [hand: string]: number },
  // Hands we flat Call 100%
  callHands: [
    '66', '55', '44', '33', '22',
    'A9s', 'A8s', 'A7s', 'A6s', 'A2s',
    'KQs', 'KJs', 'K9s', 'K8s',
    'QJs', 'QTs', 'Q9s',
    'J9s', 'T8s', '97s',
    'KJo', 'KTo', 'QJo', 'QTo', 'JTo',
  ],
  // Hands we call with a mixed frequency (sometimes Fold, sometimes Call)
  mixedCallHands: {
    '88': 70, '77': 80,
    'K7s': 60, 'K6s': 50, 'K5s': 30,
    'Q8s': 60, 'Q7s': 40, 'J8s': 50, 'J7s': 30,
    'T7s': 40, '98s': 80, '96s': 20, '87s': 85, '86s': 40,
    '76s': 85, '75s': 45, '65s': 80, '64s': 30, '54s': 70,
    'A9o': 50, 'A8o': 30, 'A7o': 15,
    'K9o': 45, 'Q9o': 35, 'J9o': 25, 'T9o': 15,
  } as { [hand: string]: number },
  evBase: {
    'AA': 6.50, 'KK': 5.20, 'QQ': 4.10, 'JJ': 3.10,
    'AKs': 3.50, 'AKo': 2.80,
    'QJs': 0.85, 'JTs': 0.90, 'T9s': 0.75,
    '54s': 0.35, '22': 0.40,
  } as { [hand: string]: number },
};

const bbVsBtnRange = generateRange(bbVsBtnRules, (hand, row, col) => {
  const isPocket = row === col;
  const isSuited = row < col;
  const highValue = 14 - Math.min(row, col);
  const lowValue = 14 - Math.max(row, col);

  if (isPocket) return Math.max(0, (highValue - 4) * 0.15);
  if (isSuited) return Math.max(0, (highValue + lowValue - 14) * 0.05);
  return Math.max(0, (highValue + lowValue - 16) * 0.02);
});

// -----------------------------------------------------------------------------
// 4. SB vs BB (40BB Tournament, Complex Limp/Raise mixed strategy)
// -----------------------------------------------------------------------------
const sbVsBbRules = {
  // Standard actions in 40BB SB vs BB GTO includes tons of Limps (Call) & some Raises
  raiseHands: [
    'AA', 'KK', 'QQ', 'JJ',
    'AKs', 'AQs',
    'AKo',
  ],
  mixedRaiseHands: {
    'TT': 50, '99': 40, '88': 30,
    'AJs': 40, 'ATs': 35, 'A5s': 50, 'A4s': 45,
    'KQs': 40, 'KJs': 30,
    'JTs': 20, 'T9s': 20,
    'AQo': 60, 'AJo': 50, 'KQo': 40,
  } as { [hand: string]: number },
  callHands: [
    '77', '66', '55',
    'A9s', 'A8s', 'A7s', 'A6s', 'A3s', 'A2s',
    'KTs', 'K9s', 'K8s',
    'QJs', 'QTs', 'Q9s',
    'J9s', 'J8s',
    'T8s', '98s', '97s', '87s', '76s', '65s',
    'ATo', 'A9o', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo',
  ],
  mixedCallHands: {
    '44': 60, '33': 50, '22': 40,
    'K7s': 70, 'K6s': 60, 'K5s': 50,
    'Q8s': 70, 'Q7s': 50, 'J7s': 45,
    'T7s': 50, '86s': 50, '75s': 45, '54s': 60,
    'A8o': 65, 'A7o': 50, 'A5o': 60, 'A4o': 40,
    'K9o': 60, 'Q9o': 50, 'J9o': 40,
  } as { [hand: string]: number },
  evBase: {
    'AA': 3.10, 'KK': 2.45, 'QQ': 1.95,
    'AKs': 1.85, 'AKo': 1.50,
    'JTs': 0.55, 'T9s': 0.45,
  } as { [hand: string]: number },
};

const sbVsBbRange = generateRange(sbVsBbRules, (hand, row, col) => {
  const isPocket = row === col;
  const isSuited = row < col;
  const highValue = 14 - Math.min(row, col);
  const lowValue = 14 - Math.max(row, col);

  if (isPocket) return Math.max(0, (highValue - 3) * 0.08);
  if (isSuited) return Math.max(0, (highValue + lowValue - 14) * 0.03);
  return Math.max(0, (highValue + lowValue - 17) * 0.01);
});

// -----------------------------------------------------------------------------
// 5. BTN Push or Fold (20BB Tournament, Pure Red or Blue)
// -----------------------------------------------------------------------------
const btnPushFoldRules = {
  // All-in (Raise 100%) or Fold. No Coaling/Limping at 20BB.
  raiseHands: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s',
    'QJs', 'QTs', 'Q9s',
    'JTs', 'J9s',
    'T9s', '98s', '87s', '76s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o',
    'KQo', 'KJo', 'KTo',
    'QJo', 'QTo',
    'JTo',
  ],
  mixedRaiseHands: {
    'K6s': 50, 'K5s': 30,
    'Q8s': 60, 'Q7s': 40,
    'J8s': 50, 'T8s': 40,
    '97s': 35, '86s': 30, '65s': 50, '54s': 40,
    'A7o': 60, 'A5o': 50, 'A4o': 30,
    'K9o': 60, 'Q9o': 50,
  } as { [hand: string]: number },
  callHands: [] as string[],
  mixedCallHands: {} as { [hand: string]: number },
  evBase: {
    'AA': 4.50, 'KK': 3.50, 'QQ': 2.80,
    'AKo': 1.50, 'KQs': 0.80, '76s': 0.15,
  } as { [hand: string]: number },
};

const btnPushFoldRange = generateRange(btnPushFoldRules, (hand, row, col) => {
  const isPocket = row === col;
  const isSuited = row < col;
  const highValue = 14 - Math.min(row, col);
  const lowValue = 14 - Math.max(row, col);

  if (isPocket) return highValue * 0.08;
  if (isSuited) return (highValue + lowValue) * 0.02;
  return Math.max(0, (highValue + lowValue - 16) * 0.01);
});


// -----------------------------------------------------------------------------
// 6. CO RFI (Preflop Open, 100BB)
// -----------------------------------------------------------------------------
const coRfiRules = {
  raiseHands: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s',
    'KQs', 'KJs', 'KTs', 'K9s',
    'QJs', 'QTs', 'Q9s',
    'JTs', 'J9s',
    'T9s',
    '98s', '87s',
    'AKo', 'AQo', 'AJo', 'ATo',
    'KQo', 'KJo',
    'QJo',
  ],
  mixedRaiseHands: {
    '66': 80, '55': 60, '44': 40, '33': 20,
    'A3s': 60, 'A2s': 50,
    'K8s': 60, 'K7s': 40, 'K6s': 20,
    'Q8s': 50, 'J8s': 40, 'T8s': 45, '97s': 30, '86s': 30, '76s': 50, '65s': 40,
    'KQo': 85, 'KTo': 45, 'QTo': 40, 'JTo': 30,
    'A9o': 40, 'K9o': 30,
  } as { [hand: string]: number },
  callHands: [] as string[],
  mixedCallHands: {} as { [hand: string]: number },
  evBase: {
    'AA': 5.00, 'KK': 3.85, 'QQ': 2.95, 'JJ': 2.20,
    'AKs': 2.30, 'AQs': 1.85, 'AKo': 1.65,
  } as { [hand: string]: number },
};

const coRfiRange = generateRange(coRfiRules, (hand, row, col) => {
  const isPocket = row === col;
  const isSuited = row < col;
  const highValue = 14 - Math.min(row, col);
  const lowValue = 14 - Math.max(row, col);

  if (isPocket) return highValue * 0.12;
  if (isSuited) return (highValue + lowValue) * 0.05;
  return Math.max(0, (highValue + lowValue - 15) * 0.015);
});

// -----------------------------------------------------------------------------
// 7. BB vs SB 3BB Open (100BB, Polarized Defense)
// -----------------------------------------------------------------------------
const bbVsSbRules = {
  raiseHands: [
    'AA', 'KK', 'QQ', 'JJ', 'TT',
    'AKs', 'AQs', 'AJs',
    'AKo', 'AQo',
  ],
  mixedRaiseHands: {
    '99': 60, '88': 50,
    'ATs': 40, 'A9s': 30, 'A5s': 60, 'A4s': 50, 'A3s': 40, 'A2s': 35,
    'KTs': 40, 'QTs': 35, 'JTs': 30, 'T9s': 35, '98s': 30, '87s': 25,
    'AJo': 50, 'KQo': 45,
  } as { [hand: string]: number },
  callHands: [
    '77', '66', '55', '44', '33', '22',
    'A8s', 'A7s', 'A6s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s',
    'QJs', 'QTs', 'Q9s', 'Q8s',
    'JTs', 'J9s', 'J8s',
    'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '65s', '54s',
    'AJo', 'ATo', 'A9o', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo',
  ],
  mixedCallHands: {
    'K7s': 70, 'K6s': 55, 'K5s': 45,
    'J7s': 50, 'T7s': 50, '96s': 35, '85s': 30, '75s': 50, '64s': 40,
    'A8o': 60, 'A7o': 45, 'A6o': 20, 'K9o': 55, 'Q9o': 50, 'J9o': 40,
  } as { [hand: string]: number },
  evBase: {
    'AA': 6.20, 'KK': 4.95, 'QQ': 3.90, 'JJ': 2.95,
    'AKs': 3.20, 'AKo': 2.60, 'QJs': 0.95,
  } as { [hand: string]: number },
};

const bbVsSbRange = generateRange(bbVsSbRules, (hand, row, col) => {
  const isPocket = row === col;
  const isSuited = row < col;
  const highValue = 14 - Math.min(row, col);
  const lowValue = 14 - Math.max(row, col);

  if (isPocket) return Math.max(0, (highValue - 3) * 0.14);
  if (isSuited) return Math.max(0, (highValue + lowValue - 13) * 0.045);
  return Math.max(0, (highValue + lowValue - 16) * 0.015);
});


// Exporting the list of mock GTO situations with highly accurate representation
export const SITUATIONS: Situation[] = [
  {
    id: 'utg-rfi-100bb',
    name: 'UTG RFI (Open)',
    description: '100BB キャッシュゲームにおけるアーリーポジション（UTG）のプリフロップオープンレンジ。非常にタイトかつアグレッシブな戦略。',
    stackDepth: '100BB',
    myPosition: 'UTG',
    opponentPosition: 'None',
    heroAction: 'RFI',
    ranges: utgRfiRange,
  },
  {
    id: 'co-rfi-100bb',
    name: 'CO RFI (Open)',
    description: '100BB キャッシュゲームにおけるカットオフポジション（CO）のオープンレンジ。BTNに次いで広いマージンで攻勢をかけられます。',
    stackDepth: '100BB',
    myPosition: 'CO',
    opponentPosition: 'None',
    heroAction: 'RFI',
    ranges: coRfiRange,
  },
  {
    id: 'btn-rfi-100bb',
    name: 'BTN RFI (Open)',
    description: '100BB キャッシュゲームにおけるボタン（BTN）のプリフロップオープンレンジ。ポジション有利を活かした広いオープン戦略。',
    stackDepth: '100BB',
    myPosition: 'BTN',
    opponentPosition: 'None',
    heroAction: 'RFI',
    ranges: btnRfiRange,
  },
  {
    id: 'bb-vs-btn-100bb',
    name: 'BB vs BTN Open',
    description: '100BB キャッシュゲームにおける、BTNの2.5BBオープンに対するBBのGTOディフェンス戦略。広いコールレンジと、偏りのある3Bet選択。',
    stackDepth: '100BB',
    myPosition: 'BB',
    opponentPosition: 'BTN',
    heroAction: 'vs RFI',
    ranges: bbVsBtnRange,
  },
  {
    id: 'bb-vs-sb-100bb',
    name: 'BB vs SB 3BB Open',
    description: '100BB キャッシュゲームにおける、SBの3BBオープンに対するBBのディフェンスレンジ。極めて広いディフェンス頻度が必要です。',
    stackDepth: '100BB',
    myPosition: 'BB',
    opponentPosition: 'SB',
    heroAction: 'vs RFI',
    ranges: bbVsSbRange,
  },
  {
    id: 'sb-vs-bb-40bb',
    name: 'SB vs BB (40BB)',
    description: '40BB トーナメント中盤における、SBからBBに対する戦略。スモールブラインドから大量のリンプコールを織り交ぜた極めて複雑なGTOスペクトル。',
    stackDepth: '40BB',
    myPosition: 'SB',
    opponentPosition: 'BB',
    heroAction: 'vs RFI',
    ranges: sbVsBbRange,
  },
  {
    id: 'btn-push-fold-20bb',
    name: 'BTN Push or Fold (20BB)',
    description: '20BB トーナメント終盤における、BTNのプッシュ or フォールド戦略（ショートスタック）。混合のアクションはほぼなく、オールイン or フォールドの二通り。',
    stackDepth: '20BB',
    myPosition: 'BTN',
    opponentPosition: 'None',
    heroAction: 'Push/Fold',
    ranges: btnPushFoldRange,
  },
];

// Generate Quiz Questions for GTO Training
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    situationName: 'UTG RFI (100BB)',
    stackDepth: '100BB',
    position: 'UTG',
    hand: '77',
    correctAction: 'Raise',
    evs: { Raise: 0.12, Call: -0.15, Fold: 0.0 },
    explanation: '77は100BB UTGにおけるRFIレンジ of 境界線上（マージナル）のハンドです。GTOでは約60%の頻度でオープンルーズ（Raise）、約40%でFold（期待値は拮抗）します。アミューズメントカジノのルースな環境ではFoldを選択することも有効ですが、実戦では「Raise（オープン）」が主要な戦略です。',
  },
  {
    id: 'q2',
    situationName: 'UTG RFI (100BB)',
    stackDepth: '100BB',
    position: 'UTG',
    hand: 'A5s',
    correctAction: 'Raise',
    evs: { Raise: 0.22, Call: -0.05, Fold: 0.0 },
    explanation: 'A5sはスーテッドエースとしてドロー（ナッツフラッシュ、ストレート）の発展性があり、かつ blocker（相手のAA、AK、AQのコンビネーションを減らす極めて重要な能力）を持つため、UTGからマージナルRFI（Raise 60% / Fold 40%）として混合レイズが最も利益的です。',
  },
  {
    id: 'q3',
    situationName: 'BB vs BTN Open (100BB)',
    stackDepth: '100BB',
    position: 'BB',
    opponentPosition: 'BTN',
    hand: 'JTs',
    correctAction: 'Call',
    evs: { Raise: 0.25, Call: 0.90, Fold: 0.0 },
    explanation: 'JTsはBBディフェンスとして、BTNのオープンに対する最高級の「Call」ハンドです。3Bet（Raise）を返す混合頻度（約15%）もありますが、そのほとんどはCall（85%）してポストフロップのプレイアビリティを重視します。GTO戦略上、ピュアなCallが最も期待値が高い選択肢の1つです。',
  },
  {
    id: 'q4',
    situationName: 'BB vs BTN Open (100BB)',
    stackDepth: '100BB',
    position: 'BB',
    opponentPosition: 'BTN',
    hand: 'A5o',
    correctAction: 'Fold',
    evs: { Raise: -0.10, Call: -0.18, Fold: 0.0 },
    explanation: 'A5s（スーテッド）は強力ですが、A5o（オフスーテッド）はJTsなどと異なりスペードやハートのドローによる実現性が極めて低く、ポストフロップで深刻なリバースインプライドオッズを抱えるため、BTNのオープンに対しては15%程度の頻度でブラフ3Betを返す以外、原則は100% Foldすべきです。',
  },
  {
    id: 'q5',
    situationName: 'SB vs BB (40BB)',
    stackDepth: '40BB',
    position: 'SB',
    opponentPosition: 'BB',
    hand: 'KTs',
    correctAction: 'Call',
    evs: { Raise: 0.35, Call: 0.48, Fold: 0.0 },
    explanation: '40BBのSB vs BB戦では、SBは非常に多くの「Limp-In (Call)」レンジを持ちます。KTsは強いためRaiseする頻度も40%程度ありますが、約60%はLimp-In（Call）が優先されます。これによりBBの強力な3Betシャブ（オールイン）や3Betレイズを抑止しつつ、ポストフロップで主導権または実現性を保ちます。',
  },
  {
    id: 'q6',
    situationName: 'BTN Push or Fold (20BB)',
    stackDepth: '20BB',
    position: 'BTN',
    hand: '22',
    correctAction: 'Raise', // Push
    evs: { Raise: 0.15, Call: -0.45, Fold: 0.0 },
    explanation: '20BB以下になると、BTNから小さなオープンサイズ（2xなど）でレイズフォールドするよりも、マージナルなポケットペアは「Push（オールイン）」か「Fold」のプリフロップ純粋選択になります。22はギリギリPushで期待値がプラス（+0.15BB）になるハンドです。',
  },
  {
    id: 'q7',
    situationName: 'CO RFI Open (100BB)',
    stackDepth: '100BB',
    position: 'CO',
    hand: '66',
    correctAction: 'Raise',
    evs: { Raise: 0.08, Call: -0.12, Fold: 0.0 },
    explanation: '66は100BBのカットオフ(CO)ポジションからは、約80%という非常に高い確率でRFIレイズオープンすべきハンドです。マージナルではありますが、ポジション力をいかしてRFIを行うことで、BTNやSB、BBにプレッシャーを与えてポットを先制できます。',
  },
  {
    id: 'q8',
    situationName: 'BB vs SB 3BB Open (100BB)',
    stackDepth: '100BB',
    position: 'BB',
    opponentPosition: 'SB',
    hand: 'KJs',
    correctAction: 'Call',
    evs: { Raise: 0.35, Call: 0.70, Fold: 0.0 },
    explanation: 'KJsはSBの3BBという大きなパワーオープンに対しても、BBでの圧倒的な「Call」ハンド（期待値+0.70BB）になります。ポジションが終始インポジション（IP）であるため、コールからポストフロップでの戦いを主導するのが最も勝率が高いです。',
  },
  {
    id: 'q9',
    situationName: 'CO RFI Open (100BB)',
    stackDepth: '100BB',
    position: 'CO',
    hand: 'A9s',
    correctAction: 'Raise',
    evs: { Raise: 0.35, Call: -0.05, Fold: 0.0 },
    explanation: 'COポジションからのスーテッドエース A9s は完全に100%「Raiseオープン」です。インプライドオッズも、相手のプレミアムペアをブロックするブロッカー能力も高く、非常に強固なオープンアプローチです。',
  },
  {
    id: 'q10',
    situationName: 'BB vs SB 3BB Open (100BB)',
    stackDepth: '100BB',
    position: 'BB',
    opponentPosition: 'SB',
    hand: 'A6o',
    correctAction: 'Fold',
    evs: { Raise: -0.05, Call: -0.15, Fold: 0.0 },
    explanation: 'A6oはハイカードではありますが、オフスーテッド(o)の限界からフラッシュドローが期待できず、相手の強いエースにキッカー負けする「リバースインプライドオッズ」が深刻です。そのため、BB vs SBの広い攻防であっても約80%フォールドが正解になります。',
  },
  {
    id: 'q11',
    situationName: 'Flop C-Bet Defense',
    stackDepth: '100BB',
    position: 'BB',
    opponentPosition: 'BTN',
    hand: 'Jh Th',
    street: 'Flop',
    board: ['Ks', 'Qd', '4h'],
    opponentActionText: 'BTNが1/3ポットサイズ (1.8BB) のC-Betを打ちました。',
    precedingHistory: '【プリフロップ】あなたがBBでJ♥ T♥。BTNが2.5BBにレイズオープン、あなたのみコール。ポットは5.5BB。',
    correctAction: 'Call',
    evs: { Raise: 0.15, Call: 0.85, Fold: 0.0 },
    explanation: 'フロップ K♠ Q♦ 4♥ において、J♥ T♥ はオープンエンドストレートドロー（OESD）およびバックドアフラッシュドローを持つ強力な発展性のあるドローハンドです。BTNの小さなC-Betに対してレイズ（チェックレイズ）を返す頻度は約15%ほどありますが、基本的には「Call」を選択してインプライドオッズを追求します。ここでレイズをしすぎると、相手の超強レンジ（KQ、セット等）からリレイズ（3-Bet）を受けドローを放棄せざるを得なくなる危険があるため、GTO上Callの期待値が高まっています。',
  },
  {
    id: 'q12',
    situationName: 'Flop Donk Setup',
    stackDepth: '100BB',
    position: 'BB',
    opponentPosition: 'UTG',
    hand: '5h 4h',
    street: 'Flop',
    board: ['7h', '6s', '3d'],
    opponentActionText: 'UTGがピュアチェックで手番を回してきました。',
    precedingHistory: '【プリフロップ】UTGが2.5BBにレイズオープン、あなたがBBから5♥ 4♥でコール。ポットは5.5BB。',
    correctAction: 'Raise', // Bet / Raise action to seize lead
    evs: { Raise: 0.95, Call: 0.40, Fold: 0.0 },
    explanation: 'ボード 7♥ 6♠ 3♦ はローボードであり、BBであるあなた（コール側）にセット（77, 66, 33）や2ペア（76s等）が高密度で含まれています。これに対しUTGはハイカードペアが多く、このボードは「BBに著しくフィットしたレンジ優位」が存在します。ここで5♥ 4♥（OESD + バックドアフラッシュ）のような優秀なドローを抱えている場合、おとなしくチェックするよりも能動的にドンクベット（Raise/Bet：ポーカーゲーム内ではRaise表記で能動アクションを起動）を放ち、アグレッサーのハイカードを強制フォールドさせるのがGTOにおける利益的エクスプロイト手法です。',
  },
  {
    id: 'q13',
    situationName: 'Turn Protection Check',
    stackDepth: '95BB',
    position: 'BB',
    opponentPosition: 'BTN',
    hand: '9c 9h',
    street: 'Turn',
    board: ['Ts', '9d', '4c', 'Jh'],
    opponentActionText: 'BTNが2/3ポットサイズ (8BB) の強気なダブルバレルを打ち込んできました。',
    precedingHistory: '【プリフロップ】BTNオープン(2.5BB)にあなたがBBから9♣ 9♥でコール。【フロップ】[T♠ 9♦ 4♣]であなたがチェック、相手4BBにあなたがコール。【ターン】危険な[J♥]（ストレート完成ボード）が落ちました。',
    correctAction: 'Call',
    evs: { Raise: -0.22, Call: 0.55, Fold: 0.0 },
    explanation: 'ターンでJ♥が落ち、ボードは T♠ 9♦ 4♣ J♥ に変化。KQや87のストレートがすべて完成するウェットな状態（危険ボード）になりました。あなたの9♣ 9♥はセット（ミドルセット）というモンスター級の強さですが、相手から強力な2ペアやストレートからの大カウンターを避けるため、ここではチェックレイズ（Raise）を仕掛けずに「Call」に留めてポットコントロールを行うのがGTOの絶対法則です。ここでレイズすると、ストレート相手に自己破滅的な特攻をするか、こちらより弱いハンド（1ペア等）をすべて降ろしてしまい期待値がゼロ（マイナス）以下に転落します。',
  },
  {
    id: 'q14',
    situationName: 'River Spot Hero Call',
    stackDepth: '80BB',
    position: 'BB',
    opponentPosition: 'BTN',
    hand: 'As Th',
    street: 'River',
    board: ['Tc', '7d', '4s', '2h', 'Kd'],
    opponentActionText: 'BTNがリバーでポットの75% (24BB) の大きなブラフ風ベットを仕掛けました。',
    precedingHistory: '【プリフロップ】BTNオープン(2BB)にあなたがBBコール。【フロップ】[T♣ 7♦ 4♠]でBTN 2.5BBベットにコール。【ターン】[2♥]で両者チェック。【リバー】オーバーカードの[K♦]が落ちました。',
    correctAction: 'Call',
    evs: { Raise: -0.60, Call: 1.10, Fold: 0.0 },
    explanation: 'リバーに落ちたK♦はオーバーカードであり、相手にヒットしうる怖いカードですが、相手は強固であれば通常ターンでバレルを打ち続けるため、チェックバックした時点でKxを持っている頻度は低いです。あなたのA♠ T♥は、相手がフロップでベットしたフラッシュドロー滑りやJ-highなどのブラフ（QJ等）をほぼブロックしないため、最高のブラフキャッチャーとして君臨します。したがって、ここは勇気を持って「Call」を押し、ショウダウンを勝ち取るのがGTO的正解です。',
  },
  {
    id: 'q15',
    situationName: 'River Trap Value Bet',
    stackDepth: '75BB',
    position: 'BTN',
    opponentPosition: 'BB',
    hand: 'Ah Ad',
    street: 'River',
    board: ['Ac', 'Jh', '7s', '2c', 'Td'],
    opponentActionText: 'BBがチェックであなた（BTN）にターンを引き渡しました。',
    precedingHistory: '【プリフロップ】あなたがBTNからA♥ A♦で2.5BBにレイズ、BBコール。【フロップ】[A♣ J♥ 7♠]のトップセットであなたが4BBベット、相手コール。【ターン】[2♣]で両者チェック。【リバー】[T♦]が落ち、BBはチェックです。',
    correctAction: 'Raise', // Bet / Raise
    evs: { Raise: 4.80, Call: 1.50, Fold: 0.0 },
    explanation: 'あなたのA♥ A♦は、リバーで最高難度のモンスター役「トップセット（AAA）」です。BBがチェックしたからといって、こちらもチェックバック（Callに相当）してしまうのは甚大なバリュー漏らし（機会損失）です。相手のJ-highペアや、K-highなどのマージナルハンドはチェックコールを検討しており、バリューベット（Raise / ポータル内能動アクションはRaise）を大きくポットの70%〜80%サイズで打つことで、最大利益（期待値+4.80BB）を絞り出せます。',
  },
];
