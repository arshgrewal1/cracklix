"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit, Search, Loader2, GraduationCap, Save, Star, Activity, Users, Zap } from "lucide-material"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, setDoc, serverTimestamp, orderBy, updateDoc } from "firebase/firestore"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"

/**
 * @fileOverview Exam Vertical Registry v16.0 (Metrics Sync).
 * UPDATED: Added fields for totalMocks and studentCount for original data sync.
 */

export default function ExamRegistryPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [editingExam, setEditingExam] = useState<any>(null)

  const examsQuery = useMemo(() => (db ? query(collection(db, "exams"), orderBy("name", "asc")) : null), [db]);
  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]);
  const catsQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]);

  const { data: rawExams, loading } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: categories } = useCollection<any>(catsQuery)

  const filteredExams = useMemo(() => {
    if (!rawExams) return []
    return rawExams.filter(e => 
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.boardId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [rawExams, searchTerm])

  const handleSaveExam = async () => {
    if (!db || !editingExam.name || !editingExam.boardId || !editingExam.categoryId) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Configuration incomplete." })
       return
    }
    setIsSaving(true)
    const id = editingExam.id || editingExam.name.toLowerCase().replace(/\s+/g, '-')
    try {
      await setDoc(doc(db, "exams", id), { 
        ...editingExam, 
        id, 
        isTrending: editingExam.isTrending || false,
        updatedAt: serverTimestamp(),
        createdAt: editingExam.createdAt || serverTimestamp()
      }, { merge: true })
      toast({ title: "Vertical Synced" })
      setEditingExam(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally { 
      setIsSaving(false) 
    }
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
    <div className="space-y-10 md:space-y-16 text-left pb-32 animate-in fade-in duration-700 pt-2">
      
      <AdminPageHeader
        icon={GraduationCap}
        label="Recruitment Vertical Registry"
        title="Exam Registry"
        subtitle="Manage specific exam verticals and Home Page trending items."
        actionLabel="Register Vertical"
        actionIcon={Plus}
        onAction={() => setEditingExam({ name: "", boardId: "", categoryId: "", displayOrder: 1, isTrending: false, totalMocks: "40+", studentCount: "12K+" })}
      />

      <div className="max-w-2xl">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search verticals by name..."
        />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-20">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Vertical Identity</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Authority Board</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center text-slate-400">Metrics</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={5} columns={4} />
              ) : filteredExams.length > 0 ? filteredExams.map((e) => {
                const board = boards?.find((b: any) => b.id === e.boardId || b.abbreviation === e.boardId);
                return (
                  <TableRow key={e.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-8 md:px-12 py-6 md:py-10">
                      <div className="flex items-center gap-4 md:gap-8">
                        <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                           <GraduationCap className="h-5 w-5 md:h-7 md:w-7 text-slate-300" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-[#0F172A] text-sm md:text-xl leading-tight truncate">{e.name}</p>
                           <code className="text-[8px] md:text-[10px] font-mono text-slate-300 mt-1.5 block tracking-tighter truncate">Id: {e.id}</code>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="outline" className="bg-primary/5 border-none text-primary text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm w-fit">
                          {board?.abbreviation || e.boardId || 'None'} Hub
                        </Badge>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-1">Official Registry</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          <span className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> {e.totalMocks || "0"}</span>
                          <span className="flex items-center gap-1.5"><Users className="h-3 w-3 text-blue-500" /> {e.studentCount || "0"}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-8 md:px-12">
                      <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => toggleTrending(e.id, !!e.isTrending)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-all">
                          <Star className={cn("h-5 w-5", e.isTrending ? "text-amber-500 fill-current" : "text-slate-200")} />
                        </button>
                        <button onClick={() => setEditingExam(e)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={async () => { if (confirm("Permanently purge this vertical node?")) await deleteDoc(doc(db!, "exams", e.id)) }} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-80 text-center">
                       <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                          <Activity className="h-20 w-20 text-slate-400" />
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
        open={!!editingExam}
        onOpenChange={(o) => !o && setEditingExam(null)}
        title="Vertical Architect"
        description="Configure specific recruitment vertical metadata for the registry."
        isSaving={isSaving}
        onSave={handleSaveExam}
        onDiscard={() => setEditingExam(null)}
        saveLabel="Commit Node"
      >
         <div className="space-y-6">
            <div className="space-y-1.5 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Assigned Board Hub</Label>
               <Select value={editingExam?.boardId || ""} onValueChange={(v) => setEditingExam({...editingExam, boardId: v})}>
                  <SelectTrigger className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none font-bold px-6 shadow-inner text-[#0F172A]">
                     <SelectValue placeholder="Select Authority" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B1528] border-white/10 text-white">
                     {boards?.map((b: any) => <SelectItem key={b.id} value={b.id} className="cursor-pointer">{b.abbreviation} Hub</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>
            
            <div className="space-y-1.5 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Relational Category</Label>
               <Select value={editingExam?.categoryId || ""} onValueChange={(v) => setEditingExam({...editingExam, categoryId: v})}>
                  <SelectTrigger className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none font-bold px-6 shadow-inner text-[#0F172A]">
                     <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B1528] border-white/10 text-white">
                     {categories?.map((c: any) => <SelectItem key={c.id} value={c.id} className="cursor-pointer">{c.title}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>

            <div className="space-y-1.5 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Vertical Name</Label>
               <Input 
                 value={editingExam?.name ?? ""} 
                 onChange={e => setEditingExam({...editingExam, name: e.target.value})} 
                 className="h-14 md:h-18 rounded-xl md:rounded-2xl border-none bg-slate-50 font-bold text-base md:text-xl px-6 shadow-inner" 
                 placeholder="e.g. Constable District Cadre" 
               />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Total Mocks (Label)</Label>
                  <Input 
                    value={editingExam?.totalMocks ?? ""} 
                    onChange={e => setEditingExam({...editingExam, totalMocks: e.target.value})} 
                    className="h-12 rounded-xl border-none bg-slate-50 font-black text-center" 
                    placeholder="40+" 
                  />
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Student Count (Label)</Label>
                  <Input 
                    value={editingExam?.studentCount ?? ""} 
                    onChange={e => setEditingExam({...editingExam, studentCount: e.target.value})} 
                    className="h-12 rounded-xl border-none bg-slate-50 font-black text-center" 
                    placeholder="12K+" 
                  />
               </div>
            </div>

            <div className="flex items-center justify-between p-6 md:p-8 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-inner">
               <div className="space-y-1">
                  <p className="text-[11px] md:text-sm font-black text-[#0F172A] uppercase">Home Page Promotion</p>
                  <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Show in Trending Vertical hub</p>
               </div>
               <Switch checked={editingExam?.isTrending || false} onCheckedChange={v => setEditingExam({...editingExam, isTrending: v})} />
            </div>
         </div>
      </AdminDialogShell>
    </div>
  )
}
