"use client"

import React, { Suspense, useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useFirestore, useDoc, useCollection } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection, query, orderBy } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
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
  Edit3
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Vacancy, ContentStatus } from "@/types"
import FileUpload from "@/components/admin/FileUpload"

/**
 * @fileOverview Modular Vacancy Ingestion Node v2.0.
 * UPDATED: Integrated Enterprise File Management Hub for all assets.
 */

const BOARD_OPTIONS = [
  "PSSSB", "PPSC", "Punjab Police", "PSPCL", "PSTCL", "BFUHS",
  "Education Board (ETT/Master Cadre)", "High Court", "SSC", "RRB", "IBPS",
  "SBI", "UPSC", "NTA", "National Hub", "Manual Entry"
];

export default function AddVacancyPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <VacancyFormWrapper />
    </Suspense>
  )
}

function VacancyFormWrapper() {
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [customBoard, setCustomBoard] = useState("")

  const { data: existingData, loading: fetchLoading } = useDoc<any>(useMemo(() => (db && id ? doc(db, "vacancies", id) : null), [db, id]))
  
  const [formData, setFormData] = useState<Partial<Vacancy>>({
    title: "",
    department: "",
    board: "PSSSB",
    category: "Government",
    type: "Government",
    adNumber: "",
    postName: "",
    totalPosts: "",
    salary: "",
    ageLimit: "",
    education: "",
    experience: "No",
    selectionProcess: "",
    applicationFee: "",
    officialWebsite: "",
    applyLink: "",
    state: "Punjab",
    district: "All Districts",
    startDate: "",
    lastDate: "",
    status: "DRAFT" as ContentStatus,
    isFeatured: false,
    isBreaking: true,
    showOnHomepage: true,
    sendNotification: true,
    priority: 1,
    tags: [],
    views: 0,
    clicks: 0
  })

  useEffect(() => {
    if (existingData) {
      setFormData({ ...existingData })
      if (!BOARD_OPTIONS.includes(existingData.board)) {
         setFormData(prev => ({ ...prev, board: "Manual Entry" }));
         setCustomBoard(existingData.board);
      }
    }
  }, [existingData])

  const handleSave = async (status: ContentStatus = formData.status || "DRAFT") => {
    if (!db || isSaving) return
    if (!formData.title || !formData.department || !formData.lastDate) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Job Title, Department, and Last Date are mandatory nodes." })
       return
    }

    setIsSaving(true)
    const finalId = id || `vac-${Date.now()}`
    const docRef = doc(db, "vacancies", finalId)

    const payload = {
      ...formData,
      id: finalId,
      board: formData.board === 'Manual Entry' ? customBoard.trim() : formData.board,
      status,
      updatedAt: serverTimestamp(),
      createdAt: id ? (existingData?.createdAt || serverTimestamp()) : serverTimestamp(),
      publishedAt: status === 'PUBLISHED' ? serverTimestamp() : (existingData?.publishedAt || null)
    }

    try {
      await setDoc(docRef, payload, { merge: true })
      toast({ title: "Registry Synced" })
      router.push("/admin/vacancies")
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  if (id && fetchLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-40 text-left pt-2 px-1">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm shrink-0"><ChevronLeft className="h-6 w-6" /></Button>
           <div className="text-left">
              <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-none uppercase">{id ? 'Modify Vacancy' : 'New Ingestion Node'}</h1>
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Institutional Recruitment Portal</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
           <Button onClick={() => handleSave('PUBLISHED')} disabled={isSaving} className="flex-1 md:flex-none h-12 md:h-14 px-10 md:px-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-full shadow-2xl gap-3 border-none transition-all active:scale-95">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-5 w-5" />} Commit & Sync
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-14">
        <div className="lg:col-span-8 space-y-8">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
              <TabsList className="bg-slate-100 border border-slate-200 p-1.5 h-16 rounded-2xl flex w-full overflow-x-auto no-scrollbar justify-start gap-2">
                 <FormTab value="basic" label="Basic Details" icon={Megaphone} />
                 <FormTab value="eligibility" label="Eligibility" icon={ShieldCheck} />
                 <FormTab value="dates" label="Dates & Fees" icon={Clock} />
                 <FormTab value="media" label="Assets Hub" icon={Layers} />
                 <FormTab value="seo" label="Optimization" icon={Globe} />
              </TabsList>

              <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white p-6 md:p-12 space-y-10 border border-slate-50">
                 <TabsContent value="basic" className="space-y-10 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FormInput label="Job Title" value={formData.title} onChange={(v: string) => setFormData({...formData, title: v})} placeholder="e.g. Punjab Police Constable Recruitment 2025" />
                       <FormInput label="Department" value={formData.department} onChange={(v: string) => setFormData({...formData, department: v})} placeholder="e.g. Home Affairs & Justice" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-4">
                          <FormSelect label="Recruitment Board" value={formData.board} onChange={(v: string) => setFormData({...formData, board: v})} options={BOARD_OPTIONS} />
                          {formData.board === 'Manual Entry' && (
                             <div className="space-y-2 animate-in slide-in-from-top-2">
                                <Label className="text-[9px] font-black uppercase text-primary ml-1 flex items-center gap-2">
                                   <Edit3 className="h-3 w-3" /> Type Board Name
                                </Label>
                                <Input value={customBoard} onChange={e => setCustomBoard(e.target.value)} className="h-11 rounded-xl bg-blue-50 border-none font-bold px-5 shadow-sm text-primary" placeholder="e.g. PU Chandigarh" />
                             </div>
                          )}
                       </div>
                       <FormSelect label="Category" value={formData.category} onChange={(v: string) => setFormData({...formData, category: v})} options={["Government", "Contract", "Semi-Govt", "Institutional"]} />
                       <FormInput label="Ad Number" value={formData.adNumber} onChange={(v: string) => setFormData({...formData, adNumber: v})} placeholder="e.g. 01/2025" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FormInput label="Post Name" value={formData.postName} onChange={(v: string) => setFormData({...formData, postName: v})} placeholder="e.g. Sub Inspector (District Cadre)" />
                       <FormInput label="Total Posts" value={formData.totalPosts} onChange={(v: string) => setFormData({...formData, totalPosts: v})} placeholder="e.g. 1746" />
                    </div>
                    <FormInput label="Official Website" value={formData.officialWebsite} onChange={(v: string) => setFormData({...formData, officialWebsite: v})} placeholder="https://..." />
                 </TabsContent>

                 <TabsContent value="eligibility" className="space-y-10 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FormTextarea label="Education Qualification" value={formData.education} onChange={(v: string) => setFormData({...formData, education: v})} placeholder="e.g. 10+2 (Intermediate) with Punjabi as a subject..." />
                       <FormTextarea label="Selection Process" value={formData.selectionProcess} onChange={(v: string) => setFormData({...formData, selectionProcess: v})} placeholder="1. CBT Exam, 2. Physical Test, 3. Document Audit..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <FormInput label="Age Limit" value={formData.ageLimit} onChange={(v: string) => setFormData({...formData, ageLimit: v})} placeholder="18 - 28 Years" />
                       <FormInput label="Experience" value={formData.experience} onChange={(v: string) => setFormData({...formData, experience: v})} placeholder="No experience required" />
                       <FormInput label="Salary Node" value={formData.salary} onChange={(v: string) => setFormData({...formData, salary: v})} placeholder="Pay Level 3 (₹19,900 - ₹63,200)" />
                    </div>
                 </TabsContent>

                 <TabsContent value="dates" className="space-y-10 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FormInput label="Start Date" type="date" value={formData.startDate} onChange={(v: string) => setFormData({...formData, startDate: v})} />
                       <FormInput label="Last Date" type="date" value={formData.lastDate} onChange={(v: string) => setFormData({...formData, lastDate: v})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <FormInput label="Exam Date" type="date" value={formData.examDate} onChange={(v: string) => setFormData({...formData, examDate: v})} />
                       <FormInput label="Admit Card Date" type="date" value={formData.admitCardDate} onChange={(v: string) => setFormData({...formData, admitCardDate: v})} />
                       <FormInput label="Result Date" type="date" value={formData.resultDate} onChange={(v: string) => setFormData({...formData, resultDate: v})} />
                    </div>
                    <FormTextarea label="Application Fee Node" value={formData.applicationFee} onChange={(v: string) => setFormData({...formData, applicationFee: v})} placeholder="GEN: ₹1000, SC/ST: ₹250..." />
                 </TabsContent>

                 <TabsContent value="media" className="space-y-10 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FileUpload 
                          label="Department Logo" 
                          folder="logos" 
                          value={formData.logoUrl} 
                          onChange={(meta) => setFormData({...formData, logoUrl: meta?.url})} 
                          variant="compact"
                       />
                       <FileUpload 
                          label="Vacancy Banner" 
                          folder="vacancies" 
                          value={formData.bannerUrl} 
                          onChange={(meta) => setFormData({...formData, bannerUrl: meta?.url})} 
                          variant="compact"
                       />
                    </div>
                    <FileUpload 
                       label="Official Notification PDF" 
                       folder="vacancies" 
                       accept="application/pdf"
                       value={formData.notificationPdfUrl} 
                       onChange={(meta) => setFormData({...formData, notificationPdfUrl: meta?.url})} 
                    />
                    <FormInput label="Direct Apply Node (URL)" value={formData.applyLink} onChange={(v: string) => setFormData({...formData, applyLink: v})} placeholder="https://..." />
                 </TabsContent>

                 <TabsContent value="seo" className="space-y-10 animate-in fade-in duration-300">
                    <FormInput label="SEO Title" value={formData.seoTitle} onChange={(v: string) => setFormData({...formData, seoTitle: v})} />
                    <FormTextarea label="SEO Meta Description" value={formData.seoDescription} onChange={(v: string) => setFormData({...formData, seoDescription: v})} />
                 </TabsContent>
              </Card>
           </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-3xl rounded-[3rem] bg-[#0F172A] text-white p-8 md:p-12 space-y-10 sticky top-24 overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Zap className="h-64 w-64 text-primary" /></div>
              <div className="relative z-10 space-y-10 text-left">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tight leading-none uppercase">Lifecycle</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Governance</p>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Current Status</Label>
                       <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ContentStatus})} className="w-full h-12 bg-white/5 border-white/10 text-white rounded-xl px-5 font-bold outline-none appearance-none cursor-pointer">
                          <option value="DRAFT" className="bg-[#0F172A]">Draft Hub</option>
                          <option value="PUBLISHED" className="bg-[#0F172A]">System Live</option>
                          <option value="ARCHIVED" className="bg-[#0F172A]">Archived</option>
                       </select>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                       <ConfigSwitch label="Featured Listing" checked={formData.isFeatured || false} onChange={v => setFormData({...formData, isFeatured: v})} />
                       <ConfigSwitch label="Breaking News" checked={formData.isBreaking || false} onChange={v => setFormData({...formData, isBreaking: v})} />
                       <ConfigSwitch label="Homepage Active" checked={formData.showOnHomepage || false} onChange={v => setFormData({...formData, showOnHomepage: v})} />
                    </div>
                 </div>

                 <div className="pt-10 border-t border-white/5">
                    <Button onClick={() => handleSave()} disabled={isSaving} className="w-full h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl border-none">
                       {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-3" />} Commit Registry
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}

function FormTab({ value, label, icon: Icon }: any) {
   return (
      <TabsTrigger value={value} className="rounded-xl px-6 font-black uppercase text-[9px] tracking-tight h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all whitespace-nowrap gap-2">
         <Icon className="h-3.5 w-3.5" /> {label}
      </TabsTrigger>
   )
}

function FormInput({ label, type = "text", value, onChange, placeholder }: any) {
   return (
      <div className="space-y-2 text-left">
         <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">{label}</Label>
         <Input type={type} value={value || ""} onChange={e => onChange(e.target.value)} className="h-12 md:h-14 rounded-xl md:rounded-2xl border-none bg-slate-50 font-bold px-6 shadow-inner text-[#0F172A]" placeholder={placeholder} />
      </div>
   )
}

function FormTextarea({ label, value, onChange, placeholder }: any) {
   return (
      <div className="space-y-2 text-left">
         <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">{label}</Label>
         <Textarea value={value || ""} onChange={e => onChange(e.target.value)} className="min-h-[120px] rounded-xl md:rounded-3xl border-none bg-slate-50 font-medium px-6 py-4 shadow-inner text-[#0F172A] leading-relaxed" placeholder={placeholder} />
      </div>
   )
}

function FormSelect({ label, value, onChange, options }: any) {
   return (
      <div className="space-y-2 text-left">
         <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">{label}</Label>
         <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl md:rounded-2xl px-6 font-bold outline-none shadow-inner text-[#0F172A] appearance-none cursor-pointer">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
         </select>
      </div>
   )
}

function ConfigSwitch({ label, checked, onChange }: any) {
   return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
         <Switch checked={checked} onCheckedChange={onChange} />
      </div>
   )
}
