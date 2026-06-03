
"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface QuestionPaletteProps {
  totalQuestions: number
  currentIndex: number
  answeredIndices: number[]
  flaggedIndices: number[]
  visitedIndices: number[]
  onSelect: (index: number) => void
  questions: any[]
}

/**
 * @fileOverview Refined 25-Node CBT Palette.
 * Strict 5x5 grid with official range selection and progress summaries.
 */

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
  }, [currentIndex, totalQuestions])

  const startIdx = currentPage * PAGE_SIZE
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalQuestions)
  const currentRange = Array.from({ length: endIdx - startIdx }, (_, i) => startIdx + i)

  const summary = useMemo(() => {
    const answeredCount = answeredIndices.length
    const reviewCount = flaggedIndices.length
    const visitedCount = visitedIndices.length
    
    return {
      answered: answeredCount,
      marked: reviewCount,
      notVisited: totalQuestions - visitedCount,
      notAnswered: visitedCount - answeredCount
    }
  }, [totalQuestions, answeredIndices, flaggedIndices, visitedIndices])

  return (
    <div className="space-y-6 flex flex-col h-full text-left overflow-hidden">
      {/* Live Stats Summary Grid */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
         <SummaryBox count={summary.answered} label="Answered" color="bg-emerald-600" />
         <SummaryBox count={summary.marked} label="Review" color="bg-amber-500" />
         <SummaryBox count={summary.notAnswered} label="Not Ans" color="bg-rose-500" />
         <SummaryBox count={summary.notVisited} label="Not Vis" color="bg-slate-100" textColor="text-slate-400" />
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
         {/* Institutional Range Selector */}
         <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 shrink-0">
            <button 
               onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
               disabled={currentPage === 0}
               className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-white disabled:opacity-10 transition-all"
            >
               <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="text-[10px] font-black uppercase text-[#0B1528] tracking-widest">
               Questions {startIdx + 1} - {endIdx}
            </p>
            <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
               disabled={currentPage === totalPages - 1}
               className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-white disabled:opacity-10 transition-all"
            >
               <ChevronRight className="h-5 w-5" />
            </button>
         </div>

         {/* 5x5 Grid Protocol */}
         <div className="grid grid-cols-5 gap-2 px-1">
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
                        "h-11 w-11 rounded-xl text-[11px] font-black transition-all border flex items-center justify-center",
                        isCurrent ? "bg-blue-600 border-blue-600 text-white z-10 shadow-xl scale-110" : "border-transparent",
                        !isCurrent && isBoth && "bg-purple-600 text-white",
                        !isCurrent && isAnswered && !isFlagged && "bg-emerald-600 text-white",
                        !isCurrent && isFlagged && !isAnswered && "bg-amber-500 text-white",
                        !isCurrent && isVisited && !isAnswered && !isFlagged && "bg-rose-500 text-white",
                        !isCurrent && !isVisited && "bg-slate-100 text-slate-400"
                     )}
                  >
                     {idx + 1}
                  </button>
               )
            })}
         </div>

         {/* High-Fidelity Legend */}
         <div className="pt-6 border-t border-slate-100 space-y-2.5">
            <LegendRow color="bg-emerald-600" label="Answered" />
            <LegendRow color="bg-rose-500" label="Not Answered" />
            <LegendRow color="bg-amber-500" label="Marked for Review" />
            <LegendRow color="bg-purple-600" label="Answered & Review" />
            <LegendRow color="bg-slate-100" label="Not Visited" />
         </div>
      </div>
    </div>
  )
}

function SummaryBox({ count, label, color, textColor }: any) {
  return (
    <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center gap-3 shadow-sm">
       <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white", color, textColor)}>
          {count}
       </div>
       <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
    </div>
  )
}

function LegendRow({ color, label }: any) {
  return (
    <div className="flex items-center gap-3">
       <div className={cn("h-3 w-3 rounded-md shrink-0", color)} />
       <span className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.1em]">{label}</span>
    </div>
  )
}
