"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Wrench, 
  RefreshCw, 
  Zap, 
  ShieldAlert, 
  Trash2, 
  LogOut, 
  Database, 
  AlertCircle,
  Loader2,
  ShieldCheck,
  ChevronRight
} from "lucide-react"
import { useFirestore } from "@/firebase"
import { collection, query, where, getDocs, writeBatch, doc, setDoc, serverTimestamp, getCountFromServer, DocumentData, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { clearAppCache } from "@/app/actions/maintenance"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Master Admin Maintenance Terminal v2.9.
 * FIXED: Added missing Input import and typed onChange event parameter.
 */

export default function MaintenancePage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [confirmDelete, setConfirmTool] = useState<string | null>(null)
  const [deleteMatch, setDeleteMatch] = useState("")

  const tools = [
    { 
      id: 'cache', 
      label: 'Clear Application Cache', 
      desc: 'Invalidates Next.js data cache for homepage, exams and merit list.', 
      icon: <RefreshCw className="h-5 w-5" />, 
      action: async () => {
         await clearAppCache();
         toast({ title: "Cache Invalidated", description: "All public nodes revalidated." });
      }
    },
    { 
      id: 'stats', 
      label: 'Rebuild Global Counters', 
      desc: 'Recalculates all platform statistics from live collection snapshots.', 
      icon: <Database className="h-5 w-5" />, 
      action: async () => {
         if (!db) return;
         const [qCount, mCount, uCount, rCount, eCount, nCount, pyqCount, pSnap] = await Promise.all([
            getCountFromServer(collection(db, "questions")),
            getCountFromServer(collection(db, "mocks")),
            getCountFromServer(collection(db, "users")),
            getCountFromServer(collection(db, "results")),
            getCountFromServer(collection(db, "exams")),
            getCountFromServer(collection(db, "notes")),
            getCountFromServer(collection(db, "pyqs")),
            getDocs(query(collection(db, "payment_requests"), where("status", "==", "APPROVED")))
         ]);

         const totalRev = pSnap.docs.reduce((acc: number, d: DocumentData) => acc + (Number(d.data().amount) || 0), 0);

         await setDoc(doc(db, "settings", "stats"), {
            totalQuestions: qCount.data().count,
            totalMocks: mCount.data().count,
            totalUsers: uCount.data().count,
            totalCategories: eCount.data().count, 
            totalRevenue: totalRev,
            totalNotes: nCount.data().count,
            totalPYQs: pyqCount.data().count,
            totalAttempts: rCount.data().count,
            updatedAt: serverTimestamp()
         }, { merge: true });
         toast({ title: "Counters Synchronized" });
      }
    },
    { 
      id: 'logout', 
      label: 'Force Logout All Users', 
      desc: 'Broadcasts a global session version update to invalidate all current logins.', 
      icon: <LogOut className="h-5 w-5 text-rose-500" />, 
      action: async () => {
         if (!db) return;
         await updateDoc(doc(db, 'settings', 'global'), {
            maintenanceModeAt: serverTimestamp(),
            updatedAt: serverTimestamp()
         });
         toast({ title: "Force Logout Node Broadcasted" });
      }
    },
    { 
      id: 'validate', 
      label: 'Validate Firestore Schema', 
      desc: 'Scans for orphan exam nodes and missing board mappings.', 
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />, 
      action: async () => {
         if (!db) return;
         const examsSnap = await getDocs(collection(db, "exams"));
         const orphans = examsSnap.docs.filter(d => !d.data().boardId || !d.data().categoryId);
         if (orphans.length > 0) {
            toast({ variant: "destructive", title: "Integrity Violation", description: `Found ${orphans.length} orphan verticals.` });
         } else {
            toast({ title: "Integrity Verified", description: "All registry nodes mapped correctly." });
         }
      }
    }
  ];

  const handleToolAction = async (tool: any) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setActiveTool(tool.id);
    try {
      await tool.action();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Tool Failure", description: e.message });
    } finally {
      setIsProcessing(false);
      setActiveTool(null);
    }
  };

  const handleDangerAction = async (toolId: string) => {
     if (!db) return;
     setIsProcessing(true);
     setActiveTool(toolId);
     try {
        const batch = writeBatch(db);
        if (toolId === 'expire-all') {
           const usersSnap = await getDocs(collection(db, "users"));
           usersSnap.docs.forEach(u => batch.update(u.ref, { passStatus: 'expired', updatedAt: serverTimestamp() }));
        } else if (toolId === 'reset-hub') {
           const usersSnap = await getDocs(collection(db, "users"));
           usersSnap.docs.forEach(u => batch.update(u.ref, { pinnedExams: [], updatedAt: serverTimestamp() }));
        } else if (toolId === 'clear-notif') {
           const notifSnap = await getDocs(collection(db, "notifications"));
           notifSnap.docs.forEach(n => batch.delete(n.ref));
        }
        await batch.commit();
        toast({ title: "Operation Complete", description: "Registry modified successfully." });
     } catch (e: any) {
        toast({ variant: "destructive", title: "Danger Tool Failure" });
     } finally {
        setIsProcessing(false);
        setActiveTool(null);
        setConfirmTool(null);
        setDeleteMatch("");
     }
  };

  return (
    <div className="space-y-6 md:space-y-12 pb-24 text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <Wrench className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Maintenance Registry</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">System Tools</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Safe operations and integrity audits for production nodes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-1">
         {tools.map(tool => (
            <Card key={tool.id} className="border-none shadow-xl bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-12 hover:translate-y-[-4px] transition-all group border border-slate-50">
               <div className="flex items-start justify-between mb-6 md:mb-8">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                     {tool.icon}
                  </div>
                  <Button 
                    onClick={() => handleToolAction(tool)} 
                    disabled={isProcessing}
                    className="bg-[#0F172A] hover:bg-black rounded-full h-10 px-6 font-black uppercase text-[10px] tracking-widest gap-2 border-none shadow-lg active:scale-95"
                  >
                     {activeTool === tool.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3 w-3" />} Run Tool
                  </Button>
               </div>
               <div className="space-y-1 md:space-y-2">
                  <h3 className="text-lg md:text-2xl font-black text-[#0F172A] leading-tight">{tool.label}</h3>
                  <p className="text-[11px] md:text-sm font-medium text-slate-400 leading-relaxed">{tool.desc}</p>
               </div>
            </Card>
         ))}
      </div>

      <div className="px-1 pt-6">
         <Card className="border-none shadow-3xl bg-rose-50/50 rounded-2xl md:rounded-[3rem] p-6 md:p-16 border-2 border-dashed border-rose-100">
            <div className="flex items-center gap-4 mb-8 md:mb-10">
               <div className="h-10 w-10 md:h-12 md:w-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
                  <ShieldAlert className="h-6 w-6" />
               </div>
               <div className="space-y-0.5">
                  <h2 className="text-xl md:text-3xl font-black text-rose-600 tracking-tight leading-none">Danger Zone</h2>
                  <p className="text-rose-400 font-bold uppercase text-[8px] md:text-[9px] tracking-widest">High-impact destructive operations</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
               <DangerButton label="Soft Reset My Hub" toolId="reset-hub" setConfirm={setConfirmTool} />
               <DangerButton label="Expire All Passes" toolId="expire-all" setConfirm={setConfirmTool} />
               <DangerButton label="Clear Notifications" toolId="clear-notif" setConfirm={setConfirmTool} />
            </div>
         </Card>
      </div>

      {confirmDelete && (
         <div className="fixed inset-0 z-[110] bg-[#0F172A]/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <Card className="max-w-md w-full bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 space-y-8 shadow-5xl border-none text-center">
               <div className="h-16 w-16 md:h-20 md:w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-600 shadow-inner">
                  <AlertCircle className="h-10 w-10" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">Confirm Deletion</h3>
                  <p className="text-slate-500 font-medium text-sm">To proceed with <strong>{confirmDelete.toUpperCase()}</strong>, please type <code className="text-rose-600 font-black">DELETE</code> below.</p>
               </div>
               <Input 
                 value={deleteMatch} 
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeleteMatch(e.target.value)} 
                 className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 text-center font-black text-rose-600 uppercase tracking-widest" 
                 placeholder="Type here..."
               />
               <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => { setConfirmTool(null); setDeleteMatch(""); }} className="flex-1 rounded-full h-11 md:h-12 font-black uppercase text-[10px] text-slate-400">Cancel</Button>
                  <Button 
                    disabled={deleteMatch !== 'DELETE' || isProcessing} 
                    onClick={() => handleDangerAction(confirmDelete)}
                    className="flex-[2] h-11 md:h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl border-none"
                  >
                     {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Authorize
                  </Button>
               </div>
            </Card>
         </div>
      )}
    </div>
  )
}

function DangerButton({ label, toolId, setConfirm }: any) {
   return (
      <Button 
        onClick={() => setConfirm(toolId)}
        variant="outline" 
        className="h-12 md:h-16 rounded-xl md:rounded-[1.5rem] border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-sm transition-all"
      >
         {label}
      </Button>
   )
}
