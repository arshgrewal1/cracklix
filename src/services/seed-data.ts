
import { Firestore, doc, setDoc, serverTimestamp, collection, deleteDoc } from 'firebase/firestore';

/**
 * @fileOverview Institutional Punjab-Centric Seeding Node v53.0.
 * UPDATED: Consolidated PSTET/CTET hubs and purged legacy duplicates.
 * LOCKED: Official institutional URLs for all Punjab boards and specific verticals.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Punjab-Focused Registry Sync...');

  // 0. REGISTRY SANITIZATION: Purge legacy duplicate board nodes
  const legacyBoardIds = ['pstet', 'ctet'];
  for (const id of legacyBoardIds) {
     try {
        await deleteDoc(doc(db, 'boards', id));
        console.log(`[CLEANUP] Purged legacy board node: ${id}`);
     } catch (e) {
        // Silent fail for non-existent nodes
     }
  }

  // 1. STRATEGIC CATEGORIES (Punjab Focused)
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

  // 2. HUBS (Boards) - Persistent Punjab Nodes with Locked Logos
  const boards = [
    { 
      id: 'punjab-police', 
      abbreviation: 'POLICE', 
      name: 'Punjab Police Recruitment Board', 
      categoryId: 'punjab-govt',
      iconUrl: 'https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png',
      displayOrder: 1
    },
    { 
      id: 'psssb', 
      abbreviation: 'PSSSB', 
      name: 'Punjab Subordinate Services Selection Board', 
      categoryId: 'punjab-govt',
      iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg',
      displayOrder: 2
    },
    { 
      id: 'ppsc', 
      abbreviation: 'PPSC', 
      name: 'Punjab Public Service Commission', 
      categoryId: 'punjab-govt',
      iconUrl: 'https://cdn.s3waas.gov.in/s38cb22bdd0b7ba1ab13d742e22eed8da2/uploads/2019/05/2019052938.jpg',
      displayOrder: 3
    },
    { 
      id: 'pspcl', 
      abbreviation: 'PSPCL', 
      name: 'Punjab State Power Corporation Limited', 
      categoryId: 'punjab-technical',
      iconUrl: 'https://www.pspcl.in/assets/images/logo.png',
      displayOrder: 4
    },
    { 
      id: 'pstcl', 
      abbreviation: 'PSTCL', 
      name: 'Punjab State Transmission Corporation Limited', 
      categoryId: 'punjab-technical',
      iconUrl: 'https://pstcl.org/images/logo.png',
      displayOrder: 5
    },
    { 
      id: 'high-court', 
      abbreviation: 'COURT', 
      name: 'Punjab & Haryana High Court', 
      categoryId: 'punjab-govt',
      displayOrder: 6
    },
    { 
      id: 'pstet-hub', 
      abbreviation: 'PSTET', 
      name: 'PSTET Preparation Hub', 
      categoryId: 'punjab-teaching',
      iconUrl: 'https://pstet.pseb.ac.in/img/main-logo-2.png',
      displayOrder: 7
    },
    { 
      id: 'ctet-hub', 
      abbreviation: 'CTET', 
      name: 'CTET Preparation Hub', 
      categoryId: 'punjab-teaching',
      iconUrl: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png',
      displayOrder: 8
    },
    { 
      id: 'teaching-hub', 
      abbreviation: 'CADRE', 
      name: 'Teaching Cadre Board', 
      categoryId: 'punjab-teaching',
      iconUrl: 'https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png',
      displayOrder: 9
    }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. EXAMS (Specific Verticals)
  const mandatoryExams = [
    // Govt
    { id: 'police-constable', name: 'Police Constable', boardId: 'punjab-police', categoryId: 'punjab-govt', displayOrder: 1 },
    { id: 'police-head-constable', name: 'Head Constable / ASI', boardId: 'punjab-police', categoryId: 'punjab-govt', displayOrder: 1.5, iconUrl: 'https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png' },
    { id: 'police-si', name: 'Police Sub-Inspector', boardId: 'punjab-police', categoryId: 'punjab-govt', displayOrder: 2 },
    { id: 'pcs-prelims', name: 'PCS Prelims', boardId: 'ppsc', categoryId: 'punjab-govt', displayOrder: 3 },
    
    // Teaching - Standardized Hubs
    { id: 'master-cadre', name: 'Master Cadre', boardId: 'teaching-hub', categoryId: 'punjab-teaching', displayOrder: 4 },
    { id: 'ett-cadre', name: 'ETT Cadre', boardId: 'teaching-hub', categoryId: 'punjab-teaching', displayOrder: 5 },
    { id: 'lecturer-cadre', name: 'Lecturer Cadre', boardId: 'teaching-hub', categoryId: 'punjab-teaching', displayOrder: 6 },
    
    // PSTET Hub (2 Verticals)
    { id: 'pstet-p1', name: 'PSTET Paper 1', boardId: 'pstet-hub', categoryId: 'punjab-teaching', displayOrder: 7 },
    { id: 'pstet-p2', name: 'PSTET Paper 2', boardId: 'pstet-hub', categoryId: 'punjab-teaching', displayOrder: 7.1 },
    
    // CTET Hub (2 Verticals)
    { id: 'ctet-p1', name: 'CTET Paper 1', boardId: 'ctet-hub', categoryId: 'punjab-teaching', displayOrder: 7.4 },
    { id: 'ctet-p2', name: 'CTET Paper 2', boardId: 'ctet-hub', categoryId: 'punjab-teaching', displayOrder: 7.5, iconUrl: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png' },
    
    // Technical
    { 
      id: 'pspcl-alm', 
      name: 'PSPCL ALM / Lineman', 
      boardId: 'pspcl', 
      categoryId: 'punjab-technical', 
      displayOrder: 8,
      iconUrl: 'https://www.pspcl.in/assets/images/logo.png' 
    },
    { 
      id: 'pstcl-alm', 
      name: 'PSTCL ALM / Lineman', 
      boardId: 'pstcl', 
      categoryId: 'punjab-technical', 
      displayOrder: 9,
      iconUrl: 'https://www.pspcl.in/assets/images/logo.png' 
    },
    { id: 'je-electrical', name: 'JE Electrical', boardId: 'pspcl', categoryId: 'punjab-technical', displayOrder: 10 },
    
    // General
    { id: 'patwari', name: 'Patwari', boardId: 'psssb', categoryId: 'punjab-general', displayOrder: 11 },
    { id: 'excise-inspector', name: 'Excise Inspector', boardId: 'psssb', categoryId: 'punjab-general', displayOrder: 12 },
    { id: 'clerk-general', name: 'Clerk (General)', boardId: 'psssb', categoryId: 'punjab-general', displayOrder: 13 }
  ];

  for (const ex of mandatoryExams) {
    await setDoc(doc(db, 'exams', ex.id), { ...ex, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Punjab-Centric Registry Synchronized Successfully.');
}
