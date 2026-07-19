import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ChevronRight, Zap, Users, Star, ArrowRight, ShieldCheck } from "lucide-react"
import { AuthorityLogo } from "@/lib/exam-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Exam } from "@/types"
import { motion } from "framer-motion"

interface ExamCardProps {
  exam: Exam
}

/**
 * @fileOverview Premium Institutional Exam Vertical Card v4.1.
 * Redesigned for production standard comparable to Testbook/Oliveboard.
 * UPDATED: Integrated real data counts.
 */
export default function ExamCard({ exam }: ExamCardProps) {
  const examName = exam.name || "Official Vertical"
  const totalMocksCount = exam.totalMocks || 0

  return (
    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
      <Link href={`/exams/view?id=${exam.id}`} className="block h-full">
        <Card className="bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-5xl transition-all duration-500 group rounded-[40px] overflow-hidden h-full flex flex-col p-8 md:p-10 relative">
          
          {/* HEADER HUB */}
          <div className="flex justify-between items-start mb-10 w-full">
            <AuthorityLogo boardId={exam.boardId} size="md" className="shadow-2xl border-[5px] border-white bg-slate-50 shrink-0" />
            <div className="flex flex-col items-end gap-2 shrink-0">
               <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/50 shadow-sm">
                  <Star className="h-3 w-3 text-amber-400 fill-current" />
                  <span className="text-[10px] font-black text-[#0F172A]">4.9</span>
               </div>
               <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm">
                 Verified HUB
               </Badge>
            </div>
          </div>

          {/* CONTENT NODE */}
          <div className="flex-1 space-y-6 text-left relative z-10">
            <div className="space-y-2">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{exam.boardId} Registry</p>
               <h3 className="text-xl md:text-3xl font-black text-[#0F172A] leading-[1.1] tracking-tight uppercase group-hover:text-primary transition-colors break-words">
                 {examName}
               </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2 text-slate-300">
                    <Zap className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tests</span>
                 </div>
                 <p className="text-sm md:text-xl font-black text-[#0F172A] tabular-nums">{totalMocksCount}</p>
              </div>
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2 text-slate-300">
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Students</span>
                 </div>
                 <p className="text-sm md:text-xl font-black text-[#0F172A] tabular-nums">Active</p>
              </div>
            </div>
          </div>

          {/* ACTION HUB */}
          <div className="mt-12 relative z-10">
             <Button className="w-full h-16 md:h-20 rounded-[20px] md:rounded-[2rem] bg-[#0F172A] group-hover:bg-primary text-white font-black uppercase text-[10px] md:text-xs tracking-[0.2em] transition-all active:scale-95 border-none shadow-4xl flex items-center justify-between px-8">
               <span>Start preparation</span>
               <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
             </Button>
          </div>

          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
             <ShieldCheck className="h-44 w-44" />
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
