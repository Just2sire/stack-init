import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

/**
 * Get the Gemini API key from environment variables.
 */
export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return apiKey;
}

/**
 * Get the configured Gemini model name or default to a stable flash model.
 */
export function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL || 'gemini-2.0-flash';
}

/**
 * Initialize and return a Gemini model instance.
 */
export function getGeminiModel(config?: GenerationConfig) {
  const genAI = new GoogleGenerativeAI(getGeminiApiKey());
  return genAI.getGenerativeModel({
    model: getGeminiModelName(),
    generationConfig: config,
  });
}

/**
 * Generate structured JSON content using Gemini.
 * Utilizes the native responseMimeType: 'application/json' for reliability.
 * Includes a retry mechanism for 503 errors (Service Unavailable).
 */
export async function generateJSON<T>(
  systemPrompt: string, 
  userPrompt: string, 
  maxRetries = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = getGeminiModel({
        responseMimeType: 'application/json',
      });

      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt },
      ]);

      const response = result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text) as T;
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON response:', text);
        throw new Error('L\'IA a renvoyé une structure JSON invalide.');
      }
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || '';
      const is503 = errorMessage.includes('503') || errorMessage.includes('Service Unavailable') || error?.status === 503;
      
      if (is503 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.warn(`Gemini API 503 (Overloaded). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error(`Gemini generateJSON error (Attempt ${attempt + 1}):`, error);
      break; // Non-retryable error or max retries reached
    }
  }

  // If we reach here, it means all attempts failed
  if (lastError?.message?.includes('503') || lastError?.message?.includes('Service Unavailable')) {
    throw new Error('Le service AI est actuellement surchargé. Veuillez réessayer dans quelques instants.');
  }
  
  throw lastError || new Error('Une erreur est survenue lors de la génération par l\'IA.');
}
