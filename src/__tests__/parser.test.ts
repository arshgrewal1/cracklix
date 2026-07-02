import { parseBulkQuestions } from '@/lib/parser';

describe('parseBulkQuestions', () => {
  const defaultMeta = {
    boardId: 'psssb',
    examIds: ['psssb-patwari'],
    subjectId: 'punjabi',
    difficulty: 'Medium',
    secondaryLanguage: 'punjabi',
  };

  it('parses a single complete question block', () => {
    const text = `Q1. What is the capital of Punjab?
(A) Chandigarh
(B) Ludhiana
(C) Amritsar
(D) Patiala
Answer: A`;

    const result = parseBulkQuestions(text, defaultMeta);
    expect(result.questions).toHaveLength(1);
    expect(result.errors).toHaveLength(0);

    const q = result.questions[0];
    expect(q.englishQuestion).toBe('What is the capital of Punjab?');
    expect(q.optionAEnglish).toBe('Chandigarh');
    expect(q.optionBEnglish).toBe('Ludhiana');
    expect(q.optionCEnglish).toBe('Amritsar');
    expect(q.optionDEnglish).toBe('Patiala');
    expect(q.correctAnswer).toBe('A');
  });

  it('parses multiple question blocks', () => {
    const text = `Q1. Question one?
(A) A1
(B) B1
(C) C1
(D) D1
Answer: B

Q2. Question two?
(A) A2
(B) B2
(C) C2
(D) D2
Answer: C`;

    const result = parseBulkQuestions(text, defaultMeta);
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0].correctAnswer).toBe('B');
    expect(result.questions[1].correctAnswer).toBe('C');
  });

  it('parses explanation text', () => {
    const text = `Q1. What is 2+2?
(A) 3
(B) 4
(C) 5
(D) 6
Answer: B
Explanation: Basic arithmetic, 2+2 equals 4.`;

    const result = parseBulkQuestions(text, defaultMeta);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].englishExplanation).toContain('2+2 equals 4');
  });

  it('assigns metadata fields to parsed questions', () => {
    const text = `Q1. Test question?
(A) A
(B) B
(C) C
(D) D
Answer: A`;

    const result = parseBulkQuestions(text, {
      ...defaultMeta,
      status: 'DRAFT',
    });
    expect(result.questions[0].boardId).toBe('psssb');
    expect(result.questions[0].status).toBe('DRAFT');
    expect(result.questions[0].isStandalone).toBe(true);
  });

  it('generates unique IDs for each question', () => {
    const text = `Q1. First?
(A) A
(B) B
(C) C
(D) D
Answer: A

Q2. Second?
(A) A
(B) B
(C) C
(D) D
Answer: B`;

    const result = parseBulkQuestions(text, defaultMeta);
    const ids = result.questions.map((q: any) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('reports errors for incomplete blocks', () => {
    const text = `Q1. Incomplete question without options`;

    const result = parseBulkQuestions(text, defaultMeta);
    expect(result.questions).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('handles empty input', () => {
    const result = parseBulkQuestions('', defaultMeta);
    expect(result.questions).toHaveLength(0);
  });

  it('uses hindi field names when secondaryLanguage is hindi', () => {
    const text = `Q1. English question?
Hindi question?
(A) Opt A English
Hindi A
(B) Opt B English
Hindi B
(C) Opt C English
Hindi C
(D) Opt D English
Hindi D
Answer: A
Explanation (English): English explanation
व्याख्या: Hindi explanation`;

    const result = parseBulkQuestions(text, {
      ...defaultMeta,
      secondaryLanguage: 'hindi',
    });

    expect(result.questions).toHaveLength(1);
    const q = result.questions[0];
    expect(q.hindiQuestion).toBeDefined();
    expect(q.optionAHindi).toBeDefined();
  });

  it('strips markdown bold markers from text', () => {
    const text = `Q1. **What is Punjab's capital?**
(A) **Chandigarh**
(B) **Ludhiana**
(C) **Amritsar**
(D) **Patiala**
Answer: A`;

    const result = parseBulkQuestions(text, defaultMeta);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].englishQuestion).not.toContain('**');
  });

  it('handles options with slash separator for bilingual content', () => {
    const text = `Q1. Capital of Punjab?
(A) Chandigarh / ਚੰਡੀਗੜ੍ਹ
(B) Ludhiana / ਲੁਧਿਆਣਾ
(C) Amritsar / ਅੰਮ੍ਰਿਤਸਰ
(D) Patiala / ਪਟਿਆਲਾ
Answer: A`;

    const result = parseBulkQuestions(text, defaultMeta);
    expect(result.questions).toHaveLength(1);
    const q = result.questions[0];
    expect(q.optionAEnglish).toBe('Chandigarh');
    expect(q.optionAPunjabi).toBe('ਚੰਡੀਗੜ੍ਹ');
  });

  it('populates debug info on parsed questions', () => {
    const text = `Q1. Test?
(A) A
(B) B
(C) C
(D) D
Answer: A`;

    const result = parseBulkQuestions(text, defaultMeta);
    const q = result.questions[0];
    expect(q.debug).toBeDefined();
    expect(q.debug.EN_Q).toBe('YES');
    expect(q.debug.KEY).toBe('YES');
  });

  it('accepts "Question" prefix style', () => {
    const text = `Question 1. Who is known as Sher-e-Punjab?
(A) Bhagat Singh
(B) Maharaja Ranjit Singh
(C) Udham Singh
(D) Lala Lajpat Rai
Answer: B`;

    const result = parseBulkQuestions(text, defaultMeta);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].correctAnswer).toBe('B');
  });

  it('handles answer with various formats (Answer Key, Correct Answer)', () => {
    const text = `Q1. Test question?
(A) A
(B) B
(C) C
(D) D
Correct Answer: D`;

    const result = parseBulkQuestions(text, defaultMeta);
    expect(result.questions[0].correctAnswer).toBe('D');
  });
});
