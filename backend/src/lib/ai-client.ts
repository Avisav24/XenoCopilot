import { GoogleGenAI } from '@google/genai';
import { Groq } from 'groq-sdk';

// ── AI Provider Key Pool ────────────────────────────────────────────
// Keys are loaded at startup. Multiple keys per provider enable
// automatic rotation when rate limits (429) are hit.

const geminiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
].filter(Boolean) as string[];

const groqKeys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3
].filter(Boolean) as string[];

export const genaiInstances = geminiKeys.map(key => new GoogleGenAI({ apiKey: key }));
export const groqInstances = groqKeys.map(key => new Groq({ apiKey: key }));

/**
 * Multi-provider AI generation with automatic failover cascade.
 *
 * Failover order:
 *   Gemini Key 1 → Key 2 → Key 3 → Groq LLaMA 3.3 70B → throw
 *
 * Scale note: In production this would use a circuit-breaker pattern
 * (e.g. opossum) with exponential backoff per provider, rather than
 * sequential key rotation on every call.
 */
export async function generateWithFallback(
  systemInstruction: string,
  userPrompt: string,
  temperature: number,
  isJson: boolean = false
): Promise<string> {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  let lastGeminiError: Error | undefined;

  for (let i = 0; i < genaiInstances.length; i++) {
    try {
      const config: any = { systemInstruction, temperature };
      if (isJson) config.responseMimeType = 'application/json';

      const response = await genaiInstances[i].models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config,
      });
      return response?.text ?? '';
    } catch (error: any) {
      console.warn(`[Gemini API] Key ${i + 1} Failed: ${error.message}. Trying next...`);
      lastGeminiError = error;
    }
  }

  // All Gemini keys exhausted — fall back to Groq
  console.warn('[Gemini API] All keys failed. Falling back to Groq...');
  let lastGroqError: Error | undefined;
  const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  for (let i = 0; i < groqInstances.length; i++) {
    try {
      const params: any = {
        model: groqModel,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt },
        ],
        temperature,
      };
      if (isJson) params.response_format = { type: 'json_object' };

      const response = await groqInstances[i].chat.completions.create(params);
      return response.choices[0]?.message?.content ?? '';
    } catch (groqError: any) {
      console.warn(`[Groq API] Key ${i + 1} Failed: ${groqError.message}. Trying next...`);
      lastGroqError = groqError;
    }
  }

  throw new Error(`Both Gemini and Groq failed. Last error: ${lastGroqError?.message}`);
}

/** Strip markdown code fences that LLMs sometimes wrap around JSON output. */
export function cleanJsonResponse(text: string): string {
  return text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
}
