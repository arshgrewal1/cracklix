"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  Zap, 
  Loader2, 
  X, 
  Calendar,
  Rocket,
  ChevronRight
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrentAffairHubItem } from "@/types"
import { parseBulkQuestions } from "@/lib/parser"

/**
 * @fileOverview Institutional Current Affairs Hub v25.1.
 * FIXED: Removed uppercase from buttons.
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
     return [...rawCaItems].sort((a: any, b: any) => {
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
      toast({ title: "Extraction Success" });
    } else {
      toast({ variant: "destructive", title: "Parse Failed" });
    }
  };

  const handleSave = async () => {
    if (!db || !editingItem) return
    setIsSaving(true)
    const caId = editingItem.id || `ca-hub-${Date.now()}`
    const caRef = doc(db, "current_affairs_hub", caId)
    
    try {
      await setDoc(caRef, { ...editingItem, id: caId, updatedAt: serverTimestamp() }, { merge: true })
      toast({ title: "Registry Synced" })
      setEditingItem(null)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredItems = useMemo(() => {
    if (!caItems) return []
    return caItems.filter((item: any) => 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [caItems, searchTerm])

  return (
    <div className="space-y-6 md:space-y-10 pb-24 text-left animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-1">
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight leading-tight">Ca Manager</h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg">Coordinate coverage hub.</p>
        </div>
        <Button onClick={() => setEditingItem({ title: "", type: "DAILY", month: "January", year: "2026", status: "PUBLISHED", questions: [], language: "English & Punjabi", duration: 15, positiveMarks: 1, negativeMarks: 0.25 })} className="w-full md:w-auto h-12 md:h-14 px-10 bg-primary hover:bg-blue-700 text-white rounded-full font-bold shadow-xl border-none active:scale-95 gap-3">
          <Plus className="h-5 w-5" /> Initialize Ca Hub
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search archives..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Node Identity</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={2} className="px-6 py-6 md:px-12 md:py-10"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredItems.length > 0 ? filteredItems.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-6 md:px-12 py-5 md:py-10 text-left">
                    <div className="flex items-center gap-4 md:gap-6">
                       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0 shadow-inner">
                          <Calendar className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="font-black text-[#0F172A] text-sm md:text-xl leading-none">{item.title}</p>
                          <p className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.month} {item.year}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                    <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                       <button onClick={() => setEditingItem(item)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                       <button onClick={async () => { if(confirm("Purge node?")) await deleteDoc(doc(db!, "current_affairs_hub", item.id)) }} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={2} className="h-60 md:h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-4">
                         <Zap className="h-16 w-16 md:h-24 md:w-24 text-slate-400" />
                         <p className="font-black text-sm md:text-2xl uppercase tracking-widest">No active archives</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && !isSaving && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[95vw] w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-primary shrink-0" />
          <DialogHeader className="px-6 md:px-10 py-6 shrink-0 flex flex-row items-center justify-between border-b border-slate-50">
            <div className="min-w-0">
               <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Ca Node Architect</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1">Configure bilingual study archives.</DialogDescription>
            </div>
            <button onClick={() => setEditingItem(null)} className="p-2 md:p-3 hover:bg-slate-50 rounded-xl transition-colors"><X className="h-6 w-6 text-slate-400" /></button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-6 md:py-10 space-y-8 md:space-y-12">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                <div className="lg:col-span-4 space-y-6">
                   <div className="space-y-2 text-left">
                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Archive title</Label>
                      <Input value={editingItem?.title || ""} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="h-12 md:h-14 rounded-xl font-bold bg-slate-50 border-none px-5" placeholder="e.g. Current Affairs 01" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-left">
                         <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Type</Label>
                         <select value={editingItem?.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})} className="w-full h-11 md:h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                         </select>
                      </div>
                      <div className="space-y-2 text-left">
                         <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Language</Label>
                         <select value={editingItem?.language} onChange={e => setEditingItem({...editingItem, language: e.target.value})} className="w-full h-11 md:h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                            <option value="English & Punjabi">Bilingual PA</option>
                            <option value="English & Hindi">Bilingual HI</option>
                         </select>
                      </div>
                   </div>
                   <div className="space-y-2 text-left">
                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">PDF Registry link</Label>
                      <Input value={editingItem?.pdfUrl || ""} onChange={e => setEditingItem({...editingItem, pdfUrl: e.target.value})} className="h-11 md:h-12 rounded-xl bg-slate-50 border-none font-mono text-xs text-primary" placeholder="https://..." />
                   </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                   <div className="p-6 md:p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 md:space-y-8 shadow-inner">
                      <div className="flex items-center gap-3">
                         <Zap className="h-5 w-5 text-primary fill-current" />
                         <h4 className="text-lg font-black text-[#0F172A]">Bulk extraction</h4>
                      </div>
                      <Textarea value={bulkText} onChange={e => setBulkText(e.target.value)} className="min-h-[250px] md:min-h-[400px] rounded-2xl bg-white border-none p-6 text-sm font-medium leading-relaxed shadow-sm" placeholder="Paste raw question blocks here..." />
                      <Button onClick={handleProcessBulk} className="w-full h-14 bg-[#0F172A] hover:bg-black text-white font-bold rounded-xl gap-2 active:scale-95 border-none shadow-lg">
                         Initialize extraction <ChevronRight className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
             </div>
          </div>

          <DialogFooter className="px-6 md:px-10 py-6 md:py-8 bg-slate-50 flex flex-row items-center gap-4 border-t border-slate-100 shrink-0">
            <Button variant="ghost" onClick={() => setEditingItem(null)} className="h-11 md:h-12 px-6 font-bold text-xs text-slate-400">Discard</Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-11 md:h-14 bg-primary hover:bg-blue-700 text-white font-bold rounded-full shadow-xl gap-2 active:scale-95 border-none">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} Commit to Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
