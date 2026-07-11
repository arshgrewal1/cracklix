"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useCollection, useFirestore } from "@/firebase"
import { collection, deleteDoc, doc, query, limit } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Current Affairs Bank Hub v1.0.
 */

export default function CABankPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")

  const caBankQuery = useMemo(() => (db ? query(collection(db, "ca_bank"), limit(500)) : null), [db])
  const { data: rawCaBank, loading } = useCollection<any>(caBankQuery)

  const caBank = useMemo(() => {
    if (!rawCaBank) return []
    const term = searchTerm.toLowerCase().trim()
    return rawCaBank.filter((q: any) => 
      (q.englishQuestion || "").toLowerCase().includes(term) ||
      (q.id || "").toLowerCase().includes(term)
    ).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [rawCaBank, searchTerm])

  const handleDelete = async (id: string) => {
    if (!db) return
    if (!confirm("Permanently purge this CA node?")) return
    await deleteDoc(doc(db, "ca_bank", id))
    toast({ title: "Node Purged" })
  }

  return (
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-500 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <FileJson className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black tracking-[0.2em] text-slate-400">Institutional CA Registry</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">CA Bank</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Master repository for all current affairs nodes.</p>
        </div>
        <Button asChild className="w-full md:w-auto h-11 md:h-14 px-8 bg-[#0F172A] hover:bg-black text-white rounded-full font-black text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3">
          <Link href="/admin/current-affairs/bulk"><Zap className="h-4 w-4" /> Ingest Nodes</Link>
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search CA bank..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-14 border-slate-100">
                <TableHead className="px-6 md:px-10 text-[9px] md:text-[10px] font-black tracking-widest text-slate-400">Node Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-400">Language</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="text-right px-6 md:px-10 text-[9px] md:text-[10px] font-black tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 5}).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="p-8 md:p-12"><Skeleton className="h-12 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>)
              ) : caBank.length > 0 ? caBank.map((q: any) => (
                <TableRow key={q.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-6 md:px-10 py-5 md:py-10">
                    <div className="max-w-md">
                       <p className="font-bold text-[#0F172A] text-sm md:text-base leading-snug line-clamp-2">{q.englishQuestion}</p>
                       <code className="text-[8px] font-mono text-slate-300 mt-2 block tracking-tighter">ID: {q.id}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 text-[8px] font-black uppercase px-2 rounded">
                        {q.punjabiQuestion ? 'ENG/PUN' : q.hindiQuestion ? 'ENG/HIN' : 'ENGLISH'}
                     </Badge>
                  </TableCell>
                  <TableCell>
                     <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase px-2 shadow-sm">BANKED</Badge>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-10">
                    <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100" asChild>
                          <Link href={`/admin/current-affairs/edit?id=${q.id}`}><Edit className="h-4 w-4" /></Link>
                       </Button>
                       <button className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all" onClick={() => handleDelete(q.id)}>
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-4">
                         <Archive className="h-16 w-16 text-slate-400" />
                         <p className="font-black text-2xl uppercase tracking-widest">Bank Hub Empty</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}