import { GoogleGenAI, Type } from "@google/genai";
import { PlayerCard, PlayerRarity, GroundingSource } from "../types";

export const generatePlayerData = async (prompt: string): Promise<{ data: Partial<PlayerCard>, sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Scout the professional Association Football (Soccer) player: "${prompt}". 
    1. Retrieve real-world stats (0-99) and market data.
    2. FIND a direct, hotlink-friendly RAW image file URL of this player. 
       - SEARCH specifically for Wikimedia Commons images.
       - PREFERRED FORMAT: "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/FILENAME_HERE.jpg"
       - ALTERNATIVE: Direct "upload.wikimedia.org" paths.
       - AVOID page URLs like "/wiki/File:..." unless they are specifically the redirect path above.
    3. Return a detailed scouting report in JSON.
    
    Response MUST be valid JSON.
    Format:
    {
      "name": "string",
      "nationality": "string",
      "club": "string",
      "position": "string",
      "stats": { "pace": 0, "shooting": 0, "passing": 0, "dribbling": 0, "defending": 0, "physical": 0 },
      "rarity": "Common|Uncommon|Rare|Epic|Legendary",
      "marketValue": number,
      "description": "string",
      "suggestedImageUrl": "string"
    }`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    }
  });

  const text = response.text;
  if (!text) throw new Error("Scouting report unavailable.");

  const sources: GroundingSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Official Source',
          uri: chunk.web.uri
        });
      }
    });
  }

  try {
    const data = JSON.parse(text);
    
    if (data.rarity) {
      const r = data.rarity.charAt(0).toUpperCase() + data.rarity.slice(1).toLowerCase();
      data.rarity = Object.values(PlayerRarity).includes(r as PlayerRarity) ? r : PlayerRarity.COMMON;
    }
    return { data, sources };
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return { data, sources };
  }
};

export const generatePlayerImage = async (name: string, club: string, rarity: PlayerRarity): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Premium cinematic sports portrait of soccer player ${name} in ${club} kit. Professional sports photography style, stadium lights background, 8k resolution, realistic lighting. High-end trading card sticker aesthetic.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });

    const candidate = response.candidates?.[0];
    
    // Check if safety filters blocked it
    if (candidate?.finishReason === 'SAFETY') {
      throw new Error("SAFETY_RESTRICTED");
    }

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Portrait generation failed.");
  } catch (err: any) {
    // Re-throw specific safety error
    if (err.message === "SAFETY_RESTRICTED") throw err;
    throw new Error(err.message || "Portrait restricted.");
  }
};