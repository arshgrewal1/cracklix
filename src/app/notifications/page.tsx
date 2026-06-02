
"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, CheckCircle2, AlertCircle, TrendingUp, FileText, ChevronRight, Zap, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const db = useFirestore()
  
  const noticeQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "notifications"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: notices, loading } = useCollection<any>(noticeQuery)

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="h-5 w-5 text-emerald-600" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Official Recruitment Feed</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                Live Exam <br/> <span className="text-primary">Alerts</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-xl">
                Real-time updates directly from PSSSB, PPSC, and Punjab Police recruitment boards.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl">
               <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
               <span className="text-xs font-black text-[#0F172A] uppercase tracking-widest">System Online</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
              ))
            ) : notices && notices.length > 0 ? (
              notices.map((n) => (
                <Card key={n.id} className="border-none shadow-2xl shadow-slate-200/30 bg-white hover:translate-y-[-4px] transition-all duration-300 rounded-[2rem] group cursor-pointer overflow-hidden">
                  <CardContent className="p-0 flex items-stretch">
                    <div className={`w-3 ${
                      n.category === 'Result' ? 'bg-emerald-500' : 
                      n.category === 'Recruitment' ? 'bg-primary' : 
                      n.category === 'Admit Card' ? 'bg-blue-500' : 'bg-slate-400'
                    }`} />
                    <div className="p-8 flex-1 flex flex-col md:flex-row gap-8 items-center">
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                        n.category === 'Result' ? 'bg-emerald-50 text-emerald-500 shadow-emerald-500/10' : 
                        n.category === 'Recruitment' ? 'bg-orange-50 text-primary shadow-primary/10' : 
                        'bg-blue-50 text-blue-500 shadow-blue-500/10'
                      }`}>
                        {n.category === 'Result' ? <TrendingUp className="h-8 w-8" /> : 
                         n.category === 'Recruitment' ? <Zap className="h-8 w-8" /> : <Bell className="h-8 w-8" />}
                      </div>
                      <div className="flex-1 space-y-2 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                           <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] font-black uppercase px-3 py-1 rounded-lg">
                             {n.board || 'Institutional'}
                           </Badge>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{n.time}</span>
                           {n.important && <Badge className="bg-rose-500 text-white border-none text-[8px] font-black animate-pulse px-3 py-1 rounded-lg">High Priority</Badge>}
                        </div>
                        <h4 className="font-headline font-black text-2xl text-[#0F172A] group-hover:text-primary transition-colors leading-tight">
                          {n.title}
                        </h4>
                        <p className="text-slate-500 leading-relaxed font-medium line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                        <Button className="bg-[#0F172A] hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl shadow-xl shadow-slate-200">
                          View Details
                        </Button>
                        {n.pdfUrl && (
                          <Button variant="outline" className="border-slate-100 text-slate-400 hover:text-primary font-bold text-[10px] uppercase h-10 rounded-xl">
                            Download PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <Bell className="h-16 w-16 mb-6 opacity-10" />
                <p className="font-black font-headline text-xl">Quiet Day in Recruitment</p>
                <p className="text-sm font-bold opacity-50 mt-1 uppercase tracking-widest">Stay tuned for official updates.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
