
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, MoreVertical, Search, Filter, Trash2, Edit, ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function MockManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const mocksQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "mocks"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: mocks, loading } = useCollection<any>(mocksQuery)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mock?")) return
    try {
      await deleteDoc(doc(db, "mocks", id))
      toast({ title: "Deleted", description: "Mock test removed successfully." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Mock Series</h1>
          <p className="text-muted-foreground">Oversee and distribute all platform-wide test assessments.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 gap-2 font-bold shadow-xl shadow-primary/20 rounded-xl h-12 px-8">
          <Link href="/admin/mocks/builder">
            <Plus className="h-4 w-4" /> Create New Series
          </Link>
        </Button>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-12 h-12 rounded-2xl bg-background/50 border-none" placeholder="Search by title or category..." />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl h-10 border-foreground/5">
                <Filter className="h-4 w-4" /> All Boards
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5">
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Test Information</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Difficulty</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Questions</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell className="px-8"><Skeleton className="h-8 w-48 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-md" /></TableCell>
                    <TableCell className="text-right px-8"><Skeleton className="h-8 w-24 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : mocks && mocks.length > 0 ? (
                mocks.map((mock: any) => (
                  <TableRow key={mock.id} className="hover:bg-white/5 group border-white/5 transition-colors">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <ClipboardList className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-[#0F172A] text-base">{mock.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">{mock.type || 'Standard'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] uppercase font-black px-4 py-1 border-none rounded-lg ${
                        mock.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                        mock.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {mock.difficulty || 'Medium'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-headline font-black text-slate-600">{mock.totalQuestions}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Published</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 hover:text-primary"><Eye className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 hover:text-primary"><Edit className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500" onClick={() => handleDelete(mock.id)}><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ClipboardList className="h-12 w-12 mb-4 opacity-10" />
                      <p className="font-black font-headline text-lg">No Series Found</p>
                      <p className="text-xs uppercase tracking-widest font-black opacity-50">Launch your first test series to populate this list.</p>
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
