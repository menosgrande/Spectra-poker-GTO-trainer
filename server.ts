import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// GTO AI Advisor Endpoint
app.post("/api/gemini/advisor", async (req, res) => {
  try {
    const { situation, hand, action, opponentAction, customQuestion } = req.body;

    const sysInstruction = `
      You are a world-class professional poker GTO (Game Theory Optimal) coach and theoretician.
      Help users analyze their hands and preflop/postflop strategic choices.
      Provide answers in clear, concise, and highly informative Japanese, designed for players who know intermediate to advanced poker terms (such as GTO, EV, blockers, polarization, RFI, flat call, linear, merged, MDF - Minimum Defense Frequency).
      Explain the mathematical logic (why a specific hand belongs to RFI range, why it is a mixed strategy, how its blockers affect the opponent's range, and how stack depth alters the GTO strategy).
      Admit any margin of error if they ask about extreme details, but provide strong, practical GTO guidance.
    `;

    const prompt = `
      以下のポーカーシチュエーションについてGTO的および戦略観点から詳細な分析とアドバイスを提供してください。

      【シチュエーション】 ${situation || '不明'}
      【スタック深度】 ${req.body.stackDepth || '100BB'}
      【ヒーローのハンド】 ${hand || '不明'}
      【ヒーローが取ったアクション / 取ろうとしているアクション】 ${action || 'RFI またはコール / フォールド'}
      ${opponentAction ? `【対戦相手のアクション】 ${opponentAction}` : ''}

      ${customQuestion ? `【ユーザーからの特定の質問】 ${customQuestion}` : 'GTOにおける強みと弱み、混合戦略にする場合の理由、このハンドが持つブロッカー（Blocker）効果について解説してください。'}
    `;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Advisor Error:", error);
    res.status(500).json({ error: error.message || "GTOアドバイザー分析の生成に失敗しました。" });
  }
});

// GTO Custom Quiz Generator (Generates a dynamic poker puzzle!)
app.post("/api/gemini/quiz", async (req, res) => {
  try {
    const sysInstruction = `
      You are a poker GTO quiz creator.
      Generate a realistic, intermediate-to-advanced level GTO strategic scenario question (either Preflop, Flop, Turn, or River) in JSON format.
      The question should force the user to make a critical GTO decision: Raise/Bet, Call (or check/call), or Fold.
      Ensure the scenario is realistic (e.g. 100BB cash, BTN vs BB 3-bet pot Flop defense; OR 20BB MTT Push-Fold preflop; OR River bluff catch situation).
      Do not generate unreasonable or GTO-incorrect nonsense.

      You MUST respond ONLY with a clean JSON object that maps to this TypeScript interface:
      {
        "id": string (random short text),
        "situationName": string (e.g., "BTN vs BB 3-Bet Pot (100BB)" or "Flop Wet C-Bet Defense"),
        "stackDepth": string,
        "position": string,
        "opponentPosition": string,
        "hand": string (e.g. "Jh Th" or "Ac Jd" or "7s 7c"),
        "correctAction": "Raise" | "Call" | "Fold",
        "evs": {
          "Raise": number,
          "Call": number,
          "Fold": number
        },
        "explanation": string (Markdown formatted comprehensive explanation in Japanese discussing the GTO reasons, blocker factors, etc.),
        "street": "Preflop" | "Flop" | "Turn" | "River",
        "board": string[] (optional, required if street is postflop e.g., ["Ks", "Qd", "4h"]),
        "opponentActionText": string (optional, e.g., "相手が1/3ポットサイズ (1.8BB) のC-Betを打ちました。"),
        "precedingHistory": string (optional, e.g., "【プリフロップ】あなたがBBでJ♥ T♥。BTNが2.5BBにレイズオープン...")
      }
    `;

    const prompt = `Create a brand new GTO puzzle. Randomly choose whether it is Preflop or a Postflop street (Flop, Turn, or River). Give realistic EVs (Fold should generally be 0.0 or slightly less relative to standard if it has dead money, but standard fold EV is 0.0. Make sure the higher EV corresponds to the correctAction). Make sure you fill "street", "board" (for postflop), "opponentActionText" and "precedingHistory" so they are displayed professionally. Make the explanation thorough and clear in Japanese.`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: sysInstruction,
        responseMimeType: "application/json",
        temperature: 0.85,
      },
    });

    let jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error("Gemini Quiz Error:", error);
    res.status(500).json({ error: error.message || "GTOクイズの生成に失敗しました。" });
  }
});

// Camera-based Poker Board Card Recognition & postflop analysis
app.post("/api/gemini/recognize-board", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "画像データが提供されていません。" });
    }

    // Strip data-URI scheme if present
    let base64Data = image;
    let mimeType = "image/png";
    if (image.includes(",")) {
      const parts = image.split(",");
      const match = parts[0].match(/data:(.*?);base64/);
      if (match) mimeType = match[1];
      base64Data = parts[1];
    }

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const promptText = `
      Analyze this image of a poker board. Identify any visible poker cards lying on the board (flop, turn, or river).
      Provide a highly precise extraction of 2-character card designations (e.g. "Ah", "Kd", "Ts", "9c") where:
      - Ranks: A, K, Q, J, T, 9, 8, 7, 6, 5, 4, 3, 2 (Use 'T' for 10)
      - Suits: s (spades), h (hearts), d (diamonds), c (clubs)
      
      Determine the board street (Flop, Turn, River, or Preflop/Unknown).
      Analyze the board texture metrics (wetness, connectedness, and flush density from 0 to 100), and write a professional GTO-based strategic explanation of the board state in concise, polished Japanese.
      
      If no cards are recognized, set isRecognized to false and explain briefly why.
    `;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, promptText],
      config: {
        systemInstruction: "You are a professional GTO poker tool designed to parse camera frames of poker boards and analyze textures.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRecognized: {
              type: Type.BOOLEAN,
              description: "Whether poker cards are successfully recognized in the image"
            },
            cards: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of identified card strings e.g. ['Ah', 'Td', '5c']. Limit to 5 cards."
            },
            street: {
              type: Type.STRING,
              description: "The current street: 'Flop', 'Turn', 'River' or 'Unknown'"
            },
            wetness: {
              type: Type.INTEGER,
              description: "Overall board wetness rating from 0 to 100"
            },
            connectedness: {
              type: Type.INTEGER,
              description: "Board straight danger rating from 0 to 100"
            },
            flushDensity: {
              type: Type.INTEGER,
              description: "Board flush danger rating from 0 to 100"
            },
            textureExplanation: {
              type: Type.STRING,
              description: "Detailed, premium strategic guidance in Japanese about GTO board range distributions, potential combos, and c-bet thoughts."
            }
          },
          required: ["isRecognized", "cards", "street", "wetness", "connectedness", "flushDensity", "textureExplanation"]
        },
        temperature: 0.2, // Low temperature for high accuracy in classification
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Board Recognition Error:", error);
    res.status(500).json({ error: error.message || "ボード認識およびテクスチャ分析に失敗しました。" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Spectra Mobile API Server listening on port ${PORT}`);
  });
}

startServer();
