"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Newspaper, 
  Zap, 
  Loader2, 
  X, 
  Calendar,
  Rocket,
  CheckCircle2,
  Languages,
  Clock,
  Target,
  AlertTriangle,
  ChevronRight,
  Layers,
  SearchCode,
  Globe
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp, writeBatch, query, where } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrentAffairHubItem, LanguageDisplayMode, CurrentAffairType } from "@/types"
import { cn } from "@/lib/utils"
import { parseBulkQuestions } from "@/lib/parser"
import QuestionRenderer from "@/components/questions/QuestionRenderer"

/**
 * @fileOverview Institutional Current Affairs Management Hub v19.9.
 * ACCESSIBILITY: Added DialogDescription for ARIA compliance.
 */

export default function AdminCurrentAffairs() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const caQuery = useMemo(() => (db ? collection(db, "current_affairs_hub") : null), [db])
  const { data: rawCaItems, loading } = useCollection<CurrentAffairHubItem>(caQuery as any)

  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [bulkText, setBulkText] = useState("")

  const [editingQIndex, setEditingQIndex] = useState<number | null>(null)
  const [editQForm, setEditQForm] = useState<any>(null)

  const caItems = useMemo(() => {
     if (!rawCaItems) return [];
     return [...rawCaItems].sort((a, b) => {
        const tA = a.updatedAt?.seconds || 0;
        const tB = b.updatedAt?.seconds || 0;
        return tB - tA;
     });
  }, [rawCaItems]);

  const handleProcessBulk = () => {
    if (!bulkText.trim()) return;
    const metadata = { 
      boardId: 'current-affairs', 
      subjectId: 'gk-ca', 
      status: 'PUBLISHED',
      secondaryLanguage: editingItem.language === 'English & Hindi' ? 'hindi' : 'punjabi'
    };
    const result = parseBulkQuestions(bulkText, metadata);
    
    if (result.questions.length > 0) {
      setEditingItem({
        ...editingItem,
        questions: [...(editingItem.questions || []), ...result.questions]
      });
      setBulkText("");
      toast({ title: "Extraction Success", description: `${result.questions.length} questions staged for audit.` });
    } else {
      toast({ variant: "destructive", title: "Parse Failed", description: "Verify stacked bilingual format." });
    }
  };

  const handleOpenEditQ = (idx: number) => {
    setEditingQIndex(idx);
    setEditQForm({ ...editingItem.questions[idx] });
  };

  const handleSaveEditQ = () => {
    if (editingQIndex === null || !editQForm) return;
    const updatedQs = [...editingItem.questions];
    updatedQs[editingQIndex] = editQForm;
    setEditingItem({ ...editingItem, questions: updatedQs });
    setEditingQIndex(null);
    toast({ title: "Question Tweaked" });
  };

  const handleSave = async () => {
    if (!db || !editingItem) return
    if (!editingItem.title || !editingItem.type) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Config incomplete." })
      return
    }

    setIsSaving(true)
    const caId = editingItem.id || `ca-hub-${Date.now()}`
    const caRef = doc(db, "current_affairs_hub", caId)
    
    let quizId = editingItem.quizId || `quiz-${caId}`
    const langMode: LanguageDisplayMode = editingItem.language === 'English & Hindi' ? 'ENGLISH_HINDI' : 'ENGLISH_PUNJABI';

    if (editingItem.questions && editingItem.questions.length > 0) {
      const batch = writeBatch(db)
      const qIds: string[] = []

      editingItem.questions.forEach((q: any) => {
        const qRef = q.id && !q.id.includes('q-node') ? doc(db, "questions", q.id) : doc(collection(db, "questions"))
        const qId = qRef.id
        qIds.push(qId)
        
        const { debug, ...cleanQ } = q;
        batch.set(qRef, {
          ...cleanQ,
          id: qId,
          examId: 'current-affairs',
          sectionId: editingItem.title,
          updatedAt: serverTimestamp(),
          createdAt: q.createdAt || serverTimestamp(),
          status: 'USED'
        }, { merge: true })
      })

      const mockRef = doc(db, "mocks", quizId)
      batch.set(mockRef, {
        id: quizId,
        title: `${editingItem.title} Quiz`,
        mockType: 'CA_QUIZ',
        accessType: 'FREE',
        duration: parseInt(editingItem.duration) || 15,
        positiveMarks: parseFloat(editingItem.positiveMarks) || 1,
        negativeMarks: parseFloat(editingItem.negativeMarks) || 0.25,
        totalQuestions: qIds.length,
        questionIds: qIds,
        published: true,
        languageMode: langMode,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true })

      await batch.commit()
    }

    const payload = {
      ...editingItem,
      id: caId,
      quizId: (editingItem.questions?.length > 0) ? quizId : null,
      updatedAt: serverTimestamp(),
      createdAt: editingItem.createdAt || serverTimestamp()
    }

    const { questions: _, ...cleanPayload } = payload;

    // Hardened fallback to prevent uncontrolled inputs
    Object.keys(cleanPayload).forEach(k => {
      if (cleanPayload[k] === undefined || cleanPayload[k] === null) {
        cleanPayload[k] = "";
      }
    });

    try {
      await setDoc(caRef, cleanPayload, { merge: true })
      toast({ title: "Mock Hub Synced", description: "Direct extraction committed to registry." })
      setEditingItem(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredItems = useMemo(() => {
    if (!caItems) return []
    return caItems.filter(item => 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [caItems, searchTerm])

  return (
    <div className="space-y-6 pb-24 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-2 md:px-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl md:text-5xl font-black font-headline text-primary uppercase tracking-tight leading-tight">CA Manager</h1>
          <p className="text-slate-500 mt-1 md:mt-2 text-sm md:text-lg font-medium">Coordinate Daily, Weekly, and Monthly coverage.</p>
        </div>
        <button onClick={() => setEditingItem({ title: "", type: "DAILY", month: "January", year: "Latest Pattern", status: "PUBLISHED", questions: [], language: "English & Punjabi", duration: 15, positiveMarks: 1, negativeMarks: 0.25 })} className="w-full lg:w-auto bg-primary hover:bg-orange-600 text-white h-14 md:h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 border-none">
          <Plus className="h-5 w-5" /> Initialize CA Hub
        </button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-2xl md:rounded-[3rem] overflow-hidden mx-2 md:mx-4">
        <CardHeader className="p-4 md:p-10 border-b border-slate-50 bg-slate-50/30">
           <div className="relative w-full lg:w-[45%]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              <Input 
                className="pl-12 md:pl-16 h-12 md:h-16 rounded-xl md:rounded-[1.5rem] bg-white border-none shadow-inner text-sm md:text-lg font-medium" 
                placeholder="Search archives..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-50 h-16 md:h-20">
                  <TableHead className="px-6 md:px-10 text-[9px] md:text-[10px] font-black uppercase text-slate-500">Node Identity</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 text-center">Context</TableHead>
                  <TableHead className="text-right px-6 md:px-10 text-[9px] md:text-[10px] font-black uppercase text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={3} className="px-10 py-8"><Skeleton className="h-14 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                  ))
                ) : filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                    <TableCell className="px-6 md:px-10 py-6 md:py-8 text-left">
                      <div className="flex items-center gap-4 md:gap-6">
                         <div className={cn(
                           "h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                           item.type === 'DAILY' ? 'bg-orange-50 text-primary' : 
                           item.type === 'WEEKLY' ? 'bg-blue-50 text-blue-600' : 
                           item.type === 'MONTHLY' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                         )}>
                            <Calendar className="h-5 w-5 md:h-6 md:w-6" />
                         </div>
                         <div className="min-w-0">
                            <p className="font-black text-[#0F172A] text-sm md:text-xl uppercase truncate">{item.title}</p>
                            <p className="text-[8px] md:text-[9px] font-bold text-slate-400 mt-1 uppercase">{item.month} {item.year}</p>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 text-[8px] md:text-[9px] font-black uppercase px-2 py-1">
                         {item.type} HUB
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 md:px-10">
                      <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                         <Button variant="ghost" size="icon" className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-slate-50 hover:bg-white hover:text-primary shadow-sm" onClick={() => setEditingItem(item)}>
                          <Edit className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={async () => { if(confirm("Purge?")) await deleteDoc(doc(db!, "current_affairs_hub", item.id)) }}>
                          <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && !isSaving && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[98vw] w-[98vw] h-[95vh] max-h-[95vh] rounded-2xl md:rounded-[2rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-1 w-full bg-primary shrink-0" />
          <DialogHeader className="px-6 py-4 shrink-0 flex flex-row items-center justify-between border-b border-slate-50">
            <div className="min-w-0">
               <DialogTitle className="text-lg md:text-2xl font-black font-headline uppercase text-[#0F172A] truncate pr-4">Direct Mock Architect (Current Affairs)</DialogTitle>
               <DialogDescription className="sr-only">Assemble or modify a current affairs quiz Hub.</DialogDescription>
            </div>
            <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0"><X className="h-5 w-5 md:h-6 md:w-6 text-slate-400" /></button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
               {/* CONFIG SIDEBAR */}
               <div className="lg:col-span-3 space-y-4">
                  <Card className="border-none bg-slate-50/50 p-5 rounded-2xl space-y-6 shadow-inner border border-slate-100">
                     <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] ml-1">Mock Metadata</p>
                     
                     <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Quiz Title</Label>
                        <Input value={editingItem?.title ?? ""} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="h-12 rounded-xl border-slate-100 bg-white font-black text-sm" placeholder="e.g. Daily GK 24 Oct" />
                     </div>

                     <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Layers className="h-3 w-3" /> Hub Category</Label>
                        <select 
                           value={editingItem?.type ?? "DAILY"} 
                           onChange={e => setEditingItem({...editingItem, type: e.target.value as CurrentAffairType})} 
                           className="w-full h-11 bg-white border-slate-200 rounded-xl px-4 font-black uppercase text-[9px] outline-none shadow-sm"
                        >
                           <option value="DAILY">Daily Hub</option>
                           <option value="WEEKLY">Weekly Hub</option>
                           <option value="MONTHLY">Monthly Hub</option>
                           <option value="QUIZ">Live Quiz Hub</option>
                           <option value="SPECIAL">Special Hub</option>
                        </select>
                     </div>

                     <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Languages className="h-3 w-3" /> Language Mode</Label>
                        <select value={editingItem?.language ?? "English & Punjabi"} onChange={e => setEditingItem({...editingItem, language: e.target.value})} className="w-full h-11 bg-[#0B1528] text-white border-none rounded-xl px-4 font-black uppercase text-[9px] outline-none shadow-xl">
                           <option value="English & Punjabi">English & Punjabi</option>
                           <option value="English & Hindi">English & Hindi</option>
                        </select>
                     </div>

                     <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-200/50">
                        <div className="space-y-1.5">
                           <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Clock className="h-3 w-3" /> Duration (Mins)</Label>
                           <Input 
                              type="number" 
                              value={isNaN(editingItem?.duration) ? "" : editingItem?.duration} 
                              onChange={e => setEditingItem({...editingItem, duration: parseInt(e.target.value) || 0})} 
                              className="h-11 rounded-xl border-none bg-white font-black shadow-sm" 
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Target className="h-3 w-3 text-emerald-500" /> Pos (+)</Label>
                              <Input 
                                type="number" 
                                step="0.5" 
                                value={isNaN(editingItem?.positiveMarks) ? "" : editingItem?.positiveMarks} 
                                onChange={e => setEditingItem({...editingItem, positiveMarks: parseFloat(e.target.value) || 0})} 
                                className="h-11 rounded-xl border-none bg-white font-black shadow-sm text-center" 
                              />
                           </div>
                           <div className="space-y-1.5">
                              <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-rose-500" /> Neg (-)</Label>
                              <Input 
                                type="number" 
                                step="0.05" 
                                value={isNaN(editingItem?.negativeMarks) ? "" : editingItem?.negativeMarks} 
                                onChange={e => setEditingItem({...editingItem, negativeMarks: parseFloat(e.target.value) || 0})} 
                                className="h-11 rounded-xl border-none bg-white font-black shadow-sm text-center" 
                              />
                           </div>
                        </div>
                     </div>
                  </Card>
               </div>

               {/* MAIN EXTRACTION HUB */}
               <div className="lg:col-span-9 h-full min-h-[400px]">
                  <Card className="border-none bg-white shadow-3xl rounded-[3rem] p-8 md:p-12 space-y-10 border border-slate-100 h-full flex flex-col">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0">
                        <div className="flex items-center gap-6">
                           <Zap className="h-8 w-8 text-primary fill-current" />
                           <div className="text-left">
                              <h4 className="font-headline font-black text-2xl uppercase text-[#0F172A]">Bulk extraction Hub</h4>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Ingestion Protocol</p>
                           </div>
                        </div>
                        <Badge className="bg-[#0F172A] text-white border-none font-black px-6 py-2 rounded-xl text-[10px] w-fit shadow-2xl">{editingItem?.questions?.length || 0} Assets Staged</Badge>
                     </div>

                     <div className="space-y-6 flex flex-col flex-1 min-h-0">
                        <div className="space-y-4 shrink-0">
                           <Textarea 
                              value={bulkText}
                              onChange={e => setBulkText(e.target.value)}
                              placeholder={`Q15. English Question\nPunjabi/Hindi Question Statement...\n(A) Option English\nPunjabi/Hindi Option Text...\nAnswer: C\nExplanation (English): Logic...\nਵਿਆਖਿਆ: Logic...`}
                              className="min-h-[400px] md:min-h-[500px] rounded-[2.5rem] bg-slate-50 border-none p-10 text-sm font-bold shadow-inner resize-none focus-visible:ring-primary leading-relaxed"
                           />
                           <Button onClick={handleProcessBulk} disabled={!bulkText.trim()} className="w-full h-16 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-2xl shadow-4xl gap-4 border-none transition-all active:scale-95">
                              Initialize Extraction <ChevronRight className="h-6 w-6" />
                           </Button>
                        </div>

                        {editingItem?.questions?.length > 0 && (
                           <div className="flex-1 flex flex-col min-h-0 pt-8 border-t border-slate-100">
                              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-10">
                                 <div className="grid grid-cols-1 gap-10">
                                    {editingItem.questions.map((q: any, idx: number) => (
                                       <div key={idx} className="bg-slate-50/50 p-8 md:p-12 rounded-[3.5rem] border border-slate-100 group/q relative transition-all hover:bg-white hover:shadow-4xl">
                                          <div className="absolute top-10 right-10 flex gap-2 opacity-0 group-hover/q:opacity-100 transition-all">
                                             <button onClick={() => handleOpenEditQ(idx)} className="text-blue-500 p-3 rounded-2xl hover:bg-blue-50 bg-white shadow-sm"><Edit className="h-6 w-6" /></button>
                                             <button onClick={() => { const qs = [...editingItem.questions]; qs.splice(idx, 1); setEditingItem({...editingItem, questions: qs}); }} className="text-rose-500 p-3 rounded-2xl hover:bg-rose-50 bg-white shadow-sm"><Trash2 className="h-6 w-6" /></button>
                                          </div>
                                          
                                          <div className="flex items-center gap-6 mb-10">
                                             <div className="h-10 w-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-sm shadow-xl">{idx + 1}</div>
                                          </div>

                                          <div className="space-y-10">
                                             <QuestionRenderer 
                                                question={q} 
                                                language={editingItem.language === 'English & Hindi' ? 'ENGLISH_HINDI' : 'ENGLISH_PUNJABI'}
                                                showSolution={true}
                                                className="bg-transparent p-0 shadow-none border-none"
                                             />
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </Card>
               </div>
            </div>
          </div>

          <DialogFooter className="px-10 py-6 bg-slate-50 flex flex-row items-center gap-6 shrink-0 border-t border-slate-100">
            <button onClick={() => setEditingItem(null)} className="rounded-2xl h-14 px-10 font-black uppercase text-[10px] text-slate-400 hover:text-[#0F172A] tracking-widest transition-colors">Discard Draft</button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#0F172A] hover:bg-black text-white h-16 px-16 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex-1 shadow-4xl gap-4 border-none transition-all active:scale-95">
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-6 w-6 text-primary fill-current" />} Commit Hub to Live Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
