
"use client"

import React, { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Save, Languages, Layers, Database, Eye, BarChart3, Loader2, Info, Globe, Sparkles, Zap, ShieldCheck } from "lucide-react"
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection, updateDoc, increment, addDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Premium Manual MCQ Ingestion Node v4.0.
 * RESTORED: Optimized manual bilingual question type functionality.
 * IMPROVED: Parallel side-by-side ingestion for English and Local Script.
 */

type EntryMode = 'ENGLISH' | 'PUNJABI' | 'HINDI' | 'BILINGUAL_PA' | 'BILINGUAL_HI';

export default function QuestionEntryPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <QuestionEntryContent />
    </Suspense>
  )
}

function QuestionEntryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()
  
  const [isSaving, setIsSaving] = useState(false)
  const [entryMode, setEntryMode] = useState<EntryMode>('BILINGUAL_PA')
  const [previewLang, setPreviewLang] = useState('ENGLISH_PUNJABI')

  const questionId = searchParams?.get("id") ?? ""
  const isEditing = !!questionId

  const { data: existingData } = useDoc<any>(useMemo(() => (db && questionId ? doc(db, "mcqBank", questionId) : null), [db, questionId]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [formData, setFormData] = useState<any>({
    boardId: "", examId: "", subjectId: "", difficulty: "Medium",
    status: "PUBLISHED",
    englishQuestion: "", punjabiQuestion: "", hindiQuestion: "",
    optionAEnglish: "", optionAPunjabi: "", optionAHindi: "",
    optionBEnglish: "", optionBPunjabi: "", optionBHindi: "",
    optionCEnglish: "", optionCPunjabi: "", optionCHindi: "",
    optionDEnglish: "", optionDPunjabi: "", optionDHindi: "",
    correctAnswer: "A", 
    englishExplanation: "", punjabiExplanation: "", hindiExplanation: "",
    imageUrl: "",
    chapterId: "",
    marks: 1,
    negativeMarks: 0.25,
    tags: []
  })

  useEffect(() => {
    if (existingData) {
      setFormData((prev: any) => ({ ...prev, ...existingData }));
      if (existingData.hindiQuestion && existingData.englishQuestion) setEntryMode('BILINGUAL_HI');
      else if (existingData.punjabiQuestion && existingData.englishQuestion) setEntryMode('BILINGUAL_PA');
      else if (existingData.punjabiQuestion) setEntryMode('PUNJABI');
      else if (existingData.hindiQuestion) setEntryMode('HINDI');
      else setEntryMode('ENGLISH');
    }
  }, [existingData])

  const handleSave = async () => {
    if (!db || isSaving) return
    if (!formData.englishQuestion && !formData.punjabiQuestion) {
       toast({ variant: "destructive", title: "Validation Failed", description: "At least one question statement is required." })
       return
    }

    setIsSaving(true)
    const finalId = questionId || `q-${Date.now()}`
    const questionRef = doc(db, "mcqBank", finalId)
    
    const payload: any = { 
      ...formData, 
      id: finalId,
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingData?.createdAt || serverTimestamp()) : serverTimestamp(),
      createdBy: profile?.name || "Administrator"
    };

    try {
      await setDoc(questionRef, payload, { merge: true })
      if (!isEditing) {
        await updateDoc(doc(db, 'settings', 'stats'), { totalQuestions: increment(1), updatedAt: serverTimestamp() }).catch(() => {});
      }
      toast({ title: "Database Record Synced" })
      router.push("/admin/mcq-bank")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync failure" })
    } finally { setIsSaving(false) }
  }

  const showEnglish = entryMode === 'ENGLISH' || entryMode.startsWith('BILINGUAL');
  const showPunjabi = entryMode === 'PUNJABI' || entryMode === 'BILINGUAL_PA';
  const showHindi = entryMode === 'HINDI' || entryMode === 'BILINGUAL_HI';

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-32 text-left pt-2 px-4 md:px-12 animate-in fade-in duration-700">
      
      {/* 1. HEADER HUB */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="rounded-2xl h-12 w-12 border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm shrink-0">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
               <ShieldCheck className="h-4 w-4 text-primary" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Manual Ingestion Engine</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">{isEditing ? "Modify MCQ" : "New MCQ Record"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <Select value={entryMode} onValueChange={(v: EntryMode) => { setEntryMode(v); setPreviewLang(v.startsWith('BILINGUAL_PA') ? 'ENGLISH_PUNJABI' : v.startsWith('BILINGUAL_HI') ? 'ENGLISH_HINDI' : v); }}>
              <SelectTrigger className="h-12 md:h-14 bg-white border-slate-200 rounded-xl px-5 font-bold text-xs shadow-sm w-full md:w-52">
                 <Languages className="h-4 w-4 mr-2 text-primary" />
                 <SelectValue placeholder="Entry Mode" />
              </SelectTrigger>
              <SelectContent className="bg-[#0B1528] text-white border-white/10">
                 <SelectItem value="BILINGUAL_PA" className="cursor-pointer">English + Punjabi</SelectItem>
                 <SelectItem value="BILINGUAL_HI" className="cursor-pointer">English + Hindi</SelectItem>
                 <SelectItem value="ENGLISH" className="cursor-pointer">English Only</SelectItem>
                 <SelectItem value="PUNJABI" className="cursor-pointer">ਪੰਜਾਬੀ Only</SelectItem>
                 <SelectItem value="HINDI" className="cursor-pointer">हिन्दी Only</SelectItem>
              </SelectContent>
           </Select>
           <Button onClick={handleSave} disabled={isSaving} className="h-12 md:h-14 px-10 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl gap-3 rounded-full border-none transition-all active:scale-95 flex-1 md:flex-none">
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Commit
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* FORM LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-8">
           <Card className="border-none bg-white shadow-2xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 space-y-10 border border-slate-50">
              
              {/* SECTION 1: QUESTION STATEMENT */}
              <div className="space-y-8">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2"><Zap className="h-4 w-4 fill-current" /> 1. Question Statement</p>
                    <Badge variant="outline" className="text-[8px] font-bold uppercase border-slate-100">Database Entry</Badge>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    {showEnglish && (
                       <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">English Statement</Label>
                          <Textarea value={formData.englishQuestion} onChange={e => setFormData({...formData, englishQuestion: e.target.value})} className="min-h-[120px] rounded-2xl bg-slate-50 border-none font-bold text-base p-6 shadow-inner focus-visible:ring-primary/20" placeholder="Type verified English statement..." />
                       </div>
                    )}
                    {showPunjabi && (
                       <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                          <Label className="text-[10px] font-black uppercase text-primary ml-1">Punjabi Statement (Gurmukhi)</Label>
                          <Textarea value={formData.punjabiQuestion} onChange={e => setFormData({...formData, punjabiQuestion: e.target.value})} className="min-h-[120px] rounded-2xl bg-slate-50 border-none font-black text-lg p-6 shadow-inner focus-visible:ring-primary/20" placeholder="ਟਾਈਪ ਕਰੋ..." />
                       </div>
                    )}
                    {showHindi && (
                       <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                          <Label className="text-[10px] font-black uppercase text-orange-600 ml-1">Hindi Statement (Devanagari)</Label>
                          <Textarea value={formData.hindiQuestion} onChange={e => setFormData({...formData, hindiQuestion: e.target.value})} className="min-h-[120px] rounded-2xl bg-slate-50 border-none font-black text-lg p-6 shadow-inner focus-visible:ring-primary/20" placeholder="यहाँ टाइप करें..." />
                       </div>
                    )}
                 </div>
              </div>

              {/* SECTION 2: OPTIONS */}
              <div className="space-y-8 pt-6 border-t border-slate-50">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2"><Layers className="h-4 w-4" /> 2. Option Matrix</p>
                 <div className="grid grid-cols-1 gap-6">
                    {['A','B','C','D'].map(opt => (
                       <div key={opt} className="bg-slate-50/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 space-y-6 group hover:border-primary/20 transition-all shadow-sm">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-lg shadow-xl shrink-0 group-hover:scale-110 transition-transform">{opt}</div>
                             <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Configure Option {opt}</Label>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {showEnglish && (
                                <div className="space-y-1.5">
                                   <Label className="text-[8px] font-bold text-slate-400 uppercase ml-2">English</Label>
                                   <Input value={formData[`option${opt}English`]} onChange={e => setFormData({...formData, [`option${opt}English`]: e.target.value})} className="bg-white border-slate-100 font-bold h-12 rounded-xl px-5 shadow-sm" placeholder="---" />
                                </div>
                             )}
                             {showPunjabi && (
                                <div className="space-y-1.5">
                                   <Label className="text-[8px] font-bold text-primary uppercase ml-2">Punjabi</Label>
                                   <Input value={formData[`option${opt}Punjabi`]} onChange={e => setFormData({...formData, [`option${opt}Punjabi`]: e.target.value})} className="bg-white border-slate-100 font-black h-12 rounded-xl px-5 shadow-sm" placeholder="---" />
                                </div>
                             )}
                             {showHindi && (
                                <div className="space-y-1.5">
                                   <Label className="text-[8px] font-bold text-orange-600 uppercase ml-2">Hindi</Label>
                                   <Input value={formData[`option${opt}Hindi`]} onChange={e => setFormData({...formData, [`option${opt}Hindi`]: e.target.value})} className="bg-white border-slate-100 font-black h-12 rounded-xl px-5 shadow-sm" placeholder="---" />
                                </div>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* SECTION 3: SOLUTION RATIONALE */}
              <div className="space-y-8 pt-6 border-t border-slate-50">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2"><BarChart3 className="h-4 w-4" /> 3. Verification & Solution</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 text-left">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Correct Answer Key</Label>
                       <Select value={formData.correctAnswer} onValueChange={v => setFormData({...formData, correctAnswer: v})}>
                          <SelectTrigger className="h-14 rounded-2xl bg-emerald-50 border-none text-emerald-700 font-black text-lg px-8 shadow-inner"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10">
                             {['A','B','C','D'].map(v => <SelectItem key={v} value={v} className="cursor-pointer">Option {v}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-3 text-left">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject Registry</Label>
                       <Select value={formData.subjectId} onValueChange={v => setFormData({...formData, subjectId: v})}>
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-sm px-8 shadow-inner"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10 max-h-72 overflow-y-auto">{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                       </Select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-6">
                    {showEnglish && (
                       <div className="space-y-2 text-left">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">English Rationalization</Label>
                          <Textarea value={formData.englishExplanation} onChange={e => setFormData({...formData, englishExplanation: e.target.value})} className="min-h-[140px] rounded-2xl bg-slate-900 border-none text-emerald-400 font-medium p-6 shadow-2xl leading-relaxed" placeholder="Type verified English logic..." />
                       </div>
                    )}
                    {showPunjabi && (
                       <div className="space-y-2 text-left">
                          <Label className="text-[10px] font-black uppercase text-primary ml-1">Punjabi Rationalization</Label>
                          <Textarea value={formData.punjabiExplanation} onChange={e => setFormData({...formData, punjabiExplanation: e.target.value})} className="min-h-[140px] rounded-2xl bg-slate-900 border-none text-blue-400 font-black p-6 shadow-2xl leading-relaxed" placeholder="ਪੰਜਾਬੀ ਵਿੱਚ ਲਿਖੋ..." />
                       </div>
                    )}
                    {showHindi && (
                       <div className="space-y-2 text-left">
                          <Label className="text-[10px] font-black uppercase text-orange-600 ml-1">Hindi Rationalization</Label>
                          <Textarea value={formData.hindiExplanation} onChange={e => setFormData({...formData, hindiExplanation: e.target.value})} className="min-h-[140px] rounded-2xl bg-slate-900 border-none text-orange-400 font-black p-6 shadow-2xl leading-relaxed" placeholder="हिंदी में लिखें..." />
                       </div>
                    )}
                 </div>
              </div>
           </Card>
        </div>

        {/* RIGHT PREVIEW COLUMN */}
        <div className="lg:col-span-5">
           <Card className="border-none shadow-5xl rounded-[3rem] overflow-hidden sticky top-32 border border-slate-100 bg-white">
             <div className="bg-[#0B1528] px-10 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white antialiased">CBT Simulator Preview</span>
                </div>
                <div className="flex gap-2">
                   {['EN', 'PA', 'HI'].map((l) => (
                      <button 
                        key={l}
                        onClick={() => setPreviewLang(l === 'EN' ? 'ENGLISH' : l === 'PA' ? 'ENGLISH_PUNJABI' : 'ENGLISH_HINDI')}
                        className={cn(
                           "text-[8px] font-black px-2 py-1 rounded border border-white/10 transition-all",
                           (previewLang.includes(l.replace('PA','PUNJABI').replace('HI','HINDI'))) ? "bg-primary text-white shadow-lg" : "bg-white/5 text-slate-400 hover:text-white"
                        )}
                      >
                         {l}
                      </button>
                   ))}
                </div>
             </div>
             <CardContent className="p-10 space-y-10 h-[75vh] overflow-y-auto custom-scrollbar text-left bg-slate-50/20">
                <QuestionRenderer 
                   language={previewLang} 
                   question={{...formData, displayId: "1"}} 
                   showSolution={true}
                />
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
