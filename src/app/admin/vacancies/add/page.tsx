
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
  Link as LinkIcon
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Vacancy, ContentStatus, SelectionStage } from "@/types"
import FileUpload from "@/components/admin/FileUpload"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Enterprise Vacancy Builder Hub v2.0.
 * Apple-inspired multi-step recruitment ingestion engine.
 */

const BOARD_OPTIONS = [
  "PSSSB", "PPSC", "Punjab Police", "PSPCL", "PSTCL", "BFUHS",
  "Education Board", "High Court", "SSC", "RRB", "IBPS",
  "SBI", "UPSC", "NTA", "National Hub", "Manual Entry"
];

const STEPS = [
  { id: "basic", label: "Basic Info", icon: Megaphone },
  { id: "details", label: "Posts & Salary", icon: ClipboardList },
  { id: "eligibility", label: "Eligibility", icon: GraduationCap },
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
      toast({ title: "Registry Synced", description: "Recruitment record successfully committed." });
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
    <div className="max-w-[1600px] mx-auto space-y-10 pb-40 text-left pt-2 px-1">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm shrink-0"><ChevronLeft className="h-6 w-6" /></Button>
           <div className="text-left">
              <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-none uppercase">{id ? 'Edit Vacancy' : 'New Recruitment'}</h1>
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Enterprise Builder Hub v2.0</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
              <span className="text-[10px] font-black uppercase text-slate-400">Progress</span>
              <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }} />
              </div>
              <span className="text-[10px] font-black text-primary">{activeStep + 1}/{STEPS.length}</span>
           </div>
           <Button onClick={() => handleSave('DRAFT')} variant="outline" className="rounded-full h-11 md:h-12 px-6 font-bold uppercase text-[10px] tracking-tight">Save Draft</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* STEPPER NAVIGATION */}
        <aside className="lg:col-span-3 space-y-2">
           {STEPS.map((step, i) => (
              <button 
                key={step.id}
                onClick={() => setActiveStep(i)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border-2 text-left group",
                  activeStep === i 
                    ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl translate-x-2" 
                    : i < activeStep 
                      ? "bg-white border-emerald-100 text-emerald-600" 
                      : "bg-white border-transparent text-slate-400 hover:bg-slate-50"
                )}
              >
                 <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                    activeStep === i ? "bg-white/10 text-primary" : i < activeStep ? "bg-emerald-50 text-emerald-500" : "bg-slate-50"
                 )}>
                    {i < activeStep ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                 </div>
                 <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1 opacity-60">Step 0{i + 1}</p>
                    <p className="font-bold text-[14px] truncate">{step.label}</p>
                 </div>
              </button>
           ))}
        </aside>

        {/* FORM CONTENT */}
        <div className="lg:col-span-9 space-y-8">
           <Card className="border-none shadow-5xl rounded-[3rem] bg-white overflow-hidden border border-slate-100 min-h-[600px] flex flex-col">
              <div className="flex-1 p-8 md:p-12">
                 <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                       {activeStep === 0 && (
                          <div className="space-y-8">
                             <h2 className="text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Megaphone className="h-6 w-6 text-primary" /> Basic Information</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormNode label="Full Recruitment Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} placeholder="Punjab Police Constable Recruitment 2025" />
                                <FormNode label="Department Name" value={formData.department} onChange={v => setFormData({...formData, department: v})} placeholder="Home Affairs & Justice" />
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                   <Label className="text-[10px] font-black uppercase text-slate-400">Board Authority</Label>
                                   <select value={formData.board} onChange={e => setFormData({...formData, board: e.target.value})} className="w-full h-14 bg-slate-50 border-none rounded-xl px-5 font-bold outline-none">
                                      {BOARD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                   </select>
                                   {formData.board === 'Manual Entry' && (
                                      <Input value={customBoard} onChange={e => setCustomBoard(e.target.value)} className="mt-3 bg-blue-50 border-none font-bold" placeholder="Type board name..." />
                                   )}
                                </div>
                                <FormNode label="Category" value={formData.category} onChange={v => setFormData({...formData, category: v})} placeholder="Permanent" />
                                <FormNode label="Ad Number" value={formData.adNumber} onChange={v => setFormData({...formData, adNumber: v})} placeholder="01/2025" />
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <FormNode label="State" value={formData.state} disabled />
                                <FormNode label="District / Location" value={formData.district} onChange={v => setFormData({...formData, district: v})} />
                                <FormNode label="SEO Slug" value={formData.slug} onChange={v => setFormData({...formData, slug: v})} />
                             </div>
                          </div>
                       )}

                       {activeStep === 1 && (
                          <div className="space-y-8">
                             <h2 className="text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><ClipboardList className="h-6 w-6 text-emerald-500" /> Posts & Salary</h2>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <FormNode label="Total Posts" value={formData.totalPosts} onChange={v => setFormData({...formData, totalPosts: v})} placeholder="1746" />
                                <FormNode label="Salary / Pay Matrix" value={formData.salary} onChange={v => setFormData({...formData, salary: v})} placeholder="Pay Level 3" />
                                <FormNode label="Grade Pay" value={formData.gradePay} onChange={v => setFormData({...formData, gradePay: v})} />
                             </div>
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Category Wise Breakdown</Label>
                                <Textarea 
                                  value={formData.locationDetail} 
                                  onChange={e => setFormData({...formData, locationDetail: e.target.value})}
                                  placeholder="GEN: 500, SC: 200, BC: 150..."
                                  className="min-h-[150px] bg-slate-50 border-none rounded-2xl p-6"
                                />
                             </div>
                          </div>
                       )}

                       {activeStep === 2 && (
                          <div className="space-y-8">
                             <h2 className="text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><GraduationCap className="h-6 w-6 text-blue-500" /> Eligibility Criteria</h2>
                             <div className="space-y-6">
                                <div className="space-y-2">
                                   <Label className="text-[10px] font-black uppercase text-slate-400">Primary Education Qualification</Label>
                                   <Input value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="h-14 bg-slate-50 border-none rounded-xl font-bold px-5" placeholder="e.g. Graduation in any stream" />
                                </div>
                                <div className="space-y-2">
                                   <Label className="text-[10px] font-black uppercase text-slate-400">Detailed Qualification Nodes</Label>
                                   <Textarea value={formData.qualificationDetail} onChange={e => setFormData({...formData, qualificationDetail: e.target.value})} className="min-h-[150px] bg-slate-50 border-none rounded-2xl p-6" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <FormNode label="Age Limit" value={formData.ageLimit} onChange={v => setFormData({...formData, ageLimit: v})} placeholder="18-37 Years" />
                                   <FormNode label="Experience Required" value={formData.experience} onChange={v => setFormData({...formData, experience: v})} placeholder="Fresher / No" />
                                </div>
                             </div>
                          </div>
                       )}

                       {activeStep === 3 && (
                          <div className="space-y-8">
                             <h2 className="text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Target className="h-6 w-6 text-rose-500" /> Selection Process</h2>
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Process Summary</Label>
                                <Textarea 
                                  value={formData.selectionProcess} 
                                  onChange={e => setFormData({...formData, selectionProcess: e.target.value})} 
                                  className="min-h-[200px] bg-slate-50 border-none rounded-2xl p-6" 
                                  placeholder="1. Written Exam, 2. PST, 3. DV..."
                                />
                             </div>
                          </div>
                       )}

                       {activeStep === 4 && (
                          <div className="space-y-8">
                             <h2 className="text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><DollarSign className="h-6 w-6 text-emerald-600" /> Application Fees</h2>
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Fee Structure</Label>
                                <Textarea 
                                  value={formData.applicationFee} 
                                  onChange={e => setFormData({...formData, applicationFee: e.target.value})} 
                                  className="min-h-[150px] bg-slate-50 border-none rounded-2xl p-6" 
                                  placeholder="GEN: ₹1000, SC/BC: ₹250..."
                                />
                             </div>
                             <FormNode label="Payment Mode" value={formData.paymentMode} onChange={v => setFormData({...formData, paymentMode: v})} placeholder="Online Only" />
                          </div>
                       )}

                       {activeStep === 5 && (
                          <div className="space-y-8">
                             <h2 className="text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Clock className="h-6 w-6 text-orange-500" /> Important Dates</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormNode label="Start Date" type="date" value={formData.startDate} onChange={v => setFormData({...formData, startDate: v})} />
                                <FormNode label="Last Date" type="date" value={formData.lastDate} onChange={v => setFormData({...formData, lastDate: v})} />
                                <FormNode label="Exam Date" type="date" value={formData.examDate} onChange={v => setFormData({...formData, examDate: v})} />
                                <FormNode label="Result Date" type="date" value={formData.resultDate} onChange={v => setFormData({...formData, resultDate: v})} />
                             </div>
                          </div>
                       )}

                       {activeStep === 6 && ( activeStep === 6 && (
                          <div className="space-y-8">
                             <h2 className="text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><LinkIcon className="h-6 w-6 text-blue-400" /> Important Links</h2>
                             <div className="grid grid-cols-1 gap-6">
                                <FormNode label="Apply Online URL" value={formData.applyLink} onChange={v => setFormData({...formData, applyLink: v})} placeholder="https://..." />
                                <FormNode label="Official Website" value={formData.officialWebsite} onChange={v => setFormData({...formData, officialWebsite: v})} placeholder="https://..." />
                                <FileUpload label="Notification PDF" folder="vacancies" accept="application/pdf" value={formData.notificationPdfUrl} onChange={m => setFormData({...formData, notificationPdfUrl: m?.url})} />
                             </div>
                          </div>
                       ))}

                       {activeStep === 7 && (
                          <div className="space-y-8">
                             <h2 className="text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Globe className="h-6 w-6 text-primary" /> SEO Hub</h2>
                             <div className="space-y-6">
                                <FormNode label="SEO Title" value={formData.seoTitle} onChange={v => setFormData({...formData, seoTitle: v})} />
                                <div className="space-y-2">
                                   <Label className="text-[10px] font-black uppercase text-slate-400">Meta Description</Label>
                                   <Textarea value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} className="min-h-[100px] bg-slate-50 border-none rounded-xl" />
                                </div>
                             </div>
                          </div>
                       )}

                       {activeStep === 8 && (
                          <div className="space-y-12">
                             <h2 className="text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3"><Zap className="h-6 w-6 text-primary" /> Final Lifecycle Hub</h2>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ConfigSwitch label="Featured Listing" checked={formData.isFeatured || false} onChange={v => setFormData({...formData, isFeatured: v})} />
                                <ConfigSwitch label="Breaking News" checked={formData.isBreaking || false} onChange={v => setFormData({...formData, isBreaking: v})} />
                                <ConfigSwitch label="Urgent Recruitment" checked={formData.isUrgent || false} onChange={v => setFormData({...formData, isUrgent: v})} />
                                <ConfigSwitch label="Trending Now" checked={formData.isTrending || false} onChange={v => setFormData({...formData, isTrending: v})} />
                             </div>

                             <div className="pt-10 border-t border-slate-50">
                                <Button onClick={() => handleSave('PUBLISHED')} disabled={isSaving} className="w-full h-20 bg-primary hover:bg-blue-700 text-white font-black uppercase text-sm tracking-widest rounded-3xl shadow-4xl border-none">
                                   {isSaving ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Save className="h-6 w-6 mr-3" />} Commit & Push Live
                                </Button>
                             </div>
                          </div>
                       )}
                    </motion.div>
                 </AnimatePresence>
              </div>

              <footer className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                 <Button onClick={prevStep} disabled={activeStep === 0} variant="ghost" className="rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest text-slate-400">Back</Button>
                 <Button onClick={nextStep} disabled={activeStep === STEPS.length - 1} className="rounded-xl h-12 px-10 bg-[#0F172A] hover:bg-black font-black uppercase text-[10px] tracking-widest text-white shadow-xl">
                    Next Step <ChevronRight className="ml-2 h-4 w-4" />
                 </Button>
              </footer>
           </Card>
        </div>
      </div>
    </div>
  );
}

function FormNode({ label, type = "text", value, onChange, placeholder, disabled = false }: any) {
  return (
     <div className="space-y-2 text-left">
        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</Label>
        <Input 
           type={type} 
           value={value || ""} 
           onChange={e => onChange(e.target.value)} 
           className="h-14 rounded-xl border-none bg-slate-50 font-bold px-6 shadow-inner text-[#0F172A]" 
           placeholder={placeholder}
           disabled={disabled}
        />
     </div>
  )
}

function ConfigSwitch({ label, checked, onChange }: any) {
  return (
     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all">
        <div className="space-y-1">
           <p className="font-black text-[11px] uppercase text-[#0F172A]">{label}</p>
           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Master Node Toggle</p>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
     </div>
  )
}

function GraduationCap({ className }: any) {
   return <GraduationCapIcon className={className} />
}
