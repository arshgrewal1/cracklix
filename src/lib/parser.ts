/**
 * @fileOverview Institutional Text Sanitizer & Universal Local Regex Parser v16.0.
 * FIXED: Line-anchored option detection to prevent splitting on letters within words (e.g. Find ∠ABC).
 * SUPPORTED: English + Punjabi and English + Hindi workflows.
 */

export function preprocessText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    // Remove decorative separators and redundant section headers
    .replace(/^={3,}.*?={3,}$/gm, '')
    // Remove specific Page Numbering noise
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/\d+\s*\/\s*\d+/g, '')
    // Normalize whitespace but keep line breaks for math/logic
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{4,}/g, '\n\n')
    .trim();
}

/**
 * Universal Local Regex Parser for high-fidelity MCQs.
 * Optimized to handle:
 * 1. Standard: Q1. Text... (A) Opt... Ans: B
 * 2. Visuals: [DIAGRAM], [MAP], [IMAGE], [BAR GRAPH]
 * 3. Data: Markdown Tables
 * 4. Bilingual: English / Local split on new lines or separators
 */
export function parseBulkQuestions(rawText: string, metadata: any) {
  const questions: any[] = [];
  
  // Split by Question markers (Q1., Question 1., etc)
  const blocks = rawText.split(/(?=\n\s*(?:Q\d+\.|Question\s*\d+\.|ਪ੍ਰਸ਼ਨ\s*\d+\.|प्रश्न\s*\d+\.)|^(?:Q\d+\.|Question\s*\d+\.|ਪ੍ਰਸ਼ਨ\s*\d+\.|प्रश्न\s*\d+\.))/i);

  const secondaryLang = metadata.secondaryLanguage || 'punjabi';
  const punjabiRegex = /[\u0A00-\u0A7F]/;
  const hindiRegex = /[\u0900-\u097F]/;

  blocks.forEach(block => {
    if (!block.trim() || block.length < 10) return;

    // Detect the first option marker at the start of a line to separate question text
    const optionSplitRegex = /\n\s*(?:[\\(\\[]?A[\\)\\]\\.\\-])/i;
    const parts = block.split(optionSplitRegex);
    const questionTextPart = parts[0];
    const optionsAndRest = block.substring(questionTextPart.length);

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

    // 1. Detect Visual/Diagram markers and map captions
    const visualMarker = block.match(/\[(DIAGRAM|MAP|IMAGE|GRAPH|BAR GRAPH|TABLE)\]/i);
    if (visualMarker) {
       q.diagram_required = true;
       q.diagram_caption = `${visualMarker[1].toUpperCase()} asset required`;
    }

    // 2. Extract Table Data (Markdown format)
    const tableMatch = block.match(/\|[\s\S]*?\|/);
    if (tableMatch) {
       q.table_data = tableMatch[0].trim();
       q.questionType = 'TABLE_BASED';
    }

    // 3. Extract Answer Key (Support multiple labels and formats)
    const ansMatch = block.match(/(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर)\s*[:\-]?\s*\(?([A-D])\)?/i);
    q.correctAnswer = ansMatch ? ansMatch[1].toUpperCase() : "A";

    // 4. Extract Options (Anchored to line breaks for precision)
    const extractOpt = (label: string, nextLabel: string) => {
       const regex = new RegExp(`(?:\\n\\s*|\\s+)[\\(\\[]?${label}[\\)\\]\\.\\-]\\s*([\\s\\S]*?)(?=(?:\\n\\s*|\\s+)[\\(\\[]?${nextLabel}[\\)\\]\\.\\-]|Official Key|Answer|Ans|ਉੱਤਰ|उत्तर|Explanation|Solution|ਵਿਆਖਿਆ|$)`, 'i');
       const match = optionsAndRest.match(regex);
       if (!match) return { en: "", local: "" };
       
       const content = match[1].trim();
       const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
       
       if (content.includes(' / ')) {
          const parts = content.split(' / ');
          return { en: parts[0]?.trim() || "", local: parts[1]?.trim() || parts[0]?.trim() || "" };
       } else if (lines.length > 1) {
          const isSecondLineLocal = punjabiRegex.test(lines[1]) || hindiRegex.test(lines[1]);
          if (isSecondLineLocal) {
             return { en: lines[0], local: lines[1] };
          }
       }
       
       return { en: content, local: "" };
    };

    const optA = extractOpt('A', 'B');
    const optB = extractOpt('B', 'C');
    const optC = extractOpt('C', 'D');
    const optD = extractOpt('D', 'Z'); 

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

    // 5. Extract Question Statements from the isolated part
    const cleanQTextPart = questionTextPart.replace(/\[.*?\]/g, '').trim();
    const qLines = cleanQTextPart.split('\n').map(l => l.trim()).filter(Boolean);
    
    const enLines = qLines.filter(l => !punjabiRegex.test(l) && !hindiRegex.test(l));
    q.englishQuestion = enLines.join('\n').replace(/^(?:Q\d+\.|Question\s*\d+\.|ਪ੍ਰਸ਼ਨ\s*\d+\.|प्रश्न\s*\d+\.)\s*/i, '').trim();
    
    if (secondaryLang === 'punjabi') {
       const paLines = qLines.filter(l => punjabiRegex.test(l));
       q.punjabiQuestion = paLines.join('\n').replace(/^(?:ਪ੍ਰਸ਼ਨ\s*\d+\.)\s*/i, '').trim();
    } else {
       const hiLines = qLines.filter(l => hindiRegex.test(l));
       q.hindiQuestion = hiLines.join('\n').replace(/^(?:प्रश्न\s*\d+\.)\s*/i, '').trim();
    }

    // 6. Extract Explanation / Rationale Hub
    const expMatch = block.match(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या)\s*[:\-]?\s*([\s\S]*)$/i);
    if (expMatch) {
       const fullExp = expMatch[1].trim();
       const expLines = fullExp.split('\n').map(l => l.trim()).filter(Boolean);
       
       q.englishExplanation = expLines.filter(l => !punjabiRegex.test(l) && !hindiRegex.test(l)).join('\n');
       
       if (secondaryLang === 'punjabi') {
          q.punjabiExplanation = expLines.filter(l => punjabiRegex.test(l)).join('\n') || q.englishExplanation;
       } else {
          q.hindiExplanation = expLines.filter(l => hindiRegex.test(l)).join('\n') || q.englishExplanation;
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