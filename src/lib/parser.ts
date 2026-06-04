/**
 * @fileOverview Institutional Multi-Format Ingestion Engine.
 * Supports: Tagged/Line-Based Bilingual, Columnar OCR, and DI/Image nodes.
 */

import { Question, Difficulty, QuestionType, DiagramType } from "@/types";

export type ImportFormat = 
  | 'STANDARD_MCQ' 
  | 'BILINGUAL_MCQ' 
  | 'OCR_COLUMNAR' 
  | 'STRUCTURED_JSON';

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
    topicId?: string;
    difficulty: Difficulty;
    status: any;
  }
): ParsedResults {
  if (format === 'STRUCTURED_JSON') {
    return parseStructuredJson(rawText, metadata);
  }

  const cleanedText = rawText.replace(/\r\n/g, '\n');
  
  // Split logic: Either by [BLOCK_ID] or standard Question markers
  let blocks: string[] = [];
  if (cleanedText.includes('ENG_Q:')) {
    // Tagged format detection
    blocks = cleanedText.split(/\[BLOCK_ID:.*?\]/g).filter(b => b.trim().length > 20);
  } else {
    // Standard marker split
    blocks = cleanedText.split(/(?=(?:Q|Question)\s*\d+[\.\:\)]|^\d+[\.\)])/gm).filter(b => b.trim().length > 10);
  }
  
  const parsedQuestions: Partial<Question>[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    const fullText = block.trim();

    let qEn = "", qPa = "";
    let optAEn = "", optAPa = "";
    let optBEn = "", optBPa = "";
    let optCEn = "", optCPa = "";
    let optDEn = "", optDPa = "";
    let ans = "";
    let expEn = "", expPa = "";
    let diagType: DiagramType = 'none';
    let tableData: any = undefined;
    let imgUrl: string = "";

    // 1. TAGGED EXTRACTION
    if (fullText.includes('ENG_Q:')) {
      const getTagValue = (tag: string, endTags: string[]) => {
        const regex = new RegExp(`${tag}\\s*(.*?)(?=${endTags.map(t => '\\n?' + t.replace(/[\[\]]/g, '\\$&')).join('|')}|$)`, 'is');
        const match = fullText.match(regex);
        return match ? match[1].trim() : "";
      };

      const tags = ['ENG_Q:', 'PUN_Q:', 'ENG_OPT:', 'PUN_OPT:', 'ENG_ANS:', 'PUN_ANS:', 'ENG_EXP:', 'PUN_EXP:', 'IMAGE_URL:', 'TABLE_DATA:'];
      
      qEn = getTagValue('ENG_Q:', tags);
      qPa = getTagValue('PUN_Q:', tags);
      
      const rawOptEn = getTagValue('ENG_OPT:', tags);
      const rawOptPa = getTagValue('PUN_OPT:', tags);

      const splitOpts = (raw: string) => {
        if (raw.includes('|')) return raw.split('|').map(s => s.trim().replace(/^[A-D][\.\)]\s*/i, ''));
        return raw.split(/\n/).map(s => s.trim().replace(/^[A-D][\.\)]\s*/i, ''));
      };

      const optsEn = splitOpts(rawOptEn);
      const optsPa = splitOpts(rawOptPa);

      optAEn = optsEn[0] || ""; optBEn = optsEn[1] || ""; optCEn = optsEn[2] || ""; optDEn = optsEn[3] || "";
      optAPa = optsPa[0] || ""; optBPa = optsPa[1] || ""; optCPa = optsPa[2] || ""; optDPa = optsPa[3] || "";

      ans = getTagValue('ENG_ANS:', tags) || getTagValue('PUN_ANS:', tags);
      expEn = getTagValue('ENG_EXP:', tags);
      expPa = getTagValue('PUN_EXP:', tags);
      imgUrl = getTagValue('IMAGE_URL:', tags);
      
      const rawTable = getTagValue('TABLE_DATA:', tags);
      if (rawTable) {
        try { tableData = JSON.parse(rawTable); diagType = 'table'; } catch(e) {}
      }
      if (imgUrl) diagType = 'image';
    } 
    // 2. STANDARD/OCR EXTRACTION
    else {
      const statementMatch = fullText.match(/(?:(?:Q|Question)\s*\d+[\.\:\)]|^\d+[\.\)])\s*(.*?)(?=A[\.\)])/is);
      qEn = statementMatch ? statementMatch[1].trim() : fullText.split('\n')[0];
      qPa = qEn;

      const extractOpt = (letter: string, nextLetter: string | null) => {
        const regex = new RegExp(`${letter}[\\.\\)]\\s*(.*?)(?=${nextLetter ? nextLetter + '[\\.\\)]' : 'Correct Answer|ਸਹੀ ਉੱਤਰ|Explanation|ਵਿਆਖਿਆ'})`, 'is');
        const match = fullText.match(regex);
        return match ? match[1].trim() : "";
      };

      optAEn = extractOpt('A', 'B'); optBEn = extractOpt('B', 'C'); optCEn = extractOpt('C', 'D'); optDEn = extractOpt('D', null);
      optAPa = optAEn; optBPa = optBEn; optCPa = optCEn; optDPa = optDEn;

      const ansMatch = fullText.match(/(?:Correct Answer|ਸਹੀ ਉੱਤਰ|ANS|ENG_ANS)[\.\:\s]*([A-D])/i);
      ans = ansMatch ? ansMatch[1].toUpperCase() : "";
    }

    // Validation
    const qErrors: string[] = [];
    if (!qEn && !qPa) qErrors.push(`Missing Statement`);
    if (!optAEn && !optAPa) qErrors.push(`Missing Options`);
    if (!ans) qErrors.push(`Missing Correct Answer (A-D)`);

    if (qErrors.length > 0) {
      errors.push(`Block ${index + 1}: ${qErrors.join(', ')}`);
    } else {
      parsedQuestions.push({
        ...metadata,
        id: `node-${Date.now()}-${index}`,
        questionEn: qEn, questionPa: qPa,
        optionAEn: optAEn, optionAPa: optAPa,
        optionBEn: optBEn, optionBPa: optBPa,
        optionCEn: optCEn, optionCPa: optCPa,
        optionDEn: optDEn, optionDPa: optDPa,
        correctAnswer: (ans.charAt(0).toUpperCase()) as any,
        explanationEn: expEn || "Verified Solution",
        explanationPa: expPa || expEn || "Verified Solution",
        status: metadata.status || 'PUBLISHED',
        questionType: (qPa && qEn) ? 'BILINGUAL_MCQ' : 'MCQ',
        diagramType: diagType,
        tableData,
        imageUrl: imgUrl,
        isStandalone: true
      });
    }
  });

  return { questions: parsedQuestions, errors };
}

function parseStructuredJson(raw: string, metadata: any): ParsedResults {
  try {
    const data = JSON.parse(raw);
    const questions: Partial<Question>[] = [];
    if (data.document?.pages) {
      data.document.pages.forEach((page: any) => {
        page.blocks.forEach((block: any) => {
          if (block.type === 'TEXT') {
            questions.push({
              ...metadata,
              id: `ocr-${block.block_id}-${Date.now()}`,
              questionEn: block.text,
              questionPa: block.text,
              optionAEn: "N/A", optionAPa: "N/A",
              correctAnswer: 'A',
              status: metadata.status || 'PUBLISHED',
              isStandalone: true
            });
          }
        });
      });
    }
    return { questions, errors: [] };
  } catch (e) {
    return { questions: [], errors: ["Invalid Structured JSON"] };
  }
}
