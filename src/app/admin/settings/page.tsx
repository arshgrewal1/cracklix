"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ShieldCheck, Save, RefreshCw, QrCode, Share2, Smartphone, Apple, Play, Info, Megaphone, Target, Zap, Gift, Clock, MessageCircle } from "lucide-react"
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

/**
 * @fileOverview Institutional Administrative Portal v14.1.
 * FIXED: Restored full Support Info tab content for managing institutional contact nodes.
 * HARDENED: Explicitly typed callbacks and ensured high-density layout stability.
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
    shareTitle: "Cracklix | Punjab's Smart Mock Test Platform",
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
    <div className="space-y-6 md:space-y-10 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">System Configuration</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">System Portal</h1>
        </div>
        <Button onClick={handleSave} className="w-full md:w-auto bg-primary hover:bg-primary/90 h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl gap-2 transition-all active:scale-95 border-none">
          <Save className="h-5 w-5" /> Commit Settings
        </Button>
      </div>

      <Tabs defaultValue="monetization" className="w-full">
        <TabsList className="bg-slate-100 border border-slate-200 p-1.5 h-16 rounded-2xl mb-10 flex w-full md:w-auto overflow-x-auto no-scrollbar justify-start gap-2">
          <TabsTrigger value="monetization" className="rounded-xl px-6 md:px-8 font-black uppercase text-[10px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Pass & Payments</TabsTrigger>
          <TabsTrigger value="homepage" className="rounded-xl px-6 md:px-8 font-black uppercase text-[10px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Global Content</TabsTrigger>
          <TabsTrigger value="website" className="rounded-xl px-6 md:px-8 font-black uppercase text-[10px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Share & Mobile</TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl px-6 md:px-8 font-black uppercase text-[10px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Support Info</TabsTrigger>
        </TabsList>

        <TabsContent value="monetization" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white p-8 md:p-12 space-y-8">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                       <Gift className="h-6 w-6" />
                    </div>
                    <h3 className="font-headline font-black text-xl md:text-2xl uppercase text-[#0F172A]">Free Trial Hub</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                       <div className="space-y-0.5 text-left">
                          <p className="font-black text-[11px] uppercase text-emerald-900">Offer Active</p>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Allow students to claim a free pass once</p>
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
                         className="h-14 rounded-xl border-slate-100 bg-slate-50 font-black text-emerald-600 text-lg"
                       />
                    </div>
                 </div>
              </Card>

              <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white p-8 md:p-12 space-y-8">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <QrCode className="h-6 w-6" />
                    </div>
                    <h3 className="font-headline font-black text-xl md:text-2xl uppercase text-[#0F172A]">M-Payment Gateway</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2 text-left">
                       <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Institutional UPI ID</Label>
                       <Input value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-black text-lg text-primary" />
                    </div>
                    <div className="space-y-2 text-left">
                       <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">QR Code Image URL</Label>
                       <Input value={formData.qrCodeUrl} onChange={e => setFormData({...formData, qrCodeUrl: e.target.value})} className="h-12 rounded-xl border-slate-100 bg-slate-50 text-xs font-mono" placeholder="https://..." />
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-none shadow-3xl rounded-[3rem] bg-white p-8 md:p-14 space-y-10 text-left border border-slate-100">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div className="space-y-2 text-left">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Global Announcement</Label>
                      <Input value={formData.announcement} onChange={e => setFormData({...formData, announcement: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold" />
                   </div>
                   <div className="flex items-center justify-between p-6 bg-orange-50 rounded-2xl border border-orange-100">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm"><Megaphone className="h-5 w-5 animate-bounce" /></div>
                         <p className="font-black text-[10px] uppercase text-[#0F172A] tracking-widest">Bar Visibility</p>
                      </div>
                      <Switch checked={formData.showAnnouncement} onCheckedChange={val => setFormData({...formData, showAnnouncement: val})} />
                   </div>
                </div>
                <div className="space-y-6 text-left">
                   <div className="space-y-2 text-left">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Platform Identity</Label>
                      <Input value={formData.platformName} onChange={e => setFormData({...formData, platformName: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-black text-xl" />
                   </div>
                </div>
             </div>
             <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Footer Descriptor</Label>
                <Textarea value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50 font-medium leading-relaxed" />
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white p-8 md:p-12 space-y-8 text-left border border-slate-100">
                 <div className="flex items-center gap-4 mb-4"><div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner"><Share2 className="h-6 w-6" /></div><h3 className="font-headline font-black text-xl md:text-2xl uppercase text-[#0F172A]">Share Schema</h3></div>
                 <div className="space-y-6">
                    <div className="space-y-2 text-left"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Share URL</Label><Input value={formData.shareUrl} onChange={e => setFormData({...formData, shareUrl: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold text-primary" /></div>
                    <div className="space-y-2 text-left"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Share Title</Label><Input value={formData.shareTitle} onChange={e => setFormData({...formData, shareTitle: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold" /></div>
                    <div className="space-y-2 text-left"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Abstract</Label><Textarea value={formData.shareDescription} onChange={e => setFormData({...formData, shareDescription: e.target.value})} className="min-h-[100px] rounded-xl border-slate-100 bg-slate-50" /></div>
                 </div>
              </Card>

              <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white p-8 md:p-12 space-y-8 text-left border border-slate-100">
                 <div className="flex items-center gap-4 mb-4"><div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl"><Smartphone className="h-6 w-6" /></div><h3 className="font-headline font-black text-xl md:text-2xl uppercase text-[#0F172A]">App Stores</h3></div>
                 <div className="space-y-8">
                    <div className="space-y-2 text-left"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Play className="h-3 w-3" /> Android Link</Label><Input value={formData.playStoreUrl} onChange={e => setFormData({...formData, playStoreUrl: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold text-primary" /></div>
                    <div className="space-y-2 text-left"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Apple className="h-3 w-3" /> iOS Link</Label><Input value={formData.appStoreUrl} onChange={e => setFormData({...formData, appStoreUrl: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold text-primary" /></div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Card className="border-none shadow-3xl rounded-[3rem] bg-white p-8 md:p-14 space-y-12 text-left border border-slate-100">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                 <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <MessageCircle className="h-8 w-8" />
                 </div>
                 <div>
                    <h3 className="font-headline font-black text-2xl md:text-3xl uppercase text-[#0F172A]">Support Registry</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Official Institutional Contact Nodes</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-3 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Support Email Node</Label>
                    <Input value={formData.supportEmail} onChange={e => setFormData({...formData, supportEmail: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold text-lg" />
                 </div>
                 <div className="space-y-3 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Support Phone Node</Label>
                    <Input value={formData.supportPhone} onChange={e => setFormData({...formData, supportPhone: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold text-lg" />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-3 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Telegram Channel URL</Label>
                    <Input value={formData.telegramUrl} onChange={e => setFormData({...formData, telegramUrl: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold text-primary text-lg" />
                 </div>
                 <div className="space-y-3 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">HQ Physical Node (Address)</Label>
                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold text-lg" />
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
