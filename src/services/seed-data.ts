
import { Firestore, doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';

/**
 * @fileOverview Final Institutional Seeding Engine for Cracklix.
 * Synchronizes binary access passes, official board registry, and platform settings.
 * categorizes boards into 'Punjab' and 'National' regions for backend routing.
 */
export async function seedInitialData(db: Firestore) {
  console.log('[REGISTRY] Initializing Global Punjab & National Access Registry Sync...');

  // 1. Initial Pass Registry
  const passes = [
    { 
      id: 'aspirant_free', 
      name: 'Aspirant Free', 
      price: 0, 
      durationDays: 365, 
      active: true, 
      displayOrder: 1, 
      type: 'FREE',
      description: 'Start your journey with verified patterns.',
      features: ['10 Free Mocks', 'Daily Analysis', 'Exam Calendar']
    },
    { 
      id: 'silver_pass', 
      name: 'Silver Pass', 
      price: 99, 
      durationDays: 30, 
      active: true, 
      displayOrder: 2, 
      type: 'PREMIUM',
      description: 'Unlock all subject-wise mastery tests.',
      features: ['Subject Mocks', 'PYQ PDFs', 'Performance Stats']
    },
    { 
      id: 'gold_pass', 
      name: 'Gold Pass', 
      price: 199, 
      durationDays: 30, 
      active: true, 
      displayOrder: 3, 
      recommended: true,
      type: 'PREMIUM',
      description: 'Complete institutional preparation vault.',
      features: ['500+ Full Mocks', 'AI Rationalizations', 'Readiness Score', 'Priority Alerts']
    }
  ];

  for (const p of passes) {
    await setDoc(doc(db, 'passes', p.id), { ...p, updatedAt: serverTimestamp() });
  }

  // 2. Master Authority Registry with REGIONAL Routing
  const stateEmblem = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Emblem_of_Punjab.svg/512px-Emblem_of_Punjab.svg.png';
  const psssbLogo = 'https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg';
  const policeLogo = 'https://punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png';
  const hcOfficialLogo = 'https://highcourtchd.gov.in/images/newlogo.png';
  const psebSchoolLogo = 'https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png';
  const eduDeptLogo = 'https://pstet.pseb.ac.in/img/main-logo-2.png';
  const armyOfficialLogo = 'https://www.indianarmy.nic.in/writereaddata/images/slider/270526_Hindi_1.jpeg';
  const pspclOfficialLogo = 'https://pspcl.in/assets/images/logo.png';
  const pstclOfficialLogo = 'https://pstcl.org/images/logo.png';
  const technicalLogo = 'https://www.punjabteched.com/images/Clogo-blue.gif';
  const ctetLogo = 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png';

  const boards = [
    {
      id: 'psssb',
      abbreviation: 'PSSSB',
      name: 'Punjab Subordinate Services Selection Board',
      iconUrl: psssbLogo,
      region: 'Punjab',
      description: 'Official board for Group B and C recruitment nodes.'
    },
    {
      id: 'ppsc',
      abbreviation: 'PPSC',
      name: 'Punjab Public Service Commission',
      iconUrl: stateEmblem,
      region: 'Punjab',
      description: 'Official authority for Class A and B civil services.'
    },
    {
      id: 'punjab-police',
      abbreviation: 'Police',
      name: 'Punjab Police Recruitment',
      iconUrl: policeLogo,
      region: 'Punjab',
      description: 'District and Armed cadre recruitment registry.'
    },
    {
      id: 'pseb',
      abbreviation: 'PSEB',
      name: 'Punjab School Education Board (Schooling)',
      iconUrl: psebSchoolLogo,
      region: 'Punjab',
      description: 'Official board for school-level staff and schooling nodes.'
    },
    {
      id: 'edu-dept',
      abbreviation: 'PSTET',
      name: 'Punjab Education Department',
      iconUrl: eduDeptLogo,
      region: 'Punjab',
      description: 'ETT, Master Cadre, and PSTET recruitment hub.'
    },
    {
      id: 'pspcl',
      abbreviation: 'PSPCL',
      name: 'Punjab State Power Corporation Limited',
      iconUrl: pspclOfficialLogo,
      region: 'Punjab',
      description: 'Technical and clerical power sector recruitment.'
    },
    {
      id: 'pstcl',
      abbreviation: 'PSTCL',
      name: 'Punjab State Transmission Corporation',
      iconUrl: pstclOfficialLogo,
      region: 'Punjab',
      description: 'Technical and clerical transmission sector recruitment.'
    },
    {
      id: 'technical-edu',
      abbreviation: 'Technical',
      name: 'Punjab Technical Education Board',
      iconUrl: technicalLogo,
      region: 'Punjab',
      description: 'Punjab State Board of Technical Education and Industrial Training.'
    },
    {
      id: 'high-court',
      abbreviation: 'High Court',
      name: 'Punjab & Haryana High Court',
      iconUrl: hcOfficialLogo,
      region: 'Punjab',
      description: 'Judicial and clerical court recruitment registry.'
    },
    {
      id: 'indian-army',
      abbreviation: 'ARMY',
      name: 'Indian Army Hub',
      iconUrl: armyOfficialLogo,
      region: 'National',
      description: 'Official military recruitment gateway for Agniveer nodes.'
    },
    {
      id: 'ctet-central',
      abbreviation: 'CTET',
      name: 'Central Teacher Eligibility Test',
      iconUrl: ctetLogo,
      region: 'National',
      description: 'National level eligibility test for central schooling nodes.'
    }
  ];

  for (const b of boards) {
    await setDoc(doc(db, 'boards', b.id), { ...b, updatedAt: serverTimestamp() });
  }

  // 3. Subject Registry
  const subjects = [
    { id: 'punjab-gk', name: 'Punjab GK & Culture' },
    { id: 'mental-ability', name: 'Mental Ability / Reasoning' },
    { id: 'quant-aptitude', name: 'Quantitative Aptitude' },
    { id: 'english', name: 'English Language' },
    { id: 'punjabi', name: 'Punjabi Language' },
    { id: 'punjabi-qualifying', name: 'Punjabi Qualifying (Paper A)' },
    { id: 'ict-computers', name: 'ICT / Computers' },
    { id: 'evs-education', name: 'Environmental Studies (EVS)' },
    { id: 'child-pedagogy', name: 'Child Development & Pedagogy' },
    { id: 'static-gk', name: 'Indian GK & Static Hub' }
  ];

  for (const s of subjects) {
    await setDoc(doc(db, 'subjects', s.id), { ...s, updatedAt: serverTimestamp() });
  }

  // 4. Exam Hub Hierarchy
  const exams = [
    {
      id: 'psssb-patwari',
      boardId: 'psssb',
      name: 'Revenue Patwari',
      category: 'PSSSB',
      totalMocks: 20,
      activeQuestions: 2500,
      description: 'Official pattern mocks for Revenue and Canal Patwari.'
    },
    {
      id: 'agniveer-gd',
      boardId: 'indian-army',
      name: 'Agniveer GD / Tech',
      category: 'Defense',
      totalMocks: 15,
      activeQuestions: 1800,
      description: 'High-fidelity preparation series for Indian Army Agniveer.'
    },
    {
      id: 'ctet-paper-1',
      boardId: 'ctet-central',
      name: 'CTET Paper 1',
      category: 'Teaching',
      totalMocks: 10,
      activeQuestions: 1200,
      description: 'National level teacher eligibility for primary nodes.'
    }
  ];

  for (const e of exams) {
    await setDoc(doc(db, 'exams', e.id), { ...e, updatedAt: serverTimestamp() });
  }

  // 5. System Configuration
  await setDoc(doc(db, 'settings', 'global'), {
    platformName: "Cracklix",
    announcement: "🔥 Official Punjab 2026 Recruitment Calendar Live.",
    showAnnouncement: true,
    upiId: "arshdeepgrewal1122@okaxis",
    supportPhone: "+91 98881 88602",
    supportEmail: "cracklixhelp@gmail.com",
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('[REGISTRY] Institutional Registry Sync Complete.');
}
