'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  FileArchive,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { storageService, StorageFolder, FileMetadata } from '@/lib/storage-service';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  label: string;
  folder: StorageFolder;
  accept?: string;
  maxSizeMB?: number;
  value?: string | FileMetadata;
  onChange: (data: FileMetadata | null) => void;
  className?: string;
  variant?: 'compact' | 'full';
}

/**
 * @fileOverview Institutional File Ingestion Hub v3.0 [PDF Fixed].
 * FIXED: Implemented precise state tracking to prevent "0% Sync" stalls.
 */
export default function FileUpload({
  label,
  folder,
  accept = "image/*,application/pdf",
  maxSizeMB = 20,
  value,
  onChange,
  className,
  variant = 'full'
}: FileUploadProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'ERROR'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileUrl = typeof value === 'string' ? value : value?.url;
  const isImage = fileUrl && (fileUrl.includes('.webp') || fileUrl.includes('.png') || fileUrl.includes('.jpg') || fileUrl.includes('.jpeg') || fileUrl.includes('image'));
  const isPdf = fileUrl && (fileUrl.includes('.pdf') || fileUrl.includes('pdf'));

  const validateFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum allowed size is ${maxSizeMB}MB.`;
    }
    const types = accept.split(',').map(t => t.trim());
    const isAccepted = types.some(type => {
      if (type.includes('*')) return file.type.startsWith(type.replace('*', ''));
      return file.type === type;
    });
    if (!isAccepted) return `File type ${file.type} is not authorized for this hub.`;
    return null;
  };

  const handleUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setStatus('ERROR');
      toast({ variant: "destructive", title: "Validation Blocked", description: error });
      return;
    }

    setErrorMessage(null);
    setStatus('UPLOADING');
    setProgress(0);

    try {
      const metadata = await storageService.uploadFile(file, folder, (p) => {
        setProgress(p);
        if (p >= 100) setStatus('PROCESSING');
      });
      
      onChange(metadata);
      setStatus('IDLE');
      toast({ title: "Asset Verified", description: "Document successfully synced to Storage." });
    } catch (err: any) {
      setErrorMessage(err.message || "Upload sequence failed.");
      setStatus('ERROR');
      toast({ variant: "destructive", title: "Sync Failure", description: "Check network connectivity and try again." });
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const clearFile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof value === 'object' && value?.path) {
      await storageService.deleteFile(value.path);
    }
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
          fileUrl ? "border-emerald-200 bg-emerald-50/10" : "",
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
          disabled={status !== 'IDLE' && status !== 'ERROR'}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
          {status === 'UPLOADING' ? (
            <div className="w-full max-w-[240px] space-y-5 animate-in fade-in zoom-in-95">
              <div className="relative h-14 w-14 mx-auto">
                 <Loader2 className="h-14 w-14 text-primary animate-spin" />
                 <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary tabular-nums">
                   {Math.round(progress)}%
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
          ) : fileUrl ? (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center space-y-4">
              {isImage ? (
                <div className="relative h-24 w-24 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white mb-2 group/prev">
                  <img src={fileUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-16 w-16 md:h-20 md:w-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner border border-emerald-100">
                  <FileText className="h-8 w-8 md:h-10 md:w-10" />
                </div>
              )}
              
              <div className="space-y-2">
                 <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Registry Ready
                 </div>
                 <div className="flex items-center justify-center gap-4">
                    <button onClick={clearFile} className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase underline tracking-tighter">Discard node</button>
                    {isPdf && (
                       <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-600 uppercase underline tracking-tighter flex items-center gap-1">
                          <Eye className="h-2.5 w-2.5" /> View original
                       </a>
                    )}
                 </div>
              </div>
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
              {status === 'ERROR' && (
                 <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 animate-in slide-in-from-bottom-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase">{errorMessage}</span>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
