
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Search, Trash2, Edit, ClipboardList, Layers, Copy, Gem, Loader2, Calendar, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Ultimate Mock Management Ledger.
 * Optimized: Full Mobile-First Responsive Card conversion.
 */

export default function MockManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [boardFilter, setBoardFilter] = useState("all")

  const mocksQuery = useMemo(() => (db && db.type === 'firestore' ? query(collection(db, "mocks")) : null), [db])
  const boardsQuery = useMemo(() => (db && db.type === 'firestore' ? collection(db, "boards") : null), [db])

  const { data: rawMocks, loading } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    return [...rawMocks]
      .filter(m => {
        const matchesSearch = m.title?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesBoard = boardFilter === "all" || m.boardId === boardFilter
        return matchesSearch && matchesBoard
      })
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [rawMocks, searchTerm, boardFilter])

  const handleDelete = async (id: string) => {
    if (!db || db.type !== 'firestore') return
    if (!confirm("Audit: Permanently purge this mock blueprint?")) return
    await deleteDoc(doc(db, "mocks", id))
    toast({ title: "Series Purged" })
  }

  const togglePublish = async (id: string, current: boolean) => {
    if (!db || db.type !== 'firestore') return
    await setDoc(doc(db, "mocks", id), { published: !current, updatedAt: serverTimestamp() }, { merge: true })
    toast({ title: "Registry Updated" })
  }

  return (
    <div className="space-y-8 md:space-y-12 text-left pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Layers className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Mock Ledger</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-headline font-black text-primary uppercase tracking-tight">Mock Manager</h1>
        </div>
        <Button asChild className="bg-primary hover:bg-orange-600 gap-2 font-black shadow-2xl rounded-xl h-12 md:h-16 px-8 md:px-12 uppercase tracking-widest text-[10px] w-full md:w-auto">
          <Link href="/admin/mocks/builder"><Plus className="h-5 w-5" /> Assemble Series</Link>
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-2xl md:rounded-[3rem] overflow-hidden">
        <CardHeader className="p-4 md:p-10 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-[40%]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input className="pl-12 h-11 md:h-14 rounded-xl md:rounded-2xl bg-white border-slate-100 shadow-inner" placeholder="Search by title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="w-full lg:w-44">
              <Select value={boardFilter} onValueChange={setBoardFilter}>
                <SelectTrigger className="w-full rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs">
                  <SelectValue placeholder="Board Hub" />
                </SelectTrigger>
                <SelectContent><SelectItem value="all">All Boards</SelectItem>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-20">
                  <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stats</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                  <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   Array.from({ length: 4 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="p-10"><Skeleton className="h-16 w-full rounded-xl" /></TableCell></TableRow>)
                ) : mocks.map((mock: any) => (
                  <TableRow key={mock.id} className="hover:bg-slate-50 border-slate-50 transition-colors">
                    <TableCell className="px-10 py-6">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                          <ClipboardList className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-black text-[#0F172A] text-lg uppercase leading-none">{mock.title}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{mock.boardId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
                          <span className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> {mock.totalQuestions} Qs</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {mock.duration}m</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <button onClick={() => togglePublish(mock.id, mock.published)} className="flex items-center gap-2 group/status">
                          <div className={cn("h-2.5 w-2.5 rounded-full", mock.published ? 'bg-emerald-500' : 'bg-slate-300')} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/status:text-primary">{mock.published ? 'LIVE' : 'DRAFT'}</span>
                       </button>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:text-primary shadow-sm" asChild><Link href={`/admin/mocks/builder?id=${mock.id}`}><Edit className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(mock.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View: High-Density Cards */}
          <div className="md:hidden divide-y divide-slate-100">
             {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-6 space-y-4"><Skeleton className="h-24 w-full rounded-2xl" /></div>)
             ) : mocks.map((mock: any) => (
                <div key={mock.id} className="p-6 space-y-6 bg-white">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <Badge className="bg-primary/10 text-primary border-none text-[7px] font-black uppercase tracking-widest">{mock.boardId}</Badge>
                         <h3 className="font-black text-sm text-[#0F172A] uppercase leading-tight">{mock.title}</h3>
                      </div>
                      <button onClick={() => togglePublish(mock.id, mock.published)} className={cn(
                        "h-2.5 w-2.5 rounded-full shadow-sm shrink-0",
                        mock.published ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-300 shadow-slate-100'
                      )} />
                   </div>
                   <div className="flex items-center gap-6 text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] bg-slate-50 p-3 rounded-xl">
                      <span className="flex items-center gap-2"><FileText className="h-3 w-3" /> {mock.totalQuestions} Questions</span>
                      <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(mock.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                   </div>
                   <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1 h-11 rounded-xl font-black uppercase text-[9px] tracking-widest border-slate-200">
                        <Link href={`/admin/mocks/builder?id=${mock.id}`}><Edit className="h-4 w-4 mr-2" /> Modify Blueprint</Link>
                      </Button>
                      <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl text-rose-500 border-rose-100 bg-rose-50" onClick={() => handleDelete(mock.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
             ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
