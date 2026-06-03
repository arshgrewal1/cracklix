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
  const { user, profile } = useUser()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const questionId = searchParams.get("id")
  const isEditing = !!questionId

  const { data: existingData } = useDoc<any>(useMemo(() => (db && questionId ? doc(db, "questions", questionId) : null), [db, questionId]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [formData, setFormData] = useState({
    boardId: "", examId: "", subjectId: "", difficulty: "medium",
    status: "DRAFT" as any,
    questionEn: "", questionPa: "",
    optionAEn: "", optionAPa: "", optionBEn: "", optionBPa: "",
    optionCEn: "", optionCPa: "", optionDEn: "", optionDPa: "",
    correctAnswer: "A", explanationEn: "", explanationPa: ""
  })

  useEffect(() => {
    if (existingData) setFormData({ ...existingData })
  }, [existingData])

  const handleSave = () => {
    if (!db || isSaving) return
    if (!formData.questionEn || !formData.subjectId || !formData.boardId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Primary classification missing." })
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
          <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-foreground/5 bg-card/30" onClick={() => router.back()}><ChevronLeft className="h-6 w-6" /></Button>
          <div>
            <h1 className="text-3xl font-black font-headline text-primary uppercase">{isEditing ? "Audit Node" : "Compose Node"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Enterprise Question Workflow Active</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
             <SelectTrigger className="h-14 w-44 rounded-2xl bg-white/5 border-white/10 font-black uppercase text-[10px] tracking-widest"><SelectValue /></SelectTrigger>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="english" className="w-full">
            <TabsList className="bg-slate-100 rounded-xl p-1 h-12 mb-6">
              <TabsTrigger value="english" className="rounded-lg px-8 font-bold text-xs"><Languages className="h-4 w-4 mr-2" /> English</TabsTrigger>
              <TabsTrigger value="punjabi" className="rounded-lg px-8 font-bold text-xs"><Languages className="h-4 w-4 mr-2" /> ਪੰਜਾਬੀ</TabsTrigger>
            </TabsList>

            <TabsContent value="english" className="space-y-6">
              <Card className="border-none bg-white shadow-2xl rounded-[3rem] p-10 space-y-8">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">Question Statement (EN)</Label><Textarea value={formData.questionEn} onChange={e => setFormData({...formData, questionEn: e.target.value})} className="min-h-[120px] rounded-2xl bg-slate-50 border-none p-6 text-lg font-medium" /></div>
                <div className="grid grid-cols-2 gap-6">
                  {['A','B','C','D'].map(opt => (
                    <div key={opt} className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">Option {opt}</Label><Input value={(formData as any)[`option${opt}En`]} onChange={e => setFormData({...formData, [`option${opt}En`]: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" /></div>
                  ))}
                </div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">Detailed Rationale (EN)</Label><Textarea value={formData.explanationEn} onChange={e => setFormData({...formData, explanationEn: e.target.value})} className="rounded-2xl bg-slate-50 border-none p-6" /></div>
              </Card>
            </TabsContent>

            <TabsContent value="punjabi" className="space-y-6">
              <Card className="border-none bg-white shadow-2xl rounded-[3rem] p-10 space-y-8">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">Question Statement (PA)</Label><Textarea value={formData.questionPa} onChange={e => setFormData({...formData, questionPa: e.target.value})} className="min-h-[120px] rounded-2xl bg-slate-50 border-none p-6 text-lg font-medium" /></div>
                <div className="grid grid-cols-2 gap-6">
                  {['A','B','C','D'].map(opt => (
                    <div key={opt} className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">Option {opt} (PA)</Label><Input value={(formData as any)[`option${opt}Pa`]} onChange={e => setFormData({...formData, [`option${opt}Pa`]: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" /></div>
                  ))}
                </div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">Detailed Rationale (PA)</Label><Textarea value={formData.explanationPa} onChange={e => setFormData({...formData, explanationPa: e.target.value})} className="rounded-2xl bg-slate-50 border-none p-6" /></div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none bg-card/50 shadow-3xl rounded-[2.5rem] p-10 space-y-10">
            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Board Authority</Label>
              <Select value={formData.boardId} onValueChange={val => setFormData({...formData, boardId: val})}>
                <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm"><SelectValue placeholder="Select Authority" /></SelectTrigger>
                <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            
            <div className="space-y-6 pt-6 border-t border-white/5">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Correct Logic</Label>
              <RadioGroup value={formData.correctAnswer} onValueChange={(val: any) => setFormData({...formData, correctAnswer: val})} className="grid grid-cols-2 gap-4">
                {['A','B','C','D'].map(opt => (
                  <div key={opt} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${formData.correctAnswer === opt ? 'border-primary bg-primary/10' : 'border-white/5'}`}>
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
