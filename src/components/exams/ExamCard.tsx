import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ChevronRight, Zap, Users, Star } from "lucide-react"
import { AuthorityLogo } from "@/lib/exam-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Exam } from "@/types"

interface ExamCardProps {
  exam: Exam
}

/**
 * @fileOverview Official Institutional Exam Card v2.0.
 * UPDATED: Redesigned to match high-fidelity pill button and blue title style.
 */
export default function ExamCard({ exam }: ExamCardProps) {
  const examName = exam.name || "Official Vertical"
  const totalMocksCount = exam.totalMocks ?? "40+"
  const studentCount = exam.studentCount ?? "12K+"

  return (
    <Link href={`/exams/view?id=${exam.id}`} className="block h-full">
      <Card className="bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-500 group rounded-[40px] overflow-hidden h-full flex flex-col p-8 md:p-10">
        
        {/* Header Hub */}
        <div className="flex justify-between items-start mb-8">
          <AuthorityLogo boardId={exam.boardId} size="md" className="shadow-xl border-4 border-white bg-slate-50" />
          <div className="flex flex-col items-end gap-2">
             <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                <Star className="h-3 w-3 text-amber-400 fill-current" />
                <span className="text-[10px] font-black text-[#0F172A]">4.9</span>
             </div>
             <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
               {exam.difficulty || 'MIXED'}
             </Badge>
          </div>
        </div>

        {/* Content Node */}
        <div className="flex-1 space-y-6 text-left">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-primary leading-tight uppercase tracking-tight group-hover:brightness-90 transition-all">
              {examName}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              BOARD: {exam.boardId}
            </p>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-slate-400">
               <Zap className="h-4 w-4 text-primary" />
               <span className="text-[11px] font-bold uppercase tracking-tight">{totalMocksCount} Mocks</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
               <Users className="h-4 w-4 text-primary" />
               <span className="text-[11px] font-bold uppercase tracking-tight">{studentCount} Students</span>
            </div>
          </div>
        </div>

        {/* Action Hub */}
        <div className="mt-10">
          <div className="w-full h-14 md:h-16 rounded-full bg-[#0F172A] group-hover:bg-black text-white font-[900] uppercase text-[11px] tracking-[0.15em] transition-all active:scale-95 flex items-center justify-between px-8 shadow-xl">
            <span>Start Preparation</span>
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
