
/**
 * @fileOverview Institutional Regex Parser v10.0.
 * Strictly non-AI. Optimized for "Line 1 English / Line 2 Punjabi" format.
 * Preserves bilingual strings for options and answers as requested.
 */

import { Question } from "@/types";

export interface ParsedResults {
  questions: Partial<Question>[];
  errors: string[];
}

export function parseBulkQuestions(rawText: string, metadata: any): ParsedResults {
  const cleanRaw = rawText.replace(/\r\n/g, '\n');
  
  // Split by Q followed by a number
  const blocks = cleanRaw.split(/\n(?=Q\d+[\.\s])/g).filter(b => b.trim().length > 10);
  
  // Fallback for first block
  if (blocks.length === 1 && !blocks[0].trim().startsWith('Q')) {
    const initialSplit = cleanRaw.split(/(?=Q\d+[\.\s])/g).filter(b => b.trim().startsWith('Q'));
    return parseBlocks(initialSplit, metadata);
  }

  return parseBlocks(blocks, metadata);
}

function parseBlocks(blocks: string[], metadata: any): ParsedResults {
  const questions: Partial<Question>[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    const lines = block.split('\n').map(l => l.trim());
    if (lines.length < 5) return;

    try {
      const q: any = { 
        ...metadata,
        id: `q-node-${Date.now()}-${index}`,
        status: metadata.status || "PUBLISHED",
        isStandalone: true,
        questionEn: "",
        questionPa: "",
        optionAEn: "",
        optionBEn: "",
        optionCEn: "",
        optionDEn: "",
        correctAnswer: "",
        explanationEn: "",
        explanationPa: ""
      };

      // 1. Question EN
      q.questionEn = lines[0].replace(/^Q\d+[\.\s]*/i, '').trim();

      // 2. Question PA (Look for first line that isn't an option)
      let currentLine = 1;
      while (lines[currentLine] && !lines[currentLine].match(/^\([A-D]\)/i)) {
        if (lines[currentLine].length > 0) {
          q.questionPa = lines[currentLine].replace(/^(ਪ੍ਰਸ਼ਨ|ਪ੍ਰਸ਼ਨ)\s*\d+[\.\s]*/, '').trim();
          break;
        }
        currentLine++;
      }

      // 3. Options (A-D) - Capture full bilingual string
      const optionA = lines.find(l => l.startsWith('(A)'));
      const optionB = lines.find(l => l.startsWith('(B)'));
      const optionC = lines.find(l => l.startsWith('(C)'));
      const optionD = lines.find(l => l.startsWith('(D)'));

      if (optionA) q.optionAEn = optionA.replace(/^\(A\)\s*/i, '').trim();
      if (optionB) q.optionBEn = optionB.replace(/^\(B\)\s*/i, '').trim();
      if (optionC) q.optionCEn = optionC.replace(/^\(C\)\s*/i, '').trim();
      if (optionD) q.optionDEn = optionD.replace(/^\(D\)\s*/i, '').trim();

      // 4. Correct Answer Line
      const ansLine = lines.find(l => l.toLowerCase().includes('correct answer') || l.toLowerCase().includes('ਸਹੀ ਉੱਤਰ'));
      if (ansLine) {
        const match = ansLine.match(/(?:correct answer|ans)[:\s]*\(?([A-D])\)?/i);
        if (match) q.correctAnswer = match[1].toUpperCase();
        q.correctAnswerRaw = ansLine.trim(); // Store for exact rendering
      }

      // 5. Explanations (Vertical Flow Preservation)
      const expEnStart = lines.findIndex(l => l.includes('• English Explanation:'));
      const expPaStart = lines.findIndex(l => l.includes('• ਪੰਜਾਬੀ ਵਿਆਖਿਆ:'));

      if (expEnStart !== -1) {
        const end = expPaStart !== -1 ? expPaStart : lines.length;
        // Slice and preserve line breaks
        q.explanationEn = lines.slice(expEnStart + 1, end).join('\n').trim();
      }

      if (expPaStart !== -1) {
        q.explanationPa = lines.slice(expPaStart + 1).join('\n').trim();
      }

      if (q.questionEn && q.correctAnswer) {
        questions.push(q);
      }
    } catch (err: any) {
      errors.push(`Block ${index + 1}: ${err.message}`);
    }
  });

  return { questions, errors };
}
