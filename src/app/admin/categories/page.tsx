
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, MoveUp, MoveDown, FolderTree } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, orderBy, updateDoc, increment, DocumentData, FirestoreDataConverter } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { AuthorityLogo } from "@/lib/exam-icons"
import { Category } from "@/types"
import { AdminPageHeader, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { useFirestoreCrud } from "@/hooks/useFirestoreCrud"

const categoryConverter: FirestoreDataConverter<Category> = {
    toFirestore: (data: Category): DocumentData => data,
    fromFirestore: (snap): Category => snap.data() as Category
};

/**
 * @fileOverview Institutional Folder Registry v18.1.
 * UPDATED: Replaced 'node' with 'item' or 'entry'.
 */
export default function CategoryManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const catQuery = useMemo(() => (db ? query(collection(db, "categories").withConverter(categoryConverter), orderBy("displayOrder", "asc")) : null), [db])
  const { data: categories, loading } = useCollection<Category>(catQuery)

  const [editingCat, setEditingCat] = useState<Category | null>(null)

  const { isSaving, saveDocument } = useFirestoreCrud({
    db,
    collectionName: "categories",
    toastMessages: { saveSuccess: "Registry Synced" },
  })

  const handleSave = async () => {
    if (!editingCat || !editingCat.id || !editingCat.title) {
       toast({ variant: "destructive", title: "Validation Error", description: "ID and Title are mandatory." })
       return
    }

    const isNew = !(editingCat as any).updatedAt;
    const success = await saveDocument(
      { ...editingCat, displayOrder: parseInt(editingCat.displayOrder as any) || 0 },
      { id: editingCat.id, onSuccess: () => setEditingCat(null) }
    )

    if (success && isNew && db) {
      await updateDoc(doc(db, 'settings', 'stats'), {
         totalCategories: increment(1),
         updatedAt: serverTimestamp()
      }).catch(() => {});
    }
  }

  const handleReorder = async (cat: Category, direction: 'up' | 'down') => {
     if (!db || !categories) return;
     const idx = categories.findIndex(c => c.id === cat.id);
     const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
     if (swapIdx < 0 || swapIdx >= categories.length) return;
     
     const otherCat = categories[swapIdx];
     await Promise.all([
        setDoc(doc(db, "categories", cat.id), { displayOrder: otherCat.displayOrder }, { merge: true }),
        setDoc(doc(db, "categories", otherCat.id), { displayOrder: cat.displayOrder }, { merge: true })
     ]);
     toast({ title: "Order Updated" });
  }

  return (
    <div className="space-y-10 md:space-y-16 text-left pb-32 animate-in fade-in duration-700 pt-2">
      <AdminPageHeader
        icon={FolderTree}
        label="Institutional Folder Registry"
        title="Category Manager"
        subtitle="Manage top-level official recruitment folders."
        actionLabel="New Category"
        actionIcon={Plus}
        onAction={() => setEditingCat({ id: "", title: "", description: "", iconUrl: "", displayOrder: (categories?.length || 0) + 1 })}
      />

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-20">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Branding</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center text-slate-400">Display Order</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={5} columns={3} />
              ) : categories?.map((cat, idx) => (
                <TableRow key={cat.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-8 md:px-12 py-6 md:py-10">
                     <div className="flex items-center gap-5 md:gap-8">
                        <AuthorityLogo category={cat} size="md" className="h-12 w-12 md:h-16 md:w-16 bg-slate-50 p-2 rounded-xl shadow-inner group-hover:scale-105 transition-transform" />
                        <div className="min-w-0">
                           <p className="font-black text-[#0F172A] text-base md:text-xl leading-tight truncate">{cat.title}</p>
                           <p className="text-[9px] md:text-[11px] font-bold text-slate-300 mt-1.5 uppercase tracking-widest truncate">{cat.id}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <div className="flex flex-col items-center gap-1">
                        <button onClick={() => handleReorder(cat, 'up')} disabled={idx === 0} className="p-1 text-slate-300 hover:text-primary disabled:opacity-0 transition-colors active:scale-90"><MoveUp className="h-4 w-4" /></button>
                        <span className="font-black text-slate-200 text-xl md:text-4xl tabular-nums leading-none">{cat.displayOrder}</span>
                        <button onClick={() => handleReorder(cat, 'down')} disabled={idx === categories.length - 1} className="p-1 text-slate-300 hover:text-primary disabled:opacity-0 transition-colors active:scale-90"><MoveDown className="h-4 w-4" /></button>
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingCat(cat)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={async () => { if(confirm("Purge folder item?") && db) await deleteDoc(doc(db, "categories", cat.id)) }} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminDialogShell
        open={!!editingCat}
        onOpenChange={() => setEditingCat(null)}
        title="Category Architect"
        description="Configure official folder metadata."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingCat(null)}
        saveLabel="Commit Category"
        accentColor="bg-[#0F172A]"
      >
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Registry ID</Label>
            <Input 
              value={editingCat?.id || ""} 
              onChange={e => setEditingCat({ ...editingCat, id: e.target.value.toLowerCase().replace(/\s+/g, '-') } as Category)} 
              className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-mono text-[10px] md:text-xs px-5 shadow-inner" 
              disabled={!!(editingCat as any)?.updatedAt} 
              placeholder="e.g. state-exams"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Display Order</Label>
            <Input type="number" value={editingCat?.displayOrder || ""} onChange={e => setEditingCat({ ...editingCat, displayOrder: Number(e.target.value) } as Category)} className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-black text-center shadow-inner" />
          </div>
        </div>
        <div className="space-y-1.5 text-left">
          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Official Name</Label>
          <Input value={editingCat?.title || ""} onChange={e => setEditingCat({ ...editingCat, title: e.target.value } as Category)} className="h-14 md:h-18 rounded-xl md:rounded-2xl border-none bg-slate-50 font-black text-sm md:text-xl px-6 shadow-inner" placeholder="e.g. Punjab Government Exams" />
        </div>
        <div className="space-y-1.5 text-left">
          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Logo URL (PNG/SVG)</Label>
          <Input value={editingCat?.iconUrl || ""} onChange={e => setEditingCat({ ...editingCat, iconUrl: e.target.value } as Category)} className="h-11 md:h-12 rounded-xl bg-slate-50 border-none font-mono text-[10px] text-primary px-5 shadow-inner" placeholder="https://..." />
        </div>
      </AdminDialogShell>
    </div>
  )
}
