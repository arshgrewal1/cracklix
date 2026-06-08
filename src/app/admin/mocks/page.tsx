
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
  Unlock
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
 * @fileOverview Institutional Mock Manager v18.0.
 * UPDATED: Added Access Level (FREE/PREMIUM) filtering and tier management.
 */

export default function MockManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [boardFilter, setBoardFilter] = useState("all")
  const [accessFilter, setAccessFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  const mocksQuery = useMemo(() => (db ? collection(db, "mocks") : null), [db])
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])

  const { data: rawMocks, loading } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    return [...rawMocks]
      .filter(m => {
        const matchesSearch = m.title?.toLowerCase().includes(searchTerm.toLowerCase())
        // Support both legacy single boardId and new boardIds array
        const matchesBoard = boardFilter === "all" || 
                           m.boardId === boardFilter || 
                           (m.boardIds && Array.isArray(m.boardIds) && m.boardIds.includes(boardFilter))
        const matchesAccess = accessFilter === "all" || (m.accessType || 'FREE') === accessFilter;
        return matchesSearch && matchesBoard && matchesAccess
      })
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [rawMocks, searchTerm, boardFilter, accessFilter])

  const handleDeleteSingle = async (id: string) => {
    if (!db) return
    if (!confirm("Permanently purge this series from the registry?")) return
    await deleteDoc(doc(db, "mocks", id))
    setSelectedIds(prev => prev.filter(sid => sid !== id))
    toast({ title: "Series Purged" })
  }

  const handleBulkDelete = async () => {
    if (!db || selectedIds.length === 0) return
    if (!confirm(`Permanently delete ${selectedIds.length} selected series?`)) return

    setIsDeletingBulk(true)
    const batch = writeBatch(db)
    selectedIds.forEach(id => batch.delete(doc(db, "mocks", id)))

    try {
      await batch.commit()
      setSelectedIds([])
      toast({ title: "Bulk Audit Complete", description: "Selected mocks removed from cloud." })
    } catch (e) {
      toast({ variant: "destructive", title: "Mass Delete Failed" })
    } finally {
      setIsDeletingBulk(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(mocks.map(m => m.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(sid => sid !== id))
    }
  }

  const togglePublish = async (id: string, current: boolean) => {
    if (!db) return
    await setDoc(doc(db, "mocks", id), { published: !current, updatedAt: serverTimestamp() }, { merge: true })
    toast({ title: "Registry Updated" })
  }

  return (
    <div className="space-y-8 md:space-y-12 text-left pb-32 px-4 md:px-0 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Layers className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Mock List Hub</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-headline font-black text-primary uppercase tracking-tight">Mock Manager</h1>
          <p className="text-slate-500 mt-1 font-medium">Audit and manage all preparation series.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <Button asChild variant="outline" className="h-12 md:h-16 px-6 md:px-10 rounded-xl font-black uppercase tracking-widest text-[9px] border-slate-200 bg-white">
              <Link href="/admin/mocks/builder"><Plus className="h-4 w-4" /> Architect</Link>
           </Button>
           <Button asChild className="bg-primary hover:bg-orange-600 gap-2 font-black shadow-2xl rounded-xl h-12 md:h-16 px-8 md:px-12 uppercase tracking-widest text-[10px] flex-1 md:flex-none">
             <Link href="/admin/mocks/builder"><Zap className="h-5 w-5" /> Assemble New</Link>
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-2xl md:rounded-[3rem] overflow-hidden">
        <CardHeader className="p-4 md:p-10 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-[35%]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input className="pl-12 h-11 md:h-14 rounded-xl md:rounded-2xl bg-white border-slate-100 shadow-inner" placeholder="Search series title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-44">
                <Select value={boardFilter} onValueChange={setBoardFilter}>
                  <SelectTrigger className="w-full rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs">
                    <SelectValue placeholder="Filter Board" />
                  </SelectTrigger>
                  <SelectContent><SelectItem value="all">All Boards</SelectItem>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-44">
                <Select value={accessFilter} onValueChange={setAccessFilter}>
                  <SelectTrigger className="w-full rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs">
                    <SelectValue placeholder="Access Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="FREE">Free Mocks</SelectItem>
                    <SelectItem value="PREMIUM">Premium Mocks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-20 border-slate-100">
                  <TableHead className="w-16 px-6 text-center">
                    <Checkbox 
                      checked={selectedIds.length === mocks.length && mocks.length > 0} 
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-primary"
                    />
                  </TableHead>
                  <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tier & Category</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                  <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   Array.from({ length: 4 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5} className="p-10"><Skeleton className="h-16 w-full rounded-xl" /></TableCell></TableRow>)
                ) : mocks.map((mock: any) => {
                  const isSelected = selectedIds.includes(mock.id);
                  const isPremium = (mock.accessType || 'FREE') === 'PREMIUM';
                  return (
                    <TableRow key={mock.id} className={cn("hover:bg-slate-50 border-slate-50 transition-colors group", isSelected && "bg-primary/5")}>
                      <TableCell className="px-6 text-center">
                         <Checkbox 
                           checked={isSelected} 
                           onCheckedChange={(checked) => handleSelectOne(mock.id, !!checked)}
                           className="border-primary"
                         />
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                            <ClipboardList className="h-6 w-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-black text-[#0F172A] text-lg uppercase leading-none">{mock.title}</p>
                            <div className="flex items-center gap-3 mt-2">
                               <Badge variant="outline" className="text-[8px] font-black uppercase px-2 border-slate-100 text-slate-400">
                                  {mock.boardIds ? mock.boardIds.join(', ') : mock.boardId}
                               </Badge>
                               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{mock.totalQuestions} Qs • {mock.duration}m</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                               {isPremium ? <Lock className="h-3 w-3 text-amber-500" /> : <Unlock className="h-3 w-3 text-emerald-500" />}
                               <Badge className={cn("border-none text-[8px] font-black px-2 py-0.5", isPremium ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                                  {mock.accessType || 'FREE'}
                               </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{mock.mockType || 'FULL'} HUB</span>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                         <button onClick={() => togglePublish(mock.id, mock.published)} className="flex items-center gap-2 group/status">
                            <div className={cn("h-2.5 w-2.5 rounded-full", mock.published ? 'bg-emerald-500' : 'bg-slate-300')} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/status:text-primary">{mock.published ? 'LIVE' : 'DRAFT'}</span>
                         </button>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:text-primary shadow-sm" asChild>
                             <Link href={`/mocks/${mock.id}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:text-blue-600 shadow-sm" asChild>
                             <Link href={`/admin/mocks/manual-edit?id=${mock.id}`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDeleteSingle(mock.id)}>
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

      {/* FLOATING BULK ACTION BAR */}
      {selectedIds.length > 0 && (
         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-[#0F172A] text-white px-8 py-4 rounded-[2rem] shadow-5xl flex items-center gap-8 border border-white/10 ring-8 ring-primary/10">
               <div className="flex items-center gap-3 text-left">
                  <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">
                     {selectedIds.length}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Series Selected</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Institutional Audit</p>
                  </div>
               </div>
               <div className="h-8 w-px bg-white/10" />
               <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedIds([])}
                    className="h-12 rounded-xl text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest"
                  >
                    Clear
                  </Button>
                  <Button 
                    onClick={handleBulkDelete}
                    disabled={isDeletingBulk}
                    className="h-14 px-10 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest gap-3 shadow-2xl transition-all active:scale-95 border-none"
                  >
                     {isDeletingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                     Permanent Purge
                  </Button>
               </div>
               <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-white/5 rounded-full text-slate-500"><X className="h-5 w-5" /></button>
            </div>
         </div>
      )}
    </div>
  )
}
