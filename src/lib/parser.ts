/**
 * @fileOverview Institutional Text Sanitizer & Local Regex Parser v10.0.
 * RESTORED: Local parsing logic for high-speed offline ingestion.
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
 * (A) Option EN / PA
 * ...
 * Answer: B
 */
export function parseBulkQuestions(rawText: string, metadata: any) {
  const questions: any[] = [];
  // Split by Question markers
  const blocks = rawText.split(/(?=Q\d+\.|Question\s*\d+\.|ਪ੍ਰਸ਼ਨ\s*\d+\.)/i);

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
       if (!match) return { en: "", pa: "" };
       
       const parts = match[1].trim().split(/\s*\/\s*/);
       return { 
          en: parts[0]?.trim() || "", 
          pa: parts[1]?.trim() || parts[0]?.trim() || "" 
       };
    };

    const optA = extractOpt('A', 'B');
    const optB = extractOpt('B', 'C');
    const optC = extractOpt('C', 'D');
    const optD = extractOpt('D', 'X'); // X is dummy to terminate

    q.optionAEnglish = optA.en; q.optionAPunjabi = optA.pa;
    q.optionBEnglish = optB.en; q.optionBPunjabi = optB.pa;
    q.optionCEnglish = optC.en; q.optionCPunjabi = optC.pa;
    q.optionDEnglish = optD.en; q.optionDPunjabi = optD.pa;

    // 3. Extract Question Statements
    const qTextPart = block.split(/\(A\)/i)[0];
    const qLines = qTextPart.split('\n').map(l => l.trim()).filter(Boolean);
    
    // Detect Punjabi characters for auto-script separation
    const punjabiRegex = /[\u0A00-\u0A7F]/;
    q.englishQuestion = qLines.find(l => !punjabiRegex.test(l))?.replace(/^(?:Q\d+\.|Question\s*\d+\.)\s*/i, '') || "";
    q.punjabiQuestion = qLines.find(l => punjabiRegex.test(l))?.replace(/^(?:ਪ੍ਰਸ਼ਨ\s*\d+\.)\s*/i, '') || "";

    // 4. Extract Explanation
    const expMatch = block.match(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या)\s*[:\-]\s*([\s\S]*)$/i);
    if (expMatch) {
       const fullExp = expMatch[1].trim();
       const expParts = fullExp.split(/\s*\/\s*/);
       q.englishExplanation = expParts[0]?.trim() || "";
       q.punjabiExplanation = expParts[1]?.trim() || expParts[0]?.trim() || "";
    }

    questions.push(q);
  });

  return { questions };
}

export function validateMCQSchema(q: any): string[] {
  const errors: string[] = [];
  if (!q.englishQuestion && !q.punjabiQuestion) errors.push("Statement node missing.");
  if (!q.optionAEnglish || !q.optionBEnglish) errors.push("Options incomplete.");
  if (!q.correctAnswer) errors.push("Answer key missing.");
  return errors;
}
