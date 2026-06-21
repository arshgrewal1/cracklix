"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Save, Loader2, Landmark, Search, Building2, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, setDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Authority Hub CMS v12.0 (PWA Sync).
 * FIXED: Removed uppercase from headers and refactored to high-density Title Case.
 */

export default function ExamManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("displayOrder", "asc")) : null), [db])
  const categoriesQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db])
  
  const { data: boards, loading } = useCollection<any>(boardsQuery)
  const { data: categories } = useCollection<any>(categoriesQuery)
  
  const [editingBoard, setEditingBoard] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const filteredBoards = useMemo(() => {
    if (!boards) return []
    return boards.filter(b => 
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [boards, searchTerm])

  const handleSave = async () => {
    if (!db || !editingBoard) return
    if (!editingBoard.abbreviation || !editingBoard.name || !editingBoard.categoryId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Short Code, Name, and Category are mandatory." })
      return
    }

    setIsSaving(true)
    const boardId = editingBoard.id || `board-${Date.now()}`
    try {
      await setDoc(doc(db, "boards", boardId), { 
        ...editingBoard, 
        id: boardId,
        updatedAt: serverTimestamp()
      }, { merge: true })
      toast({ title: "Authority Hub Synced" })
      setEditingBoard(null)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-12 pb-32 text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Institutional Board Registry</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">Authority Hub</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Manage official board nodes and their primary logos.</p>
        </div>
        <Button onClick={() => setEditingBoard({ abbreviation: "", name: "", iconUrl: "", categoryId: "", displayOrder: (boards?.length || 0) + 1 })} className="w-full md:w-auto h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3">
          <Plus className="h-4 w-4" /> Deploy Hub
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search authorities..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Hub Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Category</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-6 py-6 md:px-12 md:py-8"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredBoards.map((board: any) => (
                <TableRow key={board.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-6 md:px-12 py-5 md:py-8">
                    <div className="flex items-center gap-4 md:gap-6">
                      <AuthorityLogo board={board} size="md" className="h-10 w-10 md:h-14 md:w-14 bg-slate-50 p-2 rounded-xl shadow-inner group-hover:scale-105 transition-transform" />
                      <div className="min-w-0">
                         <p className="font-black text-primary text-sm md:text-xl leading-none uppercase">{board.abbreviation}</p>
                         <p className="text-[9px] md:text-xs font-bold text-slate-500 mt-1 truncate max-w-[200px] md:max-w-md">{board.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                        {categories?.find((c: any) => c.id === board.categoryId)?.title || "GENERAL"} HUB
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                    <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                       <button onClick={() => setEditingBoard(board)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90"><Edit className="h-5 w-5" /></button>
                       <button onClick={async () => { if(confirm("Purge hub?")) await deleteDoc(doc(db!, "boards", board.id)) }} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingBoard} onOpenChange={(open) => !open && !isSaving && setEditingBoard(null)}>
        <DialogContent className="sm:max-w-xl w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-[#0F172A] shrink-0" />
          <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
             <div className="flex justify-between items-center">
                <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Authority Architect</DialogTitle>
                <button onClick={() => setEditingBoard(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
             </div>
             <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1">Configure official board identity node.</DialogDescription>
          </DialogHeader>
          <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
             <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5 text-left">
                   <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Short Code</Label>
                   <Input value={editingBoard?.abbreviation || ""} onChange={e => setEditingBoard({...editingBoard, abbreviation: e.target.value.toUpperCase()})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-black uppercase px-5" placeholder="e.g. PSSSB" />
                </div>
                <div className="space-y-1.5 text-left">
                   <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Full Hub Name</Label>
                   <Input value={editingBoard?.name || ""} onChange={e => setEditingBoard({...editingBoard, name: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold px-5" placeholder="e.g. Subordinate Selection" />
                </div>
             </div>
             <div className="space-y-1.5 text-left">
                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Logo URL (PNG/SVG Node)</Label>
                <Input value={editingBoard?.iconUrl || ""} onChange={e => setEditingBoard({...editingBoard, iconUrl: e.target.value})} className="h-11 md:h-12 rounded-xl bg-slate-50 border-none font-mono text-xs text-primary px-5" placeholder="https://..." />
             </div>
             <div className="space-y-1.5 text-left">
                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Vertical Category</Label>
                <select value={editingBoard?.categoryId || ""} onChange={e => setEditingBoard({...editingBoard, categoryId: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-5 font-bold text-sm outline-none shadow-inner">
                   <option value="" disabled>Select Category</option>
                   {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
             </div>
          </div>
          <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4 shrink-0">
            <Button variant="ghost" onClick={() => setEditingBoard(null)} className="h-11 md:h-12 px-6 font-black uppercase text-[10px] text-slate-400">Discard</Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-11 md:h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-full shadow-xl border-none active:scale-95 gap-2">
              {isSaving ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Save className="h-3 w-3 md:h-4 md:w-4" />} Commit Hub
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
