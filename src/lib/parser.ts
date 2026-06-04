/**
 * @fileOverview Institutional Hybrid Ingestion Engine.
 * Supports: 
 * 1. Simple Format (Q1. Text, A., B., C., D., Answer: B, Explanation: ...)
 * 2. Tagged Format (QUESTION_TYPE: MCQ, QUESTION_EN: ..., etc.)
 * 3. Bilingual Tagged Format
 */

import { Question, Difficulty, ContentStatus, QuestionType, DiagramType } from "@/types";

export interface ParsedResults {
  questions: Partial<Question>[];
  errors: string[];
  confidence: number;
}

export function parseBulkQuestions(
  rawText: string,
  metadata: {
    boardId: string;
    examId: string;
    subjectId: string;
    chapterId: string;
    difficulty: Difficulty;
    status: ContentStatus;
  }
): ParsedResults {
  const questions: Partial<Question>[] = [];
  const errors: string[] = [];
  
  const text = rawText.replace(/\r\n/g, '\n').trim();
  
  // Split by specific markers or new question indicators
  const blocks = text.split(/(?:={3,}|QUESTION_TYPE:|(?=\nQ\d+\.)|(?=\n\d+\.))/i)
    .map(b => b.trim())
    .filter(b => b.length > 5);

  if (blocks.length === 0) {
    return { questions: [], errors: ["No valid content blocks detected."], confidence: 0 };
  }

  blocks.forEach((block, index) => {
    try {
      const isTaggedFormat = block.toUpperCase().includes('QUESTION_EN:') || block.toUpperCase().includes('QUESTION_TYPE:');
      
      let parsed: Partial<Question>;

      if (isTaggedFormat) {
        parsed = parseTaggedBlock(block, metadata);
      } else {
        parsed = parseSimpleBlock(block, metadata);
      }

      if (!parsed.questionEn) {
        throw new Error("Could not identify question text. Check format.");
      }

      questions.push({
        ...parsed,
        id: `q-${Date.now()}-${index}`,
        isStandalone: true,
        status: metadata.status
      });

    } catch (err: any) {
      errors.push(`Block ${index + 1}: ${err.message}`);
    }
  });

  const confidence = Math.round((questions.length / (questions.length + errors.length)) * 100);
  return { questions, errors, confidence };
}

function parseTaggedBlock(block: string, metadata: any): Partial<Question> {
  const getTag = (tag: string) => {
    const regex = new RegExp(`${tag}:?\\s*([\\s\\S]*?)(?=\\n[A-Z_\\d\\s]+:?|$)`, 'i');
    const match = block.match(regex);
    return match ? match[1].trim() : "";
  };

  const qType = (getTag("QUESTION_TYPE") || "MCQ").toUpperCase() as QuestionType;
  const ansRaw = getTag("ANSWER");
  const correctAnswer = (ansRaw.match(/[A-D]/i)?.[0].toUpperCase() || "A") as 'A' | 'B' | 'C' | 'D';

  const qEn = getTag("QUESTION_EN") || getTag("TITLE");
  const qPa = getTag("QUESTION_PA") || qEn;

  return {
    ...metadata,
    questionType: qType,
    diagramType: getTag("IMAGE_URL") ? 'image' : getTag("TABLE_DATA") ? 'table' : 'none',
    questionEn: qEn,
    questionPa: qPa,
    optionAEn: getTag("OPTION_A_EN") || "Option A",
    optionAPa: getTag("OPTION_A_PA") || getTag("OPTION_A_EN") || "ਵਿਕਲਪ A",
    optionBEn: getTag("OPTION_B_EN") || "Option B",
    optionBPa: getTag("OPTION_B_PA") || getTag("OPTION_B_EN") || "ਵਿਕਲਪ B",
    optionCEn: getTag("OPTION_C_EN") || "Option C",
    optionCPa: getTag("OPTION_C_PA") || getTag("OPTION_C_EN") || "ਵਿਕਲਪ C",
    optionDEn: getTag("OPTION_D_EN") || "Option D",
    optionDPa: getTag("OPTION_DPa") || getTag("OPTION_D_EN") || "ਵਿਕਲਪ D",
    correctAnswer,
    explanationEn: getTag("EXPLANATION_EN") || "Rationale provided.",
    explanationPa: getTag("EXPLANATION_PA") || getTag("EXPLANATION_EN") || "ਵਿਆਖਿਆ.",
    imageUrl: getTag("IMAGE_URL") || undefined,
    passageEn: getTag("PASSAGE_EN") || undefined,
    passagePa: getTag("PASSAGE_PA") || undefined,
  };
}

function parseSimpleBlock(block: string, metadata: any): Partial<Question> {
  // Regex to clean "Q1." or "1." from start
  const cleanBlock = block.replace(/^(?:Q?\d+[\.\)]\s*)/i, '').trim();
  
  // Extract sections using split-lookahead
  const parts = cleanBlock.split(/(?=\n[A-D][\.\)]\s*|Answer:\s*|Explanation:\s*)/i);
  
  const questionEn = parts[0]?.trim();
  
  const findPart = (prefix: string) => {
    return parts.find(p => p.trim().toLowerCase().startsWith(prefix.toLowerCase()))
      ?.replace(new RegExp(`^${prefix}[\\.\\)]?\\s*`, 'i'), '').trim() || "";
  };

  const optA = findPart("A");
  const optB = findPart("B");
  const optC = findPart("C");
  const optD = findPart("D");
  const ans = findPart("Answer");
  const exp = findPart("Explanation");

  const correctAnswer = (ans.match(/[A-D]/i)?.[0].toUpperCase() || "A") as 'A' | 'B' | 'C' | 'D';

  return {
    ...metadata,
    questionType: 'MCQ',
    diagramType: 'none',
    questionEn,
    questionPa: questionEn, // Fallback for bilingual
    optionAEn: optA || "Option A",
    optionAPa: optA || "ਵਿਕਲਪ A",
    optionBEn: optB || "Option B",
    optionBPa: optB || "ਵਿਕਲਪ B",
    optionCEn: optC || "Option C",
    optionCPa: optC || "ਵਿਕਲਪ C",
    optionDEn: optD || "Option D",
    optionDPa: optD || "ਵਿਕਲਪ D",
    correctAnswer,
    explanationEn: exp || "Rationale provided.",
    explanationPa: exp || "ਵਿਆਖਿਆ.",
  };
}
