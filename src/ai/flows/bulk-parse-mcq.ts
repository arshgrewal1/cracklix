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
  question_english: z.string().describe('Clean English question text. Strip all prefixes like "Q1."'),
  question_punjabi: z.string().describe('Clean Punjabi question text. Strip all prefixes like "ਪ੍ਰਸ਼ਨ 1." or "ਪ੍ਰਸ਼ਨ 01". NO NUMBERING.'),
  option_a_english: z.string(),
  option_a_punjabi: z.string(),
  option_b_english: z.string(),
  option_b_punjabi: z.string(),
  option_c_english: z.string(),
  option_c_punjabi: z.string(),
  option_d_english: z.string(),
  option_d_punjabi: z.string(),
  correct_option: z.enum(['A', 'B', 'C', 'D']),
  explanation_english: z.string().describe('Detailed English derivation. Ensure a clear newline between logical points.'),
  explanation_punjabi: z.string().describe('Detailed Punjabi rationale. Ensure clear spacing.'),
});

const BulkParseInputSchema = z.object({
  rawText: z.string().describe('The large block of raw bilingual MCQ text.'),
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
1. NO DUAL NUMBERING IN QUESTIONS: Extract the English and Punjabi statements cleanly. You MUST strip prefixes like "Q1.", "ਪ੍ਰਸ਼ਨ 1.", or "ਪ੍ਰਸ਼ਨ 01" from the text content. The fields should contain ONLY the question statement.
2. NO SLASHES IN QUESTION STATEMENTS: Do not use a slash to separate languages in the question_english or question_punjabi fields. Put them in their respective fields.
3. CLEAN OPTIONS: Separate the English and Punjabi options from strings like "(A) 15 days / 15 ਦਿਨ". Strip the (A) label and provide clean text for each language field.
4. EXPLANATION SPACING: In explanation_english and explanation_punjabi, ensure you include clear spacing and mathematical steps. Use newlines to separate logical blocks.

---
### INPUT DATA FOR BULK INGESTION:
{{{rawText}}}
---

Please parse the entire dataset at once without omitting any questions or solutions. 
Return a valid JSON array of objects matching the specified schema.`,
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
