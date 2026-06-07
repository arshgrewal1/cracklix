/**
 * @fileOverview Institutional High-Fidelity Explicit Parser v45.0.
 * UPDATED: Supports interleaved English/Punjabi statements and bilingual answer/explanation nodes.
 * Format:
 * Q1. English Question
 * Punjabi Question
 * (A) Option EN / Option PA
 * Answer: EN / PA
 * Explanation: English...
 * Punjabi...
 */

export interface ParsedResults {
  questions: any[];
  errors: string[];
}

export function parseBulkQuestions(rawText: string, metadata: any): ParsedResults {
  const secondaryLang = metadata.secondaryLanguage || 'punjabi';
  const text = "\n" + rawText.replace(/\r\n/g, '\n').trim() + "\n";
  
  // Split by Q1., Question 1., etc.
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

      // 1. EXTRACT BILINGUAL QUESTIONS
      // English is line 0, Punjabi/Hindi is line 1
      if (lines.length >= 2) {
        q.englishQuestion = lines[0].replace(/^(?:Q|Question)\s*\d+[\.\s]*/i, '').trim();
        q[qField] = lines[1].trim();
      }

      // 2. EXTRACT BILINGUAL OPTIONS
      const getOptionPair = (letter: string, next: string | null) => {
        const regex = next 
          ? new RegExp(`(?:\\(${letter}\\)|Option\\s*${letter})\\s*([\\s\\S]*?)(?=\\(${next}\\)|Option\\s*${next}|Correct Answer|Answer|Answer Key|Explanation|•|$)`, 'i')
          : new RegExp(`(?:\\(${letter}\\)|Option\\s*${letter})\\s*([\\s\\S]*?)(?=Correct Answer|Answer|Answer Key|Explanation|•|$)`, 'i');
        
        const match = fullText.match(regex);
        if (!match) return ["", ""];
        
        const raw = match[1].trim();
        const parts = raw.split('/').map(s => s.trim());
        return [parts[0] || "", parts[1] || parts[0] || ""];
      };

      const optSuffix = secondaryLang === 'hindi' ? 'Hindi' : 'Punjabi';
      [q.optionAEnglish, q[`optionA${optSuffix}`]] = getOptionPair('A', 'B');
      [q.optionBEnglish, q[`optionB${optSuffix}`]] = getOptionPair('B', 'C');
      [q.optionCEnglish, q[`optionC${optSuffix}`]] = getOptionPair('C', 'D');
      [q.optionDEnglish, q[`optionD${optSuffix}`]] = getOptionPair('D', null);

      // 3. CORRECT ANSWER (Supports: Answer: (B) ... / ...)
      const ansMatch = fullText.match(/(?:Correct Answer|Answer|Answer Key|Correct Option)[:\s]*\(?([A-D])\)?/i);
      if (ansMatch) q.correctAnswer = ansMatch[1].toUpperCase();

      // 4. BILINGUAL EXPLANATIONS
      // Format: 
      // Explanation: English Text
      // Punjabi Text
      const expMarkerIndex = lines.findIndex(l => /^(?:English\s+)?Explanation|Logic|Rationale/i.test(l));
      if (expMarkerIndex !== -1) {
        q.englishExplanation = lines[expMarkerIndex].replace(/^(?:English\s+)?Explanation|Logic|Rationale[:\s]*/i, '').trim();
        if (lines[expMarkerIndex + 1]) {
           q[expField] = lines[expMarkerIndex + 1].trim();
        }
      }

      // Debugging Matrix
      q.debug = {
        EN_Q: q.englishQuestion ? 'YES' : 'NO',
        SEC_Q: q[qField] ? 'YES' : 'NO',
        OPT: (q.optionAEnglish && q[`optionA${optSuffix}`]) ? 'YES' : 'NO',
        KEY: q.correctAnswer ? 'YES' : 'NO'
      };

      // Validation
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
