
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Layers, 
  Landmark, 
  Edit, 
  Link as LinkIcon,
  Info,
  Box
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, DocumentData, FirestoreDataConverter } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { Category, Board, Exam } from "@/types"
import Image from "next/image"

const categoryConverter: FirestoreDataConverter<Category> = {
    toFirestore: (data: Category): DocumentData => data,
    fromFirestore: (snap): Category => snap.data() as Category
};

const boardConverter: FirestoreDataConverter<Board> = {
    toFirestore: (data: Board): DocumentData => data,
    fromFirestore: (snap): Board => snap.data() as Board
};

const examConverter: FirestoreDataConverter<Exam> = {
    toFirestore: (data: Exam): DocumentData => data,
    fromFirestore: (snap): Exam => snap.data() as Exam
};

/**
 * @fileOverview Punjab Registry Architect v17.0.
 * TYPOGRAPHY: Strict Title Case hierarchy enforcement.
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

  const { data: categories, loading: catLoading } = useCollection<Category>(useMemo(() => (db ? query(collection(db, "categories").withConverter(categoryConverter), orderBy("displayOrder", "asc")) : null), [db]))
  const { data: hubs } = useCollection<Board>(useMemo(() => (db ? collection(db, "boards").withConverter(boardConverter) : null), [db]))
  const { data: exams } = useCollection<Exam>(useMemo(() => (db ? collection(db, "exams").withConverter(examConverter) : null), [db]))

  const hierarchy = useMemo(() => {
    if (!categories || !hubs || !exams) return []
    return categories.map((cat) => ({
      ...cat,
      hubs: hubs.filter((h) => h.categoryId === cat.id).map((hub) => ({
        ...hub,
        exams: exams.filter((e) => e.boardId === hub.id || e.boardId === hub.abbreviation)
      }))
    }))
  }, [categories, hubs, exams])

  return (
    <div className="space-y-10 pb-32 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Box className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Hierarchy Governance</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Ecosystem Tree</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage the strictly nested hierarchy of Categories, Boards, and Exam verticals.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 space-y-10">
         <TabsList className="bg-slate-100 p-1.5 h-16 rounded-2xl shadow-sm inline-flex gap-2">
            <TabsTrigger value="overview" className="rounded-xl px-8 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">
               <Layers className="h-4 w-4 mr-2" /> Tree View
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-xl px-8 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">
               Manage Folders
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
                              {cat.iconUrl ? <Image src={cat.iconUrl} width={56} height={56} className="h-full w-full object-contain p-2" alt={cat.title} /> : <Layers className="h-6 w-6 text-slate-300" />}
                           </div>
                           <div className="text-left">
                              <h3 className="text-2xl font-bold font-headline text-[#0F172A]">{cat.title}</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{cat.hubs.length} Boards Assigned</p>
                           </div>
                        </div>
                        <Button asChild variant="outline" className="h-10 rounded-xl font-black uppercase text-[8px] tracking-widest gap-2">
                           <Link href="/admin/categories"><Edit className="h-3 w-3" /> Edit Folder</Link>
                        </Button>
                     </CardHeader>
                     <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {cat.hubs.length > 0 ? [...cat.hubs].sort((a: ExtendedBoard, b: ExtendedBoard) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((hub: ExtendedBoard) => (
                              <div key={hub.id} className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                 <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm uppercase text-[#0F172A] flex items-center gap-2">
                                       <Landmark className="h-3.5 w-3.5 text-primary" /> {hub.abbreviation}
                                    </h4>
                                    <Badge className="bg-white border-slate-200 text-slate-400 text-[7px] font-black uppercase px-2">{hub.exams.length} Verticals</Badge>
                                 </div>
                                 <div className="space-y-2">
                                    {[...hub.exams].sort((a: Exam, b: Exam) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((exam: Exam) => (
                                       <div key={exam.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm group hover:border-primary/20 transition-all">
                                          <span className="text-[10px] font-bold text-slate-500 truncate pr-2">{exam.name}</span>
                                          <div className="flex gap-1.5 shrink-0">
                                             <Button asChild size="icon" variant="ghost" className="h-6 w-6 rounded-lg hover:bg-primary/10">
                                                <Link href={`/admin/architecture/linking/${exam.id}`} title="Link Content"><LinkIcon className="h-3 w-3 text-primary" /></Link>
                                             </Button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )) : (
                              <div className="col-span-full py-10 text-center">
                                 <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">No boards found. Checking for direct exams...</p>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                                    {(exams || []).filter((e) => e.categoryId === cat.id).map((exam) => (
                                       <div key={exam.id} className="p-3 bg-white rounded-xl border border-slate-100 text-left flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-slate-500">{exam.name}</span>
                                          <Button asChild size="icon" variant="ghost" className="h-6 w-6 rounded-lg"><Link href={`/admin/architecture/linking/${exam.id}`}><LinkIcon className="h-3 w-3 text-primary" /></Link></Button>
                                       </div>
                                    ))}
                                 </div>
                              </div>
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
               <h3 className="font-headline font-black text-xl uppercase mb-2">Registry Folders</h3>
               <p className="text-slate-400 text-sm mb-8">Manage the 6 canonical top-level ecosystem folders.</p>
               <Button asChild className="h-14 px-10 rounded-2xl bg-[#0F172A] hover:bg-black font-black uppercase text-[10px] tracking-widest">
                  <Link href="/admin/categories">Open Folder Manager</Link>
               </Button>
            </div>
         </TabsContent>
      </Tabs>
    </div>
  )
}
