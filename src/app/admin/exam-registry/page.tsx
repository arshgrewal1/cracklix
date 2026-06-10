
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Search, Loader2, Landmark, GraduationCap, Save, Shield, Zap, SearchCode, Star } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, setDoc, serverTimestamp, orderBy, updateDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Exam Vertical Registry v11.0.
 * UPDATED: Added "Trending" governance for Home Page discovery.
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
    <div className="space-y-10 pb-32 text-left pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Recruitment Vertical Registry</span>
           </div>
          <h1 className="text-4xl md:text-6xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Exam Registry</h1>
          <p className="text-slate-500 font-medium text-lg">Manage specific exam verticals and Home Page trending items.</p>
        </div>
        <Button onClick={() => setEditingExam({ name: "", boardId: "", categoryId: "", displayOrder: 1, isTrending: false })} className="bg-[#0F172A] hover:bg-black text-white h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-3xl gap-3 transition-all active:scale-95 border-none">
          <Plus className="h-5 w-5 text-primary" /> Register New Vertical
        </Button>
      </div>

      <div className="px-4">
        <div className="relative group max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            className="h-16 pl-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-lg font-medium" 
            placeholder="Search verticals by name..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Vertical Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Authority Board</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Trending</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Audit Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredExams.map((e) => {
                const board = boards?.find((b: any) => b.id === e.boardId || b.abbreviation === e.boardId);
                return (
                  <TableRow key={e.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                           <GraduationCap className="h-6 w-6 text-slate-300" />
                        </div>
                        <div>
                           <p className="font-black text-[#0F172A] text-xl uppercase tracking-tight leading-none">{e.name}</p>
                           <code className="text-[9px] font-mono text-slate-400 mt-2 block uppercase tracking-widest">ID: {e.id}</code>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/5 border-none text-primary text-[8px] font-black uppercase px-3 py-1 rounded-lg">
                        {board?.abbreviation || e.boardId || 'NONE'} HUB
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <button onClick={() => toggleTrending(e.id, !!e.isTrending)} className="focus:outline-none">
                          <Star className={cn("h-6 w-6 transition-all", e.isTrending ? "text-amber-500 fill-current" : "text-slate-200 hover:text-amber-200")} />
                       </button>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setEditingExam(e)}><Edit className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="hover:text-rose-600" onClick={async () => { if (confirm("Purge?")) await deleteDoc(doc(db!, "exams", e.id)) }}><Trash2 className="h-5 w-5" /></Button>
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
         <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A]" />
            <DialogHeader className="p-10 pb-0">
               <DialogTitle className="text-2xl font-black font-headline uppercase">Vertical Architect</DialogTitle>
            </DialogHeader>
            <div className="p-10 space-y-6">
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Assigned Board Hub</Label>
                  <select value={editingExam?.boardId || ""} onChange={e => setEditingExam({...editingExam, boardId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                     <option value="">Select Hub</option>
                     {boards?.map((b:any) => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
                  </select>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Relational Category</Label>
                  <select value={editingExam?.categoryId || ""} onChange={e => setEditingExam({...editingExam, categoryId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                     <option value="">Select Category</option>
                     {categories?.map((c:any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Vertical Name</Label>
                  <Input value={editingExam?.name ?? ""} onChange={e => setEditingExam({...editingExam, name: e.target.value})} className="h-12 rounded-xl font-bold" placeholder="e.g. Constable District Cadre" />
               </div>

               <div className="flex items-center justify-between p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-amber-900">Show in Trending Hubs</p>
                     <p className="text-[8px] font-bold text-amber-700 uppercase tracking-widest">Displays vertical on Home Page</p>
                  </div>
                  <Switch checked={editingExam?.isTrending} onCheckedChange={v => setEditingExam({...editingExam, isTrending: v})} />
               </div>
            </div>
            <DialogFooter className="p-10 pt-0">
               <Button onClick={handleSaveExam} disabled={isSaving} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Vertical Node
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
