import { Firestore, doc, serverTimestamp, writeBatch } from 'firebase/firestore';

/**
 * @fileOverview Strict 7-Category Registry Seeder v3.0.
 * Wipes legacy hierarchy and establishes ONLY the 7 authorized categories.
 */

export async function seedInitialData(db: Firestore) {
  console.log('[REBUILD] Initializing STRICT 7-CATEGORY ECOSYSTEM...');
  const batch = writeBatch(db);

  // 1. THE ONLY ALLOWED CATEGORIES (7 TOTAL)
  const categories = [
    { 
      id: "punjab-government-exams", 
      title: "Punjab Government Exams", 
      description: "Direct recruitment for PPSC, PSSSB and Punjab Police cadres.", 
      displayOrder: 1,
      icon: "Landmark"
    },
    { 
      id: "punjab-teaching-exams", 
      title: "Punjab Teaching Exams", 
      description: "PSTET, ETT, Master Cadre and Teacher recruitment.", 
      displayOrder: 2,
      icon: "GraduationCap"
    },
    { 
      id: "punjab-technical-exams", 
      title: "Punjab Technical Exams", 
      description: "Technical recruitment for PSPCL and PSTCL corporations.", 
      displayOrder: 3,
      icon: "Zap"
    },
    { 
      id: "banking-exams", 
      title: "Banking Exams", 
      description: "Punjab State Cooperative Bank and central banking recruitments.", 
      displayOrder: 4,
      icon: "Building2"
    },
    { 
      id: "medical-health-exams", 
      title: "Medical & Health Exams", 
      description: "Staff Nurse, MPHW and health recruitments under BFUHS.", 
      displayOrder: 5,
      icon: "HeartPulse"
    },
    { 
      id: "judiciary-exams", 
      title: "Judiciary Exams", 
      description: "Clerk and stenographer recruitment for Punjab Courts.", 
      displayOrder: 6,
      icon: "Scale"
    },
    { 
      id: "central-government-exams", 
      title: "Central Government Exams", 
      description: "SSC, Railway, Banking, Defence and UPSC examinations.", 
      displayOrder: 7,
      icon: "Globe"
    }
  ];

  for (const cat of categories) {
    batch.set(doc(db, 'categories', cat.id), { ...cat, updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. EXAM VERTICALS (Specific Exams) - Strictly Mapped to 7 Categories
  const examMappings = [
    { 
      cat: 'punjab-government-exams', 
      list: [
        "PCS", "Naib Tehsildar", "Tehsildar", "DSP", "Excise & Taxation Officer", 
        "BDPO", "Assistant Professor", "Veterinary Officer", "Assistant Engineer", 
        "Junior Engineer", "Clerk", "Clerk IT", "Clerk Accounts", "Steno Typist", 
        "Patwari", "Canal Patwari", "VDO", "Excise Inspector", "Jail Warder", 
        "Forest Guard", "Veterinary Inspector", "Junior Draftsman", "Senior Assistant",
        "Constable", "Sub Inspector", "Intelligence Assistant"
      ] 
    },
    { 
      cat: 'punjab-teaching-exams', 
      list: ["PSTET Paper 1", "PSTET Paper 2", "ETT", "Master Cadre", "Lecturer Cadre", "Pre Primary Teacher", "CTET"] 
    },
    { 
      cat: 'punjab-technical-exams', 
      list: ["Assistant Lineman (ALM)", "ASSA", "LDC", "Revenue Accountant", "Internal Auditor", "JE Electrical", "JE Civil", "AE Electrical"] 
    },
    { 
      cat: 'banking-exams', 
      list: ["Cooperative Bank Clerk", "Cooperative Bank Manager", "IT Officer", "Steno Typist"] 
    },
    { 
      cat: 'medical-health-exams', 
      list: ["Staff Nurse", "Pharmacist", "Medical Officer", "Food Safety Officer", "EMO", "ANM", "MPHW", "Lab Technician", "Radiographer"] 
    },
    { 
      cat: 'judiciary-exams', 
      list: ["High Court Clerk", "High Court Stenographer", "District Court Clerk", "District Court Stenographer", "Process Server", "Peon"] 
    },
    { 
      cat: 'central-government-exams', 
      list: [
        "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD", "SSC CPO", 
        "RRB NTPC", "RRB Group D", "RRB ALP", "RRB JE", 
        "IBPS PO", "IBPS Clerk", "SBI PO", "SBI Clerk", 
        "NDA", "CDS", "AFCAT", "Agniveer", "Civil Services", "CAPF"
      ] 
    }
  ];

  examMappings.forEach((mapping) => {
    mapping.list.forEach((name, i) => {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      batch.set(doc(db, 'exams', id), {
        id, 
        name,
        categoryId: mapping.cat,
        displayOrder: i,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
  });

  await batch.commit();
  console.log('[REBUILD] Clean 7-Category Architecture Deployed.');
}
