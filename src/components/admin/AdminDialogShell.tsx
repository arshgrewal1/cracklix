"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface AdminDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saveLabel?: string;
  saveIcon?: ReactNode;
  accentColor?: string;
  maxWidth?: string;
  children: ReactNode;
}

/**
 * Shared dialog shell for admin CRUD forms with consistent layout:
 * accent bar, header, scrollable content area, and footer with discard/save buttons.
 */
export function AdminDialogShell({
  open,
  onOpenChange,
  title,
  description,
  isSaving,
  onSave,
  onDiscard,
  saveLabel = "Commit",
  saveIcon,
  accentColor = "bg-primary",
  maxWidth = "sm:max-w-xl",
  children,
}: AdminDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isSaving && onOpenChange(o)}>
      <DialogContent
        className={`${maxWidth} w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col`}
      >
        <div className={`h-2 w-full ${accentColor} shrink-0`} />
        <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
          <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
        <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4 shrink-0">
          <Button
            variant="ghost"
            onClick={onDiscard}
            className="h-11 md:h-12 px-6 font-black uppercase text-[10px] text-slate-400"
          >
            Discard
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 h-11 md:h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-full shadow-xl border-none active:scale-95 gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              saveIcon || <Save className="h-4 w-4" />
            )}
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
