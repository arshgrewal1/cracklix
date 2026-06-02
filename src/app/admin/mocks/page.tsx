
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Share2, MoreVertical, Search, Filter, Trash2, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function MockManagement() {
  const db = useFirestore()
  
  const mocksQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "mocks"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: mocks, loading } = useCollection<any>(mocksQuery)

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Mock Management</h1>
          <p className="text-muted-foreground">Publish and oversee all platform test series.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 gap-2 font-bold shadow-xl shadow-primary/20">
          <Link href="/admin/mocks/builder">
            <Plus className="h-4 w-4" /> New Mock Builder
          </Link>
        </Button>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-2xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10 h-11" placeholder="Search by title or board..." />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mock Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : mocks && mocks.length > 0 ? (
                mocks.map((mock: any) => (
                  <TableRow key={mock.id} className="hover:bg-white/5 group">
                    <TableCell>
                      <div>
                        <p className="font-bold text-primary">{mock.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{mock.type}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] uppercase font-black border-none ${
                        mock.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                        mock.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {mock.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-headline font-bold">{mock.totalQuestions}</TableCell>
                    <TableCell className="font-headline font-bold text-muted-foreground">{mock.attempts}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs font-bold text-muted-foreground">Published</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No mocks published yet.
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
