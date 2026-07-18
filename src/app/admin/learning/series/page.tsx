"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, Layers, Search, Loader2, Image as ImageIcon, ChevronRight, Zap } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, orderBy, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { TestSeries, Subject, Board } from "@/types"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { useFirestoreCrud } from "@/hooks/useFirestoreCrud"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Level 2 CMS: Series Registry Hub v3.0 [Board Branding Fix].
 * UPDATED: Replaced custom image upload with official Board Logo selection for better standardization.
 */

export default function SeriesCMS() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [editingSeries, setEditingSeries] = useState<any>(null)

  // Fetch all subjects without strict DB ordering to prevent hidden nodes
  const { data: rawSubjects } = useCollection<Subject>(useMemo(() => (db ? collection(db, "subjects") : null), [db]));
  const { data: boards } = useCollection<Board>(useMemo(() => (db ? collection(db, "boards") : null), [db]));
  
  const seriesQuery = useMemo(() => (db ? query(collection(db, "test_series"), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: rawSeries, loading } = useCollection<TestSeries>(seriesQuery as any);

  const subjects = useMemo(() => {
     if (!rawSubjects) return [];
     return [...rawSubjects].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [rawSubjects]);

  const { isSaving, saveDocument, deleteDocument } = useFirestoreCrud({
    db,
    collectionName: "test_series",
    toastMessages: { saveSuccess: "Series hub synced" }
  });

  const handleSave = async () => {
     if (!editingSeries?.title || !editingSeries?.subjectId) {
        toast({ variant: "destructive", title: "Audit blocked", description: "Title and Subject are mandatory." });
        return;
     }
     const id = editingSeries.id || `series-${Date.now()}`;
     await saveDocument(
       { ...editingSeries, displayOrder: parseInt(editingSeries.displayOrder) || 0 },
       { id, onSuccess: () => setEditingSeries(null) }
     );
  }

  const filteredSeries = useMemo(() => {
     if (!rawSeries) return [];
     return rawSeries.filter(s => {
        const matchesSearch = (s.title || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = subjectFilter === "all" || s.subjectId === subjectFilter;
        return matchesSearch && matchesSubject;
     });
  }, [rawSeries, searchTerm, subjectFilter]);

  return (
    <div className="space-y-10 md:space-y-16 text-left pb-32 animate-in fade-in duration-700 pt-2">
      <AdminPageHeader
        icon={Layers}
        label="Granular Learning Registry"
        title="Series Architect"
        subtitle="Organize subjects into specialized preparation hubs (Level 2)."
        actionLabel="Initialize Series"
        actionIcon={Plus}
        onAction={() => setEditingSeries({ title: "", subjectId: subjectFilter !== 'all' ? subjectFilter : "", boardId: "psssb", description: "", difficulty: "Medium", isActive: true, displayOrder: (rawSeries?.length || 0) + 1 })}
      />

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white mx-1 border border-slate-50 p-6 md:p-10">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
               <AdminSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search series title..." />
            </div>
            <select 
               value={subjectFilter} 
               onChange={e => setSubjectFilter(e.target.value)}
               className="h-14 md:h-16 bg-slate-50 border-none rounded-2xl px-6 font-bold text-sm outline-none shadow-inner cursor-pointer text-[#0F172A]"
            >
               <option value="all">All Subjects Hub</option>
               {subjects?.map(s => <option key={s.id} value={s.id}>{s.name} Hub</option>)}
            </select>
         </div>
      </Card>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-20 border-slate-100">
                <TableHead className="px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Node Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Hub</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Difficulty</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={5} columns={4} />
              ) : filteredSeries.length > 0 ? filteredSeries.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                  <TableCell className="px-8 md:px-12 py-6 md:py-10">
                     <div className="flex items-center gap-6">
                        <div className="shrink-0">
                           <AuthorityLogo boardId={s.boardId} size="sm" className="bg-slate-50" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-black text-[#0F172A] text-lg leading-none uppercase">{s.title}</p>
                           <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Order: {s.displayOrder}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className="bg-primary/5 text-primary border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest shadow-sm">
                        {subjects?.find(sub => sub.id === s.subjectId)?.name || 'Orphan node'}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={cn(
                        "border-none text-[8px] font-black uppercase px-3 py-1 rounded shadow-sm",
                        s.difficulty === 'Easy' ? "bg-emerald-50 text-emerald-600" : s.difficulty === 'Medium' ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                     )}>{s.difficulty}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingSeries(s)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => deleteDocument(s.id, "Purge series node?")} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-60 text-center opacity-30 italic font-black uppercase text-sm">No series registered</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminDialogShell
        open={!!editingSeries}
        onOpenChange={() => setEditingSeries(null)}
        title="Series Hub Architect"
        description="Configure Level 2 specialized preparation series."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingSeries(null)}
        saveLabel="Sync Node"
      >
         <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Parent Subject Hub</Label>
                  <select 
                      value={editingSeries?.subjectId || ""} 
                      onChange={e => setEditingSeries({...editingSeries, subjectId: e.target.value})}
                      className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold text-sm outline-none shadow-inner appearance-none cursor-pointer text-[#0F172A]"
                  >
                      <option value="" disabled>Select Subject</option>
                      {subjects?.map(s => <option key={s.id} value={s.id}>{s.name} Hub</option>)}
                  </select>
                </div>
                <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Branding (Board Logo)</Label>
                  <select 
                      value={editingSeries?.boardId || ""} 
                      onChange={e => setEditingSeries({...editingSeries, boardId: e.target.value})}
                      className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold text-sm outline-none shadow-inner appearance-none cursor-pointer text-[#0F172A]"
                  >
                      <option value="" disabled>Select Authority</option>
                      {boards?.map(b => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
                  </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Title</Label>
                  <Input value={editingSeries?.title || ""} onChange={e => setEditingSeries({...editingSeries, title: e.target.value})} className="h-14 rounded-xl border-none bg-slate-50 font-black text-base px-6 shadow-inner text-[#0F172A]" placeholder="e.g. Number System Series" />
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Difficulty Matrix</Label>
                  <select 
                     value={editingSeries?.difficulty || "Medium"} 
                     onChange={e => setEditingSeries({...editingSeries, difficulty: e.target.value})}
                     className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold text-sm outline-none shadow-inner text-[#0F172A]"
                  >
                     {["Easy", "Medium", "Hard", "Expert"].map(d => <option key={d} value={d}>{d} Level</option>)}
                  </select>
               </div>
            </div>

            <div className="space-y-1.5 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Abstract</Label>
               <Textarea value={editingSeries?.description || ""} onChange={e => setEditingSeries({...editingSeries, description: e.target.value})} className="min-h-[100px] rounded-2xl border-none bg-slate-50 p-5 font-medium leading-relaxed shadow-inner text-[#0F172A]" placeholder="Topics covered in this series..." />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Display Sequence</Label>
                  <Input type="number" value={editingSeries?.displayOrder || ""} onChange={e => setEditingSeries({...editingSeries, displayOrder: e.target.value})} className="h-12 md:h-14 rounded-xl border-none bg-slate-50 font-black text-center shadow-inner text-[#0F172A]" />
               </div>
               <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                  <div className="space-y-0.5">
                     <p className="text-[11px] font-black text-[#0F172A] uppercase">Active Hub</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Live in selection</p>
                  </div>
                  <Switch checked={editingSeries?.isActive || false} onCheckedChange={v => setEditingSeries({...editingSeries, isActive: v})} />
               </div>
            </div>
         </div>
      </AdminDialogShell>
    </div>
  )
}
