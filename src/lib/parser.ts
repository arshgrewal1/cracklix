
/**
 * @fileOverview Hardened Trilingual Bulk MCQ Extraction Engine.
 * Optimized for targeting specific language nodes (EN/PA/HI).
 */

import { Question, Difficulty } from "@/types";

export function parseBulkQuestions(
  rawText: string, 
  metadata: { boardId: string; examId: string; subjectId: string; difficulty: Difficulty; targetLang: "En" | "Pa" | "Hi" }
): Partial<Question>[] {
  const normalizedText = rawText.replace(/\r\n/g, "\n").trim();
  const lang = metadata.targetLang;
  
  // Hardened splitting logic: Looks for question starts (Q1, 1., etc.) at the beginning of a line
  const questionBlocks = normalizedText.split(/(?=^Q\d+[\.\:\)]|^Question\s*\d+[\.\:\)]|^Q\.\s*\d+[\.\:\)]|^\d+[\.\:\)])/im);
  
  return questionBlocks.map(block => {
    try {
      if (!block.trim()) return null;

      // 1. Extract Question Text
      const textMatch = block.match(/(?:Q\d+|Question\s*\d+|Q\.\s*\d+|^\d+)[\.\:\)]?\s*([\s\S]*?)(?=[A][\.\:\)])/im);
      
      // 2. Extract Options (A, B, C, D)
      const aMatch = block.match(/[A][\.\:\)]\s*([\s\S]*?)(?=[B][\.\:\)])/im);
      const bMatch = block.match(/[B][\.\:\)]\s*([\s\S]*?)(?=[C][\.\:\)])/im);
      const cMatch = block.match(/[C][\.\:\)]\s*([\s\S]*?)(?=[D][\.\:\)])/im);
      const dMatch = block.match(/[D][\.\:\)]\s*([\s\S]*?)(?=(?:Answer|Key|Ans|Correct|Correct Answer|Explanation|Solution|Rationale|Details|Source):|$)/im);

      // 3. Extract Correct Answer Key
      const answerMatch = block.match(/(?:Answer|Key|Ans|Correct|Correct Answer)[:\-]?\s*([A-D])/im);
      
      // 4. Extract Explanation/Rationale
      const explanationMatch = block.match(/(?:Explanation|Solution|Rationale|Details)[:\-]?\s*([\s\S]*)$/im);

      if (!textMatch || !aMatch || !bMatch || !cMatch || !dMatch || !answerMatch) {
        return null;
      }

      // Build object with target language keys
      const q: any = {
        boardId: metadata.boardId,
        examId: metadata.examId,
        subjectId: metadata.subjectId,
        difficulty: metadata.difficulty,
        correctAnswer: answerMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D',
        createdAt: new Date().toISOString()
      };

      q[`question${lang}`] = textMatch[1].trim();
      q[`optionA${lang}`] = aMatch[1].trim();
      q[`optionB${lang}`] = bMatch[1].trim();
      q[`optionC${lang}`] = cMatch[1].trim();
      q[`optionD${lang}`] = dMatch[1].trim();
      q[`explanation${lang}`] = explanationMatch ? explanationMatch[1].trim() : "Verified institutional answer key.";

      return q;
    } catch (e) {
      return null;
    }
  }).filter((q): q is Partial<Question> => q !== null);
}
