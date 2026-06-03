
"use client"

import { useEffect, useState, useRef } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimerProps {
  onTimeUp: () => void
  initialSeconds: number
  onTick?: (seconds: number) => void
  isPaused?: boolean
}

/**
 * @fileOverview Institutional Timer Node.
 * Features: High-contrast blinking during last 10 minutes.
 */

export default function Timer({ onTimeUp, initialSeconds, onTick, isPaused }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setTimeLeft(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (isPaused) {
       if (timerRef.current) clearInterval(timerRef.current)
       return
    }

    if (timeLeft <= 0) {
      onTimeUp()
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        if (onTick) onTick(next)
        return next
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft, onTimeUp, onTick, isPaused])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isLowTime = timeLeft < 600 // 10 minutes warning

  return (
    <div className={cn(
      "flex items-center gap-3 px-5 py-2 rounded-xl font-black text-base border transition-all duration-500 tabular-nums shadow-xl",
      isLowTime ? "bg-rose-600 border-rose-500 text-white animate-pulse" : "bg-white/5 border-white/10 text-white"
    )}>
      <Clock className={cn("h-4 w-4", isLowTime ? "text-white" : "text-primary")} />
      <span className="tracking-[0.1em]">{formatTime(timeLeft)}</span>
    </div>
  )
}
