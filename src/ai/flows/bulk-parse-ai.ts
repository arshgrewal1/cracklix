'use server';
/**
 * @fileOverview Production AI Bulk Ingestion Engine v9.0.
 * FIXED: Implemented structured table extraction with layout analysis.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

const TableContentSchema = z.object({
  headers: z.array(z.string()).describe('List of column headers.'),
  rows: z.array(z.array(z.string())).describe('List of rows, where each row is an array of strings representing cell values.'),
  caption: z.string().optional().describe('Optional table title or caption.'),
});

const MCQSchema = z.object({
  question_en: z.string().describe('English question text appearing BEFORE the table or diagram.'),
  question_pa: z.string().optional().describe('Punjabi question text appearing BEFORE the table or diagram. GURMUKHI ONLY.'),
  tableContent: TableContentSchema.optional().describe('Structured table data extracted from the visual layout.'),
  question_suffix_en: z.string().optional().describe('The specific English question sentence appearing AFTER the table.'),
  question_suffix_pa: z.string().optional().describe('The specific Punjabi question sentence appearing AFTER the table.'),
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
1. LAYOUT ANALYSIS: Identify any data tables or grid structures.
2. STRUCTURED TABLES: If a table is found, extract it into the "tableContent" object with headers and rows. DO NOT use ASCII art or Markdown strings. Use the structured array format.
3. SEGMENTATION: 
   - Put introductory text in "question_en" / "question_pa".
   - Put the actual interrogative sentence found AFTER the table in "question_suffix_en" / "question_suffix_pa".
4. SCRIPT ISOLATION: "question_pa" and "explanation_pa" must contain ONLY Gurmukhi script.
5. NO LABELS: Remove "Answer:", "Explanation:", or "Option A" labels from inside the content fields.

TARGET EXAM CONTEXT: ${examType || 'General Punjab Exam'}`,
    });

    if (!response.output) throw new Error("AI extraction failed to return structured data.");
    return response.output;
  } catch (error: any) {
    console.error("[AI_EXTRACTION_FAILURE]:", error.message);
    throw error;
  }
}
