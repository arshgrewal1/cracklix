
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, Gem, Zap, ShieldCheck, Trophy, Star, ChevronRight, Filter } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

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
      toast({ title: "Pass Registry Synced", description: "Dynamic access node updated across ecosystem." })
      setEditingPass(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Audit Failed", description: e.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this access tier from the registry?")) return
    await deleteDoc(doc(db!, "passes", id))
    toast({ title: "Pass Purged", description: "Access node removed from cloud." })
  }

  return (
    <div className="space-y-12 pb-20 text-left">
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Gem className="h-5 w-5 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Access Tier Architect</span>
           </div>
          <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Pass Hub</h1>
          <p className="text-slate-500 mt-1">Design unlimited custom preparation passes with tiered gating.</p>
        </div>
        <Button onClick={() => setEditingPass({ name: "", price: 0, durationDays: 30, features: [], active: true, displayOrder: (passes?.length || 0) + 1, type: "PREMIUM", description: "" })} className="bg-amber-500 hover:bg-amber-600 text-white gap-2 h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-amber-900/20">
          <Plus className="h-5 w-5" /> Construct New Pass
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />)
        ) : passes?.map((p: any) => (
          <Card key={p.id} className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden group hover:translate-y-[-4px] transition-all">
             <CardContent className="p-0 flex items-stretch h-44">
                <div className={`w-3 ${p.active ? 'bg-amber-500' : 'bg-slate-200'}`} />
                <div className="flex-1 p-10 flex items-center justify-between">
                   <div className="flex items-center gap-8">
                      <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                         {p.type === 'FREE' ? <Zap className="h-8 w-8 text-slate-400" /> : <Trophy className="h-8 w-8" />}
                      </div>
                      <div className="space-y-1.5">
                         <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-black text-[#0F172A] uppercase">{p.name}</h3>
                            <Badge className={`${p.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} border-none uppercase text-[8px] font-black tracking-widest px-3`}>{p.active ? 'ACTIVE NODE' : 'INACTIVE'}</Badge>
                         </div>
                         <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="flex items-center gap-1.5"><Save className="h-3 w-3" /> ₹{p.price}</span>
                            <span className="flex items-center gap-1.5"><Gem className="h-3 w-3" /> {p.durationDays} Days</span>
                            <span className="flex items-center gap-1.5 text-primary"><Filter className="h-3 w-3" /> Order: {p.displayOrder}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl hover:bg-slate-50" onClick={() => setEditingPass(p)}>
                         <Edit className="h-6 w-6 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(p.id)}>
                         <Trash2 className="h-6 w-6" />
                      </Button>
                   </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingPass} onOpenChange={(open) => !open && setEditingPass(null)}>
        <DialogContent className="sm:max-w-2xl rounded-[3rem] bg-white border-none shadow-4xl p-0 overflow-hidden">
          <div className="h-2 w-full bg-amber-500" />
          <DialogHeader className="p-10 pb-0 text-left">
            <DialogTitle className="text-3xl font-black font-headline uppercase flex items-center gap-4">
               <Gem className="h-8 w-8 text-amber-500" /> {editingPass?.id ? "Sync Pass Registry" : "Initialize New Pass"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Pass Identity</Label>
                   <Input value={editingPass?.name || ""} onChange={e => setEditingPass({...editingPass, name: e.target.value})} placeholder="e.g. Gold Pass" className="h-14 rounded-xl bg-slate-50 border-none font-bold" />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Registry Price (₹)</Label>
                   <Input type="number" value={editingPass?.price || 0} onChange={e => setEditingPass({...editingPass, price: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none font-black" />
                </div>
             </div>

             <div className="grid grid-cols-3 gap-8">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Duration (Days)</Label>
                   <Input type="number" value={editingPass?.durationDays || 30} onChange={e => setEditingPass({...editingPass, durationDays: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Display Order</Label>
                   <Input type="number" value={editingPass?.displayOrder || 1} onChange={e => setEditingPass({...editingPass, displayOrder: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type</Label>
                   <select value={editingPass?.type || "PREMIUM"} onChange={e => setEditingPass({...editingPass, type: e.target.value})} className="w-full h-12 rounded-xl bg-slate-50 border-none px-4 font-bold text-xs uppercase outline-none">
                      <option value="FREE">Free Tier</option>
                      <option value="PREMIUM">Premium</option>
                   </select>
                </div>
             </div>

             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Pass Abstract</Label>
                <Textarea value={editingPass?.description || ""} onChange={e => setEditingPass({...editingPass, description: e.target.value})} placeholder="Strategic description for pricing card..." className="rounded-2xl bg-slate-50 border-none h-24 p-6" />
             </div>

             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Feature Registry (Comma separated)</Label>
                <Textarea value={Array.isArray(editingPass?.features) ? editingPass.features.join(', ') : editingPass?.features || ""} onChange={e => setEditingPass({...editingPass, features: e.target.value})} placeholder="Full Mocks, PYQs, AI Tutors..." className="rounded-2xl bg-slate-50 border-none h-24 p-6 font-medium" />
             </div>

             <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="space-y-1">
                   <p className="font-black text-xs uppercase tracking-widest">Active Access Node</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">When disabled, this pass is hidden from students.</p>
                </div>
                <Switch checked={editingPass?.active} onCheckedChange={val => setEditingPass({...editingPass, active: val})} />
             </div>
          </div>

          <DialogFooter className="p-10 pt-0 flex gap-4 border-t border-slate-50 pt-8">
            <Button variant="ghost" onClick={() => setEditingPass(null)} className="rounded-xl h-14 px-10 font-black uppercase text-[10px] tracking-widest text-slate-400">Cancel Draft</Button>
            <Button className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-14 px-12 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl gap-3" onClick={handleSave}>
              <Save className="h-4 w-4" /> Sync Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
