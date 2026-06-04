"use client"

import { useState, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Image as ImageIcon, Trash2, Save, Globe, Upload, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Image from "next/image"
import { useCollection, useFirestore, useStorage } from "@/firebase"
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"

/**
 * @fileOverview Authority Hub - Recruitment Board Management.
 * Updated: Direct File Upload to Firebase Storage and CORS/Referrer Fixes for Wikimedia logos.
 */

export default function ExamManagement() {
  const db = useFirestore()
  const storage = useStorage()
  const { toast } = useToast()
  const { data: boards, loading } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  
  const [editingBoard, setEditingBoard] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    if (!db || !editingBoard) return
    const boardRef = doc(db, "boards", editingBoard.id || `board-${Date.now()}`)
    const payload = { ...editingBoard, id: boardRef.id }
    
    setDoc(boardRef, payload, { merge: true })
      .then(() => {
        toast({ title: "Audit Success", description: "Recruitment board configuration updated in global registry." })
        setEditingBoard(null)
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: boardRef.path,
          operation: 'write',
          requestResourceData: payload,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const handleDelete = (id: string) => {
    if (!confirm("Permanently remove this authority from the institutional database?")) return
    const boardRef = doc(db!, "boards", id)
    deleteDoc(boardRef)
      .then(() => {
        toast({ title: "Authority Deleted", description: "Board removed from cloud repository." })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: boardRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage) return

    setIsUploading(true)
    const storageRef = ref(storage, `authority_logos/${Date.now()}_${file.name}`)

    try {
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      setEditingBoard({ ...editingBoard, iconUrl: downloadURL })
      toast({ title: "Upload Complete", description: "Logo successfully synchronized with institutional storage." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Board Registry</span>
           </div>
          <h1 className="text-4xl font-headline font-black text-primary uppercase tracking-tight">Authority Hub</h1>
          <p className="text-muted-foreground mt-1">Manage official Punjab Government recruitment boards and their visual identity.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 gap-3" onClick={() => setEditingBoard({ abbreviation: "", name: "", description: "", iconUrl: "" })}>
          <Plus className="h-5 w-5" /> Add Authority
        </Button>
      </div>

      <Card className="border-none shadow-3xl shadow-slate-900/5 bg-card/50 rounded-[3rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5 h-16">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authority</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5"><TableCell colSpan={4} className="px-10 py-5"><Skeleton className="h-14 w-full rounded-2xl bg-white/5" /></TableCell></TableRow>
                ))
              ) : boards?.map((board: any) => (
                <TableRow key={board.id} className="hover:bg-white/5 group border-white/5 transition-all">
                  <TableCell className="px-10 py-6">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-white/10 flex items-center justify-center overflow-hidden relative shadow-inner group-hover:scale-110 transition-transform">
                      {board.iconUrl ? (
                        <img 
                          src={board.iconUrl} 
                          alt={board.abbreviation || 'Board'} 
                          className="h-full w-full object-contain p-2" 
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-700" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-headline font-black text-primary text-lg tracking-tighter uppercase">{board.abbreviation}</TableCell>
                  <TableCell className="text-sm font-bold text-slate-300 leading-tight max-w-xs">{board.name}</TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" onClick={() => setEditingBoard(board)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete(board.id)}>
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

      <Dialog open={!!editingBoard} onOpenChange={(open) => !open && setEditingBoard(null)}>
        <DialogContent className="sm:max-w-md rounded-[3rem] bg-[#0F172A] text-white border-white/10 shadow-4xl p-0 overflow-hidden">
          <div className="h-2 w-full bg-primary" />
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-3xl font-black font-headline uppercase">{editingBoard?.id ? "Update Authority" : "New Recruitment Board"}</DialogTitle>
          </DialogHeader>
          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col items-center gap-6">
              <div className="h-32 w-32 rounded-[2rem] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center relative overflow-hidden group shadow-inner">
                 {editingBoard?.iconUrl ? (
                    <img 
                      src={editingBoard.iconUrl} 
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" 
                      alt="Preview"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/200x200?text=Invalid+URL";
                      }}
                    />
                 ) : (
                    <ImageIcon className="h-10 w-10 text-slate-500" />
                 )}
              </div>
              
              <div className="flex gap-3 w-full">
                 <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                 >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isUploading ? "Syncing..." : "Upload Logo"}
                 </Button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                 />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Icon Reference URL (Auto-filled on upload)</Label>
                <Input value={editingBoard?.iconUrl || ""} onChange={e => setEditingBoard({...editingBoard, iconUrl: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-12 text-xs font-mono text-slate-400" placeholder="External URL or direct link..." />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Abbreviation (e.g. PSSSB)</Label>
                <Input value={editingBoard?.abbreviation || ""} onChange={e => setEditingBoard({...editingBoard, abbreviation: e.target.value.toUpperCase()})} className="bg-white/5 border-white/10 rounded-xl h-12 font-black uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Full Authority Name</Label>
                <Input value={editingBoard?.name || ""} onChange={e => setEditingBoard({...editingBoard, name: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-12 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Description</Label>
                <Input value={editingBoard?.description || ""} onChange={e => setEditingBoard({...editingBoard, description: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-12 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter className="p-10 pt-0 flex gap-4 border-t border-white/5 pt-6">
            <Button variant="ghost" onClick={() => setEditingBoard(null)} className="rounded-xl h-12 px-6 font-bold text-slate-400 hover:text-white">Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90 rounded-xl h-12 px-10 font-black uppercase tracking-widest text-xs shadow-2xl" onClick={handleSave}>
              <Save className="h-4 w-4 mr-3" /> {editingBoard?.id ? "Sync Configuration" : "Initialize Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
