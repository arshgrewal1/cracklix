
/**
 * @fileOverview Institutional Smart Text Ingestion Parser v6.0.
 * Optimized for high-fidelity MCQ extraction from raw, noisy, or OCR-generated text.
 * Handles bilingual (English + Punjabi/Hindi) stacked patterns automatically.
 */

export interface ParsedResults {
  questions: any[];
  rawCount: number;
}

/**
 * Normalizes and cleans raw text from common OCR errors and metadata noise.
 */
export function cleanRawText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    // Remove page numbering and common headers
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/Section\s+[A-Z]/gi, '')
    // Remove OCR noise and bullets
    .replace(/[\|_]{2,}/g, '') 
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '')
    // Normalize punctuation
    .replace(/,{2,}/g, ',')
    .replace(/\.{3,}/g, '...')
    // Remove non-essential bullets at start of lines
    .replace(/^\s*[\-\*\+•]\s*/gm, '')
    // Trim and collapse whitespace
    .replace(/ +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Detects script types and splits bilingual blocks.
 */
function splitBilingualNode(text: string): [string, string] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return ["", ""];
  
  if (text.includes(' / ')) {
    const parts = text.split(' / ');
    return [parts[0].trim(), parts[1]?.trim() || ""];
  }

  let english = "";
  let punjabi = "";

  lines.forEach(line => {
    // Detect Punjabi characters (U+0A00 to U+0A7F)
    const hasGurmukhi = /[\u0A00-\u0A7F]/.test(line);
    if (hasGurmukhi) {
      punjabi += (punjabi ? "\n" : "") + line;
    } else {
      english += (english ? " " : "") + line;
    }
  });

  return [english.trim(), punjabi.trim()];
}

export function parseBulkQuestions(rawText: string, metadata: any): ParsedResults {
  const cleaned = cleanRawText(rawText);
  if (!cleaned) return { questions: [], rawCount: 0 };

  // Split by Question Marker (Start of line with Q1, 1., or Question)
  const blocks = ("\n" + cleaned).split(/\n(?=(?:\d+|Q\d+|Question\s*\d*)[\.\)\s\:]+)/i).filter(b => b.trim().length > 15);
  
  const results: any[] = [];

  blocks.forEach((block, index) => {
    try {
      const b = block.trim();
      
      // 1. QUESTION EXTRACTION
      const qBlockMatch = b.match(/^([\s\S]+?)(?=\n?\(?A[\.\)\s])/i);
      if (!qBlockMatch) return;
      
      const rawQ = qBlockMatch[1].replace(/^(?:\d+|Q\d+|Question\s*\d*)[\.\)\s\:]+/i, '').trim();
      const [enQ, paQ] = splitBilingualNode(rawQ);

      // 2. OPTIONS EXTRACTION (A-D)
      const extractOpt = (letter: string, next: string | null) => {
        const startPattern = `\\n?\\(?${letter}[\\.\\)\\s]+`;
        const endPattern = next 
          ? `(?=\\n?\\(?${next}[\\.\\)\\s])` 
          : `(?=\\n?(?:Answer|ਉੱਤਰ|उत्तर|Sahi Uttar|Explanation|ਵਿਆਖਿਆ|व्याख्या|Official Key|Rationale))`;
        
        const regex = new RegExp(`${startPattern}([\\s\\S]+?)${endPattern}`, 'i');
        const match = b.match(regex);
        return match ? splitBilingualNode(match[1].trim()) : ["", ""];
      };

      const [enA, paA] = extractOpt('A', 'B');
      const [enB, paB] = extractOpt('B', 'C');
      const [enC, paC] = extractOpt('C', 'D');
      const [enD, paD] = extractOpt('D', null);

      // 3. ANSWER KEY EXTRACTION
      let correctAnswer = "A";
      const ansMatch = b.match(/(?:Answer|ਉੱਤਰ|उत्तर|Sahi Uttar|Official Key|Key)[:\s]*\(?([A-D])\)?/i);
      if (ansMatch) {
        correctAnswer = ansMatch[1].toUpperCase();
      }

      // 4. EXPLANATION EXTRACTION
      const expMatch = b.match(/(?:Explanation|ਵਿਆਖਿਆ|व्याख्या|Rationale|Solution)[:\s]*([\s\S]+)$/i);
      let [enExp, paExp] = ["", ""];
      if (expMatch) {
        [enExp, paExp] = splitBilingualNode(expMatch[1].trim());
      }

      if (enQ && enA) {
        results.push({
          ...metadata,
          id: `q-node-${Date.now()}-${index}`,
          englishQuestion: enQ,
          punjabiQuestion: paQ || "",
          optionAEnglish: enA,
          optionAPunjabi: paA || "",
          optionBEnglish: enB,
          optionBPunjabi: paB || "",
          optionCEnglish: enC,
          optionCPunjabi: paC || "",
          optionDEnglish: enD,
          optionDPunjabi: paD || "",
          correctAnswer,
          englishExplanation: enExp || "",
          punjabiExplanation: paExp || "",
          status: 'UNUSED',
          usedCount: 0
        });
      }
    } catch (e) {
      console.warn(`[PARSER] Block ${index} failed:`, e);
    }
  });

  return { questions: results, rawCount: blocks.length };
}
