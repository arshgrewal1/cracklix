
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Shield, Layout, Bell, Save, RefreshCw, ShieldCheck, Lock, CloudLightning, FileCode, QrCode, Phone, Zap, Megaphone, MapPin, Mail, Twitter, Facebook, Instagram, Send, MousePointer2, Smartphone, Apple, Play, Share2, Info } from "lucide-react"
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Final Enterprise CMS Node v6.6.
 * Updated: Website Share Registry controls added.
 */

export default function AdminSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: remoteSettings, loading } = useDoc<any>(settingsRef);

  const [formData, setFormData] = useState({
    heroLine1: "Prepare Smarter.",
    heroLine2: "Score Higher.",
    heroDescription: "Punjab's most advanced government exam portal. Join 15,000+ aspirants today.",
    heroImageUrl: "https://picsum.photos/seed/punjab/1200/800",
    announcement: "🔥 Official Punjab 2026 Recruitment Calendar Live.",
    showAnnouncement: true,
    platformName: "Cracklix",
    footerText: "Punjab's most advanced government exam portal. Designed for aspirants, built with integrity.",
    address: "Shergarh, Bathinda, Punjab",
    revenueReady: false,
    negativeMarking: true,
    aiRationalization: true,
    upiId: "arshdeepgrewal1122@okaxis",
    supportPhone: "+91 98881 88602",
    supportEmail: "cracklixhelp@gmail.com",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    telegramUrl: "https://t.me/cracklixapp",
    playStoreUrl: "",
    appStoreUrl: "",
    adSenseEnabled: false,
    adSenseClientCode: "",
    shareUrl: "https://cracklix.com",
    shareTitle: "CRACKLIX | Punjab Exam Authority Hub",
    shareDescription: "Practice Mock Tests and Prepare for Punjab Government Exams (PSSSB, PPSC, Police)."
  });

  useEffect(() => {
    if (remoteSettings) setFormData(prev => ({ ...prev, ...remoteSettings }));
  }, [remoteSettings]);

  const handleSave = () => {
    if (!db) return;
    const payload = { ...formData, updatedAt: serverTimestamp() };
    setDoc(doc(db, 'settings', 'global'), payload, { merge: true })
      .then(() => toast({ title: "System Synced", description: "Institutional configuration and share settings are now live." }))
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><RefreshCw className="h-10 w-10 text-primary animate-spin" /></div>

  return (
    <div className="space-y-8 pb-20 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div>
           <div className="flex items-center gap-3 mb-1.5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">System Configuration Node</span>
           </div>
          <h1 className="text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">System Portal</h1>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 h-12 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl gap-2">
          <Save className="h-4 w-4" /> Commit Changes
        </Button>
      </div>

      <Tabs defaultValue="homepage" className="px-4">
        <TabsList className="bg-slate-100 border border-slate-200 p-1 h-14 rounded-xl mb-8 overflow-x-auto no-scrollbar">
          <TabsTrigger value="homepage" className="rounded-lg px-6 font-black uppercase text-[10px] h-full">Global CMS</TabsTrigger>
          <TabsTrigger value="website" className="rounded-lg px-6 font-black uppercase text-[10px] h-full">Website Settings</TabsTrigger>
          <TabsTrigger value="mobile" className="rounded-lg px-6 font-black uppercase text-[10px] h-full">App Settings</TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg px-6 font-black uppercase text-[10px] h-full">Contact Hub</TabsTrigger>
          <TabsTrigger value="monetization" className="rounded-lg px-6 font-black uppercase text-[10px] h-full">Monetization</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage">
          <Card className="border-none shadow-lg rounded-[2rem] bg-white p-8 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase text-slate-500">Marquee Announcement</Label>
                   <Input value={formData.announcement} onChange={e => setFormData({...formData, announcement: e.target.value})} className="h-12 rounded-xl font-bold" />
                   <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <p className="font-black text-[10px] uppercase text-[#0F172A]">Display Announcement Bar</p>
                      <Switch checked={formData.showAnnouncement} onCheckedChange={val => setFormData({...formData, showAnnouncement: val})} />
                   </div>
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase text-slate-500">Platform Name</Label>
                   <Input value={formData.platformName} onChange={e => setFormData({...formData, platformName: e.target.value})} className="h-12 rounded-xl font-black" />
                </div>
             </div>
             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-500">Footer Text</Label>
                <Textarea value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} className="min-h-[80px] rounded-xl font-medium" />
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="website">
           <Card className="border-none shadow-lg rounded-[2rem] bg-white p-8 space-y-8">
              <div className="flex items-center gap-3 mb-4">
                 <Share2 className="h-6 w-6 text-primary" />
                 <h3 className="font-headline font-black text-lg uppercase">Website Share Registry</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-500">Global Share URL</Label>
                       <Input value={formData.shareUrl} onChange={e => setFormData({...formData, shareUrl: e.target.value})} className="h-12 rounded-xl font-bold text-primary" placeholder="https://cracklix.com" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-500">Share Title</Label>
                       <Input value={formData.shareTitle} onChange={e => setFormData({...formData, shareTitle: e.target.value})} className="h-12 rounded-xl font-bold" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Share Description (Social Text)</Label>
                    <Textarea value={formData.shareDescription} onChange={e => setFormData({...formData, shareDescription: e.target.value})} className="min-h-[110px] rounded-xl font-medium" />
                 </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-[11px] font-medium text-slate-600 leading-relaxed uppercase">
                    This URL and metadata will be used when users click the "Share CRACKLIX" buttons across the platform. Changing these values will update all share buttons instantly.
                 </p>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="mobile">
           <Card className="border-none shadow-lg rounded-[2rem] bg-white p-8 space-y-8">
              <div className="flex items-center gap-3 mb-4">
                 <Smartphone className="h-6 w-6 text-primary" />
                 <h3 className="font-headline font-black text-lg uppercase">Mobile Distribution Registry</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><Play className="h-3 w-3" /> Play Store Link</Label>
                    <Input value={formData.playStoreUrl} onChange={e => setFormData({...formData, playStoreUrl: e.target.value})} className="h-12 rounded-xl font-bold text-primary" placeholder="https://play.google.com/..." />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><Apple className="h-3 w-3" /> App Store Link</Label>
                    <Input value={formData.appStoreUrl} onChange={e => setFormData({...formData, appStoreUrl: e.target.value})} className="h-12 rounded-xl font-bold text-primary" placeholder="https://apps.apple.com/..." />
                 </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-[11px] font-medium text-slate-600 leading-relaxed uppercase">
                    Buttons for App Stores will automatically render on the landing page once these URLs are populated. Leave blank to hide the buttons.
                 </p>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="social">
           <Card className="border-none shadow-lg rounded-[2rem] bg-white p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-slate-500">HQs Address</Label>
                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-12 rounded-xl" />
                    <Label className="text-[10px] font-black uppercase text-slate-500">Support Email</Label>
                    <Input value={formData.supportEmail} onChange={e => setFormData({...formData, supportEmail: e.target.value})} className="h-12 rounded-xl" />
                    <Label className="text-[10px] font-black uppercase text-slate-500">Support Phone</Label>
                    <Input value={formData.supportPhone} onChange={e => setFormData({...formData, supportPhone: e.target.value})} className="h-12 rounded-xl" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Telegram Link</Label>
                    <Input value={formData.telegramUrl} onChange={e => setFormData({...formData, telegramUrl: e.target.value})} className="h-12 rounded-xl" />
                    <Label className="text-[10px] font-black uppercase text-slate-500">Instagram Link</Label>
                    <Input value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="h-12 rounded-xl" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="monetization">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-lg rounded-[2rem] bg-white p-8 space-y-6">
                 <h3 className="font-headline font-black text-lg uppercase flex items-center gap-3"><QrCode className="h-5 w-5" /> UPI Node</h3>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Registry UPI ID</Label>
                    <Input value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="h-12 rounded-xl font-black text-primary" />
                 </div>
              </Card>
              <Card className="border-none shadow-lg rounded-[2rem] bg-white p-8 space-y-6">
                 <h3 className="font-headline font-black text-lg uppercase flex items-center gap-3"><MousePointer2 className="h-5 w-5" /> AdSense</h3>
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-black text-[10px] uppercase text-[#0F172A]">AdSense Enabled</p>
                    <Switch checked={formData.adSenseEnabled} onCheckedChange={val => setFormData({...formData, adSenseEnabled: val})} />
                 </div>
                 <Textarea value={formData.adSenseClientCode} onChange={e => setFormData({...formData, adSenseClientCode: e.target.value})} className="min-h-[80px] rounded-xl font-mono text-[10px]" placeholder="Paste global script here..." />
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
