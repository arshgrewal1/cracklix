
import { Firestore, doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Node v37.0.
 * RECOVERED & LOCKED: Verified official URLs for PSSSB, Police, PSPCL, PPSC, CTET, and PSTET Hubs.
 * UPDATED: Explicitly locked the CTET Paper 2 vertical with its specific official logo.
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
      iconUrl: "https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png",
      displayOrder: 1
    },
    {
      id: "punjab-teaching",
      title: "Punjab Teaching Exams",
      description: "PSTET, CTET, Master Cadre, ETT & Lecturer hubs.",
      highlight: "EDUCATIONAL",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconUrl: "https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png",
      displayOrder: 2
    },
    {
      id: "punjab-technical",
      title: "Punjab Technical Exams",
      description: "PSPCL, PSTCL, Technical Board JE & Assistant nodes.",
      highlight: "POWER & IT",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      iconUrl: "https://affiliation.pbteched.net/assets/images/banner-5.png",
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

  // 2. HUBS (Boards) - Persistent Nodes with Verified Official Locked Logos
  const boards = [
    { 
      id: 'punjab-police', 
      abbreviation: 'POLICE', 
      name: 'Punjab Police Recruitment Board', 
      categoryId: 'punjab-govt',
      iconUrl: 'https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png'
    },
    { 
      id: 'psssb', 
      abbreviation: 'PSSSB', 
      name: 'Punjab Subordinate Services Selection Board', 
      categoryId: 'punjab-govt',
      iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg'
    },
    { 
      id: 'ppsc', 
      abbreviation: 'PPSC', 
      name: 'Punjab Public Service Commission', 
      categoryId: 'punjab-govt',
      iconUrl: 'https://cdn.s3waas.gov.in/s38cb22bdd0b7ba1ab13d742e22eed8da2/uploads/2019/05/2019052938.jpg'
    },
    { 
      id: 'pspcl', 
      abbreviation: 'PSPCL', 
      name: 'Punjab State Power Corporation Limited', 
      categoryId: 'punjab-technical',
      iconUrl: 'https://www.pspcl.in/assets/images/logo.png'
    },
    { 
      id: 'pstcl', 
      abbreviation: 'PSTCL', 
      name: 'Punjab State Transmission Corporation Limited', 
      categoryId: 'punjab-technical',
      iconUrl: 'https://pstcl.org/images/logo.png'
    },
    { 
      id: 'psbte', 
      abbreviation: 'PSBTE', 
      name: 'Punjab Technical Education Board', 
      categoryId: 'punjab-technical',
      iconUrl: 'https://www.punjabteched.com/images/Clogo-blue.gif'
    },
    { 
      id: 'pstet', 
      abbreviation: 'PSTET', 
      name: 'PSTET Hub', 
      categoryId: 'punjab-teaching', 
      iconUrl: 'https://pstet.pseb.ac.in/img/main-logo-2.png' 
    },
    { 
      id: 'ctet', 
      abbreviation: 'CTET', 
      name: 'CTET Hub', 
      categoryId: 'punjab-teaching', 
      iconUrl: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png' 
    },
    { 
      id: 'education-recruitment', 
      abbreviation: 'EDUCATION', 
      name: 'Education Recruitment Board Punjab', 
      categoryId: 'punjab-teaching', 
      iconUrl: 'https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png' 
    }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. EXAMS (Verticals)
  const mandatoryExams = [
    { id: 'constable', name: 'Police Constable', boardId: 'punjab-police', categoryId: 'punjab-govt' },
    { id: 'sub-inspector', name: 'Police Sub-Inspector', boardId: 'punjab-police', categoryId: 'punjab-govt' },
    { id: 'patwari', name: 'Revenue Patwari', boardId: 'psssb', categoryId: 'punjab-govt' },
    { id: 'psssb-clerk', name: 'PSSSB Clerk', boardId: 'psssb', categoryId: 'punjab-govt' },
    { id: 'pspcl-alm', name: 'ALM (PSPCL)', boardId: 'pspcl', categoryId: 'punjab-technical' },
    { id: 'pstcl-alm', name: 'ALM (PSTCL)', boardId: 'pstcl', categoryId: 'punjab-technical' },
    { id: 'je-electrical', name: 'JE Electrical', boardId: 'psbte', categoryId: 'punjab-technical' },
    { id: 'ett-cadre', name: 'ETT Cadre', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'master-cadre', name: 'Master Cadre', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'lecturer-cadre', name: 'Lecturer Cadre', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'principal', name: 'Principal', boardId: 'education-recruitment', categoryId: 'punjab-teaching' },
    { id: 'pstet-p1', name: 'PSTET Paper 1', boardId: 'pstet', categoryId: 'punjab-teaching' },
    { id: 'pstet-p2', name: 'PSTET Paper 2', boardId: 'pstet', categoryId: 'punjab-teaching' },
    { id: 'ctet-p1', name: 'CTET Paper 1', boardId: 'ctet', categoryId: 'punjab-teaching' },
    { 
      id: 'ctet-p2', 
      name: 'CTET Paper 2', 
      boardId: 'ctet', 
      categoryId: 'punjab-teaching', 
      iconUrl: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png' 
    },
  ];

  for (const ex of mandatoryExams) {
    await setDoc(doc(db, 'exams', ex.id), { ...ex, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Registry Logos and Hierarchies Synchronized.');
}
