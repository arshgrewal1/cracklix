"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useFirestore } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseBulkQuestions } from "@/lib/parser"
import { Zap, Database, ChevronLeft, Rocket, CheckCircle2, Settings2, ClipboardCheck, Info, Newspaper } from "lucide-react"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

/**
 * @fileOverview Institutional CA Ingestion Hub v1.0.
 */

export default function CABulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [rawText, setRawText] = useState("")
  const [metadata, setMetadata] = useState({
    boardId: "current-affairs",
    subjectId: "gk-ca",
    difficulty: "Medium" as any,
    status: "PUBLISHED" as any,
    languagePreference: "bilingual" as any,
    secondaryLanguage: "punjabi" as any
  })
  
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [showHubCreator, setShowHubCreator] = useState(false)
  const [lastImportedIds, setLastImportedIds] = useState<string[]>([])

  const handleParse = () => {
    if (!rawText.trim()) return
    
    const results = parseBulkQuestions(rawText, metadata)
    
    if (results.questions.length === 0) {
      toast({ variant: "destructive", title: "Parsing Failed", description: "Check format: Q1, Line 2, (A) EN/PA" })
      setParsedQuestions([])
    } else {
      setParsedQuestions(results.questions)
      toast({ title: "Extraction Success", description: `${results.questions.length} CA nodes structured.` })
    }
  }

  const handleCommitToBank = async () => {
    if (!db || parsedQuestions.length === 0) return
    setIsImporting(true)
    const batch = writeBatch(db)
    const ids: string[] = []

    parsedQuestions.forEach(q => {
      const newRef = doc(collection(db, "ca_bank"))
      const payload: any = {
        ...q,
        id: newRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      batch.set(newRef, payload)
      ids.push(newRef.id)
    })

    try {
      await batch.commit()
      setLastImportedIds(ids)
      toast({ title: "CA Bank Updated", description: `${parsedQuestions.length} nodes committed.` })
      setShowHubCreator(true)
    } catch (e) {
      toast({ variant: "destructive", title: "Sync failed" })
    } finally {
      setIsImporting(false)
    }
  }

  const handleDeployHub = async () => {
    if (!db || lastImportedIds.length === 0) return
    const hubId = `ca-hub-${Date.now()}`
    const hubRef = doc(db, "current_affairs_hub", hubId)
    
    const now = new Date()
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    const payload: any = {
      id: hubId,
      title: `Daily CA - ${now.toLocaleDateString('en-GB')}`,
      type: "DAILY",
      month: months[now.getMonth()],
      year: now.getFullYear().toString(),
      status: "PUBLISHED",
      questions: parsedQuestions, // Using the local parsed array for immediate Hub data
      language: metadata.secondaryLanguage === 'punjabi' ? "English & Punjabi" : "English & Hindi",
      duration: 15,
      positiveMarks: 1,
      negativeMarks: 0.25,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(hubRef, payload)
      toast({ title: "CA Hub Live", description: "Questions are now visible in the student feed." })
      router.push("/admin/current-affairs")
    } catch (e) {
      toast({ variant: "destructive", title: "Hub Deployment Failed" })
    }
  }

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-[1600px] mx-auto text-[#0F172A] text-left animate-in fade-in duration-500 pt-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4 md:gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl border border-slate-200 bg-white h-10 w-10 md:h-12 md:w-12 shadow-sm">
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <div className="text-left">
            <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">CA Ingestion</h1>
            <p className="text-slate-500 font-medium text-[11px] md:text-lg mt-1">Bulk process Current Affairs for all sections.</p>
          </div>
        </div>
        <Button onClick={handleCommitToBank} disabled={isImporting || parsedQuestions.length === 0} className="bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-full h-11 md:h-14 px-8 md:px-10 gap-3 shadow-xl border-none">
          {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} Commit to Bank
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 px-1">
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <Card className="border-none bg-white shadow-xl rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-slate-50">
            <div className="h-1.5 w-full bg-primary" />
            <CardHeader className="p-6 md:p-10 pb-4">
              <CardTitle className="font-black text-xl md:text-2xl uppercase flex items-center gap-4">
                <Settings2 className="h-6 w-6 text-primary" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 pt-4 space-y-6 md:space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Language mapping</Label>
                <Select value={metadata.secondaryLanguage} onValueChange={val => setMetadata({...metadata, secondaryLanguage: val})}>
                  <SelectTrigger className="rounded-xl bg-slate-50 border-none h-12 md:h-14 font-black uppercase text-[10px] tracking-widest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="punjabi">English + Punjabi</SelectItem>
                    <SelectItem value="hindi">English + Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Paste CA blocks</Label>
                <Textarea 
                  placeholder={`Q1. Question text...\n(A) Option EN / PA\n(B) ...\nAnswer: B`}
                  className="min-h-[300px] md:min-h-[400px] rounded-2xl md:rounded-[2.5rem] bg-slate-50 border-none p-6 md:p-10 text-sm font-bold leading-relaxed shadow-inner"
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                />
              </div>
              
              <Button onClick={handleParse} className="w-full h-14 md:h-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.3em] gap-4 rounded-xl md:rounded-[2.5rem] shadow-2xl">
                <Zap className="h-6 w-6 text-primary fill-current" /> Initialize Extraction
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
           {parsedQuestions.length > 0 ? (
            <Card className="border-none bg-white shadow-2xl rounded-[3rem] h-full flex flex-col overflow-hidden border border-slate-50">
               <CardHeader className="p-8 md:p-12 bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="font-black text-xl md:text-3xl uppercase flex items-center gap-4 text-[#0F172A]">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" /> Staged Nodes ({parsedQuestions.length})
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6 md:p-12 flex-1 overflow-y-auto custom-scrollbar space-y-12">
                  {parsedQuestions.map((q, idx) => (
                    <div key={idx} className="space-y-8 pb-12 border-b border-slate-100 last:border-0 last:pb-0">
                       <Badge className="bg-[#0F172A] text-white border-none text-[10px] font-black uppercase px-4 py-1 rounded-lg">Question {idx + 1}</Badge>
                       <QuestionRenderer language={metadata.secondaryLanguage === 'punjabi' ? 'ENGLISH_PUNJABI' : 'ENGLISH_HINDI'} question={q} showSolution={true} />
                    </div>
                  ))}
               </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 py-40">
              <Newspaper className="h-32 w-32 mb-8" />
              <p className="font-black uppercase tracking-[0.4em] text-xl text-center">Awaiting CA Hub</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showHubCreator} onOpenChange={setShowHubCreator}>
        <DialogContent className="sm:max-w-2xl rounded-[3rem] bg-[#0F172A] text-white border-white/10 p-0 overflow-hidden shadow-4xl">
          <div className="p-10 md:p-16 space-y-10">
            <div className="text-center space-y-4">
               <div className="h-20 w-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-2xl"><Rocket className="h-10 w-10" /></div>
               <DialogTitle className="text-3xl md:text-4xl font-black uppercase tracking-tight">Deploy CA Hub</DialogTitle>
               <DialogDescription className="text-slate-400 text-sm md:text-lg font-medium">Commit {parsedQuestions.length} nodes and publish to feed?</DialogDescription>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-4">
               <Button variant="ghost" onClick={() => router.push("/admin/current-affairs/bank")} className="h-14 px-8 rounded-2xl text-slate-400 hover:text-white font-bold uppercase text-[10px]">Open Bank</Button>
               <Button onClick={handleDeployHub} className="flex-1 h-14 md:h-18 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-3xl gap-3 border-none">
                  <ClipboardCheck className="h-5 w-5" /> Publish Hub
               </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Loader2({ className }: any) {
   return <Zap className={cn("animate-pulse", className)} />
}