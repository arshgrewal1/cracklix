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
  Image as ImageIcon,
  Stamp,
  FileBadge
} from "lucide-react"
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DistributionSettings, BrandingSettings } from "@/types";
import FileUpload from "@/components/admin/FileUpload";

/**
 * @fileOverview Institutional Administrative Portal v24.0.
 * UPDATED: Added comprehensive "Branding & Report" hub for dynamic PDF/Certificate control.
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

const DEFAULT_BRANDING: BrandingSettings = {
  websiteUrl: "https://cracklix.vercel.app",
  logoUrl: "",
  faviconUrl: "",
  footerText: "Punjab's most advanced government exam portal.",
  verificationUrl: "https://cracklix.vercel.app/results/view?id=",
  qrCodeUrl: "",
  certificateBgUrl: "",
  digitalStampUrl: "",
  organizationName: "Cracklix",
  supportEmail: "cracklixhelp@gmail.com",
  supportPhone: "+91 98881 88602",
  copyrightText: "© 2026 Cracklix. All Rights Reserved.",
  updatedAt: null
};

export default function AdminSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  const { profile } = useUser();
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const distRef = useMemo(() => (db ? doc(db, 'settings', 'distribution') : null), [db]);
  const brandRef = useMemo(() => (db ? doc(db, 'settings', 'branding') : null), [db]);

  const { data: remoteSettings, loading } = useDoc<any>(settingsRef);
  const { data: stats } = useDoc<any>(statsRef);
  const { data: remoteDist, loading: distLoading } = useDoc<DistributionSettings>(distRef);
  const { data: remoteBrand, loading: brandLoading } = useDoc<BrandingSettings>(brandRef);

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
  const [brandData, setBrandData] = useState<BrandingSettings>(DEFAULT_BRANDING);

  useEffect(() => {
    if (remoteSettings) setFormData(prev => ({ 
      ...prev, 
      ...remoteSettings,
      statsVisibility: { ...prev.statsVisibility, ...(remoteSettings.statsVisibility || {}) },
      statsTrends: { ...prev.statsTrends, ...(remoteSettings.statsTrends || {}) }
    }));
    if (remoteDist) setDistData(prev => ({ ...prev, ...remoteDist }));
    if (remoteBrand) setBrandData(prev => ({ ...prev, ...remoteBrand }));
  }, [remoteSettings, remoteDist, remoteBrand]);

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

  const handleSaveDoc = async (docId: string, data: any, sectionLabel: string) => {
    if (!db || isSaving) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', docId), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: `${docId.toUpperCase()}_UPDATE`,
        details: `${sectionLabel} hub updated.`,
        timestamp: serverTimestamp()
      });
      toast({ title: `${sectionLabel} Updated` });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || distLoading || brandLoading) return <div className="h-screen flex items-center justify-center bg-white"><RefreshCw className="h-10 w-10 text-primary animate-spin" /></div>

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

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="bg-slate-100 border border-slate-200 p-1.5 h-14 md:h-16 rounded-2xl mb-8 flex w-full md:w-auto overflow-x-auto no-scrollbar justify-start gap-2">
          <TabsTrigger value="branding" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Branding & Report</TabsTrigger>
          <TabsTrigger value="distribution" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Distribution & SEO</TabsTrigger>
          <TabsTrigger value="monetization" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Pass & Payments</TabsTrigger>
          <TabsTrigger value="homepage" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Social & Alerts</TabsTrigger>
          <TabsTrigger value="visibility" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Platform Stats</TabsTrigger>
          <TabsTrigger value="founder" className="rounded-xl px-6 md:px-8 font-black uppercase text-[9px] h-full whitespace-nowrap data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Founder Profile</TabsTrigger>
        </Tabs>

        <TabsContent value="branding" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              <div className="lg:col-span-8 space-y-12">
                 <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-3"><Stamp className="h-5 w-5 text-primary" /> Corporate Identity</h3>
                       <Button onClick={() => handleSaveDoc("branding", brandData, "Branding")} size="sm" className="h-9 px-6 rounded-lg bg-[#0F172A] font-bold text-[10px] uppercase">Save Identity</Button>
                    </div>
                    <Card className="border-none shadow-xl bg-white p-6 md:p-8 space-y-6 rounded-[2rem] border border-slate-50">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormNode label="Organization Name" value={brandData.organizationName} onChange={v => setBrandData({...brandData, organizationName: v})} placeholder="Cracklix" />
                          <FormNode label="Primary Website URL" value={brandData.websiteUrl} onChange={v => setBrandData({...brandData, websiteUrl: v})} placeholder="https://cracklix.com" />
                       </div>
                       <FormNode label="Copyright Text" value={brandData.copyrightText} onChange={v => setBrandData({...brandData, copyrightText: v})} />
                    </Card>
                 </section>

                 <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-3"><FileBadge className="h-5 w-5 text-emerald-500" /> Report & Verification</h3>
                       <Button onClick={() => handleSaveDoc("branding", brandData, "Verification")} size="sm" className="h-9 px-6 rounded-lg bg-[#0F172A] font-bold text-[10px] uppercase">Sync Hub</Button>
                    </div>
                    <Card className="border-none shadow-xl bg-white p-6 md:p-8 space-y-6 rounded-[2rem] border border-slate-50">
                       <FormNode label="Verification Base URL" value={brandData.verificationUrl} onChange={v => setBrandData({...brandData, verificationUrl: v})} placeholder="https://cracklix.com/results/view?id=" />
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Report Footer Abstract</Label>
                          <Textarea value={brandData.footerText} onChange={e => setBrandData({...brandData, footerText: e.target.value})} className="min-h-[100px] bg-slate-50 border-none rounded-xl" />
                       </div>
                    </Card>
                 </section>
              </div>

              <div className="lg:col-span-4 space-y-8">
                 <section className="space-y-6">
                    <h3 className="text-xl font-bold text-[#0F172A] px-1 flex items-center gap-3"><Layers className="h-5 w-5 text-blue-500" /> Asset Ingestion</h3>
                    <Card className="border-none shadow-xl bg-white p-6 md:p-8 space-y-8 rounded-[2rem] border border-slate-50">
                       <FileUpload label="Official Logo" folder="logos" value={brandData.logoUrl} onChange={m => setBrandData({...brandData, logoUrl: m?.url || ""})} variant="compact" />
                       <FileUpload label="Digital Stamp" folder="logos" value={brandData.digitalStampUrl} onChange={m => setBrandData({...brandData, digitalStampUrl: m?.url || ""})} variant="compact" />
                       <FileUpload label="Certificate Background" folder="banners" value={brandData.certificateBgUrl} onChange={m => setBrandData({...brandData, certificateBgUrl: m?.url || ""})} variant="compact" />
                    </Card>
                 </section>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              <div className="lg:col-span-8 space-y-12">
                 <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-3"><Globe className="h-5 w-5 text-blue-500" /> Website Hub</h3>
                       <Button onClick={() => handleSaveDoc("distribution", distData, "Distribution")} size="sm" className="h-9 px-6 rounded-lg bg-[#0F172A] font-bold text-[10px] uppercase">Save Hub</Button>
                    </div>
                    <Card className="border-none shadow-xl bg-white p-6 md:p-8 space-y-6 rounded-[2rem] border border-slate-50">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormNode label="Primary Website URL" value={distData.primaryWebsiteUrl} onChange={v => setDistData({...distData, primaryWebsiteUrl: v})} placeholder="https://cracklix.com" />
                          <FormNode label="Install Landing URL" value={distData.installUrl} onChange={v => setDistData({...distData, installUrl: v})} placeholder="https://cracklix.com/install" />
                       </div>
                    </Card>
                 </section>

                 <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-3"><Share2 className="h-5 w-5 text-emerald-500" /> Share Settings</h3>
                       <Button onClick={() => handleSaveDoc("distribution", distData, "Share")} size="sm" className="h-9 px-6 rounded-lg bg-[#0F172A] font-bold text-[10px] uppercase">Save Registry</Button>
                    </div>
                    <Card className="border-none shadow-xl bg-white p-6 md:p-8 space-y-6 rounded-[2rem] border border-slate-50">
                       <FormNode label="Universal Share Title" value={distData.shareTitle} onChange={v => setDistData({...distData, shareTitle: v})} />
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Social Message Template</Label>
                          <Textarea 
                             value={distData.shareMessage} 
                             onChange={e => setDistData({...distData, shareMessage: e.target.value})}
                             className="min-h-[200px] bg-slate-50 border-none rounded-xl"
                          />
                       </div>
                    </Card>
                 </section>
              </div>

              <div className="lg:col-span-4">
                 <Card className="border-none shadow-5xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100 sticky top-24">
                    <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                       {distData.ogImageUrl ? <img src={distData.ogImageUrl} className="h-full w-full object-cover" /> : <ImageIcon className="h-10 w-10 opacity-20" />}
                    </div>
                    <div className="p-8 space-y-3 text-left">
                       <h4 className="text-lg font-bold text-[#0F172A] line-clamp-2">{distData.seoTitle}</h4>
                       <p className="text-xs text-slate-500 line-clamp-2">{distData.seoDescription}</p>
                    </div>
                 </Card>
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
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Trial Duration (Days)</Label>
                       <Input type="number" value={formData.freeTrialDays} onChange={e => setFormData({...formData, freeTrialDays: parseInt(e.target.value) || 0})} className="h-12 bg-slate-50 border-none font-black text-emerald-600" />
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
                       <Input value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="h-12 bg-slate-50 border-none font-black text-primary" />
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        {/* Existing Tabs Continue (Homepage, Visibility, Founder, Social) */}
      </Tabs>
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
         <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 bg-slate-50 border-none font-bold text-[11px]" />
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
