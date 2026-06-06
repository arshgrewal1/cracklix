
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
 * @file Overview Institutional High-Visibility Timer Node.
 * Hardened: Background #0F172A, White Digits, 24px Bold.
 * Mobile: Responsive padding and scale.
 */

export default function Timer({ onTimeUp, initialSeconds, onTick, isPaused }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const onTickRef = useRef(onTick)
  const hasSubmitted = useRef(false)

  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  useEffect(() => {
    if (onTickRef.current && !isPaused) {
      onTickRef.current(timeLeft)
    }
  }, [timeLeft, isPaused])

  useEffect(() => {
    if (isPaused) {
       if (timerRef.current) clearInterval(timerRef.current)
       return
    }

    if (timeLeft <= 0 && !hasSubmitted.current) {
      hasSubmitted.current = true
      onTimeUp()
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft, onTimeUp, isPaused])

  const formatTime = (seconds: number) => {
    const safeSecs = Math.max(0, seconds)
    const h = Math.floor(safeSecs / 3600)
    const m = Math.floor((safeSecs % 3600) / 60)
    const s = safeSecs % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isLowTime = timeLeft < 600

  return (
    <div className={cn(
      "flex items-center gap-2 md:gap-4 px-3 md:px-6 h-10 md:h-14 rounded-xl md:rounded-2xl font-bold transition-all duration-500 tabular-nums shadow-2xl border hover:shadow-primary/5",
      isLowTime ? "bg-rose-600 border-rose-500 text-white animate-pulse" : "bg-[#0F172A] border-white/15 text-white"
    )}>
      <Clock className={cn("h-3.5 w-3.5 md:h-5 md:w-5", isLowTime ? "text-white" : "text-[#F97316]")} />
      <span className="text-[14px] md:text-[24px] font-[700] tracking-widest leading-none text-white">{formatTime(timeLeft)}</span>
    </div>
  )
}
