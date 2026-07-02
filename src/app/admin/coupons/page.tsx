"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Tag, Ticket } from "lucide-react"
import { useFirestore } from "@/firebase"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { useFirestoreCrud } from "@/hooks/useFirestoreCrud"
import { useFilteredCollection } from "@/hooks/useFilteredCollection"

export default function CouponManagement() {
  const db = useFirestore()

  const { data: filteredCoupons, loading, searchTerm, setSearchTerm } = useFilteredCollection<any>({
    db,
    collectionName: "coupons",
    orderByField: "createdAt",
    orderDirection: "desc",
    searchFields: ["code"],
  })

  const { isSaving, saveDocument, deleteDocument } = useFirestoreCrud({
    db,
    collectionName: "coupons",
    toastMessages: { saveSuccess: "Coupon Synced", deleteSuccess: "Coupon Removed" },
  })

  const [editingCoupon, setEditingCoupon] = useState<any>(null)

  const handleSave = async () => {
    if (!editingCoupon || !editingCoupon.code || !editingCoupon.discount) return
    const code = editingCoupon.code.toUpperCase().trim()
    await saveDocument(
      { ...editingCoupon, code, discount: parseFloat(editingCoupon.discount), createdAt: editingCoupon.createdAt },
      { id: code, onSuccess: () => setEditingCoupon(null) }
    )
  }

  return (
    <div className="space-y-6 md:space-y-10 text-[#0F172A] text-left animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        icon={Tag}
        label="Monetization Registry"
        title="Coupon Manager"
        subtitle="Create and manage discount codes for the Elite Pass."
        actionLabel="New Coupon"
        actionIcon={Plus}
        onAction={() => setEditingCoupon({ code: "", discount: 0, type: "percent", active: true })}
      />

      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search codes..."
      />

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
                <AdminTableSkeleton rows={4} columns={4} />
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
                        <button onClick={() => deleteDocument(c.id, "Permanently purge this coupon?")} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminDialogShell
        open={!!editingCoupon}
        onOpenChange={() => setEditingCoupon(null)}
        title="Coupon Architect"
        description="Register a new discount hub."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingCoupon(null)}
        saveLabel="Commit Code"
      >
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
      </AdminDialogShell>
    </div>
  )
}
