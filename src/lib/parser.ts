/**
 * @fileOverview Institutional Text Sanitizer & Local Regex Parser v11.0.
 * RESTORED: Local parsing logic for high-speed offline ingestion.
 * SUPPORTED: English + Punjabi and English + Hindi workflows.
 */

export function preprocessText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    // Remove Page Numbering noise
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/\d+\s*\/\s*\d+/g, '')
    .replace(/Section\s+[A-Z]/gi, '')
    .replace(/Copyright\s+.*$/gim, '')
    // Normalize whitespace
    .replace(/ +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Local Regex Parser for MCQs.
 * Handles the standard Cracklix format:
 * Q1. Question text...
 * (A) Option EN / Local
 * ...
 * Answer: B
 */
export function parseBulkQuestions(rawText: string, metadata: any) {
  const questions: any[] = [];
  // Split by Question markers
  const blocks = rawText.split(/(?=Q\d+\.|Question\s*\d+\.|ਪ੍ਰਸ਼ਨ\s*\d+\.|प्रश्न\s*\d+\.)/i);

  const secondaryLang = metadata.secondaryLanguage || 'punjabi';

  blocks.forEach(block => {
    if (!block.trim() || block.length < 10) return;

    const q: any = { 
      ...metadata,
      id: `staged-${Math.random().toString(36).substr(2, 9)}`,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      questionType: 'MCQ',
      marks: 1,
      negativeMarks: 0.25,
      usedCount: 0
    };

    // 1. Extract Answer Key
    const ansMatch = block.match(/(?:Answer|Ans|ਉੱਤਰ|उत्तर)\s*[:\-]?\s*\(?([A-D])\)?/i);
    q.correctAnswer = ansMatch ? ansMatch[1].toUpperCase() : "A";

    // 2. Extract Options (Handles Bilingual Splitting)
    const extractOpt = (label: string, nextLabel: string) => {
       const regex = new RegExp(`\\(${label}\\)\\s*([\\s\\S]*?)(?=\\(${nextLabel}\\)|Answer|Ans|ਉੱਤਰ|उत्तर|$)`, 'i');
       const match = block.match(regex);
       if (!match) return { en: "", local: "" };
       
       const parts = match[1].trim().split(/\s*\/\s*/);
       return { 
          en: parts[0]?.trim() || "", 
          local: parts[1]?.trim() || parts[0]?.trim() || "" 
       };
    };

    const optA = extractOpt('A', 'B');
    const optB = extractOpt('B', 'C');
    const optC = extractOpt('C', 'D');
    const optD = extractOpt('D', 'X'); 

    q.optionAEnglish = optA.en;
    q.optionBEnglish = optB.en;
    q.optionCEnglish = optC.en;
    q.optionDEnglish = optD.en;

    if (secondaryLang === 'punjabi') {
       q.optionAPunjabi = optA.local;
       q.optionBPunjabi = optB.local;
       q.optionCPunjabi = optC.local;
       q.optionDPunjabi = optD.local;
    } else {
       q.optionAHindi = optA.local;
       q.optionBHindi = optB.local;
       q.optionCHindi = optC.local;
       q.optionDHindi = optD.local;
    }

    // 3. Extract Question Statements
    const qTextPart = block.split(/\(A\)/i)[0];
    const qLines = qTextPart.split('\n').map(l => l.trim()).filter(Boolean);
    
    // Script Detection
    const punjabiRegex = /[\u0A00-\u0A7F]/;
    const hindiRegex = /[\u0900-\u097F]/;

    q.englishQuestion = qLines.find(l => !punjabiRegex.test(l) && !hindiRegex.test(l))?.replace(/^(?:Q\d+\.|Question\s*\d+\.)\s*/i, '') || "";
    
    if (secondaryLang === 'punjabi') {
       q.punjabiQuestion = qLines.find(l => punjabiRegex.test(l))?.replace(/^(?:ਪ੍ਰਸ਼ਨ\s*\d+\.)\s*/i, '') || "";
    } else {
       q.hindiQuestion = qLines.find(l => hindiRegex.test(l))?.replace(/^(?:प्रश्न\s*\d+\.)\s*/i, '') || "";
    }

    // 4. Extract Explanation
    const expMatch = block.match(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या)\s*[:\-]\s*([\s\S]*)$/i);
    if (expMatch) {
       const fullExp = expMatch[1].trim();
       const expParts = fullExp.split(/\s*\/\s*/);
       q.englishExplanation = expParts[0]?.trim() || "";
       if (secondaryLang === 'punjabi') {
          q.punjabiExplanation = expParts[1]?.trim() || expParts[0]?.trim() || "";
       } else {
          q.hindiExplanation = expParts[1]?.trim() || expParts[0]?.trim() || "";
       }
    }

    questions.push(q);
  });

  return { questions };
}

export function validateMCQSchema(q: any): string[] {
  const errors: string[] = [];
  if (!q.englishQuestion && !q.punjabiQuestion && !q.hindiQuestion) errors.push("Statement node missing.");
  if (!q.optionAEnglish || !q.optionBEnglish) errors.push("Options incomplete.");
  if (!q.correctAnswer) errors.push("Answer key missing.");
  return errors;
}
