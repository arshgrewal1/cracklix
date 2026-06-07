
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, Save, Gem, Zap, Lock, X, ChevronRight, ShieldOff, ListPlus } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Master Pass & Pricing Registry.
 * Allows Admin to control price, features, and visibility of all institutional passes.
 */
export default function PassManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const passQuery = useMemo(() => (db ? collection(db, "passes") : null), [db])
  const { data: rawPasses, loading } = useCollection<any>(passQuery)

  const passes = useMemo(() => {
    if (!rawPasses) return []
    return [...rawPasses].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [rawPasses])

  const [editingPass, setEditingPass] = useState<any>(null)
  const [newFeature, setNewFeature] = useState("")

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
      displayOrder: parseInt(editingPass.displayOrder) || 1
    }

    try {
      await setDoc(passRef, payload, { merge: true })
      toast({ title: "Pass Registry Synced", description: `${payload.name} is now live with updated pricing.` })
      setEditingPass(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("CRITICAL: Permanently delete this monetization node?")) return
    await deleteDoc(doc(db!, "passes", id))
    toast({ title: "Pass Purged" })
  }

  const addFeature = () => {
    if (!newFeature.trim()) return
    const current = editingPass.features || []
    setEditingPass({ ...editingPass, features: [...current, newFeature.trim()] })
    setNewFeature("")
  }

  const removeFeature = (idx: number) => {
    const current = [...(editingPass.features || [])]
    current.splice(idx, 1)
    setEditingPass({ ...editingPass, features: current })
  }

  return (
    <div className="space-y-12 pb-24 text-left px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Gem className="h-6 w-6 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Monetization Registry Hub</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Pass Manager</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Coordinate institutional pricing and premium access features.</p>
        </div>
        <Button 
          onClick={() => setEditingPass({ name: "", price: 299, durationDays: 30, features: [], active: true, displayOrder: (passes?.length || 0) + 1, type: "PREMIUM", description: "", adFree: false })} 
          className="bg-primary hover:bg-orange-600 h-16 px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl gap-3 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" /> Construct New Pass
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-3xl" />)
        ) : passes.length > 0 ? passes.map((p: any) => (
          <div key={p.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-6 flex items-center justify-between shadow-sm hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-8 flex-1 min-w-0">
               <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", p.type === 'FREE' ? "bg-slate-50 text-slate-300" : "bg-amber-50 text-amber-500")}>
                  {p.type === 'FREE' ? <Zap className="h-6 w-6" /> : <Gem className="h-6 w-6" />}
               </div>
               <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                     <h3 className="text-xl font-black text-[#0F172A] uppercase truncate">{p.name}</h3>
                     <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-3", p.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>{p.active ? 'LIVE' : 'DISABLED'}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                     <span className="text-primary">₹{p.price}</span>
                     <span className="flex items-center gap-1.5"><ChevronRight className="h-2.5 w-2.5" /> {p.durationDays} Days</span>
                  </div>
               </div>
            </div>
            <div className="flex gap-2">
               <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-primary hover:text-white" onClick={() => setEditingPass(p)}><Edit className="h-5 w-5" /></Button>
               <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(p.id)}><Trash2 className="h-5 w-5" /></Button>
            </div>
          </div>
        )) : (
          <div className="py-24 text-center opacity-20 border-2 border-dashed border-slate-200 rounded-[3rem]">
             <Gem className="h-12 w-12 mx-auto mb-4" />
             <p className="font-black uppercase tracking-widest text-[10px]">No active pass nodes detected.</p>
          </div>
        )}
      </div>

      <Dialog open={!!editingPass} onOpenChange={o => !o && setEditingPass(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-[#0F172A]" />
          <DialogHeader className="p-10 pb-4">
             <DialogTitle className="text-2xl font-black font-headline uppercase">Pass Node Architect</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10 space-y-8">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Identity Name</Label>
                   <Input value={editingPass?.name || ""} onChange={e => setEditingPass({...editingPass, name: e.target.value})} className="h-14 rounded-xl border-slate-100 font-bold" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Price (₹)</Label>
                   <Input type="number" value={editingPass?.price ?? ""} onChange={e => setEditingPass({...editingPass, price: e.target.value})} className="h-14 rounded-xl border-slate-100 font-black text-primary" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Duration (Days)</Label>
                   <Input type="number" value={editingPass?.durationDays ?? ""} onChange={e => setEditingPass({...editingPass, durationDays: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Display Sort Index</Label>
                   <Input type="number" value={editingPass?.displayOrder ?? ""} onChange={e => setEditingPass({...editingPass, displayOrder: e.target.value})} className="h-12 rounded-xl" />
                </div>
             </div>

             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Feature Registry</Label>
                <div className="flex gap-2">
                   <Input value={newFeature} onChange={e => setNewFeature(e.target.value)} placeholder="e.g. 500+ Full Mocks" className="h-12 rounded-xl border-slate-100" />
                   <Button onClick={addFeature} className="bg-[#0F172A] hover:bg-black rounded-xl h-12 px-6 font-black uppercase text-[10px]">Add</Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                   {editingPass?.features?.map((f: string, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-100">
                         <span className="text-xs font-bold text-slate-600">{f}</span>
                         <button onClick={() => removeFeature(idx)} className="text-rose-500 p-1 hover:bg-rose-50 rounded"><X className="h-4 w-4" /></button>
                      </div>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="space-y-0.5"><p className="text-[10px] font-black uppercase">Pass Active</p></div>
                   <Switch checked={editingPass?.active || false} onCheckedChange={v => setEditingPass({...editingPass, active: v})} />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                   <div className="space-y-0.5"><p className="text-[10px] font-black uppercase">Ad-Free</p></div>
                   <Switch checked={editingPass?.adFree || false} onCheckedChange={v => setEditingPass({...editingPass, adFree: v})} />
                </div>
             </div>
          </div>
          <DialogFooter className="p-10 pt-4 bg-slate-50 flex gap-4">
             <Button variant="ghost" onClick={() => setEditingPass(null)} className="rounded-xl h-14 font-black uppercase text-[10px]">Discard</Button>
             <Button onClick={handleSave} className="flex-1 bg-[#0F172A] hover:bg-black rounded-xl h-14 font-black uppercase text-[10px] tracking-widest shadow-xl">Sync Registry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
