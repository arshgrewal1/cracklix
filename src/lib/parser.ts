/**
 * @fileOverview Hardened Trilingual Bulk MCQ Extraction Engine.
 * Optimized for "Densely Packed" formats where English and Punjabi are fused.
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
  let cleanedText = rawText.replace(/\r\n/g, '\n');
  
  // 2. Aggressive splitting by question markers (e.g., Q101, Question 1, 101.)
  // Handles clumping like "Ability (Bilingual)Q101. A train..."
  const questionsSplitRegex = /(?=Q\s*\d+[\.\:\)]|Question\s*\d+[\.\:\)]|Q\.\s*\d+[\.\:\)]|(?:\s|^)\d{1,3}[\.\:\)])/i;
  const rawBlocks = cleanedText.split(questionsSplitRegex);
  
  const parsedQuestions: Partial<Question>[] = [];
  let currentActiveSubjectId = metadata.subjectId;
  let detectedTitle = "";
  let detectedDuration = metadata.duration;

  const enRegex = /[a-zA-Z]{2,}/;
  const paRegex = /[\u0A00-\u0A7F]/;

  rawBlocks.forEach((block) => {
    let text = block.trim();
    if (!text) return;

    // Check for global metadata in the first block if it's not a question
    if (!text.match(/^(Q\s*\d+|Question|Q\.)/i) && text.includes('Section')) {
      const durationMatch = text.match(/(\d+)\s*(?:min|minute|minutes)/i);
      if (durationMatch) detectedDuration = parseInt(durationMatch[1]);
    }

    // Identify and handle Section/Subject headers within clumped text
    const sectionMatch = text.match(/(?:Section|Subject|PART)\s*(\d+|\w+)?\s*[\:\-]\s*([^\nQ1-9]+)/i);
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
    
    // Split by markers: Answers, Explanations, Options
    const answerSplitRegex = /(?=Correct Answer|Ans|Key|ਸਹੀ ਉੱਤਰ)/i;
    const explanationSplitRegex = /(?=Explanation|Solution|ਵਿਆਖਿਆ)/i;
    // Split options even if repeated (A... A...)
    const optionSplitRegex = /(?=\s[A-D][\)\.\:\-\s]|[A-D][\)\.]\s)/;

    const parts = text.split(answerSplitRegex);
    const questionAndOptions = parts[0];
    const rest = parts.slice(1).join(' ');

    const answerAndExplanation = rest.split(explanationSplitRegex);
    const answerPart = answerAndExplanation[0];
    const explanationPart = answerAndExplanation.slice(1).join(' ');

    // 1. Separate Question Statement from Options
    const qAndOptBlocks = questionAndOptions.split(optionSplitRegex);
    // Remove the numeric marker (e.g. Q101.)
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

    // 2. Handle Fused En/Pa Question Clump
    // Logic: Find the transition point between English and Punjabi script
    if (paRegex.test(rawQuestionFull) && enRegex.test(rawQuestionFull)) {
      // Find index of first Punjabi char
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
      question.questionPa = rawQuestionFull;
    }

    // 3. Process Options (Handles A) En A) Pa fused format)
    optionBlocks.forEach(optBlock => {
      const match = optBlock.trim().match(/^([A-D])[\)\.\:\-\s]\s*(.*)/i);
      if (match) {
        const char = match[1].toUpperCase();
        const val = match[2].trim();
        
        // If this option contains both En and Pa fused together
        if (paRegex.test(val) && enRegex.test(val)) {
           const paStartIdx = val.search(/[\u0A00-\u0A7F]/);
           if (paStartIdx !== -1) {
              const enPart = val.substring(0, paStartIdx).trim();
              const paPart = val.substring(paStartIdx).trim();
              // Assign to En if En field empty, else Pa
              if (!question[`option${char}En`]) question[`option${char}En`] = enPart;
              if (!question[`option${char}Pa`]) question[`option${char}Pa`] = paPart;
           }
        } else if (paRegex.test(val)) {
           // Pure Punjabi option block
           question[`option${char}Pa`] = val;
        } else {
           // Pure English option block
           question[`option${char}En`] = val;
        }
      }
    });

    // 4. Extract Key
    const ansKeyMatch = answerPart.match(/[A-D]/i);
    if (ansKeyMatch) question.correctAnswer = ansKeyMatch[0].toUpperCase();

    // 5. Extract Explanation
    const expText = explanationPart.replace(/^(Explanation|Solution|ਵਿਆਖਿਆ)[\:\-\s\(\w\)]*/i, '').trim();
    if (paRegex.test(expText) && enRegex.test(expText)) {
       const paStartIdx = expText.search(/[\u0A00-\u0A7F]/);
       question.explanationEn = expText.substring(0, paStartIdx).trim();
       question.explanationPa = expText.substring(paStartIdx).trim();
    } else {
       question.explanationEn = expText;
       question.explanationPa = expText;
    }

    // Validation & Fallbacks
    if (!question.questionPa) question.questionPa = question.questionEn;
    ['A','B','C','D'].forEach(c => {
       if (!question[`option${c}Pa`]) question[`option${c}Pa`] = question[`option${c}En`];
       if (!question[`option${c}En`]) question[`option${c}En`] = question[`option${c}Pa`];
    });

    parsedQuestions.push(question);
  });

  return {
    questions: parsedQuestions,
    mockMetadata: {
      title: detectedTitle,
      duration: detectedDuration,
      totalQuestions: parsedQuestions.length
    }
  };
}
