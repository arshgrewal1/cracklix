
import { Firestore, doc, setDoc, serverTimestamp, collection, deleteDoc } from 'firebase/firestore';

/**
 * @fileOverview Institutional Punjab-Centric Seeding Node v55.0.
 * UPDATED: Exhaustive recruitment tree implementation with aggressive duplicate purge.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Comprehensive Punjab Registry Sync...');

  // 0. REGISTRY SANITIZATION: Aggressive purge of legacy or duplicate IDs
  const legacyIds = [
    'pstet', 'ctet', 'exam-psssb', 'exam-ppsc', 'exam-police',
    'pstet-p1', 'pstet-p2', 'ctet-p1', 'ctet-p2' // Purge old flat IDs
  ];

  for (const id of legacyIds) {
     try {
        await deleteDoc(doc(db, 'boards', id));
        await deleteDoc(doc(db, 'exams', id));
        console.log(`[CLEANUP] Purged legacy node: ${id}`);
     } catch (e) { }
  }

  // 1. STRATEGIC CATEGORIES
  const categories = [
    {
      id: "punjab-govt",
      title: "Punjab Government Exams",
      description: "Police, PSSSB, PPSC and major state board recruitments.",
      highlight: "STATE LEVEL",
      color: "text-primary",
      bgColor: "bg-orange-50",
      iconUrl: "https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png",
      displayOrder: 1
    },
    {
      id: "punjab-teaching",
      title: "Punjab Teaching Exams",
      description: "PSTET, CTET, Master Cadre, ETT & Lecturer recruitment nodes.",
      highlight: "EDUCATIONAL",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconUrl: "https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png",
      displayOrder: 2
    },
    {
      id: "punjab-technical",
      title: "Punjab Technical Exams",
      description: "PSPCL, PSTCL, ALM, and Technical Board JE recruitments.",
      highlight: "POWER & TECH",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      iconUrl: "https://affiliation.pbteched.net/assets/images/banner-5.png",
      displayOrder: 3
    },
    {
      id: "punjab-banking",
      title: "Punjab Banking & Cooperative",
      description: "State Cooperative, Agricultural Dev Bank & PGB nodes.",
      highlight: "FINANCIAL",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      displayOrder: 4
    },
    {
      id: "punjab-general",
      title: "Punjab General Recruitment",
      description: "Clerk, DEO, Patwari, Excise and Food Supply verticals.",
      highlight: "GENERAL",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      displayOrder: 5
    }
  ];

  for (const cat of categories) {
    await setDoc(doc(db, 'categories', cat.id), { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. HUBS (Boards) - Canonical Hubs
  const boards = [
    { id: 'punjab-police', abbreviation: 'POLICE', name: 'Punjab Police Recruitment Board', categoryId: 'punjab-govt', iconUrl: 'https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png', displayOrder: 1 },
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', categoryId: 'punjab-govt', iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg', displayOrder: 2 },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', categoryId: 'punjab-govt', iconUrl: 'https://cdn.s3waas.gov.in/s38cb22bdd0b7ba1ab13d742e22eed8da2/uploads/2019/05/2019052938.jpg', displayOrder: 3 },
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'Punjab State Power Corporation Limited', categoryId: 'punjab-technical', iconUrl: 'https://www.pspcl.in/assets/images/logo.png', displayOrder: 4 },
    { id: 'pstcl', abbreviation: 'PSTCL', name: 'Punjab State Transmission Corporation Limited', categoryId: 'punjab-technical', iconUrl: 'https://pstcl.org/images/logo.png', displayOrder: 5 },
    { id: 'pstet-hub', abbreviation: 'PSTET', name: 'PSTET Preparation Hub', categoryId: 'punjab-teaching', iconUrl: 'https://pstet.pseb.ac.in/img/main-logo-2.png', displayOrder: 6 },
    { id: 'ctet-hub', abbreviation: 'CTET', name: 'CTET Preparation Hub', categoryId: 'punjab-teaching', iconUrl: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png', displayOrder: 7 },
    { id: 'teaching-hub', abbreviation: 'CADRE', name: 'Teaching Cadre Board', categoryId: 'punjab-teaching', displayOrder: 8 },
    { id: 'banking-hub', abbreviation: 'BANK', name: 'Cooperative Banking Hub', categoryId: 'punjab-banking', displayOrder: 9 },
    { id: 'high-court', abbreviation: 'COURT', name: 'High Court Recruitment Hub', categoryId: 'punjab-govt', displayOrder: 10 }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. EXAMS (Specific Verticals)
  const exams = [
    // Govt
    { id: 'p-police-constable', name: 'Police Constable', boardId: 'punjab-police', categoryId: 'punjab-govt', displayOrder: 1 },
    { id: 'p-police-si', name: 'Police Sub-Inspector', boardId: 'punjab-police', categoryId: 'punjab-govt', displayOrder: 2 },
    { id: 'p-police-hc', name: 'Head Constable / ASI', boardId: 'punjab-police', categoryId: 'punjab-govt', iconUrl: 'https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png', displayOrder: 3 },
    { id: 'ppsc-pcs', name: 'PCS Executive', boardId: 'ppsc', categoryId: 'punjab-govt', displayOrder: 4 },
    { id: 'sssc-clerk', name: 'High Court Clerk', boardId: 'high-court', categoryId: 'punjab-govt', displayOrder: 5 },
    
    // Teaching
    { id: 'pstet-paper-1', name: 'PSTET Paper 1', boardId: 'pstet-hub', categoryId: 'punjab-teaching', displayOrder: 10 },
    { id: 'pstet-paper-2', name: 'PSTET Paper 2', boardId: 'pstet-hub', categoryId: 'punjab-teaching', displayOrder: 11 },
    { id: 'ctet-paper-1', name: 'CTET Paper 1', boardId: 'ctet-hub', categoryId: 'punjab-teaching', displayOrder: 12 },
    { id: 'ctet-paper-2', name: 'CTET Paper 2', boardId: 'ctet-hub', categoryId: 'punjab-teaching', displayOrder: 13 },
    { id: 'master-cadre-pb', name: 'Master Cadre', boardId: 'teaching-hub', categoryId: 'punjab-teaching', displayOrder: 14 },
    { id: 'ett-cadre-pb', name: 'ETT Cadre', boardId: 'teaching-hub', categoryId: 'punjab-teaching', displayOrder: 15 },
    
    // Technical
    { id: 'pspcl-alm-rect', name: 'PSPCL ALM / Lineman', boardId: 'pspcl', categoryId: 'punjab-technical', iconUrl: 'https://www.pspcl.in/assets/images/logo.png', displayOrder: 20 },
    { id: 'pstcl-alm-rect', name: 'PSTCL ALM / Lineman', boardId: 'pstcl', categoryId: 'punjab-technical', iconUrl: 'https://www.pspcl.in/assets/images/logo.png', displayOrder: 21 },
    { id: 'je-elec', name: 'JE Electrical', boardId: 'pspcl', categoryId: 'punjab-technical', displayOrder: 22 },
    { id: 'je-civil', name: 'JE Civil', boardId: 'psssb', categoryId: 'punjab-technical', displayOrder: 23 },
    
    // General
    { id: 'psssb-patwari', name: 'Revenue Patwari', boardId: 'psssb', categoryId: 'punjab-general', displayOrder: 30 },
    { id: 'psssb-clerk', name: 'Clerk / DEO', boardId: 'psssb', categoryId: 'punjab-general', displayOrder: 31 },
    { id: 'psssb-excise', name: 'Excise Inspector', boardId: 'psssb', categoryId: 'punjab-general', displayOrder: 32 },
    
    // Banking
    { id: 'coop-bank-clerk', name: 'Cooperative Bank Clerk', boardId: 'banking-hub', categoryId: 'punjab-banking', displayOrder: 40 },
    { id: 'cadb-officer', name: 'CADB Manager', boardId: 'banking-hub', categoryId: 'punjab-banking', displayOrder: 41 }
  ];

  for (const ex of exams) {
    await setDoc(doc(db, 'exams', ex.id), { ...ex, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 4. SUBJECTS (Canonical List)
  const subjects = [
    { id: 'punjab-gk', name: 'PUNJAB GENERAL KNOWLEDGE', aliases: ['GK', 'Static GK'] },
    { id: 'reasoning', name: 'MENTAL ABILITY & REASONING', aliases: ['Logic'] },
    { id: 'quant', name: 'QUANTITATIVE APTITUDE', aliases: ['Maths'] },
    { id: 'punjabi-lang', name: 'PUNJABI LANGUAGE', aliases: ['Gurmukhi'] },
    { id: 'english-lang', name: 'ENGLISH LANGUAGE', aliases: ['Grammar'] },
    { id: 'ict', name: 'INFORMATION TECHNOLOGY', aliases: ['Computer'] },
    { id: 'polity', name: 'INDIAN POLITY', aliases: ['Constitution'] },
    { id: 'finance-acc', name: 'FINANCIAL ACCOUNTING', aliases: ['Accounts'] },
    { id: 'gen-science', name: 'GENERAL SCIENCE', aliases: ['Physics', 'Bio'] },
    { id: 'hindi-lang', name: 'HINDI LANGUAGE', aliases: ['Hindi'] }
  ];

  for (const s of subjects) {
    await setDoc(doc(db, 'subjects', s.id), { ...s, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Full Punjab Registry Synchronized Successfully.');
}
