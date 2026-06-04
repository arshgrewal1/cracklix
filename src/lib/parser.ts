/**
 * @fileOverview Institutional Position-Based Question Extraction Hub.
 * Strictly adheres to template formatting for EN/PA bilingual support.
 * Optimized for large batches (10–500 questions).
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
  
  // Split by Question marker (Q101, Q1, etc) with flexible delimiter support
  const blocks = cleanedText.split(/(?=Q\d+[\.\:])/g).filter(b => b.trim().length > 0);
  
  const parsedQuestions: Partial<Question>[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
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
      // Rule: Line 1 = EN Statement, Line 2 = PA Statement
      questionEn = lines[0].replace(/^Q\d+[\.\:]\s*/i, '').trim();
      questionPa = lines[1] || "";

      // Extraction logic for Paired Options (Handles multi-occurrence markers)
      const extractPair = (letter: string) => {
        const marker = `${letter})`;
        const matches = lines.filter(l => l.startsWith(marker)).map(l => l.replace(new RegExp(`^${letter}\\)\\s*`, 'i'), '').trim());
        return { en: matches[0] || "", pa: matches[1] || matches[0] || "" };
      };

      const pairA = extractPair('A');
      const pairB = extractPair('B');
      const pairC = extractPair('C');
      const pairD = extractPair('D');

      optionAEn = pairA.en; optionAPa = pairA.pa;
      optionBEn = pairB.en; optionBPa = pairB.pa;
      optionCEn = pairC.en; optionCPa = pairC.pa;
      optionDEn = pairD.en; optionDPa = pairD.pa;
    } else {
      // STANDARD_MCQ Extraction
      questionEn = lines[0].replace(/^Q\d+[\.\:]\s*/i, '').trim();
      
      const findSingle = (letter: string) => {
        const line = lines.find(l => l.toLowerCase().startsWith(letter.toLowerCase() + ')'));
        return line ? line.replace(new RegExp(`^${letter}\\)\\s*`, 'i'), '').trim() : "";
      };

      optionAEn = findSingle('A');
      optionBEn = findSingle('B');
      optionCEn = findSingle('C');
      optionDEn = findSingle('D');
    }

    // Answer & Rationale Detection
    const findMarkerContent = (marker: string) => {
      const idx = lines.findIndex(l => l.toLowerCase().includes(marker.toLowerCase()));
      if (idx === -1) return "";
      const line = lines[idx];
      if (line.includes(':')) return line.split(':')[1].trim();
      return lines[idx + 1] || "";
    };

    const ansFull = findMarkerContent('Correct Answer') || findMarkerContent('ਸਹੀ ਉੱਤਰ');
    const ansMatch = ansFull?.match(/^[A-D]/i);
    ans = ansMatch ? ansMatch[0].toUpperCase() : "";

    const getBlock = (marker: string) => {
      const idx = lines.findIndex(l => l.toLowerCase().includes(marker.toLowerCase()));
      if (idx === -1) return "";
      const content = [];
      const headerLine = lines[idx];
      if (headerLine.includes(':')) content.push(headerLine.split(':')[1].trim());
      for (let i = idx + 1; i < lines.length; i++) {
        if (lines[i].match(/Correct Answer|ਸਹੀ ਉੱਤਰ|Explanation|ਵਿਆਖਿਆ|^Q\d+/i)) break;
        content.push(lines[i]);
      }
      return content.join('\n').trim();
    };

    expEn = getBlock('Explanation (English)');
    expPa = getBlock('ਵਿਆਖਿਆ (ਪੰਜਾਬੀ)');

    // Strict Institutional Validation
    const qErrors: string[] = [];
    if (!questionEn) qErrors.push(`Missing EN Statement`);
    if (format === 'BILINGUAL_MCQ' && !questionPa) qErrors.push(`Missing PA Statement`);
    if (!optionAEn) qErrors.push(`Missing Option A`);
    if (!ans) qErrors.push(`Missing Correct Answer (A-D)`);
    if (!expEn) qErrors.push(`Missing English Rationale`);

    if (qErrors.length > 0) {
      qErrors.forEach(err => errors.push(`Question ${qNum}: ${err}`));
    } else {
      parsedQuestions.push({
        ...metadata,
        id: `node-${qNum}-${Date.now()}`,
        questionEn, questionPa,
        optionAEn, optionAPa,
        optionBEn, optionBPa,
        optionCEn, optionCPa,
        optionDEn, optionDPa,
        correctAnswer: ans as any,
        explanationEn: expEn,
        explanationPa: expPa,
        status: metadata.status || 'PUBLISHED',
        questionType: format === 'BILINGUAL_MCQ' ? 'BILINGUAL_MCQ' : 'MCQ'
      });
    }
  });

  return { questions: errors.length > 0 ? [] : parsedQuestions, errors };
}
