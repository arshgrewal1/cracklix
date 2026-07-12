/**
 * @fileOverview Institutional Specialized Local Parser v38.0.
 * MODULAR ARCHITECTURE: Dedicated strategies for English, Bilingual, Math, and Assertion-Reason formats.
 * FIXED: Hardened pre-processor to liquidate "Page", "Copyright", and "Ads" noise.
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
 * Removes headers, footers, page numbers, and strange symbols while PRESERVING math and blank markers.
 */
export function preprocessText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    // 1. Remove Section Headers & Decorative lines (preserve single separators if needed)
    .replace(/^={3,}.*?={3,}$/gm, '')
    .replace(/^-{3,}.*?-{3,}$/gm, '')
    .replace(/^(?:CURRENT AFFAIRS|GENERAL KNOWLEDGE|MONTHLY UPDATE|MOCK TEST|SECTION|ENGLISH|PUNJABI|REASONING|MATH|PUNJABI SECTION|DAILY UPDATES|QUIZ|GK UPDATES).*?$/gim, '')
    // 2. Remove Page Numbers & Progress Nodes
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/ਪੰਨਾ\s+\d+\s+of\s+\d+/gi, '')
    .replace(/Page\s+\d+/gi, '')
    .replace(/ਪੰਨਾ\s+\d+/gi, '')
    .replace(/^\s*(?:Page|ਪੰਨਾ)\s*\d+\s*$/gim, '') 
    .replace(/^\s*\d+\s*$/gm, '') 
    // 3. Remove OCR Garbage, Copyright & Commercial Noise
    .replace(/[~►❖⚬▪•]/g, '')
    .replace(/Copyright.*?Arsh Grewal/gi, '')
    .replace(/Copyright\s*©\s*\d{4}/gi, '')
    .replace(/Random Advertisement/gi, '')
    .replace(/www\.cracklix\.com/gi, '')
    .replace(/Visit www\.example\.com/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    // 4. Normalize Punctuation (Protect math decimals and ellipses)
    .replace(/\.{3,}/g, '...')
    .replace(/\.\./g, '.')
    // 5. Normalize Whitespace
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
  const format: ParserFormat = metadata.parserFormat || 'BILINGUAL_MCQ';
  const questions: any[] = [];
  
  // Split by Question markers (Line anchored) - HARDENED REGEX
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

    switch (format) {
      case 'ASSERTION':
        q = parseAssertionReason(block, q, metadata.secondaryLanguage);
        break;
      case 'MATCHING':
        q = parseMatching(block, q, metadata.secondaryLanguage);
        break;
      case 'TABLE':
        q = parseTable(block, q, metadata.secondaryLanguage);
        break;
      case 'GRAPH':
        q = parseGraph(block, q, metadata.secondaryLanguage);
        break;
      case 'FILL_BLANK':
        q = parseFillBlank(block, q, metadata.secondaryLanguage);
        break;
      case 'TRUE_FALSE':
        q = parseTrueFalse(block, q, metadata.secondaryLanguage);
        break;
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
      case 'REASONING':
        q = parseReasoning(block, q, metadata.secondaryLanguage);
        break;
      case 'DIAGRAM':
        q = parseBilingual(block, q, metadata.secondaryLanguage);
        q.diagram_required = true;
        break;
      default:
        q = parseBilingual(block, q, metadata.secondaryLanguage);
    }

    questions.push(q);
  });

  return { questions };
}

/**
 * STRATEGY: Assertion & Reason Parser
 */
function parseAssertionReason(block: string, q: any, secondaryLang: string) {
  return parseBilingual(block, q, secondaryLang);
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
 * STRATEGY: Reasoning Hub
 */
function parseReasoning(block: string, q: any, secondaryLang: string) {
  return parseBilingual(block, q, secondaryLang);
}

/**
 * STRATEGY: Fill in the Blank Parser
 */
function parseFillBlank(block: string, q: any, secondaryLang: string) {
  return parseBilingual(block, q, secondaryLang);
}

/**
 * STRATEGY: True / False Parser
 */
function parseTrueFalse(block: string, q: any, secondaryLang: string) {
  return parseBilingual(block, q, secondaryLang);
}

/**
 * STRATEGY: Graph Question Parser
 */
function parseGraph(block: string, q: any, secondaryLang: string) {
  return parseBilingual(block, q, secondaryLang);
}

/**
 * STRATEGY: Table Question Parser
 */
function parseTable(block: string, q: any, secondaryLang: string) {
  const lines = block.split('\n');
  const tableLines = lines.filter(l => l.includes('|'));
  
  if (tableLines.length > 0) {
    q.table_data = tableLines.join('\n');
    const cleanBlock = lines.filter(l => !l.includes('|')).join('\n');
    return parseBilingual(cleanBlock, q, secondaryLang);
  }

  return parseBilingual(block, q, secondaryLang);
}

/**
 * STRATEGY: Mathematics Hub - Absolute symbol preservation
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

  const optAMatch = restOfBlock.match(/\n\s*\(?A[\)\.\-]\s+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  q.englishQuestion = questionPart.replace(/^(?:Q\d+|Question\s*\d+|ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)\s*/i, '').trim();
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const next = labels[i + 1] || "(?:Official Key|Answer|Ans|Correct Answer)";
    const reg = new RegExp(`\\n\\s*\\(?${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=\\n\\s*\\(?${next}[\\)\\.\\-]|$)`, 'i');
    const match = optionsPart.match(reg);
    if (match) {
       q[`option${label}English`] = match[1].replace(/[,\.]$/, '').trim();
    }
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();
  if (explanationPart) {
    const expClean = explanationPart.replace(/(?:Explanation|Solution|Rationale)\s*[:\-]?\s*/i, '').trim();
    q.englishExplanation = expClean.split(/(?:Q\d+|Question\s*\d+|ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)/i)[0].trim();
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

  const answerMatch = block.match(/(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर|ਸਹੀ ਉੱਤਰ|Correct Answer)\s*[:\-]?\s*\(?([A-D])\)?/i);
  const explStartIndex = block.search(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या|Rationale)\s*[:\-]?/i);
  
  let restOfBlock = block;
  let explanationPart = "";

  if (explStartIndex !== -1) {
    explanationPart = block.substring(explStartIndex);
    restOfBlock = block.substring(0, explStartIndex);
  }

  const optAMatch = restOfBlock.match(/\n\s*\(?A[\)\.\-]\s+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  const qLines = questionPart.split('\n').map(l => l.trim()).filter(Boolean);
  q.englishQuestion = qLines.filter(l => !scriptRegex.test(l)).join('\n').replace(/^(?:Q\d+|Question\s*\d+)(?:[\.\s:]|$)\s*/i, '').trim();
  q[localKey] = qLines.filter(l => scriptRegex.test(l)).join('\n').replace(/^(?:ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)\s*/i, '').trim();

  const optionLabels = ['A', 'B', 'C', 'D'];
  optionLabels.forEach((label, i) => {
    const nextLabel = optionLabels[i + 1] || "(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर|ਸਹੀ ਉੱਤਰ|Correct Answer)";
    const reg = new RegExp(`\\n\\s*\\(?${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=\\n\\s*\\(?${nextLabel}[\\)\\.\\-]|$)`, 'i');
    const match = optionsPart.match(reg);
    
    if (match) {
      const optLines = match[1].trim().split('\n').map(l => l.trim()).filter(Boolean);
      const cleanOpt = (text: string) => text.replace(/[,\.]$/, '').trim();
      
      q[`option${label}English`] = cleanOpt(optLines.filter(l => !scriptRegex.test(l))[0] || "");
      const optLocalKey = secondaryLang === 'hindi' ? `option${label}Hindi` : `option${label}Punjabi`;
      q[optLocalKey] = cleanOpt(optLines.filter(l => scriptRegex.test(l))[0] || "");
    }
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();

  if (explanationPart) {
    // Aggressive cleaning for explanation
    const expClean = explanationPart
      .replace(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या|Rationale)\s*[:\-]?\s*/i, '')
      .replace(/Visit www\.example\.com/gi, '')
      .replace(/Random Advertisement/gi, '')
      .replace(/Copyright\s*©\s*\d{4}/gi, '')
      .trim();

    const truncatedExp = expClean.split(/(?:Q\d+|Question\s*\d+|ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)/i)[0].trim();
    const expLines = truncatedExp.split('\n').map(l => l.trim()).filter(Boolean);
    q.englishExplanation = expLines.filter(l => !scriptRegex.test(l)).join('\n');
    q[expLocalKey] = expLines.filter(l => scriptRegex.test(l)).join('\n');
  }

  return q;
}

function parseEnglishOnly(block: string, q: any) {
  const answerMatch = block.match(/(?:Official Key|Answer|Ans|Correct Answer)\s*[:\-]?\s*([A-D])/i);
  const explStartIndex = block.search(/(?:Explanation|Solution|Rationale)\s*[:\-]?/i);
  
  let restOfBlock = block;
  let explanationPart = "";

  if (explStartIndex !== -1) {
    explanationPart = block.substring(explStartIndex);
    restOfBlock = block.substring(0, explStartIndex);
  }

  const optAMatch = restOfBlock.match(/\n\s*\(?A[\)\.\-]\s+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  q.englishQuestion = questionPart.replace(/^(?:Q\d+|Question\s*\d+|ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)\s*/i, '').trim();
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const next = labels[i + 1] || "(?:Official Key|Answer|Ans|Correct Answer)";
    const reg = new RegExp(`\\n\\s*\\(?${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=\\n\\s*\\(?${next}[\\)\\.\\-]|$)`, 'i');
    const match = optionsPart.match(reg);
    if (match) {
       q[`option${label}English`] = match[1].replace(/[,\.]$/, '').trim();
    }
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();
  if (explanationPart) {
    const expClean = explanationPart.replace(/(?:Explanation|Solution|Rationale)\s*[:\-]?\s*/i, '').trim();
    q.englishExplanation = expClean.split(/(?:Q\d+|Question\s*\d+|ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)/i)[0].trim();
  }

  return q;
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

  const optAMatch = restOfBlock.match(/\n\s*\(?A[\)\.\-]\s+/i);
  let questionPart = restOfBlock;
  let optionsPart = "";

  if (optAMatch && optAMatch.index !== undefined) {
     questionPart = restOfBlock.substring(0, optAMatch.index);
     optionsPart = restOfBlock.substring(optAMatch.index);
  }

  q.punjabiQuestion = questionPart.replace(/^(?:Q\d+|Question\s*\d+|ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)\s*/i, '').trim();
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const next = labels[i + 1] || "(?:Official Key|Answer|Ans|ਉੱਤਰ|ਸਹੀ ਉੱਤਰ)";
    const reg = new RegExp(`\\n\\s*\\(?${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=\\n\\s*\\(?${next}[\\)\\.\\-]|$)`, 'i');
    const match = optionsPart.match(reg);
    if (match) {
       q[`option${label}Punjabi`] = match[1].replace(/[,\.]$/, '').trim();
    }
  });

  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();
  if (explanationPart) {
    const expClean = explanationPart.replace(/(?:Explanation|Solution|ਵਿਆਖਿਆ|Rationale)\s*[:\-]?\s*/i, '').trim();
    q.punjabiExplanation = expClean.split(/(?:Q\d+|Question\s*\d+|ਪ੍ਰਸ਼ਨ\s*\d+|प्रश्न\s*\d+)(?:[\.\s:]|$)/i)[0].trim();
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
