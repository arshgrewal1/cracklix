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

export default function Timer({ onTimeUp, initialSeconds, onTick, isPaused }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasSubmitted = useRef(false)

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
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isLowTime = timeLeft < 600

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 h-8 rounded-lg font-bold transition-all tabular-nums border",
      isLowTime ? "bg-rose-600 border-rose-500 text-white animate-pulse" : "bg-[#0F172A] border-white/10 text-white"
    )}>
      <Clock className={cn("h-3.5 w-3.5", isLowTime ? "text-white" : "text-primary")} />
      <span className="text-[14px] md:text-[18px] font-black tracking-widest leading-none">{formatTime(timeLeft)}</span>
    </div>
  )
}