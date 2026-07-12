/**
 * @fileOverview Institutional Specialized Local Parser v40.0.
 * MODULAR ARCHITECTURE: Dedicated strategies for English, Bilingual, Math, and Assertion-Reason formats.
 * FIXED: Captured "Question X" without dots and handles "(A)." markers with trailing dots.
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
 */
export function preprocessText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    // 1. Remove Section Headers & Decorative lines
    .replace(/^={3,}.*?={3,}$/gm, '')
    .replace(/^-{3,}.*?-{3,}$/gm, '')
    .replace(/^(?:CURRENT AFFAIRS|GENERAL KNOWLEDGE|MONTHLY UPDATE|MOCK TEST|SECTION|ENGLISH|PUNJABI|REASONING|MATH|PUNJABI SECTION|DAILY UPDATES|QUIZ|GK UPDATES).*?$/gim, '')
    // 2. Remove Page Numbers
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/ਪੰਨਾ\s+\d+\s+of\s+\d+/gi, '')
    .replace(/^\s*(?:Page|ਪੰਨਾ)\s*\d+\s*$/gim, '') 
    .replace(/^\s*\d+\s*$/gm, '') 
    // 3. Remove OCR Garbage & Commercial Noise (Hardened)
    .replace(/[~►❖⚬▪•]/g, '')
    .replace(/Copyright.*?[\d]{4}/gi, '')
    .replace(/Copyright.*?Arsh Grewal/gi, '')
    .replace(/(?:www\.)?[\w-]+\.(?:com|in|org|net|edu)(?:\/[\w\.-]*)*/gi, '') // Liquidate all URLs
    .replace(/Visit.*?\.com/gi, '')
    // 4. Normalize Whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Detects visual asset keywords and sets administrative flags.
 */
function detectVisualAssets(block: string, q: any) {
  const assetRegex = /(?:\[)?(?:Figure|Diagram|Image|Map|Graph|Flowchart|Table|Bar Graph|Pie Chart|Line Graph|Histogram)(?:\])?/i;
  const match = block.match(assetRegex);
  
  if (match) {
    q.diagram_required = true;
    q.diagram_caption = `Official ${match[0].replace(/[\[\]]/g, '')} node required for this question.`;
  }
}

/**
 * Main Entry Point for local parsing.
 */
export function parseBulkQuestions(rawText: string, metadata: any) {
  const questions: any[] = [];
  
  // Hardened Splitting Regex to capture Question X without dots
  const blocks = rawText.split(/(?=\n\s*(?:Q\d+|Question\s*\d+|ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)|^(?:Q\d+|Question\s*\d+|ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$))/i);

  blocks.forEach(block => {
    if (!block.trim() || block.length < 10) return;

    let q: any = {
      ...metadata,
      id: `staged-${Math.random().toString(36).substr(2, 9)}`,
      status: 'PUBLISHED',
      questionType: 'MCQ',
      diagram_required: false,
      correctAnswer: 'A',
      table_data: ""
    };

    detectVisualAssets(block, q);

    const format: ParserFormat = metadata.parserFormat || 'BILINGUAL_MCQ';

    switch (format) {
      case 'ASSERTION':
        q = parseBilingual(block, q, metadata.secondaryLanguage);
        break;
      case 'MATCHING':
        q = parseMatching(block, q, metadata.secondaryLanguage);
        break;
      case 'MATHEMATICS':
        q = parseMath(block, q);
        break;
      case 'ENGLISH_ONLY':
        q = parseEnglishOnly(block, q);
        break;
      case 'PUNJABI_ONLY':
        q = parsePunjabiOnly(block, q);
        break;
      default:
        q = parseBilingual(block, q, metadata.secondaryLanguage);
    }

    questions.push(q);
  });

  return { questions };
}

/**
 * STRATEGY: Bilingual MCQ / Current Affairs
 * Hardened for (A). format
 */
function parseBilingual(block: string, q: any, secondaryLang: string) {
  const punjabiRegex = /[\u0A00-\u0A7F]/;
  const hindiRegex = /[\u0900-\u097F]/;
  const scriptRegex = secondaryLang === 'hindi' ? hindiRegex : punjabiRegex;
  const localKey = secondaryLang === 'hindi' ? 'hindiQuestion' : 'punjabiQuestion';
  const expLocalKey = secondaryLang === 'hindi' ? 'hindiExplanation' : 'punjabiExplanation';

  // Hardened Answer matching for "Official Key : A"
  const answerMatch = block.match(/(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर|ਸਹੀ ਉੱਤਰ|Correct Answer)\s*[:\-]?\s*\(?([A-D])\)?/i);
  const explStartIndex = block.search(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या|Rationale)\s*[:\-]?/i);
  
  let restOfBlock = block;
  let explanationPart = "";

  if (explStartIndex !== -1) {
    explanationPart = block.substring(explStartIndex);
    restOfBlock = block.substring(0, explStartIndex);
  }

  // Hardened Option splitting for (A). format
  const optAMatch = restOfBlock.match(/\n\s*\(?A[\)\.\-\s:]+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  const qLines = questionPart.split('\n').map(l => l.trim()).filter(Boolean);
  q.englishQuestion = qLines.filter(l => !scriptRegex.test(l)).join('\n').replace(/^(?:Q\d+|Question\s*\d+)(?:[\.\s:]|$)\s*/i, '').trim();
  q[localKey] = qLines.filter(l => scriptRegex.test(l)).join('\n').replace(/^(?:ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)\s*/i, '').trim();

  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const nextLabel = labels[i + 1] || "(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर|ਸਹੀ ਉੱਤਰ|Correct Answer)";
    const reg = new RegExp(`\\n\\s*\\(?${label}[\\)\\.\\s:]+([\\s\\S]*?)(?=\\n\\s*\\(?${nextLabel}[\\)\\.\\s:]+|$)`, 'i');
    const match = optionsPart.match(reg);
    
    if (match) {
      const optLines = match[1].trim().split('\n').map(l => l.trim()).filter(Boolean);
      const cleanOpt = (text: string) => text.replace(/^[.\-\s]+/, '').replace(/[,\.]$/, '').trim();
      
      q[`option${label}English`] = cleanOpt(optLines.filter(l => !scriptRegex.test(l))[0] || "");
      const optLocalKey = secondaryLang === 'hindi' ? `option${label}Hindi` : `option${label}Punjabi`;
      q[optLocalKey] = cleanOpt(optLines.filter(l => scriptRegex.test(l))[0] || "");
    }
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();

  if (explanationPart) {
    const expClean = explanationPart.replace(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या|Rationale)\s*[:\-]?\s*/i, '').trim();
    const expLines = expClean.split('\n').map(l => l.trim()).filter(Boolean);
    q.englishExplanation = expLines.filter(l => !scriptRegex.test(l)).join('\n');
    q[expLocalKey] = expLines.filter(l => scriptRegex.test(l)).join('\n');
  }

  return q;
}

/**
 * STRATEGY: Match the Following Parser
 */
function parseMatching(block: string, q: any, secondaryLang: string) {
  const lines = block.split('\n');
  const matchingRows: string[] = [];
  const otherLines: string[] = [];

  const matchingRegex = /^[A-E]\.\s+.*?\s+(?:\d+|[I|V|X]+)\.\s+/i;
  
  lines.forEach(line => {
    if (matchingRegex.test(line.trim())) {
      matchingRows.push(line.trim());
    } else {
      otherLines.push(line);
    }
  });

  if (matchingRows.length > 0) {
    const tableHeader = "| Column I | Column II |\n|---|---|";
    const tableRows = matchingRows.map(row => {
       const parts = row.split(/\s+(?=\d+\.|[I|V|X]+\.)/i);
       return `| ${parts[0]?.trim() || ""} | ${parts[1]?.trim() || ""} |`;
    }).join('\n');
    q.table_data = `${tableHeader}\n${tableRows}`;
  }

  return parseBilingual(otherLines.join('\n'), q, secondaryLang);
}

/**
 * STRATEGY: Mathematics Hub
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

  const optAMatch = restOfBlock.match(/\n\s*\(?A[\)\.\-\s:]+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  q.englishQuestion = questionPart.replace(/^(?:Q\d+|Question\s*\d+)(?:[\.\s:]|$)\s*/i, '').trim();
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const nextLabel = labels[i + 1] || "(?:Official Key|Answer|Ans|Correct Answer)";
    const reg = new RegExp(`\\n\\s*\\(?${label}[\\)\\.\\s:]+([\\s\\S]*?)(?=\\n\\s*\\(?${nextLabel}[\\)\\.\\s:]+|$)`, 'i');
    const match = optionsPart.match(reg);
    if (match) {
       q[`option${label}English`] = match[1].replace(/^[.\-\s]+/, '').replace(/[,\.]$/, '').trim();
    }
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();
  if (explanationPart) {
    q.englishExplanation = explanationPart.replace(/(?:Explanation|Solution|Rationale)\s*[:\-]?\s*/i, '').trim();
  }

  return q;
}

function parseEnglishOnly(block: string, q: any) {
  return parseMath(block, q);
}

function parsePunjabiOnly(block: string, q: any) {
  const answerMatch = block.match(/(?:Official Key|Answer|Ans|ਉੱਤਰ|ਸਹੀ ਉੱਤਰ)\s*[:\-]?\s*([A-D])/i);
  const explStartIndex = block.search(/(?:Explanation|Solution|ਵਿਆਖਿਆ|Rationale)\s*[:\-]?/i);
  
  let restOfBlock = block;
  let explanationPart = "";

  if (explStartIndex !== -1) {
    explanationPart = block.substring(explStartIndex);
    restOfBlock = block.substring(0, explStartIndex);
  }

  const optAMatch = restOfBlock.match(/\n\s*\(?A[\)\.\-\s:]+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  q.punjabiQuestion = questionPart.replace(/^(?:Q\d+|Question\s*\d+|ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)\s*/i, '').trim();
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const nextLabel = labels[i + 1] || "(?:Official Key|Answer|Ans|ਉੱਤਰ|ਸਹੀ ਉੱਤਰ)";
    const reg = new RegExp(`\\n\\s*\\(?${label}[\\)\\.\\s:]+([\\s\\S]*?)(?=\\n\\s*\\(?${nextLabel}[\\)\\.\\s:]+|$)`, 'i');
    const match = optionsPart.match(reg);
    if (match) {
       q[`option${label}Punjabi`] = match[1].replace(/^[.\-\s]+/, '').replace(/[,\.]$/, '').trim();
    }
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();
  if (explanationPart) {
    q.punjabiExplanation = explanationPart.replace(/(?:Explanation|Solution|ਵਿਆਖਿਆ|Rationale)\s*[:\-]?\s*/i, '').trim();
  }

  return q;
}

export function validateMCQSchema(q: any): string[] {
  const errors: string[] = [];
  if (!q.englishQuestion && !q.punjabiQuestion && !q.hindiQuestion) errors.push("Statement node missing.");
  if (!q.optionAEnglish && !q.optionAPunjabi && !q.optionAHindi) errors.push("Options node empty.");
  if (!q.correctAnswer) errors.push("Answer key registry failed.");
  return errors;
}
