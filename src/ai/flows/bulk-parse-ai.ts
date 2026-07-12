'use server';
/**
 * @fileOverview Production AI Question Repair Hub.
 * Handles fixing broken blocks that deterministic regex failed to parse.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RepairMCQInputSchema = z.object({
  rawText: z.string().describe('The unstructured, noisy block of text containing one MCQ.'),
});

const RepairMCQOutputSchema = z.object({
  englishQuestion: z.string(),
  punjabiQuestion: z.string().optional(),
  hindiQuestion: z.string().optional(),
  optionAEnglish: z.string(),
  optionAPunjabi: z.string().optional(),
  optionBEnglish: z.string(),
  optionBPunjabi: z.string().optional(),
  optionCEnglish: z.string(),
  optionCPunjabi: z.string().optional(),
  optionDEnglish: z.string(),
  optionDPunjabi: z.string().optional(),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  englishExplanation: z.string().optional(),
  diagram_required: z.boolean().optional(),
  diagram_caption: z.string().optional(),
});

export async function repairMCQ(input: { rawText: string }): Promise<any> {
  return repairMCQFlow(input);
}

const prompt = ai.definePrompt({
  name: 'repairMCQPrompt',
  input: {schema: RepairMCQInputSchema},
  output: {schema: RepairMCQOutputSchema},
  prompt: `You are an expert OCR repair agent for a government exam platform.
Your task is to take a broken, noisy block of text and extract exactly ONE high-fidelity MCQ.

RULES:
1. Identify Question, Options (A, B, C, D), and Answer.
2. Separate English and Punjabi/Hindi text correctly.
3. Fix typos caused by OCR (e.g., '0' instead of 'O', broken math symbols).
4. Preserve LaTeX math exactly.
5. If the answer is hidden in the text (e.g., 'Ans is A', 'Opt (B) is right'), extract it.
6. Set 'diagram_required' to true if the text mentions a Figure, Diagram, or Table.

---
RAW TEXT BLOCK:
{{{rawText}}}
---

Return the structured JSON representation of this MCQ.`,
});

const repairMCQFlow = ai.defineFlow(
  {
    name: 'repairMCQFlow',
    inputSchema: RepairMCQInputSchema,
    outputSchema: RepairMCQOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
