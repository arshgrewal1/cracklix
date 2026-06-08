"use client"

import { useState, useMemo, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Image as ImageIcon, Trash2, Save, Globe, Upload, Loader2, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useCollection, useFirestore, useStorage } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Authority Hub v29.0 - Hardened Mandatory Branding Engine.
 * Features: Persistent official logos for PSSSB, PSPCL, CTET, PSTET, and PSEB.
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const psssbOfficialLogo = "https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg";
  const pspclOfficialLogo = "https://pspcl.in/assets/images/logo.png";
  const ctetOfficialLogo = "https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png";
  const pstetOfficialLogo = "https://pstet.pseb.ac.in/img/main-logo-2.png";
  const psebOfficialLogo = "https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png";

  const handleSave = async () => {
    if (!db || !editingBoard) return
    
    if (!editingBoard.abbreviation || !editingBoard.name) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Short Code and Full Name are mandatory." })
      return
    }

    setIsSaving(true)
    const boardId = editingBoard.id || `board-${Date.now()}`
    const boardRef = doc(db, "boards", boardId)
    
    // MANDATORY BRANDING PROTOCOL
    const abbrev = editingBoard.abbreviation?.toUpperCase();
    const isPsssb = abbrev === 'PSSSB';
    const isPspcl = abbrev === 'PSPCL' || abbrev === 'PSTCL';
    const isCtet = abbrev === 'CTET' || abbrev === 'CBSE';
    const isPstet = abbrev === 'PSTET';
    const isEducation = abbrev === 'EDUCATION' || abbrev === 'PSEB';
    
    const payload = { 
      ...editingBoard, 
      id: boardId,
      iconUrl: isPsssb ? psssbOfficialLogo : 
               isPspcl ? pspclOfficialLogo : 
               isCtet ? ctetOfficialLogo : 
               isPstet ? pstetOfficialLogo :
               isEducation ? psebOfficialLogo :
               (editingBoard.iconUrl || ""),
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id || !db) return
    
    const confirmMsg = "CRITICAL AUDIT: Permanently purge this authority from the global registry? This action is irreversible.";
    if (!window.confirm(confirmMsg)) return
    
    setIsDeleting(id)
    try {
      const boardRef = doc(db, "boards", id)
      await deleteDoc(boardRef)
      toast({ title: "Registry Purged", description: "Authority node removed from cloud." })
    } catch (serverError: any) {
      console.error("Delete Rejection:", serverError)
      toast({ variant: "destructive", title: "Purge Failed", description: "Cloud registry sync rejected." })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage) return

    setIsUploading(true)
    const uploadRef = ref(storage, `authority_logos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`)

    try {
      const snapshot = await uploadBytes(uploadRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      setEditingBoard((prev: any) => ({ ...prev, iconUrl: downloadURL }))
      toast({ title: "Asset Synced", description: "Logo updated in storage." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message || "Storage rejection." })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
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
                <TableHead className="text-[10px) font-black uppercase tracking-widest text-slate-400">Short Code</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authority Name</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-10 py-5"><Skeleton className="h-14 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : boards?.map((board: any) => {
                const isImageFailed = failedImages[board.id];
                const abbrev = board.abbreviation?.toUpperCase();
                const isPsssb = abbrev === 'PSSSB';
                const isPspcl = abbrev === 'PSPCL' || abbrev === 'PSTCL';
                const isCtet = abbrev === 'CTET' || abbrev === 'CBSE';
                const isPstet = abbrev === 'PSTET';
                const isEducation = abbrev === 'EDUCATION' || abbrev === 'PSEB';
                const isArmy = board.id?.toLowerCase() === 'army' || abbrev === 'ARMY';
                
                const effectiveIcon = isPsssb ? psssbOfficialLogo : 
                                     isPspcl ? pspclOfficialLogo : 
                                     isCtet ? ctetOfficialLogo : 
                                     isPstet ? pstetOfficialLogo :
                                     isEducation ? psebOfficialLogo :
                                     board.iconUrl;

                return (
                  <TableRow key={board.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                    <TableCell className="px-10 py-6">
                      <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden relative shadow-inner group-hover:scale-110 transition-transform">
                          {isImageFailed || !effectiveIcon ? (
                             <div className="bg-primary text-white h-full w-full flex items-center justify-center font-black text-xl">
                                {board.abbreviation?.substring(0, 2).toUpperCase()}
                             </div>
                          ) : (
                            <img 
                              src={effectiveIcon} 
                              className={cn("h-full w-full object-contain p-2", (isArmy || isCtet || isPstet || isEducation) ? "scale-150" : "")} 
                              referrerPolicy="no-referrer"
                              alt={board.abbreviation}
                              onError={() => setFailedImages(p => ({...p, [board.id]: true}))}
                            />
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="font-headline font-black text-primary text-xl tracking-tighter uppercase">{board.abbreviation}</TableCell>
                    <TableCell className="text-sm font-bold text-slate-800 leading-tight max-w-xs">{board.name}</TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-2">
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 rounded-xl hover:bg-slate-100" 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingBoard(board); }}
                          >
                           <Edit className="h-5 w-5" />
                         </Button>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all" 
                            onClick={(e) => handleDelete(e, board.id)}
                            disabled={isDeleting === board.id}
                          >
                            {isDeleting === board.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                         </Button>
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
              <div className="h-36 w-36 rounded-[2.5rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                 {isUploading ? (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                 ) : (
                    <div className="relative h-full w-full flex items-center justify-center bg-white p-2">
                      {editingBoard?.iconUrl ? (
                        <img 
                          src={editingBoard.iconUrl} 
                          referrerPolicy="no-referrer"
                          className={cn("absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform", (editingBoard.id === 'army' || editingBoard.abbreviation?.toUpperCase() === 'ARMY' || editingBoard.abbreviation?.toUpperCase() === 'CTET' || editingBoard.abbreviation?.toUpperCase() === 'PSTET' || editingBoard.abbreviation?.toUpperCase() === 'EDUCATION' || editingBoard.abbreviation?.toUpperCase() === 'PSEB') ? "scale-150" : "")} 
                          alt="Preview"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-30">
                           <ImageIcon className="h-8 w-8 text-slate-400" />
                           <span className="text-[8px] font-black uppercase text-slate-400">No Logo Loaded</span>
                        </div>
                      )}
                    </div>
                 )}
              </div>
              
              <div className="w-full space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-slate-50 shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isSaving}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4 text-primary" />}
                  {isUploading ? "Syncing Asset..." : "Upload Device Logo"}
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-50">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Short Code</Label>
                    <input value={editingBoard?.abbreviation || ""} onChange={e => setEditingBoard({...editingBoard, abbreviation: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl h-12 font-black uppercase px-4 outline-none text-[#0F172A]" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Registry Name</Label>
                    <input value={editingBoard?.name || ""} onChange={e => setEditingBoard({...editingBoard, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl h-12 font-bold px-4 outline-none text-[#0F172A]" />
                 </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Logo URL Override</Label>
                <div className="flex gap-2">
                  <input value={editingBoard?.iconUrl || ""} onChange={e => setEditingBoard({...editingBoard, iconUrl: e.target.value.trim()})} className="w-full bg-slate-50 border-none rounded-xl h-12 text-[10px] font-mono px-4 outline-none text-slate-500" placeholder="https://..." />
                  {editingBoard?.iconUrl && <Button variant="ghost" size="icon" onClick={() => setEditingBoard({...editingBoard, iconUrl: ""})} className="h-12 w-12 rounded-xl"><X className="h-4 w-4" /></Button>}
                </div>
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
