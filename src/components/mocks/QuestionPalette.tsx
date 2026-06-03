
"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, HelpCircle, AlertCircle } from "lucide-react"

interface QuestionPaletteProps {
  totalQuestions: number
  currentIndex: number
  answeredIndices: number[]
  flaggedIndices: number[]
  visitedIndices: number[]
  onSelect: (index: number) => void
}

export default function QuestionPalette({
  totalQuestions,
  currentIndex,
  answeredIndices,
  flaggedIndices,
  visitedIndices,
  onSelect
}: QuestionPaletteProps) {
  const PAGE_SIZE = 25
  const totalPages = Math.ceil(totalQuestions / PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const targetPage = Math.floor(currentIndex / PAGE_SIZE)
    if (targetPage !== currentPage) setCurrentPage(targetPage)
  }, [currentIndex, totalQuestions, currentPage])

  const startIdx = currentPage * PAGE_SIZE
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalQuestions)
  const currentRange = Array.from({ length: endIdx - startIdx }, (_, i) => startIdx + i)

  const summary = useMemo(() => {
    const answered = answeredIndices.length
    const review = flaggedIndices.length
    const visited = visitedIndices.length
    const answeredAndReview = flaggedIndices.filter(idx => answeredIndices.includes(idx)).length
    
    return {
      answered: answered - answeredAndReview,
      review: review - answeredAndReview,
      notVisited: totalQuestions - visited,
      notAnswered: visited - answered,
      answeredAndReview
    }
  }, [totalQuestions, answeredIndices, flaggedIndices, visitedIndices])

  return (
    <div className="space-y-6 flex flex-col h-full text-left">
      {/* Stats Legend Grid */}
      <div className="grid grid-cols-2 gap-2">
         <PaletteStat count={summary.answered} label="Answered" color="bg-emerald-600" />
         <PaletteStat count={summary.notAnswered} label="Not Answered" color="bg-rose-500" />
         <PaletteStat count={summary.notVisited} label="Not Visited" color="bg-slate-100" textColor="text-slate-500" />
         <PaletteStat count={summary.review} label="Review" color="bg-amber-500" />
         <PaletteStat count={summary.answeredAndReview} label="Ans & Review" color="bg-purple-600" />
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
         <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question Palette</h4>
            <div className="flex gap-2">
               <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-1 hover:bg-slate-100 rounded disabled:opacity-10"><ChevronLeft className="h-4 w-4" /></button>
               <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="p-1 hover:bg-slate-100 rounded disabled:opacity-10"><ChevronRight className="h-4 w-4" /></button>
            </div>
         </div>

         <div className="grid grid-cols-5 gap-2 pb-6">
            {currentRange.map((idx) => {
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
                        "h-10 w-10 rounded-lg text-xs font-black transition-all border flex items-center justify-center relative",
                        isCurrent ? "ring-2 ring-blue-600 ring-offset-2 scale-110 z-10" : "",
                        !isCurrent && isBoth && "bg-purple-600 text-white border-purple-600",
                        !isCurrent && isAnswered && !isFlagged && "bg-emerald-600 text-white border-emerald-600",
                        !isCurrent && isFlagged && !isAnswered && "bg-amber-500 text-white border-amber-500",
                        !isCurrent && isVisited && !isAnswered && !isFlagged && "bg-rose-500 text-white border-rose-500",
                        !isCurrent && !isVisited && "bg-slate-100 text-slate-400 border-transparent",
                        isCurrent && !isVisited && "bg-white border-blue-600 text-blue-600"
                     )}
                  >
                     {idx + 1}
                  </button>
               )
            })}
         </div>
      </div>
    </div>
  )
}

function PaletteStat({ count, label, color, textColor = "text-white" }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-white shadow-sm">
       <div className={cn("h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0", color, textColor)}>
          {count}
       </div>
       <span className="text-[8px] font-black uppercase text-slate-400 leading-none">{label}</span>
    </div>
  )
}
