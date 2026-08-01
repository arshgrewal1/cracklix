"use client"

import React, { useState, useMemo, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
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
  Trash2,
  Zap,
  CheckCircle,
  X,
  RefreshCw,
  Award,
  Check,
  Layers,
  Save,
  Flame,
  Search,
  Settings,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  Landmark,
  Target,
  History,
  Timer,
  SquarePen
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
  addDoc,
  deleteDoc
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin"
import { Switch } from "@/components/ui/switch"
import { mcqEngine, DiagnosticReport } from "@/lib/mcq-engine"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @fileOverview Daily Challenge Builder v50.0 [Compact & Hardened].
 * FIXED: ReferenceError for setQuizData.
 * COMPACT: Reduced card sizes and padding.
 */

export default function DailyQuizBuilder() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <DailyQuizBuilderContent />
    </Suspense>
  )
}

function DailyQuizBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()

  const id = searchParams?.get("id") ?? "";
  const isEditing = !!id

  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [diagnostic, setDiagnostic] = useState<DiagnosticReport | null>(null)
  const [initError, setInitError] = useState<string | null>(null);

  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]);
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db]);
  
  const { data: subjects } = useCollection<any>(subjectsQuery);
  const { data: boards } = useCollection<any>(boardsQuery);
  const { data: existingQuiz } = useDoc<any>(useMemo(() => (db && id ? doc(db, "daily_quizzes", id) : null), [db, id]));
  
  const [isInitializing, setIsInitializing] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState<'BANK' | 'ASSEMBLY'>('BANK')
  
  const [filterBoard, setFilterBoard] = useState("all")
  const [filterSubject, setSubjectFilter] = useState("all")
  const [filterDifficulty, setDifficultyFilter] = useState("all")
  const [filterStatus, setFilterStatus] = useState("UNUSED")
  const [searchTerm, setSearchTerm] = useState("")
  const [bankSelection, setBankSelection] = useState<string[]>([])
  
  const [quizData, setQuizData] = useState<any>({
    title: "", 
    description: "",
    duration: 15, 
    difficulty: "Medium", 
    isTodayQuiz: true,
    published: true,
    positiveMarks: 1,
    negativeMarks: 0.25,
    rewardXP: 100,
    featured: true,
    reviewModeEnabled: true,
    explanationModeEnabled: true
  })

  const [stagedQuestions, setStagedQuestions] = useState<any[]>([])

  const fetchFilteredBank = useCallback(async () => {
    if (!db) return;
    setBankLoading(true);
    setDiagnostic(null);
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
      setInitError("Registry connection degraded. Retrying...");
    } finally {
      setBankLoading(false);
    }
  }, [db, filterBoard, filterSubject, filterDifficulty, filterStatus, searchTerm]);

  useEffect(() => {
    fetchFilteredBank();
  }, [fetchFilteredBank]);

  useEffect(() => {
    if (!db || !existingQuiz) {
       if (!isEditing) setIsInitializing(false);
       return;
    }

    setQuizData({ ...existingQuiz });
    
    const hydrateExisting = async () => {
      if (existingQuiz.questionIds?.length > 0) {
        const fetched: any[] = [];
        const questionIds = existingQuiz.questionIds;
        const chunks = [];
        for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)); }
        
        for (const chunk of chunks) {
          const [mcqSnap, usedSnap, legacySnap] = await Promise.all([
             getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
             getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", chunk))),
             getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))
          ]);
          mcqSnap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id }));
          usedSnap.forEach(d => { if (!fetched.find(f => f.id === d.id)) fetched.push({ ...d.data(), id: d.id }); });
          legacySnap.forEach(d => { if (!fetched.find(f => f.id === d.id)) fetched.push({ ...d.data(), id: d.id }); });
        }
        const hydrated = (existingQuiz.questionIds as string[]).map(id => fetched.find(q => q.id === id)).filter(Boolean);
        setStagedQuestions(hydrated);
      }
      setIsInitializing(false);
    };

    hydrateExisting().catch(err => {
      setInitError("Failed to synchronize challenge data.");
      setIsInitializing(false);
    });
  }, [db, existingQuiz, isEditing, id]);

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
    if (!quizData.title.trim()) {
       toast({ variant: "destructive", title: "Audit blocked", description: "Title is mandatory." });
       return;
    }
    if (stagedQuestions.length === 0) {
       toast({ variant: "destructive", title: "Assembly area empty", description: "Add items to challenge." });
       return;
    }

    setIsPublishing(true);
    const finalId = id || `quiz-${Date.now()}`;
    const quizRef = doc(db, "daily_quizzes", finalId);

    try {
       const batch = writeBatch(db);

       if (!isDraft && quizData.isTodayQuiz) {
          const prevActiveSnap = await getDocs(query(collection(db, "daily_quizzes"), where("isTodayQuiz", "==", true)));
          prevActiveSnap.docs.forEach(d => {
             if (d.id !== finalId) {
                batch.update(doc(db, "daily_quizzes", d.id), { isTodayQuiz: false, updatedAt: serverTimestamp() });
             }
          });
       }

       const payload = {
          ...quizData,
          id: finalId,
          published: !isDraft,
          status: isDraft ? 'DRAFT' : 'PUBLISHED',
          totalQuestions: stagedQuestions.length,
          questionIds: stagedQuestions.map(q => q.id),
          totalMarks: stagedQuestions.length * Number(quizData.positiveMarks),
          updatedAt: serverTimestamp(),
          createdAt: isEditing ? (existingQuiz?.createdAt || serverTimestamp()) : serverTimestamp(),
          mockType: 'DAILY_CHALLENGE',
          accessLevel: 'FREE'
       };

       batch.set(quizRef, payload, { merge: true });

       if (!isDraft) {
         stagedQuestions.forEach(q => {
            const usedRef = doc(db, "usedQuestions", q.id);
            const bankRef = doc(db, "mcqBank", q.id);
            const legacyRef = doc(db, "questions", q.id);

            batch.set(usedRef, {
               ...q,
               originalQuestionId: q.id,
               usedAt: serverTimestamp(),
               usedBy: "Mock Builder",
               mockId: finalId,
               mockName: payload.title
            });
            
            batch.delete(bankRef);
            batch.delete(legacyRef);
         });
       }

       await batch.commit();

       await addDoc(collection(db, "audit_logs"), {
          user: profile?.name || "Administrator",
          action: isEditing ? "QUIZ_UPDATE" : "QUIZ_CREATE",
          details: `Daily challenge "${payload.title}" synchronized. ${isDraft ? 'Saved as Draft' : 'Questions Moved to Archive'}.`,
          timestamp: serverTimestamp()
       });

       toast({ title: "Database synced" });
       router.push("/admin/daily-quiz");
    } catch (e) {
       toast({ variant: "destructive", title: "Sync failed" });
    } finally { setIsPublishing(false); }
  };

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Synchronizing Hub...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-40 text-left pt-2 px-4 md:px-10 break-words">
      <AdminPageHeader
        icon={Flame}
        label="Challenge builder"
        title={isEditing ? "Modify challenge" : "New daily quiz"}
        subtitle="Configure the official daily items."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto mt-4 md:mt-0">
           <button onClick={() => setStagedQuestions([])} className="h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all border-none cursor-pointer text-slate-400 font-bold uppercase text-[9px]">Reset</button>
           <Button onClick={() => handlePublish(true)} variant="outline" className="h-11 px-5 rounded-xl font-bold uppercase text-[9px] tracking-tight border-slate-200 text-[#0F172A]">Save draft</Button>
           <Button onClick={() => handlePublish(false)} disabled={isPublishing} className="h-11 px-6 bg-primary hover:bg-blue-700 text-white rounded-full font-bold uppercase text-[9px] tracking-tight shadow-xl gap-2 border-none transition-all active:scale-95">
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Sync live
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
         <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-lg rounded-2xl bg-white p-5 md:p-8 space-y-8 border border-slate-50">
               <div className="space-y-1 text-left">
                  <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Challenge title</Label>
                  <Input value={quizData.title} onChange={e => setQuizData({...quizData, title: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-none font-bold text-sm px-4 shadow-inner text-[#0F172A]" placeholder="e.g. Daily Challenge #12" />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                     <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Duration (Min)</Label>
                     <Input type="number" value={quizData.duration} onChange={e => setQuizData({...quizData, duration: parseInt(e.target.value) || 0})} className="h-10 rounded-xl bg-slate-50 border-none font-black text-center shadow-inner text-[#0F172A] text-xs" />
                  </div>
                  <div className="space-y-1 text-left">
                     <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Pts per item</Label>
                     <Input type="number" value={quizData.positiveMarks} onChange={e => setQuizData({...quizData, positiveMarks: parseFloat(e.target.value) || 1})} className="h-10 rounded-xl bg-slate-50 border-none font-black text-center text-emerald-600 shadow-inner text-xs" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                     <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Difficulty</Label>
                     <select value={quizData.difficulty} onChange={e => setQuizData({...quizData, difficulty: e.target.value})} className="w-full h-10 bg-slate-50 border-none rounded-xl px-3 font-bold text-[10px] outline-none text-[#0F172A]">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                     </select>
                  </div>
                  <div className="space-y-1 text-left">
                     <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Reward XP</Label>
                     <Input type="number" value={quizData.rewardXP} onChange={e => setQuizData({...quizData, rewardXP: parseInt(e.target.value) || 0})} className="h-10 rounded-xl bg-slate-50 border-none font-black text-center text-primary shadow-inner text-xs" />
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-slate-50">
                  <ConfigSwitch label="Official challenge" checked={quizData.isTodayQuiz} onChange={(v: boolean) => setQuizData({...quizData, isTodayQuiz: v})} />
                  <ConfigSwitch label="Review mode" checked={quizData.reviewModeEnabled} onChange={(v: boolean) => setQuizData({...quizData, reviewModeEnabled: v})} />
               </div>
            </Card>
         </div>

         <div className="lg:col-span-8 space-y-8">
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-2">
               <button onClick={() => setActiveTab('BANK')} className={cn("px-6 py-2 rounded-lg font-bold uppercase text-[9px] tracking-tight transition-all bg-transparent border-none cursor-pointer", activeTab === 'BANK' ? "bg-white text-[#0F172A] shadow-md" : "text-slate-400 hover:text-slate-600")}>Database pool</button>
               <button onClick={() => setActiveTab('ASSEMBLY')} className={cn("px-6 py-2 rounded-lg font-bold uppercase text-[9px] tracking-tight transition-all bg-transparent border-none cursor-pointer", activeTab === 'ASSEMBLY' ? "bg-white text-[#0F172A] shadow-md" : "text-slate-400 hover:text-slate-600")}>Assembly</button>
            </div>

            {activeTab === 'BANK' ? (
               <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-1">
                     <PremiumFilterCard 
                        icon={<Landmark className="text-blue-500" />}
                        label="Board"
                        value={filterBoard}
                        onChange={setFilterBoard}
                        options={boards?.map((b: any) => ({ label: b.abbreviation, value: b.id })) || []}
                     />
                     <PremiumFilterCard 
                        icon={<BookOpen className="text-emerald-500" />}
                        label="Subject"
                        value={filterSubject}
                        onChange={setSubjectFilter}
                        options={subjects?.map((s: any) => ({ label: s.name, value: s.id })) || []}
                     />
                     <PremiumFilterCard 
                        icon={<Target className="text-purple-500" />}
                        label="Status"
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={[{ label: 'Unused Items', value: 'UNUSED' }, { label: 'Used Items', value: 'USED' }]}
                     />
                  </div>

                  <div className="relative group w-full px-1">
                     <div className="relative flex items-center h-12 bg-white border border-slate-100 rounded-xl shadow-sm px-4 gap-3 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary" />
                        <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 font-bold text-sm" placeholder="Search database..." />
                     </div>
                  </div>

                  <Card className="border border-slate-100 shadow-xl rounded-2xl bg-white p-5 md:p-6 text-left mx-1">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                           <div className="relative shrink-0 flex items-center justify-center w-16 h-16">
                              <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                                 <circle cx="50%" cy="50%" r="42%" className="stroke-slate-100 fill-none" strokeWidth="4" />
                                 <motion.circle 
                                    cx="50%" cy="50%" r="42%" 
                                    className="stroke-[#2563EB] fill-none" 
                                    strokeWidth="4" 
                                    strokeLinecap="round"
                                    animate={{ strokeDashoffset: 130 - (130 * Math.min(bankSelection.length, 100) / 100) }}
                                    style={{ strokeDasharray: 130 }}
                                 />
                              </svg>
                              <div className="flex flex-col items-center justify-center text-center">
                                 <span className="text-lg font-black text-[#0F172A] tabular-nums leading-none">{bankSelection.length}</span>
                                 <span className="text-[7px] font-black text-slate-400 uppercase mt-1">Ready</span>
                              </div>
                           </div>
                           <div className="flex-1 space-y-3 text-center md:text-left w-full min-w-0">
                              <div className="space-y-0.5">
                                 <h4 className="text-base font-black text-[#0F172A] uppercase tracking-tight">Assets Staged</h4>
                                 <p className="text-[10px] font-medium text-slate-500">Linked to challenge node.</p>
                              </div>
                              <button 
                                onClick={handleLinkSelected} 
                                disabled={bankSelection.length === 0} 
                                className="w-full md:w-auto h-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg border-none transition-all active:scale-95 flex items-center justify-center gap-2 px-6"
                              >
                                 Link items <ArrowRight className="h-3 w-3" />
                              </button>
                           </div>
                        </div>
                  </Card>

                  <div className="grid grid-cols-1 gap-3 pt-4 px-1">
                     {bankLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl bg-white" />)
                     ) : displayBank.length > 0 ? displayBank.map((q) => {
                        const isSel = bankSelection.includes(q.id);
                        return (
                           <motion.div key={q.id} whileHover={{ scale: 1.005 }}>
                              <div onClick={() => setBankSelection(prev => isSel ? prev.filter(id => id !== q.id) : [...prev, q.id])} className={cn("p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group", isSel ? "bg-primary/5 border-primary shadow-md" : "bg-white border-slate-50 hover:border-slate-100 shadow-sm")}>
                                 <div className="flex items-center gap-4 min-w-0">
                                    <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all", isSel ? "bg-primary border-primary shadow-md" : "bg-white border-slate-200")}>
                                       {isSel && <Check className="h-3 w-3 text-white stroke-[4px]" />}
                                    </div>
                                    <div className="min-w-0 text-left">
                                       <p className="font-bold text-[#0F172A] text-[12px] md:text-sm leading-tight break-words line-clamp-1">{q.englishQuestion}</p>
                                       <div className="flex items-center gap-3 mt-1">
                                          <Badge className="bg-slate-50 text-slate-500 border-none text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">{subjects?.find((s:any) => s.id === q.subjectId)?.name || 'General'}</Badge>
                                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{q.difficulty}</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        )
                     }) : (
                        <div className="py-20 text-center opacity-30 italic font-black uppercase text-lg flex flex-col items-center gap-4">
                           <AlertCircle className="h-10 w-10 text-slate-300" />
                           No items available
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               <div className="space-y-6 animate-in fade-in duration-500 px-1">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Layers className="h-5 w-5 text-primary" /> Active hub</h3>
                     <Badge className="bg-[#0F172A] text-white border-none font-bold text-[9px] px-3 py-1 rounded-lg">{stagedQuestions.length} items</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                     {stagedQuestions.map((q, idx) => (
                        <Card key={q.id} className="border-none shadow-md rounded-xl bg-white group hover:shadow-lg transition-all border border-slate-100 overflow-hidden">
                           <CardContent className="p-4 md:px-6 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 min-w-0 text-left">
                                 <span className="text-[10px] md:text-xs font-black text-primary tabular-nums shrink-0">#{idx + 1}</span>
                                 <p className="font-bold text-[#0F172A] text-[11px] md:text-sm leading-tight truncate max-w-md">{q.englishQuestion}</p>
                              </div>
                              <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-8 w-8 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all flex items-center justify-center active:scale-90 border-none bg-transparent cursor-pointer"><X className="h-4 w-4" /></button>
                           </CardContent>
                        </Card>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  )
}

function ConfigSwitch({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
   return (
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all">
         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
         <Switch checked={checked} onCheckedChange={onChange} />
      </div>
   )
}

function PremiumFilterCard({ icon, label, value, onChange, options }: any) {
   return (
      <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl p-4 space-y-2 group">
         <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
               {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" }) : null}
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{label}</span>
         </div>
         <select 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full h-9 bg-slate-50 border-none rounded-lg px-3 font-bold text-[10px] outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all text-[#0F172A]"
         >
            <option value="all">All</option>
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
         </select>
      </Card>
   );
}
