import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateMultilingualResponse, generateNavigation } from '../utils/stadiumEngine';
import type { DensityTier } from '../utils/crowdEngine';

// In a real environment, the API key would be fetched from import.meta.env.VITE_GEMINI_API_KEY
const FALLBACK_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || 'MOCK_GEMINI_API_KEY_12345';
export const genAI = new GoogleGenerativeAI(FALLBACK_API_KEY);

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
  static async askFanHub(query: string, language: string = 'en', _stadiumId: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const res = generateMultilingualResponse(query, language as any);
        resolve(res.response);
      }, 600);
    });
  }

  /**
   * Simulates an async LLM call for navigation
   */
  static async getNavigation(query: string, _stadiumId: string, crowdTier: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const res = generateNavigation(query, _stadiumId, crowdTier as unknown as DensityTier);
        resolve(`Route: ${res.route}\n\nAccessible Option: ${res.accessibleAlternative}`);
      }, 500);
    });
  }
}

