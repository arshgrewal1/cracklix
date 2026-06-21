"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Search, Loader2, GraduationCap, Save, Star } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, setDoc, serverTimestamp, orderBy, updateDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Exam Vertical Registry v13.0 (PWA Optimized).
 * FIXED: Systematically removed all forced uppercase to match student home page aesthetic.
 */

export default function ExamRegistryPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [editingExam, setEditingExam] = useState<any>(null)

  const examsQuery = useMemo(() => (db ? collection(db, "exams") : null), [db]);
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db]);
  const catsQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]);

  const { data: rawExams, loading } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: categories } = useCollection<any>(catsQuery)

  const filteredExams = useMemo(() => {
    if (!rawExams) return []
    return rawExams.filter(e => 
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.boardId?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name))
  }, [rawExams, searchTerm])

  const handleSaveExam = async () => {
    if (!db || !editingExam.name || !editingExam.boardId || !editingExam.categoryId) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Config incomplete." })
       return
    }
    setIsSaving(true)
    const id = editingExam.id || editingExam.name.toLowerCase().replace(/\s+/g, '-')
    try {
      await setDoc(doc(db, "exams", id), { 
        ...editingExam, 
        id, 
        isTrending: editingExam.isTrending || false,
        updatedAt: serverTimestamp() 
      }, { merge: true })
      toast({ title: "Vertical Synced" })
      setEditingExam(null)
    } finally { setIsSaving(false) }
  }

  const toggleTrending = async (id: string, current: boolean) => {
    if (!db) return;
    try {
       await updateDoc(doc(db, "exams", id), { isTrending: !current, updatedAt: serverTimestamp() });
       toast({ title: "Discovery Updated", description: current ? "Removed from Trending" : "Added to Trending Hub" });
    } catch (e) {
       toast({ variant: "destructive", title: "Sync Failed" });
    }
  }

  return (
    <div className="space-y-6 md:space-y-12 pb-32 text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black text-slate-400 tracking-tight">Recruitment Vertical Registry</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">Exam Registry</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Manage specific exam verticals and Home Page trending items.</p>
        </div>
        <Button onClick={() => setEditingExam({ name: "", boardId: "", categoryId: "", displayOrder: 1, isTrending: false })} className="w-full md:w-auto h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3">
          <Plus className="h-4 w-4" /> Register Vertical
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search verticals by name..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black tracking-tight text-slate-400">Vertical Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black tracking-tight text-slate-400">Authority Board</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black tracking-tight text-center text-slate-400">Trending</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black tracking-tight text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-6 py-6 md:px-12 md:py-8"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredExams.map((e) => {
                const board = boards?.find((b: any) => b.id === e.boardId || b.abbreviation === e.boardId);
                return (
                  <TableRow key={e.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-6 md:px-12 py-5 md:py-8">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                           <GraduationCap className="h-5 w-5 text-slate-300" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{e.name}</p>
                           <code className="text-[8px] font-mono text-slate-300 mt-1 block tracking-tighter truncate">Id: {e.id}</code>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/5 border-none text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                        {board?.abbreviation || e.boardId || 'NONE'} Hub
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <button onClick={() => toggleTrending(e.id, !!e.isTrending)} className="focus:outline-none active:scale-90 transition-all">
                          <Star className={cn("h-5 w-5 md:h-6 md:w-6 transition-all", e.isTrending ? "text-amber-500 fill-current" : "text-slate-200 hover:text-amber-200")} />
                       </button>
                    </TableCell>
                    <TableCell className="text-right px-6 md:px-12">
                      <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingExam(e)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90"><Edit className="h-4 w-4" /></button>
                        <button onClick={async () => { if (confirm("Purge?")) await deleteDoc(doc(db!, "exams", e.id)) }} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingExam} onOpenChange={o => !o && setEditingExam(null)}>
         <DialogContent className="sm:max-w-xl w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
               <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Vertical Architect</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1">Configure recruitment vertical metadata.</DialogDescription>
            </DialogHeader>
            <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
               <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Assigned Board Hub</Label>
                  <select value={editingExam?.boardId || ""} onChange={e => setEditingExam({...editingExam, boardId: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                     <option value="" disabled>Select Hub</option>
                     {boards?.map((b:any) => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
                  </select>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Relational Category</Label>
                  <select value={editingExam?.categoryId || ""} onChange={e => setEditingExam({...editingExam, categoryId: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                     <option value="" disabled>Select Category</option>
                     {categories?.map((c:any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Vertical Name</Label>
                  <Input value={editingExam?.name ?? ""} onChange={e => setEditingExam({...editingExam, name: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold" placeholder="e.g. Constable District Cadre" />
               </div>

               <div className="flex items-center justify-between p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-[#0F172A]">Show in Trending</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Displays vertical on Home Page</p>
                  </div>
                  <Switch checked={editingExam?.isTrending} onCheckedChange={v => setEditingExam({...editingExam, isTrending: v})} />
               </div>
            </div>
            <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4">
               <Button variant="ghost" onClick={() => setEditingExam(null)} className="h-11 md:h-12 px-6 font-black text-[10px] text-slate-400">Discard</Button>
               <Button onClick={handleSaveExam} disabled={isSaving} className="flex-1 h-11 md:h-14 bg-primary hover:bg-blue-700 text-white font-black text-[10px] tracking-widest rounded-full shadow-xl border-none active:scale-95 gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Node
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
