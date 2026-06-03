
"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, CheckCircle2, Flag, HelpCircle, Layers, Bookmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
 * @fileOverview Testbook-Style Paginated Audit Palette.
 * Implements 5 states: Answered, Not Answered, Not Visited, Marked for Review, Answered & Marked for Review.
 */

export default function QuestionPalette({
  totalQuestions,
  currentIndex,
  answeredIndices,
  flaggedIndices,
  visitedIndices,
  onSelect,
  questions
}: QuestionPaletteProps) {
  const PAGE_SIZE = 25
  const totalPages = Math.ceil(totalQuestions / PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const targetPage = Math.floor(currentIndex / PAGE_SIZE)
    if (targetPage !== currentPage) setCurrentPage(targetPage)
  }, [currentIndex, currentPage])

  const startIdx = currentPage * PAGE_SIZE
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalQuestions)
  const currentRange = Array.from({ length: endIdx - startIdx }, (_, i) => startIdx + i)

  const summary = useMemo(() => ({
    answered: answeredIndices.length,
    marked: flaggedIndices.filter(idx => !answeredIndices.includes(idx)).length,
    ansAndMarked: flaggedIndices.filter(idx => answeredIndices.includes(idx)).length,
    notAnswered: visitedIndices.length - answeredIndices.length,
    notVisited: totalQuestions - visitedIndices.length
  }), [totalQuestions, answeredIndices, flaggedIndices, visitedIndices])

  return (
    <div className="space-y-10 flex flex-col h-full">
      {/* Exam Summary Drawer */}
      <div className="grid grid-cols-2 gap-4 shrink-0">
         <SummaryBox count={summary.answered} label="Answered" color="bg-emerald-600" />
         <SummaryBox count={summary.notAnswered} label="Not Answered" color="bg-rose-500" />
         <SummaryBox count={summary.notVisited} label="Not Visited" color="bg-slate-100" textColor="text-slate-400" />
         <SummaryBox count={summary.marked} label="Marked Review" color="bg-amber-500" />
         <SummaryBox count={summary.ansAndMarked} label="Ans & Marked" color="bg-purple-600" className="col-span-2" />
      </div>

      <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
         <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <h3 className="font-headline font-black text-xs uppercase tracking-[0.2em] text-[#0F172A]">
               Audit Palette
            </h3>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">P. {currentPage + 1} / {totalPages}</span>
         </div>

         {/* Range Selector */}
         <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button 
               onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
               disabled={currentPage === 0}
               className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-white disabled:opacity-20 transition-all shadow-sm"
            >
               <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">
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

         {/* Question Grid */}
         <div className="grid grid-cols-5 gap-3 pb-8 overflow-y-auto custom-scrollbar">
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
                        "h-11 w-11 rounded-xl text-[11px] font-black transition-all border-2 flex items-center justify-center shadow-sm relative",
                        isCurrent ? "border-[#0F172A] bg-primary text-white scale-110 z-10 shadow-lg shadow-primary/20" : "border-transparent",
                        !isCurrent && isBoth && "bg-purple-600 text-white",
                        !isCurrent && isAnswered && !isFlagged && "bg-emerald-600 text-white",
                        !isCurrent && isFlagged && !isAnswered && "bg-amber-500 text-white",
                        !isCurrent && isVisited && !isAnswered && !isFlagged && "bg-rose-500 text-white",
                        !isCurrent && !isVisited && "bg-slate-100 text-slate-300"
                     )}
                  >
                     {idx + 1}
                  </button>
               )
            })}
         </div>

         {/* Legend (Institutional Standards) */}
         <div className="pt-8 mt-auto border-t border-slate-50 space-y-3">
            <LegendRow color="bg-emerald-600" label="Answered" />
            <LegendRow color="bg-rose-500" label="Not Answered" />
            <LegendRow color="bg-amber-500" label="Marked for Review" />
            <LegendRow color="bg-slate-100" label="Not Visited" />
            <LegendRow color="bg-purple-600" label="Answered & Marked Review" />
         </div>
      </div>
    </div>
  )
}

function SummaryBox({ count, label, color, textColor, className }: any) {
  return (
    <div className={cn("p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm", className)}>
       <div className={cn("h-7 w-7 rounded-lg mb-2 flex items-center justify-center text-xs font-black text-white shadow-lg", color, textColor)}>
          {count}
       </div>
       <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">{label}</span>
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
