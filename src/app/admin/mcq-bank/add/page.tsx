"use client"

import React, { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Save, Languages, Layers, Database, Eye, BarChart3, Loader2, Info, Globe, Sparkles } from "lucide-react"
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection, updateDoc, increment, addDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Manual Question Ingestion Node v3.0.
 * UPDATED: Fixed button responsiveness for PWA.
 * ADDED: Master Hub for trilingual manual typing (EN + PA + HI).
 */

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
  const [activeLangTab, setActiveLangTab] = useState<'punjabi' | 'hindi' | 'master'>('punjabi')
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
      setFormData((prev: any) => ({ ...prev, ...existingData }))
      if (existingData.hindiQuestion && !existingData.punjabiQuestion) setActiveLangTab('hindi');
      else if (existingData.hindiQuestion && existingData.punjabiQuestion) setActiveLangTab('master');
    }
  }, [existingData])

  const handleSave = async () => {
    if (!db || isSaving) return
    
    if (!formData.englishQuestion || !formData.subjectId) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Subject and Statement are mandatory." })
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
        await updateDoc(doc(db, 'settings', 'stats'), {
           totalQuestions: increment(1),
           updatedAt: serverTimestamp()
        }).catch(() => {});
      }

      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: isEditing ? "QUESTION_UPDATE" : "QUESTION_CREATE",
        details: `MCQ Bank Node ${finalId} synchronized.`,
        timestamp: serverTimestamp()
      });

      toast({ title: "Registry Synced" })
      router.push("/admin/mcq-bank")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync failed" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 text-left pt-4 px-4 md:px-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-6 min-w-0">
          <button onClick={() => router.back()} className="rounded-2xl h-10 w-10 md:h-12 md:w-12 border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <div className="text-left min-w-0">
            <h1 className="text-xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight truncate">{isEditing ? "Modify Node" : "New MCQ Node"}</h1>
            <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1 truncate">Master Bank Ingestion</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-blue-700 gap-2 md:gap-3 font-bold px-4 md:px-10 h-11 md:h-14 shadow-xl rounded-2xl border-none shrink-0 text-[10px] md:text-sm" onClick={handleSave} disabled={isSaving}>
           {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
           <span className="hidden sm:inline">Commit to Bank</span>
           <span className="sm:hidden">Commit</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
           <Card className="border-none bg-white shadow-2xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 space-y-10 border border-slate-50">
              
              <Tabs value={activeLangTab} onValueChange={(v: any) => setActiveLangTab(v)} className="w-full">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">1. Question Statement</p>
                    <TabsList className="bg-slate-50 h-11 md:h-12 rounded-xl p-1 w-full md:w-auto">
                       <TabsTrigger value="punjabi" className="flex-1 md:flex-none rounded-lg px-4 md:px-6 font-black uppercase text-[8px] tracking-widest data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Punjab Hub</TabsTrigger>
                       <TabsTrigger value="hindi" className="flex-1 md:flex-none rounded-lg px-4 md:px-6 font-black uppercase text-[8px] tracking-widest data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Hindi Hub</TabsTrigger>
                       <TabsTrigger value="master" className="flex-1 md:flex-none rounded-lg px-4 md:px-6 font-black uppercase text-[8px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-1">
                          <Sparkles className="h-2.5 w-2.5" /> Master
                       </TabsTrigger>
                    </TabsList>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">English Statement</Label>
                       <Textarea value={formData.englishQuestion || ""} onChange={e => setFormData({...formData, englishQuestion: e.target.value})} className="h-24 rounded-xl bg-slate-50 font-bold p-4 shadow-inner border-none" />
                    </div>
                    
                    {(activeLangTab === 'punjabi' || activeLangTab === 'master') && (
                       <div className="m-0 space-y-2 animate-in fade-in duration-300">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Punjabi Statement</Label>
                          <Textarea value={formData.punjabiQuestion || ""} onChange={e => setFormData({...formData, punjabiQuestion: e.target.value})} className="h-24 rounded-xl bg-slate-50 font-bold p-4 shadow-inner border-none" />
                       </div>
                    )}

                    {(activeLangTab === 'hindi' || activeLangTab === 'master') && (
                       <div className="m-0 space-y-2 animate-in fade-in duration-300">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hindi Statement</Label>
                          <Textarea value={formData.hindiQuestion || ""} onChange={e => setFormData({...formData, hindiQuestion: e.target.value})} className="h-24 rounded-xl bg-slate-50 font-bold p-4 shadow-inner border-none" />
                       </div>
                    )}
                 </div>
              </Tabs>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">2. Option Matrix</p>
                 </div>
                 <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {['A','B','C','D'].map(opt => (
                       <div key={opt} className={cn(
                          "grid grid-cols-1 gap-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 group hover:border-primary/20 transition-all shadow-sm",
                          activeLangTab === 'master' ? "md:grid-cols-3" : "md:grid-cols-2"
                       )}>
                          <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-[10px]">{opt}</span>
                                <Label className="text-[9px] font-black uppercase text-slate-500">English</Label>
                             </div>
                             <Input value={formData[`option${opt}English`] || ""} onChange={e => setFormData({...formData, [`option${opt}English`]: e.target.value})} className="bg-white font-bold h-11 border-none shadow-sm rounded-xl" />
                          </div>
                          
                          {(activeLangTab === 'punjabi' || activeLangTab === 'master') && (
                             <div className="space-y-4 animate-in fade-in">
                                <div className="flex items-center gap-2">
                                   <Globe className="h-3.5 w-3.5 text-slate-300" />
                                   <Label className="text-[9px] font-black uppercase text-slate-500">Punjabi</Label>
                                </div>
                                <Input 
                                  value={formData[`option${opt}Punjabi`] || ""} 
                                  onChange={e => setFormData({...formData, [`option${opt}Punjabi`]: e.target.value})} 
                                  className="bg-white font-bold h-11 border-none shadow-sm rounded-xl" 
                                />
                             </div>
                          )}

                          {(activeLangTab === 'hindi' || activeLangTab === 'master') && (
                             <div className="space-y-4 animate-in fade-in">
                                <div className="flex items-center gap-2">
                                   <Globe className="h-3.5 w-3.5 text-slate-300" />
                                   <Label className="text-[9px] font-black uppercase text-slate-500">Hindi</Label>
                                </div>
                                <Input 
                                  value={formData[`option${opt}Hindi`] || ""} 
                                  onChange={e => setFormData({...formData, [`option${opt}Hindi`]: e.target.value})} 
                                  className="bg-white font-bold h-11 border-none shadow-sm rounded-xl" 
                                />
                             </div>
                          )}
                       </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                 <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Correct Answer Key</Label>
                    <Select value={formData.correctAnswer} onValueChange={(v: any) => setFormData({...formData, correctAnswer: v})}>
                       <SelectTrigger className="h-12 rounded-xl bg-emerald-50 border-none text-emerald-700 font-black"><SelectValue /></SelectTrigger>
                       <SelectContent className="bg-[#0B1528] text-white">
                          {['A','B','C','D'].map(v => <SelectItem key={v} value={v}>Option {v}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject Hub</Label>
                    <Select value={formData.subjectId} onValueChange={v => setFormData({...formData, subjectId: v})}>
                       <SelectTrigger className="h-12 rounded-xl bg-slate-50 font-bold border-none shadow-inner"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                       <SelectContent className="bg-[#0B1528] text-white max-h-60 overflow-y-auto">{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">3. Solution Logic Hub</p>
                 <div className="space-y-6">
                    <div className="space-y-2 text-left">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">English Rationalization</Label>
                       <Textarea value={formData.englishExplanation || ""} onChange={e => setFormData({...formData, englishExplanation: e.target.value})} className="h-28 rounded-xl bg-slate-900 border-none text-emerald-400 font-medium p-6 shadow-inner" />
                    </div>
                    
                    {(activeLangTab === 'punjabi' || activeLangTab === 'master') && (
                       <div className="space-y-2 text-left animate-in fade-in">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Punjabi Rationalization</Label>
                          <Textarea 
                             value={formData.punjabiExplanation || ""} 
                             onChange={e => setFormData({...formData, punjabiExplanation: e.target.value})} 
                             className="h-28 rounded-xl bg-slate-900 border-none text-blue-400 font-medium p-6 shadow-inner" 
                          />
                       </div>
                    )}

                    {(activeLangTab === 'hindi' || activeLangTab === 'master') && (
                       <div className="space-y-2 text-left animate-in fade-in">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hindi Rationalization</Label>
                          <Textarea 
                             value={formData.hindiExplanation || ""} 
                             onChange={e => setFormData({...formData, hindiExplanation: e.target.value})} 
                             className="h-28 rounded-xl bg-slate-900 border-none text-orange-400 font-medium p-6 shadow-inner" 
                          />
                       </div>
                    )}
                 </div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-5">
           <Card className="border-none bg-white shadow-2xl rounded-[3rem] overflow-hidden sticky top-32 border border-slate-50">
             <div className="bg-[#0B1528] px-10 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Eye className="h-4 w-4 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Live CBT Preview</span>
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
             <CardContent className="p-10 space-y-10 h-[70vh] overflow-y-auto custom-scrollbar text-left bg-slate-50/30">
                <QuestionRenderer 
                   language={previewLang} 
                   question={formData} 
                   showSolution={true}
                />
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
