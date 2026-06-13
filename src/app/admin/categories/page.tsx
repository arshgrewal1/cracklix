"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, Layers, Search, Loader2, Landmark, GraduationCap, Zap, Wallet, Globe, MoveUp, MoveDown } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Category Governance Node v13.1.
 * ACCESSIBILITY: Added DialogDescription for ARIA compliance.
 */

const CATEGORY_ICONS: Record<string, any> = {
  "punjab-govt": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR8W5eTBPdzztA7cziqnMmtWk9InL1yflUD_xb4vAsLw&s=10" className="h-full w-full object-contain p-1" />,
  "punjab-teaching": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbNnoge6pNWx1HZYrUJKM58qWk1dDw85xvKPBoG-O4ew&s=10" className="h-full w-full object-contain p-1" />,
  "punjab-technical": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo0ZK9JI5KMfg9RoNdIwcsNlpx5IcPBWuKZw&s" className="h-full w-full object-contain p-1" />,
  "banking": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7McWqZqOgKy-BakccvR02WQdEQFrwuvmHBG5rYJzuEg&s=10" className="h-full w-full object-contain p-1" />,
  "central-govt": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmRNHVIV2W9Pn_87u6EQmluADidwUQWhOotUwQUV_VWtEBWqoxjf-OBEt4&s=10" className="h-full w-full object-contain p-1" />
};

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
      toast({ title: "Registry Synced", description: `${editingCat.title} node updated.` })
      setEditingCat(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReorder = async (cat: any, direction: 'up' | 'down') => {
     if (!db || !categories) return;
     const idx = categories.findIndex(c => c.id === cat.id);
     const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
     
     if (swapIdx < 0 || swapIdx >= categories.length) return;
     
     const otherCat = categories[swapIdx];
     const oldOrder = cat.displayOrder || 0;
     const newOrder = otherCat.displayOrder || 0;

     try {
        await Promise.all([
           setDoc(doc(db, "categories", cat.id), { displayOrder: newOrder }, { merge: true }),
           setDoc(doc(db, "categories", otherCat.id), { displayOrder: oldOrder }, { merge: true })
        ]);
        toast({ title: "Order Updated" });
     } catch (e) {
        toast({ variant: "destructive", title: "Reorder Failed" });
     }
  }

  const handleDelete = async (id: string) => {
    if (!db) return;
    const confirmMsg = "CRITICAL: Permanently purge this category node?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteDoc(doc(db, "categories", id));
      toast({ title: "Node Purged", description: "Category removed from master registry." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Purge Failed" });
    }
  }

  return (
    <div className="space-y-12 pb-24 text-left px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Layers className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Master Vertical Registry</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Category Manager</h1>
          <p className="text-slate-500 mt-1 font-medium">Coordinate high-level recruitment groups and discovery categories.</p>
        </div>
        <Button onClick={() => setEditingCat({ id: "", title: "", description: "", highlight: "", displayOrder: (categories?.length || 0) + 1, color: "text-primary", bgColor: "bg-orange-50" })} className="bg-primary hover:bg-orange-600 h-16 px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95">
          <Plus className="h-5 w-5" /> Deploy New Category
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100 h-20">
                  <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Vertical Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-center text-slate-500">Order</TableHead>
                  <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Audit Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   Array.from({length: 5}).map((_, i) => <TableRow key={i}><TableCell colSpan={3} className="p-10"><Skeleton className="h-16 w-full rounded-2xl"/></TableCell></TableRow>)
                ) : categories?.map((cat: any, idx: number) => (
                  <TableRow key={cat.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                    <TableCell className="px-10 py-8">
                       <div className="flex items-center gap-6">
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center font-black shadow-inner bg-slate-50 text-slate-300")}>
                             {CATEGORY_ICONS[cat.id] || <Layers className="h-6 w-6" />}
                          </div>
                          <div>
                             <p className="font-black text-[#0F172A] text-xl uppercase leading-none">{cat.title}</p>
                             <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{cat.id}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center gap-1">
                          <button onClick={() => handleReorder(cat, 'up')} disabled={idx === 0} className="p-1 hover:text-primary disabled:opacity-10 transition-all"><MoveUp className="h-3 w-3" /></button>
                          <span className="font-black text-slate-300 text-xl tabular-nums leading-none">{cat.displayOrder}</span>
                          <button onClick={() => handleReorder(cat, 'down')} disabled={idx === categories.length - 1} className="p-1 hover:text-primary disabled:opacity-10 transition-all"><MoveDown className="h-3 w-3" /></button>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100" onClick={() => setEditingCat(cat)}><Edit className="h-5 w-5" /></Button>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(cat.id)}><Trash2 className="h-5 w-5" /></Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingCat} onOpenChange={o => !o && setEditingCat(null)}>
         <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-10 pb-0">
               <DialogTitle className="text-2xl font-black font-headline uppercase flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                     <Layers className="h-6 w-6" />
                  </div>
                  Category Hub Architect
               </DialogTitle>
               <DialogDescription className="sr-only">Configure the identity and display settings for this exam category node.</DialogDescription>
            </DialogHeader>
            <div className="p-10 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Registry ID (Slug)</Label>
                     <Input 
                        value={editingCat?.id ?? ""} 
                        onChange={e => setEditingCat({...editingCat, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                        className="h-12 rounded-xl bg-slate-50 border-none font-mono text-xs" 
                        placeholder="e.g. punjab-govt" 
                        disabled={!!editingCat?.updatedAt} 
                     />
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Display Order</Label>
                     <Input 
                        type="number" 
                        value={editingCat?.displayOrder ?? ""} 
                        onChange={e => setEditingCat({...editingCat, displayOrder: e.target.value})} 
                        className="h-12 rounded-xl bg-slate-50 border-none font-black text-center" 
                     />
                  </div>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Headline Title</Label>
                  <Input 
                    value={editingCat?.title ?? ""} 
                    onChange={e => setEditingCat({...editingCat, title: e.target.value})} 
                    className="h-14 rounded-xl border-slate-100 font-black text-lg text-[#0F172A]" 
                    placeholder="e.g. Punjab Teaching Exams"
                  />
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Thematic Description</Label>
                  <Textarea 
                    value={editingCat?.description ?? ""} 
                    onChange={e => setEditingCat({...editingCat, description: e.target.value})} 
                    className="rounded-xl border-slate-100 bg-slate-50 min-h-[100px] font-medium leading-relaxed" 
                    placeholder="Describe category purpose..."
                  />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Highlight Badge</Label>
                     <Input 
                        value={editingCat?.highlight ?? ""} 
                        onChange={e => setEditingCat({...editingCat, highlight: e.target.value})} 
                        className="h-12 rounded-xl border-slate-100 uppercase text-[10px] font-black" 
                        placeholder="e.g. STATE LEVEL"
                     />
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Theme Color (Tailwind)</Label>
                     <Input 
                        value={editingCat?.color ?? ""} 
                        onChange={e => setEditingCat({...editingCat, color: e.target.value})} 
                        className="h-12 rounded-xl border-slate-100 font-mono text-xs" 
                        placeholder="text-primary" 
                     />
                  </div>
               </div>
            </div>
            <DialogFooter className="p-10 pt-4 bg-slate-50 flex gap-4 border-t border-slate-100">
               <Button variant="ghost" onClick={() => setEditingCat(null)} className="rounded-xl h-14 px-8 font-black uppercase text-[10px] text-slate-400">Cancel</Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 gap-3 border-none">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Category Node
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
