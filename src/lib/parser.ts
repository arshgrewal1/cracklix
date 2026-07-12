/**
 * @fileOverview Institutional Text Sanitizer v9.0.
 * UPDATED: Building logic removed. This file now only provides basic sanitization 
 * to prepare text for the AI Ingestion Pipeline. No splitting or guessing is performed.
 */

export function preprocessText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    // Remove Page Numbering and Headers/Footers noise
    .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/\d+\s*\/\s*\d+/g, '')
    .replace(/Section\s+[A-Z]/gi, '')
    .replace(/Copyright\s+.*$/gim, '')
    // Normalize Unicode and whitespace
    .replace(/ +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Validation Regex (Allowed as per Architect's Guidelines)
 * Checks if a block contains a basic MCQ structure.
 */
export function validateMCQSchema(q: any): string[] {
  const errors: string[] = [];
  if (!q.question_en && !q.question_pa) errors.push("Statement node missing.");
  if (!q.optionA || !q.optionB || !q.optionC || !q.optionD) errors.push("Option matrix incomplete.");
  if (!q.answer) errors.push("Answer key missing.");
  return errors;
}
