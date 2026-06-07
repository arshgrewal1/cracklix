"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Save, Languages, Layers, Database, Eye, BarChart3, Loader2, Info, Globe } from "lucide-react"
import { useFirestore, useDoc, useCollection, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Hardened Manual Question Entry v15.5.
 * FIXED: Globe reference error and side-by-side bilingual option editing.
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
  const [activeLangTab, setActiveLangTab] = useState<'punjabi' | 'hindi'>('punjabi')
  const [previewLang, setPreviewLang] = useState('ENGLISH_PUNJABI')

  const questionId = searchParams.get("id")
  const isEditing = !!questionId

  const { data: existingData } = useDoc<any>(useMemo(() => (db && questionId ? doc(db, "questions", questionId) : null), [db, questionId]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [formData, setFormData] = useState<any>({
    boardId: "", examId: "", subjectId: "", difficulty: "Medium",
    status: "DRAFT",
    englishQuestion: "", punjabiQuestion: "", hindiQuestion: "",
    optionAEnglish: "", optionAPunjabi: "", optionAHindi: "",
    optionBEnglish: "", optionBPunjabi: "", optionBHindi: "",
    optionCEnglish: "", optionCPunjabi: "", optionCHindi: "",
    optionDEnglish: "", optionDPunjabi: "", optionDHindi: "",
    correctAnswer: "A", 
    englishExplanation: "", punjabiExplanation: "", hindiExplanation: "",
    imageUrl: "",
    chapterId: ""
  })

  useEffect(() => {
    if (existingData) {
      setFormData(prev => ({ 
        ...prev, 
        ...existingData,
        englishQuestion: existingData.englishQuestion || "",
        punjabiQuestion: existingData.punjabiQuestion || "",
        hindiQuestion: existingData.hindiQuestion || "",
        optionAEnglish: existingData.optionAEnglish || "",
        optionAPunjabi: existingData.optionAPunjabi || "",
        optionAHindi: existingData.optionAHindi || "",
        optionBEnglish: existingData.optionBEnglish || "",
        optionBPunjabi: existingData.optionBPunjabi || "",
        optionBHindi: existingData.optionBHindi || "",
        optionCEnglish: existingData.optionCEnglish || "",
        optionCPunjabi: existingData.optionCPunjabi || "",
        optionCHindi: existingData.optionCHindi || "",
        optionDEnglish: existingData.optionDEnglish || "",
        optionDPunjabi: existingData.optionDPunjabi || "",
        optionDHindi: existingData.optionDHindi || "",
        englishExplanation: existingData.englishExplanation || "",
        punjabiExplanation: existingData.punjabiExplanation || "",
        hindiExplanation: existingData.hindiExplanation || ""
      }))
      if (existingData.hindiQuestion) setActiveLangTab('hindi');
    }
  }, [existingData])

  const handleSave = async () => {
    if (!db || isSaving) return
    
    const mandatory = ['englishQuestion', 'optionAEnglish', 'correctAnswer', 'subjectId'];
    const missing = mandatory.filter(key => !formData[key]?.trim());
    
    if (missing.length > 0) {
       toast({ variant: "destructive", title: "Validation Error", description: `Field missing: ${missing[0].replace(/([A-Z])/g, ' $1')}` })
       return
    }

    setIsSaving(true)
    const finalId = questionId || `q-${Date.now()}`
    const questionRef = doc(db, "questions", finalId)
    
    const payload: any = { 
      ...formData, 
      id: finalId,
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingData?.createdAt || serverTimestamp()) : serverTimestamp(),
      isStandalone: true,
      author: existingData?.author || profile?.name || "Team Node"
    };

    // Strict Purge
    Object.keys(payload).forEach(key => (payload[key] === undefined || payload[key] === null) && delete payload[key]);

    try {
      await setDoc(questionRef, payload, { merge: true })
      toast({ title: "Registry Synced", description: "Question saved in global bank." })
      router.push("/admin/questions")
    } catch (err: any) {
      const permissionError = new FirestorePermissionError({
        path: questionRef.path,
        operation: 'write',
        requestResourceData: payload,
      } satisfies SecurityRuleContext);
      errorEmitter.emit("permission-error", permissionError);
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 text-left pt-4">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="rounded-2xl h-12 w-12 border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="text-left">
            <h1 className="text-3xl font-black font-headline text-[#0F172A] uppercase tracking-tight">{isEditing ? "Modify Question" : "New Question Node"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Manual Content Ingestion</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-3 font-black px-10 h-14 shadow-xl rounded-2xl uppercase tracking-widest text-xs" onClick={handleSave} disabled={isSaving}>
           {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit to Bank
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-7 space-y-8">
           <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] p-10 space-y-10">
              
              <Tabs value={activeLangTab} onValueChange={(v: any) => setActiveLangTab(v)} className="w-full">
                 <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">1. Question Statement</p>
                    <TabsList className="bg-slate-50 h-10 rounded-xl p-1">
                       <TabsTrigger value="punjabi" className="rounded-lg px-6 font-black uppercase text-[8px] tracking-widest data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Punjab Hub</TabsTrigger>
                       <TabsTrigger value="hindi" className="rounded-lg px-6 font-black uppercase text-[8px] tracking-widest data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Hindi Hub</TabsTrigger>
                    </TabsList>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">English Statement</Label>
                       <Textarea value={formData.englishQuestion || ""} onChange={e => setFormData({...formData, englishQuestion: e.target.value})} className="h-24 rounded-xl bg-slate-50 font-bold p-4" />
                    </div>
                    
                    <TabsContent value="punjabi" className="m-0 space-y-2 animate-in fade-in duration-300">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Punjabi Statement</Label>
                       <Textarea value={formData.punjabiQuestion || ""} onChange={e => setFormData({...formData, punjabiQuestion: e.target.value})} className="h-24 rounded-xl bg-slate-50 font-bold p-4" />
                    </TabsContent>

                    <TabsContent value="hindi" className="m-0 space-y-2 animate-in fade-in duration-300">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hindi Statement</Label>
                       <Textarea value={formData.hindiQuestion || ""} onChange={e => setFormData({...formData, hindiQuestion: e.target.value})} className="h-24 rounded-xl bg-slate-50 font-bold p-4" />
                    </TabsContent>
                 </div>
              </Tabs>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">2. Bilingual Option Matrix</p>
                    <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-100 text-slate-400"><Info className="h-2.5 w-2.5 mr-1" /> Edit all languages at once</Badge>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    {['A','B','C','D'].map(opt => (
                       <div key={opt} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 group hover:border-primary/20 transition-all">
                          <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-[10px]">{opt}</span>
                                <Label className="text-[9px] font-black uppercase text-slate-500">English Text</Label>
                             </div>
                             <Input value={formData[`option${opt}English`] || ""} onChange={e => setFormData({...formData, [`option${opt}English`]: e.target.value})} className="bg-white font-bold h-11 border-slate-100" />
                          </div>
                          <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5 text-slate-300" />
                                <Label className="text-[9px] font-black uppercase text-slate-500">{activeLangTab === 'punjabi' ? 'Punjabi Text' : 'Hindi Text'}</Label>
                             </div>
                             <Input 
                               value={activeLangTab === 'punjabi' ? (formData[`option${opt}Punjabi`] || "") : (formData[`option${opt}Hindi`] || "")} 
                               onChange={e => setFormData({...formData, [activeLangTab === 'punjabi' ? `option${opt}Punjabi` : `option${opt}Hindi`]: e.target.value})} 
                               className="bg-white font-bold h-11 border-slate-100" 
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Correct Answer Key</Label>
                    <Select value={formData.correctAnswer} onValueChange={(v: any) => setFormData({...formData, correctAnswer: v})}>
                       <SelectTrigger className="h-12 rounded-xl bg-emerald-50 border-emerald-100 text-emerald-700 font-black"><SelectValue /></SelectTrigger>
                       <SelectContent>
                          {['A','B','C','D'].map(v => <SelectItem key={v} value={v}>Option {v}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject Hub</Label>
                    <Select value={formData.subjectId} onValueChange={v => setFormData({...formData, subjectId: v})}>
                       <SelectTrigger className="h-12 rounded-xl bg-slate-50 font-bold border-slate-100"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                       <SelectContent className="max-h-60 overflow-y-auto">{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">3. Solution Logic Hub</p>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">English Rationalization</Label>
                       <Textarea value={formData.englishExplanation || ""} onChange={e => setFormData({...formData, englishExplanation: e.target.value})} className="h-28 rounded-xl bg-slate-900 text-emerald-400 font-medium p-6" />
                    </div>
                    {activeLangTab === 'punjabi' ? (
                       <div className="space-y-2 animate-in slide-in-from-left-4 duration-300">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Punjabi Rationalization</Label>
                          <Textarea value={formData.punjabiExplanation || ""} onChange={e => setFormData({...formData, punjabiExplanation: e.target.value})} className="h-28 rounded-xl bg-slate-900 text-blue-400 font-medium p-6" />
                       </div>
                    ) : (
                       <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hindi Rationalization</Label>
                          <Textarea value={formData.hindiExplanation || ""} onChange={e => setFormData({...formData, hindiExplanation: e.target.value})} className="h-28 rounded-xl bg-slate-900 text-orange-400 font-medium p-6" />
                       </div>
                    )}
                 </div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-5">
           <Card className="border-none bg-white shadow-2xl rounded-[3rem] overflow-hidden sticky top-32">
             <div className="bg-[#0B1528] px-10 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Eye className="h-4 w-4 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Live CBT Preview</span>
                </div>
                <div className="flex gap-2">
                   {['EN', 'PA', 'HI', 'BI_PA', 'BI_HI'].map((l) => (
                      <button 
                        key={l}
                        onClick={() => setPreviewLang(l === 'BI_PA' ? 'ENGLISH_PUNJABI' : l === 'BI_HI' ? 'ENGLISH_HINDI' : l === 'EN' ? 'ENGLISH' : l === 'PA' ? 'PUNJABI' : 'HINDI')}
                        className={cn(
                           "text-[8px] font-black px-2 py-1 rounded border border-white/10 transition-all",
                           (previewLang === 'ENGLISH_PUNJABI' && l === 'BI_PA') || 
                           (previewLang === 'ENGLISH_HINDI' && l === 'BI_HI') || 
                           (previewLang === l.replace('EN','ENGLISH').replace('PA','PUNJABI').replace('HI','HINDI'))
                           ? "bg-primary text-white shadow-lg" : "bg-white/5 text-slate-400 hover:text-white"
                        )}
                      >
                         {l.replace('_', '+')}
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
