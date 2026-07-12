"use client";

import React, { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Trophy, GraduationCap, Image as ImageIcon } from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, orderBy, addDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { SuccessStory } from "@/types"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"

/**
 * @fileOverview Institutional Success Hub CMS v12.0.
 * FIXED: Rebuilt dialog for better spatial alignment and visibility.
 * UPDATED: Integrated live auditing and refined typography.
 */

export default function SuccessStoryManagement() {
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [editingStory, setEditingStory] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const storiesQuery = useMemo(() => (db ? query(collection(db, "success_stories"), orderBy("createdAt", "desc")) : null), [db])
  const { data: stories, loading } = useCollection<SuccessStory>(storiesQuery as any)

  const filteredStories = useMemo(() => {
    if (!stories) return []
    return stories.filter(s => 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.exam?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [stories, searchTerm])

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

      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: "STORY_UPDATE",
        details: `Success node for "${editingStory.name}" synchronized.`,
        timestamp: serverTimestamp()
      });

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

  return (
    <div className="space-y-6 md:space-y-12 text-[#0F172A] text-left animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        icon={Trophy}
        label="Hall of Rankers CMS"
        title="Success Hub"
        subtitle="Manage student testimonials and official toppers list."
        actionLabel="New Story"
        actionIcon={Plus}
        onAction={() => setEditingStory({ name: "", exam: "", rank: "Qualified", year: "2025", quote: "", imageUrl: `https://picsum.photos/seed/${Date.now()}/400/500`, published: true })}
      />

      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search toppers by name or exam..."
      />

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-8 md:px-12 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topper Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam & Merit</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={4} columns={3} />
              ) : filteredStories.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-8 md:px-12 py-5 md:py-8">
                     <div className="flex items-center gap-4 md:gap-8">
                        <div className="relative h-12 w-12 md:h-16 md:w-16 rounded-xl overflow-hidden bg-slate-50 shadow-inner group-hover:scale-105 transition-transform border border-slate-100">
                           <img src={s.imageUrl || "https://picsum.photos/seed/topper/100/100"} alt={s.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-[#0F172A] text-sm md:text-xl leading-tight truncate">{s.name}</p>
                           <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Batch {s.year}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1.5">
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] md:text-[10px] px-2.5 py-0.5 rounded uppercase tracking-widest shadow-sm w-fit">{s.rank}</Badge>
                        <p className="font-bold text-slate-600 text-xs md:text-base uppercase flex items-center gap-2">
                           <GraduationCap className="h-3.5 w-3.5 text-primary" /> {s.exam}
                        </p>
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingStory(s)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(s.id)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminDialogShell
        open={!!editingStory}
        onOpenChange={() => setEditingStory(null)}
        title="Success Node Architect"
        description="Modify official student success testimonials."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingStory(null)}
        saveLabel="Commit Topper Node"
      >
         <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-1.5 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Topper Name</Label>
               <Input value={editingStory?.name || ""} onChange={e => setEditingStory({...editingStory, name: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-bold px-5" placeholder="e.g. Amrit Grewal" />
            </div>
            <div className="space-y-1.5 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Merit / Rank</Label>
               <Input value={editingStory?.rank || ""} onChange={e => setEditingStory({...editingStory, rank: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-bold px-5 text-center" placeholder="e.g. Rank 12" />
            </div>
         </div>
         <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Exam Qualified</Label>
            <Input value={editingStory?.exam || ""} onChange={e => setEditingStory({...editingStory, exam: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-bold px-5" placeholder="e.g. Punjab Police SI" />
         </div>
         <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-1.5 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Batch Year</Label>
               <Input value={editingStory?.year || "2025"} onChange={e => setEditingStory({...editingStory, year: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-black text-center" />
            </div>
            <div className="space-y-1.5 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><ImageIcon className="h-3 w-3" /> Avatar URL</Label>
               <Input value={editingStory?.imageUrl || ""} onChange={e => setEditingStory({...editingStory, imageUrl: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-mono text-xs px-5" />
            </div>
         </div>
         <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Topper Quote</Label>
            <Textarea value={editingStory?.quote || ""} onChange={e => setEditingStory({...editingStory, quote: e.target.value})} className="min-h-[140px] rounded-2xl md:rounded-[2.5rem] border-slate-100 bg-slate-50 p-6 font-medium leading-relaxed shadow-inner" placeholder="Type toppers feedback..." />
         </div>
      </AdminDialogShell>
    </div>
  )
}
