import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview Global Genkit Configuration v2.1.
 * FIXED: Removed invalid named export 'gemini15Flash' to resolve server startup crash.
 */
export const ai = genkit({
  plugins: [googleAI()],
});
