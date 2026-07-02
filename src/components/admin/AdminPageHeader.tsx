"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface AdminPageHeaderProps {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  actionHref?: string;
  children?: ReactNode;
}

/**
 * Shared admin page header with consistent layout:
 * icon label, title, subtitle, and an action button.
 */
export function AdminPageHeader({
  icon: Icon,
  iconClassName = "text-primary",
  label,
  title,
  subtitle,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  actionHref,
  children,
}: AdminPageHeaderProps) {
  const buttonContent = (
    <>
      {ActionIcon && <ActionIcon className="h-4 w-4" />}
      {actionLabel}
    </>
  );

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`h-4 w-4 ${iconClassName}`} />
          <span className="text-[9px] font-black tracking-[0.1em] text-slate-400">
            {label}
          </span>
        </div>
        <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">
          {title}
        </h1>
        <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">
          {subtitle}
        </p>
      </div>
      {children || (actionLabel && (
        actionHref ? (
          <Button
            asChild
            className="w-full md:w-auto h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3"
          >
            <a href={actionHref}>{buttonContent}</a>
          </Button>
        ) : (
          <Button
            onClick={onAction}
            className="w-full md:w-auto h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3"
          >
            {buttonContent}
          </Button>
        )
      ))}
    </div>
  );
}
