"use client"

import React, { useMemo, useEffect, useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser, useCollection } from "@/firebase"
import { doc, updateDoc, increment, collection, query, where, limit } from "firebase/firestore"
import { 
  ArrowLeft, 
  ArrowRight,
  Calendar, 
  Clock, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Landmark, 
  FileText, 
  ExternalLink,
  Target,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  DollarSign,
  Briefcase,
  GraduationCap,
  ClipboardList,
  Award,
  Crown,
  Heart,
  Share2,
  Bookmark,
  Smartphone,
  Printer,
  FileBadge
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthorityLogo } from "@/lib/exam-icons"
import { cn } from "@/lib/utils"
import { Vacancy } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Enterprise Recruitment Intelligence Portal v4.8 [Strict NEXT15 Async].
 * FIXED: Handled async params and corrected JSX Button tag mismatch.
 */

export default function VacancyDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const db = useFirestore()
  const router = useRouter()
  const { user, profile } = useUser()
  const { toast } = useToast()
  
  const [mounted, setMounted] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  const id = params.id;

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
       setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);
    }
    if (db && id) {
       updateDoc(doc(db, "vacancies", id), { views: increment(1) }).catch(() => {})
    }
  }, [db, id])

  const { data: vacancy, loading } = useDoc<Vacancy>(useMemo(() => (db && id ? doc(db, "vacancies", id) : null), [db, id]))
  
  const relatedQuery = useMemo(() => {
    if (!db || !vacancy) return null
    return query(collection(db, "vacancies"), where("status", "==", "PUBLISHED"), where("board", "==", vacancy.board), limit(3))
  }, [db, vacancy])

  const { data: relatedVacancies } = useCollection<Vacancy>(relatedQuery as any)

  const handleShare = async () => {
     if (typeof navigator !== 'undefined' && navigator.share) {
        try {
           await navigator.share({ title: vacancy?.title, text: `Check this vacancy on Cracklix: ${vacancy?.title}`, url: window.location.href });
        } catch (e) {}
     } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied", description: "The URL is now on your clipboard." });
     }
  }

  if (loading || !mounted) return <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4"><Zap className="h-12 w-12 text-primary animate-pulse" /></div>

  if (!vacancy) return (
     <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-10">
        <div className="h-32 w-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200 shadow-inner">
           <AlertCircle className="h-16 w-16" />
        </div>
        <div className="space-y-3">
           <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase">Record Purged</h2>
           <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">This recruitment listing has been archived or the link has expired.</p>
        </div>
        <Button onClick={() => router.push('/vacancies')} variant="outline" className="rounded-2xl h-14 px-10 font-bold border-2">Return to Registry</Button>
     </div>
  )

  const isClosingSoon = () => {
     const last = new Date(vacancy.lastDate).getTime();
     const now = new Date().getTime();
     const diffDays = (last - now) / (1000 * 60 * 60 * 24);
     return diffDays > 0 && diffDays < 7;
  };

  const isNew = () => {
     const pub = vacancy.publishedAt?.seconds ? vacancy.publishedAt.seconds * 1000 : Date.now();
     const now = new Date().getTime();
     const diffDays = (now - pub) / (1000 * 60 * 60 * 24);
     return diffDays < 3;
  };

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-12 py-6 md:py-16 space-y-12 md:space-y-24">
         
         <section className="bg-[#0F172A] rounded-[3rem] md:rounded-[5rem] shadow-5xl overflow-hidden relative group text-white">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[160px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 p-8 md:p-20 flex flex-col lg:flex-row gap-12 md:gap-24 items-center">
               <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-1000">
                  <AuthorityLogo boardId={vacancy.board} size="xl" className="h-32 w-32 md:h-[320px] md:w-[320px] border-[12px] border-white/5 shadow-5xl bg-white/5 backdrop-blur-3xl" />
                  <div className="absolute -bottom-4 -right-4 h-16 w-16 md:h-24 md:w-24 bg-emerald-500 rounded-[2rem] border-[8px] border-[#0F172A] shadow-2xl flex items-center justify-center text-white"><ShieldCheck className="h-8 w-8 md:h-12 md:w-12 stroke-[3px]" /></div>
               </div>

               <div className="flex-1 space-y-10 text-center lg:text-left">
                  <div className="space-y-6">
                     <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3">
                        <Badge className="bg-primary text-white border-none px-6 py-2 rounded-full font-black text-[10px] md:text-xs tracking-widest shadow-xl uppercase">{vacancy.board} official</Badge>
                        {isNew() && <Badge className="bg-emerald-50 text-emerald-600 border-none px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-xl tracking-widest animate-pulse">New</Badge>}
                        {isClosingSoon() && <Badge className="bg-rose-500 text-white border-none px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-xl tracking-widest">Closing Soon</Badge>}
                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-inner"><Crown className="h-5 w-5 text-primary fill-primary" /></div>
                     </div>
                     <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.95] antialiased">
                        {vacancy.title}
                     </h1>
                     <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-10 gap-y-4 text-slate-400 font-bold text-sm md:text-2xl tracking-tight">
                        <span className="flex items-center gap-3"><Landmark className="h-6 w-6 text-primary" /> {vacancy.department}</span>
                        <div className="h-2 w-2 rounded-full bg-white/20 hidden md:block" />
                        <span className="flex items-center gap-3"><MapPin className="h-6 w-6 text-rose-500" /> {vacancy.district}, Punjab</span>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                     <Button className="w-full sm:w-auto h-16 md:h-24 px-12 md:px-24 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-sm tracking-[0.3em] rounded-3xl md:rounded-[3rem] shadow-4xl border-none transition-all active:scale-95 group/btn" asChild>
                        <a href={vacancy.applyLink} target="_blank" rel="noopener noreferrer">Apply online <ArrowRight className="h-5 w-5 md:h-8 md:w-8 ml-3 group-hover/btn:translate-x-3 transition-transform" /></a>
                     </Button>
                     <div className="flex gap-4">
                        <button onClick={handleShare} className="h-16 w-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90"><Share2 className="h-6 w-6" /></button>
                        <button className="h-16 w-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90"><Bookmark className="h-6 w-6" /></button>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* QUICK STATS */}
         <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10 px-1">
            <StatPill label="Total posts" val={vacancy.totalPosts} icon={Zap} color="text-primary" bg="bg-blue-50" />
            <StatPill label="Min. qualification" val={vacancy.education?.split(',')[0]} icon={GraduationCap} color="text-emerald-600" bg="bg-emerald-50" />
            <StatPill label="Age threshold" val={vacancy.ageLimit} icon={Users} color="text-orange-500" bg="bg-orange-50" />
            <StatPill label="Closing soon" val={new Date(vacancy.lastDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} icon={Clock} color="text-rose-500" bg="bg-rose-50" />
         </section>

         {/* DETAILS */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-24">
            <div className="lg:col-span-8 space-y-16 md:space-y-32">
               
               <HubContainer label="Recruitment profile" icon={ClipboardList}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                     <DataPoint label="Post Registry" value={vacancy.postName} />
                     <DataPoint label="Ad Number" value={vacancy.adNumber} />
                     <DataPoint label="Job Category" value={vacancy.category} />
                     <DataPoint label="Status" value={vacancy.status} highlight />
                  </div>
                  {vacancy.locationDetail && (
                     <div className="pt-10 mt-10 border-t border-slate-50 space-y-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Post details & breakdown</p>
                        <p className="text-sm md:text-xl font-bold text-slate-600 leading-relaxed antialiased">{vacancy.locationDetail}</p>
                     </div>
                  )}
               </HubContainer>

               <HubContainer label="Financial metrics" icon={DollarSign} color="text-emerald-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                     <DataPoint label="Salary Matrix" value={vacancy.salary} />
                     <DataPoint label="Grade Pay" value={vacancy.gradePay || "As per Level"} />
                     <DataPoint label="Application Fee" value={vacancy.applicationFee} />
                     <DataPoint label="Payment Mode" value={vacancy.paymentMode || "Online"} />
                  </div>
               </HubContainer>

               <HubContainer label="Eligibility nodes" icon={ShieldCheck} color="text-blue-500">
                  <div className="space-y-12">
                     <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Educational Hub</p>
                        <p className="text-base md:text-2xl font-[700] text-[#0F172A] leading-relaxed antialiased">{vacancy.qualificationDetail || vacancy.education}</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                        <DataPoint label="Nationality" value="Citizen of India" />
                        <DataPoint label="Age Relaxation" value={vacancy.ageRelaxation || "As per Govt Norms"} />
                     </div>
                  </div>
               </HubContainer>

               <HubContainer label="Selection lifecycle" icon={Target} color="text-rose-500">
                  <div className="space-y-10">
                     <p className="text-base md:text-2xl font-[700] text-[#0F172A] leading-relaxed antialiased">{vacancy.selectionProcess}</p>
                     <div className="grid grid-cols-1 gap-4">
                        {["Written Examination", "Physical Standards Test", "Medical Audit", "Merit List"].map((stage, i) => (
                           <div key={i} className="flex items-center gap-6 p-6 md:p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] group hover:bg-white hover:shadow-xl transition-all duration-500">
                              <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary font-black text-xs md:text-xl shrink-0 group-hover:scale-110 transition-transform">0{i+1}</div>
                              <span className="text-sm md:text-2xl font-[800] text-slate-700 group-hover:text-[#0F172A] transition-colors">{stage}</span>
                              <CheckCircle2 className="h-6 w-6 text-emerald-500 ml-auto opacity-20 group-hover:opacity-100 transition-all" />
                           </div>
                        ))}
                     </div>
                  </div>
               </HubContainer>
            </div>

            <aside className="lg:col-span-4 space-y-10 md:space-y-16">
               <Card className="border-none shadow-5xl rounded-[3rem] md:rounded-[4rem] bg-[#0F172A] text-white p-8 md:p-14 space-y-12 relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 p-14 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Calendar className="h-80 w-80 text-primary" /></div>
                  <div className="relative z-10 space-y-12 text-left">
                     <div className="space-y-3">
                        <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">Registry</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Timeline</p>
                     </div>
                     <div className="space-y-10">
                        <SidebarDate label="Inception" val={formatDate(vacancy.startDate)} icon={<Zap className="text-emerald-500" />} />
                        <SidebarDate label="Closure" val={formatDate(vacancy.lastDate)} icon={<Clock className="text-rose-500" />} highlight />
                        {vacancy.examDate && <SidebarDate label="Projected audit" val={formatDate(vacancy.examDate)} icon={<Target className="text-blue-500" />} />}
                     </div>
                     <div className="pt-12 border-t border-white/5">
                        <Button asChild className="w-full h-16 md:h-20 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-sm tracking-[0.2em] rounded-3xl shadow-4xl border-none transition-all active:scale-95 group/portal">
                           <a href={vacancy.officialWebsite} target="_blank" rel="noopener noreferrer">Official portal <ExternalLink className="h-5 w-5 ml-3 group-hover/portal:translate-x-1 transition-transform" /></a>
                        </Button>
                     </div>
                  </div>
               </Card>

               <div className="p-8 md:p-12 bg-white rounded-[3.5rem] border border-slate-100 shadow-xl space-y-10 text-left group hover:translate-y-[-8px] transition-all duration-500">
                  <div className="flex items-center gap-4">
                     <FileBadge className="h-10 w-10 text-primary" />
                     <h4 className="text-xl font-black tracking-tight text-[#0F172A] uppercase">Files</h4>
                  </div>
                  <div className="space-y-4">
                     <AssetLink label="Recruitment PDF" href={vacancy.notificationPdfUrl} icon={FileText} color="bg-rose-50 text-rose-600" />
                     <AssetLink label="Official Notice" href={vacancy.officialNoticeUrl} icon={Megaphone} color="bg-blue-50 text-blue-600" />
                  </div>
               </div>
            </aside>
         </div>

         {/* STICKY BOTTOM */}
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[95vw] max-w-4xl animate-in slide-in-from-bottom-24 duration-700 delay-500">
            <div className="bg-[#0F172A]/90 backdrop-blur-3xl p-4 md:p-6 rounded-[2.5rem] md:rounded-[3.5rem] shadow-5xl border border-white/10 flex items-center justify-between gap-4 md:gap-10">
               <div className="flex items-center gap-4 hidden sm:flex px-4 border-r border-white/10">
                  <AuthorityLogo boardId={vacancy.board} size="sm" className="h-10 w-10 md:h-12 md:w-12 bg-white/10 p-2 shadow-inner" />
                  <div className="min-w-0 text-white">
                     <p className="font-black text-xs md:text-base truncate max-w-[200px] leading-none uppercase tracking-tight">{vacancy.title}</p>
                     <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Official Node</p>
                  </div>
               </div>
               <div className="flex-1 flex items-center gap-3">
                  <Button onClick={handleShare} variant="ghost" className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-white/5 text-white hover:bg-white/10 border-none shadow-inner transition-all flex items-center justify-center">
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button asChild className="flex-1 h-14 md:h-20 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-xs tracking-[0.3em] rounded-3xl md:rounded-[2.5rem] shadow-4xl border-none active:scale-95 transition-all">
                     <a href={vacancy.applyLink} target="_blank" rel="noopener noreferrer">Apply online hub <ChevronRight className="h-4 w-4 md:h-6 md:w-6" /></a>
                  </Button>
               </div>
            </div>
         </div>
      </main>
      <Footer />
    </div>
  )
}

function HubContainer({ label, icon: Icon, color = "text-primary", children }: any) {
  return (
     <div className="space-y-6 md:space-y-10 group">
        <div className="flex items-center gap-4 px-2">
           <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", color.replace('text', 'bg').replace('600', '50'))}>
              <Icon className={cn("h-5 w-5 md:h-6 md:w-6", color)} />
           </div>
           <h3 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tighter uppercase">{label}</h3>
        </div>
        <div className="bg-white border-2 border-slate-50 shadow-2xl rounded-[3rem] md:rounded-[4rem] p-8 md:p-20 text-left transition-all duration-500 hover:shadow-4xl">
           {children}
        </div>
     </div>
  )
}

function DataPoint({ label, value, highlight = false }: any) {
  return (
     <div className="space-y-3">
        <p className="text-[10px] md:text-xs font-black uppercase text-slate-300 tracking-[0.3em]">{label}</p>
        <p className={cn("text-base md:text-3xl font-[800] leading-tight antialiased truncate", highlight ? "text-primary" : "text-slate-700")}>{value || "TBD"}</p>
     </div>
  )
}

function StatPill({ icon: Icon, label, val, color, bg }: any) {
  return (
     <Card className="border-none shadow-xl rounded-[2rem] md:rounded-[3rem] bg-white p-5 md:p-10 flex flex-col items-center justify-center text-center gap-4 group hover:translate-y-[-6px] transition-all duration-500 border border-slate-50">
        <div className={cn("h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", bg, color)}>
           <Icon className="h-5 w-5 md:h-8 md:w-8" />
        </div>
        <div className="space-y-1">
           <p className="text-sm md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none">{val}</p>
           <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
        </div>
     </Card>
  )
}

function SidebarDate({ label, val, icon, highlight = false }: any) {
  return (
     <div className={cn("flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-500 group", highlight ? "bg-white/10 border-white/20 shadow-2xl scale-[1.05]" : "bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10")}>
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">{icon}</div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</span>
        </div>
        <span className="text-sm md:text-xl font-black tabular-nums tracking-tighter text-white">{val}</span>
     </div>
  )
}

function AssetLink({ label, href, icon: Icon, color }: any) {
   if (!href) return null;
   return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white rounded-3xl border border-slate-100 transition-all group hover:shadow-2xl active:scale-95">
         <div className="flex items-center gap-5">
            <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", color)}>
               <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm md:text-lg font-bold text-slate-700 group-hover:text-[#0F172A] transition-colors">{label}</span>
         </div>
         <Download className="h-5 w-5 text-slate-200 group-hover:text-primary transition-all" />
      </a>
   )
}

function formatDate(date: any) {
   if (!date) return "N/A";
   return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}
