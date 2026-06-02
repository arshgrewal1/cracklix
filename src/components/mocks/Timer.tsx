
"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimerProps {
  initialMinutes: number
  onTimeUp: () => void
  initialSeconds?: number
}

export default function Timer({ initialMinutes, onTimeUp, initialSeconds }: TimerProps) {
  // Use initialSeconds (remainingTime from session) if available, else fallback to initialMinutes
  const [timeLeft, setTimeLeft] = useState(initialSeconds && initialSeconds > 0 ? initialSeconds : initialMinutes * 60)

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTimeUp])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isLowTime = timeLeft < (initialMinutes * 0.1 * 60)

  return (
    <div className={cn(
      "flex items-center gap-3 px-6 py-2 rounded-2xl font-headline font-black text-lg border-2 transition-all duration-300 shadow-lg",
      isLowTime ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-white/5 border-white/10 text-white"
    )}>
      <Clock className={cn("h-5 w-5", isLowTime ? "text-red-500" : "text-primary")} />
      <span className="tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
    </div>
  )
}
