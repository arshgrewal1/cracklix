
"use client"

import { useState, useMemo, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Image as ImageIcon, Trash2, Save, Globe, Upload, Loader2, X, Layers, Shield, GraduationCap, Zap, Landmark } from "lucide-react"
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
 * @fileOverview Authority Hub v61.0.
 * UPDATED: Added prominent delete options in both table and dialog.
 * FIXED: Unterminated string constant on top-bar indicator resolved.
 */

export default function ExamManagement() {
  const db = useFirestore()
  const storage = useStorage()
  const { toast } = useToast()
  
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])
  const categoriesQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db])
  
  const { data: boards, loading } = useCollection<any>(boardsQuery)
  const { data: categories } = useCollection<any>(categoriesQuery)
  
  const [editingBoard, setEditingBoard] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleDelete = async (e: React.MouseEvent | React.FocusEvent | any, id: string) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    if (!id || !db) return
    
    const confirmMsg = "CRITICAL AUDIT: Permanently purge this authority hub from the global registry? This action is irreversible and may affect linked exams.";
    if (!window.confirm(confirmMsg)) return
    
    setIsDeleting(id)
    try {
      const boardRef = doc(db, "boards", id)
      await deleteDoc(boardRef)
      toast({ title: "Registry Purged", description: "Official Hub node removed from cloud." })
      if (editingBoard?.id === id) setEditingBoard(null);
    } catch (serverError: any) {
      toast({ variant: "destructive", title: "Purge Failed" })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file || !storage) return

    setIsUploading(true)
    const uploadRef = ref(storage, `authority_logos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`)

    try {
      const snapshot = await uploadBytes(uploadRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      setEditingBoard((prev: any) => ({ ...prev, iconUrl: downloadURL }))
      toast({ title: "Asset Synced", description: "Logo updated in storage." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-12 pb-24 text-[#0F172A] text-left pt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Globe className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Board Registry</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-primary uppercase tracking-tight">Authority Hub</h1>
          <p className="text-slate-600 mt-1 font-medium">Manage institutional identities for all Punjab and National recruitment boards.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl gap-3" onClick={() => setEditingBoard({ abbreviation: "", name: "", description: "", iconUrl: "", categoryId: "" })}>
          <Plus className="h-5 w-5" /> Add New Hub
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-6">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-white/5 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Hub Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Context</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Official Name</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-10 py-5"><Skeleton className="h-14 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : boards?.map((board: any) => {
                const category = categories?.find(c => c.id === board.categoryId);
                
                const id = board.id?.toLowerCase() || "";
                const abbrev = board.abbreviation?.toLowerCase() || "";
                const isPolice = id.includes('police') || abbrev === 'police';
                const isTeaching = board.categoryId === 'punjab-teaching';
                const isTechnical = board.categoryId === 'punjab-technical';

                const effectiveLogo = board.iconUrl || category?.iconUrl;

                return (
                  <TableRow key={board.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                    <TableCell className="px-10 py-6">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden relative shadow-inner group-hover:scale-110 transition-transform">
                          {effectiveLogo && !failedImages[board.id] ? (
                            <img 
                              src={effectiveLogo} 
                              className="h-full w-full object-contain p-2" 
                              referrerPolicy="no-referrer"
                              alt={board.abbreviation}
                              onError={() => setFailedImages(p => ({...p, [board.id]: true}))}
                            />
                          ) : (
                            <div className="text-primary opacity-40">
                               {isPolice ? <Shield className="h-8 w-8" /> : 
                                isTeaching ? <GraduationCap className="h-8 w-8" /> : 
                                isTechnical ? <Zap className="h-8 w-8" /> :
                                <Landmark className="h-8 w-8" />}
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-1">
                          <p className="font-headline font-black text-primary text-xl tracking-tighter uppercase leading-none">{board.abbreviation}</p>
                          <Badge variant="outline" className="bg-white border-slate-100 text-slate-400 text-[8px] font-black uppercase w-fit px-1.5">{category?.title || "UNCATEGORIZED"}</Badge>
                       </div>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-slate-800 leading-tight max-w-xs">{board.name}</TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                         <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-white shadow-sm" onClick={() => setEditingBoard(board)}><Edit className="h-5 w-5" /></Button>
                         <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-rose-50 hover:text-rose-600" onClick={(e) => handleDelete(e, board.id)} disabled={isDeleting === board.id}><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingBoard} onOpenChange={(open) => !open && !isSaving && !isUploading && setEditingBoard(null)}>
        <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-[#0F172A]" />
          <DialogHeader className="p-10 pb-0 text-left">
            <div className="flex justify-between items-center">
               <DialogTitle className="text-2xl font-black font-headline uppercase text-[#0F172A]">{editingBoard?.id ? "Update Hub Node" : "New Official Hub"}</DialogTitle>
               <button onClick={() => setEditingBoard(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
          </DialogHeader>
          
          <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col items-center gap-6">
              <div className="h-36 w-36 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                 {isUploading ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : (
                    <div className="relative h-full w-full flex items-center justify-center bg-transparent p-2">
                      {editingBoard?.iconUrl ? (
                        <img src={editingBoard.iconUrl} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" alt="Preview" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-30"><ImageIcon className="h-8 w-8 text-slate-400" /><span className="text-[8px] font-black uppercase text-slate-400">No Logo</span></div>
                      )}
                    </div>
                 )}
              </div>
              <Button variant="outline" className="w-full h-14 rounded-xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isSaving}>
                <Upload className="h-4 w-4 text-primary" /> {isUploading ? "Syncing..." : "Upload Official Logo"}
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }} />
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-50">
              <div className="space-y-2"><Label className="text-[9px] font-black uppercase text-slate-400">Vertical Category</Label><select value={editingBoard?.categoryId || ""} onChange={e => setEditingBoard({...editingBoard, categoryId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-black uppercase text-[10px] outline-none shadow-inner"><option value="">Select Category</option>{categories?.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label className="text-[9px] font-black uppercase text-slate-400">Short Code</Label><input value={editingBoard?.abbreviation || ""} onChange={e => setEditingBoard({...editingBoard, abbreviation: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl h-12 font-black uppercase px-4 outline-none text-[#0F172A]" /></div>
                 <div className="space-y-2"><Label className="text-[9px] font-black uppercase text-slate-400">Official Hub Name</Label><input value={editingBoard?.name || ""} onChange={e => setEditingBoard({...editingBoard, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl h-12 font-bold px-4 outline-none text-[#0F172A]" /></div>
              </div>
            </div>

            {editingBoard?.id && (
               <div className="pt-6 border-t border-slate-50">
                  <Button variant="ghost" className="w-full h-14 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-black uppercase text-[10px] tracking-widest gap-3" onClick={() => handleDelete(null, editingBoard.id)} disabled={isDeleting === editingBoard.id}>
                     <Trash2 className="h-4 w-4" /> Purge Hub from Registry
                  </Button>
               </div>
            )}
          </div>

          <DialogFooter className="p-10 pt-4 flex gap-4 border-t border-slate-50">
            <Button variant="ghost" onClick={() => setEditingBoard(null)} className="rounded-xl h-12 px-6 font-bold text-slate-400">Cancel</Button>
            <Button className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-12 px-10 font-black uppercase tracking-widest text-[10px] gap-3 flex-1" onClick={handleSave} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
