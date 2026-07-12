
import {genkit} from 'genkit';
import {googleAI, gemini15Flash} from '@genkit-ai/google-genai';

/**
 * @fileOverview Global Genkit Configuration v2.0.
 * FIXED: Corrected model naming and reference for production stability.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});
