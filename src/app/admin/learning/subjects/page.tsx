"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, BookMarked, Search, Loader2, Image as ImageIcon, ChevronRight } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Subject } from "@/types"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { useFirestoreCrud } from "@/hooks/useFirestoreCrud"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "@/components/admin/FileUpload"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Level 1 CMS: Subject Registry Hub v2.0 [Hardened].
 */

export default function SubjectCMS() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [editingSubject, setEditingSubject] = useState<any>(null)

  const subjectQuery = useMemo(() => (db ? query(collection(db, "subjects"), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: subjects, loading } = useCollection<Subject>(subjectQuery as any);

  const { isSaving, saveDocument, deleteDocument } = useFirestoreCrud({
    db,
    collectionName: "subjects",
    toastMessages: { saveSuccess: "Subject node synced" }
  });

  const handleSave = async () => {
     if (!editingSubject?.name) {
        toast({ variant: "destructive", title: "Audit blocked", description: "Name is mandatory." });
        return;
     }
     const id = editingSubject.id || editingSubject.name.toLowerCase().replace(/\s+/g, '-');
     await saveDocument(
       { ...editingSubject, displayOrder: parseInt(editingSubject.displayOrder) || 0 },
       { id, onSuccess: () => setEditingSubject(null) }
     );
  }

  const filteredSubjects = useMemo(() => {
     if (!subjects) return [];
     return subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [subjects, searchTerm]);

  return (
    <div className="space-y-10 md:space-y-16 text-left pb-32 animate-in fade-in duration-700 pt-2">
      <AdminPageHeader
        icon={BookMarked}
        label="Learning Registry Hub"
        title="Subject Architect"
        subtitle="Manage the Level 1 learning subjects and their visual identity."
        actionLabel="Register Subject"
        actionIcon={Plus}
        onAction={() => setEditingSubject({ name: "", description: "", imageUrl: "", isActive: true, displayOrder: (subjects?.length || 0) + 1 })}
      />

      <AdminSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search subjects title..." />

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-20 border-slate-100">
                <TableHead className="px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Branding & Name</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Order</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={5} columns={4} />
              ) : filteredSubjects.length > 0 ? filteredSubjects.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                  <TableCell className="px-8 md:px-12 py-6 md:py-10">
                     <div className="flex items-center gap-6">
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl overflow-hidden bg-slate-50 shadow-inner border border-slate-100 shrink-0">
                           {s.imageUrl ? <img src={s.imageUrl} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-slate-200"><ImageIcon className="h-6 w-6" /></div>}
                        </div>
                        <div className="min-w-0">
                           <p className="font-black text-[#0F172A] text-sm md:text-xl leading-none uppercase">{s.name}</p>
                           <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest truncate max-w-xs">{s.description || 'No description node.'}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <span className="font-black text-slate-200 text-3xl tabular-nums">{s.displayOrder}</span>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={cn("border-none text-[8px] font-black uppercase px-3 py-1 rounded shadow-sm", s.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>{s.isActive ? 'Active' : 'Disabled'}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingSubject(s)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => deleteDocument(s.id, "Purge subject node?")} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-60 text-center opacity-30 italic font-black uppercase text-sm">No subjects registered</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminDialogShell
        open={!!editingSubject}
        onOpenChange={() => setEditingSubject(null)}
        title="Subject Node Architect"
        description="Configure Level 1 subject hub metadata."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingSubject(null)}
        saveLabel="Commit Hub"
      >
         <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Subject Name</Label>
                  <Input value={editingSubject?.name || ""} onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} className="h-12 md:h-14 rounded-xl border-none bg-slate-50 font-black text-base px-6 shadow-inner" placeholder="e.g. Mathematics" />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Display Order</Label>
                  <Input type="number" value={editingSubject?.displayOrder || ""} onChange={e => setEditingSubject({...editingSubject, displayOrder: e.target.value})} className="h-12 md:h-14 rounded-xl border-none bg-slate-50 font-black text-center shadow-inner" />
               </div>
            </div>

            <div className="space-y-1.5">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Description Abstract</Label>
               <Textarea value={editingSubject?.description || ""} onChange={e => setEditingSubject({...editingSubject, description: e.target.value})} className="min-h-[100px] rounded-2xl border-none bg-slate-50 p-5 font-medium leading-relaxed shadow-inner" placeholder="Brief subject summary..." />
            </div>

            <FileUpload 
               label="Subject Cover Hub" 
               folder="logos" 
               value={editingSubject?.imageUrl} 
               onChange={(meta) => setEditingSubject({...editingSubject, imageUrl: meta?.url})} 
            />

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
               <div className="space-y-1">
                  <p className="text-[11px] font-black text-[#0F172A] uppercase">Activation Sync</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Enable visibility in student hub</p>
               </div>
               <Switch checked={editingSubject?.isActive || false} onCheckedChange={v => setEditingSubject({...editingSubject, isActive: v})} />
            </div>
         </div>
      </AdminDialogShell>
    </div>
  )
}
