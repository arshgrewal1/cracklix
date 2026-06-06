
/**
 * @fileOverview Institutional Ultimate Hybrid Ingestion Engine.
 * Features: Automatic Subject Normalization via Alias Mapping.
 */

import { Question, Difficulty, ContentStatus, QuestionType } from "@/types";

export interface ParsedResults {
  questions: Partial<Question>[];
  errors: string[];
  confidence: number;
}

function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/^[\s\d\.\*]+/, '') 
    .replace(/\*+$/, '')         
    .replace(/[\*\_]/g, '')      
    .replace(/\s+/g, ' ')        
    .trim();
}

/**
 * Intelligent Subject Normalizer.
 * Matches input string against Canonical Subjects and their Aliases.
 */
export function normalizeSubjectId(input: string, masterSubjects: any[]): string {
  if (!input || !masterSubjects) return 'general-knowledge';
  const cleanInput = input.trim().toLowerCase();
  
  // 1. Check Exact Matches
  const exact = masterSubjects.find(s => s.name.toLowerCase() === cleanInput || s.id.toLowerCase() === cleanInput);
  if (exact) return exact.id;
  
  // 2. Check Alias Registry
  const aliasMatch = masterSubjects.find(s => 
    s.aliases?.some((a: string) => a.toLowerCase() === cleanInput)
  );
  if (aliasMatch) return aliasMatch.id;
  
  // 3. Fallback
  return 'general-knowledge';
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
  },
  masterSubjects: any[] = []
): ParsedResults {
  const questions: Partial<Question>[] = [];
  const errors: string[] = [];
  
  const text = "\n" + rawText.replace(/\r\n/g, '\n').trim();
  const blocks = text.split(/(?:\n\s*[=-]{3,}\s*\n|(?=\n\s*\**Q?\d+[\.\)])|(?=\n\s*QUESTION_TYPE:))/i)
    .map(b => b.trim())
    .filter(b => b.length > 5);

  if (blocks.length === 0) {
    return { questions: [], errors: ["No valid content blocks detected."], confidence: 0 };
  }

  blocks.forEach((block, index) => {
    try {
      const isTaggedFormat = block.toUpperCase().includes('QUESTION_TYPE:') || block.toUpperCase().includes('QUESTION_EN:');
      let parsed: Partial<Question>;

      if (isTaggedFormat) {
        parsed = parseTaggedBlock(block, metadata, masterSubjects);
      } else {
        parsed = parseSimpleBlock(block, metadata);
      }

      questions.push({
        ...parsed,
        isStandalone: true,
        status: metadata.status
      });

    } catch (err: any) {
      errors.push(`Block ${index + 1}: ${err.message}`);
    }
  });

  const confidence = Math.round((questions.length / (questions.length + (errors.length || 0))) * 100);
  return { questions, errors, confidence };
}

function parseTaggedBlock(block: string, metadata: any, masterSubjects: any[]): Partial<Question> {
  const getTag = (tag: string) => {
    const regex = new RegExp(`${tag}:?\\s*([\\s\\S]*?)(?=\\n[A-Z_\\d\\s]+:?|$)`, 'i');
    const match = block.match(regex);
    return match ? cleanText(match[1]) : null;
  };

  const qType = (getTag("QUESTION_TYPE") || "MCQ").toUpperCase() as QuestionType;
  
  // Dynamic Normalization for per-question subjects if tagged
  const blockSubject = getTag("SUBJECT");
  const finalSubjectId = blockSubject 
    ? normalizeSubjectId(blockSubject, masterSubjects) 
    : metadata.subjectId;

  const ansRaw = getTag("ANSWER") || getTag("CORRECT_ANSWER");
  const correctAnswer = (ansRaw?.match(/[A-D]/i)?.[0].toUpperCase() || "A") as 'A' | 'B' | 'C' | 'D';

  return {
    ...metadata,
    subjectId: finalSubjectId,
    questionType: qType,
    questionEn: getTag("QUESTION_EN") || getTag("TITLE"),
    questionPa: getTag("QUESTION_PA") || getTag("QUESTION_EN") || "",
    optionAEn: getTag("OPTION_A_EN") || "Option A",
    optionAPa: getTag("OPTION_A_PA") || "",
    optionBEn: getTag("OPTION_B_EN") || "Option B",
    optionBPa: getTag("OPTION_B_PA") || "",
    optionCEn: getTag("OPTION_C_EN") || "Option C",
    optionCPa: getTag("OPTION_C_PA") || "",
    optionDEn: getTag("OPTION_D_EN") || "Option D",
    optionDPa: getTag("OPTION_DPa") || "",
    correctAnswer,
    explanationEn: getTag("EXPLANATION_EN") || "Solution provided in bank.",
    explanationPa: getTag("EXPLANATION_PA") || "",
    imageUrl: getTag("IMAGE_URL"),
    passageEn: getTag("PASSAGE_EN"),
    passagePa: getTag("PASSAGE_PA")
  };
}

function parseSimpleBlock(block: string, metadata: any): Partial<Question> {
  const parts = block.split(/(?=\n\s*\**[A-D][\.\)]\s*\*?|(?:\n\s*\**Correct Answer:?\**)|(?:\n\s*\**Explanation:?\**))/i);
  const qLines = parts[0]?.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const questionEn = cleanText(qLines[0] || "");
  const questionPa = qLines.length > 1 ? cleanText(qLines.slice(1).join('\n')) : questionEn;

  const extractOption = (prefix: string) => {
    const raw = parts.find(p => p.trim().replace(/^\**|\**$/g, '').toLowerCase().startsWith(prefix.toLowerCase()));
    if (!raw) return { en: `Option ${prefix}`, pa: "" };
    const content = raw.trim().replace(new RegExp(`^\\**${prefix}[\\.\\)]?\\s*\\**`, 'i'), '').trim();
    if (content.includes('|')) {
      const [en, pa] = content.split('|').map(s => s.trim());
      return { en: cleanText(en), pa: cleanText(pa) };
    }
    return { en: cleanText(content), pa: "" };
  };

  const optA = extractOption("A");
  const optB = extractOption("B");
  const optC = extractOption("C");
  const optD = extractOption("D");

  const ansPart = parts.find(p => p.trim().replace(/^\**|\**$/g, '').toLowerCase().startsWith("correct answer")) || "A";
  const correctAnswer = (ansPart.match(/[A-D]/i)?.[0].toUpperCase() || "A") as 'A' | 'B' | 'C' | 'D';

  return {
    ...metadata,
    questionType: 'MCQ',
    questionEn,
    questionPa,
    optionAEn: optA.en, optionAPa: optA.pa,
    optionBEn: optB.en, optionBPa: optB.pa,
    optionCEn: optC.en, optionCPa: optC.pa,
    optionDEn: optD.en, optionDPa: optD.pa,
    correctAnswer,
  };
}
