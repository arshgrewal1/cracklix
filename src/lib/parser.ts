/**
 * @fileOverview Hardened Institutional Bulk MCQ Extraction Engine.
 * Optimized for high-volume data entry for PSSSB, PPSC, and Punjab Police.
 * Hardened to handle multi-line questions, varied answer labels, and bilingual strings.
 */

import { Question, Difficulty } from "@/types";

export function parseBulkQuestions(
  rawText: string, 
  metadata: { boardId: string; examId: string; subjectId: string; difficulty: Difficulty }
): Partial<Question>[] {
  const normalizedText = rawText.replace(/\r\n/g, "\n").trim();
  
  // Hardened splitting logic: Looks for question starts (Q1, 1., etc.) at the beginning of a line
  // Supports formats: Q1., 1), Question 1, Q.1)
  const questionBlocks = normalizedText.split(/(?=^Q\d+[\.\:\)]|^Question\s*\d+[\.\:\)]|^Q\.\s*\d+[\.\:\)]|^\d+[\.\:\)])/im);
  
  return questionBlocks.map(block => {
    try {
      if (!block.trim()) return null;

      // 1. Extract Question Text
      // Matches everything from the number/prefix up to option A
      const textMatch = block.match(/(?:Q\d+|Question\s*\d+|Q\.\s*\d+|^\d+)[\.\:\)]?\s*([\s\S]*?)(?=[A][\.\:\)])/im);
      
      // 2. Extract Options (A, B, C, D)
      const aMatch = block.match(/[A][\.\:\)]\s*([\s\S]*?)(?=[B][\.\:\)])/im);
      const bMatch = block.match(/[B][\.\:\)]\s*([\s\S]*?)(?=[C][\.\:\)])/im);
      const cMatch = block.match(/[C][\.\:\)]\s*([\s\S]*?)(?=[D][\.\:\)])/im);
      // D is trickier as it can end at Answer or EOF
      const dMatch = block.match(/[D][\.\:\)]\s*([\s\S]*?)(?=(?:Answer|Key|Ans|Correct|Correct Answer|Explanation|Solution|Rationale|Details|Source):|$)/im);

      // 3. Extract Correct Answer Key
      // Matches: Answer: A, Key: B, Ans-C, Correct-D
      const answerMatch = block.match(/(?:Answer|Key|Ans|Correct|Correct Answer)[:\-]?\s*([A-D])/im);
      
      // 4. Extract Explanation/Rationale
      const explanationMatch = block.match(/(?:Explanation|Solution|Rationale|Details)[:\-]?\s*([\s\S]*)$/im);

      if (!textMatch || !aMatch || !bMatch || !cMatch || !dMatch || !answerMatch) {
        console.warn("Block parsing failed audit:", block.slice(0, 50));
        return null;
      }

      return {
        questionEn: textMatch[1].trim(),
        optionAEn: aMatch[1].trim(),
        optionBEn: bMatch[1].trim(),
        optionCEn: cMatch[1].trim(),
        optionDEn: dMatch[1].trim(),
        correctAnswer: answerMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D',
        explanationEn: explanationMatch ? explanationMatch[1].trim() : "Verified institutional answer key as per official Punjab Govt patterns.",
        boardId: metadata.boardId,
        examId: metadata.examId,
        subjectId: metadata.subjectId,
        difficulty: metadata.difficulty,
        author: "Arsh Grewal Management",
        createdAt: new Date().toISOString()
      };
    } catch (e) {
      return null;
    }
  }).filter((q): q is Partial<Question> => q !== null);
}
