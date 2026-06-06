
"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ChevronLeft, 
  Database, 
  ClipboardCheck,
  Search,
  CheckCircle2,
  Layers,
  Loader2,
  Settings2,
  Plus,
  Trash2,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Target,
  MinusCircle,
  PlusCircle,
  XCircle,
  CheckSquare
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"
import { MockType, Difficulty, AccessType } from "@/types"
import { cn } from "@/lib/utils"

export default function MockBuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <MockBuilderContent />
    </Suspense>
  )
}

function MockBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { toast } = useToast()

  const mockId = searchParams.get("id")
  const isEditing = !!mockId

  const { data: existingMock } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))
  
  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [bankFilter, setBankFilter] = useState({ subjectId: "all", search: "" })

  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState<any>({
    title: "", 
    boardId: "", 
    examId: "",
    duration: 120, 
    difficulty: "Medium" as Difficulty, 
    mockType: "FULL" as MockType, 
    accessType: "FREE" as AccessType,
    published: false,
    positiveMarks: 1,
    negativeMarks: 0.25,
    questionIds: []
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankSelection, setBankSelection] = useState<string[]>([])

  // Fetch Bank Nodes (Limit 100 for performance)
  useEffect(() => {
    async function fetchBank() {
      if (!db) return
      setBankLoading(true)
      try {
        const q = query(collection(db, "questions"), limit(100))
        const snap = await getDocs(q)
        setQuestionBank(snap.docs.map(d => ({ ...d.data(), id: d.id })))
      } finally {
        setBankLoading(false)
      }
    }
    fetchBank()
  }, [db])

  useEffect(() => {
    if (existingMock) {
      setMockData(prev => ({ ...prev, ...existingMock }));
      if (existingMock.questionIds && questionBank.length > 0) {
        const staged = questionBank.filter(q => existingMock.questionIds.includes(q.id))
        setSelectedQuestions(staged)
      }
    }
  }, [existingMock, questionBank])

  const filteredBank = useMemo(() => {
    return questionBank.filter((q: any) => {
      const matchesSub = bankFilter.subjectId === "all" || q.subjectId === bankFilter.subjectId
      const matchesSearch = !bankFilter.search || (q.questionEn || q.titleEn || "").toLowerCase().includes(bankFilter.search.toLowerCase())
      const notAlreadySelected = !selectedQuestions.find(sq => sq.id === q.id)
      return matchesSub && matchesSearch && notAlreadySelected
    })
  }, [questionBank, bankFilter, selectedQuestions])

  const handleBulkLink = () => {
    const toAdd = questionBank.filter(q => bankSelection.includes(q.id))
    setSelectedQuestions(prev => [...prev, ...toAdd])
    setBankSelection([])
    toast({ title: "Nodes Linked", description: `${toAdd.length} questions injected into assembly.` })
  }

  const handlePublish = async () => {
    if (!mockData.title || !mockData.boardId || !mockData.examId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Title, Board, and Exam are mandatory nodes." })
      return
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db!, "mocks", finalId)
    
    const payload = {
      ...mockData,
      id: finalId,
      totalQuestions: selectedQuestions.length,
      questionIds: selectedQuestions.map(q => q.id),
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
    };

    Object.keys(payload).forEach(key => (payload[key] === undefined || payload[key] === null) && delete payload[key]);

    try {
      await setDoc(mockRef, payload, { merge: true })
      toast({ title: "Series Deployed", description: "CBT blueprint successfully synced." })
      router.push("/admin/mocks")
    } catch (err: any) {
      errorEmitter.emit("permission-error", new FirestorePermissionError({ path: mockRef.path, operation: 'write', requestResourceData: payload } satisfies SecurityRuleContext))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-[1500px] mx-auto space-y-10 pb-32 text-left">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border border-slate-100 bg-white h-12 w-12 shadow-sm"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline uppercase tracking-tight text-[#0F172A]">Mock Architect</h1>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1">CBT Pattern Engineering & Logic</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-16 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 bg-white" onClick={() => { if(confirm("Purge staged assembly?")) setSelectedQuestions([]); }}>
              <Trash2 className="h-4 w-4 text-rose-500" /> Purge Assembly
           </Button>
           <Button className="bg-primary hover:bg-orange-600 font-black px-12 h-16 rounded-2xl uppercase text-[11px] tracking-[0.2em] gap-3 shadow-3xl shadow-primary/20" onClick={handlePublish} disabled={isPublishing}>
             {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} {isEditing ? "Update Module" : "Deploy Live Series"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        {/* Left Sidebar: Global Logic */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-4xl rounded-[3rem] bg-white p-10 space-y-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Settings2 className="h-32 w-32" /></div>
            
            <div className="space-y-6 relative z-10">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Headline</Label>
                 <Input placeholder="e.g. Patwari Full Mock 01" value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 font-bold text-lg border-slate-50 bg-slate-50/50" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Authority</Label>
                   <Select value={mockData.boardId} onValueChange={v => setMockData({...mockData, boardId: v, examId: ""})}>
                     <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-slate-50 font-black uppercase text-[10px]"><SelectValue placeholder="Select" /></SelectTrigger>
                     <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Exam Hub</Label>
                   <Select value={mockData.examId} onValueChange={v => setMockData({...mockData, examId: v})}>
                     <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-slate-50 font-bold text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                     <SelectContent>{exams?.filter((e: any) => e.boardId === mockData.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><Clock className="h-3 w-3" /> Time (Mins)</Label>
                    <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} className="h-12 rounded-xl bg-slate-50/50 font-black text-center" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><PlusCircle className="h-3 w-3 text-emerald-500" /> Correct Marks</Label>
                    <Input type="number" step="0.1" value={mockData.positiveMarks} onChange={e => setMockData({...mockData, positiveMarks: parseFloat(e.target.value) || 0})} className="h-12 rounded-xl bg-slate-50/50 font-black text-center" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><MinusCircle className="h-3 w-3 text-rose-500" /> Penalty Nodes</Label>
                    <Input type="number" step="0.05" value={mockData.negativeMarks} onChange={e => setMockData({...mockData, negativeMarks: parseFloat(e.target.value) || 0})} className="h-12 rounded-xl bg-slate-50/50 font-black text-center" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Access Protocol</Label>
                    <Select value={mockData.accessType} onValueChange={(v: AccessType) => setMockData({...mockData, accessType: v})}>
                      <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-slate-50 font-black uppercase text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">Free Node</SelectItem>
                        <SelectItem value="PREMIUM">Elite Vault</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-50 flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl">
                  <div className="space-y-1">
                     <p className="font-black text-[11px] uppercase text-[#0F172A]">Production Status</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Visible to aspirants if enabled</p>
                  </div>
                  <Switch checked={mockData.published} onCheckedChange={val => setMockData({...mockData, published: val})} />
               </div>
            </div>
          </Card>
        </div>

        {/* Right Content Area: Assembler */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden min-h-[700px] flex flex-col">
              <Tabs defaultValue="bank" className="flex-1 flex flex-col">
                 <TabsList className="bg-slate-50/50 border-b border-slate-100 w-full justify-start h-20 px-10 gap-12 rounded-none">
                    <TabsTrigger value="bank" className="font-black uppercase text-[11px] tracking-widest gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl px-6 h-12">
                       <Database className="h-4 w-4" /> Atomic Bank
                    </TabsTrigger>
                    <TabsTrigger value="assembly" className="font-black uppercase text-[11px] tracking-widest gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl px-6 h-12">
                       <Layers className="h-4 w-4" /> Active Assembly 
                       <Badge className="bg-primary text-white border-none text-[8px] ml-1">{selectedQuestions.length}</Badge>
                    </TabsTrigger>
                 </TabsList>

                 <TabsContent value="bank" className="p-10 flex-1 flex flex-col m-0">
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                       <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="Filter bank nodes..." value={bankFilter.search} onChange={e => setBankFilter({...bankFilter, search: e.target.value})} className="h-12 pl-12 rounded-xl bg-slate-50 border-none shadow-inner" />
                       </div>
                       <Select value={bankFilter.subjectId} onValueChange={v => setBankFilter({...bankFilter, subjectId: v})}>
                          <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none w-56 shadow-inner font-bold text-xs"><SelectValue placeholder="Subject Hub" /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="all">All Subjects</SelectItem>
                             {subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>

                    {/* Bulk Selection Bar */}
                    <div className="bg-[#0F172A] p-4 rounded-2xl mb-6 flex items-center justify-between text-white shadow-2xl">
                       <div className="flex items-center gap-6 px-4">
                          <Checkbox 
                            checked={filteredBank.length > 0 && bankSelection.length === filteredBank.length} 
                            onCheckedChange={(v) => {
                               if (v) setBankSelection(filteredBank.map(q => q.id))
                               else setBankSelection([])
                            }}
                            className="border-white/20 data-[state=checked]:bg-primary"
                          />
                          <div>
                             <p className="font-black uppercase text-[10px] tracking-widest">Select All Visible Nodes</p>
                             <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{bankSelection.length} nodes staged</p>
                          </div>
                       </div>
                       <div className="flex gap-3">
                          <Button variant="ghost" size="sm" onClick={() => setBankSelection([])} className="text-slate-400 hover:text-white font-black uppercase text-[9px]">Cancel</Button>
                          <Button disabled={bankSelection.length === 0} onClick={handleBulkLink} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] h-10 px-8 rounded-xl shadow-xl">
                             <Plus className="h-3 w-3 mr-2" /> Link {bankSelection.length} Nodes
                          </Button>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3 min-h-0">
                       {bankLoading ? (
                          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-xl" />)
                       ) : filteredBank.map(q => (
                          <div key={q.id} className={cn(
                             "p-5 rounded-2xl border border-slate-100 flex items-center justify-between transition-all group hover:border-primary/20",
                             bankSelection.includes(q.id) ? "bg-primary/5 border-primary/20" : "bg-white"
                          )}>
                             <div className="flex items-center gap-6 min-w-0 flex-1">
                                <Checkbox 
                                  checked={bankSelection.includes(q.id)} 
                                  onCheckedChange={() => {
                                     setBankSelection(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])
                                  }}
                                  className="rounded-md border-slate-200"
                                />
                                <div className="min-w-0 flex-1">
                                   <p className="font-bold text-sm text-[#0F172A] truncate leading-none mb-2">{q.questionEn}</p>
                                   <div className="flex items-center gap-3">
                                      <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-100 py-0">{q.subjectId}</Badge>
                                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{q.difficulty}</span>
                                   </div>
                                </div>
                             </div>
                             <Button size="sm" variant="ghost" className="rounded-xl h-10 px-6 font-black uppercase text-[9px] tracking-widest text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all" onClick={() => setSelectedQuestions([...selectedQuestions, q])}>
                                Link Node
                             </Button>
                          </div>
                       ))}
                    </div>
                 </TabsContent>

                 <TabsContent value="assembly" className="p-10 flex-1 flex flex-col m-0">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm"><Layers className="h-5 w-5" /></div>
                          <div className="text-left">
                             <p className="font-black uppercase text-[10px] text-[#0F172A]">Blueprint Assembly</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sorting preserved. Total {selectedQuestions.length} Atomic Nodes.</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="sm" className="text-rose-500 font-black uppercase text-[9px] gap-2 hover:bg-rose-50" onClick={() => setSelectedQuestions([])}>
                          <XCircle className="h-3 w-3" /> Purge Selection
                       </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-2 min-h-0">
                       {selectedQuestions.map((q, idx) => (
                          <div key={`${q.id}-${idx}`} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:shadow-md transition-all group">
                             <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400 shrink-0">#{idx+1}</div>
                                <p className="font-bold text-xs text-[#0F172A] truncate flex-1">{q.questionEn}</p>
                             </div>
                             <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-300 hover:text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all" onClick={() => setSelectedQuestions(selectedQuestions.filter((_, i) => i !== idx))}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                       ))}
                    </div>
                 </TabsContent>
              </Tabs>
           </Card>
        </div>
      </div>
    </div>
  )
}
