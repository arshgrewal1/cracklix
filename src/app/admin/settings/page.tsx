
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Shield, Layout, Bell, Save, RefreshCw, ShieldCheck, Lock, CloudLightning, FileCode, QrCode, Phone, Zap, Megaphone, MapPin, Mail, Twitter, Facebook, Instagram, Send } from "lucide-react"
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Final Enterprise CMS Node v5.0.
 * Features: Manual Payment Configuration, Announcement Toggle, and Social/Contact Registry.
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
    telegramUrl: "https://t.me/cracklixapp"
  });

  useEffect(() => {
    if (remoteSettings) setFormData(prev => ({ ...prev, ...remoteSettings }));
  }, [remoteSettings]);

  const handleSave = () => {
    if (!db) return;
    const payload = { ...formData, updatedAt: serverTimestamp() };
    setDoc(doc(db, 'settings', 'global'), payload, { merge: true })
      .then(() => toast({ title: "System Synced", description: "Institutional configuration is now live." }))
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><RefreshCw className="h-10 w-10 text-primary animate-spin" /></div>

  return (
    <div className="space-y-12 pb-20 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">System Configuration Node</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight">System Portal</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Enterprise Control: CMS, Security, and Payments.</p>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl gap-3">
          <Save className="h-5 w-5" /> Commit Platform Changes
        </Button>
      </div>

      <Tabs defaultValue="homepage" className="space-y-8">
        <TabsList className="bg-slate-100 border border-slate-200 p-1.5 h-16 rounded-2xl overflow-x-auto overflow-y-hidden custom-scrollbar">
          <TabsTrigger value="homepage" className="rounded-xl px-8 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Global CMS</TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl px-8 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Social & Contact</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl px-8 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Payment Registry</TabsTrigger>
          <TabsTrigger value="logic" className="rounded-xl px-8 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Logic Engines</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage">
          <Card className="border-slate-100 bg-white shadow-xl rounded-[3rem] p-12 space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Marquee Announcement</Label>
                   <Input value={formData.announcement} onChange={e => setFormData({...formData, announcement: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-slate-100 text-lg font-bold" />
                   
                   <div className="flex items-center justify-between p-6 bg-orange-50 rounded-2xl border border-orange-100 mt-4">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Megaphone className="h-5 w-5 text-primary" />
                         </div>
                         <div className="text-left">
                            <p className="font-black text-xs uppercase tracking-tight text-[#0F172A]">Display Announcement Bar</p>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Toggle visibility for all students.</p>
                         </div>
                      </div>
                      <Switch 
                         checked={formData.showAnnouncement} 
                         onCheckedChange={val => setFormData({...formData, showAnnouncement: val})} 
                      />
                   </div>
                </div>
                <div className="space-y-6">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Platform Identity</Label>
                   <Input value={formData.platformName} onChange={e => setFormData({...formData, platformName: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-slate-100 text-xl font-black" />
                </div>
             </div>
             
             <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Footer Abstract Description</Label>
                <Textarea 
                  value={formData.footerText} 
                  onChange={e => setFormData({...formData, footerText: e.target.value})} 
                  className="min-h-[100px] rounded-2xl bg-slate-50 border-slate-100 font-medium leading-relaxed" 
                />
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="social">
           <Card className="border-slate-100 bg-white shadow-xl rounded-[3rem] p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {/* Contact Details */}
                 <div className="space-y-8">
                    <h3 className="font-headline font-black text-xl uppercase flex items-center gap-3">
                       <Phone className="h-6 w-6 text-primary" /> Official Contact Info
                    </h3>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Office HQs Address</Label>
                          <div className="relative">
                             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="pl-12 h-14 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Support Email</Label>
                          <div className="relative">
                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input value={formData.supportEmail} onChange={e => setFormData({...formData, supportEmail: e.target.value})} className="pl-12 h-14 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Support WhatsApp/Phone</Label>
                          <div className="relative">
                             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input value={formData.supportPhone} onChange={e => setFormData({...formData, supportPhone: e.target.value})} className="pl-12 h-14 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Social Hub */}
                 <div className="space-y-8">
                    <h3 className="font-headline font-black text-xl uppercase flex items-center gap-3">
                       <Globe className="h-6 w-6 text-blue-500" /> Social Presence Hub
                    </h3>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Telegram Channel URL</Label>
                          <div className="relative">
                             <Send className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input value={formData.telegramUrl} onChange={e => setFormData({...formData, telegramUrl: e.target.value})} placeholder="https://t.me/..." className="pl-12 h-14 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Instagram URL</Label>
                          <div className="relative">
                             <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} placeholder="https://instagram.com/..." className="pl-12 h-14 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Twitter (X) URL</Label>
                          <div className="relative">
                             <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input value={formData.twitterUrl} onChange={e => setFormData({...formData, twitterUrl: e.target.value})} placeholder="https://x.com/..." className="pl-12 h-14 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Facebook Page URL</Label>
                          <div className="relative">
                             <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                             <Input value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} placeholder="https://facebook.com/..." className="pl-12 h-14 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="border-slate-100 bg-white shadow-xl rounded-[3rem] p-12 space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><QrCode className="h-3 w-3" /> Audit UPI ID</Label>
                   <Input value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-slate-100 text-xl font-black text-primary" placeholder="arshdeepgrewal1122@okaxis" />
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">This ID will be displayed to all students during manual checkout.</p>
                </div>
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="logic">
          <Card className="border-slate-100 bg-white shadow-xl rounded-[3rem] p-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <ConfigCard icon={<Shield className="text-rose-600" />} label="Negative Marking" desc="Apply penalty for mismatched choices." checked={formData.negativeMarking} onChange={(v: boolean) => setFormData({...formData, negativeMarking: v})} />
                <ConfigCard icon={<Zap className="text-emerald-600" />} label="AI Tutors" desc="Generate AI rationalizations for attempts." checked={formData.aiRationalization} onChange={(v: boolean) => setFormData({...formData, aiRationalization: v})} />
             </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ConfigCard({ icon, label, desc, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-primary/20 transition-all shadow-sm">
       <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">{icon}</div>
          <div className="space-y-1 text-left">
             <p className="font-black text-xs uppercase tracking-widest text-[#0F172A]">{label}</p>
             <p className="text-[10px] text-slate-500 uppercase font-bold">{desc}</p>
          </div>
       </div>
       <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
