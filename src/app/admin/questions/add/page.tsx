
"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft, Save, Sparkles, Trash2, PlusCircle, LayoutGrid } from "lucide-react"
import { useFirestore, useDoc, useCollection } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection, query } from "firebase/firestore"
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

  const { data: existingData, loading: loadingExisting } = useDoc(
    useMemo(() => (db && questionId ? doc(db, "questions", questionId) : null), [db, questionId])
  )

  const subjectsQuery = useMemo(() => (db ? collection(db, "subjects") : null), [db])
  const { data: subjects } = useCollection<any>(subjectsQuery)

  const [formData, setFormData] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "0",
    subjectId: "",
    topic: "",
    difficulty: "Medium",
    explanation: ""
  })

  useEffect(() => {
    if (existingData) {
      setFormData({
        text: existingData.text || "",
        options: existingData.options || ["", "", "", ""],
        correctAnswer: (existingData.correctAnswer ?? 0).toString(),
        subjectId: existingData.subjectId || "",
        topic: existingData.topic || "",
        difficulty: existingData.difficulty || "Medium",
        explanation: existingData.explanation || ""
      })
    }
  }, [existingData])

  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[idx] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSave = () => {
    if (!db) return
    if (!formData.text || formData.options.some(o => !o) || !formData.subjectId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please complete all fields before saving." })
      return
    }

    setIsSaving(true)

    const finalId = questionId || `q-${Date.now()}`
    const questionRef = doc(db, "questions", finalId)

    const payload = {
      ...formData,
      id: finalId,
      correctAnswer: parseInt(formData.correctAnswer),
      createdAt: isEditing ? (existingData?.createdAt || serverTimestamp()) : serverTimestamp(),
      lastModified: serverTimestamp(),
      author: "Arsh Grewal"
    }

    setDoc(questionRef, payload, { merge: true })
      .then(() => {
        toast({ title: isEditing ? "Updated" : "Created", description: "Question successfully committed to the global bank." })
        router.push("/admin/questions")
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: questionRef.path,
          operation: isEditing ? "update" : "create",
          requestResourceData: payload
        })
        errorEmitter.emit("permission-error", permissionError)
      })
      .finally(() => setIsSaving(false))
  }

  if (loadingExisting) return <div className="h-96 flex items-center justify-center"><Sparkles className="h-10 w-10 text-primary animate-spin" /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between bg-card/30 p-6 rounded-[2rem] border border-foreground/5 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-foreground/5 bg-background shadow-sm" onClick={() => router.back()}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black font-headline text-primary tracking-tight">
              {isEditing ? "Edit Global MCQ" : "MCQ Composition Portal"}
            </h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Audit Mode: Arsh Grewal Management</p>
          </div>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 gap-3 font-black px-10 h-14 shadow-2xl shadow-primary/20 rounded-2xl uppercase tracking-widest text-xs" 
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" /> {isSaving ? "Saving..." : isEditing ? "Update Master Entry" : "Commit to Bank"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-8 pb-0">
              <CardTitle className="font-headline text-xl font-bold flex items-center gap-3">
                <LayoutGrid className="h-5 w-5 text-primary" /> Content & Solutions
              </CardTitle>
              <CardDescription>Primary statement and official answer logic.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground ml-1">Question Statement</Label>
                <Textarea 
                  placeholder="Type the high-fidelity question here..." 
                  className="min-h-[160px] rounded-2xl bg-background/50 border-none shadow-inner text-lg leading-relaxed focus:bg-background transition-all"
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground ml-1">Answer Options (Select Correct Choice)</Label>
                <RadioGroup 
                  value={formData.correctAnswer} 
                  onValueChange={(val) => setFormData({...formData, correctAnswer: val})}
                  className="grid grid-cols-1 gap-4"
                >
                  {formData.options.map((opt, i) => (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${formData.correctAnswer === i.toString() ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
                      <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="border-primary/40" />
                      <div className="flex-1 flex items-center gap-4">
                         <span className={`font-headline font-black text-sm w-6 ${formData.correctAnswer === i.toString() ? 'text-primary' : 'text-slate-300'}`}>{String.fromCharCode(65 + i)}</span>
                         <Input 
                          placeholder={`Enter Option ${String.fromCharCode(65 + i)}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          className="border-none bg-transparent shadow-none focus:ring-0 p-0 text-base font-bold text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="border-foreground/5 bg-card/50 shadow-xl rounded-[2.5rem]">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="font-headline text-xl font-bold flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-secondary" /> Detailed Rationalization
              </CardTitle>
              <CardDescription>Step-by-step logic shown in student performance analysis.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Textarea 
                placeholder="Explain the logic, shortcuts or rules applied to arrive at the correct answer..." 
                className="min-h-[180px] rounded-2xl bg-background/50 border-none shadow-inner text-base leading-relaxed"
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-foreground/5 bg-card/50 shadow-xl rounded-[2rem]">
            <CardHeader>
              <CardTitle className="font-headline text-lg font-bold">Taxonomy & Meta</CardTitle>
              <CardDescription>Classification for smart filtering.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject Category</Label>
                <Select value={formData.subjectId} onValueChange={(val) => setFormData({...formData, subjectId: val})}>
                  <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    {!subjects && <SelectItem value="punjab-gk">Punjab GK</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Topic / Sub-category</Label>
                <Input 
                  placeholder="e.g. Modern Punjab History" 
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="rounded-xl h-12 bg-background border-none shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pattern Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(val) => setFormData({...formData, difficulty: val})}
                >
                  <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy Pattern</SelectItem>
                    <SelectItem value="Medium">Standard Pattern</SelectItem>
                    <SelectItem value="Hard">Advanced Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-primary/5 rounded-[2rem] border-dashed">
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-bold text-[#0F172A]">AI Verification Active</p>
              <p className="text-[10px] text-muted-foreground font-medium">Explanations are analyzed for clarity before student publication.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
