
'use server';
/**
 * @fileOverview Expert Bilingual MCQ Data-Formatting AI.
 * 
 * - bulkParseMCQ - AI flow to extract, clean, and map bilingual MCQs.
 * - BulkParseInput - Raw text input for parsing.
 * - BulkParseOutput - Structured JSON array of questions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionOutputSchema = z.object({
  question_number: z.number().describe('The sequential index of the question.'),
  question_english: z.string().describe('Clean English question text. STRIP ALL PREFIXES like "Q1.", "Question 1.", etc.'),
  question_punjabi: z.string().describe('Clean Punjabi question text. STRIP ALL PREFIXES like "ਪ੍ਰਸ਼ਨ 1.", "ਪ੍ਰਸ਼ਨ 01", or "ਸਵਾਲ 1". NO DUAL NUMBERING.'),
  option_a_english: z.string().describe('Clean English text for Option A.'),
  option_a_punjabi: z.string().describe('Clean Punjabi text for Option A.'),
  option_b_english: z.string().describe('Clean English text for Option B.'),
  option_b_punjabi: z.string().describe('Clean Punjabi text for Option B.'),
  option_c_english: z.string().describe('Clean English text for Option C.'),
  option_c_punjabi: z.string().describe('Clean Punjabi text for Option C.'),
  option_d_english: z.string().describe('Clean English text for Option D.'),
  option_d_punjabi: z.string().describe('Clean Punjabi text for Option D.'),
  correct_option: z.enum(['A', 'B', 'C', 'D']),
  explanation_english: z.string().describe('Full Step-by-step English logic. Use double newlines between steps.'),
  explanation_punjabi: z.string().describe('Full Step-by-step Punjabi logic. Use double newlines between steps.'),
});

const BulkParseInputSchema = z.object({
  rawText: z.string().describe('The block of raw bilingual MCQ text.'),
});

const BulkParseOutputSchema = z.array(QuestionOutputSchema);

export async function bulkParseMCQ(input: { rawText: string }): Promise<z.infer<typeof BulkParseOutputSchema>> {
  return bulkParseMCQFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bulkParseMCQ',
  input: { schema: BulkParseInputSchema },
  output: { schema: BulkParseOutputSchema },
  prompt: `You are an expert bilingual data-formatting AI specializing in bulk ingestion for competitive exams. 

### DATA EXTRACTION RULES:
1. NO DUAL NUMBERING OR SLASHES IN QUESTIONS: Extract English and Punjabi questions into their separate fields. You MUST strip prefixes like "Q1.", "ਪ੍ਰਸ਼ਨ 1.", or "ਪ੍ਰਸ਼ਨ 01" from the content. The fields should contain ONLY the statement.
2. NO SLASHES IN STATEMENTS: Do not use a slash to separate languages within a single field.
3. CLEAN OPTIONS: Separate English and Punjabi options from strings like "(A) Geometry / ਰੇਖਾਗਣਿਤ (Geometry)". Strip labels and redundant brackets. Punjabi field should only have Punjabi text, English field only English text.
4. EXPLANATION SPACING: Extract full step-by-step logic. Ensure a clear 1-line gap (double newline) exists between logical steps in the explanation fields.

---
### INPUT DATA FOR BULK INGESTION:
{{{rawText}}}
---

Parse the entire dataset at once without omitting any questions or solutions. 
Return ONLY a valid JSON array of objects matching the specified schema.`,
});

const bulkParseMCQFlow = ai.defineFlow(
  {
    name: 'bulkParseMCQFlow',
    inputSchema: BulkParseInputSchema,
    outputSchema: BulkParseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
