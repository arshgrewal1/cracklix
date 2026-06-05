
"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Save, Loader2, Globe, Settings2, ShieldCheck, LayoutGrid, Smartphone, Monitor } from "lucide-react"
import { useFirestore, useDoc, useCollection } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { AdType, AdPlacementType, AdStatus } from "@/types"

/**
 * @fileOverview High-Fidelity Campaign Editor.
 * Orchestrates direct banner assets and targeting registries.
 */

const PLACEMENTS: AdPlacementType[] = [
  'HOMEPAGE_TOP', 'HOMEPAGE_MIDDLE', 'HOMEPAGE_BOTTOM', 'EXAM_LISTING', 
  'MOCK_LISTING', 'NOTES_PAGE', 'CA_PAGE', 'RESULT_PAGE', 'SIDEBAR', 'FOOTER'
];

export default function AdEntryPage() {
  return (
    <Suspense fallback={null}>
      <AdEntryContent />
    </Suspense>
  )
}

function AdEntryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const adId = searchParams.get("id")
  const isEditing = !!adId

  const { data: existingAd } = useDoc<any>(useMemo(() => (db && adId ? doc(db, "ads", adId) : null), [db, adId]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))

  const [formData, setFormData] = useState<any>({
    title: "",
    type: "BANNER" as AdType,
    status: "ACTIVE" as AdStatus,
    placements: [] as AdPlacementType[],
    desktopImageUrl: "",
    mobileImageUrl: "",
    externalUrl: "",
    htmlCode: "",
    adSenseCode: "",
    priority: 1,
    targeting: {
      examIds: []
    }
  })

  useEffect(() => {
    if (existingAd) {
      setFormData({
        ...existingAd,
        targeting: existingAd.targeting || { examIds: [] }
      })
    }
  }, [existingAd])

  const handleSave = async () => {
    if (!db || isSaving) return
    if (!formData.title || formData.placements.length === 0) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Title and Placements are mandatory." })
      return
    }

    setIsSaving(true)
    const finalId = adId || `ad-${Date.now()}`
    const adRef = doc(db, "ads", finalId)
    
    const payload = {
      ...formData,
      id: finalId,
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingAd?.createdAt || serverTimestamp()) : serverTimestamp(),
      stats: isEditing ? existingAd.stats : { impressions: 0, clicks: 0 }
    }

    try {
      await setDoc(adRef, payload, { merge: true })
      toast({ title: "Campaign Deployed", description: "Monetization node successfully synced." })
      router.push("/admin/ads")
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
      setIsSaving(false)
    }
  }

  const togglePlacement = (p: AdPlacementType) => {
    const current = formData.placements
    setFormData({
      ...formData,
      placements: current.includes(p) ? current.filter((x: string) => x !== p) : [...current, p]
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 text-left">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-slate-200" onClick={() => router.back()}><ChevronLeft className="h-6 w-6" /></Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase">{isEditing ? "Modify Campaign" : "New Campaign Node"}</h1>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Strategic Monetization Protocol</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-orange-600 h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl gap-3" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit to Live Registry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-8 space-y-8">
           <Card className="border-none shadow-3xl rounded-[3rem] bg-white p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Campaign Headline</Label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg" placeholder="e.g. Patwari Coaching 2026" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Ad Engine</Label>
                    <Select value={formData.type} onValueChange={(v: AdType) => setFormData({...formData, type: v})}>
                       <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-black uppercase text-[10px]"><SelectValue /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="BANNER">Direct Image Banner</SelectItem>
                          <SelectItem value="ADSENSE">Google AdSense Node</SelectItem>
                          <SelectItem value="HTML">Custom HTML/Affiliate</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              {formData.type === 'BANNER' && (
                 <div className="space-y-8 animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><Monitor className="h-3 w-3" /> Desktop Asset URL</Label>
                          <Input value={formData.desktopImageUrl} onChange={e => setFormData({...formData, desktopImageUrl: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-medium" placeholder="https://..." />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><Smartphone className="h-3 w-3" /> Mobile Asset URL</Label>
                          <Input value={formData.mobileImageUrl} onChange={e => setFormData({...formData, mobileImageUrl: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-medium" placeholder="https://..." />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Redirect / Destination URL</Label>
                       <Input value={formData.externalUrl} onChange={e => setFormData({...formData, externalUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-primary" placeholder="https://..." />
                    </div>
                 </div>
              )}

              {formData.type === 'ADSENSE' && (
                 <div className="space-y-3 animate-in slide-in-from-top-4">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">AdSense Unit Fragment</Label>
                    <Textarea value={formData.adSenseCode} onChange={e => setFormData({...formData, adSenseCode: e.target.value})} className="min-h-[150px] rounded-[2rem] bg-slate-900 border-none p-6 font-mono text-emerald-400 text-xs" placeholder="<ins class='adsbygoogle' ...></ins>" />
                 </div>
              )}

              {formData.type === 'HTML' && (
                 <div className="space-y-3 animate-in slide-in-from-top-4">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Campaign HTML / Script</Label>
                    <Textarea value={formData.htmlCode} onChange={e => setFormData({...formData, htmlCode: e.target.value})} className="min-h-[150px] rounded-[2rem] bg-slate-900 border-none p-6 font-mono text-blue-400 text-xs" />
                 </div>
              )}
           </Card>

           <Card className="border-none shadow-3xl rounded-[3rem] bg-white p-12 space-y-10">
              <h3 className="font-headline font-black text-xl uppercase flex items-center gap-4"><LayoutGrid className="h-6 w-6 text-primary" /> Placement Map</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {PLACEMENTS.map(p => (
                    <button 
                       key={p}
                       onClick={() => togglePlacement(p)}
                       className={cn(
                          "px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all text-center",
                          formData.placements.includes(p) ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl" : "bg-white border-slate-100 text-slate-400 hover:border-primary/20"
                       )}
                    >
                       {p.replace('_', ' ')}
                    </button>
                 ))}
              </div>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-3xl rounded-[3rem] bg-[#0F172A] text-white p-10 space-y-10">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Status</Label>
                    <Select value={formData.status} onValueChange={(v: AdStatus) => setFormData({...formData, status: v})}>
                       <SelectTrigger className="h-12 rounded-xl bg-white/5 border-none font-bold"><SelectValue /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="ACTIVE">System Online</SelectItem>
                          <SelectItem value="PAUSED">System Paused</SelectItem>
                          <SelectItem value="SCHEDULED">Scheduled Node</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Delivery Priority (1-10)</Label>
                    <Input type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})} className="h-12 rounded-xl bg-white/5 border-none font-black text-center" />
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-6">
                 <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Targeting Filters</p>
                 <div className="space-y-4">
                    <Label className="text-[9px] font-black uppercase text-slate-500">Target Specific Exams</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                       {exams?.map((e: any) => (
                          <button 
                             key={e.id}
                             onClick={() => {
                                const current = formData.targeting.examIds || []
                                setFormData({...formData, targeting: { ...formData.targeting, examIds: current.includes(e.id) ? current.filter((x: string) => x !== e.id) : [...current, e.id] }})
                             }}
                             className={cn(
                                "text-[9px] font-bold uppercase p-2 rounded-lg text-left transition-all",
                                formData.targeting?.examIds?.includes(e.id) ? "bg-primary text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                             )}
                          >
                             {e.name}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
