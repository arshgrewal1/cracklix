/**
 * @fileOverview Institutional Specialized Local Parser v26.0.
 * MODULAR ARCHITECTURE: Dedicated strategies for English, Bilingual, Math, and Punjabi Only formats.
 * FIXED: Re-engineered option splitting to handle Math formulas without accidental splits.
 */

export type ParserFormat = 
  | 'CURRENT_AFFAIRS' 
  | 'BILINGUAL_MCQ' 
  | 'ENGLISH_ONLY' 
  | 'PUNJABI_ONLY' 
  | 'MATHEMATICS' 
  | 'REASONING' 
  | 'DIAGRAM' 
  | 'TABLE' 
  | 'GRAPH' 
  | 'MATCHING' 
  | 'ASSERTION' 
  | 'FILL_BLANK' 
  | 'TRUE_FALSE';

/**
 * Pre-processes raw text to remove institutional noise and OCR garbage.
 * Removes headers, footers, page numbers, and strange symbols while PRESERVING math symbols.
 */
export function preprocessText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    // 1. Remove Section Headers & Decorative lines
    .replace(/^={3,}.*?={3,}$/gm, '')
    .replace(/^(?:CURRENT AFFAIRS|GENERAL KNOWLEDGE|MONTHLY UPDATE|MOCK TEST|SECTION|ENGLISH|PUNJABI|REASONING|MATH|PUNJABI SECTION).*?$/gim, '')
    // 2. Remove Page Numbers & Progress Nodes
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/ਪੰਨਾ\s+\d+\s+of\s+\d+/gi, '')
    .replace(/\d+\s*\/\s*\d+/g, '')
    .replace(/^\s*\d+\s*$/gm, '') 
    // 3. Remove OCR Garbage & Symbols (Keep math symbols like ^, √, ∫, etc.)
    .replace(/[~►❖⚬▪•]/g, '')
    .replace(/Copyright.*?Arsh Grewal/gi, '')
    .replace(/www\.cracklix\.com/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    // 4. Normalize Whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Main Entry Point for local parsing.
 */
export function parseBulkQuestions(rawText: string, metadata: any) {
  const format: ParserFormat = metadata.parserFormat || 'BILINGUAL_MCQ';
  const questions: any[] = [];
  
  // Split by Question markers
  const blocks = rawText.split(/(?=\n\s*(?:Q\d+\.|Question\s*\d+\.|ਪ੍ਰਸ਼ਨ\s*\d+\.|प्रश्न\s*\d+\.)|^(?:Q\d+\.|Question\s*\d+\.|ਪ੍ਰਸ਼ਨ\s*\d+\.|प्रश्न\s*\d+\.))/i);

  blocks.forEach(block => {
    if (!block.trim() || block.length < 10) return;

    let q: any = {
      ...metadata,
      id: `staged-${Math.random().toString(36).substr(2, 9)}`,
      status: 'PUBLISHED',
      questionType: 'MCQ',
      diagram_required: false,
      correctAnswer: 'A'
    };

    // Auto-detect visual asset markers
    if (block.includes('[DIAGRAM]') || block.includes('[IMAGE]') || block.includes('[MAP]') || block.includes('[BAR GRAPH]') || block.includes('[TABLE]')) {
      q.diagram_required = true;
      const match = block.match(/\[(DIAGRAM|IMAGE|MAP|BAR GRAPH|TABLE)\]/i);
      q.diagram_caption = match ? `${match[1]} asset required` : "Visual asset required";
    }

    // Dispatch to specific format logic
    switch (format) {
      case 'ENGLISH_ONLY':
        q = parseEnglishOnly(block, q);
        break;
      case 'PUNJABI_ONLY':
        q = parsePunjabiOnly(block, q);
        break;
      case 'MATHEMATICS':
        q = parseMath(block, q);
        break;
      case 'CURRENT_AFFAIRS':
      case 'BILINGUAL_MCQ':
        q = parseBilingual(block, q, metadata.secondaryLanguage);
        break;
      default:
        q = parseSimple(block, q);
    }

    questions.push(q);
  });

  return { questions };
}

/**
 * STRATEGY: Mathematics Hub
 * Hardened to preserve complex equations, integrals and superscripts.
 */
function parseMath(block: string, q: any) {
  const answerMatch = block.match(/(?:Official Key|Answer|Ans|Correct Answer)\s*[:\-]?\s*([A-D])/i);
  const explStartIndex = block.search(/(?:Explanation|Solution|Rationale)\s*[:\-]?/i);
  
  let restOfBlock = block;
  let explanationPart = "";

  if (explStartIndex !== -1) {
    explanationPart = block.substring(explStartIndex);
    restOfBlock = block.substring(0, explStartIndex);
  }

  // STRICT OPTION BOUNDARY: Only split on A) at start of a line to protect internal formulas
  const optAMatch = restOfBlock.match(/\n\s*A[\)\.\-]\s+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  q.englishQuestion = questionPart.replace(/^(?:Q\d+\.|Question\s*\d+\.)\s*/i, '').trim();
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const next = labels[i + 1] || "(?:Official Key|Answer|Ans|Correct Answer)";
    const reg = new RegExp(`\\n\\s*${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=\\n\\s*${next}[\\)\\.\\-]|$)`, 'i');
    const match = optionsPart.match(reg);
    if (match) q[`option${label}English`] = match[1].trim();
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();
  if (explanationPart) {
    q.englishExplanation = explanationPart.replace(/(?:Explanation|Solution|Rationale)\s*[:\-]?\s*/i, '').trim();
  }

  return q;
}

/**
 * STRATEGY: Punjabi Only MCQ
 */
function parsePunjabiOnly(block: string, q: any) {
  const answerMatch = block.match(/(?:Official Key|Answer|Ans|ਉੱਤਰ|ਸਹੀ ਉੱਤਰ)\s*[:\-]?\s*([A-D])/i);
  const explStartIndex = block.search(/(?:Explanation|Solution|ਵਿਆਖਿਆ|Rationale)\s*[:\-]?/i);
  
  let restOfBlock = block;
  let explanationPart = "";

  if (explStartIndex !== -1) {
    explanationPart = block.substring(explStartIndex);
    restOfBlock = block.substring(0, explStartIndex);
  }

  const optAMatch = restOfBlock.match(/\n\s*A[\)\.\-]\s+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  q.punjabiQuestion = questionPart.replace(/^(?:Q\d+\.|Question\s*\d+\.|ਪ੍ਰਸ਼ਨ\s*\d+\.)\s*/i, '').trim();
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const next = labels[i + 1] || "(?:Official Key|Answer|Ans|ਉੱਤਰ|ਸਹੀ ਉੱਤਰ)";
    const reg = new RegExp(`\\n\\s*${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=\\n\\s*${next}[\\)\\.\\-]|$)`, 'i');
    const match = optionsPart.match(reg);
    if (match) q[`option${label}Punjabi`] = match[1].trim();
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();
  if (explanationPart) {
    q.punjabiExplanation = explanationPart.replace(/(?:Explanation|Solution|ਵਿਆਖਿਆ|Rationale)\s*[:\-]?\s*/i, '').trim();
  }

  return q;
}

/**
 * STRATEGY: English Only MCQ
 */
function parseEnglishOnly(block: string, q: any) {
  const answerMatch = block.match(/(?:Official Key|Answer|Ans|Correct Answer)\s*[:\-]?\s*([A-D])/i);
  const explStartIndex = block.search(/(?:Explanation|Solution|Rationale)\s*[:\-]?/i);
  
  let restOfBlock = block;
  let explanationPart = "";

  if (explStartIndex !== -1) {
    explanationPart = block.substring(explStartIndex);
    restOfBlock = block.substring(0, explStartIndex);
  }

  const optAMatch = restOfBlock.match(/\n\s*A[\)\.\-]\s+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  q.englishQuestion = questionPart.replace(/^(?:Q\d+\.|Question\s*\d+\.)\s*/i, '').trim();
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const next = labels[i + 1] || "(?:Official Key|Answer|Ans|Correct Answer)";
    const reg = new RegExp(`\\n\\s*${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=\\n\\s*${next}[\\)\\.\\-]|$)`, 'i');
    const match = optionsPart.match(reg);
    if (match) q[`option${label}English`] = match[1].trim();
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();
  if (explanationPart) {
    q.englishExplanation = explanationPart.replace(/(?:Explanation|Solution|Rationale)\s*[:\-]?\s*/i, '').trim();
  }

  return q;
}

/**
 * STRATEGY: Bilingual MCQ / Current Affairs
 */
function parseBilingual(block: string, q: any, secondaryLang: string) {
  const punjabiRegex = /[\u0A00-\u0A7F]/;
  const hindiRegex = /[\u0900-\u097F]/;
  const scriptRegex = secondaryLang === 'hindi' ? hindiRegex : punjabiRegex;
  const localKey = secondaryLang === 'hindi' ? 'hindiQuestion' : 'punjabiQuestion';
  const expLocalKey = secondaryLang === 'hindi' ? 'hindiExplanation' : 'punjabiExplanation';

  const answerMatch = block.match(/(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर)\s*[:\-]?\s*\(?([A-D])\)?/i);
  const explStartIndex = block.search(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या)\s*[:\-]?/i);
  
  let restOfBlock = block;
  let explanationPart = "";

  if (explStartIndex !== -1) {
    explanationPart = block.substring(explStartIndex);
    restOfBlock = block.substring(0, explStartIndex);
  }

  const optAMatch = restOfBlock.match(/\n\s*A[\)\.\-]\s+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  const qLines = questionPart.split('\n').map(l => l.trim()).filter(Boolean);
  q.englishQuestion = qLines.filter(l => !scriptRegex.test(l)).join('\n').replace(/^(?:Q\d+\.|Question\s*\d+\.)\s*/i, '').trim();
  q[localKey] = qLines.filter(l => scriptRegex.test(l)).join('\n').replace(/^(?:ਪ੍ਰਸ਼ਨ\s*\d+\.|प्रश्न\s*\d+\.)\s*/i, '').trim();

  const optionLabels = ['A', 'B', 'C', 'D'];
  optionLabels.forEach((label, i) => {
    const nextLabel = optionLabels[i + 1] || "(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर)";
    const reg = new RegExp(`\\n\\s*${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=\\n\\s*${nextLabel}[\\)\\.\\-]|$)`, 'i');
    const match = optionsPart.match(reg);
    
    if (match) {
      const optLines = match[1].trim().split('\n').map(l => l.trim()).filter(Boolean);
      q[`option${label}English`] = optLines.filter(l => !scriptRegex.test(l))[0] || "";
      const optLocalKey = secondaryLang === 'hindi' ? `option${label}Hindi` : `option${label}Punjabi`;
      q[optLocalKey] = optLines.filter(l => scriptRegex.test(l))[0] || "";
    }
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();

  if (explanationPart) {
    const expClean = explanationPart.replace(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या)\s*[:\-]?\s*/i, '').trim();
    const expLines = expClean.split('\n').map(l => l.trim()).filter(Boolean);
    q.englishExplanation = expLines.filter(l => !scriptRegex.test(l)).join('\n');
    q[expLocalKey] = expLines.filter(l => scriptRegex.test(l)).join('\n');
  }

  return q;
}

function parseSimple(block: string, q: any) {
  const optAMatch = block.match(/\n\s*A[\)\.\-]\s+/i);
  let questionPart = block;
  let optionsPart = block;

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = block.substring(0, optAMatch.index);
     optionsPart = block.substring(optAMatch.index);
  }

  q.englishQuestion = questionPart.trim().replace(/^(?:Q\d+\.|Question\s*\d+\.)\s*/i, '');
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const next = labels[i + 1] || '(?:Answer|Ans)';
    const reg = new RegExp(`\\n\\s*${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=\\n\\s*${next}[\\)\\.\\-]|$)`, 'i');
    const match = optionsPart.match(reg);
    if (match) q[`option${label}English`] = match[1].trim();
  });

  q.correctAnswer = (block.match(/(?:Answer|Ans|Official Key)\s*[:\-]?\s*([A-D])/i)?.[1] || "A").toUpperCase();
  return q;
}

export function validateMCQSchema(q: any): string[] {
  const errors: string[] = [];
  if (!q.englishQuestion && !q.punjabiQuestion && !q.hindiQuestion) errors.push("Statement node missing.");
  if (!q.optionAEnglish && !q.optionAPunjabi && !q.optionAHindi) errors.push("Options node empty.");
  if (!q.correctAnswer) errors.push("Answer key registry failed.");
  return errors;
}
