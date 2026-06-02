
"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Save, Languages } from "lucide-react"
import { useFirestore, useDoc, useCollection } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function QuestionEntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const questionId = searchParams.get("id")
  const isEditing = !!questionId

  const { data: existingData } = useDoc(useMemo(() => (db && questionId ? doc(db, "questions", questionId) : null), [db, questionId]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [formData, setFormData] = useState({
    boardId: "", examId: "", subjectId: "", difficulty: "medium",
    questionEn: "", questionPa: "",
    optionAEn: "", optionAPa: "", optionBEn: "", optionBPa: "",
    optionCEn: "", optionCPa: "", optionDEn: "", optionDPa: "",
    correctAnswer: "A", explanationEn: "", explanationPa: ""
  })

  useEffect(() => {
    if (existingData) setFormData({ ...existingData })
  }, [existingData])

  const filteredExams = useMemo(() => {
    if (!exams || !formData.boardId) return []
    return exams.filter(e => e.boardId === formData.boardId)
  }, [exams, formData.boardId])

  const handleSave = () => {
    if (!db) return
    if (!formData.questionEn || !formData.subjectId || !formData.boardId || !formData.examId) {
      toast({ variant: "destructive", title: "Audit Error", description: "Select Board, Exam, and Subject before saving." })
      return
    }

    setIsSaving(true)
    const finalId = questionId || `q-${Date.now()}`
    const questionRef = doc(db, "questions", finalId)
    const payload = { 
      ...formData, 
      id: finalId, 
      createdAt: isEditing ? (existingData?.createdAt || serverTimestamp()) : serverTimestamp(),
      author: "Arsh Grewal Management"
    }

    setDoc(questionRef, payload, { merge: true })
      .then(() => {
        toast({ title: "Bank Synced", description: "MCQ successfully audited and saved." })
        router.push("/admin/questions")
      })
      .catch(async (error) => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({ path: questionRef.path, operation: isEditing ? "update" : "create", requestResourceData: payload }))
      })
      .finally(() => setIsSaving(false))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-foreground/5 bg-card/30" onClick={() => router.back()}><ChevronLeft className="h-6 w-6" /></Button>
          <div>
            <h1 className="text-3xl font-black font-headline text-primary uppercase">{isEditing ? "Audit MCQ" : "Composition"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Institutional Hub: Arsh Grewal Management</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-3 font-black px-10 h-14 shadow-xl rounded-2xl" onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4" /> {isSaving ? "Syncing..." : "Commit MCQ"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="english" className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
               <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Bilingual Node</Label>
               <TabsList className="bg-slate-100 rounded-xl p-1 h-12">
                  <TabsTrigger value="english" className="rounded-lg px-6 gap-2 text-xs font-bold"><Languages className="h-3.5 w-3.5" /> English</TabsTrigger>
                  <TabsTrigger value="punjabi" className="rounded-lg px-6 gap-2 text-xs font-bold"><Languages className="h-3.5 w-3.5" /> ਪੰਜਾਬੀ</TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value="english" className="space-y-6">
               <Card className="border-none bg-white shadow-2xl rounded-[3rem]">
                  <CardContent className="p-10 space-y-8">
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">Statement (EN)</Label><Textarea value={formData.questionEn} onChange={e => setFormData({...formData, questionEn: e.target.value})} className="min-h-[150px] rounded-2xl bg-slate-50 border-none p-6 text-lg font-medium leading-relaxed" /></div>
                    <div className="grid grid-cols-2 gap-6">
                       {['A','B','C','D'].map(opt => (
                         <div key={opt} className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">Option {opt}</Label><Input value={(formData as any)[`option${opt}En`]} onChange={e => setFormData({...formData, [`option${opt}En`]: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" /></div>
                       ))}
                    </div>
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">Explanation (EN)</Label><Textarea value={formData.explanationEn} onChange={e => setFormData({...formData, explanationEn: e.target.value})} className="rounded-2xl bg-slate-50 border-none p-6 leading-relaxed" /></div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="punjabi" className="space-y-6">
               <Card className="border-none bg-white shadow-2xl rounded-[3rem]">
                  <CardContent className="p-10 space-y-8">
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">ਪ੍ਰਸ਼ਨ (PA)</Label><Textarea value={formData.questionPa} onChange={e => setFormData({...formData, questionPa: e.target.value})} className="min-h-[150px] rounded-2xl bg-slate-50 border-none p-6 text-lg font-medium leading-relaxed" /></div>
                    <div className="grid grid-cols-2 gap-6">
                       {['A','B','C','D'].map(opt => (
                         <div key={opt} className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">ਵਿਕਲਪ {opt}</Label><Input value={(formData as any)[`option${opt}Pa`]} onChange={e => setFormData({...formData, [`option${opt}Pa`]: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" /></div>
                       ))}
                    </div>
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">ਵਿਆਖਿਆ (PA)</Label><Textarea value={formData.explanationPa} onChange={e => setFormData({...formData, explanationPa: e.target.value})} className="rounded-2xl bg-slate-50 border-none p-6 leading-relaxed" /></div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-8 pt-16">
          <Card className="border-none bg-card/50 shadow-3xl rounded-[2.5rem]">
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Board & Exam Hub</Label>
                <Select value={formData.boardId} onValueChange={val => setFormData({...formData, boardId: val, examId: ""})}>
                  <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm"><SelectValue placeholder="Select Authority" /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">{boards?.sort((a,b) => a.abbreviation.localeCompare(b.abbreviation)).map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                </Select>
                <Select disabled={!formData.boardId} value={formData.examId} onValueChange={val => setFormData({...formData, examId: val})}>
                  <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm"><SelectValue placeholder={formData.boardId ? "Select Exam" : "Select Board First"} /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">{filteredExams?.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Subject & Level</Label>
                <Select value={formData.subjectId} onValueChange={val => setFormData({...formData, subjectId: val})}>
                  <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={formData.difficulty} onValueChange={val => setFormData({...formData, difficulty: val as any})}>
                  <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="easy">Easy Level</SelectItem><SelectItem value="medium">Medium Level</SelectItem><SelectItem value="hard">Hard Level</SelectItem></SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Institutional Key</Label>
                <RadioGroup value={formData.correctAnswer} onValueChange={val => setFormData({...formData, correctAnswer: val as any})} className="grid grid-cols-2 gap-4">
                  {['A','B','C','D'].map(opt => (
                    <div key={opt} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${formData.correctAnswer === opt ? 'border-primary bg-primary/10 shadow-lg' : 'border-white/5 hover:bg-white/5'}`}>
                      <RadioGroupItem value={opt} id={`key-${opt}`} /><Label htmlFor={`key-${opt}`} className="font-black text-xs cursor-pointer">Option {opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
