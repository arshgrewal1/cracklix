"use client"

import { useState, useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, FileText, Download, Save, Search, Layers, ExternalLink, Loader2, Globe, ShieldCheck } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional PYQ Repository Management v15.3.
 * FIXED: Missing Badge and cn imports resolved.
 */

export default function AdminPYQManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const pyqQuery = useMemo(() => (db ? query(collection(db, "pyqs"), orderBy("year", "desc")) : null), [db])
  const { data: pyqs, loading } = useCollection<any>(pyqQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

  const [editingPYQ, setEditingPYQ] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!db || !editingPYQ || isSaving) return

    if (!editingPYQ.title || !editingPYQ.pdfUrl) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Title and PDF URL are mandatory." })
      return
    }

    setIsSaving(true)
    const pyqId = editingPYQ.id || `pyq-${Date.now()}`
    const pyqRef = doc(db, "pyqs", pyqId)
    
    const payload = {
      ...editingPYQ,
      id: pyqId,
      updatedAt: serverTimestamp(),
      createdAt: editingPYQ.createdAt || serverTimestamp(),
      year: parseInt(editingPYQ.year) || new Date().getFullYear()
    }

    try {
      await setDoc(pyqRef, payload, { merge: true })
      toast({ title: "Archive Updated", description: "Official paper successfully synced to repository." })
      setEditingPYQ(null)
    } catch (err: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: pyqRef.path,
        operation: 'write',
        requestResourceData: payload,
      }));
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this paper from institutional archives?")) return
    const pyqRef = doc(db!, "pyqs", id)
    try {
      await deleteDoc(pyqRef)
      toast({ title: "Archived Removed", description: "Audit trail purged from cloud." })
    } catch (err: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: pyqRef.path,
        operation: 'delete',
      }));
    }
  }

  const filteredPYQs = useMemo(() => {
    if (!pyqs) return []
    return pyqs.filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.boardId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [pyqs, searchTerm])

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Verified Audit Archives</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">PYQ Repository</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage authentic previous year papers with real cloud-stored PDF URIs.</p>
        </div>
        <button onClick={() => setEditingPYQ({ title: "", boardId: "", examId: "", year: new Date().getFullYear(), pdfUrl: "", status: "Verified" })} className="bg-primary hover:bg-orange-600 gap-3 h-16 px-10 rounded-2xl font-black shadow-2xl uppercase tracking-widest text-[10px] text-white flex items-center justify-center border-none">
          <Plus className="h-5 w-5" /> Archive New Paper
        </button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
           <div className="relative w-full md:w-[45%]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-16 h-16 rounded-[1.5rem] bg-white border-none shadow-inner text-lg font-medium text-[#0F172A]" 
                placeholder="Search archives..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Year & Authority</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Archive Title</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Node</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-14 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredPYQs.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-10 py-8">
                    <div className="space-y-1">
                      <p className="text-2xl font-headline font-black text-[#0F172A] leading-none">{p.year}</p>
                      <Badge variant="outline" className="bg-white border-slate-100 text-primary text-[8px] font-black uppercase px-2 py-0.5">{p.boardId}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 text-left">
                       <p className="font-black text-[#0F172A] text-lg uppercase leading-none group-hover:text-primary transition-colors">{p.title}</p>
                       <code className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">ID: {p.id.slice(-8)}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-inner", p.pdfUrl ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                           {p.pdfUrl ? <ShieldCheck className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.pdfUrl ? 'URL_VALID' : 'NO_ASSET'}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-white hover:text-primary shadow-sm" onClick={() => setEditingPYQ(p)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingPYQ} onOpenChange={(open) => !open && setEditingPYQ(null)}>
        <DialogContent className="sm:max-w-2xl rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-[#0F172A] shrink-0" />
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-3xl font-black font-headline uppercase text-[#0F172A] flex items-center gap-4">
               <FileText className="h-8 w-8 text-primary" /> Audit Archive
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Archive Headline</Label>
              <Input value={editingPYQ?.title || ""} onChange={e => setEditingPYQ({...editingPYQ, title: e.target.value})} className="h-14 rounded-xl border-slate-100 font-black text-lg text-[#0F172A]" placeholder="e.g. PSSSB Patwari 2025 Mains" />
            </div>
            
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recruiting Authority</Label>
                <select value={editingPYQ?.boardId || ""} onChange={e => setEditingPYQ({...editingPYQ, boardId: e.target.value})} className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                   <option value="">Select Board</option>
                   {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Archive Year</Label>
                <Input type="number" value={editingPYQ?.year || 2025} onChange={e => setEditingPYQ({...editingPYQ, year: e.target.value})} className="h-14 rounded-xl border-slate-100 font-black text-center" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Institutional PDF URI</Label>
              <div className="flex gap-3">
                 <Input 
                   value={editingPYQ?.pdfUrl || ""} 
                   onChange={e => setEditingPYQ({...editingPYQ, pdfUrl: e.target.value.trim()})} 
                   className="h-14 rounded-xl border-slate-100 bg-slate-50 font-mono text-xs text-primary" 
                   placeholder="https://cloud.storage/official_paper.pdf" 
                 />
                 {editingPYQ?.pdfUrl && (
                   <Button asChild variant="outline" className="h-14 w-14 rounded-xl shrink-0">
                      <a href={editingPYQ.pdfUrl} target="_blank" rel="noopener noreferrer"><Globe className="h-5 w-5" /></a>
                   </Button>
                 )}
              </div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Tip: Use real Google Drive or Cloud Storage URLs here.</p>
            </div>
          </div>

          <DialogFooter className="p-10 pt-4 bg-slate-50 flex gap-4">
            <Button variant="ghost" onClick={() => setEditingPYQ(null)} className="rounded-xl h-14 font-black uppercase text-[10px] text-slate-400">Cancel Draft</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#0F172A] hover:bg-black text-white h-14 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest flex-1 shadow-xl">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit to Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
