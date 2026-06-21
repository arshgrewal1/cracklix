"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, Trophy, Search, Loader2, X, Image as ImageIcon, GraduationCap } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { SuccessStory } from "@/types"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Success Hub CMS v9.0 (PWA Optimized).
 * FIXED: Removed huge blue ALL CAPS header. 
 * FIXED: Standardized to Title Case and Blue Pill buttons to match Student Hub.
 */

export default function SuccessStoryManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const storiesQuery = useMemo(() => (db ? query(collection(db, "success_stories"), orderBy("createdAt", "desc")) : null), [db])
  const { data: stories, loading } = useCollection<SuccessStory>(storiesQuery as any)

  const [editingStory, setEditingStory] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSave = async () => {
    if (!db || !editingStory) return
    if (!editingStory.name || !editingStory.quote) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Name and Quote are mandatory." })
       return
    }

    setIsSaving(true)
    const id = editingStory.id || `story-${Date.now()}`
    try {
      await setDoc(doc(db, "success_stories", id), {
        ...editingStory,
        id,
        updatedAt: serverTimestamp(),
        createdAt: editingStory.createdAt || serverTimestamp()
      }, { merge: true })
      toast({ title: "Hall of Rankers Synced" })
      setEditingStory(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently remove this success node?")) return
    await deleteDoc(doc(db, "success_stories", id))
    toast({ title: "Story Purged" })
  }

  const filteredStories = useMemo(() => {
    if (!stories) return []
    return stories.filter(s => 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.exam?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [stories, searchTerm])

  return (
    <div className="space-y-6 md:space-y-12 text-[#0F172A] text-left animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Hall of Rankers CMS</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black tracking-tight">Success Hub</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Manage student testimonials and official toppers list.</p>
        </div>
        <Button 
          onClick={() => setEditingStory({ name: "", exam: "", rank: "Qualified", year: "2025", quote: "", imageUrl: "https://picsum.photos/seed/topper/400/500", published: true })} 
          className="w-full md:w-auto bg-primary hover:bg-blue-700 h-11 md:h-14 px-8 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl border-none active:scale-95 gap-2"
        >
          <Plus className="h-4 w-4" /> Deploy New Story
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search toppers..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Topper Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Exam & Merit</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-6 py-6 md:px-12 md:py-8"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>)
              ) : filteredStories.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-6 md:px-12 py-5 md:py-8 text-left">
                     <div className="flex items-center gap-4 md:gap-6">
                        <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl overflow-hidden bg-slate-50 shadow-inner group-hover:scale-105 transition-transform border border-slate-100">
                           <img src={s.imageUrl} className="h-full w-full object-cover" />
                        </div>
                        <div>
                           <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{s.name}</p>
                           <p className="text-[8px] md:text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">Batch {s.year}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1">
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] md:text-[9px] px-2.5 py-0.5 rounded uppercase tracking-widest">{s.rank}</Badge>
                        <p className="font-bold text-slate-600 text-xs md:text-sm uppercase flex items-center gap-1.5 mt-1">
                           <GraduationCap className="h-3.5 w-3.5 text-primary" /> {s.exam}
                        </p>
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingStory(s)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(s.id)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingStory} onOpenChange={o => !o && setEditingStory(null)}>
         <DialogContent className="sm:max-w-xl w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
               <DialogTitle className="text-xl md:text-3xl font-black uppercase flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-primary" /> Success Node Architect
               </DialogTitle>
               <DialogDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Modify official student success testimonials.</DialogDescription>
            </DialogHeader>
            <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Topper Name</Label>
                     <Input value={editingStory?.name || ""} onChange={e => setEditingStory({...editingStory, name: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold" placeholder="e.g. Amrit Grewal" />
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Merit / Rank</Label>
                     <Input value={editingStory?.rank || ""} onChange={e => setEditingStory({...editingStory, rank: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold text-center" placeholder="e.g. Rank 12" />
                  </div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Exam Qualified</Label>
                  <Input value={editingStory?.exam || ""} onChange={e => setEditingStory({...editingStory, exam: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold" placeholder="e.g. Punjab Police SI" />
               </div>
               <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Batch Year</Label>
                     <Input value={editingStory?.year || "2025"} onChange={e => setEditingStory({...editingStory, year: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-black text-center" />
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Avatar Node (URL)</Label>
                     <Input value={editingStory?.imageUrl || ""} onChange={e => setEditingStory({...editingStory, imageUrl: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-mono text-xs" />
                  </div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Success Abstract (Quote)</Label>
                  <Textarea value={editingStory?.quote || ""} onChange={e => setEditingStory({...editingStory, quote: e.target.value})} className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50 font-medium leading-relaxed" placeholder="Type toppers feedback..." />
               </div>
            </div>
            <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4">
               <Button variant="ghost" onClick={() => setEditingStory(null)} className="h-11 md:h-12 px-6 font-black uppercase text-[10px] text-slate-400">Discard</Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-primary hover:bg-blue-700 text-white h-11 md:h-12 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl gap-2 active:scale-95 border-none">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Topper Node
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
