/**
 * @fileOverview Institutional High-Fidelity Ingestion Engine v17.0.
 * Rules Enforcement:
 * 1. NO DUAL NUMBERING: Strips "Q1." and "ਪ੍ਰਸ਼ਨ 1." strictly.
 * 2. SEGREGATED STORAGE: Maps to questionEn and questionPa even if joined in source.
 * 3. OPTION FORMATTING: Combine EN / PA on one line.
 */

import { Question } from "@/types";

export interface ParsedResults {
  questions: Partial<Question>[];
  errors: string[];
  confidence: number;
}

const sanitizeText = (text: string = "") => {
  return text
    .replace(/^Q\d+[\.\):\s-]*/i, '')      
    .replace(/^ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*/, '') 
    .replace(/^ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*/, '')
    .replace(/^\d+[\.\):\s-]*/, '')        
    .replace(/^\(?[A-D]\)?[\.\):\s-]*/i, '') 
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export function parseBulkQuestions(
  rawText: string,
  metadata: any
): ParsedResults {
  // Split by Question markers (Q1, Q2, etc.)
  const blocks = rawText.split(/(?=Q\d+[\.\):\s-])/g).filter(p => p.trim().length > 10);
  
  const parsed = blocks.map((block, index) => {
    try {
      const q = parseStandardBlock(block, metadata);
      if (!q.questionEn) return null;
      return {
        ...q,
        displayId: `Q${index + 1}`,
        status: metadata.status || "PUBLISHED",
      };
    } catch (err: any) {
      console.error("Parse error in block:", index, err);
      return null;
    }
  }).filter(Boolean) as Partial<Question>[];

  const confidence = blocks.length > 0 ? Math.round((parsed.length / blocks.length) * 100) : 0;
  return { questions: parsed, errors: [], confidence };
}

function parseStandardBlock(block: string, metadata: any): Partial<Question> {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let questionEn = "";
  let questionPa = "";
  const options: Record<string, { en: string; pa: string }> = {};
  let correctAnswer: 'A' | 'B' | 'C' | 'D' = 'A';
  let explanationEn = "";
  let explanationPa = "";

  lines.forEach((line, idx) => {
    // English Question Detection (Starts with Q1.)
    if (line.match(/^Q\d+[\.\):\s-]/i)) {
      const fullText = line.replace(/^Q\d+[\.\):\s-]*/i, '').trim();
      
      // Check if Punjabi question is joined on the same line via marker
      if (fullText.includes('ਪ੍ਰਸ਼ਨ') || fullText.includes('ਪ੍ਰਸ਼ਨ')) {
        const parts = fullText.split(/ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*|ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*/);
        questionEn = sanitizeText(parts[0]);
        questionPa = sanitizeText(parts[1]);
      } else {
        questionEn = sanitizeText(fullText);
        // Look for Punjabi text on the next line if it doesn't have an option marker
        const nextLine = lines[idx+1];
        if (nextLine && !nextLine.match(/^\([A-D]\)/i) && !nextLine.toLowerCase().includes('correct answer')) {
          questionPa = sanitizeText(nextLine);
        }
      }
    } 
    // Punjabi Question Detection (In case it's a separate block or start marker)
    else if (line.match(/^ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*|^ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*/) && !questionPa) {
      questionPa = sanitizeText(line);
    }
    // Option Detection (A) Eng / Pun
    else if (line.match(/^\([A-D]\)/i)) {
      const labelMatch = line.match(/^\(([A-D])\)/i);
      if (labelMatch) {
        const label = labelMatch[1].toUpperCase();
        const content = line.replace(/^\([A-D]\)/i, '').trim();
        if (content.includes('/')) {
          const parts = content.split('/');
          options[label] = { en: sanitizeText(parts[0]), pa: sanitizeText(parts[1]) };
        } else {
          options[label] = { en: sanitizeText(content), pa: "" };
        }
      }
    } 
    // Correct Answer & Explanation Detection
    else if (line.toLowerCase().includes('correct answer:')) {
      const ansMatch = line.match(/Correct Answer:\s*(?:\()?([A-D])(?:\))?/i);
      if (ansMatch) correctAnswer = ansMatch[1].toUpperCase() as any;

      if (line.includes('* English Explanation:')) {
        const expParts = line.split('* English Explanation:');
        const logicTail = expParts[1].split('* ਪੰਜਾਬੀ ਵਿਆਖਿਆ:');
        explanationEn = sanitizeText(logicTail[0]);
        if (logicTail[1]) explanationPa = sanitizeText(logicTail[1]);
      } else if (line.includes('Explanation:')) {
        const expParts = line.split(/Explanation:/i);
        explanationEn = sanitizeText(expParts[1]);
      }
    }
  });

  return {
    ...metadata,
    questionType: 'MCQ',
    questionEn,
    questionPa,
    optionAEn: options['A']?.en || "Option A",
    optionAPa: options['A']?.pa || "",
    optionBEn: options['B']?.en || "Option B",
    optionBPa: options['B']?.pa || "",
    optionCEn: options['C']?.en || "Option C",
    optionCPa: options['C']?.pa || "",
    optionDEn: options['D']?.en || "Option D",
    optionDPa: options['D']?.pa || "",
    correctAnswer,
    explanationEn,
    explanationPa
  };
}
