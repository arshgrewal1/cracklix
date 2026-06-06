
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
import { ChevronLeft, Save, Languages, Layers, Database, Eye, BarChart3, Loader2 } from "lucide-react"
import { useFirestore, useDoc, useCollection, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"
import QuestionRenderer from "@/components/questions/QuestionRenderer"

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

  const questionId = searchParams.get("id")
  const isEditing = !!questionId

  const { data: existingData } = useDoc<any>(useMemo(() => (db && questionId ? doc(db, "questions", questionId) : null), [db, questionId]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [formData, setFormData] = useState<any>({
    boardId: "", examId: "", subjectId: "", difficulty: "Medium",
    status: "DRAFT",
    englishQuestion: "", punjabiQuestion: "",
    optionAEnglish: "", optionAPunjabi: "",
    optionBEnglish: "", optionBPunjabi: "",
    optionCEnglish: "", optionCPunjabi: "",
    optionDEnglish: "", optionDPunjabi: "",
    correctAnswer: "A", 
    englishExplanation: "", punjabiExplanation: "",
    imageUrl: "",
    chapterId: ""
  })

  useEffect(() => {
    if (existingData) {
      setFormData(prev => ({ 
        ...prev, 
        ...existingData,
        // Ensure strings for controlled inputs
        englishQuestion: existingData.englishQuestion || "",
        punjabiQuestion: existingData.punjabiQuestion || "",
        optionAEnglish: existingData.optionAEnglish || "",
        optionAPunjabi: existingData.optionAPunjabi || "",
        optionBEnglish: existingData.optionBEnglish || "",
        optionBPunjabi: existingData.optionBPunjabi || "",
        optionCEnglish: existingData.optionCEnglish || "",
        optionCPunjabi: existingData.optionCPunjabi || "",
        optionDEnglish: existingData.optionDEnglish || "",
        optionDPunjabi: existingData.optionDPunjabi || "",
        englishExplanation: existingData.englishExplanation || "",
        punjabiExplanation: existingData.punjabiExplanation || ""
      }))
    }
  }, [existingData])

  const handleSave = async () => {
    if (!db || isSaving) return
    
    // Strict Validation: Audit all 12 nodes
    const mandatory = [
      'englishQuestion', 'punjabiQuestion', 
      'optionAEnglish', 'optionAPunjabi',
      'optionBEnglish', 'optionBPunjabi',
      'optionCEnglish', 'optionCPunjabi',
      'optionDEnglish', 'optionDPunjabi',
      'englishExplanation', 'punjabiExplanation',
      'subjectId'
    ];

    const missing = mandatory.filter(key => !formData[key]?.trim());
    if (missing.length > 0) {
       toast({ variant: "destructive", title: "Bilingual Audit Blocked", description: `Field missing: ${missing[0].replace(/([A-Z])/g, ' $1')}` })
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

    try {
      await setDoc(questionRef, payload, { merge: true })
      toast({ title: "Registry Synced", description: "All 12 nodes securely locked." })
      router.push("/admin/questions")
    } catch (err: any) {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: questionRef.path,
        operation: 'write',
        requestResourceData: payload,
      } satisfies SecurityRuleContext))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="rounded-2xl h-12 w-12 border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="text-left">
            <h1 className="text-3xl font-black font-headline text-[#0F172A] uppercase tracking-tight">{isEditing ? "Audit Registry" : "Manual Ingestion Node"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Strict 12-Node Field Control</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-3 font-black px-10 h-14 shadow-xl rounded-2xl uppercase tracking-widest text-xs" onClick={handleSave} disabled={isSaving}>
           {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Bilingual Assets
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
           <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] p-10 space-y-10">
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">1. Question Registry</p>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">English Statement</Label>
                       <Textarea value={formData.englishQuestion || ""} onChange={e => setFormData({...formData, englishQuestion: e.target.value})} className="h-24 rounded-xl bg-slate-50 font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Punjabi Statement</Label>
                       <Textarea value={formData.punjabiQuestion || ""} onChange={e => setFormData({...formData, punjabiQuestion: e.target.value})} className="h-24 rounded-xl bg-slate-50 font-bold" />
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">2. Option Matrix</p>
                 <div className="grid grid-cols-1 gap-8">
                    {['A','B','C','D'].map(opt => (
                       <div key={opt} className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase text-slate-500">Option {opt} English</Label>
                             <Input value={formData[`option${opt}English`] || ""} onChange={e => setFormData({...formData, [`option${opt}English`]: e.target.value})} className="bg-white font-bold" />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase text-slate-500">Option {opt} Punjabi</Label>
                             <Input value={formData[`option${opt}Punjabi`] || ""} onChange={e => setFormData({...formData, [`option${opt}Punjabi`]: e.target.value})} className="bg-white font-bold" />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Logic Key</Label>
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
                       <SelectTrigger className="h-12 rounded-xl bg-slate-50 font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                       <SelectContent>{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">3. Solution Archives</p>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">English Logic</Label>
                       <Textarea value={formData.englishExplanation || ""} onChange={e => setFormData({...formData, englishExplanation: e.target.value})} className="h-40 rounded-xl bg-slate-900 text-emerald-400 font-medium" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Punjabi Logic</Label>
                       <Textarea value={formData.punjabiExplanation || ""} onChange={e => setFormData({...formData, punjabiExplanation: e.target.value})} className="h-40 rounded-xl bg-slate-900 text-blue-400 font-medium" />
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-5">
           <Card className="border-none bg-white shadow-2xl rounded-[3rem] overflow-hidden sticky top-32">
             <div className="bg-[#0B1528] px-10 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Eye className="h-4 w-4 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Student View Node</span>
                </div>
                <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase tracking-widest px-3 py-1">Zero Inference Logic</Badge>
             </div>
             <CardContent className="p-10 space-y-10 h-[70vh] overflow-y-auto custom-scrollbar text-left">
                <QuestionRenderer 
                   language="bilingual" 
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
