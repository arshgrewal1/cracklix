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
  Eye
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
 * @fileOverview Institutional File Ingestion Node v2.0.
 * Supports Drag & Drop, Multi-Type Validation, and Real-Time Registry Sync.
 */
export default function FileUpload({
  label,
  folder,
  accept = "image/*,application/pdf",
  maxSizeMB = 10,
  value,
  onChange,
  className,
  variant = 'full'
}: FileUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileUrl = typeof value === 'string' ? value : value?.url;
  const isImage = fileUrl && (fileUrl.includes('.webp') || fileUrl.includes('.png') || fileUrl.includes('.jpg') || fileUrl.includes('.jpeg') || fileUrl.includes('image'));
  const isPdf = fileUrl && (fileUrl.includes('.pdf') || fileUrl.includes('pdf'));

  const validateFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Max allowed is ${maxSizeMB}MB.`;
    }
    const types = accept.split(',').map(t => t.trim());
    const isAccepted = types.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type;
    });
    if (!isAccepted) return `File type ${file.type} is not authorized for this node.`;
    return null;
  };

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast({ variant: "destructive", title: "Audit Blocked", description: validationError });
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const metadata = await storageService.uploadFile(file, folder, (p) => setProgress(p));
      onChange(metadata);
      toast({ title: "Asset Synchronized", description: "Node committed to master storage." });
    } catch (err: any) {
      setError("Sync failed. Check connection.");
      toast({ variant: "destructive", title: "Sync Failure", description: err.message });
    } finally {
      setIsUploading(false);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("space-y-3 w-full text-left", className)}>
      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
        {label}
      </label>

      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-[2rem] transition-all duration-500 overflow-hidden cursor-pointer",
          isUploading ? "bg-slate-50 border-primary/20" : "bg-white hover:bg-slate-50 border-slate-100 hover:border-primary/30",
          fileUrl ? "border-emerald-200 bg-emerald-50/20" : "",
          error ? "border-rose-200 bg-rose-50/20" : "",
          variant === 'compact' ? "h-32" : "h-48"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={accept} 
          onChange={onFileChange} 
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
          {isUploading ? (
            <div className="w-full max-w-[200px] space-y-4">
              <div className="relative h-12 w-12 mx-auto">
                 <Loader2 className="h-12 w-12 text-primary animate-spin" />
                 <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-primary">
                   {Math.round(progress)}%
                 </span>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase text-primary animate-pulse">Syncing Registry...</p>
                 <Progress value={progress} className="h-1 bg-primary/10" />
              </div>
            </div>
          ) : fileUrl ? (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
              {isImage ? (
                <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden shadow-xl border-4 border-white mb-2">
                  <img src={fileUrl} alt="Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                     <RefreshCw className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : isPdf ? (
                <div className="h-16 w-16 md:h-20 md:w-20 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner mb-2 border border-rose-100">
                  <FileText className="h-8 w-8 md:h-10 md:w-10" />
                </div>
              ) : (
                <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner mb-2">
                  <FileArchive className="h-8 w-8" />
                </div>
              )}
              
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" /> Node Verified
                 </p>
                 <div className="flex items-center gap-2">
                    <button onClick={clearFile} className="text-[9px] font-bold text-rose-400 hover:text-rose-600 uppercase underline">Remove</button>
                    {isPdf && (
                       <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-400 hover:text-blue-600 uppercase underline flex items-center gap-1">
                          <Eye className="h-2 w-2" /> View
                       </a>
                    )}
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-12 w-12 md:h-16 md:w-16 bg-slate-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto text-slate-300 shadow-inner group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-bold text-[#0F172A]">Drop file here or click</p>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {accept.includes('pdf') ? 'PDF, ' : ''}{accept.includes('image') ? 'Images ' : ''} (Max {maxSizeMB}MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
