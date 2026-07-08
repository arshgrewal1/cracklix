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
  Layers,
  Save
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, limit, getDocs, writeBatch, where, documentId, orderBy, DocumentData, updateDoc, increment } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessLevel, LanguageDisplayMode, MockAssignmentMode, Question, ExamSection, Exam } from "@/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * @fileOverview Institutional Mock Builder Hub v22.0 (PWA Hardened).
 * PWA SYNC: Removed all uppercase headers/labels, implemented high-density Title Case.
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

  const mockId = searchParams?.get("id") ?? ""
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
    { id: 'sec-1', name: 'General Hub', questions: [] as Question[] }
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
      const hydratedSections = (existingMock.sections || [{ name: 'General Hub', count: existingMock.questionIds.length }]).map((s: ExamSection, idx: number) => {
        const count = Number(s.count) || 0;
        const sectionQIds: string[] = (existingMock.questionIds as string[]).slice(currentIndex, currentIndex + count);
        currentIndex += count;
        return { 
          id: `sec-${idx + 1}`, 
          name: s.name, 
          questions: sectionQIds.map((id: string) => questionBank.find((q: Question) => q.id === id)).filter(Boolean) as Question[]
        };
      });
      setSections(hydratedSections.length > 0 ? hydratedSections : [{ id: 'sec-1', name: 'General Hub', questions: [] }]);
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
     setMockData((prev: any) => ({
        ...prev,
        boardIds: current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id]
     }));
  };

  const handleLinkQuestions = () => {
    const toAdd = questionBank.filter((q: Question) => bankSelection.includes(q.id));
    setSections((prev: any[]) => prev.map((s: any) => s.id === activeSectionId ? { ...s, questions: [...(s.questions || []), ...toAdd] } : s));
    setBankSelection([]);
    toast({ title: `Linked ${toAdd.length} questions` });
  }

  const handlePublish = async () => {
    if (!db || isPublishing) return
    if (!mockData.title?.trim()) {
      toast({ variant: "destructive", title: "Wait", description: "Series title is mandatory." })
      return
    }
    const flatQuestionIds = sections.flatMap((s: any) => (s.questions || []).map((q: Question) => q.id));
    if (flatQuestionIds.length === 0) {
       toast({ variant: "destructive", title: "No Items", description: "Please add questions to the hub." });
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

      if (!isEditing) {
        await updateDoc(doc(db, 'settings', 'stats'), {
           totalMocks: increment(1),
           updatedAt: serverTimestamp()
        }).catch(() => {});
      }

      toast({ title: "Series Deployed", description: "Registry synced." });
      router.push("/admin/mocks")
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync failed" })
    } finally {
      setIsPublishing(false)
    }
  }

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Hydrating Hub...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-12 pb-40 text-left pt-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-4 md:gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full border bg-white h-10 w-10 md:h-12 md:w-12 shadow-sm">
             <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <div className="text-left">
            <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">{isEditing ? "Modify Series" : "Mock Architect"}</h1>
            <p className="text-slate-500 font-medium text-[11px] md:text-lg mt-1.5">Institutional component registry hub.</p>
          </div>
        </div>
        <Button onClick={handlePublish} disabled={isPublishing} className="w-full md:w-auto h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3">
          {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-5 w-5" />} Commit to Registry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 px-1">
        <div className="lg:col-span-4 space-y-6 md:space-y-10">
           <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white p-5 md:p-12 space-y-6 md:space-y-10 border border-slate-50">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Series headline</Label>
                 <Input value={mockData.title} onChange={e => setMockData((p: any) => ({...p, title: e.target.value}))} className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50/50 border-none font-black text-sm md:text-xl px-5 md:px-8 shadow-inner focus-visible:ring-primary text-[#0F172A]" placeholder="e.g. Patwari Mock Series 01" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mock type</Label>
                    <Select value={mockData.mockType} onValueChange={(v: MockType) => setMockData((p: any) => ({...p, mockType: v}))}>
                       <SelectTrigger className="h-11 md:h-14 rounded-xl bg-slate-50/50 border-none font-bold text-xs">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="FULL">Full Length</SelectItem>
                          <SelectItem value="SUBJECT">Subject-Wise</SelectItem>
                          <SelectItem value="SECTIONAL">Sectional</SelectItem>
                          <SelectItem value="PYQ">Official PYQ</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Access level</Label>
                    <Select value={mockData.accessLevel} onValueChange={(v: AccessLevel) => setMockData((p: any) => ({...p, accessLevel: v}))}>
                       <SelectTrigger className="h-11 md:h-14 rounded-xl bg-slate-50/50 border-none font-bold text-xs">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="FREE">Free Hub</SelectItem>
                          <SelectItem value="PREMIUM">Elite Hub</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assigned authorities</Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                   {boards?.map((b: any) => (
                      <div key={b.id} onClick={() => toggleBoardId(b.id)} className="flex items-center space-x-3 p-3 md:p-4 bg-slate-50/50 rounded-xl md:rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group">
                         <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", mockData.boardIds?.includes(b.id) ? "border-primary bg-primary" : "border-slate-300 bg-white")}>
                            {mockData.boardIds?.includes(b.id) && <Check className="h-3 w-3 text-white stroke-[4px]" />}
                         </div>
                         <span className="text-xs md:text-sm font-bold text-[#0F172A] uppercase">{b.abbreviation} Hub</span>
                      </div>
                   ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Duration (min)</Label>
                    <Input type="number" value={mockData.duration} onChange={e => setMockData((p: any) => ({...p, duration: parseInt(e.target.value) || 120}))} className="h-11 md:h-14 rounded-xl bg-slate-50/50 border-none font-black text-center text-sm md:text-lg" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Attempt limit</Label>
                    <Input type="number" value={mockData.attemptLimit} onChange={e => setMockData((p: any) => ({...p, attemptLimit: parseInt(e.target.value) || 0}))} className="h-11 md:h-14 rounded-xl bg-slate-50/50 border-none font-black text-center text-sm md:text-lg" />
                 </div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-8 space-y-6 md:space-y-10">
           <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm w-fit">
              <button onClick={() => setActiveRightTab('BANK')} className={cn("px-6 md:px-10 py-2.5 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all", activeRightTab === 'BANK' ? "bg-[#0F172A] text-white shadow-xl" : "text-slate-400 hover:bg-slate-50")}>Registry Bank</button>
              <button onClick={() => setActiveRightTab('ASSEMBLY')} className={cn("px-6 md:px-10 py-2.5 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all", activeRightTab === 'ASSEMBLY' ? "bg-[#0F172A] text-white shadow-xl" : "text-slate-400 hover:bg-slate-50")}>Assembly Hub</button>
           </div>

           {activeRightTab === 'BANK' ? (
             <div className="space-y-6 md:space-y-10 animate-in zoom-in-95 duration-500">
                <Card className="bg-[#0F172A] rounded-2xl md:rounded-[3rem] p-6 md:p-12 text-white space-y-8 md:space-y-12 shadow-5xl border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><Database className="h-64 w-64" /></div>
                   <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Authority center</Label><select value={filterBoard} onChange={e => setFilterBoard(e.target.value)} className="w-full h-11 md:h-14 bg-white/5 border border-white/10 rounded-xl px-4 outline-none font-bold text-sm"><option value="all" className="bg-[#0F172A]">All Boards Hub</option>{boards?.map((b: any) => <option key={b.id} value={b.id} className="bg-[#0F172A]">{b.abbreviation} Hub</option>)}</select></div>
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Subject node</Label><select value={filterSubject} onChange={e => setSubjectFilter(e.target.value)} className="w-full h-11 md:h-14 bg-white/5 border border-white/10 rounded-xl px-4 outline-none font-bold text-sm"><option value="all" className="bg-[#0F172A]">All Subject Nodes</option>{subjects?.map((s: any) => <option key={s.id} value={s.id} className="bg-[#0F172A]">{s.name}</option>)}</select></div>
                      <div className="flex flex-col justify-end space-y-2"><div className="flex items-center justify-between bg-white/5 px-5 py-2 rounded-xl border border-white/10 h-11 md:h-14"><span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Unused Only</span><Switch checked={hideUsed} onCheckedChange={setHideUsed} /></div></div>
                   </div>
                   <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 pt-8 md:pt-12 border-t border-white/10">
                      <div className="flex-1 text-left">
                         <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Selection Queue</p>
                         <div className="text-2xl md:text-5xl font-black text-white tabular-nums tracking-tighter">{bankSelection.length} <span className="text-sm md:text-xl text-slate-500 font-bold ml-2">Nodes Staged</span></div>
                      </div>
                      <Button onClick={handleLinkQuestions} disabled={bankSelection.length === 0} className="w-full md:w-auto h-12 md:h-16 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-full shadow-2xl border-none gap-3 active:scale-95">
                         Link Staged Assets <CheckCircle2 className="h-5 w-5" />
                      </Button>
                   </div>
                </Card>
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                   {bankLoading ? Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white" />) : visibleBank.map((q: Question) => {
                      const isSelected = bankSelection.includes(q.id);
                      return (
                        <Card key={q.id} onClick={() => setBankSelection((p: string[]) => isSelected ? p.filter(id => id !== q.id) : [...p, q.id])} className={cn("border-none shadow-sm rounded-xl md:rounded-2xl p-4 md:p-6 lg:px-10 flex items-center justify-between cursor-pointer transition-all border-2", isSelected ? "bg-primary/5 border-primary shadow-lg" : "bg-white border-transparent hover:border-slate-100 hover:shadow-md")}>
                           <div className="flex items-center gap-4 md:gap-8 min-w-0">
                              <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", isSelected ? "bg-primary border-primary" : "bg-white border-slate-200")}>
                                 {isSelected && <Check className="h-3 w-3 text-white stroke-[4px]" />}
                              </div>
                              <div className="min-w-0 text-left">
                                 <p className="font-bold text-[#0F172A] truncate text-sm md:text-base leading-tight">{q.englishQuestion}</p>
                                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1.5">{(q.subjectId || "GK").toUpperCase()} Hub • {q.difficulty}</p>
                              </div>
                           </div>
                        </Card>
                      )
                   })}
                   {filteredBank.length > displayLimit && (
                      <Button variant="ghost" onClick={() => setDisplayLimit((d: number) => d + 100)} className="w-full h-14 rounded-2xl text-slate-400 font-bold uppercase text-[9px] tracking-widest">
                         Load More ({filteredBank.length - displayLimit} Remaining)
                      </Button>
                   )}
                </div>
             </div>
           ) : (
             <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-6">
                   <div className="text-left">
                      <h3 className="text-xl md:text-3xl font-black text-[#0F172A] flex items-center gap-4 tracking-tight">
                         <Layers className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Active Composition
                      </h3>
                   </div>
                   <Popover>
                      <PopoverTrigger asChild>
                         <Button className="w-full md:w-auto h-11 md:h-12 px-8 bg-[#0F172A] hover:bg-black text-white rounded-full font-black uppercase text-[9px] tracking-widest shadow-xl border-none gap-3">
                            <Plus className="h-4 w-4" /> Add Section Node
                         </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[320px] p-6 bg-[#0F172A] text-white rounded-[2rem] border-white/10 shadow-5xl z-[1001]">
                         <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Section hub name</Label>
                            <Input placeholder="e.g. PUNJAB GK" className="h-12 bg-white/5 border-white/10 text-white rounded-full font-bold px-6 shadow-inner" onKeyDown={(e) => {
                               if(e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value;
                                  if(val.trim()) { setSections([...sections, { id: `sec-${Date.now()}`, name: val.trim(), questions: [] }]); (e.target as HTMLInputElement).value = ""; }
                               }
                            }} />
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">Press Enter to initialize hub</p>
                         </div>
                      </PopoverContent>
                   </Popover>
                </div>
                <div className="grid grid-cols-1 gap-6 md:gap-10">
                   {sections.map((sec: any, sIdx: number) => (
                      <Card key={sec.id} className="border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white overflow-hidden border border-slate-100 group/sec">
                         <div className="flex items-center justify-between p-6 md:p-10 bg-slate-50/50 border-b border-slate-50">
                            <div className="flex items-center gap-4 md:gap-8">
                               <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-2xl shadow-xl bg-[#0F172A] text-white">
                                  {sIdx + 1}
                               </div>
                               <div className="text-left">
                                  <Input value={sec.name} onChange={e => setSections((p: any[]) => p.map((s: any) => s.id === sec.id ? { ...s, name: e.target.value } : s))} className="h-10 p-0 bg-transparent border-none font-black text-xl md:text-3xl focus-visible:ring-0 text-[#0F172A] uppercase" />
                                  <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{(sec.questions?.length || 0)} Prep Nodes Linked</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <Button onClick={() => setActiveSectionId(sec.id)} variant={activeSectionId === sec.id ? "default" : "ghost"} className="h-9 rounded-full font-black text-[9px] uppercase tracking-widest">
                                  {activeSectionId === sec.id ? "Active" : "Focus"}
                               </Button>
                               <Button variant="ghost" size="icon" onClick={() => setSections((p: any[]) => p.filter((s: any) => s.id !== sec.id))} className="text-rose-500 hover:bg-rose-50 rounded-xl h-10 w-10">
                                  <Trash2 className="h-5 w-5" />
                               </Button>
                            </div>
                         </div>
                         <div className="p-6 md:p-10 space-y-3 md:space-y-4">
                            {sec.questions?.map((q: Question, qIdx: number) => (
                               <div key={q.id} className="flex items-center justify-between p-4 md:px-8 bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 group/node">
                                  <div className="flex items-center gap-4 md:gap-8 min-w-0">
                                     <span className="text-sm md:text-xl font-black text-slate-200 w-6 tabular-nums">#{qIdx + 1}</span>
                                     <p className="text-sm md:text-base font-bold text-slate-600 truncate">{q.englishQuestion}</p>
                                  </div>
                                  <button onClick={() => setSections((p: any[]) => p.map((s: any) => s.id === sec.id ? { ...s, questions: s.questions?.filter((item: Question) => item.id !== q.id) || [] } : s))} className="text-slate-300 hover:text-rose-500 transition-colors p-2 cursor-pointer active:scale-90">
                                     <X className="h-4 w-4" />
                                  </button>
                               </div>
                            ))}
                            {(!sec.questions || sec.questions.length === 0) && (
                               <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl opacity-20">
                                  <p className="text-[10px] font-black uppercase tracking-widest">No nodes linked to this hub</p>
                               </div>
                            )}
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
