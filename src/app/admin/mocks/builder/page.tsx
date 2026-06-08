
"use client"

import React, { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { 
  ChevronLeft, 
  Database, 
  ClipboardCheck,
  Search,
  Layers,
  Loader2,
  Plus,
  Trash2,
  Zap,
  Clock,
  PlusCircle,
  Filter,
  BookOpen,
  Lock,
  History,
  Target,
  Languages,
  ShieldCheck,
  Settings2,
  CheckCircle2,
  Gem,
  LayoutGrid,
  Landmark,
  ChevronRight,
  GraduationCap,
  AlertTriangle,
  FileStack,
  ListTree,
  SearchCode,
  Unlock,
  MoveUp,
  MoveDown
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, limit, getDocs, writeBatch, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessLevel, LanguageDisplayMode } from "@/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Ultimate Mock Architect Panel v41.0.
 * RESTORED: Multi-Board selection, Multi-Exam selection, and detailed Marking controls.
 */

const SELECTION_RULES = [
  { id: 'unused-only', label: 'Use Only Unused', icon: <Zap className="h-3 w-3" /> },
  { id: 'no-locked', label: 'Exclude Locked', icon: <Lock className="h-3 w-3" /> },
  { id: 'no-duplicates', label: 'Block Overlaps', icon: <ShieldCheck className="h-3 w-3" /> }
];

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
  const [activeRules, setActiveRules] = useState<string[]>(['unused-only', 'no-locked', 'no-duplicates'])
  const [bankSearch, setBankSearch] = useState("")
  
  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState<any>({
    title: "", 
    boardId: "", 
    boardIds: [] as string[],
    examId: "",
    examIds: [] as string[],
    duration: 120, 
    difficulty: "Medium" as Difficulty, 
    mockType: "FULL" as MockType, 
    accessLevel: "FREE" as AccessLevel,
    published: true,
    languageMode: "ENGLISH_PUNJABI" as LanguageDisplayMode,
    positiveMarks: 1,
    negativeMarks: 0.25,
    attemptLimit: 0,
  })

  const [sections, setSections] = useState<any[]>([
    { id: 'sec-1', name: 'General Hub', questions: [] }
  ])
  const [activeSectionId, setActiveSectionId] = useState('sec-1')
  const [bankSelection, setBankSelection] = useState<string[]>([])

  // Load Bank from Primary Board
  useEffect(() => {
    async function fetchBank() {
      if (!db || !mockData.boardId) return
      setBankLoading(true)
      try {
        const q = query(collection(db, "questions"), where("boardId", "==", mockData.boardId), limit(2000))
        const snap = await getDocs(q)
        setQuestionBank(snap.docs.map(d => ({ ...d.data(), id: d.id })))
      } finally {
        setBankLoading(false)
      }
    }
    fetchBank()
  }, [db, mockData.boardId])

  useEffect(() => {
    if (existingMock) {
      setMockData(prev => ({ 
        ...prev, 
        ...existingMock,
        boardIds: existingMock.boardIds || (existingMock.boardId ? [existingMock.boardId] : []),
        examIds: existingMock.examIds || (existingMock.examId ? [existingMock.examId] : []),
      }));

      // Hydrate sections if questions are available
      if (existingMock.questionIds && questionBank.length > 0) {
        let currentIndex = 0;
        const hydratedSections = (existingMock.sections || [{ name: 'General Hub', count: existingMock.questionIds.length }]).map((s: any, idx: number) => {
          const sectionQIds = existingMock.questionIds.slice(currentIndex, currentIndex + (s.count || 0));
          currentIndex += (s.count || 0);
          return { 
            id: `sec-${idx + 1}`, 
            name: s.name, 
            questions: sectionQIds.map(id => questionBank.find(q => q.id === id)).filter(Boolean) 
          };
        });
        setSections(hydratedSections);
      }
    }
  }, [existingMock, questionBank])

  const filteredBank = useMemo(() => {
    const allSelectedIds = sections.flatMap(s => s.questions.map(q => q.id));
    return questionBank.filter((q: any) => {
      const qText = (q.englishQuestion || "").toLowerCase();
      const matchesSearch = !bankSearch || qText.includes(bankSearch.toLowerCase());
      const notAlreadySelected = !allSelectedIds.includes(q.id);
      
      if (activeRules.includes('unused-only') && q.status === 'USED') return false;
      if (activeRules.includes('no-locked') && q.status === 'LOCKED') return false;
      
      return matchesSearch && notAlreadySelected;
    })
  }, [questionBank, bankSearch, sections, activeRules])

  const totals = useMemo(() => {
    const qCount = sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
    const marks = qCount * (parseFloat(mockData.positiveMarks) || 1);
    return { qCount, marks };
  }, [sections, mockData.positiveMarks]);

  const toggleRule = (id: string) => {
    setActiveRules(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  const handleBulkLink = () => {
    const toAdd = questionBank.filter(q => bankSelection.includes(q.id))
    setSections(sections.map(s => s.id === activeSectionId ? { ...s, questions: [...s.questions, ...toAdd] } : s));
    setBankSelection([])
    toast({ title: "Assets Linked" })
  }

  const handlePublish = async () => {
    if (!db || isPublishing) return
    if (!mockData.title || !mockData.boardId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Config incomplete." })
      return
    }

    const flatQuestionIds = sections.flatMap(s => s.questions.map(q => q.id));
    if (flatQuestionIds.length === 0) {
       toast({ variant: "destructive", title: "Link Blocked", description: "Add at least one question." });
       return;
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", finalId)
    const sectionMetadata = sections.map(s => ({ name: s.name, count: s.questions.length })).filter(s => s.count > 0);

    const payload = {
      ...mockData,
      id: finalId,
      totalQuestions: flatQuestionIds.length,
      questionIds: flatQuestionIds,
      sections: sectionMetadata,
      totalMarks: totals.marks,
      updatedAt: serverTimestamp(),
      createdAt: existingMock?.createdAt || serverTimestamp(),
    };

    try {
      await setDoc(mockRef, payload, { merge: true });
      const batch = writeBatch(db);
      flatQuestionIds.forEach(id => {
        batch.update(doc(db, "questions", id), { status: 'USED', updatedAt: serverTimestamp() });
      });
      await batch.commit();
      toast({ title: "Series Deployed" });
      router.push("/admin/mocks")
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-32 text-left pt-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="text-left">
            <h1 className="text-4xl font-headline font-black uppercase tracking-tight text-[#0F172A]">{isEditing ? "Modify Mock" : "Mock Architect"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Institutional Assembly Node</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Card className="hidden lg:flex items-center gap-6 px-8 py-3 bg-white border border-slate-100 rounded-2xl shadow-xl">
              <div className="text-center"><p className="text-[8px] font-black text-slate-400 uppercase">Total Qs</p><p className="text-2xl font-headline font-black text-primary">{totals.qCount}</p></div>
              <div className="h-8 w-px bg-slate-100" />
              <div className="text-center"><p className="text-[8px] font-black text-slate-400 uppercase">Max Marks</p><p className="text-2xl font-headline font-black text-[#0F172A]">{totals.marks}</p></div>
           </Card>
           <Button onClick={handlePublish} disabled={isPublishing} className="bg-primary hover:bg-orange-600 font-black px-12 h-16 rounded-2xl uppercase text-[11px] tracking-[0.2em] gap-3 shadow-3xl border-none">
             {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} {isEditing ? "Sync Changes" : "Deploy Mock"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-4 space-y-8">
          {/* CONFIGURATION HUB */}
          <Card className="border-none shadow-4xl rounded-[3rem] bg-white p-10 space-y-8 border border-slate-50">
             <div className="space-y-8">
                <div className="flex items-center gap-3">
                   <Settings2 className="h-5 w-5 text-primary" />
                   <p className="text-[10px] font-black uppercase text-[#0F172A] tracking-[0.3em]">Institutional Meta</p>
                </div>
                
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Title</Label>
                   <Input value={mockData.title ?? ""} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 font-bold text-lg border-slate-100 bg-slate-50/50" placeholder="e.g. Patwari Prelims 2026" />
                </div>

                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Source Silo (Primary Board)</Label>
                   <Select value={mockData.boardId} onValueChange={(v) => setMockData({...mockData, boardId: v})}>
                      <SelectTrigger className="h-12 rounded-xl bg-[#0B1528] text-white border-none font-black uppercase text-[10px] tracking-widest"><SelectValue placeholder="Select Bank Authority" /></SelectTrigger>
                      <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation} Official Bank</SelectItem>)}</SelectContent>
                   </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Access Level</Label>
                      <Select value={mockData.accessLevel} onValueChange={(v: AccessLevel) => setMockData({...mockData, accessLevel: v})}>
                         <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black text-[9px] uppercase"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="FREE">FREE HUB</SelectItem>
                            <SelectItem value="PREMIUM">PREMIUM ONLY</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mock Type</Label>
                      <Select value={mockData.mockType} onValueChange={(v: any) => setMockData({...mockData, mockType: v})}>
                         <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black text-[9px] uppercase"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="FULL">Full Length</SelectItem>
                            <SelectItem value="SUBJECT">Subject-wise</SelectItem>
                            <SelectItem value="SECTIONAL">Sectional</SelectItem>
                            <SelectItem value="PYQ">PYQ Papers</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Clock className="h-3 w-3" /> Time (Mins)</Label>
                      <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} className="h-12 rounded-xl border-slate-100" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Target className="h-3 w-3" /> Pos Marks (+)</Label>
                      <Input type="number" step="0.5" value={mockData.positiveMarks} onChange={e => setMockData({...mockData, positiveMarks: parseFloat(e.target.value) || 1})} className="h-12 rounded-xl border-slate-100" />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-rose-500" /> Neg Marks (-)</Label>
                   <Input type="number" step="0.05" value={mockData.negativeMarks} onChange={e => setMockData({...mockData, negativeMarks: parseFloat(e.target.value) || 0})} className="h-12 rounded-xl border-slate-100" />
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Multi-Vertical Assignment</p>
                   
                   <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase text-slate-500">Board Hubs</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                         {boards?.map((b: any) => (
                            <label key={b.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                               <Checkbox 
                                 checked={mockData.boardIds?.includes(b.id)} 
                                 onCheckedChange={(checked) => {
                                    const current = mockData.boardIds || [];
                                    setMockData({ ...mockData, boardIds: checked ? [...current, b.id] : current.filter((id: string) => id !== b.id) });
                                 }}
                               />
                               <span className="text-[9px] font-bold uppercase truncate">{b.abbreviation}</span>
                            </label>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase text-slate-500">Exam Hubs</Label>
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                         {exams?.map((ex: any) => (
                            <label key={ex.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                               <Checkbox 
                                 checked={mockData.examIds?.includes(ex.id)} 
                                 onCheckedChange={(checked) => {
                                    const current = mockData.examIds || [];
                                    setMockData({ ...mockData, examIds: checked ? [...current, ex.id] : current.filter((id: string) => id !== ex.id) });
                                 }}
                               />
                               <span className="text-[9px] font-bold uppercase truncate">{ex.name}</span>
                            </label>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Selection Rules</Label>
                   <div className="grid grid-cols-1 gap-3">
                      {SELECTION_RULES.map(rule => (
                         <button 
                           key={rule.id}
                           onClick={() => toggleRule(rule.id)}
                           className={cn(
                              "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                              activeRules.includes(rule.id) ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-white border-slate-100 text-slate-400"
                           )}
                         >
                            <div className="flex items-center gap-3">
                               {rule.icon}
                               <span className="text-[10px] font-black uppercase tracking-tight">{rule.label}</span>
                            </div>
                            {activeRules.includes(rule.id) && <CheckCircle2 className="h-4 w-4" />}
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden min-h-[700px] flex flex-col border border-slate-100">
              <Tabs defaultValue="bank" className="flex-1 flex flex-col">
                 <TabsList className="bg-slate-50/50 border-b border-slate-100 w-full justify-start h-24 px-10 gap-12 rounded-none">
                    <TabsTrigger value="bank" className="font-black uppercase text-[11px] tracking-[0.2em] gap-3 h-14 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl"><Database className="h-4 w-4" /> Question Silo</TabsTrigger>
                    <TabsTrigger value="assembly" className="font-black uppercase text-[11px] tracking-[0.2em] gap-3 h-14 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl"><Layers className="h-4 w-4" /> Mock Assembly</TabsTrigger>
                 </TabsList>

                 <TabsContent value="bank" className="p-10 flex-1 flex flex-col m-0 text-left">
                    <div className="flex flex-col md:flex-row gap-6 mb-10">
                       <div className="flex-1 space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Search Registry</Label>
                          <div className="relative">
                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                             <Input value={bankSearch} onChange={e => setBankSearch(e.target.value)} className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold shadow-inner" placeholder="Search statements..." />
                          </div>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                       {bankLoading ? (
                          Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
                       ) : filteredBank.map(q => (
                          <div key={q.id} onClick={() => setBankSelection(p => p.includes(q.id) ? p.filter(id => id !== q.id) : [...p, q.id])} className={cn("p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all", bankSelection.includes(q.id) ? "bg-primary/5 border-primary shadow-md" : "bg-white border-slate-100 hover:border-slate-300")}>
                             <div className="flex items-center gap-6">
                                <Checkbox checked={bankSelection.includes(q.id)} onCheckedChange={() => {}} className="h-5 w-5 border-2" />
                                <div className="space-y-1">
                                   <p className="font-bold text-sm text-[#0F172A] line-clamp-1">{q.englishQuestion}</p>
                                   <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                      <span className="text-primary">{subjects?.find((s:any) => s.id === q.subjectId)?.name || q.subjectId}</span>
                                      <span>{q.difficulty}</span>
                                   </div>
                                </div>
                             </div>
                             <Badge variant="outline" className={cn("text-[8px] font-black uppercase", q.status === 'USED' ? 'text-emerald-500' : 'text-slate-300')}>{q.status || 'UNUSED'}</Badge>
                          </div>
                       ))}
                    </div>

                    {bankSelection.length > 0 && (
                       <div className="pt-8 border-t border-slate-100 mt-8 flex justify-between items-center">
                          <p className="text-[10px] font-black uppercase text-slate-400">{bankSelection.length} Items Selected</p>
                          <Button onClick={handleBulkLink} className="h-14 px-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-widest rounded-xl shadow-xl border-none">
                             Link to {sections.find(s => s.id === activeSectionId)?.name}
                          </Button>
                       </div>
                    )}
                 </TabsContent>

                 <TabsContent value="assembly" className="p-10 flex-1 flex flex-col m-0 text-left">
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-12">
                       {sections.map((s, sIdx) => (
                          <div key={s.id} className="space-y-6">
                             <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                   <div className="h-8 w-8 bg-[#0F172A] text-white rounded-lg flex items-center justify-center font-black text-xs">{sIdx + 1}</div>
                                   <Input 
                                     value={s.name} 
                                     onChange={e => setSections(p => p.map(x => x.id === s.id ? { ...x, name: e.target.value } : x))} 
                                     className="h-10 w-64 bg-transparent border-none font-black uppercase text-xs focus-visible:ring-0 p-0"
                                   />
                                </div>
                                <div className="flex items-center gap-2">
                                   <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black">{s.questions?.length || 0} Assets</Badge>
                                   <Button variant="ghost" size="icon" onClick={() => setSections(p => p.filter(x => x.id !== s.id))} className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-1 gap-2 pl-12">
                                {s.questions?.map((q: any, qIdx: number) => (
                                   <div key={q.id} className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-xl group">
                                      <div className="flex items-center gap-4 min-w-0">
                                         <span className="text-[9px] font-black text-slate-300 w-4">{qIdx + 1}</span>
                                         <p className="text-xs font-bold text-slate-500 truncate max-w-lg">{q.englishQuestion}</p>
                                      </div>
                                      <button 
                                        onClick={() => setSections(p => p.map(x => x.id === s.id ? { ...x, questions: x.questions.filter((item: any) => item.id !== q.id) } : x))}
                                        className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all"
                                      >
                                         <XIcon className="h-3.5 w-3.5" />
                                      </button>
                                   </div>
                                ))}
                             </div>
                          </div>
                       ))}
                       
                       <Button 
                         onClick={() => setSections([...sections, { id: `sec-${Date.now()}`, name: `Section ${sections.length + 1}`, questions: [] }])} 
                         variant="outline" 
                         className="w-full border-dashed border-2 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:border-primary hover:text-primary transition-all"
                       >
                          <PlusCircle className="h-4 w-4 mr-2" /> Add Assembly Section
                       </Button>
                    </div>
                 </TabsContent>
              </Tabs>
           </Card>
        </div>
      </div>
    </div>
  )
}

function XIcon({ className }: { className?: string }) {
   return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
         <path d="M18 6 6 18" /><path d="m6 6 12 12" />
      </svg>
   );
}
