
import { Firestore, doc, setDoc, serverTimestamp, collection, getDocs, writeBatch } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Node v8.2.
 * UPDATED: Explicitly seeded all Teaching Cadre posts and technical hubs.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Hierarchical Registry Sync...');

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
      description: "PSTET, CTET, Master Cadre, ETT & Lecturer registries.",
      highlight: "EDUCATIONAL",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      displayOrder: 2
    },
    {
      id: "punjab-technical",
      title: "Punjab Technical Exams",
      description: "PSPCL, PSTCL, Junior Engineer & Technical Assistant nodes.",
      highlight: "POWER & IT",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      displayOrder: 3
    },
    {
      id: "banking",
      title: "Banking Exams",
      description: "IBPS, PO, Clerk, SO, SBI, RBI & NABARD career prep.",
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

  // 2. HUBS (Boards)
  const psssbLogo = "https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg";
  const psebLogo = "https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png";
  const pstetLogo = "https://pstet.pseb.ac.in/img/main-logo-2.png";
  const ctetLogo = "https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png";
  const pspclLogo = "https://pspcl.in/assets/images/logo.png";
  const pstclLogo = "https://pstcl.org/images/logo.png";
  const psbteLogo = "https://www.punjabteched.com/images/Clogo-blue.gif";
  
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', region: 'Punjab', category: 'STATE_BOARD', categoryId: 'punjab-govt', iconUrl: psssbLogo },
    { id: 'punjab-police', abbreviation: 'POLICE', name: 'Punjab Police Recruitment Board', region: 'Punjab', category: 'DEFENCE_BOARD', categoryId: 'punjab-govt', iconUrl: "https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png" },
    { id: 'education-board', abbreviation: 'EDUCATION', name: 'Education Recruitment Hub', region: 'Punjab', category: 'TEACHING_BOARD', categoryId: 'punjab-teaching', iconUrl: psebLogo },
    { id: 'pstet-hub', abbreviation: 'PSTET', name: 'PSTET Hub', region: 'Punjab', category: 'TEACHING_BOARD', categoryId: 'punjab-teaching', iconUrl: pstetLogo },
    { id: 'ctet-hub', abbreviation: 'CTET', name: 'CTET Hub', region: 'Punjab', category: 'TEACHING_BOARD', categoryId: 'punjab-teaching', iconUrl: ctetLogo },
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'PSPCL Hub', region: 'Punjab', category: 'TECHNICAL', categoryId: 'punjab-technical', iconUrl: pspclLogo },
    { id: 'pstcl', abbreviation: 'PSTCL', name: 'PSTCL Hub', region: 'Punjab', category: 'TECHNICAL', categoryId: 'punjab-technical', iconUrl: pstclLogo },
    { id: 'psbte', abbreviation: 'PSBTE', name: 'Punjab Technical Board', region: 'Punjab', category: 'TECHNICAL', categoryId: 'punjab-technical', iconUrl: psbteLogo }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. EXAMS (Verticals)
  const mandatoryExams = [
    // PSTET Hub
    { id: 'pstet-p1', name: 'PSTET Paper 1', boardId: 'pstet-hub', categoryId: 'punjab-teaching' },
    { id: 'pstet-p2', name: 'PSTET Paper 2', boardId: 'pstet-hub', categoryId: 'punjab-teaching' },
    
    // CTET Hub
    { id: 'ctet-p1', name: 'CTET Paper 1', boardId: 'ctet-hub', categoryId: 'punjab-teaching' },
    { id: 'ctet-p2', name: 'CTET Paper 2', boardId: 'ctet-hub', categoryId: 'punjab-teaching' },
    
    // Education Recruitment Hub
    { id: 'ett-cadre', name: 'ETT Cadre', boardId: 'education-board', categoryId: 'punjab-teaching' },
    { id: 'master-cadre', name: 'Master Cadre', boardId: 'education-board', categoryId: 'punjab-teaching' },
    { id: 'lecturer-cadre', name: 'Lecturer Cadre', boardId: 'education-board', categoryId: 'punjab-teaching' },
    { id: 'principal', name: 'Principal', boardId: 'education-board', categoryId: 'punjab-teaching' },
    { id: 'assistant-professor', name: 'Assistant Professor', boardId: 'education-board', categoryId: 'punjab-teaching' },
    { id: 'head-teacher', name: 'Head Teacher', boardId: 'education-board', categoryId: 'punjab-teaching' },
    { id: 'computer-teacher', name: 'Computer Teacher', boardId: 'education-board', categoryId: 'punjab-teaching' },
    { id: 'physical-edu-teacher', name: 'Physical Education Teacher', boardId: 'education-board', categoryId: 'punjab-teaching' },
    { id: 'teaching-entrance', name: 'ETT/B.Ed Entrance Exam', boardId: 'education-board', categoryId: 'punjab-teaching' },
    
    // Govt
    { id: 'constable', name: 'Police Constable', boardId: 'punjab-police', categoryId: 'punjab-govt' },
    { id: 'sub-inspector', name: 'Police Sub-Inspector', boardId: 'punjab-police', categoryId: 'punjab-govt' },
    { id: 'patwari', name: 'Revenue Patwari', boardId: 'psssb', categoryId: 'punjab-govt' },
    
    // Technical
    { id: 'pspcl-alm', name: 'PSPCL ALM', boardId: 'pspcl', categoryId: 'punjab-technical' },
    { id: 'pstcl-alm', name: 'PSTCL ALM', boardId: 'pstcl', categoryId: 'punjab-technical' },
    { id: 'psbte-je-elec', name: 'JE Electrical', boardId: 'psbte', categoryId: 'punjab-technical' },
    { id: 'psbte-je-civil', name: 'JE Civil', boardId: 'psbte', categoryId: 'punjab-technical' },
    { id: 'psbte-je-mech', name: 'JE Mechanical', boardId: 'psbte', categoryId: 'punjab-technical' },
  ];

  for (const ex of mandatoryExams) {
    await setDoc(doc(db, 'exams', ex.id), { ...ex, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Hierarchical Registry Deduplicated and Synchronized.');
}
