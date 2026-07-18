"use client"

import React, { useMemo, useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Trash2, 
  Database, 
  Loader2, 
  RefreshCw, 
  ChevronRight, 
  History,
  Layers,
  ArrowUpDown,
  Tag,
  X,
  ShieldCheck,
  RotateCcw,
  AlertCircle
} from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { 
  collection, 
  query, 
  doc, 
  where, 
  limit, 
  getDocs, 
  startAfter, 
  writeBatch, 
  serverTimestamp, 
  orderBy, 
  DocumentData, 
  deleteDoc,
  setDoc,
  QueryDocumentSnapshot
} from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton } from "@/components/admin"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Used Questions Archive Hub v1.0.
 * Managed collection for questions that have been moved out of the primary Question Bank.
 */

export default function UsedQuestionsPage() {
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    subjectId: 'all',
    mockId: 'all'
  })

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db])
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), orderBy("title", "asc")) : null), [db])
  
  const { data: subjects } = useCollection<any>(subjectsQuery)
  const { data: mocks } = useCollection<any>(mocksQuery)

  const fetchQuestions = useCallback(async (isLoadMore = false) => {
    if (!db) return
    setLoading(true)
    
    try {
      const colRef = collection(db, "usedQuestions");
      const constraints: any[] = [orderBy("usedAt", "desc")];
      
      if (filters.subjectId !== 'all') constraints.push(where("subjectId", "==", filters.subjectId));
      if (filters.mockId !== 'all') constraints.push(where("mockId", "==", filters.mockId));
      if (isLoadMore && lastDoc) constraints.push(startAfter(lastDoc));
      constraints.push(limit(50));

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      
      let filtered = docs;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = docs.filter(d => 
          (d.englishQuestion || "").toLowerCase().includes(term) ||
          (d.mockName || "").toLowerCase().includes(term) ||
          d.id.toLowerCase().includes(term)
        );
      }

      if (isLoadMore) {
        setQuestions(prev => [...prev, ...filtered]);
      } else {
        setQuestions(filtered);
      }

      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === 50);

    } catch (e: any) {
      toast({ variant: "destructive", title: "Archive Sync Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  }, [db, filters, searchTerm, lastDoc, toast]);

  useEffect(() => {
    fetchQuestions(false);
  }, [filters, searchTerm]);

  const handleRestore = async (q: any) => {
    if (!db || isProcessing) return;
    setIsProcessing(true);
    
    try {
      const batch = writeBatch(db);
      const bankRef = doc(db, "mcqBank", q.id);
      const legacyRef = doc(db, "questions", q.id);
      const usedRef = doc(db, "usedQuestions", q.id);

      const { usedAt, usedBy, mockId, mockName, originalQuestionId, ...rest } = q;
      
      const restoredData = {
        ...rest,
        updatedAt: serverTimestamp(),
        status: 'UNUSED'
      };

      batch.set(bankRef, restoredData);
      batch.set(legacyRef, restoredData);
      batch.delete(usedRef);

      await batch.commit();
      
      setQuestions(prev => prev.filter(item => item.id !== q.id));
      toast({ title: "Question Restored", description: "Node moved back to primary bank pool." });
    } catch (e) {
      toast({ variant: "destructive", title: "Restore Failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently purge this archived question? This cannot be undone.")) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, "usedQuestions", id));
      setQuestions(prev => prev.filter(item => item.id !== id));
      toast({ title: "Purged Permanently" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-700 pt-2 px-1">
      
      <AdminPageHeader
        icon={History}
        label="Used Content Archive"
        title="Used Questions"
        subtitle="Manage questions that have been consumed by mocks and challenges."
      />

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white border border-slate-50 p-6 md:p-8 space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FilterNode 
              label="Subject Hub" 
              value={filters.subjectId} 
              onChange={v => setFilters({...filters, subjectId: v})}
              options={subjects?.map(s => ({ label: s.name, value: s.id })) || []}
            />
            <FilterNode 
              label="Source Mock" 
              value={filters.mockId} 
              onChange={v => setFilters({...filters, mockId: v})}
              options={mocks?.map(m => ({ label: m.title, value: m.id })) || []}
            />
         </div>
         <AdminSearchInput
           value={searchTerm}
           onChange={setSearchTerm}
           placeholder="Search archived statements..."
         />
      </Card>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-14 border-slate-100">
                <TableHead className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Identity</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400">Statement</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400">Used In</TableHead>
                <TableHead className="text-right px-10 text-[9px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && questions.length === 0 ? (
                <AdminTableSkeleton rows={8} columns={4} />
              ) : questions.length > 0 ? questions.map((q: any) => (
                <TableRow key={q.id} className="hover:bg-slate-50 transition-all border-slate-50 group">
                  <TableCell className="px-6 py-6 text-left max-w-[140px]">
                     <div className="space-y-1.5">
                        <code className="text-[10px] font-mono text-primary font-black">ID: {q.id.slice(-8)}</code>
                        <Badge variant="outline" className="border-slate-100 text-slate-300 text-[7px] uppercase">{q.subjectId || 'General'}</Badge>
                     </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                     <p className="font-bold text-[#0F172A] text-sm md:text-base leading-snug line-clamp-2">{q.englishQuestion}</p>
                     <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">Archived: {new Date(q.usedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-600 line-clamp-1">{q.mockName || 'Dynamic Test'}</p>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">ID: {q.mockId?.slice(-6)}</p>
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                     <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button 
                          onClick={() => handleRestore(q)} 
                          disabled={isProcessing}
                          variant="ghost" 
                          className="h-10 px-4 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 font-bold text-[9px] uppercase gap-2"
                        >
                           <RotateCcw className="h-4 w-4" /> Restore
                        </Button>
                        <button 
                          className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all" 
                          onClick={() => handleDelete(q.id)}
                        >
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : !loading && (
                 <TableRow>
                    <TableCell colSpan={4} className="h-80 text-center">
                       <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                          <Layers className="h-20 w-20 text-slate-400" />
                          <p className="font-black text-2xl uppercase tracking-[0.4em]">Archive Empty</p>
                       </div>
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {hasMore && questions.length > 0 && (
        <div className="flex justify-center mt-10">
          <Button variant="outline" onClick={() => fetchQuestions(true)} disabled={loading} className="gap-3 h-14 px-12 rounded-full font-black uppercase text-[10px] tracking-widest border-slate-200 shadow-xl bg-white hover:bg-slate-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <RefreshCw className="h-4 w-4 text-primary" />} Load Next Page
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 text-slate-300 py-10 opacity-30">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-[9px] font-black uppercase tracking-[0.5em]">Institutional Archive Hub Secure</span>
      </div>
    </div>
  )
}

function FilterNode({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-1.5 text-left">
       <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
       <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none shadow-inner appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
       >
          <option value="all">All {label.split(' ')[1]}s</option>
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
       </select>
    </div>
  )
}
