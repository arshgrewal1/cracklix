/**
 * @fileOverview Strict Template-Driven Question Extraction Engine.
 * Follows exact position-based rules for English and Punjabi scripts.
 * NO AI Guessing. Handles bunched options (e.g. A) ... A) ...).
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
  
  // Split by Question marker (Q101, Q1, etc)
  const blocks = cleanedText.split(/(?=Q\d+[\.\:])/g).filter(b => b.trim().length > 0);
  
  const parsedQuestions: Partial<Question>[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    // Check for Section headers within the block to auto-update subjectId if needed
    // This allows pasting text containing headers
    const sectionMatch = block.match(/Section\s*\d+\s*:\s*([^(\n]+)/i);
    const currentSubjectId = metadata.subjectId; // In a full implementation, we could map section name to ID here.

    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 3) return;

    const qNumMatch = lines[0].match(/Q(\d+)/i);
    const qNum = qNumMatch ? qNumMatch[1] : (index + 1).toString();

    let questionEn = "";
    let questionPa = "";
    let optionAEn = "", optionAPa = "";
    let optionBEn = "", optionBPa = "";
    let optionCEn = "", optionCPa = "";
    let optionDEn = "", optionDPa = "";
    let ans = "";
    let expEn = "";
    let expPa = "";

    if (format === 'BILINGUAL_MCQ') {
      // Rule: Line 1 = EN, Line 2 = PA
      questionEn = lines[0].replace(/^Q\d+[\.\:]\s*/i, '').trim();
      questionPa = lines[1] || "";

      // Logic for options (Handles both multi-line and bunched single-line formats)
      const findOptionPair = (letter: string) => {
        const marker = `${letter})`;
        const matches: string[] = [];
        
        lines.forEach(l => {
          // If option markers are bunched: A) textA) text
          if (l.includes(marker)) {
            const parts = l.split(new RegExp(`(?=${letter}\\))`, 'i')).filter(p => p.toLowerCase().startsWith(letter.toLowerCase()));
            parts.forEach(p => matches.push(p.replace(new RegExp(`^${letter}\\)\\s*`, 'i'), '').trim()));
          }
        });

        return { 
          en: matches[0] || "", 
          pa: matches[1] || matches[0] || "" // Fallback if PA missing
        };
      };

      const pairA = findOptionPair('A');
      const pairB = findOptionPair('B');
      const pairC = findOptionPair('C');
      const pairD = findOptionPair('D');

      optionAEn = pairA.en; optionAPa = pairA.pa;
      optionBEn = pairB.en; optionBPa = pairB.pa;
      optionCEn = pairC.en; optionCPa = pairC.pa;
      optionDEn = pairD.en; optionDPa = pairD.pa;
    } else {
      // STANDARD_MCQ
      questionEn = lines[0].replace(/^Q\d+[\.\:]\s*/i, '').trim();
      
      const findSingleOption = (letter: string) => {
        const marker = `${letter})`;
        let val = "";
        lines.forEach(l => {
          if (l.toLowerCase().startsWith(letter.toLowerCase() + ')')) {
            val = l.replace(new RegExp(`^${letter}\\)\\s*`, 'i'), '').trim();
          }
        });
        return val;
      };

      optionAEn = findSingleOption('A');
      optionBEn = findSingleOption('B');
      optionCEn = findSingleOption('C');
      optionDEn = findSingleOption('D');
    }

    // ANSWER KEY & EXPLANATIONS
    const getAfterMarker = (marker: string) => {
      const idx = lines.findIndex(l => l.toLowerCase().includes(marker.toLowerCase()));
      if (idx === -1) return "";
      // If answer is on the same line as marker
      const line = lines[idx];
      if (line.toLowerCase().replace(/\s/g, '').includes(marker.toLowerCase().replace(/\s/g, '') + ':')) {
         const parts = line.split(/:/);
         if (parts[1]) return parts[1].trim();
      }
      // If answer is on next line
      return lines[idx + 1] ? lines[idx + 1].trim() : "";
    };

    const ansFull = getAfterMarker('Correct Answer');
    const ansLetterMatch = ansFull?.match(/^[A-D]/i);
    ans = ansLetterMatch ? ansLetterMatch[0].toUpperCase() : "";

    const getExplanationBlock = (marker: string) => {
      const idx = lines.findIndex(l => l.toLowerCase().includes(marker.toLowerCase()));
      if (idx === -1) return "";
      const content = [];
      const startLine = lines[idx];
      if (startLine.includes(':') && startLine.split(':')[1]?.trim()) {
         content.push(startLine.split(':')[1].trim());
      }
      for (let i = idx + 1; i < lines.length; i++) {
        if (lines[i].match(/Correct Answer|ਸਹੀ ਉੱਤਰ|Explanation|ਵਿਆਖਿਆ|^Q\d+/i)) break;
        content.push(lines[i]);
      }
      return content.join('\n').trim();
    };

    expEn = getExplanationBlock('Explanation (English)');
    expPa = getExplanationBlock('ਵਿਆਖਿਆ (ਪੰਜਾਬੀ)');

    // VALIDATION
    const qErrors: string[] = [];
    if (!questionEn) qErrors.push(`missing English Statement`);
    if (format === 'BILINGUAL_MCQ' && !questionPa) qErrors.push(`missing Punjabi Statement`);
    if (!optionAEn) qErrors.push(`missing Option A`);
    if (!ans) qErrors.push(`missing Correct Answer`);
    if (!expEn) qErrors.push(`missing English Explanation`);

    if (qErrors.length > 0) {
      qErrors.forEach(err => errors.push(`Question ${qNum}: ${err}`));
    } else {
      parsedQuestions.push({
        ...metadata,
        id: `temp-${qNum}-${Date.now()}`,
        questionEn, 
        questionPa,
        optionAEn, 
        optionAPa,
        optionBEn, 
        optionBPa,
        optionCEn, 
        optionCPa,
        optionDEn, 
        optionDPa,
        correctAnswer: ans as any,
        explanationEn: expEn,
        explanationPa: expPa,
        status: 'PUBLISHED'
      });
    }
  });

  return { questions: errors.length > 0 ? [] : parsedQuestions, errors };
}
