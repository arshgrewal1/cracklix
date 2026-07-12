/**
 * @fileOverview Institutional Text Sanitizer & Local Regex Parser v12.0.
 * RESTORED: Local parsing logic for high-speed offline ingestion.
 * SUPPORTED: English + Punjabi and English + Hindi workflows.
 * UPDATED: Added support for Diagrams, Tables, Math, and Maps markers.
 */

export function preprocessText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    // Remove decorative separators and section headers
    .replace(/^={3,}.*?={3,}$/gm, '')
    // Remove Page Numbering noise
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/\d+\s*\/\s*\d+/g, '')
    .replace(/Section\s+[A-Z]/gi, '')
    .replace(/Copyright\s+.*$/gim, '')
    // Normalize whitespace
    .replace(/ +/g, ' ')
    .replace(/\n{4,}/g, '\n\n')
    .trim();
}

/**
 * Universal Local Regex Parser for MCQs.
 * Handles:
 * 1. Standard: Q1. Text... (A) Opt... Ans: B
 * 2. Visuals: [DIAGRAM], [MAP], [IMAGE], [GRAPH]
 * 3. Data: Markdown Tables
 * 4. Bilingual: English / Local split
 */
export function parseBulkQuestions(rawText: string, metadata: any) {
  const questions: any[] = [];
  
  // Split by Question markers (Q1., Question 1., etc)
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
      usedCount: 0,
      diagram_required: false
    };

    // 1. Detect Visual/Diagram markers
    if (/\[(DIAGRAM|MAP|IMAGE|GRAPH|BAR GRAPH)\]/i.test(block)) {
       q.diagram_required = true;
       q.diagram_caption = "Visual asset reference detected";
    }

    // 2. Extract Table Data (Markdown format)
    const tableMatch = block.match(/\|[\s\S]*?\|/);
    if (tableMatch) {
       q.table_data = tableMatch[0].trim();
       q.questionType = 'TABLE_BASED';
    }

    // 3. Extract Answer Key (Support multiple labels)
    const ansMatch = block.match(/(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर)\s*[:\-]?\s*\(?([A-D])\)?/i);
    q.correctAnswer = ansMatch ? ansMatch[1].toUpperCase() : "A";

    // 4. Extract Options (Handles Bilingual Splitting & English-Only)
    const extractOpt = (label: string, nextLabel: string) => {
       const regex = new RegExp(`\\(${label}\\)\\s*([\\s\\S]*?)(?=\\(${nextLabel}\\)|Official Key|Answer|Ans|ਉੱਤਰ|उत्तर|$)`, 'i');
       const match = block.match(regex);
       if (!match) return { en: "", local: "" };
       
       const content = match[1].trim();
       const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
       
       // Handle "Option / ਵਿਕਲਪ" or separate lines
       if (content.includes(' / ')) {
          const parts = content.split(' / ');
          return { en: parts[0]?.trim() || "", local: parts[1]?.trim() || parts[0]?.trim() || "" };
       } else if (lines.length > 1) {
          return { en: lines[0], local: lines[1] };
       }
       
       return { en: content, local: "" };
    };

    const optA = extractOpt('A', 'B');
    const optB = extractOpt('B', 'C');
    const optC = extractOpt('C', 'D');
    const optD = extractOpt('D', 'X'); // Use X as fake next to capture D fully

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

    // 5. Extract Question Statements
    const qTextPart = block.split(/\(A\)/i)[0];
    // Filter out visual markers and noise
    const cleanQTextPart = qTextPart.replace(/\[.*?\]/g, '').trim();
    const qLines = cleanQTextPart.split('\n').map(l => l.trim()).filter(Boolean);
    
    const punjabiRegex = /[\u0A00-\u0A7F]/;
    const hindiRegex = /[\u0900-\u097F]/;

    // Detect English lines (usually first)
    const enLines = qLines.filter(l => !punjabiRegex.test(l) && !hindiRegex.test(l));
    q.englishQuestion = enLines.join('\n').replace(/^(?:Q\d+\.|Question\s*\d+\.|ਪ੍ਰਸ਼ਨ\s*\d+\.|प्रश्न\s*\d+\.)\s*/i, '').trim();
    
    // Detect Secondary Language lines
    if (secondaryLang === 'punjabi') {
       const paLines = qLines.filter(l => punjabiRegex.test(l));
       q.punjabiQuestion = paLines.join('\n').replace(/^(?:ਪ੍ਰਸ਼ਨ\s*\d+\.)\s*/i, '').trim();
    } else {
       const hiLines = qLines.filter(l => hindiRegex.test(l));
       q.hindiQuestion = hiLines.join('\n').replace(/^(?:प्रश्न\s*\d+\.)\s*/i, '').trim();
    }

    // 6. Extract Explanation
    const expMatch = block.match(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या)\s*[:\-]?\s*([\s\S]*)$/i);
    if (expMatch) {
       const fullExp = expMatch[1].trim();
       const punRegex = /[\u0A00-\u0A7F]/;
       const hinRegex = /[\u0900-\u097F]/;

       const expLines = fullExp.split('\n').map(l => l.trim()).filter(Boolean);
       
       q.englishExplanation = expLines.filter(l => !punRegex.test(l) && !hinRegex.test(l)).join('\n');
       
       if (secondaryLang === 'punjabi') {
          q.punjabiExplanation = expLines.filter(l => punRegex.test(l)).join('\n') || q.englishExplanation;
       } else {
          q.hindiExplanation = expLines.filter(l => hinRegex.test(l)).join('\n') || q.englishExplanation;
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
