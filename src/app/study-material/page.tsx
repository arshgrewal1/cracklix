"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Search, BookOpen, Clock, Zap, Lock, FileArchive, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Notes Center v2.1.
 * RESPONSIVE: Increased container width for PC and optimized card layout.
 */

export default function StudyMaterialPage() {
  const db = useFirestore()
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading: authLoading } = useUser()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, authLoading, router, pathname]);

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
       <p className="text-[10px] font-black uppercase text-slate-300">Syncing...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30 font-body text-left">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 max-w-[1440px] space-y-12 md:space-y-24">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <AuthorityLogo boardId="study-material" size="sm" className="bg-transparent shadow-none p-0" />
               <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">Institutional Repository</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-[#0F172A] tracking-tighter uppercase leading-[0.9]">
              Download <br/> <span className="text-primary">Center</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-2xl leading-snug">
              Verified study materials, syllabus guides, and premium notes curated for all Punjab recruitment boards.
            </p>
          </div>
          <div className="relative w-full lg:w-[480px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
            <Input 
              className="pl-16 h-16 md:h-20 rounded-2xl md:rounded-[2rem] bg-white border-none shadow-2xl text-lg md:text-xl font-medium" 
              placeholder="Search registry..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="notes" className="space-y-12 md:space-y-20">
           <div className="bg-white border border-slate-100 p-1.5 rounded-2xl md:rounded-3xl shadow-sm flex w-full md:w-auto overflow-x-auto no-scrollbar justify-start gap-2">
             <TabsList className="bg-transparent border-none p-0 h-12 md:h-16 flex gap-2">
                <TabsTrigger value="notes" className="rounded-xl px-6 md:px-10 font-black uppercase text-[10px] md:text-[11px] gap-3 h-full shrink-0 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">
                  <FileText className="h-4 w-4" /> Prep Notes
                </TabsTrigger>
                <TabsTrigger value="syllabus" className="rounded-xl px-6 md:px-10 font-black uppercase text-[10px] md:text-[11px] gap-3 h-full shrink-0 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">
                  <Info className="h-4 w-4" /> Syllabus Hub
                </TabsTrigger>
                <TabsTrigger value="archives" className="rounded-xl px-6 md:px-10 font-black uppercase text-[10px] md:text-[11px] gap-3 h-full shrink-0 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">
                  <FileArchive className="h-4 w-4" /> E-Book Vault
                </TabsTrigger>
             </TabsList>
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

        <div className="bg-[#0B1528] rounded-[3rem] md:rounded-[5rem] p-8 md:p-24 text-white relative overflow-hidden shadow-5xl border border-white/5 mx-1">
           <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 group-hover:scale-125 transition-transform"><AuthorityLogo boardId="study-material" size="xl" className="h-96 w-96 opacity-5" /></div>
           <div className="relative z-10 max-w-3xl space-y-8 md:space-y-12">
              <div className="space-y-4">
                 <Badge className="bg-primary/20 text-primary border-none px-5 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">PRO ACCESS</Badge>
                 <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight">Registry <br/> Test Center</h2>
              </div>
              <p className="text-slate-400 text-sm md:text-2xl font-medium leading-snug">Unlock all premium institutional PDFs, solved papers, and expert notes for all Punjab government exams.</p>
              <Button asChild className="w-full md:w-auto h-14 md:h-20 px-10 md:px-20 bg-primary hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-sm rounded-2xl md:rounded-[2.5rem] shadow-4xl border-none transition-all active:scale-95">
                 <Link href="/pass">Activate Elite Pass <Zap className="h-5 w-5 fill-current ml-3" /></Link>
              </Button>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function NotesGrid({ data, loading, profile }: any) {
   if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
         {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 md:h-80 w-full rounded-[2.5rem] bg-white border border-slate-50" />)}
      </div>
   );

   if (!data || data.length === 0) return (
      <div className="py-40 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner mx-1">
         <FileArchive className="h-20 w-20 mb-8 opacity-10" />
         <p className="font-headline font-black text-2xl uppercase tracking-widest">No Notes Detected</p>
      </div>
   );

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
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
      <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-white overflow-hidden group hover:translate-y-[-8px] transition-all duration-500 text-left h-full flex flex-col">
         <CardContent className="p-6 md:p-14 flex flex-col md:flex-row items-center gap-8 md:gap-14 flex-1">
            <div className={cn(
               "h-24 w-24 md:h-36 md:w-36 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform",
               asset.isFree ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
            )}>
               {isLocked ? <Lock className="h-10 w-10 md:h-16 md:w-16" /> : <FileText className="h-10 w-10 md:h-16 md:w-16" />}
            </div>
            <div className="flex-1 space-y-6 text-left w-full flex flex-col h-full min-w-0">
               <div className="flex items-center gap-4 flex-wrap">
                  <Badge className={cn(
                     "border-none font-black text-[9px] md:text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-sm",
                     asset.isFree ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                  )}>
                     {asset.subjectId || 'GENERAL'}
                  </Badge>
                  {asset.isFree ? (
                     <span className="text-[10px] md:text-[12px] font-black text-emerald-600 uppercase tracking-widest">FREE ACCESS NODE</span>
                  ) : (
                     <span className="text-[10px] md:text-[12px] font-black text-orange-600 uppercase tracking-widest">ELITE REGISTRY</span>
                  )}
               </div>
               <h3 className="text-xl md:text-3xl font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors flex-1 uppercase tracking-tight truncate max-w-full">
                  {asset.title}
               </h3>
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-slate-50 mt-auto">
                  <div className="flex items-center gap-3 text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest">
                     <Clock className="h-4 w-4 text-slate-300" /> Registry Verified
                  </div>
                  {isLocked ? (
                     <Button asChild className="w-full sm:w-auto h-12 md:h-14 px-10 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl md:rounded-2xl gap-3 shadow-xl border-none active:scale-95 transition-all">
                        <Link href="/pass"><Lock className="h-4 w-4" /> Get Pass</Link>
                     </Button>
                  ) : (
                     <Button asChild className="w-full sm:w-auto h-12 md:h-14 px-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-xl md:rounded-2xl gap-3 shadow-xl border-none active:scale-95 transition-all">
                        <a href={asset.pdfUrl} target="_blank" rel="noopener noreferrer">
                           <Download className="h-4 w-4" /> Fetch File
                        </a>
                     </Button>
                  )}
               </div>
            </div>
         </CardContent>
      </Card>
   )
}
