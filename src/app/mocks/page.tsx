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
  ChevronRight, 
  Clock, 
  BookOpen, 
  Loader2, 
  Zap,
  Lock,
  Unlock,
  Landmark,
  Settings,
  Layers
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Institutional Mock Management Hub v21.0.
 * FIXED: Resolved "count" find name error in MetricBlock.
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
    if (!confirm("Permanently purge this mock series?")) return
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
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black tracking-[0.2em] text-slate-400">Institutional Test Registry</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">Mock Manager</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Coordinate and gate preparation series for all Punjab verticals.</p>
        </div>
        <Button asChild className="w-full md:w-auto h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3">
          <Link href="/admin/mocks/builder"><Zap className="h-4 w-4" /> Assemble Series</Link>
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search series..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardHeader className="p-4 md:p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4 justify-between items-center">
            <h3 className="text-sm md:text-2xl font-black text-[#0F172A]">Mock Registry</h3>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
               <Select value={boardFilter} onValueChange={setBoardFilter}>
                  <SelectTrigger className="flex-1 md:w-40 rounded-full h-10 md:h-11 bg-white border-slate-200 shadow-sm font-bold text-xs">
                     <div className="flex items-center gap-2"><Landmark className="h-3 w-3" /> <SelectValue /></div>
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Boards</SelectItem>
                     {boards?.map((b:any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}
                  </SelectContent>
               </Select>
               <Select value={accessFilter} onValueChange={setAccessFilter}>
                  <SelectTrigger className="flex-1 md:w-40 rounded-full h-10 md:h-11 bg-white border-slate-200 shadow-sm font-bold text-xs">
                     <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Tiers</SelectItem>
                     <SelectItem value="FREE">Free Hub</SelectItem>
                     <SelectItem value="PREMIUM">Elite Hub</SelectItem>
                  </SelectContent>
               </Select>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-14 border-slate-100">
                  <TableHead className="px-6 md:px-10 text-[9px] md:text-[10px] font-black tracking-widest text-slate-400">Series Identity</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-400">Type & Node</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-400 text-center">Tier</TableHead>
                  <TableHead className="text-right px-6 md:px-10 text-[9px] md:text-[10px] font-black tracking-widest text-slate-400">Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({length: 5}).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="p-8"><Skeleton className="h-12 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>)
                ) : mocks.map((mock: any) => {
                      const tier = (mock.accessLevel || 'FREE').trim().toUpperCase();
                      const isSyncing = togglingId === mock.id;
                      const boardAbbr = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId))?.abbreviation || 'GOVT';
                      
                      return (
                        <TableRow key={mock.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                          <TableCell className="px-6 md:px-10 py-5 md:py-8">
                            <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate max-w-[200px] md:max-w-md">{mock.title}</p>
                            <div className="flex items-center gap-3 mt-1.5 md:mt-2">
                               <p className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-widest">{(mock.questionIds?.length || 0)} Questions • {mock.duration}m</p>
                            </div>
                          </TableCell>
                          <TableCell>
                             <div className="space-y-1">
                                <Badge variant="outline" className="border-slate-100 text-slate-400 text-[7px] md:text-[8px] font-black px-2 rounded">{boardAbbr} HUB</Badge>
                                <p className="text-[8px] md:text-[9px] font-bold text-primary tracking-tight">{formatMockType(mock.mockType)}</p>
                             </div>
                          </TableCell>
                          <TableCell className="text-center">
                             <button 
                                onClick={() => toggleTier(mock.id, tier)}
                                disabled={isSyncing}
                                className="inline-flex items-center gap-2 md:gap-3 focus:outline-none transition-all active:scale-95"
                             >
                                {isSyncing ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : tier === 'PREMIUM' ? <Lock className="h-3 w-3 text-amber-500" /> : <Unlock className="h-3 w-3 text-emerald-500" />}
                                <Badge className={cn("border-none text-[8px] font-black px-2 py-0.5 rounded shadow-sm", tier === 'PREMIUM' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                                   {tier === 'PREMIUM' ? 'ELITE' : 'FREE'}
                                </Badge>
                             </button>
                          </TableCell>
                          <TableCell className="text-right px-6 md:px-10">
                            <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                               <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-slate-50 hover:bg-white hover:text-primary shadow-sm" asChild>
                                  <Link href={`/admin/mocks/builder?id=${mock.id}`}><Edit className="h-4 w-4" /></Link>
                               </Button>
                               <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 shadow-sm" asChild>
                                  <Link href={`/admin/mocks/manual-edit?id=${mock.id}`}><Settings className="h-4 w-4" /></Link>
                               </Button>
                               <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(mock.id)}>
                                  <Trash2 className="h-4 w-4" />
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

function MetricBlock({ label, val, icon: Icon }: any) {
   return (
      <div className="flex items-center gap-2.5 text-slate-500 font-bold text-[9px] md:text-[13px] uppercase">
         <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary/50" />
         <span className="text-[#0F172A] font-black tabular-nums">{val}</span>
         <span className="text-[8px] md:text-[11px] tracking-tight">{label}</span>
      </div>
   )
}
