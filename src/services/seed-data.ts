
import { Firestore, doc, setDoc, collection } from 'firebase/firestore';

export async function seedInitialData(db: Firestore) {
  const boards = [
    { id: 'psssb', name: 'Punjab Subordinate Services Selection Board', abbreviation: 'PSSSB', description: 'Group C & B recruitment board.' },
    { id: 'ppsc', name: 'Punjab Public Service Commission', abbreviation: 'PPSC', description: 'Class A & B Gazetted services recruitment.' },
    { id: 'punjab-police', name: 'Punjab Police Recruitment Board', abbreviation: 'Punjab Police', description: 'Police cadre recruitment.' },
    { id: 'pstet-edu', name: 'Punjab Education Board', abbreviation: 'PSTET', description: 'Teacher eligibility and master cadre recruitment.' }
  ];

  for (const board of boards) {
    await setDoc(doc(db, 'boards', board.id), board);
  }

  const exams = [
    { id: 'revenue-patwari', boardId: 'psssb', name: 'Revenue Patwari', category: 'Revenue', description: 'Recruitment for revenue department.', totalMocks: 45, activeQuestions: 1200 },
    { id: 'constable-2026', boardId: 'punjab-police', name: 'Constable (District/Armed)', category: 'Police', description: 'District and Armed cadre recruitment.', totalMocks: 50, activeQuestions: 3000 },
    { id: 'pcs-prelims', boardId: 'ppsc', name: 'Civil Services Prelims', category: 'Executive', description: 'Higher civil services exams.', totalMocks: 20, activeQuestions: 5000 }
  ];

  for (const exam of exams) {
    await setDoc(doc(db, 'exams', exam.id), exam);
  }

  const subjects = [
    { id: 'punjab-gk', name: 'Punjab GK', description: 'History, Geography, and Culture of Punjab.' },
    { id: 'reasoning', name: 'Reasoning', description: 'Mental ability and logical reasoning.' },
    { id: 'quant', name: 'Quantitative Aptitude', description: 'Mathematical ability.' }
  ];

  for (const subject of subjects) {
    await setDoc(doc(db, 'subjects', subject.id), subject);
  }

  console.log('Seed data successfully populated!');
}
