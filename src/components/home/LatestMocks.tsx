'use client';

import { useMemo } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, BookOpen, Clock, ChevronRight, Zap, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview High-Fidelity Latest Mocks Node.
 * Updated: Government SVG Protocol and Triple-layer failover.
 */

export default function LatestMocks() {
  const db = useFirestore()
  
  const mocksQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "mocks"), where("published", "==", true))
  }, [db])

  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: boards, loading: boardsLoading } = useCollection<any>(boardsQuery)

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    return [...rawMocks].sort((a, b) => {
      const tA = a.createdAt?.seconds || 0
      const tB = b.createdAt?.seconds || 0
      return tB - tA
    }).slice(0, 5)
  }, [rawMocks])

  // Standard Failover Emblem
  const stateEmblem = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Emblem_of_Punjab.svg/512px-Emblem_of_Punjab.svg.png";

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-3">
               <Zap className="h-5 w-5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Feed</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-headline font-black text-[#000000] uppercase tracking-tighter">
              Latest <span className="text-primary">Mock Series</span>
            </h2>
            <p className="text-slate-500 font-medium mt-2">Recently published official pattern practice series.</p>
          </div>
          
          <Link 
            href="/mocks" 
            className="text-primary font-black text-[11px] uppercase tracking-[0.2em] flex items-center group gap-2"
          >
            Explore All Hubs <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {mocksLoading || boardsLoading ? (
             Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-[2.5rem]" />)
          ) : mocks.length > 0 ? (
            mocks.map((mock, i) => {
              const board = boards?.find((b: any) => b.id === mock.boardId);
              return (
                <motion.div
                  key={mock.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-4xl hover:-translate-y-1 transition-all duration-500 group h-full flex flex-col p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:shadow-lg transition-all shadow-inner shrink-0">
                         <img 
                            src={board?.iconUrl || stateEmblem} 
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="w-full h-full object-contain p-1" 
                            alt={mock.boardId || 'Board'} 
                            onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.src = stateEmblem;
                            }}
                         />
                      </div>
                      <Badge className="bg-orange-50 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-lg">
                        {board?.abbreviation || mock.boardId?.toUpperCase() || 'OFFICIAL'}
                      </Badge>
                    </div>
                    
                    <h3 className="font-headline font-black text-left text-lg text-[#000000] leading-tight min-h-[48px] group-hover:text-primary transition-colors mb-4 line-clamp-2 uppercase">
                      {mock.title}
                    </h3>
                    
                    <div className="space-y-3 mb-6 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                         <BookOpen className="h-3.5 w-3.5 text-primary" /> {mock.totalQuestions} Questions
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                         <Clock className="h-3.5 w-3.5 text-primary" /> {mock.duration} Mins
                      </div>
                    </div>

                    <Button asChild className="w-full h-14 bg-[#0B1528] hover:bg-primary text-white font-black h-12 rounded-xl text-[10px] uppercase tracking-[0.2em] mt-auto shadow-lg transition-all active:scale-95">
                      <Link href={`/mocks/${mock.id}`}>Attempt Now</Link>
                    </Button>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-300 opacity-30 italic">
               <GraduationCap className="h-12 w-12 mx-auto mb-4" />
               <p className="font-black uppercase text-sm tracking-widest">Awaiting Repository Sync...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
