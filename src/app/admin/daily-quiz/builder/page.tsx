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
  ExternalLink
} from "lucide-react"
import { useCollection, useFirestore, useDoc, useUser } from "@/firebase"
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp, 
  query, 
  limit, 
  getDocs, 
  writeBatch, 
  where, 
  documentId, 
  orderBy, 
  DocumentData, 
  updateDoc, 
  increment, 
  addDoc 
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { mcqEngine, DiagnosticReport } from "@/lib/mcq-engine"

/**
 * @fileOverview Daily Challenge Architect v28.0.
 * FIXED: Standardized filter behavior and diagnostics to match Question Bank.
 * TYPOGRAPHY: Removed uppercase from headings.
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

  const { data: subjects } = useCollection<any>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))
  const { data: existingQuiz } = useDoc<any>(useMemo(() => (db && quizId ? doc(db, "daily_quizzes", quizId) : null), [db, quizId]))
  
  const [isInitializing, setIsInitializing] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState<'BANK' | 'ASSEMBLY'>('BANK')
  
  const [filterSubject, setSubjectFilter] = useState("all")
  const [filterDifficulty, setDifficultyFilter] = useState("all")
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
        subjectId: filterSubject,
        difficulty: filterDifficulty,
        searchTerm: searchTerm,
        status: 'all' // Defaulting to all statuses for builder visibility
      }, 100);

      setQuestionBank(result.data);
      setDiagnostic(result.diagnostic);
    } finally {
      setBankLoading(false);
    }
  }, [db, filterSubject, filterDifficulty, searchTerm]);

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
        for (let i = 0; i < existingQuiz.questionIds.length; i += 30) {
          chunks.push(existingQuiz.questionIds.slice(i, i + 30));
        }
        for (const chunk of chunks) {
          const qSnap = await getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk)));
          qSnap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id }));
        }
        const hydrated = (existingQuiz.questionIds as string[]).map(id => fetched.find(q => q.id === id)).filter(Boolean);
        setStagedQuestions(hydrated);
      }
      setIsInitializing(false);
    };

    hydrateExisting();
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
       toast({ variant: "destructive", title: "Assembly empty", description: "Add items to challenge." });
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
       await batch.commit();

       await addDoc(collection(db, "audit_logs"), {
          user: profile?.name || "Administrator",
          action: isEditing ? "QUIZ_UPDATE" : "QUIZ_CREATE",
          details: `Daily challenge "${payload.title}" synchronized.`,
          timestamp: serverTimestamp()
       });

       toast({ title: "Database synced" });
       router.push("/admin/daily-quiz");
    } catch (e) {
       toast({ variant: "destructive", title: "Sync failed" });
    } finally { setIsPublishing(false); }
  };

  if (isInitializing) return <div className="h-screen flex items-center justify-center bg-white"><Zap className="animate-pulse text-primary h-10 w-10" /></div>

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-40 text-left pt-2 px-4 md:px-10">
      <AdminPageHeader
        icon={Flame}
        label="Challenge architect"
        title={isEditing ? "Modify challenge" : "New daily quiz"}
        subtitle="Configure the official daily preparation node for the Punjab registry."
      >
        <div className="flex gap-3">
           <button onClick={() => setStagedQuestions([])} className="h-14 px-8 rounded-2xl border border-slate-200 font-bold uppercase text-[10px] bg-white hover:bg-slate-50 transition-all">Reset</button>
           <Button onClick={() => handlePublish(true)} variant="outline" className="h-14 px-8 rounded-2xl font-bold uppercase text-[10px] tracking-tight border-slate-200">Save draft</Button>
           <Button onClick={() => handlePublish(false)} disabled={isPublishing} className="h-14 px-10 bg-primary hover:bg-blue-700 text-white rounded-full font-bold uppercase text-[10px] tracking-tight shadow-2xl gap-3 border-none transition-all active:scale-95">
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Sync live
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-10 border border-slate-50">
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Challenge headline</Label>
                  <Input value={quizData.title} onChange={e => setQuizData({...quizData, title: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg shadow-inner" placeholder="e.g. Daily Punjab GK #12" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Duration (Min)</Label>
                     <Input type="number" value={quizData.duration} onChange={e => setQuizData({...quizData, duration: parseInt(e.target.value) || 0})} className="h-12 rounded-xl bg-slate-50 border-none font-black text-center shadow-inner" />
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Correct mark</Label>
                     <Input type="number" value={quizData.positiveMarks} onChange={e => setQuizData({...quizData, positiveMarks: parseFloat(e.target.value) || 1})} className="h-12 rounded-xl bg-slate-50 border-none font-black text-center text-emerald-600 shadow-inner" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Difficulty</Label>
                     <select value={quizData.difficulty} onChange={e => setQuizData({...quizData, difficulty: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                     </select>
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Reward XP</Label>
                     <Input type="number" value={quizData.rewardXP} onChange={e => setQuizData({...quizData, rewardXP: parseInt(e.target.value) || 0})} className="h-12 rounded-xl bg-slate-50 border-none font-black text-center text-primary shadow-inner" />
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-slate-50">
                  <ConfigSwitch label="Official challenge" checked={quizData.isTodayQuiz} onChange={v => setQuizData({...quizData, isTodayQuiz: v})} />
                  <ConfigSwitch label="Review allowed" checked={quizData.reviewModeEnabled} onChange={v => setQuizData({...quizData, reviewModeEnabled: v})} />
                  <ConfigSwitch label="Show explanations" checked={quizData.explanationModeEnabled} onChange={v => setQuizData({...quizData, explanationModeEnabled: v})} />
               </div>
            </Card>
         </div>

         <div className="lg:col-span-8 space-y-6">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit gap-2">
               <button onClick={() => setActiveTab('BANK')} className={cn("px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-tight transition-all", activeTab === 'BANK' ? "bg-[#0F172A] text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}>MCQ bank hub</button>
               <button onClick={() => setActiveTab('ASSEMBLY')} className={cn("px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-tight transition-all", activeTab === 'ASSEMBLY' ? "bg-[#0F172A] text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}>Assembly pool</button>
            </div>

            {activeTab === 'BANK' ? (
               <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <Card className="bg-[#0B1528] rounded-[2.5rem] p-8 md:p-12 text-white space-y-10 shadow-3xl border border-white/5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><Database className="h-64 w-64" /></div>
                     <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FilterNode 
                          label="Subject hub" 
                          value={filterSubject} 
                          onChange={setSubjectFilter} 
                          options={subjects?.map(s => ({ label: s.name, value: s.id })) || []}
                        />
                        <FilterNode 
                          label="Level hub" 
                          value={filterDifficulty} 
                          onChange={setDifficultyFilter} 
                          options={['Easy', 'Medium', 'Hard'].map(d => ({ label: d, value: d }))}
                        />
                     </div>

                     {/* DIAGNOSTIC HUB */}
                     {diagnostic && (
                        <div className="relative z-10 bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <AlertCircle className="h-5 w-5 text-amber-500" />
                                 <p className="text-xs font-bold text-amber-200">Database diagnostic</p>
                              </div>
                              {diagnostic.indexUrl && (
                                 <Button asChild className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase border-none">
                                    <a href={diagnostic.indexUrl} target="_blank" rel="noopener noreferrer">Provision index <ExternalLink className="h-3 w-3 ml-2" /></a>
                                 </Button>
                              )}
                           </div>
                           <p className="text-[11px] text-slate-400 leading-relaxed">{diagnostic.message}</p>
                        </div>
                     )}

                     <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 pt-8 border-t border-white/10">
                        <div className="flex-1">
                           <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                              <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl pl-12 text-white font-bold" placeholder="Search master bank..." />
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Staged</p>
                              <p className="text-3xl font-black text-primary tabular-nums tracking-tighter">{bankSelection.length}</p>
                           </div>
                           <Button onClick={handleLinkSelected} disabled={bankSelection.length === 0} className="h-14 px-10 bg-primary hover:bg-blue-700 text-white rounded-full shadow-2xl border-none font-bold text-xs uppercase tracking-tight gap-2 active:scale-95 transition-all">Link assets <ChevronRight className="h-4 w-4" /></Button>
                        </div>
                     </div>
                  </Card>

                  <div className="grid grid-cols-1 gap-3">
                     {bankLoading ? (
                        Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white" />)
                     ) : displayBank.length > 0 ? displayBank.map((q) => {
                        const isSel = bankSelection.includes(q.id);
                        return (
                           <div key={q.id} onClick={() => setBankSelection(prev => isSel ? prev.filter(id => id !== q.id) : [...prev, q.id])} className={cn("p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group", isSel ? "bg-primary/5 border-primary shadow-lg" : "bg-white border-slate-50 hover:border-slate-100 shadow-sm")}>
                              <div className="flex items-center gap-6 min-w-0">
                                 <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", isSel ? "bg-primary border-primary" : "bg-white border-slate-200")}>
                                    {isSel && <Check className="h-3 w-3 text-white stroke-[4px]" />}
                                 </div>
                                 <div className="min-w-0 text-left">
                                    <p className="font-bold text-[#0F172A] truncate text-sm md:text-base">{q.englishQuestion}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subjects?.find((s:any) => s.id === q.subjectId)?.name || 'General'} • {q.difficulty}</p>
                                 </div>
                              </div>
                           </div>
                        )
                     }) : (
                        <div className="py-20 text-center opacity-30 italic font-bold uppercase text-xs flex flex-col items-center gap-4">
                           <AlertCircle className="h-10 w-10 text-slate-300" />
                           No items matched in registry.
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between px-2">
                     <h3 className="text-xl font-bold text-[#0F172A] uppercase flex items-center gap-4"><Layers className="h-6 w-6 text-primary" /> Active composition</h3>
                     <Badge className="bg-[#0F172A] text-white border-none font-bold px-4 py-1.5 rounded-lg">{stagedQuestions.length} Items</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     {stagedQuestions.map((q, idx) => (
                        <Card key={q.id} className="border-none shadow-lg rounded-2xl bg-white group hover:shadow-xl transition-all border border-slate-50 overflow-hidden">
                           <CardContent className="p-6 md:px-10 flex items-center justify-between gap-6">
                              <div className="flex items-center gap-6 min-w-0">
                                 <span className="text-xl font-black text-slate-200 tabular-nums">#{idx + 1}</span>
                                 <div className="min-w-0 text-left">
                                    <p className="font-bold text-[#0F172A] text-sm md:text-lg truncate">{q.englishQuestion}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {q.id.slice(-8)}</p>
                                 </div>
                              </div>
                              <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all flex items-center justify-center active:scale-90"><Trash2 className="h-5 w-5" /></button>
                           </CardContent>
                        </Card>
                     ))}
                     {stagedQuestions.length === 0 && (
                        <div className="h-80 flex flex-col items-center justify-center text-slate-300 opacity-20 border-2 border-dashed border-slate-200 rounded-[3rem] space-y-6">
                           <Layers className="h-16 w-16" />
                           <p className="font-bold text-xl uppercase tracking-widest">Composition empty</p>
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
       <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 tracking-tight">{label}</label>
       <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 font-bold text-xs outline-none appearance-none cursor-pointer hover:bg-white/10 transition-colors text-white"
       >
          <option value="all" className="bg-[#0F172A]">All {label.replace(' hub', '')}s</option>
          {options.map((opt: any) => <option key={opt.value} value={opt.value} className="bg-[#0F172A]">{opt.label}</option>)}
       </select>
    </div>
  )
}

function ConfigSwitch({ label, checked, onChange }: any) {
   return (
      <div className={cn("p-5 rounded-2xl border flex items-center justify-between transition-all", checked ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50/50 border-slate-100 opacity-60")}>
         <span className="text-[11px] font-bold uppercase text-[#0F172A] tracking-tight">{label}</span>
         <Switch checked={checked} onCheckedChange={onChange} />
      </div>
   )
}
