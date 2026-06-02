"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, FileText, Download, Save, Search, Layers, ExternalLink } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

/**
 * @fileOverview Phase 32: Authentic PYQ Repository Management.
 * Manages institutional previous year papers for all Punjab verticals.
 */

export default function AdminPYQManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const pyqQuery = useMemo(() => (db ? query(collection(db, "pyqs"), orderBy("year", "desc")) : null), [db])
  const { data: pyqs, loading } = useCollection<any>(pyqQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))

  const [editingPYQ, setEditingPYQ] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSave = () => {
    if (!db || !editingPYQ) return
    const pyqId = editingPYQ.id || `pyq-${Date.now()}`
    const pyqRef = doc(db, "pyqs", pyqId)
    
    const payload = {
      ...editingPYQ,
      id: pyqId,
      updatedAt: serverTimestamp(),
      createdAt: editingPYQ.createdAt || serverTimestamp()
    }

    setDoc(pyqRef, payload, { merge: true })
      .then(() => {
        toast({ title: "Archive Updated", description: "Official paper successfully synced to repository." })
        setEditingPYQ(null)
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: pyqRef.path,
          operation: 'write',
          requestResourceData: payload,
        }));
      });
  }

  const handleDelete = (id: string) => {
    if (!confirm("Permanently purge this paper from institutional archives?")) return
    const pyqRef = doc(db, "pyqs", id)
    deleteDoc(pyqRef)
      .then(() => {
        toast({ title: "Archived Removed", description: "Audit trail purged from cloud." })
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: pyqRef.path,
          operation: 'delete',
        }));
      });
  }

  const filteredPYQs = useMemo(() => {
    if (!pyqs) return []
    return pyqs.filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.boardId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [pyqs, searchTerm])

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Verified Audit Archives</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">PYQ Repository</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage authentic previous year papers with verified official answer keys.</p>
        </div>
        <Button onClick={() => setEditingPYQ({ title: "", boardId: "", examId: "", year: new Date().getFullYear(), pdfUrl: "", status: "Verified" })} className="bg-primary hover:bg-primary/90 gap-3 h-14 px-10 rounded-[1.5rem] font-black shadow-2xl shadow-primary/20 uppercase tracking-widest text-xs">
          <Plus className="h-5 w-5" /> Archive New Paper
        </Button>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-3xl rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-white/5 bg-muted/20">
           <div className="relative w-full md:w-[45%]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-16 h-16 rounded-[1.5rem] bg-background border-none shadow-inner text-lg font-medium" 
                placeholder="Search institutional archives..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5 h-16">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest">Year & Authority</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Archive Title</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Source Context</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest">Audit Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-14 w-full rounded-2xl bg-white/5" /></TableCell></TableRow>
                ))
              ) : filteredPYQs.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-white/5 group border-white/5 transition-all duration-300">
                  <TableCell className="px-10 py-8">
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-slate-100 leading-none">{p.year}</p>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{p.boardId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                       <p className="font-black text-slate-100 text-lg group-hover:text-primary transition-colors">{p.title}</p>
                       <code className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">ID: {p.id.slice(-8)}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                           <FileText className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{p.status || 'Verified'}</p>
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all duration-500">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white/5" onClick={() => setEditingPYQ(p)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete(p.id)}>
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
        <DialogContent className="sm:max-w-2xl rounded-[3rem] bg-[#0F172A] text-white border-white/10 shadow-4xl">
          <DialogHeader className="px-4">
            <DialogTitle className="text-3xl font-black font-headline uppercase flex items-center gap-4">
               <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
               </div>
               Audit Archive
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8 py-10 px-4 custom-scrollbar max-h-[70vh] overflow-y-auto">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Archive Headline</Label>
              <Input value={editingPYQ?.title || ""} onChange={e => setEditingPYQ({...editingPYQ, title: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-16 font-black text-xl" placeholder="e.g. PSSSB Patwari 2025 Mains" />
            </div>
            
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Authority</Label>
                <Select value={editingPYQ?.boardId} onValueChange={val => setEditingPYQ({...editingPYQ, boardId: val})}>
                   <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-14 font-bold"><SelectValue placeholder="Select Board" /></SelectTrigger>
                   <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Exam Year</Label>
                <Input type="number" value={editingPYQ?.year || 2025} onChange={e => setEditingPYQ({...editingPYQ, year: parseInt(e.target.value)})} className="bg-white/5 border-white/10 rounded-2xl h-14 font-black" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Source Exam Hub</Label>
              <Select value={editingPYQ?.examId} onValueChange={val => setEditingPYQ({...editingPYQ, examId: val})}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-14 font-bold"><SelectValue placeholder="Select Vertical" /></SelectTrigger>
                  <SelectContent>{exams?.filter((e: any) => e.boardId === editingPYQ?.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Institutional PDF URI</Label>
              <Input value={editingPYQ?.pdfUrl || ""} onChange={e => setEditingPYQ({...editingPYQ, pdfUrl: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-14 font-medium" placeholder="Cloud storage link..." />
              {editingPYQ?.pdfUrl && (
                 <a href={editingPYQ.pdfUrl} target="_blank" className="text-[10px] font-black text-primary uppercase tracking-widest mt-2 flex items-center gap-2 hover:underline">
                    <ExternalLink className="h-3 w-3" /> Verify Source File
                 </a>
              )}
            </div>
          </div>
          <DialogFooter className="border-t border-white/5 p-8 flex gap-4">
            <Button variant="ghost" onClick={() => setEditingPYQ(null)} className="text-slate-400 hover:text-white rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest">Cancel Draft</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 px-12 font-black rounded-2xl shadow-3xl shadow-primary/20 h-14 uppercase tracking-widest text-[10px]">
              <Save className="h-4 w-4 mr-3" /> {editingPYQ?.id ? "Update Audit" : "Commit to Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
