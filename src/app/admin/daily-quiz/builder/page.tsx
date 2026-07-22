
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
  Trash2,
  Zap,
  CheckCircle2,
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
  DocumentData, 
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
 * @fileOverview Daily Challenge Builder v45.4 [High-Density Content Fix].
 * FIXED: Reduced font size and removed line-clamping in composition area to ensure full question visibility.
 * UPDATED: Changed default section name to "General".
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

  const quizId = searchParams?.get("id") ?? ""
  const isEditing = !!quizId

  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [diagnostic, setDiagnostic] = useState<DiagnosticReport | null>(null)
  const [initError, setInitError] = useState<string | null>(null);

  const { data: subjects } = useCollection<any>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))
  const { data: existingQuiz } = useDoc<any>(useMemo(() => (db && quizId ? doc(db, "daily_quizzes", quizId) : null), [db, quizId]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  
  const [isInitializing, setIsInitializing] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState<'BANK' | 'ASSEMBLY'>('BANK')
  
  const [filterBoard, setFilterBoard] = useState("all")
  const [filterSubject, setSubjectFilter] = useState("all")
  const [filterDifficulty, setDifficultyFilter] = useState("all")
  const [filterStatus, setFilterStatus] = useState("UNUSED") // Default to fresh items
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
        const chunks = [];
        const questionIds = existingQuiz.questionIds;
        for (let i = 0; i < questionIds.length; i += 30) {
          chunks.push(questionIds.slice(i, i + 30));
        }
        for (const chunk of chunks) {
          const [mcqSnap, usedSnap, legacySnap] = await Promise.all([
             getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
             getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", chunk))),
             getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))
          ]);
          mcqSnap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id }));
          usedSnap.forEach(d => {
            if (!fetched.find(f => f.id === d.id)) fetched.push({ ...d.data(), id: d.id });
          });
          legacySnap.forEach(d => {
            if (!fetched.find(f => f.id === d.id)) fetched.push({ ...d.data(), id: d.id });
          });
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
  }, [db, existingQuiz, isEditing]);

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
    const finalId = quizId || `quiz-${Date.now()}`;
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

       // MOVE QUESTIONS TO USED POOL AND DELETE FROM BANK
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
          details: `Daily challenge "${payload.title}" synchronized. ${isDraft ? 'Saved as Draft' : 'Questions Moved to usedQuestions Archive'}.`,
          timestamp: serverTimestamp()
       });

       toast({ title: "Database synced" });
       router.push("/admin/daily-quiz");
    } catch (e) {
       toast({ variant: "destructive", title: "Sync failed" });
    } finally { setIsPublishing(false); }
  };

  if (isInitializing) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1528] space-y-8">
        <Zap className="h-12 w-12 text-primary animate-pulse" />
        <p className="text-[10px] font-black uppercase text-slate-300">Synchronizing Hub...</p>
     </div>
  );

  if (initError) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-10 text-center space-y-10">
       <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
          <AlertCircle className="h-10 w-10" />
       </div>
       <div className="space-y-4 max-w-sm mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight">Sync failure</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{initError}</p>
       </div>
       <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button onClick={() => window.location.reload()} className="h-14 bg-primary hover:bg-blue-700 text-white rounded-2xl font-bold gap-2">
             <RefreshCw className="h-4 w-4" /> Retry synchronization
          </Button>
          <Button onClick={() => router.replace('/admin/daily-quiz')} variant="ghost" className="h-12 text-slate-400 font-bold uppercase text-[10px]">Return to list</Button>
       </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-40 text-left pt-2 px-4 md:px-10">
      <AdminPageHeader
        icon={Flame}
        label="Challenge builder"
        title={isEditing ? "Modify challenge" : "New daily quiz"}
        subtitle="Configure the official daily items for the selection bank."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto mt-4 md:mt-0">
           <button onClick={() => setStagedQuestions([])} className="h-14 px-6 rounded-2xl border border-slate-200 font-bold uppercase text-[10px] bg-white hover:bg-slate-50 transition-all border-none cursor-pointer text-slate-400">Reset</button>
           <Button onClick={() => handlePublish(true)} variant="outline" className="h-14 px-6 rounded-2xl font-bold uppercase text-[10px] tracking-tight border-slate-200 text-[#0F172A]">Save draft</Button>
           <Button onClick={() => handlePublish(false)} disabled={isPublishing} className="h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-bold uppercase text-[10px] tracking-tight shadow-2xl gap-3 border-none transition-all active:scale-95">
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Sync live
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-10 border border-slate-50">
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Challenge title</Label>
                  <Input value={quizData.title} onChange={e => setMockData({...quizData, title: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-sm md:text-lg shadow-inner text-[#0F172A]" placeholder="e.g. Daily Punjab GK #12" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Duration (Min)</Label>
                     <Input type="number" value={quizData.duration} onChange={e => setMockData({...quizData, duration: parseInt(e.target.value) || 0})} className="h-12 rounded-xl bg-slate-50 border-none font-black text-center shadow-inner text-[#0F172A]" />
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Points per item</Label>
                     <Input type="number" value={quizData.positiveMarks} onChange={e => setMockData({...quizData, positiveMarks: parseFloat(e.target.value) || 1})} className="h-12 rounded-xl bg-slate-50 border-none font-black text-center text-emerald-600 shadow-inner" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Difficulty</Label>
                     <select value={quizData.difficulty} onChange={e => setMockData({...quizData, difficulty: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none text-[#0F172A]">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                     </select>
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Reward XP</Label>
                     <Input type="number" value={quizData.rewardXP} onChange={e => setMockData({...quizData, rewardXP: parseInt(e.target.value) || 0})} className="h-12 rounded-xl bg-slate-50 border-none font-black text-center text-primary shadow-inner" />
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-slate-50">
                  <ConfigSwitch label="Official challenge" checked={quizData.isTodayQuiz} onChange={v => setMockData({...quizData, isTodayQuiz: v})} />
                  <ConfigSwitch label="Review allowed" checked={quizData.reviewModeEnabled} onChange={v => setMockData({...quizData, reviewModeEnabled: v})} />
                  <ConfigSwitch label="Show explanations" checked={quizData.explanationModeEnabled} onChange={v => setMockData({...quizData, explanationModeEnabled: v})} />
               </div>
            </Card>
         </div>

         <div className="lg:col-span-8 space-y-10">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit gap-2">
               <button onClick={() => setActiveTab('BANK')} className={cn("px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-tight transition-all bg-transparent border-none cursor-pointer", activeTab === 'BANK' ? "bg-white text-[#0F172A] shadow-md" : "text-slate-400 hover:text-slate-600")}>Database pool</button>
               <button onClick={() => setActiveTab('ASSEMBLY')} className={cn("px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-tight transition-all bg-transparent border-none cursor-pointer", activeTab === 'ASSEMBLY' ? "bg-white text-[#0F172A] shadow-md" : "text-slate-400 hover:text-slate-600")}>Active area</button>
            </div>

            {activeTab === 'BANK' ? (
               <div className="space-y-10 animate-in zoom-in-95 duration-500 relative">
                  <div className="absolute inset-0 -z-10 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `radial-gradient(#0F172A 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
                  
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                       <div className="space-y-1 text-left">
                        <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">Question database</h3>
                        <p className="text-sm font-medium text-slate-400">Select filters to stage items for this challenge.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                       <PremiumFilterCard 
                          icon={<Landmark className="text-blue-500" />}
                          label="Board center"
                          value={filterBoard}
                          onChange={setFilterBoard}
                          options={boards?.map((b: any) => ({ label: b.abbreviation, value: b.id })) || []}
                       />
                       <PremiumFilterCard 
                          icon={<BookOpen className="text-emerald-500" />}
                          label="Subject center"
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

                    <div className="relative group w-full">
                       <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-indigo-500/5 rounded-2xl blur-md opacity-0 group-focus-within:opacity-10 transition-all duration-500" />
                       <div className="relative flex items-center h-16 bg-white border border-slate-100 rounded-[18px] shadow-sm px-4 md:px-6 gap-2 md:gap-4 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary" />
                          <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 font-bold text-base md:text-lg text-[#0F172A]" placeholder="Search database for items..." />
                       </div>
                    </div>

                    <Card className="border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[32px] bg-white p-6 md:p-8 relative overflow-hidden text-left">
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                           <div className="relative shrink-0 flex items-center justify-center w-24 h-24">
                              <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                                 <circle cx="50%" cy="50%" r="42%" className="stroke-slate-100 fill-none" strokeWidth="6" />
                                 <motion.circle 
                                    cx="50%" cy="50%" r="42%" 
                                    className="stroke-[#2563EB] fill-none" 
                                    strokeWidth="6" 
                                    strokeLinecap="round"
                                    initial={{ strokeDashoffset: 238 }}
                                    animate={{ strokeDashoffset: 238 - (238 * Math.min(bankSelection.length, 100) / 100) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    style={{ strokeDasharray: 238 }}
                                 />
                              </svg>
                              <div className="flex flex-col items-center justify-center text-center">
                                 <span className="text-2xl font-black text-[#0F172A] tabular-nums leading-none">
                                    {bankSelection.length}
                                 </span>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Ready</span>
                              </div>
                           </div>

                           <div className="flex-1 space-y-4 text-center md:text-left w-full min-w-0">
                              <div className="space-y-1">
                                 <h4 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight uppercase">Assets Staged</h4>
                                 <p className="text-sm font-medium text-slate-500">Item selection verified and ready for registry integration.</p>
                              </div>
                              <Button 
                                onClick={handleLinkSelected} 
                                disabled={bankSelection.length === 0} 
                                className="w-full md:w-auto h-[52px] bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl border-none transition-all active:scale-95 flex items-center justify-center gap-3 shrink-0 px-8"
                              >
                                 Link items <ArrowRight className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                     </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-10">
                     {bankLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white" />)
                     ) : displayBank.length > 0 ? displayBank.map((q) => {
                        const isSel = bankSelection.includes(q.id);
                        return (
                           <motion.div key={q.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                              <div onClick={() => setBankSelection(prev => isSel ? prev.filter(id => id !== q.id) : [...prev, q.id])} className={cn("p-6 md:px-10 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group", isSel ? "bg-primary/5 border-primary shadow-lg" : "bg-white border-slate-50 hover:border-slate-100 shadow-sm")}>
                                 <div className="flex items-center gap-6 md:gap-10 min-w-0">
                                    <div className={cn("h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", isSel ? "bg-primary border-primary shadow-xl" : "bg-white border-slate-200")}>
                                       {isSel && <Check className="h-4 w-4 text-white stroke-[4px]" />}
                                    </div>
                                    <div className="min-w-0 text-left">
                                       <p className="font-bold text-[#0F172A] text-[13px] md:text-sm leading-tight break-words">{q.englishQuestion}</p>
                                       <div className="flex items-center gap-4 mt-2">
                                          <Badge className="bg-slate-50 text-slate-500 border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">{subjects?.find((s:any) => s.id === q.subjectId)?.name || 'General'}</Badge>
                                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{q.difficulty}</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        )
                     }) : (
                        <div className="py-24 text-center opacity-30 italic font-black uppercase text-xl flex flex-col items-center gap-4">
                           <AlertCircle className="h-12 w-12 text-slate-300" />
                           No items available
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between px-2">
                     <h3 className="text-xl md:text-3xl font-black text-[#0F172A] uppercase flex items-center gap-4"><Layers className="h-6 w-6 text-primary" /> Active area</h3>
                     <Badge className="bg-[#0F172A] text-white border-none font-bold text-[10px] px-4 py-1.5 rounded-lg shadow-sm">{stagedQuestions.length} items</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     {stagedQuestions.map((q, idx) => (
                        <Card key={q.id} className="border-none shadow-lg rounded-2xl bg-white group hover:shadow-xl transition-all border border-slate-100 overflow-hidden">
                           <CardContent className="p-6 md:px-10 flex items-center justify-between gap-6">
                              <div className="flex items-center gap-4 md:gap-8 min-w-0">
                                 <span className="text-xs md:text-lg font-black text-slate-200 tabular-nums">#{idx + 1}</span>
                                 <div className="min-w-0 text-left">
                                    <p className="font-bold text-[#0F172A] text-[12px] md:text-sm leading-tight break-words">{q.englishQuestion}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {q.id.slice(-8)}</p>
                                 </div>
                              </div>
                              <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-50 transition-all flex items-center justify-center active:scale-90 border-none bg-transparent cursor-pointer"><X className="h-4 w-4" /></button>
                           </CardContent>
                        </Card>
                     ))}
                     {stagedQuestions.length === 0 && (
                        <div className="h-80 flex flex-col items-center justify-center text-slate-300 opacity-20 border-2 border-dashed border-slate-200 rounded-[3rem] space-y-6">
                           <Layers className="h-16 w-16" />
                           <p className="font-bold text-xl uppercase tracking-widest">Composition area empty</p>
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

function ConfigSwitch({ label, checked, onChange }: any) {
   return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
         <Switch checked={checked} onCheckedChange={onChange} />
      </div>
   )
}

function PremiumFilterCard({ icon, label, value, onChange, options }: any) {
   return (
      <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 rounded-[18px] p-5 space-y-4 group">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
               {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" }) : null}
            </div>
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
         </div>
         <select 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none appearance-none cursor-pointer hover:bg-slate-100 focus:ring-2 focus:ring-primary/10 transition-all text-[#0F172A]"
         >
            <option value="all">All {label}s</option>
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
         </select>
      </Card>
   );
}
