"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, Loader2, MoveUp, MoveDown, X, FolderTree } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, orderBy, updateDoc, increment, DocumentData, FirestoreDataConverter } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorityLogo } from "@/lib/exam-icons"
import { Category } from "@/types"

const categoryConverter: FirestoreDataConverter<Category> = {
    toFirestore: (data: Category): DocumentData => data,
    fromFirestore: (snap): Category => snap.data() as Category
};

/**
 * @fileOverview Category Manager CMS v19.0 (PWA Sync).
 * FIXED: Removed uppercase from headers and refactored to high-density Title Case.
 */

export default function CategoryManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const catQuery = useMemo(() => (db ? query(collection(db, "categories").withConverter(categoryConverter), orderBy("displayOrder", "asc")) : null), [db])
  const { data: categories, loading } = useCollection<Category>(catQuery)

  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!db || !editingCat) return
    if (!editingCat.id || !editingCat.title) {
       toast({ variant: "destructive", title: "Validation Error", description: "ID and Title are mandatory." })
       return
    }

    setIsSaving(true)
    const isNew = !(editingCat as any).updatedAt;
    try {
      await setDoc(doc(db, "categories", editingCat.id), {
        ...editingCat,
        displayOrder: parseInt(editingCat.displayOrder as any) || 0,
        updatedAt: serverTimestamp()
      }, { merge: true })

      if (isNew) {
        await updateDoc(doc(db, 'settings', 'stats'), {
           totalCategories: increment(1),
           updatedAt: serverTimestamp()
        }).catch(() => {});
      }

      toast({ title: "Registry Synced", description: `${editingCat.title} updated.` })
      setEditingCat(null)
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
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
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <FolderTree className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-bold text-slate-400 tracking-tight">Institutional Folder Registry</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">Category Manager</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Manage top-level official recruitment folders.</p>
        </div>
        <Button onClick={() => setEditingCat({ id: "", title: "", description: "", iconUrl: "", displayOrder: (categories?.length || 0) + 1 })} className="w-full md:w-auto h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black text-[10px] tracking-widest shadow-xl border-none active:scale-95 gap-3">
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-10 text-[9px] md:text-[10px] font-bold text-slate-400 tracking-tight">Branding</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-bold text-center text-slate-400 tracking-tight">Order</TableHead>
                <TableHead className="text-right px-6 md:px-10 text-[9px] md:text-[10px] font-bold text-slate-400 tracking-tight">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-6 py-6 md:px-12 md:py-8"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : categories?.map((cat, idx) => (
                <TableRow key={cat.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-6 md:px-10 py-5 md:py-8">
                     <div className="flex items-center gap-4 md:gap-6">
                        <AuthorityLogo category={cat} size="md" className="h-10 w-10 md:h-14 md:w-14 bg-slate-50 p-2 rounded-xl shadow-inner group-hover:scale-105 transition-transform" />
                        <div className="min-w-0">
                           <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{cat.title}</p>
                           <p className="text-[8px] md:text-[9px] font-bold text-slate-400 mt-1 tracking-tight truncate">{cat.id}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <div className="flex flex-col items-center gap-1">
                        <button onClick={() => handleReorder(cat, 'up')} disabled={idx === 0} className="p-1 text-slate-300 hover:text-primary disabled:opacity-0 transition-colors"><MoveUp className="h-3.5 w-3.5" /></button>
                        <span className="font-black text-slate-200 text-lg md:text-2xl tabular-nums leading-none">{cat.displayOrder}</span>
                        <button onClick={() => handleReorder(cat, 'down')} disabled={idx === categories.length - 1} className="p-1 text-slate-300 hover:text-primary disabled:opacity-0 transition-colors"><MoveDown className="h-3.5 w-3.5" /></button>
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-10">
                     <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingCat(cat)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90"><Edit className="h-4 w-4" /></button>
                        <button onClick={async () => { if(confirm("Purge node?") && db) await deleteDoc(doc(db, "categories", cat.id)) }} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90"><Trash2 className="h-4 w-4" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingCat} onOpenChange={o => !o && !isSaving && setEditingCat(null)}>
         <DialogContent className="sm:max-w-xl w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
               <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Category Architect</DialogTitle>
                  <button onClick={() => setEditingCat(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
               </div>
               <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1">Configure official folder node metadata.</DialogDescription>
            </DialogHeader>
            <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1">Registry Id</Label>
                     <Input 
                        value={editingCat?.id || ""} 
                        onChange={e => setEditingCat({ ...editingCat, id: e.target.value.toLowerCase().replace(/\s+/g, '-') } as Category)} 
                        className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-mono text-xs px-5" 
                        disabled={!!(editingCat as any)?.updatedAt} 
                     />
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1">Display Order</Label>
                     <Input type="number" value={editingCat?.displayOrder || ""} onChange={e => setEditingCat({ ...editingCat, displayOrder: Number(e.target.value) } as Category)} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-black text-center" />
                  </div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Official Name</Label>
                  <Input value={editingCat?.title || ""} onChange={e => setEditingCat({ ...editingCat, title: e.target.value } as Category)} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold px-5" />
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Logo Url (PNG/SVG Node)</Label>
                  <Input value={editingCat?.iconUrl || ""} onChange={e => setEditingCat({ ...editingCat, iconUrl: e.target.value } as Category)} className="h-11 md:h-12 rounded-xl bg-slate-50 border-none font-mono text-xs text-primary px-5" placeholder="https://..." />
               </div>
            </div>
            <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4 shrink-0">
               <Button variant="ghost" onClick={() => setEditingCat(null)} className="h-11 md:h-12 px-6 font-black text-[10px] text-slate-400">Discard</Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-11 md:h-14 bg-primary hover:bg-blue-700 text-white font-black text-[10px] tracking-widest rounded-full shadow-xl border-none active:scale-95 gap-2">
                  {isSaving ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Save className="h-3 w-3 md:h-4 md:w-4" />} Commit Category
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
