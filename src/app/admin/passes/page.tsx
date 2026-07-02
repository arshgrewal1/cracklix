"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, Save, Gem, Zap, Lock, X, ChevronRight, Loader2, CheckCircle2, Search, Landmark, Clock } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Pass Architect v5.6 (Mobile Scaling Fix).
 * FIXED: Footer buttons now stack on mobile to prevent clipping.
 * FIXED: Grid layouts optimized for small viewport ergonomics.
 */
export default function PassManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: rawPasses, loading } = useCollection<any>(useMemo(() => (db ? collection(db, "passes") : null), [db]))
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

  const passes = useMemo(() => {
    if (!rawPasses) return []
    return [...rawPasses].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [rawPasses])

  const [editingPass, setEditingPass] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mockSearch, setMockSearch] = useState("")

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
      displayOrder: parseInt(editingPass.displayOrder) || 1,
      allowedMocks: editingPass.allowedMocks || [],
      allowedCategories: editingPass.allowedCategories || []
    }

    try {
      await setDoc(passRef, payload, { merge: true })
      toast({ title: "Pass Hub Synced", description: `${payload.name} access nodes updated.` })
      setEditingPass(null)
    } catch (e: any) {
      console.error('[PASS_SAVE_ERROR]:', e);
      toast({ variant: "destructive", title: "Sync Failed", description: e?.message || "Could not update pass." })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleMock = (mockId: string) => {
    if (!editingPass) return;
    const current = editingPass.allowedMocks || []
    setEditingPass({
      ...editingPass,
      allowedMocks: current.includes(mockId) ? current.filter((id: string) => id !== mockId) : [...current, mockId]
    })
  }

  const toggleCategory = (catId: string) => {
    if (!editingPass) return;
    const current = editingPass.allowedCategories || []
    setEditingPass({
      ...editingPass,
      allowedCategories: current.includes(catId) ? current.filter((id: string) => id !== catId) : [...current, catId]
    })
  }

  return (
    <div className="space-y-6 md:space-y-12 text-[#0F172A] text-left animate-in fade-in duration-500 pb-24 px-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <Gem className="h-4 w-4 text-amber-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Security Access Governance</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black tracking-tight">Pass Architect</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Configure tiered preparation nodes and mock access rules.</p>
        </div>
        <Button 
          onClick={() => setEditingPass({ name: "", price: 299, durationDays: 30, features: [], allowedMocks: [], allowedCategories: [], active: true, displayOrder: (passes?.length || 0) + 1, tier: 1 })} 
          className="h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl border-none active:scale-95 gap-2"
        >
          <Plus className="h-4 w-4" /> Create New Tier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl md:rounded-[3rem] bg-white" />)
        ) : passes.map((p: any) => (
          <Card key={p.id} className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white overflow-hidden flex flex-col group hover:translate-y-[-4px] transition-all border border-slate-100">
             <CardHeader className="p-5 md:p-10 pb-3 md:pb-6 text-center space-y-4">
                <div className={cn("h-12 w-12 md:h-16 rounded-xl flex items-center justify-center mx-auto shadow-inner", p.active ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-300")}>
                   <Gem className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <div>
                   <CardTitle className="text-lg md:text-2xl font-black leading-none">{p.name}</CardTitle>
                   <Badge className={cn("mt-2 border-none text-[8px] font-black uppercase tracking-widest px-2", p.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>{p.active ? 'SYSTEM ONLINE' : 'OFFLINE'}</Badge>
                </div>
                <div className="space-y-1">
                   <p className="text-2xl md:text-4xl font-black text-[#0F172A]">₹{p.price}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.durationDays} Days Validity</p>
                </div>
             </CardHeader>
             <CardContent className="px-5 md:px-10 flex-1 space-y-6">
                <div className="space-y-2">
                   <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Access Nodes</p>
                   <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[7px] font-bold uppercase">{p.allowedMocks?.length || 0} Mocks</Badge>
                      <Badge variant="outline" className="text-[7px] font-bold uppercase">{p.allowedCategories?.length || 0} Hubs</Badge>
                   </div>
                </div>
             </CardContent>
             <div className="p-5 md:p-10 pt-3 flex gap-2 md:gap-3 border-t border-slate-50">
                <Button variant="outline" className="flex-1 rounded-full h-10 md:h-12 font-black uppercase text-[9px] tracking-widest border-slate-200" onClick={() => setEditingPass(p)}><Edit className="h-3.5 w-3.5 mr-1" /> Architect</Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full text-rose-500 hover:bg-rose-50 border border-slate-100" onClick={async () => { if(confirm("Purge pass node?")) await deleteDoc(doc(db!, "passes", p.id)) }}><Trash2 className="h-4 w-4" /></Button>
             </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingPass} onOpenChange={o => !o && !isSaving && setEditingPass(null)}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-[#0F172A] shrink-0" />
          <DialogHeader className="p-5 md:p-10 pb-2 md:pb-4 shrink-0">
             <DialogTitle className="text-xl md:text-3xl font-black uppercase">Tier Configuration</DialogTitle>
             <DialogDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Map mock tests and boards to this subscription node.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 md:px-10 pb-6 md:pb-10 space-y-8 md:space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <div className="space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                         <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Plan Name</Label>
                         <Input value={editingPass?.name || ""} onChange={e => setEditingPass({...editingPass, name: e.target.value})} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Price (₹)</Label>
                           <Input type="number" value={editingPass?.price || 0} onChange={e => setEditingPass({...editingPass, price: parseFloat(e.target.value) || 0})} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-black text-primary text-center" />
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Clock className="h-3 w-3" /> Validity (Days)</Label>
                           <Input type="number" value={editingPass?.durationDays || 30} onChange={e => setEditingPass({...editingPass, durationDays: parseInt(e.target.value) || 0})} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-black text-center text-blue-600" />
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Zap className="h-3 w-3" /> Map Specific Mocks</Label>
                      <div className="relative group">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                         <Input value={mockSearch} onChange={e => setMockSearch(e.target.value)} className="pl-10 h-10 rounded-xl bg-slate-50 border-none text-[11px] font-bold" placeholder="Search mock bank..." />
                      </div>
                      <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                         {mocks?.filter(m => m.title.toLowerCase().includes(mockSearch.toLowerCase())).map((m: any) => {
                            const isAllowed = editingPass?.allowedMocks?.includes(m.id)
                            return (
                               <button key={m.id} onClick={() => toggleMock(m.id)} className={cn("w-full p-2.5 rounded-lg flex items-center justify-between text-left transition-all", isAllowed ? "bg-primary text-white shadow-lg" : "bg-slate-50 hover:bg-slate-100 text-slate-600")}>
                                  <span className="text-[10px] font-bold uppercase truncate pr-4">{m.title}</span>
                                  {isAllowed ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <div className="h-3 w-3 rounded-full border border-slate-200 shrink-0" />}
                               </button>
                            )
                         })}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Landmark className="h-3 w-3" /> Grant Category Hubs</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                         {boards?.map((b: any) => {
                            const isAllowed = editingPass?.allowedCategories?.includes(b.id)
                            return (
                               <button key={b.id} onClick={() => toggleCategory(b.id)} className={cn("p-3 rounded-xl flex items-center justify-between text-left border-2 transition-all", isAllowed ? "border-primary bg-blue-50/50 text-primary shadow-sm" : "border-slate-100 bg-white text-slate-400 hover:border-slate-200")}>
                                  <span className="text-[9px] font-black uppercase tracking-tight">{b.abbreviation} Hub</span>
                                  {isAllowed && <CheckCircle2 className="h-3 w-3" />}
                               </button>
                            )
                         })}
                      </div>
                   </div>

                   <div className="space-y-4 pt-6 border-t border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Institutional Config</p>
                      <div className="flex items-center justify-between p-4 md:p-5 bg-slate-50 rounded-2xl shadow-inner border border-slate-100">
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-[#0F172A]">System Activation</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Enable purchase flow</p>
                         </div>
                         <Switch checked={editingPass?.active || false} onCheckedChange={v => setEditingPass({...editingPass, active: v})} />
                      </div>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="p-5 md:p-10 pt-4 bg-slate-50 flex flex-col sm:flex-row gap-3 md:gap-4 border-t border-slate-100 shrink-0">
             <Button variant="ghost" onClick={() => setEditingPass(null)} className="w-full sm:w-auto h-11 md:h-12 px-6 font-black uppercase text-[10px] text-slate-400">Discard Audit</Button>
             <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-11 md:h-12 bg-primary hover:bg-blue-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl border-none active:scale-95 gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Access Rules
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
