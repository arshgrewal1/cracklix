
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
 * @fileOverview Testbook-Style Official Exam Palette.
 * States: 
 * 1. Current (Blue)
 * 2. Answered (Green)
 * 3. Not Answered (Red)
 * 4. Marked for Review (Orange)
 * 5. Not Visited (Gray)
 * 6. Answered & Marked for Review (Purple)
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

  const summary = useMemo(() => ({
    answered: answeredIndices.length,
    notAnswered: visitedIndices.length - answeredIndices.length,
    marked: flaggedIndices.length,
    notVisited: totalQuestions - visitedIndices.length
  }), [totalQuestions, answeredIndices, flaggedIndices, visitedIndices])

  return (
    <div className="space-y-10 flex flex-col h-full text-left">
      {/* Live Stats Summary */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
         <SummaryNode count={summary.answered} label="Answered" color="bg-emerald-600" />
         <SummaryNode count={summary.marked} label="Review" color="bg-amber-500" />
         <SummaryNode count={summary.notVisited} label="Not Visited" color="bg-slate-100" textColor="text-slate-400" />
         <SummaryNode count={summary.notAnswered} label="Not Answered" color="bg-rose-500" />
      </div>

      <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
         <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100 shrink-0 shadow-inner">
            <button 
               onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
               disabled={currentPage === 0}
               className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-white disabled:opacity-20 transition-all shadow-sm"
            >
               <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="text-[10px] font-black uppercase text-[#0F172A] tracking-[0.2em]">
               Nodes {startIdx + 1} - {endIdx}
            </p>
            <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
               disabled={currentPage === totalPages - 1}
               className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-white disabled:opacity-20 transition-all shadow-sm"
            >
               <ChevronRight className="h-5 w-5" />
            </button>
         </div>

         <div className="grid grid-cols-5 gap-3 pb-8">
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
                        "h-11 w-11 rounded-xl text-[11px] font-black transition-all border flex items-center justify-center relative",
                        isCurrent ? "bg-blue-600 border-blue-600 text-white z-10 shadow-2xl scale-110" : "border-transparent",
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

         {/* Official Legend */}
         <div className="pt-8 mt-auto border-t border-slate-100 space-y-3">
            <LegendRow color="bg-emerald-600" label="Answered" />
            <LegendRow color="bg-rose-500" label="Not Answered" />
            <LegendRow color="bg-amber-500" label="Marked for Review" />
            <LegendRow color="bg-slate-100" label="Not Visited" />
            <LegendRow color="bg-purple-600" label="Answered & Review" />
         </div>
      </div>
    </div>
  )
}

function SummaryNode({ count, label, color, textColor, className }: any) {
  return (
    <div className={cn("p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-4 shadow-sm", className)}>
       <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white shadow-xl", color, textColor)}>
          {count}
       </div>
       <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
    </div>
  )
}

function LegendRow({ color, label }: any) {
  return (
    <div className="flex items-center gap-3">
       <div className={cn("h-4 w-4 rounded-md shadow-sm shrink-0", color)} />
       <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">{label}</span>
    </div>
  )
}
