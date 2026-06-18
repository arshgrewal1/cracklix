"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Layers, 
  Landmark, 
  ChevronRight, 
  Plus, 
  Edit, 
  Link as LinkIcon,
  Info,
  Box
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Category, Board, Exam } from "@/types"
import { DialogDescription } from "@/components/ui/dialog"

/**
 * @fileOverview Punjab Registry Architect v15.6.
 * FIXED: Properly defined ExtendedBoard and ExtendedCategory to handle nested property access.
 */

interface ExtendedBoard extends Board {
  exams: Exam[];
}

interface ExtendedCategory extends Category {
  hubs: ExtendedBoard[];
}

export default function ArchitectureManager() {
  const db = useFirestore()
  const [activeTab, setActiveTab] = useState("overview")

  const { data: categories, loading: catLoading } = useCollection<Category>(useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]) as any)
  const { data: hubs, loading: hubsLoading } = useCollection<Board>(useMemo(() => (db ? collection(db, "boards") : null), [db]) as any)
  const { data: exams, loading: examsLoading } = useCollection<Exam>(useMemo(() => (db ? collection(db, "exams") : null), [db]) as any)

  const hierarchy = useMemo(() => {
    if (!categories || !hubs || !exams) return [] as ExtendedCategory[]
    return (categories as Category[]).map((cat: Category) => ({
      ...cat,
      hubs: (hubs as Board[]).filter((h: Board) => h.categoryId === cat.id).map((hub: Board) => ({
        ...hub,
        exams: (exams as Exam[]).filter((e: Exam) => e.boardId === hub.id || e.boardId === hub.abbreviation)
      })) as ExtendedBoard[]
    })) as ExtendedCategory[]
  }, [categories, hubs, exams])

  return (
    <div className="space-y-10 pb-32 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Box className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Punjab Registry Architect</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Punjab Tree</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage the structural discovery hierarchy for all Punjab preparation nodes.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 space-y-10">
         <TabsList className="bg-slate-100 p-1.5 h-16 rounded-2xl shadow-sm inline-flex gap-2">
            <TabsTrigger value="overview" className="rounded-xl px-8 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">
               <Layers className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-xl px-8 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">
               Manage Categories
            </TabsTrigger>
         </TabsList>

         <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 gap-12">
               {catLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[3rem]" />)
               ) : hierarchy.map((cat: ExtendedCategory) => (
                  <Card key={cat.id} className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden border border-slate-100">
                     <div className="h-2 w-full bg-primary/20" />
                     <CardHeader className="p-10 pb-6 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                              {cat.iconUrl ? <img src={cat.iconUrl} className="h-full w-full object-contain p-2" alt="Icon" /> : <Layers className="h-6 w-6 text-slate-300" />}
                           </div>
                           <div className="text-left">
                              <h3 className="text-2xl font-black font-headline uppercase text-[#0F172A]">{cat.title}</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{cat.hubs.length} Hubs Assigned</p>
                           </div>
                        </div>
                        <Button asChild variant="outline" className="h-10 rounded-xl font-black uppercase text-[8px] tracking-widest gap-2">
                           <Link href="/admin/categories"><Edit className="h-3 w-3" /> Edit Node</Link>
                        </Button>
                     </CardHeader>
                     <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {cat.hubs.length > 0 ? [...cat.hubs].sort((a: ExtendedBoard, b: ExtendedBoard) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((hub: ExtendedBoard) => (
                              <div key={hub.id} className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                 <div className="flex items-center justify-between">
                                    <h4 className="font-black text-sm uppercase text-[#0F172A] flex items-center gap-2">
                                       <Landmark className="h-3.5 w-3.5 text-primary" /> {hub.abbreviation} Hub
                                    </h4>
                                    <Badge className="bg-white border-slate-200 text-slate-400 text-[7px] font-black uppercase px-2">{hub.exams.length} Verticals</Badge>
                                 </div>
                                 <div className="space-y-2">
                                    {[...hub.exams].sort((a: Exam, b: Exam) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((exam: Exam) => (
                                       <div key={exam.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm group hover:border-primary/20 transition-all">
                                          <span className="text-[10px] font-bold text-slate-500 uppercase truncate pr-2">{exam.name}</span>
                                          <div className="flex gap-1.5 shrink-0">
                                             <Button asChild size="icon" variant="ghost" className="h-6 w-6 rounded-lg hover:bg-primary/10">
                                                <Link href={`/admin/architecture/linking/${exam.id}`} title="Link Content"><LinkIcon className="h-3 w-3 text-primary" /></Link>
                                             </Button>
                                             <Button asChild size="icon" variant="ghost" className="h-6 w-6 rounded-lg hover:bg-blue-50">
                                                <Link href={`/admin/exam-registry`}><Edit className="h-3 w-3 text-blue-500" /></Link>
                                             </Button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                                 <Button asChild variant="ghost" className="w-full h-8 text-[7px] font-black uppercase text-slate-400 hover:text-primary tracking-widest gap-2">
                                    <Link href="/admin/exam-registry">+ New Vertical</Link>
                                 </Button>
                              </div>
                           )) : (
                              <div className="col-span-full py-10 text-center opacity-20 italic font-black uppercase text-[10px]">No Hubs Assigned.</div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         </TabsContent>

         <TabsContent value="categories">
            <div className="bg-white rounded-[3rem] p-12 text-center border-2 border-dashed border-slate-100">
               <Info className="h-10 w-10 mx-auto mb-4 text-slate-300" />
               <h3 className="font-headline font-black text-xl uppercase mb-2">Category Registry</h3>
               <p className="text-slate-400 text-sm mb-8">Direct management for top-level Punjab verticals.</p>
               <Button asChild className="h-14 px-10 rounded-2xl bg-[#0F172A] hover:bg-black font-black uppercase text-[10px] tracking-widest">
                  <Link href="/admin/categories">Launch Category Manager</Link>
               </Button>
            </div>
         </TabsContent>
      </Tabs>
    </div>
  )
}
