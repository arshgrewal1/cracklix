
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Tag, Ticket, Percent, DollarSign } from "lucide-react"
import { useFirestore } from "@/firebase"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { useFirestoreCrud } from "@/hooks/useFirestoreCrud"
import { useFilteredCollection } from "@/hooks/useFilteredCollection"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * @fileOverview Official Coupon Governance Hub v3.1.
 * UPDATED: Replaced 'node' with 'item' or 'entry'.
 */

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
      { ...editingCoupon, code, discount: parseFloat(editingCoupon.discount), createdAt: editingCoupon.createdAt || new Date().toISOString() },
      { id: code, onSuccess: () => setEditingCoupon(null) }
    )
  }

  return (
    <div className="space-y-10 md:space-y-16 text-[#0F172A] text-left animate-in fade-in duration-700 pb-32 pt-2">
      
      {/* 1. HEADER HUB - REBALANCED SPACING */}
      <AdminPageHeader
        icon={Tag}
        label="Monetization Registry"
        title="Coupon Manager"
        subtitle="Create and manage discount codes for the Elite Pass."
        actionLabel="New Coupon"
        actionIcon={Plus}
        onAction={() => setEditingCoupon({ code: "", discount: 0, type: "percent", active: true })}
      />

      {/* 2. SEARCH ENGINE */}
      <div className="max-w-2xl">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by promo code..."
        />
      </div>

      {/* 3. DATA LEDGER */}
      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-20">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Coupon Code</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Discount Entry</TableHead>
                <TableHead className="text-center text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={4} columns={4} />
              ) : filteredCoupons.length > 0 ? filteredCoupons.map((c: any) => (
                <TableRow key={c.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-8 md:px-12 py-6 md:py-10 text-left">
                     <div className="flex items-center gap-4 md:gap-8">
                        <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                           <Ticket className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                        </div>
                        <p className="font-black text-[#0F172A] text-base md:text-2xl tracking-widest">{c.code}</p>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                           {c.type === 'percent' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                        </div>
                        <p className="font-black text-[#0F172A] text-sm md:text-xl">
                           {c.type === 'percent' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}
                        </p>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={cn("border-none text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm", c.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                        {c.active ? 'System Online' : 'Disabled'}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingCoupon(c)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => deleteDocument(c.id, "Permanently purge this coupon?")} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-80 text-center">
                       <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                          <Tag className="h-20 w-20 text-slate-400" />
                          <p className="font-black text-2xl uppercase tracking-[0.3em]">Registry Empty</p>
                       </div>
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. DIALOG HUB - HIGH FIDELITY SELECTS */}
      <AdminDialogShell
        open={!!editingCoupon}
        onOpenChange={() => setEditingCoupon(null)}
        title="Coupon Architect"
        description="Configure tiered discount metadata."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingCoupon(null)}
        saveLabel="Commit Code"
      >
        <div className="space-y-1.5 text-left">
          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Promo Code Entry</Label>
          <Input 
            value={editingCoupon?.code || ""} 
            onChange={e => setEditingCoupon({...editingCoupon, code: e.target.value.toUpperCase()})} 
            className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-black text-lg md:text-2xl px-6 shadow-inner tracking-widest" 
            placeholder="E.G. CRACK20" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Discount Mode</Label>
            <Select value={editingCoupon?.type || "percent"} onValueChange={(v) => setEditingCoupon({...editingCoupon, type: v})}>
               <SelectTrigger className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-bold px-6 shadow-inner">
                  <SelectValue />
               </SelectTrigger>
               <SelectContent className="bg-[#0B1528] border-white/10 text-white">
                  <SelectItem value="percent">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
               </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Value Hub</Label>
            <Input 
              type="number" 
              value={editingCoupon?.discount || 0} 
              onChange={e => setEditingCoupon({...editingCoupon, discount: e.target.value})} 
              className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-black text-center text-xl md:text-3xl text-primary shadow-inner" 
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-6 md:p-10 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-inner mt-4">
          <div className="space-y-1">
            <p className="text-[11px] md:text-sm font-black text-[#0F172A] uppercase">Activation Sync</p>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allow usage across all checkout points</p>
          </div>
          <Switch checked={editingCoupon?.active || false} onCheckedChange={v => setEditingCoupon({...editingCoupon, active: v})} />
        </div>
      </AdminDialogShell>
    </div>
  )
}
