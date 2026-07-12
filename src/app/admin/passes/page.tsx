
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, Save, Gem, Zap, Lock, X, ChevronRight, Loader2, CheckCircle2, Search, Landmark, Clock } from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, serverTimestamp, addDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"

/**
 * @fileOverview Institutional Pass Architect v6.0 (High-Fidelity).
 * FIXED: Visibility issues in dropdowns and rebalanced header spacing.
 * UPDATED: Integrated live auditing for pass modifications.
 */
export default function PassManagement() {
  const db = useFirestore()
  const { user: admin, profile } = useUser()
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
      
      // LOG AUDIT TRAIL
      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: editingPass.id ? "PASS_UPDATE" : "PASS_CREATE",
        details: `Pass Tier "${payload.name}" registry node synchronized.`,
        timestamp: serverTimestamp()
      });

      toast({ title: "Registry Synced", description: `${payload.name} node updated.` })
      setEditingPass(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!db || !confirm(`Permanently purge "${name}" from registry?`)) return
    await deleteDoc(doc(db, "passes", id))
    
    await addDoc(collection(db, "audit_logs"), {
      user: profile?.name || "Administrator",
      action: "PASS_PURGE",
      details: `Pass Tier "${name}" removed from registry.`,
      timestamp: serverTimestamp()
    });

    toast({ title: "Node Purged" })
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
    <div className="space-y-10 md:space-y-16 text-[#0F172A] text-left animate-in fade-in duration-700 pb-32 pt-2">
      
      {/* 1. HEADER HUB - REBALANCED */}
      <AdminPageHeader
        icon={Gem}
        label="Security Access Governance"
        title="Pass Architect"
        subtitle="Configure tiered preparation nodes and mock access rules."
        actionLabel="Create New Tier"
        actionIcon={Plus}
        onAction={() => setEditingPass({ name: "", price: 299, durationDays: 30, features: [], allowedMocks: [], allowedCategories: [], active: true, displayOrder: (passes?.length || 0) + 1, tier: 1 })}
      />

      {/* 2. DATA CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 px-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2rem] md:rounded-[3rem] bg-white shadow-sm" />)
        ) : passes.map((p: any) => (
          <Card key={p.id} className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white overflow-hidden flex flex-col group hover:translate-y-[-6px] transition-all duration-500">
             <CardHeader className="p-6 md:p-10 pb-4 text-center space-y-4">
                <div className={cn("h-12 w-12 md:h-20 md:w-20 rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-transform group-hover:scale-110", p.active ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-300")}>
                   <Gem className="h-6 w-6 md:h-10 md:w-10" />
                </div>
                <div>
                   <CardTitle className="text-xl md:text-3xl font-black text-[#0F172A] leading-none">{p.name}</CardTitle>
                   <div className="mt-3 flex justify-center">
                      <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-3 py-1", p.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>{p.active ? 'System Online' : 'Node Offline'}</Badge>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-2xl md:text-5xl font-black text-[#0F172A] tabular-nums tracking-tighter">₹{p.price}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.durationDays} Days Duration</p>
                </div>
             </CardHeader>
             <CardContent className="px-6 md:px-10 flex-1 space-y-6">
                <div className="h-px w-full bg-slate-50" />
                <div className="space-y-3">
                   <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Authorized Access</p>
                   <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[8px] font-bold border-slate-100 text-slate-400">{p.allowedMocks?.length || 0} Mock Nodes</Badge>
                      <Badge variant="outline" className="text-[8px] font-bold border-slate-100 text-slate-400">{p.allowedCategories?.length || 0} Hub Nodes</Badge>
                   </div>
                </div>
             </CardContent>
             <div className="p-6 md:p-10 pt-4 flex gap-3 border-t border-slate-50">
                <Button variant="outline" className="flex-1 rounded-xl h-11 md:h-14 font-black uppercase text-[10px] tracking-widest border-slate-200" onClick={() => setEditingPass(p)}><Edit className="h-4 w-4 mr-2" /> Architect</Button>
                <Button variant="ghost" size="icon" className="h-11 w-11 md:h-14 md:w-14 rounded-xl text-rose-500 hover:bg-rose-50 border border-slate-100 shadow-sm" onClick={() => handleDelete(p.id, p.name)}><Trash2 className="h-4 w-4" /></Button>
             </div>
          </Card>
        ))}
      </div>

      {/* 3. CONFIGURATION DIALOG */}
      <AdminDialogShell
        open={!!editingPass}
        onOpenChange={(o) => !o && !isSaving && setEditingPass(null)}
        title="Tier Architect"
        description="Map preparation verticals and mock tests to this subscription node."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingPass(null)}
        saveLabel="Commit Tier"
        maxWidth="sm:max-w-4xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-8">
             <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Plan Headline</Label>
                   <Input value={editingPass?.name || ""} onChange={e => setEditingPass({...editingPass, name: e.target.value})} className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-black text-lg px-6 shadow-inner" placeholder="e.g. Elite Quarterly" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Registry Price (₹)</Label>
                     <Input type="number" value={editingPass?.price || 0} onChange={e => setEditingPass({...editingPass, price: e.target.value})} className="h-12 md:h-14 rounded-xl border-none bg-slate-50 font-black text-primary text-center text-xl shadow-inner" />
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Validity Nodes (Days)</Label>
                     <Input type="number" value={editingPass?.durationDays || 30} onChange={e => setEditingPass({...editingPass, durationDays: e.target.value})} className="h-12 md:h-14 rounded-xl border-none bg-slate-50 font-black text-blue-600 text-center text-xl shadow-inner" />
                  </div>
                </div>
             </div>

             <div className="space-y-4 text-left">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Zap className="h-3 w-3" /> Map Specific Mocks</Label>
                <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                   <Input value={mockSearch} onChange={e => setMockSearch(e.target.value)} className="pl-10 h-11 rounded-xl bg-slate-50 border-none text-[11px] font-bold shadow-inner" placeholder="Search test bank..." />
                </div>
                <div className="max-h-52 overflow-y-auto pr-2 custom-scrollbar space-y-1.5">
                   {mocks?.filter(m => m.title.toLowerCase().includes(mockSearch.toLowerCase())).map((m: any) => {
                      const isAllowed = editingPass?.allowedMocks?.includes(m.id)
                      return (
                         <button key={m.id} onClick={() => toggleMock(m.id)} className={cn("w-full p-3 rounded-xl flex items-center justify-between text-left transition-all", isAllowed ? "bg-[#0F172A] text-white shadow-lg" : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200")}>
                            <span className="text-[10px] font-bold uppercase truncate pr-4">{m.title}</span>
                            {isAllowed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : <div className="h-4 w-4 rounded-full border border-slate-200 shrink-0" />}
                         </button>
                      )
                   })}
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <div className="space-y-4 text-left">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Landmark className="h-3 w-3" /> Grant Authority Hubs</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {boards?.map((b: any) => {
                      const isAllowed = editingPass?.allowedCategories?.includes(b.id)
                      return (
                         <button key={b.id} onClick={() => toggleCategory(b.id)} className={cn("p-4 rounded-2xl flex items-center justify-between text-left border-2 transition-all", isAllowed ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200")}>
                            <span className="text-[10px] font-black uppercase tracking-tight">{b.abbreviation} Hub</span>
                            {isAllowed && <CheckCircle2 className="h-4 w-4" />}
                         </button>
                      )
                   })}
                </div>
             </div>

             <div className="space-y-4 pt-6 border-t border-slate-100 text-left">
                <p className="text-[9px] font-black uppercase text-slate-300 tracking-[0.3em] mb-4">Institutional Registry Config</p>
                <div className="space-y-3">
                   <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                      <div className="space-y-1">
                         <p className="text-[11px] font-black text-[#0F172A] uppercase">System Activation</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Enable purchase node for aspirants</p>
                      </div>
                      <Switch checked={editingPass?.active || false} onCheckedChange={v => setEditingPass({...editingPass, active: v})} />
                   </div>

                   <div className="space-y-2 pt-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tier Priority (Registry sorting)</Label>
                      <Input type="number" value={editingPass?.displayOrder || ""} onChange={e => setEditingPass({...editingPass, displayOrder: e.target.value})} className="h-12 bg-slate-50 border-none rounded-xl font-black text-center" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </AdminDialogShell>
    </div>
  )
}
