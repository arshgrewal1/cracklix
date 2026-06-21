import { Firestore, doc, serverTimestamp, writeBatch } from 'firebase/firestore';

/**
 * @fileOverview Strict 7-Category Canonical Registry Seeder v6.0.
 * WIPES legacy data and establishes ONLY the 7 authorized categories.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[REBUILD] Initializing AUTHORIZED 7-CATEGORY ARCHITECTURE...');
  const batch = writeBatch(db);

  // 1. THE 7 AUTHORIZED CATEGORIES ONLY
  const categories = [
    { 
      id: "punjab-government-exams", 
      title: "Punjab Government Exams", 
      description: "Direct recruitment for PSSSB, Punjab Police, and PPSC state cadres.", 
      displayOrder: 1 
    },
    { 
      id: "punjab-teaching-exams", 
      title: "Punjab Teaching Exams", 
      description: "PSTET, CTET, Master Cadre, ETT and Lecturer recruitments.", 
      displayOrder: 2 
    },
    { 
      id: "punjab-technical-exams", 
      title: "Punjab Technical Exams", 
      description: "Technical recruitment for PSPCL, PSTCL and Power corporations.", 
      displayOrder: 3 
    },
    { 
      id: "banking-exams", 
      title: "Banking Exams", 
      description: "State Cooperative Banks, IBPS, and SBI recruitment hubs.", 
      displayOrder: 4 
    },
    { 
      id: "medical-health-exams", 
      title: "Medical & Health Exams", 
      description: "Official BFUHS and Health Department staff recruitments.", 
      displayOrder: 5 
    },
    { 
      id: "judiciary-exams", 
      title: "Judiciary Exams", 
      description: "Punjab & Haryana High Court and District Court recruitment.", 
      displayOrder: 6 
    },
    { 
      id: "central-government-exams", 
      title: "Central Government Exams", 
      description: "SSC, Railway, Defence and UPSC examinations.", 
      displayOrder: 7 
    }
  ];

  for (const cat of categories) {
    batch.set(doc(db, 'categories', cat.id), { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. AUTHORIZED BOARDS (Authority Nodes)
  const boards = [
    // Punjab Government Exams Hub
    { id: "psssb", abbreviation: "PSSSB", name: "Punjab Subordinate Services Selection Board", categoryId: "punjab-government-exams", displayOrder: 1 },
    { id: "punjab-police", abbreviation: "Punjab Police", name: "Punjab Police Recruitment Board", categoryId: "punjab-government-exams", displayOrder: 2 },
    { id: "ppsc", abbreviation: "PPSC", name: "Punjab Public Service Commission", categoryId: "punjab-government-exams", displayOrder: 3 },
    
    // Health Hub
    { id: "bfuhs", abbreviation: "BFUHS", name: "Medical Recruitment Board", categoryId: "medical-health-exams", displayOrder: 1 },

    // Technical Hub
    { id: "pspcl-pstcl", abbreviation: "PSPCL & PSTCL", name: "Punjab Power Corporations", categoryId: "punjab-technical-exams", displayOrder: 1 },

    // Banking Hub
    { id: "pscb", abbreviation: "PSCB", name: "Punjab State Cooperative Bank", categoryId: "banking-exams", displayOrder: 1 },

    // Judiciary Hub
    { id: "courts", abbreviation: "Punjab Courts", name: "High Court & District Courts", categoryId: "judiciary-exams", displayOrder: 1 },

    // Central Govt Hub
    { id: "ssc", abbreviation: "SSC", name: "Staff Selection Commission", categoryId: "central-government-exams", displayOrder: 1 },
    { id: "railway", abbreviation: "Railway", name: "RRB Recruitment Hub", categoryId: "central-government-exams", displayOrder: 2 },
    { id: "upsc", abbreviation: "UPSC", name: "Union Public Service Commission", categoryId: "central-government-exams", displayOrder: 3 },
    { id: "defence", abbreviation: "Defence", name: "Army, Navy & Airforce", categoryId: "central-government-exams", displayOrder: 4 }
  ];

  for (const board of boards) {
    batch.set(doc(db, 'boards', board.id), { ...board, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. EXAM VERTICALS (Content Nodes)
  const examMappings = [
    // PSSSB
    { cat: 'punjab-government-exams', board: 'psssb', list: ["Clerk (General)", "Clerk IT", "Clerk Accounts", "Patwari", "Canal Patwari", "VDO / Gram Sevak", "Excise Inspector", "Jail Warder", "Forest Guard", "Veterinary Inspector", "Junior Draftsman", "Senior Assistant"] },
    // Punjab Police
    { cat: 'punjab-government-exams', board: 'punjab-police', list: ["Constable", "Sub Inspector", "Intelligence Assistant"] },
    // PPSC
    { cat: 'punjab-government-exams', board: 'ppsc', list: ["PCS", "Naib Tehsildar", "Tehsildar", "DSP", "Excise & Taxation Officer", "BDPO", "Assistant Professor", "Junior Engineer"] },
    // Teaching
    { cat: 'punjab-teaching-exams', board: 'punjab-teaching-exams', list: ["PSTET Paper 1", "PSTET Paper 2", "ETT", "Master Cadre", "Lecturer Cadre", "Pre Primary Teacher", "CTET"] },
    // Technical
    { cat: 'punjab-technical-exams', board: 'pspcl-pstcl', list: ["Assistant Lineman (ALM)", "ASSA", "LDC", "Revenue Accountant", "Internal Auditor", "JE Electrical", "JE Civil"] },
    // Banking
    { cat: 'banking-exams', board: 'pscb', list: ["Cooperative Bank Clerk", "Manager", "IT Officer", "Steno Typist"] },
    // Medical
    { cat: 'medical-health-exams', board: 'bfuhs', list: ["Staff Nurse", "Pharmacist", "Medical Officer", "Food Safety Officer", "Emergency Medical Officer", "MPHW", "ANM", "Lab Technician"] },
    // Courts
    { cat: 'judiciary-exams', board: 'courts', list: ["High Court Clerk", "High Court Stenographer", "District Court Clerk", "Process Server", "Peon"] },
    // Central
    { cat: 'central-government-exams', board: 'ssc', list: ["SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD"] },
    { cat: 'central-government-exams', board: 'railway', list: ["RRB NTPC", "RRB Group D"] },
    { cat: 'central-government-exams', board: 'upsc', list: ["Civil Services", "CAPF", "EPFO"] }
  ];

  examMappings.forEach((mapping) => {
    mapping.list.forEach((name, i) => {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      batch.set(doc(db, 'exams', id), {
        id, 
        name,
        categoryId: mapping.cat,
        boardId: mapping.board,
        displayOrder: i,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
  });

  await batch.commit();
  console.log('[REBUILD] Canonical 7-Category Structure Deployed.');
}
