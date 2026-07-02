
"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Terminal, Activity, Zap, Loader2, Globe } from "lucide-react"
import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"

/**
 * @fileOverview Institutional Billing Debug Center (Admin Only).
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function BillingDebugPage() {
  const { user, profile, loading: userLoading } = useUser()
  const router = useRouter()
  const [debugData, setDebugData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const userEmail = user?.email?.toLowerCase();
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || (userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail));

  useEffect(() => {
    if (!userLoading && (!user || !isAdmin)) {
      router.replace('/dashboard');
    }
  }, [user, isAdmin, userLoading, router]);

  if (userLoading || !user || !isAdmin) return null;

  const runTest = async () => {
     if (!user) { setError("Must be logged in to test."); return; }
     setIsTesting(true);
     setError(null);
     try {
        const res = await fetch('/api/cashfree/create-order', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
              planId: 'monthly-pass',
              userId: user.uid,
              origin: window.location.origin
           })
        });
        const data = await res.json();
        if (data.error) setError(data.error);
        setDebugData(data);
     } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
     } finally {
        setIsTesting(false);
     }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-4xl text-left">
        <div className="space-y-8">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-[#0F172A] rounded-xl flex items-center justify-center text-primary shadow-xl">
                 <Terminal className="h-6 w-6" />
              </div>
              <div>
                 <h1 className="text-3xl font-headline font-black uppercase text-[#0F172A]">Billing Auditor</h1>
                 <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Gateway Diagnostic Hub</p>
              </div>
           </div>

           <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
              <CardHeader className="p-8 border-b bg-slate-50/50">
                 <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" /> Environment Health
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <DebugNode label="ENV" value={process.env.NEXT_PUBLIC_CASHFREE_ENV || 'Not Set'} />
                    <DebugNode label="USER ID" value={user?.uid || 'Not Active'} />
                    <DebugNode label="ORIGIN" value={typeof window !== 'undefined' ? window.location.origin : 'N/A'} />
                    <DebugNode label="GATEWAY" value="CASHFREE" />
                 </div>
                 <Button 
                   onClick={runTest} 
                   disabled={isTesting || userLoading}
                   className="w-full h-14 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl gap-3"
                 >
                    {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-primary" />}
                    Test Order Creation (Monthly Pass)
                 </Button>
              </CardContent>
           </Card>

           {error && (
              <Card className="border-none bg-rose-50 border-rose-100 rounded-2xl p-6 flex items-start gap-4">
                 <ShieldAlert className="h-6 w-6 text-rose-500 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-xs font-black text-rose-700 uppercase">GATEWAY REJECTION</p>
                    <p className="text-sm font-medium text-rose-600 leading-relaxed">{error}</p>
                 </div>
              </Card>
           )}

           {debugData && (
              <Card className="border-none shadow-2xl rounded-[2rem] bg-[#0B1528] text-emerald-400 p-8">
                 <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest">Raw Response Node</p>
                    <Globe className="h-4 w-4 opacity-50" />
                 </div>
                 <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed opacity-90 overflow-x-auto">
                    {JSON.stringify(debugData, null, 2)}
                 </pre>
              </Card>
           )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function DebugNode({ label, value }: any) {
   return (
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
         <p className="text-xs font-bold text-[#0F172A] truncate">{value}</p>
      </div>
   )
}
