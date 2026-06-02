
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, FileText, Download, Save, Search, Layers } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"

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
      createdAt: editingPYQ.createdAt || serverTimestamp()
    }

    setDoc(pyqRef, payload, { merge: true })
      .then(() => {
        toast({ title: "Archive Updated", description: "Previous paper successfully added to repository." })
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
    if (!confirm("Permanently remove this PYQ from archives?")) return
    const pyqRef = doc(db, "pyqs", id)
    deleteDoc(pyqRef)
      .then(() => {
        toast({ title: "Archived Removed", description: "Paper purged from cloud." })
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
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Archive System</span>
           </div>
          <h1 className="text-4xl font-black font-headline text-primary uppercase tracking-tight">PYQ Repository</h1>
          <p className="text-muted-foreground mt-1">Manage authentic previous year papers with verified official keys.</p>
        </div>
        <Button onClick={() => setEditingPYQ({ title: "", boardId: "", examId: "", year: new Date().getFullYear(), pdfUrl: "" })} className="bg-primary hover:bg-primary/90 gap-2 h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/20">
          <Plus className="h-5 w-5" /> Archive New Paper
        </Button>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-12 h-14 rounded-2xl bg-background border-none shadow-inner" 
                placeholder="Search archives..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5">
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Year & Board</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paper Title</TableHead>
                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={3} className="px-8"><Skeleton className="h-14 w-full rounded-xl bg-white/5" /></TableCell></TableRow>
                ))
              ) : filteredPYQs.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-white/5 group border-white/5 transition-colors">
                  <TableCell className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-lg font-black text-slate-100">{p.year}</p>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{p.boardId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-slate-100 text-base">{p.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">ARCHIVE_ID: {p.id.slice(-6)}</p>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" onClick={() => setEditingPYQ(p)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete(p.id)}>
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
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-[#0F172A] text-white border-white/10 shadow-3xl">
          <DialogHeader className="px-2">
            <DialogTitle className="text-2xl font-black font-headline uppercase">Archive Paper</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6 px-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Paper Headline</Label>
              <Input value={editingPYQ?.title || ""} onChange={e => setEditingPYQ({...editingPYQ, title: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-14 font-bold" placeholder="e.g. Patwari 2025 Phase 1" />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Authority</Label>
                <Select value={editingPYQ?.boardId} onValueChange={val => setEditingPYQ({...editingPYQ, boardId: val})}>
                   <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12"><SelectValue placeholder="Board" /></SelectTrigger>
                   <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Exam Year</Label>
                <Input type="number" value={editingPYQ?.year || 2025} onChange={e => setEditingPYQ({...editingPYQ, year: parseInt(e.target.value)})} className="bg-white/5 border-white/10 rounded-xl h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Archive Exam Hub</Label>
              <Select value={editingPYQ?.examId} onValueChange={val => setEditingPYQ({...editingPYQ, examId: val})}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12"><SelectValue placeholder="Select Exam Hub" /></SelectTrigger>
                  <SelectContent>{exams?.filter((e: any) => e.boardId === editingPYQ?.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Verification PDF URL</Label>
              <Input value={editingPYQ?.pdfUrl || ""} onChange={e => setEditingPYQ({...editingPYQ, pdfUrl: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-12" placeholder="Institutional Cloud Link..." />
            </div>
          </div>
          <DialogFooter className="border-t border-white/5 pt-6 px-2 flex gap-3">
            <Button variant="ghost" onClick={() => setEditingPYQ(null)} className="text-slate-400 hover:text-white rounded-xl">Cancel Archival</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 px-10 font-bold rounded-xl shadow-2xl shadow-primary/20 h-12">
              <Save className="h-5 w-5 mr-3" /> {editingPYQ?.id ? "Update Archive" : "Commit to Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
