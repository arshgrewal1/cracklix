"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ClipboardList, 
  Layers, 
  ChevronRight, 
  Clock, 
  FileText, 
  Calendar, 
  BookOpen, 
  ListTree, 
  FileStack, 
  Filter, 
  CheckCircle2, 
  Loader2, 
  X, 
  Zap,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
  Landmark,
  Tags,
  Settings
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, deleteDoc, doc, setDoc, serverTimestamp, where, writeBatch } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Mock Management Hub v16.0.
 * Layout refactor: Removed redundant horizontal padding.
 */

export default function MockManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [boardFilter, setBoardFilter] = useState("all")
  const [accessFilter, setAccessFilter] = useState("all")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const mocksQuery = useMemo(() => (db ? collection(db, "mocks") : null), [db])
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])

  const { data: rawMocks, loading } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    return [...rawMocks]
      .filter(m => {
        const tier = (m.accessLevel || 'FREE').toUpperCase();
        const matchesSearch = m.title?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesBoard = boardFilter === "all" || m.boardId === boardFilter || (m.boardIds && m.boardIds.includes(boardFilter))
        const matchesAccess = accessFilter === "all" || tier === accessFilter;
        return matchesSearch && matchesBoard && matchesAccess
      })
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [rawMocks, searchTerm, boardFilter, accessFilter])

  const stats = useMemo(() => {
    if (!rawMocks) return { total: 0, free: 0, premium: 0 };
    return {
      total: rawMocks.length,
      free: rawMocks.filter((m: any) => (m.accessLevel || 'FREE') === 'FREE').length,
      premium: rawMocks.filter((m: any) => m.accessLevel === 'PREMIUM').length
    };
  }, [rawMocks]);

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
    if (!confirm("CRITICAL: Permanently purge this mock series?")) return
    await deleteDoc(doc(db, "mocks", id))
    toast({ title: "Series Purged" })
  }

  const formatMockType = (type: string) => {
    const map: Record<string, string> = {
      'FULL': 'Full Length Mock',
      'SUBJECT': 'Subject-Wise Test',
      'SECTIONAL': 'Sectional Test',
      'PYQ': 'PYQ Paper',
      'CA_QUIZ': 'CA Hub Quiz'
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-12 text-left pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Layers className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Institutional Test Registry</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">Mock Manager</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Coordinate and gate preparation series for all Punjab verticals.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-orange-600 gap-3 font-black shadow-2xl rounded-2xl h-16 px-12 uppercase tracking-widest text-[11px] transition-all border-none">
          <Link href="/admin/mocks/builder"><Zap className="h-5 w-5" /> Assemble Series</Link>
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col lg:flex-row gap-6 justify-between items-center">
           <div className="relative w-full lg:w-[40%]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input className="pl-14 h-14 rounded-2xl bg-white border-slate-100 shadow-inner font-medium" placeholder="Search series..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
               <Select value={boardFilter} onValueChange={setBoardFilter}>
                  <SelectTrigger className="w-40 rounded-xl h-12 bg-white border-slate-200 shadow-sm font-bold text-xs"><div className="flex items-center gap-2"><Landmark className="h-3 w-3" /> <SelectValue /></div></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Boards</SelectItem>{boards?.map((b:any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation} Hub</SelectItem>)}</SelectContent>
               </Select>
               <Select value={accessFilter} onValueChange={setAccessFilter}>
                  <SelectTrigger className="w-40 rounded-xl h-12 bg-white border-slate-200 shadow-sm font-bold text-xs"><SelectValue placeholder="All Tiers" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Tiers</SelectItem><SelectItem value="FREE">FREE ONLY</SelectItem><SelectItem value="PREMIUM">PREMIUM ONLY</SelectItem></SelectContent>
               </Select>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-20 border-slate-100">
                  <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Series Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type & Node</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tier Governance</TableHead>
                  <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Audit Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   Array.from({length: 5}).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="p-10"><Skeleton className="h-16 w-full rounded-2xl" /></TableCell></TableRow>)
                ) : mocks.map((mock: any) => {
                    const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
                    const isSyncing = togglingId === mock.id;
                    const boardAbbr = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId))?.abbreviation || 'GOVT';
                    
                    return (
                      <TableRow key={mock.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                        <TableCell className="px-10 py-8">
                          <p className="font-black text-[#0F172A] text-lg uppercase leading-none">{mock.title}</p>
                          <div className="flex items-center gap-3 mt-2">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{mock.totalQuestions} Questions • {mock.duration}m</p>
                             {mock.boardIds?.length > 1 && <Badge className="bg-blue-50 text-blue-600 border-none text-[7px] font-black uppercase">Multi-Board</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1.5">
                              <Badge variant="outline" className="border-slate-100 text-slate-500 text-[8px] font-black uppercase px-2">{boardAbbr} HUB</Badge>
                              <p className="text-[9px] font-black text-primary uppercase tracking-tight">{formatMockType(mock.mockType)}</p>
                           </div>
                        </TableCell>
                        <TableCell>
                           <button 
                              onClick={() => toggleTier(mock.id, tier)}
                              disabled={isSyncing}
                              className="flex items-center gap-3 focus:outline-none"
                           >
                              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : tier === 'PREMIUM' ? <Lock className="h-4 w-4 text-amber-500" /> : <Unlock className="h-4 w-4 text-emerald-500" />}
                              <Badge className={cn("border-none text-[8px] font-black px-3 py-1 rounded-lg shadow-sm", tier === 'PREMIUM' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                                 {tier}
                              </Badge>
                           </button>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-white hover:text-primary shadow-sm" asChild>
                                <Link href={`/admin/mocks/builder?id=${mock.id}`}><Edit className="h-5 w-5" /></Link>
                             </Button>
                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 shadow-sm" asChild>
                                <Link href={`/admin/mocks/manual-edit?id=${mock.id}`}><Settings className="h-5 w-5" /></Link>
                             </Button>
                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(mock.id)}>
                                <Trash2 className="h-5 w-5" />
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
