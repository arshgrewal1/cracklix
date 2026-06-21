import { Firestore, doc, serverTimestamp, writeBatch, collection, getDocs } from 'firebase/firestore';

/**
 * @fileOverview Official Institutional Registry Blueprint v60.0.
 * STRICT: Implements user-provided exam tree.
 * PURGE: Automatically deletes any exam node NOT present in the canonical list.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[REBUILD] Initializing Canonical Registry 2026...');
  const batch = writeBatch(db);

  // 1. CANONICAL CATEGORIES
  const categories = [
    { id: "punjab-government-exams", title: "Punjab Government Exams", description: "Recruitments through PPSC, PSSSB and Punjab Police.", displayOrder: 1 },
    { id: "punjab-teaching-exams", title: "Punjab Teaching Exams", description: "State teacher recruitments and eligibility tests.", displayOrder: 2 },
    { id: "punjab-technical-exams", title: "Punjab Technical Exams", description: "Engineering and Medical posts in state departments.", displayOrder: 3 },
    { id: "banking-exams", title: "Banking Exams", description: "State cooperative and district bank recruitments.", displayOrder: 4 },
    { id: "judiciary-exams", title: "Judiciary Exams", description: "Legal and clerical posts in Punjab & District courts.", displayOrder: 5 },
    { id: "central-government-exams", title: "Central Government Exams", description: "National recruitments through SSC, RRB, and IBPS.", displayOrder: 6 }
  ];

  for (const cat of categories) {
    batch.set(doc(db, 'categories', cat.id), { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. AUTHORITY BOARDS
  const boards = [
    // Punjab Govt
    { id: "ppsc", abbreviation: "PPSC", name: "Punjab Public Service Commission", categoryId: "punjab-government-exams", displayOrder: 1 },
    { id: "psssb", abbreviation: "PSSSB", name: "Punjab Subordinate Services Selection Board", categoryId: "punjab-government-exams", displayOrder: 2 },
    { id: "punjab-police", abbreviation: "Punjab Police", name: "State Police Recruitment", categoryId: "punjab-government-exams", displayOrder: 3 },
    // Teaching
    { id: "teaching-hub", abbreviation: "Teaching", name: "Education Recruitment Board", categoryId: "punjab-teaching-exams", displayOrder: 1 },
    // Technical
    { id: "pspcl", abbreviation: "PSPCL", name: "Punjab State Power Corporation Ltd", categoryId: "punjab-technical-exams", displayOrder: 1 },
    { id: "pstcl", abbreviation: "PSTCL", name: "Punjab State Transmission Corporation Ltd", categoryId: "punjab-technical-exams", displayOrder: 2 },
    { id: "bfuhs", abbreviation: "BFUHS", name: "Baba Farid University of Health Sciences", categoryId: "punjab-technical-exams", displayOrder: 3 },
    // Banking
    { id: "banking-hub", abbreviation: "Banking", name: "State Cooperative Banking Hub", categoryId: "banking-exams", displayOrder: 1 },
    // Judiciary
    { id: "judiciary-hub", abbreviation: "Judiciary", name: "High Court & District Courts", categoryId: "judiciary-exams", displayOrder: 1 },
    // Central
    { id: "ssc", abbreviation: "SSC", name: "Staff Selection Commission", categoryId: "central-government-exams", displayOrder: 1 },
    { id: "rrb", abbreviation: "RRB", name: "Railway Recruitment Board", categoryId: "central-government-exams", displayOrder: 2 },
    { id: "ibps", abbreviation: "IBPS", name: "Banking Personnel Selection", categoryId: "central-government-exams", displayOrder: 3 },
    { id: "defense", abbreviation: "Defense", name: "Army, Navy & Air Force", categoryId: "central-government-exams", displayOrder: 4 }
  ];

  for (const board of boards) {
    batch.set(doc(db, 'boards', board.id), { ...board, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. CANONICAL EXAM VERTICALS
  const exams = [
    // PPSC
    { id: "pcs", name: "PCS", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "naib-tehsildar", name: "Naib Tehsildar", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "tehsildar", name: "Tehsildar", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "dsp", name: "DSP", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "eto", name: "ETO", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "bdpo", name: "BDPO", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "assistant-professor", name: "Assistant Professor", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "je-civil", name: "JE Civil", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "je-mechanical", name: "JE Mechanical", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "je-electrical", name: "JE Electrical", boardId: "ppsc", categoryId: "punjab-government-exams" },
    { id: "other-ppsc", name: "Other PPSC Exams", boardId: "ppsc", categoryId: "punjab-government-exams" },
    // PSSSB
    { id: "clerk", name: "Clerk", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "clerk-it", name: "Clerk IT", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "clerk-accounts", name: "Clerk Accounts", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "ccdeo", name: "CCDEO", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "patwari", name: "Patwari", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "canal-patwari", name: "Canal Patwari", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "vdo", name: "VDO", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "excise-inspector", name: "Excise Inspector", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "jail-warder", name: "Jail Warder", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "forest-guard", name: "Forest Guard", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "veterinary-inspector", name: "Veterinary Inspector", boardId: "psssb", categoryId: "punjab-government-exams" },
    { id: "other-psssb", name: "Other PSSSB Exams", boardId: "psssb", categoryId: "punjab-government-exams" },
    // Punjab Police
    { id: "constable", name: "Constable", boardId: "punjab-police", categoryId: "punjab-government-exams" },
    { id: "sub-inspector", name: "Sub Inspector", boardId: "punjab-police", categoryId: "punjab-government-exams" },
    { id: "intelligence-assistant", name: "Intelligence Assistant", boardId: "punjab-police", categoryId: "punjab-government-exams" },
    { id: "technical-cadre", name: "Technical Cadre", boardId: "punjab-police", categoryId: "punjab-government-exams" },
    // Teaching
    { id: "pstet-paper-1", name: "PSTET Paper 1", boardId: "teaching-hub", categoryId: "punjab-teaching-exams" },
    { id: "pstet-paper-2", name: "PSTET Paper 2", boardId: "teaching-hub", categoryId: "punjab-teaching-exams" },
    { id: "master-cadre", name: "Master Cadre", boardId: "teaching-hub", categoryId: "punjab-teaching-exams" },
    { id: "lecturer-cadre", name: "Lecturer Cadre", boardId: "teaching-hub", categoryId: "punjab-teaching-exams" },
    { id: "ett", name: "ETT", boardId: "teaching-hub", categoryId: "punjab-teaching-exams" },
    { id: "pre-primary-teacher", name: "Pre Primary Teacher", boardId: "teaching-hub", categoryId: "punjab-teaching-exams" },
    { id: "ctet", name: "CTET", boardId: "teaching-hub", categoryId: "punjab-teaching-exams" },
    // Technical (PSPCL/PSTCL/BFUHS)
    { id: "alm", name: "ALM", boardId: "pspcl", categoryId: "punjab-technical-exams" },
    { id: "assa", name: "ASSA", boardId: "pspcl", categoryId: "punjab-technical-exams" },
    { id: "ldc-pspcl", name: "LDC (PSPCL)", boardId: "pspcl", categoryId: "punjab-technical-exams" },
    { id: "revenue-accountant", name: "Revenue Accountant", boardId: "pspcl", categoryId: "punjab-technical-exams" },
    { id: "je-elec-pspcl", name: "JE Electrical (PSPCL)", boardId: "pspcl", categoryId: "punjab-technical-exams" },
    { id: "je-elec-pstcl", name: "JE Electrical (PSTCL)", boardId: "pstcl", categoryId: "punjab-technical-exams" },
    { id: "clerk-pstcl", name: "Clerk (PSTCL)", boardId: "pstcl", categoryId: "punjab-technical-exams" },
    { id: "tech-posts-pstcl", name: "Technical Posts", boardId: "pstcl", categoryId: "punjab-technical-exams" },
    { id: "staff-nurse", name: "Staff Nurse", boardId: "bfuhs", categoryId: "punjab-technical-exams" },
    { id: "pharmacist", name: "Pharmacist", boardId: "bfuhs", categoryId: "punjab-technical-exams" },
    { id: "medical-officer", name: "Medical Officer", boardId: "bfuhs", categoryId: "punjab-technical-exams" },
    { id: "food-safety-officer", name: "Food Safety Officer", boardId: "bfuhs", categoryId: "punjab-technical-exams" },
    { id: "lab-technician", name: "Lab Technician", boardId: "bfuhs", categoryId: "punjab-technical-exams" },
    { id: "radiographer", name: "Radiographer", boardId: "bfuhs", categoryId: "punjab-technical-exams" },
    // Banking
    { id: "pscb-clerk", name: "PSCB Clerk", boardId: "banking-hub", categoryId: "banking-exams" },
    { id: "pscb-manager", name: "PSCB Manager", boardId: "banking-hub", categoryId: "banking-exams" },
    { id: "it-officer", name: "IT Officer", boardId: "banking-hub", categoryId: "banking-exams" },
    { id: "steno-typist", name: "Steno Typist", boardId: "banking-hub", categoryId: "banking-exams" },
    { id: "dccb-recruitment", name: "DCCB Recruitment", boardId: "banking-hub", categoryId: "banking-exams" },
    // Judiciary
    { id: "hc-clerk", name: "High Court Clerk", boardId: "judiciary-hub", categoryId: "judiciary-exams" },
    { id: "hc-steno", name: "High Court Stenographer", boardId: "judiciary-hub", categoryId: "judiciary-exams" },
    { id: "dist-court-clerk", name: "District Court Clerk", boardId: "judiciary-hub", categoryId: "judiciary-exams" },
    { id: "process-server", name: "Process Server", boardId: "judiciary-hub", categoryId: "judiciary-exams" },
    { id: "peon", name: "Peon", boardId: "judiciary-hub", categoryId: "judiciary-exams" },
    { id: "other-court-posts", name: "Other Court Posts", boardId: "judiciary-hub", categoryId: "judiciary-exams" },
    // Central
    { id: "ssc-cgl", name: "SSC CGL", boardId: "ssc", categoryId: "central-government-exams" },
    { id: "ssc-chsl", name: "SSC CHSL", boardId: "ssc", categoryId: "central-government-exams" },
    { id: "ssc-mts", name: "SSC MTS", boardId: "ssc", categoryId: "central-government-exams" },
    { id: "ssc-gd", name: "SSC GD", boardId: "ssc", categoryId: "central-government-exams" },
    { id: "ssc-je", name: "SSC JE", boardId: "ssc", categoryId: "central-government-exams" },
    { id: "rrb-ntpc", name: "RRB NTPC", boardId: "rrb", categoryId: "central-government-exams" },
    { id: "rrb-group-d", name: "RRB Group D", boardId: "rrb", categoryId: "central-government-exams" },
    { id: "rrb-je", name: "RRB JE", boardId: "rrb", categoryId: "central-government-exams" },
    { id: "ibps-clerk", name: "IBPS Clerk", boardId: "ibps", categoryId: "central-government-exams" },
    { id: "ibps-po", name: "IBPS PO", boardId: "ibps", categoryId: "central-government-exams" },
    { id: "sbi-clerk", name: "SBI Clerk", boardId: "ibps", categoryId: "central-government-exams" },
    { id: "sbi-po", name: "SBI PO", boardId: "ibps", categoryId: "central-government-exams" },
    { id: "nda", name: "NDA", boardId: "defense", categoryId: "central-government-exams" },
    { id: "cds", name: "CDS", boardId: "defense", categoryId: "central-government-exams" },
    { id: "afcat", name: "AFCAT", boardId: "defense", categoryId: "central-government-exams" },
    { id: "capf", name: "CAPF", boardId: "defense", categoryId: "central-government-exams" },
    { id: "crpf", name: "CRPF", boardId: "defense", categoryId: "central-government-exams" },
    { id: "bsf", name: "BSF", boardId: "defense", categoryId: "central-government-exams" },
    { id: "cisf", name: "CISF", boardId: "defense", categoryId: "central-government-exams" },
    { id: "indian-army", name: "Indian Army", boardId: "defense", categoryId: "central-government-exams" }
  ];

  const canonicalExamIds = new Set(exams.map(e => e.id));

  // 4. PURGE NODE: Remove non-canonical exams
  const existingExamsSnap = await getDocs(collection(db, "exams"));
  existingExamsSnap.docs.forEach((doc) => {
    if (!canonicalExamIds.has(doc.id)) {
      console.log(`[PURGE] Removing non-canonical exam: ${doc.id}`);
      batch.delete(doc.ref);
    }
  });

  // 5. COMMIT CANONICAL EXAMS
  for (const exam of exams) {
    batch.set(doc(db, 'exams', exam.id), { 
      ...exam, 
      displayOrder: 1, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }

  await batch.commit();
  console.log('[SUCCESS] Institutional Registry Perfectly Aligned.');
}
