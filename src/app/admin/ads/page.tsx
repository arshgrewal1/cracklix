
"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Megaphone, Edit, Trash2, Zap, TrendingUp, Globe, MousePointer2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, deleteDoc, doc, orderBy } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Institutional Advertisement Manager.
 * High-fidelity control panel for all platform campaigns.
 */

export default function AdManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const adsQuery = useMemo(() => (db ? query(collection(db, "ads"), orderBy("createdAt", "desc")) : null), [db])
  const { data: ads, loading } = useCollection<any>(adsQuery)

  const stats = useMemo(() => {
    if (!ads) return { total: 0, impressions: 0, clicks: 0 }
    return {
      total: ads.length,
      impressions: ads.reduce((acc, a) => acc + (a.stats?.impressions || 0), 0),
      clicks: ads.reduce((acc, a) => acc + (a.stats?.clicks || 0), 0)
    }
  }, [ads])

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this campaign?")) return
    await deleteDoc(doc(db!, "ads", id))
    toast({ title: "Campaign Purged", description: "Monetization node removed from cloud." })
  }

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Megaphone className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Monetization Control Terminal</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Ad Manager</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Coordinate Google AdSense and direct institutional sponsorships.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-orange-600 h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl">
           <Link href="/admin/ads/add"><Plus className="h-5 w-5" /> Initialize Campaign</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
         <MetricCard label="Active Campaigns" value={stats.total} icon={<Zap className="text-primary" />} />
         <MetricCard label="Gross Impressions" value={stats.impressions.toLocaleString()} icon={<Eye className="text-blue-500" />} />
         <MetricCard label="Interaction Nodes" value={stats.clicks.toLocaleString()} icon={<MousePointer2 className="text-emerald-500" />} />
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase text-slate-400">Campaign Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400">Type & Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400 text-center">CTR %</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="p-10"><Skeleton className="h-16 w-full rounded-2xl" /></TableCell></TableRow>
                ))
              ) : ads?.map((ad: any) => (
                <TableRow key={ad.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-10 py-8">
                     <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                           {ad.type === 'BANNER' ? <Globe className="h-6 w-6 text-primary" /> : <TrendingUp className="h-6 w-6 text-blue-500" />}
                        </div>
                        <div>
                           <p className="font-black text-[#0F172A] text-lg uppercase leading-none">{ad.title}</p>
                           <div className="flex items-center gap-3 mt-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ad.placements?.[0]?.replace('_', ' ')}</span>
                              <div className="h-1 w-1 rounded-full bg-slate-200" />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority {ad.priority}</span>
                           </div>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col gap-2">
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black w-fit">{ad.type}</Badge>
                        <div className="flex items-center gap-2">
                           <div className={`h-2.5 w-2.5 rounded-full ${ad.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">{ad.status}</span>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <p className="text-3xl font-headline font-black text-[#0F172A]">
                        {ad.stats?.impressions ? ((ad.stats.clicks / ad.stats.impressions) * 100).toFixed(1) : '0'}%
                     </p>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Flow</p>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-white hover:text-primary shadow-sm" asChild>
                          <Link href={`/admin/ads/add?id=${ad.id}`}><Edit className="h-5 w-5" /></Link>
                       </Button>
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(ad.id)}>
                          <Trash2 className="h-5 w-5" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ label, value, icon }: any) {
  return (
    <Card className="border-none shadow-xl bg-white p-10 rounded-[2.5rem] relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
       <div className="space-y-4 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</p>
          <p className="text-4xl font-headline font-black text-[#0F172A]">{value}</p>
       </div>
    </Card>
  )
}
