
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "flex h-11 w-full items-center justify-between px-4 rounded-xl cursor-pointer transition-all active:scale-[0.98]",
        "bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {theme === "dark" ? (
          <Moon className="h-5 w-5 text-primary" />
        ) : (
          <Sun className="h-5 w-5 text-amber-500" />
        )}
        <span className="font-bold text-[15px] tracking-tight">
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </span>
      </div>
      <div className={cn(
        "w-10 h-5 rounded-full relative transition-colors duration-300",
        theme === "dark" ? "bg-primary" : "bg-slate-200"
      )}>
        <div className={cn(
          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
          theme === "dark" ? "left-6" : "left-1"
        )} />
      </div>
    </div>
  )
}
