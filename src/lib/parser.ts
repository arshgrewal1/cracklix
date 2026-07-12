/**
 * @fileOverview Institutional Master Text Ingestion Parser v8.0.
 * Optimized for high-fidelity MCQ extraction from raw, noisy, or OCR-generated text.
 * Strictly adheres to Lead Software Architect's production guidelines.
 */

export interface ParsedMCQ {
  id: string;
  englishQuestion: string;
  punjabiQuestion?: string;
  hindiQuestion?: string;
  optionAEnglish: string;
  optionAPunjabi?: string;
  optionAHindi?: string;
  optionBEnglish: string;
  optionBPunjabi?: string;
  optionBHindi?: string;
  optionCEnglish: string;
  optionCPunjabi?: string;
  optionCHindi?: string;
  optionDEnglish: string;
  optionDPunjabi?: string;
  optionDHindi?: string;
  correctAnswer: string;
  englishExplanation?: string;
  punjabiExplanation?: string;
  diagram_required?: boolean;
  diagram_caption?: string;
  isValid: boolean;
  validationErrors: string[];
}

/**
 * Preprocessor: Removes OCR garbage, headers, footers and noise.
 */
export function preprocessText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    // Remove Page Numbering: "Page 1 of 20", "1/20"
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/\d+\s*\/\s*\d+/g, '')
    // Remove Common Noise
    .replace(/Section\s+[A-Z]/gi, '')
    .replace(/Copyright\s+.*$/gim, '')
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/www\.[^\s]+/gi, '')
    // Repair broken lines (OCR specific)
    .replace(/([a-z,])\n([a-z])/g, '$1 $2') 
    // Normalize punctuation
    .replace(/[\|_]{2,}/g, '') 
    .replace(/\.{3,}/g, '...')
    // Trim and collapse whitespace
    .replace(/ +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Intelligently splits mixed English/Punjabi/Hindi blocks.
 */
function parseMultilingualNode(text: string): { en: string, pa: string, hi: string } {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = { en: "", pa: "", hi: "" };

  lines.forEach(line => {
    const isPunjabi = /[\u0A00-\u0A7F]/.test(line);
    const isHindi = /[\u0900-\u097F]/.test(line);
    
    if (isPunjabi) result.pa += (result.pa ? "\n" : "") + line;
    else if (isHindi) result.hi += (result.hi ? "\n" : "") + line;
    else result.en += (result.en ? " " : "") + line;
  });

  return { 
    en: result.en.trim(), 
    pa: result.pa.trim(), 
    hi: result.hi.trim() 
  };
}

/**
 * The Master Regex Extractor.
 */
export function parseMCQBlocks(rawText: string): ParsedMCQ[] {
  const cleaned = preprocessText(rawText);
  if (!cleaned) return [];

  // Question Splitter: Matches Q1., 1., (1), Question 1:
  const blocks = cleaned.split(/\n(?=(?:\d+|Q\d+|Question\s*\d*)[\.\)\s\:]+)/i).filter(b => b.trim().length > 10);
  
  const results: ParsedMCQ[] = [];

  blocks.forEach((block, idx) => {
    const b = block.trim();
    const errors: string[] = [];
    
    // 1. Extract Question Text
    const qMatch = b.match(/^([\s\S]+?)(?=\n?\(?[A-D][\.\)\s①-④])/i);
    const rawQ = qMatch ? qMatch[1].replace(/^(?:\d+|Q\d+|Question\s*\d*)[\.\)\s\:]+/i, '').trim() : b;
    const qNodes = parseMultilingualNode(rawQ);

    // 2. Extract Options A-D
    const getOpt = (letter: string, marker: string, nextLetter: string | null) => {
      const start = `\\n?\\(?${marker}[\\.\\)\\s]+`;
      const end = nextLetter 
        ? `(?=\\n?\\(?${nextLetter}[\\.\\)\\s①-④])` 
        : `(?=\\n?(?:Answer|ਉੱਤਰ|उत्तर|Key|Explanation|ਵਿਆਖਿਆ|Rationale|Diagram|Figure))`;
      
      const regex = new RegExp(`${start}([\\s\\S]+?)${end}`, 'i');
      const m = b.match(regex);
      return m ? parseMultilingualNode(m[1].trim()) : null;
    };

    const optA = getOpt('A', '[A①]', 'B') || getOpt('A', 'A', 'B');
    const optB = getOpt('B', '[B②]', 'C') || getOpt('B', 'B', 'C');
    const optC = getOpt('C', '[C③]', 'D') || getOpt('C', 'C', 'D');
    const optD = getOpt('D', '[D④]', null) || getOpt('D', 'D', null);

    // 3. Extract Answer Key
    const ansMatch = b.match(/(?:Answer|ਉੱਤਰ|उत्तर|Key)[:\s]*\(?([A-D])\)?/i);
    const ans = ansMatch ? ansMatch[1].toUpperCase() : "";

    // 4. Extract Explanation
    const expMatch = b.match(/(?:Explanation|ਵਿਆਖਿਆ|व्याख्या|Rationale|Solution)[:\s]*([\s\S]+?)(?=\n?Diagram|Figure|$)/i);
    const expNodes = expMatch ? parseMultilingualNode(expMatch[1].trim()) : { en: "", pa: "", hi: "" };

    // 5. Detect Diagram/Figure references
    const hasDiagram = /diagram|figure|image|graph|map/i.test(b);
    const diagMatch = b.match(/(?:Diagram|Figure|Image)[:\s]*([\s\S]+)$/i);

    // Validation Node
    if (!qNodes.en && !qNodes.pa && !qNodes.hi) errors.push("Question text missing");
    if (!optA) errors.push("Option A missing");
    if (!optB) errors.push("Option B missing");
    if (!optC) errors.push("Option C missing");
    if (!optD) errors.push("Option D missing");
    if (!ans) errors.push("Correct answer key missing");

    results.push({
      id: `q-temp-${idx}-${Date.now()}`,
      englishQuestion: qNodes.en,
      punjabiQuestion: qNodes.pa,
      hindiQuestion: qNodes.hi,
      optionAEnglish: optA?.en || "",
      optionAPunjabi: optA?.pa || "",
      optionAHindi: optA?.hi || "",
      optionBEnglish: optB?.en || "",
      optionBPunjabi: optB?.pa || "",
      optionBHindi: optB?.hi || "",
      optionCEnglish: optC?.en || "",
      optionCPunjabi: optC?.pa || "",
      optionCHindi: optC?.hi || "",
      optionDEnglish: optD?.en || "",
      optionDPunjabi: optD?.pa || "",
      optionDHindi: optD?.hi || "",
      correctAnswer: ans,
      englishExplanation: expNodes.en,
      punjabiExplanation: expNodes.pa,
      diagram_required: hasDiagram,
      diagram_caption: diagMatch ? diagMatch[1].trim() : "",
      isValid: errors.length === 0,
      validationErrors: errors
    });
  });

  return results;
}
