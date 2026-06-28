"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, Tag, Search, Loader2, X, CheckCircle2, Ticket } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export default function CouponManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const couponQuery = useMemo(() => (db ? query(collection(db, "coupons"), orderBy("createdAt", "desc")) : null), [db])
  const { data: coupons, loading } = useCollection<any>(couponQuery)

  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSave = async () => {
    if (!db || !editingCoupon) return
    if (!editingCoupon.code || !editingCoupon.discount) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Code and Discount are mandatory." })
       return
    }

    setIsSaving(true)
    const code = editingCoupon.code.toUpperCase().trim()
    try {
      await setDoc(doc(db, "coupons", code), {
        ...editingCoupon,
        id: code,
        code,
        discount: parseFloat(editingCoupon.discount),
        updatedAt: serverTimestamp(),
        createdAt: editingCoupon.createdAt || serverTimestamp()
      }, { merge: true })
      toast({ title: "Coupon Synced" })
      setEditingCoupon(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently purge this coupon?")) return
    await deleteDoc(doc(db, "coupons", id))
    toast({ title: "Coupon Removed" })
  }

  const filteredCoupons = useMemo(() => {
    if (!coupons) return []
    return coupons.filter((c: any) => 
      c.code?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [coupons, searchTerm])

  return (
    <div className="space-y-6 md:space-y-10 text-[#0F172A] text-left animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Monetization Registry</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black tracking-tight text-[#0F172A]">Coupon Manager</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Create and manage discount codes for the Elite Pass.</p>
        </div>
        <Button 
          onClick={() => setEditingCoupon({ code: "", discount: 0, type: "percent", active: true })} 
          className="w-full md:w-auto bg-primary hover:bg-blue-700 h-11 md:h-14 px-8 rounded-full font-black text-[10px] tracking-widest shadow-xl border-none active:scale-95 gap-2"
        >
          <Plus className="h-4 w-4" /> New Coupon
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search codes..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black text-slate-400">Coupon Code</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black text-slate-400">Value</TableHead>
                <TableHead className="text-center text-[9px] md:text-[10px] font-black text-slate-400">Status</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black text-slate-400">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-6 py-6 md:px-12 md:py-8"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>)
              ) : filteredCoupons.map((c: any) => (
                <TableRow key={c.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-6 md:px-12 py-5 md:py-8 text-left">
                     <div className="flex items-center gap-4 md:gap-6">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                           <Ticket className="h-5 w-5 text-primary" />
                        </div>
                        <p className="font-black text-[#0F172A] text-sm md:text-xl tracking-widest">{c.code}</p>
                     </div>
                  </TableCell>
                  <TableCell>
                     <p className="font-bold text-[#0F172A] text-xs md:text-lg">{c.type === 'percent' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}</p>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={cn("border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5", c.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                        {c.active ? 'Active' : 'Disabled'}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingCoupon(c)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(c.id)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingCoupon} onOpenChange={o => !o && setEditingCoupon(null)}>
         <DialogContent className="sm:max-w-xl w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-primary shrink-0" />
            <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
               <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Coupon Architect</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1 uppercase tracking-widest">Register a new discount hub.</DialogDescription>
            </DialogHeader>
            <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase">Promo Code</Label>
                  <Input value={editingCoupon?.code || ""} onChange={e => setEditingCoupon({...editingCoupon, code: e.target.value.toUpperCase()})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-black text-lg px-6" placeholder="E.G. CRACK20" />
               </div>
               <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase">Discount Type</Label>
                     <select value={editingCoupon?.type || "percent"} onChange={e => setEditingCoupon({...editingCoupon, type: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                     </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase">Value</Label>
                     <Input type="number" value={editingCoupon?.discount || 0} onChange={e => setEditingCoupon({...editingCoupon, discount: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-black text-center text-lg" />
                  </div>
               </div>
               <div className="flex items-center justify-between p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-[#0F172A] uppercase">Activation</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Enable usage during checkout</p>
                  </div>
                  <Switch checked={editingCoupon?.active || false} onCheckedChange={v => setEditingCoupon({...editingCoupon, active: v})} />
               </div>
            </div>
            <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4">
               <Button variant="ghost" onClick={() => setEditingCoupon(null)} className="h-11 md:h-12 px-6 font-black uppercase text-[10px] text-slate-400">Discard</Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-primary hover:bg-blue-700 text-white h-11 md:h-12 rounded-full font-black text-[10px] tracking-widest shadow-xl border-none active:scale-95 gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Code
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
