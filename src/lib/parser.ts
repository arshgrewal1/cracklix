/**
 * @fileOverview Hardened Institutional Bulk MCQ Extraction Engine.
 * Optimized for "Densely Fused" formats where EN/PA script and markers are bunched.
 */

import { Question, Difficulty } from "@/types";

export interface ParsedResults {
  questions: Partial<Question>[];
  mockMetadata?: {
    title?: string;
    duration?: number;
    totalQuestions?: number;
  };
}

export function parseBulkQuestions(
  rawText: string, 
  metadata: { boardId: string; examId: string; subjectId: string; difficulty: Difficulty }
): ParsedResults {
  // 1. Normalize and clean input
  const cleanedText = rawText.replace(/\r\n/g, '\n');
  
  // 2. Aggressive splitting by question markers
  const questionsSplitRegex = /(?=Q\s*\d+[\.\:\)]|Question\s*\d+[\.\:\)]|Q\.\s*\d+[\.\:\)]|(?:\s|^)\d{1,3}[\.\:\)])/i;
  const rawBlocks = cleanedText.split(questionsSplitRegex);
  
  const parsedQuestions: Partial<Question>[] = [];
  let currentActiveSubjectId = metadata.subjectId;
  let detectedDuration = metadata.duration;

  const paRegex = /[\u0A00-\u0A7F]/;

  rawBlocks.forEach((block) => {
    let text = block.trim();
    if (!text) return;

    // Detect Section/Subject headers within clumped text
    const sectionMatch = text.match(/(?:Section|Subject|PART)\s*(\d+|\w+)?\s*[\:\-]\s*([^\nQ1-9\(\)]+)/i);
    if (sectionMatch) {
       const sectionName = sectionMatch[2].toLowerCase();
       if (sectionName.includes('punjabi')) currentActiveSubjectId = 'punjabi-qualifying';
       else if (sectionName.includes('gk') || sectionName.includes('history')) currentActiveSubjectId = 'punjab-history';
       else if (sectionName.includes('math') || sectionName.includes('quant')) currentActiveSubjectId = 'math';
       else if (sectionName.includes('reasoning') || sectionName.includes('mental')) currentActiveSubjectId = 'reasoning';
       else if (sectionName.includes('it') || sectionName.includes('computer')) currentActiveSubjectId = 'ict';
    }

    // Skip if not a question block
    if (!text.match(/^(Q\s*\d+|Question|Q\.\s*\d+|\d+[\.\:\)])/i)) return;

    // --- DEEP PARSING LOGIC ---
    
    // 1. Extract Answer Key (Look for specific markers)
    const answerSplitRegex = /(?=Correct Answer|Ans|Key|ਸਹੀ ਉੱਤਰ)/i;
    const explanationSplitRegex = /(?=Explanation|Solution|ਵਿਆਖਿਆ)/i;

    const parts = text.split(answerSplitRegex);
    const questionAndOptions = parts[0];
    const rest = parts.slice(1).join(' ');

    const answerAndExplanation = rest.split(explanationSplitRegex);
    const answerPart = answerAndExplanation[0] || "";
    const explanationPart = answerAndExplanation.slice(1).join(' ') || "";

    // 2. Extract Options (Handles Fused A) En A) Pa)
    // We split by [A-D] followed by common delimiters
    const optionSplitRegex = /(?=[A-D][\)\.\:\-\s])/;
    const qAndOptBlocks = questionAndOptions.split(optionSplitRegex);
    
    // The first block is the Question Statement (English + Punjabi clumped)
    const rawQuestionFull = qAndOptBlocks[0].replace(/^(Q\s*\d+|Question\s*\d+|Q\.\s*\d+|\d+)[\.\:\)]\s*/i, '').trim();
    const optionBlocks = qAndOptBlocks.slice(1);

    const question: any = {
      boardId: metadata.boardId,
      examId: metadata.examId,
      subjectId: currentActiveSubjectId,
      difficulty: metadata.difficulty,
      correctAnswer: 'A',
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      questionEn: "", questionPa: "",
      optionAEn: "", optionAPa: "",
      optionBEn: "", optionBPa: "",
      optionCEn: "", optionCPa: "",
      optionDEn: "", optionDPa: "",
      explanationEn: "", explanationPa: ""
    };

    // Split fused Question Statement
    if (paRegex.test(rawQuestionFull)) {
      const paStartIdx = rawQuestionFull.search(/[\u0A00-\u0A7F]/);
      if (paStartIdx !== -1) {
        question.questionEn = rawQuestionFull.substring(0, paStartIdx).trim();
        question.questionPa = rawQuestionFull.substring(paStartIdx).trim();
      } else {
        question.questionEn = rawQuestionFull;
        question.questionPa = rawQuestionFull;
      }
    } else {
      question.questionEn = rawQuestionFull;
    }

    // Assign Options (Pairing EN/PA based on repeat count)
    const optionCount: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    optionBlocks.forEach(optBlock => {
      const match = optBlock.trim().match(/^([A-D])[\)\.\:\-\s]\s*(.*)/i);
      if (match) {
        const letter = match[1].toUpperCase();
        const value = match[2].trim();
        optionCount[letter]++;
        
        if (optionCount[letter] === 1) {
          question[`option${letter}En`] = value;
        } else {
          question[`option${letter}Pa`] = value;
        }
      }
    });

    // Cleanup: If PA option is empty but EN contains fused ENPA
    ['A','B','C','D'].forEach(l => {
       const val = question[`option${l}En`];
       if (!question[`option${l}Pa`] && paRegex.test(val)) {
          const paIdx = val.search(/[\u0A00-\u0A7F]/);
          if (paIdx !== -1) {
             question[`option${l}Pa`] = val.substring(paIdx).trim();
             question[`option${l}En`] = val.substring(0, paIdx).trim();
          }
       }
       // Fallback
       if (!question[`option${l}Pa`]) question[`option${l}Pa`] = question[`option${l}En`];
    });

    // 3. Extract Correct Answer Letter
    const ansKeyMatch = answerPart.match(/[A-D]/i);
    if (ansKeyMatch) question.correctAnswer = ansKeyMatch[0].toUpperCase();

    // 4. Extract & Split Explanation
    const expText = explanationPart.replace(/^(Explanation|Solution|ਵਿਆਖਿਆ|English|Punjabi)[\:\-\s\(\w\)]*/gi, '').trim();
    if (paRegex.test(expText)) {
       const paStartIdx = expText.search(/[\u0A00-\u0A7F]/);
       if (paStartIdx !== -1) {
          question.explanationEn = expText.substring(0, paStartIdx).trim();
          question.explanationPa = expText.substring(paStartIdx).trim();
       } else {
          question.explanationPa = expText;
       }
    } else {
       question.explanationEn = expText;
    }

    // Remove fluff words
    question.questionEn = question.questionEn.replace(/\(Bilingual\)/gi, '').trim();
    
    parsedQuestions.push(question);
  });

  return {
    questions: parsedQuestions,
    mockMetadata: {
      duration: detectedDuration,
      totalQuestions: parsedQuestions.length
    }
  };
}
