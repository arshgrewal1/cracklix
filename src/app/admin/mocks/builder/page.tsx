"use client"

import React, { useState, useMemo, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  ChevronLeft, 
  Database, 
  Loader2,
  Plus,
  Trash2,
  Zap,
  Clock,
  Target,
  ShieldCheck,
  CheckCircle2,
  Landmark,
  X,
  RefreshCw,
  Award,
  Check,
  Layers
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, limit, getDocs, writeBatch, where, documentId, orderBy, DocumentData } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessLevel, LanguageDisplayMode, MockAssignmentMode, Question, ExamSection, Exam } from "@/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * @fileOverview Institutional Mock Builder Hub v15.2.
 * FIXED: Explicitly typed all callbacks and resolved mismatched JSX tags.
 */

export default function MockBuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
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

  const { data: boards } = useCollection<any>(useMemo(() => (db ? query(collection(db, "boards"), orderBy("displayOrder", "asc")) : null), [db]))
  const { data: rawExams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))
  const { data: existingMock } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  
  const [isInitializing, setIsInitializing] = useState(true)
  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<Question[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState<'BANK' | 'ASSEMBLY'>('BANK')
  
  const [filterBoard, setFilterBoard] = useState("all")
  const [filterSubject, setSubjectFilter] = useState("all")
  const [hideUsed, setHideUsed] = useState(true)
  const [bankSelection, setBankSelection] = useState<string[]>([])
  const [displayLimit, setDisplayLimit] = useState(100)
  
  const [mockData, setMockData] = useState<any>({
    title: "", 
    assignmentMode: "MULTIPLE" as MockAssignmentMode,
    boardIds: [] as string[],
    examIds: [] as string[],
    mockType: "FULL" as MockType, 
    duration: 120, 
    difficulty: "Medium" as Difficulty, 
    accessLevel: "FREE" as AccessLevel,
    published: true,
    languageMode: "ENGLISH_PUNJABI" as LanguageDisplayMode,
    positiveMarks: 1,
    negativeMarks: 0.25,
    attemptLimit: 0,
  })

  const [sections, setSections] = useState<any[]>([
    { id: 'sec-1', name: 'GENERAL HUB', questions: [] as Question[] }
  ])
  const [activeSectionId, setActiveSectionId] = useState('sec-1')

  const fetchBank = useCallback(async () => {
    if (!db) return
    setBankLoading(true)
    try {
      const q = query(collection(db, "questions"), limit(3000))
      const snap = await getDocs(q)
      setQuestionBank(snap.docs.map((d: DocumentData) => ({ ...d.data(), id: d.id }) as Question))
    } finally {
      setBankLoading(false)
    }
  }, [db]);

  useEffect(() => {
    fetchBank()
  }, [fetchBank])

  useEffect(() => {
    if (!db || !isEditing || !existingMock || questionBank.length === 0) {
       if (!isEditing) setIsInitializing(false);
       return;
    }

    setMockData({ 
      ...existingMock,
      assignmentMode: existingMock.assignmentMode || "MULTIPLE",
      boardIds: existingMock.boardIds || (existingMock.boardId ? [existingMock.boardId] : []),
      examIds: existingMock.examIds || (existingMock.examId ? [existingMock.examId] : [])
    });

    if (existingMock.questionIds) {
      let currentIndex = 0;
      const hydratedSections = (existingMock.sections || [{ name: 'GENERAL HUB', count: existingMock.questionIds.length }]).map((s: ExamSection, idx: number) => {
        const count = Number(s.count) || 0;
        const sectionQIds: string[] = (existingMock.questionIds as string[]).slice(currentIndex, currentIndex + count);
        currentIndex += count;
        return { 
          id: `sec-${idx + 1}`, 
          name: s.name, 
          questions: sectionQIds.map((id: string) => questionBank.find((q: Question) => q.id === id)).filter(Boolean) as Question[]
        };
      });
      setSections(hydratedSections.length > 0 ? hydratedSections : [{ id: 'sec-1', name: 'GENERAL HUB', questions: [] }]);
    }
    setIsInitializing(false);
  }, [db, existingMock, questionBank, isEditing]);

  const uniqueExams = useMemo(() => {
    if (!rawExams) return [];
    const seen = new Set();
    const sorted = [...rawExams].sort((a: Exam, b: Exam) => (a.name || "").localeCompare(b.name || ""));
    const filtered = sorted.filter((e: Exam) => {
      const key = (e.name || "").toLowerCase().trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (mockData.boardIds?.length > 0) {
       return filtered.filter((e: Exam) => mockData.boardIds.includes(e.boardId));
    }
    return filtered;
  }, [rawExams, mockData.boardIds]);

  const filteredBank = useMemo(() => {
    const allSelectedIds = sections.flatMap((s: any) => (s.questions || []).map((q: Question) => q.id));
    return questionBank.filter((q: Question) => {
      const matchesBoard = filterBoard === "all" || q.boardId === filterBoard;
      const matchesSub = filterSubject === "all" || q.subjectId === filterSubject;
      const notInThisMock = !allSelectedIds.includes(q.id);
      const usedGuard = !hideUsed || (q.status !== 'USED');
      return matchesBoard && matchesSub && notInThisMock && usedGuard;
    })
  }, [questionBank, filterBoard, filterSubject, hideUsed, sections])

  const visibleBank = useMemo(() => filteredBank.slice(0, displayLimit), [filteredBank, displayLimit]);

  const toggleBoardId = (id: string) => {
     const current = mockData.boardIds || [];
     setMockData({
        ...mockData,
        boardIds: current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id]
     });
  };

  const toggleExamId = (id: string) => {
     const current = mockData.examIds || [];
     setMockData({
        ...mockData,
        examIds: current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id]
     });
  };

  const handleLinkQuestions = () => {
    const toAdd = questionBank.filter((q: Question) => bankSelection.includes(q.id));
    setSections((prev: any[]) => prev.map((s: any) => s.id === activeSectionId ? { ...s, questions: [...(s.questions || []), ...toAdd] } : s));
    setBankSelection([]);
    toast({ title: `Linked ${toAdd.length} Questions` });
  }

  const handlePublish = async () => {
    if (!db || isPublishing) return
    if (!mockData.title?.trim()) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Series Title is mandatory." })
      return
    }
    const flatQuestionIds = sections.flatMap((s: any) => (s.questions || []).map((q: Question) => q.id));
    if (flatQuestionIds.length === 0) {
       toast({ variant: "destructive", title: "Link Blocked", description: "Please add questions to the hub." });
       return;
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", finalId)
    const sectionMetadata = sections.map((s: any) => ({ name: s.name, count: s.questions?.length || 0 })).filter((s: any) => s.count > 0);
    
    const payload = {
      ...mockData,
      id: finalId,
      boardId: mockData.boardIds[0] || "GENERAL",
      totalQuestions: flatQuestionIds.length,
      questionIds: flatQuestionIds,
      sections: sectionMetadata,
      totalMarks: flatQuestionIds.length * (Number(mockData.positiveMarks) || 1),
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
    };

    try {
      await setDoc(mockRef, payload, { merge: true });
      const batch = writeBatch(db);
      flatQuestionIds.forEach((id: string) => {
        batch.update(doc(db, "questions", id), { status: 'USED', updatedAt: serverTimestamp() });
      });
      await batch.commit();
      toast({ title: "Series Deployed", description: "Registry synced successfully." });
      router.push("/admin/mocks")
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsPublishing(false)
    }
  }

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1528] space-y-8">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Hydrating Assembly hub...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-40 text-left pt-4 px-4 md:px-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 md:h-14 md:w-14 shadow-sm active:scale-95">
             <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="text-left">
            <h1 className="text-2xl md:text-5xl font-headline font-black uppercase tracking-tight text-[#0F172A] leading-none">{isEditing ? "Modify Series" : "Mock Architect"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">Institutional Component Registry</p>
          </div>
        </div>
        <Button onClick={handlePublish} disabled={isPublishing} className="w-full md:w-auto bg-[#0F172A] hover:bg-black text-white font-black px-12 h-16 rounded-2xl uppercase text-[11px] tracking-[0.2em] gap-3 shadow-3xl active:scale-95">
          {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-6 w-6" />} Commit to Registry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-6 md:p-10 space-y-8 border border-slate-100">
              <div className="space-y-3">
                 <div className="text-[12px] font-black uppercase text-slate-500 tracking-tight ml-1">Series Headline</div>
                 <Input value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="h-14 md:h-16 rounded-2xl bg-slate-50/50 border-none font-black text-lg px-6 shadow-inner focus-visible:ring-primary text-[#0F172A]" placeholder="Patwari Mock Series 01" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-3">
                    <Label className="text-[12px] font-black uppercase text-slate-500 ml-1">Mock Type</Label>
                    <Select value={mockData.mockType} onValueChange={(v: MockType) => setMockData({...mockData, mockType: v})}><SelectTrigger className="h-12 md:h-14 rounded-xl bg-slate-50/50 border-none font-black text-[12px] uppercase"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FULL">Full Length</SelectItem><SelectItem value="SUBJECT">Subject-Wise</SelectItem><SelectItem value="SECTIONAL">Sectional</SelectItem><SelectItem value="PYQ">Official PYQ</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[12px] font-black uppercase text-slate-500 ml-1">Access Level</Label>
                    <Select value={mockData.accessLevel} onValueChange={(v: AccessLevel) => setMockData({...mockData, accessLevel: v})}><SelectTrigger className="h-12 md:h-14 rounded-xl bg-slate-50/50 border-none font-black text-[12px] uppercase"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FREE">FREE HUB</SelectItem><SelectItem value="PREMIUM">ELITE HUB</SelectItem></SelectContent></Select>
                 </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[12px] font-black uppercase text-slate-500 ml-1">Assigned Authorities</Label>
                <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                   {boards?.map((b: any) => (
                      <div key={b.id} onClick={() => toggleBoardId(b.id)} className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group"><div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", mockData.boardIds?.includes(b.id) ? "border-primary bg-primary" : "border-slate-300 bg-white")}>{mockData.boardIds?.includes(b.id) && <Check className="h-3 w-3 text-white stroke-[3px]" />}</div><span className="text-sm font-black text-[#0F172A] uppercase">{b.abbreviation} HUB</span></div>
                   ))}
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[12px] font-black uppercase text-slate-500 ml-1">Target Verticals</Label>
                <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                   {uniqueExams.map((e: Exam) => (
                        <div key={e.id} onClick={() => toggleExamId(e.id)} className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group"><div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", mockData.examIds?.includes(e.id) ? "border-primary bg-primary" : "border-slate-300 bg-white")}>{mockData.examIds?.includes(e.id) && <Check className="h-3 w-3 text-white stroke-[3px]" />}</div><span className="text-sm font-black text-[#0F172A] uppercase truncate">{e.name}</span></div>
                   ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-3">
                    <Label className="text-[12px] font-black uppercase text-slate-500 ml-1">Duration (Min)</Label>
                    <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 120})} className="h-12 md:h-14 rounded-xl bg-slate-50/50 border-none font-black text-center" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[12px] font-black uppercase text-slate-500 ml-1">Attempt Limit</Label>
                    <Input type="number" value={mockData.attemptLimit} onChange={e => setMockData({...mockData, attemptLimit: parseInt(e.target.value) || 0})} className="h-12 md:h-14 rounded-xl bg-slate-50/50 border-none font-black text-center" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-emerald-600 ml-1">POS (+)</Label><Input type="number" step="0.1" value={mockData.positiveMarks} onChange={e => setMockData({...mockData, positiveMarks: parseFloat(e.target.value) || 1})} className="h-12 bg-emerald-50/50 border-emerald-100 text-center font-black rounded-xl" /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-rose-600 ml-1">NEG (-)</Label><Input type="number" step="0.01" value={mockData.negativeMarks} onChange={e => setMockData({...mockData, negativeMarks: parseFloat(e.target.value) || 0.25})} className="h-12 bg-rose-50/50 border-rose-100 text-center font-black rounded-xl" /></div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
              <button onClick={() => setActiveRightTab('BANK')} className={cn("px-8 py-3 rounded-xl font-black uppercase text-xs tracking-tight transition-all", activeRightTab === 'BANK' ? "bg-[#0B1528] text-white shadow-xl" : "text-slate-400 hover:bg-slate-50")}>Registry Bank</button>
              <button onClick={() => setActiveRightTab('ASSEMBLY')} className={cn("px-8 py-3 rounded-xl font-black uppercase text-xs tracking-tight transition-all", activeRightTab === 'ASSEMBLY' ? "bg-[#0B1528] text-white shadow-xl" : "text-slate-400 hover:bg-slate-50")}>Assembly Hub</button>
           </div>

           {activeRightTab === 'BANK' ? (
             <div className="space-y-8 animate-in zoom-in-95 duration-500">
                <Card className="bg-[#0B1528] rounded-[3rem] p-8 md:p-12 text-white space-y-10 shadow-5xl border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-5"><Database className="h-64 w-64" /></div>
                   <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3"><Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1">Authority Center</Label><select value={filterBoard} onChange={e => setFilterBoard(e.target.value)} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 outline-none font-bold uppercase text-[11px]"><option value="all" className="bg-[#0B1528]">All Boards</option>{boards?.map((b: any) => <option key={b.id} value={b.id} className="bg-[#0B1528]">{b.abbreviation}</option>)}</select></div>
                      <div className="space-y-3"><Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1">Subject Node</Label><select value={filterSubject} onChange={e => setSubjectFilter(e.target.value)} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 outline-none font-bold uppercase text-[11px]"><option value="all" className="bg-[#0B1528]">All Nodes</option>{subjects?.map((s: any) => <option key={s.id} value={s.id} className="bg-[#0B1528]">{s.name}</option>)}</select></div>
                      <div className="flex flex-col justify-end space-y-3"><div className="flex items-center justify-between bg-white/5 px-5 py-3 rounded-xl border border-white/10 h-12"><span className="text-[11px] font-black uppercase tracking-widest text-slate-300">UNUSED ONLY</span><Switch checked={hideUsed} onCheckedChange={setHideUsed} /></div></div>
                   </div>
                   <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 pt-6 border-t border-white/10"><div className="flex-1 text-left"><p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Selection Queue</p><div className="text-xl md:text-3xl font-headline font-black tabular-nums">{bankSelection.length} <span className="text-sm text-slate-500">Nodes Staged</span></div></div><Button onClick={handleLinkQuestions} disabled={bankSelection.length === 0} className="w-full md:w-auto h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-3xl gap-3 transition-all">Link Staged Assets <CheckCircle2 className="h-5 w-5" /></Button></div>
                </Card>
                <div className="grid grid-cols-1 gap-3">
                   {bankLoading ? Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white" />) : visibleBank.map((q: Question) => {
                      const isSelected = bankSelection.includes(q.id);
                      return (<Card key={q.id} onClick={() => setBankSelection((p: string[]) => isSelected ? p.filter(id => id !== q.id) : [...p, q.id])} className={cn("border-none shadow-sm rounded-2xl p-5 md:px-8 flex items-center justify-between cursor-pointer transition-all border-2", isSelected ? "bg-primary/5 border-primary shadow-lg scale-[1.01]" : "bg-white border-transparent hover:border-slate-100")}><div className="flex items-center gap-6 min-w-0"><div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0", isSelected ? "bg-primary border-primary" : "bg-white border-slate-200")}>{isSelected && <Check className="h-3 w-3 text-white stroke-[4px]" />}</div><div className="min-w-0 text-left"><p className="font-bold text-[#0F172A] truncate text-sm md:text-base">{q.englishQuestion}</p><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1.5">{q.subjectId} • {q.difficulty}</p></div></div></Card>)
                   })}
                   {filteredBank.length > displayLimit && <Button variant="ghost" onClick={() => setDisplayLimit((d: number) => d + 100)} className="w-full h-14 font-black uppercase tracking-widest text-[10px] text-slate-400">Load Next Block ({filteredBank.length - displayLimit} Remaining)</Button>}
                </div>
             </div>
           ) : (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-4">
                   <div className="text-left"><h3 className="text-xl font-headline font-black uppercase text-[#0F172A] flex items-center gap-3"><Layers className="h-6 w-6 text-primary" /> Active Composition</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{sections.reduce((a: number, s: any) => a + (s.questions?.length || 0), 0)} Total Verified Nodes</p></div>
                   <Popover>
                      <PopoverTrigger asChild><Button className="h-12 px-8 bg-[#0F172A] hover:bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl"><Plus className="h-4 w-4" /> Add Section Node</Button></PopoverTrigger>
                      <PopoverContent className="w-[320px] p-6 bg-[#0F172A] text-white rounded-[2rem] border-white/10 shadow-5xl z-[1001]">
                         <div className="space-y-4">
                            <h4 className="sr-only">Add Section Hub</h4>
                            <Label className="text-[10px] font-black uppercase text-primary ml-1">Section hub Name</Label>
                            <Input placeholder="e.g. PUNJAB GK" className="h-12 bg-white/5 border-white/10 text-white rounded-xl font-bold" onKeyDown={(e) => {
                               if(e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value;
                                  if(val.trim()) { setSections([...sections, { id: `sec-${Date.now()}`, name: val.trim().toUpperCase(), questions: [] }]); (e.target as HTMLInputElement).value = ""; }
                               }
                            }} />
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">Press Enter to Create Hub</p>
                         </div>
                      </PopoverContent>
                   </Popover>
                </div>
                <div className="grid grid-cols-1 gap-8">
                   {sections.map((sec: any, sIdx: number) => (
                      <Card key={sec.id} className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden border border-slate-100 group/sec">
                         <div className="flex items-center justify-between p-8 bg-slate-50/50 border-b border-slate-50"><div className="flex items-center gap-6"><div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl transition-colors", activeSectionId === sec.id ? "bg-primary text-white" : "bg-[#0F172A] text-white")}>{sIdx + 1}</div><div className="text-left"><Input value={sec.name} onChange={e => setSections((p: any[]) => p.map((s: any) => s.id === sec.id ? { ...s, name: e.target.value.toUpperCase() } : s))} className="h-8 p-0 bg-transparent border-none font-black uppercase text-xl md:text-2xl focus-visible:ring-0 text-[#0F172A]" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(sec.questions?.length || 0)} Linked Preparation Nodes</p></div></div><div className="flex gap-2"><Button onClick={() => setActiveSectionId(sec.id)} variant="ghost" className={cn("h-10 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest", activeSectionId === sec.id ? "bg-primary text-white" : "text-slate-400")}>{activeSectionId === sec.id ? "ACTIVE" : "FOCUS"}</Button><button onClick={() => setSections((p: any[]) => p.filter((s: any) => s.id !== sec.id))} className="h-10 w-10 text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center"><Trash2 className="h-5 w-5" /></button></div></div>
                         <div className="p-8 space-y-4">
                            {sec.questions?.map((q: Question, qIdx: number) => (
                               <div key={q.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300"><div className="flex items-center gap-6 min-w-0"><span className="text-lg font-black text-slate-300 w-6">#{qIdx + 1}</span><p className="text-sm font-bold text-slate-600 truncate">{q.englishQuestion}</p></div><button onClick={() => setSections((p: any[]) => p.map((s: any) => s.id === sec.id ? { ...s, questions: s.questions?.filter((item: Question) => item.id !== q.id) || [] } : s))} className="text-slate-300 hover:text-rose-500 transition-colors"><X className="h-4 w-4" /></button></div>
                            ))}
                            {(!sec.questions || sec.questions.length === 0) && <div className="py-20 text-center opacity-10 flex flex-col items-center gap-4"><RefreshCw className="h-10 w-10 animate-spin-slow" /><p className="font-black uppercase tracking-widest text-[10px]">Awaiting node link synchronization...</p></div>}
                         </div>
                      </Card>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
