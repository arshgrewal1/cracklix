"use client"

import React, { useMemo, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser, useCollection } from "@/firebase"
import { doc, updateDoc, increment, serverTimestamp, collection, query, where, limit } from "firebase/firestore"
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Calendar, 
  Clock, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Landmark, 
  FileText, 
  Globe, 
  ExternalLink,
  Target,
  Award,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Loader2,
  DollarSign,
  Briefcase
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthorityLogo } from "@/lib/exam-icons"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Vacancy } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

/**
 * @fileOverview Official Vacancy Detail Node v1.0.
 * Premium layout for institutional recruitment auditing.
 */

export default function VacancyDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const { user, profile } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (db && id) {
       updateDoc(doc(db, "vacancies", id), { views: increment(1) }).catch(() => {})
    }
  }, [db, id])

  const { data: vacancy, loading } = useDoc<Vacancy>(useMemo(() => (db && id ? doc(db, "vacancies", id) : null), [db, id]))
  
  const relatedQuery = useMemo(() => {
    if (!db || !vacancy) return null
    return query(collection(db, "vacancies"), where("status", "==", "PUBLISHED"), where("board", "==", vacancy.board), limit(4))
  }, [db, vacancy])

  const { data: relatedVacancies } = useCollection<Vacancy>(relatedQuery as any)

  const isSaved = profile?.savedVacancies?.includes(id || "")

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vacancy?.title,
          text: `Latest recruitment node for ${vacancy?.department} active on Cracklix.`,
          url: window.location.href,
        })
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({ title: "Link Copied" })
    }
  }

  if (loading || !mounted) return <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>

  if (!vacancy) return (
     <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-6">
        <AlertCircle className="h-16 w-16 text-slate-200" />
        <div className="space-y-2">
           <h2 className="text-2xl font-black text-[#0F172A]">Node Not Found</h2>
           <p className="text-slate-500 font-medium max-w-sm mx-auto">This recruitment listing has been archived or moved by the administrator.</p>
        </div>
        <Button onClick={() => router.push('/vacancies')} variant="outline" className="rounded-xl h-12 px-8">Return to Registry</Button>
     </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-12 py-6 md:py-16 max-w-[1440px] space-y-12">
         
         <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="h-10 w-10 md:h-12 md:w-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90"><ArrowLeft className="h-5 w-5 md:h-6 md:w-6" /></button>
            <div className="flex items-center gap-3">
               <button onClick={handleShare} className="h-10 w-10 md:h-12 md:w-12 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95"><Share2 className="h-5 w-5" /></button>
               <button className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl border flex items-center justify-center transition-all shadow-sm active:scale-95", isSaved ? "bg-primary border-primary text-white shadow-xl" : "bg-white border-slate-100 text-slate-300 hover:text-primary")}><Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} /></button>
            </div>
         </div>

         {/* PREMIUM HERO SECTION */}
         <section className="bg-white rounded-[3rem] md:rounded-[5rem] shadow-5xl border border-slate-100 overflow-hidden relative group">
            <div className="h-2 w-full bg-primary" />
            <CardContent className="p-8 md:p-20 flex flex-col lg:flex-row gap-12 md:gap-20 items-center">
               <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-700">
                  <AuthorityLogo boardId={vacancy.board} size="xl" className="h-32 w-32 md:h-64 md:w-64 border-[8px] border-slate-50 shadow-5xl bg-white" />
                  <div className="absolute -bottom-4 -right-4 h-14 w-14 md:h-20 md:w-20 bg-emerald-500 rounded-3xl border-[6px] border-white shadow-2xl flex items-center justify-center text-white"><CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 stroke-[3px]" /></div>
               </div>

               <div className="flex-1 space-y-8 text-center lg:text-left">
                  <div className="space-y-4">
                     <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                        <Badge className="bg-primary text-white border-none px-5 py-2 rounded-full font-black text-[10px] md:text-xs tracking-[0.2em] uppercase shadow-xl">{vacancy.board} Registry</Badge>
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 px-4 py-1.5 rounded-full font-bold text-[9px] uppercase tracking-widest">{vacancy.category}</Badge>
                     </div>
                     <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-[#0F172A] tracking-tighter leading-[1] antialiased uppercase">
                        {vacancy.title}
                     </h1>
                     <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-slate-500 font-bold text-sm md:text-xl">
                        <span className="flex items-center gap-3"><Landmark className="h-6 w-6 text-primary" /> {vacancy.department}</span>
                        <div className="h-2 w-2 rounded-full bg-slate-200 hidden md:block" />
                        <span className="flex items-center gap-3"><MapPin className="h-6 w-6 text-rose-500" /> {vacancy.district}, {vacancy.state}</span>
                     </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
                     <Button className="w-full sm:w-auto h-16 md:h-20 px-12 md:px-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[11px] md:text-sm tracking-[0.3em] rounded-2xl md:rounded-[3rem] shadow-5xl border-none transition-all active:scale-95 group/btn" asChild>
                        <a href={vacancy.applyLink} target="_blank" rel="noopener noreferrer">Apply Online <ArrowRight className="h-5 w-5 md:h-6 md:w-6 ml-3 group-hover/btn:translate-x-2 transition-transform" /></a>
                     </Button>
                     {vacancy.notificationPdfUrl && (
                        <Button variant="ghost" className="w-full sm:w-auto h-16 text-primary font-black uppercase text-[11px] tracking-widest gap-3 hover:bg-primary/5 transition-all" asChild>
                           <a href={vacancy.notificationPdfUrl} target="_blank" rel="noopener noreferrer"><FileText className="h-6 w-6" /> Official Notification</a>
                        </Button>
                     )}
                  </div>
               </div>
            </CardContent>
         </section>

         {/* DATA GRID HUB */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-14">
            <div className="lg:col-span-8 space-y-12 md:space-y-20">
               
               <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <DetailCard icon={Briefcase} label="Post Name" value={vacancy.postName} />
                  <DetailCard icon={Zap} label="Total Posts" value={vacancy.totalPosts} color="text-primary" />
                  <DetailCard icon={GraduationCap} label="Educational Hub" value={vacancy.education} colSpan={2} />
                  <DetailCard icon={DollarSign} label="Remuneration" value={vacancy.salary} color="text-emerald-600" />
                  <DetailCard icon={Clock} label="Age Threshold" value={vacancy.ageLimit} />
               </section>

               <section className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6 px-1">
                     <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner shrink-0"><CheckCircle2 className="h-6 w-6" /></div>
                     <h3 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tight uppercase">Audit Guidelines</h3>
                  </div>
                  <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 border border-slate-100 shadow-xl space-y-12">
                     <div className="space-y-4">
                        <h4 className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.4em] ml-1">Selection Cycle</h4>
                        <div className="p-6 md:p-10 bg-slate-50 rounded-[2rem] border border-slate-100 text-sm md:text-xl font-medium leading-relaxed italic text-slate-600">&quot;{vacancy.selectionProcess}&quot;</div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.4em] ml-1">Financial Ingestion</h4>
                        <div className="p-6 md:p-10 bg-slate-50 rounded-[2rem] border border-slate-100 text-sm md:text-xl font-medium leading-relaxed italic text-slate-600">&quot;{vacancy.applicationFee}&quot;</div>
                     </div>
                  </div>
               </section>
            </div>

            <div className="lg:col-span-4 space-y-12">
               <Card className="border-none shadow-5xl rounded-[2.5rem] md:rounded-[3.5rem] bg-[#0F172A] text-white p-8 md:p-12 space-y-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Calendar className="h-64 w-64 text-primary" /></div>
                  <div className="relative z-10 space-y-12 text-left">
                     <div className="space-y-2">
                        <h3 className="text-3xl font-black tracking-tight leading-none uppercase">Registry Dates</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Temporal Ingestion Node</p>
                     </div>
                     
                     <div className="space-y-10">
                        <DatePill label="Registration Opens" val={new Date(vacancy.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} icon={<Zap className="text-emerald-500" />} />
                        <DatePill label="Closure Node (Last Date)" val={new Date(vacancy.lastDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} icon={<Clock className="text-rose-500" />} highlight />
                        {vacancy.examDate && <DatePill label="Projected Exam" val={new Date(vacancy.examDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} icon={<Target className="text-blue-500" />} />}
                        {vacancy.admitCardDate && <DatePill label="Admit Card Hub" val="Update Pending" icon={<FileText className="text-slate-500" />} />}
                     </div>

                     <div className="pt-10 border-t border-white/5">
                        <Button asChild className="w-full h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl border-none active:scale-95 transition-all">
                           <a href={vacancy.officialWebsite} target="_blank" rel="noopener noreferrer">Official Portal Hub <ExternalLink className="h-4 w-4 ml-3" /></a>
                        </Button>
                     </div>
                  </div>
               </Card>

               <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 text-left">
                  <div className="flex items-center gap-4">
                     <HelpCircle className="h-8 w-8 text-primary" />
                     <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0F172A]">Aspirant Support</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">Verify your eligibility metrics before authorizing the transaction node. Official PDFs contain the final binding rules for the recruitment vertical.</p>
                  <Button asChild variant="outline" className="w-full h-12 md:h-14 rounded-xl border-slate-200 text-[#0F172A] font-black uppercase text-[9px] md:text-[10px] tracking-widest gap-2">
                     <Link href="/support">Open Support Desk <ChevronRight className="h-4 w-4" /></Link>
                  </Button>
               </div>
            </div>
         </div>

         {/* RELATED NODES */}
         {relatedVacancies && relatedVacancies.length > 1 && (
            <section className="space-y-10 md:space-y-16">
               <div className="flex items-center justify-between border-b border-slate-100 pb-6 px-1">
                  <h3 className="text-xl md:text-4xl font-black text-[#0F172A] uppercase tracking-tighter">Similar Hubs</h3>
                  <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest gap-2">
                     <Link href="/vacancies">Explore Registry <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                  {relatedVacancies.filter(v => v.id !== id).map((v) => (
                     <Link key={v.id} href={`/vacancies/${v.id}`}>
                        <Card className="border border-slate-100 shadow-lg hover:shadow-4xl transition-all duration-500 rounded-[2rem] bg-white p-6 md:p-10 text-center space-y-6 group h-full flex flex-col">
                           <div className="h-16 w-16 md:h-24 md:w-24 mx-auto group-hover:scale-110 transition-transform duration-500"><AuthorityLogo boardId={v.board} size="md" /></div>
                           <div className="flex-1 space-y-3">
                              <h4 className="text-sm md:text-xl font-bold text-[#0F172A] group-hover:text-primary transition-colors uppercase leading-tight line-clamp-2">{v.title}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.department}</p>
                           </div>
                           <Badge variant="secondary" className="bg-slate-50 text-slate-400 font-bold mx-auto">{v.totalPosts} Posts</Badge>
                        </Card>
                     </Link>
                  ))}
               </div>
            </section>
         )}

      </main>
      <Footer />
    </div>
  )
}

function DetailCard({ icon: Icon, label, value, color = "text-[#0F172A]", colSpan = 1 }: any) {
  return (
    <div className={cn("p-8 md:p-12 bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-lg flex flex-col items-start gap-5 group hover:translate-y-[-4px] transition-all duration-500", colSpan > 1 && "md:col-span-2")}>
       <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-primary/5 group-hover:text-primary transition-all">
          <Icon className="h-5 w-5 md:h-7 md:w-7" />
       </div>
       <div className="space-y-1">
          <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">{label}</p>
          <p className={cn("text-base md:text-3xl font-bold leading-tight tracking-tight uppercase", color)}>{value || 'N/A'}</p>
       </div>
    </div>
  )
}

function DatePill({ label, val, icon, highlight }: any) {
   return (
      <div className={cn("flex items-center justify-between p-4 md:p-6 rounded-2xl border transition-all group", highlight ? "bg-white/10 border-white/20 shadow-xl" : "bg-white/5 border-white/5 hover:bg-white/10")}>
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
               {icon}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</span>
         </div>
         <span className="text-xs md:text-lg font-black tabular-nums tracking-tight text-white">{val}</span>
      </div>
   )
}
