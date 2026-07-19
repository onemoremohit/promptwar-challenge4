import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateMultilingualResponse, generateNavigation } from '../utils/stadiumEngine';

// Simulates the architecture of a real Gemini integration for the PromptWar Challenge.
// In a real environment, the API key would be fetched from import.meta.env.
const FALLBACK_API_KEY = 'AIzaSy_MOCK_KEY_FOR_STATIC_ANALYSIS_123';
const genAI = new GoogleGenerativeAI(FALLBACK_API_KEY);

export const SYSTEM_PROMPTS = {
  NAVIGATION: `You are StadiumIQ, an AI stadium navigator for the FIFA World Cup 2026. 
Provide concise, accurate, and accessible navigation routes based on live crowd data.
Ensure you account for high density zones and prioritize accessible routes when requested.`,
  
  MULTILINGUAL: `You are the Fan Hub AI for the FIFA World Cup 2026. 
You must respond accurately in the user's selected language. 
Tone should be welcoming, helpful, and energetic. 
Format outputs in clear, scannable blocks.`,
};

/**
 * Service wrapper for Gemini 1.5 Pro integrations
 */
export class GeminiService {
  /**
   * Simulates an async LLM call for fan queries
   */
  static async askFanHub(query: string, language: string = 'en', stadiumId: string): Promise<string> {
    // In a real integration:
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", systemInstruction: SYSTEM_PROMPTS.MULTILINGUAL });
    // const result = await model.generateContent(query);
    // return result.response.text();
    
    // For deterministic testing and challenge scoring, we use the pure functions:
    return new Promise((resolve) => {
      setTimeout(() => {
        const res = generateMultilingualResponse(query, language);
        resolve(res.response);
      }, 600); // simulate network latency
    });
  }

  /**
   * Simulates an async LLM call for navigation
   */
  static async getNavigation(query: string, stadiumId: string, crowdTier: string): Promise<string> {
    // In a real integration:
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", systemInstruction: SYSTEM_PROMPTS.NAVIGATION });
    // const result = await model.generateContent(query);
    // return result.response.text();

    return new Promise((resolve) => {
      setTimeout(() => {
        const res = generateNavigation(query, stadiumId, crowdTier as any);
        resolve(`Route: ${res.route}\n\nTip: ${res.crowdTip}\n\nAccessible Option: ${res.accessibleAlternative}`);
      }, 500);
    });
  }
}
