
import { Firestore, doc, setDoc, serverTimestamp, collection, deleteDoc } from 'firebase/firestore';

/**
 * @fileOverview Institutional Punjab-Centric Seeding Node v66.0.
 * UPDATED: Zero-baseline initialization. All placeholder counts reset to 0.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Absolute Punjab Registry Sync...');

  // 1. AUTHORITATIVE STATS HUB - 0 Baseline (Real Data Policy)
  await setDoc(doc(db, 'settings', 'stats'), {
     totalQuestions: 0,
     totalMocks: 0,
     totalUsers: 0,
     averageAccuracy: 0,
     updatedAt: serverTimestamp()
  }, { merge: true });

  // 2. STRATEGIC CATEGORIES
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
      id: "banking",
      title: "Banking Exams",
      description: "IBPS, PO, SO, SBI & RBI specialized mocks.",
      highlight: "FINANCIAL",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      displayOrder: 4
    },
    {
      id: "central-govt",
      title: "Central Govt",
      description: "SSC, Railways, Army & National registries.",
      highlight: "NATIONAL",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      displayOrder: 5
    }
  ];

  for (const cat of categories) {
    await setDoc(doc(db, 'categories', cat.id), { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. HUBS (Boards)
  const boards = [
    { id: 'punjab-police', abbreviation: 'POLICE', name: 'Punjab Police Recruitment Board', categoryId: 'punjab-govt', iconUrl: 'https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png', displayOrder: 1 },
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', categoryId: 'punjab-govt', iconUrl: 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg', displayOrder: 2 },
    { id: 'ppsc', abbreviation: 'PPSC', name: 'Punjab Public Service Commission', categoryId: 'punjab-govt', iconUrl: 'https://cdn.s3waas.gov.in/s38cb22bdd0b7ba1ab13d742e22eed8da2/uploads/2019/05/2019052938.jpg', displayOrder: 3 },
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'Punjab State Power Corporation Limited', categoryId: 'punjab-technical', iconUrl: 'https://www.pspcl.in/assets/images/logo.png', displayOrder: 4 },
    { id: 'pstcl', abbreviation: 'PSTCL', name: 'Punjab State Transmission Corporation Limited', categoryId: 'punjab-technical', iconUrl: 'https://pstcl.org/images/logo.png', displayOrder: 5 },
    { id: 'pstet-hub', abbreviation: 'PSTET', name: 'PSTET Preparation Hub', categoryId: 'punjab-teaching', iconUrl: 'https://pstet.pseb.ac.in/img/main-logo-2.png', displayOrder: 6 },
    { id: 'ctet-hub', abbreviation: 'CTET', name: 'CTET Preparation Hub', categoryId: 'punjab-teaching', iconUrl: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png', displayOrder: 7 },
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  console.log('[AUDIT] Full Punjab Registry Synchronized with 0-Baseline.');
}
