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
 * @fileOverview Exam Card Component v6.0.
 * FIXED: Corrected property access to align with canonical types and resolved build errors.
 */
export default function ExamCard({ exam }: ExamCardProps) {
  const examName = exam.name || "Official Vertical"
  const examDescription = exam.description || "Official preparation vertical verified by institutional patterns."
  const totalMocksCount = exam.totalMocks ?? 0
  const activeQuestionsCount = exam.activeQuestions ?? 0

  return (
    <Link href={`/exams/view?id=${exam.id}`}>
      <Card className="bg-white border border-[#E5E7EB] shadow-sm hover:shadow-2xl transition-all duration-500 group rounded-[3rem] overflow-hidden h-full flex flex-col">
        <CardContent className="p-8 md:p-12 flex flex-col h-full text-left">
          <div className="flex justify-between items-start mb-8 md:mb-10">
            <AuthorityLogo boardId={exam.boardId} size="md" className="bg-slate-50 rounded-xl group-hover:scale-105 transition-transform" />
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm">
                {(exam.boardId || "Official").toUpperCase()} HUB
              </Badge>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h3 className="font-headline text-2xl md:text-3xl font-black text-[#0B1F3A] group-hover:text-primary transition-colors leading-tight">
              {examName}
            </h3>

            <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">
              {examDescription}
            </p>

            <div className="flex flex-wrap gap-2.5">
              <AvailabilityBadge label={`${totalMocksCount} Mocks`} emoji="📚" />
              <AvailabilityBadge label={`${activeQuestionsCount} Questions`} emoji="📝" />
              <AvailabilityBadge label="Bilingual" emoji="🌐" />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-50">
            <div className="w-full h-14 md:h-16 rounded-2xl bg-[#0F172A] hover:bg-primary text-white font-bold text-sm shadow-xl border-none transition-all active:scale-95 flex items-center justify-center">
              Open Exam <ChevronRight className="h-4 w-4 ml-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function AvailabilityBadge({ label, emoji }: { label: string; emoji: string }) {
  return (
    <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[#0F172A] text-[8px] font-black px-3 py-1.5 rounded-xl flex items-center gap-2 uppercase tracking-widest">
      <span className="text-xs">{emoji}</span>
      {label}
    </Badge>
  )
}