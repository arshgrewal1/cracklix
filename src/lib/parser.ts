/**
 * @fileOverview Institutional High-Fidelity Ingestion Engine v9.0.
 * Permanent Fix: Intelligent inline option splitting and robust bilingual detection.
 */

import { Question } from "@/types";

export interface ParsedResults {
  questions: Partial<Question>[];
  errors: string[];
  confidence: number;
}

function splitIntoBlocks(text: string): string[] {
  // Try splitting by common question markers if no newlines exist
  const boundaryRegex = /(?:\n|^|---)\s*(?:\*\*)?(?:Q|Question|QUESTION NO\.)?\s*\d+[\.\):\s-]*/gi;
  const parts = text.split(boundaryRegex).filter(p => p.trim().length > 15);
  
  if (parts.length > 0) return parts;
  
  // Fallback to splitting by explicit separator
  return text.split(/\n\s*---\s*\n/).filter(p => p.trim().length > 10);
}

const sanitizeText = (text: string = "") => {
  return text
    .replace(/^[A-D][\.\):\s-]*/i, '') // Remove starting A.
    .replace(/^\d+[\.\):\s-]*/, '')    // Remove starting numbers
    .replace(/\*\*/g, '')              // Remove stars
    .replace(/\s+/g, ' ')              // Collapse extra whitespace
    .trim();
};

export function parseBulkQuestions(
  rawText: string,
  metadata: any
): ParsedResults {
  const blocks = splitIntoBlocks(rawText);
  const parsed = blocks.map((block, index) => {
    try {
      const q = parseFidelityBlock(block, metadata);
      if (!q.questionEn) return null;
      return {
        ...q,
        displayId: `Q${index + 1}`,
        status: metadata.status || "PUBLISHED",
      };
    } catch (err: any) {
      return null;
    }
  }).filter(Boolean) as Partial<Question>[];

  const confidence = blocks.length > 0 ? Math.round((parsed.length / blocks.length) * 100) : 0;
  return { questions: parsed, errors: [], confidence };
}

function parseFidelityBlock(block: string, metadata: any): Partial<Question> {
  // 1. Identify Answer & Explanation first (they usually come last)
  const answerMatch = block.match(/(?:Correct Answer|ਸਹੀ ਉੱਤਰ|Answer|ਜਵਾਬ):?\s*(?:\()?\s*([A-D])\s*(?:\))?/i);
  const correctAnswer = (answerMatch?.[1].toUpperCase() || "A") as 'A' | 'B' | 'C' | 'D';

  const expMatch = block.match(/(?:Explanation|ਵਿਆਖਿਆ):?\s*([\s\S]*)$/i);
  const expPart = expMatch ? expMatch[1].replace(answerMatch?.[0] || "", "").trim() : "";

  // 2. Extract Options using global regex (handles one-line text)
  const options: Record<string, { en: string; pa: string }> = {};
  const optionLabels = ['A', 'B', 'C', 'D'];
  
  // Find positions of options to isolate the question text
  let firstOptionPos = block.length;
  
  optionLabels.forEach(label => {
    const regex = new RegExp(`(?:\\s|^|\\n|\\))\\s*(?:\\()?${label}[\\.\\):\\s-](.*?)(?=\\s*(?:\\()?[A-D][\\.\\):\\s-]|Correct Answer|Explanation|Answer|ਵਿਆਖਿਆ|$)`, 'gi');
    const match = regex.exec(block);
    if (match) {
      if (match.index < firstOptionPos) firstOptionPos = match.index;
      const content = match[1].trim();
      
      if (content.includes('/') || content.includes('|')) {
        const sep = content.includes('|') ? '|' : '/';
        const parts = content.split(sep).map(p => sanitizeText(p));
        options[label] = { en: parts[0], pa: parts[1] || "" };
      } else {
        options[label] = { en: sanitizeText(content), pa: "" };
      }
    }
  });

  // 3. Question Statement is everything before the first option
  const questionBlock = block.substring(0, firstOptionPos).trim();
  let questionEn = "";
  let questionPa = "";

  if (questionBlock.includes('/') || questionBlock.includes('|')) {
    const sep = questionBlock.includes('|') ? '|' : '/';
    const parts = questionBlock.split(sep).map(p => sanitizeText(p));
    questionEn = parts[0];
    questionPa = parts[1] || "";
  } else {
    questionEn = sanitizeText(questionBlock);
    questionPa = questionEn;
  }

  // 4. Handle Explanation Bilingualism
  let explanationEn = expPart;
  let explanationPa = "";
  if (expPart.includes('ਵਿਆਖਿਆ:')) {
    const parts = expPart.split(/ਵਿਆਖਿਆ:/);
    explanationEn = sanitizeText(parts[0]);
    explanationPa = sanitizeText(parts[1]);
  } else if (expPart.includes('/') || expPart.includes('|')) {
    const sep = expPart.includes('|') ? '|' : '/';
    const parts = expPart.split(sep).map(p => sanitizeText(p));
    explanationEn = parts[0];
    explanationPa = parts[1] || "";
  } else {
    explanationEn = sanitizeText(expPart);
  }

  return {
    ...metadata,
    questionType: 'MCQ',
    questionEn,
    questionPa: questionPa || questionEn,
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
    explanationPa: explanationPa || explanationEn
  };
}
