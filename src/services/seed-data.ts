
import { Firestore, doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Node v15.0.
 * UPDATED: Explicitly creating the 3-hub hierarchy for Teaching.
 * FIXED: Strictly assigned exams to hubs (PSTET, CTET, Education Recruitment).
 */

export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Persistent Registry Sync...');

  // 1. CORE CATEGORIES
  const categories = [
    {
      id: "punjab-govt",
      title: "Punjab Government Exams",
      description: "Police, PSSSB, PPSC, Revenue & State Departments.",
      highlight: "STATE LEVEL",
      color: "text-primary",
      bgColor: "bg-orange-50",
      displayOrder: 1
    },
    {
      id: "punjab-teaching",
      title: "Punjab Teaching Exams",
      description: "PSTET, CTET, Master Cadre, ETT & Lecturer hubs.",
      highlight: "EDUCATIONAL",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      displayOrder: 2
    },
    {
      id: "punjab-technical",
      title: "Punjab Technical Exams",
      description: "PSPCL, PSTCL, Technical Board JE & Assistant nodes.",
      highlight: "POWER & IT",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      displayOrder: 3
    },
    {
      id: "banking",
      title: "Banking Exams",
      description: "IBPS, PO, Clerk, SBI, RBI & NABARD career prep.",
      highlight: "FINANCIAL",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      displayOrder: 4
    },
    {
      id: "central-govt",
      title: "Central Government Exams",
      description: "SSC, Railways, Indian Army, Air Force & Navy Hubs.",
      highlight: "NATIONAL",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      displayOrder: 5
    }
  ];

  for (const cat of categories) {
    await setDoc(doc(db, 'categories', cat.id), { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. HUBS (Boards) - Persistent Nodes
  const boards = [
    // Govt Hubs
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', region: 'Punjab', categoryId: 'punjab-govt' },
    { id: 'punjab-police', abbreviation: 'POLICE', name: 'Punjab Police Recruitment Board', region: 'Punjab', categoryId: 'punjab-govt' },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', region: 'Punjab', categoryId: 'punjab-govt' },
    
    // Teaching Hubs (STRICT HIERARCHY)
    { id: 'pstet', abbreviation: 'PSTET', name: 'PSTET Hub', region: 'Punjab', categoryId: 'punjab-teaching' },
    { id: 'ctet', abbreviation: 'CTET', name: 'CTET Hub', region: 'National', categoryId: 'punjab-teaching' },
    { id: 'education-recruitment', abbreviation: 'EDUCATION', name: 'Education Recruitment Hub', region: 'Punjab', categoryId: 'punjab-teaching' },
    
    // Technical Hubs
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'PSPCL Hub', region: 'Punjab', categoryId: 'punjab-technical' },
    { id: 'pstcl', abbreviation: 'PSTCL', name: 'PSTCL Hub', region: 'Punjab', categoryId: 'punjab-technical' },
    { id: 'psbte', abbreviation: 'PSBTE', name: 'Punjab Technical Board', region: 'Punjab', categoryId: 'punjab-technical' }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. EXAMS (Verticals) - Assigned to Persistent Hubs
  const mandatoryExams = [
    // PSTET Hub
    { id: 'pstet-p1', name: 'PSTET Paper 1', boardId: 'pstet', categoryId: 'punjab-teaching' },
    { id: 'pstet-p2', name: 'PSTET Paper 2', boardId: 'pstet', categoryId: 'punjab-teaching' },
    
    // CTET Hub
    { id: 'ctet-p1', name: 'CTET Paper 1', boardId: 'ctet', categoryId: 'punjab-teaching' },
    { id: 'ctet-p2', name: 'CTET Paper 2', boardId: 'ctet', categoryId: 'punjab-teaching' },
    
    // Education Recruitment Hub
    { id: 'ett-cadre', name: 'ETT Cadre', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'master-cadre', name: 'Master Cadre', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'lecturer-cadre', name: 'Lecturer Cadre', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'principal', name: 'Principal', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'assistant-professor', name: 'Assistant Professor', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'head-teacher', name: 'Head Teacher', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'computer-teacher', name: 'Computer Teacher', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'physical-edu-teacher', name: 'Physical Education Teacher', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    
    // Technical Hubs
    { id: 'pspcl-alm', name: 'ALM', boardId: 'pspcl', categoryId: 'punjab-technical' },
    { id: 'pspcl-assa', name: 'ASSA', boardId: 'pspcl', categoryId: 'punjab-technical' },
    { id: 'pstcl-alm', name: 'ALM', boardId: 'pstcl', categoryId: 'punjab-technical' },
    { id: 'psbte-je-elec', name: 'JE Electrical', boardId: 'psbte', categoryId: 'punjab-technical' },
    { id: 'psbte-je-civil', name: 'JE Civil', boardId: 'psbte', categoryId: 'punjab-technical' },
    { id: 'psbte-je-mech', name: 'JE Mechanical', boardId: 'psbte', categoryId: 'punjab-technical' },
    
    // Govt Hubs
    { id: 'constable', name: 'Police Constable', boardId: 'punjab-police', categoryId: 'punjab-govt' },
    { id: 'sub-inspector', name: 'Police Sub-Inspector', boardId: 'punjab-police', categoryId: 'punjab-govt' },
    { id: 'patwari', name: 'Revenue Patwari', boardId: 'psssb', categoryId: 'punjab-govt' },
    { id: 'excise-inspector', name: 'Excise Inspector', boardId: 'psssb', categoryId: 'punjab-govt' },
  ];

  for (const ex of mandatoryExams) {
    await setDoc(doc(db, 'exams', ex.id), { ...ex, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Persistent Hubs and Verticals Synchronized.');
}
