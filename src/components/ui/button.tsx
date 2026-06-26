import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-xl border-none",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-lg border-none",
        outline:
          "border-2 border-slate-200 bg-white text-[#0F172A] hover:bg-slate-50 hover:border-slate-300 shadow-sm",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 border-none",
        ghost: "hover:bg-slate-50 text-slate-500 hover:text-[#0F172A]",
        link: "text-blue-600 underline-offset-4 hover:underline",
        dark: "bg-[#0B1528] text-white hover:bg-black shadow-2xl border-none",
        emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl border-none",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-sm",
        lg: "h-[clamp(48px,5vw,56px)] px-10 text-[15px] md:text-lg",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }