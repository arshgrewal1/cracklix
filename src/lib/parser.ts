/**
 * @fileOverview Strict Template-Driven Question Extraction Engine.
 * Follows exact position-based rules for English and Punjabi scripts.
 * NO AI Guessing. NO Script Combining.
 */

import { Question, Difficulty } from "@/types";

export type ImportFormat = 'STANDARD_MCQ' | 'BILINGUAL_MCQ' | 'DI_SET' | 'REASONING_DIAGRAM' | 'PASSAGE_BASED';

export interface ParsedResults {
  questions: Partial<Question>[];
  errors: string[];
}

export function parseBulkQuestions(
  rawText: string, 
  format: ImportFormat,
  metadata: { boardId: string; examId: string; subjectId: string; difficulty: Difficulty }
): ParsedResults {
  const cleanedText = rawText.replace(/\r\n/g, '\n');
  const blocks = cleanedText.split(/(?=Q\d+[\.\:])/g).filter(b => b.trim().length > 0);
  
  const parsedQuestions: Partial<Question>[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 4) return;

    const qNumMatch = lines[0].match(/Q(\d+)/i);
    const qNum = qNumMatch ? qNumMatch[1] : (index + 1).toString();

    let questionEn = "";
    let questionPa = "";
    let optAEn = "", optAPa = "";
    let optBEn = "", optBPa = "";
    let optCEn = "", optCPa = "";
    let optDEn = "", optDPa = "";
    let ans = "";
    let expEn = "";
    let expPa = "";

    if (format === 'BILINGUAL_MCQ') {
      // Rule: Line 1 = EN, Line 2 = PA
      questionEn = lines[0].replace(/^Q\d+[\.\:]\s*/i, '').trim();
      questionPa = lines[1] || "";

      // Rule: First marker = EN, Second = PA
      const findOptionPair = (letter: string) => {
        const regex = new RegExp(`^${letter}\\)\\s*(.*)`, 'i');
        const matches = lines.filter(l => l.match(regex));
        return { en: matches[0]?.replace(regex, '$1').trim(), pa: matches[1]?.replace(regex, '$1').trim() };
      };

      const pairA = findOptionPair('A');
      const pairB = findOptionPair('B');
      const pairC = findOptionPair('C');
      const pairD = findOptionPair('D');

      optAEn = pairA.en || ""; optAPa = pairA.pa || "";
      optBEn = pairB.en || ""; optBPa = pairB.pa || "";
      optCEn = pairC.en || ""; optCPa = pairC.pa || "";
      optDEn = pairD.en || ""; optDPa = pairD.pa || "";
    } else if (format === 'STANDARD_MCQ') {
      questionEn = lines[0].replace(/^Q\d+[\.\:]\s*/i, '').trim();
      
      const findSingleOption = (letter: string) => {
        const regex = new RegExp(`^${letter}\\)\\s*(.*)`, 'i');
        return lines.find(l => l.match(regex))?.replace(regex, '$1').trim() || "";
      };

      optAEn = findSingleOption('A');
      optBEn = findSingleOption('B');
      optCEn = findSingleOption('C');
      optDEn = findSingleOption('D');
    }

    // ANSWER KEY (Universal)
    const getAfterMarker = (marker: string) => {
      const idx = lines.findIndex(l => l.toLowerCase().includes(marker.toLowerCase()));
      if (idx === -1 || idx === lines.length - 1) return "";
      return lines[idx + 1].trim();
    };

    const ansFull = getAfterMarker('Correct Answer:');
    const ansLetterMatch = ansFull?.match(/^[A-D]/i);
    ans = ansLetterMatch ? ansLetterMatch[0].toUpperCase() : "";

    // EXPLANATIONS (Capture multi-line text after marker)
    const getExplanationBlock = (marker: string) => {
      const idx = lines.findIndex(l => l.toLowerCase().includes(marker.toLowerCase()));
      if (idx === -1) return "";
      const content = [];
      for (let i = idx + 1; i < lines.length; i++) {
        if (lines[i].match(/Correct Answer|ਸਹੀ ਉੱਤਰ|Explanation|ਵਿਆਖਿਆ|^Q\d+/i)) break;
        content.push(lines[i]);
      }
      return content.join('\n').trim();
    };

    expEn = getExplanationBlock('Explanation (English):');
    expPa = getExplanationBlock('ਵਿਆਖਿਆ (ਪੰਜਾਬੀ):');

    // VALIDATION
    const qErrors: string[] = [];
    if (!questionEn) qErrors.push(`missing English Statement`);
    if (format === 'BILINGUAL_MCQ' && !questionPa) qErrors.push(`missing Punjabi Statement`);
    if (!optAEn) qErrors.push(`missing English Option A`);
    if (format === 'BILINGUAL_MCQ' && !optAPa) qErrors.push(`missing Punjabi Option A`);
    if (!ans) qErrors.push(`missing Correct Answer`);
    if (!expEn) qErrors.push(`missing English Explanation`);

    if (qErrors.length > 0) {
      qErrors.forEach(err => errors.push(`Question ${qNum} ${err}`));
    } else {
      parsedQuestions.push({
        ...metadata,
        id: `temp-${qNum}-${Date.now()}`,
        questionEn, questionPa,
        optionAEn, optionAPa,
        optionBEn, optionBPa,
        optionCEn, optionCPa,
        optionDEn, optionDPa,
        correctAnswer: ans as any,
        explanationEn: expEn,
        explanationPa: expPa,
        status: 'PUBLISHED'
      });
    }
  });

  return { questions: errors.length > 0 ? [] : parsedQuestions, errors };
}
