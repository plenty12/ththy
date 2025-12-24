
import { GoogleGenAI } from "@google/genai";

// Always use named parameter and process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getTacticalAdvice(event: string, score: number, health: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a futuristic tactical flight commander. Provide a short, one-sentence radio message in Korean for the pilot based on this event: "${event}". Current Score: ${score}, Health: ${health}%. Keep it immersive, cool, and brief. No markdown.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    // response.text is a property, not a method.
    return response.text || "상황을 주시하라, 조종사.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "통신 장애 발생. 전투를 계속하라.";
  }
}
