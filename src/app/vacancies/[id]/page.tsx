"use client"

import React, { useMemo, useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser, useCollection } from "@/firebase"
import { doc, updateDoc, increment, collection, query, where, limit, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { 
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
  ChevronRight,
  DollarSign,
  Briefcase,
  GraduationCap,
  ClipboardList,
  Award,
  Crown,
  Share2,
  Bookmark,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  FileBadge,
  Megaphone,
  Users
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
 * @fileOverview Enterprise Recruitment Intelligence Portal v7.4.
 * FIXED: Added missing Users icon import.
 * FIXED: UI Back button hidden in standalone PWA mode.
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
        toast({ title: "Link Copied" });
     }
  }

  const isBookmarked = profile?.savedVacancies?.includes(id);

  const handleToggleBookmark = async () => {
    if (!user || !db) {
       toast({ title: "Identification required" });
       return;
    }
    try {
      const userRef = doc(db, "users", user.uid);
      if (isBookmarked) {
        await updateDoc(userRef, { savedVacancies: arrayRemove(id), updatedAt: serverTimestamp() });
        toast({ title: "Removed from vault" });
      } else {
        await updateDoc(userRef, { savedVacancies: arrayUnion(id), updatedAt: serverTimestamp() });
        toast({ title: "Record synchronized" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Sync failed" });
    }
  };

  if (loading || !mounted) return <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>

  if (!vacancy) return (
     <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-10">
        <div className="h-24 w-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 shadow-inner">
           <AlertCircle className="h-12 w-12" />
        </div>
        <div className="space-y-2">
           <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter uppercase">Record Purged</h2>
           <p className="text-slate-500 font-medium max-sm mx-auto leading-relaxed">This recruitment listing has been archived or expired.</p>
        </div>
        <Button onClick={() => router.push('/vacancies')} variant="outline" className="rounded-xl h-12 px-8 font-bold border-2">Return to Registry</Button>
     </div>
  )

  const formatDate = (date: any) => {
     if (!date) return "TBD";
     return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10 flex flex-col break-words">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-12 space-y-8 md:space-y-12">
         
         <section className="bg-[#0F172A] rounded-2xl md:rounded-[2.5rem] shadow-5xl overflow-hidden relative group text-white">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 p-6 md:p-10 flex flex-col lg:flex-row gap-6 md:gap-10 items-center">
               <div className="relative shrink-0 transition-transform duration-700 group-hover:scale-105">
                  <AuthorityLogo boardId={vacancy.board} size="lg" className="h-24 w-24 md:h-40 md:w-40 border-[6px] border-white/5 shadow-5xl bg-white/5 backdrop-blur-3xl" />
                  <div className="absolute -bottom-2 -right-2 h-10 w-10 md:h-12 md:w-12 bg-emerald-500 rounded-xl border-[4px] border-[#0F172A] shadow-2xl flex items-center justify-center text-white"><ShieldCheck className="h-5 w-5 md:h-7 md:w-7 stroke-[3px]" /></div>
               </div>

               <div className="flex-1 space-y-4 text-center lg:text-left min-w-0 w-full">
                  <div className="space-y-3">
                     <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2">
                        <Badge className="bg-primary text-white border-none px-4 py-1 rounded-full font-black text-[9px] shadow-xl uppercase tracking-tighter">{vacancy.board} official</Badge>
                        <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 shadow-inner"><Crown className="h-4 w-4 text-primary fill-primary" /></div>
                     </div>
                     <h1 className="text-xl sm:text-2xl md:text-5xl font-black text-white tracking-tight leading-tight antialiased uppercase break-words">
                        {vacancy.title}
                     </h1>
                     <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-slate-400 font-bold text-[10px] md:text-lg tracking-tight">
                        <span className="flex items-center gap-2 truncate max-w-[200px] md:max-w-md"><Landmark className="h-3.5 w-3.5 text-primary shrink-0" /> {vacancy.department}</span>
                        <span className="flex items-center gap-2 shrink-0"><MapPin className="h-3.5 w-3.5 text-rose-500" /> {vacancy.district || "Punjab"}</span>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                     <Button className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-12 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-xs tracking-widest rounded-xl md:rounded-2xl shadow-4xl border-none transition-all active:scale-95 group/btn" asChild>
                        <a href={vacancy.applyLink} target="_blank" rel="noopener noreferrer">Apply online <ArrowRight className="h-4 w-4 md:h-6 md:w-6 ml-2 group-hover/btn:translate-x-1 transition-transform" /></a>
                     </Button>
                     <div className="flex gap-3">
                        <button onClick={handleShare} className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer"><Share2 className="h-5 w-5" /></button>
                        <button onClick={handleToggleBookmark} className={cn("h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-90 cursor-pointer", isBookmarked ? "text-primary" : "text-white hover:bg-white/10")}><Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} /></button>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-1">
            <StatPill icon={Zap} label="Posts" val={vacancy.totalPosts} color="text-primary" bg="bg-blue-50" />
            <StatPill icon={GraduationCap} label="Qualif." val={vacancy.education?.split(',')[0]} color="text-emerald-600" bg="bg-emerald-50" />
            <StatPill icon={Users} label="Age" val={vacancy.ageLimit || "18-37"} color="text-orange-500" bg="bg-orange-50" />
            <StatPill icon={Clock} label="Last date" val={formatDate(vacancy.lastDate)} color="text-rose-500" bg="bg-rose-50" />
         </section>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            <div className="lg:col-span-8 space-y-8 md:space-y-12">
               
               <HubContainer label="Recruitment details" icon={ClipboardList}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                     <DataPoint label="Post Name" value={vacancy.postName} />
                     <DataPoint label="Ad Number" value={vacancy.adNumber} />
                     <DataPoint label="Job Category" value={vacancy.category} />
                     <DataPoint label="Status" value={vacancy.status} highlight />
                  </div>
                  {vacancy.locationDetail && (
                     <div className="pt-6 mt-6 border-t border-slate-50 space-y-2">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Additional info</p>
                        <p className="text-sm md:text-base font-bold text-slate-600 leading-relaxed antialiased">{vacancy.locationDetail}</p>
                     </div>
                  )}
               </HubContainer>

               <HubContainer label="Eligibility criteria" icon={ShieldCheck} color="text-blue-500">
                  <div className="space-y-6 text-left">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Education hub</p>
                        <p className="text-sm md:text-lg font-[700] text-[#0F172A] leading-relaxed antialiased break-words">{vacancy.qualificationDetail || vacancy.education}</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        <DataPoint label="Nationality" value="Indian Citizen" />
                        <DataPoint label="Age Relaxation" value={vacancy.ageRelaxation || "Govt Rules"} />
                     </div>
                  </div>
               </HubContainer>

               <HubContainer label="Selection process" icon={Target} color="text-rose-500">
                  <div className="space-y-6">
                     <p className="text-sm md:text-lg font-[700] text-[#0F172A] leading-relaxed antialiased break-words">{vacancy.selectionProcess}</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {["Written Exam", "Physical Test", "Medical Audit", "Final Merit"].map((stage, i) => (
                           <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-500">
                              <div className="h-8 w-8 rounded-lg bg-white shadow-md flex items-center justify-center text-primary font-black text-xs shrink-0 group-hover:scale-110 transition-transform">0{i+1}</div>
                              <span className="text-xs md:text-sm font-[800] text-slate-700 uppercase tracking-tight truncate">{stage}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </HubContainer>
            </div>

            <aside className="lg:col-span-4 space-y-6 md:space-y-8">
               <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-[#0F172A] text-white p-6 md:p-10 space-y-8 relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Calendar className="h-64 w-64 text-primary" /></div>
                  <div className="relative z-10 space-y-6 text-left">
                     <div className="space-y-1">
                        <h3 className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase text-white">Registry</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timeline</p>
                     </div>
                     <div className="space-y-4">
                        <SidebarDate label="Opening" val={formatDate(vacancy.startDate)} icon={<Zap className="text-emerald-500" />} />
                        <SidebarDate label="Closing" val={formatDate(vacancy.lastDate)} icon={<Clock className="text-rose-500" />} highlight />
                        {vacancy.examDate && <SidebarDate label="Exam date" val={formatDate(vacancy.examDate)} icon={<Target className="text-blue-500" />} />}
                     </div>
                     <div className="pt-6 border-t border-white/5">
                        <Button asChild className="w-full h-11 md:h-12 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl border-none transition-all active:scale-95 group/portal">
                           <a href={vacancy.officialWebsite} target="_blank" rel="noopener noreferrer">Official site <ExternalLink className="h-4 w-4 ml-2 group-hover/portal:translate-x-0.5 transition-transform" /></a>
                        </Button>
                     </div>
                  </div>
               </Card>

               <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 text-left group hover:translate-y-[-4px] transition-all duration-500">
                  <div className="flex items-center gap-4">
                     <FileBadge className="h-7 w-7 text-primary" />
                     <h4 className="text-lg md:text-xl font-black tracking-tight text-[#0F172A] uppercase">Archives</h4>
                  </div>
                  <div className="space-y-2">
                     <AssetLink label="Recruitment PDF" href={vacancy.notificationPdfUrl} icon={FileText} color="bg-rose-50 text-rose-600" />
                     <AssetLink label="Apply Direct Hub" href={vacancy.applyLink} icon={Megaphone} color="bg-blue-50 text-blue-600" />
                  </div>
               </div>
            </aside>
         </div>

         <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-[95vw] max-w-3xl animate-in slide-in-from-bottom-12 duration-500">
            <div className="bg-[#0F172A]/95 backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-5xl border border-white/10 flex items-center justify-between gap-3">
               <div className="flex items-center gap-3 hidden sm:flex px-4 border-r border-white/10">
                  <AuthorityLogo boardId={vacancy.board} size="sm" className="h-10 w-10 bg-white/10 p-2 shadow-inner" />
                  <div className="min-w-0 text-white text-left">
                     <p className="font-black text-xs truncate max-w-[180px] uppercase tracking-tight">{vacancy.title}</p>
                     <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Official Node</p>
                  </div>
               </div>
               <div className="flex-1 flex items-center gap-2">
                  <button onClick={handleShare} className="h-10 md:h-12 w-10 md:w-12 rounded-xl bg-white/5 text-white hover:bg-white/10 border-none shadow-inner transition-all flex items-center justify-center cursor-pointer">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <Button asChild className="flex-1 h-11 md:h-12 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-4xl border-none active:scale-95 transition-all">
                     <a href={vacancy.applyLink} target="_blank" rel="noopener noreferrer">Apply online hub <ChevronRight className="h-4 w-4 ml-1" /></a>
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
     <div className="space-y-4 group">
        <div className="flex items-center gap-4 px-2">
           <div className={cn("h-8 w-8 md:h-10 md:w-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", color.replace('text', 'bg').replace('600', '50'))}>
              <Icon className={cn("h-4 w-4 md:h-5 md:w-5", color)} />
           </div>
           <h3 className="text-lg md:text-2xl font-black text-[#0F172A] tracking-tighter uppercase">{label}</h3>
        </div>
        <div className="bg-white border border-slate-50 shadow-xl rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-left transition-all duration-500 hover:shadow-2xl">
           {children}
        </div>
     </div>
  )
}

function DataPoint({ label, value, highlight = false }: any) {
  return (
     <div className="space-y-1">
        <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-300 tracking-widest">{label}</p>
        <p className={cn("text-sm md:text-lg font-[800] leading-tight antialiased break-words", highlight ? "text-primary" : "text-slate-700")}>{value || "TBD"}</p>
     </div>
  )
}

function StatPill({ icon: Icon, label, val, color, bg }: any) {
  return (
     <Card className="border-none shadow-lg rounded-xl md:rounded-2xl bg-white p-3 md:p-5 flex flex-col items-center justify-center text-center gap-2 group hover:translate-y-[-4px] transition-all duration-500 border border-slate-50">
        <div className={cn("h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", bg, color)}>
           <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div className="space-y-0.5 min-w-0 w-full">
           <p className="text-[12px] md:text-lg font-black text-[#0F172A] tabular-nums tracking-tighter leading-none truncate">{val}</p>
           <p className="text-[8px] font-black uppercase text-slate-400 tracking-tight truncate">{label}</p>
        </div>
     </Card>
  )
}

function SidebarDate({ label, val, icon, highlight = false }: any) {
  return (
     <div className={cn("flex items-center justify-between p-3 rounded-xl border-2 transition-all group", highlight ? "bg-white/10 border-white/20 shadow-2xl scale-[1.02]" : "bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10")}>
        <div className="flex items-center gap-3">
           <div className="h-7 w-7 bg-white/10 rounded-lg flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">{icon}</div>
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
        </div>
        <span className="text-xs md:text-sm font-black tabular-nums tracking-tighter text-white">{val}</span>
     </div>
  )
}

function AssetLink({ label, href, icon: Icon, color }: any) {
   if (!href) return null;
   return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-white rounded-xl border border-slate-100 transition-all group hover:shadow-xl active:scale-95">
         <div className="flex items-center gap-3">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", color)}>
               <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs md:text-sm font-bold text-slate-700 group-hover:text-[#0F172A] transition-colors">{label}</span>
         </div>
         <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all" />
      </a>
   )
}

