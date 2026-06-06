
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
import { ChevronLeft, Save, Languages, Layers, Database, Eye, BarChart3 } from "lucide-react"
import { useFirestore, useDoc, useCollection, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"
import QuestionRenderer from "@/components/questions/QuestionRenderer"

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

  const [formData, setFormData] = useState<any>({
    boardId: "", examId: "", subjectId: "", difficulty: "Medium",
    status: "DRAFT",
    questionType: "MCQ",
    diagramType: "none",
    questionEn: "", questionPa: "",
    optionAEn: "", optionAPa: "",
    optionBEn: "", optionBPa: "",
    optionCEn: "", optionCPa: "",
    optionDEn: "", optionDPa: "",
    correctAnswer: "A", 
    explanationEn: "", explanationPa: "",
    instructionEn: "", instructionPa: "",
    passageEn: "", passagePa: "",
    tableDataJson: "",
    chartConfigJson: "",
    imageUrl: "",
    chapterId: ""
  })

  useEffect(() => {
    if (existingData) {
      const sanitized = { ...existingData };
      Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === null) sanitized[key] = "";
      });

      setFormData({ 
        ...sanitized,
        tableDataJson: existingData.tableData ? JSON.stringify(existingData.tableData, null, 2) : "",
        chartConfigJson: existingData.chartConfig ? JSON.stringify(existingData.chartConfig, null, 2) : ""
      })
    }
  }, [existingData])

  const handleSave = () => {
    if (!db || isSaving) return
    
    let tableData = null;
    let chartConfig = null;
    
    try {
      if (formData.tableDataJson) tableData = JSON.parse(formData.tableDataJson);
      if (formData.chartConfigJson) chartConfig = JSON.parse(formData.chartConfigJson);
    } catch (e) {
      toast({ variant: "destructive", title: "JSON Error", description: "Invalid Table or Chart data format." })
      return
    }

    setIsSaving(true)
    const finalId = questionId || `q-${Date.now()}`
    const questionRef = doc(db, "questions", finalId)
    
    const basePayload: any = { 
      ...formData, 
      id: finalId,
      tableData,
      chartConfig,
      isStandalone: true,
      author: existingData?.author || profile?.name || "Team Node"
    };
    
    delete basePayload.tableDataJson;
    delete basePayload.chartConfigJson;

    // Purge undefined/null values
    Object.keys(basePayload).forEach(key => (basePayload[key] === undefined || basePayload[key] === null) && delete basePayload[key]);

    const finalPayload = {
      ...basePayload,
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingData?.createdAt || serverTimestamp()) : serverTimestamp(),
    };

    setDoc(questionRef, finalPayload, { merge: true })
      .then(() => {
        toast({ title: "Node Synced", description: `Asset updated in Global Bank.` })
        router.push("/admin/questions")
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: questionRef.path,
          operation: 'write',
          requestResourceData: finalPayload,
        } satisfies SecurityRuleContext);
        errorEmitter.emit("permission-error", permissionError)
      })
      .finally(() => setIsSaving(false))
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-slate-200 bg-white" onClick={() => router.back()}><ChevronLeft className="h-6 w-6" /></Button>
          <div className="text-left">
            <h1 className="text-3xl font-black font-headline text-[#0F172A] uppercase tracking-tight">{isEditing ? "Audit Entry" : "Manual Entry Node"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">High-Fidelity Question Engineering</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
             <SelectTrigger className="h-14 w-44 rounded-2xl bg-white border-slate-200 font-black uppercase text-[10px] tracking-widest text-[#0F172A] shadow-sm"><SelectValue /></SelectTrigger>
             <SelectContent>
                <SelectItem value="DRAFT">Draft Mode</SelectItem>
                <SelectItem value="REVIEW">Audit Queue</SelectItem>
                <SelectItem value="PUBLISHED">Go Live</SelectItem>
             </SelectContent>
           </Select>
           <Button className="bg-primary hover:bg-primary/90 gap-3 font-black px-10 h-14 shadow-xl rounded-2xl uppercase tracking-widest text-xs" onClick={handleSave} disabled={isSaving}>
             <Save className="h-4 w-4" /> {isSaving ? "Syncing..." : "Commit Changes"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-[#0F172A]">
        <div className="lg:col-span-7 space-y-8 text-left overflow-hidden">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="bg-slate-100 rounded-2xl p-1.5 h-16 mb-6 flex flex-nowrap overflow-x-auto overflow-y-hidden custom-scrollbar max-w-full justify-start items-center">
              <TabsTrigger value="content" className="rounded-xl px-8 font-black uppercase text-[10px] h-full shrink-0"><Database className="h-4 w-4 mr-2" /> Basic Content</TabsTrigger>
              <TabsTrigger value="complex" className="rounded-xl px-8 font-black uppercase text-[10px] h-full shrink-0"><BarChart3 className="h-4 w-4 mr-2" /> Diagram/Data</TabsTrigger>
              <TabsTrigger value="punjabi" className="rounded-xl px-8 font-black uppercase text-[10px] h-full shrink-0"><Languages className="h-4 w-4 mr-2" /> ਪੰਜਾਬੀ</TabsTrigger>
              <TabsTrigger value="metadata" className="rounded-xl px-8 font-black uppercase text-[10px] h-full shrink-0"><Layers className="h-4 w-4 mr-2" /> Classification</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
               <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] p-12 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3 text-left">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Inquiry Type</Label>
                        <Select value={formData.questionType} onValueChange={(v: any) => setFormData({...formData, questionType: v})}>
                           <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100"><SelectValue /></SelectTrigger>
                           <SelectContent>
                              <SelectItem value="MCQ">Standard MCQ</SelectItem>
                              <SelectItem value="MATCHING">Match Following</SelectItem>
                              <SelectItem value="ASSERTION_REASON">Assertion Reason</SelectItem>
                              <SelectItem value="DI_QUESTION">DI Question</SelectItem>
                              <SelectItem value="PASSAGE_QUESTION">Passage Question</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-3 text-left">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Correct Logic Output</Label>
                        <Select value={formData.correctAnswer} onValueChange={(v: any) => setFormData({...formData, correctAnswer: v})}>
                           <SelectTrigger className="h-12 rounded-xl bg-emerald-50 border-emerald-100 text-emerald-700 font-bold"><SelectValue /></SelectTrigger>
                           <SelectContent>
                              <SelectItem value="A">Option A</SelectItem>
                              <SelectItem value="B">Option B</SelectItem>
                              <SelectItem value="C">Option C</SelectItem>
                              <SelectItem value="D">Option D</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  <div className="space-y-3 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Question Statement (English)</Label>
                    <Textarea 
                      value={formData.questionEn} 
                      onChange={e => setFormData({...formData, questionEn: e.target.value})} 
                      className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 p-6 text-lg font-bold leading-relaxed text-[#0F172A]" 
                      placeholder="Enter question in English..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {['A','B','C','D'].map(opt => (
                      <div key={opt} className="space-y-2 text-left">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Option {opt} (EN)</Label>
                        <Input value={formData[`option${opt}En`]} onChange={e => setFormData({...formData, [`option${opt}En`]: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-slate-100 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Audit Rationale (English)</Label>
                    <Textarea 
                      value={formData.explanationEn} 
                      onChange={e => setFormData({...formData, explanationEn: e.target.value})} 
                      className="min-h-[100px] rounded-2xl bg-emerald-50/30 border-emerald-100 p-6 font-medium" 
                      placeholder="Detailed explanation..."
                    />
                  </div>
               </Card>
            </TabsContent>

            <TabsContent value="complex" className="space-y-6">
               <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] p-12 space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3 text-left">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Visual Mode</Label>
                        <Select value={formData.diagramType} onValueChange={(v: any) => setFormData({...formData, diagramType: v})}>
                           <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100"><SelectValue /></SelectTrigger>
                           <SelectContent>
                              <SelectItem value="none">No Visual</SelectItem>
                              <SelectItem value="image">Static Image / Map</SelectItem>
                              <SelectItem value="table">Interactive Table</SelectItem>
                              <SelectItem value="barGraph">Bar Graph</SelectItem>
                              <SelectItem value="pieChart">Pie Chart</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-3 text-left">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Image URI</Label>
                        <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100" placeholder="https://..." />
                     </div>
                  </div>

                  <div className="space-y-3 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Passage / Caselet (English)</Label>
                    <Textarea 
                      value={formData.passageEn} 
                      onChange={e => setFormData({...formData, passageEn: e.target.value})} 
                      className="min-h-[250px] rounded-2xl bg-slate-900 border-none p-8 font-mono text-emerald-400 text-sm leading-relaxed" 
                    />
                  </div>
               </Card>
            </TabsContent>

            <TabsContent value="punjabi" className="space-y-6">
               <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] p-12 space-y-10">
                  <div className="space-y-3 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">ਸਵਾਲ (Question Statement)</Label>
                    <Textarea value={formData.questionPa} onChange={e => setFormData({...formData, questionPa: e.target.value})} className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 p-6 text-lg font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {['A','B','C','D'].map(opt => (
                      <div key={opt} className="space-y-2 text-left">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">ਵਿਕਲਪ {opt}</Label>
                        <Input value={formData[`option${opt}Pa`]} onChange={e => setFormData({...formData, [`option${opt}Pa`]: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                      </div>
                    ))}
                  </div>
               </Card>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-6">
               <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] p-12 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3 text-left">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Board</Label>
                        <Select value={formData.boardId} onValueChange={v => setFormData({...formData, boardId: v})}>
                           <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100"><SelectValue placeholder="Select" /></SelectTrigger>
                           <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-3 text-left">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Subject Hub</Label>
                        <Select value={formData.subjectId} onValueChange={v => setFormData({...formData, subjectId: v})}>
                           <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100"><SelectValue placeholder="Select" /></SelectTrigger>
                           <SelectContent>{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3 text-left">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Topic / Chapter</Label>
                        <Input value={formData.chapterId} onChange={e => setFormData({...formData, chapterId: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-100" placeholder="e.g. Percentage" />
                     </div>
                     <div className="space-y-3 text-left">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Difficulty</Label>
                        <Select value={formData.difficulty} onValueChange={v => setFormData({...formData, difficulty: v})}>
                           <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100"><SelectValue /></SelectTrigger>
                           <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none bg-white shadow-2xl rounded-[3.5rem] overflow-hidden sticky top-32">
             <div className="bg-[#0B1528] px-10 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Eye className="h-4 w-4 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Student View Node</span>
                </div>
                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-3 py-1">Instant Audit</Badge>
             </div>
             <CardContent className="p-10 space-y-10 h-[70vh] overflow-y-auto custom-scrollbar text-left">
                <QuestionRenderer 
                   language="bilingual" 
                   question={{
                     ...formData,
                     tableData: formData.tableDataJson ? (JSON.parse(formData.tableDataJson || '{}')) : null,
                     chartConfig: formData.chartConfigJson ? (JSON.parse(formData.chartConfigJson || '{}')) : null
                   }} 
                   showSolution={true}
                />
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
