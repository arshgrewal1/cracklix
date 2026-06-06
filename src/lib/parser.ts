
/**
 * @fileOverview Institutional High-Fidelity Explicit Parser v41.0.
 * Strictly maps to discrete English and Punjabi fields. 
 * Language detection is removed. split("/") only used for initial extraction.
 */

export interface ParsedResults {
  questions: any[];
  errors: string[];
}

export function parseBulkQuestions(rawText: string, metadata: any): ParsedResults {
  const text = "\n" + rawText.replace(/\r\n/g, '\n').trim() + "\n";
  const blocks = text.split(/\n(?=(?:Q|Question)\s*\d+[\.\s])/i).filter(b => b.trim().length > 10);
  
  const results: any[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    try {
      const fullText = block.trim();
      const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      const q: any = { 
        ...metadata,
        id: `q-node-${Date.now()}-${index}`,
        status: metadata.status || "PUBLISHED",
        isStandalone: true,
        debug: {}
      };

      // 1. Identify Questions (Everything before (A))
      const optionAIndex = lines.findIndex(l => /^\(A\)/i.test(l));
      if (optionAIndex !== -1) {
        q.englishQuestion = lines[0].replace(/^(?:Q|Question)\s*\d+[\.\s]*/i, '').trim();
        q.punjabiQuestion = lines.slice(1, optionAIndex).join('\n').trim();
      }

      // 2. Extract Options (Explicitly split EN/PA during ingestion)
      const getOptionPair = (letter: string, next: string | null) => {
        const regex = next 
          ? new RegExp(`\\(${letter}\\)\\s*([\\s\\S]*?)(?=\\(${next}\\)|Correct Answer|Answer|Answer Key|•|$)`, 'i')
          : new RegExp(`\\(${letter}\\)\\s*([\\s\\S]*?)(?=Correct Answer|Answer|Answer Key|•|$)`, 'i');
        
        const match = fullText.match(regex);
        if (!match) return ["", ""];
        
        const raw = match[1].trim();
        const parts = raw.split('/').map(s => s.trim());
        return [parts[0] || "", parts[1] || parts[0] || ""];
      };

      [q.optionAEnglish, q.optionAPunjabi] = getOptionPair('A', 'B');
      [q.optionBEnglish, q.optionBPunjabi] = getOptionPair('B', 'C');
      [q.optionCEnglish, q.optionCPunjabi] = getOptionPair('C', 'D');
      [q.optionDEnglish, q.optionDPunjabi] = getOptionPair('D', null);

      // 3. Correct Answer
      const ansMatch = fullText.match(/(?:Correct Answer|Answer|Answer Key|Correct Option)[:\s]*\(?([A-D])\)?/i);
      if (ansMatch) q.correctAnswer = ansMatch[1].toUpperCase();

      // 4. Explanations
      const enMarkerRegex = /(?:English\s+(?:Explanation|Logic|Rationale)[:\s]*)/i;
      const paMarkerRegex = /(?:(?:ਪੰਜਾਬੀ ਵਿਆਖਿਆ|Punjabi\s+(?:Explanation|Logic|Rationale))[:\s]*)/i;

      const enMatch = fullText.match(enMarkerRegex);
      const paMatch = fullText.match(paMarkerRegex);

      if (enMatch && paMatch) {
        const enStartIndex = fullText.indexOf(enMatch[0]) + enMatch[0].length;
        const paStartIndex = fullText.indexOf(paMatch[0]);
        q.englishExplanation = fullText.substring(enStartIndex, paStartIndex).trim();
        q.punjabiExplanation = fullText.substring(paStartIndex + paMatch[0].length).trim();
      }

      // Debugging Matrix
      q.debug = {
        EN_Q: q.englishQuestion ? 'YES' : 'NO',
        PA_Q: q.punjabiQuestion ? 'YES' : 'NO',
        OPT: (q.optionAEnglish && q.optionAPunjabi) ? 'YES' : 'NO',
        KEY: q.correctAnswer ? 'YES' : 'NO',
        LOGIC: (q.englishExplanation && q.punjabiExplanation) ? 'YES' : 'NO'
      };

      const missing = [];
      if (!q.englishQuestion) missing.push("English Question");
      if (!q.punjabiQuestion) missing.push("Punjabi Question");
      if (!q.optionAEnglish) missing.push("Option A English");
      if (!q.optionAPunjabi) missing.push("Option A Punjabi");
      if (!q.optionBEnglish) missing.push("Option B English");
      if (!q.optionBPunjabi) missing.push("Option B Punjabi");
      if (!q.optionCEnglish) missing.push("Option C English");
      if (!q.optionCPunjabi) missing.push("Option C Punjabi");
      if (!q.optionDEnglish) missing.push("Option D English");
      if (!q.optionDPunjabi) missing.push("Option D Punjabi");
      if (!q.correctAnswer) missing.push("Correct Answer");
      if (!q.englishExplanation) missing.push("English Explanation");
      if (!q.punjabiExplanation) missing.push("Punjabi Explanation");

      if (missing.length === 0) {
        results.push(q);
      } else {
        errors.push(`Block ${index + 1} Reject: Missing ${missing.join(', ')}`);
      }
    } catch (err: any) {
      errors.push(`Block ${index + 1} Parsing Error: ${err.message}`);
    }
  });

  return { questions: results, errors };
}
