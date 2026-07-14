"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Megaphone, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Zap, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Archive,
  BarChart3,
  Globe
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, where } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Vacancy } from "@/types"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton } from "@/components/admin"

/**
 * @fileOverview Vacancy Hub Dashboard v1.0.
 * Central administrative node for all recruitment listings.
 */

export default function VacancyDashboard() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")

  const vacancyQuery = useMemo(() => (db ? query(collection(db, "vacancies"), orderBy("updatedAt", "desc")) : null), [db])
  const { data: vacancies, loading } = useCollection<Vacancy>(vacancyQuery as any)

  const stats = useMemo(() => {
    if (!vacancies) return { total: 0, published: 0, draft: 0, expired: 0, scheduled: 0 }
    return {
      total: vacancies.length,
      published: vacancies.filter(v => v.status === 'PUBLISHED').length,
      draft: vacancies.filter(v => v.status === 'DRAFT').length,
      expired: vacancies.filter(v => v.status === 'EXPIRED').length,
      scheduled: vacancies.filter(v => v.status === 'SCHEDULED').length,
    }
  }, [vacancies])

  const filteredVacancies = useMemo(() => {
    if (!vacancies) return []
    return vacancies.filter(v => 
      v.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.department?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [vacancies, searchTerm])

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently purge this vacancy node from the registry?")) return
    await deleteDoc(doc(db, "vacancies", id))
    toast({ title: "Vacancy Purged" })
  }

  return (
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-700 pt-2">
      
      <AdminPageHeader
        icon={Megaphone}
        label="Recruitment Registry Hub"
        title="Vacancy Hub"
        subtitle="Manage official recruitment notifications and job postings."
        actionLabel="Add Vacancy"
        actionIcon={Plus}
        actionHref="/admin/vacancies/add"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-1">
         <StatNode label="Total" val={stats.total} color="text-[#0F172A]" bg="bg-slate-50" />
         <StatNode label="Published" val={stats.published} color="text-emerald-600" bg="bg-emerald-50" />
         <StatNode label="Draft" val={stats.draft} color="text-slate-400" bg="bg-slate-50" />
         <StatNode label="Scheduled" val={stats.scheduled} color="text-blue-600" bg="bg-blue-50" />
         <StatNode label="Expired" val={stats.expired} color="text-rose-600" bg="bg-rose-50" />
      </div>

      <div className="px-1 max-w-2xl">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by title or department..."
        />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-16 border-slate-100">
                <TableHead className="px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Position & Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department hub</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Status</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={5} columns={4} />
              ) : filteredVacancies.length > 0 ? filteredVacancies.map((v) => (
                <TableRow key={v.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-8 md:px-12 py-6 md:py-8">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                           <Megaphone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-[#0F172A] text-sm md:text-base leading-tight truncate max-w-[250px]">{v.title}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                              <Zap className="h-2.5 w-2.5" /> ID: {v.id.slice(-8)}
                           </p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-600 line-clamp-1">{v.department}</p>
                        <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 text-[8px] font-black uppercase px-2 py-0.5 tracking-tighter">{v.type}</Badge>
                     </div>
                  </TableCell>
                  <TableCell>
                     <Badge className={cn(
                       "border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm",
                       v.status === 'PUBLISHED' ? "bg-emerald-50 text-emerald-600" :
                       v.status === 'DRAFT' ? "bg-slate-100 text-slate-400" :
                       v.status === 'SCHEDULED' ? "bg-blue-50 text-blue-600" :
                       "bg-rose-50 text-rose-600"
                     )}>
                        {v.status}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90" asChild>
                           <Link href={`/admin/vacancies/add?id=${v.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <button className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all" onClick={() => handleDelete(v.id)}>
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 md:h-[500px] text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                         <Megaphone className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                         <p className="font-black text-xl md:text-3xl uppercase tracking-[0.4em]">Registry Empty</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

function StatNode({ label, val, color, bg }: any) {
   return (
      <div className={cn("p-5 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-1 transition-all hover:translate-y-[-2px] bg-white")}>
         <span className={cn("text-xl md:text-3xl font-black tabular-nums", color)}>{val}</span>
         <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">{label}</span>
      </div>
   )
}
