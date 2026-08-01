"use client"

import React, { Suspense, useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useFirestore, useDoc } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ChevronLeft, 
  ChevronRight,
  Save, 
  Loader2, 
  Megaphone, 
  ShieldCheck, 
  Globe, 
  Clock, 
  Layers, 
  FileText,
  MapPin,
  Zap,
  Edit3,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  ClipboardList,
  Target,
  DollarSign,
  Search,
  Link as LinkIcon,
  GraduationCap as GraduationCapIcon
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Vacancy, ContentStatus } from "@/types"
import FileUpload from "@/components/admin/FileUpload"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @fileOverview Enterprise Vacancy Builder Hub v2.2.
 * FIXED: Added missing AnimatePresence and motion imports.
 */

const BOARD_OPTIONS = [
  "PSSSB", "PPSC", "Punjab Police", "PSPCL", "PSTCL", "BFUHS",
  "Education Board", "High Court", "SSC", "RRB", "IBPS",
  "SBI", "UPSC", "NTA", "National Hub", "Manual Entry"
];

const STEPS = [
  { id: "basic", label: "Basic Info", icon: Megaphone },
  { id: "details", label: "Posts & Salary", icon: ClipboardList },
  { id: "eligibility", label: "Eligibility", icon: GraduationCapIcon },
  { id: "selection", label: "Selection", icon: Target },
  { id: "fees", label: "Fees", icon: DollarSign },
  { id: "dates", label: "Dates", icon: Clock },
  { id: "links", label: "Links", icon: LinkIcon },
  { id: "seo", label: "SEO Hub", icon: Globe },
  { id: "publish", label: "Publish", icon: Zap }
];

export default function AddVacancyPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <VacancyBuilder />
    </Suspense>
  )
}

function VacancyBuilder() {
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeStep, setActiveStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [customBoard, setCustomBoard] = useState("")

  const { data: existingData, loading: fetchLoading } = useDoc<any>(useMemo(() => (db && id ? doc(db, "vacancies", id) : null), [db, id]))
  
  const [formData, setFormData] = useState<Partial<Vacancy>>({
    title: "",
    department: "",
    board: "PSSSB",
    recruitmentName: "",
    category: "Government",
    type: "Permanent",
    adNumber: "",
    postName: "",
    totalPosts: "",
    categoryWisePosts: [],
    salary: "",
    payMatrix: "",
    payLevel: "",
    gradePay: "",
    ageLimit: "",
    ageRelaxation: "",
    education: "",
    qualificationDetail: "",
    experience: "No",
    selectionProcess: "",
    selectionStages: [],
    physicalStandards: "",
    medicalStandards: "",
    applicationFee: "",
    feeDetails: [],
    paymentMode: "Online",
    officialWebsite: "",
    applyLink: "",
    state: "Punjab",
    district: "All Districts",
    locationDetail: "",
    startDate: "",
    lastDate: "",
    feeLastDate: "",
    examDate: "",
    status: "DRAFT" as ContentStatus,
    isFeatured: false,
    isBreaking: false,
    isUrgent: false,
    isTrending: false,
    showOnHomepage: true,
    sendNotification: true,
    slug: "",
    priority: 1,
    views: 0,
    clicks: 0,
    saves: 0,
    shares: 0
  })

  useEffect(() => {
    if (existingData) {
      setFormData({ ...existingData });
      if (!BOARD_OPTIONS.includes(existingData.board)) {
         setFormData(prev => ({ ...prev, board: "Manual Entry" }));
         setCustomBoard(existingData.board);
      }
    }
  }, [existingData])

  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, formData.slug]);

  const handleSave = async (finalStatus?: ContentStatus) => {
    if (!db || isSaving) return;
    setIsSaving(true);
    
    const finalId = id || `vac-${Date.now()}`;
    const status = finalStatus || formData.status || "DRAFT";
    const docRef = doc(db, "vacancies", finalId);

    const payload = {
      ...formData,
      id: finalId,
      board: formData.board === 'Manual Entry' ? customBoard.trim() : formData.board,
      status,
      updatedAt: serverTimestamp(),
      createdAt: id ? (existingData?.createdAt || serverTimestamp()) : serverTimestamp(),
      publishedAt: status === 'PUBLISHED' ? (existingData?.publishedAt || serverTimestamp()) : null
    };

    try {
      await setDoc(docRef, payload, { merge: true });
      toast({ title: "Registry Synced" });
      router.push("/admin/vacancies");
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));

  if (id && fetchLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-40 text-left pt-2 px-1">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl border bg-white h-10 w-10 shadow-sm shrink-0"><ChevronLeft className="h-5 w-5" /></Button>
           <div className="text-left">
              <h1 className="text-xl md:text-3xl font-black text-[#0F172A] leading-tight uppercase truncate max-w-[200px] md:max-w-none">{id ? 'Modify Record' : 'New Vacancy'}</h1>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Builder Hub v2.1</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-black uppercase text-slate-400">Step</span>
              <span className="text-xs font-black text-primary tabular-nums">{activeStep + 1}/{STEPS.length}</span>
           </div>
           <Button onClick={() => handleSave('DRAFT')} variant="outline" className="h-10 px-5 font-bold text-[10px] uppercase border-slate-200">Draft</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <aside className="lg:col-span-3 space-y-1.5">
           {STEPS.map((step, i) => (
              <button 
                key={step.id}
                onClick={() => setActiveStep(i)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all border-2 text-left group",
                  activeStep === i 
                    ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl" 
                    : i < activeStep 
                      ? "bg-white border-emerald-50 text-emerald-600" 
                      : "bg-white border-transparent text-slate-400 hover:bg-slate-50"
                )}
              >
                 <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    activeStep === i ? "bg-white/10 text-primary" : i < activeStep ? "bg-emerald-50 text-emerald-500" : "bg-slate-50"
                 )}>
                    {i < activeStep ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                 </div>
                 <p className="font-bold text-[13px] truncate">{step.label}</p>
              </button>
           ))}
        </aside>

        <div className="lg:col-span-9 space-y-6">
           <Card className="border border-slate-100 shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white overflow-hidden min-h-[500px] flex flex-col">
              <div className="flex-1 p-6 md:p-10">
                 <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                       {activeStep === 0 && (
                          <div className="space-y-6">
                             <h2 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Megaphone className="h-5 w-5 text-primary" /> Basic info</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormNode label="Full Recruitment Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} placeholder="Punjab Police Constable 2025" />
                                <FormNode label="Department Name" value={formData.department} onChange={v => setFormData({...formData, department: v})} placeholder="Home Affairs" />
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                   <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Board authority</Label>
                                   <select value={formData.board} onChange={e => setFormData({...formData, board: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                                      {BOARD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                   </select>
                                   {formData.board === 'Manual Entry' && <Input value={customBoard} onChange={e => setCustomBoard(e.target.value)} className="mt-2 h-10 bg-blue-50 border-none font-bold text-xs" placeholder="Type name..." />}
                                </div>
                                <FormNode label="Category" value={formData.category} onChange={v => setFormData({...formData, category: v})} placeholder="Permanent" />
                                <FormNode label="Ad Number" value={formData.adNumber} onChange={v => setFormData({...formData, adNumber: v})} placeholder="01/2025" />
                             </div>
                          </div>
                       )}

                       {activeStep === 1 && (
                          <div className="space-y-6">
                             <h2 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><ClipboardList className="h-5 w-5 text-emerald-600" /> Posts & Salary</h2>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormNode label="Total Posts" value={formData.totalPosts} onChange={v => setFormData({...formData, totalPosts: v})} placeholder="1746" />
                                <FormNode label="Salary Hub" value={formData.salary} onChange={v => setFormData({...formData, salary: v})} placeholder="Pay Level 3" />
                                <FormNode label="Grade Pay" value={formData.gradePay} onChange={v => setFormData({...formData, gradePay: v})} />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Breakdown details</Label>
                                <Textarea value={formData.locationDetail} onChange={e => setFormData({...formData, locationDetail: e.target.value})} placeholder="GEN: 500, SC: 200..." className="min-h-[120px] bg-slate-50 border-none rounded-xl text-sm" />
                             </div>
                          </div>
                       )}

                       {activeStep === 2 && (
                          <div className="space-y-6">
                             <h2 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><GraduationCapIcon className="h-5 w-5 text-blue-500" /> Eligibility</h2>
                             <FormNode label="Primary Qualification" value={formData.education} onChange={v => setFormData({...formData, education: v})} placeholder="e.g. Graduation" />
                             <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Detail nodes</Label>
                                <Textarea value={formData.qualificationDetail} onChange={e => setFormData({...formData, qualificationDetail: e.target.value})} className="min-h-[120px] bg-slate-50 border-none rounded-xl" />
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                                <FormNode label="Age Limit" value={formData.ageLimit} onChange={v => setFormData({...formData, ageLimit: v})} placeholder="18-37" />
                                <FormNode label="Experience" value={formData.experience} onChange={v => setFormData({...formData, experience: v})} placeholder="No" />
                             </div>
                          </div>
                       )}

                       {activeStep === 3 && (
                          <div className="space-y-6">
                             <h2 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Target className="h-5 w-5 text-rose-500" /> Selection</h2>
                             <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Process Narrative</Label>
                                <Textarea value={formData.selectionProcess} onChange={e => setFormData({...formData, selectionProcess: e.target.value})} className="min-h-[200px] bg-slate-50 border-none rounded-xl p-5" placeholder="1. Exam, 2. Physical..." />
                             </div>
                          </div>
                       )}

                       {activeStep === 4 && (
                          <div className="space-y-6">
                             <h2 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><DollarSign className="h-5 w-5 text-emerald-600" /> Fees</h2>
                             <Textarea value={formData.applicationFee} onChange={e => setFormData({...formData, applicationFee: e.target.value})} className="min-h-[150px] bg-slate-50 border-none rounded-xl p-5" placeholder="GEN: ₹1000..." />
                             <FormNode label="Payment Mode" value={formData.paymentMode} onChange={v => setFormData({...formData, paymentMode: v})} placeholder="Online" />
                          </div>
                       )}

                       {activeStep === 5 && (
                          <div className="space-y-6">
                             <h2 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Clock className="h-5 w-5 text-orange-500" /> Timeline</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormNode label="Start Date" type="date" value={formData.startDate} onChange={v => setFormData({...formData, startDate: v})} />
                                <FormNode label="Last Date" type="date" value={formData.lastDate} onChange={v => setFormData({...formData, lastDate: v})} />
                                <FormNode label="Exam Date" type="date" value={formData.examDate} onChange={v => setFormData({...formData, examDate: v})} />
                                <FormNode label="Result Date" type="date" value={formData.resultDate} onChange={v => setFormData({...formData, resultDate: v})} />
                             </div>
                          </div>
                       )}

                       {activeStep === 6 && (
                          <div className="space-y-6">
                             <h2 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><LinkIcon className="h-5 w-5 text-blue-400" /> Registry Links</h2>
                             <div className="grid grid-cols-1 gap-6">
                                <FormNode label="Apply Online Hub" value={formData.applyLink} onChange={v => setFormData({...formData, applyLink: v})} placeholder="https://..." />
                                <FormNode label="Official Site" value={formData.officialWebsite} onChange={v => setFormData({...formData, officialWebsite: v})} placeholder="https://..." />
                                <FileUpload label="Official Notification PDF" folder="vacancies" accept="application/pdf" value={formData.notificationPdfUrl} onChange={m => setFormData({...formData, notificationPdfUrl: m?.url})} />
                             </div>
                          </div>
                       )}

                       {activeStep === 7 && (
                          <div className="space-y-6">
                             <h2 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Globe className="h-5 w-5 text-primary" /> Meta Hub</h2>
                             <div className="space-y-4">
                                <FormNode label="SEO Title" value={formData.seoTitle} onChange={v => setFormData({...formData, seoTitle: v})} />
                                <div className="space-y-2">
                                   <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Meta Description</Label>
                                   <Textarea value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} className="min-h-[100px] bg-slate-50 border-none rounded-xl" />
                                </div>
                             </div>
                          </div>
                       )}

                       {activeStep === 8 && (
                          <div className="space-y-10">
                             <h2 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Zap className="h-5 w-5 text-primary" /> Lifecycle Hub</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ConfigSwitch label="Featured Listing" checked={formData.isFeatured || false} onChange={v => setFormData({...formData, isFeatured: v})} />
                                <ConfigSwitch label="Breaking News" checked={formData.isBreaking || false} onChange={v => setFormData({...formData, isBreaking: v})} />
                                <ConfigSwitch label="Urgent Entry" checked={formData.isUrgent || false} onChange={v => setFormData({...formData, isUrgent: v})} />
                                <ConfigSwitch label="Trending Now" checked={formData.isTrending || false} onChange={v => setFormData({...formData, isTrending: v})} />
                             </div>
                             <div className="pt-8 border-t border-slate-100">
                                <Button onClick={() => handleSave('PUBLISHED')} disabled={isSaving} className="w-full h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-3xl border-none">
                                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Save className="h-5 w-5 mr-3" />} Commit & Sync Live
                                </Button>
                             </div>
                          </div>
                       )}
                    </motion.div>
                 </AnimatePresence>
              </div>

              <footer className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                 <Button onClick={prevStep} disabled={activeStep === 0} variant="ghost" className="h-10 px-6 font-bold uppercase text-[9px] text-slate-400">Back</Button>
                 <Button onClick={nextStep} disabled={activeStep === STEPS.length - 1} className="h-10 px-8 bg-[#0F172A] hover:bg-black font-bold uppercase text-[9px] text-white shadow-lg">Next <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>
              </footer>
           </Card>
        </div>
      </div>
    </div>
  );
}

function FormNode({ label, type = "text", value, onChange, placeholder, disabled = false }: any) {
  return (
     <div className="space-y-1.5 text-left">
        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-tight">{label}</Label>
        <Input type={type} value={value || ""} onChange={e => onChange(e.target.value)} className="h-12 rounded-xl border-none bg-slate-50 font-bold px-4 shadow-inner text-[#0F172A]" placeholder={placeholder} disabled={disabled} />
     </div>
  )
}

function ConfigSwitch({ label, checked, onChange }: any) {
  return (
     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group transition-all">
        <div className="space-y-0.5">
           <p className="font-black text-[10px] uppercase text-[#0F172A]">{label}</p>
           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Active Node</p>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
     </div>
  )
}
