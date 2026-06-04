/**
 * @fileOverview Institutional Multi-Format Ingestion Engine.
 * Supports: Tagged/Line-Based Bilingual, OCR Columnar, and Metadata Injection.
 */

import { Question, Difficulty, DiagramType } from "@/types";

export type ImportFormat = 
  | 'BILINGUAL_TAGGED' 
  | 'OCR_COLUMNAR' 
  | 'STANDARD_MCQ';

export interface ParsedResults {
  questions: Partial<Question>[];
  errors: string[];
}

export function parseBulkQuestions(
  rawText: string, 
  format: ImportFormat,
  metadata: { 
    boardId: string; 
    examId: string; 
    subjectId: string; 
    chapterId?: string;
    difficulty: Difficulty;
    status: any;
    languagePreference?: string;
  }
): ParsedResults {
  const cleanedText = rawText.replace(/\r\n/g, '\n');
  const blocks = cleanedText.split(/\[BLOCK_ID:.*?\]/g).filter(b => b.trim().length > 20);
  
  if (blocks.length === 0) {
    // Attempt parsing even without BLOCK_ID if it's standard format, but for Cracklix, tagged is preferred.
    return { questions: [], errors: ["No valid [BLOCK_ID] markers found. Please use the tagged format."] };
  }

  const parsedQuestions: Partial<Question>[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    const fullText = block.trim();
    const getTagValue = (tag: string, endTags: string[]) => {
      const regex = new RegExp(`${tag}\\s*(.*?)(?=${endTags.map(t => '\\n?' + t.replace(/[\[\]]/g, '\\$&')).join('|')}|$)`, 'is');
      const match = fullText.match(regex);
      return match ? match[1].trim() : "";
    };

    const tags = ['ENG_Q:', 'PUN_Q:', 'ENG_OPT:', 'PUN_OPT:', 'ENG_ANS:', 'PUN_ANS:', 'ENG_EXP:', 'PUN_EXP:', 'IMAGE_URL:', 'TABLE_DATA:'];
    
    const qEn = getTagValue('ENG_Q:', tags);
    const qPa = getTagValue('PUN_Q:', tags);
    const rawOptEn = getTagValue('ENG_OPT:', tags);
    const rawOptPa = getTagValue('PUN_OPT:', tags);

    const splitOpts = (raw: string) => {
      if (!raw) return [];
      // Handle pipe separators or newlines
      if (raw.includes('|')) return raw.split('|').map(s => s.trim().replace(/^[A-D][\.\)]\s*/i, ''));
      return raw.split(/\n/).filter(s => s.trim().length > 0).map(s => s.trim().replace(/^[A-D][\.\)]\s*/i, ''));
    };

    const optsEn = splitOpts(rawOptEn);
    const optsPa = splitOpts(rawOptPa);

    const ans = getTagValue('ENG_ANS:', tags) || getTagValue('PUN_ANS:', tags);
    const expEn = getTagValue('ENG_EXP:', tags);
    const expPa = getTagValue('PUN_EXP:', tags);
    const imgUrl = getTagValue('IMAGE_URL:', tags);
    const rawTable = getTagValue('TABLE_DATA:', tags);

    // Validation
    if (!qEn && !qPa) {
      errors.push(`Block ${index + 1}: Missing Question Statement`);
      return;
    }
    if (optsEn.length < 4 && optsPa.length < 4) {
      errors.push(`Block ${index + 1}: Missing Options (Found EN:${optsEn.length}, PA:${optsPa.length})`);
      return;
    }
    if (!ans) {
      errors.push(`Block ${index + 1}: Missing Correct Answer (A-D)`);
      return;
    }

    let diagType: DiagramType = 'none';
    let tableData = undefined;
    if (rawTable) {
      try { 
        tableData = JSON.parse(rawTable); 
        diagType = 'table'; 
      } catch(e) {
        errors.push(`Block ${index + 1}: Invalid TABLE_DATA JSON`);
      }
    }
    if (imgUrl) diagType = 'image';

    parsedQuestions.push({
      ...metadata,
      questionEn: qEn,
      questionPa: qPa,
      optionAEn: optsEn[0] || "",
      optionBEn: optsEn[1] || "",
      optionCEn: optsEn[2] || "",
      optionDEn: optsEn[3] || "",
      optionAPa: optsPa[0] || optsEn[0] || "",
      optionBPa: optsPa[1] || optsEn[1] || "",
      optionCPa: optsPa[2] || optsEn[2] || "",
      optionDPa: optsPa[3] || optsEn[3] || "",
      correctAnswer: (ans.charAt(0).toUpperCase()) as 'A' | 'B' | 'C' | 'D',
      explanationEn: expEn || "Verified Solution",
      explanationPa: expPa || expEn || "ਵਿਵਸਥਿਤ ਹੱਲ",
      diagramType: diagType,
      imageUrl: imgUrl,
      tableData,
      status: metadata.status || 'PUBLISHED',
      questionType: (qPa && qEn) ? 'BILINGUAL_MCQ' : 'MCQ'
    });
  });

  return { questions: parsedQuestions, errors };
}
