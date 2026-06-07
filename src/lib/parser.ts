
/**
 * @fileOverview Institutional High-Fidelity Explicit Parser v50.1.
 * UPDATED: Robust multi-line extraction for bilingual stacked patterns.
 * 
 * Format Supported:
 * Q15. English Question
 * Hindi/Punjabi Question
 * (A) Option EN
 * Hindi/Punjabi Option
 * Answer: C. Text
 * Explanation (English): Text...
 * व्याख्या/ਵਿਆਖਿਆ: Text...
 */

export interface ParsedResults {
  questions: any[];
  errors: string[];
}

export function parseBulkQuestions(rawText: string, metadata: any): ParsedResults {
  const secondaryLang = metadata.secondaryLanguage || 'punjabi';
  const cleanText = rawText.replace(/\*\*/g, '').replace(/\r\n/g, '\n').trim();
  const text = "\n" + cleanText + "\n";
  
  const blocks = text.split(/\n(?=Q\s*\d+[\.\s]|Question\s*\d*[\.\s\:]|Question\s*\(English\s*Box\)\:)/i).filter(b => b.trim().length > 10);
  
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

      const qField = secondaryLang === 'hindi' ? 'hindiQuestion' : 'punjabiQuestion';
      const expField = secondaryLang === 'hindi' ? 'hindiExplanation' : 'punjabiExplanation';
      const optSuffix = secondaryLang === 'hindi' ? 'Hindi' : 'Punjabi';

      q.englishQuestion = lines[0].replace(/^(?:Q|Question)\s*\d+[\.\s]*/i, '').trim();
      
      if (lines[1] && !lines[1].match(/^[A-D][\.\)\s]|\([A-D]\)/i)) {
        q[qField] = lines[1].trim();
      }

      const getOptionBlock = (letter: string, next: string | null) => {
        const pattern = `\\n(?:\\(${letter}\\)|${letter}[\\.\\)])\\s*([\\s\\S]*?)`;
        const lookahead = next 
          ? `(?=\\n(?:\\(${next}\\)|${next}[\\.\\)])|\\nAnswer|\\nਉੱਤਰ|\\nउत्तर|\\nExplanation|\\nਵਿਆਖਿਆ|\\nव्याख्या|$)`
          : `(?=\\nAnswer|\\nਉੱਤਰ|\\nउत्तर|\\nExplanation|\\nਵਿਆਖਿਆ|\\nव्याख्या|$)`;
        
        const regex = new RegExp(pattern + lookahead, 'i');
        const match = ("\n" + fullText).match(regex);
        if (!match) return ["", ""];
        
        const content = match[1].trim();
        const contentLines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        if (content.includes('/')) {
           const parts = content.split('/').map(s => s.trim());
           return [parts[0] || "", parts[1] || parts[0] || ""];
        }
        
        if (contentLines.length >= 2) {
           return [contentLines[0], contentLines[1]];
        }
        
        return [contentLines[0] || "", contentLines[0] || ""];
      };

      [q.optionAEnglish, q[`optionA${optSuffix}`]] = getOptionBlock('A', 'B');
      [q.optionBEnglish, q[`optionB${optSuffix}`]] = getOptionBlock('B', 'C');
      [q.optionCEnglish, q[`optionC${optSuffix}`]] = getOptionBlock('C', 'D');
      [q.optionDEnglish, q[`optionD${optSuffix}`]] = getOptionBlock('D', null);

      const ansMatch = fullText.match(/(?:Correct Answer|Answer|Answer Key|ਉੱਤਰ|उत्तर|Sahi Uttar)[:\s]*\(?([A-D])\)?/i);
      if (ansMatch) q.correctAnswer = ansMatch[1].toUpperCase();

      const enExpMatch = fullText.match(/(?:Explanation\s*\(English\)|Explanation|Rationale)[:\s]*([\s\S]*?)(?=\n(?:ਵਿਆਖਿਆ|व्याख्या|Punjabi|Hindi|ਉੱਤਰ|उत्तर)|$)/i);
      const secExpMatch = fullText.match(/(?:ਵਿਆਖਿਆ|व्याख्या|ਵਿਆਖਿਆ\s*\(Punjabi\)|Explanation\s*\(Punjabi\)|Explanation\s*\(Hindi\)|व्याख्या\s*\(Hindi\))[:\s]*([\s\S]*?)(?=$)/i);

      if (enExpMatch) q.englishExplanation = enExpMatch[1].trim();
      if (secExpMatch) q[expField] = secExpMatch[1].trim();

      if (!q.englishExplanation && !q[expField]) {
        const expMarkerIndex = lines.findIndex(l => /^(?:English\s+)?Explanation|Logic|Rationale/i.test(l));
        if (expMarkerIndex !== -1) {
          q.englishExplanation = lines[expMarkerIndex].replace(/^(?:English\s+)?Explanation|Logic|Rationale[:\s]*/i, '').trim();
          if (lines[expMarkerIndex + 1] && !lines[expMarkerIndex + 1].match(/^(?:ਵਿਆਖਿਆ|व्याख्या|ਉੱਤਰ|उत्तर|Answer)/i)) {
             q[expField] = lines[expMarkerIndex + 1].trim();
          }
        }
      }

      q.debug = {
        EN_Q: q.englishQuestion ? 'YES' : 'NO',
        SEC_Q: q[qField] ? 'YES' : 'NO',
        OPT: (q.optionAEnglish && q[`optionA${optSuffix}`]) ? 'YES' : 'NO',
        KEY: q.correctAnswer ? 'YES' : 'NO',
        EN_EXP: q.englishExplanation ? 'YES' : 'NO',
        SEC_EXP: q[expField] ? 'YES' : 'NO'
      };

      if (q.englishQuestion && q.optionAEnglish && q.correctAnswer) {
        results.push(q);
      } else {
        errors.push(`Block ${index + 1} incomplete structure.`);
      }
    } catch (err: any) {
      errors.push(`Block ${index + 1} Error: ${err.message}`);
    }
  });

  return { questions: results, errors };
}
