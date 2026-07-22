
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  QrCode, 
  Share2, 
  Smartphone, 
  Play, 
  Info, 
  Megaphone, 
  Target, 
  Zap, 
  Gift, 
  Clock, 
  MessageCircle, 
  Star, 
  User,
  LayoutGrid,
  BarChart3,
  Eye, 
  EyeOff,
  TrendingUp,
  Users,
  CheckCircle2,
  X,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Globe,
  Award,
  Briefcase,
  Heart,
  Loader2,
  FileSearch,
  ExternalLink,
  Twitter,
  Image as ImageIcon
} from "lucide-react"
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DistributionSettings } from "@/types";

/**
 * @fileOverview Institutional Administrative Portal v22.0.
 * UPDATED: Replaced "Website" tab with full "Distribution" management system.
 */

const DEFAULT_DISTRIBUTION: DistributionSettings = {
  primaryWebsiteUrl: "https://cracklix.vercel.app",
  installUrl: "https://cracklix.vercel.app/install",
  playStoreUrl: "",
  appStoreUrl: "",
  shareTitle: "Cracklix – Punjab Government Exam Preparation Platform",
  shareDescription: "Prepare for Punjab Government Exams with Cracklix. Mock Tests, PYQs, and daily current affairs.",
  shareMessage: `🚀 Crack Punjab Government Exams with Cracklix!\n\n🎯 Prepare for:\n\n• PSSSB\n• PPSC\n• Punjab Police\n• PSPCL\n• PSTET\n• CTET\n• ETT\n• Master Cadre\n• Lecturer Cadre\n• School Lecturer\n• Punjab Government Recruitment\n\n📚 Features\n\n✅ Unlimited Mock Tests\n✅ Previous Year Papers\n✅ Daily Quiz\n✅ Daily Current Affairs\n✅ Topic-wise MCQs\n✅ Fast Performance\n✅ Mobile Friendly\n✅ PWA Support\n\n📲 Install App\n{installUrl}\n\n🌐 Website\n{websiteUrl}`,
  seoTitle: "Cracklix – Punjab Government Exam Preparation Platform",
  seoDescription: "Prepare for Punjab Government Exams with Cracklix. Practice Unlimited Mock Tests, Previous Year Papers, Daily Quiz, Current Affairs and Topic-wise MCQs for PSSSB, PPSC, Punjab Police, PSPCL, PSTET, CTET, ETT, Master Cadre, Lecturer Cadre, School Lecturer and all Punjab competitive exams.",
  ogImageUrl: "",
  twitterImageUrl: "",
  keywords: "Punjab Government Exams, PSSSB, PPSC, Punjab Police, PSPCL, PSTET, CTET, ETT, Master Cadre, Lecturer Cadre, School Lecturer, Mock Test, Previous Year Papers, Current Affairs, Quiz, MCQ, Cracklix",
  canonicalUrl: "https://cracklix.com",
  updatedAt: null
};

export default function AdminSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  const { profile } = useUser();
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const distRef = useMemo(() => (db ? doc(db, "settings", "distribution") : null), [db]);

  const { data: remoteSettings, loading } = useDoc<any>(settingsRef);
  const { data: stats } = useDoc<any>(statsRef);
  const { data: remoteDist, loading: distLoading } = useDoc<DistributionSettings>(distRef);

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
    instagramUrl: "https://www.instagram.com/arshgrewal_official/",
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
    statsVisibility: {
      showQuestions: true,
      showMocks: true,
      showCategories: true,
      showSupport: true,
      showStudents: false
    },
    statsTrends: {
      questions: "+28 this week",
      mocks: "+2 this month",
      categories: "Updated regularly",
      students: "+84 this week",
      support: "Live now"
    },
    studentCounterMode: "manual" as "manual" | "auto",
    studentCounterThreshold: 1000,
    founderName: "Arsh Grewal",
    founderRole: "Founder & Lead Developer",
    founderBio: "Hi, I'm Arsh Grewal. As a student from Punjab, I personally experienced the struggle of finding a single, reliable platform dedicated to Punjab Government Exam preparation.",
    founderQuote: "Empowering every aspirant in Punjab with institutional-grade preparation technology.",
    founderMission: "To build Punjab's smartest, most trusted and student-first exam preparation platform.",
    founderCommitment: "I am committed to continuously evolving this platform into Punjab's most trusted learning node.",
    founderBuildingSince: "19 July 2026",
    founderEmail: "cracklixhelp@gmail.com"
  });

  const [distData, setDistData] = useState<DistributionSettings>(DEFAULT_DISTRIBUTION);

  useEffect(() => {
    if (remoteSettings) setFormData(prev => ({ 
      ...prev, 
      ...remoteSettings,
      statsVisibility: { ...prev.statsVisibility, ...(remoteSettings.statsVisibility || {}) },
      statsTrends: { ...prev.statsTrends, ...(remoteSettings.statsTrends || {}) }
    }));
    if (remoteDist) setDistData(prev => ({ ...prev, ...remoteDist }));
  }, [remoteSettings, remoteDist]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGlobal = async () => {
    if (!db || isSaving) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), { ...formData, updatedAt: serverTimestamp() }, { merge: true });
      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: "SETTINGS_UPDATE",
        details: `Global system configurations synchronized.`,
        timestamp: serverTimestamp()
      });
      toast({ title: "Registry Synced" });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDistribution = async (sectionLabel: string) => {
    if (!db || isSaving) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'distribution'), { ...distData, updatedAt: serverTimestamp() }, { merge: true });
      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: "DISTRIBUTION_UPDATE",
        details: `${sectionLabel} distribution settings updated.`,
        timestamp: serverTimestamp()
      });
      toast({ title: "Distribution Updated", description: `${sectionLabel} synchronized successfully.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || distLoading) return <div className="h-screen flex items-center justify-center bg-white"><RefreshCw className="h-10 w-10 text-primary animate-spin" /></div>

  return (
    <div className="space-y-6 md:space-y-10 text-[#0F172A] text-left animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">System Configuration</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">System Portal</h1>
        </div>
        <Button onClick={handleSaveGlobal} disabled={isSaving} className="w-full md:w-auto h-11 md:h-12 px-10 rounded-full font-bold shadow-xl gap-2 transition-all active:scale-95 border-none">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Global Hub
        </Button>
      </div>

      <Tabs defaultValue="distribution" className="w-full">
        <TabsList className="bg-slate-100 border border-slate-200 p-1.5 h-14 md:h-16 rounded-2xl mb-8 flex w-full md:w-auto overflow-x-auto no-scrollbar justify-start gap-2">
          <TabsTrigger value="distribution" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Distribution & SEO</TabsTrigger>
          <TabsTrigger value="monetization" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Pass & Payments</TabsTrigger>
          <TabsTrigger value="homepage" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Branding & Alerts</TabsTrigger>
          <TabsTrigger value="visibility" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Platform Stats</TabsTrigger>
          <TabsTrigger value="founder" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Founder Profile</TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Support Node</TabsTrigger>
        </Tabs>

        <TabsContent value="distribution" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              <div className="lg:col-span-8 space-y-12">
                 {/* 1. WEBSITE URLS */}
                 <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-3"><Globe className="h-5 w-5 text-blue-500" /> Website Hub</h3>
                       <Button onClick={() => handleSaveDistribution("Website URLs")} size="sm" className="h-9 px-6 rounded-lg bg-[#0F172A] font-bold text-[10px] uppercase">Save Hub</Button>
                    </div>
                    <Card className="border-none shadow-xl bg-white p-6 md:p-8 space-y-6 rounded-[2rem] border border-slate-50">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormNode label="Primary Website URL" value={distData.primaryWebsiteUrl} onChange={v => setDistData({...distData, primaryWebsiteUrl: v})} placeholder="https://cracklix.com" />
                          <FormNode label="Install Landing URL" value={distData.installUrl} onChange={v => setDistData({...distData, installUrl: v})} placeholder="https://cracklix.com/install" />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormNode label="Play Store App URL" value={distData.playStoreUrl} onChange={v => setDistData({...distData, playStoreUrl: v})} placeholder="https://play.google.com/..." />
                          <FormNode label="App Store App URL" value={distData.appStoreUrl} onChange={v => setDistData({...distData, appStoreUrl: v})} placeholder="https://apps.apple.com/..." />
                       </div>
                    </Card>
                 </section>

                 {/* 2. SHARE SETTINGS */}
                 <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-3"><Share2 className="h-5 w-5 text-emerald-500" /> Share Settings</h3>
                       <Button onClick={() => handleSaveDistribution("Share Settings")} size="sm" className="h-9 px-6 rounded-lg bg-[#0F172A] font-bold text-[10px] uppercase">Save Registry</Button>
                    </div>
                    <Card className="border-none shadow-xl bg-white p-6 md:p-8 space-y-6 rounded-[2rem] border border-slate-50">
                       <FormNode label="Universal Share Title" value={distData.shareTitle} onChange={v => setDistData({...distData, shareTitle: v})} />
                       <FormNode label="Social Share Description" value={distData.shareDescription} onChange={v => setDistData({...distData, shareDescription: v})} />
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">WhatsApp/Social Message Template</Label>
                          <Textarea 
                             value={distData.shareMessage} 
                             onChange={e => setDistData({...distData, shareMessage: e.target.value})}
                             className="min-h-[220px] bg-slate-50 border-none rounded-xl p-5 font-medium text-sm leading-relaxed shadow-inner"
                             placeholder="Use {websiteUrl} and {installUrl} as placeholders..."
                          />
                          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest px-1">Supports {'{websiteUrl}'} and {'{installUrl}'} placeholders</p>
                       </div>
                    </Card>
                 </section>

                 {/* 3. SEO REGISTRY */}
                 <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-3"><FileSearch className="h-5 w-5 text-purple-500" /> SEO Registry</h3>
                       <Button onClick={() => handleSaveDistribution("SEO Settings")} size="sm" className="h-9 px-6 rounded-lg bg-[#0F172A] font-bold text-[10px] uppercase">Sync Index</Button>
                    </div>
                    <Card className="border-none shadow-xl bg-white p-6 md:p-8 space-y-6 rounded-[2rem] border border-slate-50">
                       <FormNode label="Meta Title Node" value={distData.seoTitle} onChange={v => setDistData({...distData, seoTitle: v})} />
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Meta Description</Label>
                          <Textarea value={distData.seoDescription} onChange={e => setDistData({...distData, seoDescription: e.target.value})} className="min-h-[120px] bg-slate-50 border-none rounded-xl" />
                       </div>
                       <FormNode label="Keywords (Comma separated)" value={distData.keywords} onChange={v => setDistData({...distData, keywords: v})} placeholder="Punjab Exams, PSSSB, Mock Test..." />
                       <FormNode label="Canonical Hub URL" value={distData.canonicalUrl} onChange={v => setDistData({...distData, canonicalUrl: v})} />
                    </Card>
                 </section>
              </div>

              {/* 4. SOCIAL PREVIEW (SIDEBAR) */}
              <div className="lg:col-span-4 space-y-8">
                 <div className="sticky top-24 space-y-8">
                    <div className="space-y-2 px-1">
                       <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-3"><Eye className="h-5 w-5 text-primary" /> Live Preview</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp & Facebook Simulation</p>
                    </div>

                    <Card className="border-none shadow-5xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100 group">
                       <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                          {distData.ogImageUrl ? (
                             <img src={distData.ogImageUrl} className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Preview" />
                          ) : (
                             <div className="flex flex-col items-center gap-3 opacity-20">
                                <ImageIcon className="h-10 w-10" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No OG Asset</p>
                             </div>
                          )}
                       </div>
                       <div className="p-8 space-y-3 bg-white border-t border-slate-50 text-left">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">{new URL(distData.primaryWebsiteUrl || "https://cracklix.com").hostname}</p>
                          <h4 className="text-xl font-bold text-[#0F172A] leading-tight line-clamp-2">{distData.seoTitle}</h4>
                          <p className="text-[13px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{distData.seoDescription}</p>
                       </div>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2rem] bg-[#0F172A] text-white p-8 space-y-8 text-left">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><Zap className="h-5 w-5" /></div>
                          <h4 className="font-bold text-lg">Asset Mapping</h4>
                       </div>
                       <div className="space-y-6">
                          <FormNode 
                            label="Open Graph Image URL" 
                            dark 
                            value={distData.ogImageUrl} 
                            onChange={v => setDistData({...distData, ogImageUrl: v})} 
                            placeholder="https://.../og-image.jpg" 
                          />
                          <FormNode 
                            label="Twitter Card Image URL" 
                            dark 
                            value={distData.twitterImageUrl} 
                            onChange={v => setDistData({...distData, twitterImageUrl: v})} 
                            placeholder="https://.../twitter-card.jpg" 
                          />
                       </div>
                       <div className="pt-6 border-t border-white/5 flex items-center gap-3 text-emerald-400">
                          <ShieldCheck className="h-4 w-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Registry Sync Safe</span>
                       </div>
                    </Card>
                 </div>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="monetization" className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white p-5 md:p-12 space-y-6 md:space-y-8 border border-slate-50 text-left">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                       <Gift className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-black text-[#0F172A]">Free Trial Hub</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 md:p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                       <div className="space-y-0.5 text-left">
                          <p className="font-black text-[10px] uppercase text-emerald-900">Offer Active</p>
                          <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Allow students to claim trial</p>
                       </div>
                       <Switch checked={formData.freeTrialEnabled} onCheckedChange={v => setFormData({...formData, freeTrialEnabled: v})} />
                    </div>
                    
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                          <Clock className="h-3 w-3" /> Trial Duration (Days)
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

              <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white p-5 md:p-12 space-y-6 md:space-y-8 border border-slate-50 text-left">
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

        <TabsContent value="visibility" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                 <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-8 text-left border border-slate-50">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                       <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <BarChart3 className="h-6 w-6" />
                       </div>
                       <div>
                          <h3 className="text-xl md:text-2xl font-black text-[#0F172A]">Homepage Statistics</h3>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select cards to display publicly</p>
                       </div>
                    </div>
                    
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <VisibilityToggle 
                            label="Practice Questions" 
                            icon={<Zap className="text-blue-500" />} 
                            checked={formData.statsVisibility.showQuestions} 
                            onChange={(v) => setFormData({...formData, statsVisibility: {...formData.statsVisibility, showQuestions: v}})} 
                          />
                          <VisibilityToggle 
                            label="Mock Tests" 
                            icon={<LayoutGrid className="text-purple-500" />} 
                            checked={formData.statsVisibility.showMocks} 
                            onChange={(v) => setFormData({...formData, statsVisibility: {...formData.statsVisibility, showMocks: v}})} 
                          />
                          <VisibilityToggle 
                            label="Exam Categories" 
                            icon={<ShieldCheck className="text-emerald-500" />} 
                            checked={formData.statsVisibility.showCategories} 
                            onChange={(v) => setFormData({...formData, statsVisibility: {...formData.statsVisibility, showCategories: v}})} 
                          />
                          <VisibilityToggle 
                            label="Student Support" 
                            icon={<MessageCircle className="text-orange-500" />} 
                            checked={formData.statsVisibility.showSupport} 
                            onChange={(v) => setFormData({...formData, statsVisibility: {...formData.statsVisibility, showSupport: v}})} 
                          />
                       </div>

                       <div className="pt-6 border-t border-slate-50 text-left">
                          <h4 className="text-[10px] font-black uppercase text-primary tracking-widest mb-6 flex items-center gap-2">
                             <TrendingUp className="h-3 w-3" /> Growth Trend Labels
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <TrendInput label="Questions Trend" value={formData.statsTrends.questions} onChange={(v) => setFormData({...formData, statsTrends: {...formData.statsTrends, questions: v}})} />
                             <TrendInput label="Mocks Trend" value={formData.statsTrends.mocks} onChange={(v) => setFormData({...formData, statsTrends: {...formData.statsTrends, mocks: v}})} />
                             <TrendInput label="Categories Trend" value={formData.statsTrends.categories} onChange={(v) => setFormData({...formData, statsTrends: {...formData.statsTrends, categories: v}})} />
                             <TrendInput label="Students Trend" value={formData.statsTrends.students} onChange={(v) => setFormData({...formData, statsTrends: {...formData.statsTrends, students: v}})} />
                             <TrendInput label="Support Trend" value={formData.statsTrends.support} onChange={(v) => setFormData({...formData, statsTrends: {...formData.statsTrends, support: v}})} />
                          </div>
                       </div>
                    </div>
                 </Card>

                 <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-8 text-left border border-slate-50">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                       <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                          <Users className="h-6 w-6" />
                       </div>
                       <div>
                          <h3 className="text-xl md:text-2xl font-black text-[#0F172A]">Student Counter Control</h3>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Manage trust metrics visibility</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="flex-1 space-y-1.5 w-full text-left">
                             <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Visibility Mode</Label>
                             <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                                <button 
                                  onClick={() => setFormData({...formData, studentCounterMode: 'manual'})}
                                  className={cn("flex-1 h-10 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all", formData.studentCounterMode === 'manual' ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600")}
                                >Manual</button>
                                <button 
                                  onClick={() => setFormData({...formData, studentCounterMode: 'auto'})}
                                  className={cn("flex-1 h-10 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all", formData.studentCounterMode === 'auto' ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600")}
                                >Automatic</button>
                             </div>
                          </div>
                          {formData.studentCounterMode === 'auto' && (
                             <div className="flex-1 space-y-1.5 w-full animate-in zoom-in-95 text-left">
                                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Threshold Registry</Label>
                                <Input 
                                  type="number" 
                                  value={formData.studentCounterThreshold}
                                  onChange={(e) => setFormData({...formData, studentCounterThreshold: parseInt(e.target.value) || 0})}
                                  className="h-12 bg-slate-50 border-none font-black text-center"
                                />
                             </div>
                          )}
                       </div>

                       <div className={cn("p-6 rounded-2xl border flex items-center justify-between transition-all", formData.statsVisibility.showStudents ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100")}>
                          <div className="space-y-0.5 text-left">
                             <p className={cn("font-black text-[10px] uppercase", formData.statsVisibility.showStudents ? "text-emerald-900" : "text-slate-900")}>Show Student Count</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">This overrides the support card on homepage</p>
                          </div>
                          <Switch 
                            checked={formData.statsVisibility.showStudents} 
                            disabled={formData.studentCounterMode === 'auto'}
                            onCheckedChange={(v) => setFormData({...formData, statsVisibility: {...formData.statsVisibility, showStudents: v}})} 
                          />
                       </div>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-5">
                 <Card className="border-none shadow-2xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-10 space-y-8 sticky top-24 overflow-hidden group text-left">
                    <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Target className="h-64 w-64" /></div>
                    <div className="relative z-10 space-y-8">
                       <div className="space-y-1">
                          <h3 className="text-2xl font-black tracking-tight">Live Registry Sync</h3>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Current Database Snapshots</p>
                       </div>
                       
                       <div className="space-y-4">
                          <LiveMetric label="Registered Students" value={stats?.totalUsers || 0} icon={<Users className="text-primary" />} />
                          <LiveMetric label="Platform Status" value={formData.statsVisibility.showStudents ? "STUDENTS LIVE" : "SUPPORT ACTIVE"} icon={formData.statsVisibility.showStudents ? <Eye className="text-emerald-500" /> : <EyeOff className="text-amber-500" />} />
                       </div>

                       <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                          <p className="text-[9px] font-black uppercase text-primary tracking-widest">Preview Logic</p>
                          <div className="space-y-2">
                             <PreviewLogicStep label="1. Questions" active={formData.statsVisibility.showQuestions} />
                             <PreviewLogicStep label="2. Mock Tests" active={formData.statsVisibility.showMocks} />
                             <PreviewLogicStep label="3. Categories" active={formData.statsVisibility.showCategories} />
                             <PreviewLogicStep label="4. " active={true} value={formData.statsVisibility.showStudents || (formData.studentCounterMode === 'auto' && (stats?.totalUsers || 0) >= formData.studentCounterThreshold) ? 'Students' : 'Support'} />
                          </div>
                       </div>
                    </div>
                 </Card>
              </div>
           </div>
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

        <TabsContent value="founder" className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-14 space-y-10 text-left border border-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                 <div className="space-y-6">
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Founder Full Name</Label>
                       <Input value={formData.founderName} onChange={e => setFormData({...formData, founderName: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Professional Role</Label>
                       <Input value={formData.founderRole} onChange={e => setFormData({...formData, founderRole: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Founder Short Quote</Label>
                       <Input value={formData.founderQuote} onChange={e => setFormData({...formData, founderQuote: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-medium italic" />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Official Mission</Label>
                       <Textarea value={formData.founderMission} onChange={e => setFormData({...formData, founderMission: e.target.value})} className="min-h-[100px] rounded-2xl bg-slate-50 border-none font-medium leading-relaxed" />
                    </div>
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Building Since (Date Label)</Label>
                       <Input value={formData.founderBuildingSince} onChange={e => setFormData({...formData, founderBuildingSince: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                 </div>
              </div>
              <div className="space-y-2 text-left">
                 <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Founder Biography (Detailed)</Label>
                 <Textarea value={formData.founderBio} onChange={e => setFormData({...formData, founderBio: e.target.value})} className="min-h-[150px] rounded-2xl bg-slate-50 border-none font-medium leading-relaxed" />
              </div>
              <div className="space-y-2 text-left">
                 <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Commitment Statement</Label>
                 <Textarea value={formData.founderCommitment} onChange={e => setFormData({...formData, founderCommitment: e.target.value})} className="min-h-[100px] rounded-2xl bg-slate-50 border-none font-medium leading-relaxed" />
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-14 space-y-10 text-left border border-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                 <div className="space-y-6">
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Phone className="h-3 w-3" /> Support Phone (WhatsApp)</Label>
                       <Input value={formData.supportPhone} onChange={e => setFormData({...formData, supportPhone: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Mail className="h-3 w-3" /> Support Email</Label>
                       <Input value={formData.supportEmail} onChange={e => setFormData({...formData, supportEmail: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><MessageCircle className="h-3 w-3" /> Telegram Community URL</Label>
                       <Input value={formData.telegramUrl} onChange={e => setFormData({...formData, telegramUrl: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-mono text-xs text-blue-500" />
                    </div>
                    <div className="space-y-2 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Instagram className="h-3 w-3" /> Instagram Profile URL</Label>
                       <Input value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-mono text-xs text-rose-500" />
                    </div>
                 </div>
              </div>
              <div className="space-y-2 text-left">
                 <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><MapPin className="h-3 w-3" /> Institutional HQs Address</Label>
                 <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-medium" />
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function VisibilityToggle({ label, icon, checked, onChange }: any) {
   return (
      <div className={cn("p-4 rounded-xl border flex items-center justify-between transition-all", checked ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50/50 border-slate-50 opacity-60")}>
         <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center shadow-inner">{icon}</div>
            <span className="text-[11px] font-bold text-slate-700">{label}</span>
         </div>
         <Switch checked={checked} onCheckedChange={onChange} />
      </div>
   )
}

function TrendInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
   return (
      <div className="space-y-1.5 text-left">
         <Label className="text-[8px] font-black uppercase text-slate-400 ml-1">{label}</Label>
         <Input 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder="e.g. +28 this week" 
            className="h-10 bg-slate-50 border-none font-bold text-[11px]"
         />
      </div>
   )
}

function LiveMetric({ label, value, icon }: any) {
   return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
         <div className="flex items-center gap-3 text-left">
            {icon}
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
         </div>
         <span className="text-xl font-black tabular-nums">{value}</span>
      </div>
   )
}

function PreviewLogicStep({ label, active, value }: any) {
   return (
      <div className="flex items-center justify-between text-[10px] font-bold">
         <span className="text-slate-500">{label} {value && <span className="text-white ml-1">{value}</span>}</span>
         {active ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <X className="h-3 w-3 text-slate-600" />}
      </div>
   )
}

function FormNode({ label, value, onChange, placeholder, dark = false }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, dark?: boolean }) {
  return (
    <div className="space-y-1.5 text-left">
      <Label className={cn("text-[9px] font-black uppercase ml-1 tracking-widest", dark ? "text-slate-400" : "text-slate-500")}>{label}</Label>
      <Input 
        value={value || ""} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
        className={cn(
          "h-12 rounded-xl border-none font-bold px-5 shadow-sm",
          dark ? "bg-white/5 text-white" : "bg-slate-50 text-[#0F172A]"
        )} 
      />
    </div>
  )
}
