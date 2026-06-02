
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Database, Shield, Layout, Image as ImageIcon, Bell, Save, RefreshCw, Share2, Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react"
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

/**
 * @fileOverview Phase 40-42: Site Settings & Dynamic CMS.
 * Manages Hero, Announcements, Identity, and Social Presence.
 */

export default function AdminSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: remoteSettings, loading } = useDoc<any>(settingsRef);

  const [formData, setFormData] = useState({
    heroLine1: "Prepare Smarter.",
    heroLine2: "Score Higher.",
    heroDescription: "Complete your Punjab Government Exam preparation on a single platform. Trust Cracklix for professional success.",
    heroImageUrl: "https://picsum.photos/seed/punjab/1200/800",
    announcement: "🔥 Punjab Police Recruitment 2026 Applications Open",
    showAnnouncement: true,
    platformName: "Cracklix",
    supportEmail: "cracklixhelp@gmail.com",
    supportPhone: "+91 98881 88602",
    facebookUrl: "https://facebook.com/cracklix",
    instagramUrl: "https://instagram.com/cracklix",
    twitterUrl: "https://twitter.com/cracklix",
    footerText: "Punjab's most advanced government exam portal. Designed for aspirants, built with integrity.",
    negativeMarking: true,
    aiRationalization: true
  });

  useEffect(() => {
    if (remoteSettings) {
      setFormData(prev => ({ ...prev, ...remoteSettings }));
    }
  }, [remoteSettings]);

  const handleSave = () => {
    if (!db) return;
    
    const payload = {
      ...formData,
      updatedAt: serverTimestamp(),
      updatedBy: "Super Admin"
    };

    setDoc(doc(db, 'settings', 'global'), payload, { merge: true })
      .then(() => {
        toast({ title: "System Synced", description: "Global configuration is now live for all users." });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/settings/global',
          operation: 'write',
          requestResourceData: payload,
        }));
      });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A] space-y-4">
      <RefreshCw className="h-10 w-10 text-primary animate-spin" />
      <p className="text-xs font-black uppercase text-slate-500 tracking-widest">Accessing Portal CMS...</p>
    </div>
  )

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-5xl font-headline font-black text-primary uppercase tracking-tight">System Portal</h1>
          <p className="text-muted-foreground mt-2 text-lg">Super Admin: Dynamic CMS, Announcement Engine, and Core Logic.</p>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 gap-3">
          <Save className="h-5 w-5" /> Commit Changes
        </Button>
      </div>

      <Tabs defaultValue="hero" className="space-y-8">
        <TabsList className="bg-white/5 border border-white/5 p-1.5 h-16 rounded-2xl">
          <TabsTrigger value="hero" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2"><Layout className="h-4 w-4" /> Homepage CMS</TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2"><Bell className="h-4 w-4" /> Broadcasts</TabsTrigger>
          <TabsTrigger value="identity" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2"><Globe className="h-4 w-4" /> Identity</TabsTrigger>
          <TabsTrigger value="logic" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2"><Shield className="h-4 w-4" /> Logic</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card className="border-none bg-card/50 shadow-3xl rounded-[3rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-white/5">
              <CardTitle className="text-2xl font-headline font-black uppercase">Hero Section Management</CardTitle>
              <CardDescription>Customize the first impression for Punjab aspirants.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Headline 01</Label>
                    <Input value={formData.heroLine1} onChange={e => setFormData({...formData, heroLine1: e.target.value})} className="h-14 rounded-xl bg-background border-none shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-primary">Headline 02 (Highlight)</Label>
                    <Input value={formData.heroLine2} onChange={e => setFormData({...formData, heroLine2: e.target.value})} className="h-14 rounded-xl bg-background border-none shadow-inner text-primary font-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Primary Sub-Description</Label>
                    <Textarea value={formData.heroDescription} onChange={e => setFormData({...formData, heroDescription: e.target.value})} className="min-h-[120px] rounded-2xl bg-background border-none p-6 leading-relaxed" />
                  </div>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Hero Image URL</Label>
                      <Input value={formData.heroImageUrl} onChange={e => setFormData({...formData, heroImageUrl: e.target.value})} className="h-14 rounded-xl bg-background border-none shadow-inner" />
                   </div>
                   <div className="h-64 w-full rounded-[2.5rem] bg-background border-2 border-dashed border-white/5 relative overflow-hidden group">
                      {formData.heroImageUrl ? (
                        <img src={formData.heroImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 italic">No image reference</div>
                      )}
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <ImageIcon className="h-8 w-8 text-primary/40 mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visual Preview</span>
                      </div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="border-none bg-card/50 shadow-3xl rounded-[3rem]">
             <CardContent className="p-12 space-y-12">
                <div className="flex items-center justify-between p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                   <div className="space-y-1">
                      <h4 className="text-xl font-headline font-black uppercase text-primary">Global Announcement Bar</h4>
                      <p className="text-sm text-slate-400 font-medium">Toggle high-priority alerts across the entire platform.</p>
                   </div>
                   <Switch checked={formData.showAnnouncement} onCheckedChange={val => setFormData({...formData, showAnnouncement: val})} />
                </div>
                
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Marquee Content</Label>
                   <Input value={formData.announcement} onChange={e => setFormData({...formData, announcement: e.target.value})} className="h-16 rounded-2xl bg-background border-none text-lg font-bold shadow-inner" placeholder="e.g. 🔥 Punjab Police SI Results Live" />
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity">
          <Card className="border-none bg-card/50 shadow-3xl rounded-[3rem]">
             <CardContent className="p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Platform Brand</Label>
                      <Input value={formData.platformName} onChange={e => setFormData({...formData, platformName: e.target.value})} className="h-14 rounded-xl bg-background border-none" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Support Email</Label>
                      <Input value={formData.supportEmail} onChange={e => setFormData({...formData, supportEmail: e.target.value})} className="h-14 rounded-xl bg-background border-none" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Support Hotline</Label>
                      <Input value={formData.supportPhone} onChange={e => setFormData({...formData, supportPhone: e.target.value})} className="h-14 rounded-xl bg-background border-none" />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500">Footer Abstract</Label>
                   <Textarea value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} className="min-h-[100px] rounded-2xl bg-background border-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-white/5">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Facebook URL</Label>
                      <Input value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} className="h-12 rounded-xl bg-background border-none" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Instagram URL</Label>
                      <Input value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="h-12 rounded-xl bg-background border-none" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Twitter URL</Label>
                      <Input value={formData.twitterUrl} onChange={e => setFormData({...formData, twitterUrl: e.target.value})} className="h-12 rounded-xl bg-background border-none" />
                   </div>
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logic">
          <Card className="border-none bg-card/50 shadow-3xl rounded-[3rem]">
             <CardContent className="p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <ConfigToggle label="Negative Marking" desc="Enforce -1.0 penalty for mismatched audit selections." checked={formData.negativeMarking} onChange={(val: boolean) => setFormData({...formData, negativeMarking: val})} />
                   <ConfigToggle label="AI Tutor Logic" desc="Enable Gemini-powered step-by-step rationalizations." checked={formData.aiRationalization} onChange={(val: boolean) => setFormData({...formData, aiRationalization: val})} />
                </div>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ConfigToggle({ label, desc, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/5">
       <div className="space-y-1">
          <p className="font-black text-xs uppercase tracking-widest text-slate-100">{label}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold">{desc}</p>
       </div>
       <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
