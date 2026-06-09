
"use client"

import { useState, useMemo, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Image as ImageIcon, Trash2, Save, Globe, Upload, Loader2, X, Layers, Shield, GraduationCap, Zap, Landmark, MoveUp, MoveDown, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useCollection, useFirestore, useStorage } from "@/firebase"
import { collection, query, doc, deleteDoc, setDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

/**
 * @fileOverview Authority Hub v64.0.
 * UPDATED: High-Fidelity layout matching Mock Architect.
 */

export default function ExamManagement() {
  const db = useFirestore()
  const storage = useStorage()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("displayOrder", "asc")) : null), [db])
  const categoriesQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db])
  
  const { data: boards, loading } = useCollection<any>(boardsQuery)
  const { data: categories } = useCollection<any>(categoriesQuery)
  
  const [editingBoard, setEditingBoard] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredBoards = useMemo(() => {
    if (!boards) return []
    return boards.filter(b => 
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [boards, searchTerm])

  const handleSave = async () => {
    if (!db || !editingBoard) return
    if (!editingBoard.abbreviation || !editingBoard.name || !editingBoard.categoryId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Short Code, Name, and Category are mandatory." })
      return
    }

    setIsSaving(true)
    const boardId = editingBoard.id || `board-${Date.now()}`
    const boardRef = doc(db, "boards", boardId)
    
    const payload = { 
      ...editingBoard, 
      id: boardId,
      displayOrder: parseInt(editingBoard.displayOrder) || 1,
      updatedAt: serverTimestamp()
    }
    
    try {
      await setDoc(boardRef, payload, { merge: true })
      toast({ title: "Audit Success", description: "Registry node updated." })
      setEditingBoard(null)
    } catch (serverError: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: boardRef.path, operation: 'write' }));
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!id || !db) return
    if (!window.confirm("CRITICAL AUDIT: Permanently purge this authority hub?")) return
    
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, "boards", id))
      toast({ title: "Registry Purged" })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-10 pb-32 text-left pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Official Board Registry</span>
           </div>
          <h1 className="text-4xl md:text-6xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Authority Hub</h1>
          <p className="text-slate-500 font-medium text-lg">Manage institutional identities for recruitment boards.</p>
        </div>
        <Button onClick={() => setEditingBoard({ abbreviation: "", name: "", description: "", iconUrl: "", categoryId: "", displayOrder: (boards?.length || 0) + 1 })} className="bg-[#0F172A] hover:bg-black text-white h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-3xl gap-3 transition-all active:scale-95 border-none">
          <Plus className="h-5 w-5 text-primary" /> Deploy New Hub
        </Button>
      </div>

      <div className="px-4">
        <div className="relative group max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            className="h-16 pl-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-lg font-medium" 
            placeholder="Search authority by name or code..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-white/5 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Hub Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vertical Category</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-10 py-5"><Skeleton className="h-14 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredBoards.map((board: any) => (
                <TableRow key={board.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden relative shadow-inner">
                          {board.iconUrl && !failedImages[board.id] ? (
                            <img src={board.iconUrl} className="h-full w-full object-contain p-2" onError={() => setFailedImages(p => ({...p, [board.id]: true}))} referrerPolicy="no-referrer" />
                          ) : (
                            <Landmark className="h-8 w-8 text-slate-300" />
                          )}
                      </div>
                      <div>
                         <p className="font-headline font-black text-primary text-xl uppercase leading-none">{board.abbreviation}</p>
                         <p className="text-sm font-bold text-slate-600 mt-1">{board.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 text-[9px] font-black uppercase px-3 py-1">
                        {categories?.find((c: any) => c.id === board.categoryId)?.title || "GENERAL"}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-white shadow-sm" onClick={() => setEditingBoard(board)}><Edit className="h-5 w-5" /></Button>
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(board.id)} disabled={isDeleting === board.id}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingBoard} onOpenChange={(open) => !open && !isSaving && setEditingBoard(null)}>
        <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-[#0F172A]" />
          <DialogHeader className="p-10 pb-0">
             <DialogTitle className="text-2xl font-black font-headline uppercase text-[#0F172A]">Authority Registry</DialogTitle>
          </DialogHeader>
          <div className="p-10 space-y-8">
             <div className="flex flex-col items-center gap-6">
                <div className="h-32 w-32 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                   {editingBoard?.iconUrl ? <img src={editingBoard.iconUrl} className="h-full w-full object-contain p-4" /> : <ImageIcon className="h-10 w-10 text-slate-300" />}
                </div>
                <Button variant="outline" className="h-11 px-8 rounded-xl font-black uppercase text-[9px] gap-2 border-slate-200" onClick={() => fileInputRef.current?.click()}>
                   <Upload className="h-4 w-4" /> Upload Hub Logo
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                   const file = e.target.files?.[0];
                   if (file && storage) {
                      setIsUploading(true);
                      const uploadRef = ref(storage, `authority_logos/${Date.now()}_${file.name}`);
                      const snap = await uploadBytes(uploadRef, file);
                      const url = await getDownloadURL(snap.ref);
                      setEditingBoard({...editingBoard, iconUrl: url});
                      setIsUploading(false);
                   }
                }} />
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Short Code</Label><Input value={editingBoard?.abbreviation || ""} onChange={e => setEditingBoard({...editingBoard, abbreviation: e.target.value.toUpperCase()})} className="h-12 rounded-xl font-black uppercase" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Official Hub Name</Label><Input value={editingBoard?.name || ""} onChange={e => setEditingBoard({...editingBoard, name: e.target.value})} className="h-12 rounded-xl font-bold" /></div>
             </div>
             <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Vertical Category</Label><select value={editingBoard?.categoryId || ""} onChange={e => setEditingBoard({...editingBoard, categoryId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-black uppercase text-[10px] outline-none shadow-inner"><option value="">Select Category</option>{categories?.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
          </div>
          <DialogFooter className="p-10 pt-4 bg-slate-50 flex gap-4">
            <Button variant="ghost" onClick={() => setEditingBoard(null)} className="rounded-xl h-12 px-6 font-bold text-slate-400">Cancel</Button>
            <Button className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-12 px-10 font-black uppercase tracking-widest text-[10px] flex-1 shadow-xl" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Hub Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
