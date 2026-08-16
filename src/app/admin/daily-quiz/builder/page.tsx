
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
  SquarePen,
  Languages
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
 * @fileOverview Daily Challenge Builder v54.0 [Language Support Added].
 * TERMINOLOGY: Replaced 'items' with 'questions'.
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

  const [bankLoading, setBankLoading] = useState(false);
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
    explanationModeEnabled: true,
    languageMode: "ENGLISH_PUNJABI"
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
      setInitError("Database connection degraded. Retrying...");
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

    setQuizData({ 
      ...existingQuiz,
      languageMode: existingQuiz.languageMode || "ENGLISH_PUNJABI"
    });
    
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
    toast({ title: "Questions linked" });
  };

  const handlePublish = async (isDraft: boolean) => {
    if (!db || isPublishing) return;
    if (!quizData.title.trim()) {
       toast({ variant: "destructive", title: "Audit blocked", description: "Title is mandatory." });
       return;
    }
    if (stagedQuestions.length === 0) {
       toast({ variant: "destructive", title: "Assembly area empty", description: "Add questions to challenge." });
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
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 pb-40 text-left pt-2 px-2 md:px-6 break-words">
      <AdminPageHeader
        icon={Flame}
        label="Challenge builder"
        title={isEditing ? "Modify challenge" : "New daily quiz"}
        subtitle="Configure official daily questions."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto mt-4 md:mt-0">
           <button onClick={() => setStagedQuestions([])} className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer text-slate-400 font-bold uppercase text-[9px]">Reset</button>
           <Button onClick={() => handlePublish(true)} variant="outline" className="h-10 px-4 rounded-xl font-bold uppercase text-[9px] tracking-tight border-slate-200 text-[#0F172A]">Save draft</Button>
           <Button onClick={() => handlePublish(false)} disabled={isPublishing} className="h-10 px-5 bg-primary hover:bg-blue-700 text-white rounded-full font-bold uppercase text-[9px] tracking-tight shadow-xl gap-2 border-none transition-all active:scale-95">
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Sync live
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
         <div className="lg:col-span-4 space-y-4">
            <Card className="border-none shadow-lg rounded-2xl bg-white p-5 md:p-6 space-y-6 border border-slate-50">
               <div className="space-y-1 text-left">
                  <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Challenge title</Label>
                  <Input value={quizData.title} onChange={e => setQuizData({...quizData, title: e.target.value})} className="h-10 rounded-xl bg-slate-50 border-none font-bold text-sm px-4 shadow-inner text-[#0F172A]" placeholder="Daily Challenge #12" />
               </div>

               <div className="space-y-1 text-left">
                  <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase flex items-center gap-2">
                     <Languages className="h-3 w-3 text-primary" /> Language
                  </Label>
                  <select value={quizData.languageMode} onChange={e => setQuizData({...quizData, languageMode: e.target.value})} className="w-full h-9 bg-slate-50 border-none rounded-xl px-3 font-bold text-[10px] outline-none text-[#0F172A]">
                     <option value="ENGLISH">English Only</option>
                     <option value="PUNJABI">Punjabi Only</option>
                     <option value="HINDI">Hindi Only</option>
                     <option value="ENGLISH_PUNJABI">Punjabi & English</option>
                     <option value="ENGLISH_HINDI">Hindi & English</option>
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                     <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Duration (Min)</Label>
                     <Input type="number" value={quizData.duration} onChange={e => setQuizData({...quizData, duration: parseInt(e.target.value) || 0})} className="h-9 rounded-xl bg-slate-50 border-none font-black text-center shadow-inner text-[#0F172A] text-xs" />
                  </div>
                  <div className="space-y-1 text-left">
                     <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Pts per question</Label>
                     <Input type="number" value={quizData.positiveMarks} onChange={e => setQuizData({...quizData, positiveMarks: parseFloat(e.target.value) || 1})} className="h-9 rounded-xl bg-slate-50 border-none font-black text-center text-emerald-600 shadow-inner text-xs" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                     <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Difficulty</Label>
                     <select value={quizData.difficulty} onChange={e => setQuizData({...quizData, difficulty: e.target.value})} className="w-full h-9 bg-slate-50 border-none rounded-xl px-3 font-bold text-[10px] outline-none text-[#0F172A]">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                     </select>
                  </div>
                  <div className="space-y-1 text-left">
                     <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Reward XP</Label>
                     <Input type="number" value={quizData.rewardXP} onChange={e => setQuizData({...quizData, rewardXP: parseInt(e.target.value) || 0})} className="h-9 rounded-xl bg-slate-50 border-none font-black text-center text-primary shadow-inner text-xs" />
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-slate-50">
                  <ConfigSwitch label="Official challenge" checked={quizData.isTodayQuiz} onChange={(v: boolean) => setQuizData({...quizData, isTodayQuiz: v})} />
                  <ConfigSwitch label="Review mode" checked={quizData.reviewModeEnabled} onChange={(v: boolean) => setQuizData({...quizData, reviewModeEnabled: v})} />
               </div>
            </Card>
         </div>

         <div className="lg:col-span-8 space-y-6">
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-2">
               <button onClick={() => setActiveTab('BANK')} className={cn("px-4 py-2 rounded-lg font-bold uppercase text-[9px] tracking-tight transition-all bg-transparent border-none cursor-pointer", activeTab === 'BANK' ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600")}>Database pool</button>
               <button onClick={() => setActiveTab('ASSEMBLY')} className={cn("px-4 py-2 rounded-lg font-bold uppercase text-[9px] tracking-tight transition-all bg-transparent border-none cursor-pointer", activeTab === 'ASSEMBLY' ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600")}>Assembly</button>
            </div>

            {activeTab === 'BANK' ? (
               <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-1">
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
                        options={[{ label: 'Unused', value: 'UNUSED' }, { label: 'Used', value: 'USED' }]}
                     />
                  </div>

                  <div className="relative group w-full px-1">
                     <div className="relative flex items-center h-10 bg-white border border-slate-100 rounded-xl shadow-sm px-4 gap-3">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 font-bold text-xs" placeholder="Search database..." />
                     </div>
                  </div>

                  <Card className="border border-slate-100 shadow-xl rounded-2xl bg-white p-4 text-left mx-1">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                           <div className="relative shrink-0 flex items-center justify-center w-12 h-12">
                              <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                                 <circle cx="50%" cy="50%" r="42%" className="stroke-slate-100 fill-none" strokeWidth="3" />
                                 <motion.circle 
                                    cx="50%" cy="50%" r="42%" 
                                    className="stroke-[#2563EB] fill-none" 
                                    strokeWidth="3" 
                                    strokeLinecap="round"
                                    animate={{ strokeDashoffset: 130 - (130 * Math.min(bankSelection.length, 100) / 100) }}
                                    style={{ strokeDasharray: 130 }}
                                 />
                              </svg>
                              <span className="text-sm font-black text-[#0F172A] tabular-nums leading-none">{bankSelection.length}</span>
                           </div>
                           <div className="flex-1 text-left w-full min-w-0">
                              <button 
                                onClick={handleLinkSelected} 
                                disabled={bankSelection.length === 0} 
                                className="w-full md:w-auto h-9 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[8px] tracking-widest rounded-xl shadow-lg border-none flex items-center justify-center gap-2 px-6 transition-all"
                              >
                                 Link questions <ArrowRight className="h-3 w-3" />
                              </button>
                           </div>
                        </div>
                  </Card>

                  <div className="grid grid-cols-1 gap-2 pt-2 px-1">
                     {bankLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl bg-white" />)
                     ) : displayBank.length > 0 ? displayBank.map((q) => {
                        const isSel = bankSelection.includes(q.id);
                        return (
                           <div key={q.id} onClick={() => setBankSelection(prev => isSel ? prev.filter(id => id !== q.id) : [...prev, q.id])} className={cn("p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group", isSel ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-slate-50 hover:border-slate-100 shadow-sm")}>
                              <div className="flex items-center gap-3 min-w-0">
                                 <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all", isSel ? "bg-primary border-primary" : "bg-white border-slate-200")}>
                                    {isSel && <Check className="h-2 w-2 text-white stroke-[4px]" />}
                                 </div>
                                 <div className="min-w-0 text-left">
                                    <p className="font-bold text-[#0F172A] text-[11px] leading-tight break-words line-clamp-1">{q.englishQuestion}</p>
                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{q.difficulty} • {subjects?.find((s:any) => s.id === q.subjectId)?.name || 'General'}</p>
                                 </div>
                              </div>
                           </div>
                        )
                     }) : (
                        <div className="py-20 text-center opacity-30 italic font-black uppercase text-xs flex flex-col items-center gap-3">
                           <AlertCircle className="h-8 w-8 text-slate-300" />
                           No questions available
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               <div className="space-y-4 animate-in fade-in duration-500 px-1">
                  <div className="flex items-center justify-between">
                     <h3 className="text-base font-black text-[#0F172A] uppercase flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Staged questions</h3>
                     <Badge className="bg-[#0F172A] text-white border-none font-bold text-[9px] px-3 py-1 rounded-lg">{stagedQuestions.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                     {stagedQuestions.map((q, idx) => (
                        <Card key={q.id} className="border-none shadow-md rounded-xl bg-white border border-slate-100 overflow-hidden">
                           <CardContent className="p-3 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0 text-left">
                                 <span className="text-[10px] font-black text-primary tabular-nums shrink-0">#{idx + 1}</span>
                                 <p className="font-bold text-[#0F172A] text-[11px] leading-tight truncate">{q.englishQuestion}</p>
                              </div>
                              <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-7 w-7 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all flex items-center justify-center border-none bg-transparent cursor-pointer"><X className="h-3 w-3" /></button>
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
      <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all rounded-xl p-3 space-y-2 group h-full">
         <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
               {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-3.5 w-3.5" }) : null}
            </div>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-tight">{label}</span>
         </div>
         <select 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full h-8 bg-slate-50 border-none rounded-lg px-2 font-bold text-[9px] outline-none appearance-none cursor-pointer text-[#0F172A]"
         >
            <option value="all">All</option>
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
         </select>
      </Card>
   );
}
