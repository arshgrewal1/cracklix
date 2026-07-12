"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  Loader2, 
  Zap,
  Lock,
  Unlock,
  Landmark,
  Settings,
  Layers,
  Activity
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, deleteDoc, doc, setDoc, serverTimestamp, query, orderBy } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton } from "@/components/admin"

/**
 * @fileOverview Institutional Mock Management Hub v20.1 (High-Fidelity).
 * FIXED: Resolved syntax error in TableBody ternary logic.
 * FIXED: Balanced header spacing and refined filter row density.
 */

export default function MockManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [boardFilter, setBoardFilter] = useState("all")
  const [accessFilter, setAccessFilter] = useState("all")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), orderBy("createdAt", "desc")) : null), [db])
  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db])

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    return [...rawMocks].filter(m => {
      const tier = (m.accessLevel || 'FREE').toUpperCase();
      const matchesSearch = m.title?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBoard = boardFilter === "all" || m.boardId === boardFilter || (m.boardIds && m.boardIds.includes(boardFilter))
      const matchesAccess = accessFilter === "all" || tier === accessFilter;
      return matchesSearch && matchesBoard && matchesAccess
    })
  }, [rawMocks, searchTerm, boardFilter, accessFilter])

  const toggleTier = async (mockId: string, currentTier: string) => {
    if (!db || togglingId) return
    const nextTier = currentTier === 'PREMIUM' ? 'FREE' : 'PREMIUM'
    setTogglingId(mockId)
    
    try {
      await setDoc(doc(db, "mocks", mockId), { 
        accessLevel: nextTier, 
        updatedAt: serverTimestamp() 
      }, { merge: true })
      toast({ title: "Registry Synced", description: `Series tier shifted to ${nextTier}.` })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db) return
    if (!confirm("Permanently purge this mock series from the registry?")) return
    await deleteDoc(doc(db, "mocks", id))
    toast({ title: "Series Purged" })
  }

  const formatMockType = (type: string) => {
    const map: Record<string, string> = {
      'FULL': 'Full Mock',
      'SUBJECT': 'Subject Test',
      'SECTIONAL': 'Sectional',
      'PYQ': 'PYQ Paper',
      'CA_QUIZ': 'CA Hub Quiz'
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-700 pt-2">
      {/* 1. HEADER HUB */}
      <AdminPageHeader
        icon={Layers}
        label="Institutional Test Registry"
        title="Mock Manager"
        subtitle="Coordinate and gate preparation series for all Punjab verticals."
        actionLabel="Assemble Series"
        actionIcon={Plus}
        actionHref="/admin/mocks/builder"
      />

      {/* 2. SEARCH & FILTERS HUB */}
      <div className="space-y-4 px-1">
         <AdminSearchInput
           value={searchTerm}
           onChange={setSearchTerm}
           placeholder="Search test series..."
         />
         
         <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-48">
               <select 
                  value={boardFilter} 
                  onChange={e => setBoardFilter(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-100 rounded-xl px-4 font-bold text-[11px] uppercase tracking-wider outline-none shadow-sm cursor-pointer"
               >
                  <option value="all">All Boards</option>
                  {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
               </select>
            </div>
            <div className="w-full sm:w-48">
               <select 
                  value={accessFilter} 
                  onChange={e => setAccessFilter(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-100 rounded-xl px-4 font-bold text-[11px] uppercase tracking-wider outline-none shadow-sm cursor-pointer"
               >
                  <option value="all">All Tiers</option>
                  <option value="FREE">Free Hub</option>
                  <option value="PREMIUM">Elite Hub</option>
               </select>
            </div>
         </div>
      </div>

      {/* 3. DATA LEDGER */}
      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between">
           <CardTitle className="text-sm md:text-xl font-black text-[#0F172A] uppercase tracking-tight flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" /> Mock Registry
           </CardTitle>
           <Badge variant="outline" className="text-[8px] font-black uppercase text-slate-400">{mocks.length} Series Nodes</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-14 border-slate-100">
                  <TableHead className="px-6 md:px-10 text-[9px] md:text-[10px] font-black tracking-widest text-slate-400 uppercase">Series Identity</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-400 uppercase">Type & Hub</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-400 text-center uppercase">Tier</TableHead>
                  <TableHead className="text-right px-6 md:px-10 text-[9px] md:text-[10px] font-black tracking-widest text-slate-400 uppercase">Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mocksLoading ? (
                  <AdminTableSkeleton rows={5} columns={4} />
                ) : mocks.length > 0 ? (
                  mocks.map((mock: any) => {
                    const tier = (mock.accessLevel || 'FREE').trim().toUpperCase();
                    const isSyncing = togglingId === mock.id;
                    const boardAbbr = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId))?.abbreviation || 'GOVT';
                    
                    return (
                      <TableRow key={mock.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                        <TableCell className="px-6 md:px-10 py-5 md:py-8">
                          <div className="flex flex-col text-left">
                             <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate max-w-[200px] md:max-w-md">{mock.title}</p>
                             <div className="flex items-center gap-2 mt-1.5">
                                <Badge className="bg-slate-50 text-slate-400 border-none text-[8px] font-bold rounded px-1.5">ID: {mock.id.slice(-6)}</Badge>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{(mock.questionIds?.length || 0)} Nodes</span>
                             </div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1.5 text-left">
                              <Badge variant="outline" className="border-slate-100 text-slate-400 text-[8px] font-black px-2 py-0.5 rounded tracking-widest">{boardAbbr} Hub</Badge>
                              <p className="text-[9px] font-bold text-primary uppercase tracking-tight">{formatMockType(mock.mockType)}</p>
                           </div>
                        </TableCell>
                        <TableCell className="text-center">
                           <button 
                              onClick={() => toggleTier(mock.id, tier)}
                              disabled={isSyncing}
                              className="inline-flex items-center gap-2 focus:outline-none transition-all active:scale-95 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm"
                           >
                              {isSyncing ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : tier === 'PREMIUM' ? <Lock className="h-3 w-3 text-amber-500" /> : <Unlock className="h-3 w-3 text-emerald-500" />}
                              <span className={cn("text-[9px] font-black uppercase tracking-widest", tier === 'PREMIUM' ? "text-amber-600" : "text-emerald-600")}>
                                 {tier}
                              </span>
                           </button>
                        </TableCell>
                        <TableCell className="text-right px-6 md:px-10">
                          <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                             <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary" asChild>
                                <Link href={`/admin/mocks/builder?id=${mock.id}`} title="Modify Structure"><Edit className="h-4 w-4" /></Link>
                             </Button>
                             <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600" asChild>
                                <Link href={`/admin/mocks/manual-edit?id=${mock.id}`} title="Edit Content"><Settings className="h-4 w-4" /></Link>
                             </Button>
                             <button className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all" onClick={() => handleDelete(mock.id)}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                     <TableCell colSpan={4} className="h-60 md:h-80 text-center">
                        <div className="flex flex-col items-center justify-center opacity-10 space-y-4">
                           <Zap className="h-16 w-16 md:h-24 md:w-24 text-slate-400" />
                           <p className="font-black text-sm md:text-2xl uppercase tracking-widest">No active archives</p>
                        </div>
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
