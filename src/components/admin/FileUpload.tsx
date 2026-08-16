'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';

interface FileUploadProps {
  label: string;
  folder: string;
  accept?: string;
  maxSizeMB?: number;
  value?: string;
  onChange: (meta: any | null) => void;
  className?: string;
  variant?: 'compact' | 'full';
  // Additional fields for the backend registry
  metadata?: {
    title?: string;
    boardId?: string;
    examId?: string;
    subjectId?: string;
    category?: string;
    isFree?: boolean;
  };
}

/**
 * @fileOverview Institutional Backend Ingestion Hub v4.0.
 * FIXED: Uses XMLHttpRequest for real-time progress tracking to a dedicated backend API.
 */
export default function FileUpload({
  label,
  accept = "application/pdf",
  maxSizeMB = 50,
  value,
  onChange,
  className,
  variant = 'full',
  metadata
}: FileUploadProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'VERIFIED' | 'ERROR'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!auth?.currentUser) {
      toast({ variant: "destructive", title: "Auth Required", description: "Identity node missing." });
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`File too large (Max ${maxSizeMB}MB)`);
      setStatus('ERROR');
      return;
    }

    setStatus('UPLOADING');
    setProgress(0);
    setErrorMessage(null);

    try {
      const idToken = await auth.currentUser.getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      
      // Inject registry metadata
      if (metadata) {
        Object.entries(metadata).forEach(([key, val]) => {
          formData.append(key, String(val));
        });
      }

      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
          if (percent === 100) setStatus('PROCESSING');
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setStatus('VERIFIED');
          onChange(response); // Pass response containing docId and url
          toast({ title: "Document Verified", description: "Registry synchronized successfully." });
        } else {
          const err = JSON.parse(xhr.responseText || '{"message":"Unknown error"}');
          setErrorMessage(err.message || "Ingestion failed.");
          setStatus('ERROR');
        }
      };

      xhr.onerror = () => {
        setErrorMessage("Network connection interrupted.");
        setStatus('ERROR');
      };

      xhr.open('POST', '/api/study-materials/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
      xhr.send(formData);

    } catch (err: any) {
      setErrorMessage(err.message || "Upload protocol failure.");
      setStatus('ERROR');
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setStatus('IDLE');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("space-y-3 w-full text-left", className)}>
      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">
        {label}
      </label>

      <div 
        onClick={() => status === 'IDLE' && fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-[2rem] transition-all duration-500 overflow-hidden",
          status === 'UPLOADING' || status === 'PROCESSING' ? "bg-slate-50 border-primary/20 cursor-wait" : "bg-white hover:bg-slate-50 border-slate-100 hover:border-primary/30 cursor-pointer",
          status === 'VERIFIED' || value ? "border-emerald-200 bg-emerald-50/10" : "",
          status === 'ERROR' ? "border-rose-200 bg-rose-50/10" : "",
          variant === 'compact' ? "h-32" : "h-52"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={accept} 
          onChange={onFileChange} 
          disabled={status === 'UPLOADING' || status === 'PROCESSING'}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
          {status === 'UPLOADING' ? (
            <div className="w-full max-w-[240px] space-y-5 animate-in fade-in zoom-in-95">
              <div className="relative h-14 w-14 mx-auto">
                 <Loader2 className="h-14 w-14 text-primary animate-spin" />
                 <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary tabular-nums">
                   {progress}%
                 </span>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase text-primary tracking-widest animate-pulse">Uploading PDF Hub</p>
                 <Progress value={progress} className="h-1.5 bg-primary/10" />
              </div>
            </div>
          ) : status === 'PROCESSING' ? (
            <div className="flex flex-col items-center gap-4 animate-in fade-in">
               <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Zap className="h-7 w-7 animate-pulse fill-current" />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[#0F172A] tracking-widest">Finalizing Registry</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Synchronizing cloud nodes...</p>
               </div>
            </div>
          ) : (status === 'VERIFIED' || value) ? (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center space-y-4">
              <div className="h-16 w-16 md:h-20 md:w-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner border border-emerald-100">
                <FileText className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Registry Ready
                 </div>
                 <div className="flex items-center justify-center gap-4">
                    <button onClick={clearFile} className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase underline tracking-tighter cursor-pointer border-none bg-transparent">Discard node</button>
                    {(value || status === 'VERIFIED') && (
                       <a href={value} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-600 uppercase underline tracking-tighter flex items-center gap-1">
                          <Eye className="h-2.5 w-2.5" /> View original
                       </a>
                    )}
                 </div>
              </div>
            </div>
          ) : status === 'ERROR' ? (
             <div className="space-y-4">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                <div className="space-y-1">
                   <p className="text-sm font-black text-rose-600 uppercase">Ingestion Failed</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase">{errorMessage}</p>
                </div>
                <Button onClick={() => setStatus('IDLE')} variant="ghost" className="text-[9px] font-black uppercase text-primary">Retry sequence</Button>
             </div>
          ) : (
            <div className="space-y-6">
              <div className="h-14 w-14 md:h-20 md:w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300 shadow-inner group-hover:scale-105 transition-transform border border-slate-100">
                <Upload className="h-7 w-7 md:h-10 md:w-10" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight">Select Preparation PDF</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                   Max {maxSizeMB}MB • PDF Only
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
