import { Firestore, doc, serverTimestamp, writeBatch } from 'firebase/firestore';

/**
 * @fileOverview Massive Hierarchical Registry Seeder v10.0.
 * Rebuilds the entire ecosystem: Category -> Board -> Exam.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[REBUILD] Initializing HIERARCHICAL ARCHITECTURE...');
  const batch = writeBatch(db);

  // 1. THE 6 CANONICAL CATEGORIES
  const categories = [
    { id: "punjab-government-exams", title: "Punjab Government Exams", description: "Recruitments through PPSC, PSSSB, Police and State Courts.", displayOrder: 1 },
    { id: "punjab-teaching-exams", title: "Punjab Teaching Exams", description: "Teacher recruitment through ERB, PSTET and CTET.", displayOrder: 2 },
    { id: "punjab-technical-exams", title: "Punjab Technical Exams", description: "Technical and Engineering posts in PSPCL, PSTCL and Departments.", displayOrder: 3 },
    { id: "punjab-banking-exams", title: "Punjab Banking Exams", description: "Jobs in Punjab State Cooperative Banks and regional rural banks.", displayOrder: 4 },
    { id: "punjab-health-exams", title: "Punjab Health Exams", description: "Medical and Health department recruitments through BFUHS.", displayOrder: 5 },
    { id: "central-government-exams", title: "Central Government Exams", description: "National recruitments through SSC, Railway, UPSC and Defence.", displayOrder: 6 }
  ];

  for (const cat of categories) {
    batch.set(doc(db, 'categories', cat.id), { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. AUTHORITY BOARDS (Nesting Nodes)
  const boards = [
    // Punjab Govt
    { id: "ppsc", abbreviation: "PPSC", name: "Punjab Public Service Commission", categoryId: "punjab-government-exams", displayOrder: 1 },
    { id: "psssb", abbreviation: "PSSSB", name: "Punjab Subordinate Services Selection Board", categoryId: "punjab-government-exams", displayOrder: 2 },
    { id: "punjab-police", abbreviation: "Punjab Police", name: "State Police Recruitment", categoryId: "punjab-government-exams", displayOrder: 3 },
    { id: "punjab-courts", abbreviation: "Punjab Courts", name: "High Court & District Courts", categoryId: "punjab-government-exams", displayOrder: 4 },

    // Teaching
    { id: "erb", abbreviation: "ERB", name: "Education Recruitment Board", categoryId: "punjab-teaching-exams", displayOrder: 1 },
    { id: "pstet", abbreviation: "PSTET", name: "Punjab State Teacher Eligibility Test", categoryId: "punjab-teaching-exams", displayOrder: 2 },
    { id: "ctet", abbreviation: "CTET", name: "Central Teacher Eligibility Test", categoryId: "punjab-teaching-exams", displayOrder: 3 },

    // Technical
    { id: "pspcl", abbreviation: "PSPCL", name: "Punjab State Power Corporation Ltd", categoryId: "punjab-technical-exams", displayOrder: 1 },
    { id: "pstcl", abbreviation: "PSTCL", name: "Punjab State Transmission Corporation Ltd", categoryId: "punjab-technical-exams", displayOrder: 2 },
    { id: "eng-rec", abbreviation: "Engineering", name: "Technical Engineering Recruitment", categoryId: "punjab-technical-exams", displayOrder: 3 },

    // Banking
    { id: "pscb", abbreviation: "PSCB", name: "Punjab State Cooperative Bank", categoryId: "punjab-banking-exams", displayOrder: 1 },
    { id: "coop-banks", abbreviation: "Cooperative", name: "District Cooperative Banks", categoryId: "punjab-banking-exams", displayOrder: 2 },

    // Health
    { id: "bfuhs", abbreviation: "BFUHS", name: "Baba Farid University of Health Sciences", categoryId: "punjab-health-exams", displayOrder: 1 },

    // Central
    { id: "ssc", abbreviation: "SSC", name: "Staff Selection Commission", categoryId: "central-government-exams", displayOrder: 1 },
    { id: "railway", abbreviation: "Railway", name: "RRB Recruitment", categoryId: "central-government-exams", displayOrder: 2 },
    { id: "bank-central", abbreviation: "Banking", name: "SBI, IBPS & RBI Hub", categoryId: "central-government-exams", displayOrder: 3 },
    { id: "defence", abbreviation: "Defence", name: "Army, Navy, Air Force & CAPF", categoryId: "central-government-exams", displayOrder: 4 },
    { id: "central-others", abbreviation: "Other", name: "NTA, CUET & UGC NET", categoryId: "central-government-exams", displayOrder: 5 }
  ];

  for (const board of boards) {
    batch.set(doc(db, 'boards', board.id), { ...board, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 3. MASSIVE EXAM VERTICAL REGISTRY
  const examMap: Record<string, string[]> = {
    "ppsc": ["PCS", "DSP", "Tehsildar", "Naib Tehsildar", "Excise & Taxation Officer", "BDPO", "Assistant Professor", "Veterinary Officer", "Junior Engineer (JE)", "Assistant Engineer (AE)", "Senior Assistant"],
    "psssb": ["Clerk", "Clerk IT", "Clerk Accounts", "CCDEO", "Steno Typist", "Junior Scale Stenographer", "Patwari", "Canal Patwari", "Gram Sevak / VDO", "Excise Inspector", "Jail Warder", "Matron", "Veterinary Inspector", "Forest Guard", "Forester", "Junior Draftsman", "Horticulture Supervisor", "Laboratory Assistant", "Dairy Inspector", "Senior Assistant"],
    "punjab-police": ["Constable", "Sub Inspector", "Intelligence Assistant", "Constable Technical Support", "Cyber Crime Technical Staff"],
    "punjab-courts": ["High Court Clerk", "High Court Stenographer", "Senior Assistant", "District Court Clerk", "Process Server", "Peon", "Mali", "Safai Sewak"],
    "erb": ["Master Cadre Maths", "Master Cadre Science", "Master Cadre English", "Master Cadre Punjabi", "Master Cadre Hindi", "Master Cadre SST", "Master Cadre Physical Education", "ETT Teacher", "Lecturer Cadre", "Pre Primary Teacher"],
    "pstet": ["PSTET Paper 1", "PSTET Paper 2"],
    "ctet": ["CTET Paper 1", "CTET Paper 2"],
    "pspcl": ["Assistant Lineman (ALM)", "Assistant Sub Station Attendant (ASSA)", "Junior Engineer Electrical", "Revenue Accountant", "Internal Auditor", "LDC", "Typist"],
    "pstcl": ["JE Electrical", "ALM", "ASSA", "Clerk"],
    "eng-rec": ["JE Civil", "JE Mechanical", "JE Electrical", "AE Civil", "AE Mechanical", "AE Electrical"],
    "pscb": ["Clerk", "Clerk Cum DEO", "Steno Typist", "IT Officer", "Manager", "Senior Manager"],
    "coop-banks": ["Clerk", "Assistant Manager", "Field Officer"],
    "bfuhs": ["Staff Nurse", "Nursing Officer", "Pharmacist", "Medical Officer", "Food Safety Officer", "Emergency Medical Officer", "Lab Technician", "Radiographer", "MPHW", "ANM"],
    "ssc": ["SSC CGL", "SSC CHSL", "SSC MTS", "SSC CPO", "SSC GD", "SSC JE", "SSC Stenographer"],
    "railway": ["RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP", "RPF Constable", "RPF SI"],
    "bank-central": ["SBI Clerk", "SBI PO", "IBPS Clerk", "IBPS PO", "IBPS RRB", "RBI Assistant", "RBI Grade B"],
    "defence": ["NDA", "CDS", "AFCAT", "Agniveer Army", "Agniveer Air Force", "Agniveer Navy", "CAPF AC"],
    "central-others": ["CUET", "UGC NET", "NTA Exams"]
  };

  Object.entries(examMap).forEach(([boardId, names]) => {
    names.forEach((name, i) => {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      batch.set(doc(db, 'exams', id), {
        id, 
        name,
        boardId,
        categoryId: boards.find(b => b.id === boardId)?.categoryId || "others",
        displayOrder: i,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
  });

  await batch.commit();
  console.log('[REBUILD] Hierarchical Structure Deployed Successfully.');
}
