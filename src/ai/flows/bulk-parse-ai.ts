'use server';
/**
 * @fileOverview Production AI Bulk Ingestion Engine v8.0.
 * FIXED: Added Gurmukhi script isolation and paragraph preservation rules.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

const MCQSchema = z.object({
  question_en: z.string().describe('English question text. Preserve all blank lines and paragraphs exactly.'),
  question_pa: z.string().optional().describe('Punjabi question text. MUST USE ONLY GURMUKHI UNICODE (U+0A00-U+0A7F). Preserve all paragraphs.'),
  question_hi: z.string().optional().describe('Hindi question text. Preserve all paragraphs.'),
  optionA: z.string(),
  optionB: z.string(),
  optionC: z.string(),
  optionD: z.string(),
  answer: z.enum(['A', 'B', 'C', 'D']),
  explanation_en: z.string().optional().describe('English explanation. Preserve all line breaks.'),
  explanation_pa: z.string().optional().describe('Punjabi explanation. GURMUKHI ONLY.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']).optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
});

const BulkParseOutputSchema = z.object({
  questions: z.array(MCQSchema),
});

export async function bulkParseMCQ(input: { rawText: string, examType?: string, apiKey?: string }): Promise<any> {
  const { rawText, examType, apiKey } = input;

  if (!apiKey) {
     throw new Error("AI Hub Offline: Target API key not provided.");
  }

  const aiInstance = genkit({
    plugins: [googleAI({ apiKey })],
  });

  try {
    const response = await aiInstance.generate({
      model: 'googleai/gemini-1.5-flash', 
      output: { schema: BulkParseOutputSchema },
      prompt: `You are an expert Government Exam MCQ Parser and OCR Specialist. 

TEXT TO PROCESS:
---
${rawText}
---

STRICT FORMATTING RULES:
1. PRESERVE WHITESPACE: Do not collapse empty lines or paragraphs. If a question has multiple paragraphs, keep them separated.
2. SCRIPT ISOLATION: 
   - Put English text in "question_en".
   - Put Punjabi text in "question_pa". 
   - CRITICAL: "question_pa" must contain ONLY Gurmukhi script. Re-OCR if you detect Hindi/Devanagari characters.
3. NO LABELS: Do not insert words like "Number Series" or "Explanation" inside the content fields.
4. PARAGRAPH GAP: If there is a final question sentence after a statement, ensure there is one blank line before it.

TARGET EXAM CONTEXT: ${examType || 'General Punjab Exam'}`,
    });

    if (!response.output) throw new Error("AI extraction failed to return structured data.");
    return response.output;
  } catch (error: any) {
    console.error("[AI_EXTRACTION_FAILURE]:", error.message);
    throw error;
  }
}
