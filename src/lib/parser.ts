/**
 * @fileOverview Production-Grade Institutional Ingestion Engine.
 * Supports Standard, Bilingual, Image-Based, DI Sets, and Passages.
 */

import { Question, Difficulty, MockType, ContentStatus, QuestionType, DiagramType } from "@/types";

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
    mockType?: MockType;
  }
): ParsedResults {
  const questions: Partial<Question>[] = [];
  const errors: string[] = [];
  
  // Normalize line endings and trim
  const text = rawText.replace(/\r\n/g, '\n').trim();
  
  // Split by [BLOCK_ID: or Q1. style markers
  const questionBlocks = text.split(/\[BLOCK_ID:.*?\]|Q\d+[:.]|Question \d+[:.]|\[Q\d+\]/i).filter(b => b.trim().length > 0);

  if (questionBlocks.length === 0) {
    return { questions: [], errors: ["No valid block markers detected. Use [BLOCK_ID: Q1] or Q1. format."], confidence: 0 };
  }

  questionBlocks.forEach((block, index) => {
    try {
      const getTagContent = (tag: string) => {
        const regex = new RegExp(`${tag}:?\\s*([\\s\\S]*?)(?=\\n[A-Z_\\d\\s]+:?|$)`, 'i');
        const match = block.match(regex);
        return match ? match[1].trim() : "";
      };

      // 1. Core Question Fields
      const questionEn = getTagContent("ENG_Q") || getTagContent("Question EN") || getTagContent("Question");
      const questionPa = getTagContent("PUN_Q") || getTagContent("Question PA");
      
      // 2. Options Extraction (Supporting pipe separator | or newlines)
      let optAEn = getTagContent("ENG_OPT A") || getTagContent("A EN");
      let optAPa = getTagContent("PUN_OPT A") || getTagContent("A PA");
      let optBEn = getTagContent("ENG_OPT B") || getTagContent("B EN");
      let optBPa = getTagContent("PUN_OPT B") || getTagContent("B PA");
      let optCEn = getTagContent("ENG_OPT C") || getTagContent("C EN");
      let optCPa = getTagContent("PUN_OPT C") || getTagContent("C PA");
      let optDEn = getTagContent("ENG_OPT D") || getTagContent("D EN");
      let optDPa = getTagContent("PUN_OPT D") || getTagContent("D PA");

      // Handle Bunched Options (e.g., ENG_OPT: A. X | B. Y)
      const fullOptEn = getTagContent("ENG_OPT");
      if (fullOptEn) {
        const parts = fullOptEn.split(/[A-D]\.\s*|\|/).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 4) {
          optAEn = parts[0]; optBEn = parts[1]; optCEn = parts[2]; optDEn = parts[3];
        }
      }
      
      const fullOptPa = getTagContent("PUN_OPT");
      if (fullOptPa) {
        const parts = fullOptPa.split(/[A-D]\.\s*|\|/).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 4) {
          optAPa = parts[0]; optBPa = parts[1]; optCPa = parts[2]; optDPa = parts[3];
        }
      }

      // 3. Answer & Explanation
      const ansRaw = getTagContent("ENG_ANS") || getTagContent("Answer") || getTagContent("PUN_ANS");
      const correctAnswer = ansRaw.match(/[A-D]/i)?.[0].toUpperCase() as any;
      const explanationEn = getTagContent("ENG_EXP") || getTagContent("Explanation EN") || getTagContent("Explanation");
      const explanationPa = getTagContent("PUN_EXP") || getTagContent("Explanation PA");

      // 4. Visual/Complex DI/Diagram Tags
      const imageUrl = getTagContent("IMAGE_URL") || getTagContent("Image") || getTagContent("DIAGRAM");
      const instructionEn = getTagContent("INSTRUCTION_EN") || getTagContent("Instruction");
      const instructionPa = getTagContent("INSTRUCTION_PA");
      const passageEn = getTagContent("PASSAGE_EN") || getTagContent("Passage");
      const passagePa = getTagContent("PASSAGE_PA");
      const tableDataRaw = getTagContent("TABLE_DATA");
      let tableData = undefined;
      if (tableDataRaw) {
        try { tableData = JSON.parse(tableDataRaw); } catch (e) { errors.push(`Block ${index + 1}: Invalid Table JSON format.`); }
      }

      // 5. Logic Mapping
      let qType: QuestionType = 'MCQ';
      let dType: DiagramType = 'none';

      if (passageEn) qType = 'PASSAGE';
      if (imageUrl) { qType = 'IMAGE_MCQ' as any; dType = 'image'; }
      if (tableData) { qType = 'DI_TABLE'; dType = 'table'; }

      // Final Defaults
      if (!questionEn && !passageEn) throw new Error("Empty question statement.");
      if (!correctAnswer) throw new Error("Correct answer marker (A-D) not found.");

      questions.push({
        ...metadata,
        questionType: qType,
        diagramType: dType,
        questionEn,
        questionPa: questionPa || questionEn,
        optionAEn: optAEn || "Option A",
        optionAPa: optAPa || optAEn || "ਵਿਕਲਪ A",
        optionBEn: optBEn || "Option B",
        optionBPa: optBPa || optBEn || "ਵਿਕਲਪ B",
        optionCEn: optCEn || "Option C",
        optionCPa: optCPa || optCEn || "ਵਿਕਲਪ C",
        optionDEn: optDEn || "Option D",
        optionDPa: optDPa || optDEn || "ਵਿਕਲਪ D",
        correctAnswer: correctAnswer,
        explanationEn: explanationEn || "No explanation provided.",
        explanationPa: explanationPa || explanationEn || "ਕੋਈ ਵਿਆਖਿਆ ਨਹੀਂ ਦਿੱਤੀ ਗਈ।",
        imageUrl,
        instructionEn,
        instructionPa,
        passageEn,
        passagePa,
        tableData,
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
