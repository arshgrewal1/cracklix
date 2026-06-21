import { Exam } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BookOpen, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthorityLogo } from "@/lib/exam-icons"

interface ExamCardProps {
  exam: any // Using any for flexible hydration variants
}

/**
 * @fileOverview Refined Exam Card v3.0 (Auto-Inheritance).
 * FIXED: Inherits and displays parent Board Logo automatically using the Authority Resolver.
 */
export default function ExamCard({ exam }: ExamCardProps) {
  return (
    <Link href={`/exams/${exam.id}`}>
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group rounded-[2.5rem] overflow-hidden h-full flex flex-col">
        <CardContent className="p-8 flex flex-col h-full text-left">
          <div className="flex justify-between items-start mb-8">
            <AuthorityLogo boardId={exam.boardId} size="md" className="bg-slate-50 rounded-xl" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded border border-blue-100">
              {(exam.boardId || 'OFFICIAL').toUpperCase()}
            </span>
          </div>
          
          <h3 className="font-headline text-2xl font-black mb-4 text-[#0B1F3A] group-hover:text-primary transition-colors uppercase">
            {exam.name}
          </h3>
          
          <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2 mb-8">
            {exam.description || "Official preparation vertical verified by institutional patterns."}
          </p>

          <div className="mt-auto space-y-4 pt-8 border-t border-gray-50">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
              <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> Duration</span>
              <span className="text-[#0B1F3A]">{exam.duration || 120} Min</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
              <span className="flex items-center gap-2"><BookOpen className="h-3 w-3" /> Total Items</span>
              <span className="text-[#0B1F3A]">{exam.totalQuestions || 100}+</span>
            </div>
            <div className="pt-4">
              <Button variant="ghost" className="w-full justify-between p-0 font-black uppercase tracking-widest text-[10px] text-primary hover:bg-transparent group-hover:translate-x-1 transition-transform">
                Open Exam <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
