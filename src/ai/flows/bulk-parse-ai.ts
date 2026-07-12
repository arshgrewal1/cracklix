
'use server';
/**
 * @fileOverview Production AI Bulk Ingestion Engine v3.0.
 * UPDATED: Supports dynamic API Key rotation from the high-fidelity key pool.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

const MCQSchema = z.object({
  question_en: z.string().describe('English question text'),
  question_pa: z.string().optional().describe('Punjabi question text'),
  question_hi: z.string().optional().describe('Hindi question text'),
  optionA: z.string(),
  optionB: z.string(),
  optionC: z.string(),
  optionD: z.string(),
  answer: z.enum(['A', 'B', 'C', 'D']),
  explanation_en: z.string().optional(),
  explanation_pa: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']).optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  diagram_required: z.boolean().optional(),
  diagram_caption: z.string().optional(),
  table_data: z.string().optional().describe('Markdown representation of any table in the question'),
});

const BulkParseOutputSchema = z.object({
  questions: z.array(MCQSchema),
});

/**
 * Bulk Parse Entry Point.
 * Initialized Genkit dynamically per-request to support API key rotation from the pool.
 */
export async function bulkParseMCQ(input: { rawText: string, examType?: string, apiKey?: string }): Promise<any> {
  const { rawText, examType, apiKey } = input;

  if (!apiKey) {
     throw new Error("AI Operation Blocked: API Key node not provided by manager.");
  }

  // Initialize isolated Genkit instance for this rotation node
  const ai = genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-1.5-flash',
  });

  const prompt = ai.definePrompt({
    name: 'bulkParseMCQPrompt',
    input: z.object({ rawText: z.string(), examType: z.string().optional() }),
    output: { schema: BulkParseOutputSchema },
    prompt: `You are an expert Government Exam MCQ Parser. 
Your task is to take the entire provided RAW TEXT and extract EVERY valid MCQ found within it.

TEXT TO PARSE:
---
{{{rawText}}}
---

RULES:
1. Extract ALL questions. Do not skip any.
2. Detect languages automatically. Put English text in "question_en" and Punjabi in "question_pa".
3. For options, extract exactly what belongs to A, B, C, and D. Do not merge them.
4. Correct any OCR mistakes (broken symbols, wrong characters).
5. Identify Math (LaTeX), Reasoning (Puzzles), and Tables.
6. Set "diagram_required" to true if the text mentions Figure, Diagram, or Map.
7. Return ONLY a valid JSON object containing an array of questions.
8. NEVER hallucinate or generate fake content. If a part is missing, leave it empty.

TARGET EXAM CONTEXT: {{{examType}}}`,
  });

  try {
    const { output } = await prompt({ rawText, examType });
    if (!output) throw new Error("AI extraction node returned empty registry.");
    return output;
  } catch (error: any) {
    console.error("[AI_INGEST_NODE_FAILURE]:", error.message);
    throw error;
  }
}
