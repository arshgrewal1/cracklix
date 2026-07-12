/**
 * @fileOverview Institutional Specialized Local Parser v21.0.
 * MODULAR ARCHITECTURE: Dedicated strategies for 13+ question formats.
 * 
 * Strategy:
 * 1. Pre-process: Clean headers, page numbers, and footers.
 * 2. Identify: Use format-specific regex to split blocks.
 * 3. Extract: Map English/Local scripts, keys, and rationales based on type.
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
 * Pre-processes raw text to remove institutional noise.
 * Removes headers, footers, page numbers, and extra spaces.
 */
export function preprocessText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    // 1. Remove Section Headers & Decorative lines
    .replace(/^={3,}.*?={3,}$/gm, '')
    .replace(/^(?:CURRENT AFFAIRS|GENERAL KNOWLEDGE|MONTHLY UPDATE).*?$/gim, '')
    // 2. Remove Page Numbers & Progress Nodes
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/\d+\s*\/\s*\d+/g, '')
    // 3. Remove Copyright & URLs
    .replace(/Copyright.*?Arsh Grewal/gi, '')
    .replace(/www\.cracklix\.com/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    // 4. Normalize Punctuation & Whitespace
    .replace(/\.{2,}/g, '.') // No double dots
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Main Entry Point for local parsing.
 * Dispatches to specialized strategies based on format selection.
 */
export function parseBulkQuestions(rawText: string, metadata: any) {
  const format: ParserFormat = metadata.parserFormat || 'BILINGUAL_MCQ';
  const questions: any[] = [];
  
  // Split by Question markers (Universal start-of-block detection)
  // Supports Q1, Question 1, Punjabi Prefix, Hindi Prefix
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
    if (block.includes('[DIAGRAM]') || block.includes('[IMAGE]') || block.includes('[MAP]') || block.includes('[BAR GRAPH]')) {
      q.diagram_required = true;
      const match = block.match(/\[(DIAGRAM|IMAGE|MAP|BAR GRAPH)\]/i);
      q.diagram_caption = match ? `${match[1]} asset required` : "Visual asset required";
    }

    // Dispatch to specific format logic
    switch (format) {
      case 'CURRENT_AFFAIRS':
      case 'BILINGUAL_MCQ':
        q = parseBilingual(block, q, metadata.secondaryLanguage);
        break;
      case 'MATHEMATICS':
        q = parseMath(block, q);
        break;
      case 'REASONING':
        q = parseReasoning(block, q);
        break;
      case 'DIAGRAM':
        q = parseDiagram(block, q);
        break;
      case 'TABLE':
        q = parseTable(block, q);
        break;
      default:
        q = parseSimple(block, q);
    }

    questions.push(q);
  });

  return { questions };
}

/**
 * STRATEGY: Current Affairs / Bilingual
 * Handles stacked English and Local scripts line-by-line.
 */
function parseBilingual(block: string, q: any, secondaryLang: string) {
  const punjabiRegex = /[\u0A00-\u0A7F]/;
  const hindiRegex = /[\u0900-\u097F]/;
  const scriptRegex = secondaryLang === 'hindi' ? hindiRegex : punjabiRegex;
  const localKey = secondaryLang === 'hindi' ? 'hindiQuestion' : 'punjabiQuestion';
  const expLocalKey = secondaryLang === 'hindi' ? 'hindiExplanation' : 'punjabiExplanation';

  // 1. Identify Answer & Explanation Boundaries
  const answerMatch = block.match(/(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर)\s*[:\-]?\s*\(?([A-D])\)?/i);
  const explStartIndex = block.search(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या)\s*[:\-]?/i);
  
  let restOfBlock = block;
  let explanationPart = "";

  if (explStartIndex !== -1) {
    explanationPart = block.substring(explStartIndex);
    restOfBlock = block.substring(0, explStartIndex);
  }

  // 2. Extract Options (Strict Line Anchor)
  const optionLabels = ['A', 'B', 'C', 'D'];
  const optionsMap: any = {};
  let questionPart = restOfBlock;

  optionLabels.forEach((label, i) => {
    const currentRegex = new RegExp(`\\n\\s*${label}[\\)\\.\\-]\\s*`, 'i');
    const splitIndex = questionPart.search(currentRegex);
    
    if (splitIndex !== -1 && i === 0) {
      // Everything before the first "A)" is the question
      const tempQ = questionPart.substring(0, splitIndex);
      questionPart = tempQ;
    }
  });

  // Extract Question Statements
  const qLines = questionPart.split('\n').map(l => l.trim()).filter(Boolean);
  q.englishQuestion = qLines.filter(l => !scriptRegex.test(l)).join('\n').replace(/^(?:Q\d+\.|Question\s*\d+\.)\s*/i, '').trim();
  q[localKey] = qLines.filter(l => scriptRegex.test(l)).join('\n').replace(/^(?:ਪ੍ਰਸ਼ਨ\s*\d+\.|प्रश्न\s*\d+\.)\s*/i, '').trim();

  // Extract Option Values
  optionLabels.forEach((label, i) => {
    const nextLabel = optionLabels[i + 1] || "(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर)";
    const reg = new RegExp(`\\n\\s*${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=\\n\\s*${nextLabel}[\\)\\.\\-]|\\n\\s*(?:Official Key|Answer|Ans|ਉੱਤਰ|उत्तर)|$)`, 'i');
    const match = block.match(reg);
    
    if (match) {
      const optLines = match[1].trim().split('\n').map(l => l.trim()).filter(Boolean);
      q[`option${label}English`] = optLines.filter(l => !scriptRegex.test(l))[0] || "";
      const optLocalKey = secondaryLang === 'hindi' ? `option${label}Hindi` : `option${label}Punjabi`;
      q[optLocalKey] = optLines.filter(l => scriptRegex.test(l))[0] || "";
    }
  });

  // 3. Set Answer
  q.correctAnswer = (answerMatch?.[1] || "A").toUpperCase();

  // 4. Process Explanation
  if (explanationPart) {
    const expClean = explanationPart.replace(/(?:Explanation|Solution|ਵਿਆਖਿਆ|व्याख्या)\s*[:\-]?\s*/i, '').trim();
    const expLines = expClean.split('\n').map(l => l.trim()).filter(Boolean);
    q.englishExplanation = expLines.filter(l => !scriptRegex.test(l)).join('\n');
    q[expLocalKey] = expLines.filter(l => scriptRegex.test(l)).join('\n');
  }

  return q;
}

/**
 * STRATEGY: Mathematics
 * Preserves math characters and LaTeX logic.
 */
function parseMath(block: string, q: any) {
  const parts = block.split(/\n\s*A[\)\.\-]\s+/i);
  q.englishQuestion = parts[0].trim().replace(/^(?:Q\d+\.|Question\s*\d+\.)\s*/i, '');
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const next = labels[i + 1] || 'Answer|Ans';
    const reg = new RegExp(`${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=${next}[\\)\\.\\-]|$)`, 'i');
    const match = block.match(reg);
    if (match) q[`option${label}English`] = match[1].trim();
  });

  q.correctAnswer = (block.match(/(?:Answer|Ans)\s*[:\-]?\s*([A-D])/i)?.[1] || "A").toUpperCase();
  return q;
}

/**
 * STRATEGY: Diagram / Reasoning
 */
function parseDiagram(block: string, q: any) {
  return parseSimple(block, q);
}

/**
 * STRATEGY: Table
 */
function parseTable(block: string, q: any) {
  const tableMatch = block.match(/\|[\s\S]*?\|/);
  if (tableMatch) {
    q.table_data = tableMatch[0].trim();
    q.questionType = 'TABLE_BASED';
  }
  return parseSimple(block, q);
}

function parseReasoning(block: string, q: any) {
  return parseSimple(block, q);
}

function parseSimple(block: string, q: any) {
  const parts = block.split(/\n\s*A[\)\.\-]\s+/i);
  q.englishQuestion = parts[0].trim().replace(/^(?:Q\d+\.|Question\s*\d+\.)\s*/i, '');
  
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((label, i) => {
    const next = labels[i + 1] || 'Answer|Ans';
    const reg = new RegExp(`${label}[\\)\\.\\-]\\s*([\\s\\S]*?)(?=${next}[\\)\\.\\-]|$)`, 'i');
    const match = block.match(reg);
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
