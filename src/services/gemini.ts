import { GoogleGenAI, Type } from "@google/genai";

// VITE USES import.meta.env.VITE_API_KEY
const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const identifyStreetDetails = async (base64Image: string): Promise<{ street: string; number: string; streetBox?: number[]; numberBox?: number[] }> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }, { text: "Analysiere das Bild. Extrahiere Straßenname und Hausnummer mit Bounding Boxen (0-1000)." }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            street: { type: Type.STRING },
            street_box_2d: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            number: { type: Type.STRING },
            number_box_2d: { type: Type.ARRAY, items: { type: Type.INTEGER } }
          }
        }
      }
    });
    const json = JSON.parse(response.text || '{}');
    return { street: json.street || 'UNKNOWN', number: json.number || '', streetBox: json.street_box_2d, numberBox: json.number_box_2d };
  } catch (error) { console.error(error); return { street: 'UNKNOWN', number: '' }; }
};