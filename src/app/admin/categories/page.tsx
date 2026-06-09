
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, Layers, Search, Loader2 } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

/**
 * @fileOverview Institutional Category Governance Node.
 * High-fidelity management for the 5 top-level verticals.
 */

export default function CategoryManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const catQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db])
  const { data: categories, loading } = useCollection<any>(catQuery)

  const [editingCat, setEditingCat] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!db || !editingCat) return
    if (!editingCat.id || !editingCat.title) {
       toast({ variant: "destructive", title: "Validation Error", description: "ID and Title are mandatory." })
       return
    }

    setIsSaving(true)
    try {
      await setDoc(doc(db, "categories", editingCat.id), {
        ...editingCat,
        displayOrder: parseInt(editingCat.displayOrder) || 0,
        updatedAt: serverTimestamp()
      }, { merge: true })
      toast({ title: "Registry Synced" })
      setEditingCat(null)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-12 pb-24 text-left px-4">
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Layers className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Master Vertical Registry</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Category Manager</h1>
        </div>
        <Button onClick={() => setEditingCat({ id: "", title: "", description: "", highlight: "", displayOrder: (categories?.length || 0) + 1, color: "text-primary", bgColor: "bg-orange-50" })} className="bg-primary hover:bg-orange-600 h-16 px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl">
          <Plus className="h-5 w-5" /> Deploy New Category
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest">Vertical Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Order</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell colSpan={3} className="p-10"><Skeleton className="h-16 w-full rounded-2xl"/></TableCell></TableRow>)
              ) : categories?.map((cat: any) => (
                <TableRow key={cat.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                  <TableCell className="px-10 py-8">
                     <div className="flex items-center gap-6">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black ${cat.bgColor} ${cat.color} shadow-inner`}>
                           {cat.id[0].toUpperCase()}
                        </div>
                        <div>
                           <p className="font-black text-[#0F172A] text-xl uppercase leading-none">{cat.title}</p>
                           <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{cat.id}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="text-center font-black text-slate-300 text-xl">{cat.displayOrder}</TableCell>
                  <TableCell className="text-right px-10">
                     <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100">
                        <Button variant="ghost" size="icon" onClick={() => setEditingCat(cat)}><Edit className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="hover:text-rose-600" onClick={async () => { if(confirm("Purge category?")) await deleteDoc(doc(db!, "categories", cat.id)) }}><Trash2 className="h-5 w-5" /></Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingCat} onOpenChange={o => !o && setEditingCat(null)}>
         <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-10 pb-0"><DialogTitle className="text-2xl font-black font-headline uppercase">Category Hub Architect</DialogTitle></DialogHeader>
            <div className="p-10 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Registry ID</Label>
                     <Input value={editingCat?.id} onChange={e => setEditingCat({...editingCat, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="h-12 rounded-xl" placeholder="e.g. punjab-govt" disabled={!!editingCat?.updatedAt} />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Display Order</Label>
                     <Input type="number" value={editingCat?.displayOrder} onChange={e => setEditingCat({...editingCat, displayOrder: e.target.value})} className="h-12 rounded-xl" />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Headline Title</Label>
                  <Input value={editingCat?.title} onChange={e => setEditingCat({...editingCat, title: e.target.value})} className="h-12 rounded-xl font-bold" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Abstract Description</Label>
                  <Textarea value={editingCat?.description} onChange={e => setEditingCat({...editingCat, description: e.target.value})} className="rounded-xl min-h-[80px]" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Highlight Badge</Label>
                     <Input value={editingCat?.highlight} onChange={e => setEditingCat({...editingCat, highlight: e.target.value})} className="h-12 rounded-xl uppercase text-[10px] font-black" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Color Theme (Tailwind)</Label>
                     <Input value={editingCat?.color} onChange={e => setEditingCat({...editingCat, color: e.target.value})} className="h-12 rounded-xl font-mono text-xs" placeholder="text-primary" />
                  </div>
               </div>
            </div>
            <DialogFooter className="p-10 pt-0">
               <Button onClick={handleSave} disabled={isSaving} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit Category Node"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
