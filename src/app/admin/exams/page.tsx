"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Image as ImageIcon, Trash2, Save, Globe, Upload, Loader2, AlertCircle, RefreshCw, X, ShieldCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useCollection, useFirestore, useStorage } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

/**
 * @fileOverview Authority Hub v5.0 - Institutional Board Registry.
 * Fixed: Robust upload pipeline with stable timeout and error recovery.
 */

export default function ExamManagement() {
  const db = useFirestore()
  const storage = useStorage()
  const { toast } = useToast()
  
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])
  const { data: boards, loading } = useCollection<any>(boardsQuery)
  
  const [editingBoard, setEditingBoard] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [assetError, setAssetError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Official State Emblem Fallback
  const stateEmblem = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Emblem_of_Punjab.svg/512px-Emblem_of_Punjab.svg.png";

  useEffect(() => {
    setAssetError(false);
  }, [editingBoard?.id, editingBoard?.iconUrl]);

  const handleSave = async () => {
    if (!db || !editingBoard) return
    
    if (!editingBoard.abbreviation || !editingBoard.name) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Short Code and Full Name are mandatory." })
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage) return

    console.log("[STORAGE] Starting upload node for:", file.name);
    setIsUploading(true)
    setAssetError(false)
    
    // Safety timeout: If upload doesn't finish in 30s, force reset using a stable reference
    const timer = setTimeout(() => {
       setIsUploading(false);
       toast({ variant: "destructive", title: "Sync Timeout", description: "Storage response took too long. Check your rules or use URL override." });
       console.error("[STORAGE] Pipeline stalled. Check Rules.");
    }, 30000);

    try {
      const storageRef = ref(storage, `authority_logos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      setEditingBoard((prev: any) => ({ ...prev, iconUrl: downloadURL }))
      toast({ title: "Asset Synced", description: "Logo updated in storage." })
      console.log("[STORAGE] Node success:", downloadURL);
    } catch (error: any) {
      console.error("[STORAGE] Node failure:", error);
      toast({ variant: "destructive", title: "Upload Failed", description: error.message || "Storage rejection." })
    } finally {
      clearTimeout(timer);
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-12 pb-24 text-[#0F172A] text-left pt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Board Registry</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-primary uppercase tracking-tight">Authority Hub</h1>
          <p className="text-slate-600 mt-1 font-medium">Manage institutional identities for all Punjab recruitment boards.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl gap-3" onClick={() => setEditingBoard({ abbreviation: "", name: "", description: "", iconUrl: "" })}>
          <Plus className="h-5 w-5" /> Add New Authority
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-6">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-white/5 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Short Code</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authority Name</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-10 py-5"><Skeleton className="h-14 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : boards?.map((board: any) => (
                <TableRow key={board.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                  <TableCell className="px-10 py-6">
                    <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden relative shadow-inner group-hover:scale-110 transition-transform">
                        <img 
                          src={board.iconUrl || stateEmblem} 
                          className="h-full w-full object-contain p-2" 
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          alt={board.abbreviation}
                          onError={(e) => { (e.target as HTMLImageElement).src = stateEmblem }}
                        />
                    </div>
                  </TableCell>
                  <TableCell className="font-headline font-black text-primary text-xl tracking-tighter uppercase">{board.abbreviation}</TableCell>
                  <TableCell className="text-sm font-bold text-slate-800 leading-tight max-w-xs">{board.name}</TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-slate-100" onClick={() => setEditingBoard(board)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingBoard} onOpenChange={(open) => !open && !isSaving && !isUploading && setEditingBoard(null)}>
        <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left">
          <div className="h-2 w-full bg-[#0F172A]" />
          <DialogHeader className="p-10 pb-0 text-left">
            <div className="flex justify-between items-center">
               <DialogTitle className="text-2xl font-black font-headline uppercase text-[#0F172A]">{editingBoard?.id ? "Update Registry" : "New Authority Node"}</DialogTitle>
               <button onClick={() => setEditingBoard(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
          </DialogHeader>
          
          <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col items-center gap-6">
              <div className="h-36 w-36 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                 {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="h-8 w-8 text-primary animate-spin" />
                       <span className="text-[9px] font-black text-primary uppercase tracking-widest">Syncing Asset...</span>
                    </div>
                 ) : (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img 
                        src={editingBoard?.iconUrl || stateEmblem} 
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" 
                        alt="Preview"
                        onError={(e) => { 
                          if (editingBoard?.iconUrl) setAssetError(true);
                          (e.target as HTMLImageElement).src = stateEmblem;
                        }}
                      />
                      {assetError && editingBoard?.iconUrl && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                           <AlertCircle className="h-6 w-6 text-rose-500 mb-1" />
                           <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest leading-tight">Invalid Asset URL</span>
                        </div>
                      )}
                    </div>
                 )}
              </div>
              
              <div className="w-full space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-slate-50 shadow-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isSaving}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4 text-primary" />}
                    {isUploading ? "Uploading to Storage..." : "Upload Device Logo"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary gap-2"
                    onClick={() => setEditingBoard({...editingBoard, iconUrl: stateEmblem})}
                  >
                    <RefreshCw className="h-3 w-3" /> Restore Official Emblem
                  </Button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-50">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Short Code (e.g. PSPCL)</Label>
                    <Input value={editingBoard?.abbreviation || ""} onChange={e => setEditingBoard({...editingBoard, abbreviation: e.target.value.toUpperCase()})} className="bg-slate-50 border-none rounded-xl h-12 font-black uppercase" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Registry Name</Label>
                    <Input value={editingBoard?.name || ""} onChange={e => setEditingBoard({...editingBoard, name: e.target.value})} className="bg-slate-50 border-none rounded-xl h-12 font-bold" />
                 </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center justify-between">
                  Logo URL (Manual Entry / Override)
                  {editingBoard?.iconUrl && <button onClick={() => setEditingBoard({...editingBoard, iconUrl: ""})} className="text-rose-500 hover:underline">Clear</button>}
                </Label>
                <Input value={editingBoard?.iconUrl || ""} onChange={e => setEditingBoard({...editingBoard, iconUrl: e.target.value.trim()})} className="bg-slate-50 border-none rounded-xl h-12 text-[10px] font-mono" placeholder="https://..." />
                <p className="text-[8px] text-slate-400 font-bold uppercase italic">Use this field if your storage upload hangs or to use a direct government URL.</p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-10 pt-4 flex gap-4 border-t border-slate-50 bg-slate-50/30">
            <Button variant="ghost" onClick={() => setEditingBoard(null)} disabled={isSaving || isUploading} className="rounded-xl h-12 px-6 font-bold text-slate-400">Cancel</Button>
            <Button className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-12 px-10 font-black uppercase tracking-widest text-[10px] shadow-2xl gap-3 transition-all active:scale-95" onClick={handleSave} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit to Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}