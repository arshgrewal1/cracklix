
import { Firestore, doc, setDoc, serverTimestamp, collection, getDocs, writeBatch } from 'firebase/firestore';

/**
 * @fileOverview Institutional Seeding Node v4.0.
 * UPDATED: Strictly implements Category -> Hub (Board) -> Exam (Vertical) hierarchy.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[AUDIT] Initializing Hierarchical Registry Sync...');

  // 1. CORE CATEGORIES (Top Level)
  const categories = [
    {
      id: "punjab-govt",
      title: "Punjab Government Exams",
      description: "PSSSB, PPSC, Punjab Police, Revenue & State Departments.",
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

  // 2. HUBS (Boards) - Mapped to Categories
  const psssbLogo = "https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg";
  const psebLogo = "https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png";
  
  const boards = [
    { id: 'psssb', abbreviation: 'PSSSB', name: 'Punjab Subordinate Services Selection Board', region: 'Punjab', category: 'STATE_BOARD', categoryId: 'punjab-govt', iconUrl: psssbLogo },
    { id: 'punjab-police', abbreviation: 'POLICE', name: 'Punjab Police Recruitment Board', region: 'Punjab', category: 'DEFENCE_BOARD', categoryId: 'punjab-govt', iconUrl: "https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png" },
    { id: 'education', abbreviation: 'EDUCATION', name: 'Education Recruitment Board Punjab', region: 'Punjab', category: 'TEACHING_BOARD', categoryId: 'punjab-teaching', iconUrl: psebLogo },
    { id: 'pspcl', abbreviation: 'PSPCL', name: 'Punjab State Power Corporation Limited', region: 'Punjab', category: 'TECHNICAL', categoryId: 'punjab-technical', iconUrl: "https://pspcl.in/assets/images/logo.png" }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. EXAMS (Verticals) - Relational Migration
  const examsSnap = await getDocs(collection(db, "exams"));
  const batch = writeBatch(db);
  
  examsSnap.docs.forEach(d => {
    const data = d.data();
    let catId = data.categoryId || 'punjab-govt';
    
    // Auto-inference logic for mapping legacy verticals to the new 5-tier system
    const name = (data.name || "").toUpperCase();
    if (name.includes('PSTET') || name.includes('CTET') || name.includes('CADRE') || name.includes('ETT')) catId = 'punjab-teaching';
    if (name.includes('PSPCL') || name.includes('JE ') || name.includes('ALM') || name.includes('LINEMAN')) catId = 'punjab-technical';
    if (name.includes('IBPS') || name.includes('BANK')) catId = 'banking';
    if (name.includes('SSC') || name.includes('ARMY') || name.includes('RAILWAY')) catId = 'central-govt';

    batch.update(d.ref, { categoryId: catId });
  });
  
  await batch.commit();

  console.log('[AUDIT] Hierarchical Registry Synchronized.');
}
