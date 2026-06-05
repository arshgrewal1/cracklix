"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Image as ImageIcon, Trash2, Save, Globe, Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useCollection, useFirestore, useStorage } from "@/firebase"
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"

/**
 * @fileOverview Authority Hub - Recruitment Board Management v6.0.
 * Fixed: Eager "Invalid Asset" validation bug.
 * Features: Robust Storage Upload, Lifecycle Logging, and Idle-State Placeholders.
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

  // Reset asset error when modal changes or URL changes
  useEffect(() => {
    setAssetError(false);
    if (editingBoard) {
       console.log("[LOG] Modal Interaction Node Opened:", editingBoard.id || "NEW_ENTRY");
    }
  }, [editingBoard?.id, editingBoard?.iconUrl]);

  const handleSave = async () => {
    if (!db || !editingBoard) return
    
    if (!editingBoard.abbreviation || !editingBoard.name) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Identity and Authority Name are mandatory." })
      return
    }

    setIsSaving(true)
    const boardId = editingBoard.id || `board-${Date.now()}`
    const boardRef = doc(db, "boards", boardId)
    const payload = { 
      ...editingBoard, 
      id: boardId,
      updatedAt: new Date().toISOString()
    }
    
    try {
      await setDoc(boardRef, payload, { merge: true })
      toast({ title: "Audit Success", description: "Recruitment board configuration updated in global registry." })
      setEditingBoard(null)
    } catch (serverError: any) {
      const permissionError = new FirestorePermissionError({
        path: boardRef.path,
        operation: 'write',
        requestResourceData: payload,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently remove this authority from the institutional database?")) return
    const boardRef = doc(db!, "boards", id)
    try {
      await deleteDoc(boardRef)
      toast({ title: "Authority Deleted", description: "Board removed from cloud repository." })
    } catch (serverError: any) {
      const permissionError = new FirestorePermissionError({
        path: boardRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage) {
       toast({ variant: "destructive", title: "Storage Offline", description: "Firebase Storage is not initialized." })
       return
    }

    if (!file.type.startsWith('image/')) {
       toast({ variant: "destructive", title: "Invalid Type", description: "Only image files (PNG, JPG, SVG) are supported." })
       return
    }

    console.log("[STORAGE] Upload Cycle Initiated:", file.name);
    setIsUploading(true)
    setAssetError(false)
    
    const timeoutId = setTimeout(() => {
       if (isUploading) {
          setIsUploading(false);
          toast({ variant: "destructive", title: "Upload Timeout", description: "Storage sync timed out. Check connection." });
          console.error("[STORAGE] Upload Timed Out after 30s");
       }
    }, 30000);

    const storageRef = ref(storage, `authority_logos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`)

    try {
      const snapshot = await uploadBytes(storageRef, file)
      console.log("[STORAGE] Block Written Successfully:", snapshot.metadata.fullPath);
      
      const downloadURL = await getDownloadURL(snapshot.ref)
      console.log("[STORAGE] High-Fidelity URL Generated:", downloadURL);
      
      setEditingBoard({ ...editingBoard, iconUrl: downloadURL })
      toast({ title: "Upload Complete", description: "Logo successfully synchronized with institutional storage." })
    } catch (error: any) {
      console.error("[STORAGE] Upload Failed Error Code:", error.code);
      toast({ variant: "destructive", title: "Upload Failed", description: error.message || "Could not reach storage node." })
    } finally {
      clearTimeout(timeoutId);
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-12 pb-24 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Board Registry</span>
           </div>
          <h1 className="text-4xl font-headline font-black text-primary uppercase tracking-tight">Authority Hub</h1>
          <p className="text-slate-600 mt-1 font-medium">Manage official recruitment boards and their visual identities.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 gap-3" onClick={() => setEditingBoard({ abbreviation: "", name: "", description: "", iconUrl: "" })}>
          <Plus className="h-5 w-5" /> Add Authority
        </Button>
      </div>

      <Card className="border-none shadow-3xl shadow-slate-900/5 bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
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
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-10 py-5"><Skeleton className="h-14 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : boards?.map((board: any) => (
                <TableRow key={board.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                  <TableCell className="px-10 py-6">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden relative shadow-inner group-hover:scale-110 transition-transform">
                      {board.iconUrl ? (
                        <img 
                          src={board.iconUrl} 
                          alt={board.abbreviation || 'Board'} 
                          className="h-full w-full object-contain p-2" 
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-headline font-black text-primary text-lg tracking-tighter uppercase">{board.abbreviation}</TableCell>
                  <TableCell className="text-sm font-bold text-slate-800 leading-tight max-w-xs">{board.name}</TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100" onClick={() => setEditingBoard(board)}>
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

      <Dialog open={!!editingBoard} onOpenChange={(open) => !open && !isSaving && !isUploading && setEditingBoard(null)}>
        <DialogContent className="sm:max-w-lg rounded-[3rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left">
          <div className="h-2 w-full bg-[#0F172A]" />
          <DialogHeader className="p-10 pb-0 text-left">
            <DialogTitle className="text-2xl font-black font-headline uppercase text-[#0F172A]">{editingBoard?.id ? "Update Authority" : "New Recruitment Board"}</DialogTitle>
          </DialogHeader>
          
          <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col items-center gap-6">
              <div className="h-32 w-32 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                 {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="h-8 w-8 text-primary animate-spin" />
                       <span className="text-[8px] font-black text-primary uppercase tracking-widest">Syncing Asset...</span>
                    </div>
                 ) : editingBoard?.iconUrl && !assetError ? (
                    <img 
                      src={editingBoard.iconUrl} 
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" 
                      alt="Preview"
                      onError={() => {
                        console.error("[PREVIEW] Image load failed for URL:", editingBoard.iconUrl);
                        setAssetError(true);
                      }}
                    />
                 ) : (
                    <div className="flex flex-col items-center gap-2">
                       {assetError ? <AlertCircle className="h-8 w-8 text-rose-500" /> : <ImageIcon className="h-8 w-8 text-slate-300" />}
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          {assetError ? "Invalid Asset" : "No Logo Uploaded"}
                       </span>
                    </div>
                 )}
              </div>
              
              <div className="flex gap-3 w-full">
                 <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-slate-50 shadow-sm"
                    onClick={() => {
                       console.log("[LOG] File Picker Triggered");
                       fileInputRef.current?.click();
                    }}
                    disabled={isUploading || isSaving}
                 >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4 text-primary" />}
                    {isUploading ? "Uploading..." : "Upload Device Logo"}
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
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Abbreviation (e.g. PSSSB)</Label>
                    <Input value={editingBoard?.abbreviation || ""} onChange={e => setEditingBoard({...editingBoard, abbreviation: e.target.value.toUpperCase()})} className="bg-slate-50 border-none rounded-xl h-12 font-black uppercase" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Asset URL</Label>
                    <Input value={editingBoard?.iconUrl || ""} onChange={e => setEditingBoard({...editingBoard, iconUrl: e.target.value.trim()})} className="bg-slate-50 border-none rounded-xl h-12 text-[10px] font-mono text-slate-500" placeholder="https://..." />
                 </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Authority Name</Label>
                <Input value={editingBoard?.name || ""} onChange={e => setEditingBoard({...editingBoard, name: e.target.value})} className="bg-slate-50 border-none rounded-xl h-12 font-bold" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Registry Description</Label>
                <Input value={editingBoard?.description || ""} onChange={e => setEditingBoard({...editingBoard, description: e.target.value})} className="bg-slate-50 border-none rounded-xl h-12 text-sm" />
              </div>
            </div>
          </div>

          <DialogFooter className="p-10 pt-4 flex gap-4 border-t border-slate-50 bg-slate-50/30">
            <Button variant="ghost" onClick={() => setEditingBoard(null)} disabled={isSaving || isUploading} className="rounded-xl h-12 px-6 font-bold text-slate-400 hover:text-[#0F172A]">Cancel Draft</Button>
            <Button className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-12 px-10 font-black uppercase tracking-widest text-[10px] shadow-2xl gap-3 transition-all active:scale-95" onClick={handleSave} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Syncing..." : (editingBoard?.id ? "Update Registry" : "Initialize Board")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
