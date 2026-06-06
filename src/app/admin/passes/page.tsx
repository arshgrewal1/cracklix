
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, Save, Gem, Zap, Lock, X, ChevronRight, ShieldOff } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

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

    // Purge undefined
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    try {
      await setDoc(passRef, payload, { merge: true })
      toast({ title: "Registry Synced", description: "Pass configuration updated successfully." })
      setEditingPass(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this pass from the registry?")) return
    await deleteDoc(doc(db!, "passes", id))
    toast({ title: "Pass Purged", description: "Node removed from cloud." })
    if (editingPass?.id === id) setEditingPass(null)
  }

  return (
    <div className="space-y-10 pb-20 text-left text-[#0F172A] px-2 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Gem className="h-5 w-5 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Monetization Registry</span>
           </div>
          <h1 className="text-4xl font-black font-headline uppercase tracking-tight">Pass Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Configure institutional access tiers and pricing logic.</p>
        </div>
        <Button 
           onClick={() => setEditingPass({ name: "", price: 299, durationDays: 30, features: [], active: true, displayOrder: (passes?.length || 0) + 1, type: "PREMIUM", description: "", adFree: false })} 
           className="bg-[#0F172A] hover:bg-black text-white gap-3 h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" /> Construct New Pass
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
        ) : passes?.map((p: any) => (
          <div 
            key={p.id} 
            className={cn(
              "group bg-white border border-slate-100 rounded-3xl p-4 md:p-6 flex items-center justify-between shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-300",
              !p.active && "opacity-60 grayscale-[0.5]"
            )}
          >
            <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
               <div className={cn(
                  "h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105",
                  p.type === 'FREE' ? "bg-slate-50 text-slate-400" : "bg-amber-50 text-amber-500"
               )}>
                  {p.type === 'FREE' ? <Zap className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
               </div>

               <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                     <h3 className="text-lg md:text-xl font-black text-[#0F172A] uppercase truncate">{p.name}</h3>
                     <Badge className={cn("border-none text-[7px] font-black tracking-widest px-2 py-0.5", p.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400')}>
                        {p.active ? 'LIVE' : 'DISABLED'}
                     </Badge>
                     {p.adFree && <Badge className="bg-blue-50 text-blue-600 border-none text-[7px] font-black px-2 py-0.5 rounded-lg">AD FREE</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                     <span className="text-primary">₹{p.price}</span>
                     <span className="flex items-center gap-1.5"><ChevronRight className="h-2.5 w-2.5" /> {p.durationDays} Days</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2 ml-4 shrink-0">
               <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all shadow-sm" 
                onClick={() => setEditingPass(p)}
               >
                  <Edit className="h-5 w-5" />
               </Button>
               <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm" 
                onClick={() => handleDelete(p.id)}
               >
                  <Trash2 className="h-5 w-5" />
               </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editingPass} onOpenChange={(open) => !open && setEditingPass(null)}>
        <DialogContent className="sm:max-w-xl w-[95vw] max-h-[95vh] rounded-[2.5rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-1.5 w-full bg-[#0F172A] shrink-0" />
          <DialogHeader className="p-6 pb-0 text-left shrink-0">
            <div className="flex justify-between items-center">
               <DialogTitle className="text-xl font-black font-headline uppercase flex items-center gap-3">
                  <Gem className="h-5 w-5 text-primary" /> {editingPass?.id ? "Edit Pass Configuration" : "New Pass Entry"}
               </DialogTitle>
               <button onClick={() => setEditingPass(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Pass Identity</Label>
                   <Input value={editingPass?.name || ""} onChange={e => setEditingPass({...editingPass, name: e.target.value})} placeholder="e.g. Gold Pass" className="h-11 rounded-xl bg-slate-50 border-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Fee Amount (₹)</Label>
                   <Input type="number" value={editingPass?.price || 0} onChange={e => setEditingPass({...editingPass, price: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-none font-black text-sm" />
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Validity (Days)</Label>
                   <Input type="number" value={editingPass?.durationDays || 30} onChange={e => setEditingPass({...editingPass, durationDays: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Sort Priority</Label>
                   <Input type="number" value={editingPass?.displayOrder || 1} onChange={e => setEditingPass({...editingPass, displayOrder: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                   <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Access Tier</Label>
                   <select value={editingPass?.type || "PREMIUM"} onChange={e => setEditingPass({...editingPass, type: e.target.value})} className="w-full h-11 rounded-xl bg-slate-50 border-none px-4 font-black text-[10px] uppercase outline-none">
                      <option value="FREE">Free Node</option>
                      <option value="PREMIUM">Premium Hub</option>
                   </select>
                </div>
             </div>

             <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Marketing Abstract</Label>
                <Textarea value={editingPass?.description || ""} onChange={e => setEditingPass({...editingPass, description: e.target.value})} placeholder="Strategic pass description..." className="rounded-xl bg-slate-50 border-none h-16 p-3 resize-none text-xs font-medium" />
             </div>

             <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="space-y-0.5">
                      <p className="font-black text-[11px] uppercase text-[#0F172A]">Visibility Active</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Toggle to hide/show in pricing hub</p>
                   </div>
                   <Switch checked={editingPass?.active} onCheckedChange={val => setEditingPass({...editingPass, active: val})} />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100">
                   <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                         <ShieldOff className="h-3 w-3 text-blue-600" />
                         <p className="font-black text-[11px] uppercase text-blue-900">Ad-Free Experience</p>
                      </div>
                      <p className="text-[8px] text-blue-400 font-bold uppercase">Disable all advertisements for this pass</p>
                   </div>
                   <Switch checked={editingPass?.adFree} onCheckedChange={val => setEditingPass({...editingPass, adFree: val})} />
                </div>
             </div>
          </div>

          <DialogFooter className="p-6 border-t border-slate-50 shrink-0 bg-white flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
               {editingPass?.id && (
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-11 w-11 rounded-xl text-rose-500 hover:bg-rose-50 border border-slate-100 shadow-sm" 
                     onClick={() => handleDelete(editingPass.id)}
                  >
                     <Trash2 className="h-5 w-5" />
                  </Button>
               )}
               <Button variant="ghost" onClick={() => setEditingPass(null)} className="h-11 px-4 font-black uppercase text-[9px] tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Cancel</Button>
            </div>
            
            <Button className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl gap-2 flex-1 md:flex-none transition-all active:scale-95" onClick={handleSave}>
              <Save className="h-4 w-4" /> Sync Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
