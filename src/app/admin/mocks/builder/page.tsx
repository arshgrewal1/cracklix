"use client"

import React, { useState, useMemo, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ChevronLeft, 
  ChevronRight,
  Database, 
  Loader2,
  Plus,
  Zap,
  CheckCircle,
  X,
  RefreshCw,
  Award,
  Check,
  Layers,
  PenSquare,
  Search,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Landmark,
  Target,
  History,
  Timer
} from "lucide-react"
import { useCollection, useFirestore, useDoc, useUser } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDocs, 
  writeBatch, 
  documentId, 
  orderBy, 
  updateDoc, 
  increment, 
  addDoc
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin"
import { Switch } from "@/components/ui/switch"
import { mcqEngine, DiagnosticReport } from "@/lib/mcq-engine"
import { motion, AnimatePresence } from "framer-motion"
import { MockType, AccessLevel } from "@/types"

/**
 * @fileOverview Universal Test Architect v1.3 [Syntax Fixed].
 * FIXED: Corrected malformed query ternary on line 96.
 */

export default function MockTestBuilder() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <MockBuilderContent />
    </Suspense>
  )
}

function MockBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()

  const id = searchParams?.get("id") ?? ""
  const isEditing = !!id

  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [diagnostic, setDiagnostic] = useState<DiagnosticReport | null>(null)
  const [initError, setInitError] = useState<string | null>(null);

  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]);
  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]);
  
  const { data: subjects } = useCollection<any>(subjectsQuery);
  const { data: boards } = useCollection<any>(boardsQuery);
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: allSeries } = useCollection<any>(useMemo(() => (db ? collection(db, "test_series") : null), [db]));
  const { data: existingMock } = useDoc<any>(useMemo(() => (db && id ? doc(db, "mocks", id) : null), [db, id]));
  
  const [isInitializing, setIsInitializing] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState<'BANK' | 'ASSEMBLY'>('BANK')
  
  const [filterBoard, setFilterBoard] = useState("all")
  const [filterSubject, setSubjectFilter] = useState("all")
  const [filterDifficulty, setDifficultyFilter] = useState("all")
  const [filterStatus, setFilterStatus] = useState("UNUSED")
  const [searchTerm, setSearchTerm] = useState("")
  const [bankSelection, setBankSelection] = useState<string[]>([])
  
  const [mockData, setMockData] = useState<any>({
    title: "", 
    description: "",
    duration: 120, 
    difficulty: "Medium", 
    published: true,
    positiveMarks: 1,
    negativeMarks: 0.25,
    mockType: "FULL" as MockType,
    accessLevel: "PREMIUM" as AccessLevel,
    boardId: "",
    boardIds: [],
    examIds: [],
    seriesId: "",
    learningSubjectId: ""
  })

  const [stagedQuestions, setStagedQuestions] = useState<any[]>([])

  const fetchFilteredBank = useCallback(async () => {
    if (!db) return;
    setBankLoading(true);
    try {
      const result = await mcqEngine.fetch(db, {
        boardId: filterBoard,
        subjectId: filterSubject,
        difficulty: filterDifficulty,
        status: filterStatus,
        searchTerm: searchTerm,
      }, 100);

      setQuestionBank(result.data);
      setDiagnostic(result.diagnostic);
    } catch (e: any) {
      setInitError("Registry connection degraded.");
    } finally {
      setBankLoading(false);
    }
  }, [db, filterBoard, filterSubject, filterDifficulty, filterStatus, searchTerm]);

  useEffect(() => {
    fetchFilteredBank();
  }, [fetchFilteredBank]);

  useEffect(() => {
    if (!db || !existingMock) {
       if (!isEditing) setIsInitializing(false);
       return;
    }

    setMockData({ ...existingMock });
    
    const hydrateExisting = async () => {
      if (existingMock.questionIds?.length > 0) {
        const fetched: any[] = [];
        const questionIds = existingMock.questionIds;
        const chunks = [];
        for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)); }
        
        for (const chunk of chunks) {
          const [mcqSnap, usedSnap] = await Promise.all([
             getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
             getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", chunk)))
          ]);
          mcqSnap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id }));
          usedSnap.forEach(d => { if (!fetched.find(f => f.id === d.id)) fetched.push({ ...d.data(), id: d.id }); });
        }
        const hydrated = (existingMock.questionIds as string[]).map(id => fetched.find(q => q.id === id)).filter(Boolean);
        setStagedQuestions(hydrated);
      }
      setIsInitializing(false);
    };

    hydrateExisting().catch(() => setIsInitializing(false));
  }, [db, existingMock, isEditing]);

  const displayBank = useMemo(() => {
    const stagedIds = new Set(stagedQuestions.map(q => q.id));
    return questionBank.filter(q => !stagedIds.has(q.id));
  }, [questionBank, stagedQuestions]);

  const handleLinkSelected = () => {
    const toAdd = questionBank.filter((q: any) => bankSelection.includes(q.id));
    setStagedQuestions(prev => [...prev, ...toAdd]);
    setBankSelection([]);
    toast({ title: "Assets linked" });
  };

  const handlePublish = async (isDraft: boolean) => {
    if (!db || isPublishing) return;
    if (!mockData.title.trim()) { toast({ variant: "destructive", title: "Title mandatory" }); return; }
    if (stagedQuestions.length === 0) { toast({ variant: "destructive", title: "Assembly empty" }); return; }

    setIsPublishing(true);
    const finalId = id || `mock-${Date.now()}`;
    const mockRef = doc(db, "mocks", finalId);

    try {
       const batch = writeBatch(db);
       const payload = {
          ...mockData,
          id: finalId,
          published: !isDraft,
          status: isDraft ? 'DRAFT' : 'PUBLISHED',
          totalQuestions: stagedQuestions.length,
          questionIds: stagedQuestions.map(q => q.id),
          totalMarks: stagedQuestions.length * Number(mockData.positiveMarks),
          updatedAt: serverTimestamp(),
          createdAt: isEditing ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
       };

       batch.set(mockRef, payload, { merge: true });

       if (!isDraft) {
         stagedQuestions.forEach(q => {
            const usedRef = doc(db, "usedQuestions", q.id);
            const bankRef = doc(db, "mcqBank", q.id);
            batch.set(usedRef, { ...q, usedAt: serverTimestamp(), mockId: finalId, mockName: payload.title }, { merge: true });
            batch.update(bankRef, { status: 'USED', updatedAt: serverTimestamp() });
         });
       }

       await batch.commit();

       await addDoc(collection(db, "audit_logs"), {
          user: profile?.name || "Administrator",
          action: isEditing ? "MOCK_UPDATE" : "MOCK_CREATE",
          details: `Test "${payload.title}" synchronized.`,
          timestamp: serverTimestamp()
       });

       toast({ title: "Database synced" });
       router.push("/admin/mocks");
    } catch (e) {
       toast({ variant: "destructive", title: "Sync failed" });
    } finally { setIsPublishing(false); }
  };

  if (isInitializing) return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-40 text-left pt-2 px-1">
      <AdminPageHeader
        icon={PenSquare}
        label="Institutional test architect"
        title={isEditing ? "Modify test" : "New test architect"}
        subtitle="Construct professional mock tests from the item bank."
      >
        <div className="flex flex-wrap gap-3">
           <button onClick={() => setStagedQuestions([])} className="h-11 px-6 rounded-xl border border-slate-200 font-bold uppercase text-[10px] bg-white hover:bg-slate-50">Reset</button>
           <Button onClick={() => handlePublish(true)} variant="outline" className="h-11 px-6 rounded-xl font-bold uppercase text-[10px] border-slate-200">Save draft</Button>
           <Button onClick={() => handlePublish(false)} disabled={isPublishing} className="h-11 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-bold uppercase text-[10px] shadow-xl gap-2 border-none">
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />} Sync live
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-8 border border-slate-50">
               <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Test title</Label>
                  <Input value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="h-12 md:h-14 rounded-xl bg-slate-50 border-none font-bold" placeholder="e.g. Patwari Full Mock #01" />
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Authority hubs</Label>
                     <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-slate-50 rounded-xl">
                        {boards?.map((b: any) => (
                           <button 
                              key={b.id} 
                              onClick={() => {
                                 const current = mockData.boardIds || [];
                                 const next = current.includes(b.id) ? current.filter((id:string) => id !== b.id) : [...current, b.id];
                                 setMockData({...mockData, boardIds: next, boardId: next[0] || ""});
                              }}
                              className={cn(
                                 "px-3 py-1 rounded-lg font-bold text-[9px] uppercase border transition-all",
                                 mockData.boardIds?.includes(b.id) ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-white border-slate-200 text-slate-400"
                              )}
                           >
                              {b.abbreviation}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Subject hub</Label>
                     <select value={mockData.learningSubjectId} onChange={e => setMockData({...mockData, learningSubjectId: e.target.value, seriesId: ""})} className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs">
                        <option value="">Select Subject</option>
                        {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Test series (L2)</Label>
                     <select value={mockData.seriesId} onChange={e => setMockData({...mockData, seriesId: e.target.value})} className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs" disabled={!mockData.learningSubjectId}>
                        <option value="">Select Series</option>
                        {allSeries?.filter((s: any) => s.subjectId === mockData.learningSubjectId).map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                     </select>
                  </div>
               </div>

               <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Test type</Label>
                  <select value={mockData.mockType} onChange={e => setMockData({...mockData, mockType: e.target.value as MockType})} className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs">
                     <option value="FULL">Full Length Mock</option>
                     <option value="SUBJECT">Subject Specific</option>
                     <option value="SECTIONAL">Sectional Test</option>
                     <option value="PYQ">Previous Year Paper</option>
                     <option value="MINI_TEST">Mini Test</option>
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Duration (Min)</Label>
                     <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} className="h-11 rounded-xl bg-slate-50 border-none font-black text-center" />
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Difficulty</Label>
                     <select value={mockData.difficulty} onChange={e => setMockData({...mockData, difficulty: e.target.value})} className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none text-[#0F172A]">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="Expert">Expert</option>
                     </select>
                  </div>
               </div>

               <div className="space-y-4 pt-6 border-t border-slate-50 text-left">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Access level</span>
                     <select value={mockData.accessLevel} onChange={e => setMockData({...mockData, accessLevel: e.target.value as AccessLevel})} className="bg-transparent border-none font-black text-[10px] text-primary outline-none">
                        <option value="FREE">Free Hub</option>
                        <option value="PREMIUM">Elite Hub</option>
                     </select>
                  </div>
               </div>
            </Card>
         </div>

         <div className="lg:col-span-8 space-y-8">
            <div className="flex bg-slate-100 p-1 rounded-2xl w-fit gap-1">
               <button onClick={() => setActiveTab('BANK')} className={cn("px-8 py-2.5 rounded-xl font-bold uppercase text-[10px] transition-all border-none cursor-pointer", activeTab === 'BANK' ? "bg-white text-primary shadow-sm" : "text-slate-400 bg-transparent")}>Database pool</button>
               <button onClick={() => setActiveTab('ASSEMBLY')} className={cn("px-8 py-2.5 rounded-xl font-bold uppercase text-[10px] transition-all border-none cursor-pointer", activeTab === 'ASSEMBLY' ? "bg-white text-primary shadow-sm" : "text-slate-400 bg-transparent")}>Active staging</button>
            </div>

            {activeTab === 'BANK' ? (
               <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <FilterNode label="Board" value={filterBoard} onChange={setFilterBoard} options={boards?.map((b: any) => ({ label: b.abbreviation, value: b.id })) || []} />
                     <FilterNode label="Subject" value={filterSubject} onChange={setSubjectFilter} options={subjects?.map((s: any) => ({ label: s.name, value: s.id })) || []} />
                     <FilterNode label="Status" value={filterStatus} onChange={setFilterStatus} options={[{ label: 'Unused', value: 'UNUSED' }, { label: 'Used', value: 'USED' }]} />
                     <div className="relative pt-6">
                        <Search className="absolute left-3 bottom-3.5 h-4 w-4 text-slate-300" />
                        <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-11 rounded-xl bg-white border-slate-100 font-bold" placeholder="Search keywords..." />
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">{bankSelection.length} Items selected</p>
                     <Button onClick={handleLinkSelected} disabled={bankSelection.length === 0} className="h-11 px-8 bg-[#0F172A] hover:bg-black text-white font-bold text-[10px] uppercase rounded-xl shadow-lg border-none transition-all active:scale-95 flex items-center gap-2">
                        Stage items <ArrowRight className="h-4 w-4" />
                     </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                     {bankLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white" />)
                     ) : displayBank.map((q) => {
                        const isSel = bankSelection.includes(q.id);
                        return (
                           <div key={q.id} onClick={() => setBankSelection(prev => isSel ? prev.filter(id => id !== q.id) : [...prev, q.id])} className={cn("p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6", isSel ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-slate-50 hover:border-slate-100")}>
                              <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0", isSel ? "bg-primary border-primary" : "bg-white border-slate-200")}>
                                 {isSel && <Check className="h-4 w-4 text-white" />}
                              </div>
                              <div className="min-w-0 text-left">
                                 <p className="font-bold text-[#0F172A] text-sm leading-tight line-clamp-1">{q.englishQuestion}</p>
                                 <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">{subjects?.find((s:any) => s.id === q.subjectId)?.name || 'General'}</p>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            ) : (
               <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 gap-3">
                     {stagedQuestions.map((q, idx) => (
                        <div key={q.id} className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group shadow-sm">
                           <div className="flex items-center gap-4 min-w-0">
                              <span className="text-xs font-black text-slate-200">#{idx + 1}</span>
                              <p className="font-bold text-[#0F172A] text-sm truncate">{q.englishQuestion}</p>
                           </div>
                           <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-8 w-8 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all flex items-center justify-center active:scale-90 border-none bg-transparent cursor-pointer"><X className="h-4 w-4" /></button>
                        </div>
                     ))}
                     {stagedQuestions.length === 0 && (
                        <div className="h-80 flex flex-col items-center justify-center text-slate-300 opacity-20 border-2 border-dashed border-slate-100 rounded-[3rem] space-y-4">
                           <Layers className="h-12 w-12" />
                           <p className="font-bold uppercase tracking-widest">Architectural area empty</p>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  )
}

function FilterNode({ label, value, onChange, options }: any) {
   return (
      <div className="space-y-1.5 text-left">
         <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">{label}</Label>
         <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none">
            <option value="all">All {label}s</option>
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
         </select>
      </div>
   );
}
