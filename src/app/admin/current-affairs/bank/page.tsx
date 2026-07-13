
"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Trash2, 
  Edit, 
  FileJson, 
  Loader2, 
  Zap,
  Filter,
  ArrowRight,
  Archive,
  AlertCircle,
  Database,
  Plus,
  ShieldCheck
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, deleteDoc, doc, query, limit, orderBy } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton } from "@/components/admin"

/**
 * @fileOverview Institutional Current Affairs Bank Hub v2.1.
 * FIXED: Added missing ShieldCheck import.
 */

export default function CABankPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")

  const caBankQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "ca_bank"), limit(500));
  }, [db])

  const { data: rawCaBank, loading } = useCollection<any>(caBankQuery)

  const caBank = useMemo(() => {
    if (!rawCaBank) return []
    const term = searchTerm.toLowerCase().trim()
    return [...rawCaBank].filter((q: any) => 
      (q.englishQuestion || "").toLowerCase().includes(term) ||
      (q.id || "").toLowerCase().includes(term)
    ).sort((a, b) => {
       const tA = a.updatedAt?.seconds || 0;
       const tB = b.updatedAt?.seconds || 0;
       return tB - tA;
    })
  }, [rawCaBank, searchTerm])

  const handleDelete = async (id: string) => {
    if (!db) return
    if (!confirm("Permanently purge this CA node from the independent bank?")) return
    await deleteDoc(doc(db, "ca_bank", id))
    toast({ title: "Node Purged" })
  }

  return (
    <div className="space-y-10 md:space-y-16 text-left pb-32 animate-in fade-in duration-700 pt-2">
      
      {/* 1. HEADER HUB */}
      <AdminPageHeader
        icon={FileJson}
        label="Current Affairs Registry"
        title="CA Bank"
        subtitle="Master repository for daily and monthly news nodes."
        actionLabel="Ingest CA Nodes"
        actionIcon={Zap}
        actionHref="/admin/current-affairs/bulk"
      />

      {/* 2. SEARCH & FILTER HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-1">
         <div className="lg:col-span-8">
            <AdminSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search CA bank for statements or IDs..."
            />
         </div>
         <div className="lg:col-span-4 flex items-center gap-3">
            <div className="flex-1 bg-white border border-slate-100 rounded-2xl md:rounded-full px-6 h-14 md:h-16 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bank Density</span>
               </div>
               <span className="font-black text-lg text-[#0F172A] tabular-nums">{caBank.length}</span>
            </div>
         </div>
      </div>

      {/* 3. DATA LEDGER */}
      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between">
           <CardTitle className="text-sm md:text-xl font-black text-[#0F172A] uppercase tracking-tight flex items-center gap-3">
              <Archive className="h-5 w-5 text-primary" /> Archive Ledger
           </CardTitle>
           <Badge variant="outline" className="text-[8px] font-black uppercase text-slate-400">Registry Snapshot</Badge>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-16 border-slate-100">
                  <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Node Identity & Statement</TableHead>
                  <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Language Hub</TableHead>
                  <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center text-slate-400">Status</TableHead>
                  <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <AdminTableSkeleton rows={6} columns={4} />
                ) : caBank.length > 0 ? caBank.map((q: any) => (
                  <TableRow key={q.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                    <TableCell className="px-8 md:px-12 py-6 md:py-10">
                      <div className="max-w-md lg:max-w-xl">
                         <p className="font-bold text-[#0F172A] text-sm md:text-base leading-snug line-clamp-2">{q.englishQuestion}</p>
                         <div className="flex items-center gap-2 mt-2.5">
                            <Badge className="bg-slate-100 text-slate-400 border-none text-[8px] font-black rounded uppercase">ID: {q.id.slice(-12)}</Badge>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Isolated Node</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="bg-primary/5 border-none text-primary text-[8px] md:text-[9px] font-black uppercase px-3 py-1 rounded shadow-sm tracking-tighter">
                          {q.punjabiQuestion ? 'English & Punjabi' : q.hindiQuestion ? 'English & Hindi' : 'English Only'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase">Live</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-8 md:px-12">
                      <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                         <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-primary active:scale-90" asChild>
                            <Link href={`/admin/questions/add?id=${q.id}&type=ca`}><Edit className="h-5 w-5" /></Link>
                         </Button>
                         <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all" onClick={() => handleDelete(q.id)}>
                            <Trash2 className="h-5 w-5" />
                         </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                     <TableCell colSpan={4} className="h-80 md:h-[500px] text-center">
                        <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                           <Database className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                           <p className="font-black text-xl md:text-3xl uppercase tracking-[0.4em]">Bank Vault Empty</p>
                        </div>
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center gap-4 text-slate-300 py-10">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-[9px] font-black uppercase tracking-[0.5em]">Institutional Ingestion Hub Synchronized</span>
      </div>
    </div>
  )
}
