'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, Info, Database, BrainCircuit, Loader2, Sparkles, Zap, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { rationalizeMockQuestion } from '@/ai/flows/rationalize-mock-question';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'bilingual';
  showSolution?: boolean;
}

/**
 * @fileOverview High-Fidelity Question Renderer v4.0.
 * Features: Integrated AI Rationalization Engine and Legacy Field Recovery.
 */

export default function QuestionRenderer({ question, language, showSolution = false }: QuestionRendererProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const showEn = language === 'en' || language === 'bilingual';
  const showPa = language === 'pa' || language === 'bilingual';
  
  // Legacy field mapping for recovered ICT nodes
  const expEn = question.explanationEn || (question as any).explanation || "";
  const expPa = question.explanationPa || "";
  const hasExplanation = !!(expEn || expPa);
  
  const isMissingPa = !question.questionPa || question.questionPa === question.questionEn;

  const handleGenerateAI = async () => {
    if (!db || !question.id) return;
    setIsGenerating(true);
    
    try {
      const result = await rationalizeMockQuestion({
        questionText: question.questionEn || "",
        options: [
          question.optionAEn || "",
          question.optionBEn || "",
          question.optionCEn || "",
          question.optionDEn || ""
        ].filter(Boolean),
        correctAnswer: question.correctAnswer || "A"
      });

      const qRef = doc(db, "questions", question.id);
      await updateDoc(qRef, {
        explanationEn: result.rationalization,
        updatedAt: serverTimestamp()
      });

      toast({ title: "Rationale Synced", description: "AI explanation successfully added to the registry node." });
      // Note: Component will re-render via Firestore stream or manual refresh
    } catch (e: any) {
      toast({ variant: "destructive", title: "AI Node Error", description: "Could not initialize rationalization." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full text-left font-body animate-in fade-in duration-300">
      
      {/* Question Header & Boundary Marker */}
      <div className="flex items-center gap-3 mb-6">
         <Badge className="bg-[#0F172A] text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-lg">
            {question.displayId || 'Q-NODE'}
         </Badge>
         <div className="h-px flex-1 bg-slate-100" />
      </div>

      {/* Reference Context Node (DI/Passage/Image) */}
      {(question.passageEn || question.passagePa || question.imageUrl || (question as any).tableData) && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 space-y-6 shadow-inner">
           <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase text-slate-400">Reference Context</span>
           </div>

           {question.imageUrl && (
             <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center min-h-[150px] shadow-sm">
                <img 
                  src={question.imageUrl} 
                  alt="Audit Asset" 
                  className="max-w-full max-h-[500px] object-contain"
                  loading="lazy"
                />
             </div>
           )}

           {(question as any).tableData && (
             <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="h-10">
                      {(question as any).tableData.headers?.map((header: string, i: number) => (
                        <TableHead key={i} className="text-center font-black uppercase text-[10px] text-[#0F172A] px-4">{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(question as any).tableData.rows?.map((row: any[], i: number) => (
                      <TableRow key={i} className="h-10 border-slate-100">
                        {row.map((cell, j) => (
                          <TableCell key={j} className="text-center font-bold text-[#0F172A] border-r last:border-0 py-2 text-sm">{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </div>
           )}

           {(question.passageEn || question.passagePa) && (
             <div className="space-y-4">
                {showEn && question.passageEn && (
                  <div className="text-[15px] leading-relaxed text-[#0F172A] font-medium whitespace-pre-wrap break-words">{question.passageEn}</div>
                )}
                {showPa && question.passagePa && (
                  <div className="text-[15px] leading-relaxed text-[#0F172A] font-medium whitespace-pre-wrap break-words border-t border-slate-200/50 pt-4">{question.passagePa}</div>
                )}
             </div>
           )}
        </div>
      )}

      {/* Main Question Statement */}
      <div className="space-y-6 mb-8">
        {showEn && question.questionEn && (
           <div className="text-[18px] md:text-[22px] font-black leading-snug text-[#000000] tracking-tight whitespace-pre-wrap break-words">
              {question.questionEn}
           </div>
        )}
        
        {showPa && question.questionPa && (
           <div className={cn(
             "text-[18px] md:text-[22px] font-black leading-snug text-[#000000] tracking-tight whitespace-pre-wrap break-words",
             language === 'bilingual' ? "pt-4 border-t border-slate-100" : ""
           )}>
              {question.questionPa}
           </div>
        )}

        {language === 'pa' && isMissingPa && (
          <Badge variant="destructive" className="bg-rose-50 text-rose-600 border-none text-[8px] font-black uppercase">
            <AlertTriangle className="h-3 w-3 mr-2" /> Translation Pending
          </Badge>
        )}
      </div>

      {/* Solution & Rationale Node */}
      {showSolution && (
        <div className="mt-10 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-6 shadow-xl animate-in slide-in-from-bottom-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg"><CheckCircle2 className="h-5 w-5" /></div>
                 <h4 className="text-[16px] text-[#0F172A] font-black uppercase tracking-tight">Verified Answer: {question.correctAnswer}</h4>
              </div>
              {!hasExplanation && question.id && (
                 <Button 
                   onClick={handleGenerateAI} 
                   disabled={isGenerating}
                   className="bg-primary hover:bg-orange-600 text-white font-black uppercase text-[9px] tracking-widest gap-2 rounded-xl h-10 px-6 shadow-xl"
                 >
                    {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                    Generate AI Explain
                 </Button>
              )}
           </div>
           
           <div className="space-y-6 pt-6 border-t border-emerald-200/50">
              {showEn && expEn && (
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Audit Rationale (English)</p>
                   <div className="text-[14px] text-slate-800 leading-relaxed font-bold bg-white/60 p-6 rounded-2xl whitespace-pre-wrap break-words">{expEn}</div>
                </div>
              )}
              {showPa && expPa && (
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">ਵਿਆਖਿਆ (Punjabi)</p>
                   <div className="text-[14px] text-slate-800 leading-relaxed font-bold bg-white/60 p-6 rounded-2xl whitespace-pre-wrap break-words">{expPa}</div>
                </div>
              )}
              {!hasExplanation && (
                <div className="flex items-center gap-3 p-4 bg-white/40 rounded-xl border border-dashed border-emerald-200">
                   <BrainCircuit className="h-4 w-4 text-emerald-400" />
                   <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">AI Rationale Node is being generated.</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
