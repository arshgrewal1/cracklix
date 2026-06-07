
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
  Upload, 
  Calendar,
  Layers,
  Database,
  Rocket,
  ChevronRight
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrentAffairHubItem } from "@/types"
import { cn } from "@/lib/utils"
import { parseBulkQuestions } from "@/lib/parser"

/**
 * @fileOverview Institutional Current Affairs Management Hub v7.0.
 * UPDATED: Increased ingestion box size and aligned with interleaved bilingual parser.
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
    const metadata = { boardId: 'current-affairs', subjectId: 'gk-ca', status: 'PUBLISHED' };
    const result = parseBulkQuestions(bulkText, metadata);
    
    if (result.questions.length > 0) {
      setEditingItem({
        ...editingItem,
        questions: [...(editingItem.questions || []), ...result.questions]
      });
      setBulkText("");
      toast({ title: "Extraction Success", description: `${result.questions.length} questions staged.` });
    } else {
      toast({ variant: "destructive", title: "Parse Failed", description: "Format: Q1, Pa Statement, (A) Opt EN/PA" });
    }
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
          createdAt: q.createdAt || serverTimestamp()
        }, { merge: true })
      })

      const mockRef = doc(db, "mocks", quizId)
      batch.set(mockRef, {
        id: quizId,
        title: `${editingItem.title} Quiz`,
        mockType: 'CA_QUIZ',
        accessType: 'FREE',
        duration: 15,
        totalQuestions: qIds.length,
        questionIds: qIds,
        published: true,
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

    try {
      await setDoc(caRef, cleanPayload, { merge: true })
      toast({ title: "Registry Updated", description: "Node synchronized." })
      setEditingItem(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this node?")) return
    await deleteDoc(doc(db!, "current_affairs_hub", id))
    toast({ title: "Node Purged" })
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
           <div className="flex items-center gap-3 mb-2">
              <Newspaper className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 truncate">Official news hub</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-black font-headline text-primary uppercase tracking-tight leading-tight">CA Manager</h1>
          <p className="text-slate-500 mt-1 md:mt-2 text-sm md:text-lg font-medium">Coordinate Daily, Weekly, and Monthly strategic coverage.</p>
        </div>
        <Button onClick={() => setEditingItem({ title: "", type: "DAILY", month: "January", year: "2026", status: "PUBLISHED", questions: [], language: "Bilingual" })} className="w-full lg:w-auto bg-primary hover:bg-orange-600 h-14 md:h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl transition-all active:scale-95 border-none">
          <Plus className="h-5 w-5" /> Initialize CA Hub
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-2xl md:rounded-[3rem] overflow-hidden mx-2 md:mx-4">
        <CardHeader className="p-4 md:p-10 border-b border-slate-50 bg-slate-50/30">
           <div className="relative w-full lg:w-[45%]">
              <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
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
                           "h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105",
                           item.type === 'DAILY' ? 'bg-orange-50 text-primary' : 'bg-blue-50 text-blue-600'
                         )}>
                            <Calendar className="h-5 w-5 md:h-6 md:w-6" />
                         </div>
                         <div className="min-w-0">
                            <p className="font-black text-[#0F172A] text-sm md:text-xl uppercase tracking-tight leading-tight truncate">{item.title}</p>
                            <p className="text-[8px] md:text-[9px] font-bold text-slate-400 mt-1 md:mt-2 uppercase tracking-widest">{item.month} {item.year}</p>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 text-[8px] md:text-[9px] font-black uppercase px-2 md:px-3 py-1 rounded-lg">
                         {item.type} HUB
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 md:px-10">
                      <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                         <Button variant="ghost" size="icon" className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-slate-50 hover:bg-white hover:text-primary shadow-sm" onClick={() => setEditingItem(item)}>
                          <Edit className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(item.id)}>
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
            <DialogTitle className="text-lg md:text-2xl font-black font-headline uppercase text-[#0F172A] truncate pr-4">CA Hub Configuration</DialogTitle>
            <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0"><X className="h-5 w-5 md:h-6 md:w-6 text-slate-400" /></button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
               {/* Metadata Column */}
               <div className="lg:col-span-3 space-y-4">
                  <Card className="border-none bg-slate-50/50 p-5 rounded-2xl space-y-4 shadow-inner">
                     <p className="text-[9px] font-black uppercase text-primary tracking-[0.3em] ml-1">Package Metadata</p>
                     
                     <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Title</Label>
                        <Input value={editingItem?.title || ""} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="h-10 rounded-lg border-slate-100 bg-white font-black text-sm" />
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                           <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Type</Label>
                           <select value={editingItem?.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})} className="w-full h-10 bg-white border-none rounded-lg px-2 font-black uppercase text-[9px] outline-none shadow-sm">
                              <option value="DAILY">DAILY HUB</option>
                              <option value="WEEKLY">WEEKLY HUB</option>
                              <option value="MONTHLY">MONTHLY HUB</option>
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                           <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Month</Label>
                           <select value={editingItem?.month} onChange={e => setEditingItem({...editingItem, month: e.target.value})} className="w-full h-10 bg-white border-none rounded-lg px-2 font-bold text-[10px] outline-none shadow-sm">
                           {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Year</Label>
                           <Input value={editingItem?.year} onChange={e => setEditingItem({...editingItem, year: e.target.value})} className="h-10 rounded-lg border-none bg-white font-bold shadow-sm text-center" />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">PDF URI</Label>
                        <Input value={editingItem?.pdfUrl || ""} onChange={e => setEditingItem({...editingItem, pdfUrl: e.target.value})} className="h-10 rounded-lg border-none bg-white font-bold text-primary shadow-sm text-[10px]" />
                     </div>
                  </Card>
               </div>

               {/* Quiz Hub */}
               <div className="lg:col-span-9 h-full min-h-[400px]">
                  <Card className="border-none bg-white shadow-xl rounded-2xl p-6 space-y-6 border border-slate-100 h-full flex flex-col">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                        <div className="flex items-center gap-4">
                           <Zap className="h-6 w-6 text-primary" />
                           <div className="text-left">
                              <h4 className="font-headline font-black text-xl uppercase text-[#0F172A]">Bulk Ingestion</h4>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Institutional Ingestion Protocol</p>
                           </div>
                        </div>
                        <Badge className="bg-[#0F172A] text-white border-none font-black px-4 py-1.5 rounded-lg text-[9px] w-fit shadow-lg">{editingItem?.questions?.length || 0} Questions Staged</Badge>
                     </div>

                     <div className="space-y-4 flex flex-col flex-1 min-h-0">
                        <div className="space-y-2 shrink-0">
                           <Textarea 
                              value={bulkText}
                              onChange={e => setBulkText(e.target.value)}
                              placeholder={`Q1. English Question\nPunjabi Question\n(A) Option EN / Option PA\nAnswer: (B)\nExplanation: English rationale\nPunjabi rationale`}
                              className="min-h-[400px] rounded-xl bg-slate-50 border-none p-6 text-sm font-bold shadow-inner resize-none focus-visible:ring-primary"
                           />
                           <Button onClick={handleProcessBulk} disabled={!bulkText.trim()} className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-xl shadow-2xl gap-3 border-none">
                              Process Bulk Extraction <ChevronRight className="h-4 w-4" />
                           </Button>
                        </div>

                        {editingItem?.questions?.length > 0 && (
                           <div className="flex-1 flex flex-col min-h-0 pt-4 border-t border-slate-50">
                              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {editingItem.questions.map((q: any, idx: number) => (
                                       <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 group/q relative transition-all hover:bg-white hover:shadow-lg">
                                          <button onClick={() => { const qs = [...editingItem.questions]; qs.splice(idx, 1); setEditingItem({...editingItem, questions: qs}); }} className="absolute top-3 right-3 text-rose-300 hover:text-rose-50 opacity-0 group-hover/q:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                                          <div className="flex items-center gap-3 mb-2">
                                             <div className="h-5 w-5 rounded-md bg-[#0F172A] text-white flex items-center justify-center font-black text-[8px]">{idx + 1}</div>
                                             <span className="text-[7px] font-black uppercase text-slate-400">VERIFIED</span>
                                          </div>
                                          <p className="font-bold text-[10px] text-[#0F172A] line-clamp-2 leading-snug">{q.englishQuestion}</p>
                                          <div className="mt-2 flex items-center gap-2">
                                             <Badge className="bg-emerald-50 text-emerald-600 border-none text-[7px] font-black">KEY: {q.correctAnswer}</Badge>
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

          <DialogFooter className="px-6 py-4 bg-slate-50 flex flex-row items-center gap-4 shrink-0 border-t border-slate-100">
            <button onClick={() => setEditingItem(null)} className="rounded-xl h-12 px-6 font-black uppercase text-[9px] text-slate-400 hover:text-[#0F172A]">Cancel Draft</button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#0F172A] hover:bg-black text-white h-12 px-10 rounded-xl font-black uppercase text-[9px] tracking-widest flex-1 shadow-xl gap-3 border-none">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4 text-primary fill-current" />} Commit Hub to Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
