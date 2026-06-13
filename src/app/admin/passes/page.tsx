"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, Save, Gem, Zap, Lock, X, ChevronRight, ShieldOff, ListPlus, Loader2, CheckCircle2 } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Pass Registry Hub v2.1.
 * ACCESSIBILITY: Added DialogDescription for ARIA compliance.
 */
export default function PassManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const passQuery = useMemo(() => (db ? collection(db, "passes") : null), [db])
  const { data: rawPasses, loading: loading } = useCollection<any>(passQuery)

  const passes = useMemo(() => {
    if (!rawPasses) return []
    return [...rawPasses].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [rawPasses])

  const [editingPass, setEditingPass] = useState<any>(null)
  const [newFeature, setNewFeature] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!db || !editingPass || isSaving) return
    setIsSaving(true)
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
      toast({ title: "Pass Registry Synced", description: `${payload.name} is now live.` })
      setEditingPass(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("CRITICAL: Permanently purge this monetization node?")) return
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
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Subscription Hub</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Pass Manager</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage tiered access plans for the Elite Preparation Hub.</p>
        </div>
        <Button 
          onClick={() => setEditingPass({ name: "", price: 299, durationDays: 30, features: [], active: true, displayOrder: (passes?.length || 0) + 1, type: "PREMIUM", description: "", adFree: false })} 
          className="bg-primary hover:bg-orange-600 h-16 px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl gap-3 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" /> Construct New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[3rem]" />)
        ) : passes.length > 0 ? passes.map((p: any) => (
          <Card key={p.id} className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden flex flex-col group hover:translate-y-[-8px] transition-all duration-500">
             <CardHeader className="p-10 pb-6 text-center space-y-4">
                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner", p.active ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-300")}>
                   <Gem className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                   <CardTitle className="text-2xl font-black font-headline uppercase leading-none">{p.name}</CardTitle>
                   <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-3", p.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>{p.active ? 'LIVE' : 'INACTIVE'}</Badge>
                </div>
                <p className="text-4xl font-headline font-black text-[#0F172A] tabular-nums">₹{p.price}</p>
             </CardHeader>
             <CardContent className="px-10 flex-1">
                <ul className="space-y-3">
                   {p.features?.slice(0, 4).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {f}</li>
                   ))}
                </ul>
             </CardContent>
             <div className="p-10 pt-4 flex gap-3 border-t border-slate-50">
                <Button variant="outline" className="flex-1 rounded-xl h-12 font-black uppercase text-[10px] tracking-widest" onClick={() => setEditingPass(p)}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
             </div>
          </Card>
        )) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] opacity-20">
             <Gem className="h-16 w-16 mx-auto mb-6" />
             <p className="font-black uppercase tracking-widest">Plan Registry Empty</p>
          </div>
        )}
      </div>

      <Dialog open={!!editingPass} onOpenChange={o => !o && !isSaving && setEditingPass(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[95vh] rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-[#0F172A] shrink-0" />
          <DialogHeader className="p-10 pb-4">
             <DialogTitle className="text-3xl font-black font-headline uppercase">Pass Node Architect</DialogTitle>
             <DialogDescription className="sr-only">Configure pricing, duration and features for an institutional preparation pass.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10 space-y-8">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Plan Name</Label>
                   <Input value={editingPass?.name || ""} onChange={e => setEditingPass({...editingPass, name: e.target.value})} className="h-14 rounded-xl border-slate-100 font-bold" placeholder="e.g. Monthly Pass" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Price (₹)</Label>
                   <Input 
                      type="number" 
                      value={isNaN(editingPass?.price) ? "" : editingPass?.price} 
                      onChange={e => setEditingPass({...editingPass, price: parseFloat(e.target.value) || 0})} 
                      className="h-14 rounded-xl border-slate-100 font-black text-primary text-lg" 
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Duration (Days)</Label>
                   <Input 
                      type="number" 
                      value={isNaN(editingPass?.durationDays) ? "" : editingPass?.durationDays} 
                      onChange={e => setEditingPass({...editingPass, durationDays: parseInt(e.target.value) || 0})} 
                      className="h-12 rounded-xl" 
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Sort Order</Label>
                   <Input 
                      type="number" 
                      value={isNaN(editingPass?.displayOrder) ? "" : editingPass?.displayOrder} 
                      onChange={e => setEditingPass({...editingPass, displayOrder: parseInt(e.target.value) || 0})} 
                      className="h-12 rounded-xl" 
                   />
                </div>
             </div>

             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Feature List</Label>
                <div className="flex gap-2">
                   <Input value={newFeature} onChange={e => setNewFeature(e.target.value)} placeholder="e.g. 500+ Premium Mocks" className="h-12 rounded-xl border-slate-100" />
                   <Button onClick={addFeature} className="bg-[#0F172A] hover:bg-black rounded-xl h-12 px-6 font-black uppercase text-[10px]">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {editingPass?.features?.map((f: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                         <span className="text-[10px] font-bold text-slate-600">{f}</span>
                         <button onClick={() => removeFeature(idx)} className="text-rose-500 hover:text-rose-700 transition-colors"><X className="h-3.5 w-3.5" /></button>
                      </Badge>
                   ))}
                </div>
             </div>

             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Marketing Description</Label>
                <Textarea value={editingPass?.description || ""} onChange={e => setEditingPass({...editingPass, description: e.target.value})} className="rounded-xl border-slate-100 min-h-[80px]" />
             </div>

             <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-0.5"><p className="text-[10px] font-black uppercase text-[#0F172A]">Pass Active & Buyable</p></div>
                <Switch checked={editingPass?.active || false} onCheckedChange={v => setEditingPass({...editingPass, active: v})} />
             </div>
          </div>
          <DialogFooter className="p-10 pt-4 bg-slate-50 flex gap-4 border-t border-slate-100">
             <Button variant="ghost" onClick={() => setEditingPass(null)} className="rounded-xl h-14 font-black uppercase text-[10px] text-slate-400">Cancel</Button>
             <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-[#0F172A] hover:bg-black rounded-xl h-14 font-black uppercase text-[10px] tracking-widest shadow-xl gap-3">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Sync to Registry
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
