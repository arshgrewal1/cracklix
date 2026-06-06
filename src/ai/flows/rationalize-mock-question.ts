'use server';
/**
 * @fileOverview An AI-powered tutor that provides step-by-step explanations for mock exam questions.
 *
 * - rationalizeMockQuestion - A function that handles the rationalization process for a mock question.
 * - RationalizeMockQuestionInput - The input type for the rationalizeMockQuestion function.
 * - RationalizeMockQuestionOutput - The return type for the rationalizeMockQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RationalizeMockQuestionInputSchema = z.object({
  questionText: z.string().describe('The full text of the mock exam question.'),
  options: z.array(z.string()).describe('An array of possible answer options for the question.'),
  correctAnswer: z.string().describe('The correct answer for the question.'),
  userAnswer: z.string().optional().describe('The answer selected by the user, if any.'),
});
export type RationalizeMockQuestionInput = z.infer<typeof RationalizeMockQuestionInputSchema>;

const RationalizeMockQuestionOutputSchema = z.object({
  rationalization: z.string().describe('A step-by-step explanation of how to arrive at the correct answer.'),
  keyLearningPoints: z.array(z.string()).describe('A list of key takeaways or concepts learned from this question.'),
});
export type RationalizeMockQuestionOutput = z.infer<typeof RationalizeMockQuestionOutputSchema>;

export async function rationalizeMockQuestion(input: RationalizeMockQuestionInput): Promise<RationalizeMockQuestionOutput> {
  return rationalizeMockQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rationalizeMockQuestionPrompt',
  input: {schema: RationalizeMockQuestionInputSchema},
  output: {schema: RationalizeMockQuestionOutputSchema},
  prompt: `You are an expert tutor providing rationalizations for competitive exam questions.
Your goal is to help students understand the solution step-by-step and improve their problem-solving skills.

---
Question: {{{questionText}}}
Options:
{{#each options}}
- {{{this}}}
{{#each}}
Correct Answer: {{{correctAnswer}}}
{{#if userAnswer}}
User's Answer: {{{userAnswer}}}
{{/if}}
---

Please provide a detailed, step-by-step rationalization for the question above, explaining how to arrive at the correct answer.
If the user provided an answer, also explain why their answer might be incorrect.
Finally, summarize the key learning points from this question.

Structure your response as a JSON object matching the following schema:
\`\`\`json
{{jsonSchema output}}
\`\`\``,
});

const rationalizeMockQuestionFlow = ai.defineFlow(
  {
    name: 'rationalizeMockQuestionFlow',
    inputSchema: RationalizeMockQuestionInputSchema,
    outputSchema: RationalizeMockQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
