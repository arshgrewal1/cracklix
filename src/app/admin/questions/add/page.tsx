
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Save, Sparkles, Languages, LayoutGrid } from "lucide-react"
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

  const { data: existingData, loading: loadingExisting } = useDoc(
    useMemo(() => (db && questionId ? doc(db, "questions", questionId) : null), [db, questionId])
  )

  const subjectsQuery = useMemo(() => (db ? collection(db, "subjects") : null), [db])
  const { data: subjects } = useCollection<any>(subjectsQuery)

  const [formData, setFormData] = useState({
    textEn: "",
    textPa: "",
    optionsEn: ["", "", "", ""],
    optionsPa: ["", "", "", ""],
    correctAnswer: "0",
    subjectId: "",
    topic: "",
    difficulty: "Medium",
    explanationEn: "",
    explanationPa: ""
  })

  useEffect(() => {
    if (existingData) {
      setFormData({
        textEn: existingData.textEn || "",
        textPa: existingData.textPa || "",
        optionsEn: existingData.optionsEn || ["", "", "", ""],
        optionsPa: existingData.optionsPa || ["", "", "", ""],
        correctAnswer: (existingData.correctAnswer ?? 0).toString(),
        subjectId: existingData.subjectId || "",
        topic: existingData.topic || "",
        difficulty: existingData.difficulty || "Medium",
        explanationEn: existingData.explanationEn || "",
        explanationPa: existingData.explanationPa || ""
      })
    }
  }, [existingData])

  const handleOptionChange = (lang: 'En' | 'Pa', idx: number, value: string) => {
    const key = lang === 'En' ? 'optionsEn' : 'optionsPa'
    const newOptions = [...formData[key]]
    newOptions[idx] = value
    setFormData({ ...formData, [key]: newOptions })
  }

  const handleSave = () => {
    if (!db) return
    if (!formData.textEn || formData.optionsEn.some(o => !o) || !formData.subjectId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please complete English statement and options." })
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
        toast({ title: isEditing ? "Updated" : "Created", description: "Bilingual question committed to bank." })
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
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between bg-card/30 p-6 rounded-[2rem] border border-foreground/5 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-foreground/5 bg-background shadow-sm" onClick={() => router.back()}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black font-headline text-primary tracking-tight">
              {isEditing ? "Edit Bilingual MCQ" : "MCQ Composition Portal"}
            </h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Audit Mode: Arsh Grewal Management</p>
          </div>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 gap-3 font-black px-10 h-14 shadow-2xl shadow-primary/20 rounded-2xl uppercase tracking-widest text-xs" 
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" /> {isSaving ? "Saving..." : isEditing ? "Update Master" : "Commit to Bank"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="english" className="w-full">
            <div className="flex items-center justify-between mb-4">
               <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground ml-1">Content Language</Label>
               <TabsList className="bg-slate-100 rounded-xl p-1">
                  <TabsTrigger value="english" className="rounded-lg gap-2 text-xs font-bold"><Languages className="h-3 w-3" /> English</TabsTrigger>
                  <TabsTrigger value="punjabi" className="rounded-lg gap-2 text-xs font-bold"><Languages className="h-3 w-3" /> Punjabi</TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value="english" className="space-y-8">
              <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
                <div className="h-2 w-full bg-primary" />
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="font-headline text-xl font-bold flex items-center gap-3">
                    <LayoutGrid className="h-5 w-5 text-primary" /> Question Statement (EN)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <Textarea 
                    placeholder="Enter question in English..." 
                    className="min-h-[160px] rounded-2xl bg-background/50 border-none shadow-inner text-lg leading-relaxed"
                    value={formData.textEn}
                    onChange={(e) => setFormData({...formData, textEn: e.target.value})}
                  />
                  <div className="space-y-4">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground ml-1">English Options</Label>
                    <RadioGroup 
                      value={formData.correctAnswer} 
                      onValueChange={(val) => setFormData({...formData, correctAnswer: val})}
                      className="grid grid-cols-1 gap-3"
                    >
                      {formData.optionsEn.map((opt, i) => (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${formData.correctAnswer === i.toString() ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'}`}>
                          <RadioGroupItem value={i.toString()} id={`en-opt-${i}`} />
                          <div className="flex-1 flex items-center gap-4">
                             <span className="font-headline font-black text-sm w-6 text-slate-300">{String.fromCharCode(65 + i)}</span>
                             <Input 
                              placeholder={`Option ${String.fromCharCode(65 + i)} (EN)`}
                              value={opt}
                              onChange={(e) => handleOptionChange('En', i, e.target.value)}
                              className="border-none bg-transparent shadow-none p-0 text-base font-bold"
                            />
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-foreground/5 bg-card/50 shadow-xl rounded-[2.5rem]">
                <CardHeader className="p-8 pb-0"><CardTitle className="font-headline text-lg font-bold">Explanation (EN)</CardTitle></CardHeader>
                <CardContent className="p-8">
                  <Textarea 
                    placeholder="English explanation..." 
                    className="min-h-[120px] rounded-2xl bg-background/50 border-none"
                    value={formData.explanationEn}
                    onChange={(e) => setFormData({...formData, explanationEn: e.target.value})}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="punjabi" className="space-y-8">
               <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
                <div className="h-2 w-full bg-orange-500" />
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="font-headline text-xl font-bold flex items-center gap-3">
                    <LayoutGrid className="h-5 w-5 text-orange-500" /> ਪੰਜਾਬੀ ਪ੍ਰਸ਼ਨ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <Textarea 
                    placeholder="ਪੰਜਾਬੀ ਵਿੱਚ ਪ੍ਰਸ਼ਨ ਲਿਖੋ..." 
                    className="min-h-[160px] rounded-2xl bg-background/50 border-none shadow-inner text-lg leading-relaxed font-medium"
                    value={formData.textPa}
                    onChange={(e) => setFormData({...formData, textPa: e.target.value})}
                  />
                  <div className="space-y-4">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground ml-1">ਪੰਜਾਬੀ ਵਿਕਲਪ</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {formData.optionsPa.map((opt, i) => (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${formData.correctAnswer === i.toString() ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 bg-white'}`}>
                          <div className="flex-1 flex items-center gap-4">
                             <span className="font-headline font-black text-sm w-6 text-slate-300">{String.fromCharCode(65 + i)}</span>
                             <Input 
                              placeholder={`ਵਿਕਲਪ ${String.fromCharCode(65 + i)} (PA)`}
                              value={opt}
                              onChange={(e) => handleOptionChange('Pa', i, e.target.value)}
                              className="border-none bg-transparent shadow-none p-0 text-base font-medium"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-foreground/5 bg-card/50 shadow-xl rounded-[2.5rem]">
                <CardHeader className="p-8 pb-0"><CardTitle className="font-headline text-lg font-bold">ਵਿਆਖਿਆ (PA)</CardTitle></CardHeader>
                <CardContent className="p-8">
                  <Textarea 
                    placeholder="ਪੰਜਾਬੀ ਵਿੱਚ ਵਿਆਖਿਆ..." 
                    className="min-h-[120px] rounded-2xl bg-background/50 border-none font-medium"
                    value={formData.explanationPa}
                    onChange={(e) => setFormData({...formData, explanationPa: e.target.value})}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-8 pt-[4.5rem]">
          <Card className="border-foreground/5 bg-card/50 shadow-xl rounded-[2rem]">
            <CardHeader><CardTitle className="font-headline text-lg font-bold">Classification</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Subject Category</Label>
                <Select value={formData.subjectId} onValueChange={(val) => setFormData({...formData, subjectId: val})}>
                  <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Topic</Label>
                <Input placeholder="e.g. Modern Punjab History" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="rounded-xl h-12 bg-background border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Difficulty Pattern</Label>
                <Select value={formData.difficulty} onValueChange={(val) => setFormData({...formData, difficulty: val as any})}>
                  <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy Pattern</SelectItem>
                    <SelectItem value="Medium">Standard Pattern</SelectItem>
                    <SelectItem value="Hard">Advanced Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
