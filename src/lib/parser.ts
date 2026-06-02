
/**
 * @fileOverview Institutional-grade MCQ parser for Cracklix.
 * Parses raw text documents into structured Firestore-ready Question objects.
 */

import { Question, Difficulty } from "@/types";

export function parseBulkQuestions(rawText: string, metadata: { subjectId: string; difficulty: Difficulty }): Partial<Question>[] {
  // Normalize line endings and remove zero-width spaces
  const normalizedText = rawText.replace(/\r\n/g, "\n").replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  
  // Split by "Q" followed by a number and a dot, or "Question"
  const questionBlocks = normalizedText.split(/(?=Q\d+\.|Question\s*\d+\.|Q\.\s*\d+\.)/);
  
  return questionBlocks.map(block => {
    try {
      if (!block.trim()) return null;

      // Extract Question Text: From "Q1." to the first option "A."
      const textMatch = block.match(/(?:Q\d+\.|Question\s*\d+|Q\.\s*\d+)\.?\s*([\s\S]*?)(?=[A-D]\.)/i);
      
      // Extract Options: A, B, C, D
      const aMatch = block.match(/A\.\s*([\s\S]*?)(?=B\.)/i);
      const bMatch = block.match(/B\.\s*([\s\S]*?)(?=C\.)/i);
      const cMatch = block.match(/C\.\s*([\s\S]*?)(?=D\.)/i);
      const dMatch = block.match(/D\.\s*([\s\S]*?)(?=Answer:|$|Explanation:)/i);

      // Extract Answer: A/B/C/D
      const answerMatch = block.match(/Answer:\s*([A-D])/i);
      
      // Extract Explanation: Everything after "Explanation:" or "Answer:"
      const explanationMatch = block.match(/(?:Explanation|Solution):\s*([\s\S]*)$/i);

      if (!textMatch || !aMatch || !bMatch || !cMatch || !dMatch || !answerMatch) {
        console.warn("Skipping malformed block:", block.slice(0, 100));
        return null;
      }

      const optionsEn = [
        aMatch[1].trim(),
        bMatch[1].trim(),
        cMatch[1].trim(),
        dMatch[1].trim()
      ];
      
      const answerChar = answerMatch[1].toUpperCase();
      const correctAnswer = ['A', 'B', 'C', 'D'].indexOf(answerChar);

      return {
        textEn: textMatch[1].trim(),
        optionsEn,
        correctAnswer,
        explanationEn: explanationMatch ? explanationMatch[1].trim() : "Detailed logic based on latest recruitment pattern.",
        subjectId: metadata.subjectId || "general",
        difficulty: metadata.difficulty,
        topic: "Institutional Bulk Import",
        createdAt: new Date().toISOString(),
        author: "Arsh Grewal"
      };
    } catch (e) {
      console.error("Critical error parsing block", e);
      return null;
    }
  }).filter((q): q is Partial<Question> => q !== null);
}
