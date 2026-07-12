
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Building2, Save, Loader2 } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, setDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { AuthorityLogo } from "@/lib/exam-icons"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * @fileOverview Authority Hub CMS v15.0 (Standardized & Hardened).
 * FIXED: Removed problematic module-level imports to resolve initialization crash.
 */

export default function ExamManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [editingBoard, setEditingBoard] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db])
  const categoriesQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db])
  
  const { data: boards, loading } = useCollection<any>(boardsQuery)
  const { data: categories } = useCollection<any>(categoriesQuery)
  
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
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently purge this authority hub?")) return
    await deleteDoc(doc(db, "boards", id))
    toast({ title: "Hub Purged" })
  }

  return (
    <div className="space-y-10 md:space-y-16 text-left pb-32 animate-in fade-in duration-700 pt-2">
      
      <AdminPageHeader
        icon={Building2}
        label="Institutional Board Registry"
        title="Authority Hub"
        subtitle="Manage official board nodes and their primary logos."
        actionLabel="Deploy Hub"
        actionIcon={Plus}
        onAction={() => setEditingBoard({ abbreviation: "", name: "", iconUrl: "", categoryId: "", displayOrder: (boards?.length || 0) + 1 })}
      />

      <div className="max-w-2xl">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search authorities by code or name..."
        />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-24">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Hub Identity</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Category Context</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={5} columns={3} />
              ) : filteredBoards.length > 0 ? filteredBoards.map((board: any) => (
                <TableRow key={board.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-8 md:px-12 py-6 md:py-10">
                    <div className="flex items-center gap-5 md:gap-8">
                      <AuthorityLogo board={board} size="md" className="h-12 w-12 md:h-16 md:w-16 bg-slate-50 p-2 rounded-xl shadow-inner group-hover:scale-105 transition-transform shrink-0" />
                      <div className="min-w-0 text-left">
                         <p className="font-black text-primary text-base md:text-2xl leading-none uppercase">{board.abbreviation}</p>
                         <p className="text-[10px] md:text-[13px] font-bold text-slate-400 mt-2 truncate max-w-[200px] md:max-w-md uppercase tracking-tight">{board.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col gap-1.5">
                        <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded shadow-sm w-fit uppercase tracking-widest">
                           {categories?.find((c: any) => c.id === board.categoryId)?.title || "General Registry"}
                        </Badge>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-1">Official Hub</p>
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                    <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                       <button onClick={() => setEditingBoard(board)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                       <button onClick={() => handleDelete(board.id)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={3} className="h-80 text-center">
                       <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                          <Building2 className="h-20 w-20 text-slate-400" />
                          <p className="font-black text-2xl uppercase tracking-[0.3em]">Registry Empty</p>
                       </div>
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminDialogShell
        open={!!editingBoard}
        onOpenChange={(open) => !open && !isSaving && setEditingBoard(null)}
        title="Authority Architect"
        description="Configure official board identity node for the master registry."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingBoard(null)}
        saveLabel="Commit Hub"
      >
         <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-1.5 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Short Code</Label>
               <Input value={editingBoard?.abbreviation || ""} onChange={e => setEditingBoard({...editingBoard, abbreviation: e.target.value.toUpperCase()})} className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-black uppercase px-5 shadow-inner text-primary" placeholder="E.G. PSSSB" />
            </div>
            <div className="space-y-1.5 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Display Order</Label>
               <Input type="number" value={editingBoard?.displayOrder || ""} onChange={e => setEditingBoard({...editingBoard, displayOrder: parseInt(e.target.value) || 0})} className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-black text-center shadow-inner" />
            </div>
         </div>
         <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Full Hub Name</Label>
            <Input value={editingBoard?.name || ""} onChange={e => setEditingBoard({...editingBoard, name: e.target.value})} className="h-14 md:h-18 rounded-xl md:rounded-2xl border-none bg-slate-50 font-bold px-6 shadow-inner text-base md:text-xl" placeholder="e.g. Subordinate Selection Board" />
         </div>
         <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Logo URL (PNG/SVG Node)</Label>
            <Input value={editingBoard?.iconUrl || ""} onChange={e => setEditingBoard({...editingBoard, iconUrl: e.target.value})} className="h-11 md:h-12 rounded-xl bg-slate-50 border-none font-mono text-[10px] md:text-xs text-primary px-5 shadow-inner" placeholder="https://..." />
         </div>
         <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Vertical Category Hub</Label>
            <Select value={editingBoard?.categoryId || ""} onValueChange={(v) => setEditingBoard({...editingBoard, categoryId: v})}>
               <SelectTrigger className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none font-bold px-6 shadow-inner text-[#0F172A]">
                  <SelectValue placeholder="Select Parent Category" />
               </SelectTrigger>
               <SelectContent className="bg-[#0B1528] border-white/10 text-white">
                  {categories?.map((c: any) => (
                     <SelectItem key={c.id} value={c.id} className="focus:bg-primary/20 cursor-pointer">
                        {c.title}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>
      </AdminDialogShell>
    </div>
  )
}
