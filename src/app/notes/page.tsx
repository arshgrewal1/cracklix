"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Search, BookOpen, Clock, Zap, Lock, FileArchive, Info, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"
import { useActiveSession } from "@/hooks/useStudyAnalytics";

/**
 * @fileOverview Official Download Center v2.9 [Refined Tabs].
 */

export default function NotesLibrary() {
  const db = useFirestore()
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading: authLoading } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  
  const { startSession } = useActiveSession('PDF');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    } else if (user) {
      startSession();
    }
  }, [user, authLoading, router, pathname, startSession]);

  const notesQuery = useMemo(() => (db ? query(collection(db, "notes"), orderBy("updatedAt", "desc")) : null), [db])
  const { data: notes, loading } = useCollection<any>(notesQuery)

  const filteredNotes = useMemo(() => {
    if (!notes) return { NOTES: [], SYLLABUS: [], EBOOK: [] };
    const base = notes.filter((n: any) => n.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    return {
      NOTES: base.filter((n: any) => n.category === 'NOTES'),
      SYLLABUS: base.filter((n: any) => n.category === 'SYLLABUS'),
      EBOOK: base.filter((n: any) => n.category === 'E-BOOK'),
    }
  }, [notes, searchTerm])

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Syncing Hub...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-6xl">
        <div className="space-y-10 md:space-y-16">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                 <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Study Material</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                Download <br/> <span className="text-primary">Portal</span>
              </h1>
              <p className="text-slate-500 font-medium text-base md:text-lg max-w-xl">
                Verified study materials curated for all upcoming Punjab recruitment verticals.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-16 h-16 rounded-2xl bg-white border-none shadow-2xl shadow-slate-200/50 text-lg font-medium" 
                placeholder="Search resources..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="notes" className="space-y-10">
             <div className="flex justify-start">
               <div className="bg-white border border-slate-200 p-1.5 rounded-[24px] shadow-xl flex items-center h-14 md:h-16 w-full md:w-auto">
                 <TabsList className="bg-transparent border-none p-0 flex h-full gap-1 overflow-x-auto no-scrollbar justify-start">
                    <HubTab value="notes" icon={<FileText className="h-4 w-4" />} label="Study Notes" />
                    <HubTab value="syllabus" icon={<Info className="h-4 w-4" />} label="Exam Syllabus" />
                    <HubTab value="archives" icon={<FileArchive className="h-4 w-4" />} label="E-Book Hub" />
                 </TabsList>
               </div>
             </div>

             <TabsContent value="notes">
                <NotesGrid data={filteredNotes.NOTES} loading={loading} profile={profile} />
             </TabsContent>

             <TabsContent value="syllabus">
                <NotesGrid data={filteredNotes.SYLLABUS} loading={loading} profile={profile} />
             </TabsContent>

             <TabsContent value="archives">
                <NotesGrid data={filteredNotes.EBOOK} loading={loading} profile={profile} />
             </TabsContent>
          </Tabs>

          <div className="bg-[#0B1528] rounded-[3rem] md:rounded-[4rem] p-10 md:p-16 text-white relative overflow-hidden shadow-4xl group">
             <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:scale-125 transition-transform"><AuthorityLogo boardId="study-material" size="xl" className="h-40 w-40 opacity-10" /></div>
             <div className="relative z-10 max-w-2xl space-y-6 text-left">
                <div className="flex items-center gap-4">
                   <ShieldCheck className="h-6 w-6 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Registry Verified</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-headline font-black uppercase leading-tight">Master the <br/> Preparation Base</h2>
                <p className="text-slate-400 text-base md:text-lg font-medium">Download our exclusive summary guides verified for upcoming state exams.</p>
                <Button asChild className="w-full md:w-auto h-16 px-12 bg-white text-black hover:bg-slate-200 font-black uppercase tracking-widest text-xs rounded-2xl gap-3 shadow-2xl mt-4 border-none">
                   <Link href="/pass">Unlock Premium Hub <Zap className="h-5 w-5 fill-current" /></Link>
                </Button>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function HubTab({ value, icon, label }: { value: string, icon: React.ReactNode, label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="px-6 md:px-8 h-full font-bold text-[11px] md:text-[13px] tracking-tight text-slate-500 bg-white border border-transparent data-[state=active]:bg-[#0F172A] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-[20px] transition-all whitespace-nowrap flex items-center gap-3 shrink-0"
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </TabsTrigger>
  );
}

function NotesGrid({ data, loading, profile }: any) {
   if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[3rem]" />)}
      </div>
   );

   if (!data || data.length === 0) return (
      <div className="py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner">
         <FileArchive className="h-16 w-16 mb-6 opacity-10" />
         <p className="font-headline font-black text-xl uppercase">Vault Empty</p>
         <p className="text-sm font-bold opacity-50 mt-1 uppercase tracking-widest">Awaiting content push.</p>
      </div>
   );

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {data.map((item: any) => (
            <DownloadCard key={item.id} asset={item} profile={profile} />
         ))}
      </div>
   );
}

function DownloadCard({ asset, profile }: { asset: any, profile: any }) {
   const isPassValid = useMemo(() => {
     if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') return true;
     return profile?.passStatus === 'active';
   }, [profile]);

   const isLocked = !asset.isFree && !isPassValid;

   return (
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden group hover:translate-y-[-8px] transition-all duration-500 text-left h-full flex flex-col border border-slate-100">
         <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-10 flex-1">
            <div className={cn(
               "h-10 w-10 md:h-24 md:w-24 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform",
               asset.isFree ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            )}>
               {isLocked ? <Lock className="h-8 w-8 md:h-10 md:w-10" /> : <FileText className="h-8 w-8 md:h-10 md:w-10" />}
            </div>
            <div className="flex-1 space-y-4 text-left w-full flex flex-col h-full">
               <div className="flex items-center gap-4">
                  <Badge className={cn(
                     "border-none font-black text-[9px] uppercase tracking-widest px-3 py-1",
                     asset.isFree ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                     {asset.subjectId || 'GENERAL'}
                  </Badge>
                  {asset.isFree ? (
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Free Note</span>
                  ) : (
                     <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Elite Pass</span>
                  )}
               </div>
               <h3 className="text-xl md:text-2xl font-headline font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors flex-1 uppercase">
                  {asset.title}
               </h3>
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-50 mt-auto">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Clock className="h-3.5 w-3.5" /> Registry Updated
                  </p>
                  {isLocked ? (
                     <Button asChild className="w-full sm:w-auto h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl gap-2 shadow-xl border-none">
                        <Link href="/pass"><Lock className="h-4 w-4" /> Get Pass</Link>
                     </Button>
                  ) : (
                     <Button asChild className="w-full sm:w-auto h-12 px-8 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest text-[9px] rounded-xl gap-2 shadow-xl border-none">
                        <a href={asset.pdfUrl} target="_blank" rel="noopener noreferrer">
                           <Download className="h-4 w-4" /> Download
                        </a>
                     </Button>
                  )}
               </div>
            </div>
         </CardContent>
      </Card>
   )
}
