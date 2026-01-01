
import { GoogleGenAI } from "@google/genai";

export const generatePantun = async (bride: string, groom: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a beautiful 4-line traditional Malay wedding pantun (poem) for the couple ${bride} and ${groom}. Ensure it is romantic and suitable for a digital wedding invitation.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text || "Bunga melati di dalam taman, Harum semerbak di pagi hari; Janji diikat menjadi teman, Ke jinjang pelamin langkah diatur rapi.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Bunga melati di dalam taman, Harum semerbak di pagi hari; Janji diikat menjadi teman, Ke jinjang pelamin langkah diatur rapi.";
  }
};

export const generateStory = async (bride: string, groom: string, theme: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a short, 100-word romantic "Our Story" for a wedding invitation for ${bride} and ${groom}. The theme is ${theme}.`,
      config: {
        temperature: 0.8,
      },
    });
    return response.text || "Once upon a time...";
  } catch (error) {
    return "Our love story began with a simple hello...";
  }
};
