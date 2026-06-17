"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ShieldCheck, Save, RefreshCw, QrCode, Share2, Smartphone, Apple, Play, Info, Megaphone, Target, Zap, Gift, Clock } from "lucide-react"
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

/**
 * @fileOverview Institutional Administrative Portal v11.0.
 * UPDATED: Explicit labels for Share Schema to guide admin configuration.
 */

export default function AdminSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: remoteSettings, loading } = useDoc<any>(settingsRef);

  const [formData, setFormData] = useState({
    announcement: "🔥 Official Punjab Latest Pattern Recruitment Calendar Live.",
    showAnnouncement: true,
    platformName: "Cracklix",
    footerText: "Punjab's most advanced government exam portal.",
    address: "Shergarh, Bathinda, Punjab",
    upiId: "arshdeepgrewal1122-1@oksbi",
    qrCodeUrl: "",
    supportPhone: "+91 98881 88602",
    supportEmail: "cracklixhelp@gmail.com",
    telegramUrl: "https://t.me/cracklixapp",
    playStoreUrl: "",
    appStoreUrl: "",
    adSenseEnabled: false,
    adSenseClientCode: "",
    shareUrl: "https://cracklix.com",
    shareTitle: "Cracklix | Punjab's Mock Test Platform",
    shareDescription: "Practice Mock Tests and Prepare for Punjab Government Exams.",
    freeTrialEnabled: true,
    freeTrialDays: 7
  });

  useEffect(() => {
    if (remoteSettings) setFormData(prev => ({ ...prev, ...remoteSettings }));
  }, [remoteSettings]);

  const handleSave = () => {
    if (!db) return;
    setDoc(doc(db, 'settings', 'global'), { ...formData, updatedAt: serverTimestamp() }, { merge: true })
      .then(() => toast({ title: "Registry Synced", description: "Global settings node updated successfully." }))
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><RefreshCw className="h-10 w-10 text-primary animate-spin" /></div>

  return (
    <div className="space-y-6 md:space-y-8 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-1.5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">System Configuration</span>
           </div>
          <h1 className="text-2xl md:text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">System Portal</h1>
        </div>
        <Button onClick={handleSave} className="w-full md:w-auto bg-primary hover:bg-primary/90 h-14 md:h-12 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl gap-2 transition-all active:scale-95 border-none">
          <Save className="h-5 w-5" /> Commit Settings
        </Button>
      </div>

      <Tabs defaultValue="monetization">
        <TabsList className="bg-slate-100 border border-slate-200 p-1 h-14 rounded-xl mb-8 flex w-full md:w-auto overflow-x-auto no-scrollbar justify-start">
          <TabsTrigger value="monetization" className="rounded-lg px-4 md:px-6 font-black uppercase text-[10px] h-full whitespace-nowrap">Pass & Payments</TabsTrigger>
          <TabsTrigger value="homepage" className="rounded-lg px-4 md:px-6 font-black uppercase text-[10px] h-full whitespace-nowrap">Global Content</TabsTrigger>
          <TabsTrigger value="website" className="rounded-lg px-4 md:px-6 font-black uppercase text-[10px] h-full whitespace-nowrap">Share & Mobile</TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg px-4 md:px-6 font-black uppercase text-[10px] h-full whitespace-nowrap">Support Info</TabsTrigger>
        </TabsList>

        <TabsContent value="monetization" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-lg rounded-[2rem] bg-white p-6 md:p-8 space-y-8">
                 <div className="flex items-center gap-3 mb-4">
                    <Gift className="h-6 w-6 text-emerald-500" />
                    <h3 className="font-headline font-black text-lg uppercase">Free Trial Hub</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                       <div className="space-y-0.5 text-left">
                          <p className="font-black text-[11px] uppercase text-emerald-900">Offer Active</p>
                          <p className="text-[8px] font-bold text-emerald-600 uppercase">Allow students to claim a free pass once</p>
                       </div>
                       <Switch checked={formData.freeTrialEnabled} onCheckedChange={v => setFormData({...formData, freeTrialEnabled: v})} />
                    </div>
                    
                    <div className="space-y-2 text-left">
                       <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">
                          <Clock className="h-3 w-3" /> Trial Duration (Days)
                       </Label>
                       <Input 
                         type="number" 
                         value={formData.freeTrialDays} 
                         onChange={e => setFormData({...formData, freeTrialDays: parseInt(e.target.value) || 0})}
                         className="h-12 rounded-xl border-slate-100 font-black text-emerald-600"
                       />
                    </div>
                 </div>
              </Card>

              <Card className="border-none shadow-lg rounded-[2rem] bg-white p-6 md:p-8 space-y-8">
                 <div className="flex items-center gap-3 mb-4">
                    <QrCode className="h-6 w-6 text-primary" />
                    <h3 className="font-headline font-black text-lg uppercase">M-Payment Gateway</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2 text-left">
                       <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Institutional UPI ID</Label>
                       <Input value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="h-14 rounded-xl border-slate-100 font-black text-base md:text-lg text-primary" />
                    </div>
                    <div className="space-y-2 text-left">
                       <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">QR Code Image URL (Asset Path)</Label>
                       <Input value={formData.qrCodeUrl} onChange={e => setFormData({...formData, qrCodeUrl: e.target.value})} className="h-12 rounded-xl border-slate-100 text-xs font-mono" placeholder="https://..." />
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-none shadow-lg rounded-[2rem] bg-white p-6 md:p-8 space-y-6 text-left">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="space-y-2 text-left">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Global Broadcast (Announcement)</Label>
                      <Input value={formData.announcement} onChange={e => setFormData({...formData, announcement: e.target.value})} className="h-12 rounded-xl font-bold" />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="flex items-center gap-3"><Megaphone className="h-4 w-4 text-primary animate-bounce" /><p className="font-black text-[10px] uppercase text-[#0F172A]">Live Bar Visibility</p></div>
                      <Switch checked={formData.showAnnouncement} onCheckedChange={val => setFormData({...formData, showAnnouncement: val})} />
                   </div>
                </div>
                <div className="space-y-4 text-left">
                   <div className="space-y-2 text-left">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Platform Brand Identity</Label>
                      <Input value={formData.platformName} onChange={e => setFormData({...formData, platformName: e.target.value})} className="h-12 rounded-xl font-black text-lg" />
                   </div>
                </div>
             </div>
             <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Institutional Footer Context</Label>
                <Textarea value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} className="min-h-[80px] rounded-xl font-medium leading-relaxed" />
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-lg rounded-[2rem] bg-white p-6 md:p-8 space-y-6 text-left">
                 <div className="flex items-center gap-3 mb-4"><Share2 className="h-5 w-5 text-primary" /><h3 className="font-headline font-black text-lg uppercase">Global Share Schema</h3></div>
                 <div className="space-y-4">
                    <div className="space-y-2 text-left"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Share Canonical URL (Live App Link)</Label><Input value={formData.shareUrl} onChange={e => setFormData({...formData, shareUrl: e.target.value})} className="h-12 rounded-xl font-bold text-primary" placeholder="https://cracklix.com" /></div>
                    <div className="space-y-2 text-left"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Share Message Title</Label><Input value={formData.shareTitle} onChange={e => setFormData({...formData, shareTitle: e.target.value})} className="h-12 rounded-xl font-bold" placeholder="Join Cracklix" /></div>
                    <div className="space-y-2 text-left"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Share Message Abstract</Label><Textarea value={formData.shareDescription} onChange={e => setFormData({...formData, shareDescription: e.target.value})} className="min-h-[100px] rounded-xl" placeholder="Prepare for Punjab exams..." /></div>
                 </div>
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-[9px] font-bold text-blue-600 uppercase leading-relaxed">
                       This metadata is used when students click the "Share App" button in the sidebar or dashboard.
                    </p>
                 </div>
              </Card>

              <Card className="border-none shadow-lg rounded-[2rem] bg-white p-6 md:p-8 space-y-6 text-left">
                 <div className="flex items-center gap-3 mb-4"><Smartphone className="h-5 w-5 text-primary" /><h3 className="font-headline font-black text-lg uppercase">App Store Registry</h3></div>
                 <div className="space-y-6">
                    <div className="space-y-2 text-left"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Play className="h-3 w-3" /> Android Package Link</Label><Input value={formData.playStoreUrl} onChange={e => setFormData({...formData, playStoreUrl: e.target.value})} className="h-12 rounded-xl font-bold text-primary" placeholder="Google Play URL" /></div>
                    <div className="space-y-2 text-left"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Apple className="h-3 w-3" /> iOS Bundle Link</Label><Input value={formData.appStoreUrl} onChange={e => setFormData({...formData, appStoreUrl: e.target.value})} className="h-12 rounded-xl font-bold text-primary" placeholder="App Store URL" /></div>
                 </div>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
