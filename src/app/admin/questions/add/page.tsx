
"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Save, Languages, ShieldCheck, Clock } from "lucide-react"
import { useFirestore, useDoc, useCollection, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

/**
 * @fileOverview Question Entry with Trilingual Support (EN/PA/HI).
 */

export default function QuestionEntryPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
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

  const [formData, setFormData] = useState({
    boardId: "", examId: "", subjectId: "", difficulty: "medium",
    status: "DRAFT" as any,
    questionEn: "", questionPa: "", questionHi: "",
    optionAEn: "", optionAPa: "", optionAHi: "",
    optionBEn: "", optionBPa: "", optionBHi: "",
    optionCEn: "", optionCPa: "", optionCHi: "",
    optionDEn: "", optionDPa: "", optionDHi: "",
    correctAnswer: "A", 
    explanationEn: "", explanationPa: "", explanationHi: ""
  })

  useEffect(() => {
    if (existingData) setFormData({ ...existingData })
  }, [existingData])

  const handleSave = () => {
    if (!db || isSaving) return
    if (!formData.questionEn || !formData.subjectId || !formData.boardId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Primary classification (EN) missing." })
      return
    }

    setIsSaving(true)
    const finalId = questionId || `q-${Date.now()}`
    const questionRef = doc(db, "questions", finalId)
    const payload = { 
      ...formData, 
      id: finalId, 
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingData?.createdAt || serverTimestamp()) : serverTimestamp(),
      author: existingData?.author || profile?.name || "Team Node"
    }

    setDoc(questionRef, payload, { merge: true })
      .then(() => {
        toast({ title: "Node Synced", description: `MCQ status set to: ${formData.status}` })
        router.push("/admin/questions")
      })
      .catch(async () => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({ path: questionRef.path, operation: 'write', requestResourceData: payload }))
      })
      .finally(() => setIsSaving(false))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-slate-200 bg-white" onClick={() => router.back()}><ChevronLeft className="h-6 w-6" /></Button>
          <div>
            <h1 className="text-3xl font-black font-headline text-[#0F172A] uppercase">Audit Node</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Enterprise Trilingual Workflow Active</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
             <SelectTrigger className="h-14 w-44 rounded-2xl bg-white border-slate-200 font-black uppercase text-[10px] tracking-widest text-[#0F172A]"><SelectValue /></SelectTrigger>
             <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="REVIEW">Audit Queue</SelectItem>
                <SelectItem value="PUBLISHED">Go Live</SelectItem>
             </SelectContent>
           </Select>
           <Button className="bg-primary hover:bg-primary/90 gap-3 font-black px-10 h-14 shadow-xl rounded-2xl uppercase tracking-widest text-xs" onClick={handleSave} disabled={isSaving}>
             <Save className="h-4 w-4" /> {isSaving ? "Syncing..." : "Sync Global Bank"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-[#0F172A]">
        <div className="lg:col-span-8 space-y-8 text-left">
          <Tabs defaultValue="english" className="w-full">
            <TabsList className="bg-slate-100 rounded-2xl p-1.5 h-16 mb-6">
              <TabsTrigger value="english" className="rounded-xl px-8 font-black uppercase text-[10px] h-full"><Languages className="h-4 w-4 mr-2" /> English</TabsTrigger>
              <TabsTrigger value="punjabi" className="rounded-xl px-8 font-black uppercase text-[10px] h-full"><Languages className="h-4 w-4 mr-2" /> ਪੰਜਾਬੀ</TabsTrigger>
              <TabsTrigger value="hindi" className="rounded-xl px-8 font-black uppercase text-[10px] h-full"><Languages className="h-4 w-4 mr-2" /> हिन्दी</TabsTrigger>
            </TabsList>

            <TabsContent value="english" className="space-y-6">
               <QuestionTabContent lang="En" label="English" formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="punjabi" className="space-y-6">
               <QuestionTabContent lang="Pa" label="Punjabi" formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="hindi" className="space-y-6">
               <QuestionTabContent lang="Hi" label="Hindi" formData={formData} setFormData={setFormData} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-slate-100 bg-white shadow-xl rounded-[2.5rem] p-10 space-y-10 text-left">
            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Board Authority</Label>
              <Select value={formData.boardId} onValueChange={val => setFormData({...formData, boardId: val})}>
                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-100 shadow-inner"><SelectValue placeholder="Select Authority" /></SelectTrigger>
                <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Subject Logic</Label>
              <Select value={formData.subjectId} onValueChange={val => setFormData({...formData, subjectId: val})}>
                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-100 shadow-inner"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            
            <div className="space-y-6 pt-6 border-t border-slate-50">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Correct Logic</Label>
              <RadioGroup value={formData.correctAnswer} onValueChange={(val: any) => setFormData({...formData, correctAnswer: val})} className="grid grid-cols-2 gap-4">
                {['A','B','C','D'].map(opt => (
                  <div key={opt} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${formData.correctAnswer === opt ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50/50'}`}>
                    <RadioGroupItem value={opt} id={`opt-${opt}`} /><Label htmlFor={`opt-${opt}`} className="font-black text-xs cursor-pointer">Option {opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function QuestionTabContent({ lang, label, formData, setFormData }: any) {
  return (
    <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] p-12 space-y-10">
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Question Statement ({label})</Label>
        <Textarea 
          value={formData[`question${lang}`]} 
          onChange={e => setFormData({...formData, [`question${lang}`]: e.target.value})} 
          className="min-h-[150px] rounded-3xl bg-slate-50 border-slate-100 p-8 text-xl font-medium leading-relaxed text-[#0F172A]" 
          placeholder={`Enter question in ${label}...`}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {['A','B','C','D'].map(opt => (
          <div key={opt} className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Option {opt} ({label})</Label>
            <Input 
              value={formData[`option${opt}${lang}`]} 
              onChange={e => setFormData({...formData, [`option${opt}${lang}`]: e.target.value})} 
              className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold px-6 text-[#0F172A]" 
              placeholder={`Option ${opt}...`}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-6 border-t border-slate-50">
        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Detailed Rationale ({label})</Label>
        <Textarea 
          value={formData[`explanation${lang}`]} 
          onChange={e => setFormData({...formData, [`explanation${lang}`]: e.target.value})} 
          className="rounded-3xl bg-slate-50 border-slate-100 p-8 min-h-[150px] text-slate-600 font-medium leading-relaxed" 
          placeholder={`Explain why the answer is correct in ${label}...`}
        />
      </div>
    </Card>
  )
}
