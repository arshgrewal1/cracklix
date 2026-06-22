import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthorityLogo } from "@/lib/exam-icons"
import { Badge } from "@/components/ui/badge"
import { Exam } from "@/types"

interface ExamCardProps {
  exam: Exam 
}

/**
 * @fileOverview Refined Exam Card v5.0 (Type Hardened).
 */
export default function ExamCard({ exam }: ExamCardProps) {
  const examName = exam.name || exam.title || "Official Vertical";
  
  return (
    <Link href={`/exams/${exam.id}`}>
      <Card className="bg-white border border-[#E5E7EB] shadow-sm hover:shadow-2xl transition-all duration-500 group rounded-[3rem] overflow-hidden h-full flex flex-col">
        <CardContent className="p-8 md:p-12 flex flex-col h-full text-left">
          <div className="flex justify-between items-start mb-8 md:mb-10">
            <AuthorityLogo boardId={exam.boardId} size="xl" className="bg-slate-50 rounded-[2rem] group-hover:scale-105 transition-transform" />
            <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm">
              {(exam.boardId || 'OFFICIAL').toUpperCase()} HUB
            </Badge>
          </div>
          
          <div className="flex-1 space-y-6">
            <h3 className="font-headline text-2xl md:text-3xl font-black text-[#0B1F3A] group-hover:text-primary transition-colors leading-tight">
              {examName}
            </h3>
            
            <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">
              {exam.description || "Official preparation vertical verified by institutional patterns."}
            </p>

            <div className="flex flex-wrap gap-2.5">
               <AvailabilityBadge label="Mock Tests" emoji="📚" />
               <AvailabilityBadge label="PYQ Papers" emoji="📝" />
               <AvailabilityBadge label="Bilingual" emoji="🌐" />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-50">
            <Button className="w-full h-14 md:h-16 rounded-2xl bg-[#0F172A] hover:bg-primary text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-xl border-none transition-all active:scale-95 gap-3">
               Open Exam <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function AvailabilityBadge({ label, emoji }: { label: string, emoji: string }) {
   return (
      <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[#0F172A] text-[9px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-2">
         <span className="text-xs">{emoji}</span>
         {label}
      </Badge>
   )
}