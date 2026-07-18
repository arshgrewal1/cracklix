"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  Loader2, 
  Zap,
  Lock,
  Unlock,
  Landmark,
  Settings,
  Layers,
  Activity,
  CheckCircle2,
  XCircle,
  Copy,
  MoveHorizontal,
  Filter,
  RefreshCw,
  AlertTriangle,
  FolderTree,
  MoreVertical,
  X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, deleteDoc, doc, setDoc, serverTimestamp, query, orderBy, where, writeBatch } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton } from "@/components/admin"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

/**
 * @fileOverview Master Mock Governance Center v3.1 [Audit Fixed].
 * FIXED: Added missing Label import.
 * IMPLEMENTED: Bulk Move, Duplication, and Hierarchy Filtering.
 */

export default function MockManagement() {
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [subFilter, setSubFilter] = useState("all")
  const [serFilter, setSerFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Dialog States
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false)
  const [moveTarget, setMoveTarget] = useState({ subjectId: "", seriesId: "" })

  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), orderBy("createdAt", "desc")) : null), [db])
  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), orderBy("displayOrder", "asc")) : null), [db])
  const seriesQuery = useMemo(() => (db ? query(collection(db, "test_series"), orderBy("displayOrder", "asc")) : null), [db])

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: subjects } = useCollection<any>(subjectsQuery)
  const { data: allSeries } = useCollection<any>(seriesQuery)

  const filteredMocks = useMemo(() => {
    if (!rawMocks) return []
    return rawMocks.filter(m => {
      const matchesSearch = !searchTerm || m.title?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSub = subFilter === "all" || m.learningSubjectId === subFilter
      const matchesSer = serFilter === "all" || m.seriesId === serFilter
      return matchesSearch && matchesSub && matchesSer
    })
  }, [rawMocks, searchTerm, subFilter, serFilter])

  const filteredSeriesOptions = useMemo(() => {
     if (!allSeries) return []
     if (moveTarget.subjectId && moveTarget.subjectId !== 'all') {
        return allSeries.filter((s: any) => s.subjectId === moveTarget.subjectId)
     }
     return allSeries
  }, [allSeries, moveTarget.subjectId])

  const handleDuplicate = async (mock: any) => {
     if (!db) return
     setIsProcessing(true)
     const newId = `mock-${Date.now()}`
     try {
        const { id, createdAt, updatedAt, ...cloneData } = mock
        await setDoc(doc(db, "mocks", newId), {
           ...cloneData,
           id: newId,
           title: `${cloneData.title} (Copy)`,
           published: false,
           status: 'DRAFT',
           createdAt: serverTimestamp(),
           updatedAt: serverTimestamp()
        })
        toast({ title: "Series Duplicated", description: "Cloned node saved as Draft." })
     } finally { setIsProcessing(false) }
  }

  const handleBulkMove = async () => {
     if (!db || selectedIds.length === 0 || !moveTarget.subjectId) return
     setIsProcessing(true)
     const batch = writeBatch(db)
     
     selectedIds.forEach(id => {
        batch.update(doc(db, "mocks", id), {
           learningSubjectId: moveTarget.subjectId,
           seriesId: moveTarget.seriesId || "uncategorized",
           updatedAt: serverTimestamp()
        })
     })

     try {
        await batch.commit()
        toast({ title: "Bulk Move Successful", description: `${selectedIds.length} tests re-mapped.` })
        setIsBulkMoveOpen(false)
        setSelectedIds([])
     } finally { setIsProcessing(false) }
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently purge this test node?")) return
    await deleteDoc(doc(db, "mocks", id))
    toast({ title: "Node Purged" })
  }

  return (
    <div className="space-y-8 pb-32 text-left animate-in fade-in duration-700 pt-2">
      <AdminPageHeader
        icon={Layers}
        label="Hierarchical Test Governance"
        title="Mock Manager"
        subtitle="Manage the Subject -> Series -> Test preparation tree."
        actionLabel="Build New Test"
        actionIcon={Plus}
        actionHref="/admin/mocks/builder"
      />

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-6 border border-slate-50">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
               <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Filter Subject</Label>
               <select value={subFilter} onChange={e => { setSubFilter(e.target.value); setSerFilter('all'); }} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none text-[#0F172A]">
                  <option value="all">All Subjects</option>
                  {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
            </div>
            <div className="space-y-1.5">
               <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Filter Series</Label>
               <select value={serFilter} onChange={e => setSerFilter(e.target.value)} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none text-[#0F172A]" disabled={subFilter === 'all'}>
                  <option value="all">All Series Hubs</option>
                  {allSeries?.filter((s: any) => s.subjectId === subFilter).map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
               </select>
            </div>
            <div className="space-y-1.5">
               <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Search Registry</Label>
               <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-12 bg-slate-50 border-none rounded-xl font-bold" placeholder="Search by title..." />
            </div>
         </div>
      </Card>

      <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-14 border-slate-100">
                <TableHead className="w-16 px-6 text-center">
                  <Checkbox 
                    checked={selectedIds.length === filteredMocks.length && filteredMocks.length > 0} 
                    onCheckedChange={(c) => setSelectedIds(c ? filteredMocks.map(m => m.id) : [])} 
                  />
                </TableHead>
                <TableHead className="px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Test Node</TableHead>
                <TableHead className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hierarchy Hub</TableHead>
                <TableHead className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</TableHead>
                <TableHead className="text-right px-10 text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mocksLoading ? (
                <AdminTableSkeleton rows={8} columns={5} />
              ) : filteredMocks.length > 0 ? filteredMocks.map((mock) => {
                const sub = subjects?.find(s => s.id === mock.learningSubjectId)
                const ser = allSeries?.find(s => s.id === mock.seriesId)
                
                return (
                  <TableRow key={mock.id} className={cn("hover:bg-slate-50 border-slate-50 transition-all group", selectedIds.includes(mock.id) && "bg-primary/5")}>
                    <TableCell className="px-6 text-center">
                      <Checkbox checked={selectedIds.includes(mock.id)} onCheckedChange={(c) => setSelectedIds(p => c ? [...p, mock.id] : p.filter(x => x !== mock.id))} />
                    </TableCell>
                    <TableCell className="px-6 py-6 text-left">
                       <div className="space-y-1">
                          <p className="font-bold text-[#0F172A] text-sm md:text-base leading-snug line-clamp-1">{mock.title}</p>
                          <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-[7px] border-slate-200 text-slate-400 uppercase font-black">{mock.mockType}</Badge>
                             <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">ID: {mock.id.slice(-6)}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-1 text-left">
                          <div className="flex items-center gap-2">
                             <Landmark className="h-3 w-3 text-primary" />
                             <span className="text-[10px] font-bold text-[#0F172A] uppercase">{sub?.name || 'Uncategorized'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Layers className="h-3 w-3 text-slate-300" />
                             <span className="text-[10px] font-medium text-slate-400 uppercase">{ser?.title || 'No Series'}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className={cn("border-none text-[8px] font-black uppercase px-2 py-0.5", mock.published ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                          {mock.published ? 'Live' : 'Draft'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white shadow-sm" asChild>
                             <Link href={`/admin/mocks/builder?id=${mock.id}`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          <button onClick={() => handleDuplicate(mock)} className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 active:scale-90 transition-all"><Copy className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(mock.id)} className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-4 w-4" /></button>
                       </div>
                    </TableCell>
                  </TableRow>
                )
              }) : (
                 <TableRow>
                    <TableCell colSpan={5} className="h-96 text-center">
                       <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                          <Layers className="h-20 w-20 text-slate-400" />
                          <p className="font-black text-2xl uppercase tracking-[0.4em]">Vault Empty</p>
                       </div>
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* BULK ACTION BAR */}
      <AnimatePresence>
         {selectedIds.length > 0 && (
            <motion.div 
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-2xl"
            >
               <div className="bg-[#0F172A] text-white p-5 rounded-[2.5rem] shadow-5xl flex items-center justify-between border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-4 ml-2">
                     <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">{selectedIds.length}</div>
                     <p className="text-[11px] font-black uppercase tracking-widest">Tests selected</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button onClick={() => setIsBulkMoveOpen(true)} className="h-11 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-[10px] uppercase gap-2 border border-white/5"><MoveHorizontal className="h-4 w-4" /> Move Hub</Button>
                     <Button onClick={async () => { if(confirm("Bulk purge selected nodes?")) { setIsProcessing(true); const b = writeBatch(db!); selectedIds.forEach(id => b.delete(doc(db!, "mocks", id))); await b.commit(); setSelectedIds([]); setIsProcessing(false); toast({ title: "Bulk Purge Complete" }); } }} className="h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[10px] uppercase gap-2 border-none shadow-lg"><Trash2 className="h-4 w-4" /> Purge</Button>
                     <button onClick={() => setSelectedIds([])} className="p-3 text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* BULK MOVE DIALOG */}
      <Dialog open={isBulkMoveOpen} onOpenChange={setIsBulkMoveOpen}>
         <DialogContent className="sm:max-w-md rounded-[3rem] bg-white border-none shadow-5xl p-10 text-left">
            <DialogHeader className="space-y-2">
               <DialogTitle className="text-2xl font-black uppercase text-[#0F172A]">Hierarchy Transfer</DialogTitle>
               <DialogDescription className="text-slate-400 font-medium">Re-map {selectedIds.length} nodes to a different preparation hub.</DialogDescription>
            </DialogHeader>
            <div className="py-8 space-y-6">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Subject</Label>
                  <select value={moveTarget.subjectId} onChange={e => setMoveTarget({...moveTarget, subjectId: e.target.value, seriesId: ""})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner text-[#0F172A]">
                     <option value="">Select Target Hub</option>
                     {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Series (Level 2)</Label>
                  <select value={moveTarget.seriesId} onChange={e => setMoveTarget({...moveTarget, seriesId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner text-[#0F172A]" disabled={!moveTarget.subjectId}>
                     <option value="">Uncategorized</option>
                     {filteredSeriesOptions.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
               </div>
            </div>
            <DialogFooter>
               <Button onClick={handleBulkMove} disabled={isProcessing || !moveTarget.subjectId} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />} Authorize Transfer
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
