"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Upload, 
  Database, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Settings2, 
  Loader2, 
  Trash2, 
  Edit, 
  Rocket,
  Zap,
  Plus,
  Copy,
  Layers,
  Save,
  ImageIcon
} from "lucide-react"
import { useFirestore, useCollection } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseBulkQuestions } from "@/lib/parser"
import { Difficulty, MockType, Question, ContentStatus, MockSection } from "@/types"

/**
 * @fileOverview Enterprise Bulk Import & Publishing Hub.
 * Features: High-fidelity image rendering, quad-format parser, and direct deployment.
 */

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  // 1. Config State
  const [metadata, setMetadata] = useState({
    boardId: "",
    examId: "",
    subjectId: "",
    chapterId: "",
    language: "bilingual",
    difficulty: "Medium" as Difficulty,
    mockType: "FULL" as MockType,
    status: "PUBLISHED" as ContentStatus,
    duration: 120,
    title: "",
    year: new Date().getFullYear(),
    caCategory: "Punjab",
    negativeMarking: 0.25,
    passingMarks: 50,
  })

  // 2. Section Builder State (For Full Mocks)
  const [sections, setSections] = useState<MockSection[]>([
    { id: 'sec-1', name: 'Section 1', subjectId: '', questionCount: 0, duration: 30, marksPerQuestion: 1 }
  ])

  // 3. Buffer State
  const [rawText, setRawText] = useState("")
  const [parsedQuestions, setParsedQuestions] = useState<Partial<Question>[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [confidence, setConfidence] = useState(0)
  
  // 4. Workflow State
  const [isSyncing, setIsSyncing] = useState(false)

  const addSection = () => {
    setSections([...sections, { id: `sec-${Date.now()}`, name: `Section ${sections.length + 1}`, subjectId: '', questionCount: 0, duration: 30, marksPerQuestion: 1 }])
  }

  const updateSection = (id: string, field: keyof MockSection, val: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: val } : s))
  }

  const totalCalc = useMemo(() => {
    if (metadata.mockType !== 'FULL') return { questions: parsedQuestions.length, duration: metadata.duration }
    return {
      questions: sections.reduce((acc, s) => acc + (s.questionCount || 0), 0),
      duration: sections.reduce((acc, s) => acc + (s.duration || 0), 0)
    }
  }, [metadata.mockType, metadata.duration, sections, parsedQuestions])

  const handleAnalyze = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId) {
      toast({ variant: "destructive", title: "Config Required", description: "Select Board before analysis." })
      return
    }

    const { questions, errors, confidence: conf } = parseBulkQuestions(rawText, metadata)
    setParsedQuestions(questions)
    setParseErrors(errors)
    setConfidence(conf)

    if (errors.length > 0) {
      toast({ variant: "destructive", title: "Template Mismatch", description: `Found ${errors.length} formatting errors.` })
    } else {
      toast({ title: "Analysis Complete", description: `${questions.length} nodes structured with ${conf}% confidence.` })
    }
  }

  const handlePublish = async (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    if (!db || parsedQuestions.length === 0) return
    setIsSyncing(true)

    const batch = writeBatch(db)
    const questionIds: string[] = []

    // 1. Commit Questions
    parsedQuestions.forEach(q => {
      const qRef = doc(collection(db, "questions"))
      batch.set(qRef, {
        ...q,
        id: qRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isStandalone: true,
        status: targetStatus === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
      })
      questionIds.push(qRef.id)
    })

    // 2. Commit Mock Series
    const mockId = `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", mockId)
    
    const mockPayload = {
      id: mockId,
      title: metadata.title || `${metadata.boardId} ${metadata.mockType} - ${new Date().toLocaleDateString()}`,
      boardId: metadata.boardId,
      examId: metadata.examId,
      mockType: metadata.mockType,
      duration: totalCalc.duration,
      totalQuestions: questionIds.length,
      questionIds: questionIds,
      difficulty: metadata.difficulty,
      published: targetStatus === 'PUBLISHED',
      isPremium: true,
      passingMarks: metadata.passingMarks,
      negativeMarking: metadata.negativeMarking,
      sections: metadata.mockType === 'FULL' ? sections : [],
      subjectId: metadata.subjectId,
      chapterId: metadata.chapterId,
      year: metadata.year,
      caCategory: metadata.caCategory,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    batch.set(mockRef, mockPayload)

    try {
      await batch.commit()
      toast({ title: targetStatus === 'PUBLISHED' ? "Series Live" : "Draft Saved", description: `${parsedQuestions.length} nodes successfully deployed.` })
      router.push("/admin/mocks")
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Database rejected the transaction." })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-10 pb-24 text-left max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Rapid Deployment Hub</h1>
            <p className="text-slate-500 font-medium">Configure, Ingest, and Publish Test Series in one cycle.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => handlePublish('DRAFT')} disabled={isSyncing || parsedQuestions.length === 0} className="h-16 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-sm bg-white">
              <Save className="h-5 w-5" /> Save Draft
           </Button>
           <Button onClick={() => handlePublish('PUBLISHED')} disabled={isSyncing || parsedQuestions.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl h-16 px-12 gap-3 shadow-3xl shadow-emerald-900/20">
              {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />} Publish & Go Live
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        {/* Config Panel */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none bg-white shadow-3xl rounded-[3rem] overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="font-headline font-black text-2xl uppercase flex items-center gap-4">
                <Settings2 className="h-6 w-6 text-primary" /> Master Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mock Series Title</Label>
                <Input value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} placeholder="e.g. PSSSB Patwari Full Mock 01" className="h-14 bg-slate-50 border-none rounded-xl font-bold text-lg" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recruitment Board</Label>
                  <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-[#0F172A]"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mock Type</Label>
                   <Select value={metadata.mockType} onValueChange={(v: any) => setMetadata({...metadata, mockType: v})}>
                      <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-[#0F172A]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="FULL">Entire Pattern (Full Mock)</SelectItem>
                         <SelectItem value="SUBJECT">Subject Mastery</SelectItem>
                         <SelectItem value="SECTIONAL">Sectional / Topic</SelectItem>
                         <SelectItem value="PYQ">Previous Year Paper</SelectItem>
                         <SelectItem value="CA_QUIZ">Current Affairs Quiz</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
              </div>

              {/* Dynamic Type Configuration */}
              <div className="p-4 md:p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                 {metadata.mockType === 'FULL' ? (
                    <div className="space-y-6">
                       <div className="flex justify-between items-center mb-2">
                          <h4 className="font-headline font-black text-sm uppercase text-[#0F172A] flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Section Builder</h4>
                          <Button variant="ghost" size="sm" onClick={addSection} className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white border border-slate-200"><Plus className="h-3 w-3 mr-1" /> Add Section</Button>
                       </div>
                       <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                          {sections.map((sec, idx) => (
                             <div key={sec.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-sm relative group">
                                <Button variant="ghost" size="icon" onClick={() => setSections(sections.filter(s => s.id !== sec.id))} className="absolute top-2 right-2 h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></Button>
                                
                                <div className="grid grid-cols-1 gap-4">
                                   <div className="space-y-1.5">
                                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-tight">Section Name</Label>
                                      <Input value={sec.name} onChange={e => updateSection(sec.id, 'name', e.target.value)} className="h-9 rounded-xl bg-slate-50 border-none text-xs font-bold text-[#0F172A]" />
                                   </div>
                                   <div className="space-y-1.5">
                                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-tight">Focus Subject</Label>
                                      <Select value={sec.subjectId} onValueChange={v => updateSection(sec.id, 'subjectId', v)}>
                                         <SelectTrigger className="h-9 rounded-xl bg-slate-50 border-none text-xs font-bold text-[#0F172A]"><SelectValue placeholder="Select" /></SelectTrigger>
                                         <SelectContent>{subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                      </Select>
                                   </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-50">
                                   <div className="space-y-1 text-center">
                                      <Label className="text-[8px] font-black uppercase text-slate-400">QS</Label>
                                      <Input type="number" value={sec.questionCount.toString()} onChange={e => updateSection(sec.id, 'questionCount', parseInt(e.target.value) || 0)} className="h-8 rounded-lg bg-slate-50 border-none text-[10px] font-black text-center text-emerald-600 px-1" />
                                   </div>
                                   <div className="space-y-1 text-center">
                                      <Label className="text-[8px] font-black uppercase text-slate-400">MINS</Label>
                                      <Input type="number" value={sec.duration.toString()} onChange={e => updateSection(sec.id, 'duration', parseInt(e.target.value) || 0)} className="h-8 rounded-lg bg-slate-50 border-none text-[10px] font-black text-center text-primary px-1" />
                                   </div>
                                   <div className="space-y-1 text-center">
                                      <Label className="text-[8px] font-black uppercase text-slate-400">MARKS</Label>
                                      <Input type="number" value={sec.marksPerQuestion.toString()} onChange={e => updateSection(sec.id, 'marksPerQuestion', parseFloat(e.target.value) || 0)} className="h-8 rounded-lg bg-slate-50 border-none text-[10px] font-black text-center text-blue-600 px-1" />
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500">Subject</Label>
                          <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                             <SelectTrigger className="rounded-xl h-12 bg-white border-none font-bold text-[#0F172A]"><SelectValue placeholder="Select" /></SelectTrigger>
                             <SelectContent>{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       {metadata.mockType === 'SECTIONAL' ? (
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-slate-500">Topic / Chapter</Label>
                             <Input value={metadata.chapterId} onChange={e => setMetadata({...metadata, chapterId: e.target.value})} className="rounded-xl h-12 bg-white border-none font-bold text-[#0F172A]" />
                          </div>
                       ) : metadata.mockType === 'PYQ' ? (
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-slate-500">Exam Year</Label>
                             <Input type="number" value={metadata.year.toString()} onChange={e => setMetadata({...metadata, year: parseInt(e.target.value) || 2025})} className="rounded-xl h-12 bg-white border-none font-bold text-[#0F172A]" />
                          </div>
                       ) : (
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-slate-500">Category</Label>
                             <Select value={metadata.caCategory} onValueChange={v => setMetadata({...metadata, caCategory: v})}>
                                <SelectTrigger className="rounded-xl h-12 bg-white border-none font-bold text-[#0F172A]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="Punjab">Punjab Focus</SelectItem>
                                   <SelectItem value="National">National</SelectItem>
                                   <SelectItem value="International">International</SelectItem>
                                   <SelectItem value="Mixed">Institutional Mixed</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                       )}
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-500">Difficulty</Label>
                       <Select value={metadata.difficulty} onValueChange={(v: any) => setMetadata({...metadata, difficulty: v})}>
                          <SelectTrigger className="rounded-xl h-12 bg-white border-none font-bold text-[#0F172A]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="Easy">Easy</SelectItem>
                             <SelectItem value="Medium">Medium</SelectItem>
                             <SelectItem value="Hard">Hard</SelectItem>
                             <SelectItem value="Mixed">Mixed</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-500">Duration (Mins)</Label>
                       <Input 
                         type="number" 
                         disabled={metadata.mockType === 'FULL'}
                         value={totalCalc.duration.toString()} 
                         onChange={e => setMetadata({...metadata, duration: parseInt(e.target.value) || 0})} 
                         className="h-12 rounded-xl bg-white border-none font-black text-lg text-[#0F172A] disabled:bg-slate-100" 
                       />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Total questions</p>
                    <p className="text-3xl font-headline font-black text-emerald-900 mt-1">{totalCalc.questions || 0}</p>
                 </div>
                 <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Total Duration</p>
                    <p className="text-3xl font-headline font-black text-blue-900 mt-1">{totalCalc.duration}m</p>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Ingestion Protocol</p>
                 <ul className="text-[10px] font-bold text-slate-600 space-y-2">
                    <li>• Format 1: Q1. -&gt; A. -&gt; B. -&gt; Answer:</li>
                    <li>• Format 2: Question EN: -&gt; Question PA: -&gt; Answer: [A-D]</li>
                    <li>• Image Question: Image: [URL] -&gt; Question: [Text]</li>
                    <li>• Data Table: TABLE_DATA: [JSON]</li>
                 </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Text Area & Preview */}
        <div className="lg:col-span-7 space-y-8">
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Ingestion Buffer (Max 1000 Nodes)</Label>
              <Textarea 
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste institutional content using standardized blocks..."
                className="min-h-[400px] rounded-[3rem] bg-white border-none p-12 text-sm font-mono shadow-4xl custom-scrollbar text-[#0F172A]"
              />
              <Button onClick={handleAnalyze} className="w-full h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.3em] rounded-[2.5rem] shadow-4xl mt-6 gap-4">
                 <Zap className="h-6 w-6 fill-current" /> Analyze & Inject Metadata
              </Button>
           </div>

           {parsedQuestions.length > 0 && (
             <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden">
                <CardHeader className="p-16 border-b border-slate-50 bg-slate-50/30 flex flex-row justify-between items-center">
                   <div className="space-y-2">
                      <CardTitle className="font-headline font-black text-3xl uppercase">Audit Preview ({parsedQuestions.length})</CardTitle>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Parser Confidence: {confidence}%</p>
                   </div>
                   <Badge className="bg-emerald-100 text-emerald-600 border-none font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest">READY FOR DEPLOYMENT</Badge>
                </CardHeader>
                <CardContent className="p-0">
                   <Table>
                      <TableHeader className="bg-slate-50">
                         <TableRow className="h-20 border-slate-50">
                            <TableHead className="px-12 text-[10px] font-black uppercase">Node</TableHead>
                            <TableHead className="text-[10px] font-black uppercase">Logic Flow</TableHead>
                            <TableHead className="text-center text-[10px] font-black uppercase">Key</TableHead>
                            <TableHead className="text-right px-12 text-[10px] font-black uppercase">Action</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {parsedQuestions.map((q, idx) => (
                           <TableRow key={idx} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                              <TableCell className="px-12 py-10 font-black text-slate-300">#{idx + 1}</TableCell>
                              <TableCell className="py-10 max-w-lg">
                                 <div className="space-y-4 text-left">
                                    {q.imageUrl && (
                                       <div className="h-20 w-32 relative rounded-lg overflow-hidden border border-slate-200">
                                          <img src={q.imageUrl} className="object-cover w-full h-full" alt="Preview" />
                                       </div>
                                    )}
                                    <div className="space-y-1">
                                       <p className="font-bold text-[#0F172A] line-clamp-1">{q.questionEn}</p>
                                       <p className="text-[11px] text-slate-400 italic line-clamp-1 font-medium">{q.questionPa}</p>
                                    </div>
                                 </div>
                              </TableCell>
                              <TableCell className="text-center">
                                 <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary mx-auto">
                                    {q.correctAnswer}
                                 </div>
                              </TableCell>
                              <TableCell className="text-right px-12">
                                 <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-white shadow-sm" onClick={() => {
                                       const dup = [...parsedQuestions];
                                       dup.splice(idx, 0, {...q});
                                       setParsedQuestions(dup);
                                    }}><Copy className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-50" onClick={() => setParsedQuestions(parsedQuestions.filter((_, i) => i !== idx))}><Trash2 className="h-5 w-5" /></Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                         ))}
                      </TableBody>
                   </Table>
                </CardContent>
             </Card>
           )}

           {parseErrors.length > 0 && (
             <Card className="border-rose-100 bg-rose-50/50 p-16 rounded-[4rem] shadow-4xl">
                <div className="flex items-center gap-6 text-rose-600 mb-10">
                   <AlertCircle className="h-12 w-12" />
                   <h4 className="font-headline font-black text-3xl uppercase tracking-tight">Audit Mismatches Found</h4>
                </div>
                <div className="space-y-4">
                   {parseErrors.map((err, i) => (
                      <div key={i} className="p-6 bg-white rounded-3xl border border-rose-100 shadow-xl flex items-start gap-4">
                         <div className="h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-1">!</div>
                         <p className="text-base font-bold text-rose-900 leading-tight">{err}</p>
                      </div>
                   ))}
                </div>
             </Card>
           )}
        </div>
      </div>
    </div>
  )
}
