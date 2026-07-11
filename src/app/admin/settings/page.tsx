
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ShieldCheck, Save, RefreshCw, QrCode, Share2, Smartphone, Apple, Play, Info, Megaphone, Target, Zap, Gift, Clock, MessageCircle, Star, User } from "lucide-react"
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

/**
 * @fileOverview Institutional Administrative Portal v17.0.
 * UPDATED: Added Founder Settings tab for live content management.
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
    freeTrialDays: 7,
    trustBadgeText: "Aspirants Trust Cracklix",
    trustBadgeCount: 10000,
    // Founder Details
    founderName: "Arsh Grewal",
    founderRole: "Founder & Lead Developer",
    founderBio: "Hi, I'm Arsh Grewal. As a student from Punjab, I personally experienced the struggle of finding a single, reliable platform dedicated to Punjab Government Exam preparation. Most resources were either scattered, outdated, or lacked the premium experience that modern aspirants deserve.",
    founderQuote: "Empowering every aspirant in Punjab with institutional-grade preparation technology.",
    founderMission: "To build Punjab's smartest, most trusted and student-first exam preparation platform where every aspirant gets access to quality mock tests and a premium preparation experience.",
    founderCommitment: "I am committed to continuously evolving this platform into Punjab's most trusted learning node. My goal is to ensure that quality preparation is accessible, affordable, and accurate for everyone—from Bathinda to Amritsar.",
    founderBuildingSince: "19 July 2026",
    founderEmail: "cracklixhelp@gmail.com"
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
    <div className="space-y-6 md:space-y-10 text-[#0F172A] text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">System Configuration</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">System Portal</h1>
        </div>
        <Button onClick={handleSave} className="w-full md:w-auto h-11 md:h-12 px-10 rounded-full font-bold shadow-xl gap-2 transition-all active:scale-95 border-none">
          <Save className="h-4 w-4" /> Commit Settings
        </Button>
      </div>

      <Tabs defaultValue="monetization" className="w-full">
        <TabsList className="bg-slate-100 border border-slate-200 p-1.5 h-14 md:h-16 rounded-2xl mb-8 flex w-full md:w-auto overflow-x-auto no-scrollbar justify-start gap-2">
          <TabsTrigger value="monetization" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Pass & Payments</TabsTrigger>
          <TabsTrigger value="homepage" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Global Content</TabsTrigger>
          <TabsTrigger value="founder" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Founder Profile</TabsTrigger>
          <TabsTrigger value="website" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Share & Mobile</TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Support Info</TabsTrigger>
        </TabsList>

        <TabsContent value="monetization" className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white p-5 md:p-12 space-y-6 md:space-y-8 border border-slate-50">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                       <Gift className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-black text-[#0F172A]">Free Trial Hub</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 md:p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                       <div className="space-y-0.5 text-left">
                          <p className="font-black text-[10px] uppercase text-emerald-900">Offer active</p>
                          <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Allow students to claim trial</p>
                       </div>
                       <Switch checked={formData.freeTrialEnabled} onCheckedChange={v => setFormData({...formData, freeTrialEnabled: v})} />
                    </div>
                    
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                          <Clock className="h-3 w-3" /> Trial duration (days)
                       </Label>
                       <Input 
                         type="number" 
                         value={formData.freeTrialDays} 
                         onChange={e => setFormData({...formData, freeTrialDays: parseInt(e.target.value) || 0})}
                         className="h-12 md:h-14 rounded-xl border-slate-50 bg-slate-50 font-black text-emerald-600 text-base md:text-lg"
                       />
                    </div>
                 </div>
              </Card>

              <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white p-5 md:p-12 space-y-6 md:space-y-8 border border-slate-50">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <QrCode className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-black text-[#0F172A]">Manual Payments</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Institutional UPI ID</Label>
                       <Input value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-50 bg-slate-50 font-black text-base md:text-lg text-primary" />
                    </div>
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">QR Code Image URL</Label>
                       <Input value={formData.qrCodeUrl} onChange={e => setFormData({...formData, qrCodeUrl: e.target.value})} className="h-11 rounded-xl border-slate-50 bg-slate-50 text-xs font-mono" placeholder="https://..." />
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="founder" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-14 space-y-8 md:space-y-12 text-left border border-slate-50">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                 <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                    <User className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-xl md:text-2xl font-black text-[#0F172A]">Founder Details</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meet the Founder Registry</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Full Name</Label>
                       <Input value={formData.founderName} onChange={e => setFormData({...formData, founderName: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Role / Tagline</Label>
                       <Input value={formData.founderRole} onChange={e => setFormData({...formData, founderRole: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Building Since</Label>
                       <Input value={formData.founderBuildingSince} onChange={e => setFormData({...formData, founderBuildingSince: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Direct Email</Label>
                       <Input value={formData.founderEmail} onChange={e => setFormData({...formData, founderEmail: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Main Narrative (Bio)</Label>
                       <Textarea value={formData.founderBio} onChange={e => setFormData({...formData, founderBio: e.target.value})} className="min-h-[150px] rounded-2xl bg-slate-50 border-none font-medium leading-relaxed" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Mission Statement</Label>
                       <Textarea value={formData.founderMission} onChange={e => setFormData({...formData, founderMission: e.target.value})} className="min-h-[100px] rounded-2xl bg-slate-50 border-none font-medium leading-relaxed" />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-8 border-t border-slate-50">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Featured Quote</Label>
                    <Input value={formData.founderQuote} onChange={e => setFormData({...formData, founderQuote: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold italic" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Final Commitment</Label>
                    <Textarea value={formData.founderCommitment} onChange={e => setFormData({...formData, founderCommitment: e.target.value})} className="min-h-[100px] rounded-2xl bg-slate-50 border-none font-medium leading-relaxed" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-14 space-y-10 text-left border border-slate-50">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-6">
                   <div className="space-y-2 text-left">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Global announcement</Label>
                      <Input value={formData.announcement} onChange={e => setFormData({...formData, announcement: e.target.value})} className="h-12 rounded-xl border-slate-50 bg-slate-50 font-bold" />
                   </div>
                   <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                         <div className="h-9 w-9 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm"><Megaphone className="h-4 w-4" /></div>
                         <p className="font-black text-[9px] uppercase text-[#0F172A] tracking-widest">Show announcement bar</p>
                      </div>
                      <Switch checked={formData.showAnnouncement} onCheckedChange={val => setFormData({...formData, showAnnouncement: val})} />
                   </div>
                </div>

                <div className="space-y-6 text-left">
                   <div className="space-y-2 text-left">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Platform name</Label>
                      <Input value={formData.platformName} onChange={e => setFormData({...formData, platformName: e.target.value})} className="h-12 rounded-xl border-slate-50 bg-slate-50 font-black text-lg" />
                   </div>
                   
                   <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-5">
                      <p className="text-[9px] font-black text-blue-900 uppercase tracking-[0.2em] flex items-center gap-2"><Star className="h-3.5 w-3.5" /> Trust Identity</p>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <Label className="text-[8px] font-black text-blue-500 uppercase">Trust count</Label>
                            <Input type="number" value={formData.trustBadgeCount} onChange={e => setFormData({...formData, trustBadgeCount: parseInt(e.target.value) || 0})} className="h-10 bg-white border-blue-100 font-black" />
                         </div>
                         <div className="space-y-1.5">
                            <Label className="text-[8px] font-black text-blue-500 uppercase">Label</Label>
                            <Input value={formData.trustBadgeText} onChange={e => setFormData({...formData, trustBadgeText: e.target.value})} className="h-10 bg-white border-blue-100 font-bold text-xs" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             <div className="space-y-2 text-left">
                <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Footer descriptor</Label>
                <Textarea value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} className="min-h-[100px] rounded-2xl border-slate-50 bg-slate-50 font-medium leading-relaxed" />
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white p-6 md:p-12 space-y-6 text-left border border-slate-50">
                 <div className="flex items-center gap-4 mb-2"><div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner"><Share2 className="h-5 w-5" /></div><h3 className="text-lg md:text-2xl font-black text-[#0F172A]">Share Settings</h3></div>
                 <div className="space-y-6">
                    <div className="space-y-2 text-left"><Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Share URL</Label><Input value={formData.shareUrl} onChange={e => setFormData({...formData, shareUrl: e.target.value})} className="h-12 rounded-xl border-slate-50 bg-slate-50 font-bold text-primary" /></div>
                    <div className="space-y-2 text-left"><Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Share Title</Label><Input value={formData.shareTitle} onChange={e => setFormData({...formData, shareTitle: e.target.value})} className="h-12 rounded-xl border-slate-50 bg-slate-50 font-bold" /></div>
                 </div>
              </Card>

              <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white p-6 md:p-12 space-y-6 text-left border border-slate-50">
                 <div className="flex items-center gap-4 mb-2"><div className="h-10 w-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-xl"><Smartphone className="h-5 w-5" /></div><h3 className="text-lg md:text-2xl font-black text-[#0F172A]">Native App Hub</h3></div>
                 <div className="space-y-6">
                    <div className="space-y-2 text-left"><Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Play Store link</Label><Input value={formData.playStoreUrl} onChange={e => setFormData({...formData, playStoreUrl: e.target.value})} className="h-12 rounded-xl border-slate-50 bg-slate-50 font-bold" /></div>
                    <div className="space-y-2 text-left"><Label className="text-[9px] font-black uppercase text-slate-400 ml-1">App Store link</Label><Input value={formData.appStoreUrl} onChange={e => setFormData({...formData, appStoreUrl: e.target.value})} className="h-12 rounded-xl border-slate-50 bg-slate-50 font-bold" /></div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-14 space-y-10 text-left border border-slate-50">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6 md:pb-8">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <MessageCircle className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-lg md:text-3xl font-black text-[#0F172A]">Support Registry</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional contact nodes</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                 <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Support email</Label>
                    <Input value={formData.supportEmail} onChange={e => setFormData({...formData, supportEmail: e.target.value})} className="h-12 rounded-xl border-slate-50 bg-slate-50 font-bold" />
                 </div>
                 <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Support phone</Label>
                    <Input value={formData.supportPhone} onChange={e => setFormData({...formData, supportPhone: e.target.value})} className="h-12 rounded-xl border-slate-50 bg-slate-50 font-bold" />
                 </div>
                 <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Telegram URL</Label>
                    <Input value={formData.telegramUrl} onChange={e => setFormData({...formData, telegramUrl: e.target.value})} className="h-12 rounded-xl border-slate-50 bg-slate-50 font-bold text-primary" />
                 </div>
                 <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Official address</Label>
                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-12 rounded-xl border-slate-50 bg-slate-50 font-bold" />
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
