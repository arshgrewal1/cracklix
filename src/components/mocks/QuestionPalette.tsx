
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface QuestionPaletteProps {
  totalQuestions: number
  currentIndex: number
  answeredIndices: number[]
  flaggedIndices: number[]
  onSelect: (index: number) => void
}

export default function QuestionPalette({
  totalQuestions,
  currentIndex,
  answeredIndices,
  flaggedIndices,
  onSelect
}: QuestionPaletteProps) {
  const PAGE_SIZE = 25
  const totalPages = Math.ceil(totalQuestions / PAGE_SIZE)
  
  // Automatically sync page with current index
  const initialPage = Math.floor(currentIndex / PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState(initialPage)

  const startIdx = currentPage * PAGE_SIZE
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalQuestions)
  const currentQuestions = Array.from({ length: endIdx - startIdx }, (_, i) => startIdx + i)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
         <div className="flex items-center justify-between">
            <h3 className="font-headline font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
               Audit Palette
            </h3>
            <span className="text-[9px] font-black text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
               {answeredIndices.length} / {totalQuestions}
            </span>
         </div>

         {/* Pagination Controls - Institutional Style */}
         <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button 
               onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
               disabled={currentPage === 0}
               className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white disabled:opacity-20 transition-all shadow-sm"
            >
               <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 text-center">
               <p className="text-[9px] font-black uppercase tracking-widest text-[#0F172A]">
                  Node Range {startIdx + 1} — {endIdx}
               </p>
            </div>
            <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
               disabled={currentPage === totalPages - 1}
               className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white disabled:opacity-20 transition-all shadow-sm"
            >
               <ChevronRight className="h-4 w-4" />
            </button>
         </div>
      </div>
      
      {/* Dense 5-column grid for high node visibility */}
      <div className="grid grid-cols-5 gap-2.5">
        {currentQuestions.map((idx) => {
          const isCurrent = currentIndex === idx
          const isAnswered = answeredIndices.includes(idx)
          const isFlagged = flaggedIndices.includes(idx)

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={cn(
                "h-10 w-10 rounded-lg text-[10px] font-black transition-all duration-200 border-2 flex items-center justify-center shadow-sm",
                isCurrent && "border-primary bg-primary/10 text-primary scale-110 z-10",
                !isCurrent && isAnswered && "bg-emerald-600 border-emerald-600 text-white",
                !isCurrent && isFlagged && "bg-amber-500 border-amber-500 text-white",
                !isCurrent && !isAnswered && !isFlagged && "bg-white border-slate-100 hover:border-slate-300 text-slate-400"
              )}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-y-3 gap-x-4">
        <LegendItem variant="current" label="Current" />
        <LegendItem variant="answered" label="Answered" />
        <LegendItem variant="flagged" label="Review" />
        <LegendItem variant="remaining" label="Not Visited" />
      </div>
    </div>
  )
}

function LegendItem({ variant, label }: { variant: 'current' | 'answered' | 'flagged' | 'remaining', label: string }) {
  const getStyles = () => {
    switch (variant) {
      case 'current': return "bg-primary/10 border-primary"
      case 'answered': return "bg-emerald-600"
      case 'flagged': return "bg-amber-500"
      case 'remaining': return "bg-white border-slate-100"
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("h-2.5 w-2.5 rounded-sm border shadow-sm", getStyles())} />
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}
