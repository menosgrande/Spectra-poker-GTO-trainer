export interface ActionFrequency {
  raise: number; // 0 to 100
  call: number;  // 0 to 100
  fold: number;  // 0 to 100
}

export interface HandStrategy {
  hand: string; // e.g. "AA", "AKs", "AQo"
  actions: ActionFrequency;
  ev: number; // Expected value in Big Blinds (BB)
  advice?: string;
}

export type HandRangeMap = { [hand: string]: HandStrategy };

export interface Situation {
  id: string;
  name: string;
  description: string;
  stackDepth: '100BB' | '40BB' | '20BB';
  myPosition: string; // e.g. "UTG", "BTN", "SB"
  opponentPosition?: string; // e.g. "None", "BB", "UTG"
  heroAction: 'RFI' | 'vs 3Bet' | 'vs RFI' | 'Push/Fold';
  ranges: HandRangeMap;
}

export interface QuizQuestion {
  id: string;
  situationName: string;
  stackDepth: string;
  position: string;
  opponentPosition?: string;
  hand: string;
  correctAction: 'Raise' | 'Call' | 'Fold';
  evs: {
    Raise: number;
    Call: number;
    Fold: number;
  };
  explanation: string;
  // Postflop / Multi-street extensions
  street?: 'Preflop' | 'Flop' | 'Turn' | 'River';
  board?: string[]; // Community board cards. e.g. ["Ks", "Qd", "9h"]
  opponentActionText?: string; // e.g. "Opponent bet 50% pot"
  precedingHistory?: string; // Preceding action summary
}

export interface SavedScenario {
  id: string;
  title: string;
  notes: string;
  createdAt: string;
}
