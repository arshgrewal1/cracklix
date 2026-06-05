
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, Gem, Zap, ShieldCheck, Trophy, Filter, Lock, X } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Dynamic Pass Hub.
 * Optimized for mobile viewport safety and in-modal audit controls.
 */

export default function PassManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const passQuery = useMemo(() => (db ? query(collection(db, "passes"), orderBy("displayOrder", "asc")) : null), [db])
  const { data: passes, loading } = useCollection<any>(passQuery)

  const [editingPass, setEditingPass] = useState<any>(null)

  const handleSave = async () => {
    if (!db || !editingPass) return
    const passId = editingPass.id || `pass-${Date.now()}`
    const passRef = doc(db, "passes", passId)
    
    const payload = {
      ...editingPass,
      id: passId,
      updatedAt: serverTimestamp(),
      price: parseFloat(editingPass.price) || 0,
      durationDays: parseInt(editingPass.durationDays) || 30,
      displayOrder: parseInt(editingPass.displayOrder) || 1,
      features: typeof editingPass.features === 'string' ? editingPass.features.split(',').map((f: string) => f.trim()) : editingPass.features
    }

    try {
      await setDoc(passRef, payload, { merge: true })
      toast({ title: "Registry Synced", description: "Premium pass configuration updated." })
      setEditingPass(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Audit Failed", description: e.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this access tier from the institutional registry?")) return
    await deleteDoc(doc(db!, "passes", id))
    toast({ title: "Pass Purged", description: "Access node removed from cloud." })
    if (editingPass?.id === id) setEditingPass(null)
  }

  return (
    <div className="space-y-12 pb-20 text-left text-[#0F172A]">
      <div className="flex justify-between items-center px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Gem className="h-5 w-5 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Access Tier Architect</span>
           </div>
          <h1 className="text-4xl font-black font-headline uppercase tracking-tight">Pass Hub</h1>
          <p className="text-slate-500 mt-1">Design unlimited Premium passes for content monetization.</p>
        </div>
        <button 
           onClick={() => setEditingPass({ name: "", price: 299, durationDays: 30, features: [], active: true, displayOrder: (passes?.length || 0) + 1, type: "PREMIUM", description: "" })} 
           className="bg-amber-500 hover:bg-amber-600 text-white gap-2 h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-amber-900/20 flex items-center transition-all active:scale-95"
        >
          <Plus className="h-5 w-5 mr-2" /> Construct Pass
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 px-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />)
        ) : passes?.map((p: any) => (
          <Card key={p.id} className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden group hover:translate-y-[-4px] transition-all">
             <CardContent className="p-0 flex items-stretch h-auto min-h-[11rem]">
                <div className={cn("w-3 transition-colors shrink-0", p.active ? 'bg-amber-500' : 'bg-slate-200')} />
                <div className="flex-1 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto">
                      <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform shrink-0">
                         {p.type === 'FREE' ? <Zap className="h-8 w-8 text-slate-300" /> : <Lock className="h-8 w-8 text-amber-500" />}
                      </div>
                      <div className="space-y-1.5 min-w-0">
                         <div className="flex items-center gap-4 flex-wrap">
                            <h3 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase truncate">{p.name}</h3>
                            <Badge className={cn("border-none uppercase text-[8px] font-black tracking-widest px-3", p.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400')}>{p.active ? 'ACTIVE NODE' : 'DISABLED'}</Badge>
                         </div>
                         <div className="flex items-center gap-4 md:gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1.5">₹{p.price}</span>
                            <div className="h-1 w-1 rounded-full bg-slate-200 hidden md:block" />
                            <span className="flex items-center gap-1.5">{p.durationDays} Days</span>
                            <div className="h-1 w-1 rounded-full bg-slate-200 hidden md:block" />
                            <span className="flex items-center gap-1.5 text-primary">Sort Index: {p.displayOrder}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 ml-auto md:ml-0">
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-50" onClick={() => setEditingPass(p)}>
                         <Edit className="h-6 w-6 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(p.id)}>
                         <Trash2 className="h-6 w-6" />
                      </Button>
                   </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingPass} onOpenChange={(open) => !open && setEditingPass(null)}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] rounded-[2rem] md:rounded-[3rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-1.5 w-full bg-amber-500 shrink-0" />
          <DialogHeader className="p-6 md:p-10 pb-0 text-left shrink-0">
            <div className="flex justify-between items-start">
               <DialogTitle className="text-2xl md:text-3xl font-black font-headline uppercase flex items-center gap-4">
                  <Gem className="h-8 w-8 text-amber-500" /> {editingPass?.id ? "Update Registry" : "Initialize New Pass"}
               </DialogTitle>
               <button onClick={() => setEditingPass(null)} className="p-2 rounded-xl hover:bg-slate-50 md:hidden"><X className="h-6 w-6" /></button>
            </div>
          </DialogHeader>
          
          <div className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Pass Label</Label>
                   <Input value={editingPass?.name || ""} onChange={e => setEditingPass({...editingPass, name: e.target.value})} placeholder="e.g. Premium Monthly" className="h-14 rounded-xl bg-slate-50 border-none font-bold" />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Registry Price (₹)</Label>
                   <Input type="number" value={editingPass?.price || 0} onChange={e => setEditingPass({...editingPass, price: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none font-black" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Duration (Days)</Label>
                   <Input type="number" value={editingPass?.durationDays || 30} onChange={e => setEditingPass({...editingPass, durationDays: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none font-bold" />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Display Sort</Label>
                   <Input type="number" value={editingPass?.displayOrder || 1} onChange={e => setEditingPass({...editingPass, displayOrder: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none font-bold" />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Access Tier</Label>
                   <select value={editingPass?.type || "PREMIUM"} onChange={e => setEditingPass({...editingPass, type: e.target.value})} className="w-full h-14 rounded-xl bg-slate-50 border-none px-4 font-bold text-xs uppercase outline-none">
                      <option value="FREE">Free Tier</option>
                      <option value="PREMIUM">Premium Access</option>
                   </select>
                </div>
             </div>

             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Pass Abstract</Label>
                <Textarea value={editingPass?.description || ""} onChange={e => setEditingPass({...editingPass, description: e.target.value})} placeholder="Strategic description for pricing card..." className="rounded-2xl bg-slate-50 border-none h-24 p-6 resize-none" />
             </div>

             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Feature List (Comma separated)</Label>
                <Textarea value={Array.isArray(editingPass?.features) ? editingPass.features.join(', ') : editingPass?.features || ""} onChange={e => setEditingPass({...editingPass, features: e.target.value})} placeholder="Unlock All Mocks, AI Rationale, PYQ Vault..." className="rounded-2xl bg-slate-50 border-none h-24 p-6 font-medium resize-none" />
             </div>

             <div className="flex items-center justify-between p-6 md:p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                <div className="space-y-1">
                   <p className="font-black text-xs uppercase tracking-widest text-[#0F172A]">Active Enrollment Node</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">When disabled, this pass is hidden from students.</p>
                </div>
                <Switch checked={editingPass?.active} onCheckedChange={val => setEditingPass({...editingPass, active: val})} />
             </div>
          </div>

          <DialogFooter className="p-6 md:p-10 flex flex-row items-center justify-between gap-4 border-t border-slate-50 shrink-0 bg-white">
            <div className="flex items-center gap-4">
               {editingPass?.id && (
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-14 w-14 rounded-2xl text-rose-500 hover:bg-rose-50 shadow-sm border border-slate-100" 
                     onClick={() => handleDelete(editingPass.id)}
                     title="Purge Node"
                  >
                     <Trash2 className="h-6 w-6" />
                  </Button>
               )}
               <Button variant="ghost" onClick={() => setEditingPass(null)} className="h-14 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900 transition-colors hidden md:flex">Cancel Draft</Button>
            </div>
            
            <Button className="bg-[#0F172A] hover:bg-black text-white rounded-2xl h-14 px-8 md:px-12 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl gap-3 flex-1 md:flex-none transition-all active:scale-95" onClick={handleSave}>
              <Save className="h-4 w-4" /> Sync Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
