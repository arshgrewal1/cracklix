"use client"

import { useState, useMemo, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  Zap, 
  FileText, 
  Newspaper, 
  Link as LinkIcon, 
  Loader2, 
  CheckCircle2, 
  X, 
  Search,
  Database,
  ShieldCheck,
  Plus,
  Landmark
} from "lucide-react"
import { useDoc, useCollection, useFirestore } from "@/firebase"
import { doc, updateDoc, collection, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Content Linking Engine v1.3 (Build Fixed).
 * FIXED: Added missing Landmark icon import to resolve build failure.
 */

export default function ContentLinkerPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <LinkerContent />
    </Suspense>
  )
}

function LinkerContent() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const examId = params.examId as string

  const [searchTerm, setSearchTerm] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)

  // 1. Target Exam Node
  const { data: exam, loading: examLoading } = useDoc<any>(useMemo(() => (db && examId ? doc(db, "exams", examId) : null), [db, examId]))

  // 2. Platform Assets Pool
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: notes } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]))

  // 3. Current Links Analysis
  const linkedMocks = useMemo(() => 
    mocks?.filter(m => m.examIds?.includes(examId) || m.examId === examId) || []
  , [mocks, examId])

  const linkedNotes = useMemo(() => 
    notes?.filter(n => n.examId === examId) || []
  , [notes, examId])

  const handleToggleLink = async (coll: string, docId: string, isLinked: boolean) => {
    if (!db || isSyncing) return
    setIsSyncing(true)
    
    try {
      const docRef = doc(db, coll, docId)
      if (coll === 'mocks') {
         const mock = mocks?.find(m => m.id === docId)
         const currentIds = mock.examIds || (mock.examId ? [mock.examId] : [])
         const nextIds = isLinked 
            ? currentIds.filter((id: string) => id !== examId) 
            : [...new Set([...currentIds, examId])]
         
         await updateDoc(docRef, { 
            examIds: nextIds,
            examId: nextIds[0] || null, 
            updatedAt: serverTimestamp() 
         })
      } else {
         await updateDoc(docRef, { 
            examId: isLinked ? null : examId,
            updatedAt: serverTimestamp() 
         })
      }
      toast({ title: isLinked ? "Link Terminated" : "Relationship Sync Successful" })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSyncing(false)
    }
  }

  const filteredMocks = useMemo(() => 
    mocks?.filter(m => m.title?.toLowerCase().includes(searchTerm.toLowerCase())).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)) || []
  , [mocks, searchTerm])

  if (examLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
  if (!exam) return <div className="p-20 text-center uppercase font-black text-slate-300">Exam Vertical Not Registered</div>

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 text-left pt-4">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="text-left">
            <h1 className="text-4xl font-headline font-black uppercase tracking-tight text-[#0F172A]">{exam.name}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Relationship Management Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm">
           <ShieldCheck className="h-5 w-5 text-emerald-600" />
           <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Master Node Linker Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
         <div className="lg:col-span-8 space-y-12">
            <section className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-headline font-black uppercase flex items-center gap-3"><Zap className="h-5 w-5 text-primary" /> Practice Mocks Pool</h3>
                  <div className="relative w-64">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                     <Input className="pl-9 h-10 rounded-xl bg-slate-50 border-none text-[11px] font-bold" placeholder="Search pool..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  {filteredMocks.map(m => {
                     const isLinked = linkedMocks.some(lm => lm.id === m.id);
                     return (
                        <div key={m.id} className={cn("p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between", isLinked ? "bg-primary/5 border-primary" : "bg-white border-slate-100")}>
                           <div className="flex items-center gap-6">
                              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-inner", isLinked ? "bg-primary text-white" : "bg-slate-50 text-slate-300")}>
                                 <Zap className="h-5 w-5" />
                              </div>
                              <div className="text-left">
                                 <p className="font-black text-[#0F172A] uppercase leading-none">{m.title}</p>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">{m.totalQuestions} Questions • {m.accessLevel}</p>
                              </div>
                           </div>
                           <Button 
                              onClick={() => handleToggleLink('mocks', m.id, isLinked)} 
                              variant={isLinked ? 'default' : 'ghost'} 
                              className={cn("h-10 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest border border-slate-100 shadow-sm", isLinked ? "bg-[#0F172A] hover:bg-black text-white" : "text-slate-400 hover:text-primary")}
                           >
                              {isLinked ? <X className="h-3 w-3 mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                              {isLinked ? 'Disconnect' : 'Connect Node'}
                           </Button>
                        </div>
                     )
                  })}
               </div>
            </section>

            <section className="space-y-6">
               <h3 className="text-xl font-headline font-black uppercase flex items-center gap-3"><FileText className="h-5 w-5 text-blue-500" /> Study Materials Pool</h3>
               <div className="grid grid-cols-1 gap-3">
                  {notes?.map(n => {
                     const isLinked = n.examId === examId;
                     return (
                        <div key={n.id} className={cn("p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between", isLinked ? "bg-blue-50/50 border-blue-500" : "bg-white border-slate-100")}>
                           <div className="flex items-center gap-6">
                              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-inner", isLinked ? "bg-blue-500 text-white" : "bg-slate-50 text-slate-300")}>
                                 <FileText className="h-5 w-5" />
                              </div>
                              <div className="text-left">
                                 <p className="font-black text-[#0F172A] uppercase leading-none">{n.title}</p>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">{n.category}</p>
                              </div>
                           </div>
                           <Button 
                              onClick={() => handleToggleLink('notes', n.id, isLinked)} 
                              variant={isLinked ? 'default' : 'ghost'} 
                              className={cn("h-10 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest border border-slate-100 shadow-sm", isLinked ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-slate-400 hover:text-blue-600")}
                           >
                              {isLinked ? <X className="h-3 w-3 mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                              {isLinked ? 'Disconnect' : 'Connect Node'}
                           </Button>
                        </div>
                     )
                  })}
               </div>
            </section>
         </div>

         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-3xl rounded-[3rem] bg-[#0F172A] text-white p-10 space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><LinkIcon className="h-64 w-64" /></div>
               <div className="relative z-10 space-y-8">
                  <div className="space-y-2 text-left">
                     <h3 className="text-2xl font-headline font-black uppercase text-primary tracking-tight leading-none">Active Links</h3>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Registry Relationship Audit</p>
                  </div>
                  
                  <div className="space-y-6">
                     <LinkStat label="Linked Mocks" val={linkedMocks.length} icon={<Zap className="text-primary h-4 w-4" />} />
                     <LinkStat label="Linked Notes" val={linkedNotes.length} icon={<FileText className="text-blue-400 h-4 w-4" />} />
                     <LinkStat label="Target Hub" val={exam.boardId || 'NONE'} icon={<Landmark className="text-slate-400 h-4 w-4" />} />
                  </div>

                  <div className="pt-8 border-t border-white/5">
                     <div className="flex items-center gap-4 text-emerald-500">
                        <CheckCircle2 className="h-6 w-6" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sync Status: Normal</span>
                     </div>
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  )
}

function LinkStat({ label, val, icon }: any) {
   return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
         <div className="flex items-center gap-3">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
         </div>
         <span className="font-headline font-black text-lg text-white">{val}</span>
      </div>
   )
}
