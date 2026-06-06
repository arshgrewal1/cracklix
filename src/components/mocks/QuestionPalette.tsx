
"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

interface QuestionPaletteProps {
  questions: any[]
  currentIndex: number
  answeredIndices: number[]
  flaggedIndices: number[]
  visitedIndices: number[]
  onSelect: (index: number) => void
  subjectMap?: Record<string, string>
  examName?: string
}

/**
 * @fileOverview Institutional Audit Matrix v9.0.
 * Redesign: Larger circles, no redundant headers, optimized grid.
 */

export default function QuestionPalette({
  questions,
  currentIndex,
  answeredIndices,
  flaggedIndices,
  visitedIndices,
  onSelect,
  examName = "OFFICIAL SERIES"
}: QuestionPaletteProps) {
  
  const [currentPage, setCurrentPage] = useState(0)
  const PAGE_SIZE = 50 // Increased page size for easier browsing
  const totalQuestions = questions.length
  const totalPages = Math.ceil(totalQuestions / PAGE_SIZE)

  const currentQuestions = useMemo(() => {
    return questions.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE).map((q, i) => ({
        ...q,
        globalIdx: (currentPage * PAGE_SIZE) + i
    }));
  }, [questions, currentPage])

  const summary = useMemo(() => {
    const answered = answeredIndices.length
    const review = flaggedIndices.length
    const visited = visitedIndices.length
    const answeredAndReview = flaggedIndices.filter(idx => answeredIndices.includes(idx)).length
    
    return {
      answered: answered - answeredAndReview,
      review: review - answeredAndReview,
      notVisited: Math.max(0, totalQuestions - visited),
      notAnswered: Math.max(0, visited - answered),
    }
  }, [totalQuestions, answeredIndices, flaggedIndices, visitedIndices])

  return (
    <div className="space-y-6 flex flex-col h-full text-left font-body box-border">
      {/* Responsive Summary */}
      <div className="grid grid-cols-2 gap-2">
         <PaletteStat count={summary.answered} label="Done" color="bg-emerald-600" />
         <PaletteStat count={summary.notAnswered} label="Missed" color="bg-rose-500" />
         <PaletteStat count={summary.review} label="Review" color="bg-amber-500" />
         <PaletteStat count={summary.notVisited} label="Left" color="bg-slate-100" textColor="text-slate-400" />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0">
           {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shrink-0 border",
                  currentPage === i 
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-lg" 
                    : "bg-white text-slate-400 border-slate-100"
                )}
              >
                {i * PAGE_SIZE + 1}-{Math.min((i + 1) * PAGE_SIZE, totalQuestions)}
              </button>
           ))}
        </div>
      )}

      {/* Optimized Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
         <div className="grid grid-cols-5 gap-2.5 w-full">
            {currentQuestions.map((q) => {
              const idx = q.globalIdx;
              const isCurrent = currentIndex === idx
              const isAnswered = answeredIndices.includes(idx)
              const isFlagged = flaggedIndices.includes(idx)
              const isVisited = visitedIndices.includes(idx)
              const isBoth = isAnswered && isFlagged

              return (
                <button
                  key={idx}
                  onClick={() => onSelect(idx)}
                  className={cn(
                    "w-11 h-11 rounded-xl text-[12px] font-black transition-all flex items-center justify-center shrink-0 border-2 box-border",
                    isCurrent ? "border-primary bg-white text-primary shadow-xl ring-4 ring-primary/10 z-10 scale-105" : "border-transparent",
                    !isCurrent && isBoth && "bg-purple-600 text-white",
                    !isCurrent && isAnswered && !isFlagged && "bg-emerald-600 text-white shadow-md",
                    !isCurrent && isFlagged && !isAnswered && "bg-amber-500 text-white shadow-md",
                    !isCurrent && isVisited && !isAnswered && !isFlagged && "bg-rose-500 text-white shadow-md",
                    !isCurrent && !isVisited && "bg-slate-50 text-slate-300 border-slate-100",
                  )}
                >
                  {idx + 1}
                </button>
              )
            })}
         </div>
      </div>
      
      <div className="pt-4 border-t border-slate-50 shrink-0">
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">
            {totalQuestions} Nodes Total
         </p>
      </div>
    </div>
  )
}

function PaletteStat({ count, label, color, textColor = "text-white" }: any) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
       <div className={cn("h-3.5 w-3.5 rounded flex items-center justify-center text-[7px] font-black shrink-0", color, textColor)}>
          {count}
       </div>
       <span className="text-[8px] font-black uppercase text-slate-500 tracking-tight truncate">{label}</span>
    </div>
  )
}
